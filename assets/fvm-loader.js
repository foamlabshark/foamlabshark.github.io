'use strict';
(() => {
 if(!/\/read\//.test(location.pathname))return;
 let loading=false;
 function scan(){
  const book=!!window.foamCurrentContent?.metadata?.fvm_book;
  document.querySelector('#live-article')?.classList.toggle('fvm-book-lesson',book);
  if(!book&&!document.querySelector('.fvm-lab,.fvm-book-art'))return;
  if(!document.querySelector('link[data-fvm-style]')){const css=document.createElement('link');css.rel='stylesheet';css.dataset.fvmStyle='true';css.href='/assets/fvm-labs.css?v=20261013-fvm-navigation';document.head.append(css);}
  for(const img of document.querySelectorAll('.fvm-book-art img:not([data-fvm-sized])')){
   const width=Number(img.getAttribute('width'));
   if(width>0&&width<20000)img.style.setProperty('--fvm-art-width',Math.min(width/2,840)+'px');
   img.dataset.fvmSized='true';
  }
  if(!document.querySelector('.fvm-lab'))return;
  if(window.FoamFVM){window.FoamFVM.mount();return;}
  if(loading)return;loading=true;
  const loadLabs=()=>{const js=document.createElement('script');js.src='/assets/fvm-labs.js?v=20261013-fvm-navigation';js.onload=()=>window.FoamFVM?.mount();js.onerror=()=>{loading=false;};document.head.append(js);};
  if(window.FoamFVMExplorer){loadLabs();return;}
  const explorer=document.createElement('script');explorer.src='/assets/fvm-explorer.js?v=20261013-fvm-navigation';explorer.onload=loadLabs;explorer.onerror=()=>{loading=false;};document.head.append(explorer);
 }
 let queued=false;const main=document.querySelector('main');
 if(main)new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;scan();});}).observe(main,{childList:true,subtree:true});
 document.addEventListener('foamlab:content-ready',()=>queueMicrotask(scan));scan();
})();
