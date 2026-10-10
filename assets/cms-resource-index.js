'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FoamResourceIndex=api;})(globalThis,()=>{
 const decoded=text=>{try{return decodeURI(text);}catch{return text;}};
 const canonical=(url,origin)=>{try{return new URL(url,origin).href;}catch{return '';}};
 function candidates(file,origin){
  const absolute=canonical(file.url,origin);if(!absolute)return [];
  const parsed=new URL(absolute),local=parsed.origin===new URL(origin).origin?parsed.pathname:null;
  return [...new Set([file.url,absolute,local].filter(Boolean).flatMap(url=>[url,decoded(url)]))];
 }
 function text(row){return JSON.stringify([row.metadata,row.cover_url,row.body]).replaceAll('&amp;','&');}
 function references(file,rows,origin){
  const patterns=candidates(file,origin);return rows.filter(row=>{const raw=text(row),plain=decoded(raw);return patterns.some(url=>raw.includes(url)||plain.includes(url));});
 }
 async function build(files,rows,{origin,signal,progress=()=>{},yieldControl=()=>new Promise(resolve=>setTimeout(resolve,0))}={}){
  const nodes=[{edges:new Map(),fail:0,outputs:[]}],matches=files.map(()=>[]);
  let lastYield=performance.now();
  const check=()=>{if(signal?.aborted){const error=new Error('Reference indexing cancelled');error.name='AbortError';throw error;}};
  const yieldIfNeeded=async()=>{check();if(performance.now()-lastYield>=12){await yieldControl();lastYield=performance.now();check();}};
  // One multi-pattern scan preserves the former substring matching, including
  // encoded URLs, local paths and links appearing in an article's prose.
  for(let i=0;i<files.length;i++){
   for(const pattern of candidates(files[i],origin)){
    let state=0;for(const ch of pattern){if(!nodes[state].edges.has(ch)){nodes[state].edges.set(ch,nodes.length);nodes.push({edges:new Map(),fail:0,outputs:[]});}state=nodes[state].edges.get(ch);}
    if(!nodes[state].outputs.includes(i))nodes[state].outputs.push(i);
   }
   if(i%100===0)await yieldIfNeeded();
  }
  const queue=[...nodes[0].edges.values()];
  for(let head=0;head<queue.length;head++){
   const state=queue[head];for(const [ch,next]of nodes[state].edges){
    let failure=nodes[state].fail;while(failure&&!nodes[failure].edges.has(ch))failure=nodes[failure].fail;
    nodes[next].fail=nodes[failure].edges.get(ch)||0;
    nodes[next].outputs=[...new Set([...nodes[next].outputs,...nodes[nodes[next].fail].outputs])];queue.push(next);
   }
   if(head%2000===0)await yieldIfNeeded();
  }
  async function scan(value,found){
   let state=0,count=0;for(const ch of value){
    while(state&&!nodes[state].edges.has(ch))state=nodes[state].fail;
    state=nodes[state].edges.get(ch)||0;for(const i of nodes[state].outputs)found.add(i);
    if(++count%16384===0)await yieldIfNeeded();
   }
  }
  for(let i=0;i<rows.length;i++){
   check();const row=rows[i],raw=text(row),plain=decoded(raw),found=new Set();
   await scan(raw,found);if(plain!==raw)await scan(plain,found);
   for(const fileIndex of found)matches[fileIndex].push(row.id);
   if(i%20===0||i===rows.length-1){progress(i+1,rows.length);await yieldIfNeeded();}
  }
  return new Map(files.map((file,i)=>[canonical(file.url,origin),matches[i]]));
 }
 return {canonical,decoded,references,build};
});
