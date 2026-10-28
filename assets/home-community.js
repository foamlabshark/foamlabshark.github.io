'use strict';
(() => {
 const entries=document.querySelector('.home-community-links');if(!entries)return;
 const L=window.FoamLab,esc=L.esc,dialogs={},state={page:1,rows:[],total:0,request:0,edit:null,newDraft:'',pending:null,loading:false,pinning:false};let lastUser=null;
 const own=row=>!!L.user&&L.role!=='blocked'&&row.author_id===L.user.id;
 const canDelete=own;
 const pinBadge=row=>row.pinned?'<span class="pill home-guestbook-pinned">置顶</span>':'';
 const orderedMessages=()=>L.client.from('foamlab_guestbook').select('*',{count:'exact'}).order('pinned',{ascending:false}).order('created_at',{ascending:false}).order('id',{ascending:false});
 const preview=kind=>entries.querySelector('[data-home-preview="'+kind+'"]');
 const shortDate=value=>new Date(value).toLocaleDateString('sv-SE',{timeZone:'Asia/Shanghai'});
 function previewUpdates(rows){preview('updates').innerHTML=rows.slice(0,3).map(r=>'<li><button type="button" data-home-open="updates" aria-haspopup="dialog"><time datetime="'+esc(r.date)+'">'+esc(r.date)+'</time><span class="home-preview-title">'+esc(r.title)+'</span></button></li>').join('')||'<li class="home-preview-loading">暂时没有新增页面。</li>';}
 function previewMessages(rows,names){preview('guestbook').innerHTML=rows.slice(0,3).map(r=>{const parsed=document.createElement('template');parsed.innerHTML=L.markdown(r.body);parsed.content.querySelectorAll('script,style,.katex-mathml').forEach(n=>n.remove());const text=parsed.content.textContent.replace(/\s+/g,' ').trim();return '<li><button type="button" data-home-open="guestbook" aria-haspopup="dialog"><span class="home-guestbook-meta">'+pinBadge(r)+'<span class="home-preview-author">'+esc(names[r.author_id]||'网站成员')+'</span><time datetime="'+esc(r.created_at)+'">'+esc(shortDate(r.created_at))+'</time></span><span class="home-preview-title">'+esc(text.slice(0,150)||'图片留言')+'</span></button></li>';}).join('')||'<li class="home-preview-loading">还没有留言，登录后写下第一条吧。</li>';}
 let previewLoading=false;
 async function loadPreviews(){if(previewLoading)return;previewLoading=true;try{await L.ready;await Promise.allSettled([
  (async()=>{try{previewUpdates(L.check(await L.client.rpc('foamlab_recent_updates')));}catch{preview('updates').innerHTML='<li class="home-preview-loading">暂时无法读取，点击“查看全部”重试。</li>';}})(),
  (async()=>{try{const rows=L.check(await L.client.from('foamlab_guestbook').select('id,author_id,body,created_at,pinned').order('pinned',{ascending:false}).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(3));const names=await L.names(rows.map(r=>r.author_id));previewMessages(rows,names);}catch{preview('guestbook').innerHTML='<li class="home-preview-loading">暂时无法读取，点击“查看全部”重试。</li>';}})()
 ]);}catch{for(const kind of ['updates','guestbook'])preview(kind).innerHTML='<li class="home-preview-loading">暂时无法读取，请稍后重试。</li>';}finally{previewLoading=false;}}
 function dialog(kind,title,description){
  const d=document.createElement('dialog');d.className='home-dialog';d.id='home-'+kind+'-dialog';d.setAttribute('aria-labelledby',d.id+'-title');
  d.innerHTML='<header class="home-dialog-head"><div><h2 id="'+d.id+'-title">'+title+'</h2><p>'+description+'</p></div><button type="button" class="icon-button" data-home-close aria-label="关闭'+title+'">×</button></header><div class="home-dialog-body"></div>';
  document.body.append(d);d.querySelector('[data-home-close]').onclick=()=>d.close();
  d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
  d.addEventListener('close',()=>{if(!Object.values(dialogs).some(x=>x.open))document.documentElement.classList.remove('home-dialog-lock');});dialogs[kind]=d;return d;
 }
 const updates=dialog('updates','最近更新','新增课程与页面，按发布日期排列，保留最近 100 条。');
 const board=dialog('guestbook','留言板','欢迎交流学习心得、提出问题或建议。登录后即可留言。');
 updates.querySelector('.home-dialog-body').innerHTML='<p class="home-dialog-status" role="status" data-updates-state></p><ol class="home-updates-list"></ol><button class="button secondary" type="button" data-home-retry hidden>重试</button>';
 board.querySelector('.home-dialog-body').innerHTML='<div data-guestbook-compose></div><div class="home-dialog-toolbar"><p class="home-dialog-status" role="status" data-guestbook-state></p><button type="button" class="text-button" data-guestbook-refresh>刷新留言</button></div><div data-guestbook-list></div><div class="home-guestbook-pager"></div>';
 async function loadUpdates(){
  const note=updates.querySelector('[data-updates-state]'),list=updates.querySelector('ol'),retry=updates.querySelector('[data-home-retry]');note.textContent='正在读取最近更新…';retry.hidden=true;
  try{await L.ready;const rows=L.check(await L.client.rpc('foamlab_recent_updates'));previewUpdates(rows);list.innerHTML=rows.slice(0,100).map(r=>{const url=L.safeURL(r.url),safe=url&&new URL(url).origin===location.origin?url:'/';return '<li><time datetime="'+esc(r.date)+'">'+esc(r.date)+'</time><a href="'+esc(safe)+'">'+esc(r.title)+'</a><small>'+esc(r.entity==='section'?'模块':'页面')+'</small></li>';}).join('');note.textContent=rows.length?'共 '+Math.min(100,rows.length)+' 条更新':'暂时没有新增页面。';}
  catch(error){note.textContent='最近更新暂时无法读取，请重试。';retry.hidden=false;}
 }
 function compose(){
  const host=board.querySelector('[data-guestbook-compose]');
  if(!L.user){host.innerHTML='<p>使用 GitHub 账号登录后即可留言。</p><button type="button" class="button secondary" data-guestbook-login>使用 GitHub 登录</button>';host.querySelector('button').onclick=()=>L.login();return;}
  if(L.role==='blocked'){host.innerHTML='<p class="home-dialog-status">此账号的发言权限已停用，仍可查看留言。</p>';return;}
  if(host.querySelector('form'))return;
  host.innerHTML='<form class="home-guestbook-form"><label class="form-field"><span data-compose-label>写下留言 · 支持 Markdown 与公式</span><textarea name="body" rows="3" minlength="2" maxlength="3000" required placeholder="你的学习心得或建议…"></textarea></label><div class="admin-actions"><button class="button" type="submit">发布留言</button><button class="button secondary" type="button" data-guestbook-preview>预览</button><button class="text-button" type="button" data-guestbook-cancel hidden>取消编辑</button></div><div class="prose lab-preview" hidden></div><p class="form-status" role="status"></p></form>';
  const form=host.querySelector('form');form.elements.body.value=state.newDraft;
  form.querySelector('[data-guestbook-preview]').onclick=()=>{const p=form.querySelector('.lab-preview');p.innerHTML=L.markdown(form.elements.body.value);p.hidden=!p.hidden;};
  form.querySelector('[data-guestbook-cancel]').onclick=()=>finishEdit(form);
  form.onsubmit=async e=>{
   e.preventDefault();const button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;form.querySelector('[data-guestbook-cancel]').disabled=true;
   const userId=L.user?.id;
   try{
    const body=form.elements.body.value.trim();if(body.length<2)throw Error('留言至少需要 2 个有效字符。');await L.ensureProfile();
    if(state.edit){const saved=L.check(await L.client.from('foamlab_guestbook').update({body}).eq('id',state.edit.id).eq('author_id',userId).eq('updated_at',state.edit.updated_at).select('id'));if(!saved.length)throw Error('留言已被修改或删除。当前文字已保留，请刷新后重试。');finishEdit(form);}
    else{
     if(!state.pending||state.pending.body!==body||state.pending.author_id!==userId)state.pending={id:crypto.randomUUID(),body,author_id:userId};
     const existing=L.check(await L.client.from('foamlab_guestbook').select('id').eq('id',state.pending.id).maybeSingle());
     if(!existing)L.check(await L.client.from('foamlab_guestbook').insert(state.pending).select('id').single());
     state.pending=null;state.newDraft='';form.reset();form.querySelector('.lab-preview').hidden=true;
    }
    form.querySelector('.form-status').textContent='留言已保存。';state.page=1;await loadBoard();
   }catch(error){form.querySelector('.form-status').textContent=error.message;}
   finally{button.disabled=false;form.querySelector('[data-guestbook-cancel]').disabled=false;}
  };
 }
 function finishEdit(form){state.edit=null;form.elements.body.value=state.newDraft;form.querySelector('[data-compose-label]').textContent='写下留言 · 支持 Markdown 与公式';form.querySelector('[type=submit]').textContent='发布留言';form.querySelector('[data-guestbook-cancel]').hidden=true;form.querySelector('.lab-preview').hidden=true;form.querySelector('.form-status').textContent='';}
 async function loadBoard(){
  const request=++state.request,note=board.querySelector('[data-guestbook-state]'),list=board.querySelector('[data-guestbook-list]');state.loading=true;note.textContent='正在读取留言…';
  try{
   await L.ready;compose();const response=await orderedMessages().range((state.page-1)*20,state.page*20-1),rows=L.check(response);
   const names=await L.names(rows.map(r=>r.author_id));if(request!==state.request)return;if(state.page===1)previewMessages(rows,names);
   state.total=response.count??rows.length;const pages=Math.max(1,Math.ceil(state.total/20));if(state.page>pages){state.page=pages;return loadBoard();}state.rows=rows;
   list.innerHTML=rows.map(r=>'<article class="home-guestbook-item" data-guestbook-id="'+esc(r.id)+'"><div class="community-byline">'+pinBadge(r)+L.authorMeta(r)+'</div><div class="prose">'+L.markdown(r.body)+'</div><div class="community-post-actions">'+(own(r)?'<button class="text-button" type="button" data-guestbook-edit="'+esc(r.id)+'">编辑</button>':'')+(canDelete(r)?'<button class="text-button danger" type="button" data-guestbook-delete="'+esc(r.id)+'">删除</button>':'')+'</div></article>').join('')||'<p class="home-dialog-status">还没有留言，欢迎写下第一条。</p>';
   note.textContent='共 '+state.total+' 条留言';board.querySelector('.home-guestbook-pager').innerHTML=pages>1?'<button type="button" class="text-button" data-guestbook-page="'+(state.page-1)+'" '+(state.page===1?'disabled':'')+'>上一页</button><span>'+state.page+' / '+pages+'</span><button type="button" class="text-button" data-guestbook-page="'+(state.page+1)+'" '+(state.page===pages?'disabled':'')+'>下一页</button>':'';
   window.dispatchEvent(new Event('foamlab:messages'));
  }catch(error){if(request===state.request)note.textContent='留言暂时无法读取，请点击“刷新留言”重试。';}
  finally{if(request===state.request)state.loading=false;}
 }
 board.addEventListener('click',async e=>{
  const page=e.target.closest('[data-guestbook-page]');if(page&&!page.disabled){state.page=Number(page.dataset.guestbookPage);await loadBoard();return;}
  const edit=e.target.closest('[data-guestbook-edit]');if(edit){const row=state.rows.find(r=>r.id===edit.dataset.guestbookEdit),form=board.querySelector('form');if(!row||!own(row)||form.querySelector('[type=submit]').disabled)return;
   if(state.edit?.id===row.id){form.elements.body.focus();return;}if(state.edit&&form.elements.body.value!==state.edit.body&&!confirm('放弃当前尚未保存的修改？'))return;
   if(!state.edit)state.newDraft=form.elements.body.value;state.edit={...row};form.elements.body.value=row.body;form.querySelector('[data-compose-label]').textContent='编辑我的留言';form.querySelector('[type=submit]').textContent='保存修改';form.querySelector('[data-guestbook-cancel]').hidden=false;form.querySelector('.lab-preview').hidden=true;form.querySelector('.form-status').textContent='';form.scrollIntoView({block:'nearest'});form.elements.body.focus();return;
  }
  const del=e.target.closest('[data-guestbook-delete]');if(!del||del.disabled)return;const row=state.rows.find(r=>r.id===del.dataset.guestbookDelete);if(!row||!canDelete(row)||!confirm('删除这条留言？'))return;
  del.disabled=true;try{const rows=L.check(await L.client.from('foamlab_guestbook').delete().eq('id',row.id).eq('author_id',L.user.id).eq('updated_at',row.updated_at).select('id'));if(!rows.length)throw Error('留言已变化或当前账号无权删除，请刷新后重试。');if(state.edit?.id===row.id)finishEdit(board.querySelector('form'));await loadBoard();}catch(error){board.querySelector('[data-guestbook-state]').textContent=error.message;del.disabled=false;}
 });
 updates.querySelector('[data-home-retry]').onclick=loadUpdates;
 board.querySelector('[data-guestbook-refresh]').onclick=()=>void loadBoard();
 async function open(kind){const d=dialogs[kind];if(!d)return;for(const other of Object.values(dialogs))if(other!==d&&other.open)other.close();if(!d.open)d.showModal();document.documentElement.classList.add('home-dialog-lock');if(kind==='updates')await loadUpdates();else await loadBoard();}
 entries.onclick=e=>{const b=e.target.closest('[data-home-open]'),card=e.target.closest('[data-home-card]');if(b)void open(b.dataset.homeOpen);else if(card&&!getSelection()?.toString())void open(card.dataset.homeCard);};
 function fromHash(){if(location.hash==='#guestbook')void open('guestbook');else if(location.hash==='#updates')void open('updates');}
 addEventListener('hashchange',fromHash);fromHash();
 setInterval(()=>{if(board.open&&!document.hidden&&!state.loading&&!state.edit&&!state.pinning)void loadBoard();},30000);
 setInterval(()=>{if(!document.hidden)void loadPreviews();},60000);
 window.addEventListener('foam-auth-change',()=>{const id=window.foamAuth.user?.id||null;if(lastUser!==id){lastUser=id;state.edit=null;state.newDraft='';state.pending=null;board.querySelector('[data-guestbook-compose]').replaceChildren();if(board.open)void loadBoard();}});
 L.ready.then(()=>lastUser=L.user?.id||null).catch(()=>{});
 void loadPreviews().catch(()=>{previewLoading=false;for(const kind of ['updates','guestbook'])preview(kind).innerHTML='<li class="home-preview-loading">暂时无法读取，请稍后重试。</li>';});
})();
