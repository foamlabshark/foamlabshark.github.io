'use strict';
(() => {
 const stages=['beginner','intermediate','research'];
 const text=value=>String(value||'').replace(/[\s\u3000]+/g,' ').trim();
 const keywords=value=>[...new Set(String(value||'').split(/[,，、;；/／|｜\n\r\t]+/).map(text).filter(v=>/[\p{L}\p{N}]/u.test(v)).map(v=>{
  const key=v.toLowerCase();return ({openfoam:'OpenFOAM',cfd:'CFD','计算流体动力学':'CFD',les:'LES','大涡模拟':'LES',dns:'DNS','直接数值模拟':'DNS',rans:'RANS',vof:'VOF'})[key]||key;
 }))];
 const monthNow=()=>new Date().toLocaleDateString('sv-SE').slice(0,7);
 const validMonth=value=>/^(19|20)\d{2}-(0[1-9]|1[0-2])$/.test(value||'')&&value<=monthNow();
 const complete=p=>!!p&&text(p.institution).length>=2&&text(p.institution).length<=100&&text(p.research).length<=200&&keywords(p.research).length>0&&stages.includes(p.level)&&validMonth(p.birth_month);
 function validate(form){
  const institution=form.elements.institution,research=form.elements.research,level=form.elements.level;
  institution.setCustomValidity(text(institution.value).length<2?'请填写单位或学校的全称。':'');
  research.setCustomValidity(!keywords(research.value).length?'请填写研究方向，可用逗号或顿号分隔多个方向。':'');
  level.setCustomValidity(!stages.includes(level.value)?'请选择当前学习阶段。':'');
  const birth=form.elements.birth_month;birth.max=monthNow();birth.setCustomValidity(validMonth(birth.value)?'':'请填写有效出生年月，不能晚于本月。');
  return form.reportValidity();
 }
 let dialog=null,owner=null,observer=null;
 function close(){if(dialog){dialog.close();dialog.remove();dialog=null;}owner=null;observer?.disconnect();observer=null;document.documentElement.classList.remove('profile-required-open');}
 function sync(auth){
  if(!auth.user||auth.signingOut||complete(auth.profile)){close();return;}
  if(owner!==auth.user.id)close();
  if(auth.loading||auth.dataLoading)return;
  if(!dialog){
   owner=auth.user.id;dialog=document.createElement('dialog');dialog.className='profile-required-dialog';dialog.setAttribute('aria-labelledby','profile-required-title');dialog.setAttribute('aria-describedby','profile-required-intro');
   dialog.innerHTML='<div class="profile-required-heading"><span class="profile-required-mark" aria-hidden="true">你好</span><div><h2 id="profile-required-title">完善个人资料</h2><p id="profile-required-intro">请填写以下四项信息，保存后继续使用网站。</p></div></div><p class="profile-required-privacy">单位、研究方向、学习阶段和出生年代用于首页人数统计，不与姓名或账号关联展示。其他资料仍可选填。</p><div data-profile-unavailable hidden><p role="status">个人资料暂时无法读取，请重试。</p><button type="button" class="button secondary" data-profile-retry>重新读取</button></div><form data-required-profile><label class="form-field"><span>单位或学校（全称）<em>必填</em></span><input name="institution" maxlength="100" autocomplete="organization" required placeholder="例如：北京大学、某某研究院"><small>请填写正式全称，不使用简称。</small></label><label class="form-field"><span>研究方向<em>必填</em></span><input name="research" maxlength="200" required placeholder="例如：湍流模拟、传热、多相流"><small>多个方向请用逗号、顿号或分号分隔。</small></label><label class="form-field"><span>当前学习阶段<em>必填</em></span><select name="level" required><option value="">请选择当前学习阶段</option><option value="beginner">入门：环境与基本操作</option><option value="intermediate">进阶：网格与数值方法</option><option value="research">研究应用：物理模型与程序开发</option></select></label><label class="form-field"><span>出生年月<em>必填</em></span><input name="birth_month" type="month" min="1900-01" required><small>首页仅按出生年代统计人数，不展示个人出生年月。</small></label><p class="profile-required-message" role="status" data-profile-message></p><button type="submit" class="button">保存并继续</button></form><button type="button" class="text-button" data-profile-signout>退出登录</button>';
   const form=dialog.querySelector('form'),message=dialog.querySelector('[data-profile-message]'),uid=owner;
   for(const key of ['institution','research','level','birth_month'])form.elements[key].value=auth.profile?.[key]||'';
   form.elements.birth_month.max=monthNow();
   form.addEventListener('input',e=>{e.target.setCustomValidity?.('');message.textContent='';});
   form.onsubmit=async e=>{
    e.preventDefault();if(!validate(form))return;const button=form.querySelector('[type=submit]');button.disabled=true;message.textContent='正在保存…';
    try{await auth.saveProfile({institution:form.elements.institution.value,research:form.elements.research.value,level:form.elements.level.value,birth_month:form.elements.birth_month.value});}
    catch(error){if(owner===uid)message.textContent=error.message||'保存失败，请稍后重试。';}
    finally{button.disabled=false;}
   };
   dialog.querySelector('[data-profile-signout]').onclick=()=>void auth.signOut();
   dialog.querySelector('[data-profile-retry]').onclick=async e=>{e.currentTarget.disabled=true;try{await auth.reloadProfile();}finally{if(dialog)dialog.querySelector('[data-profile-retry]').disabled=false;}};
   dialog.addEventListener('cancel',e=>e.preventDefault());
   document.body.append(dialog);dialog.showModal();document.documentElement.classList.add('profile-required-open');
   const keepFocused=()=>{if(!dialog?.open)return;for(const other of document.querySelectorAll('dialog[open]'))if(other!==dialog)other.close();};
   keepFocused();observer=new MutationObserver(keepFocused);observer.observe(document.body,{attributes:true,subtree:true,attributeFilter:['open']});
  }
  dialog.querySelector('form').hidden=auth.profileError;dialog.querySelector('[data-profile-unavailable]').hidden=!auth.profileError;
  if(!auth.profileError&&!dialog.dataset.filled){for(const key of ['institution','research','level','birth_month'])dialog.querySelector('form').elements[key].value=auth.profile?.[key]||'';dialog.dataset.filled='true';}
 }
 window.FoamProfile={text,keywords,complete,validate,sync,validMonth,monthNow};
})();
