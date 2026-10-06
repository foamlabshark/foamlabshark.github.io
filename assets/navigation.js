'use strict';
(() => {
 const nav=document.querySelector('#sidebar nav');if(!nav)return;
 const groups=()=>[...nav.querySelectorAll('[data-nav-section]')];
 let saved={};try{saved=JSON.parse(localStorage.getItem('foamlab-nav-groups')||'{}');}catch{}
 if(!saved||typeof saved!=='object'||Array.isArray(saved))saved={};
 const isOpen=key=>saved[key]===true;
 const toggle=(group,open)=>{const button=group.querySelector(':scope > .nav-parent > .nav-expand');if(!button)return;button.setAttribute('aria-expanded',String(open));const label=group.querySelector(':scope > .nav-parent > a > span:last-child')?.textContent||'';button.setAttribute('aria-label',(open?'收起':'展开')+label+'子目录');const panel=document.getElementById(button.getAttribute('aria-controls'));if(panel)panel.hidden=!open;};
 const restore=()=>groups().forEach(group=>toggle(group,isOpen(group.dataset.navSection)));
 // Static and live navigation share one state and one delegated arrow handler.
 // Links only navigate; neither page activation nor data loading opens a group.
 window.FoamNavigation={isOpen,restore};
 restore();
 nav.addEventListener('click',e=>{const button=e.target.closest('.nav-expand');if(!button||!nav.contains(button))return;e.preventDefault();const group=button.closest('[data-nav-section]'),open=button.getAttribute('aria-expanded')!=='true';saved[group.dataset.navSection]=open;toggle(group,open);try{localStorage.setItem('foamlab-nav-groups',JSON.stringify(saved));}catch{}});
 function activate(item){
  if(window.FoamDirectory?.available){if(item)window.FoamDirectory.breadcrumb(item);return;}
  const current=new URL(location.href);let winner=null;
  for(const link of document.querySelectorAll('.nav-subitem')){
   const url=new URL(link.href),specific=[...url.searchParams];
   const match=url.pathname===current.pathname&&specific.every(([k,v])=>current.searchParams.get(k)===v)&&(specific.length>0||!current.search);
   if(match){winner=link;break;}
  }
  if(!winner)winner=[...document.querySelectorAll('.nav-parent>a')].find(a=>new URL(a.href).pathname===current.pathname)||null;
  if(!winner&&item){
   let key='',filter='';
   if(item.kind==='lesson'){
    if(['OpenFOAM 编程','C++ 入门','Linux 入门'].includes(item.track)){key='programming';filter=item.track==='C++ 入门'?'/cpp/':item.track==='Linux 入门'?'/linux/':'/programming/?q=';}
    else if(item.track==='数值方法与理论'){key='topics';filter='/topics/finite-volume/';}
    else{key='courses';filter='track='+encodeURIComponent(item.track);}
   }else if(item.kind==='tool'){key='tools';}
   else if(['resource','recommendation'].includes(item.kind)){key='resources';filter='kind='+item.kind;}
   else if(['article','log'].includes(item.kind)){winner=document.querySelector('#sidebar a[href="/sharing/"]');}
   else if(item.slug?.startsWith('command-')){key='commands';}
   else if(item.slug?.startsWith('dictionary-')){key='dictionaries';}
   const group=groups().find(g=>g.dataset.navSection===key);
   if(group){winner=[...group.querySelectorAll('.nav-subitem')].find(a=>filter&&a.getAttribute('href').includes(filter))||group.querySelector('.nav-parent>a');}
  }
  if(winner){
   for(const a of document.querySelectorAll('#sidebar .nav-item')){a.classList.remove('active');a.removeAttribute('aria-current');}
   winner.classList.add('active');winner.setAttribute('aria-current','page');
   for(let group=winner.closest('[data-nav-section]');group;group=group.parentElement.closest('[data-nav-section]'))group.querySelector(':scope > .nav-parent > a')?.classList.add('active');
  }
 }
 activate(window.foamCurrentContent);
 document.addEventListener('foamlab:content-ready',e=>activate(e.detail));
 window.addEventListener('popstate',()=>activate(window.foamCurrentContent));
 // Catalog filters update the URL without leaving the page.
 document.addEventListener('click',e=>{if(e.target.closest('[data-command-filter],[data-dictionary-filter],[data-track],[data-catalog-kind]'))queueMicrotask(()=>activate(window.foamCurrentContent));});
})();
