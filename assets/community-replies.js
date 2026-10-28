'use strict';
(() => {
 const mounts=new WeakMap();
 async function mount(host,parent,canReply=true,options={}){
  mounts.get(host)?.();
  const lab=window.FoamLab,{esc}=lab,[key,id]=Object.entries(parent)[0],postMarkdown=body=>window.FoamCommunityMedia?.render(body)||lab.markdown(body);
  if(key==='thread_id'&&options.threadAuthor)host.dataset.nativeAnswers='true';else delete host.dataset.nativeAnswers;
  host.querySelectorAll('.lab-message-list,.lab-reply-form,.lab-message-more,.lab-message-sort').forEach(n=>n.remove());
  const list=document.createElement('div');list.className='lab-message-list';host.append(list);
  const more=document.createElement('button');more.type='button';more.className='button secondary lab-message-more';more.textContent='加载更多回复';more.hidden=true;host.append(more);
  const form=document.createElement('form');form.className='lab-reply-form';
  const allowed=canReply&&lab.role!=='blocked';
  const owns=row=>!!lab.user&&lab.role!=='blocked'&&row.author_id===lab.user.id;
  const canDelete=owns;
  form.innerHTML=lab.role==='blocked'?'<p class="lab-evidence">此账号的发言权限已停用，仍可阅读公开讨论。</p>':!canReply?'<p class="lab-evidence">此讨论已关闭回复。</p>':!lab.user?'<p>使用 GitHub 账号登录后，可以发表评论和回答问题。</p><button type="button" class="button secondary" data-lab-login>使用 GitHub 登录</button>':'<div class="reply-composer-target" hidden><div><strong data-reply-recipient></strong><p data-reply-excerpt></p></div><button type="button" class="text-button" data-cancel-reply>取消回复</button></div><label class="form-field"><span>公开回复 · 支持 Markdown、TeX 和代码块</span><textarea name="body" rows="6" minlength="1" maxlength="30000" required placeholder="写下你的回复…"></textarea></label><div class="admin-actions"><button class="button" type="submit">发布回复</button><button type="button" class="button secondary" data-preview-reply>预览</button></div><div class="prose lab-preview" hidden></div><p class="form-status" role="status"></p>';
  host.append(form);
  if(lab.user&&allowed)window.FoamCommunityMedia?.mount(form,form.elements.body);
  const PAGE_SIZE=5,ROOT_BATCH=200;
  let names={},replyTarget=null,live=true,renderVersion=0,rootLimit=ROOT_BATCH;
  const records=new Map(),index=new Map(),parents=new Map(),threadRoots=new Map(),children=new Map(),threadStates=new Map();let roots=[];
  const outbox=new Map();let activeSend=null,profileSync=null;
  let order='oldest',acceptedId=options.acceptedId||null,sortVersion=0;const likeCounts=new Map();
  const sortBar=document.createElement('div');sortBar.className='lab-message-sort';
  sortBar.innerHTML='<label>'+(key==='thread_id'?'回答排序':'评论排序')+' <select aria-label="'+(key==='thread_id'?'回答排序':'评论排序')+'"><option value="oldest">最早发布</option><option value="newest">最新发布</option><option value="likes">点赞最多</option></select></label><span role="status" aria-live="polite"></span>';list.before(sortBar);
  const sortControl=sortBar.querySelector('select'),sortStatus=sortBar.querySelector('[role=status]');
  const compare=(a,b)=>Number(b===acceptedId)-Number(a===acceptedId)||(order==='likes'?(likeCounts.get(b)||0)-(likeCounts.get(a)||0):0)||(order==='oldest'?1:-1)*(index.get(a).created_at.localeCompare(index.get(b).created_at))||a.localeCompare(b);
  sortControl.onchange=async()=>{
   const previous=order,next=sortControl.value,version=++sortVersion;sortControl.disabled=true;sortStatus.textContent=next==='likes'?'正在读取点赞数量…':'';
   try{
    if(next==='likes'){const ids=[...index.keys()];for(let i=0;i<ids.length;i+=200){const counts=lab.check(await lab.client.rpc('foamlab_like_counts',{targets:ids.slice(i,i+200).map(id=>({kind:'comment',id}))}));if(!live||version!==sortVersion)return;for(const row of counts||[])likeCounts.set(row.id,Number(row.count)||0);}}
    if(!live||version!==sortVersion)return;order=next;rebuildTree();await render();sortStatus.textContent='';
   }catch(error){order=previous;sortControl.value=previous;sortStatus.textContent=error.message||'排序暂时无法更新，请重试。';}
   finally{if(live&&version===sortVersion)sortControl.disabled=false;}
  };
  const findRow=id=>records.get(id);
  const state=id=>{if(!threadStates.has(id))threadStates.set(id,{expanded:true,page:0});return threadStates.get(id);};
  function rebuildTree(){
   const ordered=[...index.values()].sort((a,b)=>a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id));
   parents.clear();threadRoots.clear();children.clear();roots=[];
   for(const row of ordered)parents.set(row.id,index.has(row.reply_to_id)&&row.reply_to_id!==row.id?row.reply_to_id:null);
   // A nested accepted answer becomes a visible root; stored reply relationships stay unchanged.
   if(index.has(acceptedId))parents.set(acceptedId,null);
   // Break malformed cycles once, keeping every comment reachable.
   const done=new Set();for(const row of ordered){let cursor=row.id;const path=new Set();while(cursor&&!done.has(cursor)){if(path.has(cursor)){parents.set(cursor,null);break;}path.add(cursor);cursor=parents.get(cursor);}for(const id of path)done.add(id);}
   for(const row of ordered){let cursor=row.id;const path=[];while(!threadRoots.has(cursor)&&parents.get(cursor)){path.push(cursor);cursor=parents.get(cursor);}const root=threadRoots.get(cursor)||cursor;threadRoots.set(cursor,root);for(const id of path)threadRoots.set(id,root);if(root===row.id)roots.push(row.id);else{if(!children.has(root))children.set(root,[]);children.get(root).push(row.id);}}
   roots.sort(compare);for(const rows of children.values())rows.sort(compare);
  }
  async function loadIndex(){
   // Only relationship metadata is scanned; full Markdown is fetched for visible pages.
   for(let start=0;live;start+=1000){const page=lab.check(await lab.client.from('foamlab_messages').select('id,reply_to_id,created_at').eq(key,id).eq('status','visible').order('created_at').order('id').range(start,start+999));if(!live)return;for(const row of page)index.set(row.id,row);if(page.length<1000)break;}rebuildTree();
  }
  function visibleIds(){
   const result=[],stack=roots.slice(0,rootLimit).reverse();while(stack.length){const id=stack.pop();result.push(id);const replies=children.get(id)||[],s=state(id);s.page=Math.min(s.page,Math.max(0,Math.ceil(replies.length/PAGE_SIZE)-1));if(s.expanded)stack.push(...replies.slice(s.page*PAGE_SIZE,(s.page+1)*PAGE_SIZE).reverse());}return result;
  }
  function threadControls(id){
   const replies=children.get(id)||[];if(!replies.length)return '';const s=state(id),pages=Math.ceil(replies.length/PAGE_SIZE),target='comment-replies-'+id;
   return '<div class="lab-reply-thread-toolbar"><button type="button" class="text-button lab-reply-toggle" data-toggle-replies="'+esc(id)+'" aria-expanded="'+s.expanded+'" aria-controls="'+esc(target)+'"><span aria-hidden="true">'+(s.expanded?'▾':'▸')+'</span> '+(s.expanded?'收起回复':'展开回复')+' <span class="lab-reply-total">'+replies.length+'</span></button>'+(s.expanded&&pages>1?'<nav class="lab-reply-pager" aria-label="这条评论的回复分页"><button type="button" class="text-button" data-page-replies="'+esc(id)+'" data-page="'+(s.page-1)+'"'+(s.page===0?' disabled':'')+'>上一页</button><span aria-live="polite">'+(s.page+1)+' / '+pages+'</span><button type="button" class="text-button" data-page-replies="'+esc(id)+'" data-page="'+(s.page+1)+'"'+(s.page===pages-1?' disabled':'')+'>下一页</button></nav>':'')+'</div><div id="'+esc(target)+'" class="lab-message-replies" aria-label="这条评论的回复"'+(!s.expanded?' hidden':'')+'></div>';
  }
  function placeComposer(){const card=replyTarget&&document.getElementById('comment-'+replyTarget.id);if(card&&list.contains(card))card.querySelector(':scope > .community-post-actions').after(form);else host.append(form);}
  const snippet=text=>String(text||'').replace(/\s+/g,' ').slice(0,160);
  function messageMarkup(r,delivery=null){
   const target=findRow(r.reply_to_id),quoted=target&&parents.get(target.id);
   const quote=r.reply_to_id?'<div class="reply-context'+(quoted?'':' reply-context-inline')+'"'+(target?' data-quote-id="'+esc(target.id)+'"':'')+'>'+(target?'<a href="#comment-'+esc(target.id)+'">回复 '+esc(names[target.author_id]||'社区成员')+'</a>'+(quoted?'<p>'+esc(snippet(target.body))+'</p>':''):'<span>原评论已不可见</span>')+'</div>':'';
   const pending=delivery&&delivery.status!=='sent';
   const canAccept=key==='thread_id'&&allowed&&lab.user&&lab.user.id===options.threadAuthor&&r.author_id!==options.threadAuthor;
   const actions=pending?'<span class="reply-delivery-status" role="status">'+(delivery.status==='sending'?'发送中…':'尚未确认发布：'+esc(delivery.error||'请重试'))+'</span>'+(delivery.status==='failed'?'<button type="button" class="text-button" data-retry-message="'+esc(r.id)+'"'+(activeSend?' disabled':'')+'>重试发布</button>':''):lab.likeButton('comment',r.id)+(allowed?'<button type="button" class="text-button" data-reply-message="'+esc(r.id)+'">回复</button>':'')+(canAccept?'<button type="button" class="text-button" data-accept-answer="'+esc(r.id)+'">'+(r.id===acceptedId?'取消采纳':'采纳回答')+'</button>':'')+(owns(r)?'<button type="button" class="text-button" data-edit-message="'+esc(r.id)+'">编辑</button>':'')+(canDelete(r)?'<button type="button" class="text-button danger" data-delete-message="'+esc(r.id)+'">删除</button>':'');
   return '<article class="lab-message'+(r.id===acceptedId?' is-accepted':'')+'" id="comment-'+esc(r.id)+'" tabindex="-1" data-message-id="'+esc(r.id)+'" data-author-id="'+esc(r.author_id)+'"'+(pending?' data-delivery="'+delivery.status+'"':'')+'>'+(r.id===acceptedId?'<div class="accepted-answer-badge">✓ 已采纳</div>':'')+'<div class="lab-message-meta community-byline">'+lab.authorMeta(r)+'</div>'+quote+'<div class="prose" data-message-body>'+postMarkdown(r.body)+'</div><div class="community-post-actions">'+actions+'</div>'+threadControls(r.id)+'</article>';
  }
  function paintOutbox(){
   // Local deliveries remain visible under their root even when its older replies are paged/collapsed.
   for(const entry of outbox.values()){
    const existing=list.querySelector('[data-message-id="'+entry.row.id+'"]');
    if(existing&&!existing.hasAttribute('data-delivery')){outbox.delete(entry.row.id);continue;}
    existing?.remove();
    const root=threadRoots.get(entry.row.reply_to_id),card=root&&list.querySelector('[data-message-id="'+root+'"]');let container=list;
    if(card){container=card.querySelector(':scope > .lab-reply-outbox');if(!container){container=document.createElement('div');container.className='lab-message-replies lab-reply-outbox';container.setAttribute('aria-label','刚发布的回复');card.append(container);}}
    else list.querySelector(':scope > .muted')?.remove();
    container.insertAdjacentHTML('beforeend',messageMarkup(entry.row,entry));
   }
   list.querySelectorAll('.lab-reply-outbox:empty').forEach(node=>node.remove());
  }
  async function render(){
   const version=++renderVersion,visible=visibleIds(),needed=[...new Set([...visible,...visible.map(id=>index.get(id)?.reply_to_id).filter(id=>index.has(id))])],missing=needed.filter(id=>!records.has(id));
   for(let start=0;start<missing.length;start+=100){const page=lab.check(await lab.client.from('foamlab_messages').select('*').eq(key,id).eq('status','visible').in('id',missing.slice(start,start+100)));if(!live||version!==renderVersion)return;for(const row of page)records.set(row.id,row);}
   const ordered=visible.map(findRow).filter(Boolean);names=await lab.names(needed.map(findRow).filter(Boolean).map(r=>r.author_id));if(!live||version!==renderVersion)return;
   if(list.contains(form))host.append(form);
   list.innerHTML=ordered.map(r=>messageMarkup(r)).join('')||'<p class="muted">还没有回复，来聊聊你的想法吧。</p>';
   // Nest the existing cards without recursion. Invalid/cyclic references remain readable.
   const cards=new Map([...list.children].filter(n=>n.dataset.messageId).map(n=>[n.dataset.messageId,n]));
   for(const row of ordered){const card=cards.get(row.id),root=threadRoots.get(row.id),parentCard=root!==row.id&&cards.get(root);if(parentCard)parentCard.querySelector(':scope > .lab-message-replies').append(card);}
   paintOutbox();placeComposer();more.hidden=rootLimit>=roots.length;more.textContent='加载更多评论';
   window.dispatchEvent(new Event('foamlab:messages'));
  }
  async function locate(){
   const target=location.hash.match(/^#comment-([a-zA-Z0-9-]+)$/)?.[1];if(!target||!live)return;
   if(!index.has(target))return;
   const root=threadRoots.get(target);if(root!==target){const s=state(root);s.expanded=true;s.page=Math.floor(children.get(root).indexOf(target)/PAGE_SIZE);}
   rootLimit=Math.max(rootLimit,roots.indexOf(root)+1);await render();
   if(!live)return;const node=document.getElementById('comment-'+target);node?.scrollIntoView({block:'center',behavior:'instant'});node?.focus({preventScroll:true});
  }
  const onHash=()=>void locate().catch(()=>{}),onLike=e=>{if(e.detail?.kind!=='comment'||!index.has(e.detail.id))return;likeCounts.set(e.detail.id,e.detail.count);if(order==='likes'){rebuildTree();void render().catch(()=>{});}};
  addEventListener('hashchange',onHash);addEventListener('foamlab:like-change',onLike);mounts.set(host,()=>{live=false;window.FoamCommunityMedia?.mount(form,form.elements.body)?.dispose();removeEventListener('hashchange',onHash);removeEventListener('foamlab:like-change',onLike);});
  more.onclick=async()=>{more.disabled=true;try{rootLimit+=ROOT_BATCH;await render();}catch(e){window.foamNotify?.(e.message);}finally{more.disabled=false;}};
  // Keep WebKit from scrolling a near-edge action between mouse press and release.
  list.addEventListener('mousedown',e=>{const button=e.target.closest('[data-accept-answer]');if(e.button===0&&button&&!button.disabled){e.preventDefault();button.focus({preventScroll:true});}});
  list.onclick=async e=>{
   const accept=e.target.closest('[data-accept-answer]');if(accept){
    if(accept.disabled)return;accept.disabled=true;
    try{const next=accept.dataset.acceptAnswer===acceptedId?null:accept.dataset.acceptAnswer,result=lab.check(await lab.client.rpc('foamlab_accept_answer',{thread_id:id,message_id:next}));if(!live)return;acceptedId=result.accepted_message_id||null;options.onAccept?.(acceptedId);rebuildTree();await render();window.foamNotify?.(acceptedId?'回答已采纳，问题标记为已解决。':'已取消采纳。');}
    catch(error){window.foamNotify?.(error.message);accept.disabled=false;}return;
   }
   const retry=e.target.closest('[data-retry-message]');if(retry){const entry=outbox.get(retry.dataset.retryMessage);if(entry&&!activeSend)void send(entry);return;}
   const toggle=e.target.closest('[data-toggle-replies]'),page=e.target.closest('[data-page-replies]');
   if(toggle||page){const button=toggle||page;if(button.disabled)return;const id=toggle?.dataset.toggleReplies||page.dataset.pageReplies,s=state(id),before={...s},toolbar=button.closest('.lab-reply-thread-toolbar'),top=toolbar.getBoundingClientRect().top;button.disabled=true;if(toggle)s.expanded=!s.expanded;else s.page=Number(page.dataset.page);try{await render();const next=document.querySelector('[data-toggle-replies="'+id+'"]');if(next){scrollBy({top:next.closest('.lab-reply-thread-toolbar').getBoundingClientRect().top-top,behavior:'instant'});next.focus({preventScroll:true});}}catch(err){Object.assign(s,before);button.disabled=false;window.foamNotify?.(err.message);}return;}
   const edit=e.target.closest('[data-edit-message]');
   if(edit){
    const row=findRow(edit.dataset.editMessage),card=edit.closest('.lab-message');
    if(!row||!owns(row))return;
    if(card.querySelector(':scope > .lab-message-editor')){card.querySelector(':scope > .lab-message-editor textarea').focus();return;}
    const editor=document.createElement('form');editor.className='lab-message-editor';
    editor.innerHTML='<label class="form-field"><span>编辑我的回复 · 支持 Markdown、TeX 和代码块</span><textarea rows="6" minlength="1" maxlength="30000" required aria-label="编辑我的回复"></textarea></label><div class="admin-actions"><button class="button" type="submit">保存修改</button><button type="button" class="button secondary" data-edit-preview>预览</button><button type="button" class="text-button" data-edit-cancel>取消</button></div><div class="prose lab-preview" hidden></div><p class="form-status" role="status"></p>';
    card.querySelector('[data-message-body]').hidden=true;card.querySelector('.community-post-actions').hidden=true;card.querySelector('.community-post-actions').after(editor);
    const input=editor.querySelector('textarea');input.value=window.FoamCommunityMedia?.plainEmojis(row.body)||row.body;editor.scrollIntoView({block:'nearest',behavior:'instant'});input.focus({preventScroll:true});
    window.FoamCommunityMedia?.mount(editor,input);
    const close=()=>{window.FoamCommunityMedia?.mount(editor,input)?.dispose();editor.remove();card.querySelector('[data-message-body]').hidden=false;card.querySelector('.community-post-actions').hidden=false;edit.focus({preventScroll:true});};
    editor.querySelector('[data-edit-cancel]').onclick=close;
    editor.querySelector('[data-edit-preview]').onclick=()=>{const preview=editor.querySelector('.lab-preview');preview.innerHTML=postMarkdown(input.value);preview.hidden=!preview.hidden;};
    editor.onsubmit=async event=>{
     event.preventDefault();const button=editor.querySelector('[type=submit]');if(button.disabled)return;
     button.disabled=true;editor.querySelector('[data-edit-cancel]').disabled=true;
     try{
      const body=input.value.trim();if(body.length<1)throw Error('回复至少需要 1 个有效字符。');
      let query=lab.client.from('foamlab_messages').update({body}).eq('id',row.id).eq('author_id',lab.user.id);
      if(row.updated_at)query=query.eq('updated_at',row.updated_at);
      const saved=lab.check(await query.select('*'));
      if(!saved.length)throw Error('回复已被修改、删除或不可编辑。请保留当前文字，刷新后重试。');
      window.FoamCommunityMedia?.commit(editor,saved[0].body);Object.assign(row,saved[0]);card.querySelector('[data-message-body]').innerHTML=postMarkdown(row.body);close();
      for(const quote of list.querySelectorAll('[data-quote-id]'))if(quote.dataset.quoteId===row.id&&quote.querySelector('p'))quote.querySelector('p').textContent=snippet(row.body);
      if(replyTarget?.id===row.id)form.querySelector('[data-reply-excerpt]').textContent=snippet(row.body);
      window.dispatchEvent(new Event('foamlab:messages'));window.foamNotify?.('回复已更新。');
     }catch(err){editor.querySelector('.form-status').textContent=err.message;}
     finally{window.FoamCommunityMedia?.settle(editor);button.disabled=false;editor.querySelector('[data-edit-cancel]').disabled=false;}
    };return;
   }
   const reply=e.target.closest('[data-reply-message]');
   if(reply){if(!lab.user){await lab.login();return;}replyTarget=findRow(reply.dataset.replyMessage);if(!replyTarget)return;form.querySelector('[data-reply-recipient]').textContent='回复 '+(names[replyTarget.author_id]||'社区成员');form.querySelector('[data-reply-excerpt]').textContent=snippet(replyTarget.body);form.querySelector('.reply-composer-target').hidden=false;placeComposer();form.scrollIntoView({block:'center',behavior:'instant'});form.elements.body.focus({preventScroll:true});return;}
   const del=e.target.closest('[data-delete-message]');if(!del||del.disabled)return;
   const row=findRow(del.dataset.deleteMessage);if(!row||!canDelete(row)||!confirm('删除这条回复？'))return;
   del.disabled=true;
   try{
    let query=lab.client.from('foamlab_messages').delete().eq('id',row.id).eq('author_id',lab.user.id);if(row.updated_at)query=query.eq('updated_at',row.updated_at);
    const removed=lab.check(await query.select('id'));if(!removed.length)throw Error('回复状态已变化或当前账号无权删除，请刷新后重试。');
    records.delete(row.id);index.delete(row.id);rebuildTree();
    if(replyTarget?.id===row.id){replyTarget=null;form.querySelector('.reply-composer-target').hidden=true;}
    await render();
    window.dispatchEvent(new Event('foamlab:activity'));window.foamNotify?.('回复已删除。');
   }catch(err){window.foamNotify?.(err.message);del.disabled=false;}
  };
  async function send(entry){
   if(activeSend||!live)return;
   activeSend=entry;entry.status='sending';const button=form.querySelector('[type=submit]'),status=form.querySelector('.form-status');button.disabled=true;status.textContent='发送中…';paintOutbox();
   try{
    if(!allowed||!lab.user||lab.user.id!==entry.row.author_id||lab.role==='blocked')throw Error('当前账号无法发布，请保留文字并重新登录。');
    // Public display-name synchronization is independent of the protected message insert.
    if(!profileSync)profileSync=lab.ensureProfile().catch(()=>{profileSync=null;});
    let posted=null;
    // A previous request may have committed even if its response was lost. Reuse its UUID.
    if(entry.attempted)posted=lab.check(await lab.client.from('foamlab_messages').select('*').eq(key,id).eq('id',entry.row.id).eq('author_id',entry.row.author_id).maybeSingle());
    if(!posted){entry.attempted=true;posted=lab.check(await lab.client.from('foamlab_messages').insert(entry.payload).select('*').single());}
    if(!posted||posted.id!==entry.row.id||posted.status!=='visible')throw Error('回复状态暂时无法确认，请重试。');
    if(!live)return;
    window.FoamCommunityMedia?.commit(form,posted.body);entry.row={...entry.row,...posted};entry.status='sent';records.set(posted.id,entry.row);index.set(posted.id,entry.row);rebuildTree();
    // Do not clear a newer draft or a different reply target while this request was in flight.
    if(form.elements.body.value.trim()===entry.payload.body&&(replyTarget?.id||null)===entry.payload.reply_to_id){form.elements.body.value='';replyTarget=null;form.querySelector('.reply-composer-target').hidden=true;form.querySelector('.lab-preview').hidden=true;placeComposer();}
    paintOutbox();status.textContent='回复已发布。';history.replaceState(history.state,'','#comment-'+posted.id);
    const root=threadRoots.get(posted.id);rootLimit=Math.max(rootLimit,roots.indexOf(root)+1);
    if(root!==posted.id){const s=state(root);s.expanded=true;s.page=Math.floor(children.get(root).indexOf(posted.id)/PAGE_SIZE);}
    // Refresh only the displayed page from cached rows and the insert response; never remount the conversation.
    void render().catch(()=>{if(live)window.foamNotify?.('回复已发布，其他评论暂时未能刷新。');});
    window.dispatchEvent(new Event('foamlab:messages'));window.dispatchEvent(new Event('foamlab:activity'));window.foamNotify?.('回复已发布。');
   }catch(err){if(live){entry.status='failed';entry.error=err.message||'网络异常，请重试';status.textContent=entry.error;}}
   finally{activeSend=null;window.FoamCommunityMedia?.settle(form);if(live){button.disabled=false;paintOutbox();}}
  }
  if(lab.user&&allowed){
   form.querySelector('[data-cancel-reply]').onclick=()=>{replyTarget=null;form.querySelector('.reply-composer-target').hidden=true;placeComposer();form.scrollIntoView({block:'nearest',behavior:'instant'});form.elements.body.focus({preventScroll:true});};
   form.querySelector('[data-preview-reply]').onclick=()=>{const preview=form.querySelector('.lab-preview');preview.innerHTML=postMarkdown(form.elements.body.value);preview.hidden=!preview.hidden;};
   form.onsubmit=e=>{e.preventDefault();if(activeSend)return;
    const body=form.elements.body.value.trim(),reply_to_id=replyTarget?.id||null;
    if(body.length<1||body.length>30000){form.querySelector('.form-status').textContent='回复需要 1 至 30000 个有效字符。';return;}
    let entry=[...outbox.values()].find(item=>item.status==='failed'&&item.payload.body===body&&item.payload.reply_to_id===reply_to_id);
    if(!entry){const payload={...parent,id:crypto.randomUUID(),reply_to_id,author_id:lab.user.id,body};entry={payload,row:{...payload,created_at:new Date().toISOString(),author_name:window.foamAuth?.profile?.display_name||lab.user.user_metadata?.user_name||'我'},status:'sending',attempted:false};outbox.set(payload.id,entry);}
    void send(entry);
   };
  }
  await loadIndex();await render();await locate();
 }
 window.FoamReplies={mount};
})();
