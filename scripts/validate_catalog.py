#!/usr/bin/env python3
"""Valida integridad, fuentes y relaciones del catálogo LEONIDA FILES."""
from __future__ import annotations

import json
import sys
from datetime import date, datetime
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse

ROOT = Path(__file__).resolve().parents[1]
DATASETS = ("sources", "news", "characters", "regions", "radios", "songs", "vehicles")
ALLOWED_SOURCE_TYPES = {
    "official_primary", "official_support", "official_store",
    "recognized_media", "video_source", "platform_reference", "third_party",
}
ALLOWED_NEWS_STATUS = {"confirmado", "reporte", "rumor", "desmentido"}
ALLOWED_SONG_STATUS = {"official_release"}
ALLOWED_SONG_COLLECTIONS = {"the_album", "original_score"}
ALLOWED_VEHICLE_CATEGORIES = {"car", "motorcycle", "watercraft", "customized_vehicle", "offroad_buggy"}
ROCKSTAR_CDN = "www.rockstargames.com"
ALLOWED_FEED_STATUS = {
    "confirmed": {"Confirmado"},
    "reported": {"Reportado", "Pendiente de verificación"},
    "rumor": {"Pendiente de verificación"},
}
PRIMARY_FEED_DOMAINS = {
    "rockstargames.com", "support.rockstargames.com",
    "playstation.com", "store.playstation.com",
    "xbox.com", "news.xbox.com", "microsoft.com",
}

def load_dataset(name: str, root: Path = ROOT) -> dict:
    path = root / "data" / f"{name}.json"
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if payload.get("schema_version") != 1:
        raise ValueError(f"{name}.json: schema_version debe ser 1")
    if payload.get("dataset") != name:
        raise ValueError(f"{name}.json: dataset no coincide con el nombre del archivo")
    if not isinstance(payload.get("items"), list):
        raise ValueError(f"{name}.json: items debe ser una lista")
    return payload

