'use strict';
(() => {
 const allowed=new Set(['foamlab_member_distribution','foamlab_member_leaderboards']),pending=new Map(),memory=new Map();let configuration;
 const key=table=>'foamlab-public-members-v1:'+table+(table==='foamlab_member_leaderboards'?':30-days:profiles-v2':':chinese-institutions-v3'),ttl=60000,maxAge=600000;
 const today=()=>new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Shanghai'});
 function cached(table){
  if(!allowed.has(table))return null;
  let entry=memory.get(table);if(!entry){try{entry=JSON.parse(sessionStorage.getItem(key(table)));}catch{}}
  if(!entry||!entry.data||Date.now()-entry.at>maxAge||entry.at>Date.now())return null;
  if(table==='foamlab_member_leaderboards'&&entry.data.end_date!==today())return null;
  return entry;
 }
 async function config(){
  if(window.foamAuth?.publicConfig)return window.foamAuth.publicConfig;
  if(!configuration){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);configuration=fetch('/assets/auth-config.json',{cache:'force-cache',signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).catch(e=>{configuration=null;throw e;}).finally(()=>clearTimeout(timer));}
  const value=await configuration,url=new URL(value.supabaseUrl);
  if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co')||!value.publishableKey||value.publishableKey.startsWith('sb_secret_'))throw Error('Public data configuration unavailable');
  return value;
 }
 function invalidate(table){memory.delete(table);try{sessionStorage.removeItem(key(table));}catch{}}
 function read(table,{force=false}={}){
  if(!allowed.has(table))return Promise.reject(Error('Unknown member summary'));
  if(pending.has(table))return pending.get(table);
  const saved=cached(table);if(!force&&saved&&Date.now()-saved.at<ttl)return Promise.resolve(saved.data);
  const task=(async()=>{
   const cfg=await config(),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
   try{
    // These two aggregate tables are public. Do not wait for a private Auth session or token refresh.
    const response=await fetch(cfg.supabaseUrl+'/rest/v1/'+table+'?select=data,updated_at&id=eq.true',{headers:{apikey:cfg.publishableKey,Accept:'application/vnd.pgrst.object+json'},signal:controller.signal});
    if(!response.ok)throw Error('Member summary unavailable');const row=await response.json(),data=row.data;
    if(table==='foamlab_member_distribution'?!Number.isSafeInteger(data?.members):!Array.isArray(data?.experience)||!Array.isArray(data?.activity))throw Error('Invalid member summary');
    const entry={at:Date.now(),data};memory.set(table,entry);try{sessionStorage.setItem(key(table),JSON.stringify(entry));}catch{}
    return data;
   }finally{clearTimeout(timer);}
  })().finally(()=>pending.delete(table));pending.set(table,task);return task;
 }
 window.FoamMemberData={read,cached,invalidate};
})();
