/* directory.js */
'use strict';
(() => {
 const L=window.FoamLab,esc=L.esc;
 const D=window.FoamDirectory={nodes:[],available:false};
 const directoryIndexes=new WeakMap();
 function indexFor(nodes=D.nodes){
  let index=directoryIndexes.get(nodes);if(index)return index;
  const byId=new Map(nodes.map(n=>[n.id,n])),children=new Map();
  for(const n of nodes){const parent=n.parent_id||null;if(!children.has(parent))children.set(parent,[]);children.get(parent).push(n.id);}
  for(const list of children.values())list.sort((a,b)=>(byId.get(a).sort_order||0)-(byId.get(b).sort_order||0)||String(byId.get(a).name||'').localeCompare(String(byId.get(b).name||'')));
  index={byId,children,descendants:new Map(),ancestors:new Map()};directoryIndexes.set(nodes,index);return index;
 }
 D.get=id=>indexFor().byId.get(id);
 D.children=id=>(indexFor().children.get(id||null)||[]).map(D.get);
 // Flatten the same sibling lists used by the sidebar, keeping each branch
 // together instead of interleaving unrelated nodes by their numeric order.
 D.orderedNodes=(rootId=null)=>{
  const result=[],seen=new Set();
  const visit=node=>{if(!node||seen.has(node.id))return;seen.add(node.id);result.push(node);D.children(node.id).forEach(visit);};
  if(rootId)visit(D.get(rootId));
  else{D.children(null).forEach(visit);D.nodes.forEach(visit);}
  return result;
 };
 D.descendants=(id,nodes=D.nodes)=>{
  const index=indexFor(nodes);
  if(!index.descendants.has(id)){const seen=new Set([id]),queue=[id];for(let i=0;i<queue.length;i++)for(const child of index.children.get(queue[i])||[])if(!seen.has(child)){seen.add(child);queue.push(child);}index.descendants.set(id,queue);}
  return [...index.descendants.get(id)];
 };
 D.ancestors=id=>{const index=indexFor();if(!index.ancestors.has(id)){const out=[],seen=new Set();for(let n=D.get(id);n&&!seen.has(n.id);n=D.get(n.parent_id)){seen.add(n.id);out.unshift(n);}index.ancestors.set(id,out);}return [...index.ancestors.get(id)];};
 D.path=id=>D.ancestors(id).map(n=>n.name).join(' / ');
 D.isVisible=n=>D.ancestors(n.id).every(x=>x.visible);
 // A database array is an unordered set of placements. Prefer the programming
 // module for its lessons, even when they are also referenced by a physics topic.
 D.primary=item=>{const nodes=(item?.section_ids||[]).map(D.get).filter(n=>n&&D.isVisible(n));if(item?.track==='OpenFOAM 编程'){const root=D.nodes.find(n=>n.key==='programming');return nodes.find(n=>D.ancestors(n.id).some(a=>a.id===root?.id))||nodes[0];}return nodes[0];};
 D.url=n=>{if(n?.href&&!n.href.startsWith('/read/?')&&!(n.key==='programming-examples'&&n.href.startsWith('/programming/?'))){try{const u=new URL(n.href,location.origin);if(u.origin===location.origin)return u.pathname+u.search+u.hash;}catch{}}return '/section/?id='+encodeURIComponent(n.id);};
 D.locations=row=>(row.section_ids||[]).map(D.path).filter(Boolean);
 D.optionLabel=node=>{const depth=Math.max(0,D.ancestors(node.id).length-1);return '　'.repeat(Math.min(depth,8))+(depth?'↳ ':'')+D.path(node.id);};
 D.option=(node,selected='')=>'<option value="'+esc(node.id)+'" title="'+esc(D.path(node.id))+'" '+(node.id===selected?'selected':'')+'>'+esc(D.optionLabel(node))+'</option>';
 D.options=(selected='',exclude=[],rootId=null)=>(rootId?'':'<option value="">顶层模块</option>')+D.orderedNodes(rootId).filter(n=>!exclude.includes(n.id)).map(n=>D.option(n,selected)).join('');
 D.current=(nodes=D.nodes)=>{const u=new URL(location.href),id=u.searchParams.get('id');if(u.pathname==='/section/')return nodes.find(n=>n.id===id);return nodes.filter(n=>n.href&&n.href!=='/admin/'&&(()=>{const v=new URL(n.href,location.origin);return v.pathname===u.pathname&&(!v.hash||v.hash===u.hash)&&[...v.searchParams].every(([k,x])=>u.searchParams.get(k)===x);})()).sort((a,b)=>(new URL(b.href,location.origin).search+new URL(b.href,location.origin).hash).length-(new URL(a.href,location.origin).search+new URL(a.href,location.origin).hash).length)[0];};
 const contentReads=new Map(),hintKey='foamlab.directory-hint.v1';
 const projections={
  full:'id,slug,kind,title,summary,track,series,cover_url,metadata,section_ids,author_id,author_name,sort_order,pinned,published_at,created_at,updated_at',
  overview:'id,kind,title,summary,series,cover_url,section_ids,curriculum_series:metadata->curriculum_series',
  book:'id,slug,title,summary,sort_order,fvm_book:metadata->fvm_book,turbulence_book:metadata->turbulence_book,heat_transfer_book:metadata->heat_transfer_book,kolev_book:metadata->kolev_book'
 };
 function readContent(ids,shape='full'){
  if(!Object.hasOwn(projections,shape))shape='full';
  const key=shape+':'+[...ids].sort().join(',');if(contentReads.has(key))return contentReads.get(key);
  const pending=(async()=>{const rows=[];for(let start=0;;start+=500){const batch=L.check(await L.client.from('foamlab_content').select(projections[shape]).eq('status','published').overlaps('section_ids',ids).order('sort_order').order('id').range(start,start+499));
   for(const row of batch){if(shape==='overview')row.metadata={curriculum_series:row.curriculum_series};if(shape==='book')row.metadata={fvm_book:row.fvm_book,turbulence_book:row.turbulence_book,heat_transfer_book:row.heat_transfer_book,kolev_book:row.kolev_book};}
   rows.push(...batch);if(batch.length<500)return rows;}})().catch(error=>{contentReads.delete(key);throw error;});
  contentReads.set(key,pending);return pending;
 }
 function prefetchCatalog(){
  // Cached IDs only schedule a fresh request. Never render cached names or rows.
  const catalog=document.querySelector('[data-lab-catalog]'),book=document.querySelector('#fvm-catalog,#pope-catalog,#incropera-catalog,[data-kolev-catalog]'),hub=document.querySelector('#topic-hub'),home=document.querySelector('#home-special-topics');if(!catalog&&!book&&!hub&&!home)return;
  const shapeFor=node=>book?'book':home||hub&&node.key===(hub.dataset.root||'topics')?'overview':'full';
  try{const saved=JSON.parse(sessionStorage.getItem(hintKey)||'null');if(saved&&saved.user===(L.user?.id||null)&&Date.now()-saved.at<86400000&&Array.isArray(saved.nodes)&&saved.nodes.length<=2000){
   const nodes=saved.nodes,key=home?'topics':catalog?.dataset.labCatalog||book?.id.replace('-catalog','')||hub?.dataset.root||'topics',node=(!home&&!book&&D.current(nodes))||nodes.find(n=>n.key===key);
   if(node){void readContent(D.descendants(node.id,nodes),shapeFor(node)).catch(()=>{});return;}
  }}catch{}
  try{const hint=JSON.parse(document.getElementById('catalog-hint')?.textContent||'null');if(hint?.path===location.pathname&&Array.isArray(hint.ids)&&hint.ids.length&&hint.ids.length<=2000&&!new URLSearchParams(location.search).has('topic'))void readContent(hint.ids,shapeFor(hint)).catch(()=>{});}catch{}
 }
 D.load=async()=>{await L.contentReady;prefetchCatalog();const nodes=[];for(let start=0;;start+=500){const r=L.check(await L.client.from('foamlab_sections').select('id,key,name,parent_id,href,description,nav_group,visible,sort_order,revision,created_at,updated_at,read_access').order('sort_order').order('id').range(start,start+499));nodes.push(...r);if(r.length<500)break;}D.nodes=nodes;D.available=true;
  try{sessionStorage.setItem(hintKey,JSON.stringify({user:L.user?.id||null,at:Date.now(),nodes:nodes.map(({id,key,href,parent_id})=>({id,key,href,parent_id}))}));}catch{}
  return D;
 };
 D.ready=D.load().catch(e=>{D.error=e;return D;});
 document.dispatchEvent(new Event('foamlab:directory-init'));
 D.content=(node,shape='full')=>readContent(D.descendants(node.id),shape);
 D.picker=(host,ids=[],editable=true)=>{
  host.innerHTML='<h3>所在位置</h3><p class="cms-muted">可选择多个目录，同一篇正文会同时出现在这些位置。</p><div class="cms-selected-locations" role="status"></div><input type="search" class="cms-location-search" placeholder="查找模块或子模块" aria-label="查找发布位置"><div class="cms-location-picker">'+D.orderedNodes().map(n=>'<label data-location-label="'+esc(D.path(n.id).toLowerCase())+'" style="padding-inline-start:'+Math.min(7+Math.max(0,D.ancestors(n.id).length-1)*14,119)+'px"><input type="checkbox" name="section_ids" value="'+n.id+'" '+(ids.includes(n.id)?'checked':'')+' '+(!editable?'disabled':'')+'><span>'+esc(D.path(n.id))+'</span></label>').join('')+'</div>';
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
    const [rows,response]=await Promise.all([D.content(current),fetch('/assets/reference-paths.json')]);if(!response.ok)throw Error('reference paths unavailable');const known=await response.json(),paths=new Set(known[key]||[]),extra=rows.filter(r=>!paths.has(r.metadata?.canonical_path));
    if(extra.length){const host=document.createElement('section');host.className='directory-extra';host.innerHTML='<h2>本目录中的其他内容</h2><div class="lab-card-grid"></div>';reference.parentElement.append(host);const grid=host.querySelector('.lab-card-grid');await L.names(extra.map(r=>r.author_id));const render=()=>{grid.innerHTML=window.FoamPagination.slice(grid,extra,render,12).map(L.card).join('');};render();}
   }catch{}
  }
  // Home, quick start and functional pages can host newly placed content too.
  const current=D.current();
  if(current&&!reference&&!document.querySelector('[data-lab-catalog],#fvm-catalog,#topic-hub,[data-theory-hub],[data-cuda-page],#fo-list,#model-list,.quick-reference-hub,#live-article,.article[data-cms-slug],#cms-root,#town-app')&&!location.pathname.startsWith('/admin/')){
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
/* section-page.js */
'use strict';
(() => {
 const L=window.FoamLab,D=window.FoamDirectory,requests=new Map();
 const supported=node=>{if(!node)return false;const url=new URL(D.url(node),location.origin);return !url.hash&&url.pathname!=='/'&&!/^\/(?:admin|studio|account|read|support|town)(?:\/|$)/.test(url.pathname);};
 const entryNode=node=>{if(!node)return null;const url=new URL(D.url(node),location.origin);if(!url.hash)return node;return D.ancestors(node.id).reverse().find(parent=>{const target=new URL(D.url(parent),location.origin);return !target.hash&&target.pathname===url.pathname&&target.search===url.search;});};
 async function read(node,fresh=false){
  if(fresh)requests.delete(node.id);
  if(!requests.has(node.id))requests.set(node.id,L.client.from('foamlab_sections').select('id,name,description,page_content,revision').eq('id',node.id).maybeSingle().then(L.check).catch(error=>{requests.delete(node.id);throw error;}));
  return requests.get(node.id);
 }
 async function defaults(node){
  const result={subtitle:node.description||'',body:''};
  if(!node.href||new URL(D.url(node),location.origin).pathname==='/section/')return result;
  const response=await fetch(D.url(node));if(!response.ok)throw Error('入口页暂时无法读取，请稍后重试。');
  const doc=new DOMParser().parseFromString(await response.text(),'text/html');
  const heading=doc.querySelector('main .page-heading');
  if(heading?.querySelector('p')&&!doc.querySelector('#topic-hub[data-topic]:not([data-topic=""])'))result.subtitle=heading.querySelector('p').textContent.trim();
  // Existing rich introductions are registered explicitly; avoid consuming cards or course text.
  const intro=doc.querySelector('[data-section-page-body]');
  if(intro)result.body=[...intro.children].map(p=>p.textContent.trim()).join('\n\n');
  return result;
 }
 async function apply(node){
  node=entryNode(node);
  if(!node||!supported(node)||document.querySelector('#cms-root,#live-article,.article[data-cms-slug]'))return;
  const heading=document.querySelector('main .page-heading,main .topic-detail-header > div'),title=heading?.querySelector('h1');if(!title)return;
  try{
   const item=await read(node),value=item?.page_content;if(!value||!Object.keys(value).length||!heading.isConnected)return;
   title.textContent=item.name;document.title=item.name+' · FoamLab';
   if(typeof value.subtitle==='string'){let subtitle=heading.querySelector('p');if(!subtitle){subtitle=document.createElement('p');heading.append(subtitle);}subtitle.textContent=value.subtitle;subtitle.hidden=!value.subtitle;}
   if(typeof value.body==='string'){
    let intro=document.querySelector('[data-section-page-body]');
    if(!intro){intro=document.createElement('div');intro.dataset.sectionPageBody='';(heading.closest('.catalog-header,.topic-detail-header')||heading).after(intro);}
    intro.classList.add('prose','section-page-intro');intro.innerHTML=L.markdown(value.body);intro.hidden=!value.body.trim();
   }
   heading.dataset.sectionPageLoaded='true';
  }catch{/* Retain the last locally synchronized introduction if the network is unavailable. */}
 }
 window.FoamSectionPage={supported,read,defaults,apply};
 D.ready.then(()=>{if(D.available)void apply(D.current());});
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
  put('#account-panel-status',auth.loading?'正在恢复登录…':signed?((window.FoamLab?.role==='supporter'?'充电会员 · ':'')+'GitHub 账号已登录'):'尚未登录');
  const pet=cached.pet||auth.pet;
  if(signed&&pet&&Number.isFinite(pet.level)&&Number.isFinite(pet.xp)&&Number.isFinite(pet.next_level_xp)){
   put('#account-panel-level','Lv.'+pet.level);
   put('#account-panel-xp',pet.xp+' 经验 · 距下一级 '+Math.max(0,pet.next_level_xp-pet.xp)+' 经验');
   const range=pet.next_level_xp-pet.level_start;
   $('#account-panel-xp-bar').style.width=(range>0?Math.max(0,Math.min(100,100*(pet.xp-pet.level_start)/range)):0)+'%';
  }else{put('#account-panel-level',auth.petError?'等级暂未读取':'等级读取中…');put('#account-panel-xp',auth.petError?'可前往“我的熊猫”重试':'正在读取成长记录');$('#account-panel-xp-bar').style.width='0%';}
  panel.querySelectorAll('[data-account-sign-out]').forEach(b=>{b.disabled=auth.signingOut;b.textContent=auth.signingOut?'正在退出…':'退出登录';});
  $('#account-panel-sign-in').disabled=auth.loading||!auth.configured;
  panel.querySelectorAll('[data-management-link]').forEach(a=>a.hidden=window.FoamLab?.role!=='admin');
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
 function dispose(instance){if(!instance||worker!==instance)return;worker=null;instance.onmessage=null;instance.onerror=null;instance.terminate();}
 function finish(data){if(!current||data.id!==current.id)return;clearTimeout(timeout);const {node,source}=current;if(node.isConnected&&node.textContent===source){if(data.html!==undefined){node.innerHTML=data.html;node.classList.add('hljs');node.dataset.foamHighlight='complete';}else plain(node);}current=null;idle(next);}
 function next(){if(current||disabled)return;while(queue.length){const node=queue.shift();if(!node.isConnected)continue;const source=node.textContent;if(!source||source.length>MAX_SIZE){plain(node);continue;}const language=(node.className.match(/language-([\w+-]+)/)?.[1]||'plaintext').toLowerCase();if(['plaintext','text','txt'].includes(language)){plain(node);continue;}
  try{if(!worker){const instance=new Worker('/assets/browser-code-worker.js');worker=instance;instance.onmessage=e=>{if(worker===instance)finish(e.data);};instance.onerror=()=>{if(worker!==instance)return;disabled=true;clearTimeout(timeout);if(current)plain(current.node);current=null;dispose(instance);};}const task=current={id:++serial,node,source},instance=worker;instance.postMessage({id:serial,language,code:source});timeout=setTimeout(()=>{if(current!==task||worker!==instance)return;plain(task.node);current=null;dispose(instance);idle(next);},1200);return;}catch{disabled=true;clearTimeout(timeout);current=null;dispose(worker);plain(node);return;}
 }}
 const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){observer.unobserve(entry.target);queue.push(entry.target);}idle(next);},{rootMargin:'250px'}):null;
 function scan(root){const nodes=[];if(root.matches?.('pre > code'))nodes.push(root);if(root.querySelectorAll)nodes.push(...root.querySelectorAll('pre > code'));for(const node of nodes){if(seen.has(node)||node.classList.contains('hljs'))continue;seen.add(node);if(node.textContent.length>MAX_SIZE){plain(node);continue;}if(observer)observer.observe(node);else queue.push(node);}if(!observer)idle(next);}
 const changes=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)scan(node);});
 const start=()=>{scan(document);changes.observe(document.body,{childList:true,subtree:true});};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 window.foamHighlightCode=scan;
 window.addEventListener('pagehide',()=>{clearTimeout(timeout);if(current)plain(current.node);current=null;queue.length=0;dispose(worker);});
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
/* site-popup.js */
'use strict';
(() => {
 const L=window.FoamLab,esc=L.esc,key='site_popup',visitKey='foamlab.site-popup.visit.v1',dayKey='foamlab.site-popup.hidden-day.v1';
 const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const get=(storage,name)=>{try{return storage.getItem(name);}catch{return null;}};
 const put=(storage,name,value)=>{try{storage.setItem(name,value);}catch{/* The dialog remains usable when browser storage is unavailable. */}};
 const imageURL=value=>{if(typeof value!=='string'||!value.trim())return '';try{const u=new URL(value.trim(),location.origin);return (u.protocol==='https:'||u.origin===location.origin)&&!u.username&&!u.password?u.href:'';}catch{return '';}};
 const normalize=value=>({enabled:value?.enabled===true,title:String(value?.title||'网站通知').slice(0,80),body:typeof value?.body==='string'?value.body.slice(0,20000):'',images:(Array.isArray(value?.images)?value.images:[]).slice(0,12).map(item=>({url:imageURL(item?.url),alt:String(item?.alt||'通知配图').slice(0,160)})).filter(item=>item.url)});
 function show(config,preview=false){
  const previous=document.activeElement,dialog=document.createElement('dialog');dialog.className='site-popup-dialog';dialog.setAttribute('aria-labelledby','site-popup-title');
  dialog.innerHTML='<header class="site-popup-header"><h2 id="site-popup-title">'+esc(config.title||'网站通知')+'</h2><button class="icon-button" type="button" data-popup-close aria-label="关闭通知">×</button></header><div class="site-popup-body"><div class="prose">'+L.markdown(config.body)+'</div>'+(config.images.length?'<div class="site-popup-images">'+config.images.map(img=>'<img src="'+esc(img.url)+'" alt="'+esc(img.alt)+'" loading="lazy" decoding="async">').join('')+'</div>':'')+'</div>'+(!preview?'<footer class="site-popup-footer"><label><input type="checkbox" data-popup-today> 今日不再弹出</label></footer>':'');
  dialog.querySelector('[data-popup-close]').onclick=()=>dialog.close();
  dialog.querySelector('[data-popup-today]')?.addEventListener('change',e=>{if(e.target.checked)put(localStorage,dayKey,today());else try{if(get(localStorage,dayKey)===today())localStorage.removeItem(dayKey);}catch{}});
  dialog.addEventListener('close',()=>{if(!preview&&dialog.querySelector('[data-popup-today]').checked)put(localStorage,dayKey,today());dialog.remove();if(previous?.isConnected&&!document.querySelector('dialog[open]'))previous.focus({preventScroll:true});},{once:true});
  dialog.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const text=document.createElement('p');text.className='site-popup-image-error';text.textContent=(img.alt||'图片')+'暂时无法加载';img.replaceWith(text);},{once:true}));
  document.body.append(dialog);dialog.showModal();return dialog;
 }
 async function start(){
  if(get(sessionStorage,visitKey)||get(localStorage,dayKey)===today()){put(sessionStorage,visitKey,'checked');return;}
  try{
   await L.contentReady;
   const row=L.check(await L.client.from('foamlab_settings').select('value').eq('key',key).maybeSingle()),cfg=normalize(row?.value);
   if(!cfg.enabled||(!cfg.body.trim()&&!cfg.images.length)){put(sessionStorage,visitKey,'checked');return;}
   // Required profile collection takes priority over the site notice.
   await window.foamAuth?.profileReady;
   let observer;
   const cleanup=()=>{observer?.disconnect();document.removeEventListener('visibilitychange',attempt);window.removeEventListener('storage',attempt);window.removeEventListener('pagehide',cleanup);window.removeEventListener('foam-auth-change',attempt);};
   function attempt(){
    if(get(sessionStorage,visitKey)||get(localStorage,dayKey)===today()){put(sessionStorage,visitKey,'checked');cleanup();return;}
    const auth=window.foamAuth;
    if(document.visibilityState==='hidden'||document.querySelector('dialog[open]')||document.documentElement.classList.contains('profile-required-open')||auth?.user&&(auth.loading||auth.dataLoading||!window.FoamProfile.complete(auth.profile)))return;
    show(cfg);put(sessionStorage,visitKey,'shown');cleanup();
   }
   observer=new MutationObserver(attempt);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
   document.addEventListener('visibilitychange',attempt);window.addEventListener('storage',attempt);window.addEventListener('pagehide',cleanup,{once:true});window.addEventListener('foam-auth-change',attempt);attempt();
  }catch{/* A failed notice request must not block the page or mark the notice as read. */}
 }
 function mountSettings(host,row){
  if(L.role!=='admin')return null;
  let saved=normalize(row?.value),stamp=row?.updated_at,exists=!!row,images=structuredClone(saved.images),working=false;
  const section=document.createElement('section');section.className='cms-popup-settings cms-settings-fields';
  section.innerHTML='<h3>站点弹窗</h3><p class="muted">每次新开网站标签页显示一次，刷新和站内跳转不重复显示。读者勾选“今日不再弹出”后，当天不再显示。</p><form id="cms-popup-form"><fieldset><label class="cms-check"><input name="enabled" type="checkbox"> 启用站点弹窗</label><label class="form-field"><span>弹窗标题</span><input name="title" maxlength="80" required></label><label class="form-field"><span>正文 · 支持 Markdown</span><textarea name="body" rows="9" maxlength="20000" placeholder="填写通知正文，可使用标题、列表、链接和图片。"></textarea></label><div class="cms-popup-upload"><label class="button secondary">上传图片<input type="file" name="upload" accept="image/png,image/jpeg,image/webp" multiple hidden></label><span class="muted">最多 12 张，每张不超过 5 MB</span></div><div class="cms-popup-image-list"></div><div class="admin-actions"><button class="button" type="submit">保存弹窗设置</button><button class="button secondary" type="button" data-popup-preview>预览弹窗</button><button class="text-button" type="reset">取消修改</button></div></fieldset><p class="form-status" role="status" aria-live="polite"></p></form>';
  host.append(section);const f=section.querySelector('form'),fields=f.querySelector('fieldset'),list=f.querySelector('.cms-popup-image-list'),status=f.querySelector('.form-status');
  const draft=()=>normalize({enabled:f.elements.enabled.checked,title:f.elements.title.value.trim(),body:f.elements.body.value.trim(),images});
  const dirty=()=>section.isConnected&&(working||JSON.stringify(draft())!==JSON.stringify(saved));
  function paint(){
   list.innerHTML=images.map((img,i)=>'<div class="cms-popup-image-row"><img src="'+esc(img.url)+'" alt="'+esc(img.alt)+'" loading="lazy"><label class="form-field"><span>图片 '+(i+1)+' 说明</span><input data-popup-alt="'+i+'" maxlength="160" value="'+esc(img.alt)+'"></label><div class="cms-popup-image-actions"><button class="text-button" type="button" data-popup-image="up" data-index="'+i+'" aria-label="上移图片 '+(i+1)+'" '+(!i?'disabled':'')+'>↑</button><button class="text-button" type="button" data-popup-image="down" data-index="'+i+'" aria-label="下移图片 '+(i+1)+'" '+(i===images.length-1?'disabled':'')+'>↓</button><button class="text-button" type="button" data-popup-image="insert" data-index="'+i+'">插入正文</button><button class="text-button" type="button" data-popup-image="remove" data-index="'+i+'">移除</button></div></div>').join('');
  }
  function reset(){f.elements.enabled.checked=saved.enabled;f.elements.title.value=saved.title;f.elements.body.value=saved.body;images=structuredClone(saved.images);paint();status.textContent='';}
  const lock=value=>{working=value;fields.disabled=value;};
  list.oninput=e=>{if(e.target.hasAttribute('data-popup-alt'))images[Number(e.target.dataset.popupAlt)].alt=e.target.value;};
  list.onclick=e=>{
   const b=e.target.closest('[data-popup-image]');if(!b||working)return;const i=Number(b.dataset.index),op=b.dataset.popupImage;
   if(op==='insert'){
    const image=images[i],text='\n\n!['+image.alt.replace(/[\[\]\\\r\n]/g,' ')+'](<'+image.url.replace(/[<>]/g,c=>encodeURIComponent(c))+'>)\n\n',body=f.elements.body;
    if(body.value.length+text.length>20000){status.textContent='正文最多 20000 字，请缩短后再插入。';return;}
    body.setRangeText(text,body.selectionStart,body.selectionEnd,'end');body.focus();images.splice(i,1);
   }else if(op==='remove')images.splice(i,1);
   else{const next=i+(op==='up'?-1:1);if(next<0||next>=images.length)return;[images[i],images[next]]=[images[next],images[i]];}
   paint();
  };
  f.elements.upload.onchange=async e=>{
   const files=[...e.target.files];e.target.value='';if(!files.length||working)return;
   if(images.length+files.length>12){status.textContent='最多添加 12 张图片，请先移除多余图片。';return;}
   const types={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
   if(files.some(file=>!types[file.type]||!file.size||file.size>5*1024*1024)){status.textContent='请选择不超过 5 MB 的 PNG、JPEG 或 WebP 图片。';return;}
   lock(true);let uploaded=0;
   try{for(const file of files){status.textContent='正在上传图片 '+(uploaded+1)+' / '+files.length+'…';const path='library/site-popup-'+crypto.randomUUID()+'.'+types[file.type];L.check(await L.client.storage.from('foamlab-resources').upload(path,file,{contentType:file.type,upsert:false}));const url=imageURL(L.client.storage.from('foamlab-resources').getPublicUrl(path).data.publicUrl);if(!url)throw Error('未取得有效图片地址。');images.push({url,alt:file.name.slice(0,160)});uploaded++;paint();}status.textContent='已上传 '+uploaded+' 张图片，保存设置后生效。';}
   catch(error){status.textContent=(uploaded?'已保留 '+uploaded+' 张已上传图片。':'')+'上传失败：'+error.message;}
   finally{lock(false);}
  };
  f.querySelector('[data-popup-preview]').onclick=()=>show(draft(),true);
  f.onreset=e=>{e.preventDefault();if(!working)reset();};
  f.onsubmit=async e=>{
   e.preventDefault();if(working||!f.reportValidity())return;const value=draft();
   if(value.enabled&&!value.body.trim()&&!value.images.length){status.textContent='请填写正文或上传图片后再启用弹窗。';return;}
   lock(true);status.textContent='正在保存…';
   try{
    const data={key,value,updated_at:new Date().toISOString()};let request;
    if(exists){request=L.client.from('foamlab_settings').update(data).eq('key',key);if(stamp)request=request.eq('updated_at',stamp);}
    else request=L.client.from('foamlab_settings').insert(data);
    const rows=L.check(await request.select('key,value,updated_at'));if(!rows?.length)throw Error('设置已被其他管理员修改，请保留正文并重新打开站点设置后核对。');
    saved=normalize(rows[0].value);stamp=rows[0].updated_at;exists=true;status.textContent=value.enabled?'弹窗设置已保存并启用。':'弹窗设置已保存，当前已关闭。';
   }catch(error){status.textContent='保存失败，当前内容已保留。'+(error.code==='23505'?'其他管理员已创建弹窗设置，请重新打开后核对。':error.message);}
   finally{lock(false);}
  };
  reset();return {isDirty:dirty,isBusy:()=>working};
 }
 window.FoamSitePopup={mountSettings};void start();
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
  const node=(hub&&D.current())||root,children=D.children(root.id).filter(D.isVisible),all=await D.content(node,home||node.id===root.id?'overview':'full');
  const ownIntro=(items,node)=>items.find(r=>(r.kind==='module'||r.metadata?.curriculum_series)&&r.kind!=='lesson'&&r.section_ids?.includes(node.id));
  const collection=(nodes=children)=>nodes.map(n=>{const ids=D.descendants(n.id),items=all.filter(r=>r.section_ids?.some(id=>ids.includes(id))),intro=ownIntro(items,n),count=items.filter(r=>r.id!==intro?.id&&r.kind!=='module'&&(!intro?.metadata?.curriculum_series||r.series===intro.metadata.curriculum_series)).length;return '<a class="topic-collection" href="'+esc(D.url(n))+'">'+(intro?figure(intro):'')+'<div class="topic-collection-body"><small>'+count+(programming?' 节课':' 篇内容')+'</small><h2>'+esc(n.name)+'</h2><p>'+esc(n.description||intro?.summary||'')+'</p><span class="text-link">进入'+collectionLabel+' →</span></div></a>';}).join('');
  if(home)home.innerHTML=collection();if(!hub)return;
  if(node.id===root.id){hub.querySelector('h1').textContent=root.name;hub.querySelector('.page-content-loading')?.remove();const grid=document.createElement('div');grid.className='topic-collection-grid';grid.innerHTML=collection();hub.append(grid);void window.FoamSectionPage?.apply(node);return;}
  const ids=D.descendants(node.id),items=all.filter(r=>r.section_ids?.some(id=>ids.includes(id))),intro=ownIntro(items,node),selected=items.filter(r=>r.id!==intro?.id&&r.kind!=='module'&&(!intro?.metadata?.curriculum_series||r.series===intro.metadata.curriculum_series)),subtopics=D.children(node.id).filter(D.isVisible);
  let introduction='';if(intro){const userId=window.foamAuth.user?.id||null,record=L.check(await L.client.rpc('foamlab_read_article',{p_slug:intro.slug}));if((window.foamAuth.user?.id||null)===userId&&record.allowed&&record.item)introduction=L.markdown(record.item.body);}
  const crumbs=D.ancestors(node.id).map(n=>n.id===node.id?'<span aria-current="page">'+esc(n.name)+'</span>':'<a href="'+esc(D.url(n))+'">'+esc(n.name)+'</a>').join('<span aria-hidden="true">/</span>');
  document.title=node.name+' · FoamLab';hub.innerHTML='<nav class="topic-breadcrumbs" aria-label="专题导航">'+crumbs+'</nav><header class="topic-detail-header"><div><h1>'+esc(node.name)+'</h1><p>'+esc(node.description||intro?.summary||'')+'</p><nav class="topic-section-links" aria-label="专题内容"><a href="#topic-courses">内容目录 · '+selected.length+' 篇 ↓</a></nav></div>'+(intro?figure(intro):'')+'</header>'+(introduction?'<section class="topic-introduction"><div class="prose">'+introduction+'</div></section>':'')+(subtopics.length?'<section id="topic-branches"><h2>'+ (node.key==='topic-meshes'?'选择网格主题':'子专题') +'</h2><div class="topic-collection-grid">'+collection(subtopics)+'</div></section>':'')+'<section id="topic-courses"><h2>'+'内容目录'+'</h2><div class="lab-card-grid"></div></section>';
  void window.FoamSectionPage?.apply(node);const grid=hub.querySelector('.lab-card-grid');window.foamListState.remember(grid);await L.names(selected.filter(r=>['article','log'].includes(r.kind)).map(r=>r.author_id));
  let industrySelect,countLabel;
  if(node.key==='topic-engineering'){
   const industries=[...new Set(selected.map(r=>r.metadata?.industry).filter(Boolean))];
   const filters=document.createElement('div');filters.className='engineering-filters';
   filters.innerHTML='<label>按行业选择 <select aria-label="工程案例行业"><option value="">全部行业</option>'+industries.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('')+'</select></label><span role="status" aria-live="polite"></span>';
   grid.before(filters);industrySelect=filters.querySelector('select');countLabel=filters.querySelector('[role="status"]');
   industrySelect.onchange=()=>{window.foamListState.write({industry:industrySelect.value,page:''},true);render();};
  }
  const render=()=>{
   const industry=new URLSearchParams(location.search).get('industry')||'';
   if(industrySelect)industrySelect.value=industry;
   const visible=industrySelect&&industrySelect.value?selected.filter(r=>r.metadata?.industry===industrySelect.value):selected;
   if(countLabel)countLabel.textContent='共 '+visible.length+' 个案例';
   grid.innerHTML=window.FoamPagination.slice(grid,visible,render,12).map(L.card).join('')||'<p>这里还没有发布内容。</p>';
  };render();window.addEventListener('popstate',render);return;
 }
 if(programming)throw D?.error||new Error('编程目录暂时无法读取，请刷新重试。');
 const [rawModules,lessons]=await Promise.all([readAll(()=>L.client.from('foamlab_content').select('id,slug,kind,title,summary,track,series,cover_url,metadata,sort_order').eq('kind','module').eq('status','published').order('sort_order').order('slug')),readAll(()=>L.client.from('foamlab_content').select('id,slug,kind,title,summary,track,series,cover_url,metadata,sort_order').eq('kind','lesson').eq('status','published').order('sort_order').order('slug'))]);const modules=rawModules.filter(x=>typeof x.metadata?.topic_key==='string'&&x.metadata.topic_key);
 const collection=()=>modules.filter(x=>x.metadata.topic_key!=='algorithms').map(x=>card(x,lessons)).join('');
 if(home)home.innerHTML=collection();
 if(!hub)return;const key=hub.dataset.topic||new URLSearchParams(location.search).get('topic');if(!key){hub.querySelector('.page-content-loading')?.remove();const grid=document.createElement('div');grid.className='topic-collection-grid';grid.innerHTML=collection();hub.append(grid);return;}
 const item=modules.find(x=>x.metadata.topic_key===key);if(!item){hub.innerHTML='<div class="lab-empty"><h1>这个专题暂未发布</h1><p>可以先查看已经开放的专题和系统课程。</p><a class="button" href="/topics/">全部专题</a></div>';return;}
 const selected=lessons.filter(x=>key==='algorithms'?(x.track||'').includes('数值'):Array.isArray(x.metadata?.topics)&&x.metadata.topics.includes(key));const dedup=new Map();for(const lesson of selected)for(const file of L.courseDownloads(lesson)){if(!dedup.has(file.url))dedup.set(file.url,{...file,lessons:[]});dedup.get(file.url).lessons.push({slug:lesson.slug,title:lesson.title});}const files=[...dedup.values()];document.title=item.title+'专题 · FoamLab';
 hub.innerHTML='<nav class="topic-breadcrumbs" aria-label="专题导航"><a href="/topics/">全部专题</a><span>/</span><span>'+esc(item.title)+'</span></nav><header class="topic-detail-header"><div><div class="eyebrow">OPENFOAM v2512 / 专题学习</div><h1>'+esc(item.title)+'</h1><p>'+esc(item.summary)+'</p><nav class="topic-section-links"><a href="#topic-courses">内容目录 · '+selected.length+' 节 ↓</a><a href="#topic-cases">案例下载 · '+files.length+' 个包 ↓</a></nav></div>'+figure(item)+'</header><section class="topic-introduction"><div class="prose">'+esc(item.summary)+'</div></section><section id="topic-courses"><div class="topic-section-heading"><h2>内容目录</h2></div><div class="lab-card-grid">'+(selected.map(L.card).join('')||'<p class="lab-empty">内容目录正在整理。</p>')+'</div></section><section id="topic-cases"><div class="topic-section-heading"><h2>专题案例下载</h2></div><div class="topic-case-list">'+files.map(file=>'<section class="lesson-downloads"><div class="lesson-download-row">'+L.downloadLink(file)+'<p>'+esc(file.description||'先阅读包内 README，再进入对应的算例文件夹。')+'</p><details class="download-verification"><summary>适用课程</summary>'+file.lessons.map(x=>'<a class="text-link" href="/read/?slug='+encodeURIComponent(x.slug)+'">'+esc(x.title)+'</a><br>').join('')+'</details></div></section>').join('')+'</div></section>';
 }catch(e){if(hub)L.error(hub,e);if(home)home.innerHTML='<p class="muted">专题目录暂时无法读取，<a href="/topics/">点击重试</a>。</p>';}finally{L.reveal(hub);L.reveal(home);}})();
})();

