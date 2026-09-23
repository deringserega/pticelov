'use strict';

const STORAGE_KEY='pticelov_infinity_v1';
const OLD_STORAGE_KEYS=['pticelov_phaser_deluxe_v1','pticelov_remastered_v1','pticelov_ultra_v2'];
const $=id=>document.getElementById(id);

const BIRDS=[
  {id:'sinica',name:'Синица',rarity:'Обычная',reward:58,xp:22,speed:128,size:42,image:'assets/images/bird-sinica.webp',desc:'Юркая лесная птица. Часто встречается в начале пути.'},
  {id:'vorobey',name:'Воробей',rarity:'Обычная',reward:64,xp:24,speed:140,size:40,image:'assets/images/bird-vorobey.webp',desc:'Маленький, быстрый и непредсказуемый.'},
  {id:'chizh',name:'Чиж',rarity:'Обычная',reward:74,xp:28,speed:145,size:41,image:'assets/images/bird-chizh.webp',desc:'Жёлто-зелёный лесной певец с резкими манёврами.'},
  {id:'zelenushka',name:'Зеленушка',rarity:'Обычная',reward:82,xp:31,speed:132,size:44,image:'assets/images/bird-zelenushka.webp',desc:'Спокойнее чижа, но любит держать дистанцию.'},
  {id:'chechetka',name:'Чечётка',rarity:'Редкая',reward:125,xp:50,speed:148,size:42,image:'assets/images/bird-chechetka.webp',desc:'Небольшая северная птица с красной шапочкой.'},
  {id:'popolzen',name:'Поползень',rarity:'Редкая',reward:138,xp:55,speed:154,size:43,image:'assets/images/bird-popolzen.webp',desc:'Любит стволы деревьев и резко меняет направление.'},
  {id:'kamyshovka',name:'Камышовка',rarity:'Редкая',reward:148,xp:58,speed:150,size:44,image:'assets/images/bird-kamyshovka.webp',desc:'Прячется среди камышей и появляется у воды.'},
  {id:'schegol',name:'Щегол',rarity:'Редкая',reward:155,xp:62,speed:162,size:44,image:'assets/images/bird-schegol.webp',desc:'Яркий редкий трофей с высокой ценой.'},
  {id:'snegir',name:'Снегирь',rarity:'Редкая',reward:175,xp:70,speed:132,size:48,image:'assets/images/bird-snegir.webp',desc:'Красная грудка делает его заметным на зимних маршрутах.'},
  {id:'uragus',name:'Урагус',rarity:'Эпическая',reward:255,xp:105,speed:155,size:47,image:'assets/images/bird-uragus.webp',desc:'Редкий розовый трофей северных районов.'},
  {id:'sviristel',name:'Свиристель',rarity:'Эпическая',reward:290,xp:120,speed:140,size:50,image:'assets/images/bird-sviristel.webp',desc:'Эффектный хохолок и серьёзная награда.'},
  {id:'dyatel',name:'Дятел',rarity:'Эпическая',reward:275,xp:116,speed:156,size:49,image:'assets/images/bird-dyatel.webp',desc:'Крупнее обычных птиц и любит резкие смены направления.'},
  {id:'sova',name:'Сова',rarity:'Эпическая',reward:365,xp:155,speed:120,size:58,image:'assets/images/bird-sova.webp',desc:'Медленнее остальных, но осторожнее и дороже.'},
  {id:'zimorodok',name:'Зимородок',rarity:'Легендарная',reward:590,xp:250,speed:180,size:45,image:'assets/images/bird-zimorodok.webp',desc:'Легендарный трофей. Очень быстрый и очень ценный.'},
  {id:'berkut',name:'Беркут',rarity:'Босс',reward:1500,xp:600,speed:205,size:88,image:'assets/images/boss-berkut.webp',desc:'Босс каждой десятой экспедиции. Требует нескольких точных ударов сачком.',boss:true}
];

const HEROES=[
  {id:'sergey',name:'Серёжа',role:'Универсал',image:'assets/images/char-sergey.webp',bonus:'Баланс характеристик',desc:'Ровный персонаж без слабых мест. Подходит для любого уровня.',mods:{coins:1,xp:1,rare:1,speed:1,combo:1,net:1}},
  {id:'kazak',name:'Казак',role:'Следопыт',image:'assets/images/char-kazak.webp',bonus:'+20% монет за редкую добычу',desc:'Специалист по ценным трофеям. Чаще замечает редкие виды.',mods:{coins:1.20,xp:1,rare:1.13,speed:.99,combo:1,net:1.03}},
  {id:'docent',name:'Доцент',role:'Исследователь',image:'assets/images/char-docent.webp',bonus:'+25% опыта',desc:'Быстрее повышает общий уровень и уровень героя.',mods:{coins:1,xp:1.25,rare:1.07,speed:.98,combo:1,net:1}},
  {id:'vitalya',name:'Виталя',role:'Спринтер',image:'assets/images/char-vitalya.webp',bonus:'+14% скорость и сильнее комбо',desc:'Самый динамичный герой для активной серийной ловли.',mods:{coins:1,xp:1,rare:1.02,speed:1.14,combo:1.38,net:.97}}
];

const LOCATIONS=[
  {id:'forest',name:'Сосновый лес',image:'assets/images/loc-forest.webp',weather:'Пыльца',difficulty:'Легко',desc:'Светлый лес и спокойный старт.',birds:['sinica','vorobey','chizh','zelenushka','schegol','popolzen']},
  {id:'river',name:'Река',image:'assets/images/loc-river.webp',weather:'Туман',difficulty:'Средне',desc:'Вода, камыши и быстрые виды.',birds:['sinica','vorobey','kamyshovka','schegol','popolzen','zimorodok']},
  {id:'mountains',name:'Горы',image:'assets/images/loc-mountains.webp',weather:'Ветер',difficulty:'Сложно',desc:'Высота, ветер и более ценные птицы.',birds:['chizh','chechetka','snegir','dyatel','sova','uragus']},
  {id:'swamp',name:'Болото',image:'assets/images/loc-swamp.webp',weather:'Дождь',difficulty:'Сложно',desc:'Тёмная влажная зона с редкими встречами.',birds:['kamyshovka','zelenushka','popolzen','sviristel','sova','zimorodok']},
  {id:'winter',name:'Зимний лес',image:'assets/images/loc-winter.webp',weather:'Снег',difficulty:'Эксперт',desc:'Снег, мороз и самые дорогие трофеи.',birds:['chechetka','snegir','uragus','sviristel','sova','zimorodok']}
];

const LEVELS=Array.from({length:50},(_,i)=>{
  const n=i+1,locIndex=Math.floor(i/10),boss=n%10===0;
  return {
    id:n,location:LOCATIONS[locIndex].id,boss,
    time:boss?78:Math.max(50,64-Math.floor(i/10)*2),
    target:boss?8+locIndex*2:5+Math.floor(i*.30),
    targetCoins:boss?1300+n*45:320+n*27,
    targetCombo:Math.min(15,3+Math.floor(n/4)),
    rareNeed:n<8?0:Math.min(4,1+Math.floor((n-8)/12)),
    speedMult:1+i*.012,
    spawnInterval:Math.max(.34,.72-i*.006)
  };
});

const DAILY_REWARDS=[
  {icon:'🪙',label:'120 монет',coins:120},{icon:'🪙',label:'180 монет',coins:180},{icon:'🌾',label:'1 приманка',feed:1},
  {icon:'🪙',label:'280 монет',coins:280},{icon:'🌾',label:'2 приманки',feed:2},{icon:'🪙',label:'450 монет',coins:450},{icon:'🎁',label:'800 монет + 2 приманки',coins:800,feed:2}
];

const DEFAULT_STATE={
  coins:1600,feed:5,level:1,xp:0,hero:'sergey',selectedLevel:1,highestLevel:1,caught:{},levelStars:{},firstClear:{},bestRun:0,bestScore:0,totalCoinsEarned:0,
  netLevel:1,bootsLevel:1,luckLevel:1,gloveLevel:1,charmLevel:1,rarePity:0,
  heroXP:{sergey:0,kazak:0,docent:0,vitalya:0},
  seasonXP:0,seasonClaims:{},seasonStart:Date.now(),
  daily:{lastClaim:'',streak:0},dailyStats:{date:'',caught:0,rare:0,coins:0,runs:0},weeklyStats:{week:'',caught:0,rare:0,coins:0,runs:0,bosses:0,stars:0},taskClaims:{},achievementClaims:{},
  audio:{master:true,music:45,birds:38,sfx:65}
};

