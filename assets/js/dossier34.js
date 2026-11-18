

const search=document.getElementById('newsSearch'),filter=document.getElementById('newsFilter');
let items=[...document.querySelectorAll('#newsList .news')];
function filterNews(){const q=(search.value||'').toLocaleLowerCase('es');const f=filter.value;items.forEach(el=>{const matchText=(el.innerText||el.textContent||'').toLocaleLowerCase('es').includes(q);const k=el.dataset.kind;const matchKind=f==='all'||(f==='confirmado'&&k==='confirmado')||(f==='reporte'&&k==='reporte')||(f==='rumor'&&k==='rumor')||(f==='desmentido'&&k==='desmentido');el.classList.toggle('hidden',!(matchText&&matchKind));});}
search?.addEventListener('input',filterNews);filter?.addEventListener('change',filterNews);

function normalizeFeedUrl(rawUrl){
 try{
  const parsed=new URL(String(rawUrl||''));
  if(parsed.protocol!=='https:')return '';
  parsed.hash='';
  [...parsed.searchParams.keys()].forEach(key=>{
   if(key.toLowerCase().startsWith('utm_')||['gclid','fbclid','mc_cid','mc_eid','igshid','ref_src'].includes(key.toLowerCase()))parsed.searchParams.delete(key);
  });
  parsed.searchParams.sort();
  return parsed.href;
 }catch(_){return '';}
}
async function loadAutoNewsFeed(){
 try{
  const response=await fetch('./data/news-feed.json',{cache:'no-cache'});
  if(!response.ok)return;
  const data=await response.json();
  if(!data||!Array.isArray(data.items))return;
  const box=document.getElementById('newsList');
  if(!box)return;
  const known=new Set([...box.querySelectorAll('.news')].map(el=>normalizeFeedUrl(el.dataset.newsUrl||el.querySelector('a.source[href]')?.href||'')).filter(Boolean));
  const kinds={confirmed:'confirmado',reported:'reporte',rumor:'rumor'};
  const allowedStatuses=['Confirmado','Reportado','Pendiente de verificación'];
  data.items.forEach(item=>{
   const safeUrl=normalizeFeedUrl(item.url);
   if(safeUrl&&known.has(safeUrl))return;
   const kind=Object.prototype.hasOwnProperty.call(kinds,item.kind)?item.kind:'reported';
   let status=allowedStatuses.includes(item.status)?item.status:'Pendiente de verificación';
   if((kind==='rumor'&&status!=='Pendiente de verificación')||(kind==='reported'&&status==='Confirmado')||(kind==='confirmed'&&status!=='Confirmado'))status='Pendiente de verificación';
   if(item.discovery_source==='Google News RSS'&&status!=='Pendiente de verificación')status='Pendiente de verificación';
   const el=document.createElement('article');el.className='news';el.dataset.kind=kinds[kind];el.dataset.publishedAt=String(item.published_at||item.date||'');el.dataset.newsUrl=safeUrl;el.dataset.feedId=String(item.id||'');
   const time=document.createElement('time');time.textContent=String(item.date||'NUEVO').slice(0,40);if(item.published_at)time.dateTime=String(item.published_at);
   const content=document.createElement('div'),meta=document.createElement('div');meta.className='meta';
   const statusClass=status==='Confirmado'?'confirmed':status==='Reportado'?'reported':kind==='rumor'?'unconfirmed':'pending';
   const statusTag=document.createElement('span');statusTag.className='tag '+statusClass;statusTag.textContent=status;
   meta.append(statusTag);
   if(item.discovery_source){const automatic=document.createElement('span');automatic.className='tag system';automatic.textContent='Detectado automáticamente';meta.append(automatic);}
   const h=document.createElement('h3');h.textContent=String(item.title||'Nueva referencia GTA VI');
   const p=document.createElement('p');p.textContent=String(item.description||'Titular detectado por el recolector RSS. Abrir la fuente y verificar antes de tratarlo como un hecho.');
   content.append(meta,h,p);
   if(safeUrl){const a=document.createElement('a');a.className='source';a.target='_blank';a.rel='noopener noreferrer';a.textContent='Fuente: '+String(item.source||'Fuente externa')+' ↗';a.href=safeUrl;content.append(a);}
   el.append(time,content);box.append(el);items.push(el);if(safeUrl)known.add(safeUrl);
  });
  filterNews();
 }catch(_){}
 window.dispatchEvent(new Event('newsfeed:updated'));
}


