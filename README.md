# LEONIDA FILES — GTA VI por zensato34

Sitio fan-made en español, adaptable a móviles, con identidad cinematográfica de archivo clasificado, Atlas temático no cartográfico, centro de evidencias, cronología editorial, Hangar 34, búsqueda global, favoritos locales y resumen de novedades por visita. Conserva personajes, radios, música, ediciones, tiendas y media oficial de Rockstar. Las imágenes integradas proceden del CDN oficial; no se generan imágenes con IA.

## Abrir ahora

Abre `index.html` con un navegador moderno. El contador usa la hora local del dispositivo y llega a las 00:00 del 19/11/2026; Rockstar Support indica que el juego se desbloquea a medianoche local en todas las regiones. Las animaciones respetan `prefers-reduced-motion`. Para que funcione el feed JSON al abrirlo localmente, ejecútalo con un servidor estático (por ejemplo, `python -m http.server 8000`) y visita `http://localhost:8000`.

## Publicación actual

El sitio ya está publicado en GitHub Pages: **https://zensato34.github.io/leonida-files-gta-vi/**. El repositorio público es `zensato34/leonida-files-gta-vi`, en la rama `main`, carpeta `/ (root)`. GitHub Pages está configurado con **Deploy from a branch**.

Para actualizarlo, realiza los cambios en `main`; GitHub Pages inicia una nueva publicación automáticamente. El workflow de noticias dispone de permisos de escritura sobre el contenido del repositorio y se ejecuta cada día a las 08:15 de República Dominicana (12:15 UTC).


## Interfaz Dossier 34

- **Búsqueda global:** usa el botón «Buscar archivo» o `Ctrl/⌘ + K`; también puedes abrirla con `/` cuando no estés escribiendo.
- **Mi archivo:** guarda noticias, personajes, emisoras y regiones en favoritos locales del navegador. No requiere cuenta ni envía datos a un servidor.
- **Atlas de Leonida:** índice temático de las regiones nombradas en el portal. No es un mapa oficial ni atribuye coordenadas o distancias.
- **Evidence Center:** muestra recuentos y filtros por estado editorial. Los titulares automáticos mantienen el estado «Pendiente de verificación».
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
- `radios.json`: emisoras, locutores y arte oficial.
- `songs.json`: 34 pistas con estado individual: lanzamiento oficial o pista reportada.
- `sources.json`: registro común de procedencia y autoridad.
- `vehicles.json`: siete fichas destacadas con nombre e imagen oficial, distinguiendo beneficios de Ultimate Edition y Vintage Vice City Pack. No es el inventario completo del juego.
- `news-feed.json`: feed separado de titulares automáticos, siempre pendientes de verificación.

La presentación se separa en `assets/css/dossier34.css` y `assets/js/dossier34.js`. El motor carga los catálogos locales y reconstruye las fichas sin usar `innerHTML` con contenido editorial; el HTML conserva contenido de respaldo si un JSON no está disponible.

### Atlas regional y Hangar 34

El Atlas funciona como explorador visual de las seis colecciones regionales nombradas en la galería oficial. Cada expediente enlaza con las capturas de Rockstar y muestra cuántas imágenes aparecen bajo ese rótulo. No se colocan pines, coordenadas, distancias o límites territoriales hasta disponer de cartografía oficial verificable.

Hangar 34 muestra siete registros oficiales destacados: ’95 Grotti Cheetah, Dinka Enduro, Crest Kayak, Ganado Retro Build, Shitzu Squalo, ’67 Vapid Dominator Buggy y ’55 Vapid Stanier Sedan. Cada ficha informa si corresponde a un beneficio de Ultimate Edition o al Vintage Vice City Pack. El filtro distingue autos, motos, transporte acuático, todoterreno y modificaciones. La ausencia de una aeronave o de otro modelo en este índice no significa que no exista en el juego.


### Guía de Leonida

La guía incorpora seis módulos preparados: historia y misiones, actividades y desafíos, coleccionables, secretos y easter eggs, trofeos y logros, y ruta del 100 %. El índice vive en `data/guide.json`; cada módulo mantiene su estado y una lista de fichas que solo se publicará tras verificar la información en la versión final. Antes del lanzamiento, las listas permanecen vacías deliberadamente: no se inventan recorridos, ubicaciones, requisitos ni trofeos.

La interfaz incluye búsqueda, filtros por fichas verificadas o pendientes, contador de cobertura editorial y un interruptor de spoilers ocultos por defecto. La preferencia de spoilers se guarda localmente en el navegador. El contador de la guía mide el contenido editorial publicado, no el porcentaje de la partida.

Rockstar mantiene como fecha oficial de lanzamiento el **19 de noviembre de 2026**: https://www.rockstargames.com/VI. El portal es un proyecto fan independiente y no oficial.


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

`scripts/update_news.py` consulta Google News RSS con búsquedas sobre Rockstar, GTA VI y filtraciones. Guarda titulares, extractos, fuentes y enlaces en `data/news-feed.json`. El workflow de GitHub Actions lo ejecuta diariamente y sube el feed al repositorio; la página lee ese JSON y añade sus entradas a la sección de noticias.

**Límite editorial deliberado:** las entradas nuevas aparecen como **Pendiente de verificación**. El recolector RSS no tiene capacidad para decidir por sí solo si una filtración es cierta. Comprueba cada historia en el Newswire de Rockstar, soporte oficial, PlayStation/Xbox o medios reconocidos antes de cambiarla a confirmada. Las nuevas funciones del juego, cambios de fecha, precios y detalles de ediciones deben contrastarse con la fuente primaria.

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
