// Apply saved appearance before the first paint; controls load without blocking HTML.
(() => {
 const root=document.documentElement;
 root.classList.add('has-js');
 const today=new Date();
 const defaultPalette=today.getMonth()===9&&today.getDate()===31?'halloween':'green';
 root.dataset.defaultPalette=defaultPalette;
 let theme='system',palette=defaultPalette,width=null,collapsed=false;
 try{theme=localStorage.getItem('foamlab.theme')||'system';palette=localStorage.getItem('foamlab.palette')||defaultPalette;width=Number(localStorage.getItem('foamlab.sidebarWidth'));collapsed=localStorage.getItem('foamlab.sidebarCollapsed')==='1';}catch{}
 root.dataset.theme=['light','dark'].includes(theme)?theme:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
 root.dataset.palette=['green','blue','pink','lavender','beige','halloween'].includes(palette)?palette:defaultPalette;
 root.style.colorScheme=root.dataset.theme;
 const backgrounds={green:{light:'#f6f5f0',dark:'#111816'},blue:{light:'#f3f5f8',dark:'#111821'},pink:{light:'#faf4f5',dark:'#20171c'},lavender:{light:'#f6f4fa',dark:'#1b1723'},beige:{light:'#faf6ed',dark:'#201c15'},halloween:{light:'#fcf4e9',dark:'#1b1621'}};
 document.querySelectorAll('meta[name="theme-color"]').forEach(meta=>meta.content=backgrounds[root.dataset.palette][root.dataset.theme]);
 root.classList.toggle('sidebar-collapsed',collapsed);
 if(innerWidth>=761&&Number.isFinite(width)&&width>=200)root.style.setProperty('--sidebar',Math.round(Math.max(200,Math.min(480,Math.floor(innerWidth*.38),width)))+'px');
})();
