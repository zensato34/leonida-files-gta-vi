import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PROGRESS = json.loads((ROOT / "data" / "progress.json").read_text(encoding="utf-8"))
GUIDE = json.loads((ROOT / "data" / "guide.json").read_text(encoding="utf-8"))
EXPECTED = {"story-missions", "activities", "collectibles", "secrets", "trophies", "completion"}

class ProgressCatalogTests(unittest.TestCase):
    def test_progress_system_has_six_known_modules(self):
        self.assertEqual(EXPECTED, {item["id"] for item in PROGRESS["categories"]})
        self.assertEqual(EXPECTED, {item["id"] for item in GUIDE["categories"]})

    def test_no_full_game_percentage_is_claimed_before_catalog_is_complete(self):
        self.assertIs(PROGRESS["catalog_complete"], False)
        self.assertIsNone(PROGRESS["total_requirements"])
        self.assertEqual("verified_published_checklist_only", PROGRESS["completion_percent_scope"])

    def test_browser_storage_is_local_only(self):
        self.assertIs(PROGRESS["local_storage"]["browser_only"], True)
        self.assertIs(PROGRESS["local_storage"]["server_sync"], False)
        self.assertIn("private_discoveries", PROGRESS["local_storage"]["includes"])

    def test_progress_tasks_only_come_from_verified_public_guide_entries(self):
        for category in GUIDE["categories"]:
            for entry in category["entries"]:
                self.assertEqual("verified", entry["status"])
                self.assertNotIn("notes_private", json.dumps(entry))


    def test_guide_trackable_tasks_use_only_known_regions(self):
        allowed = {"vice-city", "leonida-keys", "grassrivers", "port-gellhorn", "ambrosia", "mount-kalaga-national-park"}
        for category in GUIDE["categories"]:
            for entry in category["entries"]:
                if entry.get("trackable") is True and entry.get("region_id") is not None:
                    self.assertIn(entry["region_id"], allowed)

    def test_private_discovery_and_mode_controls_are_local_only(self):
        script = (ROOT / "assets" / "js" / "progress34.js").read_text(encoding="utf-8")
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("privateDiscoveries", script)
        self.assertIn("pending_review", script)
        self.assertIn("explorerMode", script)
        self.assertIn("completistMode", script)
        self.assertIn('id="privateDiscoveryForm"', html)
        self.assertNotIn("fetch(", script[script.index("function renderDiscoveries"):script.index("function setMode")])

    def test_old_backups_remain_importable_and_new_backups_include_private_notes(self):
        script = (ROOT / "assets" / "js" / "progress34.js").read_text(encoding="utf-8")
        self.assertIn("version:5", script)
        self.assertIn("![1,2,3,4,5].includes(data.version)", script)
        self.assertIn("privateDiscoveries:state.privateDiscoveries", script)


    def test_progress_schema_documents_private_atlas_points(self):
        self.assertIn("atlas_points", PROGRESS["local_storage"]["includes"])
        script = (ROOT / "assets" / "js" / "progress34.js").read_text(encoding="utf-8")
        self.assertIn("atlasPoints", script)
        self.assertIn("version:4", script)
        self.assertIn("![1,2,3,4].includes(data.version)", script)

    def test_atlas_points_are_region_bound_and_private(self):
        script = (ROOT / "assets" / "js" / "progress34.js").read_text(encoding="utf-8")
        self.assertIn("normalizeAtlasPoint", script)
        self.assertIn("region_id:item.region_id", script)
        self.assertIn("atlasPointForm", script)
        self.assertIn("no se publican", (ROOT / "index.html").read_text(encoding="utf-8").lower())


    def test_personal_garage_uses_only_the_current_official_vehicle_catalog(self):
        script = (ROOT / "assets" / "js" / "progress34.js").read_text(encoding="utf-8")
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        vehicles = json.loads((ROOT / "data" / "vehicles.json").read_text(encoding="utf-8"))
        self.assertIn('fetch("data/vehicles.json"', script) if 'fetch("data/vehicles.json"' in script else self.assertIn("fetch('data/vehicles.json'", script)
        self.assertIn('id="garageCatalog"', html)
        self.assertIn("vehicleRecords=[]", script)
        self.assertIn("vehicleRecords=Array.isArray(vehicleData.items)", script)
        self.assertEqual("vehicles", vehicles["dataset"])

    def test_garage_statuses_are_personal_and_included_in_backup_v4(self):
        script = (ROOT / "assets" / "js" / "progress34.js").read_text(encoding="utf-8")
        self.assertIn("garageVehicles", script)
        self.assertIn("version:4", script)
        self.assertIn("![1,2,3,4].includes(data.version)", script)
        self.assertIn("garage_vehicles", PROGRESS["local_storage"]["includes"])


    def test_session_journal_is_private_and_backup_v5_remains_backward_compatible(self):
        script = (ROOT / "assets" / "js" / "progress34.js").read_text(encoding="utf-8")
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("gameSessions", script)
        self.assertIn("version:5", script)
        self.assertIn("![1,2,3,4,5].includes(data.version)", script)
        self.assertIn("game_sessions", PROGRESS["local_storage"]["includes"])
        self.assertIn('id="gameSessionForm"', html)
        self.assertIn("played_on", script)
        self.assertIn("duration_min", script)
        self.assertIn("hiddenSpoiler", script)

    def test_session_journal_has_manual_duration_and_no_console_integration(self):
        script = (ROOT / "assets" / "js" / "progress34.js").read_text(encoding="utf-8")
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('type="number" min="1" max="1440"', html)
        self.assertIn("localStorage", script)
        self.assertNotIn("PlayStation API", script)

if __name__ == "__main__":
    unittest.main(verbosity=2)
