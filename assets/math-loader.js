'use strict';
(() => {
 const source=document.querySelector('script[data-math-runtime]')?.dataset.mathRuntime;
 let pending=null,watcher=null;
 function ready(){
  if(window.katex)return Promise.resolve();
  if(pending)return pending;
  pending=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src=source||'/assets/runtime-math.js';script.async=true;
   const timer=setTimeout(()=>fail(),15000);
   function fail(){clearTimeout(timer);script.remove();pending=null;reject(Error('公式组件暂时无法加载，请重试。'));}
   script.onerror=fail;script.onload=()=>{if(!window.katex)return fail();clearTimeout(timer);resolve();};
   document.head.append(script);
  });
  return pending;
 }
 function render(element,tex,display){
  element.classList.remove('math-pending');for(const name of ['data-math-display','title','role','tabindex'])element.removeAttribute(name);
  try{window.katex.render(tex,element,{displayMode:display,throwOnError:true,trust:false,maxExpand:1000});}
  catch{element.className='math-error';element.textContent=tex;}
 }
 function flush(){
  if(!window.katex)return;
  for(const element of document.querySelectorAll('.math-pending'))render(element,element.textContent,element.dataset.mathDisplay==='true');
 }
 function observe(){
  if(watcher)return;
  watcher=new MutationObserver(records=>{
   if(!window.katex)return;
   for(const record of records)for(const node of record.addedNodes){
    if(node.nodeType!==1)continue;
    const elements=node.matches('.math-pending')?[node]:node.querySelectorAll('.math-pending');
    for(const element of elements)render(element,element.textContent,element.dataset.mathDisplay==='true');
   }
  });watcher.observe(document.body,{childList:true,subtree:true});
 }
 function enhance(){
  // Previews retain the synchronous Markdown API. Render their formula nodes
  // after the returned markup is inserted; plain-text pages need no KaTeX.
  observe();ready().then(flush).catch(()=>{
   for(const element of document.querySelectorAll('.math-pending')){
    element.title='公式组件暂时无法加载，点击重试';element.setAttribute('role','button');element.tabIndex=0;
   }
  });
 }
 document.addEventListener('click',e=>{if(e.target.closest('.math-pending'))enhance();});
 document.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.matches('.math-pending')){e.preventDefault();enhance();}});
 window.FoamMathRenderer={ready,render,enhance};
 // Start the small independent request alongside authentication and the body
 // read, without holding up directory initialization or other page controls.
 if(document.querySelector('#live-article,.article[data-cms-slug]:not([data-cms-slug=""])'))void ready().catch(()=>{});
})();