;
/* figure-viewer.js */
'use strict';
(() => {
 const dialog=document.createElement('dialog');dialog.id='figure-dialog';dialog.setAttribute('aria-label','查看图片');
 dialog.innerHTML='<div class="figure-dialog-bar"><p id="figure-dialog-title"></p><div class="figure-dialog-actions"><button class="button secondary" type="button" data-figure-size aria-pressed="false">原始尺寸</button><button class="icon-button" type="button" data-figure-close aria-label="关闭图片">×</button></div></div><div class="figure-dialog-image"><img alt=""></div><p class="figure-dialog-source"></p>';
 document.body.append(dialog);const frame=dialog.querySelector('.figure-dialog-image'),large=frame.querySelector('img'),size=dialog.querySelector('[data-figure-size]');let origin=null;
 function open(img){origin=img;large.src=img.currentSrc||img.src;large.alt=img.alt;dialog.querySelector('#figure-dialog-title').textContent=img.alt||'图片';frame.classList.remove('original');size.setAttribute('aria-pressed','false');size.textContent='原始尺寸';const source=dialog.querySelector('.figure-dialog-source');source.replaceChildren();const caption=img.closest('figure')?.querySelector('figcaption');if(caption){const safe=document.createElement('div');safe.innerHTML=window.DOMPurify?DOMPurify.sanitize(caption.innerHTML,{ALLOWED_TAGS:['a','span','em','strong','code'],ALLOWED_ATTR:['href','target','rel']}):'';while(safe.firstChild)source.append(safe.firstChild);}else source.textContent=img.closest('.lab-comments,.lab-topic,.lab-compose,.lab-preview')?'图片由发布者提供。':'查看图中的坐标、色标和图注，再结合正文判断其适用条件。';dialog.showModal();}
 size.onclick=()=>{const on=frame.classList.toggle('original');size.setAttribute('aria-pressed',String(on));size.textContent=on?'适应窗口':'原始尺寸';};dialog.querySelector('[data-figure-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>origin?.focus({preventScroll:true}));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 function enhance(){document.querySelectorAll('.prose img:not(.figure-viewable)').forEach(img=>{if(img.closest('a'))return;img.classList.add('figure-viewable');img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label',(img.alt||'图片')+'，点击放大');img.addEventListener('click',()=>open(img));img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(img);}});});}
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

