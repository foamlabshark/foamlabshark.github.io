'use strict';
/* Panda Town play layer: town NPCs, daily bamboo shoots, lakeside fishing for OpenFOAM knowledge cards,
 * a daily task board, ambient life and the controls overlay. Everything here is local to the browser:
 * it never writes to the database and never grants experience. */
(() => {
 const root=document.querySelector('#town-app');if(!root)return;
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const store={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d;}catch{return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}};
 const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
 const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
 const random=seed=>()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 const quiet=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

 /* Knowledge cards caught at the lake. Each one links to the site's own reference page. */
 const CARDS=[
  ['blockmesh','blockMesh','读取 system/blockMeshDict，按“块”生成六面体网格。方腔、管道这类规则几何最常用它。','/commands/blockmesh/'],
  ['checkmesh','checkMesh','检查网格质量：非正交性、偏斜度、长宽比等。输出中带 *** 的条目要优先处理。','/commands/checkmesh/'],
  ['snappy','snappyHexMesh','在背景六面体网格上按 STL 几何切割、贴合表面，并可以添加边界层。','/commands/snappyhexmesh/'],
  ['decompose','decomposePar','按 system/decomposeParDict 把算例切分成 processor* 目录，用于并行计算。','/commands/decomposepar/'],
  ['reconstruct','reconstructPar','把各个 processor* 目录里的结果合并回单个算例，方便后处理。','/commands/reconstructpar/'],
  ['setfields','setFields','按 system/setFieldsDict 给指定区域设置初始场值，两相流的初始液面常用它。','/commands/setfields/'],
  ['icofoam','icoFoam','不可压、层流、瞬态求解器，经典的方腔算例就用它。','/commands/icofoam/'],
  ['simplefoam','simpleFoam','不可压稳态求解器，使用 SIMPLE 算法，常配合湍流模型计算外流和内流。','/commands/simplefoam/'],
  ['pimplefoam','pimpleFoam','不可压瞬态求解器。PIMPLE 结合了 PISO 与 SIMPLE，可以使用较大的时间步。','/commands/pimplefoam/'],
  ['interfoam','interFoam','基于 VOF 方法的两相不可压求解器，溃坝算例 damBreak 用的就是它。','/commands/interfoam/'],
  ['foamtovtk','foamToVTK','把结果转换为 VTK 格式，方便在其他可视化软件中查看。','/commands/foamtovtk/'],
  ['postprocess','postProcess','计算结束后对已保存的时刻运行函数对象，例如 postProcess -func vorticity。','/commands/postprocess/'],
  ['mapfields','mapFields','把一个算例的场映射到另一套网格上，常用来为新计算提供初始值。','/commands/mapfields/'],
  ['toposet','topoSet','按几何条件选出单元、面或点的集合，还可以转换成 cellZone 供其他设置使用。','/commands/toposet/'],
  ['foamdict','foamDictionary','在命令行读取或修改字典条目，适合写脚本批量调整参数。','/commands/foamdictionary/'],
  ['foammonitor','foamMonitor','用 gnuplot 实时画出 postProcessing 中的数据文件，例如残差曲线。','/commands/foammonitor/'],
  ['controldict','controlDict','控制开始与结束时间、时间步长和写出频率，函数对象也在这里加载。','/dictionaries/system-controldict/'],
  ['fvschemes','fvSchemes','规定各项的离散格式：时间项、梯度项、对流项、拉普拉斯项等。','/dictionaries/system-fvschemes/'],
  ['fvsolution','fvSolution','设置线性求解器与容差，以及 SIMPLE、PISO、PIMPLE 的算法参数和松弛因子。','/dictionaries/system-fvsolution/'],
  ['courant','Courant 数','瞬态计算常把最大 Courant 数控制在 1 左右以内；interFoam 用 maxCo 自动调整时间步。','/function-objects/courantno/'],
  ['yplus','y⁺','壁面第一层网格的无量纲距离。壁面函数和低雷诺数处理对它的要求不同。','/function-objects/yplus/'],
  ['forcecoeffs','forceCoeffs','计算阻力、升力和力矩系数，需要给出参考速度、参考长度和参考面积。','/function-objects/forcecoeffs/'],
  ['probes','probes','在指定的点上记录场值随时间的变化，适合观察振荡和收敛。','/function-objects/probes/'],
  ['fieldaverage','fieldAverage','对场做时间平均。开始统计前，最好先跳过初始的过渡阶段。','/function-objects/fieldaverage/'],
  ['q','Q 准则','Q > 0 表示旋转强于应变。画 Q 的正值等值面，可以看到涡结构。','/function-objects/q/'],
  ['wallshear','wallShearStress','计算壁面剪切应力。不可压缩算例的结果已经除以密度。','/function-objects/wallshearstress/'],
  ['kinematic','运动压力','不可压缩求解器中的 p 是压力除以密度，单位是 m²/s²，不是 Pa。','/commands/icofoam/'],
  ['zero','0 目录','存放初始条件和边界条件，每个场一个文件，例如 0/U 和 0/p。','/read/?slug=first-cavity-result'],
  ['parallel','-parallel','并行运行写作 mpirun -np 4 求解器 -parallel。忘了加 -parallel，四个进程会各自算一遍。','/commands/decomposepar/'],
  ['converge','收敛判断','稳态计算不只看残差下降，还要看关心的量（如力系数）是否已经稳定。','/function-objects/forcecoeffs/'],
 ].map(([id,title,text,href])=>({id,title,text,href}));
 const FISH=[['小鲫鱼','🐟',.6],['鲤鱼','🐠',.28],['锦鲤','🎏',.1],['金色锦鲤','🌟',.02]];
 const TASKS=[['shoots','拾取竹笋',5],['visits','参观建筑',3],['fish','钓到知识卡',1],['greet','打个招呼',2]];
 const NPCS=[
  {id:'gardener',name:'园丁阿竹',x:760,y:1040,radius:180,speed:60,tint:'hue-rotate(70deg) saturate(1.3)',prop:'🌱',lines:['早上好！今天的竹笋藏在草丛和路边，走过去就能拾起来。','小地图上的绿色小点就是竹笋，去找找看吧。','竹子要长很久，学 OpenFOAM 也一样，一步一步来。']},
  {id:'fisher',name:'钓鱼老伯',x:2070,y:470,radius:70,speed:45,tint:'hue-rotate(200deg) saturate(.9)',prop:'🎣',lines:['湖里的鱼会叼来知识卡。站到湖边按 E 抛竿，看到“！”就赶快再按一次 E。','金色锦鲤很少见，它叼来的卡片也一样珍贵。','钓鱼和调松弛因子一样，急不得。']},
  {id:'postman',name:'邮差小白',x:1300,y:1010,radius:330,speed:95,tint:'hue-rotate(320deg) saturate(1.4)',prop:'✉️',lines:['走到邻居的小屋门口按 E，就能给他们留言、送竹子。','按住 Shift 可以跑起来，按 R 切换一直奔跑。','同时按 W 和 D，就能往右上方斜着走。屏幕方向盘也有八个方向。','按 1 到 6 可以直接做快捷栏里的动作。']},
 ];
 const SHOOT='<svg viewBox="0 0 34 40" aria-hidden="true"><ellipse cx="17" cy="37" rx="11" ry="3" fill="#2f4a2a" opacity=".25"/><path d="M17 4c5 6 9 15 9 23 0 6-4 9-9 9s-9-3-9-9c0-8 4-17 9-23z" fill="#a8c76a" stroke="#4f6b37" stroke-width="2"/><path d="M17 6c-2 8-3 16-2 29M10 22c4-1 8 0 13 3M9 29c5-1 10 0 16 3" fill="none" stroke="#6f9147" stroke-width="2"/><path d="M17 4c2 3 3 6 3 9" stroke="#e7f2c4" stroke-width="2" fill="none"/></svg>';
 const BUTTERFLY='<svg viewBox="0 0 24 20" aria-hidden="true"><g class="town-wing"><path d="M12 10C8 1 1 2 2 7s6 5 10 3zm0 0c-4 3-8 9-4 9s5-5 4-9z"/></g><g class="town-wing town-wing-r"><path d="M12 10c4-9 11-8 10-3s-6 5-10 3zm0 0c4 3 8 9 4 9s-5-5-4-9z"/></g><path d="M12 6v9" stroke="#4b3b2b" stroke-width="1.6"/></svg>';

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
  panel.querySelector('[data-play=cards] b').textContent=cards.length+'/'+CARDS.length;
  if(done&&!day.done){day.done=true;saveDay();toast('今日小任务全部完成！明天还有新的竹笋和任务。','is-gold');celebrate();}}
 function bump(id,value){if(game?.config.guest)return;if(id==='shoots'||id==='visits'){if(day[id].includes(value))return;day[id].push(value);}else day[id]=(day[id]||0)+1;saveDay();const task=TASKS.find(t=>t[0]===id);if(task&&progress(id)===task[2])toast('完成任务：'+task[1],'is-good');drawTasks();}
 function celebrate(){if(quiet()||!game)return;const me=game.me;for(let i=0;i<18;i++){const el=document.createElement('i');el.className='town-confetti';el.style.left=me.x+'px';el.style.top=me.y-60+'px';el.style.setProperty('--dx',(Math.random()*240-120)+'px');el.style.setProperty('--dy',(-Math.random()*140-40)+'px');el.style.setProperty('--c',['#f2c14e','#e86f5c','#6fb3c9','#8cc06a','#c38fd6'][i%5]);game.world.append(el);setTimeout(()=>el.remove(),1400);}}
 function overlay(kind,html,onClose){closeOverlay();root.dataset.overlay=kind;game?.stopMovement();const box=document.createElement('div');box.className='town-overlay town-overlay-'+kind;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.innerHTML=`<div class="town-overlay-card" tabindex="-1">${html}</div>`;root.append(box);ui.overlay={box,onClose};box.addEventListener('click',e=>{if(e.target===box||e.target.closest('[data-play-close]'))closeOverlay();});box.querySelector('.town-overlay-card').focus({preventScroll:true});}
 function closeOverlay(){if(!ui.overlay)return false;const {box,onClose}=ui.overlay;ui.overlay=null;box.remove();delete root.dataset.overlay;onClose?.();root.querySelector('.town-street-scroll')?.focus({preventScroll:true});return true;}
 window.addEventListener('keydown',e=>{if(!ui.overlay)return;if(['Escape','Enter','Space','KeyE','KeyH'].includes(e.code)||['Escape','e','h',' '].includes((e.key||'').toLowerCase())){if(e.target.closest?.('a'))return;e.preventDefault();e.stopImmediatePropagation();closeOverlay();}},{capture:true});
 function help(){if(ui.overlay?.box.classList.contains('town-overlay-help')){closeOverlay();return;}const k=t=>`<kbd>${t}</kbd>`;
  overlay('help',`<header><h2>小镇操作</h2><button type="button" data-play-close aria-label="关闭">×</button></header><dl class="town-help-grid">
   <dt>${k('W')}${k('A')}${k('S')}${k('D')} 或方向键</dt><dd>上下左右移动</dd>
   <dt>${k('W')}+${k('D')} 等两键同按</dt><dd>斜向移动：右上、左上、右下、左下</dd>
   <dt>小键盘 ${k('7')}${k('9')}${k('1')}${k('3')}</dt><dd>也可以直接斜向移动</dd>
   <dt>按住 ${k('Shift')} / 按 ${k('R')}</dt><dd>奔跑 / 切换一直奔跑</dd>
   <dt>${k('E')} 或 ${k('空格')}</dt><dd>和附近的建筑、邻居、NPC 互动，在湖边钓鱼</dd>
   <dt>${k('1')} – ${k('6')}</dt><dd>快捷栏里的动作和表情</dd>
   <dt>${k('+')} ${k('−')} 或滚轮</dt><dd>缩放画面</dd>
   <dt>点击地面 / 小地图</dt><dd>自动走过去，会绕开房子和树</dd>
   <dt>${k('M')} · ${k('H')}</dt><dd>回到省份地图 · 打开这份说明</dd>
   <dt>屏幕方向盘</dt><dd>按住后滑动手指，可在八个方向之间切换；中间的“跑”切换奔跑</dd></dl>
   <p class="town-note">每天的小任务和钓到的知识卡只保存在这台设备上，不影响等级和经验。</p>`);}
 function collection(){overlay('cards',`<header><h2>知识卡图鉴 <small>${cards.length}/${CARDS.length}</small></h2><button type="button" data-play-close aria-label="关闭">×</button></header><p class="town-note">在湖边钓鱼，鱼会叼来一张 OpenFOAM 知识卡。</p><div class="town-card-grid">${CARDS.map(c=>cards.includes(c.id)?`<a class="town-mini-card" href="${E(c.href)}"><strong>${E(c.title)}</strong><span>${E(c.text)}</span></a>`:'<div class="town-mini-card is-locked"><strong>？？？</strong><span>还没有钓到这张卡。</span></div>').join('')}</div>`);}
 function showCard(card,fish,fresh){overlay('card',`<div class="town-catch"><div class="town-catch-fish" aria-hidden="true">${fish[1]}</div><p>钓到了一条<strong>${fish[0]}</strong>，它叼着一张知识卡${fresh?'（新卡！）':''}</p></div><article class="town-knowledge-card"><small>OPENFOAM 知识卡 · ${cards.length}/${CARDS.length}</small><h2>${E(card.title)}</h2><p>${E(card.text)}</p></article><div class="town-overlay-actions"><a class="town-link" href="${E(card.href)}">去看看详细说明 →</a><button type="button" class="primary" data-play-close>收下 <kbd>E</kbd></button></div>`);}

 /* NPCs ------------------------------------------------------------------------------- */
 function talk(npc,m){m.line=((m.line??-1)+1)%npc.lines.length;speech(m,npc.lines[m.line]);bump('greet');}
 function speech(m,text){m.el.querySelector('.town-speech')?.remove();const b=document.createElement('b');b.className='town-speech';b.textContent=text;m.el.append(b);clearTimeout(m.speechTimer);m.speechTimer=setTimeout(()=>b.remove(),5200);}

 /* Bamboo shoots ------------------------------------------------------------------------ */
 function shoots(g){const province=g.config.province||'plaza',rand=random(hash(today()+province)),list=[],doors=g.positions.map((p,i)=>g.door(i)).filter(Boolean);
  for(let tries=0;tries<600&&list.length<8;tries++){const x=120+rand()*(g.width-240),y=140+rand()*(g.height-260);if(!g.walkable(x,y)||!g.walkable(x,y-14)||doors.some(d=>Math.hypot(d.x-x,d.y-y)<80)||list.some(s=>Math.hypot(s.x-x,s.y-y)<160)||Math.hypot(x-1035,y-954)<120)continue;list.push({id:province+':'+list.length,x,y});}
  for(const s of list){if(day.shoots.includes(s.id))continue;const el=document.createElement('i');el.className='town-shoot';el.innerHTML=SHOOT+'<b aria-hidden="true"></b>';el.style.left=s.x-17+'px';el.style.top=s.y-36+'px';el.style.zIndex=String(Math.floor(s.y));g.world.append(el);s.el=el;}
  return list.filter(s=>s.el);}

 /* Fishing ------------------------------------------------------------------------------ */
 function fishing(g){const lake=g.lake,center={x:lake.x+lake.w/2,y:lake.y+lake.h/2},spots=[];
  const ring=[];for(let y=lake.y+30;y<lake.y+lake.h-20;y+=46)ring.push({x:lake.x-26,y});for(let x=lake.x+20;x<lake.x+lake.w;x+=50)ring.push({x,y:lake.y+lake.h+18});
  for(const p of ring)if(g.walkable(p.x,p.y)&&!spots.some(s=>Math.hypot(s.x-p.x,s.y-p.y)<90))spots.push(p);
  let st=null;
  const end=(message)=>{if(!st)return;st.bobber.remove();st.line.remove();g.avatar()?.classList.remove('is-fishing');st.alert?.remove();g.locked=false;g.lockFace=null;st=null;if(message)toast(message);};
  const start=spot=>{if(st||g.config.guest)return;const dx=center.x-spot.x,dy=center.y-spot.y,d=Math.hypot(dx,dy),tx=spot.x+dx/d*90,ty=spot.y+dy/d*70;g.locked=true;g.path=[];g.me.vx=g.me.vy=0;g.lockFace=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');g.avatar()?.classList.add('is-fishing');
   const bobber=document.createElement('i');bobber.className='town-bobber is-cast';bobber.style.left=tx-8+'px';bobber.style.top=ty-8+'px';g.world.append(bobber);
   const line=document.createElementNS('http://www.w3.org/2000/svg','svg');line.classList.add('town-fishing-line');const minX=Math.min(spot.x,tx)-20,minY=Math.min(spot.y-60,ty)-20,w=Math.abs(tx-spot.x)+40,h=Math.abs(ty-spot.y+60)+40;line.setAttribute('viewBox',`0 0 ${w} ${h}`);line.style.left=minX+'px';line.style.top=minY+'px';line.style.width=w+'px';line.style.height=h+'px';const hx=spot.x+(g.lockFace==='left'?-22:g.lockFace==='right'?22:12)-minX,hy=spot.y-58-minY,bx=tx-minX,by=ty-minY;line.innerHTML=`<path d="M${hx} ${hy}Q${(hx+bx)/2} ${Math.max(hy,by)+26} ${bx} ${by}" fill="none" stroke="#f7f1dc" stroke-width="1.6" opacity=".9"/>`;g.world.append(line);
   st={phase:'cast',t:.6,bobber,line,spot};toast('抛竿……等鱼咬钩时会出现“！”');};
  const use=()=>{if(!st)return;if(st.phase==='bite'){const r=Math.random();let acc=0,fish=FISH[0];for(const f of FISH){acc+=f[2];if(r<=acc){fish=f;break;}}const fresh=CARDS.filter(c=>!cards.includes(c.id)),pool=fresh.length&&Math.random()<.75?fresh:CARDS,card=pool[Math.floor(Math.random()*pool.length)],isNew=!cards.includes(card.id);if(isNew){cards.push(card.id);store.set(cardKey(),cards);}end();bump('fish');drawTasks();showCard(card,fish,isNew);}
   else end('还没咬钩就收竿了，鱼都被吓跑了。');};
  g.listen('use',use);g.listen('cancel',()=>end());g.listen('escape',()=>{if(st){end();return true;}return false;});
  return{spots:()=>st?[]:spots.map((s,i)=>({id:'fish'+i,at:s,x:s.x,y:s.y-104,range:58,label:'在湖边钓鱼',run:()=>start(s)})),
   update(dt){if(!st)return;st.t-=dt;
    if(st.phase==='cast'&&st.t<=0){st.phase='wait';st.t=1.6+Math.random()*2.8;st.bobber.classList.remove('is-cast');}
    else if(st.phase==='wait'&&st.t<=0){st.phase='bite';st.t=1;st.bobber.classList.add('is-bite');const a=document.createElement('b');a.className='town-alert';a.textContent='！';g.avatar()?.append(a);st.alert=a;}
    else if(st.phase==='bite'&&st.t<=0)end('鱼溜走了……下次看到“！”要快一点。');},
   minimap:()=>spots.map(s=>`<circle cx="${Math.round(s.x)}" cy="${Math.round(s.y)}" r="24" fill="#5aa9c9" stroke="#fff" stroke-width="8"/>`).join(''),destroy:()=>end()};}

 /* Ambient life: butterflies by day, fireflies at night, drifting cloud shadows. */
 function ambient(g){if(quiet())return{};const flowers=[...g.world.querySelectorAll('.town-game-flower')].filter((_,i)=>i%9===0).slice(0,7),flies=[];
  for(const [i,f]of flowers.entries()){const el=document.createElement('i');el.className='town-butterfly';el.style.setProperty('--hue',String([0,40,190,280,320,90,210][i%7]));el.innerHTML=BUTTERFLY;g.world.append(el);flies.push({el,cx:parseFloat(f.style.left)+20,cy:parseFloat(f.style.top),a:.5+Math.random()*.6,b:.8+Math.random()*.7,ph:Math.random()*9,rx:50+Math.random()*60,ry:30+Math.random()*30});}
  const rand=random(7);for(let i=0;i<18;i++){const el=document.createElement('i');el.className='town-firefly';el.style.left=(200+rand()*(g.width-400))+'px';el.style.top=(160+rand()*(g.height-320))+'px';el.style.animationDelay=(-rand()*6)+'s';el.style.animationDuration=(4+rand()*4)+'s';g.lights.append(el);}
  for(let i=0;i<2;i++){const el=document.createElement('i');el.className='town-cloud-shadow';el.style.top=(300+i*700)+'px';el.style.animationDelay=(-i*45)+'s';g.world.append(el);}
  let t=0;return{update(dt){t+=dt;for(const f of flies){const x=f.cx+Math.sin(t*f.a+f.ph)*f.rx,y=f.cy-30+Math.sin(t*f.b+f.ph*1.7)*f.ry;f.el.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scaleX(${Math.cos(t*f.a+f.ph)>0?1:-1})`;}}};}

 /* Footstep dust, a little stronger when running. */
 function dust(g){const pool=[];for(let i=0;i<10;i++){const el=document.createElement('i');el.className='town-dust';g.world.append(el);pool.push(el);}let n=0;
  g.listen('step',({x,y,speed})=>{if(quiet())return;if(speed<120&&n++%2)return;const el=pool[n++%pool.length];el.style.left=(x-9+(Math.random()*8-4))+'px';el.style.top=(y-6)+'px';el.style.zIndex=String(Math.floor(y)-1);el.classList.toggle('is-strong',speed>200);el.classList.remove('is-on');void el.offsetWidth;el.classList.add('is-on');});}

 /* Local feedback for actions and emotes: play them on your own panda at once. */
 const net=window.FoamTownNet;if(net&&!net.__play){net.__play=true;const send=net.action;net.action=async payload=>{const result=await send(payload);const me=document.querySelector('.town-resident.is-me');
  if(me&&payload?.type==='act')window.foamPandaMotion?.play(me,payload.action);
  if(me&&payload?.type==='emote'){const icons={smile:'😊',heart:'♥',thumb:'👍',question:'?',exclaim:'!',idea:'💡',bamboo:'🎋',zzz:'Zzz',starry:'✨',sweat:'💧',confetti:'🎉',fire:'🔥'};me.querySelector('.town-emote')?.remove();const em=document.createElement('b');em.className='town-emote';em.textContent=icons[payload.action]||'✦';me.append(em);setTimeout(()=>em.remove(),3000);}
  if(payload?.type==='duo-invite')bump('greet');return result;};}

 function mount(g){game=g;uid=g.config.userId||'guest';loadDay();const shell=g.viewport.closest('.town-game-shell')||g.viewport.parentElement;
  ui.toasts=document.createElement('div');ui.toasts.className='town-play-toasts';ui.toasts.setAttribute('aria-live','polite');shell.append(ui.toasts);
  ui.tasks=document.createElement('section');ui.tasks.className='town-quests';ui.tasks.setAttribute('aria-label','今日小任务');
  ui.tasks.innerHTML=`<button type="button" class="town-quest-head" aria-expanded="true"><b>今日小任务</b><span class="town-quest-count"></span></button><ol class="town-quest-list"></ol><div class="town-quest-foot"><button type="button" data-play="cards">知识卡 <b></b></button><button type="button" data-play="help">操作说明</button></div>${g.config.guest?'<p class="town-note">登录并入住后，就能拾竹笋、钓鱼和完成任务。</p>':''}`;
  shell.append(ui.tasks);const head=ui.tasks.querySelector('.town-quest-head');let open=store.get('foamlab.town.tasks-open',innerWidth>=700);const setOpen=v=>{open=v;ui.tasks.classList.toggle('is-collapsed',!v);head.setAttribute('aria-expanded',String(v));store.set('foamlab.town.tasks-open',v);};setOpen(open);head.onclick=()=>setOpen(!open);
  ui.tasks.querySelector('[data-play=cards]').onclick=collection;ui.tasks.querySelector('[data-play=help]').onclick=help;drawTasks();
  for(const npc of NPCS)g.addNPC({...npc,talk:m=>talk(npc,m)});
  const list=g.config.guest?[]:shoots(g);
  g.extras.push({update(){for(const s of list){if(!s.el||s.taken)continue;if(Math.hypot(s.x-g.me.x,s.y-g.me.y)<34){s.taken=true;s.el.classList.add('is-picked');setTimeout(()=>s.el?.remove(),600);float(s.x,s.y-50,'+1 竹笋');bump('shoots',s.id);}}},minimap:()=>list.filter(s=>!s.taken).map(s=>`<circle cx="${Math.round(s.x)}" cy="${Math.round(s.y)}" r="20" fill="#9fd46a" stroke="#3e6b2c" stroke-width="8"/>`).join('')});
  if(!g.config.guest)g.extras.push(fishing(g));
  g.extras.push(ambient(g));dust(g);
  g.listen('visit',i=>{const b=g.config.buildings[i];if(b&&b[0]!=='gate')bump('visits',b[3]?'house':b[0]);});
  g.listen('greet',d=>{if(!d.npc)bump('greet');});
  g.listen('help',help);g.listen('escape',closeOverlay);
  g.listen('run',on=>toast(on?'奔跑：开':'奔跑：关'));
  g.listen('destroy',()=>{closeOverlay();ui.toasts?.remove();ui.tasks?.remove();game=null;});
  if(!store.get('foamlab.town.help-seen',false)){store.set('foamlab.town.help-seen',true);setTimeout(()=>toast('按 H 查看操作说明；同时按两个方向键可以斜着走。'),900);}
 }
 window.addEventListener('foamlab:town-game',e=>mount(e.detail));
 window.FoamTownPlay={help,collection,get cards(){return [...cards];},get day(){return day&&{...day};}};
})();
