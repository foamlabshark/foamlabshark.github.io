'use strict';
window.FoamCMSNavigation=({host,items,primary,active,select,userId,area,UI,esc,notice,run})=>{
 const labels=new Map(items),allowed=new Set(labels.keys()),key='foamlab.cms-navigation.v1:'+area+':'+userId;
 const defaults={main:primary.filter(id=>allowed.has(id)),more:items.map(([id])=>id).filter(id=>!primary.includes(id))};
 const normalize=value=>{
  const seen=new Set(),take=list=>(Array.isArray(list)?list:[]).filter(id=>allowed.has(id)&&!seen.has(id)&&seen.add(id));
  const main=take(value?.main),more=take(value?.more);
  for(const id of allowed)if(!seen.has(id))(defaults.main.includes(id)?main:more).push(id);
  return {main,more};
 };
 let layout=normalize(defaults),dragged='',lastDrop=0;
 try{layout=normalize(JSON.parse(localStorage.getItem(key)));}catch{}
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(layout));}catch{notice('浏览器未能保存排列，当前页面仍可使用。',true);}};
 function draw(){
  const tab=(id,group)=>'<button type="button" draggable="true" data-cms-tab="'+id+'" data-nav-area="'+group+'" class="'+(id===active()?'selected':'')+'" aria-current="'+(id===active()?'page':'false')+'" title="'+esc(labels.get(id))+' · 可拖动排序">'+esc(labels.get(id))+'</button>';
  host.innerHTML=layout.main.map(id=>tab(id,'main')).join('')+(layout.more.length?'<details id="cms-more" data-nav-drop="more"><summary>更多管理</summary><div>'+layout.more.map(id=>tab(id,'more')).join('')+'</div></details>':'')+'<button type="button" class="cms-nav-organize" data-organize-navigation aria-label="整理管理入口">整理入口</button>';
 }
 function move(value,id,group,target=''){
  for(const list of Object.values(value)){const index=list.indexOf(id);if(index>=0)list.splice(index,1);}
  const index=value[group].indexOf(target);value[group].splice(index<0?value[group].length:index,0,id);
 }
 async function organize(){
  let draft=structuredClone(layout),editorDrag='';
  const pending=UI.confirmAction({title:'整理管理入口',message:'拖动调整顺序，也可用上下按钮；将不常用的入口收纳到“更多管理”。',action:'保存排列',html:'<div class="cms-nav-editor"></div><button type="button" class="text-button" data-nav-reset>恢复默认排列</button>'});
  const dialog=document.querySelector('.cms-dialog[open]'),box=dialog.querySelector('.cms-nav-editor');
  function paint(){box.innerHTML=['main','more'].map(group=>'<section data-nav-zone="'+group+'"><h3>'+(group==='main'?'主栏入口':'更多管理')+'</h3><div class="cms-nav-editor-list">'+draft[group].map((id,i)=>'<div class="cms-nav-editor-row" draggable="true" data-nav-item="'+id+'" data-nav-group="'+group+'"><span class="cms-nav-grip" aria-hidden="true">⠿</span><strong>'+esc(labels.get(id))+'</strong><div><button type="button" data-nav-step="-1" aria-label="上移'+esc(labels.get(id))+'" '+(!i?'disabled':'')+'>↑</button><button type="button" data-nav-step="1" aria-label="下移'+esc(labels.get(id))+'" '+(i===draft[group].length-1?'disabled':'')+'>↓</button><button type="button" data-nav-move="'+(group==='main'?'more':'main')+'">'+(group==='main'?'收纳':'移回主栏')+'</button></div></div>').join('')+(draft[group].length?'':'<p class="cms-muted">暂无入口，可拖动到这里。</p>')+'</div></section>').join('');}
  box.onclick=e=>{const row=e.target.closest('[data-nav-item]'),button=e.target.closest('button');if(!row||!button)return;const id=row.dataset.navItem,group=row.dataset.navGroup;
   if(button.dataset.navMove)move(draft,id,button.dataset.navMove);
   else{const list=draft[group],index=list.indexOf(id),next=index+Number(button.dataset.navStep);if(next<0||next>=list.length)return;[list[index],list[next]]=[list[next],list[index]];}
   paint();box.querySelector('[data-nav-item="'+id+'"] button:not(:disabled)')?.focus();
  };
  box.ondragstart=e=>{const row=e.target.closest('[data-nav-item]');if(!row)return;editorDrag=row.dataset.navItem;e.dataTransfer.setData('text/plain',editorDrag);e.dataTransfer.effectAllowed='move';};
  box.ondragover=e=>{if(editorDrag&&e.target.closest('[data-nav-zone]')){e.preventDefault();e.dataTransfer.dropEffect='move';}};
  box.ondrop=e=>{const zone=e.target.closest('[data-nav-zone]'),row=e.target.closest('[data-nav-item]');if(!zone||!allowed.has(editorDrag))return;e.preventDefault();if(row?.dataset.navItem!==editorDrag)move(draft,editorDrag,zone.dataset.navZone,row?.dataset.navItem);editorDrag='';paint();};
  box.ondragend=()=>editorDrag='';dialog.querySelector('[data-nav-reset]').onclick=()=>{draft=structuredClone(defaults);paint();};paint();
  if(!await pending)return;layout=normalize(draft);save();draw();notice('管理入口排列已保存。');
 }
 host.onclick=e=>{if(Date.now()-lastDrop<200)return;const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-organize-navigation'))run(organize);else if(allowed.has(b.dataset.cmsTab))select(b.dataset.cmsTab);};
 host.ondragstart=e=>{const b=e.target.closest('[data-cms-tab]');if(!b)return;dragged=b.dataset.cmsTab;e.dataTransfer.setData('text/plain',dragged);e.dataTransfer.effectAllowed='move';};
 host.ondragover=e=>{if(dragged){e.preventDefault();e.dataTransfer.dropEffect='move';}};
 host.ondrop=e=>{const target=e.target.closest('[data-cms-tab]'),more=e.target.closest('[data-nav-drop]');if(!allowed.has(dragged)||(!target&&!more))return;e.preventDefault();if(target?.dataset.cmsTab!==dragged)move(layout,dragged,target?.dataset.navArea||'more',target?.dataset.cmsTab);dragged='';lastDrop=Date.now();save();draw();};
 host.ondragend=()=>dragged='';draw();return {getLayout:()=>structuredClone(layout)};
};
