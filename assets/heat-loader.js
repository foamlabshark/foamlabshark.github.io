'use strict';
(() => {
 if(!/\/read\//.test(location.pathname))return;
 let loading=false,queued=false;
 function scan(){
  if(!document.querySelector('.heat-figure,.heat-lab'))return;
  if(!document.querySelector('link[data-heat-style]')){const c=document.createElement('link');c.rel='stylesheet';c.href='/assets/heat-labs.css';c.dataset.heatStyle='true';document.head.append(c);}
  if(!document.querySelector('.heat-lab'))return;
  if(window.FoamHeat){window.FoamHeat.mount();return;}
  if(loading)return;loading=true;const s=document.createElement('script');s.src='/assets/heat-labs.js';s.onerror=()=>{loading=false;};document.head.append(s);
 }
 const main=document.querySelector('main');if(main)new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;scan();});}).observe(main,{childList:true,subtree:true});
 document.addEventListener('foamlab:content-ready',scan);scan();
})();
