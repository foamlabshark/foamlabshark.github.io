/* Panda Town actions and emotes.
 * Every action from the collection plays in town: while it runs, the walking sprite is swapped for a
 * jointed copy of the same panda (see town-actions.css) with the props and effects drawn here.
 * Emotes appear in a small bubble above the name tag, so the panda is never covered. */
'use strict';
(() => {
 const motion=window.foamPandaMotion;if(!motion||motion.__town)return;motion.__town=true;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const O='#2a2d38';
 const SHOULDER={l:[47,102],r:[113,102]};
 const svg=(body,cls='')=>body?`<svg viewBox="0 0 160 160" class="${cls}" aria-hidden="true" focusable="false">${body}</svg>`:'';
 const at=(x,y,cls,body)=>`<g transform="translate(${x} ${y})"><g class="${cls}">${body}</g></g>`;
 const star=(r,fill)=>{let p='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,k=i%2?r*.45:r;p+=(i?'L':'M')+(Math.cos(a)*k).toFixed(1)+' '+(Math.sin(a)*k).toFixed(1);}return `<path d="${p}Z" fill="${fill}" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>`;};
 const note=fill=>`<path d="M4.5 0V-14L14.5-17V-3" fill="none" stroke="${O}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="1.5" cy="0" rx="4.6" ry="3.5" fill="${fill}" stroke="${O}" stroke-width="2" transform="rotate(-20 1.5 0)"/><ellipse cx="11.5" cy="-3" rx="4.6" ry="3.5" fill="${fill}" stroke="${O}" stroke-width="2" transform="rotate(-20 11.5 -3)"/>`;
 const heart=fill=>`<path d="M0 6C-10-1-8-10 0-5C8-10 10-1 0 6Z" fill="${fill}" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>`;
 const zed=s=>`<g transform="scale(${s})"><path d="M-5-6H5L-5 6H5" fill="none" stroke="${O}" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M-5-6H5L-5 6H5" fill="none" stroke="#d9e8ff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
 const puff=`<circle cx="-4" cy="0" r="4" fill="#efe6cf" stroke="#b9ab86" stroke-width="1.4"/><circle cx="3" cy="-2" r="5" fill="#f6efdc" stroke="#b9ab86" stroke-width="1.4"/><circle cx="8" cy="1" r="3" fill="#efe6cf" stroke="#b9ab86" stroke-width="1.4"/>`;
 const bubble=r=>`<circle r="${r}" fill="#dff5ff" fill-opacity=".45" stroke="#8fcfe8" stroke-width="1.6"/><path d="M${-r*.55} ${-r*.1}a${r*.6} ${r*.6} 0 0 1 ${r*.45}-${r*.45}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;
 const burst=(fill)=>{let s='';for(let i=0;i<12;i++){const a=i*Math.PI/6,c=Math.cos(a),n=Math.sin(a);s+=`<path d="M${(c*5).toFixed(1)} ${(n*5).toFixed(1)}L${(c*15).toFixed(1)} ${(n*15).toFixed(1)}" stroke="${fill}" stroke-width="2.6" stroke-linecap="round"/><circle cx="${(c*19).toFixed(1)}" cy="${(n*19).toFixed(1)}" r="1.8" fill="${fill}"/>`;}return s+`<circle r="3" fill="#fffbe8"/>`;};
 const flash=`<path d="M0-12L3-3 12 0 3 3 0 12-3 3-12 0-3-3Z" fill="#fffbe0" stroke="#f2c14e" stroke-width="1.6" stroke-linejoin="round"/>`;
 // Held props are drawn where the paw is at the arm's resting angle, then counter-rotated into the arm,
 // so they follow every swing of that arm.
 const held=(side,angle,body)=>{const [x,y]=SHOULDER[side];return {side,html:svg(`<g transform="rotate(${-angle} ${x} ${y})">${body}</g>`)};};
 const notes=(fill,left=true)=>at(112,46,'tp-rise',note(fill))+at(120,60,'tp-rise d1',note('#ffd166'))+(left?at(38,52,'tp-rise left d2',note(fill)):'');

 const ACTIONS={
  wave:{fx:`<g class="tp-lines"><path d="M141 78q6 6 2 13M147 72q8 9 3 20" fill="none" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/></g>`},
  sleep:{fx:at(112,48,'tp-rise',zed(.7))+at(120,40,'tp-rise d1',zed(.95))+at(128,30,'tp-rise d2',zed(1.2))},
  jump:{fx:at(62,156,'tp-dust',puff)+at(98,156,'tp-dust',puff)},
  cheer:{fx:at(24,44,'tp-pop',star(7,'#ffd166'))+at(138,40,'tp-pop d1',star(6,'#ff9fb5'))+at(150,8,'tp-pop d2',star(8,'#ffe58a'))},
  roll:{fx:at(52,156,'tp-dust slow',puff)+at(108,156,'tp-dust slow d1',puff)},
  dance:{fx:notes('#7fd1c3')+at(64,157,'tp-dust',puff)},
  duet:{fx:notes('#ff9fb5')+at(80,0,'tp-pop d1',heart('#ff7a96'))},
  crawl:{fx:at(46,152,'tp-dust slow',puff)+at(114,152,'tp-dust slow d1',puff)},
  sing:{fx:notes('#7fd1c3')},
  sway:{fx:at(118,50,'tp-rise',note('#b8a6f0'))+at(36,56,'tp-rise left d1',note('#7fd1c3'))},
  spin:{fx:`<path class="tp-swirl" d="M14 66q-12 24 6 46" fill="none" stroke="#8a97a6" stroke-width="2.6" stroke-linecap="round"/><path class="tp-swirl d1" d="M146 66q12 24-6 46" fill="none" stroke="#8a97a6" stroke-width="2.6" stroke-linecap="round"/>`},
  stretch:{fx:at(24,70,'tp-pop',star(5,'#ffe58a'))+at(136,70,'tp-pop d1',star(5,'#ffe58a'))},
  munch:{hold:held('r',119,`<g class="tp-bamboo"><path d="M74 80L122 93" stroke="#2f4a2a" stroke-width="11" stroke-linecap="round"/><path d="M74 80L122 93" stroke="#9ccc72" stroke-width="6.4" stroke-linecap="round"/><path d="M90 81.5l-2.6 8.8M106 86l-2.6 8.8" stroke="#5f8f45" stroke-width="2"/><path d="M119 91q8-14 18-10q-6 10-18 10Z" fill="#7fb85a" stroke="#2f4a2a" stroke-width="2" stroke-linejoin="round"/></g>`),
   fx:at(76,90,'tp-crumb','<rect x="-2" y="-2" width="4" height="4" fill="#8cc06b"/>')+at(82,90,'tp-crumb d1','<rect x="-1.5" y="-1.5" width="3" height="3" fill="#b9df8f"/>')},
  read:{props:`<path d="M52 110L80 115 108 110V135L80 140 52 135Z" fill="#4f8f8a" stroke="${O}" stroke-width="2.6" stroke-linejoin="round"/><path d="M56 111L80 115.5V136L56 132Z" fill="#fffaf0" stroke="#c9bfa8" stroke-width="1.4"/><path d="M104 111L80 115.5V136L104 132Z" fill="#fffaf0" stroke="#c9bfa8" stroke-width="1.4"/><path d="M60 118l15 3M60 123l15 3M85 121l15-3M85 126l15-3" stroke="#b9ae96" stroke-width="1.4"/><path class="tp-page" d="M104 111L80 115.5V136L104 132Z" fill="#fff4dd" stroke="#c9bfa8" stroke-width="1.4"/>`},
  water:{hold:held('r',-60,`<g transform="rotate(12 134 114)"><path d="M152 110L168 101" stroke="${O}" stroke-width="6" stroke-linecap="round"/><path d="M152 110L168 101" stroke="#6aa6de" stroke-width="2.8" stroke-linecap="round"/><circle cx="169.5" cy="100" r="3.6" fill="#a9cdee" stroke="${O}" stroke-width="2"/><rect x="131" y="104" width="23" height="19" rx="5" fill="#6aa6de" stroke="${O}" stroke-width="2.6"/><path d="M135 105q7-11 15 0" fill="none" stroke="${O}" stroke-width="2.6" stroke-linecap="round"/><path d="M135 110h15" stroke="#a9cdee" stroke-width="2" stroke-linecap="round"/></g>`),
   fx:'<g class="tp-pouring">'+at(171,112,'tp-drop','<path d="M0-3q3 4 0 6q-3-2 0-6Z" fill="#8fc8f2" stroke="#4f8fc7" stroke-width="1"/>')+at(175,110,'tp-drop d1','<path d="M0-3q3 4 0 6q-3-2 0-6Z" fill="#8fc8f2" stroke="#4f8fc7" stroke-width="1"/>')+at(168,114,'tp-drop d2','<path d="M0-3q3 4 0 6q-3-2 0-6Z" fill="#8fc8f2" stroke="#4f8fc7" stroke-width="1"/>')+'</g>'+`<g class="tp-sprout"><path d="M174 157v-10" stroke="#4d7f3a" stroke-width="2.4" stroke-linecap="round"/><path d="M174 149q-9-6-10 2q6 3 10-2ZM174 147q8-8 11 0q-6 4-11 0Z" fill="#8cc06b" stroke="#3f6b30" stroke-width="1.6" stroke-linejoin="round"/></g>`},
  fish:{hold:held('r',-36,`<path d="M124 126L192 26" stroke="${O}" stroke-width="5.6" stroke-linecap="round"/><path d="M124 126L192 26" stroke="#9a6a3a" stroke-width="3" stroke-linecap="round"/><path d="M192 26Q201 80 204 138" fill="none" stroke="#f3eee0" stroke-width="1.3"/><g class="tp-bob"><circle cx="204" cy="141" r="4.6" fill="#fff" stroke="${O}" stroke-width="2"/><path d="M199.4 141a4.6 4.6 0 0 0 9.2 0Z" fill="#e5533d"/></g>`),
   fx:at(204,148,'tp-ripple','<ellipse rx="11" ry="3.2" fill="none" stroke="#d6eef8" stroke-width="1.6"/>')+at(204,148,'tp-ripple d1','<ellipse rx="11" ry="3.2" fill="none" stroke="#d6eef8" stroke-width="1.6"/>')},
  meditate:{back:`<ellipse class="tp-glow" cx="80" cy="92" rx="66" ry="66" fill="#fff1b8" fill-opacity=".5" style="filter:blur(6px)"/>`,
   fx:`<g class="tp-orbit">${at(150,92,'',star(4.5,'#ffe58a'))}${at(28,140,'',star(4,'#cfe9ff'))}${at(36,30,'',star(3.5,'#ffd1dc'))}</g>`},
  experiment:{hold:held('r',-94,`<path d="M139 96L130 114Q129 119 134 119H156Q161 119 160 114L151 96Z" fill="#f3fbff" fill-opacity=".85" stroke="${O}" stroke-width="2.6" stroke-linejoin="round"/><path class="tp-liquid" d="M134.3 107H155.7L159.3 114Q160 117.5 156 117.5H134Q130 117.5 130.7 114Z" fill="#7ad3c4"/><rect x="140" y="82" width="10" height="15" fill="#f3fbff" stroke="${O}" stroke-width="2.4"/><rect x="138" y="79" width="14" height="5" rx="2" fill="#dfe8ee" stroke="${O}" stroke-width="2.2"/><path d="M135 112h6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`),
   fx:at(146,76,'tp-bubble up',bubble(3))+at(143,78,'tp-bubble up d1',bubble(2.4))+at(148,77,'tp-bubble up d2',bubble(2))},
  typing:{fx:`<rect x="48" y="118" width="64" height="32" rx="4" fill="#c7ced8" stroke="${O}" stroke-width="2.6"/><rect x="52" y="122" width="56" height="24" rx="2" fill="#d9dee6"/><circle cx="80" cy="134" r="4.2" fill="#8cc06b" stroke="#557f3f" stroke-width="1.4"/><path d="M52 117.5h56" stroke="#bfe9ff" stroke-width="2" stroke-linecap="round"/>`+at(62,110,'tp-code','<text font-family="ui-monospace,Consolas,monospace" font-size="11" font-weight="700" fill="#4f6d8a" text-anchor="middle">{ }</text>')+at(100,108,'tp-code d1','<text font-family="ui-monospace,Consolas,monospace" font-size="11" font-weight="700" fill="#4f8f8a" text-anchor="middle">;</text>')},
  kite:{hold:held('r',-127,`<path d="M132 87Q166 44 196 -18" fill="none" stroke="#f3eee0" stroke-width="1.4"/><g><path d="M196-62L213-40 196-18 179-40Z" fill="#ffd166" stroke="${O}" stroke-width="2.6" stroke-linejoin="round"/><path d="M196-62L179-40 196-18Z" fill="#ef6f6c"/><path d="M196-62V-18M179-40H213" stroke="${O}" stroke-width="1.8"/><path d="M196-62L213-40 196-18 179-40Z" fill="none" stroke="${O}" stroke-width="2.6" stroke-linejoin="round"/><g class="tp-tail"><path d="M196-18q-7 10 1 18q8 9 0 18" fill="none" stroke="${O}" stroke-width="1.6"/><path d="M193-6l7-2-2 7ZM194 12l7-1-3 6Z" fill="#7fd1c3" stroke="${O}" stroke-width="1.2"/></g></g>`)},
  bubbles:{hold:held('r',-98,`<path d="M136 100L151 82" stroke="#c78b4a" stroke-width="3.2" stroke-linecap="round"/><circle cx="154.5" cy="77.5" r="6" fill="none" stroke="#ff8fb1" stroke-width="3"/>`),
   fx:at(160,72,'tp-bubble',bubble(6))+at(158,74,'tp-bubble d1',bubble(4.5))+at(161,71,'tp-bubble d2',bubble(7.5))+at(157,75,'tp-bubble d3',bubble(5))},
  photo:{props:`<rect x="66" y="71" width="14" height="9" rx="2" fill="#3b3f4a" stroke="${O}" stroke-width="2.2"/><rect x="57" y="77" width="46" height="27" rx="5" fill="#454a57" stroke="${O}" stroke-width="2.6"/><rect x="90" y="80" width="9" height="4" rx="1" fill="#fff3b0"/><circle cx="80" cy="91" r="9.5" fill="#7f97c4" stroke="#1e2129" stroke-width="2.6"/><circle cx="80" cy="91" r="4.2" fill="#2c3550"/><circle cx="77" cy="88" r="1.8" fill="#fff"/>`,
   fx:at(95,74,'tp-flash',flash)},
  selfie:{hold:held('r',-146,`<g transform="rotate(-14 130 70)"><rect x="122.5" y="57" width="15" height="25" rx="3" fill="#39404e" stroke="${O}" stroke-width="2.4"/><rect x="125" y="60" width="10" height="17" rx="1.5" fill="#9fd0e8"/></g>`),
   fx:at(128,54,'tp-flash',flash)},
  taichi:{fx:`<g transform="translate(144 34)"><g class="tp-yinyang"><circle r="9" fill="#fffdf6" stroke="${O}" stroke-width="2"/><path d="M0-9A9 9 0 0 1 0 9A4.5 4.5 0 0 1 0 0A4.5 4.5 0 0 0 0-9Z" fill="${O}"/><circle cy="-4.5" r="1.6" fill="${O}"/><circle cy="4.5" r="1.6" fill="#fffdf6"/></g></g><path class="tp-swirl" d="M22 104q-16-22 6-46" fill="none" stroke="#9ad1c4" stroke-width="3" stroke-linecap="round"/><path class="tp-swirl d1" d="M138 58q16 22-6 46" fill="none" stroke="#9ad1c4" stroke-width="3" stroke-linecap="round"/>`},
  streamline:{fx:['M-40 34C0 34 30 0 80 0S160 34 200 34#5b8def','M138 102C160 92 182 92 212 100#3b9fd8','M138 107C162 107 186 111 214 115#22b3a6','M138 112C158 126 184 132 210 136#f2a541','M-40 172C0 172 30 166 80 166S160 172 200 172#5b8def'].map((d,i)=>{const [path,color]=d.split('#');return `<path class="tp-flow d${i%3}" d="${path}" fill="none" stroke="#${color}" stroke-width="2.6" stroke-linecap="round"/>`;}).join('')},
  firework:{fx:at(30,82,'tp-rocket',`<path d="M0 0v10" stroke="#ffd166" stroke-width="2.4" stroke-linecap="round"/><circle r="2.4" fill="#fff3c4"/>`)+at(-35,-85,'tp-burst',`<g transform="scale(5)">${burst('#ffe08a')}</g>`)+at(195,-130,'tp-burst d1',`<g transform="scale(5.5)">${burst('#ff8aad')}</g>`)+at(80,-210,'tp-burst d2',`<g transform="scale(6)">${burst('#92ffe7')}</g>`)},
  highfive:{fx:at(130,70,'tp-spark',star(8,'#ffe58a'))},
  hug:{fx:at(58,38,'tp-rise left',heart('#ff7a96'))+at(104,30,'tp-rise d1',heart('#ff9fb5'))+at(82,20,'tp-rise d2',heart('#ff7a96'))}
 };

 function rig(el){let pose=el.querySelector(':scope .town-pose');if(pose)return pose;const body=el.querySelector('.town-body');if(!body)return null;
  pose=document.createElement('i');pose.className='town-pose';pose.setAttribute('aria-hidden','true');
  pose.innerHTML='<i class="tp-root"><i class="tp-back"></i><i class="tp-look tp-look-under"></i><i class="tp-front"><i class="tp tp-leg-l"></i><i class="tp tp-leg-r"></i><i class="tp tp-torso"></i><i class="tp-look tp-look-body"></i><i class="tp tp-head"><i class="tp tp-face"></i><i class="tp-look tp-look-head"></i></i><i class="tp-props"></i><i class="tp-arm tp-arm-l"><i class="tp-held"></i><i class="tp tp-limb"></i></i><i class="tp-arm tp-arm-r"><i class="tp-held"></i><i class="tp tp-limb"></i></i></i><i class="tp-backview"></i><i class="tp-fx"></i></i>';
  const sprite=body.querySelector('.town-pixel-panda');if(sprite)sprite.after(pose);else body.prepend(pose);return pose;}
 // The resident's outfit, form and ride on the jointed panda: head pieces turn with the head.
 function wear(el,pose){const look=window.FoamTownLook?.({form:el.dataset.form,outfit:el.dataset.outfit,ride:el.dataset.ride});const set=(cls,cells)=>{const n=pose.querySelector(cls);const parts=(look?.pose||[]).flatMap(p=>cells(p).map(x=>[p.src,x]));n.style.backgroundImage=parts.map(([src])=>`url(${src})`).join(',');n.style.backgroundPosition=parts.map(([,x])=>x+'% 0').join(',');};
  set('.tp-look-head',p=>p.hat?[0,100]:[0]);set('.tp-look-body',()=>[33.3333]);set('.tp-look-under',()=>[66.6667]);}
 function dress(el,action){const pose=rig(el);if(!pose)return;const a=ACTIONS[action]||{};wear(el,pose);
  pose.querySelector('.tp-back').innerHTML=svg(a.back);pose.querySelector('.tp-props').innerHTML=svg(a.props);pose.querySelector('.tp-fx').innerHTML=svg(a.fx);
  for(const side of ['l','r'])pose.querySelector(`.tp-arm-${side} .tp-held`).innerHTML=a.hold?.side===side?a.hold.html:'';}

 // Town residents get the jointed pose; everything else (the pet on other pages) is unchanged.
 const base=motion.play,stopBase=motion.stop,still=new WeakMap();
 function clearStill(el){clearTimeout(still.get(el));still.delete(el);delete el.dataset.still;}
 motion.play=function(el,action='wave',options={}){
  if(!el?.classList?.contains('town-resident')||action==='walk')return base.call(this,el,action,options);
  const duration=motion.durations[action];if(!duration)return 0;
  // The same action arriving twice (your own echo from the street) keeps playing instead of restarting.
  if(el.dataset.action===action&&performance.now()-Number(el.dataset.actionStarted||0)<1200)return duration;
  clearStill(el);dress(el,action);
  const played=base.call(this,el,action,options);if(played)return played;
  if(el.dataset.quiet==='true'||!reduce.matches)return 0;
  // Reduced motion: hold the pose for a moment without movement.
  el.dataset.action=action;el.dataset.actionStarted=String(performance.now());el.dataset.still='true';
  still.set(el,setTimeout(()=>{if(el.dataset.action===action){delete el.dataset.action;delete el.dataset.actionStarted;}clearStill(el);},Math.min(duration,3000)));
  return duration;
 };
 motion.stop=function(el){if(el)clearStill(el);return stopBase.call(this,el);};

 const EMOTES={smile:'😊',heart:'💗',thumb:'👍',question:'❓',exclaim:'❗',idea:'💡',bamboo:'🎋',zzz:'Zzz',starry:'🤩',sweat:'💦',confetti:'🎉',fire:'🔥'};
 function emote(el,id){if(!el)return null;const old=el.querySelector(':scope > .town-emote');
  // Your own emote echoed back by the street within a moment is the same bubble, not a new one.
  if(old&&old.dataset.emote===id&&performance.now()-Number(old.dataset.shown)<1500)return old;old?.remove();
  const em=document.createElement('b');em.className='town-emote';em.setAttribute('aria-hidden','true');em.dataset.emote=id;em.dataset.shown=String(performance.now());
  const glyph=window.FoamTownGlyph?.(id,'emote');if(glyph){em.innerHTML=glyph;em.classList.add('is-glyph');}else{const icon=EMOTES[id]||'✦';em.textContent=icon;if(/^[A-Za-z]+$/.test(icon))em.classList.add('is-text');}el.append(em);setTimeout(()=>em.remove(),2800);return em;}

 window.FoamTownActions={emote,emotes:EMOTES,actions:Object.keys(ACTIONS),rig,dress};
})();
