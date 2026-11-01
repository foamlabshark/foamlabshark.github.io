(() => {
  const slug = id => 'parallel-hpc-' + id.toLowerCase().replaceAll('.', '-');
  const reader = (id, fragment = '') => '/read/?slug=' + encodeURIComponent(slug(id)) + fragment;
  function followLegacyLink() {
    const hash = location.hash.slice(1);
    if (/^read\/[a-z0-9.-]+$/i.test(hash)) return location.replace(reader(hash.slice(5)));
    if (['code','resources','glossary'].includes(hash)) return location.replace(reader(hash));
    if (location.pathname.endsWith('/original-index.html')) return location.replace(reader('index', location.hash));
    if (location.pathname.endsWith('/supplement.html')) {
      const group = {front:'front', A:'a', B:'b'};
      if (!hash || Object.hasOwn(group,hash)) return location.replace('/parallel-computing/#chapter-'+(group[hash]||'front'));
      if (hash === 'C') return location.replace(reader('terms'));
      if (/^(front-[a-z-]+|[AB]\.\d+)$/.test(hash)) return location.replace(reader(hash));
      return location.replace('/parallel-computing/#chapter-front');
    }
  }
  followLegacyLink();
  window.addEventListener('hashchange', followLegacyLink);
  function restoreOldNotes(){
  const host=document.getElementById('parallel-old-notes');
  if (!host) return;
  try {
    const notes=JSON.parse(localStorage.getItem('parallel-notes')||'{}');
    const done=JSON.parse(localStorage.getItem('parallel-done')||'[]');
    const ids=new Set([...Object.keys(notes||{}),...done].filter(id=>typeof id==='string' && /^[a-z0-9.-]+$/i.test(id)));
    if (!ids.size && location.hash!=='#notes') return;
    host.removeAttribute('hidden');
    const list=host.querySelector('div');
    if (!ids.size) list.textContent='此浏览器没有旧版笔记或进度。';
    for (const id of ids) {
      const p=document.createElement('p'), a=document.createElement('a');
      a.href=reader(id); a.textContent=id+(done.includes(id)?' · 已学':'');
      p.append(a, document.createTextNode(notes[id]?'　'+notes[id]:''));
      list.append(p);
    }
    if (location.hash==='#notes') {host.open=true;host.scrollIntoView();}
  } catch { /* Old reader records may be unavailable in private windows. */ }
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', restoreOldNotes, {once:true});
  else restoreOldNotes();
})();
