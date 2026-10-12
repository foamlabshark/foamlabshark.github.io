'use strict';
(() => {
 if(!/\/(read|fvm)\//.test(location.pathname))return;
 let loading=false;
 function scan(){
  if(!document.querySelector('.fvm-lab,#fvm-catalog'))return;
  if(window.FoamFVM){window.FoamFVM.mount();return;}
  if(loading)return;loading=true;
  const css=document.createElement('link');css.rel='stylesheet';css.href='/assets/fvm-labs.css?v=20261013';document.head.append(css);
  const js=document.createElement('script');js.src='/assets/fvm-labs.js?v=20261013';js.onload=()=>window.FoamFVM?.mount();js.onerror=()=>{loading=false;};document.head.append(js);
 }
 let queued=false;const main=document.querySelector('main');
 if(main)new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;scan();});}).observe(main,{childList:true,subtree:true});
 document.addEventListener('foamlab:content-ready',()=>queueMicrotask(scan));scan();
})();
