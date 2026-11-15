#!/usr/bin/env python3
"""Valida integridad, fuentes y relaciones del catálogo LEONIDA FILES."""
from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DATASETS = ("sources", "news", "characters", "regions", "radios", "songs", "vehicles")
ALLOWED_SOURCE_TYPES = {
    "official_primary", "official_support", "official_store",
    "recognized_media", "video_source", "platform_reference", "third_party",
}
ALLOWED_NEWS_STATUS = {"confirmado", "reporte", "rumor", "desmentido"}
ALLOWED_SONG_STATUS = {"official_release", "reported_leak"}
ALLOWED_VEHICLE_CATEGORIES = {"car", "motorcycle", "watercraft", "customized_vehicle", "offroad_buggy"}
ROCKSTAR_CDN = "www.rockstargames.com"

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

    track_numbers = [item.get("track_number") for item in items["songs"]]
    if len(track_numbers) != len(set(track_numbers)):
        errors.append("songs.json: números de pista duplicados")
    for song in items["songs"]:
        if song.get("status") not in ALLOWED_SONG_STATUS:
            errors.append(f"Pista {song.get('id')}: estado editorial desconocido")
        if not song.get("source_ids"):
            errors.append(f"Pista {song.get('id')}: falta procedencia")

    feed_path = root / "data" / "news-feed.json"
    if feed_path.exists():
        try:
            feed = json.loads(feed_path.read_text(encoding="utf-8"))
            for item in feed.get("items", []):
                if item.get("status") != "Pendiente de verificación":
                    errors.append(f"Feed RSS {item.get('id')}: no está pendiente de verificación")
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
