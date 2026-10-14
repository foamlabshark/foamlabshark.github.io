'use strict';
window.FoamCMSSectionPage=async(api,node)=>{
 const {L,UI}=api,esc=L.esc,P=window.FoamSectionPage;
 if(!P.supported(node))throw Error('此功能页面不使用模块入口说明。');
 const lease=window.FoamCMSEditLease(L,'section');let dialog,form,saving=false,baseline='';
 const values=()=>({name:form.elements.name.value.trim(),page_content:{subtitle:form.elements.subtitle.value.trim(),body:form.elements.body.value.trim()}});
 const dirty=()=>form&&JSON.stringify(values())!==baseline;
 const leave=e=>{if(dirty()){e.preventDefault();e.returnValue='';}};
 try{
  await lease.open(node.id);
  const item=await P.read(node,true);if(!item)throw Error('目录已不存在，请刷新列表。');
  const data={...(Object.keys(item.page_content||{}).length?{}:await P.defaults(node)),...item.page_content};
  dialog=document.createElement('dialog');dialog.className='cms-dialog cms-section-page-dialog';dialog.setAttribute('aria-labelledby','section-page-title');
  dialog.innerHTML='<header class="cms-dialog-header"><h2 id="section-page-title">编辑入口页</h2><button type="button" class="cms-dialog-close" aria-label="关闭弹窗">×</button></header><p class="cms-muted">'+esc(window.FoamDirectory.path(node.id))+'</p><form id="cms-section-page-form"><label class="form-field"><span>页面标题 · 同时更新目录名称</span><input name="name" required maxlength="60" value="'+esc(item.name)+'"></label><label class="form-field"><span>标题下方的简要说明</span><textarea name="subtitle" rows="2" maxlength="1000">'+esc(data.subtitle||'')+'</textarea></label><label class="form-field"><span>入口页正文说明</span><textarea name="body" rows="10" maxlength="30000" placeholder="说明本模块包含哪些内容、怎样开始学习。支持 Markdown 段落、链接和列表。">'+esc(data.body||'')+'</textarea></label><p class="cms-muted">保存后入口页立即更新，操作会记入维护日志。课程目录和文章正文保持原有编排。</p><div id="cms-draft-state" class="cms-muted" role="status">已取得编辑权限。</div><p data-section-page-error role="alert" hidden></p><div class="cms-dialog-actions"><button class="button secondary" id="cms-preview-button" type="button">预览</button><button class="button secondary" id="cms-cancel" type="button">取消</button><button class="button" type="submit">保存</button></div></form><section class="cms-section-page-preview" aria-label="入口页预览" hidden></section>';
  document.body.append(dialog);form=dialog.querySelector('form');baseline=JSON.stringify(values());lease.bind(form);
  const error=dialog.querySelector('[data-section-page-error]'),note=dialog.querySelector('#cms-draft-state');
  const close=async()=>{if(saving)return;if(dirty()&&!await UI.confirmAction({title:'放弃尚未保存的入口页修改？',message:item.name,action:'放弃修改'}))return;dialog.close();};
  dialog.querySelector('.cms-dialog-close').onclick=close;dialog.querySelector('#cms-cancel').onclick=close;
  dialog.addEventListener('cancel',e=>{e.preventDefault();void close();});
  dialog.querySelector('#cms-preview-button').onclick=()=>{const v=values(),preview=dialog.querySelector('.cms-section-page-preview');preview.hidden=false;preview.innerHTML='<div class="page-heading"><h1>'+esc(v.name)+'</h1><p>'+esc(v.page_content.subtitle)+'</p></div><div class="prose">'+L.markdown(v.page_content.body)+'</div>';preview.scrollIntoView({block:'nearest'});};
  form.addEventListener('input',()=>{note.textContent=dirty()?'尚未保存。':'已取得编辑权限。';});
  form.onsubmit=async e=>{e.preventDefault();if(saving||!form.reportValidity())return;const v=values();if(!v.name){error.hidden=false;error.textContent='请填写页面标题。';return;}saving=true;const save=form.querySelector('[type=submit]');save.disabled=true;error.hidden=true;
   try{await lease.ensure(node.id);const changed=L.check(await lease.headers(L.client.from('foamlab_sections').update(v).eq('id',node.id).eq('revision',item.revision).select('id')));if(!changed.length)throw Error('目录已被更新，当前修改已保留。请另开页面核对后重试。');baseline=JSON.stringify(v);await api.refresh();api.notice('入口页已保存。');dialog.close();}
   catch(err){error.textContent=err.message||'保存失败，请稍后重试。';error.hidden=false;}
   finally{saving=false;save.disabled=false;}
  };
  window.addEventListener('beforeunload',leave);dialog.showModal();form.elements.name.focus();
  await new Promise(resolve=>dialog.addEventListener('close',resolve,{once:true}));
 }finally{window.removeEventListener('beforeunload',leave);dialog?.remove();await lease.dispose();}
};
