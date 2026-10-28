'use strict';
(() => {
 const mounted=new WeakMap(),bucket='foamlab-community-images',limit=6*1024*1024;
 const types={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'};
 const stickers=[['thanks','谢谢'],['received','收到'],['like','点赞'],['cheer','加油'],['question','疑问'],['happy','开心'],['think','思考'],['respect','抱拳']];
 const emojis=[['😄','开心'],['😂','笑哭'],['🥳','庆祝'],['🤔','思考'],['😅','汗颜'],['😭','流泪'],['😮','惊讶'],['👍','赞'],['👏','鼓掌'],['🙏','感谢'],['🤝','握手'],['💪','加油'],['🎉','礼花'],['❤️','爱心'],['🔥','火'],['🚀','起飞'],['🐼','熊猫'],['👀','关注']];
 let openPicker=null;
 function mediaPosition(text,position){
  const lines=/^[ \t]{0,3}([\u0060]{3,}|~{3,})([^\n]*)(?:\n|$)/gm;let opening=null,match;
  while((match=lines.exec(text))){
   if(!opening){opening={start:match.index,fence:match[1]};continue;}
   if(match[1][0]!==opening.fence[0]||match[1].length<opening.fence.length||match[2].trim())continue;
   if(position>=opening.start&&position<lines.lastIndex)return lines.lastIndex;opening=null;
  }
  return position;
 }
 const within=(task,ms,message)=>{let timer;return Promise.race([task,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(message)),ms);})]).finally(()=>clearTimeout(timer));};
 async function validate(file){
  if(!types[file.type])throw Error('请选择 PNG、JPG、WebP 或 GIF 图片。');
  if(!file.size||file.size>limit)throw Error('每张图片须大于 0 且不超过 6 MB。');
  const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer()),ascii=(start,end)=>String.fromCharCode(...bytes.slice(start,end));
  const valid=file.type==='image/png'?bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10':file.type==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:file.type==='image/gif'?['GIF87a','GIF89a'].includes(ascii(0,6)):ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP';
  if(!valid)throw Error('图片格式与文件内容不符，请重新选择。');
  const url=URL.createObjectURL(file),image=new Image();
  try{await within(new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('这张图片无法读取，请更换文件。'));image.src=url;}),10000,'图片读取超时，请重试。');if(!image.naturalWidth||image.naturalWidth>16000||image.naturalHeight>16000||image.naturalWidth*image.naturalHeight>60000000)throw Error('图片尺寸过大，请缩小后再上传。');}
  finally{URL.revokeObjectURL(url);}
 }
 function mount(form,input){
  if(!form||!input||mounted.has(form))return mounted.get(form);
  const lab=window.FoamLab;if(!lab?.user||lab.role==='blocked')return;
  const owner=lab.user.id,tools=document.createElement('div');tools.className='community-media';tools.innerHTML='<div class="community-media-toolbar" role="group" aria-label="插入图片、表情和代码"><button type="button" class="button secondary" data-media-upload>上传图片</button><button type="button" class="button secondary" data-media-picker aria-expanded="false">表情包</button><button type="button" class="button secondary" data-media-code title="选中文字后点击，可转为代码块">代码块</button><span class="community-media-hint">可粘贴或拖入图片 · 单张最大 6 MB</span><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden></div><section class="community-media-picker" aria-label="选择表情" hidden><div class="community-media-tabs" role="group" aria-label="表情类型"><button type="button" data-media-tab="stickers" aria-pressed="true">熊猫表情包</button><button type="button" data-media-tab="emoji" aria-pressed="false">常用表情</button><button type="button" class="text-button" data-media-close aria-label="关闭表情面板">×</button></div><div class="community-media-options"></div></section><p class="community-media-status" role="status" aria-live="polite"></p>';
  input.closest('.form-field')?.after(tools);if(!tools.isConnected)input.after(tools);
  const picker=tools.querySelector('.community-media-picker'),options=tools.querySelector('.community-media-options'),status=tools.querySelector('[role=status]'),fileInput=tools.querySelector('[type=file]'),toggle=tools.querySelector('[data-media-picker]');
  let busy=false,disposed=false,selection=null;
  const current=()=>!disposed&&form.isConnected&&window.foamAuth?.user?.id===owner&&window.FoamLab?.role!=='blocked';
  const hide=()=>{picker.hidden=true;toggle.setAttribute('aria-expanded','false');if(openPicker===hide)openPicker=null;};
  function insert(text,{replace=false,select=null,media=false}={}){
   if(!current())return;
   const start=media?mediaPosition(input.value,input.selectionEnd):replace?input.selectionStart:input.selectionEnd,end=replace?input.selectionEnd:start;
   if(input.maxLength>0&&input.value.length-(end-start)+text.length>input.maxLength)throw Error('正文已接近字数上限，请删减后再插入。');
   input.setRangeText(text,start,end,'end');if(select)input.setSelectionRange(start+select[0],start+select[1]);
   input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));input.focus({preventScroll:true});
  }
  function choices(kind='stickers'){
   options.replaceChildren();options.classList.toggle('is-emoji',kind==='emoji');
   tools.querySelectorAll('[data-media-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mediaTab===kind)));
   for(const [value,label] of kind==='stickers'?stickers:emojis){
    const button=document.createElement('button');button.type='button';button.className='community-media-choice';button.setAttribute('aria-label',(kind==='stickers'?'熊猫表情：':'表情：')+label);button.title=label;
    if(kind==='stickers'){const img=document.createElement('img');img.src='/assets/community-stickers/panda-'+value+'.svg';img.alt=label;img.loading='lazy';button.append(img);const caption=document.createElement('span');caption.textContent=label;button.append(caption);}
    else button.textContent=value;
    button.onclick=()=>{try{hide();if(selection)input.setSelectionRange(...selection);
      // Accessible emoji markup also permits a single emoji under the shared two-character message minimum.
      insert(kind==='stickers'?'\n\n<img src="/assets/community-stickers/panda-'+value+'.svg" alt="熊猫表情：'+label+'" width="128" height="144">\n\n':'<span role="img" aria-label="'+label+'">'+value+'</span>',{media:true});
     }catch(error){status.textContent=error.message;}};
    options.append(button);
   }
  }
  toggle.onclick=()=>{if(!picker.hidden){hide();return;}selection=[input.selectionStart,input.selectionEnd];openPicker?.();openPicker=hide;choices();picker.hidden=false;toggle.setAttribute('aria-expanded','true');};
  tools.querySelectorAll('[data-media-tab]').forEach(b=>b.onclick=()=>choices(b.dataset.mediaTab));
  tools.querySelector('[data-media-close]').onclick=()=>{hide();toggle.focus({preventScroll:true});};
  tools.addEventListener('keydown',e=>{if(e.key==='Escape'&&!picker.hidden){e.preventDefault();e.stopPropagation();hide();toggle.focus({preventScroll:true});}});
  tools.querySelector('[data-media-code]').onclick=()=>{try{
   hide();const text=input.value.slice(input.selectionStart,input.selectionEnd)||'在这里粘贴代码或运行日志',runs=text.match(/[\u0060]+/g)||[],fence=String.fromCharCode(96).repeat(Math.max(3,...runs.map(v=>v.length+1))),prefix='\n\n'+fence+'text\n';
   insert(prefix+text+'\n'+fence+'\n\n',{replace:true,select:[prefix.length,prefix.length+text.length]});status.textContent='';
  }catch(error){status.textContent=error.message;}};
  async function upload(files){
   if(busy||!current()||input.matches(':disabled')||input.readOnly)return;
   const list=Array.from(files);if(!list.length)return;if(list.length>8){status.textContent='每次最多选择 8 张图片，可分批上传。';return;}
   const submit=[...form.querySelectorAll('[type=submit]')];if(submit.some(b=>b.disabled)){status.textContent='请等待当前发布完成后再上传图片。';return;}
   hide();busy=true;input.readOnly=true;tools.setAttribute('aria-busy','true');
   const locks=[...tools.querySelectorAll('button'),...submit].map(button=>[button,button.disabled]);for(const [button]of locks)button.disabled=true;
   let count=0;const errors=[];
   try{
    for(const [i,file]of list.entries()){
     if(!current())break;status.textContent='正在上传 '+(i+1)+' / '+list.length+'…';
     try{
      await validate(file);if(!current())break;
      const path=owner+'/'+crypto.randomUUID()+'.'+types[file.type],storage=lab.client.storage.from(bucket);
      const result=await within(storage.upload(path,file,{contentType:file.type,cacheControl:'31536000',upsert:false}),25000,'上传尚未确认，请重试。');if(result.error)throw Error(result.error.message||'图片上传失败，请重试。');if(!current())break;
      const url=storage.getPublicUrl(path).data.publicUrl,label=file.name.replace(/[\\[\]<>\r\n]/g,' ').slice(0,70)||'图片';
      insert('\n\n!['+label+']('+url+')\n\n',{media:true});count++;
     }catch(error){errors.push((file.name?file.name+'：':'')+(error.message||'上传失败，请重试。'));}
    }
    if(current())status.textContent=(count?'已插入 '+count+' 张图片，发布后即可显示。':'')+(errors.length?'\n'+errors.join('\n'):'');
   }finally{busy=false;input.readOnly=false;fileInput.value='';tools.removeAttribute('aria-busy');for(const [button,disabled]of locks)if(button.isConnected)button.disabled=disabled;}
  }
  tools.querySelector('[data-media-upload]').onclick=()=>fileInput.click();fileInput.onchange=()=>void upload(fileInput.files);
  input.addEventListener('paste',e=>{const images=[...(e.clipboardData?.files||[])].filter(f=>f.type.startsWith('image/'));if(images.length){e.preventDefault();void upload(images);}});
  input.addEventListener('dragover',e=>{if([...e.dataTransfer.items].some(item=>item.kind==='file'))e.preventDefault();});
  input.addEventListener('drop',e=>{const files=[...(e.dataTransfer?.files||[])];if(files.length){e.preventDefault();void upload(files);}});
  form.addEventListener('submit',e=>{if(busy){e.preventDefault();e.stopImmediatePropagation();status.textContent='图片正在上传，请稍候再发布。';}},true);
  const outside=e=>{if(!tools.isConnected){document.removeEventListener('pointerdown',outside);hide();disposed=true;return;}if(!tools.contains(e.target))hide();};document.addEventListener('pointerdown',outside);
  const result={get busy(){return busy;},dispose(){disposed=true;hide();document.removeEventListener('pointerdown',outside);}};mounted.set(form,result);return result;
 }
 window.FoamCommunityMedia={mount};
})();
