'use strict';
(() => {
 const L=window.FoamLab,esc=L.esc;
 const D=window.FoamDirectory={nodes:[],available:false};
 D.get=id=>D.nodes.find(n=>n.id===id);
 D.children=id=>D.nodes.filter(n=>n.parent_id===(id||null)).sort((a,b)=>a.sort_order-b.sort_order||a.name.localeCompare(b.name));
 D.descendants=id=>{const ids=new Set([id]);for(let i=0;i<D.nodes.length;i++)for(const n of D.nodes)if(ids.has(n.parent_id))ids.add(n.id);return [...ids];};
 D.ancestors=id=>{const out=[],seen=new Set();for(let n=D.get(id);n&&!seen.has(n.id);n=D.get(n.parent_id)){seen.add(n.id);out.unshift(n);}return out;};
 D.path=id=>D.ancestors(id).map(n=>n.name).join(' / ');
 D.isVisible=n=>D.ancestors(n.id).every(x=>x.visible);
 D.url=n=>{if(n?.href&&!n.href.startsWith('/read/?')&&n.key!=='programming-examples'){try{const u=new URL(n.href,location.origin);if(u.origin===location.origin)return u.pathname+u.search+u.hash;}catch{}}return '/section/?id='+encodeURIComponent(n.id);};
 D.locations=row=>(row.section_ids||[]).map(D.path).filter(Boolean);
 D.options=(selected='',exclude=[])=>'<option value="">顶层模块</option>'+D.nodes.filter(n=>!exclude.includes(n.id)).map(n=>'<option value="'+n.id+'" '+(n.id===selected?'selected':'')+'>'+esc(D.path(n.id))+'</option>').join('');
 D.current=()=>{const u=new URL(location.href),id=u.searchParams.get('id');if(u.pathname==='/section/')return D.get(id);return D.nodes.filter(n=>n.href&&n.href!=='/admin/'&&(()=>{const v=new URL(n.href,location.origin);return v.pathname===u.pathname&&[...v.searchParams].every(([k,x])=>u.searchParams.get(k)===x);})()).sort((a,b)=>new URL(b.href,location.origin).search.length-new URL(a.href,location.origin).search.length)[0];};
 D.load=async()=>{await L.ready;const nodes=[];for(let start=0;;start+=500){const r=L.check(await L.client.from('foamlab_sections').select('*').order('sort_order').order('id').range(start,start+499));nodes.push(...r);if(r.length<500)break;}D.nodes=nodes;D.available=true;return D;};
 D.ready=D.load().catch(e=>{D.error=e;return D;});
 D.content=async node=>{const rows=[],ids=D.descendants(node.id);for(let start=0;;start+=200){const batch=L.check(await L.client.from('foamlab_content').select('id,slug,kind,title,summary,track,series,cover_url,metadata,section_ids,author_id,author_name,sort_order,published_at,created_at,updated_at').eq('status','published').overlaps('section_ids',ids).order('sort_order').order('id').range(start,start+199));rows.push(...batch);if(batch.length<200)return rows;}};
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
  let state={};try{state=JSON.parse(localStorage.getItem('foamlab-directory-open')||'{}');}catch{}
  const current=D.current(),active=new Set(D.ancestors(current?.id).map(n=>n.id));
  const item=(n,depth=0)=>{const children=D.children(n.id).filter(D.isVisible),open=state[n.id]??active.has(n.id);return '<div class="nav-group" data-directory-id="'+n.id+'" data-nav-section="'+esc(n.key)+'"><div class="nav-parent"><a class="nav-item '+(depth?'nav-subitem ':'')+(active.has(n.id)?'active':'')+'" href="'+esc(D.url(n))+'" '+(n.id===current?.id?'aria-current="page"':'')+'>'+(depth?'':(D.icons[n.key]||D.icons.topics||'<span class="directory-icon" aria-hidden="true">'+(icons[n.key]||'▦')+'</span>'))+'<span>'+esc(n.name)+'</span></a>'+(children.length?'<button type="button" class="nav-expand" aria-controls="directory-'+n.id+'" aria-expanded="'+open+'" aria-label="展开'+esc(n.name)+'"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6"/></svg></button>':'')+'</div>'+(children.length?'<div class="nav-subgroup" id="directory-'+n.id+'" '+(open?'':'hidden')+'>'+children.map(c=>item(c,depth+1)).join('')+'</div>':'')+'</div>';};
  const roots=D.children(null).filter(D.isVisible),town=roots.find(n=>n.key==='town'),regular=roots.filter(n=>n.key!=='town'),groups=[...new Set(regular.map(n=>n.nav_group))];
  const townLink=town?'<a class="town-entry town-nav-entry" href="'+esc(D.url(town))+'"><i class="town-nav-panda" aria-hidden="true"></i><span><strong>'+esc(town.name)+'</strong><small>带熊猫去逛逛</small></span><b aria-hidden="true">↗</b></a>':'';
  nav.innerHTML=townLink+groups.map(group=>'<div class="nav-label">'+esc(group)+'</div>'+regular.filter(n=>n.nav_group===group).map(n=>item(n)).join('')).join('');
  nav.onclick=e=>{const button=e.target.closest('.nav-expand');if(!button)return;const group=button.closest('[data-directory-id]'),open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));document.getElementById(button.getAttribute('aria-controls')).hidden=!open;state[group.dataset.directoryId]=open;try{localStorage.setItem('foamlab-directory-open',JSON.stringify(state));}catch{}};
 };
 D.breadcrumb=item=>{
  const ids=(item?.section_ids||[]).filter(id=>D.get(id)&&D.isVisible(D.get(id)));if(!ids.length)return;
  let node=D.get(ids[0]),returnTo='';try{const from=sessionStorage.getItem('foamlab.returnFor:'+location.pathname+location.search);if(from){const url=new URL(from,location.origin),matches=D.nodes.filter(n=>{const target=new URL(D.url(n),location.origin);return url.origin===location.origin&&target.pathname===url.pathname&&[...target.searchParams].every(([k,v])=>url.searchParams.get(k)===v);}).sort((a,b)=>new URL(D.url(b),location.origin).search.length-new URL(D.url(a),location.origin).search.length),found=matches[0];if(found&&ids.some(id=>D.descendants(found.id).includes(id))){node=found;returnTo=url.pathname+url.search+url.hash;}}}catch{}
  // A directory's own page returns to its parent, or the overview at the root.
  const target=new URL(D.url(node),location.origin),current=new URL(location.href);
  const isSelf=target.pathname===current.pathname&&[...target.searchParams].every(([k,v])=>current.searchParams.get(k)===v);
  let rootPage=false;if(isSelf){const parent=D.get(node.parent_id);rootPage=!parent;node=parent||node;returnTo='';}
  const parentURL=rootPage?'/':returnTo||D.url(node),parentName=rootPage?'学习概览':node.name;
  const link=document.querySelector('#breadcrumb-parent'),back=document.querySelector('#page-back-link');if(link){link.href=parentURL;link.textContent=rootPage?'学习概览':D.path(node.id);}if(back){back.href=parentURL;back.textContent='← 返回'+parentName;}
  const nav=document.querySelector('#sidebar nav');nav?.querySelectorAll('.active,[aria-current=page]').forEach(a=>{a.classList.remove('active');a.removeAttribute('aria-current');});
  for(const n of D.ancestors(node.id)){const group=nav?.querySelector('[data-directory-id="'+n.id+'"]');const link=group?.querySelector('.nav-parent>a');link?.classList.add('active');if(n.id===node.id)link?.setAttribute('aria-current','page');const b=group?.querySelector('.nav-expand');if(b){b.setAttribute('aria-expanded','true');document.getElementById(b.getAttribute('aria-controls')).hidden=false;}}
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
  if(current&&!reference&&!document.querySelector('[data-lab-catalog],#topic-hub,#fo-list,#live-article,.article[data-cms-slug],#cms-root')&&!location.pathname.startsWith('/admin/')){
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
