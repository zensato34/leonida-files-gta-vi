# LEONIDA FILES — GTA VI por zensato34

Sitio fan-made en español, adaptable a móviles, con identidad cinematográfica de archivo clasificado, Atlas temático no cartográfico, centro de evidencias, cronología editorial, Hangar 34, búsqueda global, favoritos locales y resumen de novedades por visita. Conserva personajes, radios, música, ediciones, tiendas y media oficial de Rockstar. Las imágenes integradas proceden del CDN oficial; no se generan imágenes con IA.

## Abrir ahora

Abre `index.html` con un navegador moderno. El contador sigue la región de PS Store España: 00:00 CET del 19/11/2026, equivalente a las 19:00 del 18/11/2026 en República Dominicana. Rockstar Support indica desbloqueo a medianoche local por región; el portal distingue la apertura de otras regiones de la ventana española y pasa a un estado de ventana de lanzamiento alcanzada al llegar. Las animaciones respetan `prefers-reduced-motion`. Para que funcione el feed JSON al abrirlo localmente, ejecútalo con un servidor estático (por ejemplo, `python -m http.server 8000`) y visita `http://localhost:8000`.

## Publicación actual

El sitio ya está publicado en GitHub Pages: **https://zensato34.github.io/leonida-files-gta-vi/**. El repositorio público es `zensato34/leonida-files-gta-vi`, en la rama `main`, carpeta `/ (root)`. GitHub Pages está configurado con **Deploy from a branch**.

Los cambios deben prepararse en una rama y revisarse antes de integrarse en `main`; al actualizar `main`, GitHub Pages inicia una nueva publicación automáticamente. El workflow de noticias dispone de permisos de escritura sobre el contenido del repositorio y se ejecuta cada día a las 08:45 de República Dominicana (12:45 UTC), después del Radar diario de GTA VI, que mantiene su horario de las 08:15.


## Interfaz Dossier 34

- **Búsqueda global:** usa el botón «Buscar archivo» o `Ctrl/⌘ + K`; también puedes abrirla con `/` cuando no estés escribiendo.
- **Mi archivo:** guarda noticias, personajes, emisoras y regiones en favoritos locales del navegador. No requiere cuenta ni envía datos a un servidor.
- **Atlas de Leonida:** índice temático de las regiones nombradas en el portal. No es un mapa oficial ni atribuye coordenadas o distancias.
- **Evidence Center:** muestra recuentos y filtros por estado editorial. Los titulares RSS automáticos permanecen «Pendiente de verificación»; las entradas revisadas pueden mostrarse como «Reportado» o «Confirmado» según su evidencia.
- **Cronología:** ordena las entradas existentes; no inventa hitos ni fechas.
- **Hangar 34:** estructura preparada para fichas de movilidad, sin inventar modelos, marcas o estadísticas.
- **Novedades desde tu última visita:** utiliza fechas del feed RSS y almacenamiento local del navegador.

## Pruebas

Ejecuta las pruebas de estructura desde la raíz del repositorio:

```bash
python -m unittest discover -s tests -v
```

Las pruebas comprueban anchors, IDs, navegación móvil, accesibilidad básica, reducción de movimiento, búsqueda, feed pendiente y ausencia de dependencias runtime externas.


## Motor editorial y datos estructurados

El contenido principal está separado de la presentación en catálogos versionados dentro de `data/`:

- `news.json`: noticias manuales con estado editorial y fuentes asociadas.
- `characters.json`: expedientes y relaciones navegables entre personajes.
- `regions.json`: seis regiones con capturas oficiales agrupadas y advertencia cartográfica. No contiene coordenadas ni reconstruye el mapa.
- `radios.json`: seis emisoras, locutores y arte oficial; los pódcasts bajo demanda se describen por separado y no se contabilizan como emisoras adicionales.
- `songs.json`: diez sencillos publicados de The Album y dos del Original Score by Justice. No expone tracklists filtrados.
- `sources.json`: registro común de procedencia y autoridad.
- `vehicles.json`: siete fichas destacadas con nombre e imagen oficial, distinguiendo beneficios de Ultimate Edition y Vintage Vice City Pack. No es el inventario completo del juego.
- `news-feed.json`: feed de titulares descubiertos automáticamente y entradas editoriales añadidas por el radar. Google News RSS permanece pendiente; las revisiones manuales conservan su clasificación y estado.

La presentación se separa en `assets/css/dossier34.css` y `assets/js/dossier34.js`. El motor carga los catálogos locales y reconstruye las fichas sin usar `innerHTML` con contenido editorial; el HTML conserva contenido de respaldo si un JSON no está disponible.

### Atlas regional y Hangar 34

El Atlas funciona como explorador visual de las seis colecciones regionales nombradas en la galería oficial. Cada expediente enlaza con las capturas de Rockstar y muestra cuántas imágenes aparecen bajo ese rótulo. No se colocan pines, coordenadas, distancias o límites territoriales hasta disponer de cartografía oficial verificable.

