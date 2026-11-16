import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
GUIDE_PATH = ROOT / "data" / "guide.json"

class GuideCatalogTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.guide = json.loads(GUIDE_PATH.read_text(encoding="utf-8"))

    def test_guide_has_six_expected_modules(self):
        expected = {"story-missions", "activities", "collectibles", "secrets", "trophies", "completion"}
        actual = {item["id"] for item in self.guide["categories"]}
        self.assertEqual(expected, actual)

    def test_each_module_has_an_explicit_status_and_entries_array(self):
        for item in self.guide["categories"]:
            self.assertEqual("pending_gameplay_verification", item["status"])
            self.assertIsInstance(item["entries"], list)
            self.assertIn("description", item)

    def test_prelaunch_catalog_does_not_invent_gameplay_entries(self):
        self.assertTrue(all(item["entries"] == [] for item in self.guide["categories"]))
        self.assertEqual("2026-11-19", self.guide["release_date"])
        self.assertTrue(self.guide["release_source_url"].startswith("https://www.rockstargames.com/"))

    def test_spoilers_are_hidden_by_default_and_policy_is_explicit(self):
        self.assertIs(self.guide["spoiler_default_hidden"], True)
        self.assertIn("No publicar", self.guide["editorial_policy"])

if __name__ == "__main__":
    unittest.main(verbosity=2)
