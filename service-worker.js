'use strict';
const CACHE_PREFIX='leonida-files-';
const CACHE_STATIC=CACHE_PREFIX+'static-v5';
const CACHE_DATA=CACHE_PREFIX+'data-v5';
const CORE_ASSETS=[
 './',
 './index.html',
 './manifest.webmanifest',
 './assets/icons/dossier34.svg',
 './assets/icons/dossier34-192.png',
 './assets/icons/dossier34-512.png',
 './assets/css/dossier34.css',
 './assets/css/guide34.css',
 './assets/css/progress34.css',
 './assets/css/experience34.css',
 './assets/js/dossier34.js',
 './assets/js/guide34.js',
 './assets/js/progress34.js',
 './assets/js/experience34.js',
 './assets/js/pwa34.js',
 './data/sources.json',
 './data/news.json',
 './data/news-feed.json',
 './data/characters.json',
 './data/regions.json',
 './data/radios.json',
 './data/songs.json',
 './data/vehicles.json',
 './data/guide.json',
 './data/progress.json',
 './data/updates.json'
];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_STATIC);
  await cache.addAll(CORE_ASSETS);
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&![CACHE_STATIC,CACHE_DATA].includes(key)).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});
async function networkFirst(request,cacheName){
 const cache=await caches.open(cacheName);
 try{
  const response=await fetch(request);
  if(response&&response.ok)await cache.put(request,response.clone());
  return response;
 }catch(error){
  const cached=await cache.match(request);
  if(cached)return cached;
  throw error;
 }
}
async function cacheFirst(request){
 const cached=await caches.match(request);
 if(cached)return cached;
 const response=await fetch(request);
 if(response&&response.ok){
  const cache=await caches.open(CACHE_STATIC);
  await cache.put(request,response.clone());
 }
 return response;
}
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(networkFirst(request,CACHE_STATIC).catch(async()=>{
   const cache=await caches.open(CACHE_STATIC);
   return (await cache.match('./index.html'))||(await cache.match('./'));
  }));
  return;
 }
 if(url.pathname.includes('/data/')){
  event.respondWith(networkFirst(request,CACHE_DATA).catch(()=>caches.match(request)));
  return;
 }
 if(url.pathname.includes('/assets/')){
  event.respondWith(cacheFirst(request).catch(()=>caches.match(request)));
 }
});
