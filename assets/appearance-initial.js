// Apply saved appearance before the first paint; controls load without blocking HTML.
(() => {
 const root=document.documentElement;
 root.classList.add('has-js');
 let theme='system',width=null,collapsed=false;
 try{theme=localStorage.getItem('foamlab.theme')||'system';width=Number(localStorage.getItem('foamlab.sidebarWidth'));collapsed=localStorage.getItem('foamlab.sidebarCollapsed')==='1';}catch{}
 root.dataset.theme=['light','dark'].includes(theme)?theme:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
 root.style.colorScheme=root.dataset.theme;
 root.classList.toggle('sidebar-collapsed',collapsed);
 if(innerWidth>=761&&Number.isFinite(width)&&width>=200)root.style.setProperty('--sidebar',Math.round(Math.max(200,Math.min(480,Math.floor(innerWidth*.38),width)))+'px');
})();
