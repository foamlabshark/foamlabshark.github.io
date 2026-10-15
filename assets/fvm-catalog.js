/* The index needs current catalog metadata, not the lesson simulation runtime. */
'use strict';
(() => {
 const host=document.getElementById('fvm-catalog');if(!host)return;
 const query=document.getElementById('fvm-query'),esc=window.FoamLab.esc;
 function filter(){
  const q=query.value.trim().toLowerCase();
  for(const ch of host.querySelectorAll('details')){
   let hit=false;const title=ch.querySelector('summary').textContent.toLowerCase();
   for(const li of ch.querySelectorAll('li')){li.hidden=!!q&&!li.textContent.toLowerCase().includes(q)&&!title.includes(q);if(!li.hidden)hit=true;}
   ch.hidden=!hit;if(q&&hit)ch.open=true;
  }
  for(const p of host.querySelectorAll('.fvm-part'))p.hidden=![...p.querySelectorAll('details')].some(x=>!x.hidden);
 }
 function openHash(){
  const target=document.getElementById(location.hash.slice(1));if(!target||!host.contains(target))return;
  if(query.value){query.value='';filter();}
  if(target.tagName==='DETAILS')target.open=true;
  target.scrollIntoView();
 }
 query.addEventListener('input',filter);window.addEventListener('hashchange',openHash);
 async function load(){
  host.setAttribute('aria-busy','true');
  try{
   const D=await window.FoamDirectory.ready,node=D.nodes.find(x=>x.key==='fvm');
   if(!node)throw Error('课程目录暂时无法读取。');
   const rows=(await D.content(node,'book')).filter(x=>x.metadata?.fvm_book).sort((a,b)=>a.sort_order-b.sort_order);
   host.innerHTML=['基础','离散','算法','应用','附录'].map((name,i)=>{
    const part=rows.filter(x=>x.metadata.fvm_book.part===i+1),chapters=[...new Set(part.map(x=>x.metadata.fvm_book.chapter))];
    return `<section class="fvm-part" id="part-${i+1}"><h2>${i<4?'第'+['一','二','三','四'][i]+'部分 · ':''}${name}</h2>${chapters.map(ch=>{
     const items=part.filter(x=>x.metadata.fvm_book.chapter===ch),m=items[0].metadata.fvm_book;
     const heading=ch===21?'附录 · '+m.chapter_title.replace(/^\s*附录\s*[:：·]?\s*/,''):'第 '+ch+' 章　'+m.chapter_title;
     return `<details class="fvm-chapter" id="chapter-${ch}" ${ch===1?'open':''}><summary>${esc(heading)}<small>${items.length} 节</small></summary><ol>${items.map(x=>`<li><a href="/read/?slug=${encodeURIComponent(x.slug)}">${esc(x.title)}</a><p>${esc(x.summary)}</p></li>`).join('')}</ol></details>`;
    }).join('')}</section>`;
   }).join('');
   document.getElementById('fvm-count').textContent=`20 章及附录 · ${rows.length} 节课程`;
   host.dataset.loaded='true';filter();openHash();
  }catch{
   host.innerHTML='<p role="alert">课程目录暂时无法读取，请检查网络后重试。</p><button class="button secondary" type="button">重新加载</button>';
   host.querySelector('button').addEventListener('click',()=>location.reload());
  }finally{host.setAttribute('aria-busy','false');}
 }
 void load();
})();
