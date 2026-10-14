'use strict';
window.FoamCMSEditLease=(L,entity='content')=>{
 let held=null,timer=null,form=null,restore=null,renewing=false;
 const call=(entry,action)=>L.client.rpc(entity==='section'?'foamlab_section_edit_lease':'foamlab_content_edit_lease',{[entity==='section'?'p_section_id':'p_content_id']:entry.id,p_token:entry.token,p_action:action}).then(L.check);
 const message=data=>(data.owner_name||'另一位管理员')+'正在编辑此文档，请在其退出后重试。';
 function lost(reason){
  if(!form?.isConnected)return;
  if(!restore){const changes=[];for(const e of form.querySelectorAll('input,textarea,select,button')){
   if(['cms-cancel','cms-preview-button'].includes(e.id))continue;
   const key=e.matches('textarea,input:not([type=checkbox]):not([type=file])')?'readOnly':'disabled';changes.push([e,key,e[key]]);e[key]=true;
  }restore=()=>{changes.forEach(([e,k,v])=>e[k]=v);restore=null;};}
  const note=form.querySelector('#cms-draft-state');if(note)note.textContent=reason+'，正文仍保留。';
  if(!form.parentElement.querySelector('[data-edit-retry]')){
   const button=document.createElement('button');button.type='button';button.className='button secondary';button.dataset.editRetry='';button.textContent='重新取得编辑权限';form.before(button);
   button.onclick=async()=>{button.disabled=true;try{await ensure(held.id);restore?.();button.remove();if(note)note.textContent='已取得编辑权限；当前修改尚未保存。';}catch(e){if(note)note.textContent=e.message+'，正文仍保留。';}finally{button.disabled=false;}};
  }
 }
 async function renew(){if(!held||renewing)return;const entry=held;renewing=true;try{const data=await call(entry,'renew');if(held!==entry)return;if(!data.acquired){lost(message(data));return;}entry.expires=data.expires_at;}catch{if(held===entry)lost('连接中断，编辑占用未能续期');}finally{renewing=false;}}
 async function release(){const previous=held;held=null;form=null;restore=null;clearInterval(timer);timer=null;if(previous)try{await call(previous,'release');}catch{/* An interrupted connection expires after 120 seconds. */}}
 async function open(id){if(held?.id!==id)await release();const entry=held||{id,token:crypto.randomUUID()};const data=await call(entry,'acquire');if(!data.acquired)throw Error(message(data));held=entry;entry.expires=data.expires_at;clearInterval(timer);timer=setInterval(()=>void renew(),30000);return data;}
 async function ensure(id){if(!held||held.id!==id)return open(id);const data=await call(held,'acquire');if(!data.acquired){lost(message(data));throw Error(message(data));}held.expires=data.expires_at;}
 const onPageHide=()=>void release(),onFocus=()=>void renew(),onVisibility=()=>{if(!document.hidden)void renew();};
 window.addEventListener('pagehide',onPageHide);
 window.addEventListener('focus',onFocus);
 document.addEventListener('visibilitychange',onVisibility);
 return {open,ensure,release,dispose:async()=>{window.removeEventListener('pagehide',onPageHide);window.removeEventListener('focus',onFocus);document.removeEventListener('visibilitychange',onVisibility);await release();},bind:f=>{form=f;},headers:query=>held?query.setHeader('x-foamlab-edit-token',held.token):query};
};
