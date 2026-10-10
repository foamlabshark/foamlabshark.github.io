'use strict';
(() => {
 const box=document.querySelector('[data-site-stats]');if(!box)return;
 const visits=box.querySelector('[data-site-visits]'),today=box.querySelector('[data-site-today-visits]'),online=box.querySelector('[data-site-online]');
 const key='foamlab.site.visitor',valid=id=>/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id||'');
 const tab=crypto.randomUUID(),sessionKey='foamlab.site.continuation',sharedKey='foamlab.site.session',countKey='foamlab.site.counted',pagePrefix='foamlab.site.page:',initLock='foamlab.site.session.init';
 let visitor=crypto.randomUUID(),visit=null,seq=0,counted=false,client=null,config=null,leaving=false,latest=0,releasePage=null,joining=null;
 let channel=null;const responding=new Set();
 try{const saved=localStorage.getItem(key);if(valid(saved))visitor=saved;}catch{}
 function syncVisitor(){try{const saved=localStorage.getItem(key);visitor=valid(saved)?saved:visitor;localStorage.setItem(key,visitor);}catch{}}
 if(!navigator.locks?.request&&window.BroadcastChannel)try{
  channel=new BroadcastChannel('foamlab.site.pages');channel.onmessage=({data})=>{
   if(data?.type==='probe'&&valid(data.from)&&!leaving&&visit)channel.postMessage({type:'alive',to:data.from,visit});
   if(data?.type==='alive'&&data.to===tab&&valid(data.visit))responding.add(data.visit);
   if(data?.type==='joined'&&data.from!==tab&&valid(data.from)&&valid(data.visit))responding.add(data.visit);
  };
 }catch{}
 const read=(storage,name)=>{try{return JSON.parse(window[storage].getItem(name));}catch{return null;}};
 const save=(storage,name,value)=>{try{window[storage].setItem(name,JSON.stringify(value));}catch{}};
 const remove=(storage,name)=>{try{window[storage].removeItem(name);}catch{}};
 function continuation(){const saved=read('sessionStorage',sessionKey);remove('sessionStorage',sessionKey);return saved?.visitor===visitor&&valid(saved.visit)?saved.visit:null;}
 function chooseVisit(peers,previous){
  const shared=read('localStorage',sharedKey);
  return peers.find(id=>id===shared?.visit)||peers[0]||(shared?.visitor===visitor&&previous===shared.visit?previous:crypto.randomUUID());
 }
 function rememberVisit(id){if(visit!==id)counted=read('localStorage',countKey)?.visit===id;visit=id;save('localStorage',sharedKey,{visitor,visit});}
 function holdPage(){return new Promise((ready,reject)=>{
  navigator.locks.request(pagePrefix+visit+':'+tab,()=>{ready();return new Promise(done=>{releasePage=done;});}).catch(reject);
 });}
 function fallbackPages(){
  const pages=[];try{for(let i=localStorage.length-1;i>=0;i--){const name=localStorage.key(i);if(!name?.startsWith(pagePrefix))continue;const row=read('localStorage',name);
   if(valid(row?.visit)&&row.seen>Date.now()-180000)pages.push({...row,name});else remove('localStorage',name);
  }}catch{}return pages.sort((a,b)=>a.started-b.started||a.name.localeCompare(b.name));
 }
 function touchPage(){if(visit&&!leaving&&!navigator.locks?.request)save('localStorage',pagePrefix+tab,{visitor,visit,started:startedAt,seen:Date.now(),ready:true});}
 const startedAt=Date.now();
 async function joinSession(){
  if(navigator.locks?.request&&navigator.locks?.query){
   await navigator.locks.request(initLock,async()=>{
    if(leaving)return;
    syncVisitor();const previous=continuation();
    const snapshot=await navigator.locks.query(),peers=snapshot.held.filter(lock=>lock.name.startsWith(pagePrefix)).map(lock=>lock.name.slice(pagePrefix.length).split(':')[0]).filter(valid);
    if(leaving)return;rememberVisit(chooseVisit(peers,previous));await holdPage();if(leaving){releasePage?.();releasePage=null;}
   });
  }else{
   syncVisitor();const previous=continuation();
   const existing=fallbackPages(),oldReady=new Set(existing.filter(row=>row.ready).map(row=>row.name)),id=chooseVisit(channel?[]:existing.filter(row=>row.ready).map(row=>row.visit),previous);responding.clear();channel?.postMessage({type:'probe',from:tab});
   save('localStorage',pagePrefix+tab,{visitor,visit:id,started:startedAt,seen:Date.now(),ready:false});
   // Concurrent first pages settle on the oldest candidate before sending a visit.
   await new Promise(done=>setTimeout(done,100));if(leaving)return;
   const pages=fallbackPages();if(channel)for(const row of pages)if(oldReady.has(row.name)&&!responding.has(row.visit))remove('localStorage',row.name);
   const candidates=pages.filter(row=>!channel||!oldReady.has(row.name)||responding.has(row.visit)),chosen=[...responding][0]||candidates.find(row=>row.ready)?.visit||candidates[0]?.visit||id;
   syncVisitor();rememberVisit(chosen);touchPage();channel?.postMessage({type:'joined',from:tab,visit});
  }
  // A tab retains this across navigation and refresh; closing it clears the key.
  save('sessionStorage',sessionKey,{visitor,visit});
 }
 function ensureSession(){return joining||(joining=joinSession());}
 function payload(active){try{const saved=localStorage.getItem(key);if(valid(saved))visitor=saved;}catch{}if(read('localStorage',countKey)?.visit===visit)counted=true;return {p_visitor:visitor,p_tab:tab,p_seq:++seq,p_visit:active&&!counted?visit:null,p_active:active};}
 async function update(){if(!client||document.hidden||leaving)return;let order=seq;
  try{await ensureSession();if(document.hidden||leaving||!visit)return;const body=payload(true);order=body.p_seq;
   const {data,error}=await client.rpc('foamlab_site_stats',body);if(error||!Number.isSafeInteger(data?.visits)||!Number.isSafeInteger(data?.today_visits)||!Number.isSafeInteger(data?.online))throw error||Error('Invalid statistics');
   if(body.p_visit===visit){counted=true;if(read('localStorage',sharedKey)?.visit===visit)save('localStorage',countKey,{visit});}if(order<latest||document.hidden||leaving)return;latest=order;
   visits.textContent=data.visits.toLocaleString('zh-CN');if(today)today.textContent=data.today_visits.toLocaleString('zh-CN');online.textContent=data.online.toLocaleString('zh-CN');box.dataset.state='ready';box.removeAttribute('title');
  }catch{if(order<latest||document.hidden||leaving)return;box.dataset.state='unavailable';if(today)today.textContent='—';online.textContent='—';box.title='访问统计暂时不可用，稍后自动重试';}
 }
 function leave(){if(!config)return;const body=payload(false);
  // Keepalive reaches the counter when the page is closed, without waiting for a session refresh.
  fetch(config.supabaseUrl+'/rest/v1/rpc/foamlab_site_stats',{method:'POST',keepalive:true,headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body)}).catch(()=>{});
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)leave();else{leaving=false;update();}});
 window.addEventListener('pagehide',()=>{leaving=true;leave();releasePage?.();releasePage=null;remove('localStorage',pagePrefix+tab);joining=null;});
 window.addEventListener('pageshow',e=>{if(e.persisted){leaving=false;update();}});
 setInterval(()=>{touchPage();update();},30000);
 // Background tabs belong to the session even before their first statistics RPC.
 ensureSession().catch(()=>{});
 (async()=>{try{await window.foamAuth?.ready;client=window.foamAuth?.client;if(!client)throw Error('No statistics client');
  const response=await fetch('/assets/auth-config.json');if(response.ok){const c=await response.json();if(/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(c.supabaseUrl)&&typeof c.publishableKey==='string'&&!c.publishableKey.startsWith('sb_secret_'))config={...c,supabaseUrl:c.supabaseUrl.replace(/\/$/,'')};}await update();
 }catch{box.dataset.state='unavailable';box.title='访问统计暂时不可用，稍后自动重试';}})();
})();
