/* directory.js */
'use strict';
(() => {
 const L=window.FoamLab,esc=L.esc;
 const D=window.FoamDirectory={nodes:[],available:false};
 D.get=id=>D.nodes.find(n=>n.id===id);
 D.children=id=>D.nodes.filter(n=>n.parent_id===(id||null)).sort((a,b)=>a.sort_order-b.sort_order||a.name.localeCompare(b.name));
 const directoryIndexes=new WeakMap();
 D.descendants=(id,nodes=D.nodes)=>{
  let index=directoryIndexes.get(nodes);
  if(!index){const children=new Map();for(const n of nodes){if(!children.has(n.parent_id))children.set(n.parent_id,[]);children.get(n.parent_id).push(n.id);}index={children,descendants:new Map()};directoryIndexes.set(nodes,index);}
  if(!index.descendants.has(id)){const seen=new Set([id]),queue=[id];for(let i=0;i<queue.length;i++)for(const child of index.children.get(queue[i])||[])if(!seen.has(child)){seen.add(child);queue.push(child);}index.descendants.set(id,queue);}
  return [...index.descendants.get(id)];
 };
 D.ancestors=id=>{const out=[],seen=new Set();for(let n=D.get(id);n&&!seen.has(n.id);n=D.get(n.parent_id)){seen.add(n.id);out.unshift(n);}return out;};
 D.path=id=>D.ancestors(id).map(n=>n.name).join(' / ');
 D.isVisible=n=>D.ancestors(n.id).every(x=>x.visible);
 // A database array is an unordered set of placements. Prefer the programming
 // module for its lessons, even when they are also referenced by a physics topic.
 D.primary=item=>{const nodes=(item?.section_ids||[]).map(D.get).filter(n=>n&&D.isVisible(n));if(item?.track==='OpenFOAM 编程'){const root=D.nodes.find(n=>n.key==='programming');return nodes.find(n=>D.ancestors(n.id).some(a=>a.id===root?.id))||nodes[0];}return nodes[0];};
 D.url=n=>{if(n?.href&&!n.href.startsWith('/read/?')&&!(n.key==='programming-examples'&&n.href.startsWith('/programming/?'))){try{const u=new URL(n.href,location.origin);if(u.origin===location.origin)return u.pathname+u.search+u.hash;}catch{}}return '/section/?id='+encodeURIComponent(n.id);};
 D.locations=row=>(row.section_ids||[]).map(D.path).filter(Boolean);
 D.options=(selected='',exclude=[])=>'<option value="">顶层模块</option>'+D.nodes.filter(n=>!exclude.includes(n.id)).map(n=>'<option value="'+n.id+'" '+(n.id===selected?'selected':'')+'>'+esc(D.path(n.id))+'</option>').join('');
 D.current=(nodes=D.nodes)=>{const u=new URL(location.href),id=u.searchParams.get('id');if(u.pathname==='/section/')return nodes.find(n=>n.id===id);return nodes.filter(n=>n.href&&n.href!=='/admin/'&&(()=>{const v=new URL(n.href,location.origin);return v.pathname===u.pathname&&[...v.searchParams].every(([k,x])=>u.searchParams.get(k)===x);})()).sort((a,b)=>new URL(b.href,location.origin).search.length-new URL(a.href,location.origin).search.length)[0];};
 const contentReads=new Map(),hintKey='foamlab.directory-hint.v1';
 function readContent(ids){
  const key=[...ids].sort().join(',');if(contentReads.has(key))return contentReads.get(key);
  const pending=(async()=>{const rows=[];for(let start=0;;start+=500){const batch=L.check(await L.client.from('foamlab_content').select('id,slug,kind,title,summary,track,series,cover_url,metadata,section_ids,author_id,author_name,sort_order,pinned,published_at,created_at,updated_at').eq('status','published').overlaps('section_ids',ids).order('sort_order').order('id').range(start,start+499));rows.push(...batch);if(batch.length<500)return rows;}})().catch(error=>{contentReads.delete(key);throw error;});
  contentReads.set(key,pending);return pending;
 }
 function prefetchCatalog(){
  // Cached IDs only schedule a fresh request. Never render cached names or rows.
  const catalog=document.querySelector('[data-lab-catalog]'),hub=document.querySelector('#topic-hub'),home=document.querySelector('#home-special-topics');if(!catalog&&!hub&&!home)return;
  try{const saved=JSON.parse(sessionStorage.getItem(hintKey)||'null');if(!saved||saved.user!==(L.user?.id||null)||Date.now()-saved.at>86400000||!Array.isArray(saved.nodes)||saved.nodes.length>2000)return;
   const nodes=saved.nodes,key=home?'topics':catalog?.dataset.labCatalog||hub?.dataset.root||'topics',node=(!home&&D.current(nodes))||nodes.find(n=>n.key===key);
   if(node)void readContent(D.descendants(node.id,nodes)).catch(()=>{});
  }catch{}
 }
 D.load=async()=>{await L.contentReady;prefetchCatalog();const nodes=[];for(let start=0;;start+=500){const r=L.check(await L.client.from('foamlab_sections').select('*').order('sort_order').order('id').range(start,start+499));nodes.push(...r);if(r.length<500)break;}D.nodes=nodes;D.available=true;
  try{sessionStorage.setItem(hintKey,JSON.stringify({user:L.user?.id||null,at:Date.now(),nodes:nodes.map(({id,key,href,parent_id})=>({id,key,href,parent_id}))}));}catch{}
  return D;
 };
 D.ready=D.load().catch(e=>{D.error=e;return D;});
 document.dispatchEvent(new Event('foamlab:directory-init'));
 D.content=node=>readContent(D.descendants(node.id));
 D.picker=(host,ids=[],editable=true)=>{
  host.innerHTML='<h3>所在位置</h3><p class="cms-muted">可选择多个目录，同一篇正文会同时出现在这些位置。</p><div class="cms-selected-locations" role="status"></div><input type="search" class="cms-location-search" placeholder="查找模块或子模块" aria-label="查找发布位置"><div class="cms-location-picker">'+D.nodes.map(n=>'<label data-location-label="'+esc(D.path(n.id).toLowerCase())+'"><input type="checkbox" name="section_ids" value="'+n.id+'" '+(ids.includes(n.id)?'checked':'')+' '+(!editable?'disabled':'')+'><span>'+esc(D.path(n.id))+'</span></label>').join('')+'</div>';
  const selected=()=>{const paths=D.readPicker(host).map(D.path);host.querySelector('.cms-selected-locations').textContent=paths.length?'已选择：'+paths.join('；'):'未归类';};selected();host.addEventListener('change',selected);
  host.querySelector('input[type=search]').oninput=e=>host.querySelectorAll('[data-location-label]').forEach(row=>row.hidden=!row.dataset.locationLabel.includes(e.target.value.trim().toLowerCase()));
 };
 D.readPicker=host=>[...host.querySelectorAll('[name=section_ids]:checked')].map(x=>x.value);
 D.nav=()=>{
  if(!D.available)return;const nav=document.querySelector('#sidebar nav');if(!nav)return;
  D.icons=D.icons||Object.fromEntries([...nav.querySelectorAll('[data-nav-section]')].map(g=>[g.dataset.navSection,g.querySelector('.nav-parent>a svg')?.outerHTML||'']));
  const icons={home:'⌂',start:'→',courses:'▤',topics:'▦',commands:'⌘',dictionaries:'▧',programming:'⌘',tools:'▦',resources:'↓',sharing:'▤',community:'♧',assignments:'☑',announcements:'♧'};
  const focus=nav.contains(document.activeElement)?{key:document.activeElement.closest('[data-nav-section]')?.dataset.navSection,arrow:document.activeElement.matches('.nav-expand')}:null;
  const current=D.current(),active=new Set(D.ancestors(current?.id).map(n=>n.id));
  const item=(n,depth=0)=>{const children=D.children(n.id).filter(D.isVisible),open=window.FoamNavigation?.isOpen(n.key)===true;return '<div class="nav-group" data-directory-id="'+n.id+'" data-nav-section="'+esc(n.key)+'"><div class="nav-parent"><a class="nav-item '+(depth?'nav-subitem ':'')+(active.has(n.id)?'active':'')+'" href="'+esc(D.url(n))+'" '+(n.id===current?.id?'aria-current="page"':'')+'>'+(depth?'':(D.icons[n.key]||D.icons.topics||'<span class="directory-icon" aria-hidden="true">'+(icons[n.key]||'▦')+'</span>'))+'<span>'+esc(n.name)+'</span></a>'+(children.length?'<button type="button" class="nav-expand" aria-controls="directory-'+n.id+'" aria-expanded="'+open+'" aria-label="'+(open?'收起':'展开')+esc(n.name)+'子目录"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6"/></svg></button>':'')+'</div>'+(children.length?'<div class="nav-subgroup" id="directory-'+n.id+'" '+(open?'':'hidden')+'>'+children.map(c=>item(c,depth+1)).join('')+'</div>':'')+'</div>';};
  const roots=D.children(null).filter(D.isVisible),town=roots.find(n=>n.key==='town'),regular=roots.filter(n=>n.key!=='town'),groups=[...new Set(regular.map(n=>n.nav_group))];
  const townLink=town?'<a class="town-entry town-nav-entry" href="'+esc(D.url(town))+'"><i class="town-nav-panda" aria-hidden="true"></i><span><strong>'+esc(town.name)+'</strong><small>带熊猫去逛逛</small></span><b aria-hidden="true">↗</b></a>':'';
  nav.innerHTML=townLink+groups.map(group=>'<div class="nav-label">'+esc(group)+'</div>'+regular.filter(n=>n.nav_group===group).map(n=>item(n)).join('')).join('');
  if(focus?.key){const group=[...nav.querySelectorAll('[data-nav-section]')].find(g=>g.dataset.navSection===focus.key);group?.querySelector(focus.arrow?':scope > .nav-parent > .nav-expand':':scope > .nav-parent > a')?.focus({preventScroll:true});}
 };
 D.breadcrumb=item=>{
  const ids=(item?.section_ids||[]).filter(id=>D.get(id)&&D.isVisible(D.get(id)));if(!ids.length)return;
  let node=D.primary(item)||D.get(ids[0]),returnTo='';try{const from=sessionStorage.getItem('foamlab.returnFor:'+location.pathname+location.search);if(from){const url=new URL(from,location.origin),matches=D.nodes.filter(n=>{const target=new URL(D.url(n),location.origin);return url.origin===location.origin&&target.pathname===url.pathname&&[...target.searchParams].every(([k,v])=>url.searchParams.get(k)===v);}).sort((a,b)=>new URL(D.url(b),location.origin).search.length-new URL(D.url(a),location.origin).search.length),found=matches[0];if(found&&ids.some(id=>D.descendants(found.id).includes(id))){node=found;returnTo=url.pathname+url.search+url.hash;}}}catch{}
  // A directory's own page returns to its parent, or the overview at the root.
  const target=new URL(D.url(node),location.origin),current=new URL(location.href);
  const isSelf=target.pathname===current.pathname&&[...target.searchParams].every(([k,v])=>current.searchParams.get(k)===v);
  let rootPage=false;if(isSelf){const parent=D.get(node.parent_id);rootPage=!parent;node=parent||node;returnTo='';}
  const parentURL=rootPage?'/':returnTo||D.url(node),parentName=rootPage?'学习概览':node.name;
  const link=document.querySelector('#breadcrumb-parent'),back=document.querySelector('#page-back-link');if(link){link.href=parentURL;link.textContent=rootPage?'学习概览':D.path(node.id);}if(back){back.href=parentURL;back.textContent='← 返回'+parentName;}
  const nav=document.querySelector('#sidebar nav');nav?.querySelectorAll('.active,[aria-current=page]').forEach(a=>{a.classList.remove('active');a.removeAttribute('aria-current');});
  for(const n of D.ancestors(node.id)){const group=nav?.querySelector('[data-directory-id="'+n.id+'"]');const link=group?.querySelector('.nav-parent>a');link?.classList.add('active');if(n.id===node.id)link?.setAttribute('aria-current','page');}
 };
 document.addEventListener('foamlab:content-ready',e=>D.ready.then(()=>D.breadcrumb(e.detail)));
 D.ready.then(async()=>{
  D.nav();if(window.foamCurrentContent)D.breadcrumb(window.foamCurrentContent);
  if(!D.available)return;
  // Reference indexes keep their code previews; their categories follow the same tree.
  const reference=document.querySelector('#command-list,#dictionary-list');
  if(reference){
   const key=reference.id==='command-list'?'commands':'dictionaries',node=D.nodes.find(n=>n.key===key),current=D.current(),button=document.querySelector('[data-command-filter],[data-dictionary-filter]');
   if(node&&button){const tabs=button.parentElement;tabs.innerHTML=[node,...D.children(node.id).filter(D.isVisible)].map(n=>'<a class="'+(n.id===current?.id?'selected':'')+'" '+(n.id===current?.id?'aria-current="page" ':'')+'href="'+esc(D.url(n))+'">'+esc(n.id===node.id?'全部':n.name)+'</a>').join('');}
   if(!current)return;
   const heading=document.querySelector('.page-heading h1');if(heading&&node)heading.textContent=node.name;
   try{
    const rows=await D.content(current),asset=key==='commands'?'/assets/commands.json':'/assets/dictionaries.json',response=await fetch(asset),known=await response.json(),paths=new Set(known.map(x=>x.url)),extra=rows.filter(r=>!paths.has(r.metadata?.canonical_path));
    if(extra.length){const host=document.createElement('section');host.className='directory-extra';host.innerHTML='<h2>本目录中的其他内容</h2><div class="lab-card-grid"></div>';reference.parentElement.append(host);const grid=host.querySelector('.lab-card-grid');await L.names(extra.map(r=>r.author_id));const render=()=>{grid.innerHTML=window.FoamPagination.slice(grid,extra,render,12).map(L.card).join('');};render();}
   }catch{}
  }
  // Home, quick start and functional pages can host newly placed content too.
  const current=D.current();
  if(current&&!reference&&!document.querySelector('[data-lab-catalog],#topic-hub,#fo-list,#model-list,.quick-reference-hub,#live-article,.article[data-cms-slug],#cms-root,#town-app')&&!location.pathname.startsWith('/admin/')){
   try{
    const host=document.querySelector('main .page-wrap')||document.querySelector('main'),links=new Set([...host.querySelectorAll('a[href]')].map(a=>new URL(a.href).pathname+new URL(a.href).search));
    const children=D.children(current.id).filter(n=>D.isVisible(n)&&!links.has(n.href)&&!links.has(D.url(n)));
    const rows=(await D.content(current)).filter(r=>!links.has(r.metadata?.canonical_path)&&!links.has('/read/?slug='+encodeURIComponent(r.slug)));
    if(children.length||rows.length){const section=document.createElement('section');section.className='directory-supplement';section.innerHTML='<h2>本目录内容</h2><nav class="directory-children">'+children.map(n=>'<a href="'+esc(D.url(n))+'">'+esc(n.name)+' →</a>').join('')+'</nav><div class="lab-card-grid"></div>';host.append(section);if(rows.length){const grid=section.querySelector('.lab-card-grid');await L.names(rows.filter(r=>['article','log'].includes(r.kind)).map(r=>r.author_id));const render=()=>{grid.innerHTML=window.FoamPagination.slice(grid,rows,render,12).map(L.card).join('');};render();window.addEventListener('popstate',render);window.foamListState.remember(grid);}}
   }catch{}
  }
 });
 window.addEventListener('popstate',()=>D.nav());
})();

