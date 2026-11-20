(()=>{'use strict';
const root=document.getElementById('trucos');if(!root)return;
const $=id=>document.getElementById(id);
const cheatEl={search:$('cheatSearch'),category:$('cheatCategory'),count:$('cheatCount'),list:$('cheatList')};
const secretEl={search:$('secretSearch'),evidence:$('secretEvidence'),spoilers:$('secretSpoilers'),count:$('secretCount'),list:$('secretList')};
let cheats=[],secrets=[],sources=new Map();
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function safeSource(id){
 const source=sources.get(id);
 if(!source||!/^https:\/\//.test(source.url||''))return null;
 const a=document.createElement('a');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';
 a.textContent=source.name||source.domain||id;return a;
}
function make(tag,className,text){
 const el=document.createElement(tag);if(className)el.className=className;
 if(text!==undefined)el.textContent=String(text);return el;
}
function renderCheats(){
 const q=normalize(cheatEl.search.value),category=cheatEl.category.value;
 const rows=cheats.filter(item=>(category==='all'||item.category===category)&&
  (!q||normalize([item.name,item.unlock,item.effect,item.sequence?.join(' ')].join(' ')).includes(q)));
 cheatEl.count.textContent=rows.length+' / '+cheats.length+' fichas';
 cheatEl.list.replaceChildren();const frag=document.createDocumentFragment();
 for(const item of rows){
  const card=make('article','cheat-card'),meta=make('div','cheat-meta');
  const type=make('span','cheat-mini-tag',item.category==='player'?'Personaje / mundo':item.category==='combat'?'Combate':'Vehículo');
  const status=make('span','cheat-mini-tag',item.sequence?'Secuencia publicada':'Secuencia no publicada');
  meta.append(type,status);
  const h=make('h4','',item.name),effect=make('p','',item.effect||'Efecto no documentado.');
  const sequence=make('div','cheat-code'+(item.sequence?'':' not-published'),
   item.sequence?item.sequence.join('  '):'Código de cruceta no publicado');
  const unlock=make('p','', 'Desbloqueo: '+(item.unlock||'No documentado.'));
  card.append(meta,h,effect,sequence,unlock);
  if(item.unlockStatus==='discrepancy'){
   card.append(make('p','cheat-footnote','Las guías consultadas no coinciden en el requisito. Se conserva la discrepancia.'));
  }else if(item.unlockStatus==='unknown'){
   card.append(make('p','cheat-footnote','El requisito no está especificado en la guía que publica esta secuencia.'));
  }
  const links=make('div','vehicle-research-sources');
  (item.sourceIds||[]).forEach(id=>{const a=safeSource(id);if(a)links.append(a);});
  if(links.childElementCount)card.append(links);
  frag.append(card);
 }
 cheatEl.list.append(frag);
}
function renderSecrets(){
 const q=normalize(secretEl.search.value),evidence=secretEl.evidence.value;
 const rows=secrets.filter(item=>(evidence==='all'||item.evidence===evidence)&&
  (!q||normalize([item.title,item.location,item.summary,item.details,item.county].join(' ')).includes(q)));
 secretEl.count.textContent=rows.length+' / '+secrets.length+' hallazgos';
 secretEl.list.replaceChildren();const frag=document.createDocumentFragment();
 for(const item of rows){
  const card=make('article','secret-card'),meta=make('div','secret-meta');
  const tag=make('span','secret-mini-tag '+(item.evidence==='rumor'?'rumor':'reported'),item.evidenceLabel);
  meta.append(tag);if(item.spoiler)meta.append(make('span','secret-mini-tag','SPOILER'));
  card.append(meta,make('h4','',item.title),make('p','',item.summary),
   make('p','','Lugar: '+(item.location||'Sin ubicación exacta')+(item.county?' · '+item.county:'')));
  if(secretEl.spoilers.checked&&item.spoiler){
   const details=document.createElement('details'),summary=make('summary','','Ver procedimiento y detalles');
   const body=make('div','secret-details');
   body.append(make('p','',item.details||''));
   if(item.reward)body.append(make('p','','Recompensa reportada: '+item.reward));
   if(item.codes?.length)body.append(make('p','','Códigos reportados: '+item.codes.join(' · ')));
   const links=make('div','vehicle-research-sources');
   (item.sourceIds||[]).forEach(id=>{const a=safeSource(id);if(a)links.append(a);});
   if(links.childElementCount)body.append(links);
   details.append(summary,body);card.append(details);
  }else if(item.spoiler){
   card.append(make('p','secret-footnote','Detalles ocultos. Activa “Mostrar detalles con spoilers” para leerlos.'));
   const sourceWrap=make('div','vehicle-research-sources');
   (item.sourceIds||[]).forEach(id=>{const a=safeSource(id);if(a)sourceWrap.append(a);});
   if(sourceWrap.childElementCount)card.append(sourceWrap);
  }
  frag.append(card);
 }
 secretEl.list.append(frag);
}
async function init(){
 const responses=await Promise.all([
  fetch('./data/cheats.json',{cache:'no-cache'}),
  fetch('./data/secrets.json',{cache:'no-cache'}),
  fetch('./data/sources.json',{cache:'no-cache'})
 ]);
 if(responses.some(r=>!r.ok))throw new Error('No se pudieron cargar los catálogos de campo');
 const cheatData=await responses[0].json(),secretData=await responses[1].json(),sourceData=await responses[2].json();
 cheats=cheatData.items||[];secrets=secretData.items||[];
 sources=new Map((sourceData.items||[]).map(item=>[item.id,item]));
 cheatEl.search.addEventListener('input',renderCheats);cheatEl.category.addEventListener('change',renderCheats);
 secretEl.search.addEventListener('input',renderSecrets);secretEl.evidence.addEventListener('change',renderSecrets);
 secretEl.spoilers.addEventListener('change',renderSecrets);
 renderCheats();renderSecrets();
}
init().catch(()=>{
 cheatEl.list.replaceChildren(make('p','muted','No se pudo cargar el archivo de trucos.'));
 secretEl.list.replaceChildren(make('p','muted','No se pudo cargar el archivo de secretos.'));
});
})();