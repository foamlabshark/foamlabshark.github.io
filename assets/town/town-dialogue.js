'use strict';
/* One conversation at a time. The native dialog pauses the town and contains keyboard focus. */
(() => {
 const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let dialog, turn = 0, timer, generation = 0, busy = false, full = '', printed = 0, config;
 // Painted dialogue heads are independent from the small walking sprite sheets.
 const portraits = ['heng','muxi','lan','tie','cheng','yan','mayor','gardener','fisher','postman','merchant','librarian','engineer','tea','researcher'];
 const portrait = id => {
  const index = portraits.indexOf(String(id).replace(/^story-/,''));
  if (index < 0) return '';
  const col = index % 3, row = Math.floor(index / 3), xs = [0,324,647,971], ys = [0,323,642,955,1260,1619];
  return `<svg class="town-npc-portrait town-rpg-portrait" data-npc-portrait="${portraits[index]}" viewBox="${xs[col]} ${ys[row]} ${xs[col+1]-xs[col]} ${ys[row+1]-ys[row]}" aria-hidden="true"><image href="/assets/town/story-npc-portraits.webp" width="971" height="1619"/></svg>`;
 };
 const split = text => String(text).split(/\n\n+/).flatMap(p => {
  const parts = p.match(/[^。！？]+[。！？]?/g) || [p], pages = []; let line = '';
  for (const s of parts) { if (line.length + s.length > 105 && line) { pages.push(line); line = ''; } line += s; }
  if (line.trim()) pages.push(line.trim()); return pages;
 });
 function ensure() {
  if (dialog) return;
  dialog = document.createElement('dialog'); dialog.id = 'town-conversation'; dialog.setAttribute('aria-labelledby','town-conversation-name');
  dialog.innerHTML = '<div class="town-talk-portrait"><div data-talk-head></div><strong id="town-conversation-name"></strong><small data-talk-role></small></div><div class="town-talk-content"><button type="button" data-talk-close aria-label="暂时结束交谈">×</button><b class="town-talk-speaker" hidden></b><div class="town-talk-line"><p data-talk-measure aria-hidden="true"></p><p data-talk-text aria-hidden="true"></p></div><p class="town-talk-sr" role="status"></p><div data-talk-choices hidden></div><p class="town-talk-error" role="alert"></p><footer><button type="button" data-talk-advance>继续 ▾</button></footer></div>';
  document.getElementById('town-app').append(dialog);
  // Native close events are queued. A previous close must not cancel a newly opened conversation.
  dialog.addEventListener('close', () => { if (!dialog.open) end(); });
  dialog.addEventListener('cancel', e => { e.preventDefault(); close(); });
  dialog.querySelector('[data-talk-close]').onclick = close;
  dialog.querySelector('[data-talk-advance]').onclick = advance;
  dialog.querySelector('[data-talk-text]').onclick = advance;
  dialog.querySelector('[data-talk-choices]').onclick = async e => {
   const b=e.target.closest('[data-talk-choice]'); if (!b || b.disabled || busy || !config) return;
   const choice=config.choices[+b.dataset.talkChoice], rev=generation; busy=true;
   dialog.querySelector('.town-talk-error').textContent='';
   dialog.querySelectorAll('button').forEach(n=>n.disabled=true);
   try { await choice.run?.(); }
   catch (error) { if (isCurrent(rev)) dialog.querySelector('.town-talk-error').textContent=error.message||String(error); }
   finally { if (isCurrent(rev)) { busy=false; enableButtons(); } }
  };
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
  const head=dialog.querySelector('[data-talk-head]'), markup=portrait(config.npcId)||config.portrait||'<span aria-hidden="true">🐼</span>';
  if(head.dataset.markup!==markup){head.innerHTML=markup;head.dataset.markup=markup;}
  dialog.querySelector('#town-conversation-name').textContent=config.name;
  dialog.querySelector('[data-talk-role]').textContent=config.role||'小镇居民';
  renderChoices(); enableButtons(); draw(); if (!dialog.open) dialog.showModal();
  const next=dialog.querySelector('[data-talk-advance]');
  (next.hidden?dialog.querySelector('[data-talk-choice]:not(:disabled)'):next)?.focus({preventScroll:true});
  return generation;
 }
 function isCurrent(rev) { return !!dialog?.open && !!config && rev===generation; }
 function enableButtons() { dialog.querySelectorAll('button').forEach(n=>n.disabled=n.hasAttribute('data-talk-choice')&&!!config.choices?.[+n.dataset.talkChoice]?.disabled); }
 function renderChoices() {
  const host=dialog.querySelector('[data-talk-choices]'), focused=host.contains(document.activeElement)?document.activeElement.textContent:null;
  host.innerHTML=(config.choices||[]).map((c,i)=>`<button type="button" data-talk-choice="${i}" ${c.disabled?'disabled':''}>${esc(c.label)}</button>`).join('');
  if(focused)[...host.children].find(b=>b.textContent===focused&&!b.disabled)?.focus({preventScroll:true});
 }
 function updateChoices(choices,rev) {
  if(!isCurrent(rev)||busy)return false;
  config.choices=choices;renderChoices();if(printed===full.length)reveal();return true;
 }
 function finishTyping() { clearInterval(timer); printed = full.length; dialog.querySelector('[data-talk-text]').textContent = full; reveal(); }
 function reveal() {
  const last = turn === config.pages.length - 1;
  const choices=dialog.querySelector('[data-talk-choices]');choices.hidden = !last;
  const b = dialog.querySelector('[data-talk-advance]'); b.hidden = last && !!config.choices?.length;
  b.textContent = last ? '结束交谈' : '继续 ▾';
  if(b.hidden&&document.activeElement===b)choices.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
 }
 function advance() { if (busy) return; if (printed < full.length) return finishTyping(); if (turn < config.pages.length - 1) { turn++; draw(); } else close(); }
 function draw() {
  clearInterval(timer); const page = config.pages[turn] || {text:''};
  full = page.text; printed = 0;
  const speaker = page.speaker || config.name;
  const label=dialog.querySelector('.town-talk-speaker');label.hidden=speaker===config.name;label.textContent=speaker+'：';
  dialog.querySelector('[data-talk-text]').textContent='';
  // Reserve the complete line's space while typing so the frame and portrait stay still.
  dialog.querySelector('[data-talk-measure]').textContent=full;
  dialog.querySelector('.town-talk-sr').textContent=full;
  dialog.querySelector('[data-talk-choices]').hidden=true;
  dialog.querySelector('.town-talk-error').textContent='';
  const next=dialog.querySelector('[data-talk-advance]');next.hidden=false;next.textContent='继续 ▾';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) finishTyping();
  else timer = setInterval(() => { printed = Math.min(full.length,printed+2); dialog.querySelector('[data-talk-text]').textContent = full.slice(0,printed); if (printed === full.length) { clearInterval(timer); reveal(); } },24);
 }
 function end() { if(!config)return;clearInterval(timer);generation++;busy=false;const previous=config;config=null;previous.onClose?.(); }
 function close() { if (busy || !dialog?.open) return; dialog.close();end();window.FoamTownGame?.active?.viewport.focus({preventScroll:true}); }
 function dismiss() { busy = false; close(); }
 window.addEventListener('foam-auth-change', dismiss);
 window.FoamTownNPCPortrait = portrait;
 window.FoamTownDialogue = {show, updateChoices, isCurrent, close:dismiss, get open(){return !!dialog?.open;}};
})();
