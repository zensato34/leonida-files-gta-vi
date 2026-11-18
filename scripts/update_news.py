#!/usr/bin/env python3
"""Descubre titulares de GTA VI desde Google News RSS; nunca confirma noticias."""
from __future__ import annotations

import hashlib
import json
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "news-feed.json"
MAX_NEW_ITEMS = 60
TRACKING_PARAMS = {"gclid", "fbclid", "mc_cid", "mc_eid", "igshid", "ref_src"}
QUERIES = [
    'site:rockstargames.com/newswire "Grand Theft Auto VI"',
    'site:rockstargames.com/es/newswire "Grand Theft Auto VI"',
    '"GTA VI" Rockstar Games news',
    '"GTA 6" Rockstar Games news',
    '"GTA VI" leak OR rumor',
    '"GTA 6" filtración OR rumor',
]
LOCALES = [
    ("en-US", "US", "US:en"),
    ("es-419", "DO", "DO:es"),
]
UA = "Mozilla/5.0 (compatible; LeonidaFilesUpdater/1.2; +https://github.com/)"


def normalize_url(value: str) -> str:
    """Return a stable HTTPS URL key without fragments or common tracking parameters."""
    try:
        parsed = urllib.parse.urlsplit(str(value).strip())
        if parsed.scheme.lower() != "https" or not parsed.hostname:
            return ""
        if parsed.username or parsed.password:
            return ""
        host = parsed.hostname.lower()
        port = parsed.port
        netloc = host if port in (None, 443) else f"{host}:{port}"
        query = [
            (key, item)
            for key, item in urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
            if not key.lower().startswith("utm_") and key.lower() not in TRACKING_PARAMS
        ]
        query.sort(key=lambda pair: (pair[0].lower(), pair[1]))
        return urllib.parse.urlunsplit((
            "https",
            netloc,
            parsed.path or "/",
            urllib.parse.urlencode(query, doseq=True),
            "",
        ))
    except (TypeError, ValueError):
        return ""


def fetch_feed(query: str, hl: str, gl: str, ceid: str) -> list[dict]:
    params = urllib.parse.urlencode({"q": query, "hl": hl, "gl": gl, "ceid": ceid})
    url = "https://news.google.com/rss/search?" + params
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=25) as response:
        xml_data = response.read()
    root = ET.fromstring(xml_data)
    channel = root.find("channel")
    if channel is None:
        return []
    entries = []
    for item in channel.findall("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        normalized = normalize_url(link)
        description = re.sub(r"<[^>]+>", " ", item.findtext("description") or "")
        description = re.sub(r"\s+", " ", description).strip()
        pub = (item.findtext("pubDate") or "").strip()
        source_el = item.find("source")
        source = ((source_el.text or "Google News").strip() if source_el is not None else "Google News")
        if not title or not normalized:
            continue
        if not re.search(r"\b(GTA\s*VI|GTA\s*6|Grand Theft Auto VI)\b", title, re.I):
            continue
        try:
            published = parsedate_to_datetime(pub)
            if published.tzinfo is None:
                published = published.replace(tzinfo=timezone.utc)
            dt = published.astimezone(timezone.utc).isoformat()
        except Exception:
            # Never invent a publication timestamp for a result without a valid pubDate.
            continue
        stable = hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:12]
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:72]
        entries.append({
            "id": f"{slug}-{stable}",
            "title": title,
            "description": description[:420],
            "url": link,
            "source": source,
            "published_at": dt,
            "date": dt[:10],
            "status": "Pendiente de verificación",
            "kind": "reported",
            "discovery_source": "Google News RSS",
            "discovery_locale": hl,
            "verification_required": True,
        })
    return entries


def is_editorially_reviewed(item: dict) -> bool:
    """A reviewed record must outrank an unverified RSS duplicate for the same URL."""
    return (
        item.get("discovery_source") != "Google News RSS"
        and item.get("kind") in {"confirmed", "reported", "rumor"}
        and item.get("status") in {"Confirmado", "Reportado", "Pendiente de verificación"}
    )


def merge_feed_items(existing_items: list[dict], discovered_items: list[dict]) -> list[dict]:
    """Keep existing editorial data, deduplicate by URL then ID, and append only new RSS items."""
    combined: list[dict] = []
    positions_by_url: dict[str, int] = {}
    seen_ids: set[str] = set()

    for item in existing_items:
        if not isinstance(item, dict):
            continue
        item_id = str(item.get("id") or "")
        key = normalize_url(item.get("url", ""))
        if key and key in positions_by_url:
            position = positions_by_url[key]
            current = combined[position]
            if is_editorially_reviewed(item) and not is_editorially_reviewed(current):
                combined[position] = item
                current_id = str(current.get("id") or "")
                if current_id:
                    seen_ids.discard(current_id)
                if item_id:
                    seen_ids.add(item_id)
            continue
        if item_id and item_id in seen_ids:
            continue
        if key:
            positions_by_url[key] = len(combined)
        combined.append(item)
        if item_id:
            seen_ids.add(item_id)

    for item in discovered_items:
        if not isinstance(item, dict):
            continue
        key = normalize_url(item.get("url", ""))
        item_id = str(item.get("id") or "")
        if not key or key in positions_by_url or (item_id and item_id in seen_ids):
            continue
        positions_by_url[key] = len(combined)
        combined.append(item)
        if item_id:
            seen_ids.add(item_id)

    return sorted(combined, key=lambda item: str(item.get("published_at", "")), reverse=True)


def main() -> None:
    discovered_by_url: dict[str, dict] = {}
    failures = 0
    for query in QUERIES:
        for hl, gl, ceid in LOCALES:
            try:
                for entry in fetch_feed(query, hl, gl, ceid):
                    key = normalize_url(entry.get("url", ""))
                    if key:
                        discovered_by_url.setdefault(key, entry)
            except Exception as exc:
                failures += 1
                print(f"Feed no disponible ({hl} · {query}): {exc}")
            time.sleep(0.35)

    new_items = sorted(
        discovered_by_url.values(),
        key=lambda item: item["published_at"],
        reverse=True,
    )[:MAX_NEW_ITEMS]

    existing = {"items": []}
    if OUT.exists():
        try:
            existing = json.loads(OUT.read_text(encoding="utf-8"))
        except Exception as exc:
            print(f"No se pudo leer el feed anterior; no se sobrescribirá: {exc}")
            raise

    previous_items = existing.get("items", [])
    if not isinstance(previous_items, list):
        raise ValueError("news-feed.json: items debe ser una lista; no se sobrescribirá")
    final_items = merge_feed_items(previous_items, new_items)

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "notice": (
            "Descubrimiento automático mediante Google News RSS. Es un agregador de titulares, "
            "no una fuente primaria ni una confirmación editorial; cada entrada requiere verificación. "
            "Las entradas editoriales existentes se conservan y no se sustituyen por duplicados RSS."
        ),
        "items": final_items,
        "diagnostics": {
            "queries": len(QUERIES) * len(LOCALES),
            "failed_queries": failures,
            "new_discoveries_considered": len(new_items),
            "total_preserved_items": len(final_items),
        },
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"Feed actualizado: {len(final_items)} entradas; "
        f"{len(new_items)} descubrimientos considerados; {failures} consultas fallidas."
    )


if __name__ == "__main__":
    main()
