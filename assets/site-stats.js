'use strict';
(() => {
 const box=document.querySelector('[data-site-stats]');if(!box)return;
 const visits=box.querySelector('[data-site-visits]'),online=box.querySelector('[data-site-online]');
 const key='foamlab.site.visitor',valid=id=>/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id||'');
 const tab=crypto.randomUUID(),visit=crypto.randomUUID();let visitor=crypto.randomUUID(),seq=0,counted=false,client=null,config=null,leaving=false,latest=0;
 try{const saved=localStorage.getItem(key);visitor=valid(saved)?saved:visitor;localStorage.setItem(key,visitor);}catch{}
 function payload(active){try{const saved=localStorage.getItem(key);if(valid(saved))visitor=saved;}catch{}return {p_visitor:visitor,p_tab:tab,p_seq:++seq,p_visit:active&&!counted?visit:null,p_active:active};}
 async function update(){if(!client||document.hidden||leaving)return;const body=payload(true),order=body.p_seq;
  try{const {data,error}=await client.rpc('foamlab_site_stats',body);if(error||!Number.isSafeInteger(data?.visits)||!Number.isSafeInteger(data?.online))throw error||Error('Invalid statistics');
   if(body.p_visit)counted=true;if(order<latest||document.hidden||leaving)return;latest=order;
   visits.textContent=data.visits.toLocaleString('zh-CN');online.textContent=data.online.toLocaleString('zh-CN');box.dataset.state='ready';box.removeAttribute('title');
  }catch{if(order<latest||document.hidden||leaving)return;box.dataset.state='unavailable';online.textContent='—';box.title='访问统计暂时不可用，稍后自动重试';}
 }
 function leave(){if(!config)return;const body=payload(false);
  // Keepalive reaches the counter when the page is closed, without waiting for a session refresh.
  fetch(config.supabaseUrl+'/rest/v1/rpc/foamlab_site_stats',{method:'POST',keepalive:true,headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body)}).catch(()=>{});
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)leave();else{leaving=false;update();}});
 window.addEventListener('pagehide',()=>{leaving=true;leave();});
 window.addEventListener('pageshow',e=>{if(e.persisted){leaving=false;update();}});
 setInterval(update,30000);
 (async()=>{try{await window.foamAuth?.ready;client=window.foamAuth?.client;if(!client)throw Error('No statistics client');
  const response=await fetch('/assets/auth-config.json');if(response.ok){const c=await response.json();if(/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(c.supabaseUrl)&&typeof c.publishableKey==='string'&&!c.publishableKey.startsWith('sb_secret_'))config={...c,supabaseUrl:c.supabaseUrl.replace(/\/$/,'')};}await update();
 }catch{box.dataset.state='unavailable';box.title='访问统计暂时不可用，稍后自动重试';}})();
})();
