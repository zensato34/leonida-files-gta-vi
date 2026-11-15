# LEONIDA FILES — DOSSIER 34: rediseño cinematográfico

## Intención
Convertir el portal fan ya publicado en una experiencia editorial propia: una central de inteligencia de Leonida con el pulso visual de Vice City, útil para consultar GTA VI en español y claramente independiente de Rockstar Games. La meta no es parecer una web oficial, sino darle a zensato34 una identidad reconocible y una navegación mucho más profunda.

## Aprobación y dirección
El propietario pidió ejecutar la propuesta completa. Se adopta la recomendación comunicada: fusión de archivo clasificado + Vice City cinematográfico, movimiento cinematográfico/elegante y alcance completo.

## Objetivos
- Renovar identidad, navegación, portada, paneles y jerarquía visual.
- Mantener todas las secciones y los datos existentes: noticias, mundo, personajes, radios, música, ediciones, tiendas, media, proyecto y fuentes.
- Incorporar Atlas editorial de regiones, Evidence Center, cronología generada desde noticias, acceso rápido global, favoritos locales y señal de novedades desde la última visita.
- Ofrecer un índice Hangar 34 para movilidad con un estado editorial transparente, sin inventar modelos ni especificaciones.
- Usar movimiento con propósito, navegación por teclado, soporte táctil, diseño mobile-first y respeto a `prefers-reduced-motion`.
- Mantener la autoría exactamente como `zensato34`.

## Fuera de alcance
- No crear imágenes con IA ni reemplazar arte oficial de Rockstar.
- No copiar logos ni presentar el sitio como oficial, afiliado o patrocinado.
- No confirmar rumores automáticamente, ni convertir titulares RSS en hechos.
- No inventar cartografía, coordenadas, localizaciones, vehículos, fechas, precios, canciones o estadísticas.
- No introducir dependencias externas, frameworks, trackers, servicios de pago ni reproducción de audio protegido.
- No cambiar el workflow o el horario del recolector RSS, salvo actualizar su documentación.

## Enfoques considerados
1. Retocar solo colores y animaciones: menor riesgo, pero deja la navegación y la utilidad casi iguales.
2. Rehacer el portal con un framework: más flexibilidad, pero innecesario para una página estática y añade build/dependencias.
3. Evolucionar el HTML/CSS/JS estático que ya sirve GitHub Pages: conserva el contenido y despliegue, permite una identidad fuerte y mantiene carga ligera. **Elegido** por el mejor equilibrio entre identidad, compatibilidad, rendimiento y mantenimiento.

## Diseño elegido
- Paleta: grafito `#0A0E12`, petróleo `#16343A`, turquesa `#69CFC3`, ámbar `#F0A45C`, coral `#F07876` y marfil `#EAE1CF`.
- Tipografía de sistema con escala editorial; monospace para metadatos, número de expediente y estado de señal.
- Portada cinematográfica con imagen ya oficial, capas de atmósfera ligeras y parallax muy sutil solo en dispositivos con puntero.
- Intro de acceso de una sola vez, breve, saltable y omitida con movimiento reducido.
- Barra de estado / navegación reorganizada con búsqueda global tipo command palette.
- Atlas de Leonida como índice temático de las seis regiones ya descritas; sus relaciones visuales serán editoriales, no una cartografía ni una afirmación de posiciones reales.
- Evidence Center con etiquetas y contadores calculados desde las noticias existentes, incluyendo el estado obligatorio “Pendiente de verificación” del feed automático.
- Cronología construida dinámicamente desde los artículos ya existentes, no desde hechos nuevos.
- Hangar 34 como índice de categorías de movilidad en preparación; no mostrará vehículos o fichas hasta que exista material oficial identificable.
- Favoritos guardados localmente en el navegador; la búsqueda y los filtros funcionarán sin cuenta ni backend.
- Novedades desde la última visita calculadas solo con fechas de entradas del feed automático.
- Movimiento: transiciones suaves, escaneo discreto, revelado al desplazarse, profundidad de tarjetas y progreso de lectura; sin vídeo de fondo ni WebGL.
- Diseño responsive y accesible: foco visible, etiquetas accesibles, controles táctiles grandes, contraste legible, Escape para cerrar overlays, scroll y animaciones reducidas cuando el sistema lo pida.

## Restricciones y decisiones de implementación
- Mantener GitHub Pages, archivos estáticos y el contenido actual.
- No exponer claves, credenciales ni tokens en cliente.
- No usar `innerHTML` con texto procedente del RSS; continuar creando nodos con `textContent`.
- Validar enlaces externos como HTTPS y mantener `rel="noopener"`.
- Añadir pruebas estáticas con la biblioteca estándar de Python y smoke-checks de HTML/JS.
- Trabajar en una rama separada; solo integrar/publicar después de revisar el resultado.
