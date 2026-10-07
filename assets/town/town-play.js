'use strict';
/* Panda Town play layer: town NPCs, daily bamboo shoots, lakeside fishing for OpenFOAM knowledge cards,
 * a daily task board, ambient life and the controls overlay. Account progress and rewards use
 * the server-validated town RPC; movement and animation remain local. */
(() => {
 const root=document.querySelector('#town-app');if(!root)return;
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const store={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d;}catch{return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}};
 const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
 const random=seed=>()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 const quiet=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

 /* Knowledge cards caught at the lake. Each one links to the site's own reference page. */
 const CARDS=window.FoamTownCards;
 const FISH=[['小鲫鱼','carp',.6],['鲤鱼','goldfish',.28],['锦鲤','koi',.1],['金色锦鲤','starry',.02]].map(([n,g,p])=>[n,window.FoamTownGlyph?.(g)||'🐟',p]);
 const TASKS=[['shoots','拾取竹笋',5],['visits','参观建筑',3],['fish','钓到知识卡',1],['learn','每日一题或会诊',1],['greet','打个招呼',2],['training','完成一个实训',1]];
 const NPCS=[
  {id:'mayor',name:'村长竹伯',x:300,y:535,radius:0,speed:0,stationary:true,lines:['欢迎来到小镇！我就在公告栏旁，随时可以找我问路。']},
  {id:'gardener',name:'园丁阿竹',x:760,y:1040,radius:180,speed:60,tint:'hue-rotate(70deg) saturate(1.3)',prop:'leaf',lines:['早上好！今天的竹笋藏在草丛和路边，走过去就能拾起来。','学堂里有“算例实训”：从准备算例到 ParaView 看结果，在小镇里把方腔算例完整跑一遍。','小地图上的绿色小点就是竹笋，去找找看吧。','竹子要长很久，学 OpenFOAM 也一样，一步一步来。']},
  {id:'fisher',name:'钓鱼老伯',x:2070,y:470,radius:70,speed:45,tint:'hue-rotate(200deg) saturate(.9)',prop:'fish',lines:['湖里的鱼会叼来知识卡。站到湖边按 E 抛竿，看到“！”就赶快再按一次 E。','金色锦鲤很少见，它叼来的卡片也一样珍贵。','钓鱼和调松弛因子一样，急不得。']},
  {id:'postman',name:'邮差小白',x:1300,y:1010,radius:330,speed:95,tint:'hue-rotate(320deg) saturate(1.4)',prop:'mail',lines:['答疑医院和讨论中心是同一份数据：在医院里提的问题，网站上马上能看到。','走到邻居的小屋门口按 E，就能给他们留言、送竹子。','点击速度按钮或按 R，在 1 倍、2 倍、4 倍移动速度之间切换。','同时按 W 和 D，就能往右上方斜着走。也可以点击地面自动行走。','按 1 到 6 可以直接做快捷栏里的动作。']},
  {id:'merchant',name:'竹笋铺阿团',x:1550,y:880,radius:100,speed:48,tint:'hue-rotate(30deg)',prop:'bamboo',action:'shop',lines:['欢迎来竹笋铺！采集和实训得到的竹笋，都能在这里换收藏。']},
  {id:'librarian',name:'馆员墨墨',x:1100,y:520,radius:100,speed:44,tint:'hue-rotate(150deg)',prop:'read',lines:['知识卡点开会弹出阅读窗口，右上角的叉号可以关闭。','学堂里能按主题抽取实训，做过的每一步都可以再看。']},
  {id:'engineer',name:'网格师方方',x:650,y:720,radius:140,speed:65,tint:'hue-rotate(240deg)',prop:'ruler',lines:['工坊的零碎工具总是装不下。要是有只竹编背篓就好了……改天带来，我们再慢慢聊。','生成网格后记得运行 checkMesh，质量报告会指出需要检查的位置。','去工坊的实验台调一调网格数，看看单元数怎样变化。']},
  {id:'tea',name:'茶摊小青',x:1780,y:1130,radius:110,speed:42,tint:'hue-rotate(90deg)',prop:'tea',action:'board',lines:['本镇留言板上都是写给这条街道的话，一起去看看吧。']},
  {id:'researcher',name:'研究员星竹',x:960,y:1260,radius:150,speed:58,tint:'hue-rotate(285deg)',prop:'experiment',lines:['改变一个参数再比较两次结果，更容易看出它的作用。','每完成一个新算例，就离实训成就近了一步。成就陈列在你的小屋里。']},
 ];
 const SHOOT='<svg viewBox="0 0 34 40" aria-hidden="true"><ellipse cx="17" cy="37" rx="11" ry="3" fill="#2f4a2a" opacity=".25"/><path d="M17 4c5 6 9 15 9 23 0 6-4 9-9 9s-9-3-9-9c0-8 4-17 9-23z" fill="#a8c76a" stroke="#4f6b37" stroke-width="2"/><path d="M17 6c-2 8-3 16-2 29M10 22c4-1 8 0 13 3M9 29c5-1 10 0 16 3" fill="none" stroke="#6f9147" stroke-width="2"/><path d="M17 4c2 3 3 6 3 9" stroke="#e7f2c4" stroke-width="2" fill="none"/></svg>';

 let game=null,uid='guest',day=null,cards=[],ui={};
 const dayKey=()=>'foamlab.town.day.'+uid,cardKey=()=>'foamlab.town.cards.'+uid;
 function loadDay(){const d=store.get(dayKey(),null);day=d&&d.date===today()?d:{date:today(),shoots:[],visits:[],fish:0,greet:0,done:false};cards=store.get(cardKey(),[]).filter(id=>CARDS.some(c=>c.id===id));}
 const saveDay=()=>store.set(dayKey(),day);
 const progress=id=>id==='shoots'?day.shoots.length:id==='visits'?day.visits.length:day[id]||0;

 /* UI pieces --------------------------------------------------------------------------- */
 function toast(text,kind=''){const box=ui.toasts;if(!box)return;const p=document.createElement('p');p.className='town-play-toast '+kind;p.textContent=text;box.append(p);while(box.childElementCount>3)box.firstElementChild.remove();setTimeout(()=>p.classList.add('is-leaving'),2600);setTimeout(()=>p.remove(),3100);}
 function float(x,y,text){if(!game)return;const el=document.createElement('b');el.className='town-float';el.textContent=text;el.style.left=x+'px';el.style.top=y+'px';game.world.append(el);setTimeout(()=>el.remove(),1200);}
 function drawTasks(){const panel=ui.tasks;if(!panel)return;const done=TASKS.every(([id,,goal])=>progress(id)>=goal);
  panel.querySelector('.town-quest-list').innerHTML=TASKS.map(([id,label,goal])=>{const n=Math.min(goal,progress(id));return `<li class="${n>=goal?'is-done':''}"><i aria-hidden="true">${n>=goal?'✔':''}</i><span>${label}</span><b>${n}/${goal}</b><em style="--p:${n/goal}"></em></li>`;}).join('')+(done?'<li class="town-quest-stamp">今日小镇达人 ✿</li>':'');
  panel.querySelector('.town-quest-count').textContent=TASKS.filter(([id,,goal])=>progress(id)>=goal).length+'/'+TASKS.length;
  drawRun();
  if(done&&!day.done){day.done=true;saveDay();toast('今日小任务全部完成！明天还有新的竹笋和任务。','is-gold');celebrate();}}
 // The cavity training run lives in the buildings module; the task board shows where to go next.
 function drawRun(){const box=ui.tasks?.querySelector('.town-quest-run'),T=window.FoamTownTraining;if(!box||!T)return;const s=T.state(),step=T.steps[s.step];
  box.innerHTML=`<p class="town-run-line"><b>${E(s.title)}</b><span>${s.empty?'按主题抽取实训':s.done?'已完成 ✓':s.step+'/5 · 下一步：'+step.title+' · '+T.steps[s.step].at.replace('school','学堂').replace('workshop','网格工坊').replace('gallery','展览馆')}</span></p><button type="button" data-play="run-go">${s.empty?'选择实训':s.done?'查看实训结果':'继续实训'} →</button>`;
  box.querySelector('[data-play=run-go]').onclick=()=>{const g=game,at=s.empty?'school':s.done?'gallery':step.at,i=g?.config.buildings.findIndex(b=>b[0]===at);if(g&&i>=0){g.stopMovement();g.config.interact?.(i);setTimeout(()=>document.querySelector('.tb-tabs [data-tab=run]')?.click(),0);}};}
 window.addEventListener('foamlab:town-quest',()=>drawRun());window.addEventListener('foamlab:town-learn',()=>bump('learn'));
 window.addEventListener('foamlab:town-progress',e=>{if(!game)return;day=e.detail.day;const tip=ui.tasks?.querySelector('.town-quest-tip');if(tip&&e.detail.box?.artChance&&!tip.dataset.art){tip.dataset.art='1';tip.textContent=tip.textContent.replace('完成全部任务 +10 竹笋','完成全部任务 +10 竹笋和一张熊猫画卡');}cards=e.detail.inventory.filter(i=>i.startsWith('card:')).map(i=>i.slice(5));drawTasks();const b=ui.tasks?.querySelector('[data-shoot-balance]');if(b)b.textContent=e.detail.balance;game.shootField?.sync();saveDay();});
 async function bump(id,value){if(game?.config.guest)return false;try{await window.FoamTownProgress.call('activity',{kind:id==='shoots'?'shoot':id==='visits'?'visit':id,item:String(value??'')});return true;}catch(error){toast(error.message);return false;}}
 function celebrate(){if(quiet()||!game)return;const me=game.me;for(let i=0;i<18;i++){const el=document.createElement('i');el.className='town-confetti';el.style.left=me.x+'px';el.style.top=me.y-60+'px';el.style.setProperty('--dx',(Math.random()*240-120)+'px');el.style.setProperty('--dy',(-Math.random()*140-40)+'px');el.style.setProperty('--c',['#f2c14e','#e86f5c','#6fb3c9','#8cc06a','#c38fd6'][i%5]);game.world.append(el);setTimeout(()=>el.remove(),1400);}}
 function overlay(kind,html,onClose){closeOverlay();root.dataset.overlay=kind;game?.stopMovement();const box=document.createElement('div');box.className='town-overlay town-overlay-'+kind;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.innerHTML=`<div class="town-overlay-card" tabindex="-1">${html}</div>`;root.append(box);ui.overlay={box,onClose};box.addEventListener('click',e=>{if(e.target===box||e.target.closest('[data-play-close]'))closeOverlay();});box.querySelector('.town-overlay-card').focus({preventScroll:true});}
 function closeOverlay(){if(!ui.overlay)return false;const {box,onClose}=ui.overlay;ui.overlay=null;box.remove();delete root.dataset.overlay;onClose?.();root.querySelector('.town-street-scroll')?.focus({preventScroll:true});return true;}
 window.addEventListener('keydown',e=>{
  if(!ui.overlay||document.querySelector('dialog[open]')||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey)return;
  const k=(e.key||'').toLowerCase(),escape=e.code==='Escape'||k==='escape';
  if(!escape&&(e.target.isContentEditable||e.target.closest?.('input,textarea,select')))return;
  if(!escape&&/^(Enter|Space)$/.test(e.code)&&e.target.closest?.('a,button,summary,[role=button]'))return;
  if(escape||['Enter','Space','KeyE','KeyH'].includes(e.code)||['enter','e','h',' '].includes(k)){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)closeOverlay();}
 },{capture:true});
 function help(){if(ui.overlay?.box.classList.contains('town-overlay-help')){closeOverlay();return;}const k=t=>`<kbd>${t}</kbd>`;
  overlay('help',`<header><h2>小镇操作</h2><button type="button" data-play-close aria-label="关闭">×</button></header><dl class="town-help-grid">
   <dt>${k('W')}${k('A')}${k('S')}${k('D')} 或方向键</dt><dd>上下左右移动</dd>
   <dt>${k('W')}+${k('D')} 等两键同按</dt><dd>斜向移动：右上、左上、右下、左下</dd>
   <dt>按住 ${k('Shift')} / 按 ${k('R')}</dt><dd>临时至少 2 倍速 / 切换 1 倍、2 倍、4 倍速</dd>
   <dt>${k('E')} 或 ${k('空格')}</dt><dd>和附近的建筑、邻居、NPC 互动，在湖边钓鱼</dd>
   <dt>${k('1')} – ${k('6')}</dt><dd>执行快捷栏里的动作和表情；主键盘与数字小键盘都可使用。击掌、递竹子等互动需要选择一位邻居。</dd>
   <dt>${k('+')} ${k('−')} 或滚轮</dt><dd>缩放画面</dd>
   <dt>点击地面 / 小地图</dt><dd>自动走过去，会绕开房子和树</dd>
   <dt>${k('M')} · ${k('H')}</dt><dd>回到省份地图 · 打开这份说明</dd>
   <dt>点击地面 / 速度按钮</dt><dd>点击地面自动寻路，用 1 倍 / 2 倍 / 4 倍按钮切换移动速度</dd></dl>
   <p class="town-note">底部的速度、互动、动作和帮助入口也可以点击。点击地面回到地图操作；填写内容或阅读弹窗时暂停快捷键，关闭后即可继续。</p><p class="town-note">竹笋、知识卡、任务和实训进度随账号保存。完成新算例还可获得学习经验。</p>`);}
 const rarityName=c=>({common:'普通',rare:'稀有',hidden:'隐藏'})[c.rarity]||'普通';
 function cardBody(c){return `<article class="town-knowledge-card is-${c.rarity}">${window.FoamTownIcon(c.rarity==='hidden'?'gem':c.rarity==='rare'?'star':'card','',true)}<small>${rarityName(c)}知识卡 · OpenFOAM v2512</small><h2>${E(c.title)}</h2><p>${E(c.text)}</p><a class="town-link" href="${E(c.href)}" target="_blank" rel="noopener">查看完整说明 ↗</a></article>`;}
 function detail(card,trigger){window.dispatchEvent(new CustomEvent('foamlab:knowledge-open',{detail:{id:card.id}}));const d=document.createElement('dialog');d.className='town-card-detail';d.setAttribute('aria-label',card.title+'知识卡');d.innerHTML=`<header><span>知识卡</span><button type="button" data-card-detail-close aria-label="关闭知识卡">×</button></header>${cardBody(card)}`;root.append(d);d.querySelector('[data-card-detail-close]').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>{d.remove();trigger?.focus({preventScroll:true});},{once:true});d.showModal();}
 function mountCollection(host){host.innerHTML=`<p class="town-note">100 张知识卡 · 75 张普通 / 20 张稀有 / 5 张隐藏。点击已收集的卡片，在弹窗中阅读。</p><div class="town-card-grid">${CARDS.map(c=>cards.includes(c.id)?`<button type="button" class="town-mini-card is-${c.rarity}" data-card-id="${c.id}">${window.FoamTownIcon(c.rarity==='hidden'?'gem':c.rarity==='rare'?'star':'card')}<strong>${E(c.title)}</strong><span>${rarityName(c)} · 点击阅读</span>${window.FoamCollectionTime?.(window.FoamTownProgress?.get()?.obtained_at?.['card:'+c.id])||''}</button>`:`<div class="town-mini-card is-locked" aria-label="未收集知识卡">${window.FoamTownIcon('lock')}<span>未收集</span></div>`).join('')}</div>`;host.querySelectorAll('[data-card-id]').forEach(b=>b.onclick=()=>detail(CARDS.find(c=>c.id===b.dataset.cardId),b));}
 function collection(){overlay('cards',`<header><h2>知识卡图鉴 <small>${cards.length}/${CARDS.length}</small></h2><button type="button" data-play-close aria-label="关闭图鉴">×</button></header><div data-knowledge-collection></div>`);mountCollection(ui.overlay.box.querySelector('[data-knowledge-collection]'));}
 function showCard(card,fish,fresh){overlay('card',`<header><h2>湖边的发现</h2><button type="button" data-play-close aria-label="关闭知识卡">×</button></header><div class="town-catch"><div class="town-catch-fish" aria-hidden="true">${fish[1]}</div><p>钓到了一条<strong>${fish[0]}</strong>，它叼着一张知识卡${fresh?'（新卡！）':''}</p></div>${cardBody(card)}<div class="town-overlay-actions"><button type="button" class="primary" data-play-close>收下 <kbd>E</kbd></button></div>`);}
 function welcome(){overlay('welcome',`<header><h2>村长竹伯 · 欢迎来到小镇</h2><button type="button" data-play-close aria-label="关闭">×</button></header><div class="town-welcome-portrait">${window.FoamTownNPCLook('mayor')}</div><section class="town-mayor-update"><strong>村长公告 · 10 月 5 日</strong><p>游乐园开门啦！在建筑目录选择“游乐园”，就能玩流光画布：全屏、小窗都可以，按 Esc 或右上角 × 返回。</p><p>彩蛋已增加到 126 项，发现与收藏会显示获得时间。终端就在底部操作提示栏；喷泉彩虹显示 20 秒后收起。夜间的倍速文字也更清楚了。</p></section><p>这里是和熊猫一起学习 OpenFOAM 的地方。沿着小路走，每栋建筑都有自己的用途。</p><ol class="town-welcome-steps"><li><b>先到学堂</b>按主题抽取实训，跟着五个步骤看懂计算过程，已完成的步骤可以回看。</li><li><b>有问题去答疑医院</b>带上配置、日志与结果，一起讨论。</li><li><b>在公告栏看每日任务与本镇留言</b>拾竹笋、参观、答题和实训都会留下进度。</li><li><b>到湖边钓知识卡</b>竹笋还可以在商店换收藏，稀有和隐藏卡等你发现。</li><li><b>在展览馆分享计算图片</b>给喜欢的作品点赞，作品与获赞会陈列在作者的小屋。</li></ol><p class="town-note">点击地面可以自动走过去；键盘 WASD 或方向键移动，点击速度按钮切换 1 倍 / 2 倍 / 4 倍速。随时回来找我聊聊。</p>`);}

 /* NPCs ------------------------------------------------------------------------------- */
 function talk(npc,m){window.dispatchEvent(new CustomEvent('foamlab:town-npc',{detail:{id:npc.id,x:m.x,y:m.y}}));if(npc.id==='mayor'){welcome();bump('greet');return;}if(npc.action){window.dispatchEvent(new CustomEvent('foamlab:town-open-extra',{detail:{kind:npc.action}}));bump('greet');return;}m.line=((m.line??-1)+1)%npc.lines.length;speech(m,npc.lines[m.line]);bump('greet');}
 function speech(m,text){m.el.querySelector('.town-speech')?.remove();const b=document.createElement('b');b.className='town-speech';b.textContent=text;m.el.append(b);clearTimeout(m.speechTimer);m.speechTimer=setTimeout(()=>b.remove(),5200);}

 /* Bamboo shoots ------------------------------------------------------------------------ */
 function shoots(g){if(day.shoots.length>=8)return [];const province=g.config.province||'plaza',rand=random(hash(day.date+province)),list=[],doors=g.positions.map((p,i)=>g.door(i)).filter(Boolean);
  for(let tries=0;tries<600&&list.length<8;tries++){const x=120+rand()*(g.width-240),y=140+rand()*(g.height-260);if(!g.walkable(x,y)||!g.walkable(x,y-14)||doors.some(d=>Math.hypot(d.x-x,d.y-y)<80)||list.some(s=>Math.hypot(s.x-x,s.y-y)<160)||Math.hypot(x-1035,y-954)<120)continue;list.push({id:province+':'+list.length,x,y});}
  for(const s of list){if(day.shoots.includes(s.id))continue;const el=document.createElement('i');el.className='town-shoot';el.dataset.shootId=s.id;el.innerHTML=SHOOT+'<b aria-hidden="true"></b>';el.style.left=s.x-17+'px';el.style.top=s.y-36+'px';el.style.zIndex=String(Math.floor(s.y));g.world.append(el);s.el=el;}
  return list.filter(s=>s.el);}

 /* Fishing ------------------------------------------------------------------------------ */
 function fishing(g){const lake=g.lake,center={x:lake.x+lake.w/2,y:lake.y+lake.h/2},spots=[];
  const ring=[];for(let y=lake.y+30;y<lake.y+lake.h-20;y+=46)ring.push({x:lake.x-26,y});for(let x=lake.x+20;x<lake.x+lake.w;x+=50)ring.push({x,y:lake.y+lake.h+18});
  for(const p of ring)if(g.walkable(p.x,p.y)&&!spots.some(s=>Math.hypot(s.x-p.x,s.y-p.y)<90))spots.push(p);
  let st=null;
  const end=(message)=>{if(!st)return;st.bobber.remove();st.line.remove();g.avatar()?.classList.remove('is-fishing');st.alert?.remove();g.locked=false;g.lockFace=null;g.lockPrompt=null;st=null;if(message)toast(message);};
  const start=spot=>{if(st||g.config.guest)return;const dx=center.x-spot.x,dy=center.y-spot.y,d=Math.hypot(dx,dy),tx=spot.x+dx/d*90,ty=spot.y+dy/d*70;g.locked=true;g.path=[];g.me.vx=g.me.vy=0;g.lockFace=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');g.avatar()?.classList.add('is-fishing');
   const bobber=document.createElement('i');bobber.className='town-bobber is-cast';bobber.style.left=tx-8+'px';bobber.style.top=ty-8+'px';g.world.append(bobber);
   const line=document.createElementNS('http://www.w3.org/2000/svg','svg');line.classList.add('town-fishing-line');const minX=Math.min(spot.x,tx)-20,minY=Math.min(spot.y-60,ty)-20,w=Math.abs(tx-spot.x)+40,h=Math.abs(ty-spot.y+60)+40;line.setAttribute('viewBox',`0 0 ${w} ${h}`);line.style.left=minX+'px';line.style.top=minY+'px';line.style.width=w+'px';line.style.height=h+'px';const hx=spot.x+(g.lockFace==='left'?-22:g.lockFace==='right'?22:12)-minX,hy=spot.y-58-minY,bx=tx-minX,by=ty-minY;line.innerHTML=`<path d="M${hx} ${hy}Q${(hx+bx)/2} ${Math.max(hy,by)+26} ${bx} ${by}" fill="none" stroke="#f7f1dc" stroke-width="1.6" opacity=".9"/>`;g.world.append(line);
   st={phase:'cast',t:.6,bobber,line,spot};g.lockPrompt={id:'fish-wait',x:spot.x,y:spot.y-104,label:'等待咬钩 · 点击收竿'};toast('抛竿……等鱼咬钩时会出现“！”');};
  const use=async()=>{if(!st)return;if(st.phase==='bite'){const r=Math.random();let acc=0,fish=FISH[0];for(const f of FISH){acc+=f[2];if(r<=acc){fish=f;break;}}const previous=[...cards],request=crypto.randomUUID();end();try{const had=window.FoamPandaCards?.owned()||new Set(),result=await window.FoamTownProgress.call('activity',{kind:'fish',request_id:request}),card=CARDS.find(c=>'card:'+c.id===result.reward.item);if(card&&game===g)showCard(card,card.rarity==='rare'?FISH[3]:fish===FISH[3]?FISH[2]:fish,!previous.includes(card.id));const art=result.reward?.art;if(art&&game===g)window.FoamPandaCards?.reveal(art.slice(4),{fresh:!had.has(art.slice(4)),source:'湖边钓鱼 · 鱼篓里还有一张画卡'});}catch(error){toast(error.message);}}
   else {void window.FoamTownEggs?.event('fish_miss').catch(()=>{});end('还没咬钩就收竿了，鱼都被吓跑了。');}};
  g.listen('use',use);g.listen('cancel',()=>end());g.listen('escape',()=>{if(st){end();return true;}return false;});
  return{spots:()=>st?[]:spots.map((s,i)=>({id:'fish'+i,at:s,x:s.x,y:s.y-104,range:58,label:'在湖边钓鱼',run:()=>start(s)})),
   update(dt){if(!st)return;st.t-=dt;
    if(st.phase==='cast'&&st.t<=0){st.phase='wait';st.t=1.6+Math.random()*2.8;st.bobber.classList.remove('is-cast');}
    else if(st.phase==='wait'&&st.t<=0){st.phase='bite';st.t=1;g.lockPrompt={...g.lockPrompt,id:'fish-bite',label:'咬钩了！立即收竿'};st.bobber.classList.add('is-bite');const a=document.createElement('b');a.className='town-alert';a.textContent='！';g.avatar()?.append(a);st.alert=a;}
    else if(st.phase==='bite'&&st.t<=0){void window.FoamTownEggs?.event('fish_miss').catch(()=>{});end('鱼溜走了……下次看到“！”要快一点。');}},
   minimap:()=>spots.map(s=>`<circle cx="${Math.round(s.x)}" cy="${Math.round(s.y)}" r="24" fill="#5aa9c9" stroke="#fff" stroke-width="8"/>`).join(''),destroy:()=>end()};}

 /* Wildlife is mounted by town-wildlife.js. Keep the existing slow cloud shadows. */
 function ambient(g){if(quiet())return{};for(let i=0;i<2;i++){const el=document.createElement('i');el.className='town-cloud-shadow';el.style.top=(300+i*700)+'px';el.style.animationDelay=(-i*45)+'s';g.world.append(el);}return{};}

 /* Footstep dust, a little stronger when running. */
 function dust(g){const pool=[];for(let i=0;i<10;i++){const el=document.createElement('i');el.className='town-dust';g.world.append(el);pool.push(el);}let n=0;
  g.listen('step',({x,y,speed})=>{if(quiet())return;if(speed<120&&n++%2)return;const el=pool[n++%pool.length];el.style.left=(x-9+(Math.random()*8-4))+'px';el.style.top=(y-6)+'px';el.style.zIndex=String(Math.floor(y)-1);const strong=speed>200;el.getAnimations?.().forEach(x=>x.cancel());
   // Web Animations restart the puff without the forced reflow that a class toggle needs on every step.
   if(el.animate)el.animate([{opacity:.8,transform:'scale(.4)'},{opacity:0,transform:`scale(${strong?2.2:1.6}) translateY(-6px)`}],{duration:strong?700:550,easing:'ease-out'});
   else{el.classList.toggle('is-strong',strong);el.classList.remove('is-on');void el.offsetWidth;el.classList.add('is-on');}});}

 /* Local feedback for actions and emotes: play them on your own panda at once, before the street hears
  * about it; if the server refuses, the pose stops again. */
 const net=window.FoamTownNet;if(net&&!net.__play){net.__play=true;const send=net.action;net.action=async payload=>{const me=document.querySelector('.town-resident.is-me'),kind=payload?.type;let bubble=null;
  if(me&&kind==='act')window.foamPandaMotion?.play(me,payload.action);
  if(me&&kind==='emote')bubble=window.FoamTownActions?.emote(me,payload.action);
  try{const result=await send({...payload,npc:window.FoamTownEggEvents?.nearestNPC()?.id||'',color:window.FoamTownEggEvents?.experimentColor()||''});window.dispatchEvent(new CustomEvent('foamlab:town-action',{detail:{...payload,result}}));if(kind==='duo-invite')bump('greet');return result;}
  catch(error){if(me&&kind==='act'&&me.dataset.action===payload.action)window.foamPandaMotion?.stop(me);bubble?.remove();throw error;}};}

 function mount(g){game=g;uid=g.config.userId||'guest';loadDay();const shell=g.viewport.closest('.town-game-shell')||g.viewport.parentElement;
  ui.toasts=document.createElement('div');ui.toasts.className='town-play-toasts';ui.toasts.setAttribute('aria-live','polite');shell.append(ui.toasts);
  ui.tasks=document.createElement('section');ui.tasks.className='town-quests';ui.tasks.setAttribute('aria-label','今日小任务');
  ui.tasks.innerHTML=`<button type="button" class="town-quest-head" aria-expanded="true"><b>每日任务</b><span class="town-quest-count"></span></button><div class="town-quest-wallet">${window.FoamTownGlyph?.('bamboo')||'🎋'} <b data-shoot-balance>…</b> <button type="button" data-town-extra="shop">去商店</button> <button type="button" data-town-extra="board">本镇留言</button></div><p class="town-quest-tip">每日 00:00（北京时间）刷新竹笋和任务 · 每天最多拾取 8 根 · 完成全部任务 +10 竹笋</p><ol class="town-quest-list"></ol><div class="town-quest-run"></div><div class="town-quest-foot"><button type="button" data-play="help">操作说明</button></div>${g.config.guest?'<p class="town-note">登录并入住后，就能拾竹笋、钓鱼和完成任务。</p>':''}`;
  shell.append(ui.tasks);
  const collapse=document.createElement('button');collapse.type='button';collapse.className='town-side-toggle';collapse.setAttribute('aria-label','收起右侧界面');shell.append(collapse);
  const right=[shell.querySelector('.town-game-top-tools'),shell.querySelector('.town-game-minimap'),ui.tasks,shell.querySelector('.town-game-tools')].filter(Boolean);
  let folded=store.get('foamlab.town.side-collapsed',false);const fold=()=>{shell.classList.toggle('is-side-collapsed',folded);collapse.textContent=folded?'‹':'›';collapse.setAttribute('aria-expanded',String(!folded));collapse.setAttribute('aria-label',folded?'展开右侧界面':'收起右侧界面');right.forEach(el=>el.inert=folded);const chat=shell.querySelector('.town-chat');if(chat)chat.inert=folded;store.set('foamlab.town.side-collapsed',folded);};collapse.onclick=()=>{folded=!folded;fold();};fold();
const head=ui.tasks.querySelector('.town-quest-head');let open=store.get('foamlab.town.tasks-open',innerWidth>=700);const setOpen=v=>{open=v;ui.tasks.classList.toggle('is-collapsed',!v);head.setAttribute('aria-expanded',String(v));store.set('foamlab.town.tasks-open',v);};setOpen(open);head.onclick=()=>setOpen(!open);
  ui.tasks.querySelector('[data-play=help]').onclick=help;drawTasks();
  for(const npc of (g.config.scene?[]:NPCS))g.addNPC({...npc,talk:m=>talk(npc,m)});
  let list=[],spawnDay=null;
  const syncShoots=()=>{if(g.config.scene||g.config.guest||game!==g)return;if(spawnDay!==day.date){for(const el of g.world.querySelectorAll('[data-shoot-id]'))el.remove();list=shoots(g);spawnDay=day.date;}for(const s of list)if(day.shoots.includes(s.id)||day.shoots.length>=8)s.el?.remove();};
  g.shootField={sync:syncShoots};const stored=window.FoamTownProgress?.get();if(stored){day=stored.day;syncShoots();}
  g.extras.push({update(){for(const s of list){if(!s.el||!s.el.isConnected||s.taken)continue;if(Math.hypot(s.x-g.me.x,s.y-g.me.y)<34){s.taken=true;s.el.classList.add('is-picked');const collectedDay=spawnDay;bump('shoots',s.id).then(ok=>{if(ok)float(s.x,s.y-50,'+1 竹笋');else if(game===g&&spawnDay===collectedDay){s.taken=false;s.el.classList.remove('is-picked');if(!day.shoots.includes(s.id)&&day.shoots.length<8&&s.el.parentNode===null)g.world.append(s.el);}});}}},minimap:()=>list.filter(s=>s.el?.isConnected&&!s.taken).map(s=>`<circle cx="${Math.round(s.x)}" cy="${Math.round(s.y)}" r="20" fill="#9fd46a" stroke="#3e6b2c" stroke-width="8"/>`).join('')});
  if(!g.config.scene&&!g.config.guest)g.extras.push(fishing(g));
  g.extras.push({minimap:()=>{const B=window.FoamTownBuildings;if(!B)return'';const s=B.runState();if(s.done||s.empty)return'';const i=g.config.buildings.findIndex(b=>b[0]===B.RUN[s.step]?.at),d=i>=0?g.door(i):null;return d?`<circle cx="${Math.round(d.x)}" cy="${Math.round(d.y-110)}" r="90" fill="none" stroke="#e2563f" stroke-width="18" stroke-dasharray="40 26"/>`:'';}});
  if(!g.config.scene)g.extras.push(ambient(g));dust(g);
  // Daily learning visits accept these server-supported destinations only.
  const visitKinds=new Set(['school','workshop','hospital','library','gallery','notice','spot','institute','house']);
  g.listen('visit',i=>{const b=g.config.buildings[i],kind=b?.[3]?'house':b?.[0];if(visitKinds.has(kind))bump('visits',kind);});
  g.listen('greet',d=>{if(!d.npc)bump('greet');});
  g.listen('help',help);g.listen('escape',closeOverlay);
  g.listen('speed',value=>toast('移动速度：'+value+' 倍'));
  g.listen('hint',text=>toast(text));
  g.listen('destroy',()=>{closeOverlay();ui.toasts?.remove();ui.tasks?.remove();collapse.remove();game=null;});
  if(!store.get('foamlab.town.help-seen',false)){store.set('foamlab.town.help-seen',true);setTimeout(()=>toast('按 H 查看操作说明；同时按两个方向键可以斜着走。'),900);}
 }
 window.addEventListener('foamlab:town-game',e=>mount(e.detail));
 window.FoamTownPlay={help,collection,mountCollection,catalog:CARDS,get cards(){return [...cards];},get day(){return day&&{...day};}};
})();
