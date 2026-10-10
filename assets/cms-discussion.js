'use strict';
window.FoamCMSDiscussion=async C=>{
 if(!C.admin)return window.FoamCMSQuestions(C);
 const {L,run,UI}=C,p=L.$('#cms-panel'),state=window.FoamCMSDiscussionState||(window.FoamCMSDiscussionState={mode:'questions'});
 const tabs=[['questions','问题'],['comments','文章评论'],['replies','讨论回复']];let workspace;
 p.innerHTML='<nav class="cms-subtabs" id="cms-discussion-tabs" aria-label="讨论管理">'+tabs.map(([id,label])=>'<button type="button" data-discussion-tab="'+id+'">'+label+'</button>').join('')+'</nav><section id="cms-discussion-panel"></section>';
 const host=p.querySelector('#cms-discussion-panel'),isDirty=()=>!!p.isConnected&&!!workspace?.isDirty();
 async function show(mode){
  state.mode=mode;host.replaceChildren();workspace=null;
  p.querySelectorAll('[data-discussion-tab]').forEach(b=>{const selected=b.dataset.discussionTab===mode;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  workspace=mode==='questions'?await window.FoamCMSQuestions({...C,panel:host}):await window.FoamCMSModeration({...C,panel:host,mode,discussion:true});
 }
 p.querySelector('#cms-discussion-tabs').onclick=e=>{const b=e.target.closest('[data-discussion-tab]');if(!b||b.dataset.discussionTab===state.mode)return;
  run(async()=>{if(isDirty()&&!await UI.confirmAction({title:'放弃尚未保存的问题修改？',message:'已保存的版本会保留。',action:'放弃修改'}))return;await show(b.dataset.discussionTab);});
 };
 await show(tabs.some(([id])=>id===state.mode)?state.mode:'questions');return {isDirty};
};
