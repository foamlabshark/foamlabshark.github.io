/* panda-motion.js */
/* Shared animation conductor. Audio starts only after the sound switch is used. */
'use strict';
(() => {
 const durations={wave:2400,sleep:5400,jump:2500,roll:3300,dance:4200,crawl:4800,sing:5200,sway:4000,spin:3200,stretch:3300,munch:3700,cheer:2900,read:5000,water:4400,fish:5600,meditate:6000,experiment:4800,typing:4200,kite:5200,bubbles:5500,photo:3000,taichi:6000,streamline:5000,firework:4400,walk:1600,highfive:3200,hug:3300,selfie:3500,duet:6000};
 const running=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let context=null,activeVoices=[],audioTimer,sound=false,audioGeneration=0;
 try{sound=localStorage.getItem('foamlab-panda-sound')==='true';}catch{}
 function silence(){audioGeneration++;clearTimeout(audioTimer);for(const node of activeVoices){try{node.stop();}catch{}}activeVoices=[];}
 async function unlock(){try{context ||= new (window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')await context.resume();return context.state==='running';}catch{return false;}}
 async function sing(){silence();if(!sound||document.hidden)return;const generation=audioGeneration;if(!await unlock()||generation!==audioGeneration||!sound)return;
  // Original short melody, with a quiet vowel-like harmonic voice and vibrato.
  const notes=[60,64,67,69,67,64,62,65,64,62,60],lengths=[.32,.32,.40,.40,.32,.40,.32,.40,.32,.32,.64];let at=context.currentTime+.03;
  notes.forEach((note,i)=>{const duration=lengths[i],hz=440*Math.pow(2,(note-69)/12),voice=context.createOscillator(),gain=context.createGain(),filter=context.createBiquadFilter(),vibrato=context.createOscillator(),depth=context.createGain();voice.type='triangle';voice.frequency.value=hz;filter.type='lowpass';filter.frequency.value=1150;filter.Q.value=.8;vibrato.frequency.value=5.2;depth.gain.value=hz*.012;vibrato.connect(depth).connect(voice.frequency);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.045,at+.035);gain.gain.setValueAtTime(.035,at+duration*.65);gain.gain.exponentialRampToValueAtTime(.001,at+duration);voice.connect(filter).connect(gain).connect(context.destination);voice.start(at);vibrato.start(at);voice.stop(at+duration+.02);vibrato.stop(at+duration+.02);activeVoices.push(voice,vibrato);voice.onended=()=>{voice.disconnect();filter.disconnect();gain.disconnect();vibrato.disconnect();depth.disconnect();activeVoices=activeVoices.filter(x=>x!==voice&&x!==vibrato);};at+=duration;});
  audioTimer=setTimeout(silence,5200);
 }
 function stop(el){const run=running.get(el);if(run){clearTimeout(run.timer);if(run.sound)silence();running.delete(el);}delete el.dataset.action;delete el.dataset.actionStarted;}
 function play(el,action='wave',options={}){if(!el||!durations[action])return 0;stop(el);if(reduced.matches||el.dataset.quiet==='true')return 0;void el.offsetWidth;el.dataset.action=action;el.dataset.actionStarted=String(performance.now());const run={sound:action==='sing'&&options.sound===true,timer:null};running.set(el,run);if(run.sound)void sing();run.timer=setTimeout(()=>{stop(el);options.onFinish?.();},durations[action]);return durations[action];}
 function stopAll(){for(const el of running.keys())stop(el);silence();}
 async function setSound(enabled){sound=!!enabled;try{localStorage.setItem('foamlab-panda-sound',String(sound));}catch{}if(sound){const ok=await unlock();if(!ok){sound=false;try{localStorage.setItem('foamlab-panda-sound','false');}catch{}}}else silence();window.dispatchEvent(new CustomEvent('foamlab:panda-sound',{detail:{enabled:sound}}));return sound;}
 window.foamPandaMotion={play,stop,stopAll,durations,setSound,get sound(){return sound;}};
 reduced.addEventListener('change',()=>{if(reduced.matches)stopAll();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});window.addEventListener('pagehide',stopAll);
})();

;
/* panda-particles.js */
/* Small, bounded bursts. Nothing is emitted while selecting text or dragging. */
'use strict';
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),forced=matchMedia('(forced-colors: active)');
 let enabled=true,start=null,layer=null,last=0;try{enabled=localStorage.getItem('foamlab-panda-particles')!=='false';}catch{}
 const marks=['leaf','dot','ring','star'];
 function clear(){layer?.replaceChildren();}
 function burst(x,y,pet=false){if(!enabled||reduced.matches||forced.matches||document.hidden)return;if(!layer){layer=document.createElement('div');layer.className='panda-particles';layer.setAttribute('aria-hidden','true');document.body.append(layer);}while(layer.childElementCount>42)layer.firstChild.remove();
  const count=pet?12:8;for(let i=0;i<count;i++){const p=document.createElement('i'),angle=Math.PI*2*i/count+(Math.random()-.5)*.6,radius=22+Math.random()*(pet?53:34);p.className='panda-particle '+marks[i%marks.length];p.style.cssText=`left:${x}px;top:${y}px;--px:${Math.cos(angle)*radius}px;--py:${Math.sin(angle)*radius-13}px;--pr:${(Math.random()-.5)*240}deg;--life:${520+Math.random()*280}ms;--size:${4+Math.random()*4}px;--delay:${i*7}ms;`;layer.append(p);setTimeout(()=>p.remove(),1000);}
 }
 document.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY,id:e.pointerId};},{passive:true});
 document.addEventListener('pointercancel',()=>start=null,{passive:true});
 document.addEventListener('click',e=>{const origin=start;start=null;if(!e.isTrusted||e.detail===0||e.button!==0||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey)return;const target=e.target instanceof Element?e.target:null;if(!target||target.closest('input,textarea,select,[contenteditable],:disabled,[aria-disabled=true]'))return;if(origin&&Math.hypot(e.clientX-origin.x,e.clientY-origin.y)>8)return;if(window.getSelection()?.toString())return;if(Date.now()-last<100)return;last=Date.now();burst(e.clientX,e.clientY,!!target.closest('.panda-grab,.panda-home-portrait'));},{passive:true});
 window.foamPandaParticles={burst,get enabled(){return enabled;},set(enabledNext){enabled=!!enabledNext;try{localStorage.setItem('foamlab-panda-particles',String(enabled));}catch{}if(!enabled)clear();}};
 reduced.addEventListener('change',clear);forced.addEventListener('change',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
})();

