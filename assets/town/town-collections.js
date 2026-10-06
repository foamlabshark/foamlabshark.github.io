'use strict';
(() => {
 const groups=[
  ['图鉴与画册',[['album','熊猫画册','read','日常、节日、生肖与星座'],['cards','知识卡','card','在小镇收集的 OpenFOAM 知识'],['eggs','彩蛋','gem','隐藏发现、专属称号与秘密画卡']]],
  ['小镇荣誉',[['title','称号','title','佩戴喜欢的身份称号'],['badge','勋章','badge','各处景点的纪念勋章'],['achievements','成就','trophy','查看小镇旅程中取得的成就']]],
  ['熊猫与小屋',[['outfit','服饰','outfit','帽子、围巾与各式服装'],['form','形态','form','熊猫的不同形象'],['ride','出行','ride','选择出行方式'],['decoration','装饰','decoration','随身携带的小景致'],['house','房屋','house','挑选小屋的外观']]],
  ['动作与互动',[['action','动作','action','设置熊猫的动作'],['duo','互动','duo','和邻居一起互动'],['emote','表情','emote','用小表情传达心情']]]
 ];
 const entries=groups.flatMap(g=>g[1]);
 const icon=(id)=>window.FoamTownIcon(id);
 function render({category='all',pet,dialog,itemsHTML,userId,preserveView=false,focusId=null}){
  const current=document.querySelector('#town-dialog');
  if(preserveView&&current.open&&current.classList.contains('is-collections')&&current.dataset.collectionCategory===category){
   const top=current.scrollTop,left=current.scrollLeft,focus=focusId||document.activeElement?.closest('[data-town=equip]')?.dataset.id;
   current.querySelector('[data-collection-content]').innerHTML=itemsHTML;
   if(focus)[...current.querySelectorAll('[data-town=equip]')].find(b=>b.dataset.id===focus)?.focus({preventScroll:true});
   current.scrollTop=top;current.scrollLeft=left;
   return;
  }
  const selected=entries.find(e=>e[0]===category);if(!selected)category='all';
  const count=id=>{
   if(id==='album')return `${window.FoamPandaCards.owned().size} / ${window.FoamPandaCards.total}`;
   if(id==='eggs')return `${window.FoamTownEggs?.count()||0} / ${window.FoamTownEggs?.catalog.length||56}`;
   if(id==='cards')return `${window.FoamTownPlay.cards.length} / ${window.FoamTownPlay.catalog.length}`;
   if(id==='achievements')return '查看陈列';
   const items=pet.items.filter(i=>i.category===id&&(id!=='badge'||/^(province|visit)-/.test(i.id)));return `${items.filter(i=>i.unlocked).length} / ${items.length}`;
  };
  const link=([id,name,glyph])=>`<button type="button" data-town="wardrobe-tab" data-category="${id}" aria-current="${category===id?'page':'false'}">${icon(glyph)}<span>${name}</span><small>${count(id)}</small></button>`;
  dialog('小镇收集',`<div class="town-collections"><nav class="town-collection-nav" aria-label="收集分类"><button type="button" data-town="wardrobe-tab" data-category="all" aria-current="${category==='all'?'page':'false'}">${icon('gift')}<span>全部收集</span></button>${groups.map(([name,list])=>`<section><h3>${name}</h3>${list.map(link).join('')}</section>`).join('')}</nav><section class="town-collection-content" aria-label="${selected?.[1]||'全部收集'}"><header class="town-collection-heading"><div><small>熊猫小镇 · 我的收藏</small><h3>${selected?.[1]||'每一份收藏，都有一段小镇故事'}</h3><p>${selected?selected[3]:'画册、知识卡、荣誉和装扮，在这里分门别类珍藏。'}</p></div>${selected?`<b>${count(category)}</b>`:''}</header><div data-collection-content>${category==='all'?groups.map(([name,list])=>`<section class="town-collection-group"><h3>${name}</h3><div class="town-collection-tiles">${list.map(([id,label,glyph,desc])=>`<button type="button" data-town="wardrobe-tab" data-category="${id}">${icon(glyph)}<span><strong>${label}</strong><small>${desc}</small><b>${count(id)}</b></span><i aria-hidden="true">›</i></button>`).join('')}</div></section>`).join(''):['album','cards','achievements','eggs'].includes(category)?'':itemsHTML}</div></section></div>`);
  const modal=document.querySelector('#town-dialog');modal.classList.add('is-collections');modal.dataset.collectionCategory=category;modal.scrollTop=0;
  const host=modal.querySelector('[data-collection-content]');
  if(category==='eggs')window.FoamTownEggs.mount(host);
  if(category==='album')window.FoamPandaCards.mountAlbum(host);
  if(category==='cards')window.FoamTownPlay.mountCollection(host);
  if(category==='badge'){host.replaceChildren();const wall=document.createElement('section');host.prepend(wall);window.FoamProvinceCases.wall(wall,userId);}
  if(category==='achievements')window.FoamTownProgress.achievements(host,userId);
 }
 window.FoamTownCollections={render};
})();
