'use strict';
(() => {
 const card=document.querySelector('[data-member-leaderboards]');if(!card)return;
 const $=s=>card.querySelector(s);let pending=null,initialized=false,lastRead=0,lastSignature='';
 function list(key,rows){
  const target=$(`[data-leaderboard=${key}]`);target.replaceChildren();
  if(!rows.length){const p=document.createElement('p');p.className='member-ranking-empty';p.textContent=key==='activity'?'近 15 天暂无签到记录。':'暂无成员记录。';target.append(p);return;}
  const ol=document.createElement('ol');ol.className='member-ranking-list';
  rows.slice(0,10).forEach((row,i)=>{
   const li=document.createElement('li'),rank=document.createElement('span'),name=document.createElement('span'),score=document.createElement('span');
   rank.className='member-ranking-rank'+(i<3?' medal':'');rank.dataset.rank=String(i+1);rank.textContent=i<3?['🥇','🥈','🥉'][i]:String(i+1);rank.setAttribute('aria-label','第 '+(i+1)+' 名');
   name.className='member-ranking-name';name.textContent=row.name||'学习者';name.title=name.textContent;
   const count=key==='experience'?row.xp:row.days;score.className='member-ranking-score';const number=document.createElement('strong'),unit=document.createElement('small');number.textContent=Number(count||0).toLocaleString('zh-CN');unit.textContent=key==='experience'?'经验':'天';score.append(number,unit);li.append(rank,name,score);ol.append(li);
  });target.append(ol);
 }
 async function refresh(){
  if(pending)return pending;initialized=true;
  pending=(async()=>{try{
   for(let wait=0;!window.foamAuth&&wait<120;wait++)await new Promise(resolve=>setTimeout(resolve,100));await window.foamAuth?.ready;
   const client=window.foamAuth?.client;if(!client)throw Error();const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);let result;
   try{result=await client.from('foamlab_member_leaderboards').select('data,updated_at').eq('id',true).single().abortSignal(controller.signal);}finally{clearTimeout(timer);}
   const value=result.data?.data;if(result.error||!Array.isArray(value?.experience)||!Array.isArray(value?.activity))throw Error();
   list('experience',value.experience);list('activity',value.activity);
   $('[data-ranking-period]').textContent=value.start_date&&value.end_date?value.start_date.slice(5).replace('-','.')+'—'+value.end_date.slice(5).replace('-','.'):'';
   $('[data-ranking-period]').title='北京时间，含今天在内的 15 天';$('[data-ranking-state]').hidden=true;$('[data-ranking-retry]').hidden=true;lastRead=Date.now();
  }catch{$('[data-ranking-state]').textContent='排行榜暂时无法读取。';$('[data-ranking-state]').hidden=false;$('[data-ranking-retry]').hidden=false;}
  finally{pending=null;}})();return pending;
 }
 $('[data-ranking-retry]').onclick=()=>void refresh();
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&(!initialized||Date.now()-lastRead>60000))void refresh();},{rootMargin:'250px'});observer.observe(card);
 const accountChanged=e=>{const auth=window.foamAuth,signature=JSON.stringify([auth?.user?.id,auth?.profile?.display_name,auth?.pet?.xp,auth?.pet?.checked_in]);if(initialized&&(signature!==lastSignature||e.detail?.accountUpdated)){lastSignature=signature;void refresh();}};
 window.addEventListener('foam-auth-change',accountChanged);window.addEventListener('foam-pet-change',accountChanged);
 window.addEventListener('focus',()=>{if(initialized&&Date.now()-lastRead>60000)void refresh();});
 const timer=setInterval(()=>{if(!document.hidden&&initialized&&Date.now()-lastRead>60000){const r=card.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)void refresh();}},60000);
 window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
})();
