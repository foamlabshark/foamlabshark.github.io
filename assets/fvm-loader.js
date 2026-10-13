'use strict';
(() => {
 if(!/\/(read|fvm)\//.test(location.pathname))return;
 let loading=false;
 function scan(){
  if(!document.querySelector('.fvm-lab,.fvm-book-art,#fvm-catalog'))return;
  if(window.FoamFVM){window.FoamFVM.mount();return;}
  if(loading)return;loading=true;
  if(!document.querySelector('link[data-fvm-style]')){const css=document.createElement('link');css.rel='stylesheet';css.dataset.fvmStyle='true';css.href='/assets/fvm-labs.css?v=20261013-expanded-final';document.head.append(css);}
  const loadLabs=()=>{const js=document.createElement('script');js.src='/assets/fvm-labs.js?v=20261013-expanded-final';js.onload=()=>window.FoamFVM?.mount();js.onerror=()=>{loading=false;};document.head.append(js);};
  if(window.FoamFVMExplorer){loadLabs();return;}
  const explorer=document.createElement('script');explorer.src='/assets/fvm-explorer.js?v=20261013-expanded-final';explorer.onload=loadLabs;explorer.onerror=()=>{loading=false;};document.head.append(explorer);
 }
 let queued=false;const main=document.querySelector('main');
 if(main)new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;scan();});}).observe(main,{childList:true,subtree:true});
 document.addEventListener('foamlab:content-ready',()=>queueMicrotask(scan));scan();
})();