;
/* account-menu.js */
'use strict';
(() => {
 const auth=window.foamAuth,panel=document.querySelector('#account-panel'),trigger=document.querySelector('#account-nav-label');
 if(!auth||!panel||!trigger)return;
 document.body.append(panel);
 const $=selector=>panel.querySelector(selector),put=(selector,value)=>{$(selector).textContent=value;};
 let cached={},cachedUser=null;
 const key=id=>'foamlab.account-summary:'+id;
 function readSummary(){
  cached={};cachedUser=auth.user?.id||null;
  if(!cachedUser)return;
  try{const value=JSON.parse(localStorage.getItem(key(cachedUser)));if(value?.userId===cachedUser)cached=value;}catch{}
 }
 function cacheSummary({profile=false,pet=false}={}){
  if(!auth.user)return;
  const displayName=profile?auth.profile?.display_name||cached.displayName:cached.displayName;
  const growth=pet?auth.pet||cached.pet:cached.pet;
  // Display-only cache. Identity, permissions and experience awards always use
  // the Supabase session and server APIs, never these cached values.
  cached={userId:auth.user.id,displayName,pet:growth};
  try{localStorage.setItem(key(auth.user.id),JSON.stringify(cached));}catch{}
 }
 function render(){
  if(cachedUser!==auth.user?.id)readSummary();
  const signed=!!auth.user,meta=auth.user?.user_metadata||{};
  const name=cached.displayName||auth.profile?.display_name||meta.full_name||meta.user_name||'学习者';
  panel.dataset.authState=auth.loading?'loading':signed?'authenticated':'anonymous';
  $('#account-panel-member').hidden=!signed;$('#account-panel-guest').hidden=signed||auth.loading;$('#account-panel-badge').hidden=!signed;
  put('#account-panel-name',signed?String(name):'个人中心');if(window.FoamAvatar)window.FoamAvatar.render();else put('#account-panel-avatar',signed?String(name).slice(0,1).toUpperCase():'F');
  put('#account-panel-status',auth.loading?'正在恢复登录…':signed?'GitHub 账号已登录':'尚未登录');
  const pet=cached.pet||auth.pet;
  if(signed&&pet&&Number.isFinite(pet.level)&&Number.isFinite(pet.xp)&&Number.isFinite(pet.next_level_xp)){
   put('#account-panel-level','Lv.'+pet.level);
   put('#account-panel-xp',pet.xp+' 经验 · 距下一级 '+Math.max(0,pet.next_level_xp-pet.xp)+' 经验');
   const range=pet.next_level_xp-pet.level_start;
   $('#account-panel-xp-bar').style.width=(range>0?Math.max(0,Math.min(100,100*(pet.xp-pet.level_start)/range)):0)+'%';
  }else{put('#account-panel-level',auth.petError?'等级暂未读取':'等级读取中…');put('#account-panel-xp',auth.petError?'可前往“我的熊猫”重试':'正在读取成长记录');$('#account-panel-xp-bar').style.width='0%';}
  panel.querySelectorAll('[data-account-sign-out]').forEach(b=>{b.disabled=auth.signingOut;b.textContent=auth.signingOut?'正在退出…':'退出登录';});
  $('#account-panel-sign-in').disabled=auth.loading||!auth.configured;
  panel.querySelectorAll('[data-management-link]').forEach(a=>a.hidden=!['admin','editor','moderator'].includes(window.FoamLab?.role));
 }
 function position(){
  const r=trigger.getBoundingClientRect(),width=Math.min(340,innerWidth-24);
  panel.style.width=width+'px';panel.style.left=Math.max(12,Math.min(r.right-width,innerWidth-width-12))+'px';
  panel.style.top=(r.bottom+12)+'px';panel.style.maxHeight=Math.max(160,innerHeight-r.bottom-24)+'px';
 }
 function close(focus=false){panel.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();}
 trigger.addEventListener('click',e=>{e.preventDefault();const open=panel.hidden;close();if(open){render();panel.hidden=false;trigger.setAttribute('aria-expanded','true');position();$('#account-panel-close').focus({preventScroll:true});}});
 $('#account-panel-close').addEventListener('click',()=>close(true));
 document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!trigger.contains(e.target))close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();close(true);}});
 document.addEventListener('focusin',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!trigger.contains(e.target))close();});
 addEventListener('resize',()=>{if(!panel.hidden)position();});
 addEventListener('scroll',()=>{if(!panel.hidden)position();},{passive:true});
 $('#account-panel-sign-in').addEventListener('click',async()=>{
  const b=$('#account-panel-sign-in');b.disabled=true;$('#account-panel-message').hidden=true;
  try{await auth.signIn({returnTo:location.pathname+location.search+location.hash});}
  catch{put('#account-panel-message','登录暂时无法发起，请稍后重试。');$('#account-panel-message').hidden=false;}
  finally{b.disabled=false;}
 });
 panel.querySelector('[data-account-sign-out]').addEventListener('click',async()=>{await auth.signOut();render();});
 addEventListener('foam-auth-change',e=>{if(cachedUser&&cachedUser!==auth.user?.id){try{localStorage.removeItem(key(cachedUser));}catch{}}readSummary();cacheSummary({profile:e.detail?.accountUpdated});render();});
 addEventListener('foam-pet-change',()=>{readSummary();cacheSummary({pet:true});render();});
 addEventListener('storage',e=>{if(auth.user&&e.key===key(auth.user.id)){readSummary();render();}});
 auth.ready.then(()=>{readSummary();render();});
 window.FoamLab?.ready.then(render).catch(()=>{});
 render();
})();

