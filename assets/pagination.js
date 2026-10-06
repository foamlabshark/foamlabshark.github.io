'use strict';
(() => {
 const P=window.FoamPagination={};
 P.numbers=(page,pages)=>[...new Set([1,2,...[page-1,page,page+1].filter(n=>n>0&&n<=pages),pages-1,pages].filter(n=>n>0&&n<=pages))].sort((a,b)=>a-b);
 P.html=(page,total,size=12,attribute='data-list-page')=>{
  const pages=Math.max(1,Math.ceil(total/size));if(pages<=1)return '';
  const b=(n,label,disabled=false)=>'<button type="button" '+attribute+'="'+n+'" '+(disabled?'disabled':'')+(typeof label==='number'&&n===page?' aria-current="page"':'')+' aria-label="'+(typeof label==='number'?'第 '+label+' 页':label)+'">'+label+'</button>';
  let last=0;return '<nav class="number-pagination" aria-label="列表翻页">'+b(1,'第一页',page===1)+b(page-1,'上一页',page===1)+P.numbers(page,pages).map(n=>{const gap=last&&n-last>1?'<span aria-hidden="true">…</span>':'';last=n;return gap+b(n,n);}).join('')+b(page+1,'下一页',page===pages)+b(pages,'最后一页',page===pages)+'<small>共 '+pages+' 页</small></nav>';
 };
 P.slice=(host,rows,render,size=12)=>{
  let pager=host.nextElementSibling;if(!pager?.classList.contains('list-pagination')){pager=document.createElement('div');pager.className='list-pagination';host.after(pager);}
  const requested=Number(new URLSearchParams(location.search).get('page'))||1,page=Math.max(1,Math.min(Math.trunc(requested),Math.ceil(rows.length/size)||1));
  if(page!==requested)window.foamListState?.write({page:page>1?String(page):''});
  pager.innerHTML=P.html(page,rows.length,size);
  pager.onclick=e=>{const b=e.target.closest('[data-list-page]');if(!b)return;window.foamListState.write({page:String(b.dataset.listPage)},true);render();host.scrollIntoView({block:'start',behavior:'instant'});host.setAttribute('tabindex','-1');host.focus({preventScroll:true});};
  return rows.slice((page-1)*size,page*size);
 };
})();
