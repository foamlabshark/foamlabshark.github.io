'use strict';
(() => {
 const D=window.FoamDirectory;
 const trees=new Map();
 window.FoamCMSDirectories=api=>{
  const {L,UI,run,notice,getRows,select,getSelected}=api,esc=L.esc,rootId=api.rootId||null;
  const dirs=api.treeModel||D,bin=!!api.bin,treeKey=(rootId||'site')+(bin?':bin':'');
  if(!trees.has(treeKey))trees.set(treeKey,{opened:new Set(),lastSelection:null,scrollTop:0,anchor:null});
  const state=trees.get(treeKey),opened=state.opened;
  const refresh=async()=>{await D.load();D.nav();select(getSelected());};
  async function edit(node=null,parent=null){
   const excluded=node?D.descendants(node.id):[],oldParent=node?.parent_id||'';
   const pending=UI.confirmAction({title:node?'编辑目录':'添加'+(parent?'子模块':'模块'),message:parent?'上级：'+D.path(parent):'保存后，网站导航和内容目录会更新。',action:'保存',html:'<div class="cms-module-form"><label class="form-field"><span>名称</span><input name="name" required maxlength="60" value="'+esc(node?.name||'')+'" placeholder="例如：传热与传质"></label><label class="form-field"><span>上级目录</span><select name="parent_id">'+D.options(node?.parent_id||parent||rootId||'',excluded,rootId)+'</select></label><label class="form-field"><span>简介（选填）</span><textarea name="description" rows="2" maxlength="1000">'+esc(node?.description||'')+'</textarea></label>'+window.FoamCMSReadAccess.field(node?.read_access||'inherit')+'<p class="cms-muted">继承上级时，未设置上级权限的模块默认登录后可读。此设置应用于继承权限的子模块和文章；已有单独设置的条目保留其设置。</p><div class="form-grid"><label class="form-field"><span>导航分组</span><select name="nav_group">'+['学习空间','资源与社区','管理平台'].map(x=>'<option '+(node?.nav_group===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label><label class="form-field"><span>排序 · 小数值在前</span><input name="sort_order" type="number" required value="'+(node?.sort_order??100)+'"></label></div><label class="cms-check"><input name="visible" type="checkbox" '+(node?.visible!==false?'checked':'')+'> 显示在导航中</label><details><summary>入口地址（通常保持默认）</summary><label class="form-field"><span>留空使用自动生成的内容目录</span><input name="href" value="'+esc(node?.href||'')+'" placeholder="/section/ 目录会自动生成"></label><p class="cms-muted">已有功能页面可以保留原地址；新模块留空即可。</p></details></div>'});
   window.FoamCMSReadAccess.bindSection(document.querySelector('.cms-dialog[open] form'));const input=await pending;
   if(!input)return;const v={read_access:input.read_access,name:input.name.trim(),description:input.description.trim(),parent_id:input.parent_id||null,nav_group:rootId?'资源与社区':input.nav_group,sort_order:Number(input.sort_order),visible:input.visible==='on',href:input.href.trim()};
   if(!v.name||!Number.isSafeInteger(v.sort_order))throw Error('请填写名称和整数排序值。');
   if(v.href&&(!v.href.startsWith('/')||v.href.startsWith('//')||v.href.includes('\\')||new URL(v.href,location.origin).origin!==location.origin))throw Error('入口地址使用站内路径，例如 /courses/。');
   if(node&&oldParent!==(v.parent_id||'')&&!await UI.confirmAction({title:'确认移动目录？',message:node.name,details:['原位置：'+D.path(node.id),'新位置：'+(v.parent_id?D.path(v.parent_id)+' / ':'')+v.name,'子目录和文章归属会随目录一起移动。'],action:'确认移动'}))return;
   const result=node?L.check(await L.client.from('foamlab_sections').update(v).eq('id',node.id).eq('revision',node.revision).select()):L.check(await L.client.from('foamlab_sections').insert(v).select());
   if(!result.length)throw Error('目录已被其他编辑更新，请刷新后重试。');
   await D.load();D.nav();if(v.parent_id)opened.add(v.parent_id);select(result[0].id);notice('目录已保存。');
  }
  async function remove(node){
   if(api.submit)return api.submit('trash',[node],[]);
   if(!await window.FoamCMSBulk.perform('trash',[node],[]))return;
   window.FoamCMSBulk.clear();await D.load();await api.reload();D.nav();select(node.parent_id===rootId?'':node.parent_id||'');notice('目录已移入回收站。');
  }
  function mount(host){
   const selected=getSelected();
   host.dataset.treeKey=treeKey;
   function remember(){state.scrollTop=host.scrollTop;const y=host.getBoundingClientRect().top;const first=[...host.querySelectorAll('[data-select-directory]')].find(b=>b.getClientRects().length&&b.getBoundingClientRect().bottom>y);state.anchor=first?{id:first.dataset.selectDirectory,offset:first.getBoundingClientRect().top-y}:null;}
   const selectedPath=dirs.ancestors(selected).map(n=>n.id).join('/');
   if(selected!==state.lastSelection||selectedPath!==state.lastPath){
    dirs.ancestors(selected).forEach(n=>opened.add(n.id));state.lastSelection=selected;state.lastPath=selectedPath;
   }
   const ancestors=new Set(dirs.ancestors(selected).slice(0,-1).map(n=>n.id));
   const counts=new Map();for(const row of getRows()){const ids=new Set();for(const id of row.section_ids||[])for(const n of dirs.ancestors(id))ids.add(n.id);for(const id of ids)counts.set(id,(counts.get(id)||0)+1);}
   const branch=n=>{const children=dirs.children(n.id),count=counts.get(n.id)||0,target=api.managementTarget?.(n.id);return '<div><div class="cms-tree-row">'+(children.length?'<button class="cms-tree-toggle" data-tree-toggle="'+n.id+'" aria-expanded="'+opened.has(n.id)+'" aria-label="'+(opened.has(n.id)?'收起':'展开')+esc(n.name)+'">'+(opened.has(n.id)?'▾':'▸')+'</button>':'<span class="cms-tree-toggle"></span>')+(api.bulk?window.FoamCMSBulk.folderCheck(n,bin):'')+'<button class="directory-select '+(n.id===selected?'selected':ancestors.has(n.id)?'selected-ancestor':'')+'" data-select-directory="'+n.id+'" title="'+esc(dirs.path(n.id))+'">'+esc(n.name)+' <small>'+(target?'管理':count)+'</small>'+(!n.visible?' · 隐藏':'')+'</button></div>'+(children.length?'<div class="cms-tree-children" data-tree-children="'+n.id+'" '+(opened.has(n.id)?'':'hidden')+'>'+children.map(branch).join('')+'</div>':'')+'</div>';};
   host.innerHTML='<h3>'+(api.treeTitle||(rootId?'资料目录':'网站目录'))+'</h3><div class="cms-tree-root-actions"><button class="directory-select '+(!selected?'selected':'')+'" data-select-directory="">'+(api.allLabel||(rootId?'全部资料':'全部内容'))+'</button><button class="directory-select '+(selected==='unassigned'?'selected':'')+'" data-select-directory="unassigned">未归类</button>'+(bin?'':'<button data-add-module>＋ 添加模块</button>')+'</div>'+dirs.children(rootId).map(branch).join('');
   host.scrollTop=state.scrollTop;
   if(api.openRecycle){
    const footer=document.createElement('div');footer.className='cms-tree-footer';
    footer.innerHTML='<button type="button" data-cms-tab="recycle" class="directory-select '+(bin?'selected':'')+'" aria-current="'+(bin?'page':'false')+'">回收站</button>'+(bin?'<button type="button" data-return-content>← 返回内容管理</button>':'');
    footer.querySelector('[data-cms-tab]').onclick=e=>{e.stopPropagation();api.openRecycle();};
    footer.querySelector('[data-return-content]')?.addEventListener('click',e=>{e.stopPropagation();api.returnContent();});
    host.append(footer);
   }
   if(state.anchor){const anchor=host.querySelector('[data-select-directory="'+CSS.escape(state.anchor.id)+'"]');if(anchor?.getClientRects().length)host.scrollTop+=anchor.getBoundingClientRect().top-host.getBoundingClientRect().top-state.anchor.offset;}
   host.onscroll=remember;
   function toggle(id){
    const next=!opened.has(id),arrow=host.querySelector('[data-tree-toggle="'+id+'"]');
    if(next)opened.add(id);else opened.delete(id);
    host.querySelector('[data-tree-children="'+id+'"]').hidden=!next;
    arrow.textContent=next?'▾':'▸';
    arrow.setAttribute('aria-expanded',String(next));
    arrow.setAttribute('aria-label',(next?'收起':'展开')+dirs.get(id).name);
   }
   host.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-tree-toggle')){toggle(b.dataset.treeToggle);}else if(b.hasAttribute('data-select-directory')){
    const id=b.dataset.selectDirectory;
    if(id===selected&&dirs.children(id).length&&id){toggle(id);}
    else select(id);
   }else if(b.hasAttribute('data-add-module'))run(()=>edit(null,rootId));};
  }
  return {mount,edit:node=>run(()=>edit(node)),editPage:node=>run(()=>window.FoamCMSSectionPage({L,UI,notice,refresh},node)),add:parent=>run(()=>edit(null,parent)),remove:node=>api.submit?api.submit('trash',[node],[]):run(()=>remove(node)),refresh};
 };
})();
