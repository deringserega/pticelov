const CACHE='pticelov-deluxe-v1';
const CORE=[
  './','./index.html','./style.css','./game.js','./manifest.webmanifest',
  './assets/images/hero-bg.jpg',
  './assets/images/char-sergey.jpg','./assets/images/char-kazak.jpg','./assets/images/char-docent.jpg','./assets/images/char-vitalya.jpg',
  './assets/images/loc-forest.jpg','./assets/images/loc-river.jpg','./assets/images/loc-mountains.jpg','./assets/images/loc-swamp.jpg','./assets/images/loc-winter.jpg',
  './assets/images/bird-sinica.png','./assets/images/bird-vorobey.png','./assets/images/bird-schegol.png','./assets/images/bird-snegir.png','./assets/images/bird-sviristel.png','./assets/images/bird-dyatel.png','./assets/images/bird-sova.png','./assets/images/bird-zimorodok.png',
  './assets/icons/icon-192.png','./assets/icons/icon-512.png'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(resp=>{
    const copy=resp.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return resp;
  }).catch(()=>hit)));
});
