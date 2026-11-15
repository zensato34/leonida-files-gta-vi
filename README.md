# LEONIDA FILES — GTA VI por zensato34

Sitio fan-made en español, adaptable a móviles, con animaciones de interfaz, contador en vivo hasta el lanzamiento del 19 de noviembre de 2026, barra de lectura, dossiers separados para Jason, Lucía, Cal, Boobie, Dre’Quan, Bae-Luxe, Roxy, Raul y Brian; sección de figuras relacionadas mencionadas por Rockstar; descripción editorial del proyecto fan y enlaces a recursos oficiales. Las imágenes integradas proceden del CDN oficial de Rockstar; no se generan imágenes con IA.

## Abrir ahora

Abre `index.html` con un navegador moderno. El contador usa la hora local del dispositivo y llega a las 00:00 del 19/11/2026; Rockstar Support indica que el juego se desbloquea a medianoche local en todas las regiones. Las animaciones respetan `prefers-reduced-motion`. Para que funcione el feed JSON al abrirlo localmente, ejecútalo con un servidor estático (por ejemplo, `python -m http.server 8000`) y visita `http://localhost:8000`.

## Publicarlo gratis con GitHub Pages

1. Crea un repositorio público nuevo en GitHub, por ejemplo `leonida-files-gta-vi`.
2. Sube **todo el contenido** de esta carpeta a la rama principal (`main`).
3. En el repositorio, abre **Settings → Pages** y selecciona **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
4. En **Settings → Actions → General**, permite que los workflows tengan permiso de lectura y escritura del contenido del repositorio.
5. En **Actions**, habilita los workflows si GitHub lo solicita. El workflow `Actualizar noticias de GTA VI` se ejecuta cada día a las 08:15 de República Dominicana (12:15 UTC) y también puede iniciarse manualmente.
6. GitHub Pages publicará la página en una URL del tipo `https://TU-USUARIO.github.io/leonida-files-gta-vi/`.

## Qué automatiza y qué no

`scripts/update_news.py` consulta Google News RSS con búsquedas sobre Rockstar, GTA VI y filtraciones. Guarda titulares, extractos, fuentes y enlaces en `data/news-feed.json`. El workflow de GitHub Actions lo ejecuta diariamente y sube el feed al repositorio; la página lee ese JSON y añade sus entradas a la sección de noticias.

**Límite editorial deliberado:** las entradas nuevas aparecen como **Pendiente de verificación**. El recolector RSS no tiene capacidad para decidir por sí solo si una filtración es cierta. Comprueba cada historia en el Newswire de Rockstar, soporte oficial, PlayStation/Xbox o medios reconocidos antes de cambiarla a confirmada. Las nuevas funciones del juego, cambios de fecha, precios y detalles de ediciones deben contrastarse con la fuente primaria.

La web pública no queda publicada por entregar este ZIP. Para tener una URL pública debes crear/conectar tu propio repositorio y activar GitHub Pages siguiendo los pasos anteriores.

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