;
/* reply-notifications.js */
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

;
/* browser-code.js */
'use strict';
(() => {
 const MAX_SIZE=32768,queue=[],seen=new WeakSet();let worker=null,current=null,serial=0,timeout=null,disabled=false;
 const idle=fn=>window.requestIdleCallback?requestIdleCallback(fn,{timeout:300}):setTimeout(fn,16);
 function plain(node){node.dataset.foamHighlight='plain';}
 function finish(data){if(!current||data.id!==current.id)return;clearTimeout(timeout);const {node,source}=current;if(node.isConnected&&node.textContent===source){if(data.html!==undefined){node.innerHTML=data.html;node.classList.add('hljs');node.dataset.foamHighlight='complete';}else plain(node);}current=null;idle(next);}
 function next(){if(current||disabled)return;while(queue.length){const node=queue.shift();if(!node.isConnected)continue;const source=node.textContent;if(!source||source.length>MAX_SIZE){plain(node);continue;}const language=(node.className.match(/language-([\w+-]+)/)?.[1]||'plaintext').toLowerCase();if(['plaintext','text','txt'].includes(language)){plain(node);continue;}
  try{if(!worker){worker=new Worker('/assets/browser-code-worker.js');worker.onmessage=e=>finish(e.data);worker.onerror=()=>{disabled=true;clearTimeout(timeout);if(current)plain(current.node);worker.terminate();worker=null;current=null;};}current={id:++serial,node,source};worker.postMessage({id:serial,language,code:source});timeout=setTimeout(()=>{if(!current)return;plain(current.node);current=null;worker.terminate();worker=null;idle(next);},1200);return;}catch{disabled=true;plain(node);return;}
 }}
 const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){observer.unobserve(entry.target);queue.push(entry.target);}idle(next);},{rootMargin:'250px'}):null;
 function scan(root){const nodes=[];if(root.matches?.('pre > code'))nodes.push(root);if(root.querySelectorAll)nodes.push(...root.querySelectorAll('pre > code'));for(const node of nodes){if(seen.has(node)||node.classList.contains('hljs'))continue;seen.add(node);if(node.textContent.length>MAX_SIZE){plain(node);continue;}if(observer)observer.observe(node);else queue.push(node);}if(!observer)idle(next);}
 const changes=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)scan(node);});
 const start=()=>{scan(document);changes.observe(document.body,{childList:true,subtree:true});};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 window.foamHighlightCode=scan;
})();

