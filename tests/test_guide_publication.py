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
        self.assertIn("/private-guide/", (ROOT / ".gitignore").read_text(encoding="utf-8"))

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


    def test_trackable_flag_and_verified_region_are_explicitly_exported(self):
        item = draft_entry()
        item["trackable"] = True
        item["region_id"] = "vice-city"
        catalog, _ = build_public_catalog(GUIDE, self.drafts([item]), date(2026, 11, 21))
        published = catalog["categories"][0]["entries"][0]
        self.assertIs(published["trackable"], True)
        self.assertEqual("vice-city", published["region_id"])

    def test_unknown_region_is_not_exported_as_a_valid_filter(self):
        item = draft_entry()
        item["trackable"] = True
        item["region_id"] = "invented-place"
        catalog, _ = build_public_catalog(GUIDE, self.drafts([item]), date(2026, 11, 21))
        published = catalog["categories"][0]["entries"][0]
        self.assertIsNone(published["region_id"])


    def test_verified_walkthrough_fields_are_exported_but_private_notes_are_not(self):
        item = draft_entry()
        item.update({"trackable": True, "region_id": "vice-city", "location_details": "Ubicación comprobada", "unlock_requirement": "Requisito confirmado", "requirements": ["Condición A"], "steps": ["Paso 1", "Paso 2"], "reward": "Recompensa observada", "missable": True, "notes_private": "NO EXPORTAR"})
        catalog, _ = build_public_catalog(GUIDE, self.drafts([item]), date(2026, 11, 21))
        public = catalog["categories"][0]["entries"][0]
        self.assertIs(public["trackable"], True)
        self.assertEqual("vice-city", public["region_id"])
        self.assertEqual(["Paso 1", "Paso 2"], public["steps"])
        self.assertIs(public["missable"], True)
        self.assertNotIn("NO EXPORTAR", json.dumps(public))

    def test_untrusted_region_values_are_not_exported(self):
        item = draft_entry(region_id=["not", "a", "region"])
        catalog, _ = build_public_catalog(GUIDE, self.drafts([item]), date(2026, 11, 21))
        self.assertIsNone(catalog["categories"][0]["entries"][0]["region_id"])


    def test_external_reference_directory_never_counts_as_verified_guide_entries(self):
        guide = json.loads((ROOT / "data" / "guide.json").read_text(encoding="utf-8"))
        self.assertGreater(len(guide.get("external_references", [])), 0)
        for category in guide["categories"]:
            self.assertEqual([], category["entries"])
        self.assertIn("no cuentan como fichas propias verificadas", guide["external_research_note"])

if __name__ == "__main__":
    unittest.main(verbosity=2)
