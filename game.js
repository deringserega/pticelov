'use strict';

const STORAGE_KEY = 'pticelov_phaser_deluxe_v1';
const $ = (id) => document.getElementById(id);

const BIRDS = [
  { id:'sinica', name:'Синица', rarity:'Обычная', reward:60, xp:24, speed:135, size:42, image:'assets/images/bird-sinica.png', desc:'Юркая лесная птица. Часто встречается в начале пути.' },
  { id:'vorobey', name:'Воробей', rarity:'Обычная', reward:68, xp:26, speed:145, size:40, image:'assets/images/bird-vorobey.png', desc:'Небольшой и быстрый. Простая добыча только на первый взгляд.' },
  { id:'schegol', name:'Щегол', rarity:'Редкая', reward:135, xp:58, speed:158, size:44, image:'assets/images/bird-schegol.png', desc:'Яркий редкий трофей с высокой ценой.' },
  { id:'snegir', name:'Снегирь', rarity:'Редкая', reward:165, xp:68, speed:130, size:48, image:'assets/images/bird-snegir.png', desc:'Красная грудка делает его заметным на зимних маршрутах.' },
  { id:'sviristel', name:'Свиристель', rarity:'Эпическая', reward:295, xp:122, speed:138, size:50, image:'assets/images/bird-sviristel.png', desc:'Эффектный хохолок и серьёзная награда.' },
  { id:'dyatel', name:'Дятел', rarity:'Эпическая', reward:260, xp:115, speed:150, size:48, image:'assets/images/bird-dyatel.png', desc:'Редкий лесной трофей, который любит резкие смены направления.' },
  { id:'sova', name:'Сова', rarity:'Эпическая', reward:350, xp:150, speed:118, size:58, image:'assets/images/bird-sova.png', desc:'Медленнее остальных, но осторожнее и дороже.' },
  { id:'zimorodok', name:'Зимородок', rarity:'Легендарная', reward:560, xp:240, speed:175, size:45, image:'assets/images/bird-zimorodok.png', desc:'Легендарный трофей. Очень быстрый и очень ценный.' }
];

const HEROES = [
  { id:'sergey', name:'Серёжа', role:'Универсал', image:'assets/images/char-sergey.jpg', bonus:'Баланс характеристик', desc:'Ровный персонаж без слабых мест. Идеален для первого прохождения.', mods:{coins:1, xp:1, rare:1, speed:1, combo:1, net:1} },
  { id:'kazak', name:'Казак', role:'Следопыт', image:'assets/images/char-kazak.jpg', bonus:'+20% монет за редкую добычу', desc:'Специалист по ценным трофеям. Чуть чаще замечает редкие виды.', mods:{coins:1.20, xp:1, rare:1.13, speed:.98, combo:1, net:1.02} },
  { id:'docent', name:'Доцент', role:'Исследователь', image:'assets/images/char-docent.jpg', bonus:'+25% опыта', desc:'Быстрее прокачивает уровень и ускоряет долгую прогрессию.', mods:{coins:1, xp:1.25, rare:1.06, speed:.97, combo:1, net:1} },
  { id:'vitalya', name:'Виталя', role:'Спринтер', image:'assets/images/char-vitalya.jpg', bonus:'+14% скорость и сильнее комбо', desc:'Самый динамичный герой. Идеален для агрессивной серийной ловли.', mods:{coins:1, xp:1, rare:1.02, speed:1.14, combo:1.38, net:.96} }
];

const LOCATIONS = [
  { id:'forest', name:'Сосновый лес', image:'assets/images/loc-forest.jpg', weather:'Пыльца', difficulty:'Легко', desc:'Светлый лес, спокойная стартовая локация.', birds:['sinica','vorobey','schegol','dyatel'], tint:0x92c676 },
  { id:'river', name:'Река', image:'assets/images/loc-river.jpg', weather:'Туман', difficulty:'Средне', desc:'Берег, отражения воды и шанс встретить зимородка.', birds:['sinica','vorobey','schegol','zimorodok'], tint:0x6dbde0 },
  { id:'mountains', name:'Горы', image:'assets/images/loc-mountains.jpg', weather:'Ветер', difficulty:'Сложно', desc:'Высота, порывистый ветер и дорогие птицы.', birds:['snegir','dyatel','sova','schegol'], tint:0xa9c2dc },
  { id:'swamp', name:'Болото', image:'assets/images/loc-swamp.jpg', weather:'Дождь', difficulty:'Сложно', desc:'Тёмная влажная зона с редкими встречами.', birds:['sinica','sviristel','sova','zimorodok'], tint:0x86a96b },
  { id:'winter', name:'Зимний лес', image:'assets/images/loc-winter.jpg', weather:'Снег', difficulty:'Эксперт', desc:'Холод, снег и высокий шанс дорогих трофеев.', birds:['snegir','sviristel','sova','vorobey'], tint:0xdcefff }
];

const DEFAULT_STATE = {
  coins: 1400,
  feed: 4,
  level: 1,
  xp: 0,
  hero: 'sergey',
  location: 'forest',
  caught: {},
  bestRun: 0,
  totalCoinsEarned: 0,
  claimed: {},
  netLevel: 1,
  bootsLevel: 1,
  luckLevel: 1,
  sound: true
};

