'use strict';
(() => {
 if(document.body.dataset.section==='town')return;
 const L=window.FoamLab,states=new Map(),pending=new Set(),seen=new WeakSet(),elements=new Map();
 const ttl=120000;let timer=0,reading=false,cache=null,cacheKey='';
 const key=(kind,id)=>kind+':'+id;
 function loadCache(){if(cache)return;cacheKey='foamlab-likes-v1:'+ (L.user?.id||'anon');cache={};try{const saved=JSON.parse(sessionStorage.getItem(cacheKey)||'{}');for(const [k,s]of Object.entries(saved)){if(s&&Number.isFinite(s.count)&&s.count>=0&&typeof s.liked==='boolean'&&Date.now()-s.time<ttl&&s.time<=Date.now())cache[k]=s;}}catch{}}
 function flushCache(){cache=Object.fromEntries(Object.entries(cache).filter(([,v])=>Date.now()-v.time<ttl).sort((a,b)=>b[1].time-a[1].time).slice(0,400));try{sessionStorage.setItem(cacheKey,JSON.stringify(cache));}catch{}}
 function save(k,flush=true){const s=states.get(k);cache[k]={count:s.count,liked:s.liked,time:Date.now()};if(flush)flushCache();}
 function paint(k){const s=states.get(k);if(!s)return;for(const b of elements.get(k)||[]){if(!b.isConnected){elements.get(k).delete(b);continue;}b.disabled=!!s.busy||!s.ready&&!s.error;b.setAttribute('aria-busy',String(!!s.busy));b.setAttribute('aria-pressed',String(s.liked));b.setAttribute('aria-label',(s.liked?'取消点赞':'点赞')+'，'+s.count+' 个赞');b.title=s.error?'点赞状态读取失败，点击重试':s.liked?'再次点击取消点赞':'点赞';b.querySelector('[data-like-label]').textContent=s.error?'重试点赞':s.liked?'已赞':'点赞';b.querySelector('[data-like-count]').textContent=s.ready?s.count:'…';}}
 async function hydrate(){
  // Counts need the account session, but do not depend on the separate role lookup.
  await (L.contentReady||L.ready);loadCache();
  const changed=new Set();for(const b of document.querySelectorAll('[data-like-id]')){if(seen.has(b))continue;seen.add(b);const k=key(b.dataset.likeKind,b.dataset.likeId);if(!elements.has(k))elements.set(k,new Set());elements.get(k).add(b);if(!states.has(k)){const saved=cache[k];states.set(k,{kind:b.dataset.likeKind,id:b.dataset.likeId,count:saved?.count||0,liked:!!saved?.liked,ready:!!saved,version:0});pending.add(k);}changed.add(k);}changed.forEach(paint);
  if(reading)return;reading=true;
  try{while(pending.size){const keys=[...pending].slice(0,200);keys.forEach(k=>pending.delete(k));const versions=new Map(keys.map(k=>[k,states.get(k).version]));
   try{const rows=L.check(await L.client.rpc('foamlab_like_counts',{targets:keys.map(k=>({kind:states.get(k).kind,id:states.get(k).id}))})),results=new Map((rows||[]).map(r=>[key(r.kind,r.id),r]));for(const k of keys){const s=states.get(k);if(s.version!==versions.get(k)||s.busy)continue;const row=results.get(k);Object.assign(s,{count:Math.max(0,Number(row?.count)||0),liked:!!row?.liked,ready:true,error:false});save(k,false);paint(k);}flushCache();}
   catch{for(const k of keys){const s=states.get(k);if(s.version!==versions.get(k)||s.busy)continue;s.error=!s.ready;paint(k);}}
  }}finally{reading=false;}
 }
 document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-like-id]');if(!b)return;e.preventDefault();const k=key(b.dataset.likeKind,b.dataset.likeId),s=states.get(k);if(!s||s.busy)return;
  if(s.error){s.error=false;paint(k);pending.add(k);void hydrate();return;}
  if(!L.user){await L.login();return;}
  if(L.role==='blocked'){window.foamNotify?.('此账号暂不能点赞。');return;}
  const previous={count:s.count,liked:s.liked},liked=!s.liked;
  // Give immediate feedback; only the server-confirmed state is cached.
  Object.assign(s,{busy:true,version:s.version+1,liked,count:Math.max(0,s.count+(liked?1:-1))});paint(k);
  try{await L.ready;if(L.role==='blocked')throw Error('此账号暂不能点赞。');const row=L.check(await L.client.rpc('foamlab_set_like',{target_kind:s.kind,target_id:s.id,liked}));Object.assign(s,{count:Math.max(0,Number(row.count)||0),liked:!!row.liked,ready:true});save(k);}
  catch(err){Object.assign(s,previous);window.foamNotify?.(err.message||'点赞未成功，请重试。');}
  finally{s.busy=false;paint(k);}
 });
 // Coalesce one DOM update without postponing reads as more comments arrive.
 const schedule=()=>{if(timer)return;timer=setTimeout(()=>{timer=0;void hydrate().catch(()=>{});},0);};
 new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches('[data-like-id]')||n.querySelector('[data-like-id]')))))schedule();}).observe(document.body,{childList:true,subtree:true});
 schedule();
})();
