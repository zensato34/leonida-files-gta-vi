from html.parser import HTMLParser
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")


class ExperienceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.anchor_targets = set()
        self.script_sources = set()
        self.stylesheets = set()
        self.labels = set()

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if data.get("id"):
            self.ids.add(data["id"])
        if tag == "a" and (data.get("href") or "").startswith("#"):
            self.anchor_targets.add(data["href"][1:])
        if tag == "script" and data.get("src"):
            self.script_sources.add(data["src"])
        if tag == "link" and "stylesheet" in (data.get("rel") or "").split():
            self.stylesheets.add(data.get("href", ""))
        if tag == "label" and data.get("for"):
            self.labels.add(data["for"])


class ExperienceCenterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parser = ExperienceParser()
        cls.parser.feed(HTML)
        cls.script = (ROOT / "assets/js/experience34.js").read_text(encoding="utf-8")
        cls.styles = (ROOT / "assets/css/experience34.css").read_text(encoding="utf-8")
        cls.worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")

    def test_new_modules_are_reachable_and_assets_are_loaded(self):
        sections = {"soporte", "actualizaciones", "laboratorio", "perfil", "comparador"}
        self.assertTrue(sections.issubset(self.parser.ids))
        self.assertTrue(sections.issubset(self.parser.anchor_targets))
        self.assertIn("assets/js/experience34.js", self.parser.script_sources)
        self.assertIn("assets/css/experience34.css", self.parser.stylesheets)

    def test_player_profile_has_labeled_controls_and_uses_browser_storage(self):
        controls = {
            "playerPlatform", "playerRegion", "playerEdition", "playerLanguage",
            "playerTheme", "playerSpoilers", "playerReduceMotion",
        }
        self.assertTrue(controls.issubset(self.parser.ids))
        self.assertTrue(controls.issubset(self.parser.labels))
        self.assertIn("playerProfileForm", self.parser.ids)
        self.assertIn("savePlayerProfile", self.parser.ids)
        self.assertIn("resetPlayerProfile", self.parser.ids)
        self.assertIn("lf34:player-profile:v1", self.script)
        self.assertIn("localStorage", self.script)
        self.assertNotIn("innerHTML", self.script)

    def test_updates_registry_is_empty_until_official_patch_notes_exist(self):
        catalog = json.loads((ROOT / "data/updates.json").read_text(encoding="utf-8"))
        self.assertEqual(1, catalog["schema_version"])
        self.assertEqual("updates", catalog["dataset"])
        self.assertEqual([], catalog["items"])
        self.assertIn("official", catalog["publication_policy"])
        self.assertIn("updatesList", self.parser.ids)
        self.assertIn("updatesStatus", self.parser.ids)
        self.assertIn("Aún no hay notas de parche oficiales", HTML)

    def test_technical_lab_labels_objectives_and_unmeasured_performance(self):
        self.assertIn("PS5 Pro", HTML)
        self.assertIn("PSSR", HTML)
        self.assertIn("30 FPS", HTML)
        self.assertIn("212 GB", HTML)
        self.assertIn("sin benchmarks", HTML.lower())
        self.assertIn("rockstargames.com/newswire/article/89834o94713o21", HTML)
        self.assertIn("playstation.com/es-es/support/games/gta-vi-support", HTML)

    def test_support_center_links_to_official_support_and_service_status(self):
        self.assertIn("supportTopics", self.parser.ids)
        self.assertIn("supportSearch", self.parser.ids)
        self.assertIn("status.playstation.com", HTML)
        self.assertIn("support.xbox.com/en-US/xbox-live-status", HTML)
        self.assertIn("support.rockstargames.com", HTML)

    def test_edition_comparator_has_interactive_choices_and_price_date_context(self):
        self.assertIn("editionCompare", self.parser.ids)
        self.assertIn("compareStandard", self.parser.ids)
        self.assertIn("compareUltimate", self.parser.ids)
        self.assertIn("editionCompareOutput", self.parser.ids)
        self.assertIn("18/11/2026", HTML)
        self.assertIn("lf34:player-profile:v1", self.script)

    def test_visual_system_has_themes_motion_and_reduced_motion_support(self):
        self.assertIn('data-theme="sunset"', self.styles)
        self.assertIn('data-theme="night"', self.styles)
        self.assertIn("@media(prefers-reduced-motion:reduce)", self.styles)
        self.assertIn("data-motion=\"reduced\"", self.styles)
        self.assertIn("@keyframes", self.styles)

    def test_service_worker_precaches_the_new_experience_assets(self):
        self.assertIn("static-v5", self.worker)
        self.assertIn("data-v5", self.worker)
        for path in (
            "./assets/css/experience34.css",
            "./assets/js/experience34.js",
            "./data/updates.json",
        ):
            self.assertIn(path, self.worker)
            self.assertTrue((ROOT / path[2:]).is_file(), f"Missing PWA asset: {path}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