;
/* support.js */
'use strict';
(() => {
 const L=window.FoamLab,$=L.$,esc=L.esc;
 const validImage=value=>{const raw=typeof value==='string'?value.trim():'';if(!raw||!(/^https:\/\//i.test(raw)||/^\/(?!\/)/.test(raw)||raw.startsWith(location.origin+'/')))return '';const url=L.safeURL(raw);if(!url)return '';try{const u=new URL(url);if((u.protocol!=='https:'&&u.origin!==location.origin)||u.username||u.password)return '';return u.href;}catch{return '';}};
 async function read(){return L.check(await L.client.from('foamlab_settings').select('value').eq('key','support').maybeSingle())?.value||{};}
 const trigger=document.querySelector('[data-support-open]');
 if(trigger){
  const wrap=document.createElement('span');wrap.className='support-hover';
  trigger.replaceWith(wrap);wrap.append(trigger);trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','support-popover');
  const panel=document.createElement('div');panel.id='support-popover';panel.className='support-popover';panel.hidden=true;panel.setAttribute('role','region');panel.setAttribute('aria-label','支持作者收款码');wrap.append(panel);
  let loaded=false,pending=null,wanted=false;
  const hide=()=>{wanted=false;panel.hidden=true;trigger.setAttribute('aria-expanded','false');};
  async function show(){wanted=true;panel.hidden=false;trigger.setAttribute('aria-expanded','true');if(loaded)return;
   if(!pending)pending=(async()=>{panel.innerHTML='<span class="muted">正在读取收款码…</span>';try{await L.ready;const cfg=await read();const providers=[['微信','wechat',validImage(cfg.wechat_url)],['支付宝','alipay',validImage(cfg.alipay_url)]].filter(x=>x[2]);
    if(!cfg.enabled||!providers.length){panel.innerHTML='<span class="muted">支持入口暂未启用</span>';return;}
    panel.innerHTML='<div class="support-mini-codes">'+providers.map(([name,key,url])=>'<a class="support-mini-code '+key+'" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer" aria-label="查看'+name+'收款码原图"><span class="support-code-crop"><img src="'+esc(url)+'" alt="'+name+'收款码"></span><span>'+name+'</span></a>').join('')+'</div><small>感谢支持 · 点击查看原图</small>';loaded=true;
   }catch{panel.innerHTML='<span class="muted">收款码暂时无法读取</span>';}finally{pending=null;if(!wanted)hide();}})();
   await pending;
  }
  wrap.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')show();});
  wrap.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')hide();});
  wrap.addEventListener('focusin',event=>{if(event.target!==trigger||matchMedia('(hover: hover)').matches)show();});
  wrap.addEventListener('focusout',()=>{setTimeout(()=>{if(!wrap.contains(document.activeElement))hide();},0);});
  trigger.addEventListener('click',e=>{e.preventDefault();if(matchMedia('(hover: hover)').matches){show();}else if(wanted)hide();else show();});
  document.addEventListener('pointerdown',e=>{if(wanted&&!wrap.contains(e.target))hide();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&wanted){hide();}});
 }
 const host=$('#support-content');
 if(host)(async()=>{try{await L.ready;const cfg=await read(),wechat=validImage(cfg.wechat_url),alipay=validImage(cfg.alipay_url);if(!cfg.enabled||(!wechat&&!alipay)){host.innerHTML='<div class="support-inactive"><div class="support-symbol">∿</div><h2>支持入口暂未启用</h2><p>课程、参考资料与公开讨论均可正常使用。</p><a class="button secondary" href="/courses/">返回课程目录</a></div>';return;}host.innerHTML='<p class="support-note">'+esc(cfg.message||'用于课程、资料与网站维护。')+'</p><div class="support-options">'+[['微信',wechat,'wechat'],['支付宝',alipay,'alipay']].filter(x=>x[1]).map(([name,url,cls])=>'<figure class="support-option '+cls+'"><figcaption><span>'+name+'</span><small>扫码支持</small></figcaption><img src="'+esc(url)+'" alt="'+name+'收款二维码" width="280" height="280"><a class="text-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">查看原图 ↗</a></figure>').join('')+'</div><p class="muted">你也可以通过完善示例、纠正资料和参与技术讨论支持本站。</p>';host.querySelectorAll('img').forEach(img=>img.onerror=()=>{img.replaceWith(Object.assign(document.createElement('p'),{className:'lab-evidence',textContent:'图片暂时无法载入，请稍后重试。'}));});}catch(e){L.error(host,e);}})();
 if(!$('#cms-root'))return;
 let pending=false;
 async function addSettings(){if(pending||!$('#cms-settings-form')||$('#cms-support-form')||L.role!=='admin')return;pending=true;try{const cfg=await read();if(!$('#cms-settings-form')||$('#cms-support-form'))return;const section=document.createElement('section');section.className='cms-support-settings';section.innerHTML='<h3>支持入口与收款码</h3><p class="muted">仅使用本人准备公开的真实收款码。可以在此选择图片上传，或粘贴已上传图片的 HTTPS 地址；核对预览后启用。</p><form id="cms-support-form"><label class="cms-check"><input type="checkbox" name="enabled" '+(cfg.enabled?'checked':'')+'> 启用支持入口</label><label class="form-field"><span>用途说明</span><input name="message" maxlength="200" value="'+esc(cfg.message||'用于课程、资料与网站维护。')+'"></label>'+[['wechat','微信'],['alipay','支付宝']].map(([key,name])=>'<div class="support-admin-provider"><label class="form-field"><span>'+name+'收款码图片地址</span><input name="'+key+'_url" value="'+esc(cfg[key+'_url']||'')+'" placeholder="https://…"></label><label class="button secondary">选择'+name+'收款码<input type="file" accept="image/png,image/jpeg,image/webp" data-support-upload="'+key+'" hidden></label><img class="support-admin-preview" data-support-preview="'+key+'" alt="'+name+'收款码预览" '+(validImage(cfg[key+'_url'])?'src="'+esc(validImage(cfg[key+'_url']))+'"':'hidden')+'></div>').join('')+'<button class="button" type="submit">保存支持设置</button><a class="text-link" href="/support/" target="_blank" rel="noopener">查看入口 ↗</a><p class="form-status" role="status"></p></form>';$('#cms-settings-form').after(section);const f=$('#cms-support-form'),status=f.querySelector('.form-status');
 let uploads=0,saving=false;const button=f.querySelector('[type=submit]'),updateBusy=()=>{button.disabled=uploads>0||saving;};
 for(const key of ['wechat','alipay']){const input=f.elements[key+'_url'],preview=f.querySelector('[data-support-preview='+key+']'),upload=f.querySelector('[data-support-upload='+key+']');input.oninput=()=>{const u=validImage(input.value);preview.hidden=!u;if(u)preview.src=u;else preview.removeAttribute('src');};upload.onchange=async e=>{const file=e.target.files[0];if(!file||upload.disabled||saving)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size===0||file.size>5*1024*1024){status.textContent='请选择不超过 5 MB 的有效 PNG、JPEG 或 WebP 图片。';return;}uploads++;upload.disabled=input.disabled=true;updateBusy();status.textContent='正在上传图片…';try{const ext=({'image/png':'png','image/jpeg':'jpg','image/webp':'webp'})[file.type],path='library/support-'+key+'-'+crypto.randomUUID()+'.'+ext;L.check(await L.client.storage.from('foamlab-resources').upload(path,file,{contentType:file.type,upsert:false}));input.value=L.client.storage.from('foamlab-resources').getPublicUrl(path).data.publicUrl;preview.src=input.value;preview.hidden=false;status.textContent='图片已上传；请核对后保存设置。';}catch(err){status.textContent=err.message;}finally{uploads--;upload.disabled=input.disabled=false;updateBusy();if(uploads)status.textContent='另有图片正在上传，请稍候…';}};}
 f.onsubmit=async e=>{e.preventDefault();if(uploads){status.textContent='请等待所有图片上传完成后再保存。';return;}if(saving)return;saving=true;updateBusy();const inputs=[...f.querySelectorAll('input')];inputs.forEach(input=>input.disabled=true);try{const value={enabled:f.elements.enabled.checked,message:f.elements.message.value.trim(),wechat_url:validImage(f.elements.wechat_url.value),alipay_url:validImage(f.elements.alipay_url.value)};for(const [key,name]of [['wechat','微信'],['alipay','支付宝']])if(f.elements[key+'_url'].value.trim()&&!value[key+'_url'])throw Error(name+'图片地址无效，请使用 HTTPS 图片地址或本站以 / 开头的图片路径。');if(value.enabled&&!value.wechat_url&&!value.alipay_url)throw Error('至少配置一种有效收款码后才能启用。');L.check(await L.client.from('foamlab_settings').upsert({key:'support',value,updated_at:new Date().toISOString()}));status.textContent='支持设置已保存。';}catch(err){status.textContent=err.message;}finally{saving=false;inputs.forEach(input=>input.disabled=false);updateBusy();}};
 }catch(e){window.foamNotify?.(e.message);}finally{pending=false;}}
 L.ready.then(()=>{const observer=new MutationObserver(()=>addSettings());observer.observe($('#cms-root'),{childList:true,subtree:true});addSettings();}).catch(()=>{});
})();

;
/* footer-contact.js */
'use strict';
(() => {
  const wrap = document.querySelector('[data-footer-contact]');
  if (!wrap) return;
  const trigger = wrap.querySelector('button');
  const panel = wrap.querySelector('.footer-contact-panel');
  let opened = false;
  const position = () => {
    panel.style.setProperty('--contact-shift', '0px');
    const bounds = panel.getBoundingClientRect();
    const edge = 12;
    const shift = bounds.left < edge ? edge - bounds.left
      : bounds.right > innerWidth - edge ? innerWidth - edge - bounds.right : 0;
    panel.style.setProperty('--contact-shift', shift + 'px');
  };
  const hide = () => {
    opened = false;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  };
  const show = () => {
    opened = true;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    position();
  };
  wrap.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && matchMedia('(hover: hover)').matches) show();
  });
  wrap.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') hide();
  });
  wrap.addEventListener('focusin', event => {
    if (event.target !== trigger || matchMedia('(hover: hover)').matches) show();
  });
  wrap.addEventListener('focusout', () => {
    setTimeout(() => { if (!wrap.contains(document.activeElement)) hide(); }, 0);
  });
  trigger.addEventListener('click', () => {
    if (matchMedia('(hover: hover)').matches || !opened) show();
    else hide();
  });
  document.addEventListener('pointerdown', event => {
    if (opened && !wrap.contains(event.target)) hide();
  });
  document.addEventListener('keydown', event => {
    if (opened && event.key === 'Escape') {
      if (panel.contains(document.activeElement)) trigger.focus();
      hide();
    }
  });
  window.addEventListener('resize', () => { if (opened) position(); });
})();

