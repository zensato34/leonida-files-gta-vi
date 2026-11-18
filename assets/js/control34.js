(()=>{'use strict';
const root=document.getElementById('centro-control');if(!root)return;
const $=id=>document.getElementById(id);
const form=$('controlProfileForm');
const fields={platform:$('controlPlatform'),region:$('controlRegion'),edition:$('controlEdition'),language:$('controlLanguage')};
const status=$('controlProfileStatus'),summary=$('controlProfileSummary'),regionHint=$('controlRegionHint');
const key='lf34:player-profile';
const defaults={platform:'ps5',region:'ps-es',edition:'ultimate',language:'es'};
const labels={
 platform:{ps5:'PlayStation 5',ps5pro:'PlayStation 5 Pro',xboxx:'Xbox Series X',xboxs:'Xbox Series S',other:'Otra plataforma'},
 region:{'ps-es':'PlayStation Store España / Europa','ps-us':'PlayStation Store Estados Unidos','xbox':'Microsoft Store / Xbox','other':'Otra región / no lo sé'},
 edition:{standard:'Standard Edition',ultimate:'Ultimate Edition',unknown:'No estoy seguro'},
 language:{es:'Español',en:'English',other:'Otro idioma'}
};
function readProfile(){try{const raw=localStorage.getItem(key);if(!raw)return null;const parsed=JSON.parse(raw);return parsed&&typeof parsed==='object'?parsed:null}catch(_){return null}}
function getProfile(){return Object.fromEntries(Object.entries(fields).map(([k,node])=>[k,node?.value||defaults[k]]))}
function updateSummary(){
 const p=getProfile();
 if(summary){summary.replaceChildren();const strong=document.createElement('strong');strong.textContent=(labels.platform[p.platform]||labels.platform.ps5)+' · '+(labels.edition[p.edition]||labels.edition.unknown);const detail=document.createElement('span');detail.textContent=(labels.region[p.region]||labels.region.other)+' · Idioma: '+(labels.language[p.language]||labels.language.other);summary.append(strong,detail)}
 if(regionHint){regionHint.textContent=p.region==='ps-es'?'Perfil regional: PS Store España / Europa. La región de la cuenta determina la tienda y sus condiciones; tu ubicación física no cambia la región de la cuenta.':p.region==='ps-us'?'Perfil regional: PS Store Estados Unidos. Comprueba siempre la ficha de esa tienda y la región de cualquier código.':p.region==='xbox'?'Perfil regional: Microsoft Store / Xbox. Consulta la disponibilidad y las condiciones que muestre tu propia tienda.':'No hay una región definida. Comprueba la tienda donde se realizó la compra antes de canjear códigos o buscar contenido.'}
}
const saved=readProfile();Object.entries(fields).forEach(([k,node])=>{if(node)node.value=(saved&&labels[k]?.[saved[k]])?saved[k]:defaults[k]});
form?.addEventListener('submit',event=>{event.preventDefault();const p=getProfile();try{localStorage.setItem(key,JSON.stringify(p));if(status)status.textContent='Perfil guardado en este navegador.'}catch(_){if(status)status.textContent='El navegador no permitió guardar el perfil. Los ajustes siguen activos hasta cerrar esta página.'}updateSummary();renderSupport();renderEdition()});
form?.addEventListener('reset',()=>{setTimeout(()=>{try{localStorage.removeItem(key)}catch(_){}if(status)status.textContent='Perfil local restablecido.';updateSummary();renderSupport();renderEdition()},0)});
Object.values(fields).forEach(node=>node?.addEventListener('change',()=>{updateSummary();renderSupport();renderEdition()}));
updateSummary();
const issue=$('supportProblem'),result=$('supportResult');
const commonSources=[
 {label:'Soporte de PlayStation · descargas',url:'https://www.playstation.com/en-us/support/games/troubleshoot-downloaded-playstation-game/'},
 {label:'Estado de PlayStation Network',url:'https://status.playstation.com/'},
 {label:'Xbox Support',url:'https://support.xbox.com/'},
 {label:'Estado de Xbox',url:'https://support.xbox.com/en-US/xbox-live-status'},
 {label:'Rockstar Support',url:'https://support.rockstargames.com/'}
];
const issues={
 download:{title:'La descarga no inicia o se queda detenida',intro:'Antes de borrar el juego, revisa la cola, el servicio de la plataforma, la conexión y el espacio libre. Sigue primero las comprobaciones menos invasivas.',ps:['En PS5, abre Descargas/Cargas desde el centro de control y prueba Pausar y Reanudar.','Comprueba el estado de PlayStation Network y la conexión de la consola.','Revisa Ajustes > Almacenamiento y confirma que hay espacio libre suficiente.','Comprueba que el sistema de PS5 esté actualizado. Si persiste, sigue el procedimiento oficial de PlayStation antes de cancelar y volver a descargar.'],xbox:['Comprueba el estado de Xbox antes de cambiar la instalación.','Abre Mis juegos y aplicaciones > Administrar > Cola y revisa si la descarga está pausada o esperando otra instalación.','Comprueba el espacio disponible y la conexión de red.','Reinicia la consola y vuelve a revisar la cola. Si persiste, consulta Xbox Support.']},
 locked:{title:'El juego aparece con candado o no reconoce la compra',intro:'La primera comprobación es la cuenta que hizo la compra o canjeó el código. No compres el juego otra vez sin verificar la licencia y el historial.',ps:['Confirma que has iniciado sesión en la cuenta de PlayStation que compró o canjeó GTA VI.','Comprueba el historial de transacciones y la biblioteca de esa misma cuenta.','En PS5: Ajustes > Usuarios y cuentas > Otros > Restaurar licencias. PlayStation indica que este proceso no afecta a tus datos.','Comprueba el estado de PSN y, si el problema continúa, contacta con PlayStation Support con el código de error y una captura.'],xbox:['Confirma que usas la cuenta Microsoft que adquirió o canjeó el juego.','Comprueba el historial de pedidos y la biblioteca de esa cuenta.','Revisa el estado de Xbox y reinicia la consola.','Si continúa bloqueado, consulta Xbox Support antes de comprar de nuevo.']},
 ultimate:{title:'No aparecen todos los beneficios de Ultimate',intro:'No asumas que cada beneficio debe aparecer como una descarga separada o estar disponible desde el primer minuto. Comprueba la edición, los complementos y las condiciones de desbloqueo.',ps:['Verifica la edición adquirida en el historial de transacciones de la cuenta correcta.','Abre la ficha del juego en tu biblioteca y revisa la sección de complementos disponibles.','Cierra el juego por completo y vuelve a iniciarlo después de instalar los complementos que correspondan.','Algunos beneficios pueden depender del progreso de la historia. Consulta la guía externa atribuida y la ficha de Rockstar Support.'],xbox:['Confirma que tu cuenta posee Ultimate Edition y revisa el historial de pedidos.','En Mis juegos y aplicaciones, abre Administrar juego y complementos para comprobar el contenido asociado.','Instala los complementos disponibles y reinicia el juego por completo.','Comprueba dentro del juego si el beneficio depende de avanzar en la historia.']},
 update:{title:'No aparece una actualización',intro:'La ausencia de una actualización no demuestra por sí sola que la instalación esté dañada. Verifica primero que exista una versión publicada para tu plataforma.',ps:['En la pantalla de inicio, selecciona GTA VI, pulsa OPTIONS y elige Buscar actualización.','Comprueba Descargas/Cargas por si la actualización está en cola o pausada.','Verifica conexión, espacio disponible y software del sistema.','Consulta Rockstar Newswire y el estado de PSN para confirmar que la actualización esté anunciada.'],xbox:['Comprueba Mis juegos y aplicaciones > Administrar > Actualizaciones.','Revisa la cola y el espacio libre disponible.','Comprueba el estado de Xbox y reinicia la consola.','Verifica que Rockstar haya publicado una actualización para tu plataforma antes de asumir que falta.']},
 size:{title:'El tamaño de descarga no coincide con otra cifra',intro:'Distingue el espacio libre requerido, el tamaño de descarga y el tamaño instalado. Son medidas distintas y pueden cambiar con paquetes o actualizaciones.',ps:['Consulta el espacio libre requerido en la ficha del producto de PlayStation Store desde tu consola.','Compara el espacio libre disponible en Ajustes > Almacenamiento, no solo el número que muestra la cola.','No borres paquetes ni reinstales únicamente porque una cifra sea distinta de una publicación externa.','Si la instalación muestra un error, anota el código y consulta el soporte oficial.'],xbox:['Revisa el espacio de almacenamiento disponible en la consola.','Consulta la cola de instalación y la información del juego en Administrar juego y complementos.','No tomes una cifra de terceros como tamaño universal: puede corresponder a otra versión o actualización.','Si aparece un código de error, consulta Xbox Support.']},
 language:{title:'El idioma o las voces no son los esperados',intro:'La disponibilidad de idiomas puede variar entre interfaz, textos y doblaje. Comprueba los idiomas enumerados en la ficha de la tienda correspondiente a tu cuenta.',ps:['Abre la ficha de GTA VI en la misma región donde realizaste la compra y revisa los idiomas compatibles.','Comprueba el idioma de la consola y los ajustes disponibles dentro del juego.','No confundas el idioma de los textos con el idioma de las voces.','Si la ficha oficial no aclara tu caso, consulta Rockstar Support.'],xbox:['Revisa los idiomas de la ficha de GTA VI en Microsoft Store para tu región.','Comprueba el idioma y la ubicación de la consola.','Distingue los idiomas de interfaz, subtítulos y audio.','Consulta Rockstar Support si el idioma anunciado no aparece.']}
};
function make(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el}
function renderSupport(){
 if(!issue||!result)return;const item=issues[issue.value]||issues.download;const p=getProfile();const steps=(p.platform==='xboxx'||p.platform==='xboxs')?item.xbox:item.ps;
 result.replaceChildren();result.append(make('span','control-chip',labels.platform[p.platform]||'Plataforma seleccionada'));
 result.append(make('h4','',item.title));result.append(make('p','',item.intro));
 const list=make('ol','');steps.forEach(line=>list.append(make('li','',line)));result.append(list);
 const links=make('div','support-links');
 const chosen=(p.platform==='xboxx'||p.platform==='xboxs')?commonSources.filter(x=>['Xbox Support','Estado de Xbox','Rockstar Support'].includes(x.label)):commonSources.filter(x=>['Soporte de PlayStation · descargas','Estado de PlayStation Network','Rockstar Support'].includes(x.label));
 if(issue.value==='locked'&&(p.platform==='ps5'||p.platform==='ps5pro'))chosen.push({label:'Restaurar licencias · guía oficial',url:'https://www.playstation.com/es-es/support/games/restore-licences-playstation/'});
 if(issue.value==='ultimate')chosen.push({label:'Guía externa · beneficios Ultimate',url:'https://www.videogameschronicle.com/guide/gta-6-ultimate-edition-how-to-claim-your-ultimate-edition-benefits-in-gta-6/'});
 chosen.forEach(source=>{const a=make('a','',source.label+' ↗');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';links.append(a)});result.append(links);
}
issue?.addEventListener('change',renderSupport);renderSupport();
const editionSelect=$('editionQuickSelect'),editionBox=$('editionQuickview');
function renderEdition(){
 if(!editionSelect||!editionBox)return;const choice=editionSelect.value||getProfile().edition;editionBox.replaceChildren();
 const h=make('div','edition-label',choice==='ultimate'?'ULTIMATE EDITION':choice==='standard'?'STANDARD EDITION':'COMPARACIÓN');
 const p=make('p','',choice==='ultimate'?'Incluye el juego base y el paquete Ultimate Edition Upgrade. Sus beneficios adicionales pueden tener condiciones o desbloquearse durante el progreso; comprueba cada elemento en el listado oficial.':choice==='standard'?'Incluye el juego base. No presupongas que contiene los beneficios exclusivos del paquete Ultimate Edition Upgrade.':'Elige una edición para ver su resumen y consulta el comparador completo más abajo.');
 const ul=make('ul','');
 (choice==='ultimate'?['Juego base GTA VI.','Contenido adicional de Ultimate Edition según la ficha de Rockstar.','Algunos beneficios pueden aparecer mediante desbloqueos de progresión, no necesariamente como descargas independientes.']:choice==='standard'?['Juego base GTA VI.','No incluye automáticamente los artículos exclusivos del paquete Ultimate Edition Upgrade.','Los beneficios de reserva, cuando corresponden, dependen de la compra y sus condiciones.']:['La ficha de cada tienda es la referencia para lo que has comprado.','Revisa el historial de transacciones y la lista oficial de contenidos.']).forEach(x=>ul.append(make('li','',x)));
 editionBox.append(h,p,ul);
}
editionSelect?.addEventListener('change',renderEdition);renderEdition();
})();