import json
import sys
from datetime import date
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from build_guide_public import build_public_catalog, is_publishable

GUIDE = json.loads((ROOT / "data" / "guide.json").read_text(encoding="utf-8"))


def draft_entry(**overrides):
    entry = {
        "id": "mission-one",
        "title": "Misión de prueba",
        "summary": "Resumen de prueba que no corresponde a contenido real del juego.",
        "spoiler": True,
        "status": "verified",
        "visibility": "public",
        "verification": {
            "gameplay_checked": True,
            "checked_at": "2026-11-20",
            "sources": [{"title": "Captura documentada", "url": "https://example.com/proof", "kind": "gameplay-capture"}],
            "notes_private": "NO DEBE SALIR AL PUBLICO",
        },
    }
    entry.update(overrides)
    return entry


class GuidePublicationGateTests(unittest.TestCase):
    def drafts(self, entries):
        data = {"categories": [{"id": "story-missions", "entries": entries}]}
        return data

    def test_public_catalog_starts_without_unverified_entries(self):
        self.assertTrue(all(category["entries"] == [] for category in GUIDE["categories"]))
        self.assertIn("guide-drafts.json", (ROOT / ".gitignore").read_text(encoding="utf-8"))

    def test_no_entry_is_published_before_release_even_when_marked_verified(self):
        catalog, stats = build_public_catalog(GUIDE, self.drafts([draft_entry()]), date(2026, 11, 18))
        self.assertEqual([], catalog["categories"][0]["entries"])
        self.assertEqual(0, stats["published_entries"])
        self.assertEqual(1, stats["excluded_entries"])

    def test_only_verified_public_gameplay_checked_entry_after_release_is_published(self):
        drafts = self.drafts([
            draft_entry(),
            draft_entry(id="rumor", status="pending", title="Rumor sin verificar"),
            draft_entry(id="private", visibility="private", title="Nota privada"),
            draft_entry(id="not-played", verification={"gameplay_checked": False, "checked_at": "2026-11-20", "sources": [{"title": "Fuente", "url": "https://example.com", "kind": "source"}]}),
        ])
        catalog, stats = build_public_catalog(GUIDE, drafts, date(2026, 11, 21))
        entries = catalog["categories"][0]["entries"]
        self.assertEqual(["mission-one"], [entry["id"] for entry in entries])
        self.assertEqual(1, stats["published_entries"])
        self.assertEqual(3, stats["excluded_entries"])

    def test_private_notes_and_unknown_fields_never_leave_draft(self):
        item = draft_entry(secret_note="NEVER PUBLISH")
        catalog, _ = build_public_catalog(GUIDE, self.drafts([item]), date(2026, 11, 21))
        published = catalog["categories"][0]["entries"][0]
        serialized = json.dumps(published)
        self.assertNotIn("NO DEBE SALIR", serialized)
        self.assertNotIn("NEVER PUBLISH", serialized)
        self.assertIn("verification", published)
        self.assertNotIn("notes_private", published["verification"])

    def test_missing_source_and_pre_release_verification_are_rejected(self):
        no_source = draft_entry(verification={"gameplay_checked": True, "checked_at": "2026-11-20", "sources": []})
        before_release = draft_entry(id="early", verification={"gameplay_checked": True, "checked_at": "2026-11-18", "sources": [{"title": "Fuente", "url": "https://example.com", "kind": "source"}]})
        self.assertFalse(is_publishable(no_source, date(2026, 11, 21), date(2026, 11, 19)))
        self.assertFalse(is_publishable(before_release, date(2026, 11, 21), date(2026, 11, 19)))

    def test_non_https_sources_are_rejected(self):
        unsafe = draft_entry(verification={"gameplay_checked": True, "checked_at": "2026-11-20", "sources": [{"title": "Fuente", "url": "http://example.com", "kind": "source"}]})
        self.assertFalse(is_publishable(unsafe, date(2026, 11, 21), date(2026, 11, 19)))

if __name__ == "__main__":
    unittest.main(verbosity=2)
