'use strict';
window.FoamCMSQuestions=async C=>{
 const {L,UI,run,notice}=C,esc=L.esc,p=C.panel||L.$('#cms-panel'),labels={open:'待解决',resolved:'已解决',closed:'已关闭',hidden:'已隐藏'};
 const categories=['使用问题','网格与几何','数值方法','编程开发','结果与后处理','其他问题'];
 const key=(C.admin?'admin:':'author:')+L.user.id,states=window.FoamCMSQuestionStates||(window.FoamCMSQuestionStates={}),state=states[key]||(states[key]={page:1,q:'',status:'',scope:C.admin?'all':'mine'});
 let rows=[],names={},current=null,baseline='',{page,q,status,scope}=state;const persist=()=>Object.assign(state,{page,q,status,scope});
 const fingerprint=f=>JSON.stringify([...new FormData(f)]),isDirty=()=>!!p.querySelector('#cms-question-form')&&fingerprint(p.querySelector('#cms-question-form'))!==baseline;
 async function discard(){return !isDirty()||await UI.confirmAction({title:'放弃尚未保存的问题修改？',message:current?.title||'新问题',action:'放弃修改'});}
 async function load(){rows=[];for(let start=0;;start+=100){let request=L.client.from('foamlab_threads').select('id,title,category,version,status,author_id,created_at,updated_at,accepted_message_id,pinned');if(!C.admin)request=request.eq('author_id',L.user.id);const batch=L.check(await request.order('created_at',{ascending:false}).order('id').range(start,start+99));rows.push(...batch);if(batch.length<100)break;}names=await L.names(rows.map(r=>r.author_id));}
 function render(){
  current=null;baseline='';p.innerHTML='<div class="cms-toolbar"><div><h2>讨论中心</h2><p>'+(C.admin?'查看所有人的问题，管理解决状态、显示状态与置顶。':'管理自己的问题，补充计算条件并更新解决状态。')+'</p></div><div class="admin-actions"><button class="button secondary" data-question-refresh>刷新</button><button class="button" data-question-new>提出问题</button></div></div>'+(C.admin?'<div class="cms-subtabs"><button data-question-scope="all">全部讨论</button><button data-question-scope="mine">我的问题</button></div>':'')+'<div class="filter-tabs" id="cms-question-tabs">'+[['','全部'],['open','待解决'],['resolved','已解决'],...(C.admin?[['closed','已关闭'],['hidden','已隐藏']]:[])].map(([value,label])=>'<button type="button" data-question-status="'+value+'">'+label+'</button>').join('')+'</div><div class="cms-filters"><input type="search" id="cms-question-search" aria-label="搜索问题" placeholder="搜索问题标题、作者、分类或版本" value="'+esc(q)+'"><select id="cms-question-status" aria-label="问题状态"><option value="">全部状态</option>'+Object.entries(labels).map(([value,name])=>'<option value="'+value+'" '+(value===status?'selected':'')+'>'+name+'</option>').join('')+'</select></div><div id="cms-question-list"></div><div id="cms-question-pager"></div>';
  function list(){
   const scoped=rows.filter(r=>scope!=='mine'||r.author_id===L.user.id),found=scoped.filter(r=>(!status||r.status===status)&&[r.title,r.category,r.version,names[r.author_id]].join(' ').toLowerCase().includes(q.trim().toLowerCase()));page=Math.max(1,Math.min(page,Math.ceil(found.length/25)||1));persist();
   p.querySelectorAll('[data-question-scope]').forEach(b=>{const yes=b.dataset.questionScope===scope;b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes));});
   p.querySelectorAll('[data-question-status]').forEach(b=>{const yes=b.dataset.questionStatus===status;b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes));});p.querySelector('#cms-question-status').value=status;
   p.querySelector('#cms-question-list').innerHTML=found.slice((page-1)*25,page*25).map(r=>'<article class="cms-question-row"><div><strong>'+(r.pinned?'<span class="pill">置顶</span> ':'')+esc(r.title)+'</strong><small>'+esc(names[r.author_id]||'社区成员')+' · '+esc(r.category)+' · '+esc(r.version)+' · 修改于 '+L.dateTime(r.updated_at)+'</small></div><span class="pill">'+labels[r.status]+'</span><div class="cms-row-actions">'+((C.admin||['open','resolved'].includes(r.status))?'<button class="text-button" data-question-edit="'+r.id+'">编辑问题</button>':'')+(r.status!=='hidden'?'<a class="text-link" target="_blank" rel="noopener" href="/community/?topic='+r.id+'">查看问题与回答 ↗</a>':'<small>此问题已隐藏</small>')+(['open','resolved'].includes(r.status)?'<button class="text-button" data-question-action="'+r.id+'" data-op="'+(r.status==='open'?'resolved':'open')+'">'+(r.status==='open'?'标记已解决':'重新打开')+'</button>':'')+(C.admin?'<details class="cms-row-more"><summary>更多操作</summary><div><button class="text-button" data-question-action="'+r.id+'" data-op="'+(r.status==='hidden'?'open':'hidden')+'">'+(r.status==='hidden'?'恢复显示':'隐藏问题')+'</button>'+(r.status!=='hidden'?'<button class="text-button" data-question-action="'+r.id+'" data-op="'+(r.status==='closed'?'open':'closed')+'">'+(r.status==='closed'?'开放回复':'关闭回复')+'</button>':'')+'<button class="text-button" data-question-action="'+r.id+'" data-op="pin">'+(r.pinned?'取消置顶':'置顶')+'</button><button class="text-button danger" data-question-action="'+r.id+'" data-op="delete">永久删除</button></div></details>':'')+'</div></article>').join('')||'<div class="cms-empty">'+(scoped.length?'没有符合条件的问题。':'这里还没有问题。')+'</div>';
   p.querySelector('#cms-question-pager').innerHTML=UI.pager(page,found.length);
  }
  p.querySelector('#cms-question-search').oninput=e=>{q=e.target.value;page=1;list();};
  p.querySelector('#cms-question-status').onchange=e=>{status=e.target.value;page=1;list();};
  p.onclick=e=>{const b=e.target.closest('[data-question-new],[data-question-edit],[data-page],[data-question-status],[data-question-scope],[data-question-refresh],[data-question-action]');if(!b)return;
   if(b.hasAttribute('data-question-status')){status=b.dataset.questionStatus;page=1;list();return;}
   if(b.dataset.questionScope){scope=b.dataset.questionScope;page=1;list();return;}
   if(b.dataset.page){page=Number(b.dataset.page);list();return;}
   run(async()=>{
    if(b.hasAttribute('data-question-refresh')){await load();render();notice('问题列表已更新。');return;}
    if(!b.dataset.questionAction){await edit(b.dataset.questionEdit);return;}
    const row=rows.find(r=>r.id===b.dataset.questionAction),op=b.dataset.op;
    if(!C.admin&&(row.author_id!==L.user.id||!['open','resolved'].includes(row.status)||!['open','resolved'].includes(op)))throw Error('只能调整自己的问题解决状态。');
    const text=op==='pin'?(row.pinned?'取消置顶':'置顶'):({open:'重新打开',resolved:'标记已解决',closed:'关闭回复',hidden:'隐藏问题',delete:'永久删除'})[op];
    if(!await UI.confirmAction({title:text+'？',message:row.title,danger:op==='delete',details:op==='delete'?['问题及全部回答将永久删除，无法恢复。']:op==='hidden'?['公开讨论列表中将不再显示，之后可以恢复。']:op==='closed'?['已有回答保留，暂时停止新增回复。']:[],action:'确认'+text}))return;
    if(op==='delete'){const changed=L.check(await L.client.from('foamlab_threads').delete().eq('id',row.id).eq('updated_at',row.updated_at).select('id'));if(!changed.length)throw Error('问题已在其他页面更新，请刷新后重试。');}
    else if(op==='open'&&row.status==='resolved'&&row.accepted_message_id)L.check(await L.client.rpc('foamlab_accept_answer',{thread_id:row.id,message_id:null}));
    else{let request=L.client.from('foamlab_threads').update(op==='pin'?{pinned:!row.pinned}:{status:op}).eq('id',row.id).eq('updated_at',row.updated_at);if(!C.admin)request=request.eq('author_id',L.user.id);const changed=L.check(await request.select('id'));if(!changed.length)throw Error('问题已在其他页面更新，请刷新后重试。');}
    await load();render();notice('已'+text+'。');
   });
  };list();
 }
 async function edit(id){current=id?L.check(await (C.admin?L.client.from('foamlab_threads').select('*').eq('id',id):L.client.from('foamlab_threads').select('*').eq('id',id).eq('author_id',L.user.id)).single()):null;
  if(current&&!C.admin&&!['open','resolved'].includes(current.status))throw Error('此问题已关闭或隐藏，暂不能编辑。');
  await L.settingsReady;if(!current&&L.settings.discussion_open===false&&!C.admin)throw Error('管理员暂时关闭新建问题，已有问题仍可查看。');
  const v=current||{title:'',version:'v2512',category:'使用问题',status:'open',body:'## 要解决的问题\n\n## 环境与运行命令\n\n## 最小配置与报错日志\n\n## 已尝试的方法\n'};
  p.onclick=null;p.innerHTML='<div class="cms-editor-heading"><div><h2>'+(current?'编辑问题':'提出问题')+'</h2><p>发布到讨论中心，所有人可阅读并回答。</p></div><button type="button" class="text-button" data-question-back>← 返回问题列表</button></div><form id="cms-question-form"><div class="cms-savebar"><button class="button" type="submit">'+(current?'保存修改':'发布问题')+'</button><button class="button secondary" type="button" data-question-preview>预览</button><button class="text-button" type="button" data-question-back>取消</button></div><section class="cms-edit-section"><label class="form-field"><span>问题标题</span><input name="title" required minlength="5" maxlength="180" value="'+esc(v.title)+'"></label><div class="form-grid"><label class="form-field"><span>问题分类</span><select name="category">'+[...new Set([...categories,v.category])].map(x=>'<option '+(v.category===x?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label><label class="form-field"><span>软件版本</span><input name="version" required maxlength="50" value="'+esc(v.version)+'"></label></div><label class="form-field"><span>问题详情 · Markdown、公式与代码</span><textarea name="body" rows="18" required minlength="10" maxlength="40000">'+esc(v.body)+'</textarea></label>'+(current?'<label class="form-field"><span>解决状态</span><select name="status">'+Object.entries(labels).filter(([key])=>C.admin||['open','resolved'].includes(key)).map(([key,label])=>'<option value="'+key+'" '+(v.status===key?'selected':'')+'>'+label+'</option>').join('')+'</select></label>':'')+'<div class="prose lab-preview" hidden></div></section></form>';
  const f=p.querySelector('form');baseline=fingerprint(f);
  p.querySelectorAll('[data-question-back]').forEach(b=>b.onclick=()=>run(async()=>{if(await discard()){await load();render();}}));
  p.querySelector('[data-question-preview]').onclick=()=>{const preview=p.querySelector('.lab-preview');preview.innerHTML=L.markdown(f.elements.body.value);preview.hidden=!preview.hidden;};
  f.onsubmit=e=>{e.preventDefault();run(async()=>{const values=Object.fromEntries(new FormData(f));for(const k of Object.keys(values))values[k]=values[k].trim();if(values.title.length<5||values.body.length<10||!values.version)throw Error('请填写完整的问题标题、详情与软件版本。');await L.ensureProfile();
    let result;
    if(current){let request=L.client.from('foamlab_threads').update(values).eq('id',current.id).eq('updated_at',current.updated_at);if(!C.admin)request=request.eq('author_id',L.user.id);const updated=L.check(await request.select());if(!updated.length)throw Error('问题已在其他页面更新，请保留修改后重新载入。');result=updated[0];}
    else result=L.check(await L.client.from('foamlab_threads').insert({...values,author_id:L.user.id}).select().single());
    const wasEdit=!!current;baseline=fingerprint(f);await load();render();notice(wasEdit?'问题已保存。':'问题已发布，讨论中心已同步更新。');window.dispatchEvent(new Event('foamlab:activity'));
   });};
 }
 await load();render();return {isDirty};
};
