#!/usr/bin/env python3
"""Build the public GTA VI guide from private editorial drafts, fail-closed."""
from __future__ import annotations
import argparse
import json
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DRAFTS = ROOT / "private-guide" / "guide-drafts.json"
DEFAULT_PUBLIC = ROOT / "data" / "guide.json"
ALLOWED_REGION_IDS = {"vice-city", "leonida-keys", "grassrivers", "port-gellhorn", "ambrosia", "mount-kalaga-national-park"}


def _date(value: Any) -> date | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def _verified_sources(verification: dict[str, Any]) -> list[dict[str, str]]:
    """Return only clean, public source metadata; never copy draft notes."""
    sources: list[dict[str, str]] = []
    raw_sources = verification.get("sources", [])
    if not isinstance(raw_sources, list):
        return sources
    for source in raw_sources:
        if not isinstance(source, dict):
            continue
        title = str(source.get("title", "")).strip()
        url = str(source.get("url", "")).strip()
        kind = str(source.get("kind", "")).strip()
        if title and url.startswith("https://") and kind:
            sources.append({"title": title[:180], "url": url, "kind": kind[:48]})
    return sources


def is_publishable(entry: Any, today: date, release_date: date) -> bool:
    if not isinstance(entry, dict):
        return False
    if entry.get("status") != "verified" or entry.get("visibility") != "public":
        return False
    verification = entry.get("verification")
    if not isinstance(verification, dict) or verification.get("gameplay_checked") is not True:
        return False
    checked_at = _date(verification.get("checked_at"))
    if checked_at is None or checked_at < release_date or checked_at > today:
        return False
    if today < release_date:
        return False
    if not _verified_sources(verification):
        return False
    if not str(entry.get("id", "")).strip() or not str(entry.get("title", "")).strip():
        return False
    if not str(entry.get("summary", "")).strip():
        return False
    return isinstance(entry.get("spoiler", False), bool)


def build_public_catalog(base: dict[str, Any], drafts: dict[str, Any], today: date) -> tuple[dict[str, Any], dict[str, int]]:
    release_date = _date(base.get("release_date"))
    if release_date is None:
        raise ValueError("data/guide.json debe incluir release_date válida")
    if not isinstance(drafts.get("categories"), list):
        raise ValueError("El archivo privado debe incluir categories como lista")

    draft_categories = {item.get("id"): item for item in drafts["categories"] if isinstance(item, dict)}
    output = json.loads(json.dumps(base))
    stats = {"draft_entries": 0, "published_entries": 0, "excluded_entries": 0}
    seen_ids: set[str] = set()

    for category in output.get("categories", []):
        draft_category = draft_categories.get(category.get("id"), {})
        entries = draft_category.get("entries", []) if isinstance(draft_category, dict) else []
        if not isinstance(entries, list):
            entries = []
        public_entries: list[dict[str, Any]] = []
        for entry in entries:
            stats["draft_entries"] += 1
            if not is_publishable(entry, today, release_date):
                stats["excluded_entries"] += 1
                continue
            entry_id = str(entry["id"]).strip()
            if entry_id in seen_ids:
                stats["excluded_entries"] += 1
                continue
            seen_ids.add(entry_id)
            verification = entry["verification"]
            # Explicit allowlist: internal notes and all draft-only fields stay private.
            region_candidate = entry.get("region_id")
            public_entries.append({
                "id": entry_id,
                "title": str(entry["title"]).strip()[:180],
                "summary": str(entry["summary"]).strip()[:1600],
                "spoiler": entry.get("spoiler", False),
                "status": "verified",
                "status_label": "Verificado en el juego",
                "trackable": entry.get("trackable") is True,
                "region_id": region_candidate if isinstance(region_candidate, str) and region_candidate in ALLOWED_REGION_IDS else None,
                "location_details": entry.get("location_details", "").strip()[:600] if isinstance(entry.get("location_details", ""), str) else "",
                "unlock_requirement": entry.get("unlock_requirement", "").strip()[:400] if isinstance(entry.get("unlock_requirement", ""), str) else "",
                "requirements": [str(value).strip()[:280] for value in entry.get("requirements", []) if isinstance(value, str) and value.strip()][:10] if isinstance(entry.get("requirements", []), list) else [],
                "steps": [str(value).strip()[:400] for value in entry.get("steps", []) if isinstance(value, str) and value.strip()][:14] if isinstance(entry.get("steps", []), list) else [],
                "reward": entry.get("reward", "").strip()[:320] if isinstance(entry.get("reward", ""), str) else "",
                "missable": entry.get("missable") is True,
                "verification": {
                    "gameplay_checked": True,
                    "checked_at": verification["checked_at"],
                    "sources": _verified_sources(verification),
                },
            })
            stats["published_entries"] += 1
        category["entries"] = public_entries
        if public_entries:
            category["status"] = "verified"
            category["status_label"] = "Contenido verificado"
        else:
            category["status"] = "pending_gameplay_verification"
            category["status_label"] = "Pendiente de verificación"
    output["reviewed_at"] = today.isoformat()
    output["publication_policy"] = "Solo se exponen fichas verificadas en partida, con visibilidad pública aprobada y fuentes HTTPS. Los borradores privados no forman parte de este archivo."
    return output, stats


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--drafts", type=Path, default=DEFAULT_DRAFTS, help="Archivo privado local de borradores")
    parser.add_argument("--output", type=Path, default=DEFAULT_PUBLIC, help="Catálogo público JSON de salida")
    parser.add_argument("--today", type=date.fromisoformat, default=date.today(), help="Fecha ISO para pruebas o generación controlada")
    parser.add_argument("--dry-run", action="store_true", help="Mostrar el recuento sin escribir el JSON público")
    args = parser.parse_args()

    if not args.drafts.is_file():
        print(f"No se encontró {args.drafts}. Copia docs/guide-drafts.template.json a private-guide/guide-drafts.json.")
        return 2
    if not args.output.is_file():
        print(f"No se encontró el catálogo base {args.output}.")
        return 2

    drafts = json.loads(args.drafts.read_text(encoding="utf-8"))
    base = json.loads(args.output.read_text(encoding="utf-8"))
    catalog, stats = build_public_catalog(base, drafts, args.today)
    if args.today < _date(base["release_date"]):
        print(f"Bloqueo pre-lanzamiento: no se publica ninguna ficha antes del {base['release_date']}.")
    print("Borradores: {draft_entries} | publicadas: {published_entries} | excluidas: {excluded_entries}".format(**stats))
    if not args.dry_run:
        args.output.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Catálogo público actualizado: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
