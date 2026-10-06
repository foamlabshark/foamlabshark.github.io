'use strict';
(() => {
  const root = document.documentElement;
  const key = 'foamlab.sidebarWidth';
  const desktop = matchMedia('(min-width:761px)');
  let preferred = null;
  try { const value = Number(localStorage.getItem(key)); if (Number.isFinite(value) && value >= 200) preferred = value; } catch {}
  const bounds = () => ({min: 200, max: Math.min(480, Math.floor(innerWidth * 0.38))});
  const clamp = value => Math.round(Math.max(bounds().min, Math.min(bounds().max, value)));
  function apply() {
    if (desktop.matches && preferred !== null) root.style.setProperty('--sidebar', clamp(preferred) + 'px');
    else root.style.removeProperty('--sidebar');
  }
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('#sidebar');
    if (!sidebar) return;
    const handle = document.createElement('div');
    handle.className = 'sidebar-resizer';
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-label', '调整左侧导航宽度');
    handle.setAttribute('aria-orientation', 'vertical');
    handle.setAttribute('aria-controls', 'sidebar');
    handle.setAttribute('aria-describedby', 'sidebar-resize-help');
    handle.tabIndex = 0;
    handle.title = '左右拖动调整宽度；双击恢复默认宽度';
    const help = document.createElement('span');
    help.id = 'sidebar-resize-help'; help.className = 'sr-only';
    help.textContent = '左右方向键调整宽度，Home 缩至最窄，End 放至最宽，双击或按 Enter 恢复默认宽度。';
    sidebar.after(handle, help);
    let drag = null;
    function sync() {
      apply();
      handle.hidden = !desktop.matches;
      handle.tabIndex = desktop.matches ? 0 : -1;
      handle.setAttribute('aria-valuemin', String(bounds().min));
      handle.setAttribute('aria-valuemax', String(bounds().max));
      handle.setAttribute('aria-valuenow', String(Math.round(sidebar.getBoundingClientRect().width)));
    }
    function save() { try { if (preferred === null) localStorage.removeItem(key); else localStorage.setItem(key, String(preferred)); } catch {} }
    function finish(cancel = false) {
      if (!drag) return;
      const id = drag.id;
      if (cancel) preferred = drag.before;
      drag = null;
      root.classList.remove('sidebar-resizing');
      if (handle.hasPointerCapture(id)) handle.releasePointerCapture(id);
      sync(); save();
    }
    handle.addEventListener('pointerdown', event => {
      if (!desktop.matches || event.button !== 0) return;
      event.preventDefault(); handle.focus();
      drag = {id: event.pointerId, before: preferred, x: event.clientX, width: sidebar.getBoundingClientRect().width};
      handle.setPointerCapture(event.pointerId);
      root.classList.add('sidebar-resizing');
    });
    handle.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      preferred = clamp(drag.width + event.clientX - drag.x); sync();
    });
    handle.addEventListener('pointerup', () => finish());
    handle.addEventListener('pointercancel', () => finish(true));
    handle.addEventListener('lostpointercapture', () => finish());
    function reset() { preferred = null; sync(); save(); }
    handle.addEventListener('dblclick', reset);
    handle.addEventListener('keydown', event => {
      if (event.key === 'Escape' && drag) { finish(true); return; }
      if (event.key === 'Enter') { event.preventDefault(); reset(); return; }
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const width = sidebar.getBoundingClientRect().width, step = event.shiftKey ? 40 : 10;
      preferred = clamp(event.key === 'Home' ? bounds().min : event.key === 'End' ? bounds().max : width + (event.key === 'ArrowRight' ? step : -step));
      sync(); save();
    });
    window.addEventListener('resize', () => { if (!desktop.matches) finish(true); sync(); });
    window.addEventListener('storage', event => {
      if (event.key !== key) return;
      const value = Number(event.newValue); preferred = Number.isFinite(value) && value >= 200 ? value : null; sync();
    });
    sync();
  });
})();
