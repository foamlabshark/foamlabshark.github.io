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
 const status=q=>done(q)?'已完成':!unlocked(q)?'等待前面的故事':active(q)?stage(q)===q.steps.length?'待汇报':'进行中 · '+stage(q)+' / '+q.steps.length+' 步':!found(q)?'待发现线索':'可接取';
 const unlocked=q=>q.needs.every(id=>done(D.quests.find(q=>q.id===id)));
 const title=id=>D.quests.find(q=>q.id===id)?.title||id;
 const completed=()=>D.quests.filter(done);
 const icon=id=>`<span class="story-seal" aria-hidden="true">${({forest:'水',valley:'风',wetland:'澜',summit:'星',village:'记'})[id]}</span>`;
 function identify(){if(owner!==uid()){owner=uid();state=empty();tracked='';loaded=false;request=null;epoch++;}}
 async function api(operation,payload={}){identify();if(operation!=='state'&&!atHome())throw Error('请回到自己的小镇继续任务，串门时不会推进剧情。');const rev=epoch,id=owner;const data=await window.FoamTownNet.rpc('foamlab_town_story',{operation,payload:{...payload,province:context().province}});if(rev!==epoch||id!==uid())throw Error('账号已变化，请重新打开任务。');state={...empty(),...data};loaded=true;tracker();drawMarkers();if(data.earned_now?.length){window.FoamTownProgress?.refresh().catch(()=>{});window.dispatchEvent(new Event('foamlab:town-story-reward'));const names=data.earned_now.filter(id=>id.startsWith('achievement:')).map(id=>D.achievements.find(a=>'achievement:'+a.id===id)?.name).filter(Boolean);if(names.length)window.foamNotify?.('达成成就：'+names.join('、')+'。奖励已到账。');}return data;}
 async function refresh(){identify();if(!owner||game?.config.guest)return;if(!request){const rev=epoch;request=api('state').finally(()=>{if(rev===epoch)request=null;});}return request;}
 function open(h,body){view++;ui.dialog(h,`<div class="story-book">${body}</div>`);document.querySelector('#town-dialog').classList.add('is-story');}
 function error(host,e){const p=host.querySelector('[data-story-feedback]')||host.querySelector('[data-story-error]');if(p){p.textContent=e.message||String(e);p.classList.add('is-error');}else{const p=document.createElement('p');p.setAttribute('role','alert');p.className='story-error';p.textContent=e.message||String(e);host.prepend(p);}}
 function travel(id){if(!W.scene(id)||!game)return;entryFrom=current();ui.close();ui.travel(id);}
 function worldMap(){open('观测站地图',`<p>沿路牌可往返相邻场景，也可以在这里选择目的地。每处站点都有独立的观测任务。</p><div class="story-world-map">${D.scenes.map(s=>`<button type="button" data-story-go="${s.id}" ${s.id===current()?'aria-current="location"':''}>${icon(s.id)}<strong>${E(s.name)}</strong><span>${E(s.subtitle)}</span><small>${s.id===current()?'当前位置':state.visited.includes(s.id)?'已到访':'前往探索'}</small></button>`).join('')}</div><p class="story-connections">广场 ⇄ 溪竹林 ⇄ 潮汐湿地 ⇄ 星流高地 ⇄ 回声峡谷 ⇄ 广场</p>`);}
 function journal(filter='main',synced=false){
  identify();const list=D.quests.filter(q=>filter==='all'||q.kind===filter);open('流动观测站 · 任务手记',`<header class="story-intro"><div>${icon('village')}<h3>一起把观测站重新开起来</h3><p>暴雨打乱了小镇的观测记录。和居民一起查流量、修边界、看水面，再把调查结果带回广场。主线一次接取一条，支线可以同时进行。</p></div><b>${completed().length} / ${D.quests.length}<small>已完成任务</small></b></header><nav class="story-tabs" aria-label="任务分类">${[['main','主线故事'],['side','支线委托'],['all','全部任务']].map(([id,t])=>`<button type="button" data-story-filter="${id}" aria-selected="${filter===id}">${t}</button>`).join('')}<button type="button" data-story-shelf>手记与成就</button></nav>${!owner||game?.config.guest?'<p class="story-account">访客可阅读故事和探索场景。登录并入住后，任务进度会保存到账号。</p>':''}<p data-story-error role="status"></p><div class="story-quest-list">${list.map(q=>`<button type="button" data-story-quest="${q.id}" class="story-quest ${done(q)?'is-done':''}">${icon(q.scene)}<span><small>${W.scene(q.scene).name} · ${D.npcs[q.npc].name}</small><strong>${E(q.title)}</strong><span>${status(q)}</span></span><b aria-hidden="true">${done(q)?'✓':'›'}</b></button>`).join('')}</div>`);
  const rev=view,host=document.querySelector('.story-book');if(owner&&!game?.config.guest&&!synced)refresh().then(()=>{if(rev===view&&host.isConnected)journal(filter,true);}).catch(e=>{if(host.isConnected)error(host,e);});
 }
 function task(id,reviewStep,mode=''){const q=D.quests.find(q=>q.id===id);if(!q)return;const complete=done(q),progress=stage(q);tracked=id;tracker();drawMarkers();
  if(!unlocked(q)){open(q.title,`<p>${E(q.intro).replace(/\n\n/g,'</p><p class="story-dialogue">')}</p><p>这段故事接在下面的任务之后：</p>${q.needs.map(id=>`<button type="button" data-story-quest="${id}">${E(title(id))}${done(D.quests.find(q=>q.id===id))?' ✓':''}</button>`).join('')}`);return;}
  if(!complete&&!atHome()){open(q.title,`<p class="story-dialogue">${E(q.intro).replace(/\n\n/g,'</p><p class="story-dialogue">')}</p><p>这份委托在你自己的小镇开展，串门时可以游览场景。</p>${context().home?'<button type="button" data-town="home">回到我的小镇</button>':'<p>登录并入住后，即可接取任务。</p>'}`);return;}
  if(complete&&reviewStep===undefined){open(q.title,`<p class="story-done">✓ 任务完成 · ${q.reward.bamboo} 根竹笋 · ${q.reward.xp} 点经验 · 获得「${E(q.note[0])}」</p><p>${E(q.ending)}</p><div class="story-note">${icon(q.scene)}<div><h3>${E(q.note[0])}</h3><p>${E(q.note[1])}</p></div></div><a class="town-link" href="/read/?slug=${encodeURIComponent(q.lesson)}" target="_blank" rel="noopener">继续学习：查看课程与配套算例 ↗</a><h3>回看这次调查</h3>${q.steps.map((s,i)=>`<button type="button" data-story-review="${q.id}" data-step="${i}">${String(i+1).padStart(2,'0')} · ${E(s.title)}</button>`).join('')}<div class="story-actions"><button type="button" data-story-journal>回到任务手记</button><button type="button" data-story-shelf>查看收藏与成就</button></div>`);return;}
  if(!complete&&mode!=='station'){
   const atNPC=mode==='npc',ready=progress===q.steps.length,otherMain=D.quests.find(t=>t.kind==='main'&&active(t)&&t.id!==id);
   let action='';
   if(!owner||game?.config.guest)action='<p class="story-account">登录并入住后，可以接取任务并保存每一步的进度。</p>';
   else if(!found(q))action=`<p>${E(q.trigger.hint)}</p><button type="button" data-story-discover-go="${id}">寻找线索</button>`;
   else if(!active(q)&&q.kind==='main'&&otherMain)action=`<p>正在进行主线「${E(otherMain.title)}」。完成并汇报后，即可接取下一条。</p><button type="button" data-story-quest="${otherMain.id}">查看当前主线</button>`;
   else if(!active(q))action=atNPC?`<button type="button" class="story-primary" data-story-accept="${id}">接取${q.kind==='main'?'主线':'支线'}任务</button>`:`<button type="button" class="story-primary" data-story-npc-go="${id}">找${E(D.npcs[q.npc].name)}接取任务</button>`;
   else if(ready&&atNPC)action=`<button type="button" class="story-primary" data-story-report="${id}">汇报调查结果，领取奖励</button>`;
   else if(waiting(q))action=`<p>${E(D.npcs[waiting(q).npc].name)}在${E(W.scene(waiting(q).scene).name)}留有与你这一步有关的记录。</p><button type="button" class="story-primary" data-story-consult-go="${id}">拜访${E(D.npcs[waiting(q).npc].name)}，核对线索</button>`;
   else action=`<button type="button" class="story-primary" data-story-objective="${id}">${ready?'返回'+E(D.npcs[q.npc].name)+'身边汇报':'前往'+E(q.steps[progress].place)}</button>`;
   open(q.title,`<div class="story-speaker">${portrait(q.npc)}<span>${E(D.npcs[q.npc].name)}<small>${q.kind==='main'?'主线故事':'支线委托'} · ${status(q)}</small></span></div><p class="story-dialogue">${E(q.intro).replace(/\n\n/g,'</p><p class="story-dialogue">')}</p><ol class="story-phases"><li class="${active(q)?'is-finished':''}">与委托人交谈并接取任务</li>${q.steps.map((s,i)=>`${q.consultations.filter(c=>c.step===i).map(c=>`<li class="${progress>i||state.consulted[id]>=i?'is-finished':active(q)&&progress===i?'is-current':''}">拜访${E(D.npcs[c.npc].name)}<small>${E(W.scene(c.scene).name)} · 询问经历、核对观测线索</small></li>`).join('')}<li class="${progress>i?'is-finished':active(q)&&progress===i?'is-current':''}"><strong>${E(s.title)}</strong><small>${E(s.place)}</small></li>`).join('')}<li class="${active(q)&&ready?'is-current':''}">返回委托人身边汇报</li></ol><p class="story-reward">完成奖励：${q.reward.bamboo} 根竹笋 · ${q.reward.xp} 点经验 · ${E(q.note[0])}</p><p data-story-error role="status"></p><div class="story-actions">${action}<button type="button" data-story-journal>任务手记</button></div>`);return;
  }
  const at=reviewStep??progress,s=q.steps[at];if(!s)return;
  open(q.title,`<div class="story-speaker">${portrait(q.npc)}<span>${E(D.npcs[q.npc].name)}<small>${E(W.scene(q.scene).name)} · ${q.kind==='main'?'主线':'支线'}</small></span><b>${at+1} / ${q.steps.length}</b></div>${at===0?`<p class="story-dialogue">${E(q.intro).replace(/\n\n/g,'</p><p class="story-dialogue">')}</p>`:''}<h3 tabindex="-1">${E(s.title)}</h3><p>${E(s.text)}</p>${s.code?`<pre><code>${E(s.code)}</code></pre>`:''}<h4>${E(s.question)}</h4>${s.game?'<div data-story-game></div>':`<div class="story-options">${s.options.map((o,i)=>`<button type="button" data-story-answer="${i}"><b>${i+1}</b>${E(o)}</button>`).join('')}</div>`}<div data-story-feedback role="status"></div><div class="story-actions"><button type="button" data-story-journal>返回任务手记</button><a href="/read/?slug=${encodeURIComponent(q.lesson)}" target="_blank" rel="noopener">查看对应课程 ↗</a></div>`);
  const host=document.querySelector('.story-book'),rev=view;let busy=false;
  const submit=async(answer,extra={})=>{if(busy)return;if(!uid()||game?.config.guest){error(host,Error('登录并入住后即可提交练习，进度会保存到账号。'));return;}if(complete){const feedback=host.querySelector('[data-story-feedback]');feedback.className='story-feedback';feedback.textContent=s.explanation;return;}
   busy=true;host.querySelectorAll('[data-story-answer],[data-match-check],[data-paint-done]').forEach(b=>b.disabled=true);const feedback=host.querySelector('[data-story-feedback]');feedback.className='';feedback.textContent='正在核对并保存…';
   try{const result=await api('answer',{quest:id,step:at,answer,...extra});if(rev!==view||!host.isConnected)return;if(!result.accepted){feedback.className='story-feedback is-retry';feedback.innerHTML='<strong>再试一次</strong><p>'+E(s.explanation)+'</p>';return;}feedback.className='story-feedback is-correct';feedback.innerHTML='<strong>已保存</strong><p>'+E(s.explanation)+'</p><button type="button" class="story-primary" data-story-next>'+((state.progress[id]||0)>=q.steps.length?'返回委托人身边汇报':'查看下一个调查地点')+'</button>';host.querySelector('[data-story-next]').onclick=()=>task(id);host.querySelector('[data-story-next]').focus({preventScroll:true});}
   catch(e){if(host.isConnected)error(host,e);}finally{busy=false;if((state.progress[id]||0)===at&&view===rev)host.querySelectorAll('[data-story-answer],[data-match-check],[data-paint-done]').forEach(b=>b.disabled=false);}
  };
  host.querySelectorAll('[data-story-answer]').forEach(b=>b.onclick=()=>submit(+b.dataset.storyAnswer));if(s.game)window.FoamTownStoryGames[s.game](host.querySelector('[data-story-game]'),submit);
  if(complete){host.querySelector('[data-story-feedback]').innerHTML='<p>'+E(s.explanation)+'</p>';host.querySelectorAll('[data-story-answer]').forEach(b=>b.disabled=true);}
 }
 function portrait(id){const npc=D.npcs[id],bg=window.FoamTownLook?.({...npc,ride:'walk'}).background;return `<i class="town-npc-portrait" style="background-image:${bg}" aria-hidden="true"></i>`;}
 async function npc(id){
  const p=D.npcs[id];if(!p)return;const scene=current(),captured=game;
  const quests=D.quests.filter(q=>q.npc===id&&q.scene===scene);
  open(p.name,`<p>正在翻看${E(p.name)}的观测记录…</p><p data-story-error role="status"></p>`);
  const rev=view,host=document.querySelector('.story-book');
  try{if(atHome()){for(const q of quests.filter(q=>q.kind==='side'&&q.trigger.kind==='talk'&&unlocked(q)&&!found(q)))await api('discover',{quest:q.id,trigger:'talk',npc:id});}
   if(captured!==game||rev!==view)return;
   open(p.name,`<div class="story-speaker">${portrait(id)}<div><h3>${E(p.name)}</h3><p>${E(W.scene(scene).subtitle)}</p></div></div><details class="story-personal"><summary>${E(p.personal_question)}</summary><p>${E(p.about)}</p></details><p>${atHome()?'你可以聊聊近况，也可以继续手头的调查。':'欢迎来串门。回到自己的小镇后，可以继续与居民有关的调查。'}</p><div class="story-quest-list">${atHome()?D.quests.filter(q=>active(q)&&waiting(q)?.npc===id&&waiting(q)?.scene===scene).map(q=>`<button type="button" data-story-conversation="${q.id}"><span><strong>继续调查：${E(q.title)}</strong><small>带着问题来，听听${E(p.name)}的经历与建议</small></span><b>›</b></button>`).join(''):''}${quests.map(q=>`<button type="button" data-story-npc-task="${q.id}"><span><strong>${E(q.title)}</strong><small>${q.kind==='main'?'主线':'支线'} · ${status(q)}</small></span><b>›</b></button>`).join('')}</div>`);
  }catch(e){if(host.isConnected)error(host,e);}
 }
 function conversation(id){const q=D.quests.find(q=>q.id===id),c=q&&waiting(q);if(!q||!c||!atHome())return;
  if(current()!==c.scene){seek(id,'consult');return;}
  open(D.npcs[c.npc].name+' · '+q.title,`<div class="story-speaker">${portrait(c.npc)}<span>${E(D.npcs[c.npc].name)}<small>${E(W.scene(c.scene).name)} · 调查第 ${c.step+1} 步的线索</small></span></div><p class="story-dialogue">${E(c.story)}</p><div data-story-talk-evidence></div><p data-story-error role="status"></p><div class="story-actions"><button type="button" data-story-ask>请帮我核对这一步的设置与记录</button><button type="button" data-story-journal>稍后再来</button></div>`);
  const host=document.querySelector('.story-book');host.querySelector('[data-story-ask]').onclick=e=>{e.currentTarget.remove();host.querySelector('[data-story-talk-evidence]').innerHTML=`<p>${E(c.evidence)}</p><p class="story-dialogue">你：${E(c.reply)}</p><button type="button" class="story-primary" data-story-take-note>记下线索，继续调查</button>`;host.querySelector('[data-story-take-note]').onclick=()=>mutate('consult',{quest:id,npc:c.npc,scene:c.scene},()=>task(id));};
 }
 function point(q,kind){
  if(kind==='consult'){const m=game.npcs.get('story-'+waiting(q)?.npc);return m?game.free(m.x,m.y+28):game.free(800,1190);}
  if(kind==='npc'||stage(q)===q.steps.length&&kind==='objective'){const m=game.npcs.get('story-'+q.npc);return m?game.free(m.x,m.y+28):game.free(800,1190);}
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
 function seek(id,kind){const q=D.quests.find(q=>q.id===id);if(!q||!game||!atHome())return;tracked=id;const destination=kind==='consult'?waiting(q)?.scene:q.scene;if(!destination)return;
  if(current()!==destination){pending=id;travel(destination);return;}
  if(kind==='clue'&&q.trigger.kind!=='inspect')kind='npc';
  const g=game,at=point(q,kind),step=stage(q);ui.close();drawMarkers();
  const arrived=async()=>{if(game!==g||current()!==destination)return;
   try{
    if(kind==='consult'){conversation(id);return;}
    if(kind==='clue'){if(owner&&!g.config.guest)await api('discover',{quest:id,trigger:'inspect'});task(id);return;}
    if(kind==='npc'){if(active(q)&&step===q.steps.length)await api('arrive',{quest:id,step,station:'npc-'+q.npc});await npc(q.npc);return;}
    await api('arrive',{quest:id,step,station:step===q.steps.length?'npc-'+q.npc:q.scene+'-step-'+step});
    task(id,undefined,step===q.steps.length?'npc':'station');
   }catch(e){task(id);error(document.querySelector('.story-book'),e);}
  };
  if(g.config.guest||g.config.direct?.()||Math.hypot(g.me.x-at.x,g.me.y-at.y)<55)arrived();else {g.walkTo(at.x,at.y,arrived);g.emit('hint','正在前往'+(kind==='consult'?D.npcs[waiting(q).npc].name:kind==='clue'?q.trigger.label:kind==='npc'||step===q.steps.length?D.npcs[q.npc].name:q.steps[step].place));}
 }
 function drawMarkers(){if(!game)return;const g=game;g.world.querySelectorAll('.story-objective').forEach(n=>n.remove());markers=[];if(!atHome())return;
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
 function tracker(){if(!game)return;const el=game.viewport.closest('.town-game-shell').querySelector('[data-story-tracker]');if(!el)return;if(owner&&!atHome()){el.textContent='串门中 · 返回自己的小镇继续故事';el.onclick=()=>{location.hash=context().home||'map';};return;}const next=D.quests.find(q=>q.id===tracked&&active(q))||D.quests.find(q=>q.kind==='main'&&active(q))||D.quests.find(q=>q.kind==='main'&&!done(q)&&unlocked(q));el.textContent=next?(next.kind==='main'?'主线':'支线')+' · '+next.title+' · '+status(next):'观测站已重启 · 查看支线';el.onclick=()=>next?task(next.id):journal('side');}
 function mount(g){game=g;ui=g.config.story;if(!ui)return;identify();const captured=g;
  W.portals(g,travel);if(entryFrom){const at=W.entrance(g,entryFrom);Object.assign(g.me,at);Object.assign(g.position,at);g.camera.ready=false;entryFrom=null;}const people=[...new Set([...(g.config.scene?.people||['heng']),...D.quests.filter(q=>q.scene===current()).map(q=>q.npc),...D.quests.flatMap(q=>q.consultations.filter(c=>c.scene===current()).map(c=>c.npc))])];people.forEach((id,i)=>{const custom=!!g.config.scene,plot=g.positions[i%g.positions.length];g.addNPC({id:'story-'+id,name:D.npcs[id].name,x:custom?plot.x+90+Math.floor(i/g.positions.length)*110:800+i*110,y:custom?plot.y+270+Math.floor(i/g.positions.length)*45:1190,radius:35,speed:35,talk:()=>npc(id)});});
  g.extras.push({spots:()=>game===g?markers:[],minimap:()=>game===g?markers.map(m=>`<circle cx="${m.at.x}" cy="${m.at.y}" r="24" fill="#ffe292" stroke="#735425" stroke-width="9"/>`).join(''):''});
  const foot=g.viewport.closest('.town-game-shell').querySelector('.town-quest-foot');if(foot){const b=document.createElement('button');b.type='button';b.dataset.storyTracker='';foot.prepend(b);tracker();}
  drawMarkers();g.listen('destroy',()=>{if(game===g){game=null;markers=[];view++;}});
  if(owner&&!g.config.guest)api(atHome()?'visit':'state',{scene:current()}).then(()=>{if(game===captured){tracker();if(pending){const id=pending;pending=null;setTimeout(()=>{if(game===captured)task(id);},80);}}}).catch(()=>{if(game===captured){const b=g.viewport.closest('.town-game-shell').querySelector('[data-story-tracker]');if(b){b.textContent='任务暂未同步 · 点击重试';b.onclick=()=>api('visit',{scene:current()}).then(()=>journal()).catch(e=>{journal();error(document.querySelector('.story-book'),e);});}}});
 }
 let pending=null;
 document.addEventListener('click',e=>{const b=e.target.closest('[data-story-journal],[data-story-filter],[data-story-quest],[data-story-review],[data-story-shelf],[data-story-go],[data-story-travel-task],[data-story-npc-task],[data-story-accept],[data-story-report],[data-story-npc-go],[data-story-objective],[data-story-discover-go],[data-story-consult-go],[data-story-conversation]');if(!b||!ui)return;
  if(b.dataset.storyConsultGo)seek(b.dataset.storyConsultGo,'consult');
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
 window.FoamTownStory={journal,worldMap,task,npc,shelf,refresh,travel,get count(){identify();return completed().length;},get state(){identify();return state;}};
})();
