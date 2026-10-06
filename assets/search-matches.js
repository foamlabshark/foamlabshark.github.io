'use strict';
// Shared by global search and the town library. No result text becomes HTML.
(() => {
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const terms=q=>[...new Set(q.trim().toLowerCase().split(/\s+/).filter(Boolean))];
 function plain(text){
  const template=document.createElement('template');template.innerHTML=String(text||'');
  template.content.querySelectorAll('script,style,iframe,object,svg,img').forEach(n=>n.remove());
  return template.content.textContent.replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/`([^`]+)`/g,'$1').replace(/\*\*([^*]+)\*\*/g,'$1').replace(/\s+/g,' ').trim();
 }
 function locations(item){
  const D=window.FoamDirectory;
  let paths=D?.available?(item.section_ids||[]).filter(id=>D.get(id)&&D.isVisible(D.get(id))).map(D.path):[];
  if(!paths.length)paths=Array.isArray(item.locations)?item.locations:[];
  if(!paths.length){
   const section=String(item.canonical_path||item.url||'').split('/')[1];
   const labels={commands:'速查手册 / 命令速查',dictionaries:'速查手册 / 配置与字典速查','function-objects':'速查手册 / 函数对象速查','boundary-conditions':'速查手册 / 边界条件速查',reference:'速查手册 / 参考手册',lessons:'系统学习',start:'快速开始'};
   paths=[labels[section]||({lesson:'系统学习',课程:'系统学习',article:'实践与分享',分享:'实践与分享',resource:'资料中心',资料:'资料中心'})[item.kind]||'学习资料'];
  }
  return [...new Set(paths)].map(path=>item.file_path?path+' / '+item.file_path:path);
 }
 function lines(text,q){
  const tokens=terms(q),phrase=q.trim().toLowerCase();
  return [...new Set(String(text||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean))]
   .map((text,i)=>({text,i,hits:tokens.filter(t=>text.toLowerCase().includes(t)).length,phrase:text.toLowerCase().includes(phrase)}))
   .filter(x=>x.hits).sort((a,b)=>Number(b.phrase)-Number(a.phrase)||b.hits-a.hits||a.i-b.i).slice(0,3)
   .map(x=>{const lower=x.text.toLowerCase(),at=Math.min(...tokens.map(t=>lower.indexOf(t)).filter(i=>i>=0)),start=Math.max(0,at-65),end=Math.min(x.text.length,Math.max(start+240,at+phrase.length));return (start?'…':'')+x.text.slice(start,end)+(end<x.text.length?'…':'');});
 }
 function highlight(host,text,q){
  const tokens=terms(q).sort((a,b)=>b.length-a.length),lower=text.toLowerCase();let at=0;
  while(at<text.length){let next=text.length,term='';for(const t of tokens){const i=lower.indexOf(t,at);if(i>=0&&i<next){next=i;term=t;}}host.append(document.createTextNode(text.slice(at,next)));if(!term)break;host.append(el('mark',text.slice(next,next+term.length)));at=next+term.length;}
 }
 function card(item,q){
  const a=el('a','','search-hit');let url;try{url=new URL(item.url,location.origin);}catch{return null;}if(url.origin!==location.origin||!['http:','https:'].includes(url.protocol))return null;a.href=url.pathname+url.search+url.hash;
  const matches=lines(item.text??item.excerpt,q),title=String(item.title||'未命名内容');
  const snippet=el('div','','search-hit-lines');
  for(const line of matches.length?matches:[title]){const p=el('p','','search-hit-line');highlight(p,line,q);snippet.append(p);}
  const meta=el('div','','search-hit-meta');meta.append(el('span',matches.length?'内容匹配':'标题匹配','search-hit-source'),el('span',item.kind||'参考','search-hit-kind'),el('strong',title));
  const context=el('div','','search-hit-context');
  for(const path of locations(item))context.append(el('span',path,'search-hit-path'));
  const intro=plain(item.introduction||item.summary);if(intro)context.append(el('p',intro.length>600?intro.slice(0,600)+'…':intro,'search-hit-intro'));
  a.append(snippet,meta,context);return a;
 }
 window.FoamSearch={terms,lines,highlight,card};
})();
