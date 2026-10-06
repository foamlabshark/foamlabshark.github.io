'use strict';
window.FoamCMSQuestions=async C=>{
 const {L,UI,run,notice}=C,esc=L.esc,p=L.$('#cms-panel'),labels={open:'待解决',resolved:'已解决',closed:'已关闭',hidden:'已隐藏'};
 const categories=['使用问题','网格与几何','数值方法','编程开发','结果与后处理','其他问题'];
 let rows=[],current=null,baseline='',page=1,q='',status='';
 const fingerprint=f=>JSON.stringify([...new FormData(f)]),isDirty=()=>!!p.querySelector('#cms-question-form')&&fingerprint(p.querySelector('#cms-question-form'))!==baseline;
 async function discard(){return !isDirty()||await UI.confirmAction({title:'放弃尚未保存的问题修改？',message:current?.title||'新问题',action:'放弃修改'});}
 async function load(){rows=[];for(let start=0;;start+=100){const batch=L.check(await L.client.from('foamlab_threads').select('id,title,category,version,status,author_id,created_at,updated_at,accepted_message_id').eq('author_id',L.user.id).order('created_at',{ascending:false}).order('id').range(start,start+99));rows.push(...batch);if(batch.length<100)break;}}
 function render(){current=null;baseline='';p.innerHTML='<div class="cms-toolbar"><div><h2>讨论中心</h2><p>提出计算中的问题，管理自己已发布的问题与解决状态。技术文章请发布到实践与分享。</p></div><button class="button" data-question-new>提出问题</button></div><div class="cms-filters"><input type="search" id="cms-question-search" aria-label="搜索我的问题" placeholder="搜索问题标题、分类或版本" value="'+esc(q)+'"><select id="cms-question-status" aria-label="问题状态"><option value="">全部状态</option>'+Object.entries(labels).map(([value,name])=>'<option value="'+value+'" '+(value===status?'selected':'')+'>'+name+'</option>').join('')+'</select></div><div id="cms-question-list"></div><div id="cms-question-pager"></div>';
  const found=rows.filter(r=>(!status||r.status===status)&&[r.title,r.category,r.version].join(' ').toLowerCase().includes(q.toLowerCase()));page=Math.max(1,Math.min(page,Math.ceil(found.length/25)||1));
  p.querySelector('#cms-question-list').innerHTML=found.slice((page-1)*25,page*25).map(r=>'<article class="cms-question-row"><div><strong>'+esc(r.title)+'</strong><small>'+esc(r.category)+' · '+esc(r.version)+' · 修改于 '+L.dateTime(r.updated_at)+'</small></div><span class="pill">'+labels[r.status]+'</span><div class="cms-row-actions">'+(['open','resolved'].includes(r.status)?'<button class="text-button" data-question-edit="'+r.id+'">编辑问题</button>':'')+(r.status!=='hidden'?'<a class="text-link" href="/community/?topic='+r.id+'">查看问题与回答 ↗</a>':'<small>管理员已隐藏此问题</small>')+'</div></article>').join('')||'<div class="cms-empty">'+(rows.length?'没有符合条件的问题。':'你还没有提出问题。发布后会同时显示在这里和讨论中心。')+'</div>';
  p.querySelector('#cms-question-pager').innerHTML=UI.pager(page,found.length);
  p.querySelector('#cms-question-search').oninput=e=>{q=e.target.value;page=1;const pos=e.target.selectionStart;render();const input=p.querySelector('#cms-question-search');input.focus();try{input.setSelectionRange(pos,pos);}catch{}};
  p.querySelector('#cms-question-status').onchange=e=>{status=e.target.value;page=1;render();};
  p.onclick=e=>{const b=e.target.closest('[data-question-new],[data-question-edit],[data-page]');if(!b)return;if(b.dataset.page){page=Number(b.dataset.page);render();return;}run(()=>edit(b.dataset.questionEdit));};
 }
 async function edit(id){current=id?L.check(await L.client.from('foamlab_threads').select('*').eq('id',id).eq('author_id',L.user.id).single()):null;
  if(current&&!['open','resolved'].includes(current.status))throw Error('此问题已关闭或隐藏，暂不能编辑。');
  await L.settingsReady;if(!current&&L.settings.discussion_open===false&&!C.admin)throw Error('管理员暂时关闭新建问题，已有问题仍可查看。');
  const v=current||{title:'',version:'v2512',category:'使用问题',status:'open',body:'## 要解决的问题\n\n## 环境与运行命令\n\n## 最小配置与报错日志\n\n## 已尝试的方法\n'};
  p.onclick=null;p.innerHTML='<div class="cms-editor-heading"><div><h2>'+(current?'编辑问题':'提出问题')+'</h2><p>发布到讨论中心，所有人可阅读并回答。</p></div><button type="button" class="text-button" data-question-back>← 返回我的问题</button></div><form id="cms-question-form"><div class="cms-savebar"><button class="button" type="submit">'+(current?'保存修改':'发布问题')+'</button><button class="button secondary" type="button" data-question-preview>预览</button><button class="text-button" type="button" data-question-back>取消</button></div><section class="cms-edit-section"><label class="form-field"><span>问题标题</span><input name="title" required minlength="5" maxlength="180" value="'+esc(v.title)+'"></label><div class="form-grid"><label class="form-field"><span>问题分类</span><select name="category">'+[...new Set([...categories,v.category])].map(x=>'<option '+(v.category===x?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label><label class="form-field"><span>软件版本</span><input name="version" required maxlength="50" value="'+esc(v.version)+'"></label></div><label class="form-field"><span>问题详情 · Markdown、公式与代码</span><textarea name="body" rows="18" required minlength="10" maxlength="40000">'+esc(v.body)+'</textarea></label>'+(current?'<label class="form-field"><span>解决状态</span><select name="status"><option value="open" '+(v.status==='open'?'selected':'')+'>待解决</option><option value="resolved" '+(v.status==='resolved'?'selected':'')+'>已解决</option></select></label>':'')+'<div class="prose lab-preview" hidden></div></section></form>';
  const f=p.querySelector('form');baseline=fingerprint(f);
  p.querySelectorAll('[data-question-back]').forEach(b=>b.onclick=()=>run(async()=>{if(await discard()){await load();render();}}));
  p.querySelector('[data-question-preview]').onclick=()=>{const preview=p.querySelector('.lab-preview');preview.innerHTML=L.markdown(f.elements.body.value);preview.hidden=!preview.hidden;};
  f.onsubmit=e=>{e.preventDefault();run(async()=>{const values=Object.fromEntries(new FormData(f));for(const k of Object.keys(values))values[k]=values[k].trim();if(values.title.length<5||values.body.length<10||!values.version)throw Error('请填写完整的问题标题、详情与软件版本。');await L.ensureProfile();
    let result;
    if(current){const updated=L.check(await L.client.from('foamlab_threads').update(values).eq('id',current.id).eq('author_id',L.user.id).eq('updated_at',current.updated_at).select());if(!updated.length)throw Error('问题已在其他页面更新，请保留修改后重新载入。');result=updated[0];}
    else result=L.check(await L.client.from('foamlab_threads').insert({...values,author_id:L.user.id}).select().single());
    const wasEdit=!!current;baseline=fingerprint(f);await load();render();notice(wasEdit?'问题已保存。':'问题已发布，讨论中心已同步更新。');window.dispatchEvent(new Event('foamlab:activity'));
   });};
 }
 await load();render();return {isDirty};
};
