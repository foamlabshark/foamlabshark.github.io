'use strict';
(() => {
 const roles={member:'普通会员',editor:'普通作者（原编辑）',moderator:'普通作者（原版主）',admin:'管理员',blocked:'禁止发言与投稿'};
 const abilities={member:'发布自己的文章，参与讨论和评论。',editor:'仅管理自己的问题与分享文章，不具备站点管理权限。',moderator:'仅管理自己的问题与分享文章，不具备站点管理权限。',admin:'管理全站内容、成员权限和网站设置。',blocked:'暂停发表文章、讨论、回复和评论。'};
 let savedState=null;
 window.FoamCMSMembers=async C=>{
  if(!C.admin)throw Error('成员管理需要管理员权限。');
  const {L,UI,run,notice}=C,esc=L.esc,panel=document.querySelector('#cms-panel');
  if(savedState?.user!==L.user.id)savedState={user:L.user.id,q:'',role:'',sort:'registered_at',direction:'desc',page:1,size:25};
  const state=savedState;let members=[],request=0,timer;
  const opts=(items,selected)=>Object.entries(items).map(([v,label])=>'<option value="'+esc(v)+'" '+(String(selected)===v?'selected':'')+'>'+esc(label)+'</option>').join('');
  panel.innerHTML='<section class="cms-members"><div class="cms-toolbar"><div><h2>成员管理</h2><p>查看全部注册用户，在列表中调整成员权限。</p></div><button type="button" class="button secondary" data-members-refresh>刷新列表</button></div><div class="cms-member-filters"><label class="cms-member-search"><span>搜索成员</span><input type="search" data-member-filter="q" maxlength="200" placeholder="昵称、GitHub 用户名、邮箱或用户 ID" value="'+esc(state.q)+'"></label><label><span>权限筛选</span><select data-member-filter="role">'+opts({'':'全部权限',...roles},state.role)+'</select></label><label><span>排序依据</span><select data-member-filter="sort">'+opts({registered_at:'注册时间',last_sign_in_at:'最近登录',username:'用户名',level:'等级'},state.sort)+'</select></label><label><span>排序方向</span><select data-member-filter="direction">'+opts({desc:'降序',asc:'升序'},state.direction)+'</select></label><label><span>每页显示</span><select data-member-filter="size">'+opts({25:'25 人',50:'50 人',100:'100 人'},state.size)+'</select></label><button type="button" class="text-button" data-members-reset>重置筛选</button></div><details class="cms-member-help"><summary>各类权限可以做什么</summary><dl>'+Object.entries(roles).map(([key,label])=>'<div><dt>'+label+'</dt><dd>'+abilities[key]+'</dd></div>').join('')+'</dl></details><p class="cms-member-status" role="status" aria-live="polite">正在读取注册成员…</p><div class="cms-member-results"></div><div class="cms-member-pager"></div></section>';
  const view=panel.querySelector('.cms-members'),results=view.querySelector('.cms-member-results'),pager=view.querySelector('.cms-member-pager'),status=view.querySelector('.cms-member-status');
  const date=value=>{if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});};
  function table(){
   results.innerHTML=members.length?'<table class="cms-member-table"><caption class="sr-only">注册成员与权限</caption><thead><tr><th scope="col">成员</th><th scope="col">等级</th><th scope="col">注册时间</th><th scope="col">最近登录</th><th scope="col">权限</th><th scope="col">操作</th></tr></thead><tbody>'+members.map(m=>{const own=m.user_id===L.user.id;return '<tr data-member-id="'+esc(m.user_id)+'"><td data-label="成员"><button type="button" class="cms-member-name" data-member-info>'+esc(m.display_name)+'</button>'+(own?'<span class="cms-member-self">当前账号</span>':'')+'<small>'+esc(m.username?'@'+m.username:'未设置 GitHub 用户名')+'</small></td><td data-label="等级"><strong>Lv.'+Number(m.level)+'</strong><small>'+Number(m.xp)+' 经验</small></td><td data-label="注册时间"><time datetime="'+esc(m.registered_at||'')+'">'+esc(date(m.registered_at))+'</time></td><td data-label="最近登录">'+(m.last_sign_in_at?'<time datetime="'+esc(m.last_sign_in_at)+'">'+esc(date(m.last_sign_in_at))+'</time>':'尚无记录')+'</td><td data-label="权限"><select data-member-role aria-label="'+esc(m.display_name)+'的权限" '+(own?'disabled':'')+'>'+opts(roles,m.role)+'</select></td><td data-label="操作"><div class="cms-member-actions"><button type="button" class="text-button" data-member-info>资料</button><button type="button" class="text-button" data-member-save disabled>保存</button><button type="button" class="text-button" data-member-cancel disabled>取消</button></div></td></tr>';}).join('')+'</tbody></table>':'<div class="cms-empty">没有找到符合条件的成员。</div>';
  }
  async function load(){
   clearTimeout(timer);const id=++request;if(!view.isConnected)return;
   results.inert=true;pager.inert=true;results.setAttribute('aria-busy','true');status.textContent='正在读取注册成员…';status.classList.remove('is-error');
   try{
    const data=L.check(await L.client.rpc('foamlab_admin_members',{p_query:state.q.trim(),p_role:state.role,p_sort:state.sort,p_direction:state.direction,p_page:state.page,p_size:Number(state.size)}));
    if(id!==request||!view.isConnected)return;
    members=data.items;state.page=data.page;table();pager.innerHTML=UI.pager(state.page,data.total,Number(state.size));
    status.textContent='共 '+data.total+' 位成员'+(state.q.trim()||state.role?' · 已应用筛选':'')+' · 时间按当前设备时区显示';
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
  function actions(row,m){const dirty=row.querySelector('[data-member-role]').value!==m.role;row.querySelector('[data-member-save]').disabled=!dirty;row.querySelector('[data-member-cancel]').disabled=!dirty;row.classList.toggle('has-changes',dirty);}
  results.addEventListener('change',e=>{const select=e.target.closest('[data-member-role]');if(!select)return;const row=select.closest('[data-member-id]'),m=members.find(x=>x.user_id===row.dataset.memberId);if(m)actions(row,m);});
  function info(m){
   const previous=document.activeElement,d=document.createElement('dialog');d.className='cms-dialog cms-member-profile';d.setAttribute('aria-labelledby','cms-member-profile-title');
   const stage={beginner:'入门',intermediate:'进阶',research:'研究应用'};
   const fields=[['GitHub 用户名',m.username?'@'+m.username:'未填写'],['邮箱',m.email||'未填写'],['等级','Lv.'+m.level+' · '+m.xp+' 经验'],['权限',roles[m.role]],['注册时间',date(m.registered_at)],['最近登录',date(m.last_sign_in_at)],['单位',m.institution||'未填写'],['研究方向',m.research||'未填写'],['学习阶段',stage[m.learning_stage]||'未填写'],['个人介绍',m.bio||'未填写'],['用户 ID',m.user_id]];
   d.innerHTML='<h2 id="cms-member-profile-title">'+esc(m.display_name)+'</h2><dl>'+fields.map(([key,value])=>'<div><dt>'+esc(key)+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl><form method="dialog" class="cms-dialog-actions"><button class="button secondary" autofocus>关闭</button></form>';
   d.addEventListener('close',()=>{d.remove();if(previous?.isConnected)previous.focus();},{once:true});document.body.append(d);d.showModal();
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
