'use strict';
window.FoamCMSOperations=async C=>{
 if(!C.admin)throw Error('维护日志仅供管理员查看。');
 const {L,UI}=C,esc=L.esc,panel=document.querySelector('#cms-panel'),labels={create:'新增',update:'修改',publish:'发布',archive:'下架',trash:'移入回收站',restore:'恢复',delete:'永久删除',move:'调整位置',snapshot:'首次同步基线'};
 panel.innerHTML='<section class="cms-operations"><div class="cms-toolbar"><div><h2>维护日志</h2><p>保留最近一个月的页面操作及评论、留言删除记录。可展开删除记录核查原文，过期日志自动清理。</p></div><button class="button secondary" data-operations-refresh>刷新</button></div><div class="cms-filters"><select aria-label="操作对象" data-operation-entity><option value="">全部对象</option><option value="content">文章</option><option value="section">栏目</option><option value="comment">评论</option><option value="guestbook">留言板</option></select><select aria-label="操作类型" data-operation-kind><option value="">全部操作</option>'+Object.entries(labels).filter(([k])=>k!=='snapshot').map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join('')+'</select></div><p class="muted" role="status" data-operation-state>正在读取维护日志…</p><div class="table-scroll" data-operation-list></div><div data-operation-pager></div><details class="cms-member-help"><summary>本地同步与发布</summary><p>双击本地工程中的“发布学习网站.cmd”，程序会先读取网站的最新内容状态，更新文章、栏目和检索目录，再检查并发布网站。也可以双击“同步网站内容.cmd”单独同步。</p><p>本地与网站同时修改同一篇文章时，程序会保留两份内容并暂停发布，比较后再继续。下架、回收站和删除操作同步对应的内容状态；原本地文件保存在同步备份中。</p></details></section>';
 const filters=panel.querySelector('.cms-filters');
 filters.classList.add('cms-operation-filters');
 filters.insertAdjacentHTML('afterbegin','<label><span>操作者</span><input type="search" maxlength="120" placeholder="输入操作者名称" data-operation-actor></label><label><span>开始日期</span><input type="date" data-operation-start></label><label><span>结束日期</span><input type="date" data-operation-end></label>');
 for(const [selector,label] of [['[data-operation-entity]','操作对象'],['[data-operation-kind]','操作类型']]){
  const select=filters.querySelector(selector),wrapper=document.createElement('label');
  const caption=document.createElement('span');caption.textContent=label;
  select.before(wrapper);wrapper.append(caption,select);
 }
 filters.insertAdjacentHTML('beforeend','<button class="button secondary" type="button" data-operation-reset>重置筛选</button>');
 panel.querySelector('.cms-operations').insertAdjacentHTML('beforeend','<details class="cms-member-help"><summary>登记本机同步连接</summary><p>新电脑运行本地初始化程序后，将输出的连接信息粘贴到这里。连接只用于读取日志和文章，由当前管理员管理。</p><form data-sync-register><label class="form-field"><span>本机连接信息</span><textarea name="connection" rows="4" maxlength="600" required></textarea></label><button class="button secondary" type="submit">登记连接</button><p role="status" data-sync-register-state></p></form></details>');
 const view=panel.querySelector('.cms-operations'),list=view.querySelector('[data-operation-list]'),state=view.querySelector('[data-operation-state]'),pager=view.querySelector('[data-operation-pager]');let page=1,request=0,latest=null,polling=false,refreshedMinute=-1;
 const snapshots=new Map(),expanded=new Set();
 const actor=view.querySelector('[data-operation-actor]'),start=view.querySelector('[data-operation-start]'),end=view.querySelector('[data-operation-end]');let filterTimer=null;
 const refresh=view.querySelector('[data-operations-refresh]'),actions=document.createElement('div');actions.className='cms-export-actions';refresh.before(actions);actions.append(refresh);actions.insertAdjacentHTML('afterbegin','<button type="button" class="button secondary" data-operations-export title="导出当前筛选条件下的全部维护日志">导出 Excel</button>');
 view.querySelector('.cms-toolbar').insertAdjacentHTML('afterend','<p class="cms-export-status" role="status" aria-live="polite" data-export-status></p>');
 const clearExportStatus=()=>{if(!view.querySelector('[data-operations-export]').disabled)view.querySelector('[data-export-status]').textContent='';};
 filters.addEventListener('input',clearExportStatus);filters.addEventListener('change',clearExportStatus);view.addEventListener('click',e=>{if(e.target.closest('[data-operation-reset],[data-operations-refresh]'))clearExportStatus();});
 const columns='id,entity,record_id,operation,actor_id,actor_name,actor_role,title,slug,previous_status,current_status,changed_fields,created_at';
 const currentFilters=()=>({entity:view.querySelector('[data-operation-entity]').value,operation:view.querySelector('[data-operation-kind]').value,name:actor.value.trim(),start:start.value,end:end.value});
 function validDates(){return start.validity.valid&&end.validity.valid&&!(start.value&&end.value&&start.value>end.value);}
 function filteredQuery(filter){
  let query=L.client.from('foamlab_content_operations').select(columns,{count:'exact'}).neq('operation','snapshot');
  if(filter.entity)query=query.eq('entity',filter.entity);if(filter.operation)query=query.eq('operation',filter.operation);
  if(filter.name)query=query.ilike('actor_name','%'+filter.name.replace(/[\\%_*]/g,'\\$&')+'%');
  if(filter.start)query=query.gte('created_at',dateBoundary(filter.start));if(filter.end)query=query.lt('created_at',dateBoundary(filter.end,true));
  return query;
 }
 view.querySelector('[data-operations-export]').onclick=e=>{
  if(!validDates()){C.notice('请选择有效的日期范围，开始日期不能晚于结束日期。',true);return;}
  const filter=currentFilters();
  void window.FoamCMSExcel.run(C,view,e.currentTarget,async({progress,assertActive})=>{
   const all=[],seen=new Set();let total=null,cursor=null;
   for(;;){
    assertActive();let query=filteredQuery(filter);if(cursor!==null)query=query.lt('id',cursor);
    const response=await query.order('id',{ascending:false}).range(0,249),rows=L.check(response);assertActive();
    if(!Array.isArray(rows)||(total===null&&!Number.isSafeInteger(response.count)))throw Error('维护日志读取失败，请重试。');
    if(total===null)total=response.count;
    for(const row of rows){const id=String(row.id);if(!row.id||seen.has(id))throw Error('维护日志在导出期间发生变化，请重试。');seen.add(id);all.push(row);}
    progress('已读取 '+all.length+' / '+total+' 条操作记录…');
    if(all.length===total)break;
    if(!rows.length||all.length>total)throw Error('维护日志读取不完整，请刷新后重试。');
    // IDs increase with new operations. A cursor prevents new log entries from shifting later pages.
    cursor=rows.at(-1).id;
   }
   const deleted=all.filter(r=>['comment','guestbook'].includes(r.entity)),originals=new Map();
   for(let offset=0;offset<deleted.length;offset+=100){
    assertActive();progress('正在读取已删除评论和留言的原文…');
    const rows=L.check(await L.client.from('foamlab_content_operations').select('id,snapshot').in('id',deleted.slice(offset,offset+100).map(r=>r.id)));assertActive();
    for(const row of rows)if(row.snapshot)originals.set(String(row.id),row.snapshot);
   }
   if(deleted.some(row=>!originals.has(String(row.id))))throw Error('部分删除记录已过期或无法读取，请刷新后重试。');
   const entities={content:'文章',section:'栏目',comment:'评论',guestbook:'留言板'},roles={admin:'管理员',editor:'普通作者',moderator:'普通作者',member:'普通会员',supporter:'充电会员',blocked:'禁止发言与投稿',system:'系统'},statuses={draft:'草稿',published:'已发布',archived:'已下架',trash:'回收站',visible:'可见',hidden:'已隐藏'},fields={page_content:'入口页文字',description:'目录简介',read_access:'阅读权限',title:'标题',body:'正文',summary:'摘要',metadata:'配置与附件',section_ids:'所在栏目',status:'状态',cover_url:'封面',name:'名称',parent_id:'上级栏目',visible:'显示状态',sort_order:'排序'},d=window.FoamCMSExcel.date;
   return {name:'维护日志',columns:[['时间',23,'date'],['操作者',24],['操作者权限',20],['对象类型',14],['对象标题',40],['操作',18],['修改内容',40],['原状态',16],['新状态',16],['页面地址标识',38],['日志 ID',18],['对象 ID',40],['操作者 ID',40],['被删除内容',80],['原作者',24],['原作者 ID',40],['原文发表时间',23,'date'],['原文所在页面',40],['原文页面地址',60]],rows:all.map(r=>{const s=originals.get(String(r.id))||{};return [d(r.created_at),r.actor_name||'',roles[r.actor_role]||r.actor_role||'',entities[r.entity]||r.entity,r.title||'',r.entity==='comment'?'删除评论':r.entity==='guestbook'?'删除留言':labels[r.operation]||r.operation,(r.changed_fields||[]).map(k=>fields[k]||k).join('、'),statuses[r.previous_status]||r.previous_status||'',statuses[r.current_status]||r.current_status||'',r.slug||'',String(r.id),r.record_id||'',r.actor_id||'',s.body||'',s.author_name||'',s.author_id||'',d(s.created_at),s.parent_title||'',s.parent_url||''];}),details:[['操作者筛选',filter.name||'未限制'],['开始日期',filter.start||'未限制'],['结束日期',filter.end||'未限制'],['对象筛选',entities[filter.entity]||'全部对象'],['操作筛选',labels[filter.operation]||'全部操作'],['排序','日志 ID 降序，与页面列表一致'],['导出范围','当前保留的最近一个月日志中，符合点击导出时筛选条件的全部记录；不包含首次同步基线。']]};
  });
 };
 // The table uses local dates; include the entire selected end date, also across DST changes.
 function dateBoundary(value,nextDay=false){const date=new Date(value+'T00:00:00');if(nextDay)date.setDate(date.getDate()+1);return date.toISOString();}
 async function load(){const current=++request;
  if(!view.isConnected)return false;
  if(!validDates()){
   state.textContent='请选择有效的日期范围，开始日期不能晚于结束日期。';list.innerHTML='';pager.innerHTML='';list.inert=false;return false;
  }
  state.textContent='正在读取维护日志…';list.inert=true;try{
  const query=filteredQuery(currentFilters());
  const response=await query.order('id',{ascending:false}).range((page-1)*25,page*25-1),rows=L.check(response);if(current!==request||!view.isConnected)return false;
  const pages=Math.max(1,Math.ceil((response.count??rows.length)/25));if(page>pages){page=pages;return load();}
  state.textContent='最近一个月共 '+(response.count??rows.length)+' 条操作记录';
  list.innerHTML=rows.length?'<table class="cms-member-table"><thead><tr><th>时间</th><th>操作者</th><th>对象</th><th>操作</th><th>修改内容</th></tr></thead><tbody>'+rows.map(r=>'<tr><td data-label="时间">'+esc(new Date(r.created_at).toLocaleString('zh-CN',{hour12:false}))+'</td><td data-label="操作者">'+esc(r.actor_name)+(r.actor_id?'<small>'+esc(r.actor_id)+'</small>':'')+(r.actor_role==='system'?' · 系统':'')+'</td><td data-label="对象">'+esc(({content:'文章',section:'栏目',comment:'评论',guestbook:'留言板'})[r.entity]||r.entity)+' · '+esc(r.title)+'<small>'+esc(r.slug)+'</small></td><td data-label="操作">'+esc(r.entity==='comment'?'删除评论':r.entity==='guestbook'?'删除留言':labels[r.operation]||r.operation)+'</td><td data-label="修改内容">'+esc((r.changed_fields||[]).map(k=>({page_content:'入口页文字',description:'目录简介',read_access:'阅读权限',title:'标题',body:'正文',summary:'摘要',metadata:'配置与附件',section_ids:'所在栏目',status:'状态',cover_url:'封面',name:'名称',parent_id:'上级栏目',visible:'显示状态',sort_order:'排序'})[k]||k).join('、'))+deletionDetails(r)+'</td></tr>').join('')+'</tbody></table>':'<p class="cms-empty">尚无符合条件的操作记录。</p>';
  pager.innerHTML=UI.pager(page,response.count??rows.length,25);for(const el of list.querySelectorAll('[data-deleted-id]'))if(expanded.has(el.dataset.deletedId))el.open=true;return true;
 }catch(e){if(current===request&&view.isConnected){state.textContent=e.message;list.innerHTML='<p class="cms-empty">维护日志暂时无法读取，请刷新重试。</p>';pager.innerHTML='';}return false;}finally{if(current===request)list.inert=false;}}

 function deletionDetails(r){return ['comment','guestbook'].includes(r.entity)?'<details class="cms-deleted-comment" data-deleted-id="'+esc(r.id)+'"><summary>查看删除原文</summary><div data-deleted-body></div></details>':'';}
 function renderSnapshot(host,s){
  host.replaceChildren();const meta=document.createElement('dl');
  for(const [title,value] of [['原作者',s.author_name||'网站成员'],['作者标识',s.author_id],['评论标识',s.id],['发表时间',s.created_at?new Date(s.created_at).toLocaleString('zh-CN',{hour12:false}):'未知']]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=title;dd.textContent=value||'未知';meta.append(dt,dd);}
  host.append(meta);const parent=document.createElement('p'),url=L.safeURL(s.parent_url||'');parent.textContent='所在页面：';
  if(url&&new URL(url).origin===location.origin){const link=document.createElement('a');link.href=url;link.textContent=s.parent_title||'查看页面';parent.append(link);}else parent.append(document.createTextNode(s.parent_title||'页面已删除'));
  const body=document.createElement('pre');body.textContent=s.body||'（原文为空）';host.append(parent,body);
 }
 list.addEventListener('toggle',async e=>{
  const detail=e.target;if(!detail.matches('[data-deleted-id]'))return;const id=detail.dataset.deletedId;
  if(!detail.open){expanded.delete(id);return;}expanded.add(id);const host=detail.querySelector('[data-deleted-body]');
  if(snapshots.has(id)){renderSnapshot(host,snapshots.get(id));return;}host.textContent='正在读取原文…';
  try{const row=L.check(await L.client.from('foamlab_content_operations').select('snapshot').eq('id',id).single());if(!row?.snapshot)throw Error('记录已过期或无权查看。');snapshots.set(id,row.snapshot);if(host.isConnected)renderSnapshot(host,row.snapshot);}
  catch(error){if(host.isConnected)host.textContent='原文暂时无法读取，请收起后重试。';}
 },true);
 view.querySelector('[data-sync-register]').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('button'),note=form.querySelector('[data-sync-register-state]');button.disabled=true;try{const connection=JSON.parse(form.elements.connection.value);if(connection.project_id!=='nmkforbzmbstasnjxlid'||!connection.client_id||!connection.key_hash)throw Error('请粘贴初始化程序输出的完整连接信息。');L.check(await L.client.rpc('foamlab_register_content_sync_client',{p_client_id:connection.client_id,p_key_hash:connection.key_hash}));form.reset();note.textContent='本机同步连接已登记，可以继续本地发布。';}catch(error){note.textContent=error instanceof SyntaxError?'连接信息不是有效的 JSON，请重新粘贴。':error.message;}finally{button.disabled=false;}};
 function filterChanged(delay=0){clearTimeout(filterTimer);++request;page=1;filterTimer=setTimeout(()=>{filterTimer=null;void load();},delay);}
 filters.querySelectorAll('select,input[type=date]').forEach(e=>e.onchange=()=>filterChanged());
 actor.oninput=()=>filterChanged(300);
 actor.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();filterChanged();}};
 view.querySelector('[data-operation-reset]').onclick=()=>{filters.querySelectorAll('input,select').forEach(e=>e.value='');filterChanged();};
 view.querySelector('[data-operations-refresh]').onclick=()=>{clearTimeout(filterTimer);filterTimer=null;void load();};pager.onclick=e=>{const b=e.target.closest('[data-page]');if(b&&!b.disabled){page=Number(b.dataset.page);void load();}};
 async function refreshIfChanged(){if(polling||filterTimer!==null||document.hidden||!view.isConnected)return;polling=true;try{const rows=L.check(await L.client.from('foamlab_content_operations').select('id').neq('operation','snapshot').order('id',{ascending:false}).limit(1));const id=rows[0]?.id||0;const minute=Math.floor(Date.now()/60000);if((id!==latest||minute!==refreshedMinute)&&!await load())return;latest=id;refreshedMinute=minute;}catch(e){if(latest===null&&view.isConnected){state.textContent=e.message;list.innerHTML='<p class="cms-empty">维护日志暂时无法读取，请刷新重试。</p>';}}finally{polling=false;}}
 const controller=new AbortController(),timer=setInterval(()=>{if(!view.isConnected){clearInterval(timer);controller.abort();return;}void refreshIfChanged();},15000);
 window.addEventListener('focus',()=>void refreshIfChanged(),{signal:controller.signal});document.addEventListener('visibilitychange',()=>void refreshIfChanged(),{signal:controller.signal});await refreshIfChanged();
};
