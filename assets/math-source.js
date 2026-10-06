/* Keep formula delimiters intact before Markdown interprets their contents. */
(function(root){
 'use strict';
 // A comparison may contain angle brackets, but a formula cannot cross an
 // HTML closing tag into the next cell or paragraph (for example shell $?).
 const source=/(`{3,}|~{3,})[^\n]*\n[\s\S]*?\1|`+[^`]*`+|<pre\b[^>]*>[\s\S]*?<\/pre>|<code\b[^>]*>[\s\S]*?<\/code>|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|(?<![\\\w])\$(?=\()(?:(?!<\/[A-Za-z])[^$\n"\u3400-\u9fff])+?(?<!\s)\$(?!\w)|(?<![\\\w])\$(?![\s{(])(?:(?!<\/[A-Za-z]|<[A-Za-z][^<>$\n]*=)[^$\n])+?(?<!\s)\$(?!\w)/g;
 const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
 function decode(tex){
  return tex.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(whole,key)=>{
   if(key[0]!=='#')return entities[key.toLowerCase()]||whole;
   const point=key[1].toLowerCase()==='x'?parseInt(key.slice(2),16):Number(key.slice(1));
   return point>0&&point<=0x10ffff&&!(point>=0xd800&&point<=0xdfff)?String.fromCodePoint(point):whole;
  });
 }
 function transform(markdown,render){
  markdown=String(markdown||'').replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi,part=>part.replace(/\r?\n/g,'&#10;'));
  return markdown.replace(source,part=>{
   if(/^(?:`|~|<pre|<code)/.test(part))return part;
   const display=part.startsWith('\\[')||part.startsWith('$$'),n=part.startsWith('$')&&!display?1:2;
   return render({tex:decode(part.slice(n,-n)),display});
  });
 }
 const api={transform};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.FoamMathSource=api;
})(typeof window==='object'?window:globalThis);
