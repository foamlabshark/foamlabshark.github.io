'use strict';
(() => {
 const main=document.querySelector('#main');if(!main||document.body.dataset.section==='town'||main.querySelector('.fl-home'))return;
 const dock=document.createElement('details');dock.className='page-outline';dock.innerHTML='<summary aria-label="打开本页跳转目录"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg> 本页目录</summary><nav aria-label="本页跳转目录"></nav>';
 const toolbar=document.createElement('div');toolbar.className='page-outline-toolbar';
 main.before(toolbar);toolbar.append(dock);
 const topbar=document.querySelector('.topbar'),root=document.documentElement;
 root.classList.add('has-page-outline');
 const mobile=window.matchMedia('(max-width:760px)');
 const nav=dock.querySelector('nav');let serial=0,timer,last='';
 function measureToolbar(){
  const headerHeight=Math.ceil(topbar?.getBoundingClientRect().height||0);
  const toolbarHeight=mobile.matches?Math.ceil(toolbar.getBoundingClientRect().height):0;
  root.style.setProperty('--page-topbar-height',headerHeight+'px');
  root.style.setProperty('--page-outline-height',toolbarHeight+'px');
 }
 if(window.ResizeObserver){const observer=new ResizeObserver(measureToolbar);if(topbar)observer.observe(topbar);observer.observe(toolbar);}
 mobile.addEventListener('change',measureToolbar);
 function update(){
  const headings=[...main.querySelectorAll('h1,h2,h3')].filter(h=>h.getClientRects().length&&!h.closest('[hidden],dialog,details:not([open])'));
  const signature=headings.map(h=>h.tagName+'|'+h.textContent+'|'+h.id).join('\n');if(signature===last)return;
  nav.replaceChildren();
  headings.forEach(h=>{if(!h.id)h.id='page-heading-'+(++serial);const a=document.createElement('a');a.href='#'+encodeURIComponent(h.id);a.textContent=h.textContent.trim();a.className='outline-'+h.tagName.toLowerCase();a.addEventListener('click',()=>{dock.open=false;});nav.append(a);});
  if(!headings.length){const a=document.createElement('a');a.href='#main';a.textContent='页面顶部';nav.append(a);}
  last=headings.map(h=>h.tagName+'|'+h.textContent+'|'+h.id).join('\n');
 }
 new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(update,150);}).observe(main,{childList:true,subtree:true,characterData:true});
 document.addEventListener('toggle',event=>{if(event.target!==dock&&main.contains(event.target))update();},true);
 document.addEventListener('click',event=>{if(dock.open&&!dock.contains(event.target))dock.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&dock.open){dock.open=false;dock.querySelector('summary').focus();}});
 update();measureToolbar();window.addEventListener('resize',()=>{measureToolbar();clearTimeout(timer);timer=setTimeout(update,150);});
})();
