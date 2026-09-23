const CACHE='pticelov-infinity-v1';
const LOCAL=[
  './','./index.html','./style.css','./game.js','./manifest.webmanifest',
  './assets/icons/icon-192.png','./assets/icons/icon-512.png',
  './assets/audio/music-loop.wav','./assets/audio/birds-loop.wav','./assets/audio/ui.wav','./assets/audio/net.wav','./assets/audio/catch.wav','./assets/audio/miss.wav','./assets/audio/reward.wav','./assets/audio/boss.wav',
  './assets/images/hero-bg.webp','./assets/images/char-sergey.webp','./assets/images/char-kazak.webp','./assets/images/char-docent.webp','./assets/images/char-vitalya.webp',
  './assets/images/loc-forest.webp','./assets/images/loc-river.webp','./assets/images/loc-mountains.webp','./assets/images/loc-swamp.webp','./assets/images/loc-winter.webp',
  './assets/images/bird-sinica.webp','./assets/images/bird-vorobey.webp','./assets/images/bird-chizh.webp','./assets/images/bird-zelenushka.webp','./assets/images/bird-chechetka.webp','./assets/images/bird-popolzen.webp','./assets/images/bird-kamyshovka.webp','./assets/images/bird-schegol.webp','./assets/images/bird-snegir.webp','./assets/images/bird-uragus.webp','./assets/images/bird-sviristel.webp','./assets/images/bird-dyatel.webp','./assets/images/bird-sova.webp','./assets/images/bird-zimorodok.webp','./assets/images/boss-berkut.webp'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(LOCAL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    const clone=res.clone();caches.open(CACHE).then(c=>c.put(e.request,clone)).catch(()=>{});return res;
  }).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Promise.reject(new Error('offline')))));
});
