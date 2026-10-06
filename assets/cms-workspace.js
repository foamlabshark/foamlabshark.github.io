'use strict';
(() => {
 const placements=[
  {id:'system',label:'系统学习',kind:'lesson',track:null},
  {id:'algorithms',label:'专题学习 / 有限体积法',kind:'lesson',track:'数值方法与理论'},
  {id:'programming',label:'OpenFOAM 编程 / 编程实例',kind:'lesson',track:'OpenFOAM 编程'},
  {id:'linux',label:'OpenFOAM 编程 / Linux 入门',kind:'lesson',track:'Linux 入门'},
  {id:'cpp',label:'OpenFOAM 编程 / C++ 入门',kind:'lesson',track:'C++ 入门'},
  {id:'module',label:'专题学习 / 专题导览',kind:'module',track:null},
  {id:'article',label:'实践与分享 / 文章',kind:'article',track:null},
  {id:'resource',label:'资料中心 / 算例与源码',kind:'resource',track:null},
  {id:'recommendation',label:'资料中心 / 资源推荐',kind:'recommendation',track:null},
  {id:'tool',label:'工具生态',kind:'tool',track:null},
  {id:'announcement',label:'网站公告',kind:'announcement',track:null},
  {id:'assignment',label:'作业与实践',kind:'assignment',track:null},
  {id:'course',label:'系统学习 / 课程集合',kind:'course',track:null},
  {id:'commands',label:'命令速查',kind:'reference',fixed:true},
  {id:'dictionaries',label:'配置与字典速查',kind:'reference',fixed:true},
  {id:'reference',label:'其他参考资料',kind:'reference',fixed:true},
  {id:'internal',label:'管理平台 / 内部文档',fixed:true}
 ];
 const key=row=>{
  if(row.metadata?.admin_only||['site-maintenance','site-design'].includes(row.slug))return 'internal';
  if(row.kind==='reference')return row.slug?.startsWith('command-')?'commands':row.slug?.startsWith('dictionary-')||row.metadata?.canonical_path?.startsWith('/dictionaries/')?'dictionaries':'reference';
  if(row.kind==='lesson')return ({'数值方法与理论':'algorithms','OpenFOAM 编程':'programming','Linux 入门':'linux','C++ 入门':'cpp'})[row.track]||'system';
  return row.kind;
 };
 const placement=row=>placements.find(p=>p.id===key(row));
 const legacyLocationLabel=row=>[placement(row)?.label||row.kind,...(row.track&&placement(row)?.track!==row.track?[row.track]:[]),row.series].filter(Boolean).join(' / ');
 const confirmAction=({title,message,details=[],action='确认',danger=false,html=''})=>new Promise(resolve=>{
  const esc=window.FoamLab.esc,dialog=document.createElement('dialog'),previous=document.activeElement;
  dialog.className='cms-dialog';dialog.setAttribute('aria-labelledby','cms-dialog-title');
  dialog.innerHTML='<form method="dialog"><h2 id="cms-dialog-title">'+esc(title)+'</h2><p>'+esc(message||'')+'</p>'+(details.length?'<ul class="cms-impact">'+details.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+html+'<div class="cms-dialog-actions"><button class="button secondary" value="cancel" formnovalidate autofocus>取消</button><button class="button '+(danger?'cms-danger':'')+'" value="confirm">'+esc(action)+'</button></div></form>';
  document.body.append(dialog);dialog.addEventListener('close',()=>{const result=dialog.returnValue==='confirm'?Object.fromEntries(new FormData(dialog.querySelector('form'))):false;dialog.remove();if(previous?.isConnected)previous.focus();resolve(result);},{once:true});dialog.showModal();
 });
 const pager=(page,total,size=25)=>{const pages=Math.max(1,Math.ceil(total/size));return '<div class="cms-pagination"><span>共 '+total+' 项 · 第 '+page+' / '+pages+' 页</span><div><button class="button secondary" data-page="'+(page-1)+'" '+(page<=1?'disabled':'')+'>上一页</button><button class="button secondary" data-page="'+(page+1)+'" '+(page>=pages?'disabled':'')+'>下一页</button></div></div>';};
 const locationLabel=row=>window.FoamDirectory?.available?(window.FoamDirectory.locations(row).join('；')||'未归类'):legacyLocationLabel(row);
 window.FoamCMSUI={placements,key,placement,locationLabel,confirmAction,pager:(page,total,size=25)=>window.FoamPagination?'<div class="cms-pagination"><span>共 '+total+' 项 · 第 '+page+' / '+Math.max(1,Math.ceil(total/size))+' 页</span>'+window.FoamPagination.html(page,total,size,'data-page')+'</div>':pager(page,total,size)};
})();
