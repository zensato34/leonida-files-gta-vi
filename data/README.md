# Catálogos editoriales de LEONIDA FILES

Todos los catálogos usan UTF-8 y el mismo sobre:

- `schema_version`: versión del contrato de datos (actualmente `1`).
- `dataset`: nombre del catálogo.
- `reviewed_at`: fecha de revisión editorial.
- `description`: alcance y advertencias.
- `items`: registros del catálogo.

## Archivos

| Archivo | Uso |
|---|---|
| `news.json` | Noticias seleccionadas y clasificadas editorialmente |
| `characters.json` | Expedientes, biografías y relaciones entre personajes |
| `regions.json` | Regiones nombradas, sin coordenadas inventadas |
| `radios.json` | Emisoras, locutores, descripciones y arte oficial |
| `songs.json` | Diez sencillos oficiales de The Album y dos del Original Score by Justice; no incluye tracklists filtrados |
| `sources.json` | Registro de fuentes, dominio, tipo y autoridad |
| `vehicles.json` | Siete registros oficiales destacados; no representa el parque vehicular completo |
| `news-feed.json` | Feed de descubrimientos RSS y entradas editoriales revisadas; los resultados RSS permanecen pendientes |

## Política editorial

Las noticias admiten `confirmado`, `reporte`, `rumor` y `desmentido`. El catálogo público `songs.json` es más estricto: solo admite sencillos publicados explícitamente por Rockstar y cada canción requiere una fuente primaria. Para utilizar `confirmado`, al menos una de sus fuentes debe ser un canal primario de Rockstar o Rockstar Support. La cobertura de medios reconocidos se clasifica como `reporte`, aunque cite declaraciones de Rockstar, para no confundir la publicación del medio con un comunicado de la compañía. En `news-feed.json`, las entradas detectadas por Google News RSS deben conservar `kind: reported` y `status: Pendiente de verificación`; las entradas revisadas manualmente pueden tener `Reportado` o `Confirmado` si la evidencia lo permite, y su clasificación no se sustituye por duplicados RSS.

Los expedientes Bae-Luxe y Roxy conservan la indicación de biografía compartida de Real Dimez. Las relaciones de personajes usan IDs, no nombres sueltos, y deben resolver a otro expediente existente.

El Atlas es un índice de nombres publicados, no una cartografía. El catálogo de vehículos puede permanecer vacío sin sugerir que el juego no tenga vehículos: solo indica que todavía no hay fichas verificadas en el archivo.

## Validación

Desde la raíz del repositorio:

```bash
python scripts/validate_catalog.py
python -m unittest discover -s tests -v
```

La interfaz se sirve con `assets/css/dossier34.css` y `assets/js/dossier34.js`. Si falla la carga de un JSON, el HTML conserva el contenido de respaldo.


## Atlas y Hangar 34

El Atlas guarda una imagen oficial, el rótulo de la colección de capturas y su recuento por región. El campo `map_status` impide presentar esas tarjetas como geografía cartográfica; no se usan coordenadas.

Hangar 34 incluye únicamente nombres de vehículos publicados en galerías o beneficios oficiales. Cada entrada tiene una categoría editorial, contexto de edición, imagen oficial y fuentes asociadas. No se rellenan prestaciones, precios ni disponibilidad de modelos que Rockstar no haya descrito.


- `progress.json`: metadatos del centro de progreso. No contiene un inventario inventado; declara que el catálogo está incompleto y que cualquier porcentaje futuro se calculará solo sobre tareas verificadas y publicadas.
