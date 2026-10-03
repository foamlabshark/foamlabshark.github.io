'use strict';
(() => {
 const page=document.querySelector('.account-page');if(!page)return;
 const sections={overview:page.querySelector('.account-quick'),profile:page.querySelector('.profile-editor'),pet:page.querySelector('#my-panda'),town:page.querySelector('#town-account'),progress:page.querySelector('.profile-progress')};
 const names={overview:'概览',profile:'个人资料',pet:'我的熊猫',town:'我的小镇',progress:'学习记录'};
 const hashes={overview:'#overview',profile:'#profile-form',pet:'#my-panda',town:'#town',progress:'#account-progress-state'};
 const nav=document.createElement('nav');nav.className='account-section-nav';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','个人中心导航');
 nav.innerHTML=Object.entries(names).map(([key,label])=>'<button type="button" role="tab" id="account-tab-'+key+'" data-account-tab="'+key+'" aria-controls="account-section-'+key+'">'+label+'</button>').join('');page.querySelector('#account-error').after(nav);
 const panels={};for(const [key,section]of Object.entries(sections)){const panel=document.createElement('section');panel.id='account-section-'+key;panel.className='account-section';panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','account-tab-'+key);panel.hidden=true;panel.append(section);page.append(panel);panels[key]=panel;}
 page.querySelector('.profile-grid')?.remove();
 const overview=document.createElement('div');overview.className='account-overview-cards';overview.innerHTML='<a href="#my-panda"><span>熊猫等级</span><strong id="account-overview-level">—</strong><small>查看成长与收藏 →</small></a><a href="#account-progress-state"><span>已完成课程</span><strong id="account-overview-completed">—</strong><small>查看学习记录 →</small></a><a href="/studio/"><span>我的创作</span><strong>作者工作台</strong><small>发布和管理文章 →</small></a>';panels.overview.prepend(overview);
 function select(key){if(!panels[key])key='overview';for(const [id,panel]of Object.entries(panels)){panel.hidden=id!==key;const tab=nav.querySelector('[data-account-tab="'+id+'"]');tab.setAttribute('aria-selected',String(id===key));tab.tabIndex=id===key?0:-1;}page.dataset.accountSection=key;}
 function restore(){const h=location.hash;select(h.startsWith('#profile')?'profile':h==='#my-panda'||h==='#pet'?'pet':h==='#town'?'town':h.startsWith('#account-progress')||h==='#progress'?'progress':'overview');}
 nav.onclick=e=>{const b=e.target.closest('[data-account-tab]');if(!b)return;history.pushState(null,'',hashes[b.dataset.accountTab]);select(b.dataset.accountTab);};
 nav.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const buttons=[...nav.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);if(i<0)return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].click();buttons[next].focus();};
 const render=()=>{const state=window.foamAuth;document.querySelector('#account-overview-level').textContent=state?.user?(state.pet?.level?'Lv.'+state.pet.level:state.petError?'暂未读取':'读取中…'):'登录后显示';document.querySelector('#account-overview-completed').textContent=state?.user?String(state.progress?.filter(x=>x.completed).length||0):'登录后显示';};
 window.addEventListener('hashchange',restore);window.addEventListener('popstate',restore);window.addEventListener('foam-auth-change',render);window.addEventListener('foam-pet-change',render);
 // Follow links that target an already selected hash without requiring a reload.
 page.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a)queueMicrotask(restore);});
 restore();render();window.foamAuth?.ready.then(render);page.dataset.tabsReady='true';
})();
