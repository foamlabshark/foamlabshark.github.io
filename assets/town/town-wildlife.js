'use strict';
(() => {
 const root=document.querySelector('#town-app');if(!root)return;
 // Small decorative sprites use CSS animation; no extra game-loop work or hit targets.
 const butterfly='<svg viewBox="0 0 24 22" aria-hidden="true" shape-rendering="crispEdges"><g class="wild-wing"><path d="M10 10 4 2H1v9l5 3-3 4 2 3 6-5Z" fill="var(--wing)"/><path d="M3 5h3v4H3zM5 15h3v3H5z" fill="#fff0c4"/></g><g class="wild-wing"><path d="m14 10 6-8h3v9l-5 3 3 4-2 3-6-5Z" fill="var(--wing)"/><path d="M18 5h3v4h-3zM16 15h3v3h-3z" fill="#fff0c4"/></g><path d="M11 7h2v12h-2zM9 4h2v3H9zM13 4h2v3h-2z" fill="#625138"/></svg>';
 const bird='<svg viewBox="0 0 36 22" aria-hidden="true" shape-rendering="crispEdges"><g class="wild-bird-wings"><path d="M17 12 8 3H3l5 8 9 5M19 12l9-9h5l-5 8-9 5" fill="#4d6657"/><path d="m7 6 9 8M29 6l-9 8" stroke="#adbea0" stroke-width="2"/></g><path d="M16 10h4v8h-4zM17 7h2v3h-2zM15 18h6v2h-6z" fill="#3c5147"/></svg>';
 function mount(game){if(!game||game.world.querySelector('.town-wildlife'))return;const layer=document.createElement('div');layer.className='town-wildlife';layer.setAttribute('aria-hidden','true');let seed=[...game.config.province].reduce((v,c)=>(v*31+c.charCodeAt(0))>>>0,7);const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);const small=innerWidth<700||navigator.hardwareConcurrency<=4;
  const anchor=[{x:850,y:710},{x:1210,y:780},{x:530,y:1130},{x:1700,y:880},{x:1850,y:1210},{x:720,y:390}];
  for(let i=0;i<(small?4:7);i++){const a=anchor[i%anchor.length],n=document.createElement('i');n.className='wild-butterfly';n.style.cssText=`left:${a.x+(rand()-.5)*90}px;top:${a.y+(rand()-.5)*65}px;--wing:${['#d8ae63','#94b6cb','#bc9fca','#eccb87'][i%4]};--drift:${6+rand()*5}s;--delay:${-rand()*10}s`;n.innerHTML=butterfly;layer.append(n);}
  for(let i=0;i<(small?2:3);i++){const n=document.createElement('i');n.className='wild-bird';n.style.cssText=`top:${320+i*270}px;--cross:${game.width+140}px;--drift:${32+i*11}s;--delay:${-12-i*9}s`;n.innerHTML=bird;layer.append(n);}
  for(let i=0;i<(small?10:18);i++){const a=anchor[i%anchor.length],n=document.createElement('i');n.className='wild-firefly';n.style.cssText=`left:${a.x+(rand()-.5)*280}px;top:${a.y+(rand()-.5)*190}px;--drift:${6+rand()*8}s;--delay:${-rand()*12}s`;n.innerHTML='<b></b>';layer.append(n);}
  game.world.append(layer);
  const watch=new IntersectionObserver(entries=>{for(const e of entries)e.target.classList.toggle('wild-offscreen',!e.isIntersecting);},{root:game.viewport,rootMargin:'160px'});
  layer.querySelectorAll('.wild-butterfly,.wild-firefly').forEach(n=>watch.observe(n));
  game.listen('destroy',()=>{watch.disconnect();layer.remove();});
 }
 function visibility(){root.classList.toggle('wildlife-paused',document.hidden);}
 addEventListener('foamlab:town-game',e=>mount(e.detail));document.addEventListener('visibilitychange',visibility);visibility();if(window.FoamTownGame?.active)mount(window.FoamTownGame.active);
})();
