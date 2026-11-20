(()=>{'use strict';
const root=document.getElementById('vehicle-lab');if(!root)return;
const $=id=>document.getElementById(id);
const el={
 search:$('vehicleResearchSearch'),klass:$('vehicleResearchClass'),evidence:$('vehicleResearchEvidence'),
 scanned:$('vehicleResearchScanned'),list:$('vehicleResearchList'),count:$('vehicleResearchCount'),
 base:$('vehicleLabBase'),listed:$('vehicleLabListed'),stats:$('vehicleLabStats'),
 standout:$('vehicleLabStandout'),progress:$('vehicleScanProgress'),
 progressText:$('vehicleScanText'),subtext:$('vehicleScanSubtext'),extra:$('vehicleScanExtra'),
 classSummary:$('vehicleResearchClassSummary')
};
const storageKey='lf34:vehicle-research-scan';
let catalogue=null,records=[],sources=new Map(),state={scanned:[],extra:0};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const labels={speed:'Velocidad',acceleration:'Aceleración',handling:'Manejo',offroad:'Manejo off-road',durability:'Durabilidad'};
function loadState(){
 try{const p=JSON.parse(localStorage.getItem(storageKey)||'{}');if(p&&Array.isArray(p.scanned))state=p;}
 catch(_){state={scanned:[],extra:0};}
 state.scanned=[...new Set(state.scanned)];
}
function saveState(){
 try{localStorage.setItem(storageKey,JSON.stringify(state));}
 catch(_){el.subtext.textContent='El almacenamiento local no está disponible en este navegador.';}
}
function sourceLink(id){
 const source=sources.get(id);
 if(!source||!/^https:\/\//.test(source.url||''))return null;
 const a=document.createElement('a');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';
 a.textContent=source.outlet||source.title||id;return a;
}
function isScanned(vehicle){return state.scanned.includes(vehicle.id);}
function updateProgress(){
 const total=state.scanned.length+Math.max(0,Number(state.extra)||0);
 el.progress.value=Math.min(200,total);
 el.progressText.textContent=Math.min(total,200)+' / 200';
 el.subtext.textContent=state.scanned.length+' fichas marcadas + '+Math.max(0,Number(state.extra)||0)+' modelos fuera de esta lista · '+Math.max(0,200-total)+' pendientes';
 el.extra.value=String(state.extra||0);
}
function render(){
 const query=norm(el.search.value),klass=el.klass.value,evidence=el.evidence.value,scanFilter=el.scanned.value;
 const rows=records.filter(v=>{
  const text=norm([v.name,v.make,v.classLabel,v.notes,v.how?.text,v.spawn?.locations?.join(' ')].join(' '));
  const multi=v.nameEvidence==='multiple_independent_sources';
  const hasStats=Object.keys(v.stats||{}).length>0;
  const scanned=isScanned(v);
  return (!query||text.includes(query))&&(klass==='all'||v.class===klass)&&
   (evidence==='all'||(evidence==='multiple'&&multi)||(evidence==='single'&&!multi)||(evidence==='stats'&&hasStats)||(evidence==='no-stats'&&!hasStats))&&
   (scanFilter==='all'||(scanFilter==='scanned'&&scanned)||(scanFilter==='not-scanned'&&!scanned));
 }).sort((a,b)=>(b.stats?.speed?.value??-1)-(a.stats?.speed?.value??-1));
 el.count.textContent=rows.length+' / '+records.length+' fichas · '+rows.filter(v=>Object.keys(v.stats||{}).length).length+' con barras WAiNK en este filtro';
 el.list.replaceChildren();
 if(!rows.length){const p=document.createElement('p');p.className='muted';p.textContent='No hay modelos con esos filtros.';el.list.append(p);return;}
 const frag=document.createDocumentFragment();
 for(const v of rows){
  const card=document.createElement('article');card.className='vehicle-research-card';card.dataset.vehicleId=v.id;
  const heading=document.createElement('div');heading.className='vehicle-research-title';
  const h=document.createElement('h4');h.textContent=v.name;
  const badge=document.createElement('span');badge.className='vehicle-mini-tag';
  badge.textContent=v.nameEvidence==='multiple_independent_sources'?'Nombre · 2+ fuentes':'Nombre · una fuente / pendiente';
  heading.append(h,badge);
  const make=document.createElement('span');make.className='vehicle-make';
  make.textContent=(v.make||'Marca no especificada')+' · '+(v.classLabel||v.class);
  card.append(heading,make);
  const metrics=document.createElement('div');metrics.className='vehicle-stat-grid';
  for(const key of ['speed','acceleration','handling','offroad','durability']){
   const item=v.stats?.[key];if(!item)continue;
   const stat=document.createElement('div');stat.className='vehicle-stat';
   const head=document.createElement('div');head.className='vehicle-stat-head';
   const label=document.createElement('span');label.textContent=labels[key]||key;
   const value=document.createElement('b');value.textContent=Number(item.value).toFixed(1)+'/10';
   head.append(label,value);
   const track=document.createElement('div');track.className='vehicle-stat-track';
   const fill=document.createElement('i');fill.style.width=Math.max(0,Math.min(100,Number(item.value)*10))+'%';track.append(fill);
   stat.append(head,track);metrics.append(stat);
  }
  if(metrics.childElementCount)card.append(metrics);
  else{const p=document.createElement('p');p.textContent='No hay barras WAiNK publicadas para este modelo en el conjunto consultado.';card.append(p);}
  const statBadge=document.createElement('span');statBadge.className='vehicle-mini-tag';
  statBadge.textContent=v.statEvidence==='single_guide_pending'?'Rendimiento · una guía':'Rendimiento · sin dato';
  card.append(statBadge);
  const details=document.createElement('details'),summary=document.createElement('summary');
  summary.textContent='Cómo conseguirlo, ubicación y notas';details.append(summary);
  if(v.how?.text){const p=document.createElement('p');p.textContent='Obtención: '+v.how.text;details.append(p);}
  if(v.spawn?.locations?.length){const p=document.createElement('p');p.textContent='Ubicación reportada: '+v.spawn.locations.join(' · ');details.append(p);}
  if(v.security){const p=document.createElement('p');p.textContent='Seguridad: '+v.security;details.append(p);}
  if(v.registrationFee!==null&&v.registrationFee!==undefined){const p=document.createElement('p');p.textContent='Tarifa de registro atribuida: $'+v.registrationFee;details.append(p);}
  if(v.scanSaleValue!==null&&v.scanSaleValue!==undefined){const p=document.createElement('p');p.textContent='Valor de venta WAiNK atribuido: $'+v.scanSaleValue;details.append(p);}
  if(v.modShop){const p=document.createElement('p');p.textContent='Taller asociado en la base: '+v.modShop;details.append(p);}
  if(v.notes){const p=document.createElement('p');p.textContent='Nota editorial: '+v.notes;details.append(p);}
  const sourceWrap=document.createElement('div');sourceWrap.className='vehicle-research-sources';
  (v.sourceIds||[]).slice(0,8).forEach(id=>{const a=sourceLink(id);if(a)sourceWrap.append(a);});
  if(sourceWrap.childElementCount)details.append(sourceWrap);
  card.append(details);
  const scan=document.createElement('button');scan.type='button';scan.className='vehicle-scan-toggle';
  scan.setAttribute('aria-pressed',String(isScanned(v)));
  scan.textContent=isScanned(v)?'✓ Escaneado en WAiNK':'Marcar como escaneado';
  scan.addEventListener('click',()=>{
   const set=new Set(state.scanned);if(set.has(v.id))set.delete(v.id);else set.add(v.id);
   state.scanned=[...set];saveState();updateProgress();render();
  });
  card.append(scan);frag.append(card);
 }
 el.list.append(frag);
}
function populate(){
 for(const item of catalogue.classes||[]){
  const option=document.createElement('option');option.value=item.id;option.textContent=item.name+' · '+item.count.v;
  el.klass.append(option);
 }
 const summary=document.createElement('div');summary.className='vehicle-class-summary';
 const p=document.createElement('p');p.textContent=(catalogue.classes||[]).map(c=>c.name+': '+c.count.v).join(' · ');
 summary.append(p);
 const note=document.createElement('p');note.textContent='Censo comunitario citado en la base: 157 coches, 29 bicicletas/motos, 28 acuáticos, 16 aeronaves y 47 de servicio. Las cifras son orientativas y pueden cambiar.';summary.append(note);
 const mechanics=document.createElement('ul');
 for(const item of catalogue.mechanics||[]){const li=document.createElement('li');li.textContent=item.fact;mechanics.append(li);}
 summary.append(mechanics);el.classSummary.replaceChildren(summary);
}
async function init(){
 loadState();
 const responses=await Promise.all([
  fetch('./data/vehicle-research.json',{cache:'no-cache'}),
  fetch('./data/sources.json',{cache:'no-cache'})
 ]);
 if(!responses[0].ok||!responses[1].ok)throw new Error('No se pudo cargar la base de vehículos');
 catalogue=await responses[0].json();
 const sourceData=await responses[1].json();
 sources=new Map((catalogue.sources||[]).map(x=>[x.id,x]));
 records=(catalogue.items||[]).map(v=>({
  ...v,
  classLabel:(catalogue.classes||[]).find(c=>c.id===v.class)?.name||'Clase no verificada'
 }));
 el.base.textContent=String(catalogue.totals?.base?.v||277);
 el.listed.textContent=String(records.length);
 el.stats.textContent=String(records.filter(v=>Object.keys(v.stats||{}).length).length);
 el.standout.textContent=String(catalogue.totals?.standout?.v||280);
 populate();
 [el.search,el.klass,el.evidence,el.scanned].forEach(control=>{
  control.addEventListener(control===el.search?'input':'change',render);
 });
 el.extra.addEventListener('change',()=>{
  state.extra=Math.max(0,Math.min(277,Number(el.extra.value)||0));
  saveState();updateProgress();
 });
 updateProgress();render();
}
init().catch(()=>{
 el.list.replaceChildren();
 const p=document.createElement('p');p.className='muted';
 p.textContent='La base de vehículos no está disponible. El Hangar 34 y sus fichas oficiales siguen funcionando.';
 el.list.append(p);
});
})();