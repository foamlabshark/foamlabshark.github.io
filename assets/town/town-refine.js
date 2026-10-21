'use strict';
/* Keeps world labels readable: a building plaque fades while a resident's name tag sits on top of it. */
(() => {
 let last=0;
 const overlaps=(a,b)=>a.left<b.right-2&&a.right>b.left+2&&a.top<b.bottom-2&&a.bottom>b.top+2;
 function frame(now){
  requestAnimationFrame(frame);
  if(now-last<240||document.hidden)return;last=now;
  const world=document.querySelector('#town-app .town-game-world');if(!world)return;
  const tags=[...world.querySelectorAll('.town-resident>span')].map(n=>n.getBoundingClientRect()).filter(r=>r.width);
  for(const sign of world.querySelectorAll('.town-sign')){const r=sign.getBoundingClientRect();sign.classList.toggle('is-occluded',r.width>0&&tags.some(t=>overlaps(t,r)));}
 }
 requestAnimationFrame(frame);
})();
