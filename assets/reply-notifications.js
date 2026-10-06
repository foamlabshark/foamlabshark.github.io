'use strict';
(() => {
 const auth=window.foamAuth,lab=window.FoamLab,host=document.querySelector('#reply-notifications');if(!auth||!lab)return;
 const {esc}=lab;let account='',unread=0,items=[],hasMore=false,queue=Promise.resolve(),countPending=null,listPending=null,lastCheck=0;
 const active=()=>host&&document.querySelector('.account-page')?.dataset.accountSection==='notifications';
 const status=text=>{if(host)host.querySelector('[data-notifications-status]').textContent=text;};
 function badges(){
  document.querySelectorAll('[data-reply-count]').forEach(n=>{n.hidden=!auth.user||unread===0;n.textContent=unread>99?'99+':String(unread);n.title=unread+' 条未读回复';n.setAttribute('aria-label',n.title);});
  if(host)host.querySelector('[data-notifications-read-all]').disabled=!auth.user||!unread;
 }
 function identity(){const id=auth.user?.id||'';if(id!==account){account=id;unread=0;items=[];hasMore=false;lastCheck=0;countPending=null;listPending=null;badges();render();}return id;}
 function rpc(operation,payload={}){
  const owner=identity();if(!owner)return Promise.resolve(null);
  const request=queue.catch(()=>{}).then(async()=>{
   if(auth.user?.id!==owner)return null;
   const {data,error}=await auth.client.rpc('foamlab_reply_notifications',{operation,payload});
   if(auth.user?.id!==owner)return null;if(error)throw error;
   unread=Number(data?.unread_count)||0;badges();return data;
  });queue=request;return request;
 }
 function link(row){return (row.thread_id?'/community/?topic='+encodeURIComponent(row.thread_id):'/read/?slug='+encodeURIComponent(row.slug))+'#comment-'+encodeURIComponent(row.message_id);}
 function render(){
  if(!host)return;const list=host.querySelector('.reply-notification-list');
  list.innerHTML=items.map(row=>'<a class="reply-notification '+(row.read_at?'':'is-unread')+'" data-notification-id="'+esc(row.id)+'" href="'+esc(link(row))+'"><div class="reply-notification-meta">'+(row.read_at?'':'<span class="reply-unread-dot" aria-label="未读"></span>')+'<strong>'+esc(row.author_name)+'</strong><span>'+esc(({comment:'回复了你的评论',content:'回复了你的文章',thread:'回复了你的讨论'})[row.kind]||'发来了回复')+'</span><time datetime="'+esc(row.created_at)+'">'+esc(lab.dateTime(row.created_at))+'</time></div><h3>'+esc(row.title)+'</h3><p>'+esc(row.excerpt)+'</p></a>').join('');
  host.querySelector('.reply-notification-more').hidden=!hasMore;
  status(!auth.user?'登录后查看收到的回复。':items.length?(unread?'有 '+unread+' 条未读回复':'已读完收到的回复。'):'还没有收到回复。');
 }
 async function refreshCount(force=false){
  await auth.ready;if(!identity()||document.hidden)return;const now=Date.now();
  if(countPending)return countPending;if(!force&&now-lastCheck<15000)return;lastCheck=now;
  const task=rpc('count').catch(()=>{}).finally(()=>{if(countPending===task)countPending=null;});countPending=task;return task;
 }
 async function load(append=false){
  await auth.ready;if(!identity()){render();return;}if(listPending)return listPending;
  const before=append?items.at(-1):null,owner=account;status('正在读取回复…');
  const more=host.querySelector('.reply-notification-more');more.disabled=true;
  const task=rpc('list',before?{before_time:before.created_at,before_id:before.id}:{}).then(data=>{
   if(!data||owner!==account)return;const page=data.items||[];hasMore=page.length>50;const known=new Set(append?items.map(r=>r.id):[]);items=[...(append?items:[]),...page.slice(0,50).filter(r=>!known.has(r.id))];render();
  }).catch(()=>{if(owner===account)status('消息暂时未能加载，请点击刷新重试。');}).finally(()=>{more.disabled=false;if(listPending===task)listPending=null;});listPending=task;return task;
 }
 function broadcast(){try{localStorage.setItem('foamlab.reply-notifications.changed',String(Date.now()));}catch{}}
 async function mark(id){const data=await rpc('read',{id});if(!data)return;const row=items.find(r=>r.id===id);if(row)row.read_at=new Date().toISOString();broadcast();render();}
 if(host){
  host.querySelector('[data-notifications-refresh]').onclick=()=>load();
  host.querySelector('.reply-notification-more').onclick=()=>load(true);
  host.querySelector('[data-notifications-read-all]').onclick=async e=>{const button=e.currentTarget;button.disabled=true;try{const data=await rpc('read_all');if(data){items.forEach(r=>r.read_at||=new Date().toISOString());broadcast();render();}}catch{status('已读状态暂时未能保存，请重试。');}finally{badges();}};
  host.addEventListener('click',async e=>{const a=e.target.closest('[data-notification-id]');if(!a)return;const owner=account;
   if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey){void mark(a.dataset.notificationId).catch(()=>{});return;}
   e.preventDefault();try{await mark(a.dataset.notificationId);}catch{}if(auth.user?.id===owner)location.href=a.href;
  });
 }
 addEventListener('foamlab:account-tab',e=>{badges();if(e.detail.key==='notifications')void load();});
 addEventListener('foam-auth-change',()=>{identity();if(active())void load();else void refreshCount();});
 addEventListener('focus',()=>{if(active())void load();else void refreshCount();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(active())void load();else void refreshCount();}});
 document.querySelector('#account-nav-label')?.addEventListener('click',()=>void refreshCount());
 addEventListener('storage',e=>{if(e.key==='foamlab.reply-notifications.changed'){if(active())void load();else void refreshCount(true);}});
 setInterval(()=>{if(!document.hidden)void refreshCount();},45000);
 auth.ready.then(()=>{identity();if(active())void load();else void refreshCount();});
 window.FoamReplyNotifications={refresh:()=>active()?load():refreshCount(true)};
})();
