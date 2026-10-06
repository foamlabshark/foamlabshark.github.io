'use strict';
(() => {
  const game = window.FoamFluid;
  const notify = type => { if (parent !== window) parent.postMessage({source:'foamlab-fluid',type}, location.origin); };
  const pause = document.querySelector('[data-fluid=pause]');
  const settings = document.querySelector('#fluid-settings');
  const settingsButton = document.querySelector('[data-fluid=settings]');
  const fail = () => {
    document.querySelector('.fluid-error').hidden = false;
    document.querySelector('.fluid-tools').hidden = true;
    settings.hidden = true;
    notify('error');
  };
  document.querySelector('[data-fluid=close]').onclick = () => notify('close');
  window.addEventListener('keydown', e => {
    if(e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); notify('close'); }
  }, true);
  if (!game || window.FoamFluidError) { fail(); return; }
  let userPaused = false, hostPaused = false;
  function sync() {
    game.config.PAUSED = userPaused;
    game.suspend(userPaused || hostPaused || document.hidden);
    pause.textContent = userPaused ? '继续' : '暂停';
    pause.setAttribute('aria-pressed', String(userPaused));
    const check = settings.querySelector('[data-config=PAUSED]');
    if(check) check.checked = userPaused;
  }
  pause.onclick = () => { userPaused = !userPaused; sync(); };
  document.querySelector('[data-fluid=splash]').onclick = () => {
    game.random(); userPaused = false; sync();
  };
  document.querySelector('[data-fluid=random]').onclick = () => document.querySelector('[data-fluid=splash]').click();
  const groups = [
    ['options', [
      ['DYE_RESOLUTION','画质',[[1024,'高'],[512,'中'],[256,'低'],[128,'极低']]],
      ['SIM_RESOLUTION','模拟分辨率',[[32,'32'],[64,'64'],[128,'128'],[256,'256']]],
      ['DENSITY_DISSIPATION','染料扩散',0,4,.01],
      ['VELOCITY_DISSIPATION','速度扩散',0,4,.01],
      ['PRESSURE','压力',0,1,.01],['CURL','涡量',0,50,1],['SPLAT_RADIUS','泼洒半径',.01,1,.01],
      ['SHADING','明暗效果'],['COLORFUL','自动变色'],['PAUSED','暂停']
    ]],
    ['bloom', [['BLOOM','启用辉光'],['BLOOM_INTENSITY','强度',.1,2,.01],['BLOOM_THRESHOLD','阈值',0,1,.01]]],
    ['sunrays', [['SUNRAYS','启用光束'],['SUNRAYS_WEIGHT','权重',.3,1,.01]]],
    ['capture', [['BACK_COLOR','背景颜色','color'],['TRANSPARENT','透明背景']]]
  ];
  const resolutionKeys = new Set(['DYE_RESOLUTION','SIM_RESOLUTION']);
  const shaderKeys = new Set(['SHADING','BLOOM','SUNRAYS']);
  const colorHex = c => '#'+[c.r,c.g,c.b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
  for(const [group, rows] of groups) {
    const host = settings.querySelector('[data-fluid-'+group+']');
    for(const [key,label,kind,max,step] of rows) {
      const row = document.createElement('div'); row.className = 'fluid-setting';
      const caption = document.createElement('label'); caption.htmlFor = 'fluid-'+key; caption.textContent = label; row.append(caption);
      let input;
      if(Array.isArray(kind)) {
        input = document.createElement('select');
        for(const [value,text] of kind) input.add(new Option(text,String(value)));
        input.value = String(game.config[key]);
      } else {
        input = document.createElement('input');
        input.type = kind === 'color' ? 'color' : typeof kind === 'number' ? 'range' : 'checkbox';
        if(input.type === 'checkbox') input.checked = game.config[key];
        else if(input.type === 'color') input.value = colorHex(game.config[key]);
        else { input.min = kind; input.max = max; input.step = step; input.value = game.config[key]; }
      }
      input.id = 'fluid-'+key; input.dataset.config = key;
      input.setAttribute('aria-label',label); row.append(input);
      let number;
      if(input.type === 'range') {
        number = document.createElement('input'); number.type = 'number';
        for(const prop of ['min','max','step','value']) number[prop] = input[prop];
        number.setAttribute('aria-label',label+'数值'); row.classList.add('has-range'); row.append(number);
      }
      const change = () => {
        if(key === 'PAUSED') { userPaused = input.checked; sync(); return; }
        if(input.type === 'checkbox') game.config[key] = input.checked;
        else if(input.type === 'color') game.config[key] = {r:parseInt(input.value.slice(1,3),16),g:parseInt(input.value.slice(3,5),16),b:parseInt(input.value.slice(5,7),16)};
        else game.config[key] = Number(input.value);
        if(number) number.value = input.value;
        if(resolutionKeys.has(key)) game.resize();
        else if(shaderKeys.has(key)) game.keywords();
        else game.redraw();
      };
      input.addEventListener(input.type==='range'||input.type==='color'?'input':'change',change);
      if(number) number.onchange = () => {
        if(!number.checkValidity() || number.value==='') { number.value = input.value; return; }
        input.value = number.value; change();
      };
      if(shaderKeys.has(key) && !game.advancedEffects) { input.disabled = true; row.title = '当前设备暂不支持此效果'; }
      host.append(row);
    }
  }
  function showSettings(show) {
    settings.hidden = !show;
    settingsButton.textContent = show ? '收起设置' : '设置';
    settingsButton.setAttribute('aria-expanded',String(show));
  }
  settingsButton.onclick = () => showSettings(settings.hidden);
  document.querySelector('[data-fluid=hide-settings]').onclick = () => { showSettings(false); settingsButton.focus(); };
  showSettings(!matchMedia('(max-width:600px), (max-height:500px)').matches);
  document.querySelector('[data-fluid=capture]').onclick = () => {
    const status = settings.querySelector('[data-capture-status]');
    try { game.capture(); status.textContent = '截图已准备好，请查看浏览器下载。'; }
    catch { status.textContent = '这次截图未能保存，请稍后再试。'; }
  };
  // Capture before upstream keyboard shortcuts so one P press toggles once.
  window.addEventListener('keydown', e => {
    if (e.target.closest('input,select,button,summary') || e.repeat) return;
    if(e.code === 'KeyP') { e.preventDefault(); e.stopImmediatePropagation(); pause.click(); }
    if(e.code === 'Space') { e.preventDefault(); e.stopImmediatePropagation(); document.querySelector('[data-fluid=splash]').click(); }
  }, true);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('message', e => {
    if(e.origin !== location.origin || e.source !== parent || e.data?.source !== 'foamlab-playground') return;
    if(e.data.type === 'visibility') { hostPaused = !!e.data.hidden; sync(); }
    if(e.data.type === 'dispose') game.destroy();
  });
  window.addEventListener('pagehide', () => game.destroy(), {once:true});
  document.querySelector('canvas').addEventListener('webglcontextlost', e => { e.preventDefault(); fail(); });
  sync(); notify('ready');
})();
