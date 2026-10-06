'use strict';
/* 熊猫画卡 — illustrated panda cards. 48 cards in five series (日常四季, 流动之美, 节日, 十二生肖, 十二星座)
 * and three rarities, drawn as SVG scenes around the site's
 * vector panda (panda-art.js) so they stay crisp at any size and cost almost nothing to download.
 * Cards come from blind boxes, fishing and finishing all daily tasks (server: town art cards migration);
 * owned cards are the 'art:<id>' entries of the town inventory. This file draws the cards, the album,
 * the flip reveal and the large view. */
(() => {
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let uid=0;
 const rnd=seed=>()=>((seed=Math.imul(seed^seed>>>15,seed|1)^(seed+Math.imul(seed^seed>>>7,seed|61)))>>>0)/4294967296;

 /* ---- scene kit: everything in a 300 x 300 art box ------------------------------------------------ */
 const K={
  sky:(id,stops)=>`<defs><linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1">${stops.map((c,i)=>`<stop offset="${(i/(stops.length-1)).toFixed(2)}" stop-color="${c}"/>`).join('')}</linearGradient></defs><rect width="300" height="300" fill="url(#${id}s)"/>`,
  glow:(id,x,y,r,c,o=.55)=>`<defs><radialGradient id="${id}g${x}${y}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}g${x}${y})"/>`,
  sun:(id,x,y,r,c='#ffe7a3')=>K.glow(id,x,y,r*3.2,c,.6)+`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`,
  moon:(id,x,y,r)=>K.glow(id,x,y,r*3,'#fff6cf',.45)+`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff4cf"/><circle cx="${x-r*.35}" cy="${y-r*.2}" r="${r*.18}" fill="#efe1ae"/><circle cx="${x+r*.3}" cy="${y+r*.35}" r="${r*.12}" fill="#efe1ae"/><circle cx="${x+r*.25}" cy="${y-r*.4}" r="${r*.09}" fill="#efe1ae"/>`,
  stars:(n,seed,h=170,c='#fff8dc',x0=0,y0=0,w=300)=>{const r=rnd(seed);let s='';for(let i=0;i<n;i++){const x=x0+r()*w,y=y0+r()*h,k=r();s+=k>.86?`<path d="M${x} ${y-3.4}L${x+.9} ${y-.9} ${x+3.4} ${y} ${x+.9} ${y+.9} ${x} ${y+3.4} ${x-.9} ${y+.9} ${x-3.4} ${y} ${x-.9} ${y-.9}Z" fill="${c}" class="tac-twinkle" style="animation-delay:${(-k*4).toFixed(2)}s"/>`:`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(.6+k*1.1).toFixed(2)}" fill="${c}" opacity="${(.5+k*.5).toFixed(2)}"/>`;}return s;},
  cloud:(x,y,s=1,c='#ffffff',o=.95)=>`<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><path d="M-38 10q-2-16 16-17q6-17 26-12q14-12 28 2q20-2 20 16q14 3 10 11H-44q-6-2 6-0Z" fill="${c}"/><path d="M-40 12h96" stroke="#000" stroke-opacity=".06" stroke-width="4"/></g>`,
  hill:(y,amp,c,seed=1,shade)=>{const r=rnd(seed);let d=`M0 ${y}`;for(let x=0;x<=300;x+=50){d+=` Q${x+25} ${y-amp*(.4+r())} ${x+50} ${y-amp*.2*r()}`;}return `<path d="${d} V300 H0Z" fill="${c}"/>`+(shade?`<path d="${d}" fill="none" stroke="${shade}" stroke-width="3" opacity=".6"/>`:'');},
  mountains:(y,c,seed=3,peaks=4,h=90)=>{const r=rnd(seed);let d=`M0 ${y}`;const w=300/peaks;for(let i=0;i<peaks;i++){const px=i*w+w*(.3+r()*.4),ph=y-h*(.55+r()*.45);d+=` L${px.toFixed(1)} ${ph.toFixed(1)} L${(i+1)*w} ${(y-h*.15*r()).toFixed(1)}`;}return `<path d="${d} V300 H0Z" fill="${c}"/>`;},
  water:(id,y,c1,c2)=>`<defs><linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect y="${y}" width="300" height="${300-y}" fill="url(#${id}w)"/>`+[0,1,2,3,4].map(i=>`<path d="M${20+i*57} ${y+14+i*9}h${26+i*3}" stroke="#ffffff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round" class="tac-ripple" style="animation-delay:${-i*.7}s"/>`).join(''),
  ground:(y,c,edge)=>`<path d="M0 ${y} Q150 ${y-10} 300 ${y} V300 H0Z" fill="${c}"/>`+(edge?`<path d="M0 ${y} Q150 ${y-10} 300 ${y}" stroke="${edge}" stroke-width="3" fill="none"/>`:''),
  bamboo:(x,top,w=11,c='#7fae5c',dark='#4f7f3c')=>{let s=`<rect x="${x}" y="${top}" width="${w}" height="${320-top}" rx="${w/2}" fill="${c}"/><rect x="${x+w*.18}" y="${top}" width="${w*.22}" height="${320-top}" fill="#ffffff" opacity=".18"/>`;for(let y=top+34;y<300;y+=46)s+=`<rect x="${x-1}" y="${y}" width="${w+2}" height="3.5" rx="1.5" fill="${dark}"/>`;s+=`<path d="M${x+w} ${top+40}q22-12 34-2q-18 10-34 2Z" fill="#8fbf68"/><path d="M${x} ${top+86}q-24-10-34 2q18 9 34-2Z" fill="#8fbf68"/>`;return s;},
  tree:(x,y,r,c1,c2,trunk='#8a5d3b')=>`<path d="M${x-5} ${y+r*1.6}L${x-3} ${y}h7l2 ${r*1.6}Z" fill="${trunk}"/><circle cx="${x-r*.55}" cy="${y+r*.15}" r="${r*.7}" fill="${c2}"/><circle cx="${x+r*.55}" cy="${y+r*.1}" r="${r*.72}" fill="${c2}"/><circle cx="${x}" cy="${y-r*.35}" r="${r*.85}" fill="${c1}"/><circle cx="${x-r*.3}" cy="${y-r*.55}" r="${r*.32}" fill="#ffffff" opacity=".2"/>`,
  flowers:(n,seed,y0,y1,cols)=>{const r=rnd(seed);let s='';for(let i=0;i<n;i++){const x=r()*300,y=y0+r()*(y1-y0),c=cols[i%cols.length],k=2.2+r()*1.6;s+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><path d="M0 0v${(k*3).toFixed(1)}" stroke="#5f8f4a" stroke-width="1.2"/>${[0,72,144,216,288].map(a=>`<circle cx="${(Math.cos(a*Math.PI/180)*k).toFixed(2)}" cy="${(Math.sin(a*Math.PI/180)*k).toFixed(2)}" r="${(k*.75).toFixed(2)}" fill="${c}"/>`).join('')}<circle r="${(k*.55).toFixed(2)}" fill="#ffd979"/></g>`;}return s;},
  grass:(n,seed,y,c='#5f8f4a')=>{const r=rnd(seed);let s='';for(let i=0;i<n;i++){const x=r()*300,h=6+r()*9;s+=`<path d="M${x} ${y}q-2 -${h*.6} -4 -${h}M${x} ${y}q1 -${h*.7} 3 -${h*1.1}" stroke="${c}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;}return s;},
  fall:(n,seed,shape,cls='tac-fall')=>{const r=rnd(seed);let s='';for(let i=0;i<n;i++){const x=r()*300,y=r()*280,a=r()*360,d=(-r()*8).toFixed(2),k=.7+r()*.6;s+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g class="${cls}" style="animation-delay:${d}s;animation-duration:${(6+r()*5).toFixed(1)}s"><g transform="rotate(${a.toFixed(0)}) scale(${k.toFixed(2)})">${shape}</g></g></g>`;}return s;},
  petal:'<path d="M0 -5q5 2 0 9q-5-7 0-9Z" fill="#f7b8c8"/>',
  leaf:'<path d="M0 -6q7 4 0 12q-7-8 0-12Z" fill="#e58a3c"/><path d="M0 -5v10" stroke="#b25b22" stroke-width=".8"/>',
  flake:'<path d="M0 -4v8M-3.5 -2l7 4M-3.5 2l7-4" stroke="#ffffff" stroke-width="1.3" stroke-linecap="round"/>',
  rain:(n,seed)=>{const r=rnd(seed);let s='';for(let i=0;i<n;i++){const x=r()*320-10,y=r()*300;s+=`<path d="M${x.toFixed(1)} ${y.toFixed(1)}l-5 14" stroke="#cfe3f2" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round" class="tac-rain" style="animation-delay:${(-r()*1.2).toFixed(2)}s"/>`;}return s;},
  fireflies:(n,seed,y0=120,y1=280)=>{const r=rnd(seed);let s='';for(let i=0;i<n;i++){const x=r()*300,y=y0+r()*(y1-y0);s+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g class="tac-firefly" style="animation-delay:${(-r()*5).toFixed(2)}s"><circle r="6" fill="#f8f3a0" opacity=".25"/><circle r="2" fill="#fbf6bf"/></g></g>`;}return s;},
  lantern:(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -26v8" stroke="#6b3b22" stroke-width="1.5"/><ellipse cx="0" cy="0" rx="15" ry="18" fill="#e04b3c"/><path d="M-8 -16q-4 16 0 32M8 -16q4 16 0 32M0 -18v36" stroke="#b5322a" stroke-width="1.4" fill="none"/><rect x="-7" y="-20" width="14" height="4" rx="1" fill="#e2b04a"/><rect x="-7" y="16" width="14" height="4" rx="1" fill="#e2b04a"/><path d="M0 20v12M-3 32h6" stroke="#e2b04a" stroke-width="1.4"/>${'<ellipse cx="-5" cy="-6" rx="3" ry="6" fill="#ffffff" opacity=".18"/>'}</g>`,
  burst:(x,y,r,c,cls='')=>`<g transform="translate(${x} ${y})"><g class="tac-burst ${cls}">${Array.from({length:14},(_,i)=>{const a=i*Math.PI/7,cx=Math.cos(a),sy=Math.sin(a);return `<path d="M${(cx*r*.25).toFixed(1)} ${(sy*r*.25).toFixed(1)}L${(cx*r).toFixed(1)} ${(sy*r).toFixed(1)}" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><circle cx="${(cx*r*1.12).toFixed(1)}" cy="${(sy*r*1.12).toFixed(1)}" r="1.8" fill="${c}"/>`;}).join('')}<circle r="3" fill="#fff8dc"/></g></g>`,
  window:(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="#8a6440" stroke-width="10"/><path d="M${x+w/2} ${y}v${h}M${x} ${y+h/2}h${w}" stroke="#8a6440" stroke-width="6"/>`,
  shelf:(x,y)=>`<rect x="${x}" y="${y}" width="78" height="6" rx="2" fill="#9a6d43"/>`+['#c96f5a','#5f8fb0','#e2b04a','#7aa35a','#9b7bc0','#d9895a'].map((c,i)=>`<rect x="${x+4+i*12}" y="${y-(22+(i%3)*4)}" width="10" height="${22+(i%3)*4}" rx="1.5" fill="${c}"/><rect x="${x+6+i*12}" y="${y-(16+(i%3)*4)}" width="6" height="2" fill="#ffffff" opacity=".5"/>`).join(''),
  plot:(x,y,w,h,c='#7fd1c3')=>{let d=`M${x+6} ${y+10}`;for(let i=1;i<=24;i++){const t=i/24;d+=` L${(x+6+t*(w-12)).toFixed(1)} ${(y+10+(h-20)*(1-Math.exp(-t*4.2))+Math.sin(i*1.7)*2.5*(1-t)).toFixed(1)}`;}return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#1f2b38"/><path d="M${x+6} ${y+h-8}h${w-12}M${x+6} ${y+6}v${h-14}" stroke="#4b5d6e" stroke-width="1"/><path d="${d}" fill="none" stroke="${c}" stroke-width="2"/><path d="${d.replace(/L([\d.]+) ([\d.]+)/g,(m,a,b)=>`L${a} ${(+b+6).toFixed(1)}`)}" fill="none" stroke="#f2b35e" stroke-width="1.6" opacity=".9"/>`;},
  streamlines:(id,cx,cy,rx,ry,n,cols)=>{let s='';for(let i=n;i>=1;i--){const k=i/n,c=cols[Math.min(cols.length-1,Math.floor((1-k)*cols.length))];s+=`<ellipse cx="${(cx+(1-k)*8).toFixed(1)}" cy="${(cy-(1-k)*6).toFixed(1)}" rx="${(rx*k).toFixed(1)}" ry="${(ry*k).toFixed(1)}" fill="none" stroke="${c}" stroke-width="2.4" stroke-dasharray="7 6" class="tac-flow" style="animation-duration:${(1.2+k*2).toFixed(2)}s"/>`;}return s;},
  vortexStreet:(y)=>{let s='';for(let i=0;i<6;i++){const x=70+i*42,up=i%2===0,c=up?'#e8735a':'#4f8fd0';s+=`<g transform="translate(${x} ${y+(up?-16:16)})"><g class="tac-spin" style="animation-direction:${up?'normal':'reverse'}">${[14,10,6].map((r,k)=>`<path d="M${r} 0A${r} ${r} 0 1 1 ${-r*.4} ${-r*.92}" fill="none" stroke="${c}" stroke-width="${2.6-k*.5}" opacity="${.9-k*.18}"/>`).join('')}</g></g>`;}return s;},
 };


 /* ---- zodiac friends: chibi animals sitting on y=0, facing the panda (left), about 76 units tall.
  * Every body part gets the same soft volume shade (radial gradient 'tzs' defined once per card), eyes
  * have two catch-lights, fur has a lighter belly or muzzle, outlines are warm and slightly heavier
  * outside than inside. ---------------------------------------------------------------------------- */
 const OL='#4a3a2a',sw='stroke="'+OL+'" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"',sw1='stroke="'+OL+'" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
 const SHADE='<defs><radialGradient id="tzs" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#3a2a1a" stop-opacity=".22"/></radialGradient></defs>';
 const el=(cx,cy,rx,ry)=>`M${cx-rx} ${cy}a${rx} ${ry} 0 1 0 ${2*rx} 0a${rx} ${ry} 0 1 0 ${-2*rx} 0Z`;
 const P=(d,fill,w=sw)=>`<path d="${d}" fill="${fill}" ${w}/><path d="${d}" fill="url(#tzs)"/>`;     // shaded part
 const F=(d,fill,o=1)=>`<path d="${d}" fill="${fill}"${o<1?` opacity="${o}"`:''}/>`;                      // flat detail
 const L=(d,c=OL,w=1.6)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
 const eye=(x,y,k=1)=>`<ellipse cx="${x}" cy="${y}" rx="${2.7*k}" ry="${3.3*k}" fill="#2a2420"/><circle cx="${x-.9*k}" cy="${y-1.3*k}" r="${1.15*k}" fill="#fff"/><circle cx="${x+1*k}" cy="${y+1.2*k}" r="${.5*k}" fill="#fff" opacity=".85"/>`;
 const shut=(x,y)=>L(`M${x-3} ${y}q3 2.6 6 0`,'#2a2420',1.8);
 const cheek=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="3.8" ry="2.3" fill="#f39a9a" opacity=".6"/>`;
 const at2=(x,y,s,body)=>`<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;
 const Z={
  rat:(x,y,s=1)=>at2(x,y,s,
   L('M14 -8C34 -6 38 -28 25 -31C18 -32 17 -24 23 -23',OL,5)+L('M14 -8C34 -6 38 -28 25 -31C18 -32 17 -24 23 -23','#eaa7ab',2.8)+
   P(el(4,-19,17,18),'#b9b2ad')+F(el(2,-15,10,12),'#ebe5df')+
   P(el(-7,-1.5,6.5,3.2),'#efb3b6')+P(el(13,-1.5,6.5,3.2),'#efb3b6')+
   P(el(-14,-59,9.5,9.5),'#c4bdb7')+F(el(-14,-59,5.8,5.8),'#f3b9c0')+P(el(12,-60,9.5,9.5),'#c4bdb7')+F(el(12,-60,5.8,5.8),'#f3b9c0')+
   P(el(-1,-45,16.5,14.5),'#cbc4be')+F(el(-3,-38,8,5.5),'#ede8e2')+F(el(-3,-41.5,2.6,1.9),'#e88a95')+
   L('M-10 -39l-11 -2M-10 -37l-11 2M4 -39l10 -2M4 -37l10 2','#8a817a',1)+eye(-8,-47)+eye(5,-47)+cheek(-12,-40)+cheek(9,-40)+
   P('M-4 -30c0-6 8-6 8 0l-1 9c-1 3-5 3-6 0Z','#5a4a3e',sw1)+L('M0 -31v8','#efe6d8',1.2)+P(el(-5,-27,3.6,3),'#cbc4be',sw1)+P(el(5,-27,3.6,3),'#cbc4be',sw1)),
  ox:(x,y,s=1,big=false)=>at2(x,y,s,
   L('M28 -24c10 4 10 16 4 22',OL,4.6)+L('M28 -24c10 4 10 16 4 22','#a0602f',2.4)+P('M30 0c-4-2-6-6-2-8c4 0 5 4 2 8Z','#5a3a24',sw1)+
   P(el(8,-21,22,18),'#b9773f')+F(el(9,-15,12,10),'#f3e6d0')+
   P('M-12 -2v-12h10v12a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2Z','#c2834a')+P('M-12 -3h10v3a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2Z','#4a3324',sw1)+
   P('M6 -2v-12h10v12a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2Z','#c2834a')+P('M6 -3h10v3a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2Z','#4a3324',sw1)+
   (big?P('M-14 -58c-6-6-14-6-20-16c10 4 16 2 22 8Z','#f3e3c0')+P('M2 -58c6-6 14-6 20-16c-10 4-16 2-22 8Z','#f3e3c0'):P('M-13 -58c-3-5-8-6-10-12c6 2 10 3 13 8Z','#f3e3c0')+P('M1 -58c3-5 8-6 10-12c-6 2-10 3-13 8Z','#f3e3c0'))+
   P('M-23 -52c-8-1-12 4-12 6c6 1 10 0 13-3Z','#c2834a')+F('M-25 -50c-4 0-6 2-7 3c3 0 5 0 7-1Z','#f2b9a8')+
   P('M11 -52c8-1 12 4 12 6c-6 1-10 0-13-3Z','#c2834a')+F('M13 -50c4 0 6 2 7 3c-3 0-5 0-7-1Z','#f2b9a8')+
   P(el(-6,-48,17,15),'#c98b52')+F(el(-2,-56,5,3.5),'#f3e6d0')+L('M-10 -62c2-4 6-4 6 0','#8a5a2e',2)+
   P(el(-6,-38,11.5,7.8),'#f2c9a8')+F(el(-10,-38,1.5,2.1),'#7a4a3a')+F(el(-2,-38,1.5,2.1),'#7a4a3a')+L('M-9 -34q3 2 6 0','#7a4a3a',1.3)+
   eye(-12,-50)+eye(0,-50)+cheek(-16,-43)+cheek(4,-43)),
  tiger:(x,y,s=1)=>at2(x,y,s,
   L('M22 -10c16-2 18-22 8-28',OL,7)+L('M22 -10c16-2 18-22 8-28','#f19a3e',4.6)+L('M30 -14l5 1M33 -22l4-1M31 -31l4 2','#3b2b22',2)+
   P(el(6,-20,19,18),'#f19a3e')+F(el(4,-15,10,11),'#fff3e2')+L('M18 -30l5 2M20 -22l6 1M17 -14l5 0','#3b2b22',2.2)+
   P(el(-7,-2.5,6.5,4),'#fff3e2')+L('M-9 -3v3M-5 -3v3','#c9a98a',1.1)+P(el(9,-2.5,6.5,4),'#fff3e2')+L('M7 -3v3M11 -3v3','#c9a98a',1.1)+
   P(el(-16,-60,7,7),'#f4a64a')+F(el(-16,-60,3.6,3.6),'#3b2b22')+P(el(12,-60,7,7),'#f4a64a')+F(el(12,-60,3.6,3.6),'#3b2b22')+
   P(el(-2,-46,19.5,16.5),'#f6ab4e')+
   F('M-21 -48l6 1-6 3ZM-21 -42l6 0-5 3ZM17 -48l-6 1 6 3ZM17 -42l-6 0 5 3Z','#3b2b22')+
   L('M-7 -58h10M-6 -54.5h8M-7 -51h10M-2 -58v7','#3b2b22',2)+
   P('M-14 -40c0-6 8-7 12-3c4-4 12-3 12 3c0 7-8 9-12 6c-4 3-12 1-12-6Z','#fff3e2',sw1)+F('M-4.5 -43h5l-2.5 3Z','#e8838e')+L('M-2 -40v2M-2 -38q-3 3-5 0M-2 -38q3 3 5 0','#4a3a2a',1.2)+
   eye(-9,-49)+eye(5,-49)+cheek(-14,-41)+cheek(10,-41)),
  rabbit:(x,y,s=1)=>at2(x,y,s,
   P(el(19,-11,5.5,5.5),'#ffffff')+P(el(4,-18,16,17),'#f8f3ec')+F(el(2,-14,9,10),'#ffffff')+
   P(el(-7,-1.8,8.5,3.6),'#f8f3ec')+F(el(-9,-1.5,2.4,1.5),'#f5bcc4')+P(el(13,-1.8,8.5,3.6),'#f8f3ec')+F(el(11,-1.5,2.4,1.5),'#f5bcc4')+
   `<g transform="rotate(-12 -8 -74)">${P(el(-8,-74,6.4,18),'#f8f3ec')+F(el(-8,-73,3.2,13),'#f5bcc4')}</g><g transform="rotate(18 8 -74)">${P(el(8,-74,6.4,18),'#f8f3ec')+F(el(8,-73,3.2,13),'#f5bcc4')}</g>`+
   P(el(0,-47,15.5,14),'#fffaf4')+F(el(0,-41,6.5,4.4),'#ffffff')+F('M-2 -44h4l-2 2.4Z','#ec8f9b')+L('M0 -41.6v1.6M0 -40q-2.5 2.4-4.5 0M0 -40q2.5 2.4 4.5 0','#8a6a5a',1.1)+
   eye(-6,-49)+eye(6,-49)+cheek(-10,-42)+cheek(10,-42)),
  dragon:(x,y,s=1)=>at2(x,y,s,
   P('M-34 0c-4-10 6-15 14-11c2-8 14-10 18-3c6-6 18-4 18 5c8-2 14 4 10 9Z','#ffffff')+L('M-22 -5c4-2 8-2 10 1M4 -6c3-2 7-2 9 1','#c9d8e6',1.3)+
   L('M20 -14c22-4 22-28 6-30c-6 0-8 6-4 9',OL,10)+L('M20 -14c22-4 22-28 6-30c-6 0-8 6-4 9','#4fae95',7)+P('M24 -38l-6-6 9 1 2-7 4 7 6-3-2 9Z','#f39a3a',sw1)+
   P(el(6,-28,15,18),'#4fae95')+F('M2 -42c4-1 6 0 7 3v22c-1 4-5 5-8 2Z','#f4dd94')+L('M2 -36h7M2 -31h7M2 -26h7M2 -21h6','#d7b45f',1.1)+
   P(el(-6,-24,4.6,5.6),'#4fae95',sw1)+P(el(16,-23,4.6,5.6),'#4fae95',sw1)+
   P('M-8 -70l2-14 8 9 6-12 5 13 8-8-2 14Z','#f39a3a')+F('M-2 -72l3-6 3 4 3-5 2 6Z','#f9c46a')+
   P('M-6 -68c-2-8-8-12-14-12c5 2 8 7 9 12M8 -68c2-8 8-12 14-12c-5 2-8 7-9 12','#e8b84a',sw1)+L('M-12 -74l-4-4M14 -74l4-4','#e8b84a',2.4)+
   P(el(0,-56,17,14),'#5cbba0')+P(el(-13,-50,10.5,8),'#83d3b8')+F(el(-18,-51,1.4,1.9),'#2f6a5a')+F(el(-11,-52,1.4,1.9),'#2f6a5a')+
   L('M-20 -48c-10 2-14-4-20-2M-18 -46c-8 6-14 4-18 8','#e8b84a',1.8)+L('M-14 -45q4 3 8 0','#2f6a5a',1.2)+
   eye(-3,-60)+eye(8,-59)+cheek(-2,-52)+cheek(12,-52)),
  snake:(x,y,s=1)=>at2(x,y,s,
   P(el(0,-8,25,9),'#78b85a')+P(el(1,-20,19,8),'#82c264')+P(el(2,-31,13,7),'#8ccb6e')+
   [[-14,-8],[-4,-5],[8,-6],[18,-9],[-9,-20],[3,-18],[13,-21],[-2,-31],[8,-32]].map(([a,b])=>F(`M${a-2.4} ${b}l2.4-2.4 2.4 2.4-2.4 2.4Z`,'#4f8f3c',.9)).join('')+
   L('M-18 -4h34M-12 -16h24','#d8eeb0',1.6)+
   L('M6 -36c4-6 4-10 0-14',OL,10)+L('M6 -36c4-6 4-10 0-14','#8ccb6e',7)+F('M7 -38c2-4 2-7 0-10','#d8eeb0')+
   P(el(-2,-56,14,11.5),'#96d478')+F(el(-2,-50,8,4.6),'#c8eaa6')+L('M-14 -50l-6 1M-20 -51l-3-2M-20 -51l-3 2','#e05a6a',1.4)+
   F(el(-3,-62,2.2,1.4),'#4f8f3c')+F(el(4,-63,2.2,1.4),'#4f8f3c')+
   eye(-7,-57)+eye(4,-57)+cheek(-10,-51)+cheek(8,-51)),
  horse:(x,y,s=1)=>at2(x,y,s,
   // tail
   L('M33 -32c10 0 14 10 12 20c-1 6 2 9 5 10',OL,9)+L('M33 -32c10 0 14 10 12 20c-1 6 2 9 5 10','#6a4128',6)+L('M37 -28c5 3 6 10 5 16','#94603a',1.5)+
   // far legs (shaded), body, near legs — slightly tapered with dark hooves
   [6,33].map(a=>P(`M${a-3.2} -1l.4-19h5.6l.4 19Z`,'#b07848',sw1)+P(`M${a-3.8} 0v-4.6h7.6v4.6Z`,'#4a3324',sw1)).join('')+
   P(el(15,-27,21,12),'#c98b55')+F(el(14,-20.5,13,4.6),'#e0ac78',.7)+
   [0,27].map(a=>P(`M${a-3.6} -1l.4-20h6.4l.4 20Z`,'#c98b55',sw1)+P(`M${a-4.2} 0v-4.8h8.4v4.8Z`,'#4a3324',sw1)).join('')+
   // neck: chest → throat → poll, crest back down to the withers; the base melts into the body (no seam)
   F('M-6 -25c-3-10-3-20 1-29c3-6 8-8 12-7c5 3 6 10 7 17c1 5 2 8 4 11L8 -22Z','#c98b55')+F('M-6 -25c-3-10-3-20 1-29c3-6 8-8 12-7c5 3 6 10 7 17c1 5 2 8 4 11L8 -22Z','url(#tzs)')+
   L('M-6 -25c-3-10-3-20 1-29c3-6 8-8 12-7c5 3 6 10 7 17c1 5 2 8 4 11',OL,2.2)+
   // saddle blanket
   P('M13 -38.5h15l1.5 8.5-1.5 7H13l-1.5-7Z','#d4563f',sw1)+L('M13.5 -35.5h14M13.5 -26h14','#f2c45a',1.5)+F(el(20.5,-30.8,2.2,2.2),'#f2c45a')+
   // head: round brow, long face tipped down toward the panda, soft muzzle
   P('M-6 -72c8-2 15 3 15 10c0 6-4 10-10 12l-11 9c-4 3-12 4-15-1c-2-4-1-8 3-12l6-10c3-5 6-7 12-8Z','#d29660')+
   P('M-28 -42c-1-6 3-10 9-10c6 0 9 4 8 9c-1 4-5 6-10 6c-4 0-7-2-7-5Z','#ecc49c',sw1)+
   F(el(-24,-46.5,1.1,1.6),'#6b4a2e')+L('M-23.5 -40.6q3 1.6 6.2-.2','#6b4a2e',1.2)+
   // ears
   P('M-6 -70c-3-5-2-10 1-12c3 3 4 7 3 11Z','#d29660',sw1)+F('M-5 -72c-1-3-.8-6 .6-7.5c1.4 2 1.7 4.6 1.1 7Z','#f2b9a8')+
   P('M1 -70c0-6 3-9 6-10c1 4 0 8-3 11Z','#c98b55',sw1)+
   // mane: forelock + crest flowing down the neck
   P('M-8 -71c-5-2-10 0-11 5c3 0 6-.6 8-1.6c-1 2.6-.6 5.4 1 7.4c2-2.6 3-6 2-10.8Z','#5b3a24',sw1)+
   P('M0 -72c7-1 12 4 12 10c4 3 6 9 4 15c3 4 3 10 0 14c-4-3-7-8-8-13c-3-4-6-10-6-16c-1-4-2-7-2-10Z','#5b3a24')+L('M4 -66c3 4 4 9 3 14M8 -46c2 2 3 6 3 9','#8a5a36',1.3)+
   eye(-12,-60,1.05)+cheek(-17,-51)),
  sheep:(x,y,s=1,horns=false)=>{const wool=[[-8,-21,11],[4,-28,12],[16,-21,11],[7,-13,12],[-4,-12,10],[19,-12,9],[-12,-14,8]];return at2(x,y,s,
   P('M-6 0v-10h5v10Z','#5a4a3a',sw1)+P('M13 0v-10h5v10Z','#5a4a3a',sw1)+
   wool.map(([a,b,r])=>`<circle cx="${a}" cy="${b}" r="${r}" fill="#fbf8f0" ${sw}/>`).join('')+wool.map(([a,b,r])=>`<circle cx="${a}" cy="${b}" r="${r-1.4}" fill="#fbf8f0"/>`).join('')+
   wool.map(([a,b,r])=>`<circle cx="${a}" cy="${b}" r="${r}" fill="url(#tzs)"/>`).join('')+L('M0 -24q3-3 6 0M10 -16q3-3 6 0M-6 -14q3-3 6 0','#d8cfbd',1.4)+
   P('M-25 -44c-6 0-8 4-6 6c3 1 6-1 8-3ZM-5 -44c6 0 8 4 6 6c-3 1-6-1-8-3Z','#e6cfae',sw1)+
   P(el(-15,-36,10.5,12.5),'#efdcc0')+F(el(-15,-29,6.5,4.6),'#e4c9a6')+F('M-17 -31h4l-2 2Z','#8a6a5a')+
   `<circle cx="-20" cy="-47" r="5.5" fill="#fbf8f0" ${sw1}/><circle cx="-10" cy="-48" r="5.5" fill="#fbf8f0" ${sw1}/><circle cx="-15" cy="-51" r="5.5" fill="#fbf8f0" ${sw1}/>`+
   (horns?L('M-25 -42a7.5 7.5 0 1 1 1 11a3.5 3.5 0 1 0 3.5-4.5','#b88a4a',4.6)+L('M-25 -42a7.5 7.5 0 1 1 1 11a3.5 3.5 0 1 0 3.5-4.5','#e3c48a',2.6)+L('M-5 -42a7.5 7.5 0 1 0-1 11a3.5 3.5 0 1 1-3.5-4.5','#b88a4a',4.6)+L('M-5 -42a7.5 7.5 0 1 0-1 11a3.5 3.5 0 1 1-3.5-4.5','#e3c48a',2.6):'')+
   eye(-19,-37)+eye(-11,-37)+cheek(-22,-31)+cheek(-8,-31));},
  monkey:(x,y,s=1)=>at2(x,y,s,
   L('M18 -8c20-2 20-26 8-30c-8-2-10 6-4 8',OL,6)+L('M18 -8c20-2 20-26 8-30c-8-2-10 6-4 8','#a8703f',3.6)+
   P(el(6,-20,15,17),'#a8703f')+F(el(5,-16,9,11),'#ecc89c')+P(el(-4,-2,6,3.4),'#ecc89c')+P(el(14,-2,6,3.4),'#ecc89c')+
   L('M-8 -28c-6-8-8-16-4-24',OL,7.4)+L('M-8 -28c-6-8-8-16-4-24','#a8703f',5)+P(el(-4,-55,4.4,4.4),'#ecc89c',sw1)+
   P(el(-20,-46,7,7),'#a8703f')+F(el(-20,-46,4,4),'#f3d2ab')+P(el(16,-46,7,7),'#a8703f')+F(el(16,-46,4,4),'#f3d2ab')+
   P(el(-2,-47,15.5,14.5),'#b07a48')+P('M-2 -36c-11 0-13-6-12-11c1-5 7-7 12-3c5-4 11-2 12 3c1 5-1 11-12 11Z','#f3d4ab',sw1)+
   F('M-6 -62c2-6 6-6 8-2c2-4 6-4 6 2','#8a5a30')+F(el(-4,-41,1,1.4),'#6b4a2e')+F(el(0,-41,1,1.4),'#6b4a2e')+L('M-6 -38q4 3 8 0','#6b4a2e',1.3)+
   eye(-7,-47)+eye(3,-47)+cheek(-11,-41)+cheek(7,-41)),
  rooster:(x,y,s=1)=>at2(x,y,s,
   L('M14 -28c6-20 22-26 30-16','#2f6a4a',7.4)+L('M14 -28c6-20 22-26 30-16','#3f8a5e',4.4)+L('M16 -24c10-16 26-14 30-2',OL,7.4)+L('M16 -24c10-16 26-14 30-2','#e8735a',4.4)+L('M15 -18c14-8 24 0 24 10',OL,7.4)+L('M15 -18c14-8 24 0 24 10','#f2a541',4.4)+
   L('M-3 0v-8M5 0v-8M-8 0h7M1 0h8',OL,4)+L('M-3 0v-8M5 0v-8M-8 0h7M1 0h8','#f2b33e',2.2)+
   P(el(4,-21,17,14.5),'#fff6e4')+P('M2 -26c8-6 20-4 20 6c-6 6-16 6-20-6Z','#e9a35a')+L('M6 -22c4 0 8 1 11 4M7 -18c4 0 7 1 9 3','#b87a3a',1.2)+
   P('M-16 -52c-2-8 4-10 6-4c0-8 7-8 8-1c2-6 8-4 7 3l-2 5h-17Z','#e8474a')+
   P(el(-8,-40,11,11),'#fff6e4')+P('M-19 -42l-8 3 8 3Z','#f2b33e',sw1)+P('M-17 -35c-4 6-1 10 2 9c2-2 1-6-2-9Z','#e8474a',sw1)+
   eye(-10,-43)+cheek(-6,-37)),
  dog:(x,y,s=1)=>at2(x,y,s,
   P('M18 -28c8-14 20-8 12 4c-3 5-9 4-10 0Z','#d9975a')+L('M22 -27c4-6 9-4 6 2','#fff3e2',2.4)+
   P(el(6,-20,18,17),'#d9975a')+F(el(1,-16,9,11),'#fff3e2')+P(el(-6,-2.5,6.6,3.6),'#fff3e2')+P(el(12,-2.5,6.6,3.6),'#fff3e2')+
   P('M-22 -44l2-18 12 10Z','#d9975a')+F('M-19 -48l1-9 6 5Z','#8a5a2e')+P('M4 -44l-2-18-12 10Z','#d9975a')+F('M1 -48l-1-9-6 5Z','#8a5a2e')+
   P(el(-9,-41,16.5,14.5),'#e0a065')+P('M-21 -36c0-5 6-6 12-2c6-4 12-3 12 2c0 7-6 10-12 8c-6 2-12-1-12-8Z','#fff3e2',sw1)+
   F(el(-9,-38.5,3,2.2),'#2a2420')+L('M-9 -36v2M-9 -34q-3 3-5 0M-9 -34q3 3 5 0','#4a3a2a',1.2)+F('M-11 -32h4v3a2 2 0 0 1-4 0Z','#ec8f9b')+
   P('M-20 -27h22v4h-22Z','#d4563f',sw1)+P(el(-9,-21,3,3),'#f2c45a',sw1)+
   eye(-15,-44)+eye(-3,-44)+cheek(-19,-37)+cheek(1,-37)),
  pig:(x,y,s=1)=>at2(x,y,s,
   L('M24 -18c8-2 9 4 5 6c-4 2-2 7 3 6','#e88f96',2.6)+
   P(el(6,-19,20,17),'#f6b9bb')+F(el(4,-14,11,10),'#fbd4d4')+
   P('M-7 0v-6h8v6Z','#ef9da2',sw1)+P('M13 0v-6h8v6Z','#ef9da2',sw1)+
   P('M-21 -54l-6-10 12 2Z','#ef9da2')+P('M5 -54l6-10-12 2Z','#ef9da2')+
   P(el(-8,-42,16,14.5),'#f8c3c4')+P(el(-10,-36,7.5,5.4),'#ef9da2')+F(el(-12.5,-36,1.5,2.2),'#7a3a3e')+F(el(-7.5,-36,1.5,2.2),'#7a3a3e')+
   L('M-14 -30q4 3 8 0','#7a3a3e',1.2)+eye(-15,-46)+eye(-3,-46)+cheek(-20,-38)+cheek(2,-38)+
   F('M8 -60l2-4 2 4-2 3ZM10 -64l3-3 1 4ZM6 -64l-3-3-1 4Z','#f6d36a')),
  crab:(x,y,s=1)=>at2(x,y,s,
   L('M-14 -6l-12 6M-10 -4l-8 9M10 -4l8 9M14 -6l12 6',OL,4.4)+L('M-14 -6l-12 6M-10 -4l-8 9M10 -4l8 9M14 -6l12 6','#e06a4a',2.4)+
   L('M-14 -18l-12-14M14 -18l12-14',OL,5)+L('M-14 -18l-12-14M14 -18l12-14','#e06a4a',3)+
   P('M-33 -38c-6-10 8-16 12-6l-5 2 4 6c-4 6-10 4-11-2Z','#ee7a5a')+P('M33 -38c6-10-8-16-12-6l5 2-4 6c4 6 10 4 11-2Z','#ee7a5a')+
   P(el(0,-14,21,12.5),'#ee7a5a')+F(el(-2,-18,10,5),'#f8a98a',.8)+L('M-14 -10q14 6 28 0','#c9533e',1.2)+
   L('M-6 -24v-9M6 -24v-9',OL,3.6)+L('M-6 -24v-9M6 -24v-9','#e06a4a',1.8)+P(el(-6,-35,4.4,4.4),'#ffffff',sw1)+P(el(6,-35,4.4,4.4),'#ffffff',sw1)+
   `<circle cx="-5.4" cy="-35" r="2" fill="#2a2420"/><circle cx="6.6" cy="-35" r="2" fill="#2a2420"/><circle cx="-6.2" cy="-35.8" r=".7" fill="#fff"/><circle cx="5.8" cy="-35.8" r=".7" fill="#fff"/>`+
   L('M-4 -9q4 3 8 0','#7a2a1e',1.4)+cheek(-12,-12)+cheek(12,-12)),
  scorpion:(x,y,s=1)=>at2(x,y,s,
   [[14,-12],[22,-18],[27,-27],[28,-37],[24,-46]].map(([a,b],i)=>P(el(a,b,6.4-i*.5,5.6-i*.4),i%2?'#b394d6':'#a084c8',sw1)).join('')+P('M18 -52l-8-4 3 9Z','#f2c45a',sw1)+
   L('M-12 -6l-9 6M-6 -4l-7 8M4 -4l5 8M10 -6l9 6',OL,4)+L('M-12 -6l-9 6M-6 -4l-7 8M4 -4l5 8M10 -6l9 6','#8a6ab8',2)+
   P(el(0,-12,17,9.5),'#a98bd0')+L('M-10 -14h20M-12 -9h24','#8a6ab8',1.1)+
   L('M-16 -16l-12-6M-14 -10l-14 0',OL,4.2)+L('M-16 -16l-12-6M-14 -10l-14 0','#8a6ab8',2.2)+
   P('M-36 -30c-6-6 2-14 8-8l-3 3 4 3c-2 6-7 5-9 2Z','#b394d6')+P('M-36 -4c-6 6 2 14 8 8l-3-3 4-3c-2-6-7-5-9-2Z','#b394d6')+
   eye(-8,-15,.9)+eye(1,-15,.9)+cheek(-12,-9)+cheek(6,-9)),
  scales:(x,y,s=1)=>at2(x,y,s,
   P('M-14 0c0-6 6-8 14-8s14 2 14 8Z','#d9a440')+P('M-3 -8v-46h6v46Z','#e2b04a',sw1)+P(el(0,-60,5,5),'#f2c45a',sw1)+
   P('M-34 -54c10-4 58-4 68 0l-1 3c-10-4-56-4-66 0Z','#d9a440',sw1)+
   L('M-30 -52l-11 23M-30 -52l11 23M30 -52l-11 23M30 -52l11 23','#b98a2e',1.3)+
   P('M-44 -30h28c-2 9-8 12-14 12s-12-3-14-12Z','#f2c45a')+P('M16 -30h28c-2 9-8 12-14 12s-12-3-14-12Z','#f2c45a')+
   P(el(-30,-34,4,4),'#ffffff',sw1)+P('M26 -38l4-5 4 5-4 4Z','#7fd1c3',sw1)),
  seagoat:(x,y,s=1)=>at2(x,y,s,
   P('M6 -12c18 6 30 0 34-18l8 3-6 9 9 6-13-1c-10 16-26 14-34 6Z','#6fb8c8')+L('M14 -12c10 2 18-2 22-10M18 -6c8 0 14-4 18-10','#bfe3ea',1.4)+
   P(el(0,-20,16,12.5),'#e8d6b8')+P('M-10 0v-10h5v10Z','#5a4a3a',sw1)+P('M0 0v-10h5v10Z','#5a4a3a',sw1)+
   L('M-20 -48c-8-10 0-20 8-16M-10 -48c2-12 14-12 14-4',OL,5.2)+L('M-20 -48c-8-10 0-20 8-16M-10 -48c2-12 14-12 14-4','#a9784a',3)+
   P(el(-14,-38,11,12),'#efdcc0')+P('M-22 -30l-1 10 6-5Z','#e3cba6',sw1)+P('M-26 -44c-6-1-9 2-8 4c3 1 6-1 8-2Z','#efdcc0',sw1)+
   eye(-18,-40)+eye(-9,-40)+cheek(-21,-34)+cheek(-6,-34)),
  koi:(x,y,s=1)=>at2(x,y,s,`<g class="tac-spin" style="animation-duration:12s">`+[['#f08a3a','#ffffff',0],['#ffffff','#f08a3a',180]].map(([a,b,r])=>`<g transform="rotate(${r})">`+
   P('M-32 -6C-22 -28 18 -28 26 -8C18 -16 -10 -14 -20 0Z',a)+P('M26 -8l12-9-2 13 7 7-14-3Z',a)+F(el(-4,-16,4.6,3.4),b)+F(el(10,-17,3.2,2.4),b)+
   L('M-2 -10q6-4 12 0',OL,1)+P('M-8 -22l-4-8 9 4Z',a,sw1)+eye(-22,-12,.9)+'</g>').join('')+'</g>'),
  mane:(x,y,r)=>`<g transform="translate(${x} ${y})">${Array.from({length:18},(_,i)=>`<path d="M0 ${-r*.55}c${-r*.26} ${-r*.2} ${-r*.22} ${-r*.62} 0 ${-r*.62}s${r*.26} ${r*.42} 0 ${r*.62}Z" fill="${i%2?'#e0893a':'#f2a944'}" stroke="${OL}" stroke-width="1.6" transform="rotate(${i*20})"/>`).join('')}${Array.from({length:18},(_,i)=>`<path d="M0 ${-r*.5}c${-r*.14} ${-r*.12} ${-r*.12} ${-r*.36} 0 ${-r*.36}s${r*.14} ${r*.24} 0 ${r*.36}Z" fill="#f8c66a" transform="rotate(${i*20+10})"/>`).join('')}<circle r="${r*.62}" fill="#f2a944"/></g>`
 };

 const SIGNS={
  aries:'M8 16C6 4 18 3 20 14L20 34M32 16C34 4 22 3 20 14',
  taurus:'M6 6C9 16 31 16 34 6M20 16a9 9 0 1 0 .1 0',
  gemini:'M8 6Q20 10 32 6M8 34Q20 30 32 34M14 8V32M26 8V32',
  cancer:'M6 14C10 4 30 4 34 12M34 26C30 36 10 36 6 28M12 14a4.5 4.5 0 1 0 .1 0M28 26a4.5 4.5 0 1 0 .1 0',
  leo:'M10 26a5 5 0 1 1 6-5C16 8 30 6 30 18C30 28 22 30 26 35Q30 38 34 33',
  virgo:'M5 10V30M5 13Q9 8 12 13V30M12 13Q16 8 19 13V30Q19 37 28 30M19 22Q26 18 30 24Q32 33 23 35',
  libra:'M6 33H34M6 25H13A7 7 0 1 1 27 25H34',
  scorpio:'M5 10V30M5 13Q9 8 12 13V30M12 13Q16 8 19 13V30Q19 35 25 35L32 30M28 28L32 30L30 34',
  sagittarius:'M8 32L32 8M20 8H32V20M12 18L22 28',
  capricorn:'M5 10L11 30L17 10Q21 5 23 16V26A5 5 0 1 0 30 31',
  aquarius:'M5 16L11 12L17 16L23 12L29 16L35 12M5 26L11 22L17 26L23 22L29 26L35 22',
  pisces:'M10 6Q20 20 10 34M30 6Q20 20 30 34M7 20H33'
 };
 const STARS={ // constellation figures in a 100 x 60 box: points and the lines between them
  aries:[[[12,40],[42,30],[56,25],[64,31]],[[0,1],[1,2],[2,3]]],
  taurus:[[[30,42],[40,32],[48,40],[72,10],[86,30],[22,30]],[[0,1],[1,2],[1,3],[2,4],[0,5]]],
  gemini:[[[20,8],[24,30],[28,56],[40,6],[45,30],[50,56],[14,40],[58,40]],[[0,1],[1,2],[3,4],[4,5],[0,3],[1,6],[4,7]]],
  cancer:[[[40,8],[40,30],[24,52],[58,50]],[[0,1],[1,2],[1,3]]],
  leo:[[[20,30],[24,18],[34,12],[44,16],[42,28],[36,34],[70,38],[86,30],[70,24]],[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,3]]],
  virgo:[[[8,20],[28,25],[48,30],[68,40],[86,56],[54,8],[24,46]],[[0,1],[1,2],[2,3],[3,4],[2,5],[1,6]]],
  libra:[[[28,40],[44,14],[66,24],[56,50]],[[0,1],[1,2],[2,3],[3,0]]],
  scorpio:[[[8,14],[16,20],[24,30],[30,42],[40,50],[55,55],[68,50],[72,40],[64,34]],[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]]],
  sagittarius:[[[20,40],[30,30],[46,30],[56,40],[46,52],[30,52],[66,32],[62,50],[8,32]],[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[3,6],[3,7],[0,8]]],
  capricorn:[[[8,18],[38,46],[68,42],[90,14],[60,24]],[[0,1],[1,2],[2,3],[3,4],[4,0]]],
  aquarius:[[[8,20],[24,14],[40,24],[56,16],[70,30],[80,46],[64,56]],[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]]],
  pisces:[[[10,52],[40,32],[70,10],[4,44],[16,44],[64,4],[78,6]],[[0,1],[1,2],[0,3],[0,4],[2,5],[2,6]]]
 };
 K.constellation=(sign,x,y,sc=1.5,c='#fff6cf')=>{const [pts,edges]=STARS[sign];const P=pts.map(([a,b])=>[x+a*sc,y+b*sc]);return `<g>${edges.map(([i,j])=>`<path d="M${P[i][0].toFixed(1)} ${P[i][1].toFixed(1)}L${P[j][0].toFixed(1)} ${P[j][1].toFixed(1)}" stroke="${c}" stroke-opacity=".45" stroke-width="1.4"/>`).join('')}${P.map(([a,b],i)=>`<g transform="translate(${a.toFixed(1)} ${b.toFixed(1)})"><g class="tac-twinkle" style="animation-delay:${-i*.4}s"><circle r="5" fill="${c}" opacity=".18"/><circle r="${i===0?2.6:2}" fill="${c}"/></g></g>`).join('')}</g>`;};
 K.glyph=(sign,x,y,c='#fff6cf',bg='#00000033')=>`<g transform="translate(${x} ${y})"><circle cx="20" cy="20" r="23" fill="${bg}" stroke="${c}" stroke-opacity=".6" stroke-width="1.6"/><path d="${SIGNS[sign]}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>`;
 K.xiangyun=(x,y,s=1,c='#ffffff',o=.55)=>`<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"><path d="M-30 6h52q10 0 10-8t-8-8q-2-10-12-8q-6-10-18-4q-12-4-14 8q-10 0-10 10"/><path d="M-6 -2a5 5 0 1 1 6 4M14 -4a4 4 0 1 1 5 4"/></g>`;
 // A carved red seal (白文印): white character cut into a red square with worn edges, stamped upright.
 K.seal=(ch,x=240,y=12)=>{const r=rnd(ch.charCodeAt(0));const edge=[];for(let i=0;i<=40;i++){const t=i/40,side=Math.floor(t*4),u=t*4-side,j=()=>(r()-.5)*1.6;edge.push(side===0?[u*48+j(),j()]:side===1?[48+j(),u*48+j()]:side===2?[48-u*48+j(),48+j()]:[j(),48-u*48+j()]);}
  const specks=Array.from({length:14},()=>`<circle cx="${(4+r()*40).toFixed(1)}" cy="${(4+r()*40).toFixed(1)}" r="${(.4+r()*.9).toFixed(2)}" fill="#fff4e6" opacity=".45"/>`).join('');
  return `<g transform="translate(${x} ${y})" class="tac-seal"><path d="M${edge.map(p=>p.map(v=>v.toFixed(1)).join(' ')).join('L')}Z" fill="#c8372f"/><path d="M5 5h38v38H5Z" fill="none" stroke="#fff4e6" stroke-width="1.6" stroke-dasharray="30 1.5 6 1" opacity=".9"/><text x="24" y="35" text-anchor="middle" font-family="'STKaiti','KaiTi','Kaiti SC','Noto Serif CJK SC','Songti SC',serif" font-weight="700" font-size="30" fill="#fff4e6">${ch}</text>${specks}<path d="M${edge.map(p=>p.map(v=>v.toFixed(1)).join(' ')).join('L')}Z" fill="none" stroke="#9f2a24" stroke-width="1" opacity=".6"/></g>`;};
 // Constellation medallion for the star cards: the sign's star figure in a gilded night disc, top right.
 const LATIN={aries:'ARIES',taurus:'TAURUS',gemini:'GEMINI',cancer:'CANCER',leo:'LEO',virgo:'VIRGO',libra:'LIBRA',scorpio:'SCORPIUS',sagittarius:'SAGITTARIUS',capricorn:'CAPRICORNUS',aquarius:'AQUARIUS',pisces:'PISCES'};
 K.emblem=(id,sign,cx=248,cy=52,R=42)=>{const [pts,edges]=STARS[sign];const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);const w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys),sc=Math.min(58/w,40/h);
  const ox=cx-(Math.min(...xs)+w/2)*sc,oy=cy-6-(Math.min(...ys)+h/2)*sc,Q=pts.map(([a,b])=>[ox+a*sc,oy+b*sc]);
  return `<defs><radialGradient id="${id}em" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#2c3a72"/><stop offset="1" stop-color="#0d1430"/></radialGradient></defs><g class="tac-emblem">${K.glow(id,cx,cy,R*1.6,'#fff2c2',.22)}<circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${id}em)" stroke="#e8c76a" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${R-4}" fill="none" stroke="#e8c76a" stroke-opacity=".45" stroke-width="1" stroke-dasharray="2 3"/>`+
   K.stars(10,sign.length*7,R*1.2,'#c9d2ff',cx-R*.6,cy-R*.6,R*1.2).replace(/class="tac-twinkle"/g,'class="tac-twinkle" opacity=".5"')+
   edges.map(([i,j])=>`<path d="M${Q[i][0].toFixed(1)} ${Q[i][1].toFixed(1)}L${Q[j][0].toFixed(1)} ${Q[j][1].toFixed(1)}" stroke="#f3dc95" stroke-opacity=".75" stroke-width="1.3"/>`).join('')+
   Q.map(([a,b],i)=>`<g transform="translate(${a.toFixed(1)} ${b.toFixed(1)})"><circle r="4.4" fill="#fff6cf" opacity=".22"/><circle r="${i%3?1.7:2.4}" fill="#fffbe8"/>${i%3?'':`<path d="M0 -5.5v11M-5.5 0h11" stroke="#fffbe8" stroke-width=".7" opacity=".8"/>`}</g>`).join('')+
   `<text x="${cx}" y="${cy+R-10}" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="7.5" letter-spacing="1.6" fill="#f3dc95"${LATIN[sign].length>8?' textLength="54" lengthAdjust="spacingAndGlyphs"':''}>${LATIN[sign]}</text></g>`;};
 K.festive=(id,top,bottom,disc='#fff1cf')=>K.sky(id,[top,bottom])+`<circle cx="150" cy="110" r="92" fill="${disc}" opacity=".55"/>`+K.xiangyun(60,70,1.1)+K.xiangyun(236,120,.9)+K.xiangyun(140,40,.7,'#ffffff',.4);
 const ELEMENT={fire:['#2a1838','#5a2a48','#a2484a'],earth:['#13262a','#244538','#4f6d4a'],air:['#1a1e48','#3a3a78','#7a6aa8'],water:['#0d1d3a','#16406a','#2f7a9a']};
 K.starsky=(id,el)=>K.sky(id,ELEMENT[el])+K.stars(50,el.length*13+id.length,200);

 /* ---- things a paw can hold (panda coordinates, hanging arm; the arm turns them into place) ---- */
 const H={
  leaf:'<g transform="translate(116 150) rotate(20)"><path d="M0 0q12-2 16 10q-10 6-16-10Z" fill="#e58a3c" stroke="#9c4f1d" stroke-width="1.6"/><path d="M0 0l12 8" stroke="#9c4f1d" stroke-width="1.2"/></g>',
  wand:'<path d="M46 146L40 176" stroke="#c78b4a" stroke-width="3.4" stroke-linecap="round"/><circle cx="39" cy="184" r="8" fill="#ffffff" fill-opacity=".25" stroke="#ff8fb1" stroke-width="3"/>',
  mooncake:'<g transform="translate(114 152)"><ellipse rx="13" ry="12" fill="#d9a35a" stroke="#8f5f2a" stroke-width="2"/><ellipse rx="8.5" ry="7.5" fill="#e8b96c"/><path d="M-5 0h10M0 -5v10" stroke="#b9853f" stroke-width="1.6"/></g>',
  sparkler:'<path d="M113 148l3 30" stroke="#8a8f99" stroke-width="2.4" stroke-linecap="round"/><g transform="translate(116 182)"><path d="M0-9l2.4 6.6L9 0l-6.6 2.4L0 9l-2.4-6.6L-9 0l6.6-2.4Z" fill="#fff3b0" stroke="#f2b33e" stroke-width="1.2"/></g>',
  // drawn where it should end up in the munch pose (arm-l turned -30deg), then turned back with the arm
  carrot:'<g transform="rotate(30 58 106)"><path d="M62 140l12 1-4 -40Z" fill="#f08a3a" stroke="#a5531d" stroke-width="1.6" stroke-linejoin="round"/><path d="M65 128l6 0M64 118l5 0" stroke="#c9682a" stroke-width="1.2"/><path d="M66 141l-6 9M68 141l0 10M70 141l6 8" stroke="#5f9a45" stroke-width="2.4" stroke-linecap="round"/></g>',
  peach:'<g transform="translate(114 152)"><path d="M0 11c-9 0-13-7-11-13c2-6 9-8 11-3c2-5 9-3 11 3c2 6-2 13-11 13Z" fill="#f6a6a0" stroke="#b9645e" stroke-width="1.8"/><path d="M0 -5q4-7 9-6" stroke="#6f9a45" stroke-width="2" fill="none"/></g>',
  wheat:'<g transform="translate(113 146)"><path d="M0 0l2 40" stroke="#c69a45" stroke-width="2"/>'+[6,14,22,30].map(y=>`<ellipse cx="${-3+y*.05}" cy="${y+4}" rx="2.6" ry="5" fill="#e8c062" transform="rotate(-25 ${-3+y*.05} ${y+4})"/><ellipse cx="${5+y*.05}" cy="${y+4}" rx="2.6" ry="5" fill="#e8c062" transform="rotate(25 ${5+y*.05} ${y+4})"/>`).join('')+'</g>',
  bow:'<g transform="translate(46 150)"><path d="M-12 -22q-22 30 0 60" stroke="#2a2d38" stroke-width="6.4" fill="none" stroke-linecap="round"/><path d="M-12 -22q-22 30 0 60" stroke="#c98d5a" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M-12 -22L-12 38" stroke="#f6efe2" stroke-width="1.4"/><path d="M-12 8L22 8" stroke="#8a5d3b" stroke-width="2.4" stroke-linecap="round"/><path d="M24 8l-7-4v8Z" fill="#d9e3ea" stroke="#2a2d38" stroke-width="1"/><path d="M-12 8l-5-4M-12 8l-5 4" stroke="#e05a4a" stroke-width="2"/></g>',
  paddle:'<path d="M113 140l6 44" stroke="#a8743a" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="120" cy="190" rx="6" ry="11" fill="#c98d5a" stroke="#8f5f2a" stroke-width="1.6"/>'
 };

 /* ---- the 24 cards ------------------------------------------------------------------------------- */
 // pose: [x%, y%, width%] of the panda in the art box; look: data attributes for panda-art.js.
 const CARDS=[
  {id:'bamboo-breakfast',series:'life',title:'竹林早餐',rarity:'common',line:'清晨的第一口竹子，总是最甜。',look:{form:'cub',outfit:'scarf',action:'munch'},pose:[28,38,44],
   scene:id=>K.sky(id,['#fdf2c9','#e7f1c8','#bcd9a0'])+K.sun(id,236,62,20,'#fff1b8')+[18,52,214,252,276].map((x,i)=>K.bamboo(x,10+i*14,10+i%2*2)).join('')+K.hill(232,22,'#9cc47a',2)+K.ground(258,'#86b468','#6f9f55')+K.grass(26,4,262),
   fg:()=>K.fall(6,9,'<path d="M0 -6q7 4 0 12q-7-8 0-12Z" fill="#9fcf73"/>')},
  {id:'lake-fishing',series:'life',title:'湖畔垂钓',rarity:'common',line:'鱼还没上钩，晚霞先落进了湖里。',look:{form:'cub',outfit:'strawhat',action:'fish'},pose:[16,40,46],
   scene:id=>K.sky(id,['#f7b48a','#f6d39a','#f9e7c2'])+K.sun(id,214,150,24,'#ffd27a')+K.mountains(176,'#c99a8a',5,3,60)+K.water(id,176,'#e5a98c','#8fa8b8')+`<path d="M200 182h28M196 196h36M204 210h20" stroke="#ffe0a0" stroke-width="3" stroke-linecap="round" opacity=".8"/>`+K.ground(262,'#7d9c5e','#5f7f48')+K.grass(30,7,264,'#4f7a3e'),
   fg:()=>`<path d="M262 300q4-60 10-90M272 300q-2-50 6-80M284 300q2-40-4-70" stroke="#6b8a4a" stroke-width="3" fill="none"/><ellipse cx="272" cy="214" rx="4" ry="12" fill="#8a5d3b"/>`},
  {id:'rainy-reading',series:'life',title:'雨天读书',rarity:'common',line:'窗外下着小雨，书里出着太阳。',look:{form:'cub',outfit:'beanie',action:'read'},pose:[30,40,42],
   scene:id=>`<rect width="300" height="300" fill="#e9dcc3"/><rect y="236" width="300" height="64" fill="#b98e62"/><path d="M0 236h300" stroke="#8a6440" stroke-width="4"/>`+`<g>${K.sky(id,['#8fa6bb','#b7c7d2'])}</g>`.replace('<rect width="300" height="300"','<rect x="34" y="36" width="140" height="120"')+`<g clip-path="url(#${id}c)"><defs><clipPath id="${id}c"><rect x="34" y="36" width="140" height="120"/></clipPath></defs>${K.rain(26,5).replace(/class="tac-rain"/g,'class="tac-rain"')}</g>`+K.window(34,36,140,120)+K.shelf(196,96)+K.shelf(196,150)+`<path d="M234 176v54M218 230h32" stroke="#8a6440" stroke-width="4"/><path d="M220 176h28l-6-22h-16Z" fill="#f2c96b"/>`+K.glow(id,234,170,46,'#ffe8a0',.5),
   fg:()=>``},
  {id:'spring-blossom',series:'life',title:'樱花树下',rarity:'common',line:'春风一吹，满树的花都在唱歌。',look:{form:'cub',outfit:'flower',action:'sway'},pose:[30,38,44],
   scene:id=>K.sky(id,['#cfe8f4','#f3e6ef','#fbeff1'])+K.cloud(70,60,1.1)+K.cloud(230,44,.8)+K.hill(226,24,'#b8d89a',6)+K.tree(54,118,58,'#f6b8c9','#ef9fb6')+K.tree(250,126,48,'#f8c6d4','#efa4bb')+K.ground(256,'#9fca7e','#82b066')+K.flowers(18,11,262,292,['#ffffff','#f7b8c8','#fbe08a']),
   fg:()=>K.fall(16,13,K.petal)},
  {id:'summer-fireflies',series:'life',title:'夏夜萤火',rarity:'common',line:'把萤火虫的光，借来照亮回家的路。',look:{form:'cub',outfit:'lantern-red',action:'wave'},pose:[29,40,42],
   scene:id=>K.sky(id,['#1d2a4a','#2f4a68','#4d6f72'])+K.stars(46,21,150)+K.moon(id,236,58,18)+K.hill(214,30,'#2f5547',8)+K.hill(244,20,'#3f6a52',9)+K.ground(262,'#4d7d58','#3c6a48')+K.grass(30,12,264,'#2f5a3e'),
   fg:()=>K.fireflies(16,23)},
  {id:'autumn-leaves',series:'life',title:'秋叶纷飞',rarity:'common',line:'接住一片落叶，就接住了整个秋天。',look:{form:'cub',outfit:'redscarf',action:'dance'},pose:[29,38,42],hold:{r:H.leaf},
   scene:id=>K.sky(id,['#f8d9a8','#f5e3c2','#f3ecd9'])+K.hill(220,26,'#e2b06a',14)+K.tree(48,120,56,'#e9873e','#d26a2f')+K.tree(256,110,50,'#f0a648','#dd8233')+K.ground(258,'#d9a560','#c48a48')+K.fall(10,15,K.leaf).replace(/tac-fall/g,'tac-still'),
   fg:()=>K.fall(12,17,K.leaf)},
  {id:'snow-day',series:'life',title:'初雪',rarity:'common',line:'第一场雪落下时，北极熊模样的熊猫也来了。',look:{form:'polar',outfit:'beanie',action:'cheer'},pose:[30,36,42],
   scene:id=>K.sky(id,['#b9cfe3','#dbe7f0','#f1f5f8'])+K.mountains(200,'#d5e2ec',19,4,80)+K.hill(232,22,'#eef4f8',20,'#c7d6e3')+`<g transform="translate(246 214)"><circle r="20" fill="#ffffff" stroke="#c7d6e3" stroke-width="2"/><circle cy="-28" r="13" fill="#ffffff" stroke="#c7d6e3" stroke-width="2"/><path d="M-3 -28l9 2-9 2Z" fill="#ec8a3a"/><circle cx="-4" cy="-32" r="1.6" fill="#2a2d38"/><circle cx="4" cy="-32" r="1.6" fill="#2a2d38"/><path d="M-13 -18q13 6 26 0" stroke="#d4563f" stroke-width="4" fill="none"/></g>`+K.ground(260,'#ffffff','#c7d6e3'),
   fg:()=>K.fall(30,19,K.flake,'tac-snow')},
  {id:'kite-hill',series:'life',title:'风筝山坡',rarity:'common',line:'线的那头是风，风的那头是梦想。',look:{form:'cub',outfit:'cap',action:'kite'},pose:[18,42,42],
   scene:id=>K.sky(id,['#8ecbe8','#bfe2f0','#e6f4f6'])+K.cloud(60,54,1.2)+K.cloud(200,92,.9)+K.cloud(120,128,.7,'#ffffff',.8)+K.hill(206,40,'#9fd07a',22)+K.hill(250,26,'#86bf62',23)+K.ground(270,'#79b456')+K.flowers(10,24,250,290,['#ffffff','#fbe08a']),
   fg:()=>``},
  {id:'bubble-garden',series:'life',title:'泡泡花园',rarity:'common',line:'每一个泡泡里，都住着一道彩虹。',look:{form:'cub',outfit:'bowtie',action:''},pose:[26,40,44],arms:{l:118},hold:{l:H.wand},
   scene:id=>K.sky(id,['#d7eef2','#eef6e6','#f6f3dc'])+K.hill(220,20,'#b9dc97',26)+`<path d="M0 230h300" stroke="#c7a46e" stroke-width="5"/>${Array.from({length:16},(_,i)=>`<rect x="${i*20+4}" y="206" width="8" height="36" rx="3" fill="#e8cf9a" stroke="#c7a46e"/>`).join('')}`+K.ground(260,'#8fc46c')+K.flowers(26,27,248,292,['#f7b8c8','#b9a3e8','#fbe08a','#ffffff']),
   fg:()=>[[44,92,11],[30,62,8],[66,52,9],[20,120,6]].map(([x,y,r],i)=>`<g transform="translate(${x} ${y})"><g class="tac-bob" style="animation-delay:${-i*.6}s"><circle r="${r}" fill="#e7f7ff" fill-opacity=".35" stroke="#9ed6ee" stroke-width="1.6"/><path d="M${-r*.55} ${-r*.1}a${r*.6} ${r*.6} 0 0 1 ${r*.45} ${-r*.45}" stroke="#fff" stroke-width="1.6" fill="none"/></g></g>`).join('')},
  {id:'taichi-morning',series:'life',title:'太极晨练',rarity:'common',line:'一呼一吸之间，山间的雾也慢了下来。',look:{form:'master',outfit:'none',action:'taichi'},pose:[29,38,42],
   scene:id=>K.sky(id,['#f6dcb8','#efe6cf','#dfe8df'])+K.sun(id,150,96,26,'#ffd59a')+K.mountains(170,'#b7c7c0',29,3,100)+`<rect y="150" width="300" height="40" fill="#ffffff" opacity=".45"/>`+K.mountains(206,'#93ab9f',31,4,70)+`<rect y="196" width="300" height="24" fill="#ffffff" opacity=".35"/>`+K.ground(256,'#8ea98a','#7a9677')+`<path d="M40 262h220" stroke="#c9b58e" stroke-width="6" stroke-linecap="round"/>`,
   fg:()=>``},
  {id:'mesh-workshop',series:'flow',title:'网格工坊',rarity:'common',line:'先把空间切成小方块，再让流体一块块走过。',look:{form:'engineer',outfit:'none',action:'typing'},pose:[29,40,42],
   scene:id=>`<rect width="300" height="300" fill="#dfe6e8"/>`+`<rect x="22" y="22" width="256" height="170" rx="8" fill="#1f3a4f"/>${Array.from({length:13},(_,i)=>`<path d="M${34+i*19} 34v146" stroke="#8fc3d8" stroke-opacity="${.25+((i*7)%5)/10}" stroke-width="1"/>`).join('')}${Array.from({length:8},(_,i)=>`<path d="M34 ${34+i*20.5}h232" stroke="#8fc3d8" stroke-opacity=".35" stroke-width="1"/>`).join('')}<path d="M34 180 Q150 92 266 180" fill="none" stroke="#f2c440" stroke-width="2.4"/><text x="40" y="52" font-family="ui-monospace,monospace" font-size="11" fill="#cfe7f0">blockMeshDict</text>`+`<rect y="214" width="300" height="86" fill="#b98e62"/><path d="M0 214h300" stroke="#8a6440" stroke-width="4"/>`,
   fg:()=>``},
  {id:'residual-night',series:'flow',title:'残差收敛',rarity:'common',line:'凌晨两点，曲线终于乖乖地落了下来。',look:{form:'cub',outfit:'headphones',action:'typing'},pose:[29,42,42],
   scene:id=>`<rect width="300" height="300" fill="#26324a"/>`+K.window(214,34,62,62).replace(/#8a6440/g,'#3d4b66')+K.stars(8,33,54,'#fff8dc',218,38,54)+K.glow(id,110,120,110,'#7fd1c3',.18)+K.plot(26,34,170,110)+`<rect y="218" width="300" height="82" fill="#5b4a3f"/><path d="M0 218h300" stroke="#3f3329" stroke-width="4"/><g transform="translate(250 204)"><path d="M-10 0h20l-3 16h-14Z" fill="#f4efe0"/><path d="M10 4q8 0 6 7" stroke="#f4efe0" stroke-width="2.4" fill="none"/><path d="M-3 -4q3-6 0-10M3 -4q3-6 0-10" stroke="#ffffff" stroke-opacity=".5" stroke-width="1.4" fill="none" class="tac-steam"/></g>`,
   fg:()=>``},
  {id:'lab-flask',series:'flow',title:'小小实验',rarity:'common',line:'加一点点耐心，再加一点点好奇心。',look:{form:'cub',outfit:'goggles',action:'experiment'},pose:[26,40,44],
   scene:id=>`<rect width="300" height="300" fill="#e6efe9"/>`+`<path d="M0 60h300" stroke="#c8d6cf" stroke-width="3"/>`+[[40,40,'#7ad3c4'],[80,40,'#f2b35e'],[232,40,'#b79cf0']].map(([x,y,c])=>`<g transform="translate(${x} ${y})"><rect x="-6" y="-24" width="12" height="20" fill="#f6fbff" stroke="#8aa3a6" stroke-width="2"/><path d="M-6 -4l-12 24q-2 6 4 6h28q6 0 4-6l-12-24Z" fill="#f6fbff" stroke="#8aa3a6" stroke-width="2"/><path d="M-13 12h26l3 6q2 6-4 6h-24q-6 0-4-6Z" fill="${c}"/></g>`).join('')+`<rect y="212" width="300" height="88" fill="#cfd8d2"/><path d="M0 212h300" stroke="#9fb0a8" stroke-width="4"/>`+K.glow(id,240,190,60,'#b79cf0',.25),
   fg:()=>[[256,170],[262,150],[250,132]].map(([x,y],i)=>`<g transform="translate(${x} ${y})"><g class="tac-bob" style="animation-delay:${-i*.5}s"><circle r="${5-i}" fill="#efe5ff" stroke="#b79cf0" stroke-width="1.4"/></g></g>`).join('')},
  {id:'photo-walk',series:'life',title:'街拍熊猫',rarity:'common',line:'咔嚓——把今天的小镇装进口袋。',look:{form:'cub',outfit:'cap',action:'photo'},pose:[30,40,42],
   scene:id=>K.sky(id,['#cfe7f2','#e9f1e8'])+K.cloud(240,50,1)+[[30,150,62,'#e9d2a8','#c9714f'],[112,136,70,'#f1e3c4','#5f8fb0'],[200,146,74,'#e7d8bd','#7aa35a']].map(([x,y,w,wall,roof])=>`<rect x="${x}" y="${y}" width="${w}" height="${236-y}" fill="${wall}" stroke="#8a6440" stroke-width="2"/><path d="M${x-8} ${y}L${x+w/2} ${y-34}L${x+w+8} ${y}Z" fill="${roof}" stroke="#6b4a2e" stroke-width="2"/><rect x="${x+w/2-9}" y="${210}" width="18" height="26" rx="8" fill="#8a5d3b"/><rect x="${x+8}" y="${y+18}" width="14" height="14" fill="#bfe0f0" stroke="#8a6440" stroke-width="2"/><rect x="${x+w-22}" y="${y+18}" width="14" height="14" fill="#bfe0f0" stroke="#8a6440" stroke-width="2"/>`).join('')+`<rect y="236" width="300" height="64" fill="#cdbb98"/>${Array.from({length:12},(_,i)=>`<path d="M${i*26} 250h18M${i*26+12} 270h18M${i*26} 290h18" stroke="#b5a17c" stroke-width="2"/>`).join('')}`,
   fg:()=>``},
  {id:'cavity-vortex',series:'flow',title:'方腔涡旋',rarity:'rare',line:'盖子轻轻一推，整个方腔都转了起来。',look:{form:'engineer',outfit:'none',action:'streamline'},pose:[52,44,42],
   scene:id=>`<rect width="300" height="300" fill="#13243a"/>`+`<rect x="22" y="40" width="190" height="190" rx="6" fill="#0d1b2c" stroke="#5f7d99" stroke-width="3"/><path d="M28 32h178" stroke="#f2a541" stroke-width="5" stroke-linecap="round"/><path d="M190 24l14 8-14 8" fill="none" stroke="#f2a541" stroke-width="4"/>`+`<g clip-path="url(#${id}k)"><defs><clipPath id="${id}k"><rect x="24" y="42" width="186" height="186"/></clipPath></defs>${K.streamlines(id,124,112,84,74,7,['#3b6fd0','#3fb4c8','#7fd1a0','#f2d35e','#f2a541','#e8735a'])}<g transform="translate(40 210)">${K.streamlines(id,0,0,16,12,3,['#3b6fd0','#3fb4c8'])}</g><g transform="translate(196 214)">${K.streamlines(id,0,0,12,10,3,['#3b6fd0','#3fb4c8'])}</g></g>`+K.stars(16,35,300,'#9fc6e8'),
   fg:()=>``},
  {id:'karman-street',series:'flow',title:'卡门涡街',rarity:'rare',line:'圆柱后面，涡一左一右地排着队出发。',look:{form:'sailor',outfit:'none',action:'wave'},pose:[4,46,38],
   scene:id=>K.sky(id,['#163452','#1f4c6e','#2f6a86'])+`<rect y="110" width="300" height="110" fill="#173e5a"/>`+`<circle cx="138" cy="150" r="15" fill="#e9eef2" stroke="#9fb6c8" stroke-width="3"/>${[0,1,2,3].map(i=>`<path d="M60 ${114+i*24}Q110 ${114+i*24} 124 ${134+i*6}" stroke="#7fb8d8" stroke-opacity=".5" stroke-width="2" fill="none" stroke-dasharray="6 5" class="tac-flow"/>`).join('')}<g transform="translate(96 -14)">${K.vortexStreet(165)}</g>`+K.water(id,226,'#2f6a86','#1d4a66')+`<rect x="0" y="232" width="118" height="14" fill="#8a6440"/><path d="M14 246v40M60 246v40M104 246v40" stroke="#6b4a2e" stroke-width="6"/>`,
   fg:()=>``},
  {id:'airfoil-wind',series:'flow',title:'风洞翼型',rarity:'rare',line:'只要角度合适，风就会把你托起来。',look:{form:'pilot',outfit:'none',action:'cheer'},pose:[52,40,42],
   scene:id=>`<rect width="300" height="300" fill="#e7ecef"/>`+`<rect x="0" y="30" width="300" height="170" fill="#d4dde3"/><path d="M0 30h300M0 200h300" stroke="#9aa9b4" stroke-width="5"/>`+[0,1,2,3,4,5].map(i=>`<path d="M-10 ${56+i*26}C60 ${56+i*26} 70 ${(i<3?40+i*22:118+i*14)} 150 ${(i<3?36+i*22:120+i*14)}S240 ${56+i*26} 310 ${56+i*26}" fill="none" stroke="${['#3b6fd0','#3fb4c8','#7fd1a0','#f2d35e','#f2a541','#e8735a'][i]}" stroke-width="2.4" stroke-dasharray="9 7" class="tac-flow" style="animation-duration:${1+i*.15}s"/>`).join('')+`<path d="M58 118Q120 66 196 108Q130 100 58 122Z" fill="#f4f6f8" stroke="#6b7f8e" stroke-width="3"/>`+`<rect y="214" width="300" height="86" fill="#b9c4cc"/><path d="M0 214h300" stroke="#8796a2" stroke-width="4"/>`,
   fg:()=>``},
  {id:'starry-observatory',series:'life',title:'星空观测',rarity:'rare',line:'穿上宇航服，假装自己正在银河里漂流。',look:{form:'astronaut',outfit:'spacesuit',action:'wave'},pose:[30,38,42],
   scene:id=>K.sky(id,['#0d1530','#1d2a55','#3a3f74'])+`<path d="M-20 120Q150 20 320 60" stroke="#c9c2ff" stroke-opacity=".16" stroke-width="60" fill="none"/>`+K.stars(80,41,240)+K.moon(id,58,60,14)+`<g transform="translate(244 204)"><path d="M-30 30h60l-8-44h-44Z" fill="#cfd6e6"/><path d="M-34 -14a34 34 0 0 1 68 0Z" fill="#e7ecf5" stroke="#9aa6c0" stroke-width="2"/><path d="M-4 -46l26 22" stroke="#9aa6c0" stroke-width="7"/></g>`+K.hill(250,18,'#2c3558',42)+K.ground(268,'#353f66'),
   fg:()=>`<path d="M30 40l40 18" stroke="#ffffff" stroke-width="2" stroke-linecap="round" class="tac-meteor"/>`},
  {id:'moon-festival',series:'festival',title:'中秋赏月',rarity:'rare',line:'月亮圆了，月饼也圆了。',look:{form:'cub',outfit:'moon-lamp',action:'wave'},pose:[28,40,44],hold:{r:H.mooncake},
   scene:id=>K.sky(id,['#1f2550','#3a3570','#6a4d7c'])+K.stars(30,51,140)+K.moon(id,214,78,38)+`<path d="M0 214Q80 190 150 206T300 200V300H0Z" fill="#2c2a55"/>`+K.lantern(46,70,.8)+K.lantern(86,46,.6)+`<rect y="246" width="300" height="54" fill="#8a5d3b"/><path d="M0 246h300" stroke="#6b4a2e" stroke-width="4"/>`+[[226,256],[252,262]].map(([x,y])=>`<g transform="translate(${x} ${y})"><ellipse rx="15" ry="7" fill="#d9a35a" stroke="#a8743a" stroke-width="2"/><ellipse cy="-3" rx="12" ry="5" fill="#e8b96c"/><path d="M-6 -3h12M0 -7v8" stroke="#b9853f" stroke-width="1.4"/></g>`).join(''),
   fg:()=>``},
  {id:'dragon-boat',series:'festival',title:'端午龙舟',rarity:'rare',line:'鼓声一响，粽子也跟着往前冲。',look:{form:'cub',outfit:'zongzi',action:'cheer'},pose:[30,39,40],
   scene:id=>K.sky(id,['#bfe3f0','#e3f1ec'])+K.cloud(60,46,1)+K.mountains(170,'#9cc2a8',53,4,60)+K.water(id,170,'#7fc0cf','#4f93a8')+`<g transform="translate(150 236)"><path d="M-140 -6Q0 22 130 -6L140 -20Q0 6 -140 -20Z" fill="#d4563f" stroke="#8f2e24" stroke-width="3"/><path d="M130 -6q22-14 18-34q-14 4-12 18Z" fill="#e2b04a" stroke="#8f2e24" stroke-width="2"/><circle cx="142" cy="-30" r="2.4" fill="#2a2d38"/>${[-110,-80,-50,-20,10,40,70,100].map(x=>`<path d="M${x} -12l-10 16" stroke="#e2b04a" stroke-width="3"/>`).join('')}</g>`,
   fg:()=>`<path d="M0 254Q150 266 300 254V300H0Z" fill="#4f93a8" opacity=".85"/>`},
  {id:'spring-festival',series:'festival',title:'新春烟花',rarity:'rare',line:'灯笼红了，天空也开出了花。',look:{form:'cub',outfit:'lantern-red',action:'firework'},pose:[29,42,42],arms:{r:-128},hold:{r:H.sparkler},
   scene:id=>K.sky(id,['#1b1838','#3a1f45','#6a2a3c'])+K.stars(20,61,120)+K.burst(70,60,30,'#ffd166','d0')+K.burst(220,48,36,'#ff7aa8','d1')+K.burst(150,96,24,'#7fd1c3','d2')+`<path d="M0 72Q150 100 300 72" stroke="#3b2a1f" stroke-width="2" fill="none"/>`+[40,110,190,260].map((x,i)=>K.lantern(x,92+Math.sin(i)*6,.7)).join('')+`<path d="M0 230Q150 216 300 230V300H0Z" fill="#3a2135"/>`+K.ground(262,'#4a2a3e'),
   fg:()=>``},
  {id:'town-portrait',series:'life',title:'小镇合影',rarity:'legend',line:'这一张，要放进小镇的相册第一页。',look:{form:'cub',outfit:'scarf',action:'selfie'},pose:[34,36,36],extra:[{look:{form:'explorer',outfit:'strawhat',action:'cheer'},pose:[4,44,34]},{look:{form:'sailor',outfit:'bowtie',action:'wave'},pose:[64,44,34]}],
   scene:id=>K.sky(id,['#f6c88a','#f8ddb0','#fcefd6'])+K.sun(id,150,118,30,'#ffd27a')+K.mountains(176,'#e2b48e',63,4,60)+`<g opacity=".9">${[[24,150,50,'#f1e3c4','#c9714f'],[226,146,56,'#e9d2a8','#5f8fb0']].map(([x,y,w,wall,roof])=>`<rect x="${x}" y="${y}" width="${w}" height="${210-y}" fill="${wall}"/><path d="M${x-6} ${y}L${x+w/2} ${y-26}L${x+w+6} ${y}Z" fill="${roof}"/>`).join('')}</g>`+K.ground(234,'#a7c47c','#8fb066')+K.flowers(20,67,240,290,['#ffffff','#f7b8c8','#fbe08a']),
   fg:()=>K.fall(10,71,'<path d="M0 -4l1.2 2.8 3 .2-2.3 2 .8 3-2.7-1.6-2.7 1.6.8-3-2.3-2 3-.2Z" fill="#fff3b0"/>','tac-sparkle')},
  {id:'paraview-aurora',series:'flow',title:'流场极光',rarity:'legend',line:'把速度场画成极光，夜空也开始流动。',look:{form:'master',outfit:'none',action:'meditate'},pose:[29,38,42],
   scene:id=>K.sky(id,['#071226','#10284a','#1f3f5f'])+K.stars(60,73,200)+[['#3b6fd0',40],['#3fb4c8',62],['#7fd1a0',84],['#f2d35e',106],['#f2a541',124],['#e8735a',140]].map(([c,y],i)=>`<path d="M-20 ${y}C60 ${y-40} 120 ${y+30} 180 ${y-10}S280 ${y-30} 320 ${y}" stroke="${c}" stroke-width="${18-i*1.6}" stroke-opacity=".35" fill="none" class="tac-aurora" style="animation-delay:${-i*.8}s"/>`).join('')+K.mountains(214,'#16263b',79,5,70)+K.hill(250,14,'#e6eef6',81,'#b9c9da')+K.ground(270,'#f2f6fa'),
   fg:()=>``},
  {id:'ns-scroll',series:'flow',title:'纳维-斯托克斯',rarity:'legend',line:'一笔一画，写下流动的全部秘密。',look:{form:'master',outfit:'scroll',action:'read'},pose:[30,38,42],
   scene:id=>`<rect width="300" height="300" fill="#efe2c4"/>`+K.glow(id,150,120,150,'#fff3d0',.6)+`<g transform="translate(150 96)"><rect x="-128" y="-56" width="256" height="96" rx="4" fill="#fbf4df" stroke="#b9975e" stroke-width="2"/><rect x="-140" y="-62" width="12" height="108" rx="6" fill="#8a5d3b"/><rect x="128" y="-62" width="12" height="108" rx="6" fill="#8a5d3b"/><text x="0" y="-16" text-anchor="middle" font-family="'Times New Roman',serif" font-style="italic" font-size="14.5" fill="#2a2d38" textLength="226" lengthAdjust="spacingAndGlyphs">∂u/∂t + (u·∇)u = −∇p/ρ + ν∇²u</text><text x="0" y="14" text-anchor="middle" font-family="'Times New Roman',serif" font-style="italic" font-size="15" fill="#2a2d38">∇·u = 0</text><rect x="92" y="14" width="20" height="20" rx="3" fill="#c9433a" opacity=".85"/><path d="M97 19h10M102 19v10M97 24h10" stroke="#fbf4df" stroke-width="1.6"/></g>`+`<rect y="226" width="300" height="74" fill="#8a5d3b"/><path d="M0 226h300" stroke="#6b4a2e" stroke-width="4"/><g transform="translate(244 216)"><rect x="-4" y="-34" width="8" height="34" fill="#4a3a2a"/><path d="M-4 -2l4 12 4-12Z" fill="#2a2d38"/></g>`,
   fg:()=>``}
 ];

 /* 十二生肖 */
 const SX=[['rat','子鼠','鼠','小老鼠悄悄分我一粒瓜子。',{form:'cub',outfit:'scarf',action:'munch'},{},'#fde7c2','#f6c38c',[18,40,44],[226,270,1.3]],
  ['ox','丑牛','牛','慢慢走，一步一个脚印也能走很远。',{form:'cub',outfit:'strawhat',action:'water'},{},'#e9f2cf','#bcd99a',[14,40,44],[230,272,1.25]],
  ['tiger','寅虎','虎','戴上虎头帽，胆子也大了一圈。',{form:'cub',outfit:'redscarf',action:'cheer'},{},'#fde3bf','#f2b57a',[16,38,44],[228,272,1.3]],
  ['rabbit','卯兔','兔','和小兔子比赛，谁先啃完胡萝卜。',{form:'cub',outfit:'flower',action:'munch'},{hold:{l:H.carrot},noCarry:true},'#f6e9f3','#e9c8dc',[16,40,44],[230,272,1.25]],
  ['dragon','辰龙','龙','小龙打了个喷嚏，吹来一朵祥云。',{form:'cub',outfit:'scarf',action:'cheer'},{},'#e3f1ea','#a9d4c0',[12,40,42],[226,266,1.25]],
  ['snake','巳蛇','蛇','小蛇盘成一个圆，正好当坐垫。',{form:'master',outfit:'none',action:'meditate'},{},'#eef3d8','#cfe0a4',[14,38,44],[232,272,1.3]],
  ['horse','午马','马','骑上小马，去看看远方的山。',{form:'explorer',outfit:'strawhat',action:'wave'},{},'#f8ecd0','#e2c68e',[10,40,42],[212,274,1.2]],
  ['sheep','未羊','羊','羊毛软软的，比云还要软。',{form:'cub',outfit:'beanie',action:'sway'},{},'#eef0f6','#cdd6ea',[16,38,44],[230,272,1.3]],
  ['monkey','申猴','猴','猴子递来一个桃，说是从树顶摘的。',{form:'cub',outfit:'cap',action:'wave'},{hold:{r:H.peach}},'#fdebd6','#f5c9a0',[14,40,44],[230,272,1.3]],
  ['rooster','酉鸡','鸡','公鸡一叫，太阳就爬上来了。',{form:'cub',outfit:'scarf',action:'stretch'},{},'#fff0cf','#f8cf8a',[16,38,44],[230,272,1.3]],
  ['dog','戌狗','狗','小狗守着门，熊猫守着竹子。',{form:'cub',outfit:'bowtie',action:'dance'},{},'#f4ead8','#dcc29a',[14,38,44],[230,272,1.3]],
  ['pig','亥猪','猪','吃饱了，就该睡个好觉。',{form:'cub',outfit:'beanie',action:'sleep'},{},'#fbe6e6','#efc1c4',[16,40,44],[230,272,1.3]]];
 for(const [animal,title,ch,line,look,opt,top,bottom,pose,[ax,ay,as]] of SX)CARDS.push({id:'zodiac-'+animal,series:'zodiac',title,rarity:'common',line,look,pose,...opt,
  scene:id=>K.festive(id,top,bottom)+K.seal(ch)+K.hill(250,14,'#ffffff55',ch.charCodeAt(0)%97)+K.ground(262,'#ffffff80','#ffffffaa')+K.flowers(8,ch.charCodeAt(0),266,292,['#e05a4a','#f2b33e','#ffffff']),
  fg:()=>Z[animal](ax,ay+4,as*1.28)});
 /* 十二星座 */
 const XZ=[['aries','白羊座','3.21–4.19','冲在最前面的，总是最勇敢的那一个。','fire',{form:'cub',outfit:'redscarf',action:'cheer'},{},()=>Z.sheep(226,276,1.55,true)],
  ['taurus','金牛座','4.20–5.20','慢慢来，好吃的竹子不会跑。','earth',{form:'cub',outfit:'flower',action:'munch'},{},()=>Z.ox(224,276,1.5,true)],
  ['gemini','双子座','5.21–6.21','一个人想不明白的，两个人一起想。','air',{form:'cub',outfit:'scarf',action:'wave'},{extra:[{look:{form:'cub',outfit:'bowtie',action:'cheer'},pose:[48,40,40]}]},()=>''],
  ['cancer','巨蟹座','6.22–7.22','把喜欢的人，都护在自己的壳里。','water',{form:'sailor',outfit:'none',action:'dance'},{},()=>Z.crab(226,276,1.6)],
  ['leo','狮子座','7.23–8.22','今天的主角，是我。','fire',{form:'cub',outfit:'none',action:'cheer'},{},()=>''],
  ['virgo','处女座','8.23–9.22','每一片叶子，都要摆得整整齐齐。','earth',{form:'cub',outfit:'flower',action:''},{arms:{r:-30},hold:{r:H.wheat}},()=>''],
  ['libra','天秤座','9.23–10.23','网格和步长，都要刚刚好。','air',{form:'master',outfit:'none',action:'meditate'},{},()=>Z.scales(228,276,1.45)],
  ['scorpio','天蝎座','10.24–11.22','安静的时候，也在认真想事情。','water',{form:'cub',outfit:'goggles',action:'read'},{},()=>Z.scorpion(228,276,1.5)],
  ['sagittarius','射手座','11.23–12.21','把箭射向最远的那颗星星。','fire',{form:'explorer',outfit:'none',action:''},{arms:{l:100},hold:{l:H.bow}},()=>`<path d="M84 150L170 104" stroke="#fff6cf" stroke-width="2" stroke-dasharray="4 4" class="tac-flow"/><path d="M170 104l-10 0 4 6Z" fill="#fff6cf"/>`],
  ['capricorn','摩羯座','12.22–1.19','一步一步，总能爬上最高的山。','earth',{form:'master',outfit:'none',action:'taichi'},{},()=>Z.seagoat(222,276,1.5)],
  ['aquarius','水瓶座','1.20–2.18','倒出来的不是水，是满天的星星。','air',{form:'cub',outfit:'scarf',action:'water'},{},()=>K.fall(10,77,'<circle r="1.8" fill="#fff6cf"/>','tac-sparkle')],
  ['pisces','双鱼座','2.19–3.20','在梦里游泳，醒来还记得水的温度。','water',{form:'cub',outfit:'strawhat',action:'fish'},{},()=>Z.koi(222,236,1.35)]];
 for(const [sign,title,dates,line,el,look,opt,friend] of XZ)CARDS.push({id:'star-'+sign,series:'stars',title,rarity:'common',line:dates+' · '+line,look,pose:opt.extra?[8,40,40]:sign==='leo'?[29,38,42]:[14,40,44],...opt,
  scene:id=>K.starsky(id,el)+K.emblem(id,sign)+K.glyph(sign,14,14)+(sign==='leo'?Z.mane(150,166,50):'')+(el==='water'?K.water(id,236,ELEMENT.water[2],ELEMENT.water[1]):K.hill(240,22,el==='fire'?'#5a2a3e':el==='earth'?'#2f5040':'#3f3a70',el.length)+K.ground(264,el==='fire'?'#4a2236':el==='earth'?'#2a4535':'#352f62')),
  fg:friend});
 const SERIES=[['all','全部'],['life','日常四季'],['flow','流动之美'],['festival','节日'],['zodiac','十二生肖'],['stars','十二星座'],['legend','珍藏']];
 const RARITY={common:{name:'普通',gem:'#9cb88a'},rare:{name:'稀有',gem:'#6fa8dc'},legend:{name:'珍藏',gem:'#e2b04a'}};
 const byId=Object.fromEntries(CARDS.map((c,i)=>[c.id,{...c,no:i+1}]));

 // Arms: a card may set exact angles (arms:{l,r} in degrees) and give a paw something to hold (hold:{l,r} SVG
 // in the panda's own 160 x 180 coordinates, paws at about (47,142) and (113,142)); held things sit inside the
 // arm group, so they turn with the arm and the paw is drawn over them.
 function panda(look,pose,cls='',opt={}){const [x,y,w]=pose;let art=window.foamPandaArt?.()||'';
  for(const side of ['l','r'])if(opt.hold?.[side])art=art.replace(`class="pa-arm pa-arm-${side}">`,`class="pa-arm pa-arm-${side}"><g class="tac-held">${opt.hold[side]}</g>`);
  const arms=opt.arms||{},vars=Object.entries(arms).map(([k,v])=>`--arm-${k}:${v}deg`).join(';');
  return `<div class="tac-pose ${cls}" style="left:${x}%;top:${y}%;width:${w}%;${vars}"${arms.l!=null?' data-arm-l':''}${arms.r!=null?' data-arm-r':''}${opt.noCarry?' data-no-carry':''} data-form="${E(look.form)}" data-outfit="${E(look.outfit)}" data-action="${E(look.action||'')}" data-preview-action="${E(look.action||'')}" data-quiet="true">${art}</div>`;}
 function art(card,{live=false}={}){const id='tac'+(++uid);return `<div class="tac-art${live?' is-live':''}"><svg class="tac-bg" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${card.scene(id)}</svg>${(card.extra||[]).map(p=>panda(p.look,p.pose,'is-extra',p)).join('')}${panda(card.look,card.pose,'',card)}<svg class="tac-fg" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${SHADE}${card.fg?.()||''}</svg></div>`;}
 function front(cardId,{live=false,fresh=false}={}){const c=byId[cardId];if(!c)return '';
  // Include acquisition time in the first layout; adding it on the next timer tick
  // changes every equal-height album row and shifts the reader's scroll position.
  const at=window.FoamTownProgress?.get()?.obtained_at?.['art:'+cardId];
  const time=owned().has(cardId)?window.FoamCollectionTime?.(at)||`<small class="collection-time">${at?'获得于 '+E(new Date(at).toLocaleString('zh-CN',{hour12:false})):'获得时间未记录'}</small>`:'';
  return `<article class="tac is-${c.rarity}" data-art-card="${c.id}" aria-label="${E(c.title)}，${RARITY[c.rarity].name}画卡">${art(c,{live})}<div class="tac-plate"><span class="tac-no">No.${String(c.no).padStart(2,'0')}</span><span class="tac-rarity"><i style="background:${RARITY[c.rarity].gem}"></i>${RARITY[c.rarity].name}</span><h3>${E(c.title)}</h3><p>${E(c.line)}</p></div>${time}${fresh?'<b class="tac-new">NEW</b>':''}<i class="tac-shine" aria-hidden="true"></i></article>`;}
 function back(label=''){return `<div class="tac-back" aria-hidden="true">
  <svg class="tac-back-bamboo" viewBox="0 0 300 460" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M29 117Q36 70 62 35M34 87l-9-4m17-17-9-6m23-15-8-5M271 343q-7 47-33 82m28-52 9 4m-17 17 9 6m-23 15 8 5"/><path d="M41 69q-21-6-18-24 17 6 18 24Zm4-6q0-21 17-23 1 15-17 23ZM33 93q12-24 31-19-9 18-31 19Zm226 298q21 6 18 24-17-6-18-24Zm-4 6q0 21-17 23-1-15 17-23Zm12-30q-12 24-31 19 9-18 31-19Z"/><path d="m144 29 6-6 6 6-6 6Zm0 402 6-6 6 6-6 6Z"/></g></svg>
  <svg class="tac-back-mascot" viewBox="0 0 160 160" aria-hidden="true">
   <circle cx="80" cy="80" r="75" fill="#dfc88e"/><circle cx="80" cy="80" r="70" fill="#f9f0d5" stroke="#577869" stroke-width="2"/><circle cx="80" cy="80" r="62" fill="none" stroke="#d8c79c" stroke-width="1"/>
   <g fill="#283b38" stroke="#20322f" stroke-width="2.5"><circle cx="43" cy="43" r="17"/><circle cx="117" cy="43" r="17"/></g><g fill="#587167"><circle cx="43" cy="43" r="9"/><circle cx="117" cy="43" r="9"/></g>
   <path d="M80 35C51 35 33 54 32 82c-1 28 20 45 48 45s49-17 48-45c-1-28-19-47-48-47Z" fill="#fffdf4" stroke="#283b38" stroke-width="3"/>
   <g class="tac-back-eye"><ellipse cx="58" cy="76" rx="13" ry="17" transform="rotate(23 58 76)" fill="#283b38"/><ellipse cx="60" cy="75" rx="5.8" ry="7.5" fill="#fffdf4"/><ellipse cx="61" cy="76" rx="3.8" ry="5" fill="#283b38"/><circle cx="62" cy="73" r="1.6" fill="#fff"/></g>
   <g class="tac-back-eye"><ellipse cx="102" cy="76" rx="13" ry="17" transform="rotate(-23 102 76)" fill="#283b38"/><ellipse cx="100" cy="75" rx="5.8" ry="7.5" fill="#fffdf4"/><ellipse cx="99" cy="76" rx="3.8" ry="5" fill="#283b38"/><circle cx="100" cy="73" r="1.6" fill="#fff"/></g>
   <g fill="#e9b7a3" opacity=".75"><ellipse cx="48" cy="98" rx="9" ry="4.5"/><ellipse cx="112" cy="98" rx="9" ry="4.5"/></g>
   <path class="tac-back-nose" d="M74 91q6-4 12 0c2 3-2 7-6 8-4-1-8-5-6-8Z" fill="#283b38"/><path class="tac-back-mouth" d="M80 99v4m-9 0q4 8 9 0 5 8 9 0" fill="none" stroke="#283b38" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M51 137q29 12 58 0" fill="none" stroke="#71855d" stroke-width="2" stroke-linecap="round"/>
  </svg><b>熊猫画卡</b>${label?`<span class="tac-back-number">${E(label)}</span>`:''}</div>`;}

 /* ---- owned cards --------------------------------------------------------------------------------- */
 const owned=()=>{const s=window.FoamTownProgress?.get?.();return new Set((s?.inventory||[]).filter(i=>typeof i==='string'&&i.startsWith('art:')).map(i=>i.slice(4)));};

 /* ---- overlays are modal dialogs, so they sit above building interiors and the game ignores keys ---- */
 let host=null;
 function open(cls,html,label,parent=null){if(!parent)close(true);const d=document.createElement('dialog');d.className='tac-dialog '+cls;d.setAttribute('aria-label',label);d.innerHTML=html;d.cardParent=parent;(document.querySelector('#town-app')||document.body).append(d);
  d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-tac-close]'))close();});
  d.addEventListener('cancel',e=>{e.preventDefault();close();});
  host=d;d.showModal();d.querySelector('[data-tac-focus]')?.focus({preventScroll:true});return d;}
 function close(quiet){if(!host)return;const d=host,parent=d.cardParent;host=parent?.external?null:parent?.dialog||null;if(d.open)d.close();d.remove();
  if(parent){if(quiet&&!parent.external)close(true);else{parent.focus?.focus({preventScroll:true});parent.dialog.scrollTop=parent.scrollTop;}}
  if(!quiet&&!host)setTimeout(drain,60);}
 const isOpen=()=>!!host;

 /* Large view: tap to flip between the picture and its back. */
 function view(cardId,trigger=null){const c=byId[cardId];if(!c)return;const has=owned().has(cardId);
  // Keep the existing album behind the detail dialog, including its filter, scroll and focus.
  const parent=host?.classList.contains('is-album')?{dialog:host,scrollTop:host.scrollTop,focus:document.activeElement}:trigger?.closest('dialog')?{dialog:trigger.closest('dialog'),scrollTop:trigger.closest('dialog').scrollTop,focus:trigger,external:true}:null;
  open('is-view',`<button type="button" class="tac-x" data-tac-close aria-label="关闭">×</button><div class="tac-flip" data-tac-focus tabindex="0" role="button" aria-label="翻面"><div class="tac-face">${front(cardId,{live:true})}</div><div class="tac-face tac-face-back">${back()}<dl><dt>编号</dt><dd>No.${String(c.no).padStart(2,'0')} / ${CARDS.length}</dd><dt>稀有度</dt><dd>${RARITY[c.rarity].name}</dd><dt>来源</dt><dd>竹林盲盒、湖边钓鱼、完成全部日任务</dd><dt>状态</dt><dd>${has?'已收集':'未收集'}</dd>${has?'<dt>获得时间</dt><dd>'+(window.FoamCollectionTime?.(window.FoamTownProgress?.get()?.obtained_at?.['art:'+cardId])||'')+'</dd>':''}</dl></div></div><p class="tac-hint">点击卡片翻面 · Esc 关闭</p>`,c.title+'画卡',parent);
  const d=host,f=d.querySelector('.tac-flip');let flips=0;const flip=()=>{const back=f.classList.toggle('is-flipped');flips++;window.dispatchEvent(new CustomEvent('foamlab:art-flip',{detail:{id:cardId,back,flips,element:f}}));};f.onclick=flip;f.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip();}};
  const cardBack=d.querySelector('.tac-face-back .tac-back');cardBack.removeAttribute('aria-hidden');cardBack.append(d.querySelector('.tac-face-back dl'));
  d.querySelectorAll('.tac-pose').forEach(p=>p.dataset.quiet='false');
 }

 /* Album: every card, locked ones face down. */
 function mountAlbum(target){const have=owned();let filter='all';
  const draw=()=>{const list=CARDS.filter(c=>filter==='all'||c.series===filter||c.rarity===filter);target.querySelector('.tac-grid').innerHTML=list.map(c=>have.has(c.id)?`<button type="button" class="tac-slot" data-tac-card="${c.id}" aria-label="${E(c.title)}，查看大图">${front(c.id)}</button>`:`<div class="tac-slot is-locked" aria-label="未收集画卡 No.${byId[c.id].no}">${back('No.'+String(byId[c.id].no).padStart(2,'0'))}<span class="tac-lock-r is-${c.rarity}">${RARITY[c.rarity].name}</span></div>`).join('');};
  target.innerHTML=`<div class="tac-meter"><i style="width:${(have.size/CARDS.length*100).toFixed(1)}%"></i></div><div class="tac-tabs" role="tablist">${SERIES.map(([k,l])=>`<button type="button" role="tab" data-tac-filter="${k}" aria-selected="${k==='all'}">${l}</button>`).join('')}</div><p class="tac-note">开竹林盲盒、在湖边钓鱼、完成全部日任务，都有机会得到画卡。重复的画卡不会占位置。</p><div class="tac-grid"></div>`;
  draw();target.querySelectorAll('[data-tac-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.tacFilter;target.querySelectorAll('[data-tac-filter]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));draw();});
  target.querySelector('.tac-grid').onclick=e=>{const b=e.target.closest('[data-tac-card]');if(b)view(b.dataset.tacCard,b);};
 }
 function album(){const have=owned();const counts=Object.keys(RARITY).map(r=>[r,CARDS.filter(c=>c.rarity===r).length,CARDS.filter(c=>c.rarity===r&&have.has(c.id)).length]);
  const d=open('is-album',`<header class="tac-head"><div><h2>熊猫画卡册</h2><p>${have.size} / ${CARDS.length} 张 · ${counts.map(([r,t,h])=>`${RARITY[r].name} ${h}/${t}`).join(' · ')}</p></div><button type="button" class="tac-x" data-tac-close aria-label="关闭画卡册">×</button></header><div data-art-collection></div>`,'熊猫画卡册');mountAlbum(d.querySelector('[data-art-collection]'));}

 /* Reveal: card back spins in and flips to the picture. Several rewards queue up. */
 const queue=[];
 function reveal(cardId,{fresh=true,source=''}={}){if(!byId[cardId])return;queue.push({cardId,fresh,source});drain();}
 function drain(){if(host||!queue.length)return;const {cardId,fresh,source}=queue.shift();const c=byId[cardId];
  open('is-reveal is-'+c.rarity,`<div class="tac-reveal-head"><small>${E(source||'获得画卡')}</small><h2>${fresh?'新的熊猫画卡！':'又遇到了这张画卡'}</h2></div><div class="tac-flip is-dealing" data-tac-focus tabindex="0" role="button" aria-label="翻开画卡"><div class="tac-face">${front(cardId,{live:true,fresh})}</div><div class="tac-face tac-face-back">${back()}</div></div><div class="tac-rays" aria-hidden="true"></div><div class="tac-actions"><button type="button" class="tac-primary" data-tac-close>收下</button><button type="button" data-tac-album>打开画卡册</button></div>`,'获得画卡：'+c.title);
  const f=host.querySelector('.tac-flip');f.classList.add('is-flipped');setTimeout(()=>{f.classList.remove('is-flipped');host?.classList.add('is-open');},reduce()?0:700);
  host.querySelectorAll('.tac-pose').forEach(p=>p.dataset.quiet='false');
  host.querySelector('[data-tac-album]').onclick=()=>{close(true);album();};}
 const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

 // FoamPandaCards: FoamTownCards is the knowledge cards (knowledge-cards.js), FoamTownArt the town art (town-art.js).
 window.FoamPandaCards={constellation:K.constellation,cards:CARDS,get:id=>byId[id],illustration:id=>byId[id]?art(byId[id]):'',front,back,view,album,mountAlbum,reveal,owned,isOpen,close,total:CARDS.length};
})();