;
/* fvm-loader.js */
'use strict';
(() => {
 if(!/\/read\//.test(location.pathname))return;
 let loading=false;
 function scan(){
  const book=!!window.foamCurrentContent?.metadata?.fvm_book;
  document.querySelector('#live-article')?.classList.toggle('fvm-book-lesson',book);
  if(!book&&!document.querySelector('.fvm-lab,.fvm-book-art'))return;
  if(!document.querySelector('link[data-fvm-style]')){const css=document.createElement('link');css.rel='stylesheet';css.dataset.fvmStyle='true';css.href='/assets/fvm-labs.css?v=20261013-fvm-navigation';document.head.append(css);}
  for(const img of document.querySelectorAll('.fvm-book-art img:not([data-fvm-sized])')){
   const width=Number(img.getAttribute('width'));
   if(width>0&&width<20000)img.style.setProperty('--fvm-art-width',Math.min(width/2,840)+'px');
   img.dataset.fvmSized='true';
  }
  if(!document.querySelector('.fvm-lab'))return;
  if(window.FoamFVM){window.FoamFVM.mount();return;}
  if(loading)return;loading=true;
  const loadLabs=()=>{const js=document.createElement('script');js.src='/assets/fvm-labs.js?v=20261013-fvm-navigation';js.onload=()=>window.FoamFVM?.mount();js.onerror=()=>{loading=false;};document.head.append(js);};
  if(window.FoamFVMExplorer){loadLabs();return;}
  const explorer=document.createElement('script');explorer.src='/assets/fvm-explorer.js?v=20261013-fvm-navigation';explorer.onload=loadLabs;explorer.onerror=()=>{loading=false;};document.head.append(explorer);
 }
 let queued=false;const main=document.querySelector('main');
 if(main)new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;scan();});}).observe(main,{childList:true,subtree:true});
 document.addEventListener('foamlab:content-ready',()=>queueMicrotask(scan));scan();
})();