Hangar 34 muestra siete registros oficiales destacados: ’95 Grotti Cheetah, Dinka Enduro, Crest Kayak, Ganado Retro Build, Shitzu Squalo, ’67 Vapid Dominator Buggy y ’55 Vapid Stanier Sedan. Cada ficha informa si corresponde a un beneficio de Ultimate Edition o al Vintage Vice City Pack. El filtro distingue autos, motos, transporte acuático, todoterreno y modificaciones. La ausencia de una aeronave o de otro modelo en este índice no significa que no exista en el juego.


### Guía de Leonida

La guía incorpora seis módulos propios: historia y misiones, actividades y desafíos, coleccionables, secretos y easter eggs, trofeos y logros, y ruta del 100 %. Desde el 18/11/2026 incluye un directorio separado con 15 referencias de VGC y PowerPyx, además de siete consejos de arranque atribuidos a esos medios. Las referencias externas no cuentan como fichas verificadas ni como tareas del 100 %. Las seis categorías propias continúan publicando solo fichas verificadas directamente en la partida, con fuentes documentadas; las listas siguen vacías hasta que se reproduzcan los pasos en la versión del propietario. Se conserva una alerta de meditación potencialmente perdible como reporte incierto, oculta por defecto mediante el control de spoilers.

La interfaz incluye búsqueda, filtros por fichas verificadas o pendientes, contador de cobertura editorial y un interruptor de spoilers ocultos por defecto. La preferencia de spoilers se guarda localmente en el navegador. El contador de la guía mide el contenido editorial publicado, no el porcentaje de la partida.

Rockstar fijó el lanzamiento regional para el **19 de noviembre de 2026**, a medianoche local según la región: https://www.rockstargames.com/VI. Para PS Store España, el objetivo es 00:00 CET (19:00 del 18 de noviembre en RD). El portal es un proyecto fan independiente y no oficial.


### Separación de borradores privados y guía pública

Los borradores no verificados **no se guardan en este repositorio público**: ocultar una ficha con CSS/JavaScript no protege su JSON, que seguiría siendo descargable. La plantilla editable está en `docs/guide-drafts.template.json`; el archivo privado de trabajo debe residir en `private-guide/guide-drafts.json`, carpeta excluida por `.gitignore`, y mantenerse también en la Biblioteca privada del propietario. Nunca lo añadas a un commit.

`scripts/build_guide_public.py` genera `data/guide.json` usando una lista permitida de campos. Solo expone fichas con estado `verified`, visibilidad `public`, comprobación directa del juego posterior al 19/11/2026 y al menos una fuente HTTPS titulada. Antes de la fecha oficial bloquea toda publicación de fichas de juego. Los rumores, notas privadas, pistas no corroboradas y datos incompletos permanecen fuera del catálogo público; las notas internas nunca se exportan.

Consulta `docs/guide-publication-workflow.md` para el procedimiento y las pruebas. El contenido de spoilers verificado puede incorporarse, pero el interruptor sigue apagado por defecto.

### Centro de progreso — Completion System

La sección #progreso utiliza fichas de data/guide.json verificadas, aprobadas para publicación y marcadas explícitamente con trackable: true. data/progress.json define los seis módulos y declara que el catálogo aún está incompleto. El portal no presenta el 0 % ni el 100 % del juego como si existiera una lista total; el porcentaje visible, cuando haya tareas, se limita a las tareas verificadas publicadas.

El usuario puede buscar tareas, filtrar por estado y región, marcar elementos, crear objetivos personales y exportar/importar un respaldo JSON. Las marcas y objetivos se guardan solo en localStorage; no hay sincronización de servidor. Los objetivos personales no cuentan como requisitos del 100 %.

Consulta docs/progress-system.md para las reglas de cobertura, el respaldo y la privacidad.

### Conexión con Radar diario de GTA VI

El radar programado de las 08:15 (America/Santo_Domingo) tiene como destino editorial el feed data/news-feed.json de este repositorio. Si GitHub está disponible en esa ejecución, fusiona las nuevas entradas después de leer el SHA, conserva lo anterior y verifica la escritura. Si el conector no está disponible, entrega el bloque FEED_PATCH sin afirmar que publicó. El workflow RSS de GitHub corre a las 08:45 para evitar que dos escritores automáticos coincidan en la misma hora. Las entradas RSS externas permanecen pendientes de verificación.

### Validación de datos

```bash
python scripts/validate_catalog.py
python -m unittest discover -s tests -v
node --check assets/js/dossier34.js
```

Las noticias con estado `confirmado` requieren al menos una fuente primaria de Rockstar o Rockstar Support. Los artículos de medios se clasifican como reportes atribuidos a esos medios, no como comunicados directos de Rockstar.

## Qué automatiza y qué no

`scripts/update_news.py` consulta Google News RSS con búsquedas sobre Rockstar, GTA VI y filtraciones. Guarda titulares, extractos, fuentes y enlaces en `data/news-feed.json`. El workflow de GitHub Actions lo ejecuta diariamente y sube el feed al repositorio; la página lee todas las entradas válidas y conserva el estado editorial de cada ficha.

