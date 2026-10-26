(() => {
  const body = document.body;
  const menu = document.getElementById('cuda-menu-toggle');
  function hideMenu(){body.classList.remove('cuda-menu-open'); menu?.setAttribute('aria-expanded','false')}
  menu?.addEventListener('click',()=>{const open=body.classList.toggle('cuda-menu-open');menu.setAttribute('aria-expanded', String(open))});
  document.getElementById('cuda-screen-cover')?.addEventListener('click',hideMenu);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hideMenu()});
  const theme = document.getElementById('cuda-theme-toggle');
  try{document.documentElement.dataset.theme=localStorage.getItem('foamlab.theme')||'light'}catch{}
  theme?.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;try{localStorage.setItem('foamlab.theme',next)}catch{}});
  const $=id=>document.getElementById(id);
  const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  fetch('/cuda/book/manifest.json').then(r=>{if(!r.ok)throw new Error('无法获取章节目录');return r.json()}).then(data=>{
    const chapters=data.chapters||[];
    const query = new URLSearchParams(location.search);
    const slug=query.get('slug')||'cuda-01';
    const nav=$('cuda-nav');
    if(nav) {
      // Each chapter can expand to reveal its own subheadings in the left sidebar.
      // Only the current chapter is expanded automatically on a reader page.
      nav.innerHTML=chapters.map(c=>{
        const active=c.slug===slug;
        const expanded=body.dataset.page==='read' && active;
        const toc=(c.toc||[]).filter(h=>h.level>=2 && h.level<=5);
        const tocId=`cuda-subheads-${String(c.number).padStart(2,'0')}`;
        const chapterLink=`/cuda/read/?slug=${encodeURIComponent(c.slug)}`;
        return `<section class="cuda-nav-chapter ${active && body.dataset.page==='read'?'current':''}">
          <div class="cuda-nav-row">
            <a class="cuda-nav-chapter-link ${active && body.dataset.page==='read'?'active':''}" href="${chapterLink}" ${active && body.dataset.page==='read'?'aria-current="page"':''}>${safe(c.displayTitle)}</a>
            ${toc.length?`<button type="button" class="cuda-nav-expand" aria-expanded="${expanded}" aria-controls="${tocId}" aria-label="${expanded?'折叠':'展开'}${safe(c.displayTitle)}的小标题"><span class="cuda-nav-chevron">⌄</span></button>`:''}
          </div>
          ${toc.length?`<nav class="cuda-nav-subheadings" id="${tocId}" aria-label="${safe(c.displayTitle)}小标题" ${expanded?'':'hidden'}>${toc.map(h=>`<a class="cuda-nav-subheading" data-level="${h.level}" data-heading-id="${safe(h.id)}" href="${chapterLink}#${encodeURIComponent(h.id)}">${safe(h.text)}</a>`).join('')}</nav>`:''}
        </section>`;
      }).join('');
      nav.addEventListener('click',event=>{
        const toggle=event.target.closest('.cuda-nav-expand');
        if(toggle){
          const expanded=toggle.getAttribute('aria-expanded')==='true';
          const target=document.getElementById(toggle.getAttribute('aria-controls'));
          toggle.setAttribute('aria-expanded',String(!expanded));
          toggle.setAttribute('aria-label',toggle.getAttribute('aria-label').replace(expanded?'折叠':'展开',expanded?'展开':'折叠'));
          if(target) target.hidden=expanded;
          return;
        }
        if(event.target.closest('.cuda-nav-subheading') && window.matchMedia('(max-width: 780px)').matches){
          body.classList.remove('cuda-menu-open');
          menu?.setAttribute('aria-expanded','false');
        }
      });
      if(location.hash){
        let wanted='';
        try{wanted=decodeURIComponent(location.hash.slice(1))}catch{wanted=location.hash.slice(1)}
        const activeSubheading=[...nav.querySelectorAll('[data-heading-id]')].find(a=>a.dataset.headingId===wanted);
        if(activeSubheading){
          activeSubheading.classList.add('active');
          const parent=activeSubheading.closest('.cuda-nav-subheadings');
          if(parent){parent.hidden=false;const button=nav.querySelector(`[aria-controls="${parent.id}"]`);button?.setAttribute('aria-expanded','true')}
        }
      }
    }
    if(body.dataset.page==='index'){
      const list=$('cuda-chapters');
      if(list)list.innerHTML=chapters.map(c=>`<a class="cuda-chapter-card" href="/cuda/read/?slug=${encodeURIComponent(c.slug)}"><span class="n">CHAPTER ${String(c.number).padStart(2,'0')}</span><b>${safe(c.title)}</b><small>中文工作译稿 · 小节目录</small></a>`).join('');
      return;
    }
    const chapter=chapters.find(c=>c.slug===slug);
    if(!chapter){$('cuda-article').innerHTML='<h1>没有找到该章节</h1><p>请从目录选择已有章节。</p>';return}
    document.title=`${chapter.displayTitle} · CUDA 编程指南`;
    $('cuda-page-title').textContent=chapter.displayTitle;
    const toc=$('cuda-outline-links');
    const heads=(chapter.toc||[]).filter(h=>h.level>=2 && h.level<=4);
    if(toc)toc.innerHTML=heads.map(h=>`<a data-level="${h.level}" href="#${encodeURIComponent(h.id)}">${safe(h.text)}</a>`).join('');
    const prev=chapters.find(c=>c.number===chapter.number-1);
    const next=chapters.find(c=>c.number===chapter.number+1);
    const footer=$('cuda-reader-footer');
    footer.innerHTML=`${prev?`<a href="/cuda/read/?slug=${prev.slug}">← 第 ${prev.number} 章</a>`:'<span></span>'}${next?`<a href="/cuda/read/?slug=${next.slug}">第 ${next.number} 章 →</a>`:'<span></span>'}`;
    fetch(chapter.html).then(r=>{if(!r.ok)throw new Error('未找到章节正文');return r.text()}).then(markup=>{
      $('cuda-article').innerHTML=markup;
      if(location.hash){const id=decodeURIComponent(location.hash.slice(1));requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView())}
      if(window.MathJax?.typesetPromise) window.MathJax.typesetPromise([$('cuda-article')]).catch(()=>{});
    }).catch(e=>{$('cuda-article').innerHTML=`<h1>章节载入失败</h1><p>${safe(e.message)}。请检查是否通过网站服务器打开页面，以及 HTML 文件是否已上传。</p>`});
  }).catch(e=>{$('cuda-article')?.replaceChildren(document.createTextNode('目录加载失败：'+e.message))});
})();
