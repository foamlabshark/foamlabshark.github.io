'use strict';
(() => {
 const main=document.querySelector('main'),url=new URL(location.href);
 // Count reading pages only. Directory cards and account/admin interfaces are
 // navigation surfaces; their visits are already covered by the site statistics.
 const isReadingPage=main?.querySelector('article.article')||(url.pathname==='/community/'&&url.searchParams.get('topic'));
 if(!isReadingPage)return;
 const box=document.createElement('div');box.className='page-view-stat';box.dataset.pageViews='';box.dataset.state='loading';
 box.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg><span>浏览 <span data-page-view-count>—</span> 次</span>';
 const hint='同一次访问中，本页只计一次；刷新不增加浏览数。从功能上线起累计。';box.title=hint;
 const count=box.querySelector('[data-page-view-count]'),states=new Map(),ackKey='foamlab.page-views.counted';let current='',queued=false,ready=false,visit=null;
 function acknowledgements(){try{const row=JSON.parse(localStorage.getItem(ackKey)||'null');return row?.visit===visit&&Array.isArray(row.pages)?row.pages:[];}catch{return [];}}
 function remember(key){try{localStorage.setItem(ackKey,JSON.stringify({visit,pages:[...new Set([...acknowledgements(),key])]}));}catch{}}
 function showCount(value){if(count.textContent!==value)count.textContent=value;}
 function identity(){
  const url=new URL(location.href),slug=document.querySelector('.article[data-cms-slug]')?.dataset.cmsSlug||(url.pathname==='/read/'?url.searchParams.get('slug'):'');
  if(slug)return 'content:'+slug;
  if(url.pathname==='/community/'&&url.searchParams.has('topic'))return 'topic:'+url.searchParams.get('topic');
  const D=window.FoamDirectory;let node=D?.available?D.current():null;
  if(node&&new URL(D.url(node),location.origin).hash)node=D.ancestors(node.id).reverse().find(n=>!new URL(D.url(n),location.origin).hash);
  if(node&&!/^\/(?:account|admin|studio|notes)\//.test(url.pathname))return 'section:'+node.id;
  if(url.pathname==='/section/'&&url.searchParams.has('id'))return 'section:'+url.searchParams.get('id');
  return 'path:'+url.pathname.replace(/\/index\.html$/,'/');
 }
 function mount(){
  const title=main.querySelector('article.article h1,article.lab-topic h1');
  if(!title){box.remove();return false;}
  if(title.nextElementSibling!==box)title.after(box);
  return true;
 }
 async function update(force=false){
  if(!mount()||!ready)return;
  const key=identity();
  if(key!==current){current=key;showCount('—');box.dataset.state='loading';}
  let state=states.get(key);if(!state){state={id:visit,counted:acknowledgements().includes(key),busy:false,at:0};states.set(key,state);}
  if(Number.isSafeInteger(state.views)&&box.dataset.state!=='unavailable')showCount(state.views.toLocaleString('zh-CN'));
  if(state.busy||document.hidden||(!force&&state.at&&Date.now()-state.at<30000))return;
  const client=window.foamAuth?.client;if(!client)return;
  state.busy=true;
  try{
   const {data,error}=await client.rpc('foamlab_page_views',{p_page:key,p_view:state.counted?null:state.id});
   if(error||!Number.isSafeInteger(data?.views)||data.views<0)throw error||Error('Unavailable count');
   state.counted=true;remember(key);state.views=data.views;state.at=Date.now();
   if(current===key){showCount(data.views.toLocaleString('zh-CN'));box.dataset.state='ready';box.title=hint;}
  }catch{
   state.at=Date.now();if(current===key){showCount('—');box.dataset.state='unavailable';box.title='浏览数暂时无法读取，稍后自动重试';}
  }finally{state.busy=false;}
 }
 function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;void update();});}
 new MutationObserver(()=>{mount();schedule();}).observe(main,{childList:true,subtree:true});
 for(const name of ['foamlab:content-ready','foamlab:article-locked'])document.addEventListener(name,schedule);
 window.addEventListener('foam-auth-change',()=>{for(const state of states.values())state.at=0;schedule();});
 window.addEventListener('popstate',schedule);
 window.addEventListener('pageshow',e=>{if(e.persisted)void initialize();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void update(true);});
 window.addEventListener('online',()=>void update(true));
 setInterval(()=>void update(true),30000);
 mount();
 async function initialize(){
  ready=false;await window.foamAuth?.ready;await window.FoamDirectory?.ready;
  const next=await window.FoamSiteVisit?.get();if(!next)return;
  if(next!==visit){visit=next;states.clear();current='';}ready=true;void update();
 }
 void initialize();
})();
