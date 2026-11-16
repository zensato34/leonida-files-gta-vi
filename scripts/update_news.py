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
MAX_ITEMS = 60
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
UA = "Mozilla/5.0 (compatible; LeonidaFilesUpdater/1.1; +https://github.com/)"

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
        description = re.sub(r"<[^>]+>", " ", item.findtext("description") or "")
        description = re.sub(r"\s+", " ", description).strip()
        pub = (item.findtext("pubDate") or "").strip()
        source_el = item.find("source")
        source = ((source_el.text or "Google News").strip() if source_el is not None else "Google News")
        if not title or not link:
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
        stable = hashlib.sha256(link.encode("utf-8")).hexdigest()[:12]
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

def main() -> None:
    all_items: dict[str, dict] = {}
    failures = 0
    for query in QUERIES:
        for hl, gl, ceid in LOCALES:
            try:
                for entry in fetch_feed(query, hl, gl, ceid):
                    all_items.setdefault(entry["url"], entry)
            except Exception as exc:
                failures += 1
                print(f"Feed no disponible ({hl} · {query}): {exc}")
            time.sleep(0.35)
    new_items = sorted(all_items.values(), key=lambda x: x["published_at"], reverse=True)[:MAX_ITEMS]
    existing = {"items": []}
    if OUT.exists():
        try:
            existing = json.loads(OUT.read_text(encoding="utf-8"))
        except Exception as exc:
            print(f"No se pudo leer el feed anterior; se conserva el archivo solo si es reparable: {exc}")
            raise
    combined = {item.get("url"): item for item in existing.get("items", []) if isinstance(item, dict) and item.get("url")}
    for item in new_items:
        combined[item["url"]] = item
    final_items = sorted(combined.values(), key=lambda x: x.get("published_at", ""), reverse=True)[:MAX_ITEMS]
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "notice": "Descubrimiento automático mediante Google News RSS. Es un agregador de titulares, no una fuente primaria ni una confirmación editorial; cada entrada requiere verificación.",
        "items": final_items,
        "diagnostics": {"queries": len(QUERIES) * len(LOCALES), "failed_queries": failures},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Feed actualizado: {len(final_items)} entradas; {failures} consultas fallidas.")

if __name__ == "__main__":
    main()
