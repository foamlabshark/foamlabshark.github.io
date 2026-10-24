'use strict';
(() => {
 const A=window.foamAuth,L=window.FoamLab;if(!A||!L)return;
 const esc=L.esc,uuid=value=>/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value||'');
 const $=(s,r=document)=>r.querySelector(s),avatar=p=>window.FoamAvatar?.markup(p?.avatar||{user_id:p?.user_id})||'🐼';
 const title=p=>p?.remark||p?.name||'学习者',date=value=>value?L.dateTime(value):'',notify=text=>window.foamNotify?.(text);
 let owner='',epoch=0,channel=null,retryTimer,pollTimer,summaryPending=null,summaryVersion=0,summaryAgain=false,lastSummary=0,summary={},hub=null,hubTab='friends',hubPage=0,hubRows=[],hubMore=false,hubRequest=0,currentPeer=null,listTimer,signalTimer;
 const profiles=new Map(),chats=new Map(),drafts=new Map(),listCache=new Map(),listPending=new Map();let dialogId=0,listVersion=0;
 async function api(operation,payload={}){
  await A.ready;const who=A.user?.id;if(!who)throw Error('请先登录后使用好友功能。');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
  try{const result=await A.client.rpc('foamlab_social',{operation,payload}).abortSignal(controller.signal);if(A.user?.id!==who)throw Error('登录账号已变化，请重新打开。');if(result.error){const error=Error(result.error.message||'暂时无法连接好友服务。');error.code=result.error.code;throw error;}if(result.data==null)throw Error('暂时无法读取，请重试。');return result.data;}
  finally{clearTimeout(timer);}
 }
 function draftKey(id){return 'foamlab.social-drafts:'+id;}
 function keepDraft(id,value){drafts.set(id,value);try{sessionStorage.setItem(draftKey(owner),JSON.stringify([...drafts].filter(([,v])=>v).slice(-50)));}catch{}}
 function badges(){
  const total=Number(summary.unread_messages||0)+Number(summary.unread_notices||0);
  document.querySelectorAll('[data-social-count]').forEach(el=>{el.textContent=total>99?'99+':String(total);el.hidden=!owner||!total;el.setAttribute('aria-label',total+'条好友未读消息');});
  if(hub){for(const [tab,count] of [['requests',summary.pending_requests],['invitations',summary.pending_invites]]){const n=$('[data-social-tab="'+tab+'"] b',hub);n.textContent=count>99?'99+':String(count||0);n.hidden=!count;}}
 }
 async function refreshSummary(force=false){
  if(!owner||document.hidden)return;if(summaryPending){if(force)summaryAgain=true;return summaryPending;}if(!force&&Date.now()-lastSummary<5000)return;
  const who=owner,version=summaryVersion,task=api('summary',{touch:true}).then(data=>{if(owner!==who||version!==summaryVersion)return;summary=data;lastSummary=Date.now();badges();}).catch(()=>{}).finally(()=>{if(summaryPending===task){summaryPending=null;if(summaryAgain){summaryAgain=false;void refreshSummary(true);}}});summaryPending=task;return task;
 }
 function makeDialog(kind,heading,body){
  const d=document.createElement('dialog'),id='social-title-'+(++dialogId);d.className='social-dialog '+kind;d.setAttribute('aria-labelledby',id);
  d.innerHTML='<header class="social-heading"><h2 id="'+id+'">'+esc(heading)+'</h2><button type="button" class="social-close" data-social-close aria-label="关闭">×</button></header>'+body;
  d.querySelector('[data-social-close]').onclick=()=>d.close();d.addEventListener('keydown',e=>e.stopPropagation());
  const previous=document.activeElement;d.addEventListener('close',()=>{d.remove();if(previous?.isConnected)previous.focus({preventScroll:true});},{once:true});(document.querySelector('#town-app')||document.body).append(d);d.showModal();window.FoamTownGame?.active?.stopMovement();return d;
 }
 function confirm(heading,description,action='确认'){
  return new Promise(resolve=>{const d=makeDialog('social-confirm',heading,'<p>'+esc(description)+'</p><form method="dialog" class="social-actions"><button type="submit" value="cancel" class="secondary">取消</button><button type="submit" value="confirm">'+esc(action)+'</button></form>');d.addEventListener('close',()=>resolve(d.returnValue==='confirm'),{once:true});});
 }
 async function requireLogin(){await A.ready;if(A.user)return true;const d=makeDialog('social-login','登录后使用好友功能','<p>添加好友、私聊和分享笔记需要登录。</p><button type="button" data-social-login>使用 GitHub 登录</button>');$('[data-social-login]',d).onclick=()=>{d.close();void L.login();};return false;}
 async function act(button,status,operation,payload,done){
  if(button.disabled)return;button.disabled=true;status.textContent='正在处理…';
  try{const result=await api(operation,payload);summaryVersion++;invalidateLists();status.textContent='';await done?.(result);void refreshSummary(true);refreshOpenList();}
  catch(error){if(status.isConnected)status.textContent=error.message;}
  finally{if(button.isConnected)button.disabled=false;}
 }
 function person(p){return '<span class="social-avatar" aria-hidden="true">'+avatar(p)+'</span><span class="social-person-copy"><strong>'+esc(title(p))+'</strong><small>'+esc(p.remark&&p.remark!==p.name?'昵称：'+p.name:'Lv.'+p.level+' · '+(p.institution||'未填写学校／单位'))+'</small></span>';}
 function online(p){return '<span class="social-presence'+(p.online?' is-online':'')+'"><i aria-hidden="true"></i>'+(p.online?'在线':'离线')+'</span>';}
 async function showProfile(id){
  if(!uuid(id)||!await requireLogin())return;
  const d=makeDialog('social-profile','成员资料','<div data-social-profile-body><p role="status">正在读取资料…</p></div>'),content=$('[data-social-profile-body]',d);
  async function read(){try{const p=await api('profile',{user_id:id});if(!d.isConnected)return;profiles.set(id,p);render(p);}catch(error){if(d.isConnected){content.innerHTML='<p role="status">'+esc(error.message)+'</p><button type="button" data-profile-retry>重试</button>';$('[data-profile-retry]',content).onclick=read;}}}
  function render(p){
   content.innerHTML='<div class="social-profile-identity">'+person(p)+'<span class="social-level">Lv.'+Number(p.level||1)+'</span></div><div class="social-profile-presence">'+online(p)+'</div><dl class="social-profile-fields"><div><dt>昵称</dt><dd>'+esc(p.name)+'</dd></div><div><dt>学校／单位</dt><dd>'+esc(p.institution||'未填写')+'</dd></div><div><dt>研究方向</dt><dd>'+esc(p.research||'未填写')+'</dd></div></dl><p class="social-member-id">用户 ID：'+esc(id)+'</p><div class="social-profile-controls"></div><p class="social-status" role="status"></p>';
   const controls=$('.social-profile-controls',content),status=$('.social-status',content);
   const add=(text,fn,secondary=false)=>{const b=document.createElement('button');b.type='button';b.textContent=text;if(secondary)b.className='secondary';b.onclick=()=>fn(b);controls.append(b);return b;};
   if(p.relation==='self'){controls.innerHTML='<a class="button" href="/account/#profile-form">打开个人中心</a>';return;}
   if(p.province){const a=document.createElement('a');a.className='button secondary';a.href='/town/#'+encodeURIComponent(p.province)+'/house/'+id;a.textContent='前往 TA 的小屋';controls.append(a);}
   if(p.relation==='friends'){
    add('发消息',()=>{d.close();void openChat(id);});
    const settings=document.createElement('form');settings.className='social-friend-settings';settings.innerHTML='<label>好友备注（仅对你显示）<input name="remark" maxlength="50"></label><label class="social-check"><input type="checkbox" name="muted"> 消息免打扰</label><button type="submit" class="secondary">保存设置</button>';settings.elements.remark.value=p.remark||'';settings.elements.muted.checked=!!p.muted;
    settings.onsubmit=e=>{e.preventDefault();void act($('[type=submit]',settings),status,'preference',{user_id:id,remark:settings.elements.remark.value,muted:settings.elements.muted.checked},next=>{profiles.set(id,next);status.textContent='好友设置已保存。';});};controls.append(settings);
    if(!p.province&&summary.town_joined){const nonce=crypto.randomUUID();add('邀请加入熊猫小镇',b=>void act(b,status,'town_invite',{user_id:id,client_id:nonce},()=>{status.textContent='邀请已发送，好友接受并首次入住后，双方获得“好伙伴友谊”称号。';}));}
    add('删除好友',async b=>{if(await confirm('删除好友？','双方将从好友列表移除，不能继续私聊；已有聊天记录会保留。','删除好友'))void act(b,status,'remove',{user_id:id},render);},true);
   }else if(p.relation==='outgoing'){
    const text=document.createElement('p');text.textContent='好友申请已发送，等待对方同意。';controls.append(text);add('撤回申请',b=>void act(b,status,'respond',{user_id:id,decision:'cancel'},render),true);
   }else if(p.relation==='incoming'){
    add('同意好友申请',b=>void act(b,status,'respond',{user_id:id,decision:'accept'},render));add('拒绝',b=>void act(b,status,'respond',{user_id:id,decision:'decline'},render),true);
   }else if(p.relation==='blocked'){
    add('解除拉黑',b=>void act(b,status,'block',{user_id:id,blocked:false},render));
   }else if(p.relation!=='unavailable'){
    const f=document.createElement('form');f.className='social-request-form';f.innerHTML='<label>好友申请留言（选填）<textarea name="message" rows="2" maxlength="140" placeholder="介绍一下自己，方便对方认识你"></textarea></label><button type="submit">申请加为好友</button>';f.onsubmit=e=>{e.preventDefault();void act($('[type=submit]',f),status,'request',{user_id:id,message:f.elements.message.value},render);};controls.append(f);
   }else{const p=document.createElement('p');p.textContent='暂时无法联系这位成员。';controls.append(p);}
   if(['removed','blocked','unavailable'].includes(p.relation))add('查看聊天记录',()=>{d.close();void openChat(id);},true);
   if(p.relation!=='blocked'){const block=add('拉黑',async b=>{if(await confirm('拉黑这位成员？','拉黑后将阻止双方的新申请和私聊，可在黑名单中解除。','拉黑'))void act(b,status,'block',{user_id:id},render);},true);block.classList.add('social-block');const corner=document.createElement('div');corner.className='social-profile-corner';corner.append(block);controls.append(corner);}
  }
  await read();
 }
 function buildHub(){
  if(hub?.isConnected)return;
  hub=makeDialog('social-hub','好友','<nav class="social-tabs" aria-label="好友功能">'+[['friends','好友'],['requests','新的朋友'],['invitations','小镇邀请'],['blocked','黑名单']].map(([id,name])=>'<button type="button" data-social-tab="'+id+'">'+name+' <b hidden></b></button>').join('')+'</nav><div class="social-workspace"><section class="social-contacts"><form class="social-search"><label class="sr-only" for="social-search">搜索好友</label><input id="social-search" type="search" maxlength="100" placeholder="搜索好友或备注"><button type="button" data-social-find>添加好友</button></form><p class="social-status" role="status" data-social-list-status></p><div class="social-contact-list"></div><button type="button" class="secondary social-more" data-social-more hidden>加载更多</button></section><section class="social-conversation"><div class="social-welcome"><p>选择一位好友开始聊天。</p><small>好友申请通过后，才可以互发消息和分享笔记。</small></div></section></div>');
  hub.dataset.view='list';
  hub.addEventListener('close',()=>{hub=null;currentPeer=null;++hubRequest;});
  hub.querySelectorAll('[data-social-tab]').forEach(b=>b.onclick=()=>{hubTab=b.dataset.socialTab;resetConversation();hub.dataset.view='list';currentPeer=null;hubPage=0;hubRows=[];$('input[type=search]',hub).value='';void loadList();});
  $('[data-social-find]',hub).onclick=()=>{hubTab=hubTab==='search'?'friends':'search';resetConversation();hub.dataset.view='list';currentPeer=null;hubPage=0;hubRows=[];void loadList();$('input[type=search]',hub).focus();};
  $('.social-search',hub).onsubmit=e=>{e.preventDefault();hubPage=0;void loadList();};
  $('input[type=search]',hub).oninput=()=>{clearTimeout(listTimer);++hubRequest;hubPage=0;listTimer=setTimeout(()=>void loadList(),250);};
  $('[data-social-more]',hub).onclick=()=>void loadList(true);
  badges();
 }
 async function openHub(tab='friends'){if(!await requireLogin())return;buildHub();resetConversation();hubTab=tab;hubPage=0;hubRows=[];hub.dataset.view='list';currentPeer=null;void refreshSummary(true);warmLists();await loadList();}
 function refreshOpenList(){if(hub?.open)void loadList(false,true);}
 function resetConversation(){if(hub)$('.social-conversation',hub).innerHTML='<div class="social-welcome"><p>选择一位好友开始聊天。</p><small>好友申请通过后，才可以互发消息和分享笔记。</small></div>';}
 function invalidateLists(){listVersion++;listPending.clear();}
 const listKey=(tab,query,page)=>JSON.stringify([tab,query,page]);
 function fetchList(tab,query,page,force=false){
  const key=listKey(tab,query,page),cached=listCache.get(key),pending=listPending.get(key),version=listVersion,who=owner;
  if(!force&&cached?.version===version&&Date.now()-cached.at<15000)return Promise.resolve(cached.data);
  if(pending?.version===version)return pending.task;
  const task=api(tab,{query,page}).then(data=>{if(owner===who&&listVersion===version){listCache.set(key,{data,version,at:Date.now()});if(listCache.size>64)listCache.delete(listCache.keys().next().value);}return data;}).finally(()=>{if(listPending.get(key)?.task===task)listPending.delete(key);});
  listPending.set(key,{task,version});return task;
 }
 function warmLists(){for(const tab of ['friends','requests','invitations','blocked'])if(tab!==hubTab)void fetchList(tab,'',0).catch(()=>{});}
 function readListNotices(d,tab){if(d.contains(document.activeElement)&&['requests','invitations'].includes(tab))void api('notices_read',{scope:tab}).then(()=>{summaryVersion++;return refreshSummary(true);}).catch(()=>{});}
 function renderList(d,tab,query,data,append,page){
  const status=$('[data-social-list-status]',d),list=$('.social-contact-list',d);
   if(tab==='requests'){
    list.innerHTML='<h3>收到的申请</h3>'+((data.incoming||[]).map(p=>requestRow(p,true)).join('')||'<p class="social-empty">暂无待处理的申请。</p>')+'<h3>我发出的申请</h3>'+((data.outgoing||[]).map(p=>requestRow(p,false)).join('')||'<p class="social-empty">暂无等待中的申请。</p>')+'<h3>最近提醒</h3>'+((data.notices||[]).map(n=>'<p class="social-notice"><button type="button" data-social-profile="'+esc(n.peer_id)+'">查看成员</button> '+esc(n.body)+'<time>'+esc(date(n.created_at))+'</time></p>').join('')||'<p class="social-empty">暂无提醒。</p>');hubMore=false;
    list.querySelectorAll('[data-request-decision]').forEach(b=>b.onclick=()=>void act(b,status,'respond',{user_id:b.dataset.user,decision:b.dataset.requestDecision},()=>loadList()));
   }else{
    hubRows=append?hubRows.concat(data.items||[]):data.items||[];hubPage=page;hubMore=!!data.more;
    if(tab==='invitations'){
     list.innerHTML=hubRows.map(i=>'<article class="social-invitation">'+(i.profile?'<button type="button" class="social-person" data-social-profile="'+esc(i.profile.user_id)+'">'+person(i.profile)+'</button>':'')+'<p>'+(i.incoming?'邀请你加入熊猫小镇':'你发出的小镇邀请')+'</p><small>'+esc(({pending:'等待处理',accepted:'已接受，等待完成入住',completed:'已完成，双方获得好伙伴友谊称号',declined:'已拒绝',expired:'已过期'})[i.status]||i.status)+'</small>'+(i.incoming&&['pending','accepted'].includes(i.status)?'<div class="social-actions"><button type="button" data-town-invitation="'+esc(i.id)+'">'+(i.status==='accepted'?'继续入住':'接受并入住')+'</button><button type="button" class="secondary" data-town-decline="'+esc(i.id)+'">拒绝</button></div>':'')+'</article>').join('')||'<p class="social-empty">暂无小镇邀请。邀请好友首次入住，双方可获得“好伙伴友谊”称号。</p>';
     list.querySelectorAll('[data-town-invitation]').forEach(b=>b.onclick=()=>void acceptInvite(b.dataset.townInvitation,b,status));list.querySelectorAll('[data-town-decline]').forEach(b=>b.onclick=()=>void act(b,status,'town_decline',{id:b.dataset.townDecline},()=>loadList()));
    }else{
     list.innerHTML=hubRows.map(p=>{profiles.set(p.user_id,p);return '<article class="social-contact-row"><button type="button" class="social-contact" data-contact="'+esc(p.user_id)+'">'+person(p)+'<span class="social-contact-state">'+online(p)+(p.unread?'<b class="social-unread">'+(p.unread>99?'99+':Number(p.unread))+'</b>':'')+'</span>'+(tab==='friends'?'<span class="social-contact-preview">'+esc(p.last_kind==='note'?'[分享笔记]':p.last_kind==='town_invite'?'[小镇邀请]':p.last_body||'开始聊天')+'</span>':'')+'</button>'+(tab==='blocked'?'<button type="button" class="secondary" data-unblock="'+esc(p.user_id)+'">解除拉黑</button>':'')+'</article>';}).join('')||'<p class="social-empty">'+(tab==='search'?(query.length<2?'输入至少两个字查找成员。':'没有找到匹配的成员。'):tab==='blocked'?'黑名单为空。':'还没有好友。点击“添加好友”，或点击文章和评论中的头像认识成员。')+'</p>';
     list.querySelectorAll('[data-contact]').forEach(b=>b.onclick=()=>void(tab==='friends'?openChat(b.dataset.contact):showProfile(b.dataset.contact)));list.querySelectorAll('[data-unblock]').forEach(b=>b.onclick=()=>void act(b,status,'block',{user_id:b.dataset.unblock,blocked:false},()=>loadList()));
    }
   }
   status.textContent='';$('[data-social-more]',d).hidden=!hubMore;
 }
 async function loadList(append=false,quiet=false){
  if(!hub?.open)return;
  const d=hub,token=++hubRequest,tab=hubTab,version=listVersion,status=$('[data-social-list-status]',d),list=$('.social-contact-list',d),query=$('input[type=search]',d).value.trim(),page=append?hubPage+1:0,key=listKey(tab,query,0),cached=listCache.get(key),sameView=list.dataset.viewKey===key;
  const current=()=>hub===d&&token===hubRequest;
  d.dataset.tab=tab;list.dataset.viewKey=key;
  d.querySelectorAll('[data-social-tab]').forEach(b=>{b.setAttribute('aria-current',String(b.dataset.socialTab===tab));b.classList.toggle('is-active',b.dataset.socialTab===tab);});
  $('.social-search',d).hidden=!['friends','search'].includes(tab);$('input[type=search]',d).placeholder=tab==='search'?'搜索昵称（至少两个字）或用户 ID':'搜索好友或备注';$('[data-social-find]',d).textContent=tab==='search'?'返回好友':'添加好友';
  status.textContent='';
  if(!append&&!quiet&&cached)renderList(d,tab,query,cached.data,false,0);
  else if(!sameView){list.replaceChildren();hubRows=[];hubMore=false;$('[data-social-more]',d).hidden=true;}
  $('[data-social-more]',d).disabled=true;list.setAttribute('aria-busy','true');
  const loading=setTimeout(()=>{if(current()&&!list.children.length)status.textContent='连接较慢，正在加载…';},700);
  try{
   const lastPage=quiet&&sameView&&!append?hubPage:0;
   let data=await fetchList(tab,query,page,quiet),renderPage=page;
   if(lastPage>0&&Array.isArray(data.items)){const pages=await Promise.all(Array.from({length:lastPage},(_,i)=>fetchList(tab,query,i+1,true)));data={...data,items:[...data.items,...pages.flatMap(p=>p.items||[])],more:pages.at(-1).more};renderPage=lastPage;}
   if(!current())return;
   if(version!==listVersion){void loadList(append,true);return;}
   if(append||quiet||data!==cached?.data)renderList(d,tab,query,data,append,renderPage);
   readListNotices(d,tab);
  }catch(error){if(current()){status.textContent=error.message;const retry=document.createElement('button');retry.type='button';retry.textContent='重试';retry.onclick=()=>void loadList(append,true);status.append(' ',retry);}}
  finally{clearTimeout(loading);if(current()){list.setAttribute('aria-busy','false');$('[data-social-more]',d).disabled=false;}}
 }
 function requestRow(p,incoming){return '<article class="social-request"><button type="button" class="social-person" data-social-profile="'+esc(p.user_id)+'">'+person(p)+'</button>'+(p.request_text?'<p>'+esc(p.request_text)+'</p>':'')+'<small>'+esc(date(p.requested_at))+'</small><div class="social-actions">'+(incoming?'<button type="button" data-request-decision="accept" data-user="'+esc(p.user_id)+'">同意</button><button type="button" class="secondary" data-request-decision="decline" data-user="'+esc(p.user_id)+'">拒绝</button>':'<button type="button" class="secondary" data-request-decision="cancel" data-user="'+esc(p.user_id)+'">撤回申请</button>')+'</div></article>';}
 async function acceptInvite(id,button,status){await act(button,status,'town_accept',{id},data=>{location.href=data.join_url;});}

 function chatState(id){if(!chats.has(id))chats.set(id,{id,owner,messages:new Map(),pending:new Map(),more:false,loading:null,canSend:false,peerRead:'0',readSent:'0',readBusy:false,sending:false});return chats.get(id);}
 const ids=c=>[...c.messages.keys()].filter(id=>/^\d+$/.test(id)).sort((a,b)=>BigInt(a)<BigInt(b)?-1:BigInt(a)>BigInt(b)?1:0);
 const atBottom=log=>log.scrollHeight-log.scrollTop-log.clientHeight<48;
 function chatStatus(text){if(hub&&currentPeer)$('[data-chat-feedback]',hub).textContent=text;}
 async function openChat(id){
  if(!uuid(id)||!await requireLogin())return;buildHub();hubTab='friends';currentPeer=id;hub.dataset.view='chat';const c=chatState(id),p=profiles.get(id)||{user_id:id,name:'好友',level:1};
  $('.social-conversation',hub).innerHTML='<header class="social-chat-heading"><button type="button" class="secondary" data-chat-back>← 好友</button><button type="button" class="social-person" data-chat-person>'+person(p)+'</button><button type="button" class="secondary" data-chat-details>资料与设置</button></header><button type="button" class="social-history-more secondary" data-chat-older hidden>加载更早的消息</button><div class="social-chat-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0"></div><button type="button" class="social-latest secondary" data-chat-new hidden>新消息 ↓</button><p class="social-status" role="status" data-chat-feedback></p><form class="social-compose"><label class="sr-only" for="social-chat-body">私聊消息</label><textarea id="social-chat-body" rows="3" maxlength="10000" placeholder="写给好友的消息…"></textarea><div><small data-chat-hint>Enter 发送 · Shift+Enter 换行</small><span data-chat-length>0/5000</span><button type="submit">发送</button></div></form>';
  $('[data-chat-person]',hub).onclick=$('[data-chat-details]',hub).onclick=()=>void showProfile(id);
  $('[data-chat-back]',hub).onclick=()=>{currentPeer=null;hub.dataset.view='list';};
  $('[data-chat-older]',hub).onclick=()=>void refreshChat('older');
  $('[data-chat-new]',hub).onclick=()=>{const log=$('.social-chat-log',hub);log.scrollTop=log.scrollHeight;$('[data-chat-new]',hub).hidden=true;void markRead(c);};
  const form=$('.social-compose',hub),input=$('textarea',form);input.value=drafts.get(id)||'';
  input.oninput=()=>{keepDraft(id,input.value);updateComposer(c);};input.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&e.keyCode!==229){e.preventDefault();form.requestSubmit();}};
  form.onsubmit=e=>{e.preventDefault();if(c.sending||!c.canSend)return;const body=input.value.trim();if(!body||Array.from(body).length>5000)return;let entry=[...c.pending.values()].find(e=>e.state==='failed'&&e.body===body);if(!entry){entry={client_id:crypto.randomUUID(),body,kind:'text',sender_id:owner,created_at:new Date().toISOString(),state:'sending'};c.pending.set(entry.client_id,entry);}void sendEntry(c,entry);};
  $('.social-chat-log',hub).onscroll=()=>{if(currentPeer===id&&atBottom($('.social-chat-log',hub))){$('[data-chat-new]',hub).hidden=true;void markRead(c);}};
  $('.social-chat-log',hub).onclick=e=>{const retry=e.target.closest('[data-social-retry]'),note=e.target.closest('[data-shared-note]'),invite=e.target.closest('[data-shared-invite]');if(retry){const entry=c.pending.get(retry.dataset.socialRetry);if(entry)void sendEntry(c,entry);}else if(note)void showNote(note.dataset.sharedNote);else if(invite)void showInvite(invite.dataset.sharedInvite);};
  renderChat(c,true);void loadList(false,true);await refreshChat('initial');
  if(hub?.open&&currentPeer===id&&!hub.contains(document.activeElement))$('.social-chat-log',hub).focus({preventScroll:true});
  void markRead(c);
 }
 function updateComposer(c){if(c.owner!==owner||!hub||currentPeer!==c.id)return;const form=$('.social-compose',hub),input=$('textarea',form),length=Array.from(input.value).length;$('[data-chat-length]',form).textContent=length+'/5000';$('[type=submit]',form).disabled=c.sending||!c.canSend||!input.value.trim()||length>5000;input.disabled=!c.canSend;$('[data-chat-hint]',form).textContent=c.canSend?'Enter 发送 · Shift+Enter 换行':'通过好友申请后才可发送；已删除或拉黑时不能继续私聊。';}
 function delivery(c,m){if(m.state==='sending')return '发送中…';if(m.state==='failed')return '发送未确认：'+(m.error||'请重试');if(m.sender_id===owner)return BigInt(m.id)<=BigInt(c.peerRead||'0')?'已读':'已送达';return '';}
 function renderChat(c,forceBottom=false,prepend=false){
  if(c.owner!==owner||!hub||currentPeer!==c.id)return;const log=$('.social-chat-log',hub),follow=!prepend&&(forceBottom||atBottom(log)),height=log.scrollHeight,top=log.scrollTop,p=profiles.get(c.id);
  if(p)$('[data-chat-person]',hub).innerHTML=person(p);
  const rows=[...ids(c).map(id=>c.messages.get(id)),...c.pending.values()],existing=new Map([...log.querySelectorAll('[data-social-message]')].map(el=>[el.dataset.socialMessage,el]));log.querySelector('.social-empty')?.remove();let previous=null;
  for(const m of rows){const key=m.id?'id:'+m.id:'pending:'+m.client_id;let item=existing.get(key);if(!item){item=document.createElement('article');item.className='social-chat-message'+(m.sender_id===owner?' is-self':'');item.dataset.socialMessage=key;item.innerHTML='<div class="social-message-content">'+(m.kind==='note'?'<button type="button" class="social-shared-card" data-shared-note="'+esc(m.id)+'"><small>分享笔记</small><strong>'+esc(m.note?.title||m.body)+'</strong><span>查看笔记副本 →</span></button>':m.kind==='town_invite'?'<button type="button" class="social-shared-card" data-shared-invite="'+esc(m.invite_id)+'"><small>熊猫小镇邀请</small><strong>一起加入熊猫小镇</strong><span>首次入住，双方获得“好伙伴友谊”称号 →</span></button>':'<p>'+esc(m.body)+'</p>')+'</div><footer><time>'+esc(date(m.created_at))+'</time><span data-social-delivery></span><button type="button" class="social-retry" data-social-retry="'+esc(m.client_id)+'" hidden>重试</button></footer>';}
   $('[data-social-delivery]',item).textContent=delivery(c,m);$('[data-social-retry]',item).hidden=m.state!=='failed';item.dataset.delivery=m.state||'confirmed';
   const position=previous?previous.nextSibling:log.firstChild;if(position!==item)log.insertBefore(item,position);previous=item;existing.delete(key);
  }
  existing.forEach(el=>el.remove());if(!rows.length)log.innerHTML='<p class="social-empty">还没有消息，和好友打个招呼吧。</p>';
  $('[data-chat-older]',hub).hidden=!c.more;updateComposer(c);
  if(follow){log.scrollTop=log.scrollHeight;void markRead(c);}else{log.scrollTop=top+(prepend?Math.max(0,log.scrollHeight-height):0);$('[data-chat-new]',hub).hidden=prepend;}
 }
 async function refreshChat(mode='new'){
  if(!currentPeer||!hub?.open)return;const c=chatState(currentPeer);if(c.loading)return c.loading;const who=owner,d=hub;
  const task=(async()=>{try{
   const known=ids(c);let payload={user_id:c.id},loops=0;
   if(mode==='older'&&known.length)payload.before=known[0];else if(mode==='new'&&known.length)payload.after=known.at(-1);
   if(!known.length)chatStatus('正在读取聊天…');
   let data;do{
    data=await api('messages',payload);if(owner!==who)return;c.canSend=!!data.can_send;c.peerRead=data.peer_read_through||'0';profiles.set(c.id,data.profile);
    for(const m of data.items||[]){c.messages.set(String(m.id),m);c.pending.delete(m.client_id);}
    if(!payload.after)c.more=!!data.more;
    if(payload.after&&data.more&&data.items.length){payload.after=String(data.items.at(-1).id);}else break;
   }while(++loops<20);
   if(hub===d&&currentPeer===c.id){chatStatus('');renderChat(c,mode==='initial',mode==='older');}
  }catch(error){if(hub===d&&currentPeer===c.id){chatStatus(error.message);const status=$('[data-chat-feedback]',d),retry=document.createElement('button');retry.type='button';retry.textContent='重新读取';retry.onclick=()=>void refreshChat(mode);status.append(' ',retry);}}
  finally{if(c.loading===task)c.loading=null;}})();c.loading=task;return task;
 }
 async function markRead(c){
  if(c.owner!==owner||document.hidden||!hub?.open||currentPeer!==c.id||!hub.contains(document.activeElement)||!atBottom($('.social-chat-log',hub))||c.readBusy)return;
  const latest=ids(c).at(-1);if(!latest||BigInt(latest)<=BigInt(c.readSent))return;c.readBusy=true;
  let acknowledged=false;try{await api('read',{user_id:c.id,through:latest});acknowledged=true;c.readSent=latest;summaryVersion++;const contact=hubRows.find(r=>r.user_id===c.id);if(contact){summary.unread_messages=Math.max(0,Number(summary.unread_messages||0)-Number(contact.unread||0));contact.unread=0;}badges();void refreshSummary(true);}
  catch{}finally{c.readBusy=false;if(acknowledged&&ids(c).at(-1)!==latest)void markRead(c);}
 }
 async function sendEntry(c,entry){
  if(c.sending||owner!==entry.sender_id)return;c.sending=true;entry.state='sending';renderChat(c,true);const sentBody=entry.body;
  try{
   const data=await api('send',{user_id:c.id,body:sentBody,client_id:entry.client_id});c.messages.set(String(data.message.id),data.message);c.pending.delete(entry.client_id);
   if(hub&&currentPeer===c.id){const input=$('.social-compose textarea',hub);if(input.value.trim()===sentBody){input.value='';keepDraft(c.id,'');}chatStatus('');renderChat(c,true);}
   refreshOpenList();void refreshSummary(true);
  }catch(error){const confirmed=[...c.messages.values()].find(m=>m.client_id===entry.client_id);if(confirmed)c.pending.delete(entry.client_id);else{entry.state='failed';entry.error=error.message;}}
  finally{c.sending=false;if(hub&&currentPeer===c.id)renderChat(c);}
 }
 async function showNote(id){
  const d=makeDialog('social-note-view','好友分享的笔记','<p role="status">正在读取笔记副本…</p>');
  try{const data=await api('shared_note',{id}),note=data.note;if(!d.isConnected)return;const body=document.createElement('div');body.className='social-note-body';body.innerHTML='<h3>'+esc(note.title)+'</h3><p class="social-note-caption">这是好友分享时的笔记副本。</p><div class="prose">'+L.markdown(note.body||'')+'</div><button type="button" data-shared-download>下载 Markdown</button>';d.querySelector('p').replaceWith(body);$('[data-shared-download]',body).onclick=()=>{const blob=new Blob(['# '+note.title+'\n\n'+note.body],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=String(note.title||'好友笔记').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,100)+'.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};dispatchEvent(new Event('foamlab:messages'));}
  catch(error){if(d.isConnected)d.querySelector('p').textContent=error.message;}
 }
 async function showInvite(id){
  const d=makeDialog('social-invite-view','熊猫小镇邀请','<p role="status">正在读取邀请…</p>');
  try{const data=await api('town_status',{id});if(!d.isConnected)return;const body=document.createElement('div');body.innerHTML='<p>'+esc(data.profile?.name||'好友')+(data.incoming?'邀请你一起加入熊猫小镇。':'收到的小镇邀请。')+'</p><p>接受邀请并首次入住后，双方获得“好伙伴友谊”称号，可在“我的熊猫 → 称号”中佩戴。</p><p class="social-status" role="status"></p>';
   d.querySelector('p').replaceWith(body);const status=$('.social-status',body);
   if(data.incoming&&!data.joined&&['pending','accepted'].includes(data.status)){const b=document.createElement('button');b.type='button';b.textContent=data.status==='accepted'?'继续入住':'接受并入住';b.onclick=()=>void acceptInvite(id,b,status);body.append(b);}else{status.textContent=data.status==='completed'?'邀请已完成，称号已发放。':data.joined?'你已入住小镇。':'这份邀请已处理或已失效。';}
  }catch(error){if(d.isConnected)d.querySelector('p').textContent=error.message;}
 }
 async function chooseShare(noteId,noteTitle='这篇笔记'){
  if(!uuid(noteId)||!await requireLogin())return;
  const d=makeDialog('social-picker','分享笔记给好友','<p>发送已保存笔记的内容副本，后续修改不会同步。</p><p><strong>'+esc(noteTitle)+'</strong></p><form><label>查找好友<input type="search" maxlength="100" name="query" placeholder="昵称或备注"></label><div class="social-share-friends"></div><button type="button" class="secondary" data-share-more hidden>加载更多</button><p class="social-status" role="status"></p><button type="submit" disabled>确认分享</button></form>'),form=$('form',d),list=$('.social-share-friends',d),status=$('.social-status',d),nonces=new Map();let page=0,people=[],request=0,selected=null,timer;
  async function read(append=false){const version=++request;status.textContent='正在读取好友…';try{const data=await api('friends',{query:form.elements.query.value,page:append?page+1:0});if(!d.isConnected||version!==request)return;page=append?page+1:0;people=append?people.concat(data.items):data.items;list.innerHTML=people.filter(p=>p.relation==='friends').map(p=>'<label class="social-share-friend"><input type="radio" name="peer" value="'+esc(p.user_id)+'" '+(selected===p.user_id?'checked':'')+'>'+person(p)+'</label>').join('')||'<p class="social-empty">没有可分享的好友。</p>';$('[data-share-more]',d).hidden=!data.more;status.textContent='';}catch(error){if(d.isConnected)status.textContent=error.message;}}
  form.elements.query.oninput=()=>{clearTimeout(timer);++request;timer=setTimeout(()=>void read(),250);};$('[data-share-more]',d).onclick=()=>void read(true);list.onchange=e=>{if(e.target.name==='peer'){selected=e.target.value;$('[type=submit]',form).disabled=false;}};
  form.onsubmit=e=>{e.preventDefault();if(!selected)return;const target=selected;if(!nonces.has(target))nonces.set(target,crypto.randomUUID());void act($('[type=submit]',form),status,'share_note',{user_id:target,note_id:noteId,client_id:nonces.get(target)},()=>{d.close();void openChat(target);notify('笔记副本已分享给好友。');});};await read();
 }
 async function continueTownInvite(){
  const url=new URL(location.href),id=url.searchParams.get('town_invite');if(!uuid(id)||!url.pathname.startsWith('/town/')||!A.user)return;
  try{const data=await api('town_status',{id});if(!data.incoming)return;if(data.joined){url.searchParams.delete('town_invite');history.replaceState(history.state,'',url.pathname+url.search+url.hash);if(data.status==='completed')notify('你和好友已获得“好伙伴友谊”称号。');return;}
   if(data.status!=='accepted'){await showInvite(id);return;}
   const openJoin=()=>{if(document.querySelector('.profile-required-dialog[open]'))return false;const b=document.querySelector('#town-app[data-ready=true] [data-town=join]');if(!b)return false;b.click();notify('完成首次入住后，邀请双方都会获得“好伙伴友谊”称号。');return true;};
   if(!openJoin()){const observer=new MutationObserver(()=>{if(openJoin())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),45000);}
  }catch(error){notify(error.message);}
 }
 // A single controller and subscription are used on the website and in town.
 window.FoamSocial={open:openHub,profile:showProfile,chat:openChat,shareNote:chooseShare,refresh:()=>refreshSummary(true)};
 function entrances(){
  const top=$('.account-actions');if(top&&!$('[data-social-open]',top)){const b=document.createElement('button');b.type='button';b.className='account-nav social-entry';b.dataset.socialOpen='friends';b.setAttribute('aria-haspopup','dialog');b.innerHTML='好友<span class="social-unread" data-social-count hidden></span>';top.prepend(b);}
  const menu=$('.account-panel-links');if(menu&&!$('[data-social-open]',menu)){const b=document.createElement('button');b.type='button';b.dataset.socialOpen='friends';b.className='account-panel-action';b.innerHTML='好友<span class="social-menu-tail"><b class="social-unread" data-social-count hidden></b><span aria-hidden="true">→</span></span>';menu.prepend(b);}
  badges();
 }
 function stop(){epoch++;clearInterval(pollTimer);clearTimeout(retryTimer);if(channel){const old=channel;channel=null;A.client?.removeChannel(old).catch(()=>{});}}
 function connect(){
  if(!owner||!A.client)return;const who=owner,generation=epoch;
  const active=A.client.channel('foamlab-social:'+who,{config:{private:true}});channel=active;active.on('broadcast',{event:'social'},event=>{
   if(owner!==who||generation!==epoch||channel!==active)return;const data=event.payload||{};invalidateLists();
   if(data.kind==='friend_request')notify('收到新的好友申请，可在“好友 → 新的朋友”处理。');
   if(data.kind==='friend_accepted')notify('你的好友申请已通过。');
   if(data.kind==='town_reward'){notify('已获得“好伙伴友谊”称号。');window.dispatchEvent(new Event('foam-social-reward'));}
   clearTimeout(signalTimer);signalTimer=setTimeout(()=>{void refreshSummary(true);refreshOpenList();if(currentPeer===data.peer_id)void refreshChat();},90);
  }).subscribe(state=>{if(owner!==who||generation!==epoch||channel!==active)return;if(state==='SUBSCRIBED'){clearTimeout(retryTimer);void refreshSummary(true);if(currentPeer)void refreshChat();}if(['CLOSED','CHANNEL_ERROR','TIMED_OUT'].includes(state)){clearTimeout(retryTimer);retryTimer=setTimeout(()=>{if(owner===who&&generation===epoch&&channel===active){channel=null;A.client.removeChannel(active).catch(()=>{});connect();}},4000);}});
 }
 async function identity(){
  await A.ready;const next=A.user?.id||'';entrances();if(next===owner)return;
  const previous=owner;stop();owner=next;summary={};lastSummary=0;summaryPending=null;summaryAgain=false;summaryVersion++;profiles.clear();chats.clear();drafts.clear();invalidateLists();listCache.clear();currentPeer=null;
  document.querySelectorAll('.social-dialog').forEach(d=>d.close());
  if(previous){try{sessionStorage.removeItem(draftKey(previous));}catch{}}
  if(owner){try{for(const [id,value] of JSON.parse(sessionStorage.getItem(draftKey(owner))||'[]'))if(uuid(id)&&typeof value==='string')drafts.set(id,value.slice(0,5000));}catch{}connect();void refreshSummary(true);pollTimer=setInterval(()=>{if(document.hidden)return;void refreshSummary();if(hub?.open){refreshOpenList();if(currentPeer)void refreshChat();}},15000);}
  badges();
 }
 document.addEventListener('click',e=>{const profile=e.target.closest('[data-social-profile]'),open=e.target.closest('[data-social-open]');if(profile){e.preventDefault();e.stopPropagation();void showProfile(profile.dataset.socialProfile);}else if(open){e.preventDefault();e.stopPropagation();void openHub(open.dataset.socialOpen||'friends');}});
 document.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.matches('[data-social-profile][role=button]')){e.preventDefault();e.target.click();}});
 window.addEventListener('foam-auth-change',()=>void identity());window.addEventListener('online',()=>{void refreshSummary(true);if(currentPeer)void refreshChat();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){void refreshSummary(true);if(currentPeer)void refreshChat();}});
 window.addEventListener('pagehide',stop);window.addEventListener('pageshow',e=>{if(e.persisted&&owner){connect();pollTimer=setInterval(()=>{if(!document.hidden)void refreshSummary();},15000);}});
 void identity().then(continueTownInvite);
})();
