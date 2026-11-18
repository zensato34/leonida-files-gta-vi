import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))

class PwaContractTests(unittest.TestCase):
    def test_manifest_points_to_local_app_scope_and_svg_icon(self):
        self.assertEqual("standalone", MANIFEST["display"])
        self.assertEqual("./", MANIFEST["scope"])
        self.assertTrue(MANIFEST["start_url"].startswith("./"))
        for icon in MANIFEST["icons"]:
            self.assertTrue((ROOT / icon["src"]).is_file())
        self.assertTrue(any(icon["type"] == "image/svg+xml" and icon["sizes"] == "any" for icon in MANIFEST["icons"]))

    def test_service_worker_precaches_only_local_existing_assets(self):
        script = (ROOT / "service-worker.js").read_text(encoding="utf-8")
        start = script.index("const CORE_ASSETS=[")
        end = script.index("];", start)
        block = script[start:end]
        import re
        paths = re.findall(r"'(\./[^']+)'", block)
        self.assertGreaterEqual(len(paths), 15)
        for path in paths:
            self.assertTrue((ROOT / path[2:]).exists(), f"Missing PWA cache asset: {path}")

    def test_offline_fallback_and_live_data_refresh_are_defined(self):
        script = (ROOT / "service-worker.js").read_text(encoding="utf-8")
        self.assertIn("request.mode==='navigate'", script)
        self.assertIn("networkFirst(request,CACHE_DATA)", script)
        self.assertIn("cache.match('./index.html')", script)
        self.assertIn("if(url.origin!==self.location.origin)return", script)


    def test_android_install_icons_include_192_and_512_png_fallbacks(self):
        icons = MANIFEST["icons"]
        self.assertTrue(any(icon.get("sizes") == "192x192" and icon.get("type") == "image/png" for icon in icons))
        self.assertTrue(any(icon.get("sizes") == "512x512" and icon.get("type") == "image/png" for icon in icons))
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn('rel="apple-touch-icon"', html)


    def test_static_cache_version_bumps_for_redesign_assets(self):
        script = (ROOT / "service-worker.js").read_text(encoding="utf-8")
        self.assertIn("static-v4", script)
        self.assertIn("data-v4", script)

if __name__ == "__main__":
    unittest.main(verbosity=2)
