'use strict';
(() => {
 const L=window.FoamLab,esc=L.esc,key='site_popup',visitKey='foamlab.site-popup.visit.v1',dayKey='foamlab.site-popup.hidden-day.v1';
 const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const get=(storage,name)=>{try{return storage.getItem(name);}catch{return null;}};
 const put=(storage,name,value)=>{try{storage.setItem(name,value);}catch{/* The dialog remains usable when browser storage is unavailable. */}};
 const imageURL=value=>{if(typeof value!=='string'||!value.trim())return '';try{const u=new URL(value.trim(),location.origin);return (u.protocol==='https:'||u.origin===location.origin)&&!u.username&&!u.password?u.href:'';}catch{return '';}};
 const normalize=value=>({enabled:value?.enabled===true,title:String(value?.title||'网站通知').slice(0,80),body:typeof value?.body==='string'?value.body.slice(0,20000):'',images:(Array.isArray(value?.images)?value.images:[]).slice(0,12).map(item=>({url:imageURL(item?.url),alt:String(item?.alt||'通知配图').slice(0,160)})).filter(item=>item.url)});
 function show(config,preview=false){
  const previous=document.activeElement,dialog=document.createElement('dialog');dialog.className='site-popup-dialog';dialog.setAttribute('aria-labelledby','site-popup-title');
  dialog.innerHTML='<header class="site-popup-header"><h2 id="site-popup-title">'+esc(config.title||'网站通知')+'</h2><button class="icon-button" type="button" data-popup-close aria-label="关闭通知">×</button></header><div class="site-popup-body"><div class="prose">'+L.markdown(config.body)+'</div>'+(config.images.length?'<div class="site-popup-images">'+config.images.map(img=>'<img src="'+esc(img.url)+'" alt="'+esc(img.alt)+'" loading="lazy" decoding="async">').join('')+'</div>':'')+'</div>'+(!preview?'<footer class="site-popup-footer"><label><input type="checkbox" data-popup-today> 今日不再弹出</label></footer>':'');
  dialog.querySelector('[data-popup-close]').onclick=()=>dialog.close();
  dialog.querySelector('[data-popup-today]')?.addEventListener('change',e=>{if(e.target.checked)put(localStorage,dayKey,today());else try{if(get(localStorage,dayKey)===today())localStorage.removeItem(dayKey);}catch{}});
  dialog.addEventListener('close',()=>{if(!preview&&dialog.querySelector('[data-popup-today]').checked)put(localStorage,dayKey,today());dialog.remove();if(previous?.isConnected&&!document.querySelector('dialog[open]'))previous.focus({preventScroll:true});},{once:true});
  dialog.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{const text=document.createElement('p');text.className='site-popup-image-error';text.textContent=(img.alt||'图片')+'暂时无法加载';img.replaceWith(text);},{once:true}));
  document.body.append(dialog);dialog.showModal();return dialog;
 }
 async function start(){
  if(get(sessionStorage,visitKey)||get(localStorage,dayKey)===today()){put(sessionStorage,visitKey,'checked');return;}
  try{
   await L.contentReady;
   const row=L.check(await L.client.from('foamlab_settings').select('value').eq('key',key).maybeSingle()),cfg=normalize(row?.value);
   if(!cfg.enabled||(!cfg.body.trim()&&!cfg.images.length)){put(sessionStorage,visitKey,'checked');return;}
   // Required profile collection takes priority over the site notice.
   await window.foamAuth?.profileReady;
   let observer;
   const cleanup=()=>{observer?.disconnect();document.removeEventListener('visibilitychange',attempt);window.removeEventListener('storage',attempt);window.removeEventListener('pagehide',cleanup);window.removeEventListener('foam-auth-change',attempt);};
   function attempt(){
    if(get(sessionStorage,visitKey)||get(localStorage,dayKey)===today()){put(sessionStorage,visitKey,'checked');cleanup();return;}
    const auth=window.foamAuth;
    if(document.visibilityState==='hidden'||document.querySelector('dialog[open]')||document.documentElement.classList.contains('profile-required-open')||auth?.user&&(auth.loading||auth.dataLoading||!window.FoamProfile.complete(auth.profile)))return;
    show(cfg);put(sessionStorage,visitKey,'shown');cleanup();
   }
   observer=new MutationObserver(attempt);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
   document.addEventListener('visibilitychange',attempt);window.addEventListener('storage',attempt);window.addEventListener('pagehide',cleanup,{once:true});window.addEventListener('foam-auth-change',attempt);attempt();
  }catch{/* A failed notice request must not block the page or mark the notice as read. */}
 }
 function mountSettings(host,row){
  if(L.role!=='admin')return null;
  let saved=normalize(row?.value),stamp=row?.updated_at,exists=!!row,images=structuredClone(saved.images),working=false;
  const section=document.createElement('section');section.className='cms-popup-settings cms-settings-fields';
  section.innerHTML='<h3>站点弹窗</h3><p class="muted">每次新开网站标签页显示一次，刷新和站内跳转不重复显示。读者勾选“今日不再弹出”后，当天不再显示。</p><form id="cms-popup-form"><fieldset><label class="cms-check"><input name="enabled" type="checkbox"> 启用站点弹窗</label><label class="form-field"><span>弹窗标题</span><input name="title" maxlength="80" required></label><label class="form-field"><span>正文 · 支持 Markdown</span><textarea name="body" rows="9" maxlength="20000" placeholder="填写通知正文，可使用标题、列表、链接和图片。"></textarea></label><div class="cms-popup-upload"><label class="button secondary">上传图片<input type="file" name="upload" accept="image/png,image/jpeg,image/webp" multiple hidden></label><span class="muted">最多 12 张，每张不超过 5 MB</span></div><div class="cms-popup-image-list"></div><div class="admin-actions"><button class="button" type="submit">保存弹窗设置</button><button class="button secondary" type="button" data-popup-preview>预览弹窗</button><button class="text-button" type="reset">取消修改</button></div></fieldset><p class="form-status" role="status" aria-live="polite"></p></form>';
  host.append(section);const f=section.querySelector('form'),fields=f.querySelector('fieldset'),list=f.querySelector('.cms-popup-image-list'),status=f.querySelector('.form-status');
  const draft=()=>normalize({enabled:f.elements.enabled.checked,title:f.elements.title.value.trim(),body:f.elements.body.value.trim(),images});
  const dirty=()=>section.isConnected&&(working||JSON.stringify(draft())!==JSON.stringify(saved));
  function paint(){
   list.innerHTML=images.map((img,i)=>'<div class="cms-popup-image-row"><img src="'+esc(img.url)+'" alt="'+esc(img.alt)+'" loading="lazy"><label class="form-field"><span>图片 '+(i+1)+' 说明</span><input data-popup-alt="'+i+'" maxlength="160" value="'+esc(img.alt)+'"></label><div class="cms-popup-image-actions"><button class="text-button" type="button" data-popup-image="up" data-index="'+i+'" aria-label="上移图片 '+(i+1)+'" '+(!i?'disabled':'')+'>↑</button><button class="text-button" type="button" data-popup-image="down" data-index="'+i+'" aria-label="下移图片 '+(i+1)+'" '+(i===images.length-1?'disabled':'')+'>↓</button><button class="text-button" type="button" data-popup-image="insert" data-index="'+i+'">插入正文</button><button class="text-button" type="button" data-popup-image="remove" data-index="'+i+'">移除</button></div></div>').join('');
  }
  function reset(){f.elements.enabled.checked=saved.enabled;f.elements.title.value=saved.title;f.elements.body.value=saved.body;images=structuredClone(saved.images);paint();status.textContent='';}
  const lock=value=>{working=value;fields.disabled=value;};
  list.oninput=e=>{if(e.target.hasAttribute('data-popup-alt'))images[Number(e.target.dataset.popupAlt)].alt=e.target.value;};
  list.onclick=e=>{
   const b=e.target.closest('[data-popup-image]');if(!b||working)return;const i=Number(b.dataset.index),op=b.dataset.popupImage;
   if(op==='insert'){
    const image=images[i],text='\n\n!['+image.alt.replace(/[\[\]\\\r\n]/g,' ')+'](<'+image.url.replace(/[<>]/g,c=>encodeURIComponent(c))+'>)\n\n',body=f.elements.body;
    if(body.value.length+text.length>20000){status.textContent='正文最多 20000 字，请缩短后再插入。';return;}
    body.setRangeText(text,body.selectionStart,body.selectionEnd,'end');body.focus();images.splice(i,1);
   }else if(op==='remove')images.splice(i,1);
   else{const next=i+(op==='up'?-1:1);if(next<0||next>=images.length)return;[images[i],images[next]]=[images[next],images[i]];}
   paint();
  };
  f.elements.upload.onchange=async e=>{
   const files=[...e.target.files];e.target.value='';if(!files.length||working)return;
   if(images.length+files.length>12){status.textContent='最多添加 12 张图片，请先移除多余图片。';return;}
   const types={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
   if(files.some(file=>!types[file.type]||!file.size||file.size>5*1024*1024)){status.textContent='请选择不超过 5 MB 的 PNG、JPEG 或 WebP 图片。';return;}
   lock(true);let uploaded=0;
   try{for(const file of files){status.textContent='正在上传图片 '+(uploaded+1)+' / '+files.length+'…';const path='library/site-popup-'+crypto.randomUUID()+'.'+types[file.type];L.check(await L.client.storage.from('foamlab-resources').upload(path,file,{contentType:file.type,upsert:false}));const url=imageURL(L.client.storage.from('foamlab-resources').getPublicUrl(path).data.publicUrl);if(!url)throw Error('未取得有效图片地址。');images.push({url,alt:file.name.slice(0,160)});uploaded++;paint();}status.textContent='已上传 '+uploaded+' 张图片，保存设置后生效。';}
   catch(error){status.textContent=(uploaded?'已保留 '+uploaded+' 张已上传图片。':'')+'上传失败：'+error.message;}
   finally{lock(false);}
  };
  f.querySelector('[data-popup-preview]').onclick=()=>show(draft(),true);
  f.onreset=e=>{e.preventDefault();if(!working)reset();};
  f.onsubmit=async e=>{
   e.preventDefault();if(working||!f.reportValidity())return;const value=draft();
   if(value.enabled&&!value.body.trim()&&!value.images.length){status.textContent='请填写正文或上传图片后再启用弹窗。';return;}
   lock(true);status.textContent='正在保存…';
   try{
    const data={key,value,updated_at:new Date().toISOString()};let request;
    if(exists){request=L.client.from('foamlab_settings').update(data).eq('key',key);if(stamp)request=request.eq('updated_at',stamp);}
    else request=L.client.from('foamlab_settings').insert(data);
    const rows=L.check(await request.select('key,value,updated_at'));if(!rows?.length)throw Error('设置已被其他管理员修改，请保留正文并重新打开站点设置后核对。');
    saved=normalize(rows[0].value);stamp=rows[0].updated_at;exists=true;status.textContent=value.enabled?'弹窗设置已保存并启用。':'弹窗设置已保存，当前已关闭。';
   }catch(error){status.textContent='保存失败，当前内容已保留。'+(error.code==='23505'?'其他管理员已创建弹窗设置，请重新打开后核对。':error.message);}
   finally{lock(false);}
  };
  reset();return {isDirty:dirty,isBusy:()=>working};
 }
 window.FoamSitePopup={mountSettings};void start();
})();