const QUESTS = [
  { id:'q1', title:'Первые трофеи', desc:'Поймай 12 любых птиц', target:12, reward:350, progress:()=>totalCaught() },
  { id:'q2', title:'Орнитолог', desc:'Открой 4 разных вида', target:4, reward:450, progress:()=>unlockedSpecies() },
  { id:'q3', title:'Доходная охота', desc:'Заработай 3000 монет', target:3000, reward:700, progress:()=>state.totalCoinsEarned },
  { id:'q4', title:'Редкая коллекция', desc:'Поймай 6 редких птиц или выше', target:6, reward:900, progress:()=>rareCaught() },
  { id:'q5', title:'Опытный птицелов', desc:'Достигни 5 уровня', target:5, reward:1100, progress:()=>state.level },
  { id:'q6', title:'Мастер сачка', desc:'Улучши сачок до 4 уровня', target:4, reward:1300, progress:()=>state.netLevel }
];

let state = loadState();
let phaserGame = null;
let activeScene = null;
let runStarting = false;
let joystickVector = { x:0, y:0, active:false };
let audio = null;

function loadState(){
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return parsed ? { ...DEFAULT_STATE, ...parsed, caught:parsed.caught||{}, claimed:parsed.claimed||{} } : { ...DEFAULT_STATE };
  } catch { return { ...DEFAULT_STATE }; }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function currentHero(){ return HEROES.find(h=>h.id===state.hero) || HEROES[0]; }
function currentLocation(){ return LOCATIONS.find(l=>l.id===state.location) || LOCATIONS[0]; }
function birdById(id){ return BIRDS.find(b=>b.id===id); }
function totalCaught(){ return Object.values(state.caught).reduce((a,b)=>a+b,0); }
function unlockedSpecies(){ return BIRDS.filter(b=>(state.caught[b.id]||0)>0).length; }
function rareCaught(){ return ['schegol','snegir','sviristel','dyatel','sova','zimorodok'].reduce((sum,id)=>sum+(state.caught[id]||0),0); }
function xpNeed(){ return state.level * 600; }
function rarityColor(r){ return r==='Легендарная'?'#ffc668':r==='Эпическая'?'#d99cff':r==='Редкая'?'#7cddff':'#d9e1d1'; }
function gainXP(amount){
  state.xp += Math.round(amount * currentHero().mods.xp);
  while(state.xp >= xpNeed()){
    state.xp -= xpNeed(); state.level++;
    toast('Новый уровень: '+state.level+' ⭐');
    sfx('level');
  }
}

class AudioEngine {
  constructor(){ this.ctx = null; this.enabled = state.sound; }
  ensure(){
    if(!this.ctx){
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if(Ctx) this.ctx = new Ctx();
    }
    if(this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  tone(freq=440, dur=.08, type='sine', gain=.05, slide=0){
    if(!this.enabled) return;
    this.ensure(); if(!this.ctx) return;
    const now=this.ctx.currentTime, osc=this.ctx.createOscillator(), g=this.ctx.createGain();
    osc.type=type; osc.frequency.setValueAtTime(freq,now); if(slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40,freq+slide),now+dur);
    g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(gain,now+.008); g.gain.exponentialRampToValueAtTime(.0001,now+dur);
    osc.connect(g); g.connect(this.ctx.destination); osc.start(now); osc.stop(now+dur+.02);
  }
  noise(dur=.1,gain=.035){
    if(!this.enabled) return; this.ensure(); if(!this.ctx) return;
    const len=Math.floor(this.ctx.sampleRate*dur), buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate), data=buf.getChannelData(0);
    for(let i=0;i<len;i++) data[i]=(Math.random()*2-1)*(1-i/len);
    const src=this.ctx.createBufferSource(), g=this.ctx.createGain(); src.buffer=buf; g.gain.value=gain; src.connect(g); g.connect(this.ctx.destination); src.start();
  }
  play(name){
    if(!this.enabled) return;
    if(name==='ui') this.tone(520,.045,'sine',.025,100);
    if(name==='swoosh'){ this.noise(.11,.035); this.tone(180,.09,'triangle',.025,250); }
    if(name==='catch'){ this.tone(660,.07,'sine',.045,180); setTimeout(()=>this.tone(880,.09,'sine',.04,160),45); }
    if(name==='rare'){ this.tone(520,.11,'sine',.05,200); setTimeout(()=>this.tone(780,.13,'sine',.05,260),80); setTimeout(()=>this.tone(1040,.16,'sine',.045,300),160); }
    if(name==='miss') this.tone(130,.07,'square',.018,-30);
    if(name==='level'){ this.tone(440,.11,'sine',.04,220); setTimeout(()=>this.tone(660,.12,'sine',.04,240),90); setTimeout(()=>this.tone(900,.16,'sine',.05,300),180); }
    if(name==='bird'){ this.tone(1350+Math.random()*450,.05,'sine',.018,180); }
  }
}

function sfx(name){ if(!audio) audio=new AudioEngine(); audio.enabled=state.sound; audio.play(name); }

function toast(text){
  const el=$('toast'); el.textContent=text; el.classList.add('show');
  clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove('show'),2100);
}

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.screen===id));
  if(id==='game-screen') document.querySelector('.topbar').classList.add('hidden');
  else document.querySelector('.topbar').classList.remove('hidden');
  window.scrollTo({top:0,behavior:'instant'});
}

