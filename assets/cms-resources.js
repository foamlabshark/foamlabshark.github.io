'use strict';
window.FoamCMSResourceState={selected:'',mode:'entries',query:'',source:'',page:1};
window.FoamCMSResources=async C=>{
 if(!C.admin)throw Error('资料中心由管理员管理。');
 const D=window.FoamDirectory,I=window.FoamResourceIndex,state=window.FoamCMSResourceState;
 const root=D.nodes.find(n=>n.key==='resources'),{L,run,notice,all,UI}=C,esc=L.esc,p=L.$('#cms-panel'),bucket=L.client.storage.from('foamlab-resources');
 let content=C.getRows(),entries=[],files=[],referenceIndex=new Map(),rowsById=new Map(),entrySearch=new Map(),fileSearch=new Map();
 let page=state.page,query=state.query,source=state.source,mode=state.mode,uploading=false,loading=null,filesReady=false,fileError='',searchTimer,generation=0;
 const canonical=url=>I.canonical(url,location.origin),label=file=>file.label||file.name.replace(/^[a-f0-9-]{36}-/,'');
 const references=file=>(referenceIndex.get(canonical(file.url))||[]).map(id=>rowsById.get(id)).filter(Boolean);
 const view=document.createElement('div');view.className='cms-directory-workspace';
 view.innerHTML='<aside class="cms-directory-tree" id="cms-resource-tree" aria-label="资料目录管理"></aside><div class="cms-directory-main"><div class="cms-directory-context" id="cms-resource-context"></div><div class="cms-toolbar"><div><h2>资料中心</h2><p>按目录整理资料条目，切换到“文件与附件”管理下载文件。</p></div><div class="admin-actions"><button type="button" class="button secondary" id="cms-resource-refresh">刷新</button><button type="button" class="button" id="cms-resource-new">新增资料</button><label class="button secondary">上传并添加资料<input id="cms-upload" type="file" multiple hidden></label></div></div><div class="cms-subtabs"><button data-resource-tab="entries">资料条目</button><button data-resource-tab="files">文件与附件</button></div><progress id="cms-upload-progress" value="0" max="100" hidden></progress><div class="cms-filters"><input id="cms-file-search" type="search" aria-label="搜索资源"><select id="cms-file-source" aria-label="文件来源"><option value="">全部来源</option><option value="upload">后台上传</option><option value="site">随网站发布</option><option value="link">外部链接</option></select></div><p id="cms-file-loading" role="status" hidden></p><div id="cms-files" class="cms-table"></div><div id="cms-file-pager"></div></div>';
 p.replaceChildren(view);const $=selector=>view.querySelector(selector),alive=()=>p.contains(view);
 $('#cms-file-search').value=query;$('#cms-file-source').value=source;
 function prepare(){
  const ids=new Set(root?D.descendants(root.id):[]);rowsById=new Map(content.map(r=>[r.id,r]));
  entries=content.filter(r=>['resource','recommendation'].includes(r.kind)||r.section_ids?.some(id=>ids.has(id)));
  entrySearch=new Map(entries.map(r=>[r.id,[r.title,r.track,r.series,UI.locationLabel(r)].join(' ').toLowerCase()]));
 }
 async function reload(){generation++;await C.load();content=C.getRows();prepare();filesReady=false;fileError='';}
 const tree=root&&window.FoamCMSDirectories({...C,rootId:root.id,getRows:()=>entries,getSelected:()=>state.selected,reload,select:id=>{state.selected=id;page=1;prepare();context();render();if(mode==='files')void ensureFiles();}});
 function context(){
  if(state.selected&&!D.get(state.selected)&&state.selected!=='unassigned')state.selected='';
  tree?.mount($('#cms-resource-tree'));const node=D.get(state.selected),box=$('#cms-resource-context');
  box.innerHTML='<strong>'+esc(node?D.path(node.id):state.selected==='unassigned'?'未归类资料':'全部资料')+'</strong><p>选择目录后，新资料会自动放入该目录；编辑时可调整所在位置。</p><div class="cms-directory-actions"><button type="button" class="text-button" data-resource-add-module>＋ 添加'+(node?'子':'')+'模块</button>'+(node?'<button type="button" class="text-button" data-resource-edit-module>编辑模块</button><button type="button" class="text-button danger" data-resource-delete-module>删除模块</button><a class="text-link" href="'+esc(D.url(node))+'" target="_blank" rel="noopener">查看模块 ↗</a>':'')+'</div>';
  box.querySelector('[data-resource-add-module]').onclick=()=>tree?.add(node?.id||root?.id);
  box.querySelector('[data-resource-edit-module]')?.addEventListener('click',()=>tree.edit(node));box.querySelector('[data-resource-delete-module]')?.addEventListener('click',()=>tree.remove(node));
 }
 async function uploadedFiles(){const out=[];for(let offset=0;;offset+=100){const batch=L.check(await bucket.list('library',{limit:100,offset,sortBy:{column:'name',order:'asc'}}));out.push(...batch.filter(f=>f.id||f.metadata));if(batch.length<100)return out;}}
 async function ensureFiles(){
  if(filesReady||loading)return loading;
  const requestGeneration=generation;loading=(async()=>{try{
   fileError='';render();
   const [uploaded,inventory,fullRows]=await Promise.all([uploadedFiles(),fetch('/assets/download-inventory.json').then(async r=>{if(!r.ok)throw Error('站点文件目录暂时无法读取，请重试。');return r.json();}),all('foamlab_content','id,title,slug,kind,status,revision,metadata,body,cover_url,track,series,section_ids')]);
   if(!alive()||requestGeneration!==generation)return;
   const next=uploaded.map(f=>({name:f.name,url:bucket.getPublicUrl('library/'+f.name).data.publicUrl,size:f.metadata?.size||0,source:'upload',date:f.created_at}));next.push(...inventory.map(f=>({...f,source:'site'})));
   const known=new Set(next.map(f=>canonical(f.url)));
   for(const row of fullRows){const downloads=[...(Array.isArray(row.metadata?.downloads)?row.metadata.downloads:[]),...(row.metadata?.download_url?[{url:row.metadata.download_url,label:row.title}]:[])];for(const d of downloads){if(!L.safeURL(d.url)||known.has(canonical(d.url)))continue;known.add(canonical(d.url));next.push({name:d.url.split('/').pop(),label:d.label,url:d.url,size:d.size_bytes||0,source:'link'});}}
   const signal={get aborted(){return !alive()||requestGeneration!==generation;}};
   const index=await I.build(next,fullRows,{origin:location.origin,signal,progress:(done,total)=>{if(alive()&&mode==='files')$('#cms-file-loading').textContent='正在整理文件引用 '+done+' / '+total+'…';}});
   if(!alive()||requestGeneration!==generation)return;
   content=fullRows.map(({body,...row})=>row);prepare();files=next;referenceIndex=index;
   fileSearch=new Map(files.map(f=>[f,[label(f),...references(f).map(r=>r.title)].join(' ').toLowerCase()]));filesReady=true;context();
  }catch(e){if(e.name!=='AbortError')fileError=e.message||'文件目录读取失败。';}
  finally{loading=null;if(alive()){render();if(requestGeneration!==generation&&mode==='files')setTimeout(()=>{if(alive())void ensureFiles();},0);}}})();
  return loading;
 }
 function render(){
  if(!alive())return;Object.assign(state,{mode,query,source,page});
  view.querySelectorAll('[data-resource-tab]').forEach(b=>{const selected=b.dataset.resourceTab===mode;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  $('#cms-file-source').hidden=mode==='entries';$('#cms-file-search').placeholder=mode==='entries'?'搜索资料名称、分类或目录':'搜索文件名或引用文章';
  const progress=$('#cms-file-loading');progress.hidden=mode!=='files'||filesReady;progress.textContent=fileError||'正在读取文件目录和引用关系…';
  if(mode==='files'&&!filesReady){$('#cms-files').innerHTML=fileError?'<div class="cms-empty">'+esc(fileError)+' <button type="button" class="button secondary" data-retry-files>重试</button></div>':'';$('#cms-file-pager').innerHTML='';return;}
  const resourceIds=new Set(root?D.descendants(root.id):[]),selectedIds=new Set(D.get(state.selected)?D.descendants(state.selected):[]);
  const matches=r=>!state.selected||(state.selected==='unassigned'?!r.section_ids?.some(id=>resourceIds.has(id)):r.section_ids?.some(id=>selectedIds.has(id)));
  const entryIds=new Set(entries.map(r=>r.id));
  const target=mode==='entries'?entries.filter(matches):files.filter(f=>!state.selected||(state.selected==='unassigned'?!references(f).some(r=>entryIds.has(r.id)):references(f).some(matches)));
  const shown=target.filter(f=>mode==='entries'?entrySearch.get(f.id).includes(query.trim().toLowerCase()):(!source||f.source===source)&&fileSearch.get(f).includes(query.trim().toLowerCase()));
  page=Math.max(1,Math.min(page,Math.ceil(shown.length/25)||1));state.page=page;
  $('#cms-files').innerHTML=shown.slice((page-1)*25,page*25).map(f=>{
   if(mode==='entries')return '<div class="cms-file-row"><div><strong>'+esc(f.title)+'</strong><small>'+esc(UI.locationLabel(f))+'</small></div><span class="pill">'+esc(({draft:'草稿',published:'已发布',archived:'已下架',trash:'回收站'})[f.status])+'</span><div class="cms-row-actions"><button class="text-button" data-resource-edit="'+f.id+'">编辑资料</button></div></div>';
   const used=references(f),index=files.indexOf(f);
   return '<div class="cms-file-row"><div><a href="'+esc(L.safeURL(f.url))+'" target="_blank" rel="noopener">'+esc(label(f))+' ↗</a><small>'+esc(({upload:'后台上传',site:'随网站发布',link:'外部链接'})[f.source])+' · '+(f.size?L.fileSize(f.size):'大小未记录')+'</small></div><div class="cms-muted">'+(used.length?'<details><summary>'+used.length+' 篇内容引用</summary>'+used.map(r=>'<div><button class="text-button" data-resource-edit="'+r.id+'">'+esc(r.title)+'</button></div>').join('')+'</details>':'暂无文章引用')+'</div><div class="cms-row-actions"><button class="text-button" data-copy-file="'+index+'">复制地址</button><button class="text-button" data-create-resource="'+esc(f.url)+'" data-file-index="'+index+'">添加到此模块</button>'+(f.source==='upload'?'<button class="text-button danger" data-delete-file="'+index+'">删除</button>':'')+'</div></div>';
  }).join('')||'<div class="cms-empty">没有符合条件的资源。</div>';
  $('#cms-file-pager').innerHTML=UI.pager(page,shown.length);
 }
 if(!content.length)await reload();prepare();context();render();
 $('#cms-resource-new').onclick=()=>run(()=>C.openItem(null,{kind:'resource',section_ids:[D.get(state.selected)?.id||root?.id].filter(Boolean)}));
 $('#cms-resource-refresh').onclick=()=>run(async()=>{await reload();context();render();if(mode==='files')void ensureFiles();notice('资料条目已更新。');});
 view.querySelectorAll('[data-resource-tab]').forEach(b=>b.onclick=()=>{clearTimeout(searchTimer);query=$('#cms-file-search').value;mode=b.dataset.resourceTab;page=1;render();if(mode==='files')void ensureFiles();});
 $('#cms-file-search').oninput=e=>{query=e.target.value;page=1;clearTimeout(searchTimer);searchTimer=setTimeout(render,120);};
 $('#cms-file-source').onchange=e=>{source=e.target.value;page=1;render();};
 $('#cms-file-pager').onclick=e=>{const b=e.target.closest('[data-page]');if(b){page=Number(b.dataset.page);render();}};
 $('#cms-upload').onchange=e=>{const selection=[...e.target.files];if(!selection.length||uploading)return;run(async()=>{
  for(const file of selection)if(!file.size||file.size>52428800)throw Error(file.name+'：请选择 50 MB 以内的非空文件。');
  uploading=true;const progress=$('#cms-upload-progress');progress.hidden=false;let count=0;
  try{for(const file of selection){const name=crypto.randomUUID()+'-'+file.name.replace(/[^\p{L}\p{N}._-]/gu,'_');L.check(await bucket.upload('library/'+name,file,{contentType:file.type||'application/octet-stream',upsert:false}));const url=bucket.getPublicUrl('library/'+name).data.publicUrl;L.check(await L.client.from('foamlab_content').insert({kind:'resource',slug:'resource-'+crypto.randomUUID().slice(0,12),title:file.name,status:'draft',author_id:L.user.id,section_ids:[D.get(state.selected)?.id||root?.id].filter(Boolean),metadata:{downloads:[{label:file.name,url,size_bytes:file.size}]}}));count++;progress.value=count/selection.length*100;}}
  finally{uploading=false;await reload();mode='entries';page=1;query='';$('#cms-file-search').value='';context();render();notice('已上传 '+count+' / '+selection.length+' 个文件，资料已保存为草稿。');progress.hidden=true;}
 });};
 $('#cms-files').onclick=e=>{if(e.target.closest('[data-retry-files]')){void ensureFiles();return;}
  const b=e.target.closest('[data-copy-file],[data-delete-file],[data-create-resource],[data-resource-edit]');if(!b)return;run(async()=>{
  if(b.dataset.resourceEdit){await C.openItem(b.dataset.resourceEdit);return;}
  if(b.dataset.copyFile!==undefined){await navigator.clipboard.writeText(files[Number(b.dataset.copyFile)].url);notice('文件地址已复制。');return;}
  if(b.dataset.createResource){const file=files[Number(b.dataset.fileIndex)];await C.openItem(null,{kind:'resource',slug:'resource-'+crypto.randomUUID().slice(0,12),title:label(file),body:'',section_ids:[D.get(state.selected)?.id||root?.id].filter(Boolean),metadata:{downloads:[{label:label(file),url:file.url,size_bytes:file.size,description:''}]}});notice('补充资料说明后保存或发布。');L.$('#cms-attachments').open=true;return;}
  const file=files[Number(b.dataset.deleteFile)],fresh=await all('foamlab_content','id,title,metadata,body,cover_url');
  const used=I.references(file,fresh,location.origin);
  if(used.length){await UI.confirmAction({title:'文件仍被文章引用',message:label(file),details:used.map(x=>x.title),action:'返回管理引用',html:'<p>先在引用文章中替换或移除下载地址，再删除文件。</p>'});filesReady=false;void ensureFiles();return;}
  if(!await UI.confirmAction({title:'永久删除文件？',message:label(file),details:['后台已检查：当前没有文章引用此文件。','文件会从存储中删除，原下载地址将失效。'],action:'确认删除',danger:true}))return;
  const latest=I.references(file,await all('foamlab_content','id,title,metadata,body,cover_url'),location.origin);if(latest.length){notice('文件刚被 '+latest.map(r=>r.title).join('、')+' 引用，已取消删除。',true);filesReady=false;void ensureFiles();return;}L.check(await bucket.remove(['library/'+file.name]));filesReady=false;void ensureFiles();notice('文件已删除。');
 });};
 if(mode==='files')void ensureFiles();
};
