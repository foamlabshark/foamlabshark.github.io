'use strict';
(() => {
 if(document.body.dataset.section==='town')return;
 const L=window.FoamLab,states=new Map(),pending=new Set(),seen=new WeakSet();let timer;
 const key=(kind,id)=>kind+':'+id;
 const buttons=k=>[...document.querySelectorAll('[data-like-id]')].filter(b=>key(b.dataset.likeKind,b.dataset.likeId)===k);
 function paint(k){const s=states.get(k);if(!s)return;for(const b of buttons(k)){b.disabled=s.busy||!s.ready;b.setAttribute('aria-pressed',String(s.liked));b.setAttribute('aria-label',(s.liked?'取消点赞':'点赞')+'，'+s.count+' 个赞');b.title=s.liked?'再次点击取消点赞':'点赞';b.querySelector('[data-like-label]').textContent=s.liked?'已赞':'点赞';b.querySelector('[data-like-count]').textContent=s.ready?s.count:'…';}}
 async function hydrate(){await L.ready;const fresh=[...document.querySelectorAll('[data-like-id]')].filter(b=>!seen.has(b));for(const b of fresh){seen.add(b);const k=key(b.dataset.likeKind,b.dataset.likeId);if(!states.has(k)){states.set(k,{kind:b.dataset.likeKind,id:b.dataset.likeId,count:0,liked:false,ready:false,version:0});pending.add(k);}paint(k);}
  while(pending.size){const keys=[...pending].slice(0,200);keys.forEach(k=>pending.delete(k));const versions=new Map(keys.map(k=>[k,states.get(k).version]));try{const rows=L.check(await L.client.rpc('foamlab_like_counts',{targets:keys.map(k=>({kind:states.get(k).kind,id:states.get(k).id}))}));for(const k of keys){const s=states.get(k);if(s.version!==versions.get(k)||s.busy)continue;const row=(rows||[]).find(r=>key(r.kind,r.id)===k);Object.assign(s,{count:Number(row?.count)||0,liked:!!row?.liked,ready:true,error:false});paint(k);}}catch{for(const k of keys){const s=states.get(k);s.error=true;for(const b of buttons(k)){b.disabled=false;b.querySelector('[data-like-label]').textContent='重试点赞';b.title='点赞状态读取失败，点击重试';}}}}
 }
 document.addEventListener('click',async e=>{const b=e.target.closest('[data-like-id]');if(!b)return;e.preventDefault();const k=key(b.dataset.likeKind,b.dataset.likeId),s=states.get(k);if(!s||s.busy)return;if(s.error){pending.add(k);void hydrate();return;}if(!L.user){await L.login();return;}if(L.role==='blocked'){window.foamNotify?.('此账号暂不能点赞。');return;}s.busy=true;s.version++;paint(k);try{const row=L.check(await L.client.rpc('foamlab_set_like',{target_kind:s.kind,target_id:s.id,liked:!s.liked}));Object.assign(s,{count:Number(row.count),liked:!!row.liked,ready:true});}catch(err){window.foamNotify?.(err.message||'点赞未成功，请重试。');}finally{s.busy=false;paint(k);}});
 const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>void hydrate().catch(()=>{}),60);};
 new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches('[data-like-id]')||n.querySelector('[data-like-id]')))))schedule();}).observe(document.body,{childList:true,subtree:true});
 schedule();
})();
