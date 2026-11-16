# Borradores privados de la guía

## Regla de privacidad

Los apuntes no verificados **no deben guardarse en `data/` ni en ninguna rama del repositorio público**. GitHub Pages publica los archivos del repositorio y un archivo «oculto» por CSS o JavaScript seguiría siendo descargable por cualquiera.

Guarda el archivo de trabajo en `private-guide/guide-drafts.json`. Esa carpeta está excluida por `.gitignore`. Conserva además una copia en tu Biblioteca privada de ChatGPT, fuera del repositorio. No subas capturas, notas de historia ni pistas de filtraciones a GitHub hasta que hayas decidido publicarlas.

## Cómo añadir un apunte

Copia `docs/guide-drafts.template.json` a `private-guide/guide-drafts.json` y agrega la ficha dentro de la categoría correspondiente. Déjala con:

- `status: "pending"`
- `visibility: "private"`
- `verification.gameplay_checked: false`

Puedes guardar la hipótesis y las notas en `verification.notes_private`. Esas notas nunca se exportan al catálogo público.

## Condiciones para publicar

El generador solo exporta una ficha cuando **todas** estas condiciones se cumplen: la fecha del sistema es el 19 de noviembre de 2026 o posterior; el estado es `verified`; la visibilidad se cambia expresamente a `public`; se ha comprobado directamente en el juego; `checked_at` es igual o posterior al lanzamiento; y existe al menos una fuente HTTPS con título y tipo. Los registros pendientes, rumores, borradores privados o fichas sin fuente se quedan fuera.

El generador usa una lista permitida de campos. No exporta `notes_private`, campos internos, rumores asociados ni metadatos no aprobados. Los spoilers pueden publicarse solo en fichas verificadas y continúan ocultos por defecto en la interfaz.

## Publicar una actualización

Después de actualizar el archivo privado, ejecuta desde la raíz del proyecto:

```bash
python scripts/build_guide_public.py
python -m unittest discover -s tests -v
python scripts/validate_catalog.py
```

Revisa el diff de `data/guide.json` antes de hacer commit. Solo ese JSON público debe llegar a `main`. No añadas nunca `private-guide/guide-drafts.json` al commit.

La fecha de lanzamiento se mantiene en un solo lugar del índice público y en la plantilla privada. Si Rockstar cambia la fecha, actualiza ambos valores y los tests antes de generar el catálogo.
