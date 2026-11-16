(()=>{'use strict';
const root=document.getElementById('progreso');if(!root)return;const $=id=>document.getElementById(id);
const el={search:$('progressSearch'),region:$('progressRegionFilter'),status:$('progressStatusFilter'),categories:$('progressCategories'),statusText:$('progressStatus'),empty:$('progressEmpty'),percent:$('trackedPercent'),bar:$('trackedBar'),done:$('trackedDone'),total:$('trackedTotal'),coverage:$('trackedCoverage'),goalCount:$('personalGoalCount'),goalSummary:$('personalGoalSummary'),goalForm:$('personalGoalForm'),goalCategory:$('personalGoalCategory'),goalTitle:$('personalGoalTitle'),goalList:$('personalGoalList'),export:$('exportProgress'),import:$('importProgress'),importFile:$('importProgressFile'),backupStatus:$('progressBackupStatus'),guideSpoilers:$('guideSpoilers'),explorerMode:$('explorerMode'),completistMode:$('completistMode'),discoveryForm:$('privateDiscoveryForm'),discoveryCategory:$('privateDiscoveryCategory'),discoveryRegion:$('privateDiscoveryRegion'),discoveryTitle:$('privateDiscoveryTitle'),discoveryNote:$('privateDiscoveryNote'),discoveryEvidence:$('privateDiscoveryEvidence'),discoverySource:$('privateDiscoverySource'),discoverySpoiler:$('privateDiscoverySpoiler'),discoveryCount:$('privateDiscoveryCount'),discoveryList:$('privateDiscoveryList'),atlasPointForm:$('atlasPointForm'),atlasPointRegion:$('atlasPointRegion'),atlasPointType:$('atlasPointType'),atlasPointStatus:$('atlasPointStatus'),atlasPointTitle:$('atlasPointTitle'),atlasPointDetails:$('atlasPointDetails'),atlasPointSource:$('atlasPointSource'),atlasPointSpoiler:$('atlasPointSpoiler'),atlasPointCount:$('atlasPointCount'),atlasPointSearch:$('atlasPointSearch'),atlasPointFilterRegion:$('atlasPointFilterRegion'),atlasPointFilterStatus:$('atlasPointFilterStatus'),atlasPointList:$('atlasPointList'),garageSearch:$('garageSearch'),garageFilter:$('garageFilter'),garageCatalog:$('garageCatalog'),garageTotal:$('garageTotal'),garageWanted:$('garageWanted'),garageOwned:$('garageOwned'),sessionForm:$('gameSessionForm'),sessionDate:$('gameSessionDate'),sessionMinutes:$('gameSessionMinutes'),sessionCharacter:$('gameSessionCharacter'),sessionRegion:$('gameSessionRegion'),sessionTitle:$('gameSessionTitle'),sessionNotes:$('gameSessionNotes'),sessionSpoiler:$('gameSessionSpoiler'),sessionCount:$('gameSessionCount'),sessionDuration:$('gameSessionDuration'),sessionLatest:$('gameSessionLatest'),sessionSearch:$('gameSessionSearch'),sessionCharacterFilter:$('gameSessionCharacterFilter'),sessionRegionFilter:$('gameSessionRegionFilter'),sessionList:$('gameSessionList')};
const storageKey='dossier34-progress-v1',spoilerKey='dossier34-guide-spoilers';
const fallbackCategories=[{id:'story-missions',title:'Historia y misiones',description:'Seguimiento de misiones verificadas.'},{id:'activities',title:'Actividades y desafíos',description:'Actividades secundarias y desafíos verificados.'},{id:'collectibles',title:'Coleccionables',description:'Coleccionables con ubicación contrastada.'},{id:'secrets',title:'Secretos y easter eggs',description:'Hallazgos verificados.'},{id:'trophies',title:'Trofeos y logros',description:'Trofeos confirmados.'},{id:'completion',title:'Ruta del 100 %',description:'Requisitos globales confirmados.'}];
let state={checked:{},customGoals:[],privateDiscoveries:[],atlasPoints:[],garageVehicles:[],gameSessions:[]},meta={catalog_complete:false,total_requirements:null},categories=[],regions=[],tasks=[],vehicleRecords=[],spoilersVisible=false;
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function make(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=String(text);return node}
function say(message){el.statusText.textContent=message}
function safeSave(){try{localStorage.setItem(storageKey,JSON.stringify({version:5,checked:state.checked,customGoals:state.customGoals,privateDiscoveries:state.privateDiscoveries,atlasPoints:state.atlasPoints,garageVehicles:state.garageVehicles,gameSessions:state.gameSessions}));el.backupStatus.textContent='Guardado localmente en este navegador.';return true}catch(_){el.backupStatus.textContent='El navegador no permitió guardar. Exporta el respaldo y comprueba el almacenamiento del sitio.';return false}}
function normalizeDiscovery(item){
 if(!item||typeof item!=='object'||Array.isArray(item))return null;
 const categories=fallbackCategories.map(cat=>cat.id),regionIds=['vice-city','leonida-keys','grassrivers','port-gellhorn','ambrosia','mount-kalaga-national-park'];
 const types=['gameplay_observation','own_screenshot_video','official_source','media_report','rumor'];
 const title=typeof item.title==='string'?item.title.trim().slice(0,120):'',note=typeof item.note==='string'?item.note.trim().slice(0,2400):'',category=categories.includes(item.category)?item.category:'';
 if(!title||!note||!category)return null;
 let source='';if(typeof item.source_url==='string'&&item.source_url.trim()){try{const parsed=new URL(item.source_url.trim());if(parsed.protocol==='https:')source=parsed.href.slice(0,500)}catch(_){}}
 return {id:typeof item.id==='string'?item.id.slice(0,90):makeId(),title,note,category,region_id:regionIds.includes(item.region_id)?item.region_id:null,evidence_type:types.includes(item.evidence_type)?item.evidence_type:'gameplay_observation',source_url:source,spoiler:item.spoiler===true,created_at:typeof item.created_at==='string'?item.created_at:new Date().toISOString(),status:'pending_review'};
}
const vehicleStatuses=['wanted','owned'];
function normalizeGarageVehicles(items){
 const valid=new Map();if(!Array.isArray(items))return [];
 items.slice(0,1000).forEach(item=>{
  if(!item||typeof item.id!=='string'||item.id.length>120||!vehicleStatuses.includes(item.status))return;
  valid.set(item.id,{id:item.id,status:item.status});
 });
 return [...valid.values()].slice(0,500);
}
function safeOfficialImage(value){
 try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='www.rockstargames.com'&&url.pathname.startsWith('/VI/_next/static/media/')?url.href:''}catch(_){return ''}
}
function renderGarage(){
 if(!el.garageCatalog)return;
 const query=normalize(el.garageSearch.value),filter=el.garageFilter.value;
 const statuses=new Map(state.garageVehicles.map(item=>[item.id,item.status]));
 const wanted=state.garageVehicles.filter(item=>item.status==='wanted').length,owned=state.garageVehicles.filter(item=>item.status==='owned').length;
 el.garageTotal.textContent=String(vehicleRecords.length);el.garageWanted.textContent=String(wanted);el.garageOwned.textContent=String(owned);
 el.garageCatalog.replaceChildren();
 if(!vehicleRecords.length){el.garageCatalog.append(make('p','progress-loading','El catálogo de vehículos no está disponible ahora mismo.'));return}
 let visible=0;
 vehicleRecords.forEach(vehicle=>{
  const current=statuses.get(vehicle.id)||'unmarked';
  const searchText=normalize([vehicle.name,vehicle.manufacturer,vehicle.category_label,vehicle.edition_context].join(' '));
  if((query&&!searchText.includes(query))||(filter!=='all'&&filter!==current))return;
  visible++;
  const card=make('article','garage-vehicle');const imageUrl=safeOfficialImage(vehicle.image_url);
  if(imageUrl){const image=make('img','garage-vehicle-image');image.loading='lazy';image.decoding='async';image.src=imageUrl;image.alt=vehicle.image_alt||('Imagen oficial de '+vehicle.name);card.append(image)}
  const body=make('div','garage-vehicle-body');body.append(make('span','vehicle-category',vehicle.category_label||'Transporte'),make('strong','garage-vehicle-name',vehicle.name),make('span','garage-vehicle-maker',vehicle.manufacturer||'Fabricante no especificado'));
  const select=make('select','garage-vehicle-status');select.setAttribute('aria-label','Estado personal de '+vehicle.name);
  [['unmarked','Sin marcar'],['wanted','Quiero conseguirlo'],['owned','Lo conseguí']].forEach(([value,label])=>select.append(new Option(label,value)));
  select.value=current;select.addEventListener('change',()=>{state.garageVehicles=state.garageVehicles.filter(item=>item.id!==vehicle.id);if(vehicleStatuses.includes(select.value))state.garageVehicles.push({id:vehicle.id,status:select.value});safeSave();renderGarage()});
  body.append(select);
  const source=make('a','garage-vehicle-source','Ficha oficial ↗');source.href=vehicle.gallery_url||'https://www.rockstargames.com/VI/media/screenshots';source.target='_blank';source.rel='noopener noreferrer';body.append(source);
  card.append(body);el.garageCatalog.append(card)
 });
 if(!visible)el.garageCatalog.append(make('p','progress-loading','No hay vehículos que coincidan con la búsqueda o el filtro.'))
}
function localIsoDate(){
 const now=new Date(),local=new Date(now.getTime()-now.getTimezoneOffset()*60000);
 return local.toISOString().slice(0,10);
}
function normalizeGameSession(item){
 if(!item||typeof item!=='object'||Array.isArray(item))return null;
 const regionIds=['vice-city','leonida-keys','grassrivers','port-gellhorn','ambrosia','mount-kalaga-national-park'];
 const characters=['jason','lucia','both','unknown'];
 const played=typeof item.played_on==='string'?item.played_on:'';
 if(!/^\d{4}-\d{2}-\d{2}$/.test(played))return null;
 const parsedDate=new Date(played+'T00:00:00Z');
 if(Number.isNaN(parsedDate.getTime())||parsedDate.toISOString().slice(0,10)!==played||played>localIsoDate())return null;
 const duration=Number(item.duration_min);
 if(!Number.isInteger(duration)||duration<1||duration>1440)return null;
 const title=typeof item.title==='string'?item.title.trim().slice(0,120):'';
 if(!title)return null;
 const notes=typeof item.notes==='string'?item.notes.trim().slice(0,1800):'';
 return {id:typeof item.id==='string'?item.id.slice(0,90):makeId(),played_on:played,duration_min:duration,character:characters.includes(item.character)?item.character:'unknown',region_id:regionIds.includes(item.region_id)?item.region_id:null,title,notes,spoiler:item.spoiler===true,created_at:typeof item.created_at==='string'?item.created_at:new Date().toISOString()};
}
function normalizeGameSessions(items){
 const byId=new Map();if(!Array.isArray(items))return [];
 items.slice(0,1000).forEach(item=>{const session=normalizeGameSession(item);if(session)byId.set(session.id,session)});
 return [...byId.values()].sort((a,b)=>b.played_on.localeCompare(a.played_on)||b.created_at.localeCompare(a.created_at)).slice(0,500);
}
function formatDuration(minutes){
 const hours=Math.floor(minutes/60),rest=minutes%60;
 return hours?hours+' h '+rest+' min':rest+' min';
}
function renderGameSessions(){
 el.sessionList.replaceChildren();
 const total=state.gameSessions.length,totalMinutes=state.gameSessions.reduce((sum,item)=>sum+item.duration_min,0);
 el.sessionCount.textContent=String(total);el.sessionDuration.textContent=formatDuration(totalMinutes);
 const latest=[...state.gameSessions].sort((a,b)=>b.played_on.localeCompare(a.played_on))[0];
 el.sessionLatest.textContent=latest?latest.played_on:'—';
 if(!total){el.sessionList.append(make('p','progress-loading','Todavía no has registrado sesiones.'));return}
 const regionMap=Object.fromEntries(regions.map(region=>[region.id,region.name]));
 const charLabels={jason:'Jason',lucia:'Lucía',both:'Jason y Lucía',unknown:'No especificado'};
 const query=normalize(el.sessionSearch.value),charFilter=el.sessionCharacterFilter.value,regionFilter=el.sessionRegionFilter.value;
 let visible=0;
 state.gameSessions.slice().sort((a,b)=>b.played_on.localeCompare(a.played_on)||b.created_at.localeCompare(a.created_at)).forEach(item=>{
  const hiddenSpoiler=item.spoiler&&!spoilersVisible;
  const contentText=hiddenSpoiler?'':normalize(item.title+' '+item.notes);
  const regionText=regionMap[item.region_id]||'';
  const matchesQuery=!query||contentText.includes(query);
  const matchesCharacter=charFilter==='all'||charFilter===item.character;
  const matchesRegion=regionFilter==='all'||(regionFilter==='none'?!item.region_id:regionFilter===item.region_id);
  if(!matchesQuery||!matchesCharacter||!matchesRegion)return;
  visible++;
  const card=make('article','game-session-card');
  const head=make('div','game-session-card-head');
  head.append(make('strong','game-session-title',hiddenSpoiler?'Registro con spoilers oculto':item.title),make('span','game-session-date',item.played_on));
  card.append(head);
  const meta=make('div','progress-task-meta');
  meta.append(make('span','',formatDuration(item.duration_min)),make('span','',charLabels[item.character]||'No especificado'));
  if(!hiddenSpoiler)meta.append(make('span','',regionText||'Región sin asignar'));
  if(item.spoiler)meta.append(make('span','progress-task-spoiler','SPOILER'));
  card.append(meta);
  if(!hiddenSpoiler&&item.notes)card.append(make('p','game-session-notes',item.notes));
  const remove=make('button','personal-goal-remove','Eliminar sesión');remove.type='button';
  remove.addEventListener('click',()=>{if(!window.confirm('¿Eliminar este registro de sesión?'))return;state.gameSessions=state.gameSessions.filter(entry=>entry.id!==item.id);safeSave();renderGameSessions()});
  card.append(remove);el.sessionList.append(card)
 });
 if(!visible)el.sessionList.append(make('p','progress-loading','No hay sesiones que coincidan con los filtros.'))
}
function normalizeAtlasPoint(item){
 if(!item||typeof item!=='object'||Array.isArray(item))return null;
 const regionIds=['vice-city','leonida-keys','grassrivers','port-gellhorn','ambrosia','mount-kalaga-national-park'];
 const types=['landmark','business','collectible','mission','secret','other'],statuses=['planned','visited','confirmed'];
 const title=typeof item.title==='string'?item.title.trim().slice(0,120):'',details=typeof item.details==='string'?item.details.trim().slice(0,1200):'';
 if(!title||!details||!regionIds.includes(item.region_id))return null;
 let source='';if(typeof item.source_url==='string'&&item.source_url.trim()){try{const url=new URL(item.source_url.trim());if(url.protocol==='https:')source=url.href.slice(0,500)}catch(_){}}
 return {id:typeof item.id==='string'?item.id.slice(0,90):makeId(),title,details,region_id:item.region_id,type:types.includes(item.type)?item.type:'landmark',status:statuses.includes(item.status)?item.status:'planned',source_url:source,spoiler:item.spoiler===true,created_at:typeof item.created_at==='string'?item.created_at:new Date().toISOString()};
}
function loadState(){
 try{
  const parsed=JSON.parse(localStorage.getItem(storageKey)||'{}');
  if(parsed&&[1,2,3,4,5].includes(parsed.version)&&parsed.checked&&typeof parsed.checked==='object'&&!Array.isArray(parsed.checked))state.checked=Object.fromEntries(Object.entries(parsed.checked).filter(([key,value])=>typeof key==='string'&&key.length<=120&&typeof value==='boolean').slice(0,5000));
  if(parsed&&Array.isArray(parsed.customGoals))state.customGoals=parsed.customGoals.filter(item=>item&&typeof item.id==='string'&&typeof item.title==='string'&&typeof item.category==='string').slice(0,250).map(item=>({id:item.id.slice(0,90),title:item.title.trim().slice(0,120),category:item.category,done:item.done===true,created_at:typeof item.created_at==='string'?item.created_at:''})).filter(item=>item.title&&fallbackCategories.some(cat=>cat.id===item.category));
  if(parsed&&Array.isArray(parsed.privateDiscoveries))state.privateDiscoveries=parsed.privateDiscoveries.map(normalizeDiscovery).filter(Boolean).slice(0,250);
  if(parsed&&Array.isArray(parsed.atlasPoints))state.atlasPoints=parsed.atlasPoints.map(normalizeAtlasPoint).filter(Boolean).slice(0,500);
  if(parsed&&Array.isArray(parsed.garageVehicles))state.garageVehicles=normalizeGarageVehicles(parsed.garageVehicles);
  if(parsed&&Array.isArray(parsed.gameSessions))state.gameSessions=normalizeGameSessions(parsed.gameSessions);
 }catch(_){state={checked:{},customGoals:[],privateDiscoveries:[],atlasPoints:[],garageVehicles:[],gameSessions:[]};el.backupStatus.textContent='No se pudo leer el almacenamiento local anterior; se inicia una sesión de progreso vacía.'}
}
function addRegions(){
 el.region.replaceChildren();el.region.append(new Option('Todas las regiones','all'));
 el.discoveryRegion.replaceChildren();el.discoveryRegion.append(new Option('Sin confirmar / sin asignar',''));
 el.atlasPointRegion.replaceChildren();el.atlasPointRegion.append(new Option('Selecciona región',''));
 el.atlasPointFilterRegion.replaceChildren();el.atlasPointFilterRegion.append(new Option('Todas las regiones','all'));
 el.sessionRegion.replaceChildren();el.sessionRegion.append(new Option('Sin asignar',''));
 el.sessionRegionFilter.replaceChildren();el.sessionRegionFilter.append(new Option('Todas','all'),new Option('Sin asignar','none'));
 regions.forEach(region=>{
  el.region.append(new Option(region.name,region.id));
  el.discoveryRegion.append(new Option(region.name,region.id));
  el.atlasPointRegion.append(new Option(region.name,region.id));
  el.atlasPointFilterRegion.append(new Option(region.name,region.id));
  el.sessionRegion.append(new Option(region.name,region.id));
  el.sessionRegionFilter.append(new Option(region.name,region.id));
 })
}
function sourceUrl(entry){const source=entry.verification&&Array.isArray(entry.verification.sources)?entry.verification.sources.find(item=>item&&typeof item.url==='string'&&item.url.startsWith('https://')):null;return source?source.url:''}
function buildTask(entry,category,regionById){
 const row=make('div','progress-task');row.dataset.taskId=entry.id;row.dataset.category=category.id;row.dataset.region=entry.region_id||'none';row.dataset.done=state.checked[entry.id]===true?'true':'false';
 const checkbox=make('input');checkbox.type='checkbox';checkbox.checked=state.checked[entry.id]===true;checkbox.setAttribute('aria-label','Marcar como completada: '+entry.title);
 const main=make('div','progress-task-main');const label=make('label','progress-task-title',entry.title);label.htmlFor='progress-check-'+entry.id;checkbox.id=label.htmlFor;main.append(label);
 if(entry.summary)main.append(make('p','progress-task-summary',entry.summary));
 const info=[];if(entry.location_details)info.push(['Ubicación',entry.location_details]);if(entry.unlock_requirement)info.push(['Requisito',entry.unlock_requirement]);if(entry.reward)info.push(['Recompensa',entry.reward]);if(Array.isArray(entry.requirements)&&entry.requirements.length)info.push(['Requisitos adicionales',entry.requirements]);if(Array.isArray(entry.steps)&&entry.steps.length)info.push(['Pasos',entry.steps]);
 if(info.length){const details=make('details','progress-task-details');details.append(make('summary','','Ver ubicación y pasos'));info.forEach(([title,value])=>{details.append(make('strong','progress-detail-heading',title));if(Array.isArray(value)){const list=make('ul','progress-detail-list');value.forEach(item=>list.append(make('li','',item)));details.append(list)}else details.append(make('p','progress-detail-text',value))});main.append(details)}
 const metaRow=make('div','progress-task-meta');metaRow.append(make('span','',regionById[entry.region_id]||'Región no asignada'));if(entry.spoiler===true)metaRow.append(make('span','progress-task-spoiler','SPOILER'));if(entry.missable===true)metaRow.append(make('span','progress-task-missable','PERDIBLE'));
 const url=sourceUrl(entry);if(url){const link=make('a','','Fuente ↗');link.href=url;link.target='_blank';link.rel='noopener';metaRow.append(link)}main.append(metaRow);row.append(checkbox,main);
 checkbox.addEventListener('change',()=>{state.checked[entry.id]=checkbox.checked;row.dataset.done=checkbox.checked?'true':'false';row.classList.toggle('is-done',checkbox.checked);safeSave();applyFilters();updateStats()});row.classList.toggle('is-done',checkbox.checked);return row
}
function renderCatalog(){el.categories.replaceChildren();tasks=[];const regionMap=Object.fromEntries(regions.map(region=>[region.id,region.name]));categories.forEach(category=>{const card=make('article','progress-category');card.dataset.category=category.id;const entries=Array.isArray(category.entries)?category.entries.filter(entry=>entry&&entry.status==='verified'&&entry.trackable===true&&typeof entry.id==='string'):[];tasks.push(...entries.map(entry=>({...entry,category_id:category.id,category_title:category.title})));const head=make('div','progress-category-head');head.append(make('h3','',category.title));const count=make('span','progress-category-count','0 / '+entries.length);count.dataset.categoryCount=category.id;head.append(count);card.append(head);card.append(make('p','progress-category-description',category.description||''));if(entries.length){const list=make('div','progress-task-list');entries.forEach(entry=>list.append(buildTask(entry,category,regionMap)));card.append(list)}else{card.append(make('p','progress-category-pending','No hay fichas de seguimiento verificadas publicadas en este módulo todavía.'))}el.categories.append(card)});applyFilters();updateStats()}
function applyFilters(){const query=normalize(el.search.value),region=el.region.value,status=el.status.value;let visible=0;for(const task of el.categories.querySelectorAll('.progress-task')){const searchMatch=!query||normalize(task.textContent).includes(query);const regionMatch=region==='all'||task.dataset.region===region;const done=task.dataset.done==='true';const statusMatch=status==='all'||(status==='done'?done:!done);const spoilerMatch=spoilersVisible||!task.querySelector('.progress-task-spoiler');task.hidden=!(searchMatch&&regionMatch&&statusMatch&&spoilerMatch);if(!task.hidden)visible++}for(const card of el.categories.querySelectorAll('.progress-category')){const hasTasks=card.querySelectorAll('.progress-task').length>0;const count=card.querySelectorAll('.progress-task:not([hidden])').length;card.hidden=hasTasks&&count===0}el.empty.hidden=visible!==0||tasks.length===0}
function renderAtlasPoints(){
 el.atlasPointList.replaceChildren();el.atlasPointCount.textContent=state.atlasPoints.length+' lugares';
 if(!state.atlasPoints.length){el.atlasPointList.append(make('p','progress-loading','Todavía no has guardado lugares.'));return}
 const regionMap=Object.fromEntries(regions.map(region=>[region.id,region.name]));
 const typeLabels={landmark:'Punto de interés',business:'Negocio / establecimiento',collectible:'Coleccionable',mission:'Misión / actividad',secret:'Secreto / curiosidad',other:'Otro'};
 const statusLabels={planned:'Pendiente de visitar',visited:'Visitado',confirmed:'Comprobado por mí'};
 const query=normalize(el.atlasPointSearch.value),regionFilter=el.atlasPointFilterRegion.value,statusFilter=el.atlasPointFilterStatus.value;
 let visible=0;
 state.atlasPoints.forEach(item=>{
  const text=normalize(item.title+' '+item.details+' '+(regionMap[item.region_id]||''));
  if((query&&!text.includes(query))||(regionFilter!=='all'&&regionFilter!==item.region_id)||(statusFilter!=='all'&&statusFilter!==item.status))return;
  visible++;
  const card=make('article','atlas-personal-point');card.dataset.pointId=item.id;
  const head=make('div','atlas-personal-point-head');head.append(make('strong','atlas-personal-point-title',item.title),make('span','atlas-personal-point-status',statusLabels[item.status]));card.append(head);
  const meta=make('div','progress-task-meta');meta.append(make('span','',regionMap[item.region_id]||'Región no asignada'),make('span','',typeLabels[item.type]||'Otro'));if(item.spoiler)meta.append(make('span','progress-task-spoiler','SPOILER'));card.append(meta);
  card.append(make('p','atlas-personal-point-details',item.details));
  if(item.source_url){const link=make('a','','Abrir referencia ↗');link.href=item.source_url;link.target='_blank';link.rel='noopener';card.append(link)}
  const actions=make('div','atlas-personal-point-actions');
  const next=make('button','progress-action secondary',item.status==='planned'?'Marcar visitado':item.status==='visited'?'Marcar comprobado':'Volver a pendiente');next.type='button';
  next.addEventListener('click',()=>{item.status=item.status==='planned'?'visited':item.status==='visited'?'confirmed':'planned';safeSave();renderAtlasPoints()});
  const remove=make('button','personal-goal-remove','Eliminar');remove.type='button';remove.addEventListener('click',()=>{if(!window.confirm('¿Eliminar este lugar de tu bitácora?'))return;state.atlasPoints=state.atlasPoints.filter(point=>point.id!==item.id);safeSave();renderAtlasPoints()});
  actions.append(next,remove);card.append(actions);el.atlasPointList.append(card)
 });
 if(!visible)el.atlasPointList.append(make('p','progress-loading','No hay lugares que coincidan con los filtros.'))
}
function renderDiscoveries(){
 el.discoveryList.replaceChildren();el.discoveryCount.textContent=state.privateDiscoveries.length+' apuntes';
 if(!state.privateDiscoveries.length){el.discoveryList.append(make('p','progress-loading','Todavía no has guardado hallazgos.'));return}
 const regionMap=Object.fromEntries(regions.map(region=>[region.id,region.name]));
 state.privateDiscoveries.forEach(item=>{
  const card=make('article','private-discovery'),head=make('div','private-discovery-head');head.append(make('strong','private-discovery-title',item.title),make('span','guide-state','Pendiente de revisión · Privado'));card.append(head);
  const meta=make('div','progress-task-meta');meta.append(make('span','',fallbackCategories.find(cat=>cat.id===item.category)?.title||'Hallazgo'),make('span','',regionMap[item.region_id]||'Región sin confirmar'),make('span','',({gameplay_observation:'Observación en partida',own_screenshot_video:'Captura o vídeo propio',official_source:'Fuente oficial',media_report:'Reporte de medio',rumor:'Rumor / pista'}[item.evidence_type]||'Observación')));if(item.spoiler)meta.append(make('span','progress-task-spoiler','SPOILER'));card.append(meta);
  card.append(make('p','private-discovery-note',item.note));
  if(item.source_url){const link=make('a','','Abrir enlace ↗');link.href=item.source_url;link.target='_blank';link.rel='noopener';card.append(link)}
  const remove=make('button','personal-goal-remove','Eliminar apunte');remove.type='button';remove.addEventListener('click',()=>{if(!window.confirm('¿Eliminar este apunte privado?'))return;state.privateDiscoveries=state.privateDiscoveries.filter(entry=>entry.id!==item.id);safeSave();renderDiscoveries()});card.append(remove);el.discoveryList.append(card)
 })
}
function setMode(showSpoilers){
 spoilersVisible=showSpoilers;if(el.guideSpoilers){el.guideSpoilers.checked=showSpoilers;el.guideSpoilers.dispatchEvent(new Event('change',{bubbles:true}))}
 try{localStorage.setItem(spoilerKey,String(showSpoilers))}catch(_){}
 renderGameSessions();const explorer=!showSpoilers;el.explorerMode.classList.toggle('is-active',explorer);el.explorerMode.setAttribute('aria-pressed',String(explorer));el.completistMode.classList.toggle('is-active',showSpoilers);el.completistMode.setAttribute('aria-pressed',String(showSpoilers));el.backupStatus.textContent=showSpoilers?'Modo completista: se muestran fichas marcadas como spoiler.':'Modo explorador: los spoilers permanecen ocultos.';applyFilters()
}
function updateStats(){const total=tasks.length,done=tasks.filter(task=>state.checked[task.id]===true).length;el.done.textContent=String(done);el.total.textContent=String(total);el.bar.hidden=total===0;if(total>0){const percent=Math.round(done/total*100);el.percent.textContent=percent+'%';el.bar.value=percent;el.coverage.textContent=meta.catalog_complete?'Porcentaje de la checklist verificada y publicada. La guía declara cobertura completa del catálogo conocido; revisa sus criterios y fuentes.':'Porcentaje de las tareas verificadas actualmente publicadas ('+done+' de '+total+'). No representa el porcentaje real total del juego porque el catálogo aún no se ha declarado completo.'}else{el.percent.textContent='Pendiente';el.coverage.textContent='Todavía no hay requisitos de progreso verificados y publicados. No se muestra 0 %, porque eso daría a entender que ya existe un catálogo completo.'}for(const category of categories){const count=tasks.filter(task=>task.category_id===category.id).length,complete=tasks.filter(task=>task.category_id===category.id&&state.checked[task.id]===true).length;const label=el.categories.querySelector('[data-category-count="'+category.id+'"]');if(label)label.textContent=complete+' / '+count}const personalTotal=state.customGoals.length,personalDone=state.customGoals.filter(goal=>goal.done).length;el.goalCount.textContent=String(personalDone)+' / '+String(personalTotal);el.goalSummary.textContent=personalTotal+' objetivo'+(personalTotal===1?'':'s')}
function renderGoals(){el.goalList.replaceChildren();if(!state.customGoals.length){el.goalList.append(make('p','progress-loading','Todavía no has añadido objetivos.'));updateStats();return}state.customGoals.forEach(goal=>{const row=make('div','personal-goal');row.classList.toggle('is-done',goal.done);const checkbox=make('input');checkbox.type='checkbox';checkbox.checked=goal.done;checkbox.setAttribute('aria-label','Marcar como completado: '+goal.title);const text=make('div');text.append(make('span','personal-goal-title',goal.title));const category=fallbackCategories.find(item=>item.id===goal.category);text.append(make('span','personal-goal-category',category?category.title:'Objetivo personal'));const remove=make('button','personal-goal-remove','Eliminar');remove.type='button';remove.addEventListener('click',()=>{if(!window.confirm('¿Eliminar este objetivo personal?'))return;state.customGoals=state.customGoals.filter(item=>item.id!==goal.id);safeSave();renderGoals()});checkbox.addEventListener('change',()=>{goal.done=checkbox.checked;row.classList.toggle('is-done',goal.done);safeSave();updateStats()});row.append(checkbox,text,remove);el.goalList.append(row)});updateStats()}
function makeId(){if(window.crypto&&typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID();return 'goal-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)}
function exportBackup(){
 const payload={format:'leonida-files-progress',version:5,exported_at:new Date().toISOString(),checked:state.checked,customGoals:state.customGoals,privateDiscoveries:state.privateDiscoveries,atlasPoints:state.atlasPoints,garageVehicles:state.garageVehicles,gameSessions:state.gameSessions};
 const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),link=make('a');link.href=url;link.download='leonida-files-progress-backup.json';document.body.append(link);link.click();link.remove();URL.revokeObjectURL(url);el.backupStatus.textContent='Respaldo JSON exportado con marcas, objetivos y hallazgos privados. Guárdalo en un lugar seguro.'
}
function importBackup(file){
 if(!file)return;if(file.size>1048576){el.backupStatus.textContent='El archivo supera el límite de 1 MB.';return}
 file.text().then(text=>{
  const data=JSON.parse(text);if(!data||data.format!=='leonida-files-progress'||![1,2,3,4,5].includes(data.version)||!data.checked||typeof data.checked!=='object'||!Array.isArray(data.customGoals)||(data.version>=2&&!Array.isArray(data.privateDiscoveries))||(data.version>=3&&!Array.isArray(data.atlasPoints))||(data.version>=4&&!Array.isArray(data.garageVehicles))||(data.version>=5&&!Array.isArray(data.gameSessions)))throw new Error('Formato de respaldo no válido');
  if(!window.confirm('Importar reemplazará las marcas, objetivos y hallazgos privados guardados en este navegador. ¿Continuar?'))return;
  const checked=Object.fromEntries(Object.entries(data.checked).filter(([id,value])=>typeof id==='string'&&id.length<=120&&typeof value==='boolean').slice(0,5000));
  const goals=data.customGoals.filter(goal=>goal&&typeof goal.id==='string'&&typeof goal.title==='string'&&fallbackCategories.some(cat=>cat.id===goal.category)).slice(0,250).map(goal=>({id:goal.id.slice(0,90),title:goal.title.trim().slice(0,120),category:goal.category,done:goal.done===true,created_at:typeof goal.created_at==='string'?goal.created_at:''})).filter(goal=>goal.title);
  const discoveries=(Array.isArray(data.privateDiscoveries)?data.privateDiscoveries:[]).map(normalizeDiscovery).filter(Boolean).slice(0,250);
  const atlasPoints=(Array.isArray(data.atlasPoints)?data.atlasPoints:[]).map(normalizeAtlasPoint).filter(Boolean).slice(0,500);
  const garageVehicles=normalizeGarageVehicles(Array.isArray(data.garageVehicles)?data.garageVehicles:[]);
  const gameSessions=normalizeGameSessions(Array.isArray(data.gameSessions)?data.gameSessions:[]);
  state={checked,customGoals:goals,privateDiscoveries:discoveries,atlasPoints,garageVehicles,gameSessions};safeSave();renderCatalog();renderGoals();renderDiscoveries();renderAtlasPoints();renderGarage();renderGameSessions();el.backupStatus.textContent='Respaldo importado correctamente.'
 }).catch(()=>{el.backupStatus.textContent='No se pudo importar: el archivo está dañado o no tiene el formato de LEONIDA FILES.'}).finally(()=>{el.importFile.value=''})
}
el.sessionDate.value=localIsoDate();el.sessionDate.max=localIsoDate();
el.sessionForm.addEventListener('submit',event=>{
 event.preventDefault();
 const title=el.sessionTitle.value.trim(),date=el.sessionDate.value,duration=Number(el.sessionMinutes.value);
 if(!title||!date||!Number.isInteger(duration)||duration<1||duration>1440){el.sessionTitle.focus();return}
 if(state.gameSessions.length>=500){el.backupStatus.textContent='Has alcanzado el máximo de 500 sesiones personales.';return}
 const session=normalizeGameSession({id:makeId(),played_on:date,duration_min:duration,character:el.sessionCharacter.value,region_id:el.sessionRegion.value||null,title,notes:el.sessionNotes.value,spoiler:el.sessionSpoiler.checked,created_at:new Date().toISOString()});
 if(!session){el.backupStatus.textContent='No se pudo validar la sesión. Comprueba la fecha y la duración.';return}
 state.gameSessions.unshift(session);safeSave();renderGameSessions();el.sessionTitle.value='';el.sessionNotes.value='';el.sessionMinutes.value='60';el.sessionCharacter.value='jason';el.sessionRegion.value='';el.sessionSpoiler.checked=false;el.backupStatus.textContent='Sesión guardada en tu diario privado.';el.sessionTitle.focus()
});
el.sessionSearch.addEventListener('input',renderGameSessions);el.sessionCharacterFilter.addEventListener('change',renderGameSessions);el.sessionRegionFilter.addEventListener('change',renderGameSessions);
el.atlasPointForm.addEventListener('submit',event=>{
 event.preventDefault();
 const title=el.atlasPointTitle.value.trim(),details=el.atlasPointDetails.value.trim(),source=el.atlasPointSource.value.trim();
 if(!title||!details||!el.atlasPointRegion.value){el.atlasPointTitle.focus();return}
 if(state.atlasPoints.length>=500){el.backupStatus.textContent='Has alcanzado el máximo de 500 lugares personales.';return}
 let sourceUrl='';if(source){try{const parsed=new URL(source);if(parsed.protocol!=='https:')throw new Error('HTTPS requerido');sourceUrl=parsed.href.slice(0,500)}catch(_){el.backupStatus.textContent='La referencia debe ser una URL HTTPS válida.';el.atlasPointSource.focus();return}}
 const point=normalizeAtlasPoint({id:makeId(),title,details,region_id:el.atlasPointRegion.value,type:el.atlasPointType.value,status:el.atlasPointStatus.value,source_url:sourceUrl,spoiler:el.atlasPointSpoiler.checked,created_at:new Date().toISOString()});
 if(!point){el.backupStatus.textContent='No se pudo validar el lugar. Comprueba la región y los campos.';return}
 state.atlasPoints.unshift(point);safeSave();renderAtlasPoints();el.atlasPointTitle.value='';el.atlasPointDetails.value='';el.atlasPointSource.value='';el.atlasPointStatus.value='planned';el.atlasPointSpoiler.checked=false;el.backupStatus.textContent='Lugar guardado en tu bitácora privada de Leonida.';el.atlasPointTitle.focus()
});
el.atlasPointSearch.addEventListener('input',renderAtlasPoints);el.atlasPointFilterRegion.addEventListener('change',renderAtlasPoints);el.atlasPointFilterStatus.addEventListener('change',renderAtlasPoints);
el.garageSearch.addEventListener('input',renderGarage);el.garageFilter.addEventListener('change',renderGarage);
el.discoveryForm.addEventListener('submit',event=>{
 event.preventDefault();const title=el.discoveryTitle.value.trim(),note=el.discoveryNote.value.trim(),source=el.discoverySource.value.trim();
 if(!title||!note){el.discoveryTitle.focus();return}if(state.privateDiscoveries.length>=250){el.backupStatus.textContent='Has alcanzado el máximo de 250 hallazgos privados.';return}
 let sourceUrl='';if(source){try{const parsed=new URL(source);if(parsed.protocol!=='https:')throw new Error('HTTPS requerido');sourceUrl=parsed.href.slice(0,500)}catch(_){el.backupStatus.textContent='El enlace debe ser una URL HTTPS válida.';el.discoverySource.focus();return}}
 const item=normalizeDiscovery({id:makeId(),title,note,category:el.discoveryCategory.value,region_id:el.discoveryRegion.value||null,evidence_type:el.discoveryEvidence.value,source_url:sourceUrl,spoiler:el.discoverySpoiler.checked,created_at:new Date().toISOString()});
 if(!item){el.backupStatus.textContent='No se pudo validar el apunte. Revisa su módulo, título y descripción.';return}
 state.privateDiscoveries.unshift(item);safeSave();renderDiscoveries();el.discoveryTitle.value='';el.discoveryNote.value='';el.discoverySource.value='';el.discoverySpoiler.checked=false;el.backupStatus.textContent='Hallazgo guardado en privado en este navegador. No se ha publicado.';el.discoveryTitle.focus()
});
el.explorerMode.addEventListener('click',()=>setMode(false));el.completistMode.addEventListener('click',()=>setMode(true));
el.goalForm.addEventListener('submit',event=>{event.preventDefault();const title=el.goalTitle.value.trim();const category=el.goalCategory.value;if(!title){el.goalTitle.focus();return}if(!fallbackCategories.some(item=>item.id===category)){el.backupStatus.textContent='Selecciona un módulo válido.';return}if(state.customGoals.length>=250){el.backupStatus.textContent='Has alcanzado el máximo de 250 objetivos personales.';return}state.customGoals.push({id:makeId(),title:title.slice(0,120),category,done:false,created_at:new Date().toISOString()});el.goalTitle.value='';safeSave();renderGoals();el.goalTitle.focus()});
el.search.addEventListener('input',applyFilters);el.region.addEventListener('change',applyFilters);el.status.addEventListener('change',applyFilters);el.export.addEventListener('click',exportBackup);el.import.addEventListener('click',()=>el.importFile.click());el.importFile.addEventListener('change',()=>importBackup(el.importFile.files&&el.importFile.files[0]));
if(el.guideSpoilers){try{spoilersVisible=localStorage.getItem(spoilerKey)==='true'}catch(_){spoilersVisible=false}el.guideSpoilers.addEventListener('change',()=>{spoilersVisible=el.guideSpoilers.checked;const explorer=!spoilersVisible;el.explorerMode.classList.toggle('is-active',explorer);el.explorerMode.setAttribute('aria-pressed',String(explorer));el.completistMode.classList.toggle('is-active',spoilersVisible);el.completistMode.setAttribute('aria-pressed',String(spoilersVisible));renderGameSessions();applyFilters()})}
async function load(){loadState();try{const [guideResponse,progressResponse,regionResponse,vehiclesResponse]=await Promise.all([fetch('data/guide.json',{cache:'no-store'}),fetch('data/progress.json',{cache:'no-store'}),fetch('data/regions.json',{cache:'no-store'}),fetch('data/vehicles.json',{cache:'no-store'})]);if(!guideResponse.ok||!progressResponse.ok||!regionResponse.ok||!vehiclesResponse.ok)throw new Error('No se pudo cargar uno de los catálogos');const [guide,progress,regionData,vehicleData]=await Promise.all([guideResponse.json(),progressResponse.json(),regionResponse.json(),vehiclesResponse.json()]);if(guide.dataset!=='guide'||progress.dataset!=='progress'||regionData.dataset!=='regions'||vehicleData.dataset!=='vehicles')throw new Error('Formato de catálogo inválido');categories=guide.categories;meta=progress;regions=regionData.items||[];vehicleRecords=Array.isArray(vehicleData.items)?vehicleData.items:[];addRegions();renderCatalog();renderGoals();renderDiscoveries();renderAtlasPoints();renderGarage();renderGameSessions();setMode(spoilersVisible);const total=tasks.length;say(total?total+' tareas verificadas disponibles. Las marcas se guardan localmente.':'Catálogos cargados: 0 tareas verificadas para seguimiento. Los módulos están preparados, no se inventan requisitos.')}catch(error){categories=fallbackCategories;regions=[];vehicleRecords=[];addRegions();renderCatalog();renderGoals();renderDiscoveries();renderAtlasPoints();renderGarage();renderGameSessions();setMode(spoilersVisible);say('No se pudo cargar toda la checklist oficial. Tus objetivos personales siguen disponibles; no se calculará progreso oficial hasta recuperar los catálogos.')}}
load();
})();