let state=loadState();
let phaserGame=null,activeScene=null,runStarting=false,joystickVector={x:0,y:0,active:false},audio=null,currentTaskTab='daily';

function loadState(){
  try{
    let raw=localStorage.getItem(STORAGE_KEY);
    if(!raw){for(const key of OLD_STORAGE_KEYS){if(localStorage.getItem(key)){raw=localStorage.getItem(key);break;}}}
    const p=raw?JSON.parse(raw):null;
    if(!p)return structuredClone(DEFAULT_STATE);
    return {...structuredClone(DEFAULT_STATE),...p,caught:p.caught||{},levelStars:p.levelStars||{},firstClear:p.firstClear||{},heroXP:{...DEFAULT_STATE.heroXP,...(p.heroXP||{})},seasonClaims:p.seasonClaims||{},daily:{...DEFAULT_STATE.daily,...(p.daily||{})},dailyStats:{...DEFAULT_STATE.dailyStats,...(p.dailyStats||{})},weeklyStats:{...DEFAULT_STATE.weeklyStats,...(p.weeklyStats||{})},taskClaims:p.taskClaims||{},achievementClaims:p.achievementClaims||{},audio:{...DEFAULT_STATE.audio,...(p.audio||{})}};
  }catch{return structuredClone(DEFAULT_STATE);}
}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function currentHero(){return HEROES.find(h=>h.id===state.hero)||HEROES[0];}
function currentLevel(){return LEVELS[Math.max(0,Math.min(49,(state.selectedLevel||1)-1))];}
function currentLocation(){return LOCATIONS.find(l=>l.id===currentLevel().location)||LOCATIONS[0];}
function birdById(id){return BIRDS.find(b=>b.id===id);}
function totalCaught(){return Object.values(state.caught).reduce((a,b)=>a+b,0);}
function unlockedSpecies(){return BIRDS.filter(b=>(state.caught[b.id]||0)>0).length;}
function totalStars(){return Object.values(state.levelStars).reduce((a,b)=>a+(Number(b)||0),0);}
function rareCaught(){return BIRDS.filter(b=>!['Обычная'].includes(b.rarity)).reduce((s,b)=>s+(state.caught[b.id]||0),0);}
function xpNeed(level=state.level){return 520+level*140;}
function heroLevel(id){let xp=state.heroXP[id]||0,lvl=1,need=300;while(xp>=need&&lvl<30){xp-=need;lvl++;need=300+(lvl-1)*120;}return {level:lvl,xp,need};}
function effectiveHeroMods(){const h=currentHero(),hl=heroLevel(h.id).level-1,g=1+hl*.008;return {...h.mods,coins:h.mods.coins*g,xp:h.mods.xp*g,rare:h.mods.rare*(1+hl*.004),speed:h.mods.speed*(1+hl*.006),combo:h.mods.combo*(1+hl*.006),net:h.mods.net*(1+hl*.004)};}
function rarityColor(r){return r==='Босс'?'#ffb55e':r==='Легендарная'?'#ffc668':r==='Эпическая'?'#d99cff':r==='Редкая'?'#7cddff':'#d9e1d1';}
function gainXP(amount){state.xp+=Math.round(amount*effectiveHeroMods().xp);while(state.xp>=xpNeed()){state.xp-=xpNeed();state.level++;toast('Новый общий уровень: '+state.level+' ⭐');playSfx('reward');}}
function gainHeroXP(amount){state.heroXP[state.hero]=(state.heroXP[state.hero]||0)+Math.round(amount*effectiveHeroMods().xp);}
function dateKey(d=new Date()){return d.toISOString().slice(0,10);}
function yesterdayKey(){const d=new Date();d.setDate(d.getDate()-1);return dateKey(d);}
function weekKey(){const d=new Date(),day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return dateKey(d);}
function resetTimedStats(){const d=dateKey(),w=weekKey();if(state.dailyStats.date!==d)state.dailyStats={date:d,caught:0,rare:0,coins:0,runs:0};if(state.weeklyStats.week!==w)state.weeklyStats={week:w,caught:0,rare:0,coins:0,runs:0,bosses:0,stars:0};saveState();}

class AudioDirector{
  constructor(){
    this.music=new Audio('assets/audio/music-loop.wav');this.music.loop=true;this.music.preload='auto';
    this.birds=new Audio('assets/audio/birds-loop.wav');this.birds.loop=true;this.birds.preload='auto';
    this.sources={ui:'assets/audio/ui.wav',net:'assets/audio/net.wav',catch:'assets/audio/catch.wav',miss:'assets/audio/miss.wav',reward:'assets/audio/reward.wav',boss:'assets/audio/boss.wav'};
    this.started=false;this.apply();
  }
  apply(){const a=state.audio||DEFAULT_STATE.audio;const on=a.master!==false;this.music.volume=on?(a.music||0)/100:0;this.birds.volume=on?(a.birds||0)/100:0;if(!on){this.music.pause();this.birds.pause();}else if(this.started){this.music.play().catch(()=>{});this.birds.play().catch(()=>{});}}
  start(){if(this.started)return;this.started=true;this.apply();this.music.play().catch(()=>{});this.birds.play().catch(()=>{});}
  sfx(name,volume=1){if(state.audio?.master===false)return;const src=this.sources[name];if(!src)return;const a=new Audio(src);a.volume=Math.min(1,((state.audio?.sfx??65)/100)*volume);a.play().catch(()=>{});}
}
function ensureAudio(){if(!audio)audio=new AudioDirector();audio.start();}
function playSfx(name,vol=1){if(!audio)audio=new AudioDirector();audio.sfx(name,vol);}

function toast(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),2100);}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));document.querySelectorAll('[data-screen]').forEach(b=>b.classList.toggle('active',b.dataset.screen===id));const game=id==='game-screen';$('topbar').classList.toggle('game-hidden',game);$('bottomNav').classList.toggle('game-hidden',game);if(id==='map')setTimeout(scrollToSelectedChapter,30);}
function scrollToSelectedChapter(){const i=Math.floor((state.selectedLevel-1)/10),el=$('chapterCarousel')?.children[i];if(el)el.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});}
function syncCarouselLabel(el,label,total){if(!el||!label)return;const update=()=>{const kids=[...el.children];if(!kids.length)return;let best=0,dist=Infinity;kids.forEach((k,i)=>{const d=Math.abs(k.offsetLeft-el.scrollLeft);if(d<dist){dist=d;best=i;}});label.textContent=`${best+1} / ${total}`;};el.addEventListener('scroll',()=>requestAnimationFrame(update),{passive:true});update();}

function renderHUD(){
  resetTimedStats();$('coinsHud').textContent=state.coins;$('feedHud').textContent=state.feed;$('levelHud').textContent=state.level;
  $('homeCaught').textContent=totalCaught();$('homeSpecies').textContent=unlockedSpecies()+'/15';$('homeStars').textContent=totalStars();$('homeHero').textContent=currentHero().name;$('collectionCount').textContent=unlockedSpecies();
  $('soundToggle').textContent=state.audio.master?'🔊':'🔇';
  const pending=dailyPendingInfo();$('dailyTitle').textContent=pending.claimedToday?`Серия ${state.daily.streak} дней`:`День ${pending.nextStreak}`;$('dailyText').textContent=pending.claimedToday?'Награда уже получена. Возвращайся завтра.':`${DAILY_REWARDS[pending.rewardIndex].icon} ${DAILY_REWARDS[pending.rewardIndex].label}`;$('dailyClaimBtn').disabled=pending.claimedToday;$('dailyClaimBtn').textContent=pending.claimedToday?'Получено':'Забрать';
  const sl=seasonLevel();$('seasonHomeText').textContent=`Уровень сезона ${sl.level} / 30`;$('seasonHomeBar').style.width=(sl.progress/sl.need*100)+'%';
  $('dailyQuestHeadline').textContent=`${dailyQuestDefs().filter(q=>!isTaskClaimed(q.key)).length} задания на сегодня`;
}

