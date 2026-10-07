'use strict';
/* One conversation at a time. The native dialog pauses the town and contains keyboard focus. */
(() => {
 const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let dialog, turn = 0, timer, generation = 0, busy = false, full = '', printed = 0, config;
 const split = text => String(text).split(/\n\n+/).flatMap(p => {
  const parts = p.match(/[^。！？]+[。！？]?/g) || [p], pages = []; let line = '';
  for (const s of parts) { if (line.length + s.length > 105 && line) { pages.push(line); line = ''; } line += s; }
  if (line.trim()) pages.push(line.trim()); return pages;
 });
 function ensure() {
  if (dialog) return;
  dialog = document.createElement('dialog'); dialog.id = 'town-conversation'; dialog.setAttribute('aria-labelledby','town-conversation-name');
  document.getElementById('town-app').append(dialog);
  dialog.addEventListener('close', () => { clearInterval(timer); generation++; busy = false; config?.onClose?.(); });
  dialog.addEventListener('cancel', e => { if (busy) e.preventDefault(); });
  dialog.addEventListener('keydown', e => {
   if (['Enter',' '].includes(e.key) && !e.target.closest('[data-talk-choice],[data-talk-close]')) {
    e.preventDefault(); e.stopPropagation(); if (!e.repeat && !busy) advance();
   }
  });
 }
 function show(options) {
  ensure(); clearInterval(timer); generation++; busy = false; turn = 0;
  config = {...options, pages: options.pages.flatMap(p => typeof p === 'string' ? split(p).map(text => ({text})) : split(p.text).map(text => ({...p,text})))};
  document.querySelector('#town-dialog[open]')?.close();
  window.FoamTownGame?.active?.stopMovement();
  draw(); if (!dialog.open) dialog.showModal(); dialog.querySelector('[data-talk-advance]')?.focus({preventScroll:true});
 }
 function finishTyping() { clearInterval(timer); printed = full.length; dialog.querySelector('[data-talk-text]').textContent = full; reveal(); }
 function reveal() {
  const last = turn === config.pages.length - 1;
  dialog.querySelector('[data-talk-choices]').hidden = !last;
  const b = dialog.querySelector('[data-talk-advance]'); b.hidden = last && !!config.choices?.length;
  b.textContent = last ? '结束交谈' : '继续 ▾';
 }
 function advance() { if (busy) return; if (printed < full.length) return finishTyping(); if (turn < config.pages.length - 1) { turn++; draw(); } else close(); }
 function draw() {
  clearInterval(timer); const page = config.pages[turn] || {text:''};
  full = page.text; printed = 0;
  const speaker = page.speaker || config.name;
  dialog.innerHTML = `<div class="town-talk-portrait">${config.portrait || '<span aria-hidden="true">🐼</span>'}<strong id="town-conversation-name">${esc(speaker)}</strong><small>${esc(config.role || '小镇居民')}</small></div><div class="town-talk-content"><button type="button" data-talk-close aria-label="暂时结束交谈">×</button><p data-talk-text aria-hidden="true"></p><p class="town-talk-sr" role="status">${esc(full)}</p><div data-talk-choices hidden>${(config.choices||[]).map((c,i)=>`<button type="button" data-talk-choice="${i}" ${c.disabled?'disabled':''}>${esc(c.label)}</button>`).join('')}</div><p class="town-talk-error" role="alert"></p><footer><small>${turn+1} / ${config.pages.length} · 点击文字或按空格继续</small><button type="button" data-talk-advance>继续 ▾</button></footer></div>`;
  dialog.querySelector('[data-talk-close]').onclick = close;
  dialog.querySelector('[data-talk-advance]').onclick = advance;
  dialog.querySelector('[data-talk-text]').onclick = advance;
  dialog.querySelectorAll('[data-talk-choice]').forEach(b => b.onclick = async () => {
   if (busy) return; const rev = generation; busy = true;
   dialog.querySelectorAll('button').forEach(n => n.disabled = true);
   try { await config.choices[+b.dataset.talkChoice].run?.(); }
   catch (e) { if (dialog.open && rev === generation) dialog.querySelector('.town-talk-error').textContent = e.message || String(e); }
   finally { if (rev === generation) { busy = false; dialog.querySelectorAll('button').forEach(n => n.disabled = n.hasAttribute('data-talk-choice') && !!config.choices[+n.dataset.talkChoice].disabled); } }
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) finishTyping();
  else timer = setInterval(() => { printed = Math.min(full.length,printed+2); dialog.querySelector('[data-talk-text]').textContent = full.slice(0,printed); if (printed === full.length) { clearInterval(timer); reveal(); } },24);
 }
 function close() { if (busy) return; dialog?.close(); window.FoamTownGame?.active?.viewport.focus({preventScroll:true}); }
 function dismiss() { busy = false; close(); }
 window.addEventListener('foam-auth-change', dismiss);
 window.FoamTownDialogue = {show, close:dismiss, get open(){return !!dialog?.open;}};
})();
