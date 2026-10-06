'use strict';
(() => {
 const section=document.querySelector('[data-catalog-redirect]')?.dataset.catalogRedirect;
 const route={authors:'/sharing/',recommendations:'/resources/',algorithms:'/topics/finite-volume/'}[section];if(!route)return;
 const target=new URL(route,location.origin);target.search=location.search;target.hash=location.hash;
 if(section==='recommendations')target.searchParams.set('kind','recommendation');
 location.replace(target.pathname+target.search+target.hash);
})();