function dailyPendingInfo(){const today=dateKey(),last=state.daily.lastClaim;if(last===today)return {claimedToday:true,nextStreak:state.daily.streak||1,rewardIndex:Math.max(0,(state.daily.streak||1)-1)%7};const next=last===yesterdayKey()?Math.min(7,(state.daily.streak||0)+1):1;return {claimedToday:false,nextStreak:next,rewardIndex:next-1};}
function claimDaily(){ensureAudio();const p=dailyPendingInfo();if(p.claimedToday)return;const r=DAILY_REWARDS[p.rewardIndex];state.daily.lastClaim=dateKey();state.daily.streak=p.nextStreak;if(state.daily.streak>=7)state.daily.streak=7;state.coins+=r.coins||0;state.feed+=r.feed||0;state.seasonXP+=80+20*p.nextStreak;saveState();renderAll();playSfx('reward');toast('Ежедневная награда получена');}

function seasonLevel(){const need=250,level=Math.min(30,Math.floor(state.seasonXP/need)+1),progress=level>=30?need:state.seasonXP%need;return {level,progress,need};}
function seasonReward(tier){if(tier%10===0)return {icon:'🎁',label:`${tier*110} монет + 2 приманки`,coins:tier*110,feed:2};if(tier%5===0)return {icon:'🌾',label:'2 приманки',feed:2};return {icon:'🪙',label:`${120+tier*18} монет`,coins:120+tier*18};}
function seasonUnlocked(tier){return state.seasonXP>=(tier-1)*250;}
function claimSeason(tier){if(!seasonUnlocked(tier)||state.seasonClaims[tier])return;const r=seasonReward(tier);state.coins+=r.coins||0;state.feed+=r.feed||0;state.seasonClaims[tier]=true;saveState();renderAll();playSfx('reward');toast('Сезонная награда получена');}
function renderSeason(){const sl=seasonLevel(),days=Math.max(0,30-Math.floor((Date.now()-state.seasonStart)/86400000));$('seasonLevelText').textContent=`Уровень ${sl.level} / 30`;$('seasonXpText').textContent=`${sl.progress} / ${sl.need} XP`;$('seasonProgressBar').style.width=(sl.progress/sl.need*100)+'%';$('seasonDays').textContent=`${days} дней осталось`;$('seasonCarousel').innerHTML=Array.from({length:30},(_,i)=>{const t=i+1,r=seasonReward(t),u=seasonUnlocked(t),c=!!state.seasonClaims[t];return `<article class="season-tier ${u?'':'locked'} ${c?'claimed':''}"><div class="num">${t}</div><div class="reward-icon">${r.icon}</div><h3>${r.label}</h3><p>${u?(c?'Награда получена':'Можно забрать'):`Нужно ${(t-1)*250} XP`}</p><button class="${u&&!c?'primary':'secondary'}" data-season="${t}" ${!u||c?'disabled':''}>${c?'Получено':u?'Забрать':'Закрыто'}</button></article>`;}).join('');$('seasonCarousel').querySelectorAll('[data-season]').forEach(b=>b.onclick=()=>claimSeason(Number(b.dataset.season)));}

function levelMissionText(l){if(l.boss)return `Поймай ${l.target} птиц и победи Беркутa`;return `Поймай ${l.target} птиц${l.rareNeed?` · редких ${l.rareNeed}`:''}`;}
function renderMap(){
  $('chapterCarousel').innerHTML=LOCATIONS.map((loc,ci)=>{const levels=LEVELS.slice(ci*10,ci*10+10);return `<article class="chapter-card"><div class="chapter-photo" style="background-image:url('${loc.image}')"></div><div class="chapter-body"><div class="eyebrow">ГЛАВА ${ci+1} · ${loc.difficulty}</div><h3>${loc.name}</h3><p>${loc.desc}</p><div class="level-grid">${levels.map(l=>{const unlocked=l.id<=state.highestLevel,stars=state.levelStars[l.id]||0,sel=l.id===state.selectedLevel;return `<button class="level-node ${unlocked?'':'locked'} ${stars?'completed':''} ${l.boss?'boss':''} ${sel?'selected':''}" data-level="${l.id}" ${unlocked?'':'disabled'}>${l.boss?'🦅':l.id}<small>${stars?'★'.repeat(stars):l.boss?'БОСС':'уровень'}</small></button>`;}).join('')}</div><button class="primary chapter-play" data-play-selected="${ci}" ${ci*10+1>state.highestLevel?'disabled':''}>${ci*10+1>state.highestLevel?'🔒 Глава закрыта':'▶ Играть выбранный'}</button></div></article>`;}).join('');
  $('chapterCarousel').querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{state.selectedLevel=Number(b.dataset.level);saveState();renderMap();playSfx('ui');toast(levelMissionText(currentLevel()));});
  $('chapterCarousel').querySelectorAll('[data-play-selected]').forEach(b=>b.onclick=()=>{const ci=Number(b.dataset.playSelected),low=ci*10+1,high=ci*10+10;if(state.selectedLevel<low||state.selectedLevel>high)state.selectedLevel=Math.min(state.highestLevel,low);startRun();});
}
function chapterMove(dir){const car=$('chapterCarousel'),cards=[...car.children];if(!cards.length)return;const center=car.scrollLeft+car.clientWidth/2;let idx=0,min=Infinity;cards.forEach((c,i)=>{const d=Math.abs(c.offsetLeft+c.offsetWidth/2-center);if(d<min){min=d;idx=i;}});idx=Math.max(0,Math.min(cards.length-1,idx+dir));cards[idx].scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});}

function renderBirds(){
  $('birdCarousel').innerHTML=BIRDS.map(b=>{const n=state.caught[b.id]||0,locked=!n;return `<article class="bird-card ${locked?'locked':''}"><div class="rarity" style="color:${rarityColor(b.rarity)}">${b.rarity}</div><div class="bird-photo" style="background-image:url('${b.image}')"></div><div class="bird-body"><h3>${locked?'???':b.name}</h3><p>${locked?'Поймай эту птицу, чтобы открыть карточку и описание.':b.desc}</p><div class="bird-stats"><div class="tiny-stat">Поймано<b>${n||'—'}</b></div><div class="tiny-stat">Награда<b>${b.reward} 🪙</b></div><div class="tiny-stat">Скорость<b>${b.boss?'БОСС':Math.round(b.speed)}</b></div><div class="tiny-stat">Опыт<b>${b.xp} XP</b></div></div></div></article>`;}).join('');
  syncCarouselLabel($('birdCarousel'),$('birdPagerLabel'),BIRDS.length);
}

function heroCard(h){const info=heroLevel(h.id),selected=h.id===state.hero,cost=350+info.level*120;return `<article class="hero-card"><div class="hero-photo" style="background-image:url('${h.image}')"></div><div class="hero-body"><div class="eyebrow">${h.role} · УР. ${info.level}</div><h3>${h.name}</h3><p>${h.desc}</p><div class="hero-bonus">${h.bonus}</div><div class="hero-progress"><small>${info.xp} / ${info.need} XP героя</small><div class="progress"><i style="width:${info.xp/info.need*100}%"></i></div></div><div class="hero-actions"><button class="${selected?'secondary':'primary'}" data-hero="${h.id}">${selected?'Выбран':'Выбрать'}</button><button class="secondary" data-train="${h.id}">Тренировать · ${cost} 🪙</button></div></div></article>`;}
function renderHeroes(){$('heroCarousel').innerHTML=HEROES.map(heroCard).join('');$('heroCarousel').querySelectorAll('[data-hero]').forEach(b=>b.onclick=()=>selectHero(b.dataset.hero));$('heroCarousel').querySelectorAll('[data-train]').forEach(b=>b.onclick=()=>trainHero(b.dataset.train));}
function selectHero(id){state.hero=id;saveState();renderAll();playSfx('ui');toast('Выбран герой: '+currentHero().name);}
function trainHero(id){const info=heroLevel(id),cost=350+info.level*120;if(state.coins<cost){toast('Недостаточно монет');playSfx('miss');return;}state.coins-=cost;state.heroXP[id]=(state.heroXP[id]||0)+160;saveState();renderAll();playSfx('reward');toast('Тренировка завершена');}

