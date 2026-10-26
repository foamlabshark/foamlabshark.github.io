'use strict';
(() => {
 const root=document.querySelector('[data-cuda-page]');if(!root)return;
 const esc=window.FoamLab.esc,$=s=>root.querySelector(s),url=c=>'/cuda/read/?slug='+encodeURIComponent(c.slug),slug=new URLSearchParams(location.search).get('slug')||'cuda-01';
 const state={chapters:[],chapter:null};
 function sidebar(){
  const D=window.FoamDirectory;if(!D?.available)return;
  for(const chapter of state.chapters){
   const node=D.nodes.find(n=>n.key===chapter.slug),group=node&&document.querySelector('[data-directory-id="'+node.id+'"]');if(!group||group.querySelector('[data-cuda-subheadings]'))continue;
   const heads=(chapter.toc||[]).filter(h=>h.level>=2&&h.level<=5);if(!heads.length)continue;
   const id='cuda-headings-'+chapter.slug,open=root.dataset.cudaPage==='read'&&chapter.slug===slug,toggle=document.createElement('button'),nav=document.createElement('div');
   toggle.type='button';toggle.className='nav-expand';toggle.setAttribute('aria-controls',id);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label','展开'+chapter.displayTitle+'小标题');toggle.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6"/></svg>';
   nav.className='nav-subgroup';nav.id=id;nav.dataset.cudaSubheadings='';nav.hidden=!open;
   nav.innerHTML=heads.map(h=>'<a class="nav-item nav-subitem cuda-heading-link" data-level="'+h.level+'" href="'+url(chapter)+'#'+encodeURIComponent(h.id)+'">'+esc(h.text)+'</a>').join('');
   group.querySelector(':scope > .nav-parent').append(toggle);group.append(nav);
  }
 }
 function renderCatalog(){
  const catalog=$('#cuda-catalog');catalog.innerHTML=state.chapters.map(c=>'<details class="fvm-chapter" id="'+c.slug+'" '+(c.number===1?'open':'')+'><summary>'+esc(c.displayTitle)+'<small>'+(c.toc||[]).filter(h=>h.level===2).length+' 个小节</small></summary><ol><li><a href="'+url(c)+'">阅读本章 →</a></li>'+(c.toc||[]).filter(h=>h.level===2).map(h=>'<li><a href="'+url(c)+'#'+encodeURIComponent(h.id)+'">'+esc(h.text)+'</a></li>').join('')+'</ol></details>').join('');catalog.setAttribute('aria-busy','false');
  $('#cuda-query').oninput=e=>{const q=e.target.value.trim().toLocaleLowerCase();catalog.querySelectorAll('details').forEach(section=>{section.hidden=!!q&&!section.textContent.toLocaleLowerCase().includes(q);if(q&&!section.hidden)section.open=true;});};
 }
 function formulas(body){
  const walker=document.createTreeWalker(body,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement.closest('pre,code,script,style,.katex')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);let found=false;
  for(const node of nodes){const pattern=/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g;let m,last=0;const fragment=document.createDocumentFragment();while((m=pattern.exec(node.textContent))){fragment.append(node.textContent.slice(last,m.index));const span=document.createElement('span');span.className='math-pending';span.dataset.mathDisplay=String(m[2]!==undefined);span.textContent=m[1]??m[2];fragment.append(span);last=pattern.lastIndex;found=true;}if(last){fragment.append(node.textContent.slice(last));node.replaceWith(fragment);}}
  if(found)window.FoamMathRenderer.enhance();
 }
 function scrollHash(){if(!location.hash)return;let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView());}
 async function chapterFeatures(chapter){
  const L=window.FoamLab,comments=$('#lab-comments');
  try{
   await L.ready;const item=L.check(await L.client.from('foamlab_content').select('id,slug,kind,title,series,sort_order,metadata,section_ids,comments_enabled').eq('slug',chapter.slug).eq('status','published').maybeSingle());if(!item)throw Error('本章的评论和翻页暂时无法读取，请稍后重试。');
   $('#cuda-discuss').href='/community/?about='+encodeURIComponent(item.title)+'&from='+encodeURIComponent(item.slug);
   await L.lessonNavigation(root.querySelector('article'),item,{chapterURL:url,directoryURL:'/cuda/'});
   const complete=$('#lab-complete');let done=false;
   if(L.user){const result=await L.client.from('foamlab_learning_progress').select('completed').eq('user_id',L.user.id).eq('content_id',item.id).maybeSingle();done=!!result.data?.completed;}
   const completionLabel=()=>{complete.textContent=done?'已学完 · 点击撤销':'标记为已学';};completionLabel();
   complete.onclick=async()=>{if(!L.user){L.login();return;}complete.disabled=true;try{await L.recordCompletion(item.id,!done);done=!done;completionLabel();}catch(error){window.foamNotify?.(error.message);}finally{complete.disabled=false;}};
   comments.querySelector('.cuda-comments-loading')?.remove();
   if(item.comments_enabled)await L.messages(comments,{content_id:item.id});else comments.insertAdjacentHTML('beforeend','<p class="muted">作者已关闭这篇内容的评论。</p>');
   root.dataset.community='ready';
  }catch(error){root.dataset.community='error';L.error(comments,error);}
 }
 async function renderChapter(){
  const chapter=state.chapters.find(c=>c.slug===slug);if(!chapter)throw Error('没有找到该章节，请从全书目录选择。');state.chapter=chapter;
  if(!/^\/cuda\/book\/html\/\d{2}\.html$/.test(chapter.html))throw Error('章节地址无效。');
  const response=await fetch(chapter.html);if(!response.ok)throw Error('章节暂时无法读取，请稍后重试。');
  const body=$('#cuda-article');body.innerHTML=window.DOMPurify.sanitize(await response.text(),{FORBID_TAGS:['script','style','iframe','form']});const heading=body.querySelector('h1');$('#cuda-page-title').textContent=heading?.textContent||chapter.displayTitle;heading?.remove();document.title=chapter.displayTitle+' · FoamLab';
  body.querySelectorAll('h1').forEach(heading=>{const section=document.createElement('h2');section.id=heading.id;section.append(...heading.childNodes);heading.replaceWith(section);});
  body.querySelectorAll('pre').forEach(pre=>{const code=pre.querySelector('code');if(code&&!code.className)code.className='language-cpp';window.foamEnhanceCode?.(pre);});window.foamHighlightCode?.(body);formulas(body);
  void chapterFeatures(chapter);
  root.querySelector('article').setAttribute('aria-busy','false');const parent=document.querySelector('#breadcrumb-parent'),back=document.querySelector('#page-back-link');if(parent){parent.href='/cuda/';parent.textContent='CUDA C++ 编程指南';}if(back){back.href='/cuda/';back.textContent='← 返回全书目录';}scrollHash();
 }
 (async()=>{try{const response=await fetch('/cuda/book/manifest.json');if(!response.ok)throw Error('课程目录暂时无法读取。');const data=await response.json();state.chapters=data.chapters||[];if(root.dataset.cudaPage==='index')renderCatalog();else await renderChapter();root.dataset.loaded='true';await window.FoamDirectory.ready;sidebar();}catch(error){const host=$('#cuda-catalog')||$('#cuda-article');host.innerHTML='<p role="alert">'+esc(error.message)+'</p><a class="button secondary" href="/cuda/">返回全书目录</a>';host.setAttribute('aria-busy','false');root.querySelector('article')?.setAttribute('aria-busy','false');root.dataset.loaded='error';}})();
 window.addEventListener('hashchange',scrollHash);window.addEventListener('popstate',()=>queueMicrotask(sidebar));
})();
