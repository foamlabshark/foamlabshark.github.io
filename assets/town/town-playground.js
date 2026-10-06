'use strict';
/* Lazy, local game hosting. The street keeps its position; closing destroys the iframe/GPU. */
(() => {
  const SOURCE = '/assets/town/playground/fluid/index.html';
  let ctx = null, player = null;
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function open(context) {
    ctx = context;
    context.dialog('熊猫游乐园', `<section class="town-park">
      <div class="town-park-welcome"><img src="/assets/town/playground/entrance.png" width="220" height="220" alt="竹篱笆与花丛环绕的熊猫摩天轮"><div><span class="town-park-kicker">散步的下一站</span><h3>让好奇心玩一会儿</h3><p>穿过竹门，给自己一点自由探索的时间。第一站，从一抹会流动的颜色开始。</p></div></div>
      <article class="town-park-game"><div class="town-fluid-preview" aria-hidden="true"><i></i><i></i><i></i><span>流光画布</span></div><div class="town-park-description"><span class="town-park-tag">01 · 流体游乐场</span><h3>流光画布</h3><p>拖动鼠标或手指，让颜色汇成涡旋，观察流体交融与扩散。没有分数，也不用赶时间。</p><div class="town-park-launch"><button type="button" data-park-launch="full">全屏游玩 ${icon}</button><button type="button" data-park-launch="window">小窗游玩</button></div><small>按 Esc 退出游戏；也可以点击右上角 × 返回。</small></div></article>
      <p class="town-park-credit">基于 <a href="https://github.com/PavelDoGreat/WebGL-Fluid-Simulation" target="_blank" rel="noopener noreferrer">Pavel Dobryakov · WebGL Fluid Simulation</a> · <a href="/assets/town/playground/fluid/LICENSE" target="_blank" rel="noopener">MIT 许可</a></p>
    </section>`);
    document.querySelectorAll('[data-park-launch]').forEach(b => b.onclick = () => launch(b.dataset.parkLaunch));
  }

  function launch(mode = 'window') {
    if (player || !ctx) return;
    const context = ctx, previousFocus = document.activeElement;
    context.close();
    window.FoamTownEggs?.closeTerminal?.();
    const game = window.FoamTownGame?.active;
    game?.stopMovement();
    const d = document.createElement('dialog');
    d.className = 'town-park-player' + (mode === 'full' ? ' is-full' : '');
    d.setAttribute('aria-label', '流光画布');
    d.innerHTML = `<header class="town-park-player-bar"><div><strong>流光画布</strong><span>Esc 退出</span></div><button type="button" data-park-size aria-label="切换全屏">${icon}</button><button type="button" data-park-close aria-label="关闭游戏">×</button></header><div class="town-park-screen"><p class="town-park-loading" role="status">正在调好画布的颜色…</p><iframe title="流光画布游戏" allow="fullscreen" referrerpolicy="no-referrer"></iframe><div class="town-park-load-error" hidden><p>画布暂时没有打开，请重试。</p><button type="button" data-park-retry>重新打开</button></div></div>`;
    document.body.append(d);
    const frame = d.querySelector('iframe');
    const state = player = {d, frame, game, previousFocus, context, full:false, closing:false, timer:0};
    if (game) game.externalPaused = true;
    document.documentElement.classList.add('town-playing-game');
    const close = () => stop(true);
    d.querySelector('[data-park-close]').onclick = close;
    d.querySelector('[data-park-size]').onclick = () => size(state, !d.classList.contains('is-full'));
    d.addEventListener('cancel', e => {e.preventDefault();e.stopPropagation();close();});
    d.addEventListener('close', () => {if(player === state) stop(false);});
    const start = () => {
      clearTimeout(state.timer);
      d.querySelector('.town-park-load-error').hidden = true;
      d.querySelector('.town-park-loading').hidden = false;
      frame.src = SOURCE;
      state.timer = setTimeout(() => {
        if(player !== state) return;
        d.querySelector('.town-park-loading').hidden = true;
        d.querySelector('.town-park-load-error').hidden = false;
      }, 20000);
    };
    d.querySelector('[data-park-retry]').onclick = start;
    d.showModal();
    // Must run directly in the click gesture, before any awaited work.
    if(mode === 'full') size(state, true);
    start();
  }

  function size(state, full) {
    if(player !== state || state.closing) return;
    state.d.classList.toggle('is-full', full);
    const b = state.d.querySelector('[data-park-size]');
    b.setAttribute('aria-label', full ? '切换小窗' : '切换全屏');
    if(full && !document.fullscreenElement && state.d.requestFullscreen) {
      // Viewport-filling fallback remains available when native fullscreen is denied.
      state.d.requestFullscreen().then(() => {if(player === state) state.full = true;}).catch(() => {});
    } else if(!full && document.fullscreenElement === state.d) {
      state.full = false;
      document.exitFullscreen().catch(() => {});
    }
  }

  function stop(returnToPark = true) {
    const state = player;
    if(!state || state.closing) return;
    state.closing = true;
    player = null;
    clearTimeout(state.timer);
    // Synchronously release GPU resources before removing the document.
    try {state.frame.contentWindow.FoamFluid?.destroy();} catch {}
    state.frame.remove();
    if(document.fullscreenElement === state.d) document.exitFullscreen().catch(() => {});
    state.d.close();state.d.remove();
    document.documentElement.classList.remove('town-playing-game');
    if(state.game) {state.game.externalPaused = false;state.game.last = performance.now();state.game.stopMovement();}
    if(returnToPark && state.game === window.FoamTownGame?.active) {
      open(state.context);
      document.querySelector('[data-park-launch=window]')?.focus({preventScroll:true});
    } else if(state.previousFocus?.isConnected) state.previousFocus.focus({preventScroll:true});
  }

  window.addEventListener('message', e => {
    const s = player;
    if(!s || e.origin !== location.origin || e.source !== s.frame.contentWindow || e.data?.source !== 'foamlab-fluid') return;
    if(e.data.type === 'close') {stop(true);return;}
    if(e.data.type === 'ready' || e.data.type === 'error') {
      clearTimeout(s.timer);
      s.d.querySelector('.town-park-loading').hidden = true;
      s.frame.contentWindow.postMessage({source:'foamlab-playground',type:'visibility',hidden:document.hidden}, location.origin);
      if(e.data.type === 'ready') s.frame.focus();
    }
  });
  document.addEventListener('visibilitychange', () => {
    player?.frame.contentWindow?.postMessage({source:'foamlab-playground',type:'visibility',hidden:document.hidden}, location.origin);
  });
  document.addEventListener('fullscreenchange', () => {
    const s = player;
    if(s && document.fullscreenElement === s.d) s.full = true;
    else if(s?.full) stop(true); // Browser handles Esc itself in native fullscreen.
  });
  window.addEventListener('keydown', e => {
    if(!player) return;
    e.stopImmediatePropagation();
    if(e.key === 'Escape') {e.preventDefault();stop(true);}
  }, true);
  window.addEventListener('hashchange', () => stop(false));
  window.addEventListener('pagehide', () => stop(false));
  window.addEventListener('foamlab:town-game', e => e.detail.listen('destroy', () => stop(false)));
  window.FoamTownPlayground = {open,launch,close:stop,get active(){return !!player;}};
})();
