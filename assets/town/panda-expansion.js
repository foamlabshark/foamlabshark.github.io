'use strict';
(() => {
 const part=(category,id,body,cls='')=>`<g class="pa-town-part pa-town-${id} ${cls}" data-collection="${category}" data-item="${id}">${body}</g>`;
 const path=(d,fill='#6c9c91',stroke='#435e56')=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>`;
 const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
 const body=[
 part('form','sailor',path('M50 108h60l7 40H43z','#f1efe1')+path('M50 113h60m-63 10h66m-68 10h70','none','#688ca1')),
 part('form','pilot',path('M48 109q32-13 64 0l6 42H42z','#be9571')+path('M80 109v43m-17-35h13m9 0h12','none','#795c45')),
 part('form','polar',path('M44 107q36-18 72 0l6 48H38z','#a4c3d5')+path('M51 116h58m-61 14h65m-64 13h64M80 106v47','none','#6f94a9')),
 part('outfit','overalls',path('M53 110v-8h9v17h35v-17h9v8l7 43H46z','#74999b')+'<rect x="69" y="127" width="22" height="15" rx="3" fill="#a7c0b4"/>'+path('M83 131v-14m-4 2 4-5 4 5','none','#697a70')),
 part('outfit','bowtie',path('M79 114l-14-8v18l14-8 15 8v-18z','#b9786a')),
 part('outfit','stethoscope',path('M62 105v17q18 20 36 0v-17M80 137v8','none','#657782')+circle(80,147,6,'#b5c2c3')),
 part('outfit','badge-card','<path d="M66 105l14 23 14-23" stroke="#799d8c" stroke-width="3" fill="none"/><rect x="71" y="124" width="20" height="24" rx="4" fill="#f6e6bd" stroke="#798f80" stroke-width="2"/><path d="M75 139h12m-12 5h9" stroke="#799d8c" stroke-width="2"/>'),
 part('outfit','zongzi',path('M112 130l12 19-22-1z','#8cad78')+path('M105 141l15-5m-9-7 4 18','none','#dbe3ba')),
 ].join('');
 const head=[
 part('form','sailor',path('M51 32l9-18h40l9 18z','#f5f2df')+'<rect x="51" y="30" width="58" height="9" rx="4" fill="#7a9eb2"/>','pa-town-form-hat'),
 part('form','pilot',path('M41 45q4-35 39-35t39 35l-12-8q-27-14-54 0z','#af855d')+'<g fill="#bed9d9" stroke="#625b4d" stroke-width="3"><ellipse cx="66" cy="29" rx="13" ry="9"/><ellipse cx="94" cy="29" rx="13" ry="9"/></g>','pa-town-form-hat'),
 part('form','polar',path('M34 50q2-36 46-38t46 38l-10-9q-36-23-72 0z','#bdd4df')+'<path d="M36 44q44-40 88 0" stroke="#faf5e4" stroke-width="12" fill="none" stroke-linecap="round"/>','pa-town-form-hat'),
 part('outfit','beanie',path('M45 37q3-30 35-30t35 30z','#c99880')+'<rect x="44" y="32" width="72" height="10" rx="5" fill="#e7c3a1"/>'+circle(80,7,8,'#edc8a3'),'pa-town-outfit-hat'),
 part('outfit','sunglasses','<g fill="#405957" stroke="#aeba99" stroke-width="3"><circle cx="61" cy="68" r="13"/><circle cx="99" cy="68" r="13"/><path d="M74 66h12"/></g>'),
 ].join('');
 const props=[
 part('outfit','palette','<ellipse cx="121" cy="124" rx="16" ry="11" fill="#cdb48a" transform="rotate(-20 121 124)"/>'+circle(115,120,3,'#c88670')+circle(124,119,3,'#7b9eab')+circle(129,127,3,'#87a870')+path('M39 125l-7-30','none','#997b59')),
 part('outfit','scroll','<rect x="116" y="88" width="15" height="55" rx="7" fill="#e6d5ab" stroke="#9a8565" stroke-width="2"/><path d="M116 117h15" stroke="#a4705d" stroke-width="3"/>'),
 part('outfit','basket',path('M116 119l20-10 6 39-27 4z','#b7a174')+'<path d="M120 121l14-8m-14 16 16-8m-16 16 17-8" stroke="#806f51" stroke-width="2"/>'+path('M131 115l3-29m-8 26-4-26','none','#749961')),
 part('outfit','lantern-red','<path d="M122 114v18" stroke="#b28b56" stroke-width="3"/><ellipse cx="122" cy="145" rx="13" ry="16" fill="#c77764"/><path d="M111 138h22m-22 14h22m-11 9v8" stroke="#ead098" stroke-width="3"/>'),
 part('outfit','moon-lamp','<path d="M121 113v24" stroke="#a99870" stroke-width="3"/>'+path('M130 132c-30-4-28 34 0 30-17-5-19-24 0-30z','#efdba0')),
 '<g class="pa-town-prop pa-town-keyboard"><rect x="32" y="140" width="91" height="17" rx="5" fill="#abbeb5" stroke="#52776b" stroke-width="2"/><path d="M42 146h70m-61 6h45" stroke="#f7f6dd" stroke-width="4" stroke-dasharray="5 4"/></g>',
 '<g class="pa-town-prop pa-town-camera"><rect x="59" y="100" width="43" height="28" rx="6" fill="#567b73" stroke="#385c51" stroke-width="2"/>'+circle(81,114,10,'#bad6cf')+circle(81,114,5,'#4e797b')+'</g>',
 '<g class="pa-town-prop pa-town-kite"><path d="M108 126q36-29 16-96" fill="none" stroke="#bb9d75" stroke-width="2"/>'+path('M121-8l23 18-16 25-23-19z','#d4a679')+path('M121-8l7 43m-23-19 39-6','none','#f4e3b5')+'</g>',
 '<g class="pa-town-prop pa-town-bubbles"><path d="M44 123l-7-25" stroke="#8ab7a9" stroke-width="3"/><circle cx="34" cy="91" r="8" fill="none" stroke="#8ab7a9" stroke-width="3"/><g fill="#d9ebe4" fill-opacity=".35" stroke="#86b8bb" stroke-width="2"><circle class="pa-town-bubble" cx="28" cy="72" r="9"/><circle class="pa-town-bubble" cx="40" cy="48" r="6"/><circle class="pa-town-bubble" cx="14" cy="42" r="10"/></g></g>',
 '<g class="pa-town-prop pa-town-stream"><path d="M20 135q24-22 57-1t66-3M16 122q29-20 64-1t61-7M25 146q28-14 51 0t58-4" stroke="#73b1ad" stroke-width="3" fill="none" stroke-linecap="round"/></g>',
 '<g class="pa-town-prop pa-town-firework"><path d="M80 2v-14m-17 7-9-11m44 11 9-11m-60 29h-13m79 0h13m-73 17-9 10m55-10 9 10" stroke="#d9b36c" stroke-width="3" stroke-linecap="round"/></g>',
 ].join('');
 const ride=[
 part('ride','skateboard','<rect x="27" y="166" width="107" height="7" rx="4" fill="#bb9875"/><g fill="#586963"><circle cx="48" cy="176" r="5"/><circle cx="114" cy="176" r="5"/></g>'),
 part('ride','bicycle','<g fill="none" stroke="#678c85" stroke-width="3"><circle cx="31" cy="151" r="23"/><circle cx="133" cy="151" r="23"/><path d="m31 151 32-36 28 36H31m60 0 33-30-5-15h14m-10 13 10 32M63 115l-2-13h-9"/></g>'),
 part('ride','balloon','<path d="M117 123l14-99m-14 99 34-78m-34 78-15-101" fill="none" stroke="#b09f77" stroke-width="1.8"/><ellipse cx="129" cy="8" rx="16" ry="23" fill="#c2a5af"/><ellipse cx="151" cy="29" rx="14" ry="20" fill="#d8bd7d"/><ellipse cx="100" cy="5" rx="14" ry="20" fill="#8fb6a4"/>'),
 ].join('');
 window.foamTownPandaParts={body,head,props,ride};
 const style=document.createElement('style');style.textContent='.pa-town-part,.pa-town-prop{display:none}'+[...new Set([...body.matchAll(/data-collection="(.*?)" data-item="(.*?)"/g),...head.matchAll(/data-collection="(.*?)" data-item="(.*?)"/g),...props.matchAll(/data-collection="(.*?)" data-item="(.*?)"/g),...ride.matchAll(/data-collection="(.*?)" data-item="(.*?)"/g)].map(m=>`[data-${m[1]}="${m[2]}"] .pa-town-${m[2]}{display:block}`))].join('');document.head.append(style);
})();
