'use strict';
(() => {
 const roles={member:'普通会员',supporter:'充电会员',editor:'普通作者',admin:'管理员',blocked:'禁止发言与投稿'};
 const abilities={supporter:'阅读向充电会员开放的文章；发布、编辑和删除自己的文章及评论，参与讨论。',member:'发布、编辑和删除自己的文章及评论，参与讨论；不能删除他人的评论。',editor:'管理自己的文章、问题及评论，并可删除他人的评论；不能修改他人的文章和评论。',admin:'管理全站内容、成员权限和网站设置。',blocked:'暂停发表文章、讨论、回复和评论。'};
 let savedState=null;
 window.FoamCMSMembers=async C=>{
  if(!C.admin)throw Error('成员管理需要管理员权限。');
  const {L,UI,run,notice}=C,esc=L.esc,panel=document.querySelector('#cms-panel');
  if(savedState?.user!==L.user.id)savedState={user:L.user.id,q:'',role:'',sort:'registered_at',direction:'desc',page:1,size:25};
  const state=savedState;if(state.role==='moderator')state.role='editor';let members=[],request=0,timer;
  const opts=(items,selected)=>Object.entries(items).map(([v,label])=>'<option value="'+esc(v)+'" '+(String(selected)===v?'selected':'')+'>'+esc(label)+'</option>').join('');
  panel.innerHTML='<section class="cms-members"><div class="cms-toolbar"><div><h2>成员管理</h2><p>查看全部注册用户，在列表中调整成员权限。</p></div><button type="button" class="button secondary" data-members-refresh>刷新列表</button></div><div class="cms-member-filters"><label class="cms-member-search"><span>搜索成员</span><input type="search" data-member-filter="q" maxlength="200" placeholder="昵称、GitHub 用户名、邮箱或用户 ID" value="'+esc(state.q)+'"></label><label><span>权限筛选</span><select data-member-filter="role">'+opts({'':'全部权限',...roles},state.role)+'</select></label><label><span>排序依据</span><select data-member-filter="sort">'+opts({registered_at:'注册时间',last_sign_in_at:'最近登录',username:'用户名',level:'等级'},state.sort)+'</select></label><label><span>排序方向</span><select data-member-filter="direction">'+opts({desc:'降序',asc:'升序'},state.direction)+'</select></label><label><span>每页显示</span><select data-member-filter="size">'+opts({25:'25 人',50:'50 人',100:'100 人'},state.size)+'</select></label><button type="button" class="text-button" data-members-reset>重置筛选</button></div><details class="cms-member-help"><summary>各类权限可以做什么</summary><dl>'+Object.entries(roles).map(([key,label])=>'<div><dt>'+label+'</dt><dd>'+abilities[key]+'</dd></div>').join('')+'</dl></details><p class="cms-member-status" role="status" aria-live="polite">正在读取注册成员…</p><div class="cms-member-results"></div><div class="cms-member-pager"></div></section>';
  const view=panel.querySelector('.cms-members'),results=view.querySelector('.cms-member-results'),pager=view.querySelector('.cms-member-pager'),status=view.querySelector('.cms-member-status');
  view.querySelector('.cms-toolbar p').textContent='查看注册成员，编辑个人资料或调整成员权限。';
  const refresh=view.querySelector('[data-members-refresh]'),actionsBar=document.createElement('div');actionsBar.className='cms-export-actions';refresh.before(actionsBar);actionsBar.append(refresh);actionsBar.insertAdjacentHTML('afterbegin','<button type="button" class="button secondary" data-members-export title="导出当前筛选条件下的全部成员">导出 Excel</button>');
  view.querySelector('.cms-toolbar').insertAdjacentHTML('afterend','<p class="cms-export-status" role="status" aria-live="polite" data-export-status></p>');
  const clearExportStatus=()=>{if(!view.querySelector('[data-members-export]').disabled)view.querySelector('[data-export-status]').textContent='';};
  view.addEventListener('input',clearExportStatus);view.addEventListener('click',e=>{if(e.target.closest('[data-members-reset],[data-members-refresh]'))clearExportStatus();});
  const queryArgs=(filter,page,size)=>({p_query:filter.q.trim(),p_role:filter.role,p_sort:filter.sort,p_direction:filter.direction,p_page:page,p_size:Number(size)});
  view.querySelector('[data-members-export]').onclick=e=>{
   const filter={...state};
   void window.FoamCMSExcel.run(C,view,e.currentTarget,async({progress,assertActive})=>{
    const all=[],seen=new Set();let total=null;
    for(let page=1;;page++){
     assertActive();const data=L.check(await L.client.rpc('foamlab_admin_members',queryArgs(filter,page,100)));assertActive();
     if(!Array.isArray(data?.items)||!Number.isSafeInteger(data.total)||data.total<0||data.page!==page||(total!==null&&data.total!==total))throw Error('成员列表在导出期间发生变化，请重试。');
     total=data.total;
     for(const row of data.items){if(!row.user_id||seen.has(row.user_id))throw Error('成员列表在导出期间发生变化，请重试。');seen.add(row.user_id);all.push(row);}
     progress('已读取 '+all.length+' / '+total+' 位成员…');
     if(all.length===total)break;
     if(!data.items.length||all.length>total)throw Error('成员列表读取不完整，请重试。');
    }
    const stage={beginner:'入门',intermediate:'进阶',research:'研究应用'},d=window.FoamCMSExcel.date;
    return {name:'成员管理',columns:[['昵称',24],['GitHub 用户名',24],['邮箱',32],['权限',20],['等级',10,'number'],['经验值',14,'number'],['注册时间',23,'date'],['最近登录',23,'date'],['单位',30],['研究方向',35],['学习阶段',16],['个人介绍',60],['身份受保护',16],['用户 ID',40]],rows:all.map(m=>[m.display_name||'',m.username||'',m.email||'',roles[m.role==='moderator'?'editor':m.role]||m.role,Number(m.level||0),Number(m.xp||0),d(m.registered_at),d(m.last_sign_in_at),m.institution||'',m.research||'',stage[m.learning_stage]||m.learning_stage||'',m.bio||'',m.role_protected?'是':'否',m.user_id]),details:[['搜索条件',filter.q.trim()||'未限制'],['权限筛选',roles[filter.role]||'全部权限'],['排序',({registered_at:'注册时间',last_sign_in_at:'最近登录',username:'用户名',level:'等级'})[filter.sort]+' · '+(filter.direction==='asc'?'升序':'降序')],['导出范围','点击导出时的筛选条件下的全部成员，包含列表后续各页。']]};
   });
  };
  const date=value=>{if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});};
  function table(){
   results.innerHTML=members.length?'<table class="cms-member-table"><caption class="sr-only">注册成员与权限</caption><thead><tr><th scope="col">成员</th><th scope="col">等级</th><th scope="col">注册时间</th><th scope="col">最近登录</th><th scope="col">权限</th><th scope="col">操作</th></tr></thead><tbody>'+members.map(m=>{const own=m.user_id===L.user.id;return '<tr data-member-id="'+esc(m.user_id)+'"><td data-label="成员"><button type="button" class="cms-member-name" data-member-info>'+esc(m.display_name)+'</button>'+(own?'<span class="cms-member-self">当前账号</span>':'')+(m.role_protected?'<span class="cms-member-self">身份受保护</span>':'')+'<small>'+esc(m.username?'@'+m.username:'未设置 GitHub 用户名')+'</small></td><td data-label="等级"><strong>Lv.'+Number(m.level)+'</strong><small>'+Number(m.xp)+' 经验</small></td><td data-label="注册时间"><time datetime="'+esc(m.registered_at||'')+'">'+esc(date(m.registered_at))+'</time></td><td data-label="最近登录">'+(m.last_sign_in_at?'<time datetime="'+esc(m.last_sign_in_at)+'">'+esc(date(m.last_sign_in_at))+'</time>':'尚无记录')+'</td><td data-label="权限"><select data-member-role aria-label="'+esc(m.display_name)+'的权限" '+(own||m.role_protected?'disabled':'')+'>'+opts(roles,m.role)+'</select></td><td data-label="操作"><div class="cms-member-actions"><button type="button" class="text-button" data-member-info>资料</button><button type="button" class="text-button" data-member-save disabled>保存</button><button type="button" class="text-button" data-member-cancel disabled>取消</button></div></td></tr>';}).join('')+'</tbody></table>':'<div class="cms-empty">没有找到符合条件的成员。</div>';
  }
  async function load(){
   clearTimeout(timer);const id=++request;if(!view.isConnected)return;
   results.inert=true;pager.inert=true;results.setAttribute('aria-busy','true');status.textContent='正在读取注册成员…';status.classList.remove('is-error');
   try{
    await window.foamAuth?.recordMemberVisit?.();
    if(id!==request||!view.isConnected)return;
    const data=L.check(await L.client.rpc('foamlab_admin_members',queryArgs(state,state.page,state.size)));
    if(id!==request||!view.isConnected)return;
    members=data.items.map(m=>({...m,role:m.role==='moderator'?'editor':m.role}));state.page=data.page;table();pager.innerHTML=UI.pager(state.page,data.total,Number(state.size));
    status.textContent='共 '+data.total+' 位成员'+(state.q.trim()||state.role?' · 已应用筛选':'')+' · 最近登录按已登录状态下的访问时间记录；时间按当前设备时区显示';
   }catch(e){
    if(id!==request||!view.isConnected)return;
    members=[];results.innerHTML='<div class="cms-empty"><button type="button" class="button secondary" data-members-refresh>重新加载</button></div>';pager.replaceChildren();status.textContent=e.message||'成员列表加载失败，请重试。';status.classList.add('is-error');
   }finally{if(id===request&&view.isConnected){results.inert=false;pager.inert=false;results.removeAttribute('aria-busy');}}
  }
  function queueLoad(){
   // Invalidate an older response immediately, including during the debounce window.
   ++request;clearTimeout(timer);results.inert=true;pager.inert=true;status.textContent='正在筛选成员…';timer=setTimeout(load,250);
  }
  view.querySelectorAll('[data-member-filter]').forEach(input=>input.addEventListener('input',()=>{state[input.dataset.memberFilter]=input.value;state.page=1;input.dataset.memberFilter==='q'?queueLoad():load();}));
  function actions(row,m){const dirty=!m.role_protected&&m.user_id!==L.user.id&&row.querySelector('[data-member-role]').value!==m.role;row.querySelector('[data-member-save]').disabled=!dirty;row.querySelector('[data-member-cancel]').disabled=!dirty;row.classList.toggle('has-changes',dirty);}
  results.addEventListener('change',e=>{const select=e.target.closest('[data-member-role]');if(!select)return;const row=select.closest('[data-member-id]'),m=members.find(x=>x.user_id===row.dataset.memberId);if(m)actions(row,m);});
  function info(m){
   const previous=document.activeElement,d=document.createElement('dialog');d.className='cms-dialog cms-member-profile';d.setAttribute('aria-labelledby','cms-member-profile-title');
   const stage={beginner:'入门',intermediate:'进阶',research:'研究应用'},month=String(m.birth_month||'').match(/^((?:19|20)\d{2})-(0[1-9]|1[0-2])$/),birth=month?month[1]+'年'+Number(month[2])+'月':'未填写';
   const fields=[['GitHub 用户名',m.username?'@'+m.username:'未填写'],['邮箱',m.email||'未填写'],['等级','Lv.'+m.level+' · '+m.xp+' 经验'],['权限',roles[m.role]],['注册时间',date(m.registered_at)],['最近登录',date(m.last_sign_in_at)],['单位',m.institution||'未填写'],['研究方向',m.research||'未填写'],['学习阶段',stage[m.learning_stage]||'未填写'],['出生年月',birth],['个人介绍',m.bio||'未填写'],['用户 ID',m.user_id]];
   d.innerHTML='<h2 id="cms-member-profile-title">'+esc(m.display_name)+'</h2><dl>'+fields.map(([key,value])=>'<div><dt>'+esc(key)+'</dt><dd'+(key==='出生年月'?' data-member-birth-month aria-live="polite"':'')+'>'+esc(value)+'</dd></div>').join('')+'</dl><form method="dialog" class="cms-dialog-actions"><button class="button secondary" autofocus>关闭</button></form>';
   const edit=document.createElement('button');edit.type='button';edit.className='button';edit.textContent='编辑资料';edit.onclick=()=>{d.close();editProfile(m);};d.querySelector('.cms-dialog-actions').prepend(edit);
   d.addEventListener('close',()=>{d.remove();if(previous?.isConnected)previous.focus();},{once:true});document.body.append(d);d.showModal();
  }
  function editProfile(m){
   const previous=document.activeElement,d=document.createElement('dialog');d.className='cms-dialog cms-member-editor';d.setAttribute('aria-labelledby','cms-member-editor-title');
   d.innerHTML='<h2 id="cms-member-editor-title">编辑成员资料</h2><p class="cms-member-editor-identity"></p><form><fieldset disabled><div class="cms-member-profile-grid"><label class="form-field"><span>昵称</span><input name="display_name" maxlength="50" required autocomplete="off"></label><label class="form-field"><span>学校／单位（全称）</span><input name="institution" maxlength="100" required autocomplete="off"></label><label class="form-field cms-member-profile-wide"><span>研究方向</span><textarea name="research" rows="2" maxlength="200" required placeholder="多个方向可用逗号、顿号或分号分隔"></textarea></label><label class="form-field"><span>学习阶段</span><select name="level" required><option value="">请选择</option><option value="beginner">入门</option><option value="intermediate">进阶</option><option value="research">研究应用</option></select></label><label class="form-field"><span>出生年月</span><input name="birth_month" type="month" min="1900-01" required><small>首页仅展示出生年代统计。</small></label><label class="form-field cms-member-profile-wide"><span>个人介绍／学习目标（选填）</span><textarea name="bio" rows="3" maxlength="400"></textarea></label></div></fieldset><p class="form-status" role="status" aria-live="polite">正在读取最新资料…</p><button type="button" class="text-button" data-profile-reload hidden>重新读取最新资料</button><div class="cms-dialog-actions"><button type="button" class="button secondary" data-profile-cancel>取消</button><button type="submit" class="button" disabled>保存资料</button></div></form>';
   d.querySelector('.cms-member-editor-identity').textContent=m.display_name+(m.username?' · @'+m.username:'');
   const form=d.querySelector('form'),fieldset=d.querySelector('fieldset'),message=d.querySelector('.form-status'),save=d.querySelector('[type=submit]'),cancel=d.querySelector('[data-profile-cancel]'),reload=d.querySelector('[data-profile-reload]');
   const keys=['display_name','institution','research','level','birth_month','bio'];let snapshot=null,saving=false,reading=false;
   const values=()=>Object.fromEntries(keys.map(key=>[key,form.elements[key].value]));
   const dirty=()=>snapshot&&keys.some(key=>form.elements[key].value!==(snapshot[key]||''));
   async function discard(title){return !dirty()||await UI.confirmAction({title,message:'当前未保存的输入将被丢弃。',action:'继续'});}
   async function read(){
    if(reading||saving)return;reading=true;fieldset.disabled=true;save.disabled=true;reload.disabled=true;message.textContent='正在读取最新资料…';
    try{
     const data=L.check(await L.client.rpc('foamlab_admin_member_profile',{p_user_id:m.user_id}));if(!d.isConnected)return;
     if(data?.profile?.user_id!==m.user_id)throw Error('资料读取不完整，请重试。');snapshot=data.profile;
     for(const key of keys)form.elements[key].value=snapshot[key]||'';
     form.elements.birth_month.max=window.FoamProfile.monthNow();fieldset.disabled=false;save.disabled=false;reload.hidden=true;message.textContent='';form.elements.display_name.focus({preventScroll:true});
    }catch(error){if(d.isConnected){message.textContent=error.message||'资料暂时无法读取。';reload.hidden=false;}}
    finally{reading=false;reload.disabled=false;}
   }
   cancel.onclick=async()=>{if(!saving&&await discard('放弃修改资料？'))d.close();};
   d.addEventListener('cancel',e=>{e.preventDefault();void cancel.onclick();});
   reload.onclick=async()=>{if(!saving&&await discard('重新读取成员资料？'))void read();};
   form.addEventListener('input',e=>e.target.setCustomValidity?.(''));
   form.onsubmit=async e=>{
    e.preventDefault();if(saving||reading||!snapshot)return;
    form.elements.display_name.setCustomValidity(form.elements.display_name.value.trim()?'':'请填写昵称。');
    if(!window.FoamProfile.validate(form))return;
    const patch=values();if(!dirty()){d.close();return;}
    saving=true;fieldset.disabled=true;save.disabled=true;cancel.disabled=true;reload.disabled=true;message.textContent='正在保存…';
    try{
     const result=await L.client.rpc('foamlab_admin_member_profile',{p_user_id:m.user_id,p_patch:patch,p_expected_updated_at:snapshot.updated_at});
     if(result.error){const error=Error(result.error.message);error.code=result.error.code;throw error;}
     if(!result.data?.profile||result.data.profile.user_id!==m.user_id)throw Error('保存结果暂时无法确认，请重新读取资料后核对。');
     if(!d.isConnected)return;
     snapshot=result.data.profile;
     window.FoamMemberData?.invalidate('foamlab_member_distribution');window.FoamMemberData?.invalidate('foamlab_member_leaderboards');
     if(m.user_id===L.user.id)void window.foamAuth?.reloadProfile?.();
     d.close();void load();notice('已保存 '+snapshot.display_name+' 的个人资料。');
    }catch(error){if(d.isConnected){message.textContent=error.message||'保存失败，当前输入已保留，请重试。';reload.hidden=error.code!=='40001';}}
    finally{saving=false;fieldset.disabled=false;save.disabled=false;cancel.disabled=false;reload.disabled=false;}
   };
   d.addEventListener('close',()=>{d.remove();if(previous?.isConnected)previous.focus();},{once:true});document.body.append(d);d.showModal();void read();
  }
  view.addEventListener('click',e=>{
   if(e.target.closest('[data-members-refresh]')){notice('');load();return;}
   if(e.target.closest('[data-members-reset]')){Object.assign(state,{q:'',role:'',sort:'registered_at',direction:'desc',page:1,size:25});view.querySelectorAll('[data-member-filter]').forEach(el=>el.value=state[el.dataset.memberFilter]);load();return;}
   const page=e.target.closest('[data-page]');if(page&&!page.disabled){state.page=Number(page.dataset.page);load();return;}
   const row=e.target.closest('[data-member-id]');if(!row)return;const m=members.find(x=>x.user_id===row.dataset.memberId);if(!m)return;
   if(e.target.closest('[data-member-info]')){info(m);return;}
   if(e.target.closest('[data-member-cancel]')){row.querySelector('[data-member-role]').value=m.role;actions(row,m);return;}
   if(e.target.closest('[data-member-save]'))run(async()=>{
    const role=row.querySelector('[data-member-role]').value;if(role===m.role)return;
    if(!await UI.confirmAction({title:'确认修改成员权限？',message:m.display_name+(m.username?' · @'+m.username:''),details:[roles[m.role]+' → '+roles[role],abilities[role]],action:'保存权限',danger:role==='blocked'||m.role==='admin'}))return;
    L.check(await L.client.rpc('foamlab_admin_set_member_role',{p_user_id:m.user_id,p_role:role,p_expected_role:m.role}));
    await load();notice(m.display_name+'的权限已保存为'+roles[role]+'。');
   });
  });
  await load();
 };
})();
