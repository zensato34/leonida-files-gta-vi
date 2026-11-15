#!/usr/bin/env python3
"""Descubre noticias recientes de GTA VI mediante Google News RSS.

No declara una noticia como confirmada. Los registros se publican como
'Pendiente de verificación' y deben revisarse antes de promoverse al dossier.
"""
from __future__ import annotations
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
    '"GTA VI" Rockstar Games news',
    '"GTA 6" leak OR rumor',
]
UA = "Mozilla/5.0 (compatible; LeonidaFilesUpdater/1.0; +https://github.com/)"

def fetch_feed(query: str) -> list[dict]:
    params = urllib.parse.urlencode({"q": query, "hl": "en-US", "gl": "US", "ceid": "US:en"})
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
        pub = item.findtext("pubDate") or ""
        source_el = item.find("source")
        source = (source_el.text or "Google News") if source_el is not None else "Google News"
        if not title or not link:
            continue
        # Avoid cross-topic and unrelated GTA hits.
        if not re.search(r"\b(GTA\s*VI|GTA\s*6|Grand Theft Auto VI)\b", title, re.I):
            continue
        try:
            dt = parsedate_to_datetime(pub).astimezone(timezone.utc).isoformat()
        except Exception:
            dt = datetime.now(timezone.utc).isoformat()
        entries.append({
            "id": re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:90],
            "title": title,
            "description": description[:420],
            "url": link,
            "source": source,
            "published_at": dt,
            "date": dt[:10],
            "status": "Pendiente de verificación",
            "kind": "reported",
        })
    return entries

def main() -> None:
    all_items: dict[str, dict] = {}
    for query in QUERIES:
        try:
            for entry in fetch_feed(query):
                all_items.setdefault(entry["url"], entry)
            time.sleep(1)
        except Exception as exc:
            print(f"Feed no disponible ({query}): {exc}")
    items = sorted(all_items.values(), key=lambda x: x["published_at"], reverse=True)[:MAX_ITEMS]
    existing = {"items": []}
    if OUT.exists():
        try:
            existing = json.loads(OUT.read_text(encoding="utf-8"))
        except Exception:
            pass
    # Keep previously discovered entries, but refresh duplicate metadata.
    combined = {item.get("url"): item for item in existing.get("items", []) if item.get("url")}
    for item in items:
        combined[item["url"]] = item
    final_items = sorted(combined.values(), key=lambda x: x.get("published_at", ""), reverse=True)[:MAX_ITEMS]
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "notice": "Entradas detectadas automáticamente. Estado inicial: pendiente de verificación; no son confirmaciones editoriales.",
        "items": final_items,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Feed actualizado: {len(final_items)} entradas guardadas en {OUT}")

if __name__ == "__main__":
    main()
