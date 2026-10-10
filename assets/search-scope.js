'use strict';
(() => {
 const root=document.querySelector('#search-scope'),child=document.querySelector('#search-subscope');
 if(!root||!child)return;
 let nodes=[];const groups=new Map(),matchers=new Map();
 const excluded=new Set(['home','town','community','internal']);
 const option=(value,label)=>{const el=document.createElement('option');el.value=value;el.textContent=label;return el;};
 const selected=()=>child.value||root.value;
 const descendants=key=>{if(groups.has(key))return groups.get(key);const found=[],seen=new Set();function visit(n){if(!n||seen.has(n.id))return;seen.add(n.id);found.push(n);nodes.filter(x=>x.parent_id===n.id).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).forEach(visit);}visit(nodes.find(n=>n.key===key));groups.set(key,found);return found;};
 function children(){const value=child.value,items=root.value?descendants(root.value).filter(n=>n.key!==root.value):[];child.replaceChildren(option('','全部子模块'));
  for(const n of items){const names=[n.name];let p=nodes.find(x=>x.id===n.parent_id);while(p&&p.key!==root.value){names.unshift(p.name);p=nodes.find(x=>x.id===p.parent_id);}child.append(option(n.key,names.join(' / ')));}
  child.value=items.some(n=>n.key===value)?value:'';child.closest('label').hidden=!items.length;
 }
 function populate(items){groups.clear();matchers.clear();const value=root.value;const byId=new Map(items.map(n=>[n.id,n]));nodes=items.filter(n=>{const seen=new Set();for(let p=n;p;p=byId.get(p.parent_id)){if(p.visible===false||seen.has(p.id))return false;seen.add(p.id);}return true;});root.replaceChildren(option('','全站'));
  for(const n of nodes.filter(n=>!n.parent_id&&!excluded.has(n.key)))root.append(option(n.key,n.name));
  root.value=nodes.some(n=>n.key===value)?value:'';children();
 }
 const api=window.FoamSearchScope={key:selected,label:()=>child.value?child.selectedOptions[0].textContent:root.selectedOptions[0]?.textContent||'全站',
  matches(item,key=selected()){
   if(!key)return true;if(!matchers.has(key)){const group=descendants(key);matchers.set(key,{ids:new Set(group.map(n=>n.id)),prefixes:group.filter(n=>n.href&&n.href!=='/'&&!n.href.includes('?')).map(n=>n.href)});}const {ids,prefixes}=matchers.get(key);
   if(item.section_ids?.some(id=>ids.has(id))||item.scope_keys?.includes(key))return true;
   return prefixes.some(prefix=>(item.canonical_path||item.url||'').startsWith(prefix));
  },
  set(key){const item=nodes.find(n=>n.key===key);if(!item){root.value='';child.value='';children();return;}let parent=item;while(parent.parent_id){const next=nodes.find(n=>n.id===parent.parent_id);if(!next)break;parent=next;}root.value=parent.key;children();child.value=key===parent.key?'':key;},
  ready:null};
 root.addEventListener('change',()=>{child.value='';children();document.dispatchEvent(new Event('foamlab:search-scope'));});
 child.addEventListener('change',()=>document.dispatchEvent(new Event('foamlab:search-scope')));
 async function useLive(){try{const D=window.FoamDirectory;if(!D)return;await D.ready;if(D.available)populate(D.nodes.filter(n=>D.isVisible(n)));}catch{}}
 document.addEventListener('foamlab:directory-init',useLive);
 api.ready=(async()=>{
  try{const r=await fetch('/assets/search-scopes.json');if(r.ok)populate(await r.json());}catch{}
  // The published directory also includes modules added through the editor.
  await useLive();
 })();
})();
