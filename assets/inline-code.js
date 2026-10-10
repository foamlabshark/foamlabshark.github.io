/* Shared by static articles and the live CMS renderer. */
(function(root){
 'use strict';
 const terms=new Set(typeof module==='object'&&module.exports?require('./inline-terms.js'):root.FoamInlineTerms||[]);
 const skip='a,code,pre,kbd,script,style,textarea,button,h1,h2,h3,h4,h5,h6,svg,math,.katex,.math-formula,.tex-source,[data-foam-math]';
 const prose='p,td,th,li,dd,dt,figcaption,summary';
 // Ambiguous unit symbols use ordinary prose; explicit code and parameter cells
 // still identify a configuration entry with the same spelling.
 const units=new Set(['m','s','ms','kg','g','mm','cm','km','K','N','Pa','kPa','MPa','W','kW','Hz','kHz','MHz','rad','rpm','deg','mol','J','kJ']);
 // Accented Latin letters and combining marks remain part of a word, so a
 // field such as P must not be extracted from Péclet. Chinese prose can still
 // sit directly beside an OpenFOAM keyword without surrounding spaces.
 const wordBoundary=/[\w@.\/\-\p{Script=Latin}\p{M}]/u;
 function parts(text,parameter=false){
  const result=[];let offset=0;
  const pattern=/\$[A-Za-z_][\w]*(?:\/[\w.*-]+)*|--?[A-Za-z][\w-]*|[A-Za-z_][\w]*(?:(?:[.:/]|::)[\w*]+)*/g;
  for(const match of text.matchAll(pattern)){
   const token=match[0],before=text[match.index-1]||'',after=text[match.index+token.length]||'';
   if(wordBoundary.test(before)||wordBoundary.test(after))continue;
   if(!parameter&&units.has(token))continue;
   if(!parameter&&!terms.has(token)&&!/^\$|^--?[A-Za-z]|^(?:system|constant)\//.test(token))continue;
   if(match.index>offset)result.push({text:text.slice(offset,match.index),code:false});
   result.push({text:token,code:true});offset=match.index+token.length;
  }
  if(offset<text.length)result.push({text:text.slice(offset),code:false});
  return result;
 }
 function isParameterHeader(header){return /^(?:参数(?:或结构)?|选项|命令(?:或函数)?|函数|别名|名称|词缀|写法|修正方式|字段|条目|变量|属性|关键字|键|值|取值|类型|边界条件(?:类型)?|边界类型|场|字典|求解器|壁面函数|插值格式|预处理\/光顺器|模型(?:或功能)?|class|type|method)$/.test(String(header||'').trim());}
 function parameterCell(cell){return !!cell&&cell.cellIndex===0&&isParameterHeader(cell.closest('table')?.querySelector('tr')?.cells[0]?.textContent);}
 function decorate(holder){
  const nodes=[],walker=document.createTreeWalker(holder,NodeFilter.SHOW_TEXT);
  while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){const parent=node.parentElement;if(!parent||parent.closest(skip)||!parent.closest(prose))continue;
   const split=parts(node.textContent,parameterCell(parent.closest('td')));if(!split.some(p=>p.code))continue;
   const fragment=document.createDocumentFragment();for(const part of split){const el=part.code?document.createElement('code'):document.createTextNode(part.text);if(part.code)el.textContent=part.text;fragment.append(el);}node.replaceWith(fragment);
  }
 }
 const api={parts,decorate,isParameterHeader,skip,prose};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.FoamInlineCode=api;
})(typeof window==='object'?window:globalThis);
