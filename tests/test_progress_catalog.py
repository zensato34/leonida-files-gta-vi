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

    def test_progress_tasks_only_come_from_verified_public_guide_entries(self):
        for category in GUIDE["categories"]:
            for entry in category["entries"]:
                self.assertEqual("verified", entry["status"])
                self.assertNotIn("notes_private", json.dumps(entry))

if __name__ == "__main__":
    unittest.main(verbosity=2)
