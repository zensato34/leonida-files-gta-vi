(()=>{'use strict';
const section=document.getElementById('guia');if(!section)return;
const catalog=document.getElementById('guideCatalog');const quickTips=document.getElementById('guideQuickTips');const externalSources=document.getElementById('guideExternalSources');const search=document.getElementById('guideSearch');const status=document.getElementById('guideStatus');const empty=document.getElementById('guideEmpty');const spoilerToggle=document.getElementById('guideSpoilers');const filterButtons=[...section.querySelectorAll('[data-guide-filter]')];
const storageKey='dossier34-guide-spoilers';let filter='all';let categories=[];let spoilers=false;
try{spoilers=localStorage.getItem(storageKey)==='true'}catch(_){spoilers=false}spoilerToggle.checked=spoilers;
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function node(tag,className,value){const el=document.createElement(tag);if(className)el.className=className;if(value!==undefined)el.textContent=String(value);return el}
function renderEntry(entry){
 const el=node('article','guide-entry');el.dataset.status=entry.status||'pending';el.dataset.spoiler=entry.spoiler===true?'true':'false';el.append(node('span','guide-state',entry.status_label||'Pendiente de verificación'));
 const heading=node('h4','',entry.title||'Ficha sin título');if(entry.spoiler===true)heading.append(node('span','guide-spoiler-tag','SPOILER'));el.append(heading);el.append(node('p','',entry.summary||'Sin descripción editorial.'));
 const fields=[];if(entry.location_details)fields.push(['Ubicación',entry.location_details]);if(entry.unlock_requirement)fields.push(['Requisito para desbloquear',entry.unlock_requirement]);if(entry.reward)fields.push(['Recompensa',entry.reward]);if(entry.missable===true)fields.push(['Aviso','Esta ficha está marcada como perdible. Comprueba sus requisitos antes de avanzar.']);[['Requisitos',entry.requirements],['Pasos',entry.steps]].forEach(([title,items])=>{if(Array.isArray(items)&&items.length)fields.push([title,items])});
 if(fields.length){const box=node('details','guide-entry-details');box.append(node('summary','','Ver detalles de la ficha'));fields.forEach(([title,value])=>{box.append(node('strong','guide-detail-heading',title));if(Array.isArray(value)){const list=node('ul','guide-detail-list');value.forEach(item=>list.append(node('li','',item)));box.append(list)}else box.append(node('p','',value))});el.append(box)}
 const sources=entry.verification&&Array.isArray(entry.verification.sources)?entry.verification.sources:[];sources.forEach(source=>{if(!source||typeof source.url!=='string'||!/^https:\/\//i.test(source.url))return;const a=node('a','','Fuente: '+(source.title||'consultar')+' ↗');a.href=source.url;a.target='_blank';a.rel='noopener';el.append(a)});
 return el
}
function safeSourceLink(source,label){
 if(!source||typeof source.url!=='string'||!/^https:\/\//i.test(source.url))return null;
 let parsed;try{parsed=new URL(source.url)}catch(_){return null}
 if(parsed.username||parsed.password)return null;
 const a=node('a','guide-external-link',label||source.title||'Abrir guía externa ↗');
 a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';return a
}
function renderExternalResearch(data){
 if(quickTips){
  quickTips.replaceChildren();
  const tips=Array.isArray(data.quick_tips)?data.quick_tips:[];
  tips.forEach(tip=>{
   const card=node('article','guide-tip-card');card.dataset.guideExternalCard='';card.dataset.spoiler=tip.spoiler===true?'true':'false';
   card.append(node('span','guide-state',tip.status_label||'Consejo externo · atribuido'));
   if(tip.category_label)card.append(node('span','guide-tip-category',tip.category_label));
   card.append(node('h4','',tip.title||'Consejo de lanzamiento'));
   card.append(node('p','',tip.summary||'Sin resumen disponible.'));
   const refs=node('div','guide-external-links');
   (Array.isArray(tip.sources)?tip.sources:[]).forEach(source=>{const link=safeSourceLink(source);if(link)refs.append(link)});
   if(refs.childNodes.length)card.append(refs);
   quickTips.append(card);
  });
 }
 if(externalSources){
  externalSources.replaceChildren();
  const items=Array.isArray(data.external_references)?data.external_references:[];
  items.forEach(item=>{
   const card=node('article','guide-external-card');card.dataset.guideExternalCard='';card.dataset.spoiler=item.spoiler===true?'true':'false';
   const top=node('div','guide-external-meta');top.append(node('span','guide-state',item.status_label||'Guía externa · atribución editorial'));
   top.append(node('span','guide-external-provider',item.provider||'Medio externo'));
   card.append(top);
   card.append(node('span','guide-tip-category',item.topic||'Guía de GTA VI'));
   card.append(node('h4','',item.title||'Recurso externo'));
   card.append(node('p','',item.description||'Descripción no disponible.'));
   const footer=node('div','guide-external-footer');
   footer.append(node('small','',item.published_at||'Fecha no indicada'));
   const link=safeSourceLink({url:item.url,title:item.provider||'Abrir fuente'},'Leer guía ↗');
   if(link)footer.append(link);
   card.append(footer);externalSources.append(card);
  });
 }
}
function render(data){categories=data.categories;renderExternalResearch(data);catalog.replaceChildren();categories.forEach((item,index)=>{const entries=Array.isArray(item.entries)?item.entries:[];const verified=entries.filter(entry=>entry.status==='verified').length;const card=node('article','guide-card');card.dataset.guideCard='';card.dataset.guideId=item.id;card.dataset.status=verified>0?'verified':'pending';card.dataset.spoiler=item.spoiler===true?'true':'false';const top=node('div','guide-card-top');top.append(node('span','guide-index',String(index+1).padStart(2,'0')));top.append(node('span','guide-state',item.status_label||'Pendiente de verificación'));card.append(top);card.append(node('h3','',item.title));card.append(node('p','',item.description));if(entries.length){const list=node('div','guide-entry-list');entries.forEach(entry=>list.append(renderEntry(entry)));card.append(list)}const bottom=node('div','guide-card-bottom');bottom.append(node('span','',entries.length+' fichas publicadas'));bottom.append(node('span','',String(item.id).replace(/-/g,' ').toUpperCase()));card.append(bottom);catalog.append(card)});applyFilters()}
function applyFilters(){
 const cards=[...catalog.querySelectorAll('[data-guide-card]')];let visible=0;
 for(const card of cards){
  const spoilerEntries=[...card.querySelectorAll('.guide-entry[data-spoiler="true"]')];
  spoilerEntries.forEach(entry=>{entry.hidden=!spoilers});
  const statusMatch=filter==='all'||(filter==='verified'?card.dataset.status==='verified':card.dataset.status!=='verified');
  const searchMatch=!normalize(search.value)||normalize(card.textContent).includes(normalize(search.value));
  const hasVisibleEntries=[...card.querySelectorAll('.guide-entry')].some(entry=>!entry.hidden);
  const cardMatch=statusMatch&&searchMatch&&(spoilers||!card.querySelector('.guide-entry[data-spoiler="true"]')||hasVisibleEntries);
  card.hidden=!cardMatch;if(cardMatch)visible++;
 }
 const externalCards=[...section.querySelectorAll('[data-guide-external-card]')];let externalVisible=0;
 externalCards.forEach(card=>{
  const matches=!normalize(search.value)||normalize(card.textContent).includes(normalize(search.value));
  const spoilerBlocked=card.dataset.spoiler==='true'&&!spoilers;
  card.hidden=!matches||spoilerBlocked;if(!card.hidden)externalVisible++;
 });
 empty.hidden=visible!==0;
 const totalEntries=categories.reduce((sum,item)=>sum+(Array.isArray(item.entries)?item.entries.length:0),0);
 const verifiedEntries=categories.reduce((sum,item)=>sum+(Array.isArray(item.entries)?item.entries.filter(entry=>entry.status==='verified').length:0),0);
 status.textContent=cards.length+' módulos · '+verifiedEntries+' fichas propias verificadas de '+totalEntries+' publicadas · '+externalVisible+' referencias externas visibles · '+visible+' módulos visibles'+(spoilers?' · spoilers visibles':' · spoilers ocultos');
}
filterButtons.forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.guideFilter;filterButtons.forEach(other=>{const active=other===button;other.classList.toggle('is-active',active);other.setAttribute('aria-pressed',String(active))});applyFilters()}));search.addEventListener('input',applyFilters);spoilerToggle.addEventListener('change',()=>{spoilers=spoilerToggle.checked;try{localStorage.setItem(storageKey,String(spoilers))}catch(_){}applyFilters()});
fetch('data/guide.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error('No se pudo cargar el índice de guía');return response.json()}).then(data=>{if(!data||data.dataset!=='guide'||!Array.isArray(data.categories))throw new Error('Índice de guía no válido');render(data)}).catch(()=>{categories=[...catalog.querySelectorAll('[data-guide-card]')].map(card=>({id:card.dataset.guideId,title:card.querySelector('h3')?.textContent||'',entries:[],status_label:'Pendiente de verificación'}));applyFilters()});
})();
