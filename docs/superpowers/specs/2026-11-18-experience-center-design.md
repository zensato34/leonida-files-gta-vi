# LEONIDA FILES — centro de experiencia y evolución visual

**Fecha:** 18 de noviembre de 2026  
**Estado:** aprobado por delegación del propietario («adelante, hazlo»).  
**Proyecto:** `zensato34/leonida-files-gta-vi`

## Intención

Evolucionar LEONIDA FILES desde un archivo editorial hacia un centro de consulta práctica para GTA VI, manteniendo su identidad fan independiente, su política de evidencias y su arquitectura estática. Los módulos deben ayudar a resolver problemas comunes de lanzamiento, consultar actualizaciones oficiales, entender las características técnicas anunciadas, guardar un perfil de jugador en el navegador y comparar las ediciones sin empujar una compra.

## Enfoque elegido

Conservar HTML, CSS, JavaScript sin framework, catálogos JSON locales y GitHub Pages. Añadir los módulos como recursos separados, no reescribir la aplicación ni introducir servicios de backend. Esto mantiene el coste de mantenimiento bajo, el uso offline razonable y la privacidad del visitante.

## Objetivos

- Centro de soporte con pasos iniciales no destructivos y enlaces a Rockstar, PlayStation y Xbox.
- Registro estructurado de notas de versión. Solo se publicarán entradas respaldadas por fuentes oficiales; comienza vacío hasta disponer de una nota oficial de parche.
- Laboratorio técnico que distingue anuncios de Rockstar/PlayStation de mediciones independientes. No inventa FPS, resolución, tamaño exacto de descarga ni benchmarks.
- Perfil local opcional para plataforma, región de tienda, edición e idioma, con preferencias visuales y de spoilers. No usa cuenta ni transmite datos.
- Comparador interactivo Standard / Ultimate con precios observados en PS Store España el 18/11/2026 claramente fechados, enlaces de consulta y aviso de que no son precios en tiempo real.
- Rediseño visual tipo archivo cinematográfico Vice City/Leonida: tipografía display, paleta de atardecer y noche, tarjetas visuales con imágenes oficiales existentes, mayor jerarquía, microinteracciones y animaciones breves.
- Mantener accesibilidad, carga móvil, PWA, modo offline básico y compatibilidad con movimiento reducido.

## No objetivos / anti-objetivos

- No crear guías con las partidas del propietario ni convertir contenido de terceros en fichas propias verificadas.
- No añadir autenticación, perfiles remotos, analytics, APIs pagadas ni backend.
- No presentar RSS, filtraciones, precios antiguos o afirmaciones de medios como hechos oficiales.
- No afirmar que la web detecta descargas, licencias, rendimiento o estado de PS5/Xbox automáticamente.
- No añadir animación constante, efectos pesados, autoplay de audio/video ni imágenes generadas por IA presentadas como material oficial.
- No modificar la identidad editorial, marca «zensato34» en minúsculas ni el aviso de independencia.

## Arquitectura y seguridad

- `index.html`: navegación, secciones accesibles y enlaces externos.
- `assets/js/experience34.js`: perfil local, filtrado de soporte, comparador y renderizado defensivo del historial.
- `assets/css/experience34.css`: temas, tipografía, composición y motion respetando `prefers-reduced-motion` y control local de movimiento.
- `data/updates.json`: registro versionado de parches oficiales; acepta únicamente URL HTTPS de dominios oficiales previstos.
- `service-worker.js`: cache versionada con los nuevos recursos locales.
- `tests/test_experience_center.py`: contrato estructural, de privacidad, datos, fuentes, accesibilidad y PWA.

El texto de catálogos se insertará mediante `textContent` / nodos DOM, nunca como HTML ejecutable. El perfil se limita a claves permitidas y se guarda en `localStorage` con manejo de errores. Los enlaces externos tendrán destinos HTTPS y `rel="noopener noreferrer"`.

## Contenido factual inicial

La documentación oficial revisada el 18/11/2026 establece PS5 y Xbox Series X|S como plataformas anunciadas, un objetivo de 30 FPS declarado por Rockstar, PSSR y sombras con trazado de rayos para PS5 Pro, y 212 GB de espacio libre indicado por PlayStation España para preparar la precarga. Los 212 GB no se presentan como tamaño exacto de descarga y los 30 FPS no se presentan como benchmark. Las características de DualSense y Tempest 3D se atribuyen a PlayStation. Los precios observados en PS Store España fueron 79,99 € Standard y 99,99 € Ultimate el 18/11/2026; se muestran solo como referencia fechada.

## Apariencia propuesta

- Base carbón/petróleo con planos translúcidos.
- Acentos turquesa, coral y ámbar inspirados en neón de Vice City, sin saturar todos los elementos.
- Encabezados condensados y titulares de alta personalidad, cuerpo de lectura neutral.
- Imágenes de Rockstar ya usadas en el archivo, con carga diferida y texto alternativo.
- Aparición por scroll, brillos sutiles y desplazamientos hover cortos. Sin animación de fondo intensa ni movimiento forzado.

## Criterios de aceptación

1. Las cinco secciones nuevas son navegables y aparecen en la búsqueda global del portal.
2. El soporte orienta a fuentes oficiales y no propone borrar partidas, cambiar la región de cuenta ni recomprar el juego.
3. El registro de actualizaciones se muestra vacío hasta recibir notas oficiales válidas.
4. El laboratorio diferencia objetivo anunciado, función de plataforma y benchmark medido.
5. El perfil se conserva en el navegador, se puede restablecer y no se transmite.
6. El comparador cambia su resultado al cambiar la selección y fecha explícitamente los precios.
7. Los nuevos archivos se precargan en la PWA y el caché sube de versión.
8. Todas las pruebas existentes y nuevas pasan; scripts modificados superan `node --check`.
