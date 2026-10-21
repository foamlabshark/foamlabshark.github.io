'use strict';
(() => {
 const N={rpc:(...args)=>window.FoamTownNet.rpc(...args)};
 const emoji=['😊','🐼','👋','👍','🎋','❤️','🎉','🤔','😂','🙌','☕','✨','💪','🙏','🎆','🌙'];
 const drafts=new Map(),pending=new Map();
 let root,panel,ctx,identity,scope='world',room='world',revision=0,request=0,channel,timer,populationTimer;
 let messages=new Map(),unread=0,collapsed=true,connected=false,loading=false,sending=false,refreshing=null,reconnectTimer,followLatest=true;
 const $=s=>panel.querySelector(s),me=()=>window.foamAuth?.user?.id||null;
 const label=id=>ctx?.provinces.find(p=>p.id===id)?.name||'未入住';
 const fullTime=new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
 function status(text){$('[data-chat-status]').textContent=text;}
 function badge(){for(const b of root.querySelectorAll('[data-chat-unread]')){b.textContent=unread?String(Math.min(99,unread))+(unread>99?'+':''):'';b.hidden=!unread;}}
 function bottom(){const log=$('[data-chat-log]');followLatest=true;log.scrollTop=log.scrollHeight;unread=0;badge();$('[data-chat-latest]').hidden=true;}
 function nearBottom(){const log=$('[data-chat-log]');return log.scrollHeight-log.scrollTop-log.clientHeight<40;}
 function updateForm(){const input=$('textarea'),count=Array.from(input.value).length;
  $('[data-chat-count]').textContent=count+'/500';
  $('[data-chat-send]').disabled=!me()||sending||!input.value.trim()||count>500;
  input.disabled=!me();$('[data-chat-emoji-toggle]').disabled=!me();
  $('[data-chat-login]').hidden=!!me();
  $('[data-chat-login]').href='/account/?next='+encodeURIComponent('/town/'+location.hash);
  input.placeholder=me()?(room==='world'?'和所有小镇的朋友聊聊…':'和'+label(room)+'的朋友聊聊…'):'登录后就可以和大家聊天';
 }
 function makeMessage(m){const item=document.createElement('article');item.className='town-chat-message';item.dataset.messageId=m.id;item.classList.toggle('is-self',m.author_id===me());
  const head=document.createElement('header'),name=document.createElement('b'),level=document.createElement('span'),origin=document.createElement('span'),time=document.createElement('time'),body=document.createElement('p');
  name.textContent=m.display_name||'熊猫邻居';level.className='town-chat-level';level.textContent='Lv.'+(Number(m.level)||1);
  origin.className='town-chat-origin';origin.textContent=label(m.province);origin.title='归属地：'+label(m.province);
  const date=new Date(m.created_at);time.dateTime=m.created_at;time.textContent=Number.isNaN(date.valueOf())?'':fullTime.format(date);time.title=date.toLocaleString('zh-CN');
  body.textContent=m.body;head.append(name,level,origin);item.append(head,time,body);return item;
 }
 function merge(rows,initial=false){if(!Array.isArray(rows))return;const log=$('[data-chat-log]'),atBottom=nearBottom(),oldHeight=log.scrollHeight,oldTop=log.scrollTop;
  let added=0;for(const m of rows){if(m.channel!==room||!m.id||typeof m.body!=='string')continue;if(!messages.has(String(m.id)))added++;messages.set(String(m.id),m);}
  const ordered=[...messages.values()].sort((a,b)=>Number(a.id)-Number(b.id)).slice(-160);messages=new Map(ordered.map(m=>[String(m.id),m]));
  // Only touch changed rows: receiving a message must not rebuild the game,
  // replace the text input or pull the reader away from older messages.
  const existing=new Map([...log.querySelectorAll('[data-message-id]')].map(n=>[n.dataset.messageId,n]));
  log.querySelector('.town-chat-empty')?.remove();let previous=null;for(const m of ordered){const node=existing.get(String(m.id))||makeMessage(m),position=previous?previous.nextSibling:log.firstChild;if(node!==position)log.insertBefore(node,position);previous=node;existing.delete(String(m.id));}existing.forEach(n=>n.remove());
  if(!ordered.length){const empty=document.createElement('p');empty.className='town-chat-empty';empty.textContent=room==='world'?'还没有消息，来和大家打个招呼吧。':'这里还没有消息，来和邻居打个招呼吧。';log.append(empty);}
  if(initial||atBottom&&!collapsed)bottom();else {log.scrollTop=Math.max(0,oldTop+Math.min(0,log.scrollHeight-oldHeight));if(added){unread+=added;badge();$('[data-chat-latest]').hidden=collapsed;}}
 }
 async function refresh(initial=false){const rev=revision;if(refreshing===rev)return;refreshing=rev;const req=++request,target=room;try{const rows=await N.rpc('foamlab_town_chat_history',{channel:target});if(rev!==revision||req!==request)return;merge(rows,initial||loading);loading=false;$('[data-chat-retry]').hidden=true;status(connected?'消息实时更新':'正在恢复实时连接，消息自动更新');}catch(error){if(rev===revision&&req===request){loading=false;status('消息暂时无法更新，点击重试。');$('[data-chat-retry]').hidden=false;}}finally{if(refreshing===rev)refreshing=null;}}
 function stop(){revision++;request++;clearInterval(timer);clearTimeout(reconnectTimer);timer=null;connected=false;if(channel){window.foamAuth?.client?.removeChannel(channel).catch(()=>{});channel=null;}}
 function listen(){stop();if(document.hidden||!ctx)return;const rev=revision;loading=true;status('正在读取消息…');$('[data-chat-retry]').hidden=true;
  const client=window.foamAuth?.client;if(client){channel=client.channel('town-chat:'+room+':'+rev,{config:{postgres_changes_options:{wait:true}}})
   .on('postgres_changes',{event:'INSERT',schema:'public',table:'foamlab_town_chat_messages',filter:'channel=eq.'+room},event=>{if(rev===revision)merge([event.new]);})
   .on('system',{},event=>{if(rev!==revision||event.extension!=='postgres_changes')return;if(event.status==='error'){connected=false;status('正在恢复实时连接，消息自动更新');}else if(event.status==='ok'){connected=true;status('消息实时更新');void refresh();}})
   .subscribe(state=>{if(rev!==revision)return;connected=state==='SUBSCRIBED';if(connected){clearTimeout(reconnectTimer);status('消息实时更新');void refresh();}else if(state==='CHANNEL_ERROR'||state==='TIMED_OUT'||state==='CLOSED'){status('正在恢复实时连接，消息自动更新');if(state==='CLOSED'){clearTimeout(reconnectTimer);reconnectTimer=setTimeout(()=>{if(rev===revision&&!document.hidden)listen();},3000);}}});}
  // Push delivers new messages immediately. Only a disconnected channel uses
  // short catch-up reads; slow requests never pile up or cancel one another.
  void refresh(true);timer=setInterval(()=>{if(!document.hidden&&!connected&&navigator.onLine)void refresh();},2000);
 }
 function select(next){drafts.set(room,$('textarea').value);scope=next;const target=scope==='town'&&ctx.province?ctx.province:'world';
  const changed=target!==room;room=target;for(const b of panel.querySelectorAll('[data-chat-tab]')){b.setAttribute('aria-selected',String(b.dataset.chatTab===scope));b.tabIndex=b.dataset.chatTab===scope?0:-1;}
  $('[data-chat-log]').setAttribute('aria-label',room==='world'?'世界聊天消息':label(room)+'聊天消息');
  if(changed){messages.clear();$('[data-chat-log]').replaceChildren();unread=0;badge();$('textarea').value=drafts.get(room)||'';listen();}
  $('[data-chat-title]').textContent=room==='world'?'世界聊天':label(room)+'聊天';$('[data-chat-emojis]').hidden=true;$('[data-chat-emoji-toggle]').setAttribute('aria-expanded','false');updateForm();
 }
 async function send(){const input=$('textarea'),body=input.value.trim(),target=room,who=me();
  if(!who||sending||!body||Array.from(body).length>500)return;
  const key=target+'\n'+body;let nonce=pending.get(key);if(!nonce){nonce=crypto.randomUUID();pending.set(key,nonce);}
  sending=true;updateForm();status('正在发送…');
  try{const message=await N.rpc('foamlab_town_chat_send',{channel:target,body,client_id:nonce});if(who!==me())return;
   pending.delete(key);if(drafts.get(target)?.trim()===body)drafts.delete(target);
   if(target===room){merge([message]);if(input.value.trim()===body){input.value='';drafts.delete(target);}bottom();status('已发送');}
  }catch(error){if(who===me()&&target===room)status(error.message||'发送未成功，请重试。');}
  finally{sending=false;if(panel&&who===me())updateForm();}
 }
 function toggle(force){collapsed=typeof force==='boolean'?force:!collapsed;root.classList.toggle('town-chat-open',!collapsed);
  for(const b of root.querySelectorAll('[data-town=chat]'))b.setAttribute('aria-expanded',String(!collapsed));
  if(!collapsed){if(!panel.open)panel.showModal();window.FoamTownGame?.active?.stopMovement();bottom();if(!loading)void refresh();}else{if(panel.open)panel.close();$('textarea').blur();}fitKeyboard();
 }
 function create(){panel=document.createElement('dialog');panel.id='town-chat-dialog';panel.className='town-chat';panel.setAttribute('aria-labelledby','town-chat-title');
  panel.innerHTML=`<header class="town-chat-heading"><h2 id="town-chat-title" data-chat-title>世界聊天</h2><button type="button" data-chat-close aria-label="关闭聊天">×</button></header><div id="town-chat-panel" data-chat-panel><div class="town-chat-tabs" role="tablist" aria-label="聊天频道"><button type="button" role="tab" id="town-chat-world" data-chat-tab="world" aria-controls="town-chat-log" aria-selected="true">世界</button><button type="button" role="tab" id="town-chat-local" data-chat-tab="town" aria-controls="town-chat-log" aria-selected="false" tabindex="-1">当前小镇</button></div><div class="town-chat-log" id="town-chat-log" data-chat-log role="log" aria-label="世界聊天消息" aria-live="polite" aria-relevant="additions" tabindex="0"></div><button type="button" class="town-chat-latest" data-chat-latest hidden>查看新消息 ↓</button><div class="town-chat-feedback"><span data-chat-status role="status"></span><button type="button" data-chat-retry hidden>重试</button></div><form class="town-chat-form"><label class="sr-only" for="town-chat-input">聊天内容</label><textarea id="town-chat-input" rows="2" maxlength="1000" enterkeyhint="send" aria-describedby="town-chat-counter"></textarea><div class="town-chat-emojis" data-chat-emojis aria-label="选择表情" hidden>${emoji.map(e=>`<button type="button" data-chat-emoji="${e}" aria-label="插入表情 ${e}">${e}</button>`).join('')}</div><div class="town-chat-compose"><button type="button" data-chat-emoji-toggle aria-expanded="false" aria-label="选择聊天表情">😊 表情</button><small id="town-chat-counter" data-chat-count>0/500</small><button type="submit" data-chat-send>发送</button></div><a data-chat-login href="/account/">登录后参与聊天 →</a></form></div>`;root.append(panel);
  $('[data-chat-close]').onclick=()=>toggle(true);panel.addEventListener('cancel',e=>{e.preventDefault();toggle(true);});panel.addEventListener('close',()=>{if(!collapsed)toggle(true);});panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)toggle(true);}});$('[data-chat-latest]').onclick=bottom;$('[data-chat-retry]').onclick=()=>{$('[data-chat-retry]').hidden=true;void refresh();};
  panel.querySelectorAll('[data-chat-tab]').forEach(b=>{b.onclick=()=>select(b.dataset.chatTab);b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=b.dataset.chatTab==='world'?'town':'world',other=$('[data-chat-tab='+next+']');if(!other.disabled){select(next);other.focus();}};});
  $('[data-chat-emoji-toggle]').onclick=()=>{const list=$('[data-chat-emojis]');list.hidden=!list.hidden;$('[data-chat-emoji-toggle]').setAttribute('aria-expanded',String(!list.hidden));};
  panel.querySelectorAll('[data-chat-emoji]').forEach(b=>b.onclick=()=>{const input=$('textarea');input.setRangeText(b.dataset.chatEmoji,input.selectionStart,input.selectionEnd,'end');drafts.set(room,input.value);updateForm();input.focus({preventScroll:true});});
  $('form').onsubmit=e=>{e.preventDefault();void send();};$('textarea').oninput=()=>{drafts.set(room,$('textarea').value);updateForm();};
  $('textarea').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&e.keyCode!==229){e.preventDefault();void send();}};
  panel.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('[data-chat-emojis]').hidden){$('[data-chat-emojis]').hidden=true;$('[data-chat-emoji-toggle]').setAttribute('aria-expanded','false');}else{toggle(true);}e.preventDefault();}e.stopPropagation();});
  panel.addEventListener('focusin',()=>{window.FoamTownGame?.active?.stopMovement();fitKeyboard();});
  panel.addEventListener('focusout',()=>requestAnimationFrame(fitKeyboard));
  $('[data-chat-log]').onscroll=()=>{followLatest=nearBottom();if(followLatest){unread=0;badge();$('[data-chat-latest]').hidden=true;}};
  new ResizeObserver(()=>{if(followLatest&&!collapsed)bottom();}).observe($('[data-chat-log]'));
 }
 function fitKeyboard(){if(!panel)return;const v=window.visualViewport,raised=v&&innerWidth<=700&&!collapsed&&panel.contains(document.activeElement)&&innerHeight-v.height>100;
  panel.classList.toggle('is-keyboard-open',!!raised);if(raised){panel.style.setProperty('--chat-visible-height',v.height+'px');panel.style.setProperty('--chat-visible-top',v.offsetTop+'px');}
 }
 window.visualViewport?.addEventListener('resize',fitKeyboard);
 window.visualViewport?.addEventListener('scroll',fitKeyboard);
 let populationRequest=0;
 async function population(){if(document.hidden||!ctx)return;const rev=++populationRequest;try{const data=await N.rpc('foamlab_town_population',{touch:!!me()});if(rev!==populationRequest)return;
   const el=root.querySelector('[data-town-population]');if(!el)return;if(!data?.enabled)throw Error('unavailable');el.dataset.state='ready';el.querySelector('[data-total-residents]').textContent=Number(data.residents||0).toLocaleString('zh-CN');el.querySelector('[data-total-online]').textContent=Number(data.online||0).toLocaleString('zh-CN');
  }catch{const el=root.querySelector('[data-town-population]');if(el){el.dataset.state='error';el.querySelector('[data-population-state]').textContent='人数暂时无法更新';}}}
 function sync(context){ctx=context;root=document.querySelector('#town-app');if(!panel)create();const nextIdentity=me();
  if(identity!==nextIdentity){identity=nextIdentity;drafts.clear();pending.clear();messages.clear();$('textarea').value='';sending=false;}
  const local=$('[data-chat-tab=town]');local.disabled=!ctx.province;local.textContent=ctx.province?'当前小镇 · '+label(ctx.province):'当前小镇';local.title=ctx.province?'和正在这里的朋友聊天':'进入小镇后打开当前频道';
  if(scope==='town'&&!ctx.province)scope='world';select(scope);badge();if(!timer)listen();clearInterval(populationTimer);void population();populationTimer=setInterval(population,60000);
 }
 window.addEventListener('online',()=>{if(ctx&&!document.hidden)listen();});
 document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)stop();else{listen();void population();}});
 window.addEventListener('pagehide',()=>{stop();clearInterval(populationTimer);});
 window.addEventListener('pageshow',e=>{if(e.persisted&&ctx){listen();clearInterval(populationTimer);populationTimer=setInterval(population,60000);void population();}});
 window.addEventListener('foam-auth-change',()=>{if(!panel||identity===me())return;stop();identity=me();drafts.clear();pending.clear();messages.clear();$('textarea').value='';$('[data-chat-log]').replaceChildren();updateForm();});
 window.FoamTownChat={sync,open:()=>{if(panel)toggle(false);},close:()=>{if(panel)toggle(true);}};
})();
