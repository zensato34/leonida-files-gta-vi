from pathlib import Path
import json
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
SCRIPT = (ROOT / "assets/js/control34.js").read_text(encoding="utf-8")
CSS = (ROOT / "assets/css/control34.css").read_text(encoding="utf-8")
WORKER = (ROOT / "service-worker.js").read_text(encoding="utf-8")


class ControlCenterExperienceTests(unittest.TestCase):
    def test_patch_registry_is_official_only_and_starts_empty(self):
        data = json.loads((ROOT / "data/updates.json").read_text(encoding="utf-8"))
        self.assertEqual(1, data["schema_version"])
        self.assertEqual("updates", data["dataset"])
        self.assertEqual([], data["items"])
        self.assertIn("official", data["publication_policy"].lower())
        self.assertIn('id="updatesStatus"', HTML)
        self.assertIn('id="updatesList"', HTML)
        self.assertIn("Aún no hay notas de parche oficiales registradas", HTML)

    def test_patch_archive_renders_safely_and_validates_domains(self):
        self.assertIn("function officialPatchUrl", SCRIPT)
        self.assertIn("function validPatch", SCRIPT)
        self.assertIn("rockstargames.com", SCRIPT)
        self.assertIn("playstation.com", SCRIPT)
        self.assertIn("xbox.com", SCRIPT)
        self.assertIn("textContent", SCRIPT)
        self.assertNotIn("innerHTML", SCRIPT)

    def test_visual_preferences_are_labeled_and_saved_locally(self):
        self.assertIn('id="controlTheme"', HTML)
        self.assertIn('id="controlReduceMotion"', HTML)
        self.assertIn('for="controlTheme"', HTML)
        self.assertIn('for="controlReduceMotion"', HTML)
        self.assertIn("lf34:player-profile", SCRIPT)
        self.assertIn("document.documentElement.dataset.theme", SCRIPT)
        self.assertIn("document.documentElement.dataset.motion", SCRIPT)
        self.assertIn('data-motion="reduced"', CSS)
        self.assertIn('data-theme="sunset"', CSS)
        self.assertIn("@keyframes", CSS)

    def test_edition_comparator_shows_dated_spain_prices_only_for_spain_profile(self):
        self.assertIn('id="editionPriceCompare"', HTML)
        self.assertIn("79,99 €", SCRIPT)
        self.assertIn("99,99 €", SCRIPT)
        self.assertIn("18/11/2026", SCRIPT)
        self.assertIn("p.region!=='ps-es'", SCRIPT)
        self.assertIn("no se extrapolan a otras tiendas", SCRIPT)

    def test_technical_lab_distinguishes_required_storage_from_download_size(self):
        self.assertIn("212 GB de espacio libre", HTML)
        self.assertIn("no es el tamaño exacto de descarga", HTML)
        self.assertIn("Objetivo de 30 FPS", HTML)
        self.assertIn("PSSR y sombras con trazado de rayos", HTML)
        self.assertIn("Tempest 3D", HTML)
        self.assertIn("pendientes de mediciones independientes", HTML.lower())

    def test_support_includes_code_region_problem_and_external_official_links(self):
        self.assertIn('option value="code"', HTML)
        self.assertIn("code:{title:", SCRIPT)
        self.assertIn("support.rockstargames.com", SCRIPT)
        self.assertIn("status.playstation.com", HTML)
        self.assertIn("support.xbox.com/en-US/xbox-live-status", HTML)

    def test_pwa_precaches_patch_registry_and_invalidates_previous_assets(self):
        self.assertIn("static-v6", WORKER)
        self.assertIn("data-v6", WORKER)
        self.assertIn("./data/updates.json", WORKER)
        self.assertTrue((ROOT / "data/updates.json").is_file())


if __name__ == "__main__":
    unittest.main(verbosity=2)