;
/* panda-pet.js */
'use strict';
(() => {
 const $=(s,r=document)=>r.querySelector(s), art=window.foamPandaArt;
 if(!art)return;
 document.querySelectorAll('[data-panda-portrait]').forEach(el=>{el.innerHTML=art();el.dataset.outfit='scarf';el.dataset.form='cub';});
 const tips=[
 ['foamVersion 可以查看当前终端加载的 OpenFOAM 版本。','foamVersion'],
 ['生成网格后运行 checkMesh，可以查看网格的几何与拓扑质量。','checkMesh'],
 ['controlDict 中的 endTime 设置计算的终止时间。','controlDict'],
 ['writeControl 为 timeStep 时，writeInterval 表示每隔多少个时间步输出一次。','writeInterval'],
 ['想查看字典中的某个值，可以用 foamDictionary 配合 -entry 和 -value。','foamDictionary'],
 ['blockMesh 的顶点坐标与 scale 一起决定网格的实际尺寸。','blockMesh'],
 ['fvSchemes 选择离散格式，fvSolution 设置线性求解器与压力速度耦合。','fvSchemes'],
 ['在算例目录运行 paraFoam，可以用 ParaView 打开计算结果。','paraFoam'],
 ['zeroGradient 表示边界法向梯度为零，常用于充分发展出口的速度。','zeroGradient'],
 ['二维算例的前后面通常设为 empty，厚度方向只划分一层单元。','empty'],
 ['decomposePar 读取 decomposeParDict，把网格和场划分到多个进程。','decomposePar'],
 ['Courant 数越大，流体在一个时间步内跨过的网格单元就越多；显式格式通常要求它小于 1。','Courant'],
 ['fvm:: 把项写进待求场的矩阵（隐式），fvc:: 用已知值直接算出结果（显式）。','fvm'],
 ['编译自己的动态库时，可以在源码目录运行 wmake libso。','wmake'],
 ['场文件里的 dimensions 用七个指数记录质量、长度、时间等基本量纲，例如速度是 [0 1 -1 0 0 0 0]。','dimensions'],
 ['日志里的 residual 是线性方程的残差。它降下来不代表结果准确，离散误差要靠网格加密对比来判断。','网格无关性'],
 ['先用 surfaceCheck 检查 STL，可以发现开口、非流形边等几何问题。','surfaceCheck'],
 ['snappyHexMesh 的三个主要阶段是网格切割、贴合表面和边界层生成。','snappyHexMesh'],
 ['foamListTimes 可以列出算例的时间目录，-latestTime 用于选择最新时间。','foamListTimes'],
 ['functions 子字典可以配置采样、力和监测点，让求解过程同时输出所需数据。','functionObject'],
 ['设置 fixedValue 时，value 条目给出这个边界上的场值。','fixedValue'],
 ['SIMPLE 常用于稳态计算，PISO 和 PIMPLE 常用于瞬态计算。','SIMPLE'],
 ['adjustTimeStep 配合 maxCo，可以按 Courant 数调整瞬态计算的时间步。','adjustTimeStep'],
 ['postProcess -list 可以列出可用的后处理函数配置。','postProcess'],
 ['寻找安装自带的算例时，可以先查看环境变量 FOAM_TUTORIALS 指向的目录。','FOAM_TUTORIALS'],
 ['用 probes 记录几个固定点的场值，可以直接看到结果随时间怎样变化。','probes'],
 ['网格局部加密后，通常还需要重新检查 Courant 数和时间步长。','Courant'],
 ['wmake 默认把自己编译的求解器放进 $FOAM_USER_APPBIN，加载环境后就能直接运行。','FOAM_USER_APPBIN']
 ];
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
 const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
 const kinds={level_curve:'升级曲线调整',province_case:'省份关卡通关',province_visit:'到访省份景点',checkin:'每日签到',course:'完成课程',topic:'发布讨论',reply:'回复讨论',comment:'文章评论',article:'文章发表',accepted:'回答被采纳',bamboo:'收到竹子',spot:'首次到访景点',festival:'节日收藏',town_visit:'小镇到访',town_home:'选择住处'};
 const choreography=window.foamPandaMotion;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let collectionOpen=read('foamlab-main-collection-open',true);
 let tab="outfit",userId=null,revision=0,state=null,busy=false,refreshTimer,lastFetch=0,lastTap=0,lastTapPoint=null;
 let tipIndex=read('foamlab-panda-tip',Math.floor(Math.random()*tips.length)),clickTimer,bubbleTimer,travelFrame=0,drag=null,suppressClick=false,openOnClick=false;
 const pet=document.createElement('aside');pet.id='panda-pet';pet.className='panda-pet';pet.hidden=true;pet.setAttribute('aria-label','熊猫学习伙伴');
 pet.innerHTML=`<div class="panda-bubble" hidden role="status"><button class="panda-bubble-close" aria-label="关闭熊猫提示" type="button">×</button><strong>熊猫说</strong><p></p><button type="button" class="panda-tip-search">查找相关内容 →</button></div><button type="button" class="panda-grab" aria-label="熊猫：单击听小技巧，双击搜索；方向键移动" title="单击：小技巧 · 双击：搜索 · 拖动：移动">${art(false,'熊猫学习伙伴')}</button><a class="panda-nameplate" href="/account/#my-panda"><span></span><b></b></a><div class="panda-tools"><button type="button" data-pet-menu aria-label="熊猫动作" title="选个动作" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg></button><button type="button" data-pet-search aria-label="站内搜索" title="搜索站内内容"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button><button type="button" data-pet-checkin aria-label="每日签到" title="每日签到"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg></button><button type="button" data-pet-hide aria-label="收起熊猫" title="收起熊猫"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/></svg></button></div>`;
 document.body.append(pet);
 const menu=document.createElement('div');menu.className='panda-play-menu';menu.hidden=true;menu.id='panda-play-menu';menu.setAttribute('aria-label','熊猫动作');pet.append(menu);$('[data-pet-menu]',pet).setAttribute('aria-controls',menu.id);
 const dock=document.createElement('button');dock.type='button';dock.className='panda-dock';dock.hidden=true;dock.setAttribute('aria-label','显示熊猫学习伙伴');dock.title='显示熊猫';dock.innerHTML=art(true);document.body.append(dock);
 const panel=$('#my-panda');
 if(panel)panel.innerHTML='<div class="panda-account-loading">正在读取熊猫信息…</div>';
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function clearInteraction(){clearTimeout(clickTimer);clearTimeout(bubbleTimer);stopTravel();choreography?.stopAll();closeMenu();lastTap=0;lastTapPoint=null;openOnClick=false;drag=null;pet.classList.remove('is-dragging');$('.panda-bubble',pet).hidden=true;delete pet.dataset.action;}
 function reset(){revision++;userId=null;state=null;busy=false;lastFetch=0;clearInteraction();pet.hidden=true;dock.hidden=true;if(panel)panel.innerHTML='<h2>我的熊猫</h2><p class="muted">使用 GitHub 登录后，熊猫就会来陪你学习。</p>';}
 function clampPosition(x,y){const w=pet.offsetWidth||126,h=pet.offsetHeight||185;return {x:Math.max(18,Math.min(innerWidth-w-18,x)),y:Math.max(34,Math.min(innerHeight-h-12,y))};}
 function move(x,y,persist=false){const p=clampPosition(x,y);pet.style.left=p.x+'px';pet.style.top=p.y+'px';if(persist&&userId)save('foamlab-panda-position:'+userId,p);positionBubble();}
 function positionPopup(b){const r=pet.getBoundingClientRect(),width=Math.min(292,innerWidth-24);b.style.width=width+'px';b.style.maxHeight=Math.max(100,innerHeight-24)+'px';b.style.left=Math.max(12-r.left,Math.min(0,innerWidth-r.left-width-12))+'px';const height=b.offsetHeight,above=r.top>=height+12,ideal=above?-height-12:r.height+12;b.style.bottom='auto';b.style.top=Math.max(12-r.top,Math.min(ideal,innerHeight-r.top-height-12))+'px';b.classList.toggle('below',!above);}
 function positionBubble(){positionPopup($('.panda-bubble',pet));if(!menu.hidden)positionPopup(menu);}
 function stopTravel(){cancelAnimationFrame(travelFrame);travelFrame=0;}
 function animate(action='wave',sound=false,travel=false){stopTravel();const duration=choreography?.play(pet,action,{sound});if(!duration||!travel||action!=='crawl'||pet.hidden)return;const left=pet.offsetLeft,top=pet.offsetTop,direction=left>innerWidth/2?-1:1,distance=Math.min(76,innerWidth*.16);pet.dataset.facing=direction>0?'right':'left';let start;
  const step=t=>{if(pet.hidden||document.hidden||drag||motion.matches||!state?.pet.motion||pet.dataset.action!=='crawl')return;start??=t;const f=Math.min(1,(t-start)/duration);move(left+direction*distance*(f*f*(3-2*f)),top);if(f<1)travelFrame=requestAnimationFrame(step);else travelFrame=0;};travelFrame=requestAnimationFrame(step);
 }
 function preview(action,sound=false){const visual=panel?.querySelector('.panda-profile-visual');if(visual)choreography?.play(visual,action);animate(action,sound,true);}
 function closeMenu(){menu.hidden=true;$('[data-pet-menu]',pet).setAttribute('aria-expanded','false');}
 function renderMenu(){if(!state)return;menu.innerHTML='<strong>让'+escape(state.pet.name)+'动一动</strong><div class="panda-menu-grid">'+state.items.filter(i=>i.category==='action').map(i=>`<button type="button" data-pet-action="${i.id}" ${i.unlocked?'':'disabled'}>${i.unlocked?escape(i.title):'未解锁 · Lv.'+i.required_level+' 解锁'}</button>`).join('')+`</div><label class="panda-menu-sound"><input type="checkbox" data-panda-sound ${choreography?.sound?'checked':''}> 唱歌时播放声音</label>`;}

 function showMenu(){const opening=menu.hidden;closeMenu();if(!opening)return;stopTravel();$('.panda-bubble',pet).hidden=true;renderMenu();menu.hidden=false;$('[data-pet-menu]',pet).setAttribute('aria-expanded','true');positionPopup(menu);}
 document.querySelectorAll('[data-panda-portrait]').forEach(el=>{let n=0;el.addEventListener('click',()=>{const actions=['wave','dance','roll','sing','crawl','stretch'];choreography?.play(el,actions[n++%actions.length]);});});
 function say(message,query=null){if(!state||pet.hidden)return;closeMenu();stopTravel();const b=$('.panda-bubble',pet);$('p',b).textContent=message;const link=$('.panda-tip-search',b);link.hidden=!query;link.dataset.query=query||'';b.hidden=false;positionBubble();clearTimeout(bubbleTimer);bubbleTimer=setTimeout(()=>b.hidden=true,11000);}
 function tip(){tipIndex=(tipIndex+1)%tips.length;save('foamlab-panda-tip',tipIndex);say(...tips[tipIndex]);animate();}
 function search(query=''){closeMenu();stopTravel();choreography?.stop(pet);clearTimeout(clickTimer);$('.panda-bubble',pet).hidden=true;window.foamOpenSearch?.(query);}
 function reward(previous){if(!state)return;const gained=state.pet.xp-(previous?.pet.xp??state.pet.xp);if(gained<=0)return;const levelUp=previous&&state.level>previous.level;say(levelUp?`升到 Lv.${state.level} 了！继续记录你的学习进展。`:`获得 ${gained} 点经验。`);animate(levelUp?'jump':'wave');}
 function render(){if(!state||!userId)return;const p=state.pet;if(window.foamAuth?.user?.id===userId){window.foamAuth.pet={user_id:userId,name:p.name,xp:p.xp,level:state.level,level_start:state.level_start,next_level_xp:state.next_level_xp};window.foamAuth.petError=false;dispatchEvent(new Event('foam-pet-change'));}pet.hidden=!p.visible;dock.hidden=p.visible;pet.dataset.ride=p.ride||'walk';pet.dataset.form=p.form;pet.dataset.outfit=p.outfit;pet.dataset.decoration=p.decoration||'no-decor';pet.dataset.quiet=String(!p.motion||motion.matches);$('.panda-nameplate span',pet).textContent=p.name;$('.panda-nameplate b',pet).textContent='Lv.'+state.level;const check=$('[data-pet-checkin]',pet);check.disabled=state.checked_in;check.title=state.checked_in?'今日已签到':'每日签到 +10';check.setAttribute('aria-label',check.title);dock.dataset.outfit=p.outfit;dock.dataset.quiet='true';if(!p.visible||!p.motion||motion.matches){stopTravel();choreography?.stopAll();closeMenu();}renderPanel();}
 function nextReward(){const next=state.items.filter(i=>!i.requirement&&!i.festival&&i.required_level>state.level).sort((a,b)=>a.required_level-b.required_level);if(!next.length)return '<div class="panda-next-reward"><strong>等级收藏已解锁</strong><span>还可以通过课程学习、答疑和创作收集学习勋章。</span></div>';const level=next[0].required_level,names=next.filter(i=>i.required_level===level).map(i=>i.title);return `<div class="panda-next-reward"><strong>Lv.${level} 解锁 ${names.length} 项新收藏</strong><span>还差 ${(state.level_factor||30)*level*(level-1)-state.pet.xp} 点经验</span></div>`;}
 function growthRoute(){const open=$('.panda-evolution',panel)?.open??true;return `<details class="panda-evolution"${open?' open':''}><summary>成长路线 <small>按等级解锁不同身份</small></summary><ol class="panda-growth-stages">${state.items.filter(i=>i.category==='form').sort((a,b)=>a.required_level-b.required_level).map(i=>`<li class="${i.unlocked?'':'locked'}" aria-current="${state.pet.form===i.id}"><span class="panda-item-preview" data-form="${i.unlocked?i.id:'cub'}" data-outfit="none" data-quiet="true">${art()}</span><strong>${i.unlocked?escape(i.title):'未解锁形象'}</strong><small>Lv.${i.required_level} · ${(state.level_factor||30)*i.required_level*(i.required_level-1)} 经验</small><small>${i.unlocked?escape(i.description):'达到等级后揭晓'}</small><button type="button" data-panda-item="${i.id}" ${!i.unlocked||busy?'disabled':''}>${state.pet.form===i.id?'当前形态':i.unlocked?'切换形态':'升级解锁'}</button></li>`).join('')}</ol></details>`;}
 function renderPanel(){if(!panel||!state)return;const p=state.pet,level=state.level,range=state.next_level_xp-state.level_start,percent=Math.min(100,(p.xp-state.level_start)/range*100),items=state.items.filter(i=>i.category===tab);const current=panel.querySelector(':focus')?.id;
 panel.innerHTML=`<div class="panda-account-head"><div><span class="section-kicker">PANDA COMPANION</span><h2>我的熊猫</h2></div><span class="panda-level-tag">Lv.${level}</span></div><div class="panda-account-grid"><div class="panda-profile-visual" data-form="${p.form}" data-outfit="${p.outfit}" data-ride="${p.ride||'walk'}" data-decoration="${p.decoration||'no-decor'}" data-quiet="${!p.motion||motion.matches}">${art()}<strong>${escape(p.name)}</strong><span>${escape(state.items.find(i=>i.id===p.title)?.title||state.items.find(i=>i.id===p.form)?.title||'团子熊猫')}</span></div><div class="panda-growth"><div class="panda-xp-label"><strong>成长经验</strong><span>${p.xp} / ${state.next_level_xp}</span></div><div class="panda-xp-track" role="progressbar" aria-label="本级经验" aria-valuemin="${state.level_start}" aria-valuemax="${state.next_level_xp}" aria-valuenow="${p.xp}"><span style="width:${percent}%"></span></div><p class="muted">距离 Lv.${level+1} 还需 ${state.next_level_xp-p.xp} 点经验</p><p class="muted">与熊猫小镇共享等级和经验；两边的收藏与装扮各自保存。</p>${nextReward()}<div class="panda-account-actions"><button class="button" type="button" id="panda-checkin" ${state.checked_in||busy?'disabled':''}>${state.checked_in?'今日已签到 ✓':'签到 +10 经验'}</button><button class="button secondary" type="button" id="panda-play">播放当前动作</button><button class="button secondary" type="button" id="panda-switch-form">切换形象</button></div><p class="panda-instructions">单击熊猫听一条小技巧，双击打开搜索，按住可以拖到别处。鼠标移到熊猫身上，会出现动作、搜索、签到和收起按钮。</p><form id="panda-settings"><label>熊猫名字<input name="name" value="${escape(p.name)}" maxlength="20" required></label><button class="button secondary" type="submit" ${busy?'disabled':''}>保存</button><label class="panda-check"><input type="checkbox" name="visible" ${p.visible?'checked':''}> 显示熊猫</label><label class="panda-check"><input type="checkbox" name="motion" ${p.motion?'checked':''}> 播放动画</label></form><div class="panda-local-options"><label><input type="checkbox" data-panda-sound ${choreography?.sound?'checked':''}> 唱歌声音</label><label><input type="checkbox" data-panda-particles ${window.foamPandaParticles?.enabled?'checked':''}> 点击粒子</label><span class="muted">仅在此设备生效</span></div><p class="panda-form-status" role="status"></p></div></div>${growthRoute()}<div class="panda-collection-head"><h3>我的收藏 <small>${state.items.filter(i=>i.unlocked).length} / ${state.items.length}</small></h3><div class="panda-collection-controls"><div class="panda-tabs" id="panda-collection-tabs" aria-label="收藏分类" ${collectionOpen?'':'hidden'}>${[['outfit','服饰'],['action','动作'],['form','形态'],['decoration','装饰'],['ride','出行'],['badge','学习勋章'],['title','称号']].map(([id,label])=>`<button type="button" data-panda-tab="${id}" id="panda-tab-${id}" aria-pressed="${tab===id}">${label}</button>`).join('')}</div><button type="button" class="panda-collection-toggle" id="panda-collection-toggle" aria-controls="panda-collection-items panda-collection-tabs" aria-expanded="${collectionOpen}">${collectionOpen?'收起':'展开'}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></button></div></div><div class="panda-collection" id="panda-collection-items" ${collectionOpen?'':'hidden'}>${items.map(i=>{if(!i.unlocked)return `<div class="panda-item locked"><span class="panda-item-preview" data-form="cub" data-outfit="none" data-quiet="true">${art()}</span><strong>未解锁</strong><small>${i.requirement?'完成学习成就后解锁':'Lv.'+i.required_level+' 解锁'}</small></div>`;const equipped=p[i.category]===i.id;return `<button type="button" class="panda-item ${i.unlocked?'':'locked'}" data-panda-item="${i.id}" id="panda-item-${i.id}" aria-pressed="${equipped}" ${!i.unlocked||busy||i.category==='badge'?'disabled':''}><span class="panda-item-preview" data-form="${i.category==='form'?i.id:p.form}" data-outfit="${i.category==='outfit'?i.id:p.outfit}" data-ride="${i.category==='ride'?i.id:p.ride||'walk'}" data-decoration="${i.category==='decoration'?i.id:p.decoration||'no-decor'}" ${i.category==='action'?`data-preview-action="${i.id}"`:''} data-quiet="true">${art()}</span><strong>${escape(i.title)}</strong><span>${escape(i.description)}</span>${window.FoamCollectionTime?.(i.obtained_at)||''}<small>${equipped?'使用中 ✓':i.unlocked?i.category==='badge'?'已获得':i.category==='title'?'点击佩戴':'已解锁 · 点击使用':i.requirement?'完成成就解锁':i.festival?'节日期间领取':'Lv.'+i.required_level+' 解锁'}</small></button>`;}).join('')}</div><details class="panda-rules"><summary>如何获得经验</summary><div class="panda-rules-grid"><ul><li>回答被采纳：20 经验，每日最多 3 次</li><li>收到竹子：2 经验，每日最多 5 次</li><li>首次到访每类景点：5 经验，共 6 类</li><li>每日签到：10 经验</li><li>首次完成一节课程：25 经验</li><li>发布讨论：15 经验，每日最多 3 次</li><li>回复他人讨论：5 经验，每日最多 6 次</li><li>评论文章：3 经验，每日最多 5 次</li><li>文章或日志通过审核发表：30 经验，每日最多 1 次</li></ul><p>每日次数在北京时间 00:00 更新。回复和评论满 10 个非空白字符计入经验；同日重复内容、自我回复与自我评论不计。课程完成记录会自动补入，重复标记只计一次。已删除或被隐藏的社区内容会扣回对应经验。</p></div></details><details class="panda-history"><summary>最近获得的经验</summary><ul>${state.events.length?state.events.map(e=>`<li><span>${escape(kinds[e.kind]||'学习活动')}</span><time>${escape(new Date(e.created_at).toLocaleDateString('zh-CN'))}</time><b>${e.points? '+'+e.points:['town_visit','town_home','festival'].includes(e.kind)?'已记录':'已撤回'}</b></li>`).join(''):'<li>从今天的签到开始。</li>'}</ul></details>`;
 if(current)$('#'+current,panel)?.focus({preventScroll:true});
 }
 async function call(operation='state',payload={}){const id=userId,version=revision,client=window.foamAuth?.client;if(!id||!client)return;const {data,error}=await client.rpc('foamlab_companion',{operation,payload});if(version!==revision||window.foamAuth?.user?.id!==id)return;if(error)throw Error(error.message||'成长记录暂时无法读取。');if(!data?.pet||!Array.isArray(data.items))throw Error('成长记录暂时无法读取。');const old=state;state=data;lastFetch=Date.now();render();if(old)reward(old);return data;}
 function problem(error){if(window.foamAuth?.user?.id===userId){window.foamAuth.petError=true;dispatchEvent(new Event('foam-pet-change'));}const message=error.message||'暂时连接不上，请稍后重试。';if(panel){let output=$('.panda-form-status',panel);if(!output){panel.innerHTML='<h2>我的熊猫</h2><p class="panda-form-status" role="status"></p><button class="button secondary" id="panda-retry">重新加载</button>';output=$('.panda-form-status',panel);}output.textContent=message;}else if(state)say('成长记录暂时无法更新，请稍后再试。');}
 async function mutate(operation,payload={}){if(busy||!userId)return;busy=true;const version=revision;try{await call(operation,payload);}catch(e){if(version===revision)problem(e);}finally{if(version===revision){busy=false;if(state){const message=panel?.querySelector('.panda-form-status')?.textContent;renderPanel();if(message)panel.querySelector('.panda-form-status').textContent=message;}}}}
 async function refresh(){if(!userId||busy)return;const version=revision;try{await call();}catch(e){if(version===revision)problem(e);}}
 async function authChanged(){await window.foamAuth?.ready;const id=window.foamAuth?.user?.id;if(!id){reset();return;}if(id!==userId){reset();userId=id;const version=revision;await refresh();if(version!==revision)return;const position=read('foamlab-panda-position:'+id,null);move(position?.x??innerWidth-156,position?.y??innerHeight-205);}else{clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,300);}}
 const grab=$('.panda-grab',pet);
 grab.addEventListener('pointerdown',e=>{if(e.button!==0)return;stopTravel();choreography?.stop(pet);closeMenu();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:pet.offsetLeft,top:pet.offsetTop,moved:false};suppressClick=false;grab.setPointerCapture(e.pointerId);});
 grab.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6){drag.moved=true;suppressClick=true;clearTimeout(clickTimer);pet.classList.add('is-dragging');$('.panda-bubble',pet).hidden=true;}if(drag.moved)move(drag.left+dx,drag.top+dy);});
 grab.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const moved=drag.moved;drag=null;pet.classList.remove('is-dragging');grab.releasePointerCapture(e.pointerId);if(moved){lastTap=0;openOnClick=false;move(pet.offsetLeft,pet.offsetTop,true);return;}const now=Date.now();if(now-lastTap<330&&lastTapPoint&&Math.hypot(e.clientX-lastTapPoint.x,e.clientY-lastTapPoint.y)<28){clearTimeout(clickTimer);lastTap=0;openOnClick=true;}else{lastTap=now;lastTapPoint={x:e.clientX,y:e.clientY};clearTimeout(clickTimer);clickTimer=setTimeout(tip,340);}});
 grab.addEventListener('pointercancel',()=>{drag=null;suppressClick=true;openOnClick=false;lastTap=0;pet.classList.remove('is-dragging');clearTimeout(clickTimer);});
 // Touch synthesizes a click after pointerup. Opening here prevents that click
 // from landing on the newly opened dialog's backdrop and closing it again.
 grab.addEventListener('click',e=>{if(openOnClick&&!suppressClick){openOnClick=false;search();}else if(e.detail===0)tip();suppressClick=false;});
 grab.addEventListener('dblclick',e=>{if(!suppressClick){e.preventDefault();lastTap=0;search();}});
 grab.addEventListener('keydown',e=>{const delta={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[e.key];if(delta){e.preventDefault();stopTravel();move(pet.offsetLeft+delta[0],pet.offsetTop+delta[1],true);}if(e.key==='Escape')$('.panda-bubble',pet).hidden=true;});
 grab.addEventListener('pointerenter',()=>{stopTravel();if(state?.pet.motion&&!motion.matches&&!drag)pet.classList.add('is-curious');});
 grab.addEventListener('pointerleave',()=>pet.classList.remove('is-curious'));
 let mouseFrame=0;
 document.addEventListener('pointermove',e=>{if(pet.hidden||motion.matches||!state?.pet.motion||document.hidden||mouseFrame)return;mouseFrame=requestAnimationFrame(()=>{mouseFrame=0;const r=grab.getBoundingClientRect();pet.style.setProperty('--look-x',Math.max(-3,Math.min(3,(e.clientX-r.x-r.width/2)/100))+'px');pet.style.setProperty('--look-y',Math.max(-2,Math.min(2,(e.clientY-r.y-r.height/2)/130))+'px');});},{passive:true});
 $('[data-pet-menu]',pet).onclick=showMenu;
 $('[data-pet-search]',pet).onclick=()=>search();$('[data-pet-checkin]',pet).onclick=()=>mutate('checkin');$('[data-pet-hide]',pet).onclick=()=>mutate('settings',{visible:false});dock.onclick=()=>mutate('settings',{visible:true});
 $('.panda-bubble-close',pet).onclick=()=>$('.panda-bubble',pet).hidden=true;
 $('.panda-tip-search',pet).onclick=e=>search(e.currentTarget.dataset.query);
 panel?.addEventListener('click',e=>{if(e.target.closest('#panda-collection-toggle')){collectionOpen=!collectionOpen;save('foamlab-main-collection-open',collectionOpen);renderPanel();return;}const t=e.target.closest('[data-panda-tab]');if(t){tab=t.dataset.pandaTab;renderPanel();$('#panda-tab-'+tab,panel)?.focus({preventScroll:true});return;}if(e.target.closest('#panda-switch-form')){tab='form';collectionOpen=true;save('foamlab-main-collection-open',true);renderPanel();$('.panda-collection-head',panel)?.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'});$('#panda-tab-form',panel)?.focus({preventScroll:true});return;}const item=e.target.closest('[data-panda-item]');if(item&&!item.disabled){void mutate('equip',{id:item.dataset.pandaItem}).then(()=>{if(state)preview(state.pet.action,true);});return;}if(e.target.closest('#panda-checkin'))void mutate('checkin');if(e.target.closest('#panda-retry'))void refresh();if(e.target.closest('#panda-play')){if(state?.pet.visible)preview(state.pet.action||'wave',true);else void mutate('settings',{visible:true}).then(()=>{if(state)preview(state.pet.action||'wave',true);});}});
 menu.addEventListener('click',e=>{const button=e.target.closest('[data-pet-action]');if(button&&!button.disabled){const action=button.dataset.petAction;closeMenu();preview(action,true);}});
 document.addEventListener('pointerdown',e=>{if(!pet.contains(e.target))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();$('[data-pet-menu]',pet).focus();}});
 document.addEventListener('change',async e=>{if(e.target.matches('[data-panda-sound]'))await choreography?.setSound(e.target.checked);if(e.target.matches('[data-panda-particles]'))window.foamPandaParticles?.set(e.target.checked);});
 window.addEventListener('foamlab:panda-sound',()=>document.querySelectorAll('[data-panda-sound]').forEach(el=>el.checked=choreography.sound));
 panel?.addEventListener('submit',e=>{if(e.target.id!=='panda-settings')return;e.preventDefault();const f=e.target;void mutate('settings',{name:f.elements.name.value.trim(),visible:f.elements.visible.checked,motion:f.elements.motion.checked});});
 window.addEventListener('resize',()=>{if(state)move(pet.offsetLeft,pet.offsetTop);});motion.addEventListener('change',()=>render());
 window.addEventListener('foam-auth-change',authChanged);
 window.addEventListener('foamlab:activity',()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,150);});
 window.addEventListener('focus',()=>{if(Date.now()-lastFetch>15000)void refresh();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stopTravel();closeMenu();}else if(Date.now()-lastFetch>15000)void refresh();});
 setInterval(()=>{if(document.hidden||pet.hidden||!state?.pet.motion||motion.matches||drag||pet.matches(':hover')||!menu.hidden||document.querySelector('dialog[open]')||!$('.panda-bubble',pet).hidden)return;const actions=state.items.filter(i=>i.category==='action'&&i.unlocked);animate(actions[Math.floor(Math.random()*actions.length)]?.id||'wave',false,true);},17000);
 setInterval(()=>{if(!document.hidden&&userId)void refresh();},120000);
 // On the home page the hero panda stands in for the companion while it is on screen.
 const heroPanda=document.querySelector('.fl-portrait');
 if(heroPanda&&'IntersectionObserver' in window)new IntersectionObserver(([entry])=>{pet.classList.toggle('is-away',entry.isIntersecting);if(entry.isIntersecting){closeMenu();$('.panda-bubble',pet).hidden=true;}},{threshold:.35}).observe(heroPanda);
 void authChanged();
})();

