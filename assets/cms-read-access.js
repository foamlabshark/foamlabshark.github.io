'use strict';
(() => {
 const labels={inherit:'继承上级',public:'公开 · 无需登录',member:'登录后可读',supporter:'仅充电会员及管理员',admin:'仅管理员'};
 const rank={public:0,member:1,supporter:2,admin:3};
 function section(id){
  const seen=new Set(),D=window.FoamDirectory;
  while(id&&!seen.has(id)){
   seen.add(id);const node=D?.nodes.find(n=>n.id===id);if(!node)break;
   if(rank[node.read_access]!==undefined)return node.read_access;id=node.parent_id;
  }
  return 'member';
 }
 function effective(item){
  if(item.metadata?.admin_only===true||item.metadata?.admin_only==='true')return 'admin';
  if(rank[item.read_access]!==undefined)return item.read_access;
  const modes=(item.section_ids||[]).map(section);
  return modes.length?modes.reduce((a,b)=>rank[a]>=rank[b]?a:b):'member';
 }
 function field(value='inherit',internal=false){
  return '<label class="form-field"><span>阅读权限</span><select name="read_access" '+(internal?'disabled':'')+'>'+
   Object.entries(labels).map(([key,label])=>'<option value="'+key+'" '+((internal?'admin':value)===key?'selected':'')+'>'+label+'</option>').join('')+
   '</select></label><p class="cms-muted" data-read-access-result></p>';
 }
 function mountArticle(form,item){
  const holder=document.createElement('section');holder.className='cms-edit-section';
  holder.innerHTML='<h3>阅读权限</h3>'+field(item.read_access||'inherit',item.metadata?.admin_only===true||item.metadata?.admin_only==='true')+
   '<p class="cms-muted">继承所在模块的设置。文章位于多个模块时，采用其中最严格的权限；单独设置后按本篇文章的选择生效。</p>';
  form.querySelector('.cms-editor-options').prepend(holder);
  const update=()=>{
   const ids=window.FoamDirectory?.available?window.FoamDirectory.readPicker(form):item.section_ids;
   holder.querySelector('[data-read-access-result]').textContent='当前生效：'+labels[effective({...item,section_ids:ids,read_access:form.elements.read_access.value})];
  };
  form.addEventListener('change',update);update();
 }
 function bindSection(form){
  const update=()=>{const mode=form.elements.read_access.value;
   form.querySelector('[data-read-access-result]').textContent='当前生效：'+labels[mode==='inherit'?section(form.elements.parent_id.value):mode];};
  form.addEventListener('change',update);update();
 }
 window.FoamCMSReadAccess={labels,field,effective,section,mountArticle,bindSection};
})();
