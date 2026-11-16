# Sistema de progreso y checklist personal

## De dónde salen los requisitos

El sistema oficial de seguimiento lee solamente data/guide.json. Una ficha aparece como tarea marcable cuando está aprobada como pública, fue verificada directamente en el juego, contiene fuentes y tiene trackable: true. Las tareas pueden indicar region_id para filtrar coleccionables y actividades.

La guía todavía no está completa, por lo que data/progress.json mantiene catalog_complete: false y total_requirements: null. En ese estado, el portal no presenta 0 % ni un 100 % del juego. El porcentaje visible, cuando haya tareas, se limita a las tareas verificadas publicadas y siempre indicará si la cobertura del catálogo sigue incompleta.

## Guardado personal

Las casillas completadas y los objetivos personales se guardan en localStorage del navegador bajo la clave dossier34-progress-v1. No se envían a un servidor y no se sincronizan automáticamente entre dispositivos. Los objetivos personales son recordatorios propios, no requisitos verificados y no cuentan en el porcentaje oficial.

Usa Exportar respaldo antes de borrar datos del navegador o cambiar de dispositivo. El JSON se puede importar después en otro navegador. La importación reemplaza el progreso guardado en ese dispositivo, por lo que solicita confirmación.

## Fichas aptas para seguimiento

En el archivo privado de borradores añade explícitamente trackable: true si realmente corresponde a una tarea completables del juego. Usa region_id con uno de los seis identificadores regionales existentes solo si su región se ha verificado; de lo contrario déjalo en null. Se mantienen todas las demás condiciones de publicación: verificación en partida posterior al lanzamiento, estado verificado, aprobación pública y fuentes HTTPS. El generador exporta esos campos mediante lista permitida. Las notas privadas y fichas no aprobadas nunca llegan al catálogo público.
