# LEONIDA FILES — Centro de control: ampliación y fuentes

**Fecha de revisión:** 18 de noviembre de 2026.

## Fuentes oficiales consultadas

- Rockstar Newswire — anuncio de precarga y objetivo técnico: https://www.rockstargames.com/newswire/article/89834o94713o21/pre-load-grand-theft-auto-vi-now
- Rockstar Support — horarios regionales: https://support.rockstargames.com/articles/29jV3Cv2cCgvwM1XgtMO5o/grand-theft-auto-vi-regional-pre-load-and-release-times-on-playstation-5-and-xbox-series-x-or-s
- Rockstar Support — ediciones y códigos: https://support.rockstargames.com/articles/4QfG4FmZCf5W1gS8jy4UVT/grand-theft-auto-vi-platform-editions-and-versions
- PlayStation España — ayuda GTA VI, idiomas y espacio de precarga: https://www.playstation.com/es-es/support/games/gta-vi-support/
- PlayStation Blog — funciones técnicas de PS5: https://blog.playstation.com/2026/11/10/pre-load-grand-theft-auto-vi-on-ps5-starting-today/
- PlayStation Store España — Standard: https://store.playstation.com/es-es/product/EP1004-PPSA01547_00-GTAVISTANDARD001/
- PlayStation Store España — Ultimate: https://store.playstation.com/es-es/product/EP1004-PPSA01547_00-GTAVIULTIMATE001/
- Estado PSN: https://status.playstation.com/
- Estado Xbox: https://support.xbox.com/en-US/xbox-live-status

## Reglas editoriales

- Rockstar declara el objetivo de 30 FPS para consolas. No debe mostrarse como resultado medido ni como garantía de estabilidad.
- Rockstar anuncia PSSR y sombras con trazado de rayos para PS5 Pro.
- PlayStation anuncia funciones del DualSense, respuesta háptica, gatillos adaptativos y audio Tempest 3D.
- PlayStation España indica 212 GB de espacio libre para preparar la precarga. La página distingue ese requisito del tamaño exacto descargado o instalado.
- Los precios observados en PS Store España el 18/11/2026 fueron 79,99 € para Standard y 99,99 € para Ultimate. Se expresan como referencias históricas, nunca como precios en tiempo real ni importes aplicables a todas las regiones.
- El registro `data/updates.json` se inicia vacío y solo recibe notas oficiales de versión atribuibles a Rockstar, PlayStation o Xbox. Un anuncio de precarga, incidencia de servicio, rumor o cobertura periodística no es un parche.
- El tema y el movimiento reducido se guardan en el mismo perfil local `lf34:player-profile`. No se transmite información del perfil.

## Funcionamiento

El archivo de actualizaciones valida HTTPS y dominio oficial antes de mostrar una ficha. Las entradas se construyen mediante nodos DOM y texto, no mediante HTML inyectado. El comparador de precios solo muestra los importes históricos cuando el perfil indica PS Store España; no extrapola cifras a otras regiones.
