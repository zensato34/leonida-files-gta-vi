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
        self.assertIn("version:2", script)
        self.assertIn("[1,2].includes(data.version)", script)
        self.assertIn("privateDiscoveries:state.privateDiscoveries", script)

if __name__ == "__main__":
    unittest.main(verbosity=2)