;
/* refinements.js */
'use strict';

// Passive visual feedback; navigation, form submission and text selection remain native.
(() => {
  if (window.foamRefinementsReady) return;
  window.foamRefinementsReady = true;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColours = matchMedia('(forced-colors: active)');
  let layer;
  let pointerStart;

  document.addEventListener('pointerdown', event => {
    pointerStart = event.isPrimary && event.button === 0
      ? { x: event.clientX, y: event.clientY, id: event.pointerId } : undefined;
  }, { passive: true });
  document.addEventListener('pointercancel', () => { pointerStart = undefined; }, { passive: true });

  document.addEventListener('click', event => {
    if (window.foamPandaParticles) return;
    if (reducedMotion.matches || forcedColours.matches || !event.isTrusted || event.detail === 0) return;
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest('input, textarea, select, option, [contenteditable="true"], [disabled], [aria-disabled="true"]')) return;
    // Ignore drags and text selections; keyboard activation uses the visible focus outline.
    if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 10) return;
    pointerStart = undefined;
    if (window.getSelection()?.toString()) return;
    if (!target.closest('main, .topbar, .sidebar, .footer, dialog')) return;
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'foam-ripple-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.append(layer);
    }
    // Keep the number of temporary decorative nodes bounded, including rapid repeated input.
    while (layer.childElementCount >= 6) layer.firstElementChild.remove();
    const ripple = document.createElement('span');
    ripple.className = 'foam-ripple';
    ripple.style.left = event.clientX + 'px';
    ripple.style.top = event.clientY + 'px';
    layer.append(ripple);
    setTimeout(() => ripple.remove(), 750);
  }, { passive: true });

  function clearRings() { if (reducedMotion.matches || forcedColours.matches) layer?.replaceChildren(); }
  reducedMotion.addEventListener('change', clearRings);
  forcedColours.addEventListener('change', clearRings);
})();

