'use strict';
window.FoamCMSModeration=async C=>{
 if(!C.admin)throw Error('评论与回复由管理员管理。');
 const {L,run,notice,all,UI,admin}=C,esc=L.esc,p=C.panel||L.$('#cms-panel');
 let threads=[],messages=[],content=[],names={},mode=C.mode==='replies'?'replies':'comments',q='',status='',page=1;
 const states={visible:'公开',hidden:'已隐藏'};
 async function load(){[threads,messages,content]=await Promise.all([all('foamlab_threads','id,title,status'),all('foamlab_messages'),all('foamlab_content','id,slug,title,status,kind')]);threads.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));messages.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));names=await L.names([...new Set(messages.map(r=>r.author_id))]);}
 const source=r=>r.thread_id?threads.find(t=>t.id===r.thread_id):content.find(c=>c.id===r.content_id);
 const link=r=>r.thread_id?'/community/?topic='+r.thread_id:r.content_id?'/read/?slug='+encodeURIComponent(source(r)?.slug||''):'/community/';
 p.innerHTML='<div class="cms-toolbar"><div><h2>讨论中心</h2><p>按作者、正文或来源查找；隐藏内容可以恢复。</p></div><button class="button secondary" id="cms-moderation-refresh">刷新</button></div>'+(!C.discussion?'<div class="cms-subtabs">'+[['comments','文章评论'],['replies','讨论回复']].map(([id,label])=>'<button data-moderation-tab="'+id+'" class="'+(id===mode?'selected':'')+'">'+label+'</button>').join('')+'</div>':'')+'<div class="cms-filters"><input type="search" id="cms-moderation-search" placeholder="搜索作者、正文或来源标题" aria-label="搜索评论与讨论"><select id="cms-moderation-status" aria-label="显示状态"></select></div><div id="cms-moderation-list"></div><div id="cms-moderation-pager"></div>';
 function filters(){L.$('#cms-moderation-status').innerHTML='<option value="">全部状态</option>'+Object.entries(states).map(([s,label])=>'<option value="'+s+'">'+label+'</option>').join('');status='';}
 function render(){
  const target=messages.filter(r=>mode==='comments'?r.content_id:r.thread_id);
  const shown=target.filter(r=>(!status||r.status===status)&&[r.title,r.body,names[r.author_id],source(r)?.title].join(' ').toLowerCase().includes(q));page=Math.max(1,Math.min(page,Math.ceil(shown.length/25)||1));
  L.$('#cms-moderation-list').innerHTML=shown.slice((page-1)*25,page*25).map(r=>'<article class="cms-moderation-card" data-moderation-id="'+r.id+'"><header><div><h3>'+esc(names[r.author_id]||'社区成员')+'</h3><p class="cms-muted">'+'发布于 '+L.date(r.created_at)+(r.updated_at?' · 修改于 '+L.date(r.updated_at):'')+'</p></div><span class="pill">'+esc(states[r.status])+(r.pinned?' · 置顶':'')+'</span></header>'+('<p class="cms-source">来自：<a target="_blank" rel="noopener" href="'+link(r)+'">'+esc(source(r)?.title||'原内容已移除')+' ↗</a></p>')+'<details><summary>查看全文</summary><div class="prose">'+L.markdown(r.body)+'</div></details><p class="cms-muted">'+esc(String(r.body).replace(/\s+/g,' ').slice(0,160))+(r.body.length>160?'…':'')+'</p><div class="admin-actions"><a class="text-link" target="_blank" rel="noopener" href="'+link(r)+'">查看原页面 ↗</a><button class="text-button" data-moderate="'+r.id+'" data-op="'+(r.status==='hidden'?'restore':'hide')+'">'+(r.status==='hidden'?'恢复显示':'隐藏')+'</button>'+('<button class="text-button danger" data-moderate="'+r.id+'" data-op="delete">永久删除</button>')+'</div></article>').join('')||'<div class="cms-empty">暂无符合条件的'+({replies:'回复',comments:'评论'})[mode]+'。</div>';
  L.$('#cms-moderation-pager').innerHTML=UI.pager(page,shown.length);
 }
 await load();filters();render();
 p.querySelectorAll('[data-moderation-tab]').forEach(b=>b.onclick=()=>{mode=b.dataset.moderationTab;page=1;filters();p.querySelectorAll('[data-moderation-tab]').forEach(x=>x.classList.toggle('selected',x===b));render();});
 L.$('#cms-moderation-search').oninput=e=>{q=e.target.value.toLowerCase();page=1;render();};L.$('#cms-moderation-status').onchange=e=>{status=e.target.value;page=1;render();};
 L.$('#cms-moderation-pager').onclick=e=>{const b=e.target.closest('[data-page]');if(b){page=Number(b.dataset.page);render();}};
 L.$('#cms-moderation-refresh').onclick=()=>run(async()=>{await load();render();notice('评论与讨论已更新。');});
 L.$('#cms-moderation-list').onclick=e=>{const b=e.target.closest('[data-moderate]');if(!b)return;run(async()=>{
  const table='foamlab_messages',r=messages.find(x=>x.id===b.dataset.moderate),op=b.dataset.op;
  if(!['hide','restore','delete'].includes(op))throw Error('无效的评论操作。');const labels={hide:'隐藏',restore:'恢复显示',delete:'永久删除'};
  const details=[names[r.author_id]||'社区成员','来自：'+(source(r)?.title||'原内容已移除')];
  if(op==='delete')details.push('这条发言将被删除，无法恢复。');
  if(op==='hide')details.push('读者将看不到这条内容；之后可以恢复显示。');
  if(!await UI.confirmAction({title:labels[op]+'？',message:String(r.body).slice(0,100),details,action:'确认'+labels[op],danger:op==='delete'}))return;
  let query=L.client.from(table);if(op==='delete')query=query.delete();else query=query.update({status:op==='hide'?'hidden':'visible'});
  query=query.eq('id',r.id).eq('status',r.status);if(r.updated_at)query=query.eq('updated_at',r.updated_at);
  const changed=L.check(await query.select('id'));if(!changed.length)throw Error('这条内容已发生变化，请刷新后重试。');await load();render();notice('已'+labels[op]+'。');
 });};
};
