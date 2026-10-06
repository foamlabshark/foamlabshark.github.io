'use strict';
(() => {
 const parts=window.foamTownPandaParts;if(!parts)return;
 const path=(d,c='#d8bd82')=>`<path d="${d}" fill="${c}" stroke="#736445" stroke-width="2" stroke-linejoin="round"/>`;
 const shapes={
 'egg-old-boots':path('M46 151h26v19H40v-9h6Zm43 0h26v10h7v9H89Z','#a28660')+'<path d="M47 157h21m25 0h18" stroke="#dfc48e" stroke-width="3"/>',
 'egg-mini-hat':path('M67 24V6q14-7 28 0v18Z','#778c75')+path('M58 22q23-7 47 0v6H58Z')+'<path d="M68 15h26" stroke="#e4c98f" stroke-width="5"/>',
 'egg-waterweed':'<g stroke="#7f9e67" stroke-width="4" fill="none"><path d="M54 41q-10-16-1-25M67 35q14-19 0-30M90 37q-14-17 2-29M106 43q17-17 9-30"/></g>',
 'egg-grid-ruler':path('m116 112 11 5-18 44-11-5Z')+'<path d="m112 126 7 3m-11 7 6 3m-10 7 7 3" stroke="#8c7449" stroke-width="2"/>',
 'egg-release-shirt':path('M52 110h56l7 39H45Z','#89aa98')+'<circle cx="81" cy="127" r="11" fill="#f5e7bf"/><path d="m75 124 5 4-5 4m9 0h5" fill="none" stroke="#5e806d" stroke-width="2"/>',
 'egg-plaid-shirt':path('M52 110h56l7 39H45Z','#c8b995')+'<path d="M60 110v39m15-39v39m15-39v39m15-39v39M49 120h63m-65 13h66m-68 13h70" stroke="#7b9a85" stroke-width="3"/>',
 'egg-little-flower':'<g transform="translate(60 121)" fill="#dd9790" stroke="#bb807d" stroke-width="1"><circle cx="0" cy="-4" r="4"/><circle cx="4" cy="0" r="4"/><circle cx="0" cy="4" r="4"/><circle cx="-4" cy="0" r="4"/><circle r="3" fill="#f0d38c"/></g>',
 'egg-gold-leaf':path('M58 112q19 0 9 20-15-1-9-20Z','#dfbb66')+'<path d="m61 116 3 12" stroke="#a58a48" stroke-width="1.5"/>',
 'egg-travel-pack':path('M34 121q-8 17 0 36h17v-36Zm83 0h13q12 21 0 36h-13Z','#a88c61')+'<path d="M52 109v45m55-45v45" stroke="#bc9e6f" stroke-width="6"/>',
 'egg-medical-card':path('m110 126 32-4 4 40-32 4Z','#f3e7c0')+'<path d="m119 136 13-2m-6-5 2 12m-9 8 19-2" stroke="#9ca578" stroke-width="2"/>',
 'egg-moonfish':'<g transform="translate(99 150) scale(.5)"><ellipse cx="30" cy="20" rx="23" ry="14" fill="#afd6d4" stroke="#6f9796" stroke-width="2"/><path d="m50 20 17-13v26Z" fill="#b7cde1"/><circle cx="19" cy="17" r="2" fill="#395957"/></g>',
 'egg-vortex-spirit':'<g class="egg-spirit-art" stroke="#73b0ae" stroke-width="2" fill="#c7e6d588"><path d="M137 165c-30 0-30-35-7-35 22 0 23 27 5 27-12 0-12-17-2-17 6 0 6 8 1 8"/><circle cx="128" cy="137" r="1" fill="#345a58"/><circle cx="136" cy="137" r="1" fill="#345a58"/></g>'
 };
 let body='',head='';const styles=[];
 for(const [id,shape]of Object.entries(shapes)){const cat=['egg-medical-card','egg-moonfish','egg-vortex-spirit'].includes(id)?'decoration':'outfit',markup=`<g class="pa-egg-part pa-${id}">${shape}</g>`;if(['egg-mini-hat','egg-waterweed'].includes(id))head+=markup;else body+=markup;styles.push(`[data-${cat}="${id}"] .pa-${id}{display:block}`);}
 parts.body+=body;parts.head+=head;
 const style=document.createElement('style');style.textContent='.pa-egg-part{display:none}'+styles.join('');document.head.append(style);
 const scenes={C02:'kite-hill',C07:'karman-street',N08:'lab-flask',C08:'photo-walk',P03:'cavity-vortex',T01:'mesh-workshop',T05:'mesh-workshop',T27:'residual-night',Q01:'rainy-reading',W01:'kite-hill',D01:'bamboo-breakfast',D05:'lab-flask',D11:'town-portrait',F03:'taichi-morning',P07:'lake-fishing',L05:'ns-scroll',Q03:'spring-blossom','milestone40':'starry-observatory','all-town':'town-portrait','all-panda':'bubble-garden'};
 const props={C02:'hat',N08:'bottle',C08:'bottle',T05:'ruler',W01:'boat',D01:'pie',D05:'bottle',P07:'boat'};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 window.FoamEggIllustration=row=>{const scene=row.illustration?.scene||scenes[row.id]||'town-portrait',motif=row.illustration?.motif||props[row.id],F=window.FoamTownEggEvents;return (window.FoamPandaCards?.illustration(scene)||window.foamPandaArt?.()||'')+(motif&&F?.motifs[motif]?'<div class="egg-secret-symbol">'+F.svg(F.motifs[motif])+'</div>':'');};
 window.FoamEggSecret=row=>`<article class="egg-secret-keepsake"><div class="egg-secret-picture" aria-hidden="true">${window.FoamEggIllustration(row)}</div><small>小镇秘密画卡</small><h3>${esc(row.card)}</h3><p>${esc(row.description||row.effect||'献给每一位愿意停下脚步，发现小镇故事的熊猫。')}</p>${window.FoamCollectionTime?.(window.FoamTownEggs?.meta?.inventory?.['secret:'+row.id.toLowerCase()]||window.FoamTownEggs?.found.get(row.id))||''}</article>`;
})();
