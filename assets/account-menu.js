'use strict';
(() => {
 const auth=window.foamAuth,panel=document.querySelector('#account-panel'),trigger=document.querySelector('#account-nav-label');
 if(!auth||!panel||!trigger)return;
 document.body.append(panel);
 const $=selector=>panel.querySelector(selector),put=(selector,value)=>{$(selector).textContent=value;};
 let cached={},cachedUser=null;
 const key=id=>'foamlab.account-summary:'+id;
 function readSummary(){
  cached={};cachedUser=auth.user?.id||null;
  if(!cachedUser)return;
  try{const value=JSON.parse(localStorage.getItem(key(cachedUser)));if(value?.userId===cachedUser)cached=value;}catch{}
 }
 function cacheSummary({profile=false,pet=false}={}){
  if(!auth.user)return;
  const displayName=profile?auth.profile?.display_name||cached.displayName:cached.displayName;
  const growth=pet?auth.pet||cached.pet:cached.pet;
  // Display-only cache. Identity, permissions and experience awards always use
  // the Supabase session and server APIs, never these cached values.
  cached={userId:auth.user.id,displayName,pet:growth};
  try{localStorage.setItem(key(auth.user.id),JSON.stringify(cached));}catch{}
 }
 function render(){
  if(cachedUser!==auth.user?.id)readSummary();
  const signed=!!auth.user,meta=auth.user?.user_metadata||{};
  const name=cached.displayName||auth.profile?.display_name||meta.full_name||meta.user_name||'学习者';
  panel.dataset.authState=auth.loading?'loading':signed?'authenticated':'anonymous';
  $('#account-panel-member').hidden=!signed;$('#account-panel-guest').hidden=signed||auth.loading;$('#account-panel-badge').hidden=!signed;
  put('#account-panel-name',signed?String(name):'个人中心');if(window.FoamAvatar)window.FoamAvatar.render();else put('#account-panel-avatar',signed?String(name).slice(0,1).toUpperCase():'F');
  put('#account-panel-status',auth.loading?'正在恢复登录…':signed?'GitHub 账号已登录':'尚未登录');
  const pet=cached.pet||auth.pet;
  if(signed&&pet&&Number.isFinite(pet.level)&&Number.isFinite(pet.xp)&&Number.isFinite(pet.next_level_xp)){
   put('#account-panel-level','Lv.'+pet.level);
   put('#account-panel-xp',pet.xp+' 经验 · 距下一级 '+Math.max(0,pet.next_level_xp-pet.xp)+' 经验');
   const range=pet.next_level_xp-pet.level_start;
   $('#account-panel-xp-bar').style.width=(range>0?Math.max(0,Math.min(100,100*(pet.xp-pet.level_start)/range)):0)+'%';
  }else{put('#account-panel-level',auth.petError?'等级暂未读取':'等级读取中…');put('#account-panel-xp',auth.petError?'可前往“我的熊猫”重试':'正在读取成长记录');$('#account-panel-xp-bar').style.width='0%';}
  panel.querySelectorAll('[data-account-sign-out]').forEach(b=>{b.disabled=auth.signingOut;b.textContent=auth.signingOut?'正在退出…':'退出登录';});
  $('#account-panel-sign-in').disabled=auth.loading||!auth.configured;
  panel.querySelectorAll('[data-management-link]').forEach(a=>a.hidden=!['admin','editor','moderator'].includes(window.FoamLab?.role));
 }
 function position(){
  const r=trigger.getBoundingClientRect(),width=Math.min(340,innerWidth-24);
  panel.style.width=width+'px';panel.style.left=Math.max(12,Math.min(r.right-width,innerWidth-width-12))+'px';
  panel.style.top=(r.bottom+12)+'px';panel.style.maxHeight=Math.max(160,innerHeight-r.bottom-24)+'px';
 }
 function close(focus=false){panel.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();}
 trigger.addEventListener('click',e=>{e.preventDefault();const open=panel.hidden;close();if(open){render();panel.hidden=false;trigger.setAttribute('aria-expanded','true');position();$('#account-panel-close').focus({preventScroll:true});}});
 $('#account-panel-close').addEventListener('click',()=>close(true));
 document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!trigger.contains(e.target))close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();close(true);}});
 document.addEventListener('focusin',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!trigger.contains(e.target))close();});
 addEventListener('resize',()=>{if(!panel.hidden)position();});
 addEventListener('scroll',()=>{if(!panel.hidden)position();},{passive:true});
 $('#account-panel-sign-in').addEventListener('click',async()=>{
  const b=$('#account-panel-sign-in');b.disabled=true;$('#account-panel-message').hidden=true;
  try{await auth.signIn({returnTo:location.pathname+location.search+location.hash});}
  catch{put('#account-panel-message','登录暂时无法发起，请稍后重试。');$('#account-panel-message').hidden=false;}
  finally{b.disabled=false;}
 });
 panel.querySelector('[data-account-sign-out]').addEventListener('click',async()=>{await auth.signOut();render();});
 addEventListener('foam-auth-change',e=>{if(cachedUser&&cachedUser!==auth.user?.id){try{localStorage.removeItem(key(cachedUser));}catch{}}readSummary();cacheSummary({profile:e.detail?.accountUpdated});render();});
 addEventListener('foam-pet-change',()=>{readSummary();cacheSummary({pet:true});render();});
 addEventListener('storage',e=>{if(auth.user&&e.key===key(auth.user.id)){readSummary();render();}});
 auth.ready.then(()=>{readSummary();render();});
 window.FoamLab?.ready.then(render).catch(()=>{});
 render();
})();
