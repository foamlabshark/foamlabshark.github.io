'use strict';
(() => {
 const MAX_SIZE=32768,queue=[],seen=new WeakSet();let worker=null,current=null,serial=0,timeout=null,disabled=false;
 const idle=fn=>window.requestIdleCallback?requestIdleCallback(fn,{timeout:300}):setTimeout(fn,16);
 function plain(node){node.dataset.foamHighlight='plain';}
 function finish(data){if(!current||data.id!==current.id)return;clearTimeout(timeout);const {node,source}=current;if(node.isConnected&&node.textContent===source){if(data.html!==undefined){node.innerHTML=data.html;node.classList.add('hljs');node.dataset.foamHighlight='complete';}else plain(node);}current=null;idle(next);}
 function next(){if(current||disabled)return;while(queue.length){const node=queue.shift();if(!node.isConnected)continue;const source=node.textContent;if(!source||source.length>MAX_SIZE){plain(node);continue;}const language=(node.className.match(/language-([\w+-]+)/)?.[1]||'plaintext').toLowerCase();if(['plaintext','text','txt'].includes(language)){plain(node);continue;}
  try{if(!worker){worker=new Worker('/assets/browser-code-worker.js');worker.onmessage=e=>finish(e.data);worker.onerror=()=>{disabled=true;clearTimeout(timeout);if(current)plain(current.node);worker.terminate();worker=null;current=null;};}current={id:++serial,node,source};worker.postMessage({id:serial,language,code:source});timeout=setTimeout(()=>{if(!current)return;plain(current.node);current=null;worker.terminate();worker=null;idle(next);},1200);return;}catch{disabled=true;plain(node);return;}
 }}
 const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){observer.unobserve(entry.target);queue.push(entry.target);}idle(next);},{rootMargin:'250px'}):null;
 function scan(root){const nodes=[];if(root.matches?.('pre > code'))nodes.push(root);if(root.querySelectorAll)nodes.push(...root.querySelectorAll('pre > code'));for(const node of nodes){if(seen.has(node)||node.classList.contains('hljs'))continue;seen.add(node);if(node.textContent.length>MAX_SIZE){plain(node);continue;}if(observer)observer.observe(node);else queue.push(node);}if(!observer)idle(next);}
 const changes=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)scan(node);});
 const start=()=>{scan(document);changes.observe(document.body,{childList:true,subtree:true});};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 window.foamHighlightCode=scan;
})();
