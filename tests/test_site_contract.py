from html.parser import HTMLParser
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
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if data.get("id"):
            self.ids.add(data["id"])
            self.id_values.append(data["id"])
        if tag == "a" and (data.get("href") or "").startswith("#"):
            self.links.append(data["href"][1:])
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
        required = {"atlas", "evidencias", "cronologia", "hangar", "commandPalette", "commandInput", "openCommand", "favoritesDrawer", "sinceLastVisit", "bootScreen"}
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
        self.assertRegex(HTML, r"@media\s*\(prefers-reduced-motion:\s*reduce\)")
        self.assertIn('aria-label="Abrir búsqueda global"', HTML)
        self.assertIn('aria-modal="true"', HTML)
        self.assertIn("Escape", HTML)
        self.assertIn("trapTab", HTML)
        self.assertIn("if(e.key==='Tab')", HTML)

    def test_auto_feed_remains_pending_and_text_only(self):
        self.assertIn("Pendiente de verificación", HTML)
        self.assertIn("textContent=String(item.title", HTML)
        self.assertIn("textContent=String(item.description", HTML)

    def test_independent_credit_and_official_art_policy_remain_visible(self):
        self.assertIn("Proyecto fan-made, independiente y no oficial", HTML)
        self.assertIn("zensato34", HTML)
        self.assertIn("no se han creado imágenes con IA", HTML)
        self.assertRegex(HTML, r"https://www\.rockstargames\.com/VI/_next/static/media/")

    def test_no_duplicate_dom_ids(self):
        duplicates = sorted({x for x in self.parser.id_values if self.parser.id_values.count(x) > 1})
        self.assertEqual([], duplicates, f"Duplicate IDs: {duplicates}")

    def test_mobile_navigation_has_single_toggle_handler(self):
        self.assertNotIn("menuBtn=document.getElementById('menuBtn')", HTML)
        self.assertIn("menu?.addEventListener('click'", HTML)
        self.assertIn('aria-expanded="false"', HTML)
        self.assertIn('class="cmd-icon"', HTML)
        self.assertIn('.cmd-icon{display:inline!important', HTML)

    def test_debunked_evidence_filter_has_matching_news_option(self):
        self.assertIn('<option value="desmentido">Desmentido</option>', HTML)
        self.assertIn("f==='desmentido'&&k==='desmentido'", HTML)

    def test_global_search_indexes_news_and_auto_feed_timestamps(self):
        self.assertIn("#newsList .news,#personajes .character-file", HTML)
        self.assertIn("el.dataset.publishedAt=String(item.published_at||item.date||'')", HTML)
        self.assertIn("newsfeed:updated", HTML)

    def test_browser_storage_is_guarded(self):
        self.assertRegex(HTML, r"function\s+safeStorage|const\s+safeStorage")
        self.assertIn("try{", HTML)
        self.assertIn("catch", HTML)

if __name__ == "__main__":
    unittest.main(verbosity=2)
