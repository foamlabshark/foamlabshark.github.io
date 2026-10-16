'use strict';
(() => {
 const root=document.documentElement,media=matchMedia('(prefers-color-scheme: dark)');
 const modes={system:'跟随系统',light:'亮色',dark:'暗色'};
 const palettes={green:'青松绿',blue:'雾海蓝',pink:'蔷薇粉',lavender:'浅藤紫',beige:'暖米黄'};
 let choice='system',palette='green';
 function read(){try{choice=localStorage.getItem('foamlab.theme')||'system';palette=localStorage.getItem('foamlab.palette')||'green';}catch{}if(!Object.hasOwn(modes,choice))choice='system';if(!Object.hasOwn(palettes,palette))palette='green';}
 function save(key,value){try{localStorage.setItem(key,value);}catch{}}
 const modeIcons={dark:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',system:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor"/>'};
 const svg=body=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+body+'</svg>';
 function apply(){
  root.dataset.theme=choice==='system'?(media.matches?'dark':'light'):choice;
  root.dataset.palette=palette;root.style.colorScheme=root.dataset.theme;
  const mode=document.getElementById('theme-toggle'),color=document.getElementById('palette-toggle');
  if(mode){mode.innerHTML=svg(modeIcons[choice]);mode.setAttribute('aria-label','显示模式：'+modes[choice]+'，点击切换');mode.title='显示模式：'+modes[choice];}
  if(color){color.setAttribute('aria-label','主题配色：'+palettes[palette]);color.title='主题配色：'+palettes[palette];}
  document.querySelectorAll('input[name="foamlab-palette"]').forEach(input=>{input.checked=input.value===palette;});
  const background=getComputedStyle(root).getPropertyValue('--bg').trim();
  if(background)document.querySelectorAll('meta[name="theme-color"]').forEach(meta=>meta.content=background);
  window.dispatchEvent(new CustomEvent('foamlab:appearance-change',{detail:{palette,theme:root.dataset.theme,mode:choice}}));
 }
 read();apply();media.addEventListener('change',apply);
 window.addEventListener('storage',event=>{if(event.key===null||['foamlab.theme','foamlab.palette'].includes(event.key)){read();apply();}});
 document.addEventListener('DOMContentLoaded',()=>{
  const bar=document.querySelector('.topbar');if(!bar)return;
  const controls=document.createElement('div');controls.className='appearance-controls';
  controls.innerHTML='<button id="palette-toggle" class="appearance-button" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="palette-panel">'+svg('<path d="M12 3a9 9 0 1 0 0 18h1.2a2.2 2.2 0 0 0 1.6-3.7 1.4 1.4 0 0 1 1-2.3h1.3A3.9 3.9 0 0 0 21 11a9 9 0 0 0-9-8Z"/><circle cx="7.6" cy="11" r=".8" fill="currentColor"/><circle cx="10" cy="7.2" r=".8" fill="currentColor"/><circle cx="14.7" cy="7.8" r=".8" fill="currentColor"/>')+'</button><button id="theme-toggle" class="theme-toggle appearance-button" type="button"></button><div id="palette-panel" class="palette-panel" role="dialog" aria-modal="false" aria-labelledby="palette-title" hidden><div class="palette-heading"><strong id="palette-title">主题配色</strong><button class="palette-close" type="button" aria-label="关闭配色面板">'+svg('<path d="m7 7 10 10M17 7 7 17"/>')+'</button></div><fieldset class="palette-options"><legend class="visually-hidden">选择主题色</legend>'+Object.entries(palettes).map(([key,name])=>'<label class="palette-option"><input type="radio" name="foamlab-palette" value="'+key+'"><span class="palette-swatch" data-swatch="'+key+'" aria-hidden="true">'+svg('<path d="m6 12 4 4 8-8"/>')+'</span><span>'+name+'</span></label>').join('')+'</fieldset><p class="palette-hint">配色适用于亮色与暗色模式</p></div>';
  bar.insertBefore(controls,bar.querySelector('.account-actions,.account-nav'));
  const toggle=controls.querySelector('#palette-toggle'),panel=controls.querySelector('#palette-panel');
  function close(restore=false){panel.hidden=true;toggle.setAttribute('aria-expanded','false');if(restore)toggle.focus();}
  toggle.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open)panel.querySelector('input:checked')?.focus();});
  controls.querySelector('.palette-close').addEventListener('click',()=>close(true));
  panel.addEventListener('change',event=>{if(event.target.name!=='foamlab-palette')return;palette=event.target.value;save('foamlab.palette',palette);apply();});
  controls.querySelector('#theme-toggle').addEventListener('click',()=>{choice=choice==='system'?'light':choice==='light'?'dark':'system';save('foamlab.theme',choice);apply();window.foamNotify?.('显示模式：'+modes[choice]);});
  document.addEventListener('pointerdown',event=>{if(!controls.contains(event.target))close();});
  document.addEventListener('focusin',event=>{if(!controls.contains(event.target))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();close(true);}});
  apply();
 });
})();
