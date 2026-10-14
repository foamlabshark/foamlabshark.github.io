'use strict';
(() => {
 const L=window.FoamLab,D=window.FoamDirectory,requests=new Map();
 const supported=node=>{if(!node)return false;const url=new URL(D.url(node),location.origin);return !url.hash&&url.pathname!=='/'&&!/^\/(?:admin|studio|account|read|support|town)(?:\/|$)/.test(url.pathname);};
 const entryNode=node=>{if(!node)return null;const url=new URL(D.url(node),location.origin);if(!url.hash)return node;return D.ancestors(node.id).reverse().find(parent=>{const target=new URL(D.url(parent),location.origin);return !target.hash&&target.pathname===url.pathname&&target.search===url.search;});};
 async function read(node,fresh=false){
  if(fresh)requests.delete(node.id);
  if(!requests.has(node.id))requests.set(node.id,L.client.from('foamlab_sections').select('id,name,description,page_content,revision').eq('id',node.id).maybeSingle().then(L.check).catch(error=>{requests.delete(node.id);throw error;}));
  return requests.get(node.id);
 }
 async function defaults(node){
  const result={subtitle:node.description||'',body:''};
  if(!node.href||new URL(D.url(node),location.origin).pathname==='/section/')return result;
  const response=await fetch(D.url(node));if(!response.ok)throw Error('入口页暂时无法读取，请稍后重试。');
  const doc=new DOMParser().parseFromString(await response.text(),'text/html');
  const heading=doc.querySelector('main .page-heading');
  if(heading?.querySelector('p')&&!doc.querySelector('#topic-hub[data-topic]:not([data-topic=""])'))result.subtitle=heading.querySelector('p').textContent.trim();
  // Existing rich introductions are registered explicitly; avoid consuming cards or course text.
  const intro=doc.querySelector('[data-section-page-body]');
  if(intro)result.body=[...intro.children].map(p=>p.textContent.trim()).join('\n\n');
  return result;
 }
 async function apply(node){
  node=entryNode(node);
  if(!node||!supported(node)||document.querySelector('#cms-root,#live-article,.article[data-cms-slug]'))return;
  const heading=document.querySelector('main .page-heading,main .topic-detail-header > div'),title=heading?.querySelector('h1');if(!title)return;
  try{
   const item=await read(node),value=item?.page_content;if(!value||!Object.keys(value).length||!heading.isConnected)return;
   title.textContent=item.name;document.title=item.name+' · FoamLab';
   if(typeof value.subtitle==='string'){let subtitle=heading.querySelector('p');if(!subtitle){subtitle=document.createElement('p');heading.append(subtitle);}subtitle.textContent=value.subtitle;subtitle.hidden=!value.subtitle;}
   if(typeof value.body==='string'){
    let intro=document.querySelector('[data-section-page-body]');
    if(!intro){intro=document.createElement('div');intro.dataset.sectionPageBody='';(heading.closest('.catalog-header,.topic-detail-header')||heading).after(intro);}
    intro.classList.add('prose','section-page-intro');intro.innerHTML=L.markdown(value.body);intro.hidden=!value.body.trim();
   }
   heading.dataset.sectionPageLoaded='true';
  }catch{/* Retain the last locally synchronized introduction if the network is unavailable. */}
 }
 window.FoamSectionPage={supported,read,defaults,apply};
 D.ready.then(()=>{if(D.available)void apply(D.current());});
})();