;
/* topics.js */
'use strict';
(() => {
 const L=window.FoamLab,esc=L.esc,hub=document.querySelector('#topic-hub'),home=document.querySelector('#home-special-topics');if(!hub&&!home)return;
 const known=new Set(Object.keys(L.topicLabels));
 const collectionLabel=hub?.dataset.collectionLabel||'专题',programming=hub?.dataset.root==='programming';
 if(hub&&(hub.dataset.topic||new URLSearchParams(location.search).get('topic'))==='algorithms'){location.replace('/topics/finite-volume/'+location.hash);return;}
 const topicURL=key=>known.has(key)?'/topics/'+key+'/':'/topics/?topic='+encodeURIComponent(key);
 const figure=item=>L.safeURL(item.cover_url)?'<img src="'+esc(L.safeURL(item.cover_url))+'" alt="'+esc(item.title)+'配图" loading="lazy">':'';
 function card(item,lessons){const key=item.metadata.topic_key,count=lessons.filter(x=>Array.isArray(x.metadata?.topics)&&x.metadata.topics.includes(key)).length;return '<a class="topic-collection" data-topic="'+esc(key)+'" href="'+topicURL(key)+'">'+figure(item)+'<div class="topic-collection-body"><small>'+count+' 个关联课程</small><h2>'+esc(item.title)+'</h2><p>'+esc(item.summary)+'</p><span class="text-link">进入专题 →</span></div></a>';}
 async function readAll(queryFactory){const all=[];for(let start=0;;start+=500){const rows=L.check(await queryFactory().range(start,start+499));all.push(...rows);if(rows.length<500)return all;}}
 (async()=>{try{await L.contentReady;await L.directoryReady;const D=window.FoamDirectory;
 if(D?.available){
  const root=D.nodes.find(n=>n.key===(hub?.dataset.root||'topics'));if(!root){if(hub)hub.innerHTML='<p>'+collectionLabel+'目录已调整，请从左侧导航选择。</p>';if(home)home.replaceChildren();return;}
  const node=(hub&&D.current())||root,children=D.children(root.id).filter(D.isVisible),all=await D.content(node);
  const ownIntro=(items,node)=>items.find(r=>(r.kind==='module'||r.metadata?.curriculum_series)&&r.kind!=='lesson'&&r.section_ids?.includes(node.id));
  const collection=(nodes=children)=>nodes.map(n=>{const ids=D.descendants(n.id),items=all.filter(r=>r.section_ids?.some(id=>ids.includes(id))),intro=ownIntro(items,n),count=items.filter(r=>r.id!==intro?.id&&r.kind!=='module'&&(!intro?.metadata?.curriculum_series||r.series===intro.metadata.curriculum_series)).length;return '<a class="topic-collection" href="'+esc(D.url(n))+'">'+(intro?figure(intro):'')+'<div class="topic-collection-body"><small>'+count+(programming?' 节课':' 篇内容')+'</small><h2>'+esc(n.name)+'</h2><p>'+esc(n.description||intro?.summary||'')+'</p><span class="text-link">进入'+collectionLabel+' →</span></div></a>';}).join('');
  if(home)home.innerHTML=collection();if(!hub)return;
  if(node.id===root.id){hub.querySelector('h1').textContent=root.name;hub.querySelector('.page-content-loading')?.remove();const grid=document.createElement('div');grid.className='topic-collection-grid';grid.innerHTML=collection();hub.append(grid);return;}
  const ids=D.descendants(node.id),items=all.filter(r=>r.section_ids?.some(id=>ids.includes(id))),intro=ownIntro(items,node),selected=items.filter(r=>r.id!==intro?.id&&r.kind!=='module'&&(!intro?.metadata?.curriculum_series||r.series===intro.metadata.curriculum_series)),subtopics=D.children(node.id).filter(D.isVisible);
  let introduction='';if(intro){const record=L.check(await L.client.from('foamlab_content').select('body').eq('id',intro.id).single());introduction=L.markdown(record.body);}
  const crumbs=D.ancestors(node.id).map(n=>n.id===node.id?'<span aria-current="page">'+esc(n.name)+'</span>':'<a href="'+esc(D.url(n))+'">'+esc(n.name)+'</a>').join('<span aria-hidden="true">/</span>');
  document.title=node.name+' · FoamLab';hub.innerHTML='<nav class="topic-breadcrumbs" aria-label="专题导航">'+crumbs+'</nav><header class="topic-detail-header"><div><h1>'+esc(node.name)+'</h1><p>'+esc(node.description||intro?.summary||'')+'</p><nav class="topic-section-links" aria-label="专题内容"><a href="#topic-courses">内容目录 · '+selected.length+' 篇 ↓</a></nav></div>'+(intro?figure(intro):'')+'</header>'+(introduction?'<section class="topic-introduction"><div class="prose">'+introduction+'</div></section>':'')+(subtopics.length?'<section id="topic-branches"><h2>'+ (node.key==='topic-meshes'?'选择网格主题':'子专题') +'</h2><div class="topic-collection-grid">'+collection(subtopics)+'</div></section>':'')+'<section id="topic-courses"><h2>'+'内容目录'+'</h2><div class="lab-card-grid"></div></section>';
  const grid=hub.querySelector('.lab-card-grid');window.foamListState.remember(grid);await L.names(selected.filter(r=>['article','log'].includes(r.kind)).map(r=>r.author_id));const render=()=>{grid.innerHTML=window.FoamPagination.slice(grid,selected,render,12).map(L.card).join('')||'<p>这里还没有发布内容。</p>';};render();window.addEventListener('popstate',render);return;
 }
 if(programming)throw D?.error||new Error('编程目录暂时无法读取，请刷新重试。');
 const [rawModules,lessons]=await Promise.all([readAll(()=>L.client.from('foamlab_content').select('*').eq('kind','module').eq('status','published').order('sort_order').order('slug')),readAll(()=>L.client.from('foamlab_content').select('id,slug,kind,title,summary,track,series,cover_url,metadata,sort_order').eq('kind','lesson').eq('status','published').order('sort_order').order('slug'))]);const modules=rawModules.filter(x=>typeof x.metadata?.topic_key==='string'&&x.metadata.topic_key);
 const collection=()=>modules.filter(x=>x.metadata.topic_key!=='algorithms').map(x=>card(x,lessons)).join('');
 if(home)home.innerHTML=collection();
 if(!hub)return;const key=hub.dataset.topic||new URLSearchParams(location.search).get('topic');if(!key){hub.querySelector('.page-content-loading')?.remove();const grid=document.createElement('div');grid.className='topic-collection-grid';grid.innerHTML=collection();hub.append(grid);return;}
 const item=modules.find(x=>x.metadata.topic_key===key);if(!item){hub.innerHTML='<div class="lab-empty"><h1>这个专题暂未发布</h1><p>可以先查看已经开放的专题和系统课程。</p><a class="button" href="/topics/">全部专题</a></div>';return;}
 const selected=lessons.filter(x=>key==='algorithms'?(x.track||'').includes('数值'):Array.isArray(x.metadata?.topics)&&x.metadata.topics.includes(key));const dedup=new Map();for(const lesson of selected)for(const file of L.courseDownloads(lesson)){if(!dedup.has(file.url))dedup.set(file.url,{...file,lessons:[]});dedup.get(file.url).lessons.push({slug:lesson.slug,title:lesson.title});}const files=[...dedup.values()];document.title=item.title+'专题 · FoamLab';
 hub.innerHTML='<nav class="topic-breadcrumbs" aria-label="专题导航"><a href="/topics/">全部专题</a><span>/</span><span>'+esc(item.title)+'</span></nav><header class="topic-detail-header"><div><div class="eyebrow">OPENFOAM v2512 / 专题学习</div><h1>'+esc(item.title)+'</h1><p>'+esc(item.summary)+'</p><nav class="topic-section-links"><a href="#topic-courses">内容目录 · '+selected.length+' 节 ↓</a><a href="#topic-cases">案例下载 · '+files.length+' 个包 ↓</a></nav></div>'+figure(item)+'</header><section class="topic-introduction"><div class="prose">'+L.markdown(item.body)+'</div></section><section id="topic-courses"><div class="topic-section-heading"><h2>内容目录</h2></div><div class="lab-card-grid">'+(selected.map(L.card).join('')||'<p class="lab-empty">内容目录正在整理。</p>')+'</div></section><section id="topic-cases"><div class="topic-section-heading"><h2>专题案例下载</h2></div><div class="topic-case-list">'+files.map(file=>'<section class="lesson-downloads"><div class="lesson-download-row">'+L.downloadLink(file)+'<p>'+esc(file.description||'先阅读包内 README，再进入对应的算例文件夹。')+'</p><details class="download-verification"><summary>适用课程</summary>'+file.lessons.map(x=>'<a class="text-link" href="/read/?slug='+encodeURIComponent(x.slug)+'">'+esc(x.title)+'</a><br>').join('')+'</details></div></section>').join('')+'</div></section>';
 }catch(e){if(hub)L.error(hub,e);if(home)home.innerHTML='<p class="muted">专题目录暂时无法读取，<a href="/topics/">点击重试</a>。</p>';}finally{L.reveal(hub);L.reveal(home);}})();
})();