function renderHUD(){
  $('coinsHud').textContent=state.coins;
  $('feedHud').textContent=state.feed;
  $('levelHud').textContent=state.level;
  $('speciesHud').textContent=unlockedSpecies()+'/8';
  $('homeCaught').textContent=totalCaught();
  $('homeSpecies').textContent=unlockedSpecies()+'/8';
  $('homeBest').textContent=state.bestRun;
  $('homeHero').textContent=currentHero().name;
  $('collectionCount').textContent=unlockedSpecies();
  $('soundToggle').textContent=state.sound?'🔊':'🔇';
}

function miniHeroTemplate(h){
  return `<div class="mini-hero ${h.id===state.hero?'selected':''}" data-hero="${h.id}">
    <div class="photo" style="background-image:url('${h.image}')"></div>
    <div class="copy"><h3>${h.name}</h3><p>${h.role} · ${h.bonus}</p></div>
  </div>`;
}

function renderHomeHeroes(){
  $('homeHeroCards').innerHTML=HEROES.map(miniHeroTemplate).join('');
  $('homeHeroCards').querySelectorAll('[data-hero]').forEach(el=>el.onclick=()=>selectHero(el.dataset.hero));
}

function renderHeroes(){
  $('heroGrid').innerHTML=HEROES.map(h=>`<article class="hero-card ${h.id===state.hero?'selected':''}" data-hero="${h.id}">
    <div class="photo" style="background-image:url('${h.image}')"></div>
    <div class="body"><h3>${h.name}</h3><p>${h.desc}</p><div class="hero-bonus">${h.bonus}</div>
      <div class="hero-meta"><div>Роль<b>${h.role}</b></div><div>Скорость<b>${Math.round(h.mods.speed*100)}%</b></div></div>
    </div></article>`).join('');
  $('heroGrid').querySelectorAll('[data-hero]').forEach(el=>el.onclick=()=>selectHero(el.dataset.hero));
}

function selectHero(id){ state.hero=id; saveState(); renderAll(); sfx('ui'); toast('Выбран герой: '+currentHero().name); }

function renderLocations(){
  $('locationGrid').innerHTML=LOCATIONS.map(l=>`<article class="loc-card ${l.id===state.location?'selected':''}" data-location="${l.id}">
    <div class="photo" style="background-image:url('${l.image}')"></div><div class="body"><h3>${l.name}</h3><p>${l.desc}</p>
      <div class="loc-tags"><span>${l.weather}</span><span>${l.difficulty}</span><span>${l.birds.length} вида</span></div>
    </div></article>`).join('');
  $('locationGrid').querySelectorAll('[data-location]').forEach(el=>el.onclick=()=>{state.location=el.dataset.location;saveState();renderLocations();sfx('ui');toast('Маршрут: '+currentLocation().name);});
}

function renderBirds(){
  $('birdGrid').innerHTML=BIRDS.map(b=>{const n=state.caught[b.id]||0; return `<article class="bird-card ${n?'':'locked'}">
    <div class="rarity" style="color:${rarityColor(b.rarity)}">${b.rarity}</div><div class="photo" style="background-image:url('${b.image}')"></div>
    <div class="body"><h3>${b.name}</h3><p>${n?b.desc:'Поймай эту птицу хотя бы один раз, чтобы открыть карточку.'}</p>
      <div class="bird-foot"><span>Награда <b>${b.reward}</b> 🪙</span><span>${n?'x'+n:'???'}</span></div>
    </div></article>`;}).join('');
}

function shopItems(){
  return [
    {id:'feed1',name:'Приманка',icon:'🌾',desc:'1 заряд приманки. На 9 секунд повышает шанс дорогой птицы.',cost:180,buy(){state.feed+=1;}},
    {id:'feed3',name:'Набор приманок',icon:'🧺',desc:'3 заряда приманки дешевле, чем по одному.',cost:480,buy(){state.feed+=3;}},
    {id:'net',name:'Сачок',icon:'🕸️',desc:'Увеличивает радиус ловли и сокращает кулдаун.',cost:()=>850+state.netLevel*450,buy(){state.netLevel+=1;}},
    {id:'boots',name:'Ботинки',icon:'🥾',desc:'Увеличивают скорость героя в экспедиции.',cost:()=>700+state.bootsLevel*380,buy(){state.bootsLevel+=1;}},
    {id:'luck',name:'Бинокль',icon:'🔭',desc:'Повышает шанс редких и легендарных птиц.',cost:()=>900+state.luckLevel*500,buy(){state.luckLevel+=1;}},
    {id:'reset',name:'Сброс прогресса',icon:'♻️',desc:'Начать игру заново. Используй только если действительно хочешь.',cost:0,buy(){if(confirm('Сбросить весь прогресс?')){state={...DEFAULT_STATE,caught:{},claimed:{}};saveState();renderAll();toast('Прогресс сброшен');}return 'skip';}}
  ];
}

function renderShop(){
  $('shopGrid').innerHTML=shopItems().map(i=>{const c=typeof i.cost==='function'?i.cost():i.cost; return `<article class="shop-card"><div class="shop-icon">${i.icon}</div><h3>${i.name}</h3><p>${i.desc}</p><div class="price">${c?c+' монет':'бесплатно'}</div><button class="primary" data-buy="${i.id}">${i.id==='reset'?'Сбросить':'Купить'}</button></article>`;}).join('');
  $('shopGrid').querySelectorAll('[data-buy]').forEach(btn=>btn.onclick=()=>buyShop(btn.dataset.buy));
}
function buyShop(id){
  const i=shopItems().find(x=>x.id===id); if(!i)return; const c=typeof i.cost==='function'?i.cost():i.cost;
  if(c>state.coins){toast('Недостаточно монет');sfx('miss');return;} if(c) state.coins-=c; const result=i.buy(); if(result==='skip')return; saveState();renderAll();sfx('catch');toast('Покупка успешна');
}

