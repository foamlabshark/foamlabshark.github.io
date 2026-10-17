'use strict';
(() => {
 const mark=window.foamPandaArt(true);
 const namedPrefix=/^\s*熊猫说(?:\s*[：:]\s*|\s*$)/;
 const containers='blockquote,.tip,.callout-tip,.note,.panda-note';
 function headingIcon(el){
  if(!el.querySelector(':scope > .panda-face'))el.insertAdjacentHTML('afterbegin',mark);
  el.classList.add('panda-note-heading');
 }
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
  // Explicit Panda notes also occur as plain paragraphs or section headings.
  // Preserve their original content, links, formulas and heading anchors.
  document.querySelectorAll('.prose p,.prose h2,.prose h3,.prose h4,.prose h5,.prose h6,.prose summary').forEach(el=>{
   if(!namedPrefix.test(el.textContent)||el.closest('pre,code,.lab-preview,.panda-note-label'))return;
   if(el.closest(containers))return;
   if(el.matches('p')){const note=document.createElement('aside');note.className='note';el.before(note);note.append(el);}
   else headingIcon(el);
  });
  // Restyle a few existing operational explanations without adding duplicate prose.
  const starts=['第一行适用于安装到该路径的 Ubuntu 软件包。','本例是二维方腔。','cp -r 复制整个目录','计算会频繁读写文件，Linux 本地目录','终端显示乱码时，检查文件编码','在另一个终端进入同一算例，执行 tail -f','修改一处打印文本，重新编译并运行。'];
  document.querySelectorAll('.prose > p').forEach(p=>{if(starts.some(s=>p.textContent.trim().startsWith(s))&&!p.closest('.panda-note')){const note=document.createElement('aside');note.className='note';p.before(note);note.append(p);}});
  // Only explicit short learning tips, never source quotations or warnings.
  document.querySelectorAll('.prose blockquote,.prose .tip,.prose .callout-tip,.prose .note,.prose .panda-note').forEach(el=>{
   if(el.closest('pre,code,.lab-preview'))return;
   const existing=el.querySelector(':scope > .panda-note-label');
   if(existing){headingIcon(existing);el.dataset.pandaNote='true';el.classList.add('panda-note');return;}
   const first=el.firstElementChild,lead=first?.querySelector(':scope > strong:first-child');
   const named=(first?.textContent||el.textContent).match(namedPrefix);
   const explicit=el.matches('.tip,.callout-tip,.note');
   if(!named&&(el.querySelector('pre,figure,table')||el.textContent.length>450))return;
   if(!named&&!explicit&&!(lead&&/^(提示|小提示|小技巧|操作提示|学习提示)[：:]?$/.test(lead.textContent.trim())))return;
   el.dataset.pandaNote='true';el.classList.add('panda-note');
   if(named){
    // The match and removal must use the same subtree: indentation before
    // the first element is not part of the visible title.
    const prefixHost=first||el;
    removePrefix(prefixHost,named[0].length);
    if(first&&!first.id&&!first.textContent.trim()&&!first.querySelector('img,svg,math,code'))first.remove();
   }else if(lead)lead.remove();
   const label=document.createElement('div');label.className='panda-note-label panda-note-heading';label.innerHTML=mark+'<span>熊猫说</span>';el.prepend(label);
  });
 }
 enhance();window.addEventListener('foamlab:content-ready',enhance);document.addEventListener('foamlab:content-ready',enhance);
 const main=document.querySelector('main');if(main){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance();});}).observe(main,{childList:true,subtree:true});}
})();
