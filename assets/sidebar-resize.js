'use strict';
(() => {
  const root = document.documentElement;
  const key = 'foamlab.sidebarWidth';
  const collapsedKey = 'foamlab.sidebarCollapsed';
  const desktop = matchMedia('(min-width:761px)');
  let preferred = null, collapsed = false;
  try { const value = Number(localStorage.getItem(key)); if (Number.isFinite(value) && value >= 200) preferred = value; } catch {}
  try { collapsed = localStorage.getItem(collapsedKey) === '1'; } catch {}
  const bounds = () => ({min: 200, max: Math.min(480, Math.floor(innerWidth * 0.38))});
  const clamp = value => Math.round(Math.max(bounds().min, Math.min(bounds().max, value)));
  function apply() {
    root.classList.toggle('sidebar-collapsed', collapsed);
    if (desktop.matches && preferred !== null) root.style.setProperty('--sidebar', clamp(preferred) + 'px');
    else root.style.removeProperty('--sidebar');
  }
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('#sidebar');
    if (!sidebar || document.body.dataset.section === 'town') return;
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'sidebar-toggle';
    toggle.setAttribute('aria-controls', 'sidebar');
    toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>';
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
    sidebar.after(handle, help, toggle);
    let drag = null;
    function sync() {
      apply();
      handle.hidden = !desktop.matches || collapsed;
      handle.tabIndex = desktop.matches && !collapsed ? 0 : -1;
      toggle.hidden = !desktop.matches;
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.setAttribute('aria-label', collapsed ? '展开左侧导航' : '收起左侧导航');
      toggle.title = collapsed ? '向右展开导航' : '向左收起导航';
      if (desktop.matches) {
        if (collapsed && sidebar.contains(document.activeElement)) toggle.focus();
        sidebar.inert = collapsed;
        if (collapsed) sidebar.setAttribute('aria-hidden', 'true');
        else sidebar.removeAttribute('aria-hidden');
      }
      handle.setAttribute('aria-valuemin', String(bounds().min));
      handle.setAttribute('aria-valuemax', String(bounds().max));
      handle.setAttribute('aria-valuenow', String(Math.round(sidebar.getBoundingClientRect().width)));
    }
    function save() { try { if (preferred === null) localStorage.removeItem(key); else localStorage.setItem(key, String(preferred)); } catch {} }
    function setCollapsed(value) {
      finish(); collapsed = value; sync();
      try { localStorage.setItem(collapsedKey, collapsed ? '1' : '0'); } catch {}
    }
    toggle.addEventListener('click', () => setCollapsed(!collapsed));
    toggle.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault(); setCollapsed(event.key === 'ArrowLeft');
    });
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
      if (!desktop.matches || collapsed || event.button !== 0) return;
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
      if (event.key === collapsedKey) { collapsed = event.newValue === '1'; sync(); return; }
      if (event.key !== key) return;
      const value = Number(event.newValue); preferred = Number.isFinite(value) && value >= 200 ? value : null; sync();
    });
    sync();
    requestAnimationFrame(() => root.classList.add('sidebar-ready'));
  });
})();