function renderQuests(){
  $('questGrid').innerHTML=QUESTS.map(q=>{const p=Math.min(q.target,q.progress()),done=p>=q.target,claimed=!!state.claimed[q.id];return `<article class="quest-card ${done?'done':''}"><div class="quest-head"><div><h3>${q.title}</h3><p>${q.desc}</p></div><div class="reward">+${q.reward} 🪙</div></div><div class="progress"><i style="width:${Math.min(100,p/q.target*100)}%"></i></div><div class="quest-foot"><span>${p}/${q.target}</span>${done&&!claimed?`<button class="primary" data-claim="${q.id}" style="min-height:36px;padding:8px 12px">Забрать</button>`:claimed?'<b style="color:#a8f2cc">Получено</b>':'<span>В процессе</span>'}</div></article>`;}).join('');
  $('questGrid').querySelectorAll('[data-claim]').forEach(btn=>btn.onclick=()=>claimQuest(btn.dataset.claim));
}
function claimQuest(id){ const q=QUESTS.find(x=>x.id===id); if(!q||state.claimed[id]||q.progress()<q.target)return;state.claimed[id]=true;state.coins+=q.reward;saveState();renderAll();sfx('level');toast('Награда: +'+q.reward+' монет'); }
function renderAll(){renderHUD();renderHomeHeroes();renderHeroes();renderLocations();renderBirds();renderShop();renderQuests();}

function initNav(){
  document.querySelectorAll('[data-screen]').forEach(btn=>btn.addEventListener('click',()=>{sfx('ui');showScreen(btn.dataset.screen);}));
  $('playNowBtn').onclick=()=>{showScreen('locations');sfx('ui');};
  $('startFromLocationsBtn').onclick=()=>startRun();
  $('soundToggle').onclick=()=>{state.sound=!state.sound;saveState();if(audio)audio.enabled=state.sound;renderHUD();if(state.sound)sfx('ui');};
  $('exitGameBtn').onclick=()=>exitRun();
  $('catchGameBtn').onpointerdown=(e)=>{e.preventDefault();triggerCatch();};
  $('lureGameBtn').onpointerdown=(e)=>{e.preventDefault();useLure();};
  $('againBtn').onclick=()=>{$('run-result').classList.add('hidden');startRun();};
  $('resultHomeBtn').onclick=()=>{$('run-result').classList.add('hidden');showScreen('home');};
  window.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();triggerCatch();}});
}

function initJoystick(){
  const joy=$('joystick'), knob=$('joystickKnob');
  const update=(x,y)=>{
    const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=x-cx,dy=y-cy,max=r.width/2-30,len=Math.hypot(dx,dy)||1,k=Math.min(1,max/len);
    const px=dx*k,py=dy*k; joystickVector.x=px/max;joystickVector.y=py/max;knob.style.transform=`translate(${px}px,${py}px)`;
  };
  joy.addEventListener('pointerdown',e=>{joystickVector.active=true;joy.setPointerCapture(e.pointerId);update(e.clientX,e.clientY);});
  joy.addEventListener('pointermove',e=>{if(joystickVector.active)update(e.clientX,e.clientY);});
  const end=()=>{joystickVector.active=false;joystickVector.x=0;joystickVector.y=0;knob.style.transform='translate(0,0)';};
  joy.addEventListener('pointerup',end);joy.addEventListener('pointercancel',end);
}

function boot(){
  renderAll(); initNav(); initJoystick();
  const imgs=[...HEROES.map(h=>h.image),...LOCATIONS.map(l=>l.image),...BIRDS.map(b=>b.image),'assets/images/hero-bg.jpg'];
  let done=0;
  const progress=()=>{done++;const pct=Math.round(done/imgs.length*100);$('boot-progress').style.width=pct+'%';$('boot-status').textContent=pct<100?'Загрузка графики '+pct+'%':'Готово';if(done>=imgs.length)setTimeout(finishBoot,280);};
  imgs.forEach(src=>{const img=new Image();img.onload=progress;img.onerror=progress;img.src=src;});
  setTimeout(()=>{if(done<imgs.length){done=imgs.length;finishBoot();}},4500);
}
function finishBoot(){ $('boot-screen').classList.add('hidden');$('app').classList.remove('hidden');showScreen('home');if(!window.Phaser)$('phaser-error').classList.remove('hidden'); }

function ensurePhaser(){
  if(phaserGame || !window.Phaser) return !!phaserGame;
  const config={
    type:Phaser.AUTO,
    parent:'phaser-game',
    backgroundColor:'#09171a',
    transparent:false,
    pixelArt:false,
    antialias:true,
    resolution:Math.min(window.devicePixelRatio||1,2),
    scale:{mode:Phaser.Scale.RESIZE,width:window.innerWidth,height:window.innerHeight,autoCenter:Phaser.Scale.CENTER_BOTH},
    physics:{default:'arcade',arcade:{gravity:{x:0,y:0},debug:false}},
    scene:[GameScene],
    render:{antialias:true,roundPixels:false,powerPreference:'high-performance'}
  };
  phaserGame=new Phaser.Game(config);return true;
}

