'use strict';
(() => {
 const D=window.FoamDirectory;
 window.FoamCMSDirectories=api=>{
  const {L,UI,run,notice,getRows,select,getSelected}=api,esc=L.esc;let opened=new Set();const rootId=api.rootId||null;const scope=()=>rootId?D.descendants(rootId):D.nodes.map(n=>n.id);
  const refresh=async()=>{await D.load();D.nav();select(getSelected());};
  async function edit(node=null,parent=null){
   const excluded=node?D.descendants(node.id):[],oldParent=node?.parent_id||'';
   const input=await UI.confirmAction({title:node?'编辑目录':'添加'+(parent?'子模块':'模块'),message:parent?'上级：'+D.path(parent):'保存后，网站导航和内容目录会更新。',action:'保存',html:'<div class="cms-module-form"><label class="form-field"><span>名称</span><input name="name" required maxlength="60" value="'+esc(node?.name||'')+'" placeholder="例如：传热与传质"></label><label class="form-field"><span>上级目录</span><select name="parent_id">'+(rootId?D.nodes.filter(n=>scope().includes(n.id)&&!excluded.includes(n.id)).map(n=>'<option value="'+n.id+'" '+((node?.parent_id||parent||rootId)===n.id?'selected':'')+'>'+esc(D.path(n.id))+'</option>').join(''):D.options(node?.parent_id||parent||'',excluded))+'</select></label><label class="form-field"><span>简介（选填）</span><textarea name="description" rows="2" maxlength="1000">'+esc(node?.description||'')+'</textarea></label><div class="form-grid"><label class="form-field"><span>导航分组</span><select name="nav_group">'+['学习空间','资源与社区','管理平台'].map(x=>'<option '+(node?.nav_group===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label><label class="form-field"><span>排序 · 小数值在前</span><input name="sort_order" type="number" required value="'+(node?.sort_order??100)+'"></label></div><label class="cms-check"><input name="visible" type="checkbox" '+(node?.visible!==false?'checked':'')+'> 显示在导航中</label><details><summary>入口地址（通常保持默认）</summary><label class="form-field"><span>留空使用自动生成的内容目录</span><input name="href" value="'+esc(node?.href||'')+'" placeholder="/section/ 目录会自动生成"></label><p class="cms-muted">已有功能页面可以保留原地址；新模块留空即可。</p></details></div>'});
   if(!input)return;const v={name:input.name.trim(),description:input.description.trim(),parent_id:input.parent_id||null,nav_group:rootId?'资源与社区':input.nav_group,sort_order:Number(input.sort_order),visible:input.visible==='on',href:input.href.trim()};
   if(!v.name||!Number.isSafeInteger(v.sort_order))throw Error('请填写名称和整数排序值。');
   if(v.href&&(!v.href.startsWith('/')||v.href.startsWith('//')||v.href.includes('\\')||new URL(v.href,location.origin).origin!==location.origin))throw Error('入口地址使用站内路径，例如 /courses/。');
   if(node&&oldParent!==(v.parent_id||'')&&!await UI.confirmAction({title:'确认移动目录？',message:node.name,details:['原位置：'+D.path(node.id),'新位置：'+(v.parent_id?D.path(v.parent_id)+' / ':'')+v.name,'子目录和文章归属会随目录一起移动。'],action:'确认移动'}))return;
   const result=node?L.check(await L.client.from('foamlab_sections').update(v).eq('id',node.id).eq('revision',node.revision).select()):L.check(await L.client.from('foamlab_sections').insert(v).select());
   if(!result.length)throw Error('目录已被其他编辑更新，请刷新后重试。');
   await D.load();D.nav();if(v.parent_id)opened.add(v.parent_id);select(result[0].id);notice('目录已保存。');
  }
  async function remove(node){
   const ids=D.descendants(node.id),affected=getRows().filter(r=>r.section_ids?.some(id=>ids.includes(id))),unassigned=affected.filter(r=>r.section_ids.every(id=>ids.includes(id)));
   if(!await UI.confirmAction({title:'删除这个目录及其子目录？',message:D.path(node.id),details:[ids.length+' 个目录将从导航移除。',affected.length+' 篇内容受影响，其中 '+unassigned.length+' 篇会进入“未归类”。','正文、附件和文章地址保留；其他目录中的位置也会保留。'],action:'确认删除目录',danger:true}))return;
   L.check(await L.client.rpc('foamlab_delete_section',{section_id:node.id,expected_revision:node.revision}));await api.reload();await D.load();D.nav();select(node.parent_id===rootId?'':node.parent_id||'');notice('目录已删除。保留的内容可在原有位置或“未归类”中找到。');
  }
  function mount(host){
   const selected=getSelected();D.ancestors(selected).forEach(n=>opened.add(n.id));
   const counts=new Map();for(const row of getRows()){const ids=new Set();for(const id of row.section_ids||[])for(const n of D.ancestors(id))ids.add(n.id);for(const id of ids)counts.set(id,(counts.get(id)||0)+1);}
   const branch=n=>{const children=D.children(n.id),count=counts.get(n.id)||0;return '<div><div class="cms-tree-row">'+(children.length?'<button class="cms-tree-toggle" data-tree-toggle="'+n.id+'" aria-expanded="'+opened.has(n.id)+'" aria-label="展开'+esc(n.name)+'">'+(opened.has(n.id)?'▾':'▸')+'</button>':'<span class="cms-tree-toggle"></span>')+'<button class="directory-select '+(n.id===selected?'selected':'')+'" data-select-directory="'+n.id+'" title="'+esc(D.path(n.id))+'">'+esc(n.name)+' <small>'+count+'</small>'+(!n.visible?' · 隐藏':'')+'</button></div>'+(children.length?'<div class="cms-tree-children" data-tree-children="'+n.id+'" '+(opened.has(n.id)?'':'hidden')+'>'+children.map(branch).join('')+'</div>':'')+'</div>';};
   host.innerHTML='<h3>'+(rootId?'资料目录':'网站目录')+'</h3><div class="cms-tree-root-actions"><button class="directory-select '+(!selected?'selected':'')+'" data-select-directory="">'+(rootId?'全部资料':'全部内容')+'</button><button class="directory-select '+(selected==='unassigned'?'selected':'')+'" data-select-directory="unassigned">未归类</button><button data-add-module>＋ 添加模块</button></div>'+D.children(rootId).map(branch).join('');
   host.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-tree-toggle')){const id=b.dataset.treeToggle;if(opened.has(id))opened.delete(id);else opened.add(id);mount(host);}else if(b.hasAttribute('data-select-directory'))select(b.dataset.selectDirectory);else if(b.hasAttribute('data-add-module'))run(()=>edit(null,rootId));};
  }
  return {mount,edit:node=>run(()=>edit(node)),add:parent=>run(()=>edit(null,parent)),remove:node=>run(()=>remove(node)),refresh};
 };
})();