;
/* figure-viewer.js */
'use strict';
(() => {
 const dialog=document.createElement('dialog');dialog.id='figure-dialog';dialog.setAttribute('aria-label','查看课程配图');
 dialog.innerHTML='<div class="figure-dialog-bar"><p id="figure-dialog-title"></p><div class="figure-dialog-actions"><button class="button secondary" type="button" data-figure-size aria-pressed="false">原始尺寸</button><button class="icon-button" type="button" data-figure-close aria-label="关闭图片">×</button></div></div><div class="figure-dialog-image"><img alt=""></div><p class="figure-dialog-source"></p>';
 document.body.append(dialog);const frame=dialog.querySelector('.figure-dialog-image'),large=frame.querySelector('img'),size=dialog.querySelector('[data-figure-size]');let origin=null;
 function open(img){origin=img;large.src=img.currentSrc||img.src;large.alt=img.alt;dialog.querySelector('#figure-dialog-title').textContent=img.alt||'课程配图';frame.classList.remove('original');size.setAttribute('aria-pressed','false');size.textContent='原始尺寸';const source=dialog.querySelector('.figure-dialog-source');source.replaceChildren();const caption=img.closest('figure')?.querySelector('figcaption');if(caption){const safe=document.createElement('div');safe.innerHTML=window.DOMPurify?DOMPurify.sanitize(caption.innerHTML,{ALLOWED_TAGS:['a','span','em','strong','code'],ALLOWED_ATTR:['href','target','rel']}):'';while(safe.firstChild)source.append(safe.firstChild);}else source.textContent='查看图中的坐标、色标和图注，再结合正文判断其适用条件。';dialog.showModal();}
 size.onclick=()=>{const on=frame.classList.toggle('original');size.setAttribute('aria-pressed',String(on));size.textContent=on?'适应窗口':'原始尺寸';};dialog.querySelector('[data-figure-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>origin?.focus({preventScroll:true}));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 function enhance(){document.querySelectorAll('.prose img:not(.figure-viewable)').forEach(img=>{if(img.closest('a'))return;img.classList.add('figure-viewable');img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label',(img.alt||'课程配图')+'，点击放大');img.addEventListener('click',()=>open(img));img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(img);}});});}
 let scheduled=false;new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance();});}}).observe(document.querySelector('main'),{childList:true,subtree:true});enhance();
})();

