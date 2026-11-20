(()=>{'use strict';
const root=document.getElementById('atlasInteractive');
if(!root)return;
const $=id=>document.getElementById(id);
const el={
 viewport:$('atlasMapViewport'),stage:$('atlasMapStage'),zoom:$('atlasZoomRange'),
 count:$('atlasDirectoryCount'),list:$('atlasDirectoryList'),search:$('atlasDirectorySearch'),
 county:$('atlasDirectoryCounty'),region:$('atlasDirectoryRegion'),type:$('atlasDirectoryType'),
 evidence:$('atlasDirectoryEvidence'),out:$('atlasZoomOut'),in:$('atlasZoomIn'),reset:$('atlasMapReset')
};
const storeKey='lf34:atlas-interactive-state';
let state={items:{}},records=[],sources=new Map(),zoom=1,panX=0,panY=0,drag=null;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
function loadState(){
 try{const p=JSON.parse(localStorage.getItem(storeKey)||'{}');if(p&&typeof p==='object'&&p.items)state=p;}
 catch(_){state={items:{}}}
}
function saveState(){
 try{localStorage.setItem(storeKey,JSON.stringify(state));}
 catch(_){if(el.count)el.count.textContent+=' · guardado local no disponible';}
}
function sourceLink(sourceId){
 const source=sources.get(sourceId);
 if(!source||!/^https:\/\//.test(source.url||''))return null;
 const a=document.createElement('a');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';
 a.textContent=source.name||source.domain||'Fuente';return a;
}
function setZoom(value){
 zoom=Math.max(1,Math.min(4,Number(value)||1));
 el.zoom.value=String(zoom);
 el.stage.style.setProperty('--map-zoom',String(zoom));
 el.stage.style.setProperty('--pan-x',panX+'px');
 el.stage.style.setProperty('--pan-y',panY+'px');
}
function resetView(){zoom=1;panX=0;panY=0;setZoom(zoom);}
function changeZoom(delta){setZoom(zoom+delta);}
el.zoom?.addEventListener('input',()=>setZoom(el.zoom.value));
el.out?.addEventListener('click',()=>changeZoom(-0.2));
el.in?.addEventListener('click',()=>changeZoom(0.2));
el.reset?.addEventListener('click',resetView);
el.viewport?.addEventListener('wheel',event=>{
 event.preventDefault();changeZoom(event.deltaY<0?0.15:-0.15);
},{passive:false});
el.viewport?.addEventListener('pointerdown',event=>{
 if(event.target.closest('button'))return;
 drag={x:event.clientX,y:event.clientY,px:panX,py:panY,id:event.pointerId};
 el.viewport.setPointerCapture(event.pointerId);
 el.viewport.classList.add('is-dragging');
});
el.viewport?.addEventListener('pointermove',event=>{
 if(!drag||drag.id!==event.pointerId)return;
 panX=drag.px+(event.clientX-drag.x);
 panY=drag.py+(event.clientY-drag.y);
 setZoom(zoom);
});
function stopDrag(event){
 if(drag&&(!event||drag.id===event.pointerId)){
  drag=null;el.viewport?.classList.remove('is-dragging');
 }
}
el.viewport?.addEventListener('pointerup',stopDrag);
el.viewport?.addEventListener('pointercancel',stopDrag);
el.viewport?.addEventListener('lostpointercapture',stopDrag);
el.viewport?.addEventListener('keydown',event=>{
 if(event.key==='+'||event.key==='='){event.preventDefault();changeZoom(0.2);}
 else if(event.key==='-'){event.preventDefault();changeZoom(-0.2);}
 else if(event.key==='0'){event.preventDefault();resetView();}
 else if(event.key.startsWith('Arrow')){
  event.preventDefault();
  panX+=event.key==='ArrowLeft'?30:event.key==='ArrowRight'?-30:0;
  panY+=event.key==='ArrowUp'?30:event.key==='ArrowDown'?-30:0;
  setZoom(zoom);
 }
});
function fillSelect(select,values){
 if(!select)return;
 for(const value of values){
  const option=document.createElement('option');
  if(typeof value==='string'){option.value=value;option.textContent=value;}
  else{option.value=value.id;option.textContent=value.name;}
  select.append(option);
 }
}
function render(){
 const query=norm(el.search.value),county=el.county.value,region=el.region.value;
 const type=el.type.value,evidence=el.evidence.value;
 const filtered=records.filter(item=>{
  const text=norm([item.name,item.summary,item.details,item.county,item.regionLabel,item.typeLabel].join(' '));
  return (!query||text.includes(query))&&(county==='all'||item.county===county)&&
   (region==='all'||item.region===region)&&(type==='all'||item.type===type)&&
   (evidence==='all'||item.evidence===evidence);
 });
 const official=filtered.filter(x=>x.evidence==='official_map_label').length;
 el.count.textContent=filtered.length+' / '+records.length+' lugares · '+official+' rótulos oficiales';
 el.list.replaceChildren();
 if(!filtered.length){
  const p=document.createElement('p');p.className='muted';p.textContent='No hay lugares que coincidan con esos filtros.';
  el.list.append(p);return;
 }
 const fragment=document.createDocumentFragment();
 for(const item of filtered){
  const card=document.createElement('article');card.className='atlas-point-card';card.dataset.pointId=item.id;
  const meta=document.createElement('div');meta.className='atlas-point-meta';
  const evidence=document.createElement('span');
  evidence.className='atlas-mini-tag '+(item.evidence==='official_map_label'?'official':item.evidence==='rumor'?'rumor':'reported');
  evidence.textContent=item.evidenceLabel;meta.append(evidence);
  if(item.county){const countyTag=document.createElement('span');countyTag.className='atlas-mini-tag';countyTag.textContent=item.county;meta.append(countyTag);}
  if(item.region){
   const regionName=(root.dataset.regionNames||'').split('|').find(x=>x.startsWith(item.region+':'))?.split(':')[1]||item.region;
   const regionTag=document.createElement('span');regionTag.className='atlas-mini-tag';regionTag.textContent=regionName;meta.append(regionTag);
  }
  const heading=document.createElement('h4');heading.textContent=item.name;
  const summary=document.createElement('p');summary.textContent=item.summary||'';
  card.append(meta,heading,summary);
  const details=document.createElement('details'),detailLabel=document.createElement('summary');
  detailLabel.textContent=item.spoiler?'Ver detalles (puede contener spoilers)':'Detalles y fuente';
  details.append(detailLabel);
  const body=document.createElement('div');body.className='atlas-point-notes';
  if(item.details){const p=document.createElement('p');p.textContent=item.details;body.append(p);}
  const sourceWrap=document.createElement('div');sourceWrap.className='vehicle-research-sources';
  (item.sourceIds||[]).forEach(id=>{const link=sourceLink(id);if(link)sourceWrap.append(link);});
  if(sourceWrap.childElementCount)body.append(sourceWrap);
  details.append(body);card.append(details);
  const saved=state.items[item.id]||{visited:false,favorite:false,note:''};
  const actions=document.createElement('div');actions.className='atlas-point-actions';
  const visited=document.createElement('button');visited.type='button';
  visited.textContent=saved.visited?'✓ Visitado':'Marcar visitado';
  visited.setAttribute('aria-pressed',String(!!saved.visited));
  visited.addEventListener('click',()=>{
   const current=state.items[item.id]||{};current.visited=!current.visited;
   state.items[item.id]=current;saveState();render();
  });
  const favorite=document.createElement('button');favorite.type='button';
  favorite.textContent=saved.favorite?'★ Favorito':'☆ Favorito';
  favorite.setAttribute('aria-pressed',String(!!saved.favorite));
  favorite.addEventListener('click',()=>{
   const current=state.items[item.id]||{};current.favorite=!current.favorite;
   state.items[item.id]=current;saveState();render();
  });
  actions.append(visited,favorite);card.append(actions);
  const noteDetails=document.createElement('details'),noteSummary=document.createElement('summary');
  noteSummary.textContent='Mi nota privada';noteDetails.append(noteSummary);
  const note=document.createElement('textarea');note.maxLength=1000;
  note.placeholder='Anota tu hallazgo o la referencia de tu partida…';note.value=saved.note||'';
  note.addEventListener('change',()=>{
   const current=state.items[item.id]||{};current.note=note.value;
   state.items[item.id]=current;saveState();
  });
  noteDetails.append(note);card.append(noteDetails);fragment.append(card);
 }
 el.list.append(fragment);
}
async function init(){
 loadState();
 const responses=await Promise.all([
  fetch('./data/atlas-points.json',{cache:'no-cache'}),
  fetch('./data/sources.json',{cache:'no-cache'})
 ]);
 if(!responses[0].ok||!responses[1].ok)throw new Error('No se pudieron cargar los catálogos del Atlas');
 const data=await responses[0].json(),sourceData=await responses[1].json();
 records=data.items||[];sources=new Map((sourceData.items||[]).map(x=>[x.id,x]));
 fillSelect(el.county,data.countyOptions||[]);fillSelect(el.region,data.regionOptions||[]);
 const types=[...new Map(records.map(x=>[x.type,x.typeLabel||x.type])).entries()]
  .map(([id,name])=>({id,name}));
 fillSelect(el.type,types);
 [el.search,el.county,el.region,el.type,el.evidence].forEach(control=>{
  control?.addEventListener(control===el.search?'input':'change',render);
 });
 resetView();render();
}
init().catch(()=>{
 el.list.replaceChildren();
 const p=document.createElement('p');p.className='muted';
 p.textContent='El directorio no pudo cargarse. El póster oficial sigue disponible arriba.';
 el.list.append(p);
});
})();