'use strict';
(() => {
 const D=window.FoamTownStoryData,W=window.FoamTownStoryWorld;
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const empty=()=>({progress:{},visited:[],accepted_quests:[],completed:[],arrived:{},consulted:{},discovered:[],awards:[]});
 let game=null,ui=null,owner='',state=empty(),loaded=false,request=null,epoch=0,view=0,tracked='',markers=[],entryFrom=null;
 const uid=()=>window.foamAuth?.user?.id||'';
 const current=()=>game?.config.scene?.id||'village';
 const context=()=>window.FoamTownEggContext?.get()||{};
 const atHome=()=>!!owner&&!game?.config.guest&&context().province===context().home;
 const waiting=q=>q.consultations.find(c=>c.step===stage(q)&&state.consulted[q.id]!==c.step);
 const done=q=>!!q&&state.completed.includes(q.id);
 const active=q=>state.accepted_quests.includes(q.id)&&!done(q);
 const found=q=>q.trigger.kind==='story'||state.discovered.includes(q.id);
 const stage=q=>state.progress[q.id]||0;
 const status=q=>done(q)?(claimed(q)?'已完成':'已完成 · 待领奖'):!unlocked(q)?'等待前面的故事':active(q)?stage(q)===q.steps.length?'待汇报':'进行中 · '+stage(q)+' / '+q.steps.length+' 步':!found(q)?'待发现线索':'可接取';
 const unlocked=q=>q.needs.every(id=>done(D.quests.find(q=>q.id===id)));
 const title=id=>D.quests.find(q=>q.id===id)?.title||id;
 const completed=()=>D.quests.filter(done);
 const claimed=q=>state.awards.some(a=>a.id==='quest:'+q.id);
 const rewardable=()=>D.quests.filter(q=>done(q)&&!claimed(q)).map(q=>({id:'quest:'+q.id,title:q.title,reward:q.reward,q})).concat(D.achievements.filter(a=>a.need.every(id=>state.completed.includes(id))&&(a.visits||[]).every(id=>state.visited.includes(id))&&!state.awards.some(r=>r.id==='achievement:'+a.id)).map(a=>({id:'achievement:'+a.id,title:a.name,reward:a.reward})));
 const illustration=q=>{const i=D.quests.indexOf(q);return `<i class="story-illustration" role="img" aria-label="${E(q.title)}任务插画" style="background-position:${(i%4)*100/3}% ${Math.floor(i/4)*25}%"></i>`;};
 const nextAction=q=>done(q)?(claimed(q)?'故事已完成，手记已经收藏。':'调查已汇报，可在任务簿领取奖励。'):stage(q)===q.steps.length?'回到'+D.npcs[q.npc].name+'身边，汇报调查结果。':waiting(q)?'去'+W.scene(waiting(q).scene).name+'找'+D.npcs[waiting(q).npc].name+'，核对这一步的线索。':'去'+W.scene(q.scene).name+'的'+q.steps[stage(q)].place+'，'+q.steps[stage(q)].title+'。';
 const icon=id=>`<span class="story-seal" aria-hidden="true">${({forest:'水',valley:'风',wetland:'澜',summit:'星',village:'记'})[id]}</span>`;
 function identify(){if(owner!==uid()){owner=uid();state=empty();tracked='';loaded=false;request=null;epoch++;}}
 async function api(operation,payload={}){identify();if(operation!=='state'&&!atHome())throw Error('请回到自己的小镇继续任务，串门时不会推进剧情。');const rev=epoch,id=owner;const data=await window.FoamTownNet.rpc('foamlab_town_story',{operation,payload:{...payload,province:context().province}});if(rev!==epoch||id!==uid())throw Error('账号已变化，请重新打开任务。');state={...empty(),...data};loaded=true;tracker();drawMarkers();if(data.earned_now?.length){window.FoamTownProgress?.refresh().catch(()=>{});window.dispatchEvent(new Event('foamlab:town-story-reward'));const names=data.earned_now.filter(id=>id.startsWith('achievement:')).map(id=>D.achievements.find(a=>'achievement:'+a.id===id)?.name).filter(Boolean);if(names.length)window.foamNotify?.('达成成就：'+names.join('、')+'。奖励已到账。');}return data;}
 async function refresh(){identify();if(!owner||game?.config.guest)return;if(!request){const rev=epoch;request=api('state').finally(()=>{if(rev===epoch)request=null;});}return request;}
 function open(h,body){window.FoamTownDialogue.close();view++;ui.dialog(h,`<div class="story-book">${body}</div>`);document.querySelector('#town-dialog').classList.add('is-story');}
 function error(host,e){const p=host.querySelector('[data-story-feedback]')||host.querySelector('[data-story-error]');if(p){p.textContent=e.message||String(e);p.classList.add('is-error');}else{const p=document.createElement('p');p.setAttribute('role','alert');p.className='story-error';p.textContent=e.message||String(e);host.prepend(p);}}
 function travel(id){if(!W.scene(id)||!game||id===current())return;entryFrom=current();window.FoamTownDialogue.close();ui.close();game.stopMovement();ui.travel(id);}
 function worldMap(){open('观测站地图',`<p>沿土路走到路口，便会进入相邻场景。路牌标明去向；这里也保留直接前往的入口。</p><div class="story-world-map">${D.scenes.map(s=>`<button type="button" data-story-go="${s.id}" ${s.id===current()?'aria-current="location"':''}>${icon(s.id)}<strong>${E(s.name)}</strong><span>${E(s.subtitle)}</span><small>${s.id===current()?'当前位置':state.visited.includes(s.id)?'已到访':'前往探索'}</small></button>`).join('')}</div><p class="story-connections">广场 ⇄ 溪竹林 ⇄ 潮汐湿地 ⇄ 星流高地 ⇄ 回声峡谷 ⇄ 广场</p>`);}
 function journal(filter='current',synced=false){
  identify(); if(!['current','completed','rewards'].includes(filter))filter='current';
  const list=D.quests.filter(filter==='completed'?done:active), rewards=rewardable();
  const first=D.quests.find(q=>q.kind==='main'&&unlocked(q)&&!done(q));
  open('任务簿',`<header class="story-journal-heading"><h3>我的观测任务</h3><small>进行中 ${D.quests.filter(active).length} · 已完成 ${completed().length} / ${D.quests.length}</small></header><nav class="story-tabs" aria-label="任务分类">${[['current','当前任务'],['completed','已完成'],['rewards','领取奖励'+(rewards.length?' · '+rewards.length:'')]].map(([id,t])=>`<button type="button" data-story-filter="${id}" aria-selected="${filter===id}">${t}</button>`).join('')}<button type="button" data-story-shelf>收藏与成就</button></nav><p data-story-error role="status"></p>${!owner||game?.config.guest?'<p>登录并入住后，与居民交谈即可接取任务，进度会保存在账号中。</p>':!atHome()?'<p>正在其他小镇串门，可以查看手记。回到自己的小镇后继续调查和领取奖励。</p>':''}${filter==='rewards'?rewardList():`<div class="story-quest-list">${list.map(q=>`<button type="button" data-story-quest="${q.id}" class="story-quest ${done(q)?'is-done':''}">${illustration(q)}<span><small>${q.kind==='main'?'主线':'支线'} · ${E(D.npcs[q.npc].name)}</small><strong>${E(q.title)}</strong><span>${status(q)}</span>${!done(q)?`<small class="story-next-hint">${E(nextAction(q))}</small>`:''}</span><b aria-hidden="true">${done(q)?'✓':'›'}</b></button>`).join('')||`<div class="story-journal-empty"><h3>${filter==='completed'?'还没有完成的故事':'还没有接下的任务'}</h3><p>${filter==='completed'?'调查结束后，回来看看沿途留下的记录。':'去和居民聊一聊吧。他们会说起身边的事，也可能请你帮忙。'}</p>${filter==='current'&&first&&atHome()?`<button type="button" class="story-primary" data-story-npc-go="${first.id}">去找${E(D.npcs[first.npc].name)}聊聊</button>`:''}</div>`}</div>`}`);
  const rev=view,host=document.querySelector('.story-book');if(owner&&!game?.config.guest&&!synced)refresh().then(()=>{if(rev===view&&host.isConnected)journal(filter,true);}).catch(e=>{if(host.isConnected)error(host,e);});
 }
 function rewardList(){const items=rewardable();return `<div class="story-reward-list">${items.map(a=>`<article class="story-reward-item">${a.q?illustration(a.q):icon('village')}<div><strong>${E(a.title)}</strong><small>${a.q?'任务':'成就'}奖励 · ${a.reward.bamboo} 根竹笋 · ${a.reward.xp} 点经验</small>${a.q?`<small>收藏：${E(a.q.note[0])}</small>`:''}</div><button type="button" class="story-primary" data-story-claim="${a.id}" ${atHome()?'':'disabled'}>领取奖励</button></article>`).join('')||'<p>目前没有待领取的奖励。完成调查并向委托人汇报后，奖励会出现在这里。</p>'}</div>`; }
 function overview(q){
  tracked=q.id;tracker();drawMarkers(); const progress=stage(q),complete=done(q);
  let action='';
  if(!atHome()&&!complete)action='<p>这项任务在自己的小镇进行。回家后，再去找居民交谈。</p>';
  else if(complete)action=claimed(q)?'<p class="story-done">✓ 奖励已领取</p>':`<button type="button" class="story-primary" data-story-claim="quest:${q.id}" ${atHome()?'':'disabled'}>领取 ${q.reward.bamboo} 根竹笋与 ${q.reward.xp} 点经验</button>`;
  else if(active(q))action=`<button type="button" class="story-primary" ${waiting(q)?'data-story-consult-go':'data-story-objective'}="${q.id}">前往当前目标</button>`;
  else if(!unlocked(q))action=`<p>先完成「${q.needs.map(title).map(E).join('、')}」，再去找${E(D.npcs[q.npc].name)}。</p>`;
  else action=`<button type="button" data-story-npc-go="${q.id}">去找${E(D.npcs[q.npc].name)}聊聊</button>`;
  open(q.title,`<div class="story-task-header">${illustration(q)}<div><small>${q.kind==='main'?'主线故事':'支线委托'} · ${E(W.scene(q.scene).name)}</small><h3>${E(q.title)}</h3><p>委托人：${E(D.npcs[q.npc].name)}<br>${status(q)}</p></div></div>${active(q)||complete?`<section class="story-next-action"><strong>${complete?'任务结果':'接下来'}</strong><p>${E(nextAction(q))}</p>${complete?`<p>${E(q.ending)}</p>`:''}</section><ol class="story-phases"><li class="is-finished">与${E(D.npcs[q.npc].name)}交谈，接下委托</li>${q.steps.map((step,i)=>`${q.consultations.filter(c=>c.step===i).map(c=>`<li class="${complete||progress>i||state.consulted[q.id]>=i?'is-finished':progress===i?'is-current':''}">拜访${E(D.npcs[c.npc].name)}<small>${E(W.scene(c.scene).name)} · 核对观测线索</small></li>`).join('')}<li class="${complete||progress>i?'is-finished':progress===i&&!waiting(q)?'is-current':''}">${E(step.title)}<small>${E(step.place)}</small></li>`).join('')}<li class="${complete?'is-finished':progress===q.steps.length?'is-current':''}">向${E(D.npcs[q.npc].name)}汇报调查结果</li></ol>`:'<p>任务从居民的对话中开始，接下委托后，调查步骤会记在这里。</p>'}<p class="story-reward">完成奖励：${q.reward.bamboo} 根竹笋 · ${q.reward.xp} 点经验 · ${E(q.note[0])}</p><p data-story-error role="status"></p><div class="story-task-actions">${action}<button type="button" data-story-journal>返回任务簿</button>${complete?`<button type="button" data-story-review="${q.id}" data-step="0">回看练习</button>`:''}</div>`);
 }
 function task(id,reviewStep,mode=''){const q=D.quests.find(q=>q.id===id);if(!q)return;const complete=done(q),progress=stage(q);
  if(mode==='npc')return taskConversation(q);
  if(reviewStep===undefined&&mode!=='station')return overview(q);
  if(!complete&&(!active(q)||!atHome()))return overview(q);
  const at=reviewStep??progress,s=q.steps[at];if(!s)return;
  open(q.title,`<div class="story-speaker">${portrait(q.npc)}<span>${E(D.npcs[q.npc].name)}<small>${E(W.scene(q.scene).name)} · ${q.kind==='main'?'主线':'支线'}</small></span><b>${at+1} / ${q.steps.length}</b></div><h3 tabindex="-1">${E(s.title)}</h3><p>${E(s.text)}</p>${s.code?`<pre><code>${E(s.code)}</code></pre>`:''}<h4>${E(s.question)}</h4>${s.game?'<div data-story-game></div>':`<div class="story-options">${s.options.map((o,i)=>`<button type="button" data-story-answer="${i}"><b>${i+1}</b>${E(o)}</button>`).join('')}</div>`}<div data-story-feedback role="status"></div><div class="story-actions"><button type="button" data-story-journal>返回任务簿</button><a href="/read/?slug=${encodeURIComponent(q.lesson)}" target="_blank" rel="noopener">查看对应课程 ↗</a></div>`);
  const host=document.querySelector('.story-book'),rev=view;let busy=false;
  const submit=async(answer,extra={})=>{if(busy)return;if(!uid()||game?.config.guest){error(host,Error('登录并入住后即可提交练习，进度会保存到账号。'));return;}if(complete){const feedback=host.querySelector('[data-story-feedback]');feedback.className='story-feedback';feedback.textContent=s.explanation;return;}
   busy=true;host.querySelectorAll('[data-story-answer],[data-match-check],[data-paint-done]').forEach(b=>b.disabled=true);const feedback=host.querySelector('[data-story-feedback]');feedback.className='';feedback.textContent='正在核对并保存…';
   try{const result=await api('answer',{quest:id,step:at,answer,...extra});if(rev!==view||!host.isConnected)return;if(!result.accepted){feedback.className='story-feedback is-retry';feedback.innerHTML='<strong>再试一次</strong><p>'+E(s.explanation)+'</p>';return;}feedback.className='story-feedback is-correct';feedback.innerHTML='<strong>已保存</strong><p>'+E(s.explanation)+'</p><button type="button" class="story-primary" data-story-next>'+((state.progress[id]||0)>=q.steps.length?'返回委托人身边汇报':'查看下一个调查地点')+'</button>';host.querySelector('[data-story-next]').onclick=()=>task(id);host.querySelector('[data-story-next]').focus({preventScroll:true});}
   catch(e){if(host.isConnected)error(host,e);}finally{busy=false;if((state.progress[id]||0)===at&&view===rev)host.querySelectorAll('[data-story-answer],[data-match-check],[data-paint-done]').forEach(b=>b.disabled=false);}
  };
  host.querySelectorAll('[data-story-answer]').forEach(b=>b.onclick=()=>submit(+b.dataset.storyAnswer));if(s.game)window.FoamTownStoryGames[s.game](host.querySelector('[data-story-game]'),submit);
  if(complete){host.querySelector('[data-story-feedback]').innerHTML='<p>'+E(s.explanation)+'</p>';host.querySelectorAll('[data-story-answer]').forEach(b=>b.disabled=true);}
 }
 function portrait(id){return window.FoamTownNPCPortrait(id);}
 const greetings={heng:'你来得正好。我把观测记录摊开了，正在找几处对不上的地方。坐下来聊聊？',muxi:'我刚从水渠回来，鞋子还没干。今天的水声和昨天有些不同，你听见了吗？',lan:'山口的风又转向了。先站稳，再看风向标——我小时候总把这个顺序弄反。',tie:'这张桌子上都是还没弄明白的仪器。你有空的话，陪我看一件？',cheng:'船模今天浮得很稳。水面看起来安静，尺子上的记录却一直在变。',yan:'望远镜先放一放。今天我想把我们看不见的风，画成能和别人讨论的图。'};
 const offers={
  'first-log':['暴雨过后，我从广场捡回这本记录。纸上的数字还看得清，表头却被水冲掉了。','你愿意帮我整理它吗？先认清算例里的文件，再去问沐溪和铁竹，看看这些记录能不能接起来。'],
  canal:['水车停下了。村里有人说是水不够，可我看上游的水位并不低。','我们沿水渠查一遍吧。先核对进出的水量，再看计算边界和测量记录。'],
  wind:['这个风向标陪我飞过很多地方。如今留在峡谷，我想用它把一阵风好好记录下来。','帮我做一次风道调查好吗？来流、出口和壁面都得交代清楚。'],
  sluice:['那条旧水位线终于找到了，可闸前的水面已经变了。','我想用测量和两相算例把变化复原。你愿意陪我去看看吗？'],
  'heat-house':['温室总有一个角落暖不起来。植物只能往亮处长，仪表却说平均温度正常。','我们从热量去了哪里查起，再把墙面和空气的设置核对一遍。'],
  'dimension-fair':['四座站点把记录送来了，单位、尺寸和速度都不一样，直接摆在一起很难比较。','帮我给展览做一组相似问题的卡片吧。我们先聊清楚每个无量纲数比较的是什么。'],
  'star-field':['我想画一片会流动的星空。颜色有了，可画上的旋涡还没有方向。','一起从速度和涡量开始，好吗？我们先看记录，再动手画。'],
  opening:['观测展快开门了。我把大家带回来的记录摆在桌上，还差最后一次检查。','陪我走一圈吧。把水量、边界和结果的来历说清楚，这些展板就能交给来访的人了。'],
  'mesh-note':['我的网格草图少了一页，只剩下几个交点。直接补线不难，难的是说明这些线代表什么。','能帮我重画吗？我们还要请铁竹和沐溪一起看看。'],
  'time-note':['我拍到水车突然加快，可计算结果里没有那一瞬间。','陪我核对时间步和写出间隔吧。我想知道我们漏掉了哪段记录。'],
  'pressure-note':['这两块压力表读数差很多，却都说自己没坏。我把它们放进了“待定”的抽屉。','你愿意和我查查它们到底量的是什么吗？先看单位，再看压力的定义。'],
  'shock-note':['峡谷里传来一声很短的回响。把它当成普通风声，好像解释不通。','一起查查压力扰动如何传播，再看看可压缩算例需要哪些条件。'],
  'filter-note':['这根砂柱让水走得慢了许多。砂子填得更紧以后，变化更明显。','帮我把流量和压降记下来吧，我们再把它们和多孔介质的设置对上。'],
  'bubble-note':['瓶里的气泡有大有小。我原以为它们都能用同一种办法算，后来发现连要观察的问题都不同。','陪我分清楚哪些要看形状、哪些只关心整体运动，好吗？'],
  'diffusion-note':['我往水里滴了一滴染料。起初边缘很清楚，后来慢慢散开。','我们用一个简单算例看看浓度怎样变化，再去问问沐溪和铁竹。'],
  'visual-note':['两张图用了一样的颜色，标尺却不一样。看图的人说，左边的风一定更强。','帮我重新布置展板吧，先把真正能比较的量放在同一把尺子上。'],
  'fan-note':['风机能转了，可“能转”还不能说明它工作得好。','陪我测一次进出口，再把旋转区和功率的记录补齐。'],
  'windmill-note':['山口的风车一会儿快一会儿慢。我想知道它取走的能量去了哪里。','一起看叶片、风速和功率吧，不能只凭转得快就下结论。'],
  'airfoil-note':['小白想要一架能飞过溪流的滑翔机。我做好了模型，还想把受力弄清楚。','帮我检查升力方向，再请岚岚看看迎角和分离，好吗？'],
  'ship-note':['父亲留下的这只竹叶船模，舱里还压着我小时候画的航线。','我想让它重新试航。我们先让船浮稳，再记录波浪，最后比较小船和大船的速度。']
 };
 function say(id,pages,choices){const p=D.npcs[id];view++;window.FoamTownDialogue.show({npcId:id,name:p.name,role:W.scene(current()).name,pages,choices});}
 const goodbye=()=>({label:'回头再聊',run:()=>window.FoamTownDialogue.close()});
 async function npc(id,near=false){
  const p=D.npcs[id];if(!p||!game)return;const captured=game,scene=current(),m=game.npcs.get('story-'+id);
  if(!near&&m&&game.config.playable&&!game.config.direct?.()&&Math.hypot(m.x-game.me.x,m.y-game.me.y)>85){const at=game.open(m.x,m.y+44);ui.close();game.walkTo(at.x,at.y,()=>{if(game===captured)npc(id,true);});return;}
  say(id,[greetings[id]],[goodbye()]);const rev=view;
  try{if(atHome()){await refresh();for(const q of D.quests.filter(q=>q.npc===id&&q.scene===scene&&q.kind==='side'&&q.trigger.kind==='talk'&&unlocked(q)&&!found(q)))await api('discover',{quest:q.id,trigger:'talk',npc:id});}
   if(captured!==game||rev!==view||!window.FoamTownDialogue.open)return;
   const choices=[];
   if(atHome()){
    for(const q of D.quests.filter(q=>active(q)&&waiting(q)?.npc===id&&waiting(q)?.scene===scene))choices.push({label:'问问「'+q.title+'」的线索',run:()=>conversation(q.id)});
    for(const q of D.quests.filter(q=>q.npc===id&&q.scene===scene&&unlocked(q)&&!done(q)&&found(q)))choices.push({label:(active(q)?stage(q)===q.steps.length?'汇报：':'聊聊进展：':'问起：')+q.title,run:()=>taskConversation(q)});
   }
   choices.push({label:p.personal_question,run:()=>say(id,[p.about],[{label:'还有件事想问你',run:()=>npc(id,true)},goodbye()])},goodbye());
   say(id,[greetings[id]],choices);
  }catch(e){say(id,['观测记录暂时没能取到。'+e.message],[{label:'再试一次',run:()=>npc(id,true)},goodbye()]);}
 }
 function taskConversation(q){
  if(!atHome())return npc(q.npc,true);
  if(!active(q)){
   const main=D.quests.find(t=>t.kind==='main'&&active(t));
   if(q.kind==='main'&&main)return say(q.npc,['你还在忙「'+main.title+'」吧？等那边的事情有了结果，我们再来聊这一件。'],[goodbye()]);
   if(!unlocked(q)||!found(q))return npc(q.npc,true);
   say(q.npc,offers[q.id]||[q.intro],[{label:'好，我来帮忙',run:async()=>{await api('accept',{quest:q.id,npc:q.npc});tracked=q.id;say(q.npc,['谢谢你。'+nextAction(q),'任务簿里会记下我们已经做过的事，需要时从设置旁边打开。'],[{label:'这就出发',run:()=>{window.FoamTownDialogue.close();seek(q.id,'objective');}},{label:'先记在任务簿里',run:()=>window.FoamTownDialogue.close()}]);}}, {label:'我再想想',run:()=>window.FoamTownDialogue.close()}]);return;
  }
  if(stage(q)===q.steps.length){
   say(q.npc,[q.ending,'这次的调查可以收进观测站了。把结果记入任务簿，报酬也放在那里。'],[{label:'提交这次调查记录',run:async()=>{await api('arrive',{quest:q.id,step:q.steps.length,station:'npc-'+q.npc});await api('report',{quest:q.id,npc:q.npc});say(q.npc,['记录已经收好。谢谢你走了这么远，把事情一项项查清楚。'],[{label:'打开任务簿领取奖励',run:()=>journal('rewards')},goodbye()]);}},goodbye()]);return;
  }
  say(q.npc,[nextAction(q)],[{label:'我去看看',run:()=>{window.FoamTownDialogue.close();seek(q.id,waiting(q)?'consult':'objective');}},{label:'查看任务簿',run:()=>overview(q)},goodbye()]);
 }
 function conversation(id){const q=D.quests.find(q=>q.id===id),c=q&&waiting(q);if(!q||!c||!atHome())return;
  if(current()!==c.scene){seek(id,'consult');return;}
  say(c.npc,[c.story,c.evidence,{speaker:'你',text:c.reply}],[{label:'记下线索，继续调查',run:async()=>{await api('consult',{quest:id,npc:c.npc,scene:c.scene});window.FoamTownDialogue.close();seek(id,'objective');}},goodbye()]);
 }
 function point(q,kind){
  if(kind==='consult'){const m=game.npcs.get('story-'+waiting(q)?.npc);return m?game.open(m.x,m.y+45):game.free(800,1190);}
  if(kind==='npc'||stage(q)===q.steps.length&&kind==='objective'){const m=game.npcs.get('story-'+q.npc);return m?game.open(m.x,m.y+45):game.free(800,1190);}
  if(kind==='clue'){const index=D.quests.filter(t=>t.scene===q.scene&&t.trigger.kind==='inspect').findIndex(t=>t.id===q.id),plot=game.positions[(index+1)%game.positions.length];return game.free(plot.x+230,plot.y+240+index*35);}
  const i=stage(q),plot=game.positions[i%game.positions.length];
  if(game.config.scene)return game.free(plot.x+240,plot.y+300);
  const building=game.config.buildings.findIndex(b=>b[0]===['notice','workshop','school'][i]),door=game.door(building>=0?building:0);
  return game.free(door.x+100,door.y+40);
 }
 async function mutate(operation,payload,after){const host=document.querySelector('.story-book'),rev=view;
  host?.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{const data=await api(operation,payload);if(rev===view)after?.(data);}
  catch(e){if(host?.isConnected){error(host,e);host.querySelectorAll('button').forEach(b=>b.disabled=false);}}
 }
 function seek(id,kind){const q=D.quests.find(q=>q.id===id);if(!q||!game||!atHome())return;tracked=id;window.FoamTownDialogue.close();const destination=kind==='consult'?waiting(q)?.scene:q.scene;if(!destination)return;
  if(current()!==destination){pending={id,kind};travel(destination);return;}
  if(kind==='clue'&&q.trigger.kind!=='inspect')kind='npc';
  const g=game,at=point(q,kind),step=stage(q);ui.close();drawMarkers();
  const arrived=async()=>{if(game!==g||current()!==destination)return;
   try{
    if(kind==='consult'){conversation(id);return;}
    if(kind==='clue'){if(owner&&!g.config.guest)await api('discover',{quest:id,trigger:'inspect'});say(q.npc,['你在这里发现了'+q.trigger.label+'。带着它去问问'+D.npcs[q.npc].name+'吧。'],[{label:'去找'+D.npcs[q.npc].name,run:()=>{window.FoamTownDialogue.close();seek(id,'npc');}},goodbye()]);return;}
    if(kind==='npc'){if(active(q)&&step===q.steps.length)await api('arrive',{quest:id,step,station:'npc-'+q.npc});await npc(q.npc);return;}
    await api('arrive',{quest:id,step,station:step===q.steps.length?'npc-'+q.npc:q.scene+'-step-'+step});
    task(id,undefined,step===q.steps.length?'npc':'station');
   }catch(e){task(id);error(document.querySelector('.story-book'),e);}
  };
  if(g.config.guest||g.config.direct?.()||Math.hypot(g.me.x-at.x,g.me.y-at.y)<55)arrived();else {g.walkTo(at.x,at.y,arrived);g.emit('hint','正在前往'+(kind==='consult'?D.npcs[waiting(q).npc].name:kind==='clue'?q.trigger.label:kind==='npc'||step===q.steps.length?D.npcs[q.npc].name:q.steps[step].place));}
 }
 function drawMarkers(){if(!game)return;const g=game;g.world.querySelectorAll('.story-objective,.town-npc-quest-status').forEach(n=>n.remove());markers=[];if(!atHome())return;
  const mainBusy=D.quests.some(q=>q.kind==='main'&&active(q));
  for(const [id,m] of g.npcs){if(!id.startsWith('story-'))continue;const person=id.slice(6);
   const report=D.quests.find(q=>active(q)&&q.npc===person&&q.scene===current()&&stage(q)===q.steps.length);
   const consult=D.quests.find(q=>active(q)&&waiting(q)?.npc===person&&waiting(q)?.scene===current());
   const offer=D.quests.find(q=>q.npc===person&&q.scene===current()&&!active(q)&&!done(q)&&unlocked(q)&&found(q)&&(q.kind==='side'||!mainBusy));
   const label=report?'可以汇报调查':consult?'有待核对的线索':offer?'有新的委托':'';
   if(label){const mark=document.createElement('b');mark.className='town-npc-quest-status'+(report?' is-ready':'');mark.textContent=report?'✓':consult?'?':'!';mark.setAttribute('aria-label',label);mark.title=label;m.el.append(mark);}
  }
  const selected=D.quests.find(q=>q.id===tracked&&active(q))||D.quests.find(q=>q.kind==='main'&&active(q))||D.quests.find(active);
  const clues=D.quests.filter(q=>q.scene===current()&&q.trigger.kind==='inspect'&&unlocked(q)&&!found(q));
  const entries=clues.map(q=>({q,kind:'clue',label:q.trigger.label}));
  if(selected&&waiting(selected)?.scene===current())entries.push({q:selected,kind:'consult',label:'拜访'+D.npcs[waiting(selected).npc].name});
  else if(selected?.scene===current()&&!waiting(selected))entries.push({q:selected,kind:'objective',label:stage(selected)===selected.steps.length?'向'+D.npcs[selected.npc].name+'汇报':selected.steps[stage(selected)].place});
  entries.forEach(({q,kind,label})=>{const at=point(q,kind),el=document.createElement('button');el.type='button';el.className='story-objective '+(kind==='clue'?'is-clue':'');el.dataset.storyMarker=q.id;el.style.cssText=`left:${at.x-74}px;top:${at.y-90}px;z-index:${Math.round(at.y+1)}`;el.innerHTML=`<i aria-hidden="true">${kind==='clue'?'?':'!'}</i><span>${E(label)}</span>`;el.setAttribute('aria-label',label+'，点击前往');el.onclick=e=>{e.stopPropagation();seek(q.id,kind);};g.world.append(el);markers.push({id:'story-objective-'+q.id,at,x:at.x,y:at.y-75,range:55,label,run:()=>seek(q.id,kind)});});
 }
 function shelf(host){identify();const markup=()=>`<p>完成观测任务，收集与流体力学、OpenFOAM 有关的田野手记。已获得 ${completed().length} / ${D.quests.length} 份。</p><p data-story-error role="status"></p><div class="story-notes">${D.quests.map(q=>`<button type="button" data-story-quest="${q.id}" class="${done(q)?'':'is-locked'}">${icon(q.scene)}<strong>${E(q.note[0])}</strong><small>${done(q)?E(q.note[1]):'完成「'+E(q.title)+'」后获得'}</small></button>`).join('')}</div><h3>观测成就</h3><div class="story-achievements">${D.achievements.map(a=>{const n=a.need.filter(id=>done(D.quests.find(q=>q.id===id))).length+(a.visits||[]).filter(id=>state.visited.includes(id)).length,total=a.need.length+(a.visits||[]).length,award=state.awards.find(r=>r.id==='achievement:'+a.id);return`<div class="${award?'is-earned':''}"><b>${award?'◆':'◇'} ${E(a.name)}</b><small>${n} / ${total} 项${a.visits?'到访记录':'任务'} · ${a.reward.bamboo} 竹笋 · ${a.reward.xp} 经验</small><small>${a.need.map(title).concat((a.visits||[]).map(id=>W.scene(id).name)).map(E).join('、')}</small>${award?`<small>获得于 ${new Date(award.at).toLocaleDateString('zh-CN')}</small>`:''}</div>`;}).join('')}</div><h3>奖励记录</h3><p>累计获得 ${state.awards.reduce((n,a)=>n+a.bamboo,0)} 根竹笋、${state.awards.reduce((n,a)=>n+a.xp,0)} 点经验。竹笋可以在小镇商店使用，经验计入熊猫等级。</p><ul class="story-award-log">${state.awards.slice(-10).reverse().map(a=>`<li>${E(a.kind==='quest'?title(a.id.slice(6)):D.achievements.find(x=>'achievement:'+x.id===a.id)?.name||a.id)}<small>+${a.bamboo} 竹笋 · +${a.xp} 经验 · ${new Date(a.at).toLocaleDateString('zh-CN')}</small></li>`).join('')||'<li>完成任务或达成成就后，会在这里留下记录。</li>'}</ul>`;
  if(!host){open('田野手记与观测成就',markup());host=document.querySelector('.story-book');}else host.innerHTML=markup();if(owner&&!game?.config.guest&&!loaded)refresh().then(()=>{if(host.isConnected)host.innerHTML=markup();}).catch(e=>{if(host.isConnected)error(host,e);});
 }
 function tracker(){if(!game)return;const badge=game.viewport.closest('.town-game-shell').querySelector('.story-badge');if(badge){const n=rewardable().length;badge.hidden=!n;badge.textContent=n;}const el=game.viewport.closest('.town-game-shell').querySelector('[data-story-tracker]');if(!el)return;if(owner&&!atHome()){el.textContent='串门中 · 返回自己的小镇继续故事';el.onclick=()=>{location.hash=context().home||'map';};return;}const next=D.quests.find(q=>q.id===tracked&&active(q))||D.quests.find(q=>q.kind==='main'&&active(q))||D.quests.find(q=>q.kind==='main'&&!done(q)&&unlocked(q));el.textContent=next?(next.kind==='main'?'主线':'支线')+' · '+next.title+' · '+status(next):'观测站已重启 · 查看支线';el.onclick=()=>next?task(next.id):journal('side');}
 function mount(g){game=g;ui=g.config.story;if(!ui)return;identify();const captured=g;
  W.portals(g,travel);if(entryFrom){const at=W.entrance(g,entryFrom);Object.assign(g.me,at);Object.assign(g.position,at);g.camera.ready=false;entryFrom=null;}const people=[...new Set([...(g.config.scene?.people||['heng']),...D.quests.filter(q=>q.scene===current()).map(q=>q.npc),...D.quests.flatMap(q=>q.consultations.filter(c=>c.scene===current()).map(c=>c.npc))])];people.forEach((id,i)=>{const custom=!!g.config.scene,plot=g.positions[i%g.positions.length];g.addNPC({id:'story-'+id,name:D.npcs[id].name,x:custom?plot.x+225+Math.floor(i/g.positions.length)*110:800+i*110,y:custom?plot.y+302+Math.floor(i/g.positions.length)*45:1190,radius:0,stationary:true,speed:0,talk:()=>npc(id)});});
  g.extras.push({spots:()=>game===g?markers:[],minimap:()=>game===g?markers.map(m=>`<circle cx="${m.at.x}" cy="${m.at.y}" r="24" fill="#ffe292" stroke="#735425" stroke-width="9"/>`).join(''):''});
  const foot=g.viewport.closest('.town-game-shell').querySelector('.town-quest-foot');if(foot){const b=document.createElement('button');b.type='button';b.dataset.storyTracker='';foot.prepend(b);tracker();}
const journalButton=g.viewport.closest('.town-game-shell').querySelector('[data-town=story]');if(journalButton){const badge=document.createElement('b');badge.className='story-badge';badge.hidden=true;journalButton.append(badge);tracker();}
  drawMarkers();g.listen('destroy',()=>{window.FoamTownDialogue.close();if(game===g){game=null;markers=[];view++;}});
  if(owner&&!g.config.guest)api(atHome()?'visit':'state',{scene:current()}).then(()=>{if(game===captured){tracker();if(pending){const next=pending;pending=null;setTimeout(()=>{if(game===captured)seek(next.id,next.kind);},500);}}}).catch(()=>{if(game===captured){const b=g.viewport.closest('.town-game-shell').querySelector('[data-story-tracker]');if(b){b.textContent='任务暂未同步 · 点击重试';b.onclick=()=>api('visit',{scene:current()}).then(()=>journal()).catch(e=>{journal();error(document.querySelector('.story-book'),e);});}}});
 }
 let pending=null;
 document.addEventListener('click',e=>{const b=e.target.closest('[data-story-journal],[data-story-filter],[data-story-quest],[data-story-review],[data-story-shelf],[data-story-go],[data-story-travel-task],[data-story-npc-task],[data-story-accept],[data-story-report],[data-story-npc-go],[data-story-objective],[data-story-discover-go],[data-story-consult-go],[data-story-conversation],[data-story-claim]');if(!b||!ui)return;
  if(b.dataset.storyClaim){mutate('claim',{reward:b.dataset.storyClaim},()=>journal('rewards',true));}
  else if(b.dataset.storyConsultGo)seek(b.dataset.storyConsultGo,'consult');
  else if(b.dataset.storyConversation)conversation(b.dataset.storyConversation);
  else if(b.dataset.storyAccept){const q=D.quests.find(q=>q.id===b.dataset.storyAccept);mutate('accept',{quest:q.id,npc:q.npc},()=>task(q.id));}
  else if(b.dataset.storyReport){const q=D.quests.find(q=>q.id===b.dataset.storyReport);mutate('report',{quest:q.id,npc:q.npc},()=>task(q.id));}
  else if(b.dataset.storyNpcTask){const q=D.quests.find(q=>q.id===b.dataset.storyNpcTask);if(active(q)&&stage(q)===q.steps.length)mutate('arrive',{quest:q.id,step:stage(q),station:'npc-'+q.npc},()=>task(q.id,undefined,'npc'));else task(q.id,undefined,'npc');}
  else if(b.dataset.storyNpcGo)seek(b.dataset.storyNpcGo,'npc');
  else if(b.dataset.storyObjective)seek(b.dataset.storyObjective,'objective');
  else if(b.dataset.storyDiscoverGo)seek(b.dataset.storyDiscoverGo,'clue');
  else if(b.hasAttribute('data-story-journal'))journal();else if(b.dataset.storyFilter)journal(b.dataset.storyFilter);else if(b.dataset.storyQuest)task(b.dataset.storyQuest);else if(b.dataset.storyReview)task(b.dataset.storyReview,+b.dataset.step);else if(b.hasAttribute('data-story-shelf'))shelf();else if(b.dataset.storyGo)travel(b.dataset.storyGo);else if(b.dataset.storyTravelTask){const q=D.quests.find(q=>q.id===b.dataset.storyTravelTask);pending=q.id;travel(q.scene);}
 });
 const oldSprite=window.FoamTownNPCSprite;window.FoamTownNPCSprite=id=>id.startsWith('story-')?window.FoamTownLook({...D.npcs[id.slice(6)],ride:'walk'}).background:oldSprite(id);
 window.addEventListener('foamlab:town-game',e=>mount(e.detail));window.addEventListener('foam-auth-change',identify);
 window.FoamTownStory={journal,worldMap,task,npc,shelf,refresh,travel,illustration,get count(){identify();return completed().length;},get state(){identify();return state;}};
})();