;
/* page-outline.js */
'use strict';
(() => {
 const main=document.querySelector('#main');if(!main||document.body.dataset.section==='town'||main.querySelector('.fl-home'))return;
 const dock=document.createElement('details');dock.className='page-outline';dock.innerHTML='<summary aria-label="打开本页跳转目录"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg> 本页目录</summary><nav aria-label="本页跳转目录"></nav>';
 const toolbar=document.createElement('div');toolbar.className='page-outline-toolbar';
 main.before(toolbar);toolbar.append(dock);
 const topbar=document.querySelector('.topbar'),root=document.documentElement;
 root.classList.add('has-page-outline');
 const mobile=window.matchMedia('(max-width:760px)');
 const nav=dock.querySelector('nav');let serial=0,timer,last='';
 function measureToolbar(){
  const headerHeight=Math.ceil(topbar?.getBoundingClientRect().height||0);
  const toolbarHeight=mobile.matches?Math.ceil(toolbar.getBoundingClientRect().height):0;
  root.style.setProperty('--page-topbar-height',headerHeight+'px');
  root.style.setProperty('--page-outline-height',toolbarHeight+'px');
 }
 if(window.ResizeObserver){const observer=new ResizeObserver(measureToolbar);if(topbar)observer.observe(topbar);observer.observe(toolbar);}
 mobile.addEventListener('change',measureToolbar);
 function update(){
  const headings=[...main.querySelectorAll('h1,h2,h3')].filter(h=>h.getClientRects().length&&!h.closest('[hidden],dialog,details:not([open])'));
  const signature=headings.map(h=>h.tagName+'|'+h.textContent+'|'+h.id).join('\n');if(signature===last)return;
  nav.replaceChildren();
  headings.forEach(h=>{if(!h.id)h.id='page-heading-'+(++serial);const a=document.createElement('a');a.href='#'+encodeURIComponent(h.id);a.textContent=h.textContent.trim();a.className='outline-'+h.tagName.toLowerCase();a.addEventListener('click',()=>{dock.open=false;});nav.append(a);});
  if(!headings.length){const a=document.createElement('a');a.href='#main';a.textContent='页面顶部';nav.append(a);}
  last=headings.map(h=>h.tagName+'|'+h.textContent+'|'+h.id).join('\n');
 }
 new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(update,150);}).observe(main,{childList:true,subtree:true,characterData:true});
 document.addEventListener('toggle',event=>{if(event.target!==dock&&main.contains(event.target))update();},true);
 document.addEventListener('click',event=>{if(dock.open&&!dock.contains(event.target))dock.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&dock.open){dock.open=false;dock.querySelector('summary').focus();}});
 update();measureToolbar();window.addEventListener('resize',()=>{measureToolbar();clearTimeout(timer);timer=setTimeout(update,150);});
})();