function shopItems(){return [
  {id:'feed',name:'Приманка',icon:'🌾',desc:'1 заряд. На 10 секунд повышает шанс редкой птицы.',cost:180,buy:()=>state.feed++},
  {id:'net',name:'Сачок',icon:'🕸️',desc:'Больше радиус ловли и возможность захватить несколько птиц.',level:()=>state.netLevel,cost:()=>800+state.netLevel*420,buy:()=>state.netLevel++},
  {id:'boots',name:'Ботинки',icon:'🥾',desc:'Повышают скорость героя.',level:()=>state.bootsLevel,cost:()=>650+state.bootsLevel*360,buy:()=>state.bootsLevel++},
  {id:'luck',name:'Бинокль',icon:'🔭',desc:'Повышает шанс редких и легендарных встреч.',level:()=>state.luckLevel,cost:()=>850+state.luckLevel*480,buy:()=>state.luckLevel++},
  {id:'glove',name:'Перчатки',icon:'🧤',desc:'Снижают кулдаун между взмахами сачка.',level:()=>state.gloveLevel,cost:()=>900+state.gloveLevel*500,buy:()=>state.gloveLevel++},
  {id:'charm',name:'Талисман',icon:'🪶',desc:'Усиливает урон по боссам и сезонный опыт.',level:()=>state.charmLevel,cost:()=>1050+state.charmLevel*560,buy:()=>state.charmLevel++}
];}
function renderShop(){$('shopCarousel').innerHTML=shopItems().map(i=>{const cost=typeof i.cost==='function'?i.cost():i.cost,lvl=i.level?i.level():null;return `<article class="shop-card"><div class="shop-icon">${i.icon}</div><h3>${i.name}${lvl?` · ур. ${lvl}`:''}</h3><p>${i.desc}</p><div class="price">${cost} монет</div><button class="primary" data-buy="${i.id}">Купить</button></article>`;}).join('');$('shopCarousel').querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyShop(b.dataset.buy));}
function buyShop(id){const i=shopItems().find(x=>x.id===id),cost=typeof i.cost==='function'?i.cost():i.cost;if(state.coins<cost){toast('Недостаточно монет');playSfx('miss');return;}state.coins-=cost;i.buy();saveState();renderAll();playSfx('reward');toast('Улучшение куплено');}

function dailyQuestDefs(){const d=dateKey();return [
  {key:`${d}:d1`,title:'Утренняя стая',desc:'Поймай 10 птиц сегодня',target:10,reward:180,progress:()=>state.dailyStats.caught},
  {key:`${d}:d2`,title:'Редкая встреча',desc:'Поймай 2 редких птицы сегодня',target:2,reward:260,progress:()=>state.dailyStats.rare},
  {key:`${d}:d3`,title:'Доходный маршрут',desc:'Заработай 700 монет сегодня',target:700,reward:320,progress:()=>state.dailyStats.coins}
];}
function weeklyQuestDefs(){const w=weekKey();return [
  {key:`${w}:w1`,title:'Большая экспедиция',desc:'Поймай 60 птиц за неделю',target:60,reward:850,progress:()=>state.weeklyStats.caught},
  {key:`${w}:w2`,title:'Охота на босса',desc:'Победи 1 Беркута',target:1,reward:1100,progress:()=>state.weeklyStats.bosses},
  {key:`${w}:w3`,title:'Звёздный маршрут',desc:'Получи 8 новых звёзд',target:8,reward:950,progress:()=>state.weeklyStats.stars}
];}
const ACHIEVEMENTS=[
  {id:'a1',title:'Первое перо',desc:'Поймай первую птицу',target:1,reward:150,progress:()=>totalCaught()},
  {id:'a2',title:'Сотня',desc:'Поймай 100 птиц',target:100,reward:900,progress:()=>totalCaught()},
  {id:'a3',title:'Коллекционер',desc:'Открой 8 видов птиц',target:8,reward:700,progress:()=>unlockedSpecies()},
  {id:'a4',title:'Полный журнал',desc:'Открой все 15 видов',target:15,reward:1800,progress:()=>unlockedSpecies()},
  {id:'a5',title:'Звездочёт',desc:'Собери 60 звёзд уровней',target:60,reward:1200,progress:()=>totalStars()},
  {id:'a6',title:'Мастер маршрута',desc:'Открой 30 уровень',target:30,reward:1500,progress:()=>state.highestLevel},
  {id:'a7',title:'Финалист',desc:'Открой 50 уровень',target:50,reward:2600,progress:()=>state.highestLevel},
  {id:'a8',title:'Опытный герой',desc:'Прокачай любого героя до 10 уровня',target:10,reward:1000,progress:()=>Math.max(...HEROES.map(h=>heroLevel(h.id).level))},
  {id:'a9',title:'Богатый птицелов',desc:'Заработай 25 000 монет',target:25000,reward:1600,progress:()=>state.totalCoinsEarned},
  {id:'a10',title:'Повелитель боссов',desc:'Поймай Беркута 5 раз',target:5,reward:2200,progress:()=>state.caught.berkut||0}
];
function isTaskClaimed(key){return !!state.taskClaims[key];}
function claimTask(key,defs){const q=defs.find(x=>x.key===key);if(!q||isTaskClaimed(key)||q.progress()<q.target)return;state.taskClaims[key]=true;state.coins+=q.reward;state.seasonXP+=90;saveState();renderAll();playSfx('reward');toast('Награда получена: +'+q.reward);}
function claimAchievement(id){const a=ACHIEVEMENTS.find(x=>x.id===id);if(!a||state.achievementClaims[id]||a.progress()<a.target)return;state.achievementClaims[id]=true;state.coins+=a.reward;state.seasonXP+=150;saveState();renderAll();playSfx('reward');toast('Достижение получено');}
function renderTasks(){let html='';if(currentTaskTab==='daily'){html=dailyQuestDefs().map(q=>taskCard(q,'daily')).join('');}else if(currentTaskTab==='weekly'){html=weeklyQuestDefs().map(q=>taskCard(q,'weekly')).join('');}else{html=ACHIEVEMENTS.map(achievementCard).join('');}$('taskContent').innerHTML=html;$('taskContent').querySelectorAll('[data-claim-task]').forEach(b=>b.onclick=()=>claimTask(b.dataset.claimTask,b.dataset.type==='daily'?dailyQuestDefs():weeklyQuestDefs()));$('taskContent').querySelectorAll('[data-claim-ach]').forEach(b=>b.onclick=()=>claimAchievement(b.dataset.claimAch));}
function taskCard(q,type){const p=Math.min(q.target,q.progress()),done=p>=q.target,claimed=isTaskClaimed(q.key);return `<article class="task-card"><div class="task-head"><div><h3>${q.title}</h3><p>${q.desc}</p></div><div class="reward">+${q.reward} 🪙</div></div><div class="progress"><i style="width:${p/q.target*100}%"></i></div><div class="task-foot"><span>${p}/${q.target}</span>${done&&!claimed?`<button class="primary" data-claim-task="${q.key}" data-type="${type}">Забрать</button>`:claimed?'<b style="color:#a8f2cc">Получено</b>':'<span>В процессе</span>'}</div></article>`;}
function achievementCard(a){const p=Math.min(a.target,a.progress()),done=p>=a.target,claimed=!!state.achievementClaims[a.id];return `<article class="achievement-card"><div class="task-head"><div><h3>🏅 ${a.title}</h3><p>${a.desc}</p></div><div class="reward">+${a.reward} 🪙</div></div><div class="progress"><i style="width:${p/a.target*100}%"></i></div><div class="task-foot"><span>${p}/${a.target}</span>${done&&!claimed?`<button class="primary" data-claim-ach="${a.id}">Забрать</button>`:claimed?'<b style="color:#a8f2cc">Получено</b>':'<span>В процессе</span>'}</div></article>`;}

function renderLeague(){const names=['Артур Лесной','Михаил Север','Антон Сокол','Дима Тайга','Илья Ветер','Вера Река','Макс Кедр','Олег Снег','Лена Иволга'];const base=Math.max(1800,state.bestScore||0);let rows=names.map((name,i)=>({name,score:Math.round(base*(1.35-i*.065)+620-i*55),me:false}));rows.push({name:'Ты · '+currentHero().name,score:state.bestScore||0,me:true});rows.sort((a,b)=>b.score-a.score);$('leagueTable').innerHTML=rows.map((r,i)=>`<div class="league-row ${r.me?'me':''}"><div class="rank">${i+1}</div><div><b>${r.name}</b><small>${r.me?'твой лучший результат':'офлайн-соперник'}</small></div><div class="league-score">${r.score}</div></div>`).join('');}

