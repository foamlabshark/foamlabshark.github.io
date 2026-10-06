'use strict';
(() => {
 let channel=null,heartbeat=null,hiddenTimer=null,generation=0,current=null;
 const reads=new Map();
 async function rpc(name,args={}){await window.foamAuth?.ready;const client=window.foamAuth?.client;if(!client)throw Error('暂时无法连接小镇，请稍后重试。');
  // Share only concurrent reads for the same identity; mutations always run separately.
  const read=name==='foamlab_town_map'||name==='foamlab_town_street'||name==='foamlab_town_presence_status'||name==='foamlab_town'&&args.operation==='state'||name==='foamlab_pet'&&!Object.keys(args).length;
  const key=read?JSON.stringify([window.foamAuth.user?.id||'',name,args]):null;if(key&&reads.has(key))return reads.get(key);
  const request=(async()=>{const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),16000);try{const {data,error}=await client.rpc(name,args).abortSignal(controller.signal);if(error)throw Error(error.message||'暂时无法连接小镇。');return data;}finally{clearTimeout(timeout);}})();
  if(key)reads.set(key,request);try{return await request;}finally{if(key&&reads.get(key)===request)reads.delete(key);}
 }
 const call=(operation,payload={})=>rpc('foamlab_town',{operation,payload});
 async function disconnect(markAway=true){generation++;clearInterval(heartbeat);clearTimeout(hiddenTimer);heartbeat=null;if(channel){const old=channel;channel=null;window.foamAuth?.client?.removeChannel(old).catch(()=>{});}const hadStreet=!!current;current=null;if(markAway&&hadStreet&&window.foamAuth?.user)await call('disconnect').catch(()=>{});}
 async function connect(province,callbacks){await disconnect(false);current={province,callbacks};const rev=++generation;
  try{await call('enter',{province});if(rev!==generation)return;window.dispatchEvent(new CustomEvent('foamlab:town-entered',{detail:{province}}));const client=window.foamAuth.client;channel=client.channel('town:'+province,{config:{private:true,presence:{key:window.foamAuth.user.id}}});
   channel.on('broadcast',{event:'town'},({payload})=>{if(rev===generation){callbacks.event?.(payload);window.dispatchEvent(new CustomEvent('foamlab:town-broadcast',{detail:payload}));}}).on('presence',{event:'sync'},()=>{if(rev===generation)callbacks.sync?.();}).subscribe(async status=>{
    if(rev!==generation)return;callbacks.status?.(status==='SUBSCRIBED'?'online':status==='CHANNEL_ERROR'||status==='TIMED_OUT'?'offline':'connecting');
    if(status==='SUBSCRIBED')await channel?.track({user_id:window.foamAuth.user.id});
   });
   heartbeat=setInterval(async()=>{if(document.hidden)return;try{const s=await call('heartbeat',{province});if(rev===generation)callbacks.invitations?.(s.invitations||[]);}catch{callbacks.status?.('offline');}},60000);
  }catch(error){callbacks.status?.('offline');callbacks.error?.(error);}
 }
 document.addEventListener('visibilitychange',()=>{clearTimeout(hiddenTimer);if(document.hidden){hiddenTimer=setTimeout(()=>{const saved=current;disconnect();current=saved;},60000);}else if(current&&!channel){const {province,callbacks}=current;connect(province,callbacks);}});
 window.addEventListener('pagehide',()=>disconnect(false));
 window.FoamTownNet={rpc,call,connect,disconnect,action:payload=>rpc('foamlab_town_action',{payload})};
})();