;
/* heat-loader.js */
'use strict';
(() => {
 if(!/\/read\//.test(location.pathname))return;
 let loading=false,queued=false;
 function scan(){
  if(!document.querySelector('.heat-figure,.heat-lab'))return;
  if(!document.querySelector('link[data-heat-style]')){const c=document.createElement('link');c.rel='stylesheet';c.href='/assets/heat-labs.css';c.dataset.heatStyle='true';document.head.append(c);}
  if(!document.querySelector('.heat-lab'))return;
  if(window.FoamHeat){window.FoamHeat.mount();return;}
  if(loading)return;loading=true;const s=document.createElement('script');s.src='/assets/heat-labs.js';s.onerror=()=>{loading=false;};document.head.append(s);
 }
 const main=document.querySelector('main');if(main)new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;scan();});}).observe(main,{childList:true,subtree:true});
 document.addEventListener('foamlab:content-ready',scan);scan();
})();

;
/* private-notes.js */
'use strict';
(() => {
 const $=(s,r=document)=>r.querySelector(s),esc=s=>window.FoamLab.esc(s);
 const TABLE='foamlab_private_notes',KEY='foamlab-private-notes:';
 const standalone=location.pathname==='/notes/';
 const fields=['title','body','page_url','page_title','anchor_id','anchor_text','anchor_offset','scroll_ratio'];
 let uid=null,note=null,base=null,dirty=false,serial=0,task=null,conflict=false,loadToken=0;
 let host=null,timer,previewTimer,rect=null,open=false,rows=[],listToken=0,listPage=0,more=false,listQuery='';
 let pickerToken=0,pickerPage=0,pickerRows=[],pickerTimer;
 const client=()=>window.foamAuth?.client,identity=()=>window.foamAuth?.user?.id;
 const payload=n=>Object.fromEntries(fields.map(k=>[k,n[k]]));
 const same=(a,b)=>!!a&&!!b&&JSON.stringify(payload(a))===JSON.stringify(payload(b));
 const check=r=>{if(r.error)throw Error(r.error.message);return r.data;};
 const count=s=>Array.from(s.replace(/\s/g,'')).length;
 function safePage(raw){try{const u=new URL(raw,location.origin);return u.origin===location.origin&&/^\/(?![\/\\])/.test(u.pathname)?u.pathname+u.search:'';}catch{return '';}}
 function sourceWindow(){try{if(standalone&&opener&&!opener.closed&&opener.location.origin===location.origin)return opener;}catch{}return window;}
 function pageInfo(){
  const w=sourceWindow(),d=w.document,u=new URL(w.location.href);
  u.searchParams.delete('note');u.hash='';
  const headings=[...d.querySelectorAll('#live-article .prose h2[id],#live-article .prose h3[id],main .article .prose h2[id],main .article .prose h3[id]')];
  const heading=[...headings].reverse().find(h=>h.getBoundingClientRect().top<=120)||null;
  return {page_url:safePage(u.href)||'/',page_title:(d.querySelector('#live-article h1,main h1')?.textContent||d.title.replace(/ · FoamLab$/,'')).trim().slice(0,300),
   anchor_id:heading?.id||'',anchor_text:heading?.textContent.trim().slice(0,300)||'',
   anchor_offset:heading?70-heading.getBoundingClientRect().top:0,
   scroll_ratio:Math.min(1,Math.max(0,w.scrollY/Math.max(1,d.documentElement.scrollHeight-w.innerHeight)))};
 }
 function remember(){
  if(!uid)return;
  try{sessionStorage.setItem(KEY+uid,JSON.stringify({note,base,dirty,open,rect,conflict}));}
  catch{status('浏览器未能保留草稿，请保存到云端或下载 Markdown。',true);}
 }
 function status(message,error=false){if(!host)return;const el=$('[data-note-status]',host);el.textContent=message;el.classList.toggle('is-error',error);}
 function sizeLimits(){return {w:Math.max(1,innerWidth-16),h:Math.max(1,innerHeight-16)};}
 function clamp(value,min,max){return Math.max(min,Math.min(value,max));}
 function place(){
  if(!host||standalone)return;
  const limit=sizeLimits();
  const w=clamp(rect?.w||480,Math.min(320,limit.w),limit.w),h=clamp(rect?.h||600,Math.min(360,limit.h),limit.h);
  const x=Math.max(8,Math.min(rect?.x??innerWidth-w-24,innerWidth-w-8));
  const y=Math.max(8,Math.min(rect?.y??Math.max(16,(innerHeight-h)/2),innerHeight-h-8));
  Object.assign(host.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
  rect={x,y,w,h};
 }
 function resizeRect(r,edge,dx,dy){
  const limit=sizeLimits(),minW=Math.min(320,limit.w),minH=Math.min(360,limit.h);
  let left=r.x,top=r.y,right=r.x+r.width,bottom=r.y+r.height;
  if(edge.includes('w'))left=clamp(left+dx,8,right-minW);
  if(edge.includes('e'))right=clamp(right+dx,left+minW,innerWidth-8);
  if(edge.includes('n'))top=clamp(top+dy,8,bottom-minH);
  if(edge.includes('s'))bottom=clamp(bottom+dy,top+minH,innerHeight-8);
  return {x:left,y:top,w:right-left,h:bottom-top};
 }
 function build(){
  if(host)return;
  host=document.createElement('section');host.id='private-notebook';host.className='private-notebook'+(standalone?' is-standalone':'');
  host.setAttribute('role','dialog');host.setAttribute('aria-modal','false');host.setAttribute('aria-labelledby','private-note-heading');host.hidden=true;
  host.innerHTML='<header class="private-note-header" tabindex="0" aria-label="拖动笔记窗口；方向键移动"><strong id="private-note-heading">我的笔记 <span>仅自己可见</span></strong><div><button type="button" data-note-popout aria-label="在独立窗口打开笔记" title="独立窗口">↗</button><button type="button" data-note-close aria-label="关闭笔记窗口">×</button></div></header>'+
   '<div class="private-note-picker" hidden aria-labelledby="private-note-picker-heading"><div class="private-note-picker-heading"><h2 id="private-note-picker-heading">打开笔记</h2><button type="button" data-note-picker-back>返回笔记</button></div><label><span class="sr-only">查找已有笔记</span><input type="search" data-note-picker-query maxlength="120" placeholder="按标题查找笔记"></label><p data-note-picker-status role="status"></p><div class="private-note-picker-list"></div><div class="private-note-picker-footer"><button type="button" data-note-picker-new>新建笔记</button><button type="button" data-note-picker-more hidden>加载更多</button></div></div>'+
   '<div class="private-note-form"><label class="private-note-title"><span class="sr-only">笔记标题</span><input data-note-title maxlength="160" placeholder="笔记标题"></label>'+
   '<details class="private-note-location"><summary>关联位置：<span data-note-location></span></summary><a data-note-link>返回阅读位置 →</a><div class="private-note-location-actions"><button type="button" data-note-capture>更新为当前阅读位置</button><button type="button" data-note-headings>选择当前页面章节</button></div><label>章节<select data-note-anchor><option value="">按阅读进度定位</option></select></label><label>阅读进度 <output data-note-percent></output><input data-note-ratio type="range" min="0" max="1000"></label></details>'+
   '<div class="private-note-toolbar"><div role="tablist" aria-label="笔记视图"><button role="tab" aria-selected="true" data-note-mode="edit">编辑</button><button role="tab" aria-selected="false" data-note-mode="preview">预览</button></div><button type="button" data-note-formula title="插入 LaTeX 公式">公式</button><button type="button" data-note-download title="下载 Markdown">下载 .md</button></div>'+
   '<textarea data-note-body aria-label="Markdown 笔记正文" maxlength="100000" placeholder="写下推导、疑问或计算记录。支持 Markdown，行内公式使用 $...$，独立公式使用 \\[...\\]。"></textarea><div class="private-note-preview prose" data-note-preview hidden role="tabpanel" aria-label="笔记预览"></div>'+
   '<div class="private-note-conflict" hidden><p>云端内容已变化，当前草稿已保留。可另存为新笔记，或载入云端版本。</p><button type="button" data-note-copy>另存为新笔记</button> <button type="button" data-note-reload>载入云端版本</button></div>'+
   '<footer><div><span data-note-count>0 字</span><span data-note-status role="status">尚未填写</span></div><div><a href="/account/#notes" data-note-manage>管理笔记</a><button type="button" data-note-open>打开笔记</button><button type="button" data-note-new>新建</button><button type="button" class="button" data-note-save>保存</button></div></footer></div>'+
   ['n','e','s','w','ne','nw','sw','se'].map(edge=>'<span class="private-note-resize" data-note-resize="'+edge+'" '+(edge==='se'?'role="button" tabindex="0" aria-label="调整笔记窗口大小；方向键调整，Shift 加快"':'aria-hidden="true"')+' title="拖动调整笔记窗口大小"></span>').join('');
  document.body.append(host);
  $('[data-note-popout]',host).hidden=standalone;
  if(standalone)$('[data-note-manage]',host).target='_blank';
  const header=$('.private-note-header',host);let drag=null;
  if(standalone){header.removeAttribute('tabindex');header.setAttribute('aria-label','独立笔记窗口');}
  function start(e,edge){if(e.button!==0||drag||(!edge&&e.target.closest('button'))||standalone)return;e.preventDefault();const r=host.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,r,edge,target:e.currentTarget};drag.target.setPointerCapture(e.pointerId);host.classList.add('is-adjusting');}
  function move(e){if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;rect=drag.edge?resizeRect(drag.r,drag.edge,dx,dy):{x:drag.r.x+dx,y:drag.r.y+dy,w:drag.r.width,h:drag.r.height};place();}
  function stop(e){if(!drag||drag.id!==e.pointerId)return;const active=drag;drag=null;if(active.target.hasPointerCapture(e.pointerId))active.target.releasePointerCapture(e.pointerId);host.classList.remove('is-adjusting');remember();}
  for(const el of [header,...host.querySelectorAll('[data-note-resize]')]){el.onpointerdown=e=>start(e,el.dataset.noteResize);el.onpointermove=move;el.onpointerup=stop;el.onpointercancel=stop;el.onlostpointercapture=stop;}
  $('[data-note-resize="se"]',host).onkeydown=e=>{if(standalone)return;const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!d)return;e.preventDefault();const step=e.shiftKey?40:12;rect=resizeRect(host.getBoundingClientRect(),'se',d[0]*step,d[1]*step);place();remember();};
  header.onkeydown=e=>{if(e.target!==header||standalone)return;const d={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[e.key];if(!d)return;e.preventDefault();rect.x+=d[0];rect.y+=d[1];place();remember();};
  host.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();void save();}if(e.key==='Escape'){e.stopPropagation();if(!$('.private-note-picker',host).hidden)hidePicker();else void close();}});
  $('[data-note-title]',host).oninput=e=>{note.title=e.target.value;changed();};
  $('[data-note-body]',host).oninput=e=>{note.body=e.target.value;changed();};
  $('[data-note-capture]',host).onclick=()=>{Object.assign(note,pageInfo());changed();locationView();};
  $('[data-note-headings]',host).onclick=()=>headingsView();
  $('[data-note-anchor]',host).onchange=e=>{
   const w=sourceWindow(),h=w.document.getElementById(e.target.value);if(!h)return;
   Object.assign(note,pageInfo(),{anchor_id:h.id,anchor_text:h.textContent.trim().slice(0,300),anchor_offset:0,
    scroll_ratio:Math.max(0,Math.min(1,(w.scrollY+h.getBoundingClientRect().top-70)/Math.max(1,w.document.documentElement.scrollHeight-w.innerHeight)))});
   changed();locationView();
  };
  $('[data-note-ratio]',host).oninput=e=>{note.scroll_ratio=Number(e.target.value)/1000;note.anchor_id='';note.anchor_text='';note.anchor_offset=0;changed();locationView();};
  $('[data-note-save]',host).onclick=()=>void save();
  $('[data-note-open]',host).onclick=showPicker;
  $('[data-note-picker-back]',host).onclick=()=>hidePicker();
  $('[data-note-picker-new]',host).onclick=()=>{hidePicker(false);void newNote();};
  $('[data-note-picker-query]',host).oninput=()=>{clearTimeout(pickerTimer);pickerToken++;$('.private-note-picker-list',host).replaceChildren();$('[data-note-picker-more]',host).hidden=true;pickerTimer=setTimeout(()=>void loadPicker(),250);};
  $('[data-note-picker-more]',host).onclick=()=>void loadPicker(true);
  $('.private-note-picker-list',host).onclick=e=>{const b=e.target.closest('[data-note-pick]');if(!b)return;hidePicker(false);void show(b.dataset.notePick);};
  $('[data-note-new]',host).onclick=()=>void newNote();
  $('[data-note-close]',host).onclick=()=>void close();
  $('[data-note-popout]',host).onclick=popout;
  $('[data-note-download]',host).onclick=download;
  const share=document.createElement('button');share.type='button';share.dataset.noteShare='';share.textContent='分享给好友';$('[data-note-download]',host).after(share);
  share.onclick=async()=>{if(share.disabled)return;share.disabled=true;try{const id=note?.id;if(!window.FoamSocial)throw Error('好友服务尚未就绪，请稍后重试。');if(!await save()||dirty||conflict||note?.id!==id)return;await window.FoamSocial.shareNote(id,note.title);}catch(error){status(error.message,true);}finally{share.disabled=false;}};
  $('[data-note-copy]',host).onclick=()=>{clearTimeout(timer);note={...payload(note),id:crypto.randomUUID(),title:(note.title.slice(0,150)+'（副本）'),revision:0};base=null;conflict=false;serial++;form();changed();void save();};
  $('[data-note-reload]',host).onclick=async()=>{if(!confirm('载入云端版本会替换窗口内的草稿。是否继续？'))return;try{const r=check(await client().from(TABLE).select('*').eq('id',note.id).single());adopt(r);}catch(e){status(e.message,true);}};
  host.querySelectorAll('[data-note-mode]').forEach(b=>b.onclick=()=>mode(b.dataset.noteMode));
  $('[data-note-formula]',host).onclick=()=>{mode('edit');const t=$('[data-note-body]',host);t.setRangeText('\n\\[\nq = -k \\nabla T\n\\]\n',t.selectionStart,t.selectionEnd,'select');note.body=t.value;changed();t.focus();};
  place();
 }
 function noteLink(n){const u=new URL(safePage(n.page_url)||'/',location.origin);u.searchParams.set('note',n.id);return u.pathname+u.search;}
 function hidePicker(focus=true){
  pickerToken++;clearTimeout(pickerTimer);pickerRows=[];
  if(!host)return;
  $('.private-note-picker',host).hidden=true;$('.private-note-form',host).hidden=false;
  $('.private-note-picker-list',host).replaceChildren();
  if(focus)$('[data-note-open]',host).focus({preventScroll:true});
 }
 function showPicker(){
  $('.private-note-form',host).hidden=true;$('.private-note-picker',host).hidden=false;
  $('[data-note-picker-query]',host).value='';pickerRows=[];
  void loadPicker();$('[data-note-picker-query]',host).focus({preventScroll:true});
 }
 async function loadPicker(append=false){
  if(!uid||!host||$('.private-note-picker',host).hidden)return;
  const token=++pickerToken,who=uid,page=append?pickerPage+1:0;
  const query=$('[data-note-picker-query]',host).value.trim(),message=$('[data-note-picker-status]',host),next=$('[data-note-picker-more]',host);
  message.textContent='正在读取笔记…';next.disabled=true;if(!append){next.hidden=true;$('.private-note-picker-list',host).replaceChildren();}
  try{
   let request=client().from(TABLE).select('id,title,page_title,anchor_text,updated_at').order('updated_at',{ascending:false}).order('id').range(page*30,page*30+30);
   if(query)request=request.ilike('title','%'+query.replace(/[%_\\]/g,'\\$&')+'%');
   const result=check(await request);if(token!==pickerToken||who!==identity())return;
   pickerPage=page;pickerRows=[...new Map((append?pickerRows.concat(result.slice(0,30)):result.slice(0,30)).map(r=>[r.id,r])).values()];
   $('.private-note-picker-list',host).innerHTML=pickerRows.map(r=>'<button type="button" class="private-note-choice" data-note-pick="'+esc(r.id)+'"><strong>'+esc(r.title)+(r.id===note?.id?'<span>当前</span>':'')+'</strong><span>'+esc(r.page_title)+(r.anchor_text?' · '+esc(r.anchor_text):'')+'</span><small>修改于 '+esc(window.FoamLab.dateTime(r.updated_at))+'</small></button>').join('');
   message.textContent=pickerRows.length?'按最近修改排列 · '+pickerRows.length+' 篇':query?'没有符合条件的笔记。':'还没有已保存的笔记。';next.hidden=result.length<=30;
  }catch(e){if(token===pickerToken)message.textContent='笔记读取失败：'+e.message;}
  finally{if(token===pickerToken)next.disabled=false;}
 }
 function locationView(){
  $('[data-note-location]',host).textContent=(note.page_title||'页面')+' · '+(note.anchor_text||Math.round(note.scroll_ratio*100)+'%');
  $('[data-note-link]',host).href=noteLink(note);if(standalone)$('[data-note-link]',host).target='_blank';
  $('[data-note-percent]',host).textContent=Math.round(note.scroll_ratio*100)+'%';
  $('[data-note-ratio]',host).value=Math.round(note.scroll_ratio*1000);
 }
 function headingsView(){
  const select=$('[data-note-anchor]',host),w=sourceWindow();
  const hs=[...w.document.querySelectorAll('#live-article .prose h2[id],#live-article .prose h3[id],main .article .prose h2[id],main .article .prose h3[id]')];
  select.innerHTML='<option value="">请选择章节</option>'+hs.map(h=>'<option value="'+esc(h.id)+'">'+esc(h.textContent.trim())+'</option>').join('');
  select.value=note.anchor_id;select.focus();
 }
 function mode(value){
  const isPreview=value==='preview';
  $('[data-note-body]',host).hidden=isPreview;$('[data-note-preview]',host).hidden=!isPreview;
  host.querySelectorAll('[data-note-mode]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.noteMode===value)));
  if(isPreview)preview();
 }
 function preview(){if(!host||!note)return;const p=$('[data-note-preview]',host);p.innerHTML=window.FoamLab.markdown(note.body||'*尚未填写笔记。*');p.querySelectorAll('a').forEach(a=>{a.target='_blank';a.rel='noopener noreferrer';});}
 function form(){
  build();hidePicker(false);$('[data-note-title]',host).value=note.title;$('[data-note-body]',host).value=note.body;
  $('[data-note-count]',host).textContent=count(note.body)+' 字';
  $('.private-note-conflict',host).hidden=!conflict;
  locationView();mode('edit');status(conflict?'云端版本已更新，草稿保留在此窗口。':dirty?'未同步的草稿':note.revision?'已保存':'输入后自动保存',conflict);
 }
 function changed(){
  dirty=true;serial++;remember();$('[data-note-count]',host).textContent=count(note.body)+' 字';
  status(conflict?'请先处理云端版本差异。':'等待保存…',conflict);
  clearTimeout(timer);if(!conflict)timer=setTimeout(()=>void save(),900);
  clearTimeout(previewTimer);if(!$('[data-note-preview]',host).hidden)previewTimer=setTimeout(preview,200);
 }
 function adopt(r){note=r;base=payload(r);dirty=false;conflict=false;serial++;form();remember();}
 async function save(){
  if(task){await task;return dirty&&!conflict?save():!dirty;}
  if(!dirty)return true;if(conflict)return false;
  if(!uid||identity()!==uid)return false;
  if(!note.title.trim()){status('请填写笔记标题。',true);return false;}
  const who=uid,id=note.id,version=serial,snapshot={...note,title:note.title.trim()},data=payload(snapshot),oldBase=base;
  status('正在保存…');
  const run=async()=>{
   try{
    // Reconcile after navigation or an ambiguous response before writing again.
    const remote=check(await client().from(TABLE).select('*').eq('id',id).maybeSingle());
    if(identity()!==who||uid!==who||note?.id!==id)return false;
    let saved;
    if(remote&&same(remote,snapshot))saved=remote;
    else if(remote&&(!oldBase||!same(remote,oldBase))){
     conflict=true;$('.private-note-conflict',host).hidden=false;
     throw Error('云端版本已更新，当前草稿已保留。');
    }else if(!remote&&snapshot.revision){conflict=true;$('.private-note-conflict',host).hidden=false;throw Error('云端笔记已删除，当前草稿可下载备份。');}
    else if(remote){
     const updated=check(await client().from(TABLE).update(data).eq('id',id).eq('revision',remote.revision).select());
     if(!updated.length){conflict=true;$('.private-note-conflict',host).hidden=false;throw Error('保存时云端版本发生变化，当前草稿已保留。');}saved=updated[0];
    }else saved=check(await client().from(TABLE).insert({id,...data}).select().single());
    if(identity()!==who||uid!==who||note?.id!==id)return false;
    base=payload(saved);note.revision=saved.revision;note.created_at=saved.created_at;note.updated_at=saved.updated_at;
    if(serial===version){dirty=false;note.title=saved.title;$('[data-note-title]',host).value=saved.title;}
    remember();status(dirty?'继续保存修改…':'已保存 '+new Date(saved.updated_at).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}));
    if($('#my-notes'))void loadList(false);
    return true;
   }catch(e){if(who===uid&&note?.id===id){remember();status(e.message||'保存失败，草稿已保留。',true);}return false;}
  };
  const pending=run();task=pending;const result=await pending;if(task===pending)task=null;
  if(who!==uid)return false;
  if(result&&dirty&&!conflict)return save();
  return result;
 }
 async function newNote(){
  if(dirty&&!await save())return;
  const p=pageInfo();note={id:crypto.randomUUID(),title:(p.page_title+' · 阅读笔记').slice(0,160),body:'',...p,revision:0};
  base=null;dirty=false;conflict=false;serial++;form();remember();$('[data-note-body]',host).focus();
 }
 async function show(id){
  await window.foamAuth?.ready;
  if(!identity()){window.foamNotify?.('登录后即可使用私人笔记。');return;}
  if(uid!==identity())await authChanged();
  build();
  const targetId=id||(!dirty&&note?.revision?note.id:null);
  if(targetId&&(note?.id!==targetId||!dirty)){
   if(dirty&&!await save())return;
   const token=++loadToken,who=uid,version=serial;
   try{const r=check(await client().from(TABLE).select('*').eq('id',targetId).maybeSingle());if(token!==loadToken||who!==identity()||version!==serial)return;if(!r){if(id)throw Error('笔记已删除或不属于当前账号。');note=null;base=null;await newNote();}else adopt(r);}
   catch(e){if(!note||(id&&id!==note.id)){window.foamNotify?.(e.message);return;}form();status('暂未读取云端版本，已保留本机笔记。',true);}
  }else if(!note)await newNote();
  open=true;host.hidden=false;place();remember();$('[data-note-title]',host).focus({preventScroll:true});
 }
 async function close(){
  hidePicker(false);
  if(standalone){if(dirty&&!await save())return;open=false;remember();window.close();return;}
  open=false;host.hidden=true;remember();void save();
 }
 function popout(){
  hidePicker(false);
  remember();const popup=window.open('/notes/','_blank','popup,width=560,height=740,resizable=yes,scrollbars=yes');
  if(!popup){status('浏览器阻止了独立窗口，请允许弹出窗口后重试。',true);return;}
  // The new window receives this tab's draft; its lifetime is independent.
  popup.focus();open=false;host.hidden=true;remember();
 }
 function download(){
  if(!note)return;const link=location.origin+(safePage(note.page_url)||'/');
  const blob=new Blob(['# '+note.title+'\n\n[阅读位置]('+link+')\n\n'+note.body+'\n'],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=(note.title.replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,100)||'笔记')+'.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function listShell(){
  const el=$('#my-notes');if(!el||el.dataset.ready)return;el.dataset.ready='true';
  el.innerHTML='<div class="section-heading"><div><h2>我的笔记</h2><p class="muted">仅自己可见。点击笔记打开窗口，点击“跳转到记录位置”返回关联页面。</p></div><button class="button" data-new-private-note>新建笔记</button></div><div class="private-note-filters"><label>查找笔记<input type="search" maxlength="120" data-notes-search placeholder="按标题查找"></label><label>排序<select data-notes-order><option value="updated_at">最近修改</option><option value="created_at">最近创建</option><option value="title">标题</option></select></label></div><p data-notes-status role="status"></p><div class="private-note-list"></div><button class="button secondary" data-notes-more hidden>加载更多</button>';
  $('[data-new-private-note]',el).onclick=async()=>{await show();await newNote();};
  let debounce;$('[data-notes-search]',el).oninput=()=>{clearTimeout(debounce);debounce=setTimeout(()=>void loadList(false),250);};
  $('[data-notes-order]',el).onchange=()=>void loadList(false);
  $('[data-notes-more]',el).onclick=()=>void loadList(true);
  $('.private-note-list',el).onclick=async e=>{
   const b=e.target.closest('[data-note-show],[data-note-edit],[data-note-delete],[data-note-share-id]');
   if(!b){const row=e.target.closest('[data-private-note-id]');if(row&&!e.target.closest('a,button,input,select,textarea')&&!window.getSelection()?.toString())return show(row.dataset.privateNoteId);return;}
   const id=b.dataset.noteShow||b.dataset.noteEdit||b.dataset.noteDelete||b.dataset.noteShareId;if(b.dataset.noteShow||b.dataset.noteEdit)return show(id);
   if(b.dataset.noteShareId){const row=rows.find(r=>r.id===id);if(row)await window.FoamSocial?.shareNote(id,row.title);return;}
   const row=rows.find(r=>r.id===id);if(!row||!confirm('删除笔记“'+row.title+'”？删除后无法恢复。'))return;
   b.disabled=true;
   try{
    const deleted=check(await client().from(TABLE).delete().eq('id',id).eq('revision',row.revision).select('id'));
    if(!deleted.length)throw Error('笔记已有新的修改，请刷新后再删除。');
    if(note?.id===id){clearTimeout(timer);note=null;base=null;dirty=false;conflict=false;open=false;if(host)host.hidden=true;remember();}
    await loadList(false);
   }catch(err){$('[data-notes-status]',el).textContent=err.message;b.disabled=false;}
  };
 }
 async function loadList(append=false){
  listShell();const el=$('#my-notes');if(!el)return;
  const statusEl=$('[data-notes-status]',el),target=$('.private-note-list',el);
  if(!uid){target.replaceChildren();statusEl.textContent='登录后管理私人笔记。';$('[data-new-private-note]',el).disabled=true;return;}
  $('[data-new-private-note]',el).disabled=false;
  const token=++listToken,who=uid,page=append?listPage+1:0,query=$('[data-notes-search]',el).value.trim(),order=$('[data-notes-order]',el).value;
  statusEl.textContent='正在读取笔记…';$('[data-notes-more]',el).disabled=true;
  try{
   let request=client().from(TABLE).select('id,title,page_url,page_title,anchor_text,scroll_ratio,word_count,revision,created_at,updated_at').order(order,{ascending:order==='title'}).order('id').range(page*30,page*30+30);
   if(query)request=request.ilike('title','%'+query.replace(/[%_\\]/g,'\\$&')+'%');
   const result=check(await request);if(token!==listToken||who!==identity())return;
   more=result.length>30;listPage=page;rows=append?rows.concat(result.slice(0,30)):result.slice(0,30);listQuery=query;
   target.innerHTML=rows.map(r=>'<article class="private-note-row" data-private-note-id="'+esc(r.id)+'"><div><button type="button" class="private-note-row-title" data-note-show="'+esc(r.id)+'" aria-haspopup="dialog" aria-controls="private-notebook">'+esc(r.title)+'</button><p>'+esc(r.page_title)+(r.anchor_text?' · '+esc(r.anchor_text):' · '+Math.round(r.scroll_ratio*100)+'%')+'</p><div class="private-note-dates"><span>'+r.word_count+' 字</span><span>创建 '+esc(window.FoamLab.dateTime(r.created_at))+'</span><span>修改 '+esc(window.FoamLab.dateTime(r.updated_at))+'</span></div></div><div class="private-note-actions"><a class="text-link" data-note-visit href="'+esc(noteLink(r))+'">跳转到记录位置 →</a><button type="button" data-note-edit="'+r.id+'">编辑</button><button type="button" data-note-share-id="'+r.id+'">分享给好友</button><button type="button" data-note-delete="'+r.id+'">删除</button></div></article>').join('');
   statusEl.textContent=rows.length?'已显示 '+rows.length+' 篇笔记':query?'没有符合条件的笔记。':'还没有笔记。阅读时双击熊猫即可记录。';
   $('[data-notes-more]',el).hidden=!more;
  }catch(e){if(token===listToken)statusEl.textContent='笔记读取失败：'+e.message;}
  finally{if(token===listToken)$('[data-notes-more]',el).disabled=false;}
 }
 let restoreDone=false;
 async function restorePosition(){
  if(restoreDone||!uid)return;const id=new URLSearchParams(location.search).get('note');
  if(!/^[a-f0-9-]{36}$/i.test(id||''))return;
  const reader=$('#live-article');
  if(reader&&!reader.querySelector('.prose:not(.lab-preview)'))return;
  restoreDone=true;const who=uid;
  try{
   const n=check(await client().from(TABLE).select('page_url,anchor_id,anchor_offset,scroll_ratio').eq('id',id).maybeSingle());
   if(!n||identity()!==who)return;
   const current=new URL(location.href);current.searchParams.delete('note');
   if(safePage(n.page_url)!==current.pathname+current.search)return;
   const images=[...document.querySelectorAll('main img')];await Promise.race([Promise.all(images.filter(im=>im.loading!=='lazy').map(im=>im.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,700))]);
   await new Promise(requestAnimationFrame);
   const h=n.anchor_id?document.getElementById(n.anchor_id):null;
   const y=h?scrollY+h.getBoundingClientRect().top+n.anchor_offset-70:n.scroll_ratio*Math.max(0,document.documentElement.scrollHeight-innerHeight);
   scrollTo({top:Math.max(0,y),behavior:'instant'});
  }catch{window.foamNotify?.('暂时无法恢复笔记位置，可稍后重试。');}
 }
 async function authChanged(){
  await window.foamAuth?.ready;
  const next=identity()||'';if(next===uid)return;
  if(uid){try{sessionStorage.removeItem(KEY+uid);}catch{}}
  uid=next;loadToken++;listToken++;pickerToken++;clearTimeout(pickerTimer);pickerRows=[];clearTimeout(timer);note=null;base=null;dirty=false;conflict=false;open=false;rows=[];task=null;restoreDone=false;
  if(host){host.remove();host=null;}
  if(uid){
   try{const cached=JSON.parse(sessionStorage.getItem(KEY+uid)||'null');if(cached?.note&&safePage(cached.note.page_url)){({note,base,dirty,rect}=cached);open=cached.open===true;conflict=cached.conflict===true;}}
   catch{}
   if(note){form();host.hidden=!(open||standalone);place();if(dirty&&!conflict)timer=setTimeout(()=>void save(),500);}
   if(standalone){await show();$('.notebook-standalone-hint')?.remove();}
   void restorePosition();
  }
  void loadList(false);
 }
 window.FoamPrivateNotes={open:show,capture:pageInfo};
 window.addEventListener('foam-auth-change',()=>void authChanged());
 document.addEventListener('foamlab:content-ready',()=>{setTimeout(()=>void restorePosition(),60);});
 window.addEventListener('resize',()=>{place();remember();});
 window.addEventListener('pagehide',remember);
 window.addEventListener('beforeunload',e=>{remember();if(standalone&&dirty){e.preventDefault();e.returnValue='';}});
 window.addEventListener('online',()=>{if(dirty&&!conflict)void save();});
 window.addEventListener('foamlab:account-tab',e=>{if(e.detail?.key==='notes')void loadList(false);});
 document.addEventListener('click',e=>{if(e.target.closest('[data-open-private-notes]'))void show();});
 void authChanged();
})();

