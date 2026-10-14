'use strict';
(() => {
 const L=window.FoamLab,esc=L.esc,hub=document.getElementById('theory-modules'),host=document.getElementById('pope-catalog');
 if(!hub&&!host)return;
 const query=document.getElementById('pope-query');
 function filter(){
  const text=query.value.trim().toLocaleLowerCase();
  for(const chapter of host.querySelectorAll('details')){
   const name=chapter.querySelector('summary').textContent.toLocaleLowerCase();
   for(const row of chapter.querySelectorAll('li'))row.hidden=!!text&&!name.includes(text)&&!row.textContent.toLocaleLowerCase().includes(text);
   chapter.hidden=![...chapter.querySelectorAll('li')].some(row=>!row.hidden);
   if(text&&!chapter.hidden)chapter.open=true;
  }
  for(const part of host.querySelectorAll('.fvm-part'))part.hidden=![...part.querySelectorAll('details')].some(chapter=>!chapter.hidden);
 }
 function openHash(){
  const target=document.getElementById(location.hash.slice(1));if(!target||!host?.contains(target))return;
  if(query.value){query.value='';filter();}
  if(target.tagName==='DETAILS')target.open=true;
  target.scrollIntoView();
 }
 async function load(){
  const target=hub||host;target.setAttribute('aria-busy','true');
  try{
   const D=await window.FoamDirectory.ready;
   if(!D.available)throw Error('directory unavailable');
   const node=D.nodes.find(row=>row.key===(hub?'theory':'pope'));if(!node)throw Error('missing module');
   if(hub){
    const children=D.children(node.id).filter(D.isVisible);
    hub.innerHTML=children.map(row=>`<article class="lab-card"><div class="lab-card-body"><h2><a href="${esc(D.url(row))}">${esc(row.name)}</a></h2><p>${esc(row.description||'')}</p><a class="button secondary" href="${esc(D.url(row))}">查看课程目录 →</a></div></article>`).join('');
   }else{
    const rows=(await D.content(node)).filter(row=>row.metadata?.turbulence_book).sort((a,b)=>a.sort_order-b.sort_order);
    if(!rows.length)throw Error('missing lessons');
    host.innerHTML=['基础','建模与模拟','数学附录'].map((title,i)=>{
     const part=rows.filter(row=>row.metadata.turbulence_book.part===i+1),chapters=[...new Set(part.map(row=>String(row.metadata.turbulence_book.chapter)))];
     return `<section class="fvm-part" id="part-${i+1}"><h2>${esc(title)}</h2>${chapters.map(ch=>{
      const items=part.filter(row=>String(row.metadata.turbulence_book.chapter)===ch),m=items[0].metadata.turbulence_book;
      const heading=/^[A-J]$/.test(ch)?`附录 ${ch} · ${m.chapter_title}`:`第 ${ch} 章 · ${m.chapter_title}`;
      return `<details class="fvm-chapter" id="chapter-${esc(ch)}" ${ch==='1'?'open':''}><summary>${esc(heading)}<small>${items.length} 节</small></summary><ol>${items.map(row=>`<li><a href="/read/?slug=${encodeURIComponent(row.slug)}">${esc(row.title)}</a><p>${esc(row.summary)}</p></li>`).join('')}</ol></details>`;
     }).join('')}</section>`;
    }).join('');
    document.getElementById('pope-count').textContent=`13 章与 10 个附录 · ${rows.length} 节课程`;
    query.addEventListener('input',filter);window.addEventListener('hashchange',openHash);filter();openHash();
   }
   target.dataset.loaded='true';
  }catch{
   target.innerHTML='<p role="alert">课程目录暂时无法读取，请检查网络后重试。</p><button class="button secondary" type="button">重新加载</button>';
   target.querySelector('button').addEventListener('click',()=>location.reload());
  }finally{target.setAttribute('aria-busy','false');}
 }
 void load();
})();