// Lanzamiento regional: la primera zona UTC+14 abre antes que PS Store España (CET).
(function(){
 const target=Date.parse('2026-11-18T23:00:00Z');
 const firstRegionalRelease=Date.parse('2026-11-18T10:00:00Z');
 const root=document.getElementById('releaseCountdown');
 if(!root)return;
 const ids={days:document.getElementById('cdDays'),hours:document.getElementById('cdHours'),minutes:document.getElementById('cdMinutes'),seconds:document.getElementById('cdSeconds')};
 const status=document.getElementById('countdownStatus');
 const title=root.querySelector('.countdown-title');
 const foot=root.querySelector('.countdown-foot');
 const pad=n=>String(n).padStart(2,'0');
 function tick(){
  const now=Date.now(),ms=target-now;
  if(ms<=0){
   Object.values(ids).forEach(node=>{if(node)node.textContent='00';});
   root.classList.add('done');root.classList.remove('regional-live');root.dataset.releaseState='spain-available';
   if(status)status.textContent='Disponible en PS Store España';
   if(title)title.textContent='GTA VI · ventana de desbloqueo de España alcanzada';
   return false;
  }
  const total=Math.floor(ms/1000);
  if(ids.days)ids.days.textContent=pad(Math.floor(total/86400));
  if(ids.hours)ids.hours.textContent=pad(Math.floor(total%86400/3600));
  if(ids.minutes)ids.minutes.textContent=pad(Math.floor(total%3600/60));
  if(ids.seconds)ids.seconds.textContent=pad(total%60);
  const regional=now>=firstRegionalRelease;
  root.classList.toggle('regional-live',regional);root.dataset.releaseState=regional?'other-regions-live':'awaiting-regional-release';
  if(status)status.textContent=regional?'Ya disponible en algunas regiones':'Apertura regional próxima';
  if(title)title.textContent=regional?'Leonida ya abrió en otras regiones · PSN España pendiente':'Cuenta atrás para tu PS Store España';
  return true;
 }
 if(tick()){const timer=setInterval(()=>{if(!tick())clearInterval(timer)},1000);}
})();
// Animaciones de entrada al desplazarse, respetando la preferencia de movimiento reducido.
(function(){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 document.documentElement.classList.add('reveal-ready');
 const targets=document.querySelectorAll('.section,.ticker-item,.countdown,.card,.news,.radio-card,.people-card,.media-tile,.edition,.place');
 targets.forEach(el=>el.classList.add('reveal'));
 if(!('IntersectionObserver' in window)){targets.forEach(el=>el.classList.add('in-view'));return}
 const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');io.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -35px 0px'});
 targets.forEach(el=>io.observe(el));
})();
// Barra de progreso de lectura.
(function(){const bar=document.getElementById('pageProgress');let busy=false;function update(){const max=document.documentElement.scrollHeight-innerHeight;const pct=max>0?Math.min(100,scrollY/max*100):0;bar.style.width=pct+'%';busy=false}addEventListener('scroll',()=>{if(!busy){busy=true;requestAnimationFrame(update)}},{passive:true});update()})();