function renderSettings(){const a=state.audio;$('musicVolume').value=a.music;$('birdsVolume').value=a.birds;$('sfxVolume').value=a.sfx;}
function openSaveModal(mode){$('saveModal').classList.remove('hidden');$('saveModal').dataset.mode=mode;$('saveModalTitle').textContent=mode==='export'?'Экспорт прогресса':'Импорт прогресса';$('saveText').value=mode==='export'?btoa(unescape(encodeURIComponent(JSON.stringify(state)))):'';$('saveModalApply').textContent=mode==='export'?'Копировать':'Импортировать';}
function closeSaveModal(){$('saveModal').classList.add('hidden');}
function applySaveModal(){const mode=$('saveModal').dataset.mode;if(mode==='export'){navigator.clipboard?.writeText($('saveText').value).catch(()=>{});toast('Код сохранения скопирован');closeSaveModal();return;}try{const obj=JSON.parse(decodeURIComponent(escape(atob($('saveText').value.trim()))));state={...structuredClone(DEFAULT_STATE),...obj};saveState();resetTimedStats();renderAll();closeSaveModal();toast('Прогресс импортирован');}catch{toast('Не удалось прочитать код сохранения');}}

function renderAll(){renderHUD();renderMap();renderBirds();renderHeroes();renderShop();renderTasks();renderSeason();renderLeague();renderSettings();}

function initNav(){
  document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>{ensureAudio();playSfx('ui');showScreen(b.dataset.screen);}));
  $('continueBtn').onclick=()=>{ensureAudio();state.selectedLevel=Math.min(state.highestLevel,50);saveState();startRun();};$('dailyClaimBtn').onclick=claimDaily;$('prevChapterBtn').onclick=()=>chapterMove(-1);$('nextChapterBtn').onclick=()=>chapterMove(1);
  $('taskTabs').querySelectorAll('[data-task-tab]').forEach(b=>b.onclick=()=>{currentTaskTab=b.dataset.taskTab;$('taskTabs').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));renderTasks();playSfx('ui');});
  $('soundToggle').onclick=()=>{state.audio.master=!state.audio.master;saveState();renderHUD();if(!audio)audio=new AudioDirector();audio.apply();if(state.audio.master)ensureAudio();};
  ['musicVolume','birdsVolume','sfxVolume'].forEach(id=>$(id).addEventListener('input',()=>{state.audio.music=Number($('musicVolume').value);state.audio.birds=Number($('birdsVolume').value);state.audio.sfx=Number($('sfxVolume').value);saveState();if(!audio)audio=new AudioDirector();audio.apply();}));
  $('exportSaveBtn').onclick=()=>openSaveModal('export');$('importSaveBtn').onclick=()=>openSaveModal('import');$('saveModalCancel').onclick=closeSaveModal;$('saveModalApply').onclick=applySaveModal;
  $('resetBtn').onclick=()=>{if(confirm('Точно удалить весь прогресс?')){state=structuredClone(DEFAULT_STATE);saveState();renderAll();toast('Прогресс сброшен');}};
  $('exitGameBtn').onclick=exitRun;$('catchGameBtn').onpointerdown=e=>{e.preventDefault();triggerCatch();};$('lureGameBtn').onpointerdown=e=>{e.preventDefault();useLure();};
  $('againBtn').onclick=()=>{$('run-result').classList.add('hidden');startRun();};$('resultMapBtn').onclick=()=>{$('run-result').classList.add('hidden');showScreen('map');};$('nextLevelBtn').onclick=()=>{if(state.selectedLevel<50&&state.selectedLevel<state.highestLevel+1)state.selectedLevel=Math.min(50,state.selectedLevel+1);$('run-result').classList.add('hidden');startRun();};
  window.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();triggerCatch();}});
  window.addEventListener('pointerdown',()=>ensureAudio(),{once:true});
}
function initJoystick(){const joy=$('joystick'),knob=$('joystickKnob');const update=(x,y)=>{const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=x-cx,dy=y-cy,max=r.width/2-28,len=Math.hypot(dx,dy)||1,k=Math.min(1,max/len),px=dx*k,py=dy*k;joystickVector.x=px/max;joystickVector.y=py/max;knob.style.transform=`translate(${px}px,${py}px)`;};joy.addEventListener('pointerdown',e=>{joystickVector.active=true;joy.setPointerCapture(e.pointerId);update(e.clientX,e.clientY);});joy.addEventListener('pointermove',e=>{if(joystickVector.active)update(e.clientX,e.clientY);});const end=()=>{joystickVector.active=false;joystickVector.x=0;joystickVector.y=0;knob.style.transform='translate(0,0)';};joy.addEventListener('pointerup',end);joy.addEventListener('pointercancel',end);}

function boot(){resetTimedStats();renderAll();initNav();initJoystick();const imgs=[...HEROES.map(h=>h.image),...LOCATIONS.map(l=>l.image),...BIRDS.map(b=>b.image),'assets/images/hero-bg.webp'];let done=0,finished=false;const progress=()=>{if(finished)return;done++;const pct=Math.round(done/imgs.length*100);$('boot-progress').style.width=pct+'%';$('boot-status').textContent=pct<100?'Загрузка графики '+pct+'%':'Готово';if(done>=imgs.length){finished=true;setTimeout(finishBoot,250);}};imgs.forEach(src=>{const img=new Image();img.onload=progress;img.onerror=progress;img.src=src;});setTimeout(()=>{if(!finished){finished=true;finishBoot();}},5000);}
function finishBoot(){$('boot-screen').classList.add('hidden');$('app').classList.remove('hidden');showScreen('home');if(!window.Phaser)$('phaser-error').classList.remove('hidden');}

function ensurePhaser(){if(phaserGame||!window.Phaser)return !!phaserGame;const config={type:Phaser.AUTO,parent:'phaser-game',backgroundColor:'#09171a',transparent:false,pixelArt:false,antialias:true,resolution:Math.min(window.devicePixelRatio||1,2),scale:{mode:Phaser.Scale.RESIZE,width:window.innerWidth,height:window.innerHeight,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{gravity:{x:0,y:0},debug:false}},scene:[GameScene],render:{antialias:true,roundPixels:false,powerPreference:'high-performance'}};phaserGame=new Phaser.Game(config);return true;}
function startRun(){if(runStarting)return;ensureAudio();showScreen('game-screen');$('run-result').classList.add('hidden');$('lureCount').textContent=state.feed;runStarting=true;setTimeout(()=>{if(!ensurePhaser()){$('phaser-error').classList.remove('hidden');runStarting=false;return;}const go=()=>{const scene=phaserGame.scene.keys.GameScene;if(scene&&scene.scene.isActive())scene.restartRun();else phaserGame.scene.start('GameScene');countdown(()=>{const s=phaserGame.scene.keys.GameScene;if(s)s.beginRun();runStarting=false;});};setTimeout(go,140);},40);}
function countdown(done){const el=$('countdown');el.classList.remove('hidden');let n=3;el.textContent=n;playSfx('ui');const t=setInterval(()=>{n--;if(n>0){el.textContent=n;playSfx('ui');}else{clearInterval(t);el.textContent='ВПЕРЁД!';playSfx('reward');setTimeout(()=>{el.classList.add('hidden');done();},420);}},620);}
function exitRun(){if(activeScene)activeScene.abortRun();showScreen('map');}
function triggerCatch(){if(activeScene&&activeScene.runActive)activeScene.swingNet();}
function useLure(){if(activeScene&&activeScene.runActive)activeScene.activateLure();}