;
/* panda-notes.js */
'use strict';
(() => {
 const mark=window.foamPandaArt(true);
 function enhance(){
  // Restyle a few existing operational explanations without adding duplicate prose.
  const starts=['第一行适用于安装到该路径的 Ubuntu 软件包。','本例是二维方腔。','cp -r 复制整个目录','计算会频繁读写文件，Linux 本地目录','终端显示乱码时，检查文件编码','在另一个终端进入同一算例，执行 tail -f','修改一处打印文本，重新编译并运行。'];
  document.querySelectorAll('.prose > p').forEach(p=>{if(starts.some(s=>p.textContent.trim().startsWith(s))&&!p.closest('.panda-note')){const note=document.createElement('aside');note.className='note';p.before(note);note.append(p);}});
  // Only explicit short learning tips, never source quotations or warnings.
  document.querySelectorAll('.prose blockquote,.prose .tip,.prose .callout-tip,.prose .note').forEach(el=>{
   if(el.dataset.pandaNote||el.querySelector('pre,figure,table')||el.textContent.length>450)return;
   const first=el.firstElementChild,lead=first?.querySelector(':scope > strong:first-child');
   const explicit=el.matches('.tip,.callout-tip,.note');
   if(!explicit&&!(lead&&/^(提示|小提示|小技巧|操作提示|学习提示)[：:]?$/.test(lead.textContent.trim())))return;
   el.dataset.pandaNote='true';el.classList.add('panda-note');if(lead)lead.remove();
   const label=document.createElement('div');label.className='panda-note-label';label.innerHTML=mark+'<span>熊猫说</span>';el.prepend(label);
  });
 }
 enhance();window.addEventListener('foamlab:content-ready',enhance);
 const main=document.querySelector('main');if(main){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance();});}).observe(main,{childList:true,subtree:true});}
})();