;
/* page-views.js */
'use strict';
(() => {
 const main=document.querySelector('main'),url=new URL(location.href);
 // Count reading pages only. Directory cards and account/admin interfaces are
 // navigation surfaces; their visits are already covered by the site statistics.
 const isReadingPage=main?.querySelector('article.article')||(url.pathname==='/community/'&&url.searchParams.get('topic'));
 if(!isReadingPage)return;
 const box=document.createElement('div');box.className='page-view-stat';box.dataset.pageViews='';box.dataset.state='loading';
 box.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg><span>浏览 <span data-page-view-count>—</span> 次</span>';
 const hint='同一次访问中，本页只计一次；刷新不增加浏览数。从功能上线起累计。';box.title=hint;
 const count=box.querySelector('[data-page-view-count]'),states=new Map(),ackKey='foamlab.page-views.counted';let current='',queued=false,ready=false,visit=null;
 function acknowledgements(){try{const row=JSON.parse(localStorage.getItem(ackKey)||'null');return row?.visit===visit&&Array.isArray(row.pages)?row.pages:[];}catch{return [];}}
 function remember(key){try{localStorage.setItem(ackKey,JSON.stringify({visit,pages:[...new Set([...acknowledgements(),key])]}));}catch{}}
 function showCount(value){if(count.textContent!==value)count.textContent=value;}
 function identity(){
  const url=new URL(location.href),slug=document.querySelector('.article[data-cms-slug]')?.dataset.cmsSlug||(url.pathname==='/read/'?url.searchParams.get('slug'):'');
  if(slug)return 'content:'+slug;
  if(url.pathname==='/community/'&&url.searchParams.has('topic'))return 'topic:'+url.searchParams.get('topic');
  const D=window.FoamDirectory;let node=D?.available?D.current():null;
  if(node&&new URL(D.url(node),location.origin).hash)node=D.ancestors(node.id).reverse().find(n=>!new URL(D.url(n),location.origin).hash);
  if(node&&!/^\/(?:account|admin|studio|notes)\//.test(url.pathname))return 'section:'+node.id;
  if(url.pathname==='/section/'&&url.searchParams.has('id'))return 'section:'+url.searchParams.get('id');
  return 'path:'+url.pathname.replace(/\/index\.html$/,'/');
 }
 function mount(){
  const title=main.querySelector('article.article h1,article.lab-topic h1');
  if(!title){box.remove();return false;}
  if(title.nextElementSibling!==box)title.after(box);
  return true;
 }
 async function update(force=false){
  if(!mount()||!ready)return;
  const key=identity();
  if(key!==current){current=key;showCount('—');box.dataset.state='loading';}
  let state=states.get(key);if(!state){state={id:visit,counted:acknowledgements().includes(key),busy:false,at:0};states.set(key,state);}
  if(Number.isSafeInteger(state.views)&&box.dataset.state!=='unavailable')showCount(state.views.toLocaleString('zh-CN'));
  if(state.busy||document.hidden||(!force&&state.at&&Date.now()-state.at<30000))return;
  const client=window.foamAuth?.client;if(!client)return;
  state.busy=true;
  try{
   const {data,error}=await client.rpc('foamlab_page_views',{p_page:key,p_view:state.counted?null:state.id});
   if(error||!Number.isSafeInteger(data?.views)||data.views<0)throw error||Error('Unavailable count');
   state.counted=true;remember(key);state.views=data.views;state.at=Date.now();
   if(current===key){showCount(data.views.toLocaleString('zh-CN'));box.dataset.state='ready';box.title=hint;}
  }catch{
   state.at=Date.now();if(current===key){showCount('—');box.dataset.state='unavailable';box.title='浏览数暂时无法读取，稍后自动重试';}
  }finally{state.busy=false;}
 }
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;void update();});}
 new MutationObserver(()=>{mount();schedule();}).observe(main,{childList:true,subtree:true});
 for(const name of ['foamlab:content-ready','foamlab:article-locked'])document.addEventListener(name,schedule);
 window.addEventListener('foam-auth-change',()=>{for(const state of states.values())state.at=0;schedule();});
 window.addEventListener('popstate',schedule);
 window.addEventListener('pageshow',e=>{if(e.persisted)void initialize();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void update(true);});
 window.addEventListener('online',()=>void update(true));
 setInterval(()=>void update(true),30000);
 mount();
 async function initialize(){
  ready=false;await window.foamAuth?.ready;await window.FoamDirectory?.ready;
  const next=await window.FoamSiteVisit?.get();if(!next)return;
  if(next!==visit){visit=next;states.clear();current='';}ready=true;void update();
 }
 void initialize();
})();

