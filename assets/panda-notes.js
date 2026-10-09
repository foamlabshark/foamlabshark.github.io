'use strict';
(() => {
 const mark=window.foamPandaArt(true);
 function removePrefix(element,length){
  const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
  let node=walker.nextNode(),remaining=length;
  while(node&&remaining>0){
   const count=Math.min(node.textContent.length,remaining);
   node.textContent=node.textContent.slice(count);remaining-=count;
   node=walker.nextNode();
  }
  element.querySelectorAll('strong,b').forEach(el=>{if(!el.textContent.trim())el.remove();});
 }
 function enhance(){
  // Restyle a few existing operational explanations without adding duplicate prose.
  const starts=['第一行适用于安装到该路径的 Ubuntu 软件包。','本例是二维方腔。','cp -r 复制整个目录','计算会频繁读写文件，Linux 本地目录','终端显示乱码时，检查文件编码','在另一个终端进入同一算例，执行 tail -f','修改一处打印文本，重新编译并运行。'];
  document.querySelectorAll('.prose > p').forEach(p=>{if(starts.some(s=>p.textContent.trim().startsWith(s))&&!p.closest('.panda-note')){const note=document.createElement('aside');note.className='note';p.before(note);note.append(p);}});
  // Only explicit short learning tips, never source quotations or warnings.
  document.querySelectorAll('.prose blockquote,.prose .tip,.prose .callout-tip,.prose .note').forEach(el=>{
   if(el.dataset.pandaNote)return;
   const first=el.firstElementChild,lead=first?.querySelector(':scope > strong:first-child');
   const named=el.textContent.match(/^\s*熊猫说\s*[：:]\s*/);
   const explicit=el.matches('.tip,.callout-tip,.note');
   if(!named&&(el.querySelector('pre,figure,table')||el.textContent.length>450))return;
   if(!named&&!explicit&&!(lead&&/^(提示|小提示|小技巧|操作提示|学习提示)[：:]?$/.test(lead.textContent.trim())))return;
   el.dataset.pandaNote='true';el.classList.add('panda-note');
   if(named)removePrefix(el,named[0].length);else if(lead)lead.remove();
   const label=document.createElement('div');label.className='panda-note-label';label.innerHTML=mark+'<span>熊猫说</span>';el.prepend(label);
  });
 }
 enhance();window.addEventListener('foamlab:content-ready',enhance);document.addEventListener('foamlab:content-ready',enhance);
 const main=document.querySelector('main');if(main){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance();});}).observe(main,{childList:true,subtree:true});}
})();
