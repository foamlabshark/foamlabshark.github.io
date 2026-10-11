/* Shared by the static renderer and live articles. Only dictionary whitespace
 * is changed; strings, directives and embedded source remain opaque tokens. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FoamDictionaryFormat=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const languages=new Set(['foam','openfoam','dict']);
 function tokens(source){
  const result=[];let i=0,gap='';
  function quoted(start){const quote=source[start];let end=start+1;while(end<source.length){if(source[end]==='\\'){end+=2;continue;}if(source[end++]===quote)break;}return end;}
  function balanced(start,open,close){let end=start,depth=0;while(end<source.length){if(source[end]==='"'||source[end]==="'"){end=quoted(end);continue;}if(source.startsWith('//',end)){const n=source.indexOf('\n',end);end=n<0?source.length:n;continue;}if(source.startsWith('/*',end)){const n=source.indexOf('*/',end+2);end=n<0?source.length:n+2;continue;}if(source[end]===open)depth++;if(source[end++]===close&&!--depth)return end;}return end;}
  while(i<source.length){
   if(/\s/.test(source[i])){gap+=source[i++];continue;}
   const start=i;let type='word';
   if(source.startsWith('//',i)){const n=source.indexOf('\n',i);i=n<0?source.length:n;type='line-comment';}
   else if(source.startsWith('/*',i)){const n=source.indexOf('*/',i+2);i=n<0?source.length:n+2;type='comment';}
   else if(source.startsWith('#{',i)){const n=source.indexOf('#}',i+2);i=n<0?source.length:n+2;type='verbatim';}
   else if(source[i]==='"'||source[i]==="'"){i=quoted(i);}
   else if(source.startsWith('${',i)){i=balanced(i+1,'{','}');}
   else if(source[i]==='['){i=balanced(i,'[',']');}
   else if(/^#(?:eval|calc)\s*\{/.test(source.slice(i))){const n=source.indexOf('{',i);i=balanced(n,'{','}');}
   else if(/^#(?:include\w*|inputMode|remove)\b/.test(source.slice(i))){const n=source.indexOf('\n',i);i=n<0?source.length:n;type='directive';}
   else if('{}();'.includes(source[i])){type=source[i++];}
   else {while(i<source.length&&!/[\s{}();\[\]]/.test(source[i]))i++;
    // Function-style scheme keys and expressions, e.g. div(phi,U), are words.
    if(i>start&&source[i]==='('&&/^[A-Za-z_$][\w.$]*$/.test(source.slice(start,i)))i=balanced(i,'(',')');
    if(i===start)i++;
   }
   result.push({text:source.slice(start,i),type,gap,start,end:i});gap='';
  }
  return result;
 }
 function isDictionary(source,language){
  const lang=String(language||'').toLowerCase();if(languages.has(lang))return true;
  if(lang&&!['text','plaintext','txt','cpp','c++'].includes(lang))return false;
  if(/\b(?:fvm::|fvc::|forAll\s*\(|std::|int\s+main|const\s+(?:scalar|vector))|#include\s*[<"]/.test(source))return false;
  return /\b(?:FoamFile|boundaryField|internalField|ddtSchemes)\b/.test(source)||/\b(?:transportModel|simulationType|nCorrectors|convertToMeters)\s+[^;\n]+;/.test(source)||/\btype\s+\w+\s*;/.test(source)&&/[{}]/.test(source);
 }
 function format(source,language){
  source=String(source);if(!isDictionary(source,language))return source;
  const ts=tokens(source),stack=[];
  for(let i=0;i<ts.length;i++){
   if(ts[i].type==='(')stack.push(i);
   else if(ts[i].type===')'&&stack.length){const start=stack.pop(),inner=ts.slice(start+1,i);ts[start].close=i;
    ts[start].multiline=inner.some(t=>['{','(','line-comment','directive'].includes(t.type))||inner.some(t=>t.gap.includes('\n'));
   }
  }
  const lines=[];let line='',depth=0;const groups=[];
  function flush(){if(line.trim()){lines.push('    '.repeat(Math.max(0,depth))+line.trimEnd());line='';}}
  function append(text,space=true){if(line&&space&&!/\s$/.test(line))line+=' ';line+=text;}
  for(let i=0;i<ts.length;i++){
   const t=ts[i],next=ts[i+1];
   if(t.type==='('&&!t.multiline&&t.close!==undefined){
    if(groups.at(-1)==='('&&/^\(/.test(line))flush();
    append(source.slice(t.start,ts[t.close].end).replace(/\s*\n\s*/g,' '),!!t.gap);i=t.close;continue;
   }
   if(t.type==='{'){flush();append('{');flush();depth++;groups.push('{');}
   else if(t.type==='}'){flush();if(groups.at(-1)==='{')groups.pop();depth=Math.max(0,depth-1);append('}');if(next?.type!==';')flush();}
   else if(t.type==='('){flush();append('(');flush();depth++;groups.push('(');}
   else if(t.type===')'){flush();if(groups.at(-1)==='(')groups.pop();depth=Math.max(0,depth-1);append(')');if(next?.type!==';')flush();}
   else if(t.type===';'){append(';',false);if(!(next&&['line-comment','comment'].includes(next.type)&&!next.gap.includes('\n')))flush();}
   else if(t.type==='line-comment'){if(t.gap.includes('\n'))flush();append(t.text);flush();}
   else if(t.type==='directive'){flush();append(t.text);flush();}
   else if(t.type==='comment'||t.type==='verbatim'){
    if(t.gap.includes('\n'))flush();append(t.text);if(t.type==='comment'&&(ts[i-1]?.type===';'||t.text.includes('\n')||next?.gap.includes('\n')))flush();
   }
   else {
    if(t.gap.includes('\n'))flush();
    // Multiple blockMesh hex entries are separate list items.
    if(groups.at(-1)==='('&&t.text==='hex'&&/^hex\b/.test(line))flush();
    append(t.text,!!t.gap);
   }
  }
  flush();return lines.join('\n')+(/\r?\n$/.test(source)?'\n':'');
 }
 return {format,isDictionary,tokens};
});