;
/* social.js */
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
 async function requireLogin(){await A.ready;if(A.user)return true;if($('.social-login[open]'))return false;const d=makeDialog('social-login','登录后使用好友功能','<p>添加好友、私聊和分享笔记需要登录。</p><button type="button" data-social-login>使用 GitHub 登录</button>');$('[data-social-login]',d).onclick=()=>{d.close();void L.login();};return false;}
 async function act(button,status,operation,payload,done){
  if(button.disabled)return;button.disabled=true;status.textContent='正在处理…';
  try{const result=await api(operation,payload);summaryVersion++;invalidateLists();status.textContent='';await done?.(result);void refreshSummary(true);refreshOpenList();}
  catch(error){if(status.isConnected)status.textContent=error.message;}
  finally{if(button.isConnected)button.disabled=false;}
 }
 function person(p){return '<span class="social-avatar" aria-hidden="true">'+avatar(p)+'</span><span class="social-person-copy"><strong>'+esc(title(p))+'</strong><small>'+esc(p.remark&&p.remark!==p.name?'昵称：'+p.name:'Lv.'+p.level+' · '+(p.institution||'未填写学校／单位'))+'</small></span>';}
 function online(p){return '<span class="social-presence'+(p.online?' is-online':'')+'"><i aria-hidden="true"></i>'+(p.online?'在线':'离线')+'</span>';}
 async function requestFriend(profile,done){
  if(!uuid(profile.user_id)||!await requireLogin()||$('.social-friend-request[open]'))return;
  const d=makeDialog('social-friend-request','好友申请','<div class="social-profile-identity">'+person(profile)+'</div><form class="social-request-form"><label>申请留言（选填）<textarea name="message" rows="3" maxlength="140" placeholder="介绍一下自己，方便对方认识你"></textarea></label><p class="social-status" role="status"></p><div class="social-actions"><button type="button" class="secondary" data-request-cancel>取消</button><button type="submit">发送申请</button></div></form>'),form=$('form',d),status=$('.social-status',d);
  $('[data-request-cancel]',d).onclick=()=>d.close();
  form.onsubmit=e=>{e.preventDefault();void act($('[type=submit]',form),status,'request',{user_id:profile.user_id,message:form.elements.message.value},next=>{profiles.set(profile.user_id,next);done?.(next);d.close();});};
  form.elements.message.focus({preventScroll:true});
 }
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
 async function showMemberGroup(dimension,label){
  if(!['institutions','research'].includes(dimension)||typeof label!=='string'||!label.trim()||!await requireLogin())return;
  if($('.social-member-group[open]'))return;
  const d=makeDialog('social-member-group',label+' · 成员','<p class="social-group-summary"></p><div class="social-group-list" aria-live="polite"></div><p class="social-status" role="status"></p><nav class="social-group-pages" aria-label="成员列表翻页"><button type="button" class="secondary" data-group-previous>上一页</button><span data-group-page></span><button type="button" class="secondary" data-group-next>下一页</button></nav>');
  const list=$('.social-group-list',d),status=$('.social-status',d),previous=$('[data-group-previous]',d),next=$('[data-group-next]',d);let page=0,version=0,busy=false;
  async function read(target){
   if(busy)return;busy=true;const request=++version;previous.disabled=next.disabled=true;list.setAttribute('aria-busy','true');if(!list.children.length)status.textContent='正在查看成员…';
   try{
    const result=await api('member_group',{dimension,label,page:target});if(!d.isConnected||request!==version)return;
    page=result.page;status.textContent='';list.replaceChildren();
    $('.social-group-summary',d).textContent=(dimension==='institutions'?'学校／单位':'研究方向')+' · 共 '+result.total+' 位成员';
    for(const p of result.items){
     const row=document.createElement('article');row.className='social-group-member';row.dataset.memberId=p.user_id;
     const identity=document.createElement('button');identity.type='button';identity.className='social-person';identity.dataset.socialProfile=p.user_id;identity.innerHTML=person(p);identity.setAttribute('aria-label','查看 '+title(p)+' 的资料');
     const name=identity.querySelector('strong'),heading=document.createElement('span');heading.className='social-group-name';name.replaceWith(heading);heading.append(name);heading.insertAdjacentHTML('beforeend',online(p));row.append(identity);
     const research=document.createElement('small');research.className='social-group-research';research.textContent=p.research||'未填写研究方向';row.append(research);
     const action=document.createElement('button');action.type='button';action.className='secondary social-group-action';
     function update(profile){
      const relation=profile.relation;action.textContent=relation==='self'?'我':relation==='friends'?'发消息':relation==='outgoing'?'已申请':relation==='incoming'?'查看申请':['blocked','unavailable'].includes(relation)?'查看资料':'加好友';action.disabled=relation==='self'||relation==='outgoing';
      action.onclick=()=>{if(relation==='friends')void openChat(profile.user_id);else if(['incoming','blocked','unavailable'].includes(relation))void showProfile(profile.user_id);else void requestFriend(profile,next=>{if(action.isConnected)update(next);});};
     }
     update(p);row.append(action);list.append(row);
    }
    if(!result.items.length){const empty=document.createElement('p');empty.className='social-empty';empty.textContent='暂无符合条件的成员。';list.append(empty);}
    $('[data-group-page]',d).textContent=(page+1)+' / '+Math.max(1,Math.ceil(result.total/50));previous.disabled=page===0;next.disabled=!result.more;
   }catch(error){
    if(d.isConnected){status.textContent=error.message;const retry=document.createElement('button');retry.type='button';retry.className='secondary';retry.textContent='重试';retry.onclick=()=>void read(target);status.append(retry);}
   }finally{if(d.isConnected){list.removeAttribute('aria-busy');busy=false;}}
  }
  previous.onclick=()=>void read(page-1);next.onclick=()=>void read(page+1);d.addEventListener('close',()=>++version,{once:true});await read(0);
 }
 window.FoamSocial={open:openHub,profile:showProfile,group:showMemberGroup,chat:openChat,shareNote:chooseShare,refresh:()=>refreshSummary(true)};
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

