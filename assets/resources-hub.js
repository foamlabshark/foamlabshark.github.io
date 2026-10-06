'use strict';
// 资料中心：按“读者想做什么”分组展示，替代原先 61 项混排的分页卡片墙。
// 有搜索词时仍回退到原来的卡片列表；目录结构仍由后台的目录树决定。
(() => {
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const H=window.FoamResourcesHub={};
 const svg=p=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>';
 // 每个子目录的入口说明（按目录 key 匹配；后台新增的目录会使用目录名和简介）
 const INFO={
  resource:{ask:'下载算例与源码',when:'编程实例、算例包与使用说明。',icon:svg('<path d="M12 3v12m0 0-5-5m5 5 5-5M4 20h16"/>')},
  recommendation:{ask:'查找文档、工具与文献',when:'官方文档、工具教程、论文、专著与社区资源。',icon:svg('<path d="M10 14 21 3m0 0h-7m7 0v7M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>')}
 };
 const OTHER_ICON=svg('<path d="M4 6h16M4 12h16M4 18h10"/>');
 // 分组顺序：先给入门最常用的，再到进阶与社区
 const TRACK_ORDER=['源码与算例','站点与实践','官方文档','教程与课程','论文与专著','源码与开发','几何网格','可视化与数据','学术社区'];
 const TRACK_NOTE={
  '源码与算例':'编程实例与算例包，附使用说明。',
  '论文与专著':'经典文献原件与章节导读。',
  '站点与实践':'本站资料的出处与版本说明。',
  '官方文档':'版本说明、用户手册与编程接口。',
  '教程与课程':'官方算例库与系统的入门培训资料。',
  '源码与开发':'源码浏览、C++ API 查询与工作流辅助工具。',
  '几何网格':'几何建模与网格生成工具。',
  '可视化与数据':'后处理出图与 Python 数据分析。',
  '学术社区':'论坛、Wiki 与期刊，适合查经验和提问。'
 };
 const SERIES_ORDER=['主题参考手册','配置与命令综述','站点手册'];
 const SERIES_NOTE={
  '主题参考手册':'按主题逐项展开命令、字典与边界条件，遇到具体问题时查这里。',
  '配置与命令综述':'篇幅较短的总览，适合入门后从头读一遍，建立整体印象。'
 };
 const rank=(order,k)=>{const i=order.indexOf(k);return i<0?order.length:i;};
 const groupBy=(rows,key,order)=>{const m=new Map();for(const r of rows){const k=r[key]||'其他';if(!m.has(k))m.set(k,[]);m.get(k).push(r);}return [...m.entries()].sort((a,b)=>rank(order,a[0])-rank(order,b[0]));};
 const url=r=>{const p=r.metadata?.canonical_path;return typeof p==='string'&&p.startsWith('/')&&!p.startsWith('//')?p:'/read/?slug='+encodeURIComponent(r.slug);};
 const files=r=>{try{return window.FoamLab?.courseDownloads?.(r)||[];}catch{return [];}};
 const item=r=>{const n=files(r).length;return '<li><a href="'+esc(url(r))+'"><strong>'+esc(r.title)+'</strong>'+(r.summary?'<span>'+esc(r.summary)+'</span>':'')+'</a>'+(n?'<em class="rh-badge">含 '+n+' 个下载</em>':'')+'</li>';};
 const groups=rows=>'<div class="rh-groups">'+groupBy(rows,'track',TRACK_ORDER).map(([t,list])=>'<div class="rh-group"><h3>'+esc(t)+' <span>'+list.length+'</span></h3>'+(TRACK_NOTE[t]?'<p>'+esc(TRACK_NOTE[t])+'</p>':'')+'<ul class="rh-list">'+list.map(item).join('')+'</ul></div>').join('')+'</div>';
 const manuals=rows=>'<div class="rh-manuals">'+groupBy(rows,'series',SERIES_ORDER).map(([s,list])=>list.length===1
  ?'<a class="rh-single" href="'+esc(url(list[0]))+'"><strong>'+esc(list[0].title)+'</strong><span>'+esc(list[0].summary||'')+'</span></a>'
  :'<details class="rh-manual"><summary><span class="rh-manual-title"><strong>'+esc(s)+'</strong><em>'+list.length+' 章</em></span>'+(SERIES_NOTE[s]?'<small>'+esc(SERIES_NOTE[s])+'</small>':'')+'</summary><ul>'+list.map(r=>'<li><a href="'+esc(url(r))+'">'+esc(r.title)+'</a></li>').join('')+'</ul></details>').join('')+'</div>';
 const body=rows=>rows.length&&rows.every(r=>r.kind==='reference')?manuals(rows):groups(rows);
 const anchor=s=>'rh-'+String(s.key||'other').replace(/[^\w-]/g,'');
 function sectionsFor(rows,D){
  if(D?.available){
   const node=D.current()||D.nodes.find(n=>n.key==='resources');if(!node)return null;
   const kids=D.children(node.id).filter(D.isVisible);if(!kids.length)return null;
   const used=new Set(),out=kids.map(n=>{const ids=new Set(D.descendants(n.id)),list=rows.filter(r=>!used.has(r.id)&&(r.section_ids||[]).some(id=>ids.has(id)));list.forEach(r=>used.add(r.id));return {key:n.key,name:n.name,desc:n.description,url:D.url(n),rows:list};});
   const rest=rows.filter(r=>!used.has(r.id));if(rest.length)out.push({key:'other',name:'其他资料',url:'',rows:rest});
   return out.filter(s=>s.rows.length);
  }
  return [['resource','算例与源码'],['recommendation','资源推荐']].map(([key,name])=>({key,name,url:'/resources/?kind='+key,rows:rows.filter(r=>r.kind===key)})).filter(s=>s.rows.length);
 }
 H.render=({listing,rows,words,filtered,mode,D})=>{
  if(mode!=='resources')return false;
  const wrap=listing.closest('.page-wrap'),pager=listing.nextElementSibling,count=document.querySelector('#catalog-count');
  if(words.length){listing.classList.remove('rh-mode');return false;}
  listing.classList.add('rh-mode');if(pager?.classList.contains('list-pagination'))pager.innerHTML='';
  const sections=filtered?null:sectionsFor(rows,D);
  if(!sections){listing.innerHTML=rows.length?body(rows):'<div class="lab-empty">目前没有符合条件的内容。</div>';if(count)count.textContent=rows.length+' 项内容';return true;}
  // 入口与当前目录树一致。
  wrap?.querySelector('.directory-children')?.remove();
  let guide=wrap?.querySelector('.rh-guide');if(!guide&&wrap){guide=document.createElement('nav');guide.className='rh-guide';guide.setAttribute('aria-label','按需求选择资料类型');wrap.querySelector('.catalog-search')?.before(guide);}
  if(guide)guide.innerHTML=sections.map(s=>{const info=INFO[s.key]||{};return '<a href="#'+anchor(s)+'">'+(info.icon||OTHER_ICON)+'<div><strong>'+esc(info.ask||s.name)+'</strong><span>'+esc(s.name)+' · <em>'+s.rows.length+' 项</em></span></div></a>';}).join('');
  listing.innerHTML=sections.map(s=>{const info=INFO[s.key]||{},isRef=s.rows.every(r=>r.kind==='reference');return '<section class="rh-section" id="'+anchor(s)+'"><header><div><h2>'+esc(s.name)+'</h2><p>'+esc(s.desc||info.when||'')+'</p></div>'+(s.url?'<a href="'+esc(s.url)+'">'+(isRef?'打开参考手册目录':'只看这一类')+' →</a>':'')+'</header>'+body(s.rows)+'</section>';}).join('');
  if(count)count.textContent='共 '+rows.length+' 项资料，分为 '+sections.length+' 类；也可以直接搜索。';
  return true;
 };
})();
