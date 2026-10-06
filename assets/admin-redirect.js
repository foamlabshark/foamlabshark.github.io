'use strict';
(() => {
 const target=document.querySelector('[data-admin-redirect]')?.dataset.adminRedirect;
 if(['/admin/maintenance/','/admin/design/'].includes(target))location.replace(target);
})();
