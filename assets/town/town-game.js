'use strict';
/* Panda Town engine: 8-direction movement with inertia, sliding collision, A* click-to-walk,
 * stride-driven sprite animation, wandering neighbours, smooth camera and a live minimap.
 * World coordinates are pixels of the 2460×1760 village; a panda's (x, y) is the point under its feet. */
(() => {
 const TILE=24,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,damp=(rate,dt)=>1-Math.exp(-rate*dt);
 const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
 const random=seed=>()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 let active=null,plotOffsets=null;
 // Physical key codes first, so an IME that reports key="Process" (or a different key on release) still moves the panda.
 const BY_CODE={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
 const BY_KEY={w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'};
 const VEC={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0],'up-left':[-1,-1],'up-right':[1,-1],'down-left':[-1,1],'down-right':[1,1]};
 const PAD={w:'up',s:'down',a:'left',d:'right',wa:'up-left',wd:'up-right',sa:'down-left',sd:'down-right'};
 const SECTORS=['right','down-right','down','down-left','left','up-left','up','up-right'];
 const ROW={down:0,left:1,up:2,right:3};
 const SPEED={walk:150,jog:190,skateboard:215,bicycle:240,balloon:120};
 const SUBTITLE={notice:'网站公告',school:'系统学习',workshop:'网格与专题',hospital:'讨论与答疑',library:'资料中心',gallery:'实践与分享',playground:'游乐园 · 流光画布',spot:'小镇景点',institute:'研究所',gate:'通往小镇地图'};
 const keyId=e=>/^Numpad[1-6]$/.test(e.code)?'':BY_CODE[e.code]?e.code:BY_KEY[(e.key||'').toLowerCase()]?'key:'+e.key.toLowerCase():'';
 const keyDir=id=>BY_CODE[id]||BY_KEY[id.slice(4)];
 const editing=target=>target?.isContentEditable||target?.closest?.('input,textarea,select');
 const fmt=v=>Math.round(v*10)/10;

 /* One walking panda on screen: the player, an online neighbour or a town NPC. */
 class Mover{
  constructor(el,x,y,kind){this.kind=kind;this.x=x;this.y=y;this.vx=0;this.vy=0;this.face='down';this.phase=1;this.lean=0;this.t=Math.random()*9;this.turn=0;this.lastStep=-1;this.bind(el);}
  bind(el){this.el=el;this.body=el.querySelector('.town-body')||el;this.sprite=el.querySelector('.town-pixel-panda');this.shadow=el.querySelector('.town-shadow');this.css={};}
  set(node,prop,value){if(!node||this.css[prop]===value)return;this.css[prop]=value;const name=prop.split('|')[0];if(name.startsWith('--'))node.style.setProperty(name,value);else node.style[name]=value;}
  draw(dt,quiet){
   const speed=Math.hypot(this.vx,this.vy),moving=speed>14&&!this.busy;this.t+=dt;
   if(moving){const ax=Math.abs(this.vx),ay=Math.abs(this.vy),want=ax>ay*.55?(this.vx<0?'left':'right'):(this.vy<0?'up':'down');
    // A short hold before turning stops the sprite flickering on diagonals.
    if(want!==this.face){this.turn+=dt;if(this.turn>.06||!this.wasMoving){this.face=want;this.turn=0;}}else this.turn=0;
    this.phase+=speed*dt/(speed>185?23:17);}
   else this.phase=1;
   if(this.forceFace)this.face=this.forceFace;
   const frame=moving?Math.floor(this.phase)%4:1,step=moving?Math.abs(Math.sin(this.phase*Math.PI/2)):0;
   if(moving&&frame!==this.lastStep&&frame%2===0)this.onStep?.(this,speed);this.lastStep=frame;this.wasMoving=moving;
   this.lean=lerp(this.lean,moving?clamp(this.vx/260,-1,1)*5:0,damp(10,dt));
   let bob=0,sx=1,sy=1;
   if(!quiet){if(moving){bob=-step*(speed>185?4.2:3.2);sy=.955+.06*step;sx=1.035-.045*step;}else{const b=Math.sin(this.t*2.3);sy=1+.018*b;sx=1-.009*b;}}
   this.set(this.sprite,'backgroundPosition',`${frame*100/3}% ${ROW[this.face]*100/3}%`);
   this.set(this.body,'transform|b',quiet?'none':`translate3d(0,${fmt(bob)}px,0) rotate(${fmt(this.lean)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`);
   this.set(this.shadow,'transform|s',`scale(${(1-step*.16).toFixed(3)})`);
   this.set(this.el,'transform|position',`translate3d(${fmt(this.x-32)}px,${fmt(this.y-62)}px,0)`);this.set(this.el,'zIndex|z',String(Math.floor(this.y)));
   if(this.el.dataset.direction!==this.face)this.el.dataset.direction=this.face;
   const flag=moving?'true':'false';if(this.el.dataset.moving!==flag)this.el.dataset.moving=flag;
   // Walking off ends an action pose (wave, dance…); it is only a pose while standing still.
   if(moving&&this.el.dataset.action&&this.el.dataset.action!=='walk')window.foamPandaMotion?.stop(this.el);
  }
 }

 class TownGame{
  constructor(viewport,config){active?.destroy();active=this;this.viewport=viewport;this.world=viewport.querySelector('.town-street-world');this.config=config;this.width=config.scene?1920:2460;this.height=config.scene?1440:1760;
   // Authored village plots: public buildings surround a clearing, houses follow the landscape.
   const publicPlots={notice:[58,348],school:[478,158],workshop:[1282,199],hospital:[1782,409],library:[883,113],gallery:[1322,736],spot:[963,683],playground:[1790,1175]};
   const homes=[[38,658],[612,765],[2054,578],[1888,977],[486,1176],[754,1194],[1022,1112],[1382,1206],[1636,1194],[1650,138]];
   let house=0,group=0;this.positions=config.buildings.map(b=>{let p;if(b[3])p=homes[house++%homes.length];else if(b[0]==='gate')p=[-500,-500];else if(b[0]==='institute'){const n=group++;p=[430+(n%4)*400,1730+Math.floor(n/4)*340];this.height=Math.max(this.height,p[1]+330);}else p=publicPlots[b[0]]||[2100,160];return{x:p[0],y:p[1],hidden:b[0]==='gate'};});
   if(config.scene)this.positions=config.scene.plots.map(([x,y])=>({x,y,hidden:false}));
   this.keys=new Map();this.pad=null;this.path=[];this.camera={x:0,y:0,ready:false};this.zoom=1;this.zoomTarget=this.savedZoom();this.handlers=[];this.hooks={};this.movers=new Map();this.npcs=new Map();this.extras=[];this.running=false;this.speedMultiplier=1;try{const speed=Number(localStorage.getItem('foamlab.town.speed'));if([1,2,4].includes(speed))this.speedMultiplier=speed;}catch{}this.locked=false;this.focus=null;this.banner={id:null,at:0,shown:new Map()};
   this.decor();this.buildGrid();
   const start=this.open(config.scene?360:1035,config.scene?740:954);this.position={x:start.x,y:start.y};this.me={x:start.x,y:start.y,vx:0,vy:0};
   this.prompt=document.createElement('button');this.prompt.type='button';this.prompt.className='town-prompt';this.prompt.hidden=true;this.world.append(this.prompt);this.on(this.prompt,'click',e=>{e.stopPropagation();this.interact();});
   this.bannerEl=document.createElement('div');this.bannerEl.className='town-area-banner';this.bannerEl.setAttribute('aria-live','polite');this.viewport.parentElement.append(this.bannerEl);
   this.bind();this.last=performance.now();this.tick=this.tick.bind(this);this.frame=requestAnimationFrame(this.tick);}
  on(target,event,fn,options){target.addEventListener(event,fn,options);this.handlers.push(()=>target.removeEventListener(event,fn,options));}
  listen(name,fn){(this.hooks[name]||=[]).push(fn);}
  emit(name,detail){for(const fn of this.hooks[name]||[])try{fn(detail);}catch(error){console.error(error);}}
  savedZoom(){try{const z=Number(localStorage.getItem('foamlab.town.zoom'));if(z>=.7&&z<=1.35)return z;}catch{}return innerWidth<700?.83:1;}
  decor(){if(this.config.scene)return window.FoamTownStoryWorld.decorate(this);const w=this.world;w.style.width=this.width+'px';w.style.height=this.height+'px';w.classList.add('town-game-world');w.dataset.quiet=String(this.config.muted?.()||false);w.querySelectorAll('.town-cloud').forEach(e=>e.remove());this.obstacles=[];
   const ground=document.createElement('div');ground.className='town-game-ground';
   const pathData=[
    'M0 980 C260 860 430 905 660 1080 S1050 920 1180 945 S1490 1180 1690 1020 S2100 850 2460 1030',
    'M355 930 C370 580 450 450 710 470 S1010 300 1280 470 S1600 500 1770 700 S2140 770 2190 923',
    'M560 1040 C310 1100 310 1450 610 1530 S1050 1310 1320 1440 S1590 1700 1830 1480 S2110 1230 2360 983',
   ];
   if(this.height>1760){pathData.push(`M1100 1530 C1110 1690 310 1780 300 1990`);for(let y=1980;y<this.height;y+=340)pathData.push(`M300 ${y} C700 ${y-30} 1440 ${y+25} 2050 ${y} M300 ${y}v340`);}
   const sample=document.createElementNS('http://www.w3.org/2000/svg','svg');sample.setAttribute('viewBox',`0 0 ${this.width} ${this.height}`);
   const roadPoints=[];for(const d of pathData){const path=document.createElementNS(sample.namespaceURI,'path');path.setAttribute('d',d);sample.append(path);const length=path.getTotalLength();for(let n=0;n<length;n+=12){const p=path.getPointAtLength(n);roadPoints.push({x:p.x,y:p.y});}}
   // Join each exit at the main road's centre, then paint all borders before all soil fills.
   // Keeping these lanes in the road network also reserves them from buildings and scenery.
   this.exitRoads=window.FoamTownStoryWorld.exits(this).map(e=>{
    const start=roadPoints.reduce((best,p)=>Math.hypot(p.x-e.x,p.y-(this.height-260))<Math.hypot(best.x-e.x,best.y-(this.height-260))?p:best);
    return `M${start.x} ${start.y} Q${e.x-30} ${this.height-160} ${e.x} ${this.height-80} V${this.height+40}`;
   });
   for(const d of this.exitRoads){pathData.push(d);const path=document.createElementNS(sample.namespaceURI,'path');path.setAttribute('d',d);const length=path.getTotalLength();for(let n=0;n<=length;n+=12){const p=path.getPointAtLength(n);roadPoints.push({x:p.x,y:p.y});}}
   const placed=[],reserved=[],lanes=[];
   const overlaps=(p,b,gap=25)=>p.x-13<b.x+213+gap&&p.x+213>b.x-13-gap&&p.y-15<b.y+210+gap&&p.y+210>b.y-15-gap;
   const touches=(point,p,r)=>Math.hypot(point.x-clamp(point.x,p.x-5,p.x+205),point.y-clamp(point.y,p.y,p.y+200))<r;
   if(!plotOffsets){plotOffsets=[{dx:0,dy:0,cost:0}];for(let dy=-1600;dy<=1600;dy+=24)for(let dx=-2200;dx<=2200;dx+=24)plotOffsets.push({dx,dy,cost:Math.hypot(dx,dy)+(dy>0?dy*.1:0)});plotOffsets.sort((a,b)=>a.cost-b.cost);}const offsets=plotOffsets;
   // Fit each authored plot to its road: keep the stagger, reserve an open approach to every door.
   for(const p of this.positions){if(p.hidden)continue;const origin={...p};let chosen=null;
    for(const o of offsets){const candidate={x:origin.x+o.dx,y:origin.y+o.dy};if(candidate.x<15||candidate.x>this.width-225||candidate.y<30||candidate.y>this.height-240)continue;
     if(candidate.x<2440&&candidate.x+215>2080&&candidate.y<440)continue;
     if(placed.some(b=>overlaps(candidate,b))||roadPoints.some(q=>touches(q,candidate,54))||reserved.some(q=>touches(q,candidate,34)))continue;
     const start={x:candidate.x+100,y:candidate.y+225};const nearby=roadPoints.filter(q=>q.y>=candidate.y+160&&Math.hypot(q.x-start.x,q.y-start.y)<300).sort((a,b)=>Math.hypot(a.x-start.x,a.y-start.y)-Math.hypot(b.x-start.x,b.y-start.y));
     for(const near of nearby.slice(0,18)){const d=`M${start.x} ${start.y} C${start.x} ${start.y+28} ${near.x} ${start.y+(near.y-start.y)*.7} ${near.x} ${near.y}`,path=document.createElementNS(sample.namespaceURI,'path');path.setAttribute('d',d);const points=[],len=path.getTotalLength();for(let n=0;n<=len;n+=8){const q=path.getPointAtLength(n);points.push({x:q.x,y:q.y});}if(points.some(q=>touches(q,candidate,23)||placed.some(b=>touches(q,b,32))))continue;chosen={...candidate,d,points};break;}
     if(chosen)break;
    }
    if(!chosen)throw Error('小镇布局没有找到空闲的临街位置：'+this.config.buildings[this.positions.indexOf(p)][1]);
    p.x=chosen.x;p.y=chosen.y;placed.push(p);lanes.push(chosen.d);reserved.push(...chosen.points);
   }
   w.querySelectorAll('[data-building]').forEach((el,i)=>{const p=this.positions[i],b=this.config.buildings[i];if(p.hidden){el.hidden=true;return;}el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.zIndex=String(p.y+194);const old=el.querySelector('svg');old.outerHTML=b[0]==='spot'?window.FoamTownGameArt.landmark(this.config.spot,this.config.province):window.FoamTownGameArt.tile(b[0]);if(['school','workshop','library','gallery'].includes(b[0]))el.insertAdjacentHTML('beforeend','<span class="town-chimney-smoke" aria-hidden="true"><i></i><i></i><i></i></span>');this.obstacles.push({x:p.x+22,y:p.y+62,w:156,h:132});el.dataset.doorX=p.x+100;el.dataset.doorY=p.y+216;});
   const roadEdges=roadPoints.map(p=>({...p,r:42,kind:"main"}));
   for(const d of lanes){const path=document.createElementNS(sample.namespaceURI,'path');path.setAttribute('d',d);const len=path.getTotalLength();for(let n=0;n<=len;n+=10){const p=path.getPointAtLength(n);roadEdges.push({x:p.x,y:p.y,r:25,kind:"lane"});}}
   const occupied=[];
   const clearDecor=(x,y,width,height,margin=4)=>Math.hypot((x+width/2-1040)/200,(y+height-955)/140)>1&&x>=5&&y>=5&&x+width<this.width-5&&y+height<this.height-5&&!(x<2435&&x+width>2080&&y<430&&y+height>20)&&!this.positions.some(p=>!p.hidden&&x<p.x+213+margin&&x+width>p.x-13-margin&&y<p.y+225+margin&&y+height>p.y-15-margin)&&!roadEdges.some(p=>Math.hypot(p.x-clamp(p.x,x-margin,x+width+margin),p.y-clamp(p.y,y-margin,y+height+margin))<p.r)&&!occupied.some(p=>x<p.x+p.w+8&&x+width>p.x-8&&y<p.y+p.h+8&&y+height>p.y-8);
   this.roadEdges=roadEdges;w._townRoads=roadEdges;
   const material=(id,col,row,size=160)=>`<pattern id="town-${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><image href="/assets/town/terrain-atlas.webp" x="${-col*size}" y="${-row*size}" width="${size*2}" height="${size*2}" style="image-rendering:pixelated"/></pattern>`;
   let tiles=`<svg class="town-game-landscape" viewBox="0 0 ${this.width} ${this.height}" width="${this.width}" height="${this.height}" aria-hidden="true"><defs>${material('grass',0,0)}${material('sand',1,0)}${material('water',0,1)}${material('stone',1,1,100)}<filter id="town-road-edge" x="-1%" y="-1%" width="102%" height="102%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="1" seed="9"/><feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter></defs><rect width="100%" height="100%" fill="url(#town-grass)"/><g fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#town-road-edge)"><g stroke="#839857" stroke-width="86">${pathData.map(d=>`<path d="${d}"/>`).join('')}</g><g stroke="#a9ac73" stroke-width="80">${pathData.map(d=>`<path d="${d}"/>`).join('')}</g><g stroke="#a5a66f" stroke-width="46">${lanes.map(d=>`<path d="${d}"/>`).join('')}</g><g stroke="url(#town-sand)" stroke-width="72">${pathData.map(d=>`<path d="${d}"/>`).join('')}</g><g stroke="url(#town-sand)" stroke-width="39">${lanes.map(d=>`<path d="${d}"/>`).join('')}</g></g><ellipse cx="1040" cy="955" rx="120" ry="86" fill="url(#town-stone)" stroke="#a59a70" stroke-width="4"/><g transform="translate(2000 -1020)"><path d="M88 1158C150 1063 386 1053 426 1191S414 1429 289 1442 106 1340 88 1158z" fill="#849e61"/><path data-fishing-water="广场湖泊" d="M103 1170C190 1091 359 1100 398 1203S366 1400 278 1415 121 1325 103 1170z" fill="url(#town-water)" stroke="#adac79" stroke-width="9"/><path class="town-lake-ripple" d="M146 1200h30m30-12h35m37 16h43M173 1280h37m30 12h42m15-8h37M205 1360h28m32 9h33" stroke="#c5ded0" stroke-width="3" fill="none" opacity=".55"/></g></svg>`;
   // Reserve roadside sign footprints before placing trees, lamps and flowers.
   this.streetSigns=[];
   for(const side of ['previous','next']){
    const page=this.config.segment+(side==='previous'?-1:1);if(!Number.isInteger(page)||page<0||page>=this.config.segments)continue;
    const points=roadPoints.filter(p=>side==='previous'?p.x<280:p.x>this.width-280).sort((a,b)=>Math.abs(a.x-(side==='previous'?130:this.width-130))-Math.abs(b.x-(side==='previous'?130:this.width-130)));
    let place=null;
    for(const point of points){for(const offset of [-145,75,-170,100,-195,125,-220,150,-245,175,-270,200]){const x=clamp(point.x-90,18,this.width-198),y=point.y+offset;if(clearDecor(x,y,180,85,6)){place={x,y,at:point};break;}}if(place)break;}
    if(!place)continue;
    occupied.push({...place,w:180,h:85});this.obstacles.push({x:place.x+81,y:place.y+60,w:18,h:24});
    const label=side==='previous'?'← 上一段街道':'下一段街道 →';
    tiles+=`<button type="button" class="town-street-sign" data-town="street-page" data-side="${side}" data-page="${page}" style="left:${place.x}px;top:${place.y}px" aria-label="${label}，第 ${page+1} 段">${label}<small>第 ${page+1} 段 · 去拜访更多邻居</small></button>`;
    this.streetSigns.push({...place,side,page,label});
   }
   this.extras.push({spots:()=>this.streetSigns.map(s=>({id:'street-'+s.side,at:s.at,x:s.x+90,y:s.y-16,range:95,label:s.label,run:()=>this.config.changeStreet?.(s.page)}))});
   // Trees form groves around the road network, not a repeating hedge or grid.
   const groves=[[160,140,10],[130,490,5],[420,80,6],[790,80,5],[1230,120,6],[1690,100,7],[2150,200,10],[2200,800,9],[2230,1180,5],[1750,1580,10],[1300,1580,8],[630,1510,7],[110,1560,8],[720,630,3],[1450,1180,3]];
   let n=0;for(const[cx,cy,count]of groves){for(let i=0;i<count;i++){const angle=i*2.399,r=28+Math.sqrt(i)*42,x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r;const foot={x:x+65,y:y+132};if(!clearDecor(x,y,139,150,7))continue;tiles+=`<div class="town-game-tree" style="left:${Math.round(x)}px;top:${Math.round(y)}px">${window.FoamTownGameArt.tree(n++)}</div>`;this.obstacles.push({x:foot.x-15,y:foot.y-10,w:30,h:22});}}
   const lampPositions=[];
   // Place props from road tangents; their footprint must clear every road and every doorway.
   for(let i=12;i<roadPoints.length-1;i+=29){const p=roadPoints[i],next=roadPoints[i+1],d=Math.hypot(next.x-p.x,next.y-p.y)||1;
    for(const sign of [1,-1]){const fx=p.x-(next.y-p.y)/d*90*sign,fy=p.y+(next.x-p.x)/d*90*sign,x=Math.round(fx-17),y=Math.round(fy-80);if(!clearDecor(x+2,y,30,94,6))continue;lampPositions.push([x,y]);occupied.push({x:x+2,y,w:30,h:94});tiles+=`<div class="town-game-prop lamp" data-roadside="lamp" style="left:${x}px;top:${y}px">${window.FoamTownGameArt.prop('lamp')}</div>`;break;}
   }
   for(let i=0;i<180;i++){const x=60+(i*317)%2300,y=110+(i*173)%(this.height-200);if(!clearDecor(x,y,47,47))continue;tiles+=`<div class="town-game-flower" style="left:${x}px;top:${y}px">${window.FoamTownGameArt.flower(i)}</div>`;}
   for(let i=4;i<roadPoints.length-2;i+=17){const p=roadPoints[i],next=roadPoints[i+1],d=Math.hypot(next.x-p.x,next.y-p.y)||1,sign=i%2?1:-1,x=p.x-(next.y-p.y)/d*92*sign-31,y=p.y+(next.x-p.x)/d*92*sign-31;if(!clearDecor(x,y,63,63))continue;tiles+=`<div class="town-game-flower roadside" style="left:${x}px;top:${y}px">${window.FoamTownGameArt.flower(i)}</div>`;}
   this.obstacles.push({x:2130,y:160,w:240,h:205});
   ground.innerHTML=tiles;w.prepend(ground);
   this.lights=document.createElement('div');this.lights.className='town-game-lights';this.lights.dataset.quiet=w.dataset.quiet;this.lights.setAttribute('aria-hidden','true');this.lights.style.width=this.width+'px';this.lights.style.height=this.height+'px';this.lights.innerHTML=lampPositions.map(([x,y])=>`<i class="town-lamp-pool" style="left:${x-76}px;top:${y+26}px"></i><i class="town-lamp-flame" style="left:${x+12}px;top:${y+14}px"></i>`).join('');this.viewport.append(this.lights);
   this.pathData=pathData;this.lampPositions=lampPositions;this.lake={x:2130,y:160,w:240,h:205};this.buildMinimap();
  }
  buildMinimap(){const kind=i=>this.config.buildings[i]?.[0],color=k=>({school:'#5d86a3',workshop:'#b48b57',hospital:'#c07272',library:'#5f8b75',gallery:'#9a7cb0',spot:'#4aa3c4',notice:'#a99b6b',institute:'#4f8f88'})[k]||'#d9c690';
   this.mini=document.createElement('div');this.mini.className='town-game-minimap';this.mini.setAttribute('role','group');this.mini.setAttribute('aria-label','街道小地图，点击可自动前往');
   this.mini.innerHTML=`<div class="town-mini-head"><b>小地图</b><span>点击前往</span></div><svg viewBox="0 0 ${this.width} ${this.height}" aria-hidden="true"><rect width="${this.width}" height="${this.height}" rx="40" fill="#86a86c"/><g fill="none" stroke="#e3d3a2" stroke-width="44" stroke-linecap="round" opacity=".85">${this.pathData.map(d=>`<path d="${d}"/>`).join('')}</g><path d="M2088 138C2150 43 2386 33 2426 171S2414 409 2289 422 2106 320 2088 138z" fill="#7cc0d4" stroke="#5f9fb2" stroke-width="10"/><ellipse cx="1040" cy="955" rx="120" ry="86" fill="#cfc6a8"/>${this.positions.map((p,i)=>p.hidden?'':`<rect x="${p.x+20}" y="${p.y+50}" width="160" height="140" rx="22" fill="${color(kind(i))}" stroke="#4d5c43" stroke-width="10"/>`).join('')}<g class="town-mini-dots"></g><rect class="town-mini-view" x="0" y="0" width="10" height="10" rx="16" fill="none" stroke="#fff8dc" stroke-width="14" opacity=".85"/><g class="town-mini-player"><circle r="46" fill="#fff6d5" stroke="#875c3e" stroke-width="16"/><path d="M0-86 30-40H-30z" fill="#875c3e"/></g></svg>`;
   this.viewport.parentElement.append(this.mini);this.miniDots=this.mini.querySelector('.town-mini-dots');this.miniView=this.mini.querySelector('.town-mini-view');this.miniPlayer=this.mini.querySelector('.town-mini-player');
   this.on(this.mini,'click',e=>{const svg=this.mini.querySelector('svg').getBoundingClientRect();const x=(e.clientX-svg.left)/svg.width*this.width,y=(e.clientY-svg.top)/svg.height*this.height;if(this.config.playable)this.walkTo(x,y);else{this.position.x=x;this.position.y=y;}});
  }
  /* Collision ---------------------------------------------------------------------------- */
  walkable(x,y){return x>=64&&y>=78&&x<=this.width-64&&y<=this.height-64&&!this.obstacles.some(o=>x>o.x-10&&x<o.x+o.w+10&&y>o.y-7&&y<o.y+o.h+7);}
  buildGrid(){const C=this.cols=Math.ceil(this.width/TILE),R=this.rows=Math.ceil(this.height/TILE),g=this.grid=new Uint8Array(C*R),centre=i=>i*TILE+TILE/2;
   // Rasterise the obstacles once (same margins as walkable) instead of testing every cell against every obstacle.
   for(let r=0;r<R;r++)for(let c=0;c<C;c++){const x=centre(c),y=centre(r);g[r*C+c]=x>=64&&y>=78&&x<=this.width-64&&y<=this.height-64?1:0;}
   for(const o of this.obstacles){const c0=Math.max(0,Math.ceil((o.x-10-TILE/2)/TILE)),c1=Math.min(C-1,Math.floor((o.x+o.w+10-TILE/2)/TILE)),r0=Math.max(0,Math.ceil((o.y-7-TILE/2)/TILE)),r1=Math.min(R-1,Math.floor((o.y+o.h+7-TILE/2)/TILE));for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){const x=centre(c),y=centre(r);if(x>o.x-10&&x<o.x+o.w+10&&y>o.y-7&&y<o.y+o.h+7)g[r*C+c]=0;}}}
  cellOk(c,r){return c>=0&&r>=0&&c<this.cols&&r<this.rows&&this.grid[r*this.cols+c]===1;}
  // Nearest walkable spot: the start position and every spawn are validated so nobody begins inside a wall.
  free(x,y){if(this.walkable(x,y))return{x,y};for(let r=8;r<600;r+=8)for(let a=0;a<16;a++){const px=x+Math.cos(a/16*Math.PI*2)*r,py=y+Math.sin(a/16*Math.PI*2)*r;if(this.walkable(px,py))return{x:px,y:py};}return{x:1035,y:1040};}
  // A spawn point with room to walk in every direction, so no arrow key starts out blocked.
  open(x,y){const roomy=(px,py)=>[[0,0],[28,0],[-28,0],[0,24],[0,-24],[20,18],[-20,18],[20,-18],[-20,-18]].every(([dx,dy])=>this.walkable(px+dx,py+dy));if(roomy(x,y))return{x,y};for(let r=8;r<600;r+=8)for(let a=0;a<16;a++){const px=x+Math.cos(a/16*Math.PI*2)*r,py=y+Math.sin(a/16*Math.PI*2)*r;if(roomy(px,py))return{x:px,y:py};}return this.free(x,y);}
  clear(a,b){const d=Math.hypot(b.x-a.x,b.y-a.y),n=Math.max(1,Math.ceil(d/8));for(let i=1;i<=n;i++){const t=i/n;if(!this.walkable(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t))return false;}return true;}
  // Move with sub-steps; when blocked, slide along the free axis and nudge round corners.
  move(m,dx,dy,assist){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/5));let bx=false,by=false;
   for(let i=0;i<steps;i++){const sx=dx/steps,sy=dy/steps;
    if(!this.walkable(m.x,m.y)){const at=this.open(m.x,m.y);m.x=at.x;m.y=at.y;}
    if(this.walkable(m.x+sx,m.y+sy)){m.x+=sx;m.y+=sy;continue;}
    let moved=false;if(sx&&this.walkable(m.x+sx,m.y)){m.x+=sx;moved=true;}else if(sx)bx=true;if(sy&&this.walkable(m.x,m.y+sy)){m.y+=sy;moved=true;}else if(sy)by=true;
    if(!moved&&assist){const along=Math.abs(sx)>Math.abs(sy);for(const k of [3,6,9,12]){for(const s of [1,-1]){const ox=along?0:s*k,oy=along?s*k:0;if(this.walkable(m.x+sx+ox,m.y+sy+oy)){m.x+=ox?Math.sign(ox)*1.4:0;m.y+=oy?Math.sign(oy)*1.4:0;moved=true;break;}}if(moved)break;}}
   }
   return{bx,by};}
  /* A* over a 24-px grid with diagonal moves, then line-of-sight smoothing. */
  findPath(x,y,from=this.me){const C=this.cols,cell=v=>Math.floor(v/TILE);let sc=cell(from.x),sr=cell(from.y),gc=cell(x),gr=cell(y);
   if(!this.cellOk(gc,gr)){let best=null;for(let r=1;r<10&&!best;r++)for(let dr=-r;dr<=r;dr++)for(let dc=-r;dc<=r;dc++){if(Math.max(Math.abs(dc),Math.abs(dr))!==r||!this.cellOk(gc+dc,gr+dr))continue;const d=Math.hypot(dc,dr);if(!best||d<best.d)best={c:gc+dc,r:gr+dr,d};}if(!best)return[];gc=best.c;gr=best.r;x=gc*TILE+TILE/2;y=gr*TILE+TILE/2;}
   if(!this.cellOk(sc,sr)){let best=null;for(let r=1;r<=8&&!best;r++)for(let dr=-r;dr<=r;dr++)for(let dc=-r;dc<=r;dc++){if(!this.cellOk(sc+dc,sr+dr))continue;const p={x:(sc+dc)*TILE+TILE/2,y:(sr+dr)*TILE+TILE/2};if(this.clear(from,p)&&(!best||Math.hypot(p.x-from.x,p.y-from.y)<best.d))best={c:sc+dc,r:sr+dr,d:Math.hypot(p.x-from.x,p.y-from.y)};}if(!best)return[];sc=best.c;sr=best.r;}
   const N=C*this.rows,g=new Float32Array(N).fill(Infinity),came=new Int32Array(N).fill(-1),closed=new Uint8Array(N),heap=[],start=sr*C+sc,goal=gr*C+gc;
   const h=i=>{const dc=Math.abs(i%C-gc),dr=Math.abs((i/C|0)-gr);return Math.max(dc,dr)+.414*Math.min(dc,dr);};
   const push=(f,i)=>{heap.push([f,i]);let k=heap.length-1;while(k>0){const p=k-1>>1;if(heap[p][0]<=heap[k][0])break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p;}};
   const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];k=m;}}return top;};
   g[start]=0;push(h(start),start);let found=false,guard=0;
   while(heap.length&&guard++<30000){const[,i]=pop();if(closed[i])continue;if(i===goal){found=true;break;}closed[i]=1;const c=i%C,r=i/C|0;
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dc&&!dr)continue;const nc=c+dc,nr=r+dr;if(!this.cellOk(nc,nr))continue;if(dc&&dr&&(!this.cellOk(c+dc,r)||!this.cellOk(c,r+dr)))continue;const j=nr*C+nc,cost=g[i]+(dc&&dr?1.414:1);if(cost<g[j]){g[j]=cost;came[j]=i;push(cost+h(j),j);}}}
   if(!found)return[];const cells=[];for(let i=goal;i!==-1&&i!==start;i=came[i])cells.push({x:i%C*TILE+TILE/2,y:(i/C|0)*TILE+TILE/2});cells.reverse();if(!cells.length){if(this.walkable(x,y)&&this.clear(from,{x,y}))return Math.hypot(x-from.x,y-from.y)>3?[{x,y}]:[];return[];}if(this.walkable(x,y))cells[cells.length-1]={x,y};
   const out=[];let cur={x:from.x,y:from.y},i=0;while(i<cells.length){let j=cells.length-1;while(j>i&&!this.clear(cur,cells[j]))j--;out.push(cells[j]);cur=cells[j];i=j+1;}return out;}
  /* Residents, NPCs ------------------------------------------------------------------------ */
  avatar(){return this.world.querySelector('.town-resident.is-me');}
  door(i){const p=this.positions[i];return p&&!p.hidden?{x:p.x+100,y:p.y+216}:null;}
  homeFor(userId,i){const index=this.config.buildings.findIndex(b=>b[3]?.user_id===userId);const d=index>=0?this.door(index):null;if(d)return this.free(d.x+(i%2?18:-18),d.y+22);return this.free(930+(i%5)*44,1060+Math.floor(i/5)*30);}
  renderResidents(){const seen=new Set();this.world.querySelectorAll('.town-resident:not(.is-npc)').forEach((el,i)=>{const id=el.classList.contains('is-me')?'me':el.dataset.user;seen.add(id);let m=this.movers.get(id);
    if(id==='me'){if(!m){m=new Mover(el,this.me.x,this.me.y,'me');m.onStep=(mv,speed)=>this.emit('step',{x:mv.x,y:mv.y,speed,me:true});this.movers.set(id,m);}else m.bind(el);this.meMover=m;return;}
    if(!m){const home=this.homeFor(el.dataset.user,i);m=new Mover(el,home.x,home.y,'resident');m.ai={home,rand:random(hash(el.dataset.user)),wait:.5+random(hash(el.dataset.user))()*3,radius:this.config.playable?240:110,speed:this.config.playable?80:55};this.movers.set(id,m);}else m.bind(el);});
   for(const id of [...this.movers.keys()])if(!seen.has(id))this.movers.delete(id);}
  addNPC(npc){const el=document.createElement('button');el.type='button';el.className='town-resident is-npc';el.dataset.npc=npc.id;el.setAttribute('aria-label',npc.name+'（小镇居民 NPC），按 E 聊天');el.innerHTML=`<i class="town-shadow"></i><i class="town-body"><i class="town-pixel-panda"${window.FoamTownNPCSprite?.(npc.id)?` style="background-image:${window.FoamTownNPCSprite(npc.id)}"`:''}></i></i><span>${npc.name}<small>NPC</small></span>${npc.prop?`<i class="town-npc-prop" aria-hidden="true">${window.FoamTownGlyph(npc.prop)}</i>`:''}`;this.world.append(el);const home=this.free(npc.x,npc.y);const m=new Mover(el,home.x,home.y,'npc');m.npc=npc;m.ai={home,rand:random(hash(npc.id)),wait:1+Math.random()*2,radius:npc.radius??200,speed:npc.speed??70};this.npcs.set(npc.id,m);this.on(el,'click',e=>{e.stopPropagation();npc.talk?.(m);});return m;}
  think(m,dt){const ai=m.ai;
   // A neighbour in the middle of an action stays put until it ends.
   if(m.kind!=='npc'&&m.el.dataset.action&&m.el.dataset.action!=='walk'){m.vx=lerp(m.vx,0,damp(14,dt));m.vy=lerp(m.vy,0,damp(14,dt));if(ai){ai.target=null;ai.wait=Math.max(ai.wait||0,1.2);}return;}
   // NPCs stop and turn towards you when you walk up, so they are easy to talk to.
   if(m.npc?.stationary){m.vx=0;m.vy=0;return;}
   if(m.kind==='npc'&&this.config.playable&&!m.busy){const dx=this.me.x-m.x,dy=this.me.y-m.y,near=Math.hypot(dx,dy)<100;if(near){m.forceFace=Math.abs(dx)>Math.abs(dy)*.55?(dx<0?'left':'right'):(dy<0?'up':'down');m.vx=lerp(m.vx,0,damp(14,dt));m.vy=lerp(m.vy,0,damp(14,dt));if(ai){ai.target=null;ai.wait=Math.max(ai.wait,1);}return;}else if(m.forceFace&&!m.faceTimer)m.forceFace=null;}
   if(ai?.eggPatrol)return;
   if(!ai||m.busy){m.vx=lerp(m.vx,0,damp(12,dt));m.vy=lerp(m.vy,0,damp(12,dt));return;}
   if(ai.wait>0){ai.wait-=dt;m.vx=lerp(m.vx,0,damp(10,dt));m.vy=lerp(m.vy,0,damp(10,dt));if(ai.wait<=0)ai.target=null;return;}
   if(!ai.target){for(let k=0;k<10;k++){const a=ai.rand()*Math.PI*2,d=40+ai.rand()*ai.radius,p={x:ai.home.x+Math.cos(a)*d,y:ai.home.y+Math.sin(a)*d*.75};if(this.walkable(p.x,p.y)&&this.clear(m,p)){ai.target=p;ai.stuck=0;break;}}if(!ai.target){ai.wait=1+ai.rand()*2;return;}}
   const dx=ai.target.x-m.x,dy=ai.target.y-m.y,d=Math.hypot(dx,dy);if(d<6){ai.target=null;ai.wait=1.5+ai.rand()*4.5;return;}
   const sp=Math.min(ai.speed,d*3+20),tvx=dx/d*sp,tvy=dy/d*sp;m.vx=lerp(m.vx,tvx,damp(6,dt));m.vy=lerp(m.vy,tvy,damp(6,dt));const bx=m.x,by=m.y;this.move(m,m.vx*dt,m.vy*dt,false);if(Math.hypot(m.x-bx,m.y-by)<sp*dt*.25){ai.stuck=(ai.stuck||0)+dt;if(ai.stuck>.6){ai.target=null;ai.wait=.8;}}}
  /* Player --------------------------------------------------------------------------------- */
  direction(){let dx=0,dy=0;const add=d=>{const v=VEC[d];if(v){dx+=v[0];dy+=v[1];}};for(const id of this.keys.keys())add(keyDir(id));if(this.pad)add(this.pad);return{dx:clamp(dx,-1,1),dy:clamp(dy,-1,1)};}
  walkTo(x,y,after){if(!this.config.playable)return;this.locked=false;this.emit('cancel');this.path=this.findPath(x,y);this.after=after;this.pathStuck=0;if(!this.path.length&&Math.hypot(x-this.me.x,y-this.me.y)<64){after?.();this.after=null;}this.showTarget(this.path.at(-1)?.x??x,this.path.at(-1)?.y??y);}
  walkToBuilding(index,after){const p=this.door(index);if(!p)return;const done=()=>{this.emit('visit',index);after();};if(!this.config.playable||this.config.direct?.())return done();this.walkTo(p.x,p.y,done);}
  showTarget(x,y){this.world.querySelector('.town-game-target')?.remove();const target=document.createElement('i');target.className='town-game-target';target.style.left=x-11+'px';target.style.top=y-6+'px';this.world.append(target);setTimeout(()=>target.remove(),1600);}
  nearest(){let best=null,min=105;for(let i=0;i<this.positions.length;i++){const d=this.door(i);if(!d)continue;const dist=Math.hypot(d.x-this.me.x,d.y-this.me.y);if(dist<min){best=i;min=dist;}}return best;}
  // Everything the player can press E on: building doors, nearby pandas, NPCs and extras (fishing spots…).
  findFocus(){if(!this.config.playable)return null;let best=null;const consider=(d,item)=>{if(d<item.range&&(!best||d-item.range*.2<best.d-best.range*.2))best={...item,d};};
   for(let i=0;i<this.positions.length;i++){const d=this.door(i);if(!d)continue;const b=this.config.buildings[i];consider(Math.hypot(d.x-this.me.x,d.y-this.me.y),{id:'b'+i,type:'building',index:i,range:105,x:d.x,y:d.y-205,label:b[3]?'拜访'+b[1]+'的小屋':b[0]==='gate'?'去其他小镇':'进入'+b[1],run:()=>{this.emit('visit',i);this.config.interact?.(i);}});}
   for(const[id,m]of this.movers){if(id==='me')continue;consider(Math.hypot(m.x-this.me.x,m.y-this.me.y),{id:'p'+id,type:'panda',range:72,x:m.x,y:m.y-104,label:'和'+(m.el.querySelector('span')?.firstChild?.textContent||'邻居').split(' · ')[0]+'打招呼',run:()=>{this.face(m);this.config.greet?.(id);this.emit('greet',{id});}});}
   for(const[id,m]of this.npcs)consider(Math.hypot(m.x-this.me.x,m.y-this.me.y),{id:'n'+id,type:'npc',range:72,x:m.x,y:m.y-104,label:'和'+m.npc.name+'聊聊',run:()=>{this.face(m);m.npc.talk?.(m);this.emit('greet',{id,npc:true});}});
   for(const ex of this.extras)for(const spot of ex.spots?.()||[]){const at=spot.at||spot;consider(Math.hypot(at.x-this.me.x,at.y-this.me.y),{...spot,type:'extra',range:spot.range||64});}
   return best;}
  face(m){const dx=this.me.x-m.x,dy=this.me.y-m.y;m.forceFace=Math.abs(dx)>Math.abs(dy)*.55?(dx<0?'left':'right'):(dy<0?'up':'down');m.busy=true;if(m.ai)m.ai.wait=2.5;clearTimeout(m.faceTimer);m.faceTimer=setTimeout(()=>{m.forceFace=null;m.busy=false;m.faceTimer=null;},2500);}
  interact(){if(this.locked){this.emit('use');return;}const f=this.findFocus();if(f){this.emit('interact',f);f.run?.();}else this.emit('hint',this.config.playable?'走近建筑、居民或水岸，出现互动提示后按 E。':'登录并入住后，就能和小镇里的邻居互动。');}
  stopMovement(){this.keys.clear();this.pad=null;this.path=[];this.after=null;this.running=false;(this.viewport.closest('.town-game-shell')||document).querySelectorAll('[data-game-direction].is-held').forEach(b=>b.classList.remove('is-held'));}
  setZoom(z){const cover=Math.max((this.vw||this.viewport.clientWidth)/this.width,(this.vh||this.viewport.clientHeight)/this.height);this.zoomTarget=clamp(z,Math.max(.7,cover),Math.max(1.35,cover*1.35));try{localStorage.setItem('foamlab.town.zoom',String(this.zoomTarget));}catch{}}
  cycleSpeed(){this.speedMultiplier=this.speedMultiplier===1?2:this.speedMultiplier===2?4:1;try{localStorage.setItem('foamlab.town.speed',this.speedMultiplier);}catch{}this.emit('speed',this.speedMultiplier);}
  bind(){const v=this.viewport,shell=v.closest('.town-game-shell')||v.parentElement;v.tabIndex=0;v.setAttribute('aria-label','小镇地图。W A S D 或方向键移动，同时按两个方向键斜向移动，R 切换 1 倍、2 倍、4 倍速，Shift 临时至少 2 倍速，E 或空格互动，数字 1 到 6 执行动作，H 查看操作说明。');
   const blocked=e=>e.defaultPrevented||document.querySelector('dialog[open]')||this.viewport.closest('[data-overlay],.is-text-mode')||e.target.closest?.('[data-hotbar-grip],[data-view-grip]')||editing(e.target)||editing(document.activeElement)||e.ctrlKey||e.metaKey||e.altKey;
   this.on(window,'keydown',e=>{if(blocked(e))return;const id=keyId(e);
    if(id){e.preventDefault();if(!this.keys.has(id)){this.keys.set(id,performance.now());this.path=[];this.after=null;if(this.locked)this.emit('cancel');}return;}
    if(e.key==='Shift'){this.running=true;return;}
    const k=(e.key||'').toLowerCase();
    // Space/Enter retain their native button and link activation when using Tab navigation.
    if((e.code==='Space'||k===' '||e.code==='Enter'||k==='enter')&&e.target.closest?.('button,a,summary,[role=button]'))return;
    if(e.repeat){if(/^(Space|Key[ERH]|(?:Digit|Numpad)[1-6])$/.test(e.code))e.preventDefault();return;}
    if(e.code==='Space'||k===' '||e.code==='KeyE'||k==='e'||((e.code==='Enter'||k==='enter')&&document.activeElement===v)){e.preventDefault();this.interact();return;}
    const digit=/^(?:Digit|Numpad)([1-6])$/.exec(e.code)||(!e.code&&/^([1-6])$/.exec(k));if(digit){e.preventDefault();shell.querySelectorAll('.town-game-hotbar .town-action-button')[Number(digit[1])-1]?.click();return;}
    if(e.code==='KeyM'||k==='m'){location.hash='map';return;}
    if(e.code==='KeyJ'||k==='j'){e.preventDefault();shell.querySelector('[data-town=story]')?.click();return;}
    if(e.code==='KeyH'||k==='h'||k==='?'){e.preventDefault();this.emit('help');return;}
    if(e.code==='KeyR'||k==='r'){e.preventDefault();this.cycleSpeed();return;}
    if(['Equal','NumpadAdd'].includes(e.code)||k==='+'||k==='='){this.setZoom(this.zoomTarget+.1);return;}
    if(['Minus','NumpadSubtract'].includes(e.code)||k==='-'){this.setZoom(this.zoomTarget-.1);return;}
    if(e.code==='Escape'||k==='escape'){if(this.locked){this.emit('cancel');return;}if(this.emitClose())return;document.querySelector('[data-town=settings]')?.click();}
   },{capture:true});
   this.on(window,'keyup',e=>{const id=keyId(e);if(id){this.keys.delete(id);/* an IME may report a different code on release */if(e.key==='Process'||!e.code)for(const k of [...this.keys.keys()])if(keyDir(k)===BY_KEY[(e.key||'').toLowerCase()])this.keys.delete(k);}if(e.key==='Shift')this.running=false;},{capture:true});
   this.on(window,'blur',()=>this.stopMovement());this.on(document,'visibilitychange',()=>this.stopMovement());
   this.on(v,'wheel',e=>{if(e.ctrlKey)return;e.preventDefault();this.setZoom(this.zoomTarget*(e.deltaY<0?1.08:1/1.08));},{passive:false});
   this.on(v,'click',e=>{if(e.target.closest('a,button'))return;v.focus({preventScroll:true});const r=v.getBoundingClientRect();const x=(e.clientX-r.left-this.camera.x)/this.zoom,y=(e.clientY-r.top-this.camera.y)/this.zoom;this.emit('click-ground',{x,y});this.walkTo(x,y);});
   let drag=null;this.on(v,'pointerdown',e=>{if(this.config.playable||e.target.closest('a,button'))return;drag={x:e.clientX,y:e.clientY,ox:this.position.x,oy:this.position.y};});this.on(v,'pointermove',e=>{if(!drag)return;this.position.x=clamp(drag.ox-(e.clientX-drag.x)/this.zoom,100,this.width-100);this.position.y=clamp(drag.oy-(e.clientY-drag.y)/this.zoom,100,this.height-100);});this.on(window,'pointerup',()=>drag=null);
   // On-screen pad: press any of the eight arrows, then slide the finger to change direction.
   const pad=shell.querySelector('[data-dpad]');if(pad){const pick=e=>{const b=e.target.closest?.('[data-game-direction]');const r=pad.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);if(Math.hypot(dx,dy)>r.width*.16)return SECTORS[(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];return b?PAD[b.dataset.gameDirection]:null;};
    const show=()=>pad.querySelectorAll('[data-game-direction]').forEach(b=>b.classList.toggle('is-held',PAD[b.dataset.gameDirection]===this.pad));
    this.on(pad,'pointerdown',e=>{if(e.target.closest('[data-game-run]'))return;e.preventDefault();v.focus({preventScroll:true});try{pad.setPointerCapture(e.pointerId);}catch{}this.padPointer=e.pointerId;this.pad=pick(e);this.path=[];this.after=null;if(this.locked)this.emit('cancel');show();});
    this.on(pad,'pointermove',e=>{if(e.pointerId!==this.padPointer)return;const d=pick(e);if(d){this.pad=d;show();}});
    const end=e=>{if(e.pointerId!==this.padPointer)return;this.padPointer=null;this.pad=null;show();};this.on(pad,'pointerup',end);this.on(pad,'pointercancel',end);this.on(pad,'lostpointercapture',end);}
   shell.querySelectorAll('[data-game-run]').forEach(b=>this.on(b,'click',()=>{this.cycleSpeed();}));
   shell.querySelectorAll('[data-game-control]').forEach(b=>this.on(b,'click',()=>{v.focus({preventScroll:true});if(b.dataset.gameControl==='speed')this.cycleSpeed();else this.interact();}));
   this.bindDraggableControls(shell,{selector:'.town-game-hotbar',handle:'[data-hotbar-grip]',storage:'hotbar'});
   this.bindDraggableControls(shell,{selector:'.town-game-touch',handle:'[data-view-grip]',storage:'view-controls',anchor:'.town-game-player'});
   shell.querySelectorAll('[data-game-zoom]').forEach(b=>this.on(b,'click',()=>this.setZoom(this.zoomTarget+Number(b.dataset.gameZoom))));
   this.listen('speed',value=>{shell.querySelectorAll('[data-game-run],[data-game-control=speed]').forEach(b=>{b.dataset.speed=String(value);const label=b.querySelector('[data-speed-label]');if(label)label.textContent=value+' 倍';else b.textContent=value+' 倍';b.setAttribute('aria-label','当前 '+value+' 倍速，切换为 '+(value===1?2:value===2?4:1)+' 倍速');});});this.emit('speed',this.speedMultiplier);
  }
  bindDraggableControls(shell,{selector,handle,storage,anchor}){const bar=shell.querySelector(selector);if(!bar)return;
   const grip=bar.querySelector(handle),neighbor=anchor?shell.querySelector(anchor):null,mode=()=>matchMedia('(max-width:700px)').matches?'mobile':'desktop',key=()=>`foamlab.town.${storage}.${mode()}`;
   let drag=null,suppressed=false,tapGuard=0;
   const bounds=()=>{const r=bar.getBoundingClientRect();return {x:Math.max(8,innerWidth-r.width-8),y:Math.max(8,innerHeight-r.height-8)};};
   const place=(x,y)=>{bar.classList.add('is-positioned');const b=bounds();bar.style.setProperty('left',clamp(x,8,b.x)+'px','important');bar.style.setProperty('top',clamp(y,8,b.y)+'px','important');};
   const save=()=>{const r=bar.getBoundingClientRect(),b=bounds();try{localStorage.setItem(key(),JSON.stringify({x:(r.left-8)/Math.max(1,b.x-8),y:(r.top-8)/Math.max(1,b.y-8)}));}catch{}};
   const original=()=>{if(neighbor){const r=neighbor.getBoundingClientRect();if(r.width){place(r.left,r.top-bar.getBoundingClientRect().height-12);return;}}bar.classList.remove('is-positioned');bar.style.removeProperty('left');bar.style.removeProperty('top');};
   const reset=()=>{try{localStorage.removeItem(key());}catch{}original();};
   const restore=()=>{if(drag)return;let p;try{p=JSON.parse(localStorage.getItem(key()));}catch{}if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)){original();return;}bar.classList.add('is-positioned');const b=bounds();place(8+clamp(p.x,0,1)*(b.x-8),8+clamp(p.y,0,1)*(b.y-8));};
   this.on(bar,'pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;const r=bar.getBoundingClientRect();suppressed=false;tapGuard=0;drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top,moved:false,button:e.target.closest('button')};});
   this.on(window,'pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<8)return;
    if(!drag.moved){drag.moved=true;bar.classList.add('is-dragging');bar.setPointerCapture(e.pointerId);this.stopMovement();}e.preventDefault();place(drag.left+dx,drag.top+dy);
   });
   const end=e=>{if(!drag||drag.id!==e.pointerId)return;const tap=e.type==='pointerup'&&!drag.moved&&e.pointerType==='touch'?drag.button:null;suppressed=drag.moved;if(drag.moved)save();drag=null;bar.classList.remove('is-dragging');if(bar.hasPointerCapture(e.pointerId))bar.releasePointerCapture(e.pointerId);if(tap){e.preventDefault();tapGuard=performance.now()+700;tap.click();}};
   this.on(window,'pointerup',end);this.on(window,'pointercancel',end);this.on(bar,'lostpointercapture',e=>{if(e.target===bar)end(e);});
   this.on(bar,'click',e=>{if(e.detail>0&&(suppressed||tapGuard>performance.now())){e.preventDefault();e.stopImmediatePropagation();suppressed=false;}},{capture:true});
   this.on(grip,'keydown',e=>{const d={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[e.key];if(e.key==='Home'){e.preventDefault();reset();}else if(d){e.preventDefault();const r=bar.getBoundingClientRect();place(r.left+d[0],r.top+d[1]);save();}});
   this.on(window,'resize',restore);if(neighbor){const watch=new ResizeObserver(restore);watch.observe(neighbor);watch.observe(bar);this.handlers.push(()=>watch.disconnect());}restore();
  }
  emitClose(){let handled=false;for(const fn of this.hooks.escape||[])if(fn())handled=true;return handled;}
  tick(now){this.frame=requestAnimationFrame(this.tick);const suspended=!!this.externalPaused||document.hidden||!!document.querySelector('dialog[open]')||!!this.viewport.closest('[data-overlay],.is-text-mode');
   if(suspended!==this.scenePaused){this.scenePaused=suspended;this.world.classList.toggle('is-scene-paused',suspended);this.lights.classList.toggle('is-scene-paused',suspended);}
   if(suspended){if(this.keys.size||this.pad)this.stopMovement();this.last=now;return;}if(now-this.last<15)return;const dt=Math.min(.05,(now-this.last)/1000);this.last=now;
   const quiet=!!this.config.muted?.(),paused=editing(document.activeElement);
   if(paused&&(this.keys.size||this.pad))this.stopMovement();
   const me=this.me,{dx,dy}=paused||this.locked?{dx:0,dy:0}:this.direction(),ride=this.config.ride?.()||'walk',multiplier=Math.max(this.speedMultiplier,this.running?2:1),max=(SPEED[ride]||SPEED.walk)*multiplier;let tvx=0,tvy=0;
   if(this.config.playable){
    if(dx||dy){const n=Math.hypot(dx,dy);tvx=dx/n*max;tvy=dy/n*max;}
    else if(this.path.length&&!paused&&!this.locked){const t=this.path[0],ddx=t.x-me.x,ddy=t.y-me.y,d=Math.hypot(ddx,ddy),last=this.path.length===1;
     if(d<(last?5:16)){this.path.shift();if(!this.path.length){const done=this.after;this.after=null;done?.();}}
     else{const sp=Math.min(max,d*(last?4:8)+40);tvx=ddx/d*sp;tvy=ddy/d*sp;}}
    const rate=tvx||tvy?13:30;me.vx=lerp(me.vx,tvx,damp(rate,dt));me.vy=lerp(me.vy,tvy,damp(rate,dt));if(Math.abs(me.vx)<2&&!tvx)me.vx=0;if(Math.abs(me.vy)<2&&!tvy)me.vy=0;
    if(me.vx||me.vy){const bx=me.x,by=me.y,hit=this.move(me,me.vx*dt,me.vy*dt,true);if(hit.bx)me.vx*=.2;if(hit.by)me.vy*=.2;
     if(this.path.length&&Math.hypot(me.x-bx,me.y-by)<max*dt*.2){this.pathStuck+=dt;if(this.pathStuck>.7){this.path=[];this.after=null;}}else this.pathStuck=0;}
    this.position.x=me.x;this.position.y=me.y;
   }else if(dx||dy){const n=Math.hypot(dx,dy);this.position.x=clamp(this.position.x+dx/n*dt*420*multiplier,100,this.width-100);this.position.y=clamp(this.position.y+dy/n*dt*420*multiplier,100,this.height-100);}
   const own=this.meMover;if(own){own.x=me.x;own.y=me.y;own.vx=me.vx;own.vy=me.vy;own.busy=this.locked;own.forceFace=this.lockFace||null;own.draw(dt,quiet);}
   const visible=m=>{const x=m.x*this.zoom+this.camera.x,y=m.y*this.zoom+this.camera.y;return x>-170&&y>-170&&x<(this.vw||innerWidth)+170&&y<(this.vh||innerHeight)+170;};
   for(const[id,m]of this.movers)if(id!=='me'){this.think(m,dt);if(visible(m))m.draw(dt,quiet);}
   for(const m of this.npcs.values()){this.think(m,dt);if(visible(m))m.draw(dt,quiet);}
   for(const ex of this.extras)ex.update?.(dt,quiet);
   this.updateCamera(dt);if(now-(this.focusAt||0)>65){this.focusAt=now;this.updateFocus(now);}this.updateMinimap(now);
  }
  updateCamera(dt){const target=this.config.playable?{x:this.me.x+this.me.vx*.22,y:this.me.y+this.me.vy*.16}:this.position;// The viewport size is cached (ResizeObserver): reading clientWidth here, after every panda has moved,
   // forced a full style and layout pass of the world on each frame.
   if(!this.sizeWatch){this.vw=this.viewport.clientWidth;this.vh=this.viewport.clientHeight;this.sizeWatch=new ResizeObserver(()=>{this.vw=this.viewport.clientWidth;this.vh=this.viewport.clientHeight;});this.sizeWatch.observe(this.viewport);this.handlers.push(()=>this.sizeWatch.disconnect());}
   const vw=this.vw,vh=this.vh,cover=Math.max(vw/this.width,vh/this.height);this.zoom=Math.max(cover,lerp(this.zoom,Math.max(cover,this.zoomTarget),damp(10,dt)));const z=this.zoom;
   const fit=(view,size,focus,share)=>view>size*z?(view-size*z)/2:clamp(view*share-focus*z,view-size*z,0);const tx=fit(vw,this.width,target.x,.5),ty=fit(vh,this.height,target.y,.52);
   if(!this.camera.ready){this.camera.x=tx;this.camera.y=ty;this.camera.ready=true;}else{const k=damp(7,dt);this.camera.x=lerp(this.camera.x,tx,k);this.camera.y=lerp(this.camera.y,ty,k);}
   const t=`translate3d(${fmt(this.camera.x)}px,${fmt(this.camera.y)}px,0) scale(${z.toFixed(4)})`;if(t!==this.lastTransform){this.world.style.transform=t;this.lights.style.transform=t;this.lastTransform=t;}}
  updateFocus(now){const f=this.locked?this.lockPrompt||null:this.findFocus(),id=f?.id||null;this.focus=f;
   if(id!==this.focusId){this.focusId=id;this.prompt.hidden=!f;if(f){const touch=matchMedia('(pointer:coarse)').matches;this.prompt.innerHTML=`<kbd>${touch?'点击':'E'}</kbd><span></span>`;this.prompt.querySelector('span').textContent=f.label;}
    this.world.querySelectorAll('[data-building].is-near,.is-npc.is-near').forEach(b=>b.classList.remove('is-near'));if(f?.type==='building')this.world.querySelector(`[data-building="${f.index}"]`)?.classList.add('is-near');
    if(f?.type==='npc')this.npcs.get(f.id.slice(1))?.el.classList.add('is-near');
    const hint=document.querySelector('.town-game-interact-hint');if(hint){hint.hidden=!f;hint.textContent=f?(matchMedia('(pointer:coarse)').matches?'点击提示':'E / 空格')+' · '+f.label:'';}
    if(f?.type==='building')this.announce(f.index,now);}
   if(f){this.prompt.style.left=fmt(f.x)+'px';this.prompt.style.top=fmt(f.y)+'px';const talking=f.type==='npc'&&!!this.npcs.get(f.id.slice(1))?.el.querySelector('.town-speech');if(this.prompt.hidden!==talking)this.prompt.hidden=talking;}}
  announce(index,now){const b=this.config.buildings[index];if(!b)return;const last=this.banner.shown.get(index)||-1e9;if(now-last<25000)return;this.banner.shown.set(index,now);const sub=b[3]?'Lv.'+b[3].level+' · '+(b[3].title||'小镇居民'):SUBTITLE[b[0]]||'';this.bannerEl.innerHTML='<strong></strong><span></span>';this.bannerEl.firstChild.textContent=b[3]?b[1]+'的小屋':b[1];this.bannerEl.lastChild.textContent=sub;this.bannerEl.classList.remove('is-shown');void this.bannerEl.offsetWidth;this.bannerEl.classList.add('is-shown');}
  updateMinimap(now){if(now-(this.miniAt||0)<120)return;this.miniAt=now;const p=this.config.playable?this.me:this.position,face=this.meMover?.face||'down';const angle={up:0,right:90,down:180,left:270}[face];this.miniPlayer.setAttribute('transform',`translate(${Math.round(p.x)} ${Math.round(p.y)}) rotate(${angle})`);
   const z=this.zoom||1;this.miniView.setAttribute('x',String(Math.round(-this.camera.x/z)));this.miniView.setAttribute('y',String(Math.round(-this.camera.y/z)));this.miniView.setAttribute('width',String(Math.round((this.vw||this.viewport.clientWidth)/z)));this.miniView.setAttribute('height',String(Math.round((this.vh||this.viewport.clientHeight)/z)));
   const q=v=>Math.round(v/12)*12;let dots='';for(const[id,m]of this.movers)if(id!=='me')dots+=`<circle cx="${q(m.x)}" cy="${q(m.y)}" r="30" fill="#fff" stroke="#4d6b52" stroke-width="10"/>`;for(const m of this.npcs.values())dots+=`<circle cx="${q(m.x)}" cy="${q(m.y)}" r="26" fill="#f1c76a" stroke="#7a5b2c" stroke-width="10"/>`;for(const ex of this.extras)dots+=ex.minimap?.()||'';if(dots!==this.lastDots){this.miniDots.innerHTML=dots;this.lastDots=dots;}}
  destroy(){cancelAnimationFrame(this.frame);this.handlers.forEach(fn=>fn());for(const ex of this.extras)ex.destroy?.();this.mini?.remove();this.lights?.remove();this.bannerEl?.remove();if(active===this)active=null;this.emit('destroy');}
 }
 window.FoamTownGame={mount:(viewport,config)=>{const game=new TownGame(viewport,config);window.dispatchEvent(new CustomEvent('foamlab:town-game',{detail:game}));return game;},destroy:()=>active?.destroy(),get active(){return active;}};
})();
