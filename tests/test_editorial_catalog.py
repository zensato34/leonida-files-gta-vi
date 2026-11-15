import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
ALLOWED_NEWS_STATUS = {"confirmado", "reporte", "rumor", "desmentido"}

def load_catalog(name):
    path = DATA / name
    if not path.exists():
        raise AssertionError(f"Missing catalog: {path}")
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("schema_version") != 1 or not isinstance(payload.get("items"), list):
        raise AssertionError(f"Invalid catalog envelope: {name}")
    return payload["items"]

class EditorialCatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sources = load_catalog("sources.json")
        cls.source_ids = {item["id"] for item in cls.sources}
        cls.news = load_catalog("news.json")
        cls.characters = load_catalog("characters.json")
        cls.regions = load_catalog("regions.json")
        cls.radios = load_catalog("radios.json")
        cls.songs = load_catalog("songs.json")
        cls.vehicles = load_catalog("vehicles.json")

    def test_catalog_ids_are_unique(self):
        for label, records in (
            ("sources", self.sources), ("news", self.news),
            ("characters", self.characters), ("regions", self.regions),
            ("radios", self.radios), ("songs", self.songs),
        ):
            values = [item["id"] for item in records]
            self.assertEqual(len(values), len(set(values)), f"Duplicate IDs in {label}")

    def test_all_references_resolve(self):
        for dataset in (self.news, self.characters, self.regions, self.radios, self.songs):
            for record in dataset:
                for source_id in record.get("source_ids", []):
                    self.assertIn(source_id, self.source_ids, f"{record['id']} -> {source_id}")
        character_ids = {item["id"] for item in self.characters}
        for person in self.characters:
            for relation in person.get("relations", []):
                self.assertIn(relation["target_id"], character_ids, f"{person['id']} -> {relation['target_id']}")

    def test_confirmed_news_uses_primary_sources_only(self):
        source_by_id = {item["id"]: item for item in self.sources}
        for item in self.news:
            self.assertIn(item["classification"], ALLOWED_NEWS_STATUS)
            self.assertTrue(item.get("source_ids"), f"News item lacks source: {item['id']}")
            if item["classification"] == "confirmado":
                self.assertTrue(
                    any(source_by_id[sid]["type"] in {"official_primary", "official_support"}
                        for sid in item["source_ids"]),
                    f"Confirmed item lacks primary source: {item['id']}"
                )

    def test_character_and_radio_images_are_rockstar_hosted(self):
        for person in self.characters:
            self.assertTrue(person["image_url"].startswith("https://www.rockstargames.com/VI/_next/static/media/"))
        for radio in self.radios:
            self.assertTrue(radio["logo_url"].startswith("https://www.rockstargames.com/VI/_next/static/media/"))
            self.assertTrue(radio["background_url"].startswith("https://www.rockstargames.com/VI/_next/static/media/"))

    def test_existing_catalog_coverage_is_preserved(self):
        self.assertEqual(16, len(self.news))
        self.assertEqual(9, len(self.characters))
        self.assertEqual(6, len(self.regions))
        self.assertEqual(6, len(self.radios))
        self.assertEqual(34, len(self.songs))
        self.assertEqual(10, sum(x["status"] == "official_release" for x in self.songs))
        self.assertEqual(24, sum(x["status"] == "reported_leak" for x in self.songs))
        self.assertEqual(7, len(self.vehicles))
        self.assertEqual(2, sum(x["category"] == "car" for x in self.vehicles))
        self.assertEqual(1, sum(x["category"] == "motorcycle" for x in self.vehicles))
        self.assertEqual(2, sum(x["category"] == "watercraft" for x in self.vehicles))
        self.assertEqual(1, sum(x["category"] == "offroad_buggy" for x in self.vehicles))
        self.assertEqual(1, sum(x["category"] == "customized_vehicle" for x in self.vehicles))

    def test_atlas_regions_have_official_images_and_screenshot_groups(self):
        for region in self.regions:
            self.assertTrue(region["image_url"].startswith("https://www.rockstargames.com/VI/_next/static/media/"))
            self.assertGreater(region["gallery_count"], 0)
            self.assertEqual("no_official_coordinates_in_this_catalog", region["map_status"])
            self.assertIn("src-034", region["source_ids"])
            for key in ("lat", "latitude", "lon", "long", "longitude", "coordinates"):
                self.assertNotIn(key, region)

    def test_vehicle_catalog_contains_only_officially_named_records(self):
        ids = {item["id"] for item in self.vehicles}
        self.assertEqual({
            "veh-grotti-cheetah-95", "veh-dinka-enduro", "veh-crest-kayak",
            "veh-ganado-retro-build", "veh-shitzu-squalo",
            "veh-vapid-dominator-buggy-67", "veh-vapid-stanier-55",
        }, ids)
        for vehicle in self.vehicles:
            self.assertTrue(vehicle["image_url"].startswith("https://www.rockstargames.com/VI/_next/static/media/"))
            self.assertTrue(vehicle["source_ids"])
            self.assertTrue(vehicle["edition_context"])
            self.assertTrue(vehicle["official_gallery_label"])

    def test_catalog_validator_reports_no_integrity_errors(self):
        from scripts.validate_catalog import validate_catalogs
        self.assertEqual([], validate_catalogs(ROOT))

    def test_structured_assets_are_linked_locally(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('href="assets/css/dossier34.css"', html)
        self.assertIn('src="assets/js/dossier34.js"', html)
        self.assertIn('id="sourcesRegister"', html)
        self.assertIn('id="catalogStatus"', html)
        for element_id in ("regionSearch", "regionCards", "regionCount", "vehicleSearch", "vehicleCatalog", "vehicleCount"):
            self.assertIn(f'id="{element_id}"', html)
        self.assertTrue((ROOT / "assets/css/dossier34.css").exists())
        self.assertTrue((ROOT / "assets/js/dossier34.js").exists())

    def test_javascript_loader_uses_local_json_and_safe_dom_apis(self):
        script = (ROOT / "assets/js/dossier34.js").read_text(encoding="utf-8")
        for path in ("news.json", "characters.json", "regions.json", "radios.json", "songs.json", "sources.json", "vehicles.json"):
            self.assertIn(path, script)
        self.assertIn("textContent", script)
        self.assertIn("loadStructuredCatalogs", script)
        self.assertIn("filterRegionCards", script)
        self.assertIn("filterVehicleCards", script)
        self.assertIn("window.setDossierRegionFilter", script)
        self.assertIn("window.setDossierVehicleFilter", script)

if __name__ == "__main__":
    unittest.main(verbosity=2)