// DOSSIER 34 — interacciones locales, sin cuenta ni librerías.
(function(){
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function safeStorage(){try{return window.localStorage;}catch(_){return null;}}
 const storage=safeStorage();
 const read=(k,d)=>{try{return storage?storage.getItem(k)??d:d;}catch(_){return d;}};
 const write=(k,v)=>{try{if(storage)storage.setItem(k,v);return !!storage;}catch(_){return false;}};
 const json=(k,d)=>{try{return JSON.parse(read(k,JSON.stringify(d)));}catch(_){return d;}};
 const boot=$('#bootScreen');
 function finishBoot(){if(!boot)return;boot.classList.add('is-leaving');write('lf34:boot','1');setTimeout(()=>boot.hidden=true,reduced?0:480);}
 if(boot){if(reduced||read('lf34:boot','')==='1')boot.hidden=true;else{$('#skipBoot')?.addEventListener('click',finishBoot);setTimeout(finishBoot,1650);}}
 const menu=$('#menuBtn'),nav=$('#navlinks');
 menu?.addEventListener('click',()=>{const open=nav?.classList.toggle('open')||false;menu.setAttribute('aria-expanded',String(open));});
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');}));
 if('IntersectionObserver' in window){const map=new Map($$('#navlinks a').map(a=>[a.getAttribute('href')?.slice(1),a]));const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){$$('#navlinks a').forEach(a=>a.classList.remove('active'));map.get(e.target.id)?.classList.add('active');}}),{rootMargin:'-25% 0px -65% 0px'});$$('main section[id]').forEach(s=>io.observe(s));}
 const palette=$('#commandPalette'),input=$('#commandInput'),results=$('#commandResults');let focusBack=null,index=[];
 function buildIndex(){index=[];$$('main section[id]').forEach(s=>index.push({title:s.querySelector('h2')?.textContent?.trim()||s.id,group:'Sección',target:s.id,desc:s.querySelector('.section-head p')?.textContent||''}));$$('#newsList .news,#personajes .character-file,#atlas .place,#radios .radio-card,#hangar .vehicle-card').forEach(c=>{const title=c.querySelector('h3,b')?.textContent?.trim();if(title)index.push({title,group:c.classList.contains('news')?'Noticia':c.classList.contains('place')?'Región':c.classList.contains('radio-card')?'Emisora':c.classList.contains('vehicle-card')?'Vehículo':c.classList.contains('place')?'Región':'Personaje',target:c.id||c.closest('section')?.id,desc:c.innerText.replace(/\s+/g,' ').slice(0,130)});});}
 function closePalette(){if(!palette)return;palette.hidden=true;document.body.classList.remove('dialog-open');focusBack?.focus?.();}
 function showResults(q=''){if(!results)return;buildIndex();results.replaceChildren();const term=q.trim().toLocaleLowerCase('es');const found=index.filter(x=>(x.title+' '+x.group+' '+x.desc).toLocaleLowerCase('es').includes(term)).slice(0,25);if(!found.length){const p=document.createElement('p');p.className='muted';p.textContent='No hay resultados en el archivo.';results.append(p);return;}found.forEach(x=>{const b=document.createElement('button');b.type='button';b.className='command-result';b.setAttribute('role','option');const span=document.createElement('span');span.textContent=x.title;const small=document.createElement('small');small.textContent=x.group;b.append(span,small);b.addEventListener('click',()=>{closePalette();document.getElementById(x.target)?.scrollIntoView({behavior:reduced?'auto':'smooth'});});results.append(b);});}
 function openPalette(){if(!palette)return;focusBack=document.activeElement;palette.hidden=false;document.body.classList.add('dialog-open');showResults(input?.value||'');setTimeout(()=>input?.focus(),20);}
 $('#openCommand')?.addEventListener('click',openPalette);$('#closeCommand')?.addEventListener('click',closePalette);palette?.addEventListener('click',e=>{if(e.target===palette)closePalette();});input?.addEventListener('input',()=>showResults(input.value));
 const favoriteDialog=$('#favoritesDrawer'),favoriteList=$('#favoritesList'),favoriteCount=$('#favoriteCount');let favorites=json('lf34:favorites',[]);if(!Array.isArray(favorites))favorites=[];
 const candidates=()=>$('#newsList .news,#personajes .character-file,#radios .radio-card,#atlas .place,#hangar .vehicle-card');
 function keyFor(card){if(card.dataset.favoriteKey)return card.dataset.favoriteKey;const name=card.querySelector('h3,b')?.textContent?.trim()||'registro';const slug=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,60);card.dataset.favoriteKey=(card.classList.contains('news')?'news':card.classList.contains('character-file')?'personaje':card.classList.contains('radio-card')?'radio':card.classList.contains('vehicle-card')?'vehiculo':card.classList.contains('place')?'region':'registro')+':'+slug;return card.dataset.favoriteKey;}
 function renderFavorites(){if(!favoriteList)return;favoriteList.replaceChildren();if(favoriteCount)favoriteCount.textContent=String(favorites.length);const empty=$('#favoritesEmpty');if(empty)empty.hidden=!!favorites.length;favorites.forEach(f=>{const row=document.createElement('div');row.className='favorite-row';const a=document.createElement('a');a.href='#'+f.target;a.textContent=f.title;a.addEventListener('click',closeFavorites);const del=document.createElement('button');del.type='button';del.textContent='Quitar';del.addEventListener('click',()=>{favorites=favorites.filter(x=>x.key!==f.key);persist();syncFavorites();renderFavorites();});row.append(a,del);favoriteList.append(row);});}
 function persist(){write('lf34:favorites',JSON.stringify(favorites));}
 function syncFavorites(){candidates().forEach(card=>{const key=keyFor(card);let b=card.querySelector(':scope > .favorite-toggle');if(!b){b=document.createElement('button');b.type='button';b.className='favorite-toggle';b.addEventListener('click',()=>toggle(card));card.append(b);}const active=favorites.some(x=>x.key===key);b.textContent=active?'★ Guardado':'☆ Guardar';b.setAttribute('aria-pressed',String(active));b.setAttribute('aria-label',(active?'Quitar de favoritos: ':'Guardar en favoritos: ')+(card.querySelector('h3,b')?.textContent?.trim()||'elemento'));});}
 window.syncDossierFavorites=syncFavorites;
 function toggle(card){const key=keyFor(card),title=card.querySelector('h3,b')?.textContent?.trim()||'Elemento guardado';favorites=favorites.some(x=>x.key===key)?favorites.filter(x=>x.key!==key):[{key,title,target:card.id||card.closest('section')?.id||'noticias'},...favorites];persist();syncFavorites();renderFavorites();}
 function closeFavorites(){if(!favoriteDialog)return;favoriteDialog.hidden=true;document.body.classList.remove('dialog-open');focusBack?.focus?.();}
 function openFavorites(){if(!favoriteDialog)return;focusBack=document.activeElement;favoriteDialog.hidden=false;document.body.classList.add('dialog-open');renderFavorites();$('#closeFavorites')?.focus();}
 $('#openFavorites')?.addEventListener('click',openFavorites);$('#closeFavorites')?.addEventListener('click',closeFavorites);favoriteDialog?.addEventListener('click',e=>{if(e.target===favoriteDialog)closeFavorites();});
 function trapTab(dialog,e){
  if(!dialog||dialog.hidden)return;
  const nodes=[...dialog.querySelectorAll("button:not([disabled]),input:not([disabled]),a[href],select:not([disabled]),textarea:not([disabled])")].filter(n=>n.getClientRects().length);
  if(!nodes.length)return;
  const first=nodes[0],last=nodes[nodes.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
 document.addEventListener('keydown',e=>{
  if(e.key==='Tab'){
   const active=palette&&!palette.hidden?palette:favoriteDialog&&!favoriteDialog.hidden?favoriteDialog:null;
   trapTab(active,e);
   return;
  }
  const a=document.activeElement,typing=a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.isContentEditable);
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette();}
  else if(e.key==='/'&&!typing){e.preventDefault();openPalette();}
  else if(e.key==='Escape'){if(palette&&!palette.hidden)closePalette();if(favoriteDialog&&!favoriteDialog.hidden)closeFavorites();}
  else if(e.key==='Enter'&&palette&&!palette.hidden)results?.querySelector('button')?.click();
 });
 document.querySelectorAll('#atlas [data-region-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#atlas [data-region-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));window.setDossierRegionFilter?.(b.dataset.regionFilter||'all');}));
 document.querySelectorAll('#hangar [data-vehicle-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#hangar [data-vehicle-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));window.setDossierVehicleFilter?.(b.dataset.vehicleFilter||'all');}));
 $$('#evidencias [data-evidence-filter]').forEach(b=>b.addEventListener('click',()=>{$$('#evidencias [data-evidence-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const f=$('#newsFilter');if(f){f.value=b.dataset.evidenceFilter;f.dispatchEvent(new Event('change',{bubbles:true}));}$('#noticias')?.scrollIntoView({behavior:reduced?'auto':'smooth'});}));
 const months={ENE:0,ENERO:0,FEB:1,FEBRERO:1,MAR:2,MARZO:2,ABR:3,ABRIL:3,MAY:4,MAYO:4,JUN:5,JUNIO:5,JUL:6,JULIO:6,AGO:7,AGOSTO:7,SEP:8,SEPT:8,SEPTIEMBRE:8,OCT:9,OCTUBRE:9,NOV:10,NOVIEMBRE:10,DIC:11,DICIEMBRE:11};
 function parseNewsDate(card){const iso=Date.parse(card.dataset.publishedAt||'');if(Number.isFinite(iso))return iso;const label=card.querySelector('time')?.textContent?.trim().toUpperCase()||'';const m=label.match(/(\d{1,2})\s+([A-ZÁÉÍÓÚ]+)\s+(\d{4})/);if(!m||months[m[2]]===undefined)return 0;return new Date(Number(m[3]),months[m[2]],Number(m[1])).getTime();}
 function refresh(){const news=$$('#newsList .news');const count=k=>news.filter(x=>x.dataset.kind===k).length;[['evidenceConfirmed','confirmado'],['evidenceReported','reporte'],['evidenceRumor','rumor'],['evidenceDebunked','desmentido']].forEach(([id,k])=>{const el=$('#'+id);if(el)el.textContent=String(count(k));});
 const timeline=$('#timelineList');if(timeline){timeline.replaceChildren();const entries=news.map(n=>({n,t:parseNewsDate(n)})).sort((a,b)=>b.t-a.t);const countEl=$('#timelineCount');if(countEl)countEl.textContent=entries.length+' REGISTROS';entries.slice(0,40).forEach(({n,t})=>{const row=document.createElement('article');row.className='timeline-entry';const time=document.createElement('time');time.textContent=t?new Intl.DateTimeFormat('es-DO',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(t)).toUpperCase():'FECHA SIN DATOS';const body=document.createElement('div'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=n.querySelector('h3')?.textContent||'Registro editorial';p.textContent=n.querySelector('p')?.textContent||'';body.append(h,p);row.append(time,body);timeline.append(row);});}
 const last=Number(read('lf34:lastVisit','0'))||0,fresh=news.filter(n=>{const t=Date.parse(n.dataset.publishedAt||'');return last>0&&Number.isFinite(t)&&t>last;});const countNode=$('#sinceLastVisitCount'),copy=$('#sinceLastVisitText');if(countNode)countNode.textContent=String(fresh.length);if(copy)copy.textContent=last?(fresh.length?fresh.length+' nueva(s) entrada(s) editorial(es) desde tu visita anterior. Revisa la etiqueta y la fuente de cada ficha.':'No se han detectado entradas nuevas desde tu visita anterior.'):'Esta es tu primera visita registrada en este navegador. Las próximas novedades aparecerán aquí.';
 syncFavorites();renderFavorites();}
 refresh();window.addEventListener('newsfeed:updated',refresh);window.addEventListener('catalog:updated',refresh);window.addEventListener('pagehide',()=>write('lf34:lastVisit',String(Date.now())));
 if(!reduced&&matchMedia('(hover:hover) and (pointer:fine)').matches){const hero=$('.hero');hero?.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--pointer-x',(((e.clientX-r.left)/r.width-.5)*8).toFixed(2)+'px');hero.style.setProperty('--pointer-y',(((e.clientY-r.top)/r.height-.5)*6).toFixed(2)+'px');},{passive:true});}
})();



/* Motor editorial Dossier 34 — carga progresiva de los catálogos locales. */
(function(){
 const byId=id=>document.getElementById(id);
 const node=(tag,cls,text)=>{
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(text!==undefined&&text!==null)el.textContent=String(text);
  return el;
 };
 const safeLink=(url,label,cls)=>{
  if(!url)return null;
  try{
   const parsed=new URL(String(url),document.baseURI);
   if(parsed.protocol!=='https:')return null;
   const a=node('a',cls,label||parsed.hostname);
   a.href=parsed.href;a.target='_blank';a.rel='noopener noreferrer';
   return a;
  }catch(_){return null;}
 };
 async function readCatalog(name){
  const response=await fetch('./data/'+name,{cache:'no-cache'});
  if(!response.ok)throw new Error('No se pudo cargar '+name);
  const data=await response.json();
  if(data.schema_version!==1||!Array.isArray(data.items))throw new Error('Esquema inválido: '+name);
  return data;
 }
 const labels={
  confirmado:{css:'confirmed',label:'Confirmado · fuente primaria'},
  reporte:{css:'reported',label:'Reportado · fuente identificada'},
  rumor:{css:'unconfirmed',label:'Rumor / sin confirmar'},
  desmentido:{css:'reported',label:'Desmentido / no demostrado'}
 };
 function sourceLink(id,sources,label){
  const source=sources.get(id);
  if(!source)return null;
  return safeLink(source.url,label||source.name,'source');
 }
 function renderNews(records,sources){
  const box=byId('newsList');if(!box)return;
  const fragment=document.createDocumentFragment(),rendered=[];
  records.forEach(item=>{
   const article=node('article','news');
   article.id='news-'+item.id;article.dataset.kind=item.classification;
   article.dataset.publishedAt=item.date_start||'';article.dataset.editorialId=item.id;
   const time=node('time',null,item.date_label||'FECHA SIN DATOS');
   if(item.date_start)time.dateTime=item.date_start;
   const body=node('div'),meta=node('div','meta');
   const label=labels[item.classification]||labels.reporte;
   meta.append(node('span','tag '+label.css,label.label));
   item.tags?.forEach(tag=>meta.append(node('span','tag system',tag)));
   const h=node('h3',null,item.title),p=node('p',null,item.summary);
   const sourceId=item.source_ids?.[0],source=sources.get(sourceId);
   const a=sourceLink(sourceId,sources,item.source_label||source?.name||'Consultar fuente');
   if(a){a.classList.add('source');body.append(meta,h,p,a);}
   else body.append(meta,h,p);
   article.append(time,body);fragment.append(article);rendered.push(article);
  });
  box.replaceChildren(fragment);
  items.splice(0,items.length,...rendered);
  filterNews();
 }
 function renderCharacters(records,sources){
  const grid=byId('personajes')?.querySelector('.character-grid');if(!grid)return;
  const names=new Map(records.map(x=>[x.id,x.name]));
  const fragment=document.createDocumentFragment();
  records.forEach(person=>{
   const article=node('article','card character-file');article.id=person.id;
   article.dataset.entityType='character';article.dataset.entityId=person.id;
   const portrait=node('div','portrait'),img=node('img');
   img.loading='lazy';img.src=person.image_url;img.alt=person.image_alt||person.name;
   portrait.append(img);
   const body=node('div','character-body');
   body.append(node('span','role',person.role));
   if(person.shared_group)body.append(node('span','tag reported','Biografía compartida · '+person.shared_group));
   body.append(node('h3',null,person.name));
   person.biography.forEach(text=>body.append(node('p',null,text)));
   if(person.facts?.length){
    const list=node('ul','character-facts');
    person.facts.forEach(f=>list.append(node('li',null,f)));
    body.append(list);
   }
   if(person.relations?.length){
    const relations=node('div','character-relations');
    relations.append(node('small',null,'CONEXIONES'));
    person.relations.forEach(rel=>{
     const a=node('a',null,names.get(rel.target_id)||rel.target_id);a.href='#'+rel.target_id;
     a.append(node('small',null,rel.relationship));relations.append(a);
    });
    body.append(relations);
   }
   const source=sourceLink(person.source_ids?.[0],sources,'Ver perfil oficial ↗');
   if(source){source.classList.add('source');body.append(source);}
   article.append(portrait,body);fragment.append(article);
  });
  grid.replaceChildren(fragment);
 }
 function renderRegions(records,characters=[]){
  const grid=byId('regionCards');if(!grid)return;
  const names=new Map(characters.map(person=>[person.id,person.name]));
  const fragment=document.createDocumentFragment();
  records.forEach(region=>{
   const card=node('article','place region-card');card.id=region.id;
   card.dataset.entityType='region';card.dataset.entityId=region.id;
   card.dataset.regionName=region.name;card.dataset.regionType=region.region_type||'';
   const visual=node('div','region-image'),img=node('img');
   img.loading='lazy';img.decoding='async';img.src=region.image_url;img.alt=region.image_alt||('Captura oficial de '+region.name);
   visual.append(img,node('span','region-frame-code','LEONIDA FILES / REGIONAL EVIDENCE'));
   const body=node('div','region-content');
   body.append(node('span','eyebrow',region.region_type_label||'REGIÓN'),node('b',null,region.name),node('span',null,region.description));
   const meta=node('div','region-meta');
   meta.append(node('span',null,String(region.gallery_count||0)+' capturas en la colección oficial'),node('span',null,region.gallery_label||'Galería Rockstar'));
   body.append(meta);
   const gallery=safeLink(region.gallery_url,'Abrir galería oficial ↗','source');
   if(gallery)body.append(gallery);
   if(Array.isArray(region.related_character_ids)&&region.related_character_ids.length){
    const related=node('div','region-related');related.append(node('small',null,'EXPEDIENTES RELACIONADOS'));
    region.related_character_ids.forEach(id=>{
     const link=node('a',null,names.get(id)||id);link.href='#'+id;related.append(link);
    });
    body.append(related);
   }
   card.append(visual,body);fragment.append(card);
  });
  grid.replaceChildren(fragment);
  filterRegionCards();
  window.syncDossierFavorites?.();
 }
 let activeRegion='all';
 function filterRegionCards(){
  const grid=byId('regionCards');if(!grid)return;
  const query=(byId('regionSearch')?.value||'').trim().toLocaleLowerCase('es');
  let visible=0;
  grid.querySelectorAll('.region-card').forEach(card=>{
   const matchesRegion=activeRegion==='all'||card.dataset.entityId===activeRegion;
   const matchesQuery=!query||card.textContent.toLocaleLowerCase('es').includes(query);
   const show=matchesRegion&&matchesQuery;
   card.classList.toggle('hidden',!show);if(show)visible++;
  });
  const count=byId('regionCount');if(count)count.textContent=visible+' / '+grid.querySelectorAll('.region-card').length+' REGIONES';
 }
 byId('regionSearch')?.addEventListener('input',filterRegionCards);
 window.setDossierRegionFilter=value=>{activeRegion=value;filterRegionCards();};
 function renderRadios(records){
  const grid=byId('radios')?.querySelector('.grid.three');if(!grid)return;
  const fragment=document.createDocumentFragment();
  records.forEach(radio=>{
   const card=node('div','card radio-card');card.dataset.entityType='radio';card.dataset.entityId=radio.id;
   if(radio.background_url)card.style.setProperty('--radio-bg','url("'+radio.background_url.replace(/["()]/g,'')+'")');
   const content=node('div','radio-content');
   content.append(node('span','host',radio.hosts));
   const logo=node('img','radio-logo');logo.loading='lazy';logo.src=radio.logo_url;logo.alt=radio.logo_alt||('Logo '+radio.name);
   content.append(logo,node('h3',null,radio.name),node('p',null,radio.description));
   card.append(content);fragment.append(card);
  });
  grid.replaceChildren(fragment);
 }
 function renderSongs(records){
  const grid=byId('tracklist');if(!grid)return;
  const fragment=document.createDocumentFragment();
  records.slice().sort((a,b)=>a.track_number-b.track_number).forEach(song=>{
   const official=song.status==='official_release';
   const card=node('div','track '+(official?'official':'leak'));card.dataset.songId=song.id;card.dataset.editorialStatus=song.status;
   const number=node('span','num',String(song.track_number).padStart(2,'0'));
   const body=node('div'),title=node('b',null,song.title),artist=node('small',null,song.artist);
   const marker=node('small','track-status',official?'Publicado oficialmente':'Lista reportada · no confirmada pista por pista');
   body.append(title,artist,marker);card.append(number,body);fragment.append(card);
  });
  grid.replaceChildren(fragment);
 }
 function renderSources(records){
  const list=byId('sourcesRegister');if(!list)return;
  const fragment=document.createDocumentFragment();
  records.forEach(source=>{
   const a=safeLink(source.url,source.name,'source-entry');
   if(!a)return;
   a.dataset.sourceType=source.type;
   a.append(node('small',null,source.domain+' · '+source.authority));
   fragment.append(a);
  });
  list.replaceChildren(fragment);
  const search=byId('sourceSearch');
  search?.addEventListener('input',()=>{
   const q=search.value.trim().toLocaleLowerCase('es');
   list.querySelectorAll('.source-entry').forEach(el=>el.hidden=!el.textContent.toLocaleLowerCase('es').includes(q));
  });
 }
 function renderVehicleStatus(records){
  const target=byId('hangarCatalogState');if(target){
   target.replaceChildren(node('strong',null,records.length+' FICHAS OFICIALES DESTACADAS'));
   target.append(node('span',null,'Selección de nombres publicados por Rockstar; no representa el total de vehículos de GTA VI.'));
  }
  const grid=byId('vehicleCatalog');if(!grid)return;
  const fragment=document.createDocumentFragment();
  records.forEach(vehicle=>{
   const card=node('article','hangar-card vehicle-card');card.id=vehicle.id;
   card.dataset.entityType='vehicle';card.dataset.entityId=vehicle.id;
   card.dataset.vehicleCategory=vehicle.category||'other';
   const visual=node('div','vehicle-image'),img=node('img');
   img.loading='lazy';img.decoding='async';img.src=vehicle.image_url;img.alt=vehicle.image_alt||('Imagen oficial de '+vehicle.name);
   visual.append(img,node('span','vehicle-index-stamp','HANGAR 34 / OFFICIAL REFERENCE'));
   const body=node('div','vehicle-body'),meta=node('div','vehicle-meta');
   meta.append(node('span','vehicle-category',vehicle.category_label||'Transporte'));
   meta.append(node('span','vehicle-evidence',vehicle.evidence_label||'Referencia oficial'));
   body.append(meta,node('h3',null,vehicle.name),node('p','vehicle-maker',vehicle.manufacturer||'Fabricante no especificado'),node('p',null,vehicle.description));
   body.append(node('div','vehicle-edition',vehicle.edition_context||'Contexto oficial no especificado'));
   const gallery=safeLink(vehicle.gallery_url,'Ver imagen y galería oficial ↗','source');if(gallery)body.append(gallery);
   const sources=node('div','vehicle-sources');
   (vehicle.source_ids||[]).forEach(id=>{const source=sourceMapForVehicle.get(id);if(source){const link=safeLink(source.url,source.domain,'vehicle-source-link');if(link)sources.append(link);}});
   if(sources.childNodes.length)body.append(sources);
   card.append(visual,body);fragment.append(card);
  });
  grid.replaceChildren(fragment);
  filterVehicleCards();
  window.syncDossierFavorites?.();
 }
 let activeVehicle='all';
 const sourceMapForVehicle=new Map();
 function filterVehicleCards(){
  const grid=byId('vehicleCatalog');if(!grid)return;
  const query=(byId('vehicleSearch')?.value||'').trim().toLocaleLowerCase('es');
  let visible=0;
  grid.querySelectorAll('.vehicle-card').forEach(card=>{
   const matchesType=activeVehicle==='all'||card.dataset.vehicleCategory===activeVehicle;
   const matchesQuery=!query||card.textContent.toLocaleLowerCase('es').includes(query);
   const show=matchesType&&matchesQuery;
   card.classList.toggle('hidden',!show);if(show)visible++;
  });
  const count=byId('vehicleCount');if(count)count.textContent=visible+' / '+grid.querySelectorAll('.vehicle-card').length+' REGISTROS';
 }
 byId('vehicleSearch')?.addEventListener('input',filterVehicleCards);
 window.setDossierVehicleFilter=value=>{activeVehicle=value;filterVehicleCards();};
 async function loadStructuredCatalogs(){
  const status=byId('catalogStatus');
  const names=['sources.json','news.json','characters.json','regions.json','radios.json','songs.json','vehicles.json'];
  const loaded=await Promise.all(names.map(name=>readCatalog(name).catch(()=>null)));
  const data={};names.forEach((name,i)=>{data[name.replace('.json','')]=loaded[i];});
  if(!data.sources){
   if(status)status.textContent='Catálogos estructurados no disponibles; se conserva la versión estática de respaldo.';
   return;
  }
  const sources=new Map(data.sources.items.map(item=>[item.id,item]));
  sourceMapForVehicle.clear();data.sources.items.forEach(item=>sourceMapForVehicle.set(item.id,item));
  if(data.news)renderNews(data.news.items,sources);
  if(data.characters)renderCharacters(data.characters.items,sources);
  if(data.regions)renderRegions(data.regions.items,data.characters?.items||[]);
  if(data.radios)renderRadios(data.radios.items);
  if(data.songs)renderSongs(data.songs.items);
  if(data.vehicles)renderVehicleStatus(data.vehicles.items);
  renderSources(data.sources.items);
  if(status){
   status.replaceChildren(node('strong',null,'CATÁLOGOS CONECTADOS'),document.createTextNode(' · '+
    (data.news?.items.length||0)+' noticias · '+(data.characters?.items.length||0)+' expedientes · '+
    (data.regions?.items.length||0)+' regiones · '+(data.radios?.items.length||0)+' emisoras · '+
    (data.songs?.items.length||0)+' pistas · '+(data.vehicles?.items.length||0)+' vehículos · '+data.sources.items.length+' fuentes'));
  }
  window.dispatchEvent(new Event('catalog:updated'));
 }
 window.loadStructuredCatalogs=loadStructuredCatalogs;
 loadStructuredCatalogs().then(loadAutoNewsFeed).catch(()=>loadAutoNewsFeed());
})();

