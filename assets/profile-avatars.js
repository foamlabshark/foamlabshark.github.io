'use strict';
(() => {
 const A=window.foamAuth;if(!A)return;
 const presets=[
  ['bamboo','竹林伙伴','竹林日常','cub','scarf','#e2edda'],['breeze','清风团团','竹林日常','cub','none','#e0eeeb'],['music','听歌熊猫','竹林日常','cub','headphones','#e4e3f0'],['ribbon','礼服小客','竹林日常','cub','bowtie','#f3e5dc'],
  ['scholar','博学先生','学习伙伴','master','coat','#e3e9dd'],['engineer','网格工程师','学习伙伴','engineer','goggles','#e1e9ef'],['explorer','山野探索家','学习伙伴','explorer','backpack','#eae7d6'],['space','星空旅人','学习伙伴','astronaut','spacesuit','#e2e1f2'],
  ['spring','春日花花','四季小镇','cub','flower','#f2e2e7'],['summer','夏日草帽','四季小镇','cub','strawhat','#ecedcc'],['autumn','秋日围巾','四季小镇','cub','redscarf','#f3e4cc'],['winter','冬日暖帽','四季小镇','cub','beanie','#dceaf2']
 ];
 const records=new Map();let owner=null,loading=null,dialog=null;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fallback=id=>({user_id:id,avatar:'bamboo',photo_path:null});
 function photoURL(row){return row?.photo_path&&new RegExp('^'+row.user_id+'/[0-9a-f-]{36}\\.webp$').test(row.photo_path)?A.client?.storage.from('foamlab-avatars').getPublicUrl(row.photo_path).data.publicUrl:'';}
 function markup(row,compact=false){const photo=row?.avatar==='photo'?photoURL(row):'';if(photo)return `<img class="profile-avatar-photo" src="${esc(photo)}" alt="" loading="lazy">`;
  const p=presets.find(p=>p[0]===row?.avatar)||presets[0];return `<span class="profile-avatar-art" data-form="${p[3]}" data-outfit="${p[4]}" data-decoration="no-decor" data-quiet="true" style="--avatar-bg:${p[5]}">${window.foamPandaArt?.(compact)||''}</span>`;
 }
 function render(){document.querySelectorAll('[data-self-avatar],#account-avatar,#account-panel-avatar').forEach(el=>{el.innerHTML=A.user?markup(records.get(A.user.id)):'<span aria-hidden="true">F</span>';});document.querySelectorAll('[data-avatar-open]').forEach(b=>b.disabled=!A.user);}
 async function load(){const id=A.user?.id||null;if(owner===id)return loading;owner=id;if(!id){render();return;}
  render();loading=(async()=>{const {data,error}=await A.client.from('foamlab_avatars').select('user_id,avatar,photo_path').eq('user_id',id).maybeSingle();if(error){owner=null;return;}records.set(id,data||fallback(id));if(A.user?.id===id)render();})();return loading;
 }
 async function fetchMany(ids){const missing=[...new Set(ids)].filter(id=>id&&!records.has(id));if(!missing.length)return;const {data,error}=await A.client.from('foamlab_avatars').select('user_id,avatar,photo_path').in('user_id',missing);if(!error)for(const id of missing)records.set(id,(data||[]).find(x=>x.user_id===id)||fallback(id));}
 function close(){if(!dialog)return;dialog.close();dialog.remove();dialog=null;}
 async function open(){await A.ready;if(!A.user)return;await load();if(dialog)return;
  const id=A.user.id,current=records.get(id)||fallback(id);let selection=current.avatar,photoPath=current.photo_path,img=null,blobURL=null,dirtyPhoto=false,busy=false,zoom=1,pan={x:0,y:0},drag=null;
  const d=document.createElement('dialog');dialog=d;d.className='avatar-dialog';d.setAttribute('aria-labelledby','avatar-dialog-title');
  d.innerHTML=`<header><div><p class="eyebrow">我的头像</p><h2 id="avatar-dialog-title">选一个喜欢的自己</h2></div><button type="button" class="icon-button" data-avatar-close aria-label="关闭头像设置">×</button></header>
  <div class="avatar-editor-top"><div class="avatar-large" data-avatar-preview></div><div><strong>自定义照片</strong><p>上传 JPG、PNG 或 WebP 图片，拖动并缩放调整头像。</p><div class="avatar-upload-actions"><label class="button secondary avatar-upload">上传照片<input type="file" accept="image/jpeg,image/png,image/webp" data-avatar-file></label><button type="button" class="button secondary" data-avatar-edit ${photoPath?'':'hidden'}>调整已上传照片</button></div><small>支持 10 MB 以内的图片。</small></div></div>
  <section class="avatar-crop" hidden><canvas width="512" height="512" tabindex="0" aria-label="头像裁剪预览，拖动或用方向键调整位置"></canvas><label>缩放 <input type="range" min="1" max="3" step="0.01" value="1" data-avatar-zoom></label><p>拖动照片调整位置；键盘方向键也可微调。</p></section>
  <section class="avatar-presets" aria-label="默认熊猫头像">${[...new Set(presets.map(p=>p[2]))].map(group=>`<h3>${group}</h3><div class="avatar-preset-grid">${presets.filter(p=>p[2]===group).map(p=>`<button type="button" data-avatar-preset="${p[0]}" aria-pressed="${selection===p[0]}"><span class="avatar-choice-picture">${markup({avatar:p[0]})}</span><span>${p[1]}</span></button>`).join('')}</div>`).join('')}</section>
  <footer><p class="avatar-message" role="status"></p><div><button type="button" class="button secondary" data-avatar-close>取消</button><button type="button" class="button" data-avatar-save>保存头像</button></div></footer>`;
  (document.querySelector('#town-app')||document.body).append(d);d.showModal();
  const q=s=>d.querySelector(s),canvas=q('canvas'),ctx=canvas.getContext('2d'),crop=q('.avatar-crop'),message=q('.avatar-message');
  const preview=()=>{q('[data-avatar-preview]').innerHTML=selection==='photo'&&dirtyPhoto?`<img class="profile-avatar-photo" src="${canvas.toDataURL('image/webp',.8)}" alt="头像预览">`:markup({user_id:id,avatar:selection,photo_path:photoPath});d.querySelectorAll('[data-avatar-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.avatarPreset===selection)));};
  function paint(){if(!img)return;const scale=Math.max(512/img.width,512/img.height)*zoom,w=img.width*scale,h=img.height*scale;pan.x=Math.max(-(w-512)/2,Math.min((w-512)/2,pan.x));pan.y=Math.max(-(h-512)/2,Math.min((h-512)/2,pan.y));ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,512,512);ctx.drawImage(img,(512-w)/2+pan.x,(512-h)/2+pan.y,w,h);preview();}
  function cleanup(){if(blobURL)URL.revokeObjectURL(blobURL);if(dialog===d)dialog=null;d.remove();}
  d.addEventListener('close',cleanup,{once:true});d.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
  d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-avatar-close]')){if(!busy)d.close();}const b=e.target.closest('[data-avatar-preset]');if(b&&!busy){selection=b.dataset.avatarPreset;crop.hidden=true;preview();}});
  async function readPhoto(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('请选择 JPG、PNG 或 WebP 图片。');if(file.size>10*1024*1024)throw Error('图片超过 10 MB，请选择小一些的照片。');
   const url=URL.createObjectURL(file),next=new Image();try{next.src=url;await next.decode();if(!next.naturalWidth||!next.naturalHeight)throw Error();}catch{URL.revokeObjectURL(url);throw Error('这张图片无法读取，请换一张。');}
   if(!d.isConnected){URL.revokeObjectURL(url);return;}if(blobURL)URL.revokeObjectURL(blobURL);blobURL=url;img=next;selection='photo';dirtyPhoto=true;zoom=1;pan={x:0,y:0};q('[data-avatar-zoom]').value='1';q('[data-avatar-edit]').hidden=false;crop.hidden=false;message.textContent='';paint();
  }
  q('[data-avatar-file]').onchange=async e=>{const file=e.target.files[0];if(file)try{await readPhoto(file);}catch(error){message.textContent=error.message;}e.target.value='';};
  q('[data-avatar-edit]').onclick=async()=>{if(busy)return;if(img){selection='photo';crop.hidden=false;paint();return;}try{const res=await fetch(photoURL({user_id:id,photo_path:photoPath}));if(!res.ok)throw Error('照片暂时无法读取，请重试或重新上传。');await readPhoto(await res.blob());}catch(error){message.textContent=error.message;}};
  q('[data-avatar-zoom]').oninput=e=>{zoom=Number(e.target.value);paint();};
  canvas.onpointerdown=e=>{if(busy)return;canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};e.preventDefault();};
  canvas.onpointermove=e=>{if(!drag)return;const scale=512/canvas.getBoundingClientRect().width;pan={x:drag.px+(e.clientX-drag.x)*scale,y:drag.py+(e.clientY-drag.y)*scale};paint();};
  canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
  canvas.onkeydown=e=>{const v={ArrowLeft:[-6,0],ArrowRight:[6,0],ArrowUp:[0,-6],ArrowDown:[0,6]}[e.key];if(v&&!busy){e.preventDefault();pan.x+=v[0];pan.y+=v[1];paint();}};
  q('[data-avatar-save]').onclick=async()=>{if(busy)return;busy=true;message.textContent='正在保存…';d.querySelectorAll('button,input').forEach(b=>b.disabled=true);let uploaded=null;
   try{if(A.user?.id!==id)throw Error('登录账号已变化，请重新打开头像设置。');
    if(selection==='photo'&&dirtyPhoto){const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.9));if(!blob)throw Error('照片处理失败，请重新选择。');uploaded=id+'/'+crypto.randomUUID()+'.webp';const {error}=await A.client.storage.from('foamlab-avatars').upload(uploaded,blob,{contentType:'image/webp',cacheControl:'31536000',upsert:false});if(error)throw error;photoPath=uploaded;}
    const row={user_id:id,avatar:selection,photo_path:photoPath};const {error}=await A.client.from('foamlab_avatars').upsert(row,{onConflict:'user_id'});if(error)throw error;
    records.set(id,row);render();window.dispatchEvent(new CustomEvent('foam-avatar-change',{detail:{userId:id}}));
    if(uploaded&&current.photo_path&&current.photo_path!==uploaded)A.client.storage.from('foamlab-avatars').remove([current.photo_path]).catch(()=>{});
    d.close();window.foamNotify?.('头像已保存。');
   }catch(error){if(uploaded)A.client.storage.from('foamlab-avatars').remove([uploaded]).catch(()=>{});photoPath=current.photo_path;message.textContent='保存失败，当前选择已保留，请重试。';busy=false;d.querySelectorAll('button,input').forEach(b=>b.disabled=false);}
  };preview();
 }
 window.FoamAvatar={open,render,load,fetchMany,markup,get:id=>records.get(id)};
 document.addEventListener('click',e=>{if(e.target.closest('[data-avatar-open]')){e.preventDefault();open();}});
 window.addEventListener('foam-auth-change',()=>{if(owner!==A.user?.id&&dialog)close();load();render();});
 const fields=document.querySelector('#profile-fields');if(fields)fields.insertAdjacentHTML('afterbegin','<div class="profile-avatar-setting"><span class="avatar-large" data-self-avatar></span><div><h3>个人头像</h3><p>上传自己的照片，或挑选一位熊猫伙伴。</p><button type="button" class="button secondary" data-avatar-open>修改头像</button></div></div>');
 A.ready.then(load);render();
})();
