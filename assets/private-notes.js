'use strict';
(() => {
 const $=(s,r=document)=>r.querySelector(s),esc=s=>window.FoamLab.esc(s);
 const TABLE='foamlab_private_notes',KEY='foamlab-private-notes:';
 const standalone=location.pathname==='/notes/';
 const fields=['title','body','page_url','page_title','anchor_id','anchor_text','anchor_offset','scroll_ratio'];
 let uid=null,note=null,base=null,dirty=false,serial=0,task=null,conflict=false,loadToken=0;
 let host=null,timer,previewTimer,rect=null,open=false,rows=[],listToken=0,listPage=0,more=false,listQuery='';
 let pickerToken=0,pickerPage=0,pickerRows=[],pickerTimer;
 const client=()=>window.foamAuth?.client,identity=()=>window.foamAuth?.user?.id;
 const payload=n=>Object.fromEntries(fields.map(k=>[k,n[k]]));
 const same=(a,b)=>!!a&&!!b&&JSON.stringify(payload(a))===JSON.stringify(payload(b));
 const check=r=>{if(r.error)throw Error(r.error.message);return r.data;};
 const count=s=>Array.from(s.replace(/\s/g,'')).length;
 function safePage(raw){try{const u=new URL(raw,location.origin);return u.origin===location.origin&&/^\/(?![\/\\])/.test(u.pathname)?u.pathname+u.search:'';}catch{return '';}}
 function sourceWindow(){try{if(standalone&&opener&&!opener.closed&&opener.location.origin===location.origin)return opener;}catch{}return window;}
 function pageInfo(){
  const w=sourceWindow(),d=w.document,u=new URL(w.location.href);
  u.searchParams.delete('note');u.hash='';
  const headings=[...d.querySelectorAll('#live-article .prose h2[id],#live-article .prose h3[id],main .article .prose h2[id],main .article .prose h3[id]')];
  const heading=[...headings].reverse().find(h=>h.getBoundingClientRect().top<=120)||null;
  return {page_url:safePage(u.href)||'/',page_title:(d.querySelector('#live-article h1,main h1')?.textContent||d.title.replace(/ · FoamLab$/,'')).trim().slice(0,300),
   anchor_id:heading?.id||'',anchor_text:heading?.textContent.trim().slice(0,300)||'',
   anchor_offset:heading?70-heading.getBoundingClientRect().top:0,
   scroll_ratio:Math.min(1,Math.max(0,w.scrollY/Math.max(1,d.documentElement.scrollHeight-w.innerHeight)))};
 }
 function remember(){
  if(!uid)return;
  try{sessionStorage.setItem(KEY+uid,JSON.stringify({note,base,dirty,open,rect,conflict}));}
  catch{status('浏览器未能保留草稿，请保存到云端或下载 Markdown。',true);}
 }
 function status(message,error=false){if(!host)return;const el=$('[data-note-status]',host);el.textContent=message;el.classList.toggle('is-error',error);}
 function place(){
  if(!host||standalone)return;
  const w=Math.min(rect?.w||480,innerWidth-16),h=Math.min(rect?.h||600,innerHeight-24);
  const x=Math.max(8,Math.min(rect?.x??innerWidth-w-24,innerWidth-w-8));
  const y=Math.max(8,Math.min(rect?.y??Math.max(16,(innerHeight-h)/2),innerHeight-h-8));
  Object.assign(host.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});
  rect={x,y,w,h};
 }
 function build(){
  if(host)return;
  host=document.createElement('section');host.id='private-notebook';host.className='private-notebook'+(standalone?' is-standalone':'');
  host.setAttribute('role','dialog');host.setAttribute('aria-modal','false');host.setAttribute('aria-labelledby','private-note-heading');host.hidden=true;
  host.innerHTML='<header class="private-note-header" tabindex="0" aria-label="拖动笔记窗口；方向键移动"><strong id="private-note-heading">我的笔记 <span>仅自己可见</span></strong><div><button type="button" data-note-popout aria-label="在独立窗口打开笔记" title="独立窗口">↗</button><button type="button" data-note-close aria-label="关闭笔记窗口">×</button></div></header>'+
   '<div class="private-note-picker" hidden aria-labelledby="private-note-picker-heading"><div class="private-note-picker-heading"><h2 id="private-note-picker-heading">打开笔记</h2><button type="button" data-note-picker-back>返回笔记</button></div><label><span class="sr-only">查找已有笔记</span><input type="search" data-note-picker-query maxlength="120" placeholder="按标题查找笔记"></label><p data-note-picker-status role="status"></p><div class="private-note-picker-list"></div><div class="private-note-picker-footer"><button type="button" data-note-picker-new>新建笔记</button><button type="button" data-note-picker-more hidden>加载更多</button></div></div>'+
   '<div class="private-note-form"><label class="private-note-title"><span class="sr-only">笔记标题</span><input data-note-title maxlength="160" placeholder="笔记标题"></label>'+
   '<details class="private-note-location"><summary>关联位置：<span data-note-location></span></summary><a data-note-link>返回阅读位置 →</a><div class="private-note-location-actions"><button type="button" data-note-capture>更新为当前阅读位置</button><button type="button" data-note-headings>选择当前页面章节</button></div><label>章节<select data-note-anchor><option value="">按阅读进度定位</option></select></label><label>阅读进度 <output data-note-percent></output><input data-note-ratio type="range" min="0" max="1000"></label></details>'+
   '<div class="private-note-toolbar"><div role="tablist" aria-label="笔记视图"><button role="tab" aria-selected="true" data-note-mode="edit">编辑</button><button role="tab" aria-selected="false" data-note-mode="preview">预览</button></div><button type="button" data-note-formula title="插入 LaTeX 公式">公式</button><button type="button" data-note-download title="下载 Markdown">下载 .md</button></div>'+
   '<textarea data-note-body aria-label="Markdown 笔记正文" maxlength="100000" placeholder="写下推导、疑问或计算记录。支持 Markdown，行内公式使用 $...$，独立公式使用 \\[...\\]。"></textarea><div class="private-note-preview prose" data-note-preview hidden role="tabpanel" aria-label="笔记预览"></div>'+
   '<div class="private-note-conflict" hidden><p>云端内容已变化，当前草稿已保留。可另存为新笔记，或载入云端版本。</p><button type="button" data-note-copy>另存为新笔记</button> <button type="button" data-note-reload>载入云端版本</button></div>'+
   '<footer><div><span data-note-count>0 字</span><span data-note-status role="status">尚未填写</span></div><div><a href="/account/#notes" data-note-manage>管理笔记</a><button type="button" data-note-open>打开笔记</button><button type="button" data-note-new>新建</button><button type="button" class="button" data-note-save>保存</button></div></footer></div><span class="private-note-resize" aria-hidden="true"></span>';
  document.body.append(host);
  $('[data-note-popout]',host).hidden=standalone;
  if(standalone)$('[data-note-manage]',host).target='_blank';
  const header=$('.private-note-header',host);let drag=null;
  if(standalone){header.removeAttribute('tabindex');header.setAttribute('aria-label','独立笔记窗口');}
  function start(e,resize){if(e.button!==0||(!resize&&e.target.closest('button'))||standalone)return;e.preventDefault();const r=host.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,r,resize,target:e.currentTarget};drag.target.setPointerCapture(e.pointerId);}
  function move(e){if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;rect=drag.resize?{x:drag.r.x,y:drag.r.y,w:Math.max(320,drag.r.width+dx),h:Math.max(360,drag.r.height+dy)}:{x:drag.r.x+dx,y:drag.r.y+dy,w:drag.r.width,h:drag.r.height};place();}
  function stop(e){if(!drag||drag.id!==e.pointerId)return;drag=null;remember();}
  for(const [el,resize] of [[header,false],[$('.private-note-resize',host),true]]){el.onpointerdown=e=>start(e,resize);el.onpointermove=move;el.onpointerup=stop;el.onpointercancel=stop;}
  header.onkeydown=e=>{if(e.target!==header||standalone)return;const d={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}[e.key];if(!d)return;e.preventDefault();rect.x+=d[0];rect.y+=d[1];place();remember();};
  host.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();void save();}if(e.key==='Escape'){e.stopPropagation();if(!$('.private-note-picker',host).hidden)hidePicker();else void close();}});
  $('[data-note-title]',host).oninput=e=>{note.title=e.target.value;changed();};
  $('[data-note-body]',host).oninput=e=>{note.body=e.target.value;changed();};
  $('[data-note-capture]',host).onclick=()=>{Object.assign(note,pageInfo());changed();locationView();};
  $('[data-note-headings]',host).onclick=()=>headingsView();
  $('[data-note-anchor]',host).onchange=e=>{
   const w=sourceWindow(),h=w.document.getElementById(e.target.value);if(!h)return;
   Object.assign(note,pageInfo(),{anchor_id:h.id,anchor_text:h.textContent.trim().slice(0,300),anchor_offset:0,
    scroll_ratio:Math.max(0,Math.min(1,(w.scrollY+h.getBoundingClientRect().top-70)/Math.max(1,w.document.documentElement.scrollHeight-w.innerHeight)))});
   changed();locationView();
  };
  $('[data-note-ratio]',host).oninput=e=>{note.scroll_ratio=Number(e.target.value)/1000;note.anchor_id='';note.anchor_text='';note.anchor_offset=0;changed();locationView();};
  $('[data-note-save]',host).onclick=()=>void save();
  $('[data-note-open]',host).onclick=showPicker;
  $('[data-note-picker-back]',host).onclick=()=>hidePicker();
  $('[data-note-picker-new]',host).onclick=()=>{hidePicker(false);void newNote();};
  $('[data-note-picker-query]',host).oninput=()=>{clearTimeout(pickerTimer);pickerToken++;$('.private-note-picker-list',host).replaceChildren();$('[data-note-picker-more]',host).hidden=true;pickerTimer=setTimeout(()=>void loadPicker(),250);};
  $('[data-note-picker-more]',host).onclick=()=>void loadPicker(true);
  $('.private-note-picker-list',host).onclick=e=>{const b=e.target.closest('[data-note-pick]');if(!b)return;hidePicker(false);void show(b.dataset.notePick);};
  $('[data-note-new]',host).onclick=()=>void newNote();
  $('[data-note-close]',host).onclick=()=>void close();
  $('[data-note-popout]',host).onclick=popout;
  $('[data-note-download]',host).onclick=download;
  $('[data-note-copy]',host).onclick=()=>{clearTimeout(timer);note={...payload(note),id:crypto.randomUUID(),title:(note.title.slice(0,150)+'（副本）'),revision:0};base=null;conflict=false;serial++;form();changed();void save();};
  $('[data-note-reload]',host).onclick=async()=>{if(!confirm('载入云端版本会替换窗口内的草稿。是否继续？'))return;try{const r=check(await client().from(TABLE).select('*').eq('id',note.id).single());adopt(r);}catch(e){status(e.message,true);}};
  host.querySelectorAll('[data-note-mode]').forEach(b=>b.onclick=()=>mode(b.dataset.noteMode));
  $('[data-note-formula]',host).onclick=()=>{mode('edit');const t=$('[data-note-body]',host);t.setRangeText('\n\\[\nq = -k \\nabla T\n\\]\n',t.selectionStart,t.selectionEnd,'select');note.body=t.value;changed();t.focus();};
  place();
 }
 function noteLink(n){const u=new URL(safePage(n.page_url)||'/',location.origin);u.searchParams.set('note',n.id);return u.pathname+u.search;}
 function hidePicker(focus=true){
  pickerToken++;clearTimeout(pickerTimer);pickerRows=[];
  if(!host)return;
  $('.private-note-picker',host).hidden=true;$('.private-note-form',host).hidden=false;
  $('.private-note-picker-list',host).replaceChildren();
  if(focus)$('[data-note-open]',host).focus({preventScroll:true});
 }
 function showPicker(){
  $('.private-note-form',host).hidden=true;$('.private-note-picker',host).hidden=false;
  $('[data-note-picker-query]',host).value='';pickerRows=[];
  void loadPicker();$('[data-note-picker-query]',host).focus({preventScroll:true});
 }
 async function loadPicker(append=false){
  if(!uid||!host||$('.private-note-picker',host).hidden)return;
  const token=++pickerToken,who=uid,page=append?pickerPage+1:0;
  const query=$('[data-note-picker-query]',host).value.trim(),message=$('[data-note-picker-status]',host),next=$('[data-note-picker-more]',host);
  message.textContent='正在读取笔记…';next.disabled=true;if(!append){next.hidden=true;$('.private-note-picker-list',host).replaceChildren();}
  try{
   let request=client().from(TABLE).select('id,title,page_title,anchor_text,updated_at').order('updated_at',{ascending:false}).order('id').range(page*30,page*30+30);
   if(query)request=request.ilike('title','%'+query.replace(/[%_\\]/g,'\\$&')+'%');
   const result=check(await request);if(token!==pickerToken||who!==identity())return;
   pickerPage=page;pickerRows=[...new Map((append?pickerRows.concat(result.slice(0,30)):result.slice(0,30)).map(r=>[r.id,r])).values()];
   $('.private-note-picker-list',host).innerHTML=pickerRows.map(r=>'<button type="button" class="private-note-choice" data-note-pick="'+esc(r.id)+'"><strong>'+esc(r.title)+(r.id===note?.id?'<span>当前</span>':'')+'</strong><span>'+esc(r.page_title)+(r.anchor_text?' · '+esc(r.anchor_text):'')+'</span><small>修改于 '+esc(window.FoamLab.dateTime(r.updated_at))+'</small></button>').join('');
   message.textContent=pickerRows.length?'按最近修改排列 · '+pickerRows.length+' 篇':query?'没有符合条件的笔记。':'还没有已保存的笔记。';next.hidden=result.length<=30;
  }catch(e){if(token===pickerToken)message.textContent='笔记读取失败：'+e.message;}
  finally{if(token===pickerToken)next.disabled=false;}
 }
 function locationView(){
  $('[data-note-location]',host).textContent=(note.page_title||'页面')+' · '+(note.anchor_text||Math.round(note.scroll_ratio*100)+'%');
  $('[data-note-link]',host).href=noteLink(note);if(standalone)$('[data-note-link]',host).target='_blank';
  $('[data-note-percent]',host).textContent=Math.round(note.scroll_ratio*100)+'%';
  $('[data-note-ratio]',host).value=Math.round(note.scroll_ratio*1000);
 }
 function headingsView(){
  const select=$('[data-note-anchor]',host),w=sourceWindow();
  const hs=[...w.document.querySelectorAll('#live-article .prose h2[id],#live-article .prose h3[id],main .article .prose h2[id],main .article .prose h3[id]')];
  select.innerHTML='<option value="">请选择章节</option>'+hs.map(h=>'<option value="'+esc(h.id)+'">'+esc(h.textContent.trim())+'</option>').join('');
  select.value=note.anchor_id;select.focus();
 }
 function mode(value){
  const isPreview=value==='preview';
  $('[data-note-body]',host).hidden=isPreview;$('[data-note-preview]',host).hidden=!isPreview;
  host.querySelectorAll('[data-note-mode]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.noteMode===value)));
  if(isPreview)preview();
 }
 function preview(){if(!host||!note)return;const p=$('[data-note-preview]',host);p.innerHTML=window.FoamLab.markdown(note.body||'*尚未填写笔记。*');p.querySelectorAll('a').forEach(a=>{a.target='_blank';a.rel='noopener noreferrer';});}
 function form(){
  build();hidePicker(false);$('[data-note-title]',host).value=note.title;$('[data-note-body]',host).value=note.body;
  $('[data-note-count]',host).textContent=count(note.body)+' 字';
  $('.private-note-conflict',host).hidden=!conflict;
  locationView();mode('edit');status(conflict?'云端版本已更新，草稿保留在此窗口。':dirty?'未同步的草稿':note.revision?'已保存':'输入后自动保存',conflict);
 }
 function changed(){
  dirty=true;serial++;remember();$('[data-note-count]',host).textContent=count(note.body)+' 字';
  status(conflict?'请先处理云端版本差异。':'等待保存…',conflict);
  clearTimeout(timer);if(!conflict)timer=setTimeout(()=>void save(),900);
  clearTimeout(previewTimer);if(!$('[data-note-preview]',host).hidden)previewTimer=setTimeout(preview,200);
 }
 function adopt(r){note=r;base=payload(r);dirty=false;conflict=false;serial++;form();remember();}
 async function save(){
  if(task){await task;return dirty&&!conflict?save():!dirty;}
  if(!dirty)return true;if(conflict)return false;
  if(!uid||identity()!==uid)return false;
  if(!note.title.trim()){status('请填写笔记标题。',true);return false;}
  const who=uid,id=note.id,version=serial,snapshot={...note,title:note.title.trim()},data=payload(snapshot),oldBase=base;
  status('正在保存…');
  const run=async()=>{
   try{
    // Reconcile after navigation or an ambiguous response before writing again.
    const remote=check(await client().from(TABLE).select('*').eq('id',id).maybeSingle());
    if(identity()!==who||uid!==who||note?.id!==id)return false;
    let saved;
    if(remote&&same(remote,snapshot))saved=remote;
    else if(remote&&(!oldBase||!same(remote,oldBase))){
     conflict=true;$('.private-note-conflict',host).hidden=false;
     throw Error('云端版本已更新，当前草稿已保留。');
    }else if(!remote&&snapshot.revision){conflict=true;$('.private-note-conflict',host).hidden=false;throw Error('云端笔记已删除，当前草稿可下载备份。');}
    else if(remote){
     const updated=check(await client().from(TABLE).update(data).eq('id',id).eq('revision',remote.revision).select());
     if(!updated.length){conflict=true;$('.private-note-conflict',host).hidden=false;throw Error('保存时云端版本发生变化，当前草稿已保留。');}saved=updated[0];
    }else saved=check(await client().from(TABLE).insert({id,...data}).select().single());
    if(identity()!==who||uid!==who||note?.id!==id)return false;
    base=payload(saved);note.revision=saved.revision;note.created_at=saved.created_at;note.updated_at=saved.updated_at;
    if(serial===version){dirty=false;note.title=saved.title;$('[data-note-title]',host).value=saved.title;}
    remember();status(dirty?'继续保存修改…':'已保存 '+new Date(saved.updated_at).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}));
    if($('#my-notes'))void loadList(false);
    return true;
   }catch(e){if(who===uid&&note?.id===id){remember();status(e.message||'保存失败，草稿已保留。',true);}return false;}
  };
  const pending=run();task=pending;const result=await pending;if(task===pending)task=null;
  if(who!==uid)return false;
  if(result&&dirty&&!conflict)return save();
  return result;
 }
 async function newNote(){
  if(dirty&&!await save())return;
  const p=pageInfo();note={id:crypto.randomUUID(),title:(p.page_title+' · 阅读笔记').slice(0,160),body:'',...p,revision:0};
  base=null;dirty=false;conflict=false;serial++;form();remember();$('[data-note-body]',host).focus();
 }
 async function show(id){
  await window.foamAuth?.ready;
  if(!identity()){window.foamNotify?.('登录后即可使用私人笔记。');return;}
  if(uid!==identity())await authChanged();
  build();
  const targetId=id||(!dirty&&note?.revision?note.id:null);
  if(targetId&&(note?.id!==targetId||!dirty)){
   if(dirty&&!await save())return;
   const token=++loadToken,who=uid,version=serial;
   try{const r=check(await client().from(TABLE).select('*').eq('id',targetId).maybeSingle());if(token!==loadToken||who!==identity()||version!==serial)return;if(!r){if(id)throw Error('笔记已删除或不属于当前账号。');note=null;base=null;await newNote();}else adopt(r);}
   catch(e){if(!note||(id&&id!==note.id)){window.foamNotify?.(e.message);return;}form();status('暂未读取云端版本，已保留本机笔记。',true);}
  }else if(!note)await newNote();
  open=true;host.hidden=false;place();remember();$('[data-note-title]',host).focus({preventScroll:true});
 }
 async function close(){
  hidePicker(false);
  if(standalone){if(dirty&&!await save())return;open=false;remember();window.close();return;}
  open=false;host.hidden=true;remember();void save();
 }
 function popout(){
  hidePicker(false);
  remember();const popup=window.open('/notes/','_blank','popup,width=560,height=740,resizable=yes,scrollbars=yes');
  if(!popup){status('浏览器阻止了独立窗口，请允许弹出窗口后重试。',true);return;}
  // The new window receives this tab's draft; its lifetime is independent.
  popup.focus();open=false;host.hidden=true;remember();
 }
 function download(){
  if(!note)return;const link=location.origin+(safePage(note.page_url)||'/');
  const blob=new Blob(['# '+note.title+'\n\n[阅读位置]('+link+')\n\n'+note.body+'\n'],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=(note.title.replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,100)||'笔记')+'.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function listShell(){
  const el=$('#my-notes');if(!el||el.dataset.ready)return;el.dataset.ready='true';
  el.innerHTML='<div class="section-heading"><div><h2>我的笔记</h2><p class="muted">仅自己可见。点击标题返回关联的页面位置。</p></div><button class="button" data-new-private-note>新建笔记</button></div><div class="private-note-filters"><label>查找笔记<input type="search" maxlength="120" data-notes-search placeholder="按标题查找"></label><label>排序<select data-notes-order><option value="updated_at">最近修改</option><option value="created_at">最近创建</option><option value="title">标题</option></select></label></div><p data-notes-status role="status"></p><div class="private-note-list"></div><button class="button secondary" data-notes-more hidden>加载更多</button>';
  $('[data-new-private-note]',el).onclick=async()=>{await show();await newNote();};
  let debounce;$('[data-notes-search]',el).oninput=()=>{clearTimeout(debounce);debounce=setTimeout(()=>void loadList(false),250);};
  $('[data-notes-order]',el).onchange=()=>void loadList(false);
  $('[data-notes-more]',el).onclick=()=>void loadList(true);
  $('.private-note-list',el).onclick=async e=>{
   const b=e.target.closest('[data-note-edit],[data-note-delete]');if(!b)return;
   const id=b.dataset.noteEdit||b.dataset.noteDelete;if(b.dataset.noteEdit)return show(id);
   const row=rows.find(r=>r.id===id);if(!row||!confirm('删除笔记“'+row.title+'”？删除后无法恢复。'))return;
   b.disabled=true;
   try{
    const deleted=check(await client().from(TABLE).delete().eq('id',id).eq('revision',row.revision).select('id'));
    if(!deleted.length)throw Error('笔记已有新的修改，请刷新后再删除。');
    if(note?.id===id){clearTimeout(timer);note=null;base=null;dirty=false;conflict=false;open=false;if(host)host.hidden=true;remember();}
    await loadList(false);
   }catch(err){$('[data-notes-status]',el).textContent=err.message;b.disabled=false;}
  };
 }
 async function loadList(append=false){
  listShell();const el=$('#my-notes');if(!el)return;
  const statusEl=$('[data-notes-status]',el),target=$('.private-note-list',el);
  if(!uid){target.replaceChildren();statusEl.textContent='登录后管理私人笔记。';$('[data-new-private-note]',el).disabled=true;return;}
  $('[data-new-private-note]',el).disabled=false;
  const token=++listToken,who=uid,page=append?listPage+1:0,query=$('[data-notes-search]',el).value.trim(),order=$('[data-notes-order]',el).value;
  statusEl.textContent='正在读取笔记…';$('[data-notes-more]',el).disabled=true;
  try{
   let request=client().from(TABLE).select('id,title,page_url,page_title,anchor_text,scroll_ratio,word_count,revision,created_at,updated_at').order(order,{ascending:order==='title'}).order('id').range(page*30,page*30+30);
   if(query)request=request.ilike('title','%'+query.replace(/[%_\\]/g,'\\$&')+'%');
   const result=check(await request);if(token!==listToken||who!==identity())return;
   more=result.length>30;listPage=page;rows=append?rows.concat(result.slice(0,30)):result.slice(0,30);listQuery=query;
   target.innerHTML=rows.map(r=>'<article class="private-note-row"><div><a class="private-note-row-title" href="'+esc(noteLink(r))+'">'+esc(r.title)+'</a><p>'+esc(r.page_title)+(r.anchor_text?' · '+esc(r.anchor_text):' · '+Math.round(r.scroll_ratio*100)+'%')+'</p><div class="private-note-dates"><span>'+r.word_count+' 字</span><span>创建 '+esc(window.FoamLab.dateTime(r.created_at))+'</span><span>修改 '+esc(window.FoamLab.dateTime(r.updated_at))+'</span></div></div><div class="private-note-actions"><button type="button" data-note-edit="'+r.id+'">编辑</button><button type="button" data-note-delete="'+r.id+'">删除</button></div></article>').join('');
   statusEl.textContent=rows.length?'已显示 '+rows.length+' 篇笔记':query?'没有符合条件的笔记。':'还没有笔记。阅读时双击熊猫即可记录。';
   $('[data-notes-more]',el).hidden=!more;
  }catch(e){if(token===listToken)statusEl.textContent='笔记读取失败：'+e.message;}
  finally{if(token===listToken)$('[data-notes-more]',el).disabled=false;}
 }
 let restoreDone=false;
 async function restorePosition(){
  if(restoreDone||!uid)return;const id=new URLSearchParams(location.search).get('note');
  if(!/^[a-f0-9-]{36}$/i.test(id||''))return;
  const reader=$('#live-article');
  if(reader&&!reader.querySelector('.prose:not(.lab-preview)'))return;
  restoreDone=true;const who=uid;
  try{
   const n=check(await client().from(TABLE).select('page_url,anchor_id,anchor_offset,scroll_ratio').eq('id',id).maybeSingle());
   if(!n||identity()!==who)return;
   const current=new URL(location.href);current.searchParams.delete('note');
   if(safePage(n.page_url)!==current.pathname+current.search)return;
   const images=[...document.querySelectorAll('main img')];await Promise.race([Promise.all(images.filter(im=>im.loading!=='lazy').map(im=>im.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,700))]);
   await new Promise(requestAnimationFrame);
   const h=n.anchor_id?document.getElementById(n.anchor_id):null;
   const y=h?scrollY+h.getBoundingClientRect().top+n.anchor_offset-70:n.scroll_ratio*Math.max(0,document.documentElement.scrollHeight-innerHeight);
   scrollTo({top:Math.max(0,y),behavior:'instant'});
  }catch{window.foamNotify?.('暂时无法恢复笔记位置，可稍后重试。');}
 }
 async function authChanged(){
  await window.foamAuth?.ready;
  const next=identity()||'';if(next===uid)return;
  if(uid){try{sessionStorage.removeItem(KEY+uid);}catch{}}
  uid=next;loadToken++;listToken++;pickerToken++;clearTimeout(pickerTimer);pickerRows=[];clearTimeout(timer);note=null;base=null;dirty=false;conflict=false;open=false;rows=[];task=null;restoreDone=false;
  if(host){host.remove();host=null;}
  if(uid){
   try{const cached=JSON.parse(sessionStorage.getItem(KEY+uid)||'null');if(cached?.note&&safePage(cached.note.page_url)){({note,base,dirty,rect}=cached);open=cached.open===true;conflict=cached.conflict===true;}}
   catch{}
   if(note){form();host.hidden=!(open||standalone);place();if(dirty&&!conflict)timer=setTimeout(()=>void save(),500);}
   if(standalone){await show();$('.notebook-standalone-hint')?.remove();}
   void restorePosition();
  }
  void loadList(false);
 }
 window.FoamPrivateNotes={open:show,capture:pageInfo};
 window.addEventListener('foam-auth-change',()=>void authChanged());
 document.addEventListener('foamlab:content-ready',()=>{setTimeout(()=>void restorePosition(),60);});
 window.addEventListener('resize',()=>{place();remember();});
 window.addEventListener('pagehide',remember);
 window.addEventListener('beforeunload',e=>{remember();if(standalone&&dirty){e.preventDefault();e.returnValue='';}});
 window.addEventListener('online',()=>{if(dirty&&!conflict)void save();});
 window.addEventListener('foamlab:account-tab',e=>{if(e.detail?.key==='notes')void loadList(false);});
 document.addEventListener('click',e=>{if(e.target.closest('[data-open-private-notes]'))void show();});
 void authChanged();
})();
