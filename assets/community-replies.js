'use strict';
(() => {
 const mounts=new WeakMap();
 async function mount(host,parent,canReply=true){
  mounts.get(host)?.();
  const lab=window.FoamLab,{esc}=lab,[key,id]=Object.entries(parent)[0];
  host.querySelectorAll('.lab-message-list,.lab-reply-form,.lab-message-more').forEach(n=>n.remove());
  const list=document.createElement('div');list.className='lab-message-list';host.append(list);
  const more=document.createElement('button');more.type='button';more.className='button secondary lab-message-more';more.textContent='加载更多回复';more.hidden=true;host.append(more);
  const form=document.createElement('form');form.className='lab-reply-form';
  const allowed=canReply&&lab.role!=='blocked';
  const owns=row=>!!lab.user&&lab.role!=='blocked'&&row.author_id===lab.user.id;
  const canDelete=row=>!!lab.user&&(owns(row)||['admin','editor','moderator'].includes(lab.role));
  form.innerHTML=lab.role==='blocked'?'<p class="lab-evidence">此账号的发言权限已停用，仍可阅读公开讨论。</p>':!canReply?'<p class="lab-evidence">此讨论已关闭回复。</p>':!lab.user?'<p>使用 GitHub 账号登录后，可以发表评论和回答问题。</p><button type="button" class="button secondary" data-lab-login>使用 GitHub 登录</button>':'<div class="reply-composer-target" hidden><div><strong data-reply-recipient></strong><p data-reply-excerpt></p></div><button type="button" class="text-button" data-cancel-reply>取消回复</button></div><label class="form-field"><span>公开回复 · 支持 Markdown、TeX 和代码块</span><textarea name="body" rows="6" minlength="2" maxlength="30000" required placeholder="写下你的回复…"></textarea></label><div class="admin-actions"><button class="button" type="submit">发布回复</button><button type="button" class="button secondary" data-preview-reply>预览</button></div><div class="prose lab-preview" hidden></div><p class="form-status" role="status"></p>';
  host.append(form);
  let offset=0,rows=[],names={},references=new Map(),replyTarget=null,live=true,loading=false;
  const snippet=text=>String(text||'').replace(/\s+/g,' ').slice(0,160);
  async function render(){
   const missing=[...new Set(rows.map(r=>r.reply_to_id).filter(Boolean))].filter(x=>!rows.some(r=>r.id===x)&&!references.has(x));
   if(missing.length){const targets=lab.check(await lab.client.from('foamlab_messages').select('*').eq(key,id).eq('status','visible').in('id',missing));for(const row of targets)references.set(row.id,row);}
   names=await lab.names([...rows,...references.values()].map(r=>r.author_id));if(!live)return;
   list.innerHTML=rows.map(r=>{
    const target=rows.find(x=>x.id===r.reply_to_id)||references.get(r.reply_to_id);
    const quote=r.reply_to_id?'<div class="reply-context">'+(target?'<a href="#comment-'+esc(target.id)+'">回复 '+esc(names[target.author_id]||'社区成员')+'</a><p>'+esc(snippet(target.body))+'</p>':'<span>原评论已不可见</span>')+'</div>':'';
    return '<article class="lab-message" id="comment-'+esc(r.id)+'" tabindex="-1" data-message-id="'+esc(r.id)+'" data-author-id="'+esc(r.author_id)+'"><div class="lab-message-meta community-byline">'+lab.authorMeta(r)+'</div>'+quote+'<div class="prose" data-message-body>'+lab.markdown(r.body)+'</div><div class="community-post-actions">'+lab.likeButton('comment',r.id)+(allowed?'<button type="button" class="text-button" data-reply-message="'+esc(r.id)+'">回复</button>':'')+(owns(r)?'<button type="button" class="text-button" data-edit-message="'+esc(r.id)+'">编辑</button>':'')+(canDelete(r)?'<button type="button" class="text-button danger" data-delete-message="'+esc(r.id)+'">'+(owns(r)?'删除我的回复':'删除回复')+'</button>':'')+'</div></article>';
   }).join('')||'<p class="muted">还没有回复，来聊聊你的想法吧。</p>';
   window.dispatchEvent(new Event('foamlab:messages'));
  }
  async function loadPage(){
   if(loading)return;loading=true;
   try{const page=lab.check(await lab.client.from('foamlab_messages').select('*').eq(key,id).eq('status','visible').order('created_at').order('id').range(offset,offset+199));if(!live)return;offset+=page.length;const known=new Set(rows.map(r=>r.id));rows.push(...page.filter(r=>!known.has(r.id)));rows.sort((a,b)=>a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id));await render();more.hidden=page.length<200;}finally{loading=false;}
  }
  async function locate(){
   const target=location.hash.match(/^#comment-([a-zA-Z0-9-]+)$/)?.[1];if(!target||!live)return;
   if(!rows.some(r=>r.id===target)){const row=lab.check(await lab.client.from('foamlab_messages').select('*').eq(key,id).eq('status','visible').eq('id',target).maybeSingle());if(!row||!live)return;rows.push(row);await render();}
   if(!live)return;const node=document.getElementById('comment-'+target);node?.scrollIntoView({block:'center',behavior:'instant'});node?.focus({preventScroll:true});
  }
  const onHash=()=>void locate().catch(()=>{});addEventListener('hashchange',onHash);mounts.set(host,()=>{live=false;removeEventListener('hashchange',onHash);});
  more.onclick=async()=>{more.disabled=true;try{await loadPage();}catch(e){window.foamNotify?.(e.message);}finally{more.disabled=false;}};
  list.onclick=async e=>{
   const edit=e.target.closest('[data-edit-message]');
   if(edit){
    const row=rows.find(r=>r.id===edit.dataset.editMessage),card=edit.closest('.lab-message');
    if(!row||!owns(row))return;
    if(card.querySelector('.lab-message-editor')){card.querySelector('textarea').focus();return;}
    const editor=document.createElement('form');editor.className='lab-message-editor';
    editor.innerHTML='<label class="form-field"><span>编辑我的回复 · 支持 Markdown、TeX 和代码块</span><textarea rows="6" minlength="2" maxlength="30000" required aria-label="编辑我的回复"></textarea></label><div class="admin-actions"><button class="button" type="submit">保存修改</button><button type="button" class="button secondary" data-edit-preview>预览</button><button type="button" class="text-button" data-edit-cancel>取消</button></div><div class="prose lab-preview" hidden></div><p class="form-status" role="status"></p>';
    card.querySelector('[data-message-body]').hidden=true;card.querySelector('.community-post-actions').hidden=true;card.append(editor);
    const input=editor.querySelector('textarea');input.value=row.body;input.focus();
    const close=()=>{editor.remove();card.querySelector('[data-message-body]').hidden=false;card.querySelector('.community-post-actions').hidden=false;edit.focus();};
    editor.querySelector('[data-edit-cancel]').onclick=close;
    editor.querySelector('[data-edit-preview]').onclick=()=>{const preview=editor.querySelector('.lab-preview');preview.innerHTML=lab.markdown(input.value);preview.hidden=!preview.hidden;};
    editor.onsubmit=async event=>{
     event.preventDefault();const button=editor.querySelector('[type=submit]');if(button.disabled)return;
     button.disabled=true;editor.querySelector('[data-edit-cancel]').disabled=true;
     try{
      const body=input.value.trim();if(body.length<2)throw Error('回复至少需要 2 个有效字符。');
      let query=lab.client.from('foamlab_messages').update({body}).eq('id',row.id).eq('author_id',lab.user.id);
      if(row.updated_at)query=query.eq('updated_at',row.updated_at);
      const saved=lab.check(await query.select('*'));
      if(!saved.length)throw Error('回复已被修改、删除或不可编辑。请保留当前文字，刷新后重试。');
      Object.assign(row,saved[0]);card.querySelector('[data-message-body]').innerHTML=lab.markdown(row.body);close();
      for(const quote of list.querySelectorAll('.reply-context'))if(quote.querySelector('a')?.getAttribute('href')==='#comment-'+row.id)quote.querySelector('p').textContent=snippet(row.body);
      window.dispatchEvent(new Event('foamlab:messages'));window.foamNotify?.('回复已更新。');
     }catch(err){editor.querySelector('.form-status').textContent=err.message;}
     finally{button.disabled=false;editor.querySelector('[data-edit-cancel]').disabled=false;}
    };return;
   }
   const reply=e.target.closest('[data-reply-message]');
   if(reply){if(!lab.user){await lab.login();return;}replyTarget=rows.find(r=>r.id===reply.dataset.replyMessage);if(!replyTarget)return;form.querySelector('[data-reply-recipient]').textContent='回复 '+(names[replyTarget.author_id]||'社区成员');form.querySelector('[data-reply-excerpt]').textContent=snippet(replyTarget.body);form.querySelector('.reply-composer-target').hidden=false;form.scrollIntoView({block:'center',behavior:'instant'});form.elements.body.focus({preventScroll:true});return;}
   const del=e.target.closest('[data-delete-message]');if(!del||del.disabled)return;
   const row=rows.find(r=>r.id===del.dataset.deleteMessage);if(!row||!canDelete(row)||!confirm('删除这条回复？'))return;
   del.disabled=true;
   try{
    let query=lab.client.from('foamlab_messages').delete().eq('id',row.id);if(row.updated_at)query=query.eq('updated_at',row.updated_at);
    const removed=lab.check(await query.select('id'));if(!removed.length)throw Error('回复状态已变化或当前账号无权删除，请刷新后重试。');
    rows=rows.filter(r=>r.id!==row.id);references.delete(row.id);offset=Math.max(0,offset-1);del.closest('.lab-message').remove();
    for(const quote of list.querySelectorAll('.reply-context'))if(quote.querySelector('a')?.getAttribute('href')==='#comment-'+row.id)quote.innerHTML='<span>原评论已不可见</span>';
    if(replyTarget?.id===row.id){replyTarget=null;form.querySelector('.reply-composer-target').hidden=true;}
    window.dispatchEvent(new Event('foamlab:activity'));window.foamNotify?.('回复已删除。');
   }catch(err){window.foamNotify?.(err.message);del.disabled=false;}
  };
  if(lab.user&&allowed){
   form.querySelector('[data-cancel-reply]').onclick=()=>{replyTarget=null;form.querySelector('.reply-composer-target').hidden=true;form.elements.body.focus();};
   form.querySelector('[data-preview-reply]').onclick=()=>{const preview=form.querySelector('.lab-preview');preview.innerHTML=lab.markdown(form.elements.body.value);preview.hidden=!preview.hidden;};
   form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;try{
    const body=form.elements.body.value.trim();if(body.length<2)throw Error('回复至少需要 2 个有效字符。');await lab.ensureProfile();
    const posted=lab.check(await lab.client.from('foamlab_messages').insert({...parent,reply_to_id:replyTarget?.id||null,author_id:lab.user.id,body}).select('id').single());
    if(posted?.id)history.replaceState(history.state,'','#comment-'+posted.id);await mount(host,parent,canReply);window.dispatchEvent(new Event('foamlab:activity'));window.foamNotify?.('回复已发布。');
   }catch(err){form.querySelector('.form-status').textContent=err.message;button.disabled=false;}};
  }
  await loadPage();await locate();
 }
 window.FoamReplies={mount};
})();