def validate_catalogs(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    catalogs: dict[str, dict] = {}
    for name in DATASETS:
        try:
            catalogs[name] = load_dataset(name, root)
        except (OSError, json.JSONDecodeError, ValueError) as exc:
            errors.append(str(exc))
    if errors:
        return errors

    items = {name: payload["items"] for name, payload in catalogs.items()}
    source_by_id = {item.get("id"): item for item in items["sources"] if item.get("id")}
    source_ids = set(source_by_id)

    for name, records in items.items():
        ids = [record.get("id") for record in records]
        if any(not value for value in ids):
            errors.append(f"{name}.json: existe un registro sin id")
        if len(ids) != len(set(ids)):
            errors.append(f"{name}.json: hay identificadores duplicados")

    for source in items["sources"]:
        if source.get("type") not in ALLOWED_SOURCE_TYPES:
            errors.append(f"Fuente {source.get('id')}: tipo desconocido")
        parsed = urlparse(source.get("url", ""))
        if parsed.scheme != "https" or not parsed.netloc:
            errors.append(f"Fuente {source.get('id')}: URL no HTTPS o inválida")

    for name in ("news", "characters", "regions", "radios", "songs", "vehicles"):
        for record in items[name]:
            for source_id in record.get("source_ids", []):
                if source_id not in source_ids:
                    errors.append(f"{name}:{record.get('id')} referencia fuente inexistente {source_id}")

    for record in items["news"]:
        status = record.get("classification")
        if status not in ALLOWED_NEWS_STATUS:
            errors.append(f"Noticia {record.get('id')}: clasificación inválida")
        if not record.get("source_ids"):
            errors.append(f"Noticia {record.get('id')}: falta fuente")
        if status == "confirmado":
            authorities = {source_by_id[sid].get("type") for sid in record.get("source_ids", []) if sid in source_by_id}
            if not authorities.intersection({"official_primary", "official_support"}):
                errors.append(f"Noticia {record.get('id')}: marcada confirmada sin fuente primaria")
        start = record.get("date_start")
        end = record.get("date_end")
        for label, value in (("date_start", start), ("date_end", end)):
            if value:
                try:
                    date.fromisoformat(value)
                except ValueError:
                    errors.append(f"Noticia {record.get('id')}: {label} inválida")

    character_ids = {item.get("id") for item in items["characters"]}
    for person in items["characters"]:
        if not person.get("biography") or not person.get("image_url"):
            errors.append(f"Personaje {person.get('id')}: biografía o imagen ausente")
        host = urlparse(person.get("image_url", "")).netloc
        if host != ROCKSTAR_CDN:
            errors.append(f"Personaje {person.get('id')}: imagen fuera del CDN de Rockstar")
        for relation in person.get("relations", []):
            if relation.get("target_id") not in character_ids:
                errors.append(f"Personaje {person.get('id')}: relación sin destino {relation.get('target_id')}")

    for radio in items["radios"]:
        for field in ("logo_url", "background_url"):
            host = urlparse(radio.get(field, "")).netloc
            if host != ROCKSTAR_CDN:
                errors.append(f"Emisora {radio.get('id')}: {field} no apunta al CDN oficial")

    for region in items["regions"]:
        if region.get("map_status") != "no_official_coordinates_in_this_catalog":
            errors.append(f"Región {region.get('id')}: estado cartográfico no permitido")
        if not isinstance(region.get("gallery_count"), int) or region["gallery_count"] < 1:
            errors.append(f"Región {region.get('id')}: recuento de galería inválido")
        if not region.get("gallery_label") or not region.get("gallery_url"):
            errors.append(f"Región {region.get('id')}: falta referencia a la galería oficial")
        if urlparse(region.get("image_url", "")).netloc != ROCKSTAR_CDN:
            errors.append(f"Región {region.get('id')}: imagen fuera del CDN de Rockstar")
        if any(key in region for key in ("lat", "latitude", "lon", "long", "longitude", "coordinates")):
            errors.append(f"Región {region.get('id')}: no se permiten coordenadas no verificadas")

    for vehicle in items["vehicles"]:
        if vehicle.get("category") not in ALLOWED_VEHICLE_CATEGORIES:
            errors.append(f"Vehículo {vehicle.get('id')}: categoría desconocida")
        if not vehicle.get("name") or not vehicle.get("manufacturer") or not vehicle.get("edition_context"):
            errors.append(f"Vehículo {vehicle.get('id')}: ficha incompleta")
        if not vehicle.get("image_url") or urlparse(vehicle.get("image_url", "")).netloc != ROCKSTAR_CDN:
            errors.append(f"Vehículo {vehicle.get('id')}: imagen ausente o fuera del CDN de Rockstar")
        if not vehicle.get("source_ids") or not vehicle.get("official_gallery_label"):
            errors.append(f"Vehículo {vehicle.get('id')}: falta evidencia oficial")
        if vehicle.get("evidence_status") not in {"official_edition_benefit", "official_media_label", "official_preorder_benefit"}:
            errors.append(f"Vehículo {vehicle.get('id')}: estado de evidencia desconocido")

    track_numbers = [(item.get("collection"), item.get("track_number")) for item in items["songs"]]
    if len(track_numbers) != len(set(track_numbers)):
        errors.append("songs.json: números de pista duplicados dentro de una colección")
    for song in items["songs"]:
        if song.get("status") not in ALLOWED_SONG_STATUS:
            errors.append(f"Pista {song.get('id')}: el catálogo público solo admite lanzamientos oficiales")
        if song.get("collection") not in ALLOWED_SONG_COLLECTIONS:
            errors.append(f"Pista {song.get('id')}: colección no reconocida")
        if not song.get("source_ids"):
            errors.append(f"Pista {song.get('id')}: falta procedencia")
        song_authorities = {source_by_id[sid].get("type") for sid in song.get("source_ids", []) if sid in source_by_id}
        if not song_authorities.intersection({"official_primary", "official_support"}):
            errors.append(f"Pista {song.get('id')}: falta fuente primaria de publicación")

    guide_path = root / "data" / "guide.json"
    if guide_path.exists():
        try:
            guide = json.loads(guide_path.read_text(encoding="utf-8"))
            if guide.get("dataset") != "guide" or not isinstance(guide.get("categories"), list):
                errors.append("guide.json: esquema o categorías inválidas")
            external_refs = guide.get("external_references", [])
            quick_tips = guide.get("quick_tips", [])
            if not isinstance(external_refs, list) or not isinstance(quick_tips, list):
                errors.append("guide.json: external_references y quick_tips deben ser listas")
                external_refs = []
                quick_tips = []
            external_ids: set[str] = set()
            for item in external_refs:
                if not isinstance(item, dict):
                    errors.append("guide.json: referencia externa no válida")
                    continue
                ref_id = str(item.get("id") or "")
                if not ref_id or ref_id in external_ids:
                    errors.append(f"guide.json: id externo vacío o duplicado ({ref_id})")
                external_ids.add(ref_id)
                source_id = item.get("source_id")
                source = source_by_id.get(source_id)
                if source is None:
                    errors.append(f"Guía externa {ref_id}: fuente no registrada ({source_id})")
                parsed = urlparse(str(item.get("url") or ""))
                if parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password:
                    errors.append(f"Guía externa {ref_id}: URL HTTPS inválida")
                elif source and item.get("url") != source.get("url"):
                    errors.append(f"Guía externa {ref_id}: URL no coincide con sources.json")
                if item.get("status") != "external_report":
                    errors.append(f"Guía externa {ref_id}: debe permanecer como external_report")
                if "no verificada por LEONIDA FILES" not in str(item.get("status_label") or ""):
                    errors.append(f"Guía externa {ref_id}: falta etiqueta de atribución")
            for tip in quick_tips:
                if not isinstance(tip, dict):
                    errors.append("guide.json: consejo de arranque no válido")
                    continue
                tip_id = str(tip.get("id") or "sin-id")
                if not tip.get("source_ids"):
                    errors.append(f"Consejo {tip_id}: falta source_ids")
                for source_id in tip.get("source_ids", []):
                    if source_id not in source_ids:
                        errors.append(f"Consejo {tip_id}: fuente no registrada ({source_id})")
                for source in tip.get("sources", []):
                    parsed = urlparse(str(source.get("url") or ""))
                    if parsed.scheme != "https" or not parsed.netloc:
                        errors.append(f"Consejo {tip_id}: enlace externo no HTTPS")
                    source_record = source_by_id.get(source.get("source_id"))
                    if source_record is None:
                        errors.append(f"Consejo {tip_id}: source_id del enlace no registrado")
                    elif source.get("url") != source_record.get("url"):
                        errors.append(f"Consejo {tip_id}: URL del enlace no coincide con sources.json")
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"guide.json: {exc}")

    feed_path = root / "data" / "news-feed.json"
    if feed_path.exists():
        try:
            feed = json.loads(feed_path.read_text(encoding="utf-8"))
            feed_items = feed.get("items", [])
            if not isinstance(feed_items, list):
                errors.append("news-feed.json: items debe ser una lista")
                feed_items = []
            feed_ids: set[str] = set()
            feed_urls: set[str] = set()
            for item in feed_items:
                if not isinstance(item, dict):
                    errors.append("news-feed.json: existe una entrada que no es un objeto")
                    continue
                item_id = str(item.get("id") or "")
                if not item_id:
                    errors.append("news-feed.json: existe una entrada sin id")
                elif item_id in feed_ids:
                    errors.append(f"Feed {item_id}: id duplicado")
                feed_ids.add(item_id)

                for field in ("title", "description", "source"):
                    if not str(item.get(field) or "").strip():
                        errors.append(f"Feed {item_id}: falta {field}")

                parsed_url = urlparse(str(item.get("url") or ""))
                if parsed_url.scheme != "https" or not parsed_url.netloc:
                    errors.append(f"Feed {item_id}: URL no HTTPS o inválida")
                elif parsed_url.username or parsed_url.password:
                    errors.append(f"Feed {item_id}: URL HTTPS contiene credenciales")
                else:
                    query = [
                        (key, value)
                        for key, value in parse_qsl(parsed_url.query, keep_blank_values=True)
                        if not key.lower().startswith("utm_")
                        and key.lower() not in {"gclid", "fbclid", "mc_cid", "mc_eid", "igshid", "ref_src"}
                    ]
                    query.sort(key=lambda pair: (pair[0].lower(), pair[1]))
                    normalized_url = parsed_url._replace(
                        scheme="https",
                        netloc=parsed_url.netloc.lower(),
                        query=urlencode(query, doseq=True),
                        fragment="",
                    ).geturl()
                    if normalized_url in feed_urls:
                        errors.append(f"Feed {item_id}: URL duplicada")
                    feed_urls.add(normalized_url)

                kind = item.get("kind")
                status = item.get("status")
                allowed_statuses = ALLOWED_FEED_STATUS.get(kind)
                if allowed_statuses is None:
                    errors.append(f"Feed {item_id}: kind inválido")
                elif status not in allowed_statuses:
                    errors.append(f"Feed {item_id}: status no concuerda con kind {kind}")

                discovery_source = item.get("discovery_source")
                if discovery_source == "Google News RSS" and (
                    kind != "reported" or status != "Pendiente de verificación"
                ):
                    errors.append(f"Google News RSS {item_id}: debe permanecer como reporte pendiente")

                if kind == "confirmed" and parsed_url.scheme == "https" and parsed_url.netloc:
                    host = parsed_url.hostname.lower() if parsed_url.hostname else ""
                    if not any(host == domain or host.endswith("." + domain) for domain in PRIMARY_FEED_DOMAINS):
                        errors.append(f"Feed {item_id}: confirmado sin dominio de fuente primaria")

                published_at = str(item.get("published_at") or "")
                try:
                    if "T" in published_at:
                        timestamp = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
                        if timestamp.tzinfo is None:
                            raise ValueError("timestamp sin zona horaria")
                    else:
                        # A date-only ISO-8601 value is valid when the source exposes no publication time.
                        date.fromisoformat(published_at)
                except ValueError:
                    errors.append(f"Feed {item_id}: published_at no es ISO-8601 válido")

                date_value = str(item.get("date") or "")
                try:
                    date.fromisoformat(date_value)
                except ValueError:
                    errors.append(f"Feed {item_id}: date no es YYYY-MM-DD")
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"news-feed.json: {exc}")

    return errors

def main() -> int:
    errors = validate_catalogs()
    if errors:
        for error in errors:
            print("ERROR:", error)
        return 1
    for name in DATASETS:
        payload = load_dataset(name)
        print(f"{name}: {len(payload['items'])} registros")
    print("Validación editorial completada sin errores.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