**Límite editorial deliberado:** las nuevas entradas de Google News RSS aparecen como **Pendiente de verificación**. El recolector no decide por sí solo si una filtración es cierta, no sustituye entradas revisadas y no recorta el historial editorial al límite de descubrimientos diarios. Deduplica por URL normalizada e ID y conserva las clasificaciones manuales. Comprueba cada historia en el Newswire de Rockstar, soporte oficial, PlayStation/Xbox o medios reconocidos antes de cambiarla a confirmada. Las nuevas funciones del juego, cambios de fecha, precios y detalles de ediciones deben contrastarse con la fuente primaria.

La publicación pública ya está activa. Este ZIP es una copia de respaldo del proyecto que también puedes usar para desplegarlo en otro alojamiento.

## Personajes y tratamiento del canon

La sección de personajes parte de los ocho perfiles que Rockstar muestra en su página Only in Leonida. Real Dimez se desglosa en dos apartados (Bae-Luxe y Roxy) para facilitar la consulta, pero se indica expresamente que Rockstar publica una historia conjunta y todavía no separa sus biografías. Lori Heder, DWNPLY y Macca the Gator aparecen como figuras relacionadas mencionadas oficialmente, sin inventarles una biografía que Rockstar no haya publicado. Las imágenes de personajes apuntan a archivos de arte/capturas alojados por Rockstar.

## Fuentes principales incluidas

- https://www.rockstargames.com/VI
- https://www.rockstargames.com/VI/only-in-leonida
- https://www.rockstargames.com/VI/media/artwork-wallpapers
- https://www.rockstargames.com/VI/media/screenshots
- https://www.rockstargames.com/VI/media/videos
- https://www.rockstargames.com/newswire/article/9k2a49ook82o57/pre-order-the-goodtime-state-vice-city-collection-now-while-supplies-l
- https://www.rockstargames.com/VI/music
- https://www.rockstargames.com/VI/media
- https://support.rockstargames.com/articles/4QfG4FmZCf5W1gS8jy4UVT/grand-theft-auto-vi-platform-editions-and-versions
- https://www.theguardian.com/games/ng-interactive/2026/nov/15/grand-theft-auto-vi-inside-rockstar-games

## Crédito y derechos

Creado y curado por **zensato34**. Proyecto independiente y no oficial, sin afiliación, licencia, autorización ni patrocinio de Rockstar Games o Take-Two Interactive. Grand Theft Auto, Grand Theft Auto VI, GTA, Vice City, Leonida, logotipos, personajes, música, capturas, vídeos, ilustraciones y demás materiales del juego pertenecen a Rockstar Games / Take-Two Interactive y a sus respectivos titulares. **© 2026 Rockstar Games. Todos los derechos reservados.** El portal no reclama propiedad sobre esos materiales. La política de Rockstar indica que, en general, Take-Two no se opone a ciertos usos no comerciales por fans, pero se reserva el derecho de retirar su material; revisa siempre la política vigente: https://support.rockstargames.com/articles/7bNaeoMFTV0iUDGhStTXvz/policy-on-posting-copyrighted-rockstar-games-material


## Aplicación instalable y uso sin conexión

LEONIDA FILES incluye un manifiesto PWA y un service worker para permitir la instalación desde navegadores compatibles. El botón «Instalar» aparece cuando el navegador ofrece el flujo nativo de instalación.

La primera visita requiere conexión para descargar la página, los catálogos y los recursos base. Después, el portal puede abrir su estructura, scripts, estilos y catálogos locales sin conexión. Las imágenes oficiales alojadas en Rockstar, las noticias externas y las actualizaciones del feed siguen requiriendo conexión; el service worker no descarga ni redistribuye esas imágenes.

El caché de catálogos utiliza estrategia de red primero y respaldo local: intenta obtener la versión reciente y recurre a la copia guardada cuando no hay conexión. Para recibir cambios publicados, vuelve a abrir el portal con Internet.


### Investigación oficial revisada el 18/11/2026

El catálogo de música pública incluye únicamente los sencillos que Rockstar muestra en sus páginas oficiales: diez de `The Album` y dos de `Original Score by Justice`. Rockstar anuncia 34 temas en `The Album` y 30 en el score; esas cifras no constituyen una lista oficial completa pista por pista. La documentación de investigación se conserva en `docs/research/2026-11-18-confirmed-gta-vi-facts.md`.

La sección de compra y datos técnicos recoge el espacio libre recomendado por PlayStation España (212 GB), la tabla de idiomas de esa página, el objetivo de rendimiento declarado por Rockstar y las funciones anunciadas para PS5 / PS5 Pro. Los 212 GB se describen como espacio libre requerido, no como tamaño exacto de descarga. Los 30 FPS se describen como objetivo declarado por Rockstar, no como benchmark.


La investigación de guías externas se documenta en `docs/research/2026-11-18-launch-guides-research.md`. PowerPyx enumera 557 vehículos en su base (277 modelos base y 280 especiales), pero especifica que la cuota del 100 % es escanear 200 de los 277 modelos base. Las cifras y advertencias de terceros se atribuyen a su autor y no se convierten en requisitos verificados por LEONIDA FILES.
