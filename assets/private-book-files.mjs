const lab=window.FoamLab;
const bucket=()=>lab.client.storage.from('foamlab-private-books');
const valid=key=>/^(assets|downloads|documents)\/[\w.-]+$/.test(key)&&!key.includes('..');
const active=new Map();
function release(element){
 const url=active.get(element);
 if(url){URL.revokeObjectURL(url);active.delete(element);}
}
async function loadFile(key){
 if(!valid(key))throw Error('附件地址无效。');
 await lab.ready;
 if(lab.role!=='admin')throw Error('此附件仅在内部文档中提供。');
 const owner=lab.user?.id;
 const blob=lab.check(await bucket().download('parallel-hpc/'+key));
 if(!owner||owner!==window.foamAuth.user?.id)throw Error('登录状态已变化。');
 return blob;
}
const lazy=new IntersectionObserver(entries=>{
 for(const {target,isIntersecting} of entries)if(isIntersecting){
  lazy.unobserve(target);
  loadFile(target.dataset.privateBookImage).then(blob=>{
   if(!target.isConnected)return;
   const url=URL.createObjectURL(blob);active.set(target,url);target.src=url;
  }).catch(()=>{target.title='内部插图暂时无法读取，请检查登录状态后重试。';});
 }
},{rootMargin:'300px'});
function scan(root){
 if(root.nodeType!==1)return;
 if(root.matches('img[data-private-book-image]'))lazy.observe(root);
 root.querySelectorAll('img[data-private-book-image]').forEach(el=>lazy.observe(el));
}
new MutationObserver(records=>{
 for(const record of records)record.addedNodes.forEach(scan);
 for(const el of active.keys())if(!el.isConnected)release(el);
}).observe(document.body,{childList:true,subtree:true});
scan(document.body);
const clear=()=>{for(const el of active.keys())release(el);};
window.addEventListener('pagehide',clear);
let identity=window.foamAuth.user?.id;
window.addEventListener('foam-auth-change',()=>{if(identity!==window.foamAuth.user?.id){identity=window.foamAuth.user?.id;clear();}});

export async function openFile(host,key){
 host.innerHTML='<p role="status">正在读取内部附件…</p>';
 try{
  const blob=await loadFile(key),filename=key.split('/').pop(),url=URL.createObjectURL(blob);
  const h=document.createElement('h1');h.textContent=filename;
  const download=document.createElement('a');download.className='button';download.href=url;download.download=filename;download.textContent='下载附件';
  active.set(download,url);host.replaceChildren(h,download);
  if(blob.type==='application/pdf'||blob.type.startsWith('image/')){
   const preview=document.createElement('a');preview.className='button secondary';preview.href=url;preview.target='_blank';preview.rel='noopener';preview.textContent='查看原文件';host.append(' ',preview);
  }
 }catch(error){host.replaceChildren();const p=document.createElement('p');p.setAttribute('role','alert');p.textContent=error.message||'附件暂时无法读取。';host.append(p);}
}
