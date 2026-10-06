'use strict';
(() => {
 const root=document.querySelector('[data-admin-document]');if(!root)return;
 const L=window.FoamLab,state=document.querySelector('#admin-document-state'),content=document.querySelector('#admin-document-content'),toc=document.querySelector('#admin-document-toc');
 const allowed=new Set(['site-maintenance','site-design']);
 let generation=0;
 const loginMarkup='<p>登录管理员或编辑账号后，可阅读这份文档。</p><button class="button" type="button" data-lab-login>使用 GitHub 登录</button>';
 const clear=()=>{content.replaceChildren();content.hidden=true;toc.replaceChildren();document.querySelector('#admin-document-navigation').hidden=true;state.hidden=false;};
 window.addEventListener('foam-auth-change',event=>{if(!event.detail.user||event.detail.user.id!==L.user?.id){generation++;clear();state.className='admin-gate';if(!event.detail.user)state.innerHTML=loginMarkup;else state.textContent='登录状态已变化，请刷新页面重新验证。';}});
 (async()=>{
  try{
   await L.ready;
   if(!L.user){state.innerHTML=loginMarkup;return;}
   if(L.role!=='admin'){state.innerHTML='<p>这份文档仅向管理员开放。</p><a class="button secondary" href="/account/">返回个人中心</a>';return;}
   document.querySelector('#admin-document-navigation').hidden=false;
   const requestGeneration=generation,requestUser=L.user.id;
   const slug=root.dataset.adminDocument;if(!allowed.has(slug))throw Error('文档地址无效。');
   const item=L.check(await L.client.from('foamlab_content').select('slug,title,body,updated_at').eq('slug',slug).eq('status','draft').contains('metadata',{admin_only:true}).maybeSingle());
   if(requestGeneration!==generation||requestUser!==L.user?.id)return;
   if(!item){state.innerHTML='<p>这份管理文档尚未配置，请在内容库中检查对应草稿。</p><a class="button secondary" href="/admin/">打开管理平台</a>';return;}
   root.querySelector('h1').textContent=item.title;document.title=item.title+' · FoamLab';
   content.innerHTML=L.markdown(item.body);content.hidden=false;
   state.className='article-meta';state.textContent='更新于 '+L.date(item.updated_at);
   toc.innerHTML=[...content.querySelectorAll('h2,h3')].map(h=>'<a href="#'+h.id+'" class="toc-'+h.tagName.toLowerCase()+'">'+L.esc(h.textContent)+'</a>').join('');
  }catch(error){clear();L.error(state,error);}
 })();
})();