function startRun(){
  if(runStarting)return;
  sfx('ui'); showScreen('game-screen');
  $('run-result').classList.add('hidden');
  $('lureCount').textContent=state.feed;
  $('runLocation').textContent=currentLocation().name;
  $('runHero').textContent=currentHero().name;
  runStarting=true;
  setTimeout(()=>{
    if(!ensurePhaser()){$('phaser-error').classList.remove('hidden');runStarting=false;return;}
    const startScene=()=>{
      const scene=phaserGame.scene.keys.GameScene;
      if(scene && scene.scene.isActive()) scene.restartRun();
      else phaserGame.scene.start('GameScene');
      countdown(()=>{const s=phaserGame.scene.keys.GameScene;if(s)s.beginRun();runStarting=false;});
    };
    setTimeout(startScene,160);
  },50);
}
function countdown(done){
  const el=$('countdown');el.classList.remove('hidden');let n=3;el.textContent=n;sfx('ui');
  const t=setInterval(()=>{n--;if(n>0){el.textContent=n;sfx('ui');}else{clearInterval(t);el.textContent='ВПЕРЁД!';sfx('level');setTimeout(()=>{el.classList.add('hidden');done();},520);}},720);
}
function exitRun(){ if(activeScene)activeScene.abortRun(); showScreen('home'); }
function triggerCatch(){ if(activeScene && activeScene.runActive) activeScene.swingNet(); }
function useLure(){ if(activeScene && activeScene.runActive) activeScene.activateLure(); }

