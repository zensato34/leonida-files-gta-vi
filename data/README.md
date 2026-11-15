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
| `songs.json` | Pistas con separación entre sencillos oficiales y lista reportada |
| `sources.json` | Registro de fuentes, dominio, tipo y autoridad |
| `vehicles.json` | Catálogo preparado; solo se agregan fichas con evidencia |
| `news-feed.json` | Titulares RSS automáticos, siempre pendientes de verificación |

## Política editorial

Las noticias admiten `confirmado`, `reporte`, `rumor` y `desmentido`. Para utilizar `confirmado`, al menos una de sus fuentes debe ser un canal primario de Rockstar o Rockstar Support. La cobertura de medios reconocidos se clasifica como `reporte`, aunque cite declaraciones de Rockstar, para no confundir la publicación del medio con un comunicado de la compañía.

Los expedientes Bae-Luxe y Roxy conservan la indicación de biografía compartida de Real Dimez. Las relaciones de personajes usan IDs, no nombres sueltos, y deben resolver a otro expediente existente.

El Atlas es un índice de nombres publicados, no una cartografía. El catálogo de vehículos puede permanecer vacío sin sugerir que el juego no tenga vehículos: solo indica que todavía no hay fichas verificadas en el archivo.

## Validación

Desde la raíz del repositorio:

```bash
python scripts/validate_catalog.py
python -m unittest discover -s tests -v
```

La interfaz se sirve con `assets/css/dossier34.css` y `assets/js/dossier34.js`. Si falla la carga de un JSON, el HTML conserva el contenido de respaldo.
