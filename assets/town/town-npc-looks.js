'use strict';
/* NPC looks. Each NPC is the town panda dressed for its job: hat, glasses and clothes are drawn per facing
 * direction and follow the head and body of every walking frame. /assets/town/npc/<id>.webp holds only what
 * the NPC adds (stacked over the shared walking sheet, same 4 x 4 layout); <id>-under.webp holds things
 * carried on the back. Drawn by tools/town/build-npc-sprites.py. */
(() => {
 const BASE='/assets/town/panda-walk-v2.webp';
 const IDS=new Set(['mayor','gardener','fisher','postman','merchant','librarian','engineer','tea','researcher']),UNDER=new Set(['fisher','merchant']);
 const layers=id=>IDS.has(id)?[`url(/assets/town/npc/${id}.webp)`,`url(${BASE})`].concat(UNDER.has(id)?[`url(/assets/town/npc/${id}-under.webp)`]:[]).join(','):'';
 window.FoamTownNPCSprite=layers;
 // A front-facing portrait, used in dialogs (the mayor's welcome).
 window.FoamTownNPCLook=id=>IDS.has(id)?`<i class="town-npc-portrait" style="background-image:${layers(id)}" aria-hidden="true"></i>`:'';
})();

/* Residents' outfits, forms and rides as pixel layers over the walking sheet (tools/town/build-look-sprites.py).
 * FoamTownLook(card) gives the stacked background for the walking sprite and the pieces for the jointed
 * action pose. A form's headwear is left out when the outfit has its own. */
(() => {
 const M={"form-astronaut":"oh","form-engineer":"oh","form-explorer":"o","form-master":"o","form-pilot":"oh","form-polar":"oh","form-sailor":"oh","outfit-backpack":"ou","outfit-badge-card":"o","outfit-basket":"o","outfit-beanie":"o","outfit-bowtie":"o","outfit-cap":"o","outfit-coat":"o","outfit-flower":"o","outfit-goggles":"o","outfit-headphones":"o","outfit-lantern-red":"o","outfit-moon-lamp":"o","outfit-overalls":"o","outfit-palette":"o","outfit-raincoat":"o","outfit-redscarf":"o","outfit-scroll":"o","outfit-spacesuit":"o","outfit-stethoscope":"o","outfit-strawhat":"o","outfit-sunglasses":"o","outfit-wizard":"o","outfit-zongzi":"o","ride-balloon":"u","ride-bicycle":"u","ride-skateboard":"u"};
 for(const id of ['egg-old-boots','egg-mini-hat','egg-waterweed','egg-grid-ruler','egg-release-shirt','egg-plaid-shirt','egg-little-flower','egg-gold-leaf','egg-travel-pack'])M['outfit-'+id]=id==='egg-travel-pack'?'ou':'o';
 const HEADWEAR=new Set(['goggles','cap','strawhat','raincoat','headphones','wizard','spacesuit','beanie','egg-mini-hat','egg-waterweed']);
 const U=(n,suf='')=>`url(/assets/town/look/${n}${suf}.webp)`;
 window.FoamTownLook=card=>{const outfit='outfit-'+(card?.outfit||''),form='form-'+(card?.form||''),ride='ride-'+(card?.ride||''),top=[],under=[],pose=[];
  if(M[form]?.includes('h')&&!HEADWEAR.has(card?.outfit))top.push(U(form,'-hat'));
  if(M[outfit]?.includes('o'))top.push(U(outfit));
  if(M[form]?.includes('o'))top.push(U(form));
  if(M[outfit]?.includes('u'))under.push(U(outfit,'-under'));
  if(M[ride]?.includes('u'))under.push(U(ride,'-under'));
  for(const n of [outfit,form,ride])if(M[n])pose.push({src:`/assets/town/look/${n}-pose.webp`,hat:n===form&&M[n].includes('h')&&!HEADWEAR.has(card?.outfit)});
  return {background:top.length||under.length?[...top,'url(/assets/town/panda-walk-v2.webp)',...under].join(','):'',pose};};
})();