class GameScene extends Phaser.Scene {
  constructor(){ super({key:'GameScene'}); this.runActive=false; }
  preload(){
    LOCATIONS.forEach(l=>this.load.image('loc_'+l.id,l.image));
    BIRDS.forEach(b=>this.load.image('birdphoto_'+b.id,b.image));
    HEROES.forEach(h=>this.load.image('herophoto_'+h.id,h.image));
  }
  create(){
    activeScene=this;
    this.cameras.main.setBackgroundColor('#09171a');
    this.createGeneratedTextures();
    this.createWorld();
    this.createWeather();
    this.createPlayer();
    this.createBirdsGroup();
    this.moveKeys=this.input.keyboard.addKeys({up:'W',down:'S',left:'A',right:'D'});
    this.cursors=this.input.keyboard.createCursorKeys();
    this.keySpace=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.on('keydown-SPACE',()=>this.swingNet());
    this.scale.on('resize',()=>this.layoutWorld());
    this.restartRun();
  }
  createGeneratedTextures(){
    if(!this.textures.exists('spark')){
      const g=this.make.graphics({x:0,y:0,add:false});g.fillStyle(0xffffff,1);g.fillCircle(8,8,8);g.generateTexture('spark',16,16);g.destroy();
    }
    HEROES.forEach((h,idx)=>{
      const key='player_'+h.id;if(this.textures.exists(key))return;
      const tex=this.textures.createCanvas(key,96,132),c=tex.context,src=this.textures.get('herophoto_'+h.id).getSourceImage();
      c.clearRect(0,0,96,132);
      c.fillStyle='rgba(0,0,0,.24)';c.beginPath();c.ellipse(48,118,30,9,0,0,Math.PI*2);c.fill();
      const colors=['#435944','#6b432a','#465765','#285d78'];c.fillStyle=colors[idx]||'#435944';c.beginPath();c.roundRect(25,54,46,51,15);c.fill();
      c.strokeStyle='#231b17';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(37,102);c.lineTo(32,125);c.moveTo(59,102);c.lineTo(64,125);c.stroke();
      c.save();c.beginPath();c.arc(48,39,24,0,Math.PI*2);c.clip();
      const sw=src.width,sh=src.height,scale=Math.max(56/sw,56/sh),dw=sw*scale,dh=sh*scale;c.drawImage(src,48-dw/2,39-dh*.32,dw,dh);c.restore();
      c.strokeStyle='rgba(246,230,190,.9)';c.lineWidth=3;c.beginPath();c.arc(48,39,24,0,Math.PI*2);c.stroke();tex.refresh();
    });
    BIRDS.forEach(b=>{
      const key='birdtoken_'+b.id;if(this.textures.exists(key))return;
      const src=this.textures.get('birdphoto_'+b.id).getSourceImage();
      const tex=this.textures.createCanvas(key,128,128),c=tex.context;
      c.save();c.beginPath();c.arc(64,64,60,0,Math.PI*2);c.clip();
      const sw=src.width,sh=src.height,scale=Math.max(128/sw,128/sh),dw=sw*scale,dh=sh*scale;
      c.drawImage(src,(128-dw)/2,(128-dh)/2,dw,dh);c.restore();
      c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=4;c.beginPath();c.arc(64,64,60,0,Math.PI*2);c.stroke();tex.refresh();
    });
  }
  createWorld(){
    this.bg=this.add.image(0,0,'loc_'+state.location).setOrigin(.5).setDepth(-20);
    this.overlay=this.add.rectangle(0,0,10,10,0x071316,.10).setOrigin(.5).setDepth(-18);
    this.vignette=this.add.graphics().setDepth(1000).setScrollFactor(0);
    this.ambient=[];
    for(let i=0;i<18;i++){
      const a=this.add.circle(Math.random()*this.scale.width,Math.random()*this.scale.height,2+Math.random()*5,0xffffff,.08+Math.random()*.1).setDepth(-5);
      a.vx=(Math.random()-.5)*10;a.vy=-2-Math.random()*7;this.ambient.push(a);
    }
    this.layoutWorld();
  }
  layoutWorld(){
    const w=this.scale.width,h=this.scale.height;if(!w||!h)return;
    const img=this.textures.get('loc_'+state.location).getSourceImage();
    const scale=Math.max(w/img.width,h/img.height);this.bg.setPosition(w/2,h/2).setDisplaySize(img.width*scale,img.height*scale);
    this.overlay.setPosition(w/2,h/2).setSize(w,h);
    this.physics.world.setBounds(32,80,Math.max(1,w-64),Math.max(1,h-150));
    this.drawVignette();
  }
  drawVignette(){
    const w=this.scale.width,h=this.scale.height;this.vignette.clear();
    this.vignette.fillStyle(0x000000,.18);this.vignette.fillRect(0,0,w,58);this.vignette.fillStyle(0x000000,.20);this.vignette.fillRect(0,h-100,w,100);
  }
  createWeather(){
    this.weather=[];
    const type=currentLocation().weather;
    const count=type==='Снег'?100:type==='Дождь'?90:50;
    for(let i=0;i<count;i++){
      let obj;
      if(type==='Дождь') obj=this.add.rectangle(Math.random()*this.scale.width,Math.random()*this.scale.height,1,10,0xbfe8ff,.28).setDepth(50);
      else obj=this.add.circle(Math.random()*this.scale.width,Math.random()*this.scale.height,1+Math.random()*2,type==='Снег'?0xffffff:0xf4e4a4,type==='Снег'?.45:.16).setDepth(type==='Снег'?40:-4);
      obj.speed=type==='Дождь'?260+Math.random()*260:type==='Снег'?20+Math.random()*45:5+Math.random()*12;
      obj.drift=(Math.random()-.5)*(type==='Снег'?35:14);this.weather.push(obj);
    }
  }
  createPlayer(){
    this.player=this.physics.add.sprite(this.scale.width/2,this.scale.height*.74,'player_'+state.hero).setDepth(20).setCollideWorldBounds(true);
    this.player.body.setCircle(26,22,55);this.player.setScale(.82);
    this.net=this.add.container(this.player.x,this.player.y).setDepth(22);
    const handle=this.add.rectangle(42,-8,78,5,0x9b6b32,1).setOrigin(0,.5);
    const ring=this.add.ellipse(122,-8,60,48).setStrokeStyle(4,0xf2daa0,.95).setFillStyle(0xffffff,.025);
    const mesh=this.add.graphics();mesh.lineStyle(1,0xffffff,.19);for(let x=100;x<=144;x+=11){mesh.lineBetween(x,-28,x+4,12);}for(let y=-24;y<=8;y+=8){mesh.lineBetween(96,y,148,y+2);}this.net.add([handle,ring,mesh]);this.net.setVisible(true);this.net.rotation=-.45;
    this.playerShadow=this.add.ellipse(this.player.x,this.player.y+33,54,15,0x000000,.28).setDepth(15);
  }
  createBirdsGroup(){ this.birds=this.physics.add.group(); }
  restartRun(){
    this.runActive=false;this.refreshLocation();this.timeLeft=60;this.runCaught=0;this.runCoins=0;this.combo=0;this.maxCombo=0;this.lureTime=0;this.spawnClock=0;this.newSpecies=0;this.startedSpecies=new Set(BIRDS.filter(b=>(state.caught[b.id]||0)>0).map(b=>b.id));
    if(this.birds)this.birds.clear(true,true);this.player.setTexture('player_'+state.hero).setPosition(this.scale.width/2,this.scale.height*.74);this.player.setVelocity(0);this.updateDOM();
  }
  refreshLocation(){
    if(this.bg){this.bg.setTexture('loc_'+state.location);this.layoutWorld();}
    if(this.weather){this.weather.forEach(o=>o.destroy());this.weather=[];}
    this.createWeather();
  }
  beginRun(){ this.runActive=true;this.spawnBird();this.spawnBird();this.spawnBird(); }
  abortRun(){ this.runActive=false;this.player.setVelocity(0); }
  activateLure(){
    if(!this.runActive)return;if(state.feed<=0){toast('Приманка закончилась');sfx('miss');return;}
    state.feed--;saveState();renderHUD();$('lureCount').textContent=state.feed;this.lureTime=9;toast('Приманка активна 9 секунд');sfx('ui');
    this.cameras.main.flash(100,116,203,149,false,undefined,this);
  }
  chooseBird(){
    const pool=[];const luck=(1+(state.luckLevel-1)*.07)*currentHero().mods.rare;
    currentLocation().birds.forEach(id=>{const b=birdById(id);let w=b.rarity==='Обычная'?6:b.rarity==='Редкая'?3.2:b.rarity==='Эпическая'?1.55:.65;if(b.rarity!=='Обычная')w*=luck;if(this.lureTime>0&&b.rarity!=='Обычная')w*=2.35;for(let i=0;i<Math.ceil(w*4);i++)pool.push(b);});
    return pool[Math.floor(Math.random()*pool.length)];
  }
  spawnBird(){
    if(!this.birds||this.birds.getLength()>=16)return;const data=this.chooseBird(),w=this.scale.width,h=this.scale.height,edge=Math.floor(Math.random()*4);let x,y;
    if(edge===0){x=80+Math.random()*(w-160);y=92;}else if(edge===1){x=w-55;y=110+Math.random()*(h-300);}else if(edge===2){x=80+Math.random()*(w-160);y=h-185;}else{x=55;y=110+Math.random()*(h-300);}
    const s=this.physics.add.sprite(x,y,'birdtoken_'+data.id).setDepth(10).setDisplaySize(data.size*1.85,data.size*1.85).setCollideWorldBounds(true).setBounce(1);s.body.setCircle(42,22,22);
    s.birdData=data;s.target=new Phaser.Math.Vector2(80+Math.random()*(w-160),100+Math.random()*(h-310));s.flap=Math.random()*6.28;s.baseScale=s.scaleX;s.flee=0;
    const ang=Math.random()*Math.PI*2;s.setVelocity(Math.cos(ang)*data.speed,Math.sin(ang)*data.speed*.65);this.birds.add(s);if(Math.random()<.2)sfx('bird');
  }
  swingNet(){
    if(!this.runActive||this.swinging||this.netCooldown>0)return;this.swinging=true;this.netCooldown=Math.max(.26,.60-state.netLevel*.045);sfx('swoosh');
    const facing=this.player.flipX?-1:1;this.net.setScale(facing,1);this.net.rotation=facing>0?-1.0:1.0;
    this.tweens.add({targets:this.net,rotation:facing>0?.55:-.55,duration:180,ease:'Cubic.easeOut',yoyo:true,onYoyo:()=>this.resolveCatch(),onComplete:()=>{this.swinging=false;this.net.rotation=facing>0?-.45:.45;}});
  }
  resolveCatch(){
    const facing=this.player.flipX?-1:1,reach=(100+state.netLevel*15)*currentHero().mods.net,originX=this.player.x+facing*68,originY=this.player.y-8;let hits=[];
    this.birds.getChildren().forEach(b=>{if(!b.active)return;const dx=b.x-originX,dy=b.y-originY,d=Math.hypot(dx,dy);const forward=(b.x-this.player.x)*facing;if(d<reach&&forward>-24)hits.push({b,d});});
    hits.sort((a,b)=>a.d-b.d).slice(0,2+Math.floor(state.netLevel/4)).forEach(h=>this.catchBird(h.b));
    if(!hits.length){this.combo=0;sfx('miss');this.updateDOM();}
  }
  catchBird(sprite){
    if(!sprite.active)return;const b=sprite.birdData,rare=b.rarity!=='Обычная',comboMult=1+Math.min(.8,this.combo*.055*currentHero().mods.combo),heroCoins=rare?currentHero().mods.coins:1,coins=Math.round(b.reward*comboMult*heroCoins);
    this.runCaught++;this.combo=Math.min(20,this.combo+1);this.maxCombo=Math.max(this.maxCombo,this.combo);this.runCoins+=coins;state.caught[b.id]=(state.caught[b.id]||0)+1;if(!this.startedSpecies.has(b.id)){this.startedSpecies.add(b.id);this.newSpecies++;}
    gainXP(b.xp*(1+Math.min(.45,this.combo*.025)));saveState();renderHUD();renderBirds();renderQuests();
    this.catchFX(sprite.x,sprite.y,b,coins);sprite.disableBody(true,true);rare?sfx('rare'):sfx('catch');this.updateDOM();
  }
  catchFX(x,y,b,coins){
    const color=b.rarity==='Легендарная'?0xffc668:b.rarity==='Эпическая'?0xd99cff:b.rarity==='Редкая'?0x7cddff:0xa9f0c8;
    const ring=this.add.circle(x,y,18).setStrokeStyle(4,color,1).setDepth(40);this.tweens.add({targets:ring,scale:4,alpha:0,duration:420,ease:'Quad.easeOut',onComplete:()=>ring.destroy()});
    for(let i=0;i<18;i++){const p=this.add.image(x,y,'spark').setTint(color).setScale(.2+Math.random()*.25).setDepth(45);const a=Math.random()*Math.PI*2,d=40+Math.random()*75;this.tweens.add({targets:p,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,alpha:0,scale:0,duration:360+Math.random()*220,onComplete:()=>p.destroy()});}
    const text=this.add.text(x,y-35,'+'+coins+' 🪙',{fontFamily:'Arial',fontSize:'22px',fontStyle:'bold',color:'#fff7d5',stroke:'#061114',strokeThickness:5}).setOrigin(.5).setDepth(60);this.tweens.add({targets:text,y:y-88,alpha:0,duration:700,ease:'Cubic.easeOut',onComplete:()=>text.destroy()});
    this.cameras.main.shake(75,.0025);
  }
  finishRun(){
    this.runActive=false;this.player.setVelocity(0);state.coins+=this.runCoins;state.totalCoinsEarned+=this.runCoins;state.bestRun=Math.max(state.bestRun,this.runCaught);saveState();renderAll();
    $('resultCoins').textContent='+'+this.runCoins+' 🪙';$('resultCaught').textContent=this.runCaught;$('resultNewSpecies').textContent=this.newSpecies;$('resultCombo').textContent='x'+this.maxCombo;$('run-result').classList.remove('hidden');sfx('level');
  }
  updateDOM(){
    $('runTime').textContent=Math.max(0,Math.ceil(this.timeLeft));$('runCaught').textContent=this.runCaught;$('runCombo').textContent='x'+this.combo;$('runCoins').textContent=this.runCoins;$('lureCount').textContent=state.feed;$('runLocation').textContent=currentLocation().name;$('runHero').textContent=currentHero().name;
  }
  update(time,delta){
    const dt=Math.min(.033,delta/1000),w=this.scale.width,h=this.scale.height;
    if(this.netCooldown>0)this.netCooldown-=dt;
    this.updatePlayer(dt);this.updateBirds(dt);this.updateWeather(dt);
    if(this.runActive){
      this.timeLeft-=dt;if(this.timeLeft<=0){this.timeLeft=0;this.updateDOM();this.finishRun();return;}
      this.spawnClock-=dt;if(this.spawnClock<=0){this.spawnBird();this.spawnClock=.42+Math.random()*.65;}
      if(this.lureTime>0)this.lureTime=Math.max(0,this.lureTime-dt);
      if(Math.floor(time/250)!==Math.floor((time-delta)/250))this.updateDOM();
    }
    if(this.bg && (this.bg.texture.key!=='loc_'+state.location))this.refreshLocation();
    if(w<10||h<10)return;
  }
  updatePlayer(dt){
    if(!this.player)return;let x=0,y=0;
    if(this.moveKeys.left.isDown||this.cursors.left.isDown)x--;
    if(this.moveKeys.right.isDown||this.cursors.right.isDown)x++;
    if(this.moveKeys.up.isDown||this.cursors.up.isDown)y--;
    if(this.moveKeys.down.isDown||this.cursors.down.isDown)y++;
    x+=joystickVector.x;y+=joystickVector.y;const len=Math.hypot(x,y);if(len>1){x/=len;y/=len;}
    const speed=(270+(state.bootsLevel-1)*22)*currentHero().mods.speed;const targetVX=x*speed,targetVY=y*speed;this.player.body.velocity.x=Phaser.Math.Linear(this.player.body.velocity.x,targetVX,.22);this.player.body.velocity.y=Phaser.Math.Linear(this.player.body.velocity.y,targetVY,.22);
    if(Math.abs(x)>.05)this.player.setFlipX(x<0);const moving=Math.abs(x)+Math.abs(y)>.12;this.player.setScale(.82+(moving?Math.sin(this.time.now*.014)*.018:0),.82-(moving?Math.sin(this.time.now*.014)*.009:0));
    this.playerShadow.setPosition(this.player.x,this.player.y+38);this.net.setPosition(this.player.x,this.player.y-6);if(!this.swinging)this.net.rotation=this.player.flipX?.45:-.45;
  }
  updateBirds(dt){
    if(!this.birds)return;const children=this.birds.getChildren();
    children.forEach((b,i)=>{
      if(!b.active)return;const data=b.birdData;b.flap+=dt*(7+data.speed/80);const dx=b.target.x-b.x,dy=b.target.y-b.y,d=Math.hypot(dx,dy)||1;if(d<45||Math.random()<.0025){b.target.set(70+Math.random()*(this.scale.width-140),95+Math.random()*(this.scale.height-300));}
      b.body.velocity.x+=dx/d*35*dt;b.body.velocity.y+=dy/d*28*dt;
      const pdx=b.x-this.player.x,pdy=b.y-this.player.y,pdist=Math.hypot(pdx,pdy)||1;if(this.runActive&&pdist<185){const fear=(185-pdist)/185;b.body.velocity.x+=pdx/pdist*280*fear*dt;b.body.velocity.y+=pdy/pdist*230*fear*dt;}
      for(let j=i+1;j<children.length;j++){const o=children[j];if(!o.active)continue;const sx=b.x-o.x,sy=b.y-o.y,sd=Math.hypot(sx,sy)||1;if(sd<76){const f=(76-sd)/76*85;b.body.velocity.x+=sx/sd*f*dt;b.body.velocity.y+=sy/sd*f*dt;o.body.velocity.x-=sx/sd*f*dt;o.body.velocity.y-=sy/sd*f*dt;}}
      const max=data.speed*(1+(state.level-1)*.01);const v=Math.hypot(b.body.velocity.x,b.body.velocity.y);if(v>max){b.body.velocity.x=b.body.velocity.x/v*max;b.body.velocity.y=b.body.velocity.y/v*max;}
      const pulse=1+Math.sin(b.flap)*.035;b.setScale(b.baseScale*pulse);b.rotation=Phaser.Math.Clamp(b.body.velocity.y/700,-.16,.16);
    });
  }
  updateWeather(dt){
    if(!this.weather)return;const w=this.scale.width,h=this.scale.height,type=currentLocation().weather;
    this.weather.forEach(p=>{p.y+=p.speed*dt;p.x+=p.drift*dt+(type==='Ветер'?Math.sin(this.time.now*.002)*38*dt:0);if(p.y>h+20){p.y=-20;p.x=Math.random()*w;}if(p.x>w+20)p.x=-20;if(p.x<-20)p.x=w+20;});
    this.ambient.forEach(a=>{a.y+=a.vy*dt;a.x+=a.vx*dt;if(a.y<-10){a.y=h+10;a.x=Math.random()*w;}if(a.x<-10)a.x=w+10;if(a.x>w+10)a.x=-10;});
  }
}

window.addEventListener('load',boot);

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
