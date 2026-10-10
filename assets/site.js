'use strict';
(() => {
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 const safeRead=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback;}catch{return fallback;}};
 const notify=message=>{const t=$('.toast');t.textContent=message;t.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>t.hidden=true,2600);};
 window.foamNotify=notify;
 // Keep directory filters in the address, so reload and browser history restore them.
 const listState={
  write(values,push=false){if(!Object.hasOwn(values,'page'))values={...values,page:''};const u=new URL(location.href);for(const [key,value]of Object.entries(values)){if(value&&value!=='全部')u.searchParams.set(key,value);else u.searchParams.delete(key);}const target=u.pathname+u.search+u.hash;if(target!==location.pathname+location.search+location.hash)history[push?'pushState':'replaceState'](history.state,'',target);},
  remember(host){if(!host)return;host.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||!host.contains(a)||a.hasAttribute('download'))return;try{const target=new URL(a.href,location.href);if(target.origin!==location.origin||target.pathname===location.pathname)return;const value=location.pathname+location.search+location.hash;sessionStorage.setItem('foamlab.returnTo:'+location.pathname,value);sessionStorage.setItem('foamlab.returnFor:'+target.pathname+target.search,value);}catch{}});}
 };
 window.foamListState=listState;
 // Public catalogs use the published directory, independently of account roles.
 window.foamReferenceRows=async({rootKey='',type=''}={})=>{
  if(!window.FoamLab)await new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
  const L=window.FoamLab;await L.contentReady;let ids=null;
  if(rootKey){await L.directoryReady;const D=window.FoamDirectory;if(D?.available){const node=D.nodes.find(n=>n.key===rootKey);if(!node)return [];ids=D.descendants(node.id);}}
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000),rows=[];
  try{for(let start=0;;start+=500){let query=L.client.from('foamlab_content').select('id,slug,kind,title,summary,series,metadata,section_ids,sort_order').eq('kind','reference').eq('status','published');
    if(type)query=query.eq('metadata->>reference_type',type);
    if(ids)query=query.overlaps('section_ids',ids);else if(rootKey)query=query.like('metadata->>canonical_path','/'+rootKey+'/%');
    const batch=L.check(await query.order('sort_order').order('slug').range(start,start+499).abortSignal(controller.signal));rows.push(...batch);if(batch.length<500)return rows;
   }
  }finally{clearTimeout(timer);}
 };

 const menu=$('.mobile-menu'),sidebar=$('#sidebar'),mobileNav=matchMedia('(max-width:760px)');
 const navFocusable=()=>sidebar?[...sidebar.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>el.getClientRects().length&&!el.hidden):[];
 function setNavigation(open,restoreFocus=false){
  open=!!open&&mobileNav.matches;
  if(!open&&restoreFocus)menu?.focus();
  document.body.classList.toggle('nav-open',open);menu?.setAttribute('aria-expanded',String(open));
  if(!sidebar)return;
  sidebar.inert=mobileNav.matches&&!open;
  if(sidebar.inert)sidebar.setAttribute('aria-hidden','true');else sidebar.removeAttribute('aria-hidden');
  if(open){sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');sidebar.setAttribute('aria-label','网站导航');navFocusable()[0]?.focus();}
  else{sidebar.removeAttribute('role');sidebar.removeAttribute('aria-modal');sidebar.removeAttribute('aria-label');}
 }
 menu?.addEventListener('click',()=>setNavigation(!document.body.classList.contains('nav-open'),document.body.classList.contains('nav-open')));
 $('[data-close-nav]')?.addEventListener('click',()=>setNavigation(false,true));
 document.addEventListener('click',event=>{if(!document.body.classList.contains('nav-open'))return;if(event.target.closest('.sidebar a[href]'))setNavigation(false);else if(!event.target.closest('.sidebar,.mobile-menu'))setNavigation(false,sidebar?.contains(document.activeElement));});
 document.addEventListener('keydown',event=>{
  if(!mobileNav.matches||!document.body.classList.contains('nav-open'))return;
  if(event.key==='Escape'){event.preventDefault();setNavigation(false,true);return;}
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){setNavigation(false);return;}
  if(event.key!=='Tab')return;
  const items=navFocusable(),first=items[0],last=items.at(-1);if(!first)return;
  if(event.shiftKey&&(document.activeElement===first||!sidebar.contains(document.activeElement))){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&(document.activeElement===last||!sidebar.contains(document.activeElement))){event.preventDefault();first.focus();}
 });
 mobileNav.addEventListener('change',()=>setNavigation(false,mobileNav.matches&&sidebar?.contains(document.activeElement)));
 setNavigation(false);
 async function copy(text){try{await navigator.clipboard.writeText(text);notify('已复制到剪贴板');return true;}catch{notify('浏览器未允许复制，请选中代码复制');return false;}}
 window.foamCopy=copy;
 function addCopy(pre){const code=$('code',pre);if(!code)return;let panel=pre.parentElement;if(!panel.classList.contains('code-panel')){panel=document.createElement('div');panel.className='code-panel';pre.before(panel);panel.append(pre);const bar=document.createElement('div');bar.className='code-toolbar';const name=document.createElement('span');name.className='code-language';name.textContent=pre.dataset.label||'Bash / 终端';const lines=document.createElement('span');lines.className='code-lines';lines.textContent=code.textContent.trimEnd().split('\n').length+' 行';const wrap=document.createElement('button');wrap.type='button';wrap.className='code-wrap';wrap.textContent='自动换行';wrap.setAttribute('aria-pressed','false');const copyButton=document.createElement('button');copyButton.type='button';copyButton.className='copy-code';copyButton.textContent='复制';copyButton.setAttribute('aria-label','复制代码');bar.append(name,lines,wrap,copyButton);panel.prepend(bar);}if(panel.dataset.enhanced)return;panel.dataset.enhanced='true';$('.copy-code',panel)?.addEventListener('click',async()=>{if(await copy(code.textContent))window.dispatchEvent(new Event('foamlab:code-copied'));});$('.code-wrap',panel)?.addEventListener('click',e=>{const enabled=panel.classList.toggle('wrap-lines');e.currentTarget.setAttribute('aria-pressed',String(enabled));});}
 $$('.prose pre').forEach(addCopy);window.foamEnhanceCode=addCopy;
 const toc=$('#toc');
 if(toc){const heads=$$('.prose h2,.prose h3');heads.forEach((h,i)=>{h.id=h.id||'section-'+i;const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent.replace(/源码$/,'').trim();toc.append(a);});if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){$$('a',toc).forEach(a=>a.classList.toggle('current',a.hash==='#'+entry.target.id));}});},{rootMargin:'-100px 0px -65% 0px'});heads.forEach(h=>observer.observe(h));}}
 // Search text is untrusted content: every result is built with textContent.
 const dialog=$('#search-dialog'),input=$('#global-search'),results=$('#search-results');let timer,searchVersion=0,searchRequest,searchManifest;const searchIndexes=new Map();
 const publicSearchItem=item=>{if(item.status&&item.status!=='published'||item.admin_only||item.metadata?.admin_only)return false;let url;try{url=new URL(item.url||'/',location.origin);}catch{return false;}const slug=item.slug||url.searchParams.get('slug');return !['site-maintenance','site-design'].includes(slug)&&!/^\/(?:admin|maintenance|design)(?:\/|$)/.test(url.pathname);};


 async function localSearch(q,scope,current){
  let url='/assets/search-live.json';
  if(scope){searchManifest||=fetch('/assets/search-manifest.json').then(r=>r.ok?r.json():null).catch(()=>null);const manifest=await searchManifest;const candidate=manifest?.scopes?.[scope];if(typeof candidate==='string'&&/^\/assets\/search-scopes\/[a-z0-9-]+\.json$/.test(candidate))url=candidate;}
  if(!current())return [];
  if(!searchIndexes.has(url)){const pending=fetch(url).then(r=>{if(!r.ok)throw Error('Search index unavailable');return r.json();}).then(async rows=>{
    const index=[];for(let i=0;i<rows.length;i++){const item=rows[i];if(publicSearchItem(item))index.push({item,title:String(item.title||'').toLowerCase(),body:String(item.text||'').toLowerCase()});if(i%200===199)await new Promise(resolve=>setTimeout(resolve,0));}return index;
   }).catch(error=>{searchIndexes.delete(url);throw error;});searchIndexes.set(url,pending);}
  let index;try{index=await searchIndexes.get(url);}catch(error){if(url!=='/assets/search-live.json')return localSearch(q,'',current).then(rows=>rows.filter(item=>window.FoamSearchScope?.matches(item,scope)));throw error;}
  const tokens=window.FoamSearch.terms(q),found=[];
  for(let i=0;i<index.length;i++){if(i%200===0){if(!current())return [];if(i)await new Promise(resolve=>setTimeout(resolve,0));}const {item,title,body}=index[i];if((window.FoamSearchScope?.matches(item,scope)??!scope)&&tokens.every(t=>(title+' '+body).includes(t)))found.push({...item,score:tokens.filter(t=>body.includes(t)).length*10+(body.includes(q)?20:0)+(title.includes(q)?1:0)});}
  return found.sort((a,b)=>b.score-a.score);
 }

 async function search(){
  searchRequest?.abort();const request=searchRequest=new AbortController();const version=++searchVersion,q=input.value.trim().toLowerCase().slice(0,120),scope=window.FoamSearchScope?.key()||'',current=()=>dialog.open&&version===searchVersion&&input.value.trim().toLowerCase().slice(0,120)===q&&(window.FoamSearchScope?.key()||'')===scope;
  results.replaceChildren();
  if(!q){results.textContent='输入关键词，先查看正文或代码中的匹配内容。';return;}
  results.textContent='正在查找匹配内容…';
  try{
   let found=null;
   try{
    await window.FoamLab.contentReady;if(!current())return;
    const timeout=setTimeout(()=>request.abort(),10000);let r;try{r=await window.FoamLab.client.rpc('foamlab_search_content_scoped',{query:q,section_key:scope||null}).abortSignal(request.signal);}finally{clearTimeout(timeout);}if(!current())return;
    if(!r.error&&Array.isArray(r.data))found=r.data.filter(publicSearchItem).map(x=>({...x,url:'/read/?slug='+encodeURIComponent(x.slug),kind:({lesson:'课程',tool:'工具',log:'日志',article:'分享',resource:'资料',module:'专题',reference:'参考'})[x.kind]||'参考',text:x.excerpt}));
   }catch{}
   const cached=found===null;
   if(cached)found=await localSearch(q,scope,current);
   if(!current())return;
   results.replaceChildren();
   if(!found.length){results.textContent='没有找到匹配内容，试试更短的关键词。';return;}
   const count=document.createElement('p');count.className='search-count';count.textContent=(cached?'当前显示本地索引 · ':'')+(window.FoamSearchScope?.label()||'全站')+' · 显示 '+Math.min(found.length,40)+' 篇匹配内容'+(found.length>=40?'（最多 40 篇，可缩小查找范围或调整关键词）':'')+' · 点击打开原文';results.append(count);
   for(const item of found.slice(0,40)){const a=window.FoamSearch.card(item,q);if(a)results.append(a);}
  }catch{if(current())results.textContent='搜索索引暂时无法加载。请重试，或直接进入课程目录。';}
 }
 async function openSearch(query='',scope){if(!dialog)return;if(!dialog.open)dialog.showModal();input.focus();if(typeof query==='string'&&query)input.value=query;if(typeof scope==='string'){await window.FoamSearchScope?.ready;window.FoamSearchScope?.set(scope);}if(input.value)void search();}
 window.foamOpenSearch=openSearch;
 document.addEventListener('foamlab:search-scope',()=>{++searchVersion;searchRequest?.abort();clearTimeout(timer);if(dialog.open)void search();});
 dialog?.addEventListener('close',()=>{++searchVersion;searchRequest?.abort();clearTimeout(timer);});
 $$('[data-open-search]').forEach(b=>b.addEventListener('click',openSearch));$('[data-close-dialog]')?.addEventListener('click',()=>dialog.close());dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 input?.addEventListener('input',()=>{++searchVersion;searchRequest?.abort();clearTimeout(timer);timer=setTimeout(search,160);});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dialog?.open){e.preventDefault();dialog.close();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&$('#command-query')){e.preventDefault();$('#command-query').focus();}});
 // Successful CMS reads govern published visibility; cached indexes remain a network fallback.
 function publishedReferences(records,rows){if(rows===null)return records;const map=new Map(rows.filter(x=>x.metadata?.canonical_path).map(x=>[x.metadata.canonical_path,x]));return records.filter(x=>map.has(x.url)).map(x=>({...x,title:map.get(x.url).title,description:map.get(x.url).summary,section_ids:map.get(x.url).section_ids}));}
 const commandList=$('#command-list');
 if(commandList){let commands=[],category='全部';const q=$('#command-query'),filterButtons=$$('[data-command-filter]');function restore(){const params=new URLSearchParams(location.search);q.value=params.get('q')||'';category=filterButtons.some(b=>b.dataset.commandFilter===params.get('category'))?params.get('category'):'全部';filterButtons.forEach(b=>{const selected=b.dataset.commandFilter===category;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});}restore();listState.remember(commandList);function render(){const terms=q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);const found=commands.filter(c=>(window.FoamDirectory?.available&&c.section_ids?(()=>{const n=window.FoamDirectory.current();return n&&c.section_ids.some(id=>window.FoamDirectory.descendants(n.id).includes(id));})():(category==='全部'||c.category===category))&&terms.every(term=>[c.name,c.title,c.description,c.details,c.example].join(' ').toLowerCase().includes(term)));$('#command-count').textContent='找到 '+found.length+' 条命令';commandList.replaceChildren();if(!found.length){const empty=document.createElement('p');empty.className='empty-state';empty.textContent='没有匹配的命令。可尝试用途、英文命令名或选项名称。';commandList.append(empty);}window.FoamPagination.slice(commandList,found,render,12).forEach(c=>{const card=document.createElement('article');card.className='command-card';const top=document.createElement('div'),h=document.createElement('h2'),pill=document.createElement('span'),p=document.createElement('p'),pre=document.createElement('pre'),code=document.createElement('code'),details=document.createElement('details'),summary=document.createElement('summary'),text=document.createElement('div');if(c.url){const a=document.createElement('a');a.href=c.url;a.textContent=c.name;h.append(a);}else h.textContent=c.name;pill.className='pill';pill.textContent=c.category;p.textContent=c.description;if(c.display){code.innerHTML=c.display.html;code.className='hljs language-'+c.display.language;pre.dataset.label=c.display.label;}else code.textContent=c.example;summary.textContent='更多示例'+((c.examples?.length||0)>1?'（'+(c.examples.length-1)+'）':'');details.addEventListener('toggle',()=>{if(!details.open||text.dataset.ready)return;text.dataset.ready='true';for(const example of (c.examples||[]).slice(1)){const label=document.createElement('p'),sample=document.createElement('pre'),sampleCode=document.createElement('code'),note=document.createElement('p');label.textContent=example.title;sampleCode.textContent=example.code;sample.append(sampleCode);note.textContent=example.explanation;text.append(label,sample,note);addCopy(sample);}if(!text.childNodes.length){const note=document.createElement('p');note.textContent=c.details;text.append(note);}}); top.append(h,pill);pre.append(code);details.append(summary,text);card.append(top,p,pre,details);if(c.url){const a=document.createElement('a');a.className='text-link';a.href=c.url;a.textContent='参数、配置与示例 →';card.append(a);}if(c.configs?.length){const links=document.createElement('div');links.className='related-configs';const label=document.createElement('small');label.textContent='关联配置';links.append(label);c.configs.forEach(d=>{const a=document.createElement('a');a.href=d.url;a.textContent=d.name;links.append(a);});card.append(links);}addCopy(pre);commandList.append(card);});}
 Promise.all([fetch('/assets/commands-display.json').then(r=>{if(!r.ok)throw Error();return r.json();}),window.foamReferenceRows({rootKey:'commands'}).catch(()=>null)]).then(([data,rows])=>{commands=publishedReferences(data,rows);render();}).catch(()=>commandList.textContent='命令库暂时无法加载，请刷新页面或阅读参考手册。');q.addEventListener('input',()=>{listState.write({q:q.value,category});render();});filterButtons.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.commandFilter;listState.write({q:q.value,category},true);restore();render();}));window.addEventListener('popstate',()=>{restore();render();});}
 const dictList=$('#dictionary-list');if(dictList){let records=[],group='全部';const input=$('#dictionary-query'),filterButtons=$$('[data-dictionary-filter]');function restore(){const params=new URLSearchParams(location.search);input.value=params.get('q')||'';group=filterButtons.some(b=>b.dataset.dictionaryFilter===params.get('group'))?params.get('group'):'全部';filterButtons.forEach(b=>{const selected=b.dataset.dictionaryFilter===group;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});}restore();listState.remember(dictList);function render(){const terms=input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);const matches=records.filter(d=>(window.FoamDirectory?.available&&d.section_ids?(()=>{const n=window.FoamDirectory.current();return n&&d.section_ids.some(id=>window.FoamDirectory.descendants(n.id).includes(id));})():(group==='全部'||d.group===group))&&terms.every(t=>([d.name,d.path,d.description,d.keys.join(' '),d.commands.join(' '),d.searchText].join(' ')).toLowerCase().includes(t)));$('#dictionary-count').textContent='找到 '+matches.length+' 项配置';dictList.replaceChildren();if(!matches.length){const p=document.createElement('p');p.className='empty-state';p.textContent='没有找到匹配配置。可尝试文件名、参数名或关联命令。';dictList.append(p);}window.FoamPagination.slice(dictList,matches,render,12).forEach(d=>{const a=document.createElement('a');a.href=d.url;a.className='dictionary-card';const top=document.createElement('div'),path=document.createElement('code'),badge=document.createElement('span');path.textContent=d.path;badge.textContent=d.group;badge.className='pill';top.append(path,badge);const p=document.createElement('p');p.textContent=d.description;const focus=document.createElement('dl'),label=document.createElement('dt'),keys=document.createElement('dd');focus.className='config-focus';label.textContent='配置重点';keys.className='key-chips';d.keys.slice(0,7).forEach(k=>{const s=document.createElement('span');s.textContent=k;keys.append(s);});const foot=document.createElement('div');foot.className='dict-foot';foot.textContent='关联：'+d.commands.join(' / ')+'　　参数、配置与示例 →';focus.append(label,keys);a.append(top,p,focus,foot);dictList.append(a);});}Promise.all([fetch('/assets/dictionaries.json').then(r=>{if(!r.ok)throw Error();return r.json();}),window.foamReferenceRows({rootKey:'dictionaries'}).catch(()=>null)]).then(([data,rows])=>{records=publishedReferences(data,rows);render();}).catch(()=>dictList.textContent='配置索引暂时无法加载，请刷新页面或查看参考手册。');input.addEventListener('input',()=>{listState.write({q:input.value,group});render();});filterButtons.forEach(b=>b.addEventListener('click',()=>{group=b.dataset.dictionaryFilter;listState.write({q:input.value,group},true);restore();render();}));window.addEventListener('popstate',()=>{restore();render();});}
})();
