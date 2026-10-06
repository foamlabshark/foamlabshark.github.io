'use strict';

// Passive visual feedback; navigation, form submission and text selection remain native.
(() => {
  if (window.foamRefinementsReady) return;
  window.foamRefinementsReady = true;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedColours = matchMedia('(forced-colors: active)');
  let layer;
  let pointerStart;

  document.addEventListener('pointerdown', event => {
    pointerStart = event.isPrimary && event.button === 0
      ? { x: event.clientX, y: event.clientY, id: event.pointerId } : undefined;
  }, { passive: true });
  document.addEventListener('pointercancel', () => { pointerStart = undefined; }, { passive: true });

  document.addEventListener('click', event => {
    if (window.foamPandaParticles) return;
    if (reducedMotion.matches || forcedColours.matches || !event.isTrusted || event.detail === 0) return;
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest('input, textarea, select, option, [contenteditable="true"], [disabled], [aria-disabled="true"]')) return;
    // Ignore drags and text selections; keyboard activation uses the visible focus outline.
    if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 10) return;
    pointerStart = undefined;
    if (window.getSelection()?.toString()) return;
    if (!target.closest('main, .topbar, .sidebar, .footer, dialog')) return;
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'foam-ripple-layer';
      layer.setAttribute('aria-hidden', 'true');
      document.body.append(layer);
    }
    // Keep the number of temporary decorative nodes bounded, including rapid repeated input.
    while (layer.childElementCount >= 6) layer.firstElementChild.remove();
    const ripple = document.createElement('span');
    ripple.className = 'foam-ripple';
    ripple.style.left = event.clientX + 'px';
    ripple.style.top = event.clientY + 'px';
    layer.append(ripple);
    setTimeout(() => ripple.remove(), 750);
  }, { passive: true });

  function clearRings() { if (reducedMotion.matches || forcedColours.matches) layer?.replaceChildren(); }
  reducedMotion.addEventListener('change', clearRings);
  forcedColours.addEventListener('change', clearRings);
})();
