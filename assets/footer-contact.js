'use strict';
(() => {
  const wrap = document.querySelector('[data-footer-contact]');
  if (!wrap) return;
  const trigger = wrap.querySelector('button');
  const panel = wrap.querySelector('.footer-contact-panel');
  let opened = false;
  const position = () => {
    panel.style.setProperty('--contact-shift', '0px');
    const bounds = panel.getBoundingClientRect();
    const edge = 12;
    const shift = bounds.left < edge ? edge - bounds.left
      : bounds.right > innerWidth - edge ? innerWidth - edge - bounds.right : 0;
    panel.style.setProperty('--contact-shift', shift + 'px');
  };
  const hide = () => {
    opened = false;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  };
  const show = () => {
    opened = true;
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    position();
  };
  wrap.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && matchMedia('(hover: hover)').matches) show();
  });
  wrap.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') hide();
  });
  wrap.addEventListener('focusin', event => {
    if (event.target !== trigger || matchMedia('(hover: hover)').matches) show();
  });
  wrap.addEventListener('focusout', () => {
    setTimeout(() => { if (!wrap.contains(document.activeElement)) hide(); }, 0);
  });
  trigger.addEventListener('click', () => {
    if (matchMedia('(hover: hover)').matches || !opened) show();
    else hide();
  });
  document.addEventListener('pointerdown', event => {
    if (opened && !wrap.contains(event.target)) hide();
  });
  document.addEventListener('keydown', event => {
    if (opened && event.key === 'Escape') {
      if (panel.contains(document.activeElement)) trigger.focus();
      hide();
    }
  });
  window.addEventListener('resize', () => { if (opened) position(); });
})();
