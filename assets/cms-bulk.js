'use strict';
(() => {
 const L=window.FoamLab,D=window.FoamDirectory,UI=window.FoamCMSUI,esc=L.esc;
 const labels={move:'移动',archive:'下架',publish:'上架',trash:'删除',restore:'恢复',purge:'彻底删除'};
 const notes={
  move:'模块保留内部层级。单独勾选的文件会移至目标目录，替换原有位置。',
  archive:'模块入口会隐藏，已发布的子内容会一并下架。草稿保持原状态。',
  publish:'重新显示模块入口，上架其中已下架的内容；模块内的草稿保持不变。单独选中的草稿会发布。内部文档仍仅限内部访问。',
  trash:'回收站保留原目录、排序和文件。另有有效目录的共享文件继续显示在其他位置。',
  restore:'回到原目录和原有排序，并恢复回收前的发布状态。早期回收记录按草稿恢复。',
  purge:'所选回收内容、评论和历史版本将永久删除，无法撤销。还有其他位置的共享文件只移除这里的位置。'
 };
 const fileIds=new Set(),folderIds=new Set();
 const checkbox=(kind,row)=>'<input type="checkbox" class="cms-bulk-check" data-bulk-'+kind+'="'+esc(row.id)+'" aria-label="选择'+esc(row.title||row.name)+'" '+((kind==='file'?fileIds:folderIds).has(row.id)?'checked':'')+'>';
 const clear=()=>{fileIds.clear();folderIds.clear();};
 function restoreHint(folders,files){
  const selected=new Set(folders.map(n=>n.id)),recycled=new Map((D.recycled||[]).map(n=>[n.id,n]));
  const missing=[...folders.map(n=>recycled.get(n.parent_id)),...files.flatMap(r=>(r.section_ids||[]).map(id=>recycled.get(id)))].find(n=>n&&!selected.has(n.recycle_root));
  return missing?'请先恢复模块：'+(recycled.get(missing.recycle_root)?.name||missing.name):'';
 }
 async function perform(action,folders,files){
  if(!folders.length&&!files.length)return false;
  const args={p_action:action,p_sections:folders.map(n=>n.id),p_files:files.map(n=>n.id),p_target:null};
  const call=token=>L.client.rpc('foamlab_manage_tree',{...args,p_token:token}).then(L.check);
  if(action==='move'){
   const excluded=folders.flatMap(n=>D.descendants(n.id));
   const targets=D.orderedNodes().filter(n=>!excluded.includes(n.id));
   const options=targets.map(n=>D.option(n)).join('');
   const pending=UI.confirmAction({title:'移动到',message:'已选 '+folders.length+' 个模块、'+files.length+' 个文件。'+notes.move,html:'<label class="form-field"><span>查找目录</span><input type="search" data-target-search placeholder="输入目录名称"></label><label class="form-field"><span>目标目录</span><select name="target" required><option value="">请选择目录</option>'+(!files.length?'<option value="root">顶层模块</option>':'')+options+'</select></label><p data-move-impact role="status">选择目标后即可移动。</p>',action:'移动'});
   const dialog=document.querySelector('.cms-dialog[open]'),select=dialog.querySelector('[name=target]'),button=dialog.querySelector('[value=confirm]'),impact=dialog.querySelector('[data-move-impact]');
   button.disabled=true;let preview=null,generation=0;
   dialog.querySelector('[data-target-search]').oninput=e=>{const q=e.target.value.trim().toLowerCase();for(const option of select.options)option.hidden=!!option.value&&!option.textContent.toLowerCase().includes(q);};
   select.onchange=async()=>{
    const ticket=++generation;button.disabled=true;preview=null;
    if(!select.value){impact.textContent='请选择目标目录。';return;}
    args.p_target=select.value==='root'?null:select.value;impact.textContent='正在核对移动范围…';
    try{const result=await call(null);if(ticket!==generation||!dialog.isConnected)return;preview=result;impact.textContent='将移动 '+result.folders+' 个目录、'+result.files+' 个文件，原有内部层级和排序保持不变。';button.disabled=false;}catch(e){if(ticket===generation)impact.textContent=e.message||'无法移动到此目录。';}
   };
   if(!await pending)return false;
   if(!preview)throw Error('请重新选择目标目录。');
   await call(preview.token);return true;
  }
  const preview=await call(null);
  if(action==='restore'){await call(preview.token);return true;}
  const names=[...folders.map(n=>n.name),...files.map(n=>n.title)];
  const details=['涉及 '+preview.folders+' 个目录、'+preview.files+' 个文件。',notes[action]];
  if(action==='move')details.unshift('目标：'+(args.p_target?D.path(args.p_target):'顶层模块'));
  if(preview.shared&&['trash','purge'].includes(action))details.push('有 '+preview.shared+' 个文件还保留其他位置。');
  if(!await UI.confirmAction({title:'确认'+labels[action]+'？',message:names.slice(0,3).join('、')+(names.length>3?' 等 '+names.length+' 项':''),details,action:'确认'+labels[action],danger:['trash','purge'].includes(action)}))return false;
  await call(preview.token);return true;
 }

 // The bin uses the original parent links even for ancestors which are still active.
 function binTree(rows){
  const all=new Map([...(D.recycled||[]),...D.nodes].map(n=>[n.id,n]));
  const path=id=>{const chain=[],seen=new Set();for(let n=all.get(id);n&&!seen.has(n.id);n=all.get(n.parent_id)){seen.add(n.id);chain.unshift(n);}return chain;};
  const branches=new Set();
  const include=id=>path(id).forEach(n=>branches.add(n.id));
  (D.recycled||[]).forEach(n=>include(n.id));rows.filter(r=>r.status==='trash').forEach(r=>r.section_ids?.forEach(include));
  const list=[...all.values()].filter(n=>branches.has(n.id)).sort((a,b)=>a.sort_order-b.sort_order||a.name.localeCompare(b.name,'zh'));
  const children=new Map();
  for(const n of list){const parent=n.parent_id||null;if(!children.has(parent))children.set(parent,[]);children.get(parent).push(n);}
  return {get:id=>branches.has(id)?all.get(id):undefined,children:id=>children.get(id||null)||[],ancestors:path,path:id=>path(id).map(n=>n.name).join(' / '),
   descendants:id=>{const out=[id];for(let i=0;i<out.length;i++)out.push(...(children.get(out[i])||[]).map(n=>n.id));return out;}};
 }
 const toolbar=(bin)=>'<div class="cms-bulk-toolbar"><label><input type="checkbox" data-bulk-page> 本页</label><button class="text-button" data-bulk-all>选择全部筛选结果</button><span data-bulk-count role="status"></span>'+
  (bin?['restore','purge']:['move','archive','publish','trash']).map(action=>'<button class="text-button '+(action==='purge'?'danger':'')+'" data-bulk-action="'+action+'">'+labels[action]+'</button>').join('')+'<button class="text-button" data-bulk-clear>取消选择</button></div>';
 function bind(host,{page,shown,bin,tree,rows,submit}){
  const box=host.querySelector('.cms-bulk-toolbar');
  const possible=r=>bin?r.status==='trash':r.status!=='trash';
  const onPage=page.filter(possible);
  const chosen=r=>(r._folder?folderIds:fileIds).has(r.id);
  const choose=(r,value)=>{const set=r._folder?folderIds:fileIds;value?set.add(r.id):set.delete(r.id);};
  function sync(){
   host.querySelectorAll('[data-bulk-file]').forEach(c=>{c.checked=fileIds.has(c.dataset.bulkFile);});
   const lockedFolders=new Map();
   for(const selected of folderIds){
    for(const parent of tree.ancestors(selected))if(parent.id!==selected)lockedFolders.set(parent.id,'已勾选下级目录');
    for(const child of tree.descendants(selected))if(child!==selected)lockedFolders.set(child,'已勾选上级目录');
   }
   host.querySelectorAll('[data-bulk-folder]').forEach(c=>{
    const id=c.dataset.bulkFolder;
    c.checked=folderIds.has(id);
    c.disabled=lockedFolders.has(id);
    c.title=lockedFolders.get(id)||'';
   });
   const total=fileIds.size+folderIds.size,check=box.querySelector('[data-bulk-page]');
   check.disabled=!onPage.length;check.checked=onPage.length>0&&onPage.every(chosen);check.indeterminate=!check.checked&&onPage.some(chosen);
   box.querySelector('[data-bulk-count]').textContent='已选 '+folderIds.size+' 个模块、'+fileIds.size+' 个文件';
   box.querySelectorAll('[data-bulk-action],[data-bulk-clear]').forEach(b=>b.disabled=!total);
   if(bin){const button=box.querySelector('[data-bulk-action=restore]'),hint=restoreHint([...folderIds].map(id=>tree.get(id)).filter(Boolean),rows.filter(r=>fileIds.has(r.id)));button.disabled=!total||!!hint;button.title=hint;}
  }
  host.onchange=e=>{
   const el=e.target,id=el.dataset.bulkFolder||el.dataset.bulkFile;
   if(el.disabled)return;
   if(id){const set=el.dataset.bulkFolder?folderIds:fileIds;el.checked?set.add(id):set.delete(id);sync();}
   if(el.hasAttribute('data-bulk-page')){onPage.forEach(r=>choose(r,el.checked));sync();}
  };
  box.onclick=e=>{
   if(!e.target.closest('button'))return;
   if(e.target.closest('[data-bulk-clear]'))clear();
   if(e.target.closest('[data-bulk-all]'))shown.filter(possible).forEach(r=>choose(r,true));
   const act=e.target.closest('[data-bulk-action]');
   if(act)submit(act.dataset.bulkAction,[...folderIds].map(id=>tree.get(id)).filter(Boolean),rows.filter(r=>fileIds.has(r.id)));
   sync();
  };
  sync();
 }
 const protectedKeys=new Set('home internal start courses topics programming theory quick-reference tools resources assignments announcements town community sharing'.split(' '));
 window.FoamCMSBulk={perform,binTree,clear,toolbar,bind,restoreHint,fileCheck:r=>checkbox('file',r),
  folderCheck:(n,bin)=>protectedKeys.has(n.key)||(bin&&!n.recycle_root)?'':checkbox('folder',n),protected:n=>protectedKeys.has(n.key)};
})();
