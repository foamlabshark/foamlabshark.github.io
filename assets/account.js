'use strict';
(() => {
 const $=s=>document.querySelector(s);const shortcuts={"courses":"系统学习","topics":"专题学习","start":"快速开始","commands":"命令速查","dictionaries":"配置与字典速查","algorithms":"有限体积法","linux":"Linux 入门","cpp":"C++ 入门","programming":"OpenFOAM 编程","tools":"工具生态","resources":"资料中心","sharing":"实践与分享","community":"讨论中心","assignments":"作业与实践","announcements":"网站公告"};const defaultShortcuts=["courses", "topics", "commands", "dictionaries", "programming", "resources", "sharing", "community"];const selectedShortcuts=value=>Array.isArray(value)?[...new Set(value.map(key=>({authors:'sharing',recommendations:'resources'})[key]||key))].filter(key=>Object.hasOwn(shortcuts,key)):defaultShortcuts;
 const state={client:null,user:null,profile:null,progress:[],pet:null,petError:false,configured:false,githubEnabled:false,dataError:false,loading:true,dataLoading:false,signingOut:false};window.foamAuth=state;
 let session=null,revision=0,initializing=true,reloadTimer,renderedProfile='',accountController=null,accountLoad=null;
 // A deadline and caller cancellation also work on Safari versions without AbortSignal.any.
 function authFetch(input,options={}){const controller=new AbortController(),abort=()=>controller.abort(),signal=options.signal;if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});const timer=setTimeout(abort,12000);return fetch(input,{...options,signal:controller.signal}).finally(()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);});}
 const report=message=>{const box=$('#account-error');if(box){box.hidden=false;box.textContent=message;}else window.foamNotify?.(message);};
 const text=(selector,value)=>{if($(selector))$(selector).textContent=value;};
 const emit=(accountUpdated=false)=>{window.dispatchEvent(new CustomEvent('foam-auth-change',{detail:{user:state.user,progress:[...state.progress],accountUpdated}}));if(state.user&&location.pathname==='/account/'&&sessionStorage.getItem('foamlab.returnTo')==='admin'){sessionStorage.removeItem('foamlab.returnTo');location.replace('/admin/');}else if(state.user&&location.pathname==='/account/'){const dest=sessionStorage.getItem('foamlab.afterLogin');if(dest&&dest.startsWith('/')&&!dest.startsWith('//')){sessionStorage.removeItem('foamlab.afterLogin');location.replace(dest);}}};
 function render(){const signed=!!state.user;const nav=$('#account-nav-label');if(nav){nav.textContent=signed||state.loading?'个人中心':'登录 / 个人中心';nav.setAttribute('aria-busy',String(state.loading));}for(const button of document.querySelectorAll('#sign-out,#nav-sign-out')){button.hidden=!signed;button.disabled=state.signingOut;button.textContent=state.signingOut?'正在退出…':'退出登录';}text('#home-panda-account',state.loading?'我的熊猫与学习记录 →':signed?'查看我的熊猫与学习记录 →':'登录后，查看熊猫与学习记录 →');const page=$('.account-page');if(!page)return;
 $('#sign-in').hidden=signed;$('#profile-fields').disabled=!signed||state.dataError||state.dataLoading;$('#sign-in').disabled=state.loading||!state.githubEnabled;
 if(state.loading){text('#account-name','正在恢复登录…');text('#account-state','');return;}
 if(!signed){text('#account-name','尚未登录');text('#account-state',state.githubEnabled?'使用 GitHub 登录，保存学习进度并参与讨论。':state.configured?'GitHub 登录正在配置中。课程、资料与公开课堂仍可访问。':'登录服务尚未启用。课程、资料与公开课堂仍可访问。');return;}
 const p=state.profile||{},meta=state.user.user_metadata||{};text('#account-name',p.display_name||meta.full_name||meta.user_name||'学习者');text('#account-state',state.dataError?'已保持登录，资料服务暂时不可用。请稍后重试。':state.dataLoading?'已登录，正在读取个人资料…':'已登录，资料与学习进度会自动同步。');
 const avatar=$('#account-avatar');if(window.FoamAvatar)window.FoamAvatar.render();else avatar.textContent=(p.display_name||meta.user_name||'F').slice(0,1).toUpperCase();
 const form=$('#profile-form'),profileKey=JSON.stringify([state.user.id,p]);if(!state.dataLoading&&profileKey!==renderedProfile){renderedProfile=profileKey;for(const key of ['display_name','institution','research','level','bio'])form.elements[key].value=p[key]||(key==='level'?'beginner':key==='display_name'?(meta.full_name||meta.user_name||''): '');
 const selected=selectedShortcuts(p.shortcuts);form.querySelectorAll('[name=shortcuts]').forEach(box=>box.checked=selected.includes(box.value));}const selected=selectedShortcuts(p.shortcuts);const links=$('#account-shortcuts');links.replaceChildren();selected.forEach(key=>{if(!shortcuts[key])return;const a=document.createElement('a');a.href=key==='algorithms'?'/topics/finite-volume/':'/'+key+'/';a.textContent=shortcuts[key]+' →';links.append(a);});text('#shortcuts-hint','按个人资料中的选择显示');
 const count=state.visibleCompleted ?? state.progress.length;text('#account-completed',state.dataError?'—':String(count));text('#account-progress-state',state.dataError?'学习记录暂时无法读取。':'已完成 '+count+' 个新版课程单元，记录保存在当前账号。');$('#account-progress-bar').style.width=(state.totalLessons?count/state.totalLessons*100:0)+'%';$('#account-continue').href='/courses/';$('#account-continue').textContent='查看系统课程 →';$('#import-progress').hidden=true;
 const username=meta.user_name||meta.preferred_username;if(username&&/^[a-z\d-]{1,39}$/i.test(username)){$('#github-personal-links').hidden=false;for(const [id,prefix] of [['my-submissions','[作业提交]']]){const u=new URL('https://github.com/foamlabshark/foamlabshark.github.io/issues');u.searchParams.set('q','is:issue author:'+username+' "'+prefix+'" in:title');$('#'+id).href=u.href;}}
 }
 // The SDK owns the persisted session and refresh tokens. All pages use this
 // same storage key; profile/settings requests never determine login status.
 function applySession(next){
  const changed=session?.access_token!==next?.access_token||state.user?.id!==next?.user?.id;
  const identityChanged=state.user?.id!==next?.user?.id;
  if(changed){revision++;accountController?.abort();}
  session=next;state.user=next?.user||null;state.loading=false;
  if(identityChanged||!next){state.profile=null;state.progress=[];state.pet=null;state.petError=false;state.dataError=false;state.dataLoading=!!next;renderedProfile='';delete state.visibleCompleted;delete state.totalLessons;}
  if(changed||initializing){render();emit();}
  return changed;
 }
 async function loadAccount(){
  if(!session||state.signingOut)return;
  const requestRevision=revision,activeSession=session;
  const current=()=>requestRevision===revision&&state.user?.id===activeSession.user.id&&!state.signingOut;
  // A confirmed invalid token ends the session. Temporary network errors keep
  // the stored identity visible; database permissions are still enforced by RLS.
  accountController?.abort();const controller=accountController=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);
  let verified,profile,progress;
  try{[verified,profile,progress]=await Promise.all([
   state.client.auth.getUser(activeSession.access_token),
   state.client.from('foamlab_profiles').select('*').eq('user_id',activeSession.user.id).maybeSingle().abortSignal(controller.signal),
   state.client.from('foamlab_learning_progress').select('content_id,completed').eq('user_id',activeSession.user.id).abortSignal(controller.signal)
  ]);}finally{clearTimeout(timeout);if(accountController===controller)accountController=null;}
  if(!current())return;
  if(verified.error&&[401,403].includes(verified.error.status)){
   applySession(null);
   await state.client.auth.signOut({scope:'local'});
   return;
  }
  if(verified.data?.user)state.user=verified.data.user;
  state.dataLoading=false;state.dataError=!!(profile.error||progress.error);
  if(state.dataError){report('已保持登录，个人资料暂时无法读取。请稍后重试。');}
  else{state.profile=profile.data;state.progress=(progress.data||[]).filter(x=>x.completed).map(x=>x.content_id);if($('#account-error'))$('#account-error').hidden=true;}
  render();
  emit(true);
 }
 function updateAccount(){
  const requestRevision=revision;
  if(accountLoad?.revision===requestRevision)return accountLoad.promise;
  state.profileReady=loadAccount().catch(()=>{if(requestRevision!==revision)return;state.dataLoading=false;state.dataError=true;render();report('已保持登录，账号资料暂时无法更新。');});
  const pending=accountLoad={revision:requestRevision,promise:state.profileReady};state.profileReady.finally(()=>{if(accountLoad===pending)accountLoad=null;});
  return state.profileReady;
 }
 function scheduleAccount(){
  clearTimeout(reloadTimer);
  // Keep auth callbacks synchronous; perform follow-up API work after the SDK
  // has processed the session event.
  reloadTimer=setTimeout(updateAccount,0);
 }
 state.ready=(async()=>{
  try{
   const r=await authFetch('/assets/auth-config.json');if(!r.ok)throw Error('无法读取登录配置。');
   const cfg=await r.json();if(!cfg.supabaseUrl||!cfg.publishableKey)return state;
   const u=new URL(cfg.supabaseUrl);if(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co'))throw Error('认证服务地址配置不正确。');
   if(cfg.publishableKey.startsWith('sb_secret_'))throw Error('认证配置错误：网页不能使用服务端密钥。');
   if(!window.supabase?.createClient)throw Error('认证组件未能加载，请刷新页面。');
   state.client=window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey,{global:{fetch:(input,options={})=>{const url=typeof input==='string'?input:input.url||String(input);return url.includes('/auth/v1/user')?authFetch(input,options):fetch(input,options);}},auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage,storageKey:'foamlab-auth'}});
   state.configured=true;state.githubEnabled=true;
   state.client.auth.onAuthStateChange((event,next)=>{
    if(!['INITIAL_SESSION','SIGNED_IN','SIGNED_OUT','TOKEN_REFRESHED','USER_UPDATED'].includes(event))return;
    const changed=applySession(next);
    if(!initializing&&next&&(changed||event==='USER_UPDATED'))scheduleAccount();
   });
   const before=revision;
   const {data,error}=await state.client.auth.getSession();
   if(error)throw error;
   if(revision===before)applySession(data.session);
   updateAccount();
  }catch(e){report(e.message||'认证服务暂时不可用，请稍后重试。');}
  finally{initializing=false;state.loading=false;render();}
  return state;
 })();
 state.signIn=async({returnTo}={})=>{
  await state.ready;if(state.user)return;
  if(!state.client)throw Error('登录服务暂时不可用，请刷新后重试。');
  if(returnTo){const target=new URL(returnTo,location.origin);if(target.origin===location.origin)sessionStorage.setItem('foamlab.afterLogin',target.pathname+target.search+target.hash);}
  // Ending our session does not end GitHub's session. Always ask GitHub to
  // show its account picker instead of silently reusing the previous account.
  const {error}=await state.client.auth.signInWithOAuth({provider:'github',options:{redirectTo:location.origin+'/account/',queryParams:{prompt:'select_account'}}});
  if(error)throw error;
 };
 state.signOut=async()=>{
  if(!state.client)await state.ready;if(!state.client||state.signingOut)return;
  state.signingOut=true;revision++;accountController?.abort();clearTimeout(reloadTimer);render();
  try{
   const {error}=await state.client.auth.signOut({scope:'local'});if(error&&session)throw error;
   applySession(null);sessionStorage.removeItem('foamlab.returnTo');sessionStorage.removeItem('foamlab.afterLogin');
  }catch{report('退出失败，请检查网络后重试。');}
  finally{state.signingOut=false;render();}
 };
 $('#sign-in')?.addEventListener('click',async()=>{const button=$('#sign-in');button.disabled=true;try{await state.signIn();}catch{report('无法发起 GitHub 登录。请检查网络，或稍后重试。');}finally{button.disabled=false;}});
 for(const button of document.querySelectorAll('#sign-out,#nav-sign-out'))button.addEventListener('click',()=>state.signOut());
 $('#profile-form')?.addEventListener('submit',async e=>{e.preventDefault();if(!state.user||state.dataError)return;const form=e.currentTarget,button=form.querySelector('button[type=submit]');if(!form.reportValidity())return;button.disabled=true;const data=new FormData(form);const profile={user_id:state.user.id};for(const key of ['display_name','institution','research','level','bio'])profile[key]=String(data.get(key)||'').trim();profile.shortcuts=selectedShortcuts(data.getAll('shortcuts'));try{const {error}=await state.client.from('foamlab_profiles').upsert(profile,{onConflict:'user_id'});if(error)throw error;state.profile=profile;render();emit(true);text('#profile-message','个人资料已保存到账号。');}catch{text('#profile-message','保存失败，当前填写内容已保留。请检查网络后重试。');}finally{button.disabled=false;}});
})();
