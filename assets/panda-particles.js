/* Small, bounded bursts. Nothing is emitted while selecting text or dragging. */
'use strict';
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),forced=matchMedia('(forced-colors: active)');
 let enabled=true,start=null,layer=null,last=0;try{enabled=localStorage.getItem('foamlab-panda-particles')!=='false';}catch{}
 const marks=['leaf','dot','ring','star'];
 function clear(){layer?.replaceChildren();}
 function burst(x,y,pet=false){if(!enabled||reduced.matches||forced.matches||document.hidden)return;if(!layer){layer=document.createElement('div');layer.className='panda-particles';layer.setAttribute('aria-hidden','true');document.body.append(layer);}while(layer.childElementCount>42)layer.firstChild.remove();
  const count=pet?12:8;for(let i=0;i<count;i++){const p=document.createElement('i'),angle=Math.PI*2*i/count+(Math.random()-.5)*.6,radius=22+Math.random()*(pet?53:34);p.className='panda-particle '+marks[i%marks.length];p.style.cssText=`left:${x}px;top:${y}px;--px:${Math.cos(angle)*radius}px;--py:${Math.sin(angle)*radius-13}px;--pr:${(Math.random()-.5)*240}deg;--life:${520+Math.random()*280}ms;--size:${4+Math.random()*4}px;--delay:${i*7}ms;`;layer.append(p);setTimeout(()=>p.remove(),1000);}
 }
 document.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY,id:e.pointerId};},{passive:true});
 document.addEventListener('pointercancel',()=>start=null,{passive:true});
 document.addEventListener('click',e=>{const origin=start;start=null;if(!e.isTrusted||e.detail===0||e.button!==0||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey)return;const target=e.target instanceof Element?e.target:null;if(!target||target.closest('input,textarea,select,[contenteditable],:disabled,[aria-disabled=true]'))return;if(origin&&Math.hypot(e.clientX-origin.x,e.clientY-origin.y)>8)return;if(window.getSelection()?.toString())return;if(Date.now()-last<100)return;last=Date.now();burst(e.clientX,e.clientY,!!target.closest('.panda-grab,.panda-home-portrait'));},{passive:true});
 window.foamPandaParticles={burst,get enabled(){return enabled;},set(enabledNext){enabled=!!enabledNext;try{localStorage.setItem('foamlab-panda-particles',String(enabled));}catch{}if(!enabled)clear();}};
 reduced.addEventListener('change',clear);forced.addEventListener('change',clear);document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
})();
