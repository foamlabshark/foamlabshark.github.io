/* Original panda atlas; 64 x 72 logical coordinates, rendered on a 128 x 144 pixel grid. */
'use strict';
(() => {
 const FPS=12,PI=Math.PI,TAU=PI*2,reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const P={edge:'#202d30',black:'#2b383c',hi:'#435155',blackShade:'#243135',fur:'#fffdf7',light:'#ffffff',shade:'#e4ebe6',deep:'#b9c9c3',pink:'#efb7b7',leaf:'#96bd79',leafDark:'#557f62',gold:'#dcb666',teal:'#6aa99b',blue:'#617e9f'};
 const NIGHT={...P,fur:'#edf3ef',light:'#fafdf7',shade:'#cfddd6',deep:'#a0b9b3',black:'#2d3b43',hi:'#475b64',edge:'#202e37',pink:'#ddb0b5'},cache=new Map();
 const atlas=new Image();let atlasLoaded=false;
 const atlasPiece=(box,width,height)=>({atlas:true,box,width,height});
 const portraitParts={
  head:atlasPiece([12,50,420,365],52,45),
  closed:atlasPiece([456,50,420,365],52,45),
  happy:atlasPiece([900,50,420,365],52,45),
  singing:atlasPiece([1344,50,420,365],52,45),
  body:atlasPiece([24,493,395,368],28,25),
  arm:atlasPiece([560,540,240,256],14,15),
  foot:atlasPiece([985,574,250,232],17,14),
  bamboo:atlasPiece([1448,540,226,268],11,14)
 };

 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
 const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
 function oval(c,x,y,w,h,color,edge,shade,hi){const inside=(xx,yy)=>((xx+.5-w/2)/(w/2))**2+((yy+.5-h/2)/(h/2))**2<=1;for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)if(inside(xx,yy)){const border=!inside(xx-1,yy)||!inside(xx+1,yy)||!inside(xx,yy-1)||!inside(xx,yy+1);rect(c,x+xx,y+yy,1,1,border&&edge?edge:shade&&yy>h*.65&&xx>w*.25?shade:hi&&yy<h*.3&&xx<w*.62?hi:color);}}
 function line(c,x0,y0,x1,y1,color){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let err=dx+dy;for(let i=0;i<200;i++){rect(c,x0,y0,1,1,color);if(x0===x1&&y0===y1)break;const e=2*err;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}}
 function sprite(key,w,h,paint){if(cache.has(key))return cache.get(key);const s=document.createElement('canvas');s.width=w;s.height=h;paint(s.getContext('2d'));cache.set(key,s);return s;}
 function part(c,s,x,y,angle=0,sx=1,sy=1,ax=s.width/2,ay=s.height/2){c.save();c.translate(x,y);c.rotate(angle*PI/180);c.scale(sx,sy);if(s.atlas)c.drawImage(atlas,...s.box,-ax,-ay,s.width,s.height);else c.drawImage(s,-ax,-ay);c.restore();}
 function parts(p,dark){const k=dark?'night':'day';if(atlasLoaded)return {...portraitParts,
  back:sprite(k+'back',28,23,c=>{oval(c,0,0,28,23,p.black,p.edge);oval(c,6,3,17,17,p.fur);}),
  backHead:sprite(k+'backhead',52,45,c=>{oval(c,3,3,13,13,p.black,p.edge);oval(c,36,3,13,13,p.black,p.edge);oval(c,1,2,50,42,p.fur,p.shade);oval(c,4,3,44,37,p.light);})
 };return {
  body:sprite(k+'body',28,23,c=>{oval(c,0,0,28,23,p.black,p.edge);oval(c,3,0,22,22,p.fur);oval(c,5,0,18,18,p.light);}),
  back:sprite(k+'back',28,23,c=>{oval(c,0,0,28,23,p.black,p.edge);oval(c,6,3,17,17,p.fur);}),
  arm:sprite(k+'arm',12,14,c=>{oval(c,0,0,12,14,p.black,p.edge);rect(c,2,3,2,4,p.hi);}),
  foot:sprite(k+'foot',16,12,c=>{oval(c,0,0,16,12,p.black,p.edge);oval(c,5,5,6,4,p.hi);rect(c,4,3,2,2,p.hi);rect(c,8,2,2,2,p.hi);rect(c,11,4,2,2,p.hi);}),
  patch:sprite(k+'patch',11,13,c=>{oval(c,0,0,11,13,p.black);}),
  head:sprite(k+'head',48,49,c=>{
   oval(c,3,8,13,13,p.black,p.edge);oval(c,32,8,13,13,p.black,p.edge);rect(c,6,10,4,2,p.hi);rect(c,35,10,4,2,p.hi);
   // A pear-shaped silhouette: round crown, broad cheeks and a soft chin.
   const inside=(x,y)=>{const ny=(y+.5-27)/21;return ((x+.5-24)/(22*(1+.12*ny)))**2+ny*ny<=1;};
   for(let y=6;y<49;y++)for(let x=0;x<48;x++)if(inside(x,y)){
    const rim=!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1);
    rect(c,x,y,1,1,rim?(y>36?p.deep:p.shade):y>44?p.shade:x<32&&y<37?p.light:p.fur);
   }
  })
 };}
 function bamboo(c,x,y,p,angle=0){c.save();c.translate(Math.round(x),Math.round(y));c.rotate(angle*PI/180);rect(c,-1,-10,2,19,p.leafDark);rect(c,0,-9,1,17,p.leaf);for(const yy of [-7,0,6])rect(c,-1,yy,3,1,p.gold);line(c,0,-7,7,-12,p.leafDark);rect(c,3,-12,5,2,p.leaf);rect(c,5,-14,4,2,p.leaf);line(c,0,-3,-7,-7,p.leafDark);rect(c,-8,-8,5,2,p.leaf);rect(c,-6,-6,4,2,p.leaf);c.restore();}
 function star(c,x,y,color){rect(c,x,y-2,1,5,color);rect(c,x-2,y,5,1,color);}
 function scene(c,id,p,t,action){if(id==='no-decor'&&!['water','fish'].includes(action))return;const water=id==='pond'||action==='fish';oval(c,5,63,54,8,water?'#789eac':'#84976a',null,water?'#527d97':'#687e52');
  if(water){line(c,9,65,22,65,'#b7d5c9');line(c,35,68,52,68,'#a6c8c3');rect(c,48,65,6,2,p.leaf);}
  if(action==='water'){line(c,56,66,56,61,p.leafDark);rect(c,54,59,5,3,p.pink);rect(c,55,60,2,1,p.gold);}
  if(['meadow','blossom','bamboo-grove'].includes(id)){for(const x of [6,10,53,58]){line(c,x,65,x-2,61,p.leafDark);line(c,x,65,x+2,60,p.leaf);}if(id!=='bamboo-grove')for(const [x,y] of [[8,60],[54,59]]){rect(c,x,y,3,3,p.pink);rect(c,x+1,y+1,1,1,p.gold);}}
  if(id==='bamboo-grove'){bamboo(c,7,43,p,-8);bamboo(c,57,40,p,8);bamboo(c,4,56,p,-8);}
  if(id==='blossom'){line(c,54,63,54,31,'#86674f');line(c,54,36,47,29,'#86674f');for(const [x,y] of [[46,27],[52,25],[57,29],[59,34]])oval(c,x-4,y-3,9,6,'#dba8ac',null,'#b88397','#efd0bd');rect(c,7+Math.round(t)%4,46+Math.round(t*2)%10,2,1,'#dba8ac');}
  if(id==='lantern'){line(c,55,62,55,24,'#8d6e55');line(c,47,24,55,24,'#8d6e55');rect(c,46,26,7,10,'#b2745c');rect(c,47,28,5,6,'#e1b978');rect(c,49,27,1,8,'#f1d5a0');}
  if(id==='observatory'){rect(c,3,58,13,3,'#686785');line(c,6,58,5,67,p.deep);line(c,12,58,15,67,p.deep);line(c,6,56,15,47,p.blue);rect(c,12,45,5,4,'#8fa9b8');star(c,54,23,p.gold);star(c,8,28,'#a8bdd0');}
 }
 function clothing(c,id,p){if(['coat','raincoat','spacesuit'].includes(id)){const color=id==='raincoat'?'#d5b363':id==='spacesuit'?'#b6c5c6':'#dce4d5';rect(c,21,44,23,17,p.edge);rect(c,22,44,21,16,color);line(c,32,45,32,60,p.deep);rect(c,37,52,4,4,id==='raincoat'?'#a6894f':p.teal);rect(c,25,49,2,2,p.gold);}
  if(['scarf','redscarf'].includes(id)){const color=id==='redscarf'?'#b96660':p.teal;rect(c,20,45,24,4,p.edge);rect(c,21,45,22,3,color);rect(c,39,48,4,12,color);rect(c,39,56,4,1,p.gold);}
  if(id==='backpack'){rect(c,44,44,7,16,'#976c47');rect(c,45,46,5,12,'#c79859');rect(c,46,51,3,2,p.gold);}
 }
 function hat(c,id,p,a,form){c.save();c.translate(Math.round(a.headX),Math.round(a.headY));c.rotate(a.headAngle*PI/180);c.scale(a.headScale,a.headScale);
  if(id==='goggles'){rect(c,-20,8,40,2,p.leafDark);rect(c,-16,4,14,10,p.teal);rect(c,2,4,14,10,p.teal);rect(c,-14,6,10,6,'#a0c4bf');rect(c,4,6,10,6,'#a0c4bf');rect(c,-13,6,3,1,p.light);rect(c,5,6,3,1,p.light);}
  if(id==='cap'){for(let y=0;y<6;y++)rect(c,-12+y,-18+y,25-y*2,1,p.edge);rect(c,-9,-13,18,3,p.black);line(c,11,-15,14,-10,p.gold);line(c,14,-10,14,-4,p.gold);rect(c,13,-5,3,3,p.gold);}
  if(id==='strawhat'){oval(c,-23,-18,46,8,p.gold,p.edge,'#b38f52','#ead196');rect(c,-12,-23,24,8,'#dabb78');rect(c,-10,-25,20,2,'#ead196');rect(c,-12,-18,24,3,'#9c694d');}
  if(id==='flower'){for(const [x,y] of [[-16,-9],[-18,-12],[-14,-12],[-16,-15]])rect(c,x,y,3,3,'#d595aa');rect(c,-16,-12,3,3,p.gold);line(c,-13,-10,-9,-13,p.leafDark);}
  if(id==='headphones'){rect(c,-20,-10,3,12,'#826e98');rect(c,17,-10,3,12,'#826e98');line(c,-17,-17,17,-17,'#826e98');rect(c,-21,-7,5,8,'#b296b7');rect(c,16,-7,5,8,'#b296b7');}
  if(id==='wizard'){for(let y=0;y<19;y++)rect(c,-Math.floor(y/2),-25+y,1+Math.floor(y/2)*2,1,y>14?'#7b6f9d':'#5f5a83');rect(c,-14,-6,29,3,'#887ca9');star(c,1,-13,p.gold);}
  if(id==='raincoat'){line(c,-17,-10,-17,-1,'#e1bc67');line(c,17,-10,17,-1,'#e1bc67');}
  if(form==='engineer'&&!['cap','strawhat','wizard'].includes(id)){rect(c,-11,-16,22,4,'#c79c52');rect(c,-8,-21,16,5,'#e3bc70');rect(c,-2,-20,3,7,'#f1d593');}
  if(form==='astronaut'||id==='spacesuit'){const inside=(x,y)=>((x+.5)/27)**2+((y+.5+1)/25)**2<=1;for(let y=-27;y<25;y++)for(let x=-28;x<28;x++)if(inside(x,y)&&(!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1)))rect(c,x,y,1,1,'#a8c3cf');rect(c,-18,-13,1,6,'#def0e8');rect(c,-17,-15,2,2,'#def0e8');rect(c,-16,19,32,3,'#899aa8');}
  c.restore();
 }
 function base(t,lookX=0,lookY=0){return {x:32,y:45,angle:0,sx:1,sy:1,bodyX:32,bodyY:56,headX:32,headY:26,headAngle:Math.sin(t*.85)*1.8+lookX*2.2,headScale:1,bodyScale:1,bodySy:1,left:-18,right:18,leftX:19,rightX:45,armY:51,footLX:22,footRX:42,footLY:64,footRY:64,eyes:'open',mouth:0,lookX,lookY,back:false,prop:'',breathe:0};}
 function pose(action,elapsed,duration,lookX=0,lookY=0){const t=elapsed/1000,f=clamp(elapsed/(duration||4000),0,1),env=smooth(t/.25)*smooth(((duration||4000)-elapsed)/380),a=base(t,lookX,lookY),s=Math.sin(t*TAU/.7),beat=Math.sin(t*TAU/1.2);a.breathe=Math.sin(t*TAU/3.6)*.4;
  if(action==='wave'){a.right=lerp(18,-140+25*Math.sin(t*TAU/.6),env);a.headAngle=-7*env;a.footRY-=Math.max(0,s)*env;}
  if(action==='sleep'){a.eyes='closed';a.headAngle=(9+Math.sin(t*2)*2)*env;a.headY+=env*2;a.breathe=Math.sin(t*2)*.6;a.prop='sleep';}
  if(action==='jump'||action==='cheer'){const length=action==='jump'?1.2:.95,q=(t%length)/length,lift=Math.max(0,Math.sin(clamp((q-.18)/.65,0,1)*PI))*8*env;a.y-=lift;a.sy=1-.09*Math.max(0,Math.sin(q*TAU))*env;a.left=lerp(-18,125,env*Math.max(0,Math.sin(q*PI)));a.right=-a.left;if(action==='cheer'){a.eyes='happy';a.prop='stars';}}
  if(action==='roll'){a.angle=360*smooth(clamp((f-.12)/.76,0,1))-12*Math.sin(f*TAU);a.sx=a.sy=1-.2*Math.sin(f*PI);a.y=45-3*env;a.x+=Math.sin(f*TAU)*4;a.left=-125*env;a.right=125*env;a.footLY-=8*env;a.footRY-=8*env;a.eyes='happy';}
  if(action==='dance'||action==='sway'){const b=action==='dance'?s:Math.sin(t*TAU);a.x+=b*2.5*env;a.angle=b*5*env;a.headAngle=-b*6*env;a.eyes='happy';a.left=lerp(-18,action==='dance'?45+40*b:132+18*b,env);a.right=lerp(18,action==='dance'?-45+40*b:-132+18*b,env);a.footLY-=Math.max(0,b)*3*env;a.footRY-=Math.max(0,-b)*3*env;}
  if(action==='crawl'){a.headX-=10*env;a.headY+=17*env;a.headScale=1-.24*env;a.headAngle=-8*env;a.bodyY+=5*env;a.bodyX+=7*env;a.bodyScale=1;a.bodySy=1-.3*env;a.leftX=lerp(19,20,env);a.rightX=lerp(45,38,env);a.armY+=7*env;a.left=lerp(-18,18*s,env);a.right=lerp(18,-18*s,env);a.footLX=lerp(23,39+2*s,env);a.footRX=lerp(41,49-2*s,env);a.footLY-=Math.max(0,s)*3*env;a.footRY-=Math.max(0,-s)*3*env;}
  if(action==='sing'){a.headAngle=beat*6*env;a.headY-=Math.max(0,s)*env;a.right=lerp(18,120,env);a.left=lerp(-18,30+20*beat,env);a.mouth=env>.4?(Math.sin(t*TAU/.34)>.05?2:1):0;a.prop='music';}
  if(action==='stretch'){const e=Math.sin(f*PI);a.left=lerp(-18,150,e);a.right=-a.left;a.armY-=5*e;a.headY-=2*e;a.eyes=e>.45?'closed':'open';a.sy+=e*.05;}
  if(action==='spin'){const angle=smooth(f)*TAU*2;a.sx=Math.max(.12,Math.abs(Math.cos(angle)));a.back=Math.cos(angle)<0;a.left=65*env;a.right=-65*env;a.headAngle=0;a.footLX+=4*env;a.footRX-=4*env;}
  if(action==='munch'){a.left=lerp(-18,-112-12*beat,env);a.headAngle=-5*env;a.mouth=env>.4?(s>.1?1:0):0;a.prop='bamboo';a.lookY=1;}
  if(action==='read'){a.left=-35*env;a.right=35*env;a.headAngle=-3*env;a.lookY=1;a.prop='book';a.headY+=env;}
  if(action==='water'){a.right=lerp(18,-65+4*beat,env);a.headAngle=6*env;a.lookX=1;a.lookY=1;a.prop='water';}
  if(action==='fish'){a.left=lerp(-18,-132+3*beat,env);a.headAngle=-6*env;a.lookX=-1;a.prop='fish';}
  if(action==='meditate'){a.eyes='closed';a.footLX+=5*env;a.footRX-=5*env;a.left=lerp(-18,30,env);a.right=-a.left;a.breathe=Math.sin(t*2)*.7;a.prop='meditate';}
  if(action==='experiment'){a.left=lerp(-18,130+8*beat,env);a.lookX=-1;a.headAngle=-5*env;a.prop='flask';}
  if(!action&&t%5.6>5.26)a.eyes=t%5.6>5.48?'open':'blink';a.carry=!action||action==='wave';return a;
 }
 function face(c,p,s,a,form,outfit){c.save();c.translate(Math.round(a.headX),Math.round(a.headY));c.rotate(a.headAngle*PI/180);c.scale(a.headScale,a.headScale);if(s.head.atlas){
   if(a.back)part(c,s.backHead,0,0);
   else{const expression=a.eyes==='happy'?s.happy:['closed','blink'].includes(a.eyes)?s.closed:a.mouth?s.singing:s.head;part(c,expression,0,0);}
   c.restore();hat(c,outfit,p,a,form);return;
  }c.drawImage(s.head,-24,-24);
  if(!a.back){
   part(c,s.patch,-10,9,27);part(c,s.patch,10,9,-27);
   for(const side of [-1,1]){const ex=side*9,ey=9;
    if(['happy','closed','blink'].includes(a.eyes)){
     if(a.eyes==='happy'){rect(c,ex-2,ey,1,1,p.light);rect(c,ex-1,ey-1,3,1,p.light);rect(c,ex+2,ey,1,1,p.light);}
     else{rect(c,ex-2,ey+1,4,1,p.deep);rect(c,ex-2,ey,1,1,p.deep);}
    }else{const dx=Math.round(a.lookX),dy=Math.round(a.lookY);oval(c,ex-2+dx,ey-2+dy,5,6,p.edge);rect(c,ex+dx,ey-2+dy,2,2,p.light);rect(c,ex-1+dx,ey+dy,1,1,p.light);}
   }
   oval(c,-19,15,7,3,p.pink);oval(c,12,15,7,3,p.pink);
   rect(c,-2,14,5,1,p.edge);rect(c,-1,15,3,1,p.edge);rect(c,0,16,1,1,p.edge);
   if(a.mouth){oval(c,-2,17,5,a.mouth===2?5:3,p.edge);if(a.mouth===2)rect(c,-1,20,3,1,p.pink);}
   else{rect(c,0,17,1,1,p.edge);rect(c,-2,18,2,1,p.edge);rect(c,1,18,2,1,p.edge);rect(c,-3,17,1,1,p.edge);rect(c,3,17,1,1,p.edge);}
   if(form==='master'){rect(c,-14,-3,7,1,p.deep);rect(c,7,-3,7,1,p.deep);rect(c,-13,-4,4,1,p.light);rect(c,8,-4,4,1,p.light);}
  }else{rect(c,-3,-8,6,2,p.light);rect(c,10,8,2,3,p.shade);}
  c.restore();hat(c,outfit,p,a,form);
 }
 function props(c,a,p,t){const hand=side=>({x:a[side+'X']-Math.sin(a[side]*PI/180)*11,y:a.armY+Math.cos(a[side]*PI/180)*11});if(a.prop==='bamboo'||a.carry){if(atlasLoaded)part(c,portraitParts.bamboo,a.prop==='bamboo'?27:24,a.prop==='bamboo'?49+Math.sin(t*5):56,-18);else bamboo(c,24,55,p,8);}
  if(a.prop==='music'){const h=hand('right');line(c,h.x,h.y+3,h.x+3,h.y-2,p.deep);oval(c,h.x+1,h.y-6,7,7,p.black,p.edge,null,p.hi);rect(c,h.x+2,h.y-4,5,1,p.deep);for(let i=0;i<3;i++){const y=18+((i*11-t*9)%28+28)%28,x=i===0?7:54+i*3;rect(c,x,y,1,6,i===1?p.gold:p.teal);rect(c,x,y,3,1,i===1?p.gold:p.teal);rect(c,x-2,y+5,2,2,i===1?p.gold:p.teal);}}
  if(a.prop==='sleep'){const y=19-Math.round(t*3)%8;line(c,51,y,55,y,p.teal);line(c,55,y,51,y+4,p.teal);line(c,51,y+4,55,y+4,p.teal);}
  if(a.prop==='book'){rect(c,22,49,22,12,'#996a51');rect(c,23,48,9,11,p.fur);rect(c,33,48,10,11,p.light);line(c,32,49,32,60,'#9b785e');for(let y=51;y<58;y+=3){line(c,25,y,29,y,p.deep);line(c,35,y,40,y,p.deep);}if(Math.sin(t*2)>0)line(c,31,49,29,58,p.shade);}
  if(a.prop==='water'){rect(c,48,46,9,8,p.blue);rect(c,50,45,6,2,p.hi);line(c,57,48,61,46,p.blue);rect(c,60,45,3,2,p.blue);for(let i=0;i<3;i++)rect(c,59-i,51+Math.floor((t*8+i*3)%11),1,2,'#89b3c1');}
  if(a.prop==='fish'){const h=hand('left');line(c,h.x,h.y,6,17,'#a58158');line(c,6,17,3,56,p.deep);rect(c,2,57+Math.round(Math.sin(t*3)),3,2,'#c48065');}
  if(a.prop==='flask'){const h=hand('left');rect(c,h.x-1,h.y-1,3,8,'#abc6be');oval(c,h.x-5,h.y+5,11,9,'#abc6be',p.edge);rect(c,h.x-3,h.y+9,7,3,p.teal);for(let i=0;i<3;i++)rect(c,h.x+(i%2)*2,h.y+7-Math.round((t*7+i*5)%17),1,1,p.teal);}
  if(a.prop==='stars'||a.prop==='meditate')for(let i=0;i<2;i++)star(c,8+i*48,40+Math.round(Math.sin(t*TAU/3+i)*5),i?p.teal:p.gold);
 }
 function render(canvas,o={}){const c=canvas.getContext('2d',{willReadFrequently:true}),dark=o.dark??document.documentElement.dataset.theme==='dark',p=dark?NIGHT:P,s=parts(p,dark),t=(o.elapsed??0)/1000,action=o.action||'',form=o.form||'cub',outfit=o.outfit||'none',decoration=o.decoration||'no-decor';c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=false;c.clearRect(0,0,canvas.width,canvas.height);c.scale(canvas.width/64,canvas.width/64);const a=pose(action,o.elapsed??0,o.duration||window.foamPandaMotion?.durations[action],o.lookX||0,o.lookY||0);
  if(o.from&&o.blend<1){const b=pose(o.from.action,o.from.elapsed,window.foamPandaMotion?.durations[o.from.action],o.from.lookX,o.from.lookY);for(const key of Object.keys(a))if(typeof a[key]==='number')a[key]=['angle','headAngle','left','right'].includes(key)?b[key]+(((a[key]-b[key]+540)%360)-180)*o.blend:lerp(b[key],a[key],o.blend);}
  if(o.settle){const b=base(0,o.lookX||0,o.lookY||0);for(const key of Object.keys(b))if(typeof b[key]==='number')a[key]=['angle','headAngle','left','right'].includes(key)?a[key]+(((b[key]-a[key]+540)%360)-180)*o.settle:lerp(a[key],b[key],o.settle);if(o.settle>.5){a.prop='';a.eyes='open';a.mouth=0;}}
  if(canvas.dataset.faceOnly==='true'){c.save();c.translate(32,32);c.scale(1.12,1.12);a.headX=0;a.headY=0;a.headAngle=0;a.headScale=1;a.eyes='open';face(c,p,s,a,form,'none');c.restore();crisp(c,canvas.width,canvas.height,dark);return;}
  scene(c,decoration,p,t,action);oval(c,14,66,36,4,dark?'#243532':'#b6bea4');c.save();
  const duration=o.duration||window.foamPandaMotion?.durations[action]||4000;
  const motionEase=smooth((o.elapsed??0)/250)*smooth((duration-(o.elapsed??0))/380);
  const headwear=['wizard','strawhat','spacesuit'].includes(outfit)||form==='astronaut';
  const liftAction=['jump','cheer','stretch'].includes(action);
  const fit=Math.min(headwear?.88:1,liftAction?1-.12*motionEase:1);
  if(fit<1){c.translate(32,66);c.scale(fit,fit);c.translate(-32,-66);}
  if(action==='crawl'&&o.facing==='right'){c.translate(64,0);c.scale(-1,1);}
  const rollPivot=action==='roll'?8:0;
  if(action==='roll'){const r=a.angle*PI/180,co=Math.abs(Math.cos(r)),si=Math.abs(Math.sin(r));const turnFit=Math.min(1,54/(54*co+68*si),68/(68*co+54*si));a.sx=Math.min(a.sx,turnFit);a.sy=Math.min(a.sy,turnFit);}
  c.translate(a.x,a.y-rollPivot);c.rotate(a.angle*PI/180);c.scale(a.sx,a.sy);c.translate(-32,-45+rollPivot);c.translate(0,Math.round(a.breathe));
  if(form==='explorer'){a.bodyScale=1.05;a.headScale*=.94;}if(form==='master'){a.bodyScale=1.09;a.headScale*=.97;}if(form==='engineer'){a.bodyScale=1.1;a.headScale*=.93;}if(form==='astronaut'){a.bodyScale=1.08;a.headScale*=.9;}
  if(form==='explorer'||outfit==='backpack'){rect(c,42,44,8,17,'#9a734f');rect(c,44,47,6,10,'#c29865');}if(form==='astronaut'){rect(c,43,43,8,17,'#869da9');rect(c,45,44,5,5,'#b8cace');}
  if(form==='master'){for(let y=43;y<63;y++)rect(c,18-Math.floor((y-43)/7),y,28+2*Math.floor((y-43)/7),1,y>59?'#617e9f':'#414553');}
  part(c,a.back?s.back:s.body,a.bodyX,a.bodyY,0,a.bodyScale,a.bodyScale*a.bodySy);
  if(form==='explorer'){line(c,22,43,40,58,'#976c47');line(c,23,43,41,58,'#c79859');rect(c,39,53,9,9,'#976c47');rect(c,40,54,7,6,'#c79859');rect(c,42,56,2,2,p.gold);rect(c,23,39,18,3,p.leafDark);for(let y=0;y<5;y++)rect(c,29+y/2,42+y,6-y,1,p.leaf);}
  if(form==='master'){rect(c,19,45,4,14,p.blue);rect(c,41,45,4,14,p.blue);star(c,24,47,p.gold);}
  if(form==='engineer'){rect(c,24,49,17,11,p.blue);rect(c,25,45,3,9,p.blue);rect(c,37,45,3,9,p.blue);rect(c,27,50,2,2,p.gold);rect(c,35,50,2,2,p.gold);}if(form==='astronaut'){rect(c,24,48,17,12,'#c5d3cb');rect(c,27,48,10,6,p.hi);rect(c,28,49,3,2,p.teal);rect(c,34,49,2,2,p.gold);}
  part(c,s.foot,a.footLX,a.footLY,-9);part(c,s.foot,a.footRX,a.footRY,9);clothing(c,outfit,p);part(c,s.arm,a.leftX,a.armY,a.left,1,1,6,3);part(c,s.arm,a.rightX,a.armY,a.right,1,1,6,3);face(c,p,s,a,form,outfit);props(c,a,p,t);c.restore();crisp(c,canvas.width,canvas.height,dark);
 }
 const extra=['#202024','#29292d','#3c3c42','#55565d','#fefdfb','#f3eee6','#e6e0d7','#bab8b3','#ffd2d3','#efa8ad','#131318','#afca6c','#5e963a','#789eac','#84976a','#527d97','#687e52','#b7d5c9','#a6c8c3','#86674f','#dba8ac','#b88397','#efd0bd','#8d6e55','#b2745c','#e1b978','#f1d5a0','#686785','#8fa9b8','#a8bdd0','#d5b363','#b6c5c6','#dce4d5','#a6894f','#b96660','#976c47','#c79859','#a0c4bf','#b38f52','#ead196','#dabb78','#9c694d','#d595aa','#826e98','#b296b7','#7b6f9d','#5f5a83','#887ca9','#e1bc67','#c79c52','#e3bc70','#f1d593','#a8c3cf','#def0e8','#899aa8','#996a51','#9b785e','#89b3c1','#a58158','#c48065','#abc6be','#243532','#b6bea4','#9a734f','#c29865','#869da9','#b8cace','#c5d3cb'];
 const colors=Object.fromEntries([false,true].map(dark=>[dark,[...new Set([...Object.values(dark?NIGHT:P),...extra])].map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)))])),quantized=new Map();
 function crisp(c,w,h,dark){const image=c.getImageData(0,0,w,h),data=image.data;for(let i=0;i<data.length;i+=4){if(data[i+3]<128){data[i+3]=0;continue;}data[i+3]=255;const key=(dark?'d':'l')+((data[i]<<16)|(data[i+1]<<8)|data[i+2]);let color=quantized.get(key);if(!color){let score=Infinity;for(const candidate of colors[dark]){const distance=(data[i]-candidate[0])**2+(data[i+1]-candidate[1])**2+(data[i+2]-candidate[2])**2;if(distance<score){score=distance;color=candidate;}if(!distance)break;}if(quantized.size>10000)quantized.clear();quantized.set(key,color);}data[i]=color[0];data[i+1]=color[1];data[i+2]=color[2];}c.putImageData(image,0,0);}
 const entries=new Map();let loop=0,lastFrame=0,dirty=true;
 function stateFor(el){const root=el.closest('[data-form]')||el.parentElement,actionRoot=el.closest('[data-action]'),preview=el.closest('[data-preview-action]');return {root,action:actionRoot?.dataset.action||preview?.dataset.previewAction||'',stamp:actionRoot?.dataset.actionStarted||'',preview:!!preview,quiet:reduce.matches||!!el.closest('[data-quiet=true]')||el.dataset.faceOnly==='true',form:root?.dataset.form||'cub',outfit:(el.closest('[data-outfit]')||root)?.dataset.outfit||'none',decoration:(el.closest('[data-decoration]')||root)?.dataset.decoration||'no-decor'};}
 const visibility=new IntersectionObserver(list=>{for(const item of list){const e=entries.get(item.target);if(e){e.visible=item.isIntersecting;e.needsDraw=true;}}schedule();},{rootMargin:'30px'});
 function scan(){for(const el of document.querySelectorAll('canvas.panda-pixel-art'))if(!entries.has(el)){entries.set(el,{visible:true,start:performance.now(),lastAction:'',stamp:'',settledAt:0,previous:null});visibility.observe(el);}for(const [el]of entries)if(!el.isConnected){visibility.unobserve(el);entries.delete(el);}dirty=true;schedule();}
 function tick(now){loop=0;if(document.hidden)return;if(now-lastFrame<1000/FPS){schedule();return;}lastFrame=now;let active=false;
  for(const [el,e]of entries){if(!e.visible||!el.isConnected)continue;const s=stateFor(el),key=[s.action,s.stamp,s.form,s.outfit,s.decoration,s.quiet,document.documentElement.dataset.theme].join('|');if(key!==e.key){if(!s.action&&e.lastAction&&e.previous){e.settledAt=now;e.settled=e.previous;}else e.settledAt=0;if(s.action&&(s.action!==e.lastAction||s.stamp!==e.stamp))e.transition=e.previous;e.start=now;e.key=key;e.lastAction=s.action;e.stamp=s.stamp;e.needsDraw=true;}
   const floating=el.closest('.panda-pet'),live=!s.quiet&&!s.preview&&(!!floating||!!s.action||!!e.settledAt),clock=s.preview?1000:s.quiet?0:now-e.start;
   if(dirty||e.needsDraw||live){const look=floating?getComputedStyle(floating):null;let o={action:s.action,elapsed:clock,form:s.form,outfit:s.outfit,decoration:s.decoration,facing:floating?.dataset.facing||'left',lookX:look?parseFloat(look.getPropertyValue('--look-x'))/3||0:0,lookY:look?parseFloat(look.getPropertyValue('--look-y'))/2||0:0};if(e.settledAt&&!s.quiet){const settle=clamp((now-e.settledAt)/250,0,1);o={...e.settled,settle};if(settle===1)e.settledAt=0;}if(e.transition&&s.action&&!s.quiet&&!s.preview){o.from=e.transition;o.blend=smooth((now-e.start)/200);if(o.blend===1)e.transition=null;}render(el,o);delete o.from;delete o.blend;e.previous=o;e.needsDraw=false;}if(live)active=true;
  }dirty=false;if(active)schedule();
 }
 function schedule(){if(!loop&&!document.hidden)loop=requestAnimationFrame(tick);}
 new MutationObserver(list=>{let changed=false;for(const m of list){if(m.type==='childList'&&[...m.addedNodes,...m.removedNodes].some(n=>n.nodeType===1&&(n.matches?.('canvas.panda-pixel-art')||n.querySelector?.('canvas.panda-pixel-art'))))changed=true;else if(m.type==='attributes')dirty=true;}if(changed)scan();else if(dirty)schedule();}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-action','data-action-started','data-form','data-outfit','data-decoration','data-quiet','hidden']});
 new MutationObserver(()=>{dirty=true;schedule();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});reduce.addEventListener('change',()=>{dirty=true;schedule();});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(loop);loop=0;}else{dirty=true;schedule();}});
 document.querySelectorAll('.brand-mark').forEach(el=>el.innerHTML=window.foamPandaArt(true));window.foamPandaPixels={render,pose,fps:FPS,palette:P,scan,get ready(){return atlasLoaded;}};atlas.onload=()=>{atlasLoaded=true;cache.clear();dirty=true;schedule();};atlas.src='/assets/panda-sprites-v2.webp';scan();
})();
