from html.parser import HTMLParser
import json
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")

class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.id_values = []
        self.links = []
        self.script_sources = []
        self.stylesheet_links = []
        self.manifest_links = []
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if data.get("id"):
            self.ids.add(data["id"])
            self.id_values.append(data["id"])
        if tag == "a" and (data.get("href") or "").startswith("#"):
            self.links.append(data["href"][1:])
        if tag == "link" and "manifest" in (data.get("rel") or "").split():
            self.manifest_links.append(data.get("href", ""))
        if tag == "script" and data.get("src"):
            self.script_sources.append(data["src"])
        if tag == "link" and "stylesheet" in (data.get("rel") or ""):
            self.stylesheet_links.append(data.get("href", ""))

class SiteContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parser = SiteParser()
        cls.parser.feed(HTML)

    def test_new_dossier_modules_and_controls_exist(self):
        required = {"pwaInstallButton","atlas", "evidencias", "cronologia", "hangar", "guia", "guideTitle", "guideSearch", "guideSpoilers", "guideStatus", "guideCatalog", "guideEmpty", "progreso", "progressTitle", "progressSearch", "progressRegionFilter", "progressStatusFilter", "progressCategories", "progressStatus", "trackedPercent", "trackedBar", "trackedDone", "trackedTotal", "personalGoalForm", "personalGoalTitle", "personalGoalCategory", "personalGoalList", "exportProgress", "importProgress", "importProgressFile", "regionSearch", "regionCards", "regionCount", "vehicleSearch", "vehicleCatalog", "vehicleCount", "commandPalette", "commandInput", "openCommand", "favoritesDrawer", "sinceLastVisit", "bootScreen", "explorerMode", "completistMode", "privateDiscoveryForm", "privateDiscoveryCategory", "privateDiscoveryRegion", "privateDiscoveryTitle", "privateDiscoveryNote", "privateDiscoveryEvidence", "privateDiscoverySource", "privateDiscoverySpoiler", "privateDiscoveryList", "privateDiscoveryCount", "atlasPersonal", "atlasPointForm", "atlasPointRegion", "atlasPointType", "atlasPointStatus", "atlasPointTitle", "atlasPointDetails", "atlasPointSource", "atlasPointSpoiler", "atlasPointCount", "atlasPointSearch", "atlasPointFilterRegion", "atlasPointFilterStatus", "atlasPointList", "miGaraje", "garageSearch", "garageFilter", "garageCatalog", "garageTotal", "garageWanted", "garageOwned", "gameSessionJournal", "gameSessionForm", "gameSessionDate", "gameSessionMinutes", "gameSessionCharacter", "gameSessionRegion", "gameSessionTitle", "gameSessionNotes", "gameSessionSpoiler", "gameSessionCount", "gameSessionDuration", "gameSessionLatest", "gameSessionSearch", "gameSessionCharacterFilter", "gameSessionRegionFilter", "gameSessionList"}
        self.assertTrue(required.issubset(self.parser.ids), f"Missing IDs: {sorted(required - self.parser.ids)}")

    def test_internal_navigation_links_resolve(self):
        missing = sorted({target for target in self.parser.links if target not in self.parser.ids})
        self.assertEqual([], missing, f"Broken internal anchors: {missing}")

    def test_runtime_assets_are_local_and_present(self):
        assets = self.parser.script_sources + self.parser.stylesheet_links
        self.assertTrue(self.parser.script_sources, "The local site engine must be linked")
        self.assertTrue(self.parser.stylesheet_links, "The local stylesheet must be linked")
        for asset in assets:
            self.assertFalse(asset.startswith(("http://", "https://", "//")), f"Remote runtime asset: {asset}")
            self.assertFalse(".." in asset.split("/"), f"Path traversal in asset: {asset}")
            self.assertTrue((ROOT / asset).is_file(), f"Missing local runtime asset: {asset}")

    def test_reduced_motion_and_keyboard_accessibility_are_present(self):
        css = (ROOT / "assets/css/dossier34.css").read_text(encoding="utf-8")
        script = (ROOT / "assets/js/dossier34.js").read_text(encoding="utf-8")
        self.assertRegex(css, r"@media\s*\(prefers-reduced-motion:\s*reduce\)")
        self.assertIn('aria-label="Abrir búsqueda global"', HTML)
        self.assertIn('aria-modal="true"', HTML)
        self.assertIn("Escape", script)
        self.assertIn("trapTab", script)
        self.assertIn("if(e.key==='Tab')", script)

    def test_auto_feed_remains_pending_and_text_only(self):
        script = (ROOT / "assets/js/dossier34.js").read_text(encoding="utf-8")
        self.assertIn("Pendiente de verificación", script)
        self.assertIn("textContent=String(item.title", script)
        self.assertIn("textContent=String(item.description", script)

    def test_independent_credit_and_official_art_policy_remain_visible(self):
        self.assertIn("Proyecto fan-made, independiente y no oficial", HTML)
        self.assertIn("zensato34", HTML)
        self.assertIn("no se han creado imágenes con IA", HTML)
        self.assertRegex(HTML, r"https://www\.rockstargames\.com/VI/_next/static/media/")

    def test_no_duplicate_dom_ids(self):
        duplicates = sorted({x for x in self.parser.id_values if self.parser.id_values.count(x) > 1})
        self.assertEqual([], duplicates, f"Duplicate IDs: {duplicates}")

    def test_mobile_navigation_has_single_toggle_handler(self):
        script = (ROOT / "assets/js/dossier34.js").read_text(encoding="utf-8")
        self.assertNotIn("menuBtn=document.getElementById('menuBtn')", script)
        self.assertIn("menu?.addEventListener('click'", script)
        self.assertIn('aria-expanded="false"', HTML)
        self.assertIn('class="cmd-icon"', HTML)
        css = (ROOT / "assets/css/dossier34.css").read_text(encoding="utf-8")
        self.assertIn('.cmd-icon{display:inline!important', css)

    def test_debunked_evidence_filter_has_matching_news_option(self):
        script = (ROOT / "assets/js/dossier34.js").read_text(encoding="utf-8")
        self.assertIn('<option value="desmentido">Desmentido</option>', HTML)
        self.assertIn("f==='desmentido'&&k==='desmentido'", script)

    def test_global_search_indexes_news_and_auto_feed_timestamps(self):
        script = (ROOT / "assets/js/dossier34.js").read_text(encoding="utf-8")
        self.assertIn("#newsList .news,#personajes .character-file", script)
        self.assertIn("el.dataset.publishedAt=String(item.published_at||item.date||'')", script)
        self.assertIn("newsfeed:updated", script)

    def test_browser_storage_is_guarded(self):
        script = (ROOT / "assets/js/dossier34.js").read_text(encoding="utf-8")
        self.assertRegex(script, r"function\s+safeStorage|const\s+safeStorage")
        self.assertIn("try{", script)
        self.assertIn("catch", script)


    def test_progress_runtime_assets_are_linked(self):
        self.assertIn('assets/css/progress34.css', HTML)
        self.assertIn('assets/js/progress34.js', HTML)

    def test_progress_percent_does_not_claim_complete_game_data(self):
        data = json.loads((ROOT / "data/progress.json").read_text(encoding="utf-8"))
        self.assertFalse(data["catalog_complete"])
        self.assertIsNone(data["total_requirements"])
        self.assertIn("No representa el porcentaje real total", (ROOT / "assets/js/progress34.js").read_text(encoding="utf-8"))

    def test_auto_feed_renders_all_entries_with_editorial_kind_and_status(self):
        script = (ROOT / "assets/js/dossier34.js").read_text(encoding="utf-8")
        self.assertNotIn("data.items.slice(0,30)", script)
        self.assertIn("item.kind", script)
        self.assertIn("item.status", script)
        self.assertIn("Pendiente de verificación", script)

    def test_regional_countdown_targets_spain_psn_and_handles_unlock(self):
        script = (ROOT / "assets/js/dossier34.js").read_text(encoding="utf-8")
        self.assertIn("2026-11-18T23:00:00Z", script)
        self.assertIn("2026-11-18T10:00:00Z", script)
        self.assertIn("PS Store España", HTML)
        self.assertIn("19:00 RD", HTML)


    def test_release_timer_does_not_claim_live_store_availability(self):
        script = (ROOT / "assets/js/dossier34.js").read_text(encoding="utf-8")
        self.assertIn("spain-window-reached", script)
        self.assertNotIn("Disponible en PS Store España", script)
        self.assertIn("parsed.username", script)

    def test_homepage_has_quick_navigation_and_post_launch_guide_copy(self):
        self.assertIn('class="quick-nav"', HTML)
        for target in ("#noticias", "#atlas", "#personajes", "#musica", "#guia", "#progreso"):
            self.assertIn(f'href="{target}"', HTML)
        self.assertIn("PS Store España", HTML)
        self.assertNotIn("Rockstar mantiene el lanzamiento oficial", HTML)

    def test_music_catalog_lists_only_official_singles_and_separates_score(self):
        songs = json.loads((ROOT / "data/songs.json").read_text(encoding="utf-8"))["items"]
        self.assertEqual(12, len(songs))
        self.assertTrue(all(item["status"] == "official_release" for item in songs))
        self.assertEqual(10, sum(item["collection"] == "the_album" for item in songs))
        self.assertEqual(2, sum(item["collection"] == "original_score" for item in songs))
        self.assertIn("The Album", HTML)
        self.assertIn("Original Score by Justice", HTML)
        self.assertNotIn("Starting From Zero", HTML)
        self.assertNotIn("Ahh Yea", HTML)
        self.assertNotIn("Las 34 canciones reportadas", HTML)

    def test_platform_facts_have_official_language_storage_and_hardware_context(self):
        self.assertIn("212 GB libres", HTML)
        self.assertIn("Voces en inglés", HTML)
        self.assertIn("español (España)", HTML)
        self.assertIn("30 FPS objetivo", HTML)
        self.assertIn("PSSR", HTML)
        self.assertIn("Tempest 3D", HTML)
        self.assertIn("antes del <strong>19/11/2026 a las 23:59:59", HTML)

    def test_radio_podcasts_are_not_misrepresented_as_a_seventh_station(self):
        self.assertIn("seis estaciones", HTML)
        self.assertIn("pódcasts bajo demanda", HTML)
        self.assertIn("no una séptima emisora", HTML)


    def test_guide_displays_attributed_external_launch_references_separately(self):
        guide = json.loads((ROOT / "data/guide.json").read_text(encoding="utf-8"))
        sources = json.loads((ROOT / "data/sources.json").read_text(encoding="utf-8"))["items"]
        source_by_id = {item["id"]: item for item in sources}
        self.assertEqual(15, len(guide["external_references"]))
        self.assertEqual(7, len(guide["quick_tips"]))
        for item in guide["external_references"]:
            source = source_by_id[item["source_id"]]
            self.assertEqual(source["url"], item["url"])
            self.assertEqual("external_report", item["status"])
            self.assertIn("no verificada por LEONIDA FILES", item["status_label"])
            self.assertTrue(item["url"].startswith("https://"))
        for tip in guide["quick_tips"]:
            self.assertTrue(tip["source_ids"])
            for source_id in tip["source_ids"]:
                self.assertIn(source_id, source_by_id)
        self.assertTrue(all(not category["entries"] for category in guide["categories"]))
        self.assertIn('id="guideQuickTips"', HTML)
        self.assertIn('id="guideExternalSources"', HTML)

    def test_external_guide_spoiler_alerts_are_hidden_by_default(self):
        guide = json.loads((ROOT / "data/guide.json").read_text(encoding="utf-8"))
        warnings = [tip for tip in guide["quick_tips"] if tip["spoiler"] is True]
        self.assertEqual(1, len(warnings))
        self.assertIn("no está seguro", warnings[0]["summary"])
        script = (ROOT / "assets/js/guide34.js").read_text(encoding="utf-8")
        self.assertIn("data-spoiler", script)
        self.assertIn("spoilerBlocked", script)

if __name__ == "__main__":
    unittest.main(verbosity=2)
