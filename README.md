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