class GameScene extends Phaser.Scene{
  constructor(){super({key:'GameScene'});this.runActive=false;}
  preload(){LOCATIONS.forEach(l=>this.load.image('loc_'+l.id,l.image));BIRDS.forEach(b=>this.load.image('birdphoto_'+b.id,b.image));HEROES.forEach(h=>this.load.image('herophoto_'+h.id,h.image));}
  create(){activeScene=this;this.cameras.main.setBackgroundColor('#09171a');this.createGeneratedTextures();this.createWorld();this.createWeather();this.createPlayerRig();this.birds=this.physics.add.group();this.keys=this.input.keyboard.addKeys({up:'W',down:'S',left:'A',right:'D'});this.cursors=this.input.keyboard.createCursorKeys();this.scale.on('resize',()=>this.layoutWorld());this.restartRun();}
  createGeneratedTextures(){
    if(!this.textures.exists('spark')){const g=this.make.graphics({x:0,y:0,add:false});g.fillStyle(0xffffff,1);g.fillCircle(8,8,8);g.generateTexture('spark',16,16);g.destroy();}
    HEROES.forEach(h=>{const key='head_'+h.id;if(this.textures.exists(key))return;const src=this.textures.get('herophoto_'+h.id).getSourceImage(),tex=this.textures.createCanvas(key,72,72),c=tex.context;c.save();c.beginPath();c.arc(36,36,34,0,Math.PI*2);c.clip();const sc=Math.max(72/src.width,72/src.height),dw=src.width*sc,dh=src.height*sc;c.drawImage(src,(72-dw)/2,(72-dh)*.20,dw,dh);c.restore();c.strokeStyle='rgba(244,220,155,.9)';c.lineWidth=3;c.beginPath();c.arc(36,36,34,0,Math.PI*2);c.stroke();tex.refresh();});
    BIRDS.forEach(b=>{const key='birdtoken_'+b.id;if(this.textures.exists(key))return;const src=this.textures.get('birdphoto_'+b.id).getSourceImage(),sz=b.boss?180:128,tex=this.textures.createCanvas(key,sz,sz),c=tex.context;c.save();c.beginPath();c.arc(sz/2,sz/2,sz/2-5,0,Math.PI*2);c.clip();const sc=Math.max(sz/src.width,sz/src.height),dw=src.width*sc,dh=src.height*sc;c.drawImage(src,(sz-dw)/2,(sz-dh)/2,dw,dh);c.restore();c.strokeStyle=b.boss?'rgba(255,190,89,.95)':'rgba(255,255,255,.72)';c.lineWidth=b.boss?7:4;c.beginPath();c.arc(sz/2,sz/2,sz/2-6,0,Math.PI*2);c.stroke();tex.refresh();});
  }
  createWorld(){this.bg=this.add.image(0,0,'loc_'+currentLocation().id).setOrigin(.5).setDepth(-30);this.tint=this.add.rectangle(0,0,10,10,0x071316,.12).setOrigin(.5).setDepth(-28);this.ambient=[];for(let i=0;i<20;i++){const a=this.add.circle(Math.random()*this.scale.width,Math.random()*this.scale.height,1+Math.random()*4,0xffffff,.08+Math.random()*.08).setDepth(-5);a.vx=(Math.random()-.5)*12;a.vy=-2-Math.random()*7;this.ambient.push(a);}this.layoutWorld();}
  layoutWorld(){const w=this.scale.width,h=this.scale.height;if(!w||!h)return;const img=this.textures.get('loc_'+currentLocation().id).getSourceImage(),sc=Math.max(w/img.width,h/img.height);this.bg.setPosition(w/2,h/2).setDisplaySize(img.width*sc,img.height*sc);this.tint.setPosition(w/2,h/2).setSize(w,h);this.physics.world.setBounds(26,64,Math.max(1,w-52),Math.max(1,h-128));}
  createWeather(){if(this.weather)this.weather.forEach(o=>o.destroy());this.weather=[];const type=currentLocation().weather,count=type==='Снег'?100:type==='Дождь'?90:45;for(let i=0;i<count;i++){let o;if(type==='Дождь')o=this.add.rectangle(Math.random()*this.scale.width,Math.random()*this.scale.height,1,11,0xc4eaff,.26).setDepth(50);else o=this.add.circle(Math.random()*this.scale.width,Math.random()*this.scale.height,1+Math.random()*2,type==='Снег'?0xffffff:0xf4e4a4,type==='Снег'?.45:.13).setDepth(type==='Снег'?40:-4);o.speed=type==='Дождь'?270+Math.random()*240:type==='Снег'?22+Math.random()*48:5+Math.random()*12;o.drift=(Math.random()-.5)*(type==='Снег'?38:15);this.weather.push(o);}}
  createPlayerRig(){
    this.player=this.add.container(this.scale.width/2,this.scale.height*.72).setDepth(20);this.physics.add.existing(this.player);this.player.body.setSize(48,74).setOffset(-24,-35).setCollideWorldBounds(true);
    this.shadow=this.add.ellipse(0,38,58,17,0x000000,.28).setDepth(-1);this.backpack=this.add.rectangle(-18,2,25,40,0x293728,1).setOrigin(.5);this.torso=this.add.rectangle(0,0,42,54,0x3f5541,1).setOrigin(.5).setStrokeStyle(2,0x1b241d,.8);
    this.legL=this.add.rectangle(-10,27,10,33,0x241c18,1).setOrigin(.5,0);this.legR=this.add.rectangle(10,27,10,33,0x241c18,1).setOrigin(.5,0);this.armL=this.add.rectangle(-24,-3,9,35,0xd0a889,1).setOrigin(.5,0);this.armR=this.add.rectangle(24,-3,9,35,0xd0a889,1).setOrigin(.5,0);
    this.head=this.add.image(0,-39,'head_'+state.hero).setDisplaySize(48,48);this.netRig=this.add.container(27,8);const handle=this.add.rectangle(34,-14,78,5,0x9b6b32,1).setOrigin(0,.5);const ring=this.add.ellipse(118,-14,62,50).setStrokeStyle(4,0xf2daa0,.96).setFillStyle(0xffffff,.02);const mesh=this.add.graphics();mesh.lineStyle(1,0xffffff,.17);for(let x=96;x<=140;x+=10)mesh.lineBetween(x,-34,x+5,7);for(let y=-30;y<=4;y+=8)mesh.lineBetween(94,y,145,y+2);this.netRig.add([handle,ring,mesh]);this.netRig.angle=-28;this.player.add([this.shadow,this.backpack,this.legL,this.legR,this.torso,this.armL,this.armR,this.head,this.netRig]);this.walkPhase=0;this.facing=1;
  }
  refreshHero(){this.head.setTexture('head_'+state.hero);const colors={sergey:0x3f5541,kazak:0x70442b,docent:0x485966,vitalya:0x285e7b};this.torso.setFillStyle(colors[state.hero]||0x3f5541,1);}
  restartRun(){const lvl=currentLevel();this.runActive=false;this.refreshHero();this.refreshLocation();this.levelData=lvl;this.timeLeft=lvl.time;this.runCaught=0;this.runCoins=0;this.runRare=0;this.combo=0;this.maxCombo=0;this.misses=0;this.lureTime=0;this.spawnClock=0;this.newSpecies=0;this.bossSprite=null;this.bossMaxHp=0;this.bossDefeated=false;this.startedSpecies=new Set(BIRDS.filter(b=>(state.caught[b.id]||0)>0).map(b=>b.id));this.birds.clear(true,true);this.player.setPosition(this.scale.width/2,this.scale.height*.72);this.player.body.setVelocity(0);$('bossBar').classList.add('hidden');this.updateDOM();}
  refreshLocation(){this.bg.setTexture('loc_'+currentLocation().id);this.layoutWorld();this.createWeather();}
  beginRun(){this.runActive=true;for(let i=0;i<Math.min(4,2+Math.floor(this.levelData.id/8));i++)this.spawnBird();if(this.levelData.boss)this.time.delayedCall(5200,()=>this.spawnBoss());if(this.levelData.id===1)toast('Двигайся джойстиком или WASD и нажимай «Ловить» рядом с птицей');}
  abortRun(){this.runActive=false;this.player.body.setVelocity(0);}
  activateLure(){if(!this.runActive)return;if(state.feed<=0){toast('Приманка закончилась');playSfx('miss');return;}state.feed--;state.seasonXP+=5;saveState();renderHUD();$('lureCount').textContent=state.feed;this.lureTime=10;toast('Приманка активна 10 секунд');playSfx('ui');this.cameras.main.flash(100,116,203,149,false);}
  chooseBird(){const pool=[],mods=effectiveHeroMods(),luck=(1+(state.luckLevel-1)*.07)*mods.rare,forceRare=state.rarePity>=12;currentLocation().birds.forEach(id=>{const b=birdById(id);let w=b.rarity==='Обычная'?6:b.rarity==='Редкая'?3.2:b.rarity==='Эпическая'?1.5:.55;if(b.rarity!=='Обычная')w*=luck;if(this.lureTime>0&&b.rarity!=='Обычная')w*=2.5;if(forceRare&&b.rarity==='Обычная')w*=.08;for(let i=0;i<Math.ceil(w*5);i++)pool.push(b);});return pool[Math.floor(Math.random()*pool.length)];}
  spawnBird(){if(!this.runActive||this.birds.getLength()>=18)return;const data=this.chooseBird(),w=this.scale.width,h=this.scale.height,edge=Math.floor(Math.random()*4);let x,y;if(edge===0){x=70+Math.random()*(w-140);y=82;}else if(edge===1){x=w-52;y=100+Math.random()*(h-250);}else if(edge===2){x=70+Math.random()*(w-140);y=h-140;}else{x=52;y=100+Math.random()*(h-250);}const s=this.physics.add.sprite(x,y,'birdtoken_'+data.id).setDepth(10).setDisplaySize(data.size*1.9,data.size*1.9).setCollideWorldBounds(true).setBounce(1);s.body.setCircle(42,22,22);s.birdData=data;s.target=new Phaser.Math.Vector2(70+Math.random()*(w-140),90+Math.random()*(h-260));s.flap=Math.random()*6.28;s.baseScale=s.scaleX;const ang=Math.random()*Math.PI*2,speed=data.speed*this.levelData.speedMult;s.setVelocity(Math.cos(ang)*speed,Math.sin(ang)*speed*.65);this.birds.add(s);}
  spawnBoss(){if(!this.runActive||this.bossSprite)return;const b=birdById('berkut'),w=this.scale.width;const s=this.physics.add.sprite(w/2,110,'birdtoken_berkut').setDepth(16).setDisplaySize(150,150).setCollideWorldBounds(true).setBounce(1);s.body.setCircle(72,18,18);s.birdData=b;s.boss=true;s.target=new Phaser.Math.Vector2(w*.2+Math.random()*w*.6,120+Math.random()*180);this.bossMaxHp=3+Math.floor(this.levelData.id/10)+(state.charmLevel<3?1:0);s.hp=this.bossMaxHp;s.setVelocity(170,-40);this.birds.add(s);this.bossSprite=s;$('bossBar').classList.remove('hidden');$('bossHp').style.width='100%';playSfx('boss');toast('Босс появился: Беркут!');}
  swingNet(){if(!this.runActive||this.swinging||this.netCooldown>0)return;this.swinging=true;this.netCooldown=Math.max(.22,.58-state.gloveLevel*.04-state.netLevel*.018);playSfx('net');const start=this.facing>0?-30:30,end=this.facing>0?58:-58;this.netRig.angle=start;this.tweens.add({targets:this.netRig,angle:end,duration:165,ease:'Cubic.easeOut',yoyo:true,onYoyo:()=>this.resolveCatch(),onComplete:()=>{this.swinging=false;this.netRig.angle=this.facing>0?-28:28;}});}
  resolveCatch(){const mods=effectiveHeroMods(),reach=(98+state.netLevel*16+Math.min(22,this.misses*7))*mods.net,ox=this.player.x+this.facing*72,oy=this.player.y-5,hits=[];this.birds.getChildren().forEach(b=>{if(!b.active)return;const d=Math.hypot(b.x-ox,b.y-oy),forward=(b.x-this.player.x)*this.facing;if(d<reach&&forward>-35)hits.push({b,d});});hits.sort((a,b)=>a.d-b.d);const maxHits=2+Math.floor(state.netLevel/4);let hit=false;hits.slice(0,maxHits).forEach(({b})=>{hit=true;b.boss?this.hitBoss(b):this.catchBird(b);});if(!hit){this.combo=0;this.misses++;playSfx('miss');this.updateDOM();}}
  hitBoss(b){if(!b.active)return;const damage=1+(state.charmLevel>=4?1:0);b.hp-=damage;this.misses=0;$('bossHp').style.width=Math.max(0,b.hp/this.bossMaxHp*100)+'%';this.catchFX(b.x,b.y,b.birdData,0,true);this.cameras.main.shake(100,.006);playSfx('boss',.8);if(b.hp<=0){this.runCaught++;this.runRare++;this.combo=Math.min(30,this.combo+3);this.maxCombo=Math.max(this.maxCombo,this.combo);const coins=b.birdData.reward+this.levelData.id*30;this.runCoins+=coins;state.caught.berkut=(state.caught.berkut||0)+1;gainXP(b.birdData.xp);gainHeroXP(180);state.seasonXP+=120+state.charmLevel*8;state.dailyStats.rare++;state.weeklyStats.rare++;state.weeklyStats.bosses++;this.catchFX(b.x,b.y,b.birdData,coins,false);b.disableBody(true,true);this.bossSprite=null;this.bossDefeated=true;$('bossBar').classList.add('hidden');playSfx('reward');this.checkObjective();}}
  catchBird(s){if(!s.active)return;const b=s.birdData,rare=b.rarity!=='Обычная',mods=effectiveHeroMods(),comboMult=1+Math.min(.9,this.combo*.055*mods.combo),heroCoins=rare?mods.coins:1,coins=Math.round(b.reward*comboMult*heroCoins);this.runCaught++;if(rare)this.runRare++;this.combo=Math.min(30,this.combo+1);this.maxCombo=Math.max(this.maxCombo,this.combo);this.misses=0;this.runCoins+=coins;state.caught[b.id]=(state.caught[b.id]||0)+1;if(!this.startedSpecies.has(b.id)){this.startedSpecies.add(b.id);this.newSpecies++;}state.rarePity=rare?0:(state.rarePity||0)+1;gainXP(b.xp*(1+Math.min(.45,this.combo*.025)));gainHeroXP(7+b.xp*.12);state.seasonXP+=5+(rare?7:0);state.dailyStats.caught++;state.dailyStats.coins+=coins;state.weeklyStats.caught++;state.weeklyStats.coins+=coins;if(rare){state.dailyStats.rare++;state.weeklyStats.rare++;}this.catchFX(s.x,s.y,b,coins,false);s.disableBody(true,true);playSfx(rare?'reward':'catch',rare?.75:.55);saveState();renderHUD();this.updateDOM();this.checkObjective();}
  catchFX(x,y,b,coins,bossHit){const color=b.rarity==='Босс'?0xffb45f:b.rarity==='Легендарная'?0xffc668:b.rarity==='Эпическая'?0xd99cff:b.rarity==='Редкая'?0x7cddff:0xa9f0c8;const ring=this.add.circle(x,y,18).setStrokeStyle(bossHit?6:4,color,1).setDepth(40);this.tweens.add({targets:ring,scale:bossHit?5:4,alpha:0,duration:420,ease:'Quad.easeOut',onComplete:()=>ring.destroy()});for(let i=0;i<(bossHit?28:18);i++){const p=this.add.image(x,y,'spark').setTint(color).setScale(.2+Math.random()*.3).setDepth(45),a=Math.random()*Math.PI*2,d=40+Math.random()*(bossHit?120:75);this.tweens.add({targets:p,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,alpha:0,scale:0,duration:360+Math.random()*240,onComplete:()=>p.destroy()});}if(coins){const t=this.add.text(x,y-35,'+'+coins+' 🪙',{fontFamily:'Arial',fontSize:'22px',fontStyle:'bold',color:'#fff7d5',stroke:'#061114',strokeThickness:5}).setOrigin(.5).setDepth(60);this.tweens.add({targets:t,y:y-88,alpha:0,duration:700,ease:'Cubic.easeOut',onComplete:()=>t.destroy()});}this.cameras.main.shake(70,bossHit?.005:.0025);}
  checkObjective(){const l=this.levelData,bossOk=!l.boss||this.bossDefeated,rareOk=this.runRare>=l.rareNeed;if(this.runCaught>=l.target&&bossOk&&rareOk)this.time.delayedCall(400,()=>{if(this.runActive)this.finishRun(true);});}
  finishRun(success){if(!this.runActive)return;this.runActive=false;this.player.body.setVelocity(0);const l=this.levelData,completed=success&&this.runCaught>=l.target&&this.runRare>=l.rareNeed&&(!l.boss||this.bossDefeated);let stars=0;if(completed){stars=1;if(this.runCoins>=l.targetCoins)stars++;if(this.maxCombo>=l.targetCombo)stars++;}
    const prev=state.levelStars[l.id]||0,newStars=Math.max(0,stars-prev);state.levelStars[l.id]=Math.max(prev,stars);if(completed&&l.id>=state.highestLevel&&state.highestLevel<50)state.highestLevel=Math.min(50,l.id+1);let clearBonus=0;if(completed&&!state.firstClear[l.id]){state.firstClear[l.id]=true;clearBonus=220+l.id*35+(l.boss?900:0);this.runCoins+=clearBonus;}
    state.coins+=this.runCoins;state.totalCoinsEarned+=this.runCoins;state.bestRun=Math.max(state.bestRun,this.runCaught);const seasonGain=this.runCaught*3+this.runRare*7+stars*35+(l.boss&&completed?100:0)+state.charmLevel*2;state.seasonXP+=seasonGain;state.dailyStats.runs++;state.weeklyStats.runs++;state.weeklyStats.stars+=newStars;const score=this.runCoins+this.runCaught*50+stars*500+(l.boss&&completed?1600:0);state.bestScore=Math.max(state.bestScore,score);saveState();renderAll();
    $('resultTitle').textContent=completed?'Уровень пройден':'Время вышло';$('resultIcon').textContent=completed?(l.boss?'🦅':'🏆'):'⏳';$('resultStars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);$('resultCoins').textContent='+'+this.runCoins+' 🪙';$('resultCaught').textContent=this.runCaught;$('resultCombo').textContent='x'+this.maxCombo;$('resultSeasonXp').textContent='+'+seasonGain;$('nextLevelBtn').disabled=!completed||l.id>=50;$('run-result').classList.remove('hidden');playSfx(completed?'reward':'miss');}
  updateDOM(){const l=this.levelData;$('runTime').textContent=Math.max(0,Math.ceil(this.timeLeft));$('runCaught').textContent=this.runCaught;$('runCombo').textContent='x'+this.combo;$('runCoins').textContent=this.runCoins;$('lureCount').textContent=state.feed;$('runLocation').textContent=currentLocation().name;$('runLevel').textContent='Ур. '+l.id;$('runObjective').textContent=levelMissionText(l);}
  update(time,delta){const dt=Math.min(.033,delta/1000);if(this.netCooldown>0)this.netCooldown-=dt;this.updatePlayer(dt);this.updateBirds(dt);this.updateWeather(dt);if(this.runActive){this.timeLeft-=dt;if(this.timeLeft<=0){this.timeLeft=0;this.updateDOM();this.finishRun(false);return;}this.spawnClock-=dt;if(this.spawnClock<=0){this.spawnBird();this.spawnClock=this.levelData.spawnInterval+Math.random()*.42;}if(this.lureTime>0)this.lureTime=Math.max(0,this.lureTime-dt);if(Math.floor(time/250)!==Math.floor((time-delta)/250))this.updateDOM();}}
  updatePlayer(dt){let x=0,y=0;if(this.keys.left.isDown||this.cursors.left.isDown)x--;if(this.keys.right.isDown||this.cursors.right.isDown)x++;if(this.keys.up.isDown||this.cursors.up.isDown)y--;if(this.keys.down.isDown||this.cursors.down.isDown)y++;x+=joystickVector.x;y+=joystickVector.y;const len=Math.hypot(x,y);if(len>1){x/=len;y/=len;}const mods=effectiveHeroMods(),speed=(265+(state.bootsLevel-1)*22)*mods.speed,targetX=x*speed,targetY=y*speed;this.player.body.velocity.x=Phaser.Math.Linear(this.player.body.velocity.x,targetX,.23);this.player.body.velocity.y=Phaser.Math.Linear(this.player.body.velocity.y,targetY,.23);if(Math.abs(x)>.06)this.facing=x>=0?1:-1;this.player.scaleX=this.facing;const moving=Math.abs(x)+Math.abs(y)>.12;if(moving){this.walkPhase+=dt*10;const s=Math.sin(this.walkPhase);this.legL.angle=s*25;this.legR.angle=-s*25;this.armL.angle=-s*18;this.armR.angle=s*18;this.torso.y=Math.abs(s)*-2;}else{this.legL.angle*=.75;this.legR.angle*=.75;this.armL.angle*=.75;this.armR.angle*=.75;this.torso.y*=.75;}}
  updateBirds(dt){const children=this.birds.getChildren();children.forEach((b,i)=>{if(!b.active)return;const data=b.birdData;if(b.boss){const dx=b.target.x-b.x,dy=b.target.y-b.y,d=Math.hypot(dx,dy)||1;if(d<60||Math.random()<.004)b.target.set(80+Math.random()*(this.scale.width-160),90+Math.random()*(this.scale.height*.42));b.body.velocity.x+=dx/d*80*dt;b.body.velocity.y+=dy/d*60*dt;const pd=Math.hypot(b.x-this.player.x,b.y-this.player.y);if(pd<260){b.body.velocity.x+=(this.player.x-b.x)/(pd||1)*95*dt;b.body.velocity.y+=(this.player.y-b.y)/(pd||1)*75*dt;}const mv=230*this.levelData.speedMult,v=Math.hypot(b.body.velocity.x,b.body.velocity.y);if(v>mv){b.body.velocity.x=b.body.velocity.x/v*mv;b.body.velocity.y=b.body.velocity.y/v*mv;}b.rotation=Phaser.Math.Clamp(b.body.velocity.y/800,-.14,.14);return;}
      b.flap=(b.flap||0)+dt*(7+data.speed/80);const dx=b.target.x-b.x,dy=b.target.y-b.y,d=Math.hypot(dx,dy)||1;if(d<45||Math.random()<.0025)b.target.set(70+Math.random()*(this.scale.width-140),90+Math.random()*(this.scale.height-240));b.body.velocity.x+=dx/d*35*dt;b.body.velocity.y+=dy/d*28*dt;const pdx=b.x-this.player.x,pdy=b.y-this.player.y,pdist=Math.hypot(pdx,pdy)||1,fearRadius=185+this.levelData.id*.7;if(this.runActive&&pdist<fearRadius){const fear=(fearRadius-pdist)/fearRadius;b.body.velocity.x+=pdx/pdist*300*fear*dt;b.body.velocity.y+=pdy/pdist*240*fear*dt;}
      for(let j=i+1;j<children.length;j++){const o=children[j];if(!o.active||o.boss)continue;const sx=b.x-o.x,sy=b.y-o.y,sd=Math.hypot(sx,sy)||1;if(sd<74){const f=(74-sd)/74*82;b.body.velocity.x+=sx/sd*f*dt;b.body.velocity.y+=sy/sd*f*dt;o.body.velocity.x-=sx/sd*f*dt;o.body.velocity.y-=sy/sd*f*dt;}}
      const adaptive=this.misses>=3?.90:1,max=data.speed*this.levelData.speedMult*adaptive,v=Math.hypot(b.body.velocity.x,b.body.velocity.y);if(v>max){b.body.velocity.x=b.body.velocity.x/v*max;b.body.velocity.y=b.body.velocity.y/v*max;}const pulse=1+Math.sin(b.flap)*.036;b.setScale(b.baseScale*pulse);b.rotation=Phaser.Math.Clamp(b.body.velocity.y/700,-.16,.16);
    });}
  updateWeather(dt){const w=this.scale.width,h=this.scale.height,type=currentLocation().weather;this.weather.forEach(p=>{p.y+=p.speed*dt;p.x+=p.drift*dt+(type==='Ветер'?Math.sin(this.time.now*.002)*42*dt:0);if(p.y>h+20){p.y=-20;p.x=Math.random()*w;}if(p.x>w+20)p.x=-20;if(p.x<-20)p.x=w+20;});this.ambient.forEach(a=>{a.y+=a.vy*dt;a.x+=a.vx*dt;if(a.y<-10){a.y=h+10;a.x=Math.random()*w;}if(a.x<-10)a.x=w+10;if(a.x>w+10)a.x=-10;});}
}

window.addEventListener('load',boot);
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
