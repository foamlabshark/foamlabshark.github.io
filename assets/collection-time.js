'use strict';
(() => {
 const format=new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
 window.FoamCollectionTime=(value,label='获得')=>{const d=value?new Date(value):null;return d&&Number.isFinite(d.getTime())?`<time class="collection-time" datetime="${d.toISOString()}" title="按当前设备时区显示">${label}于 ${format.format(d)}</time>`:'<small class="collection-time">获得时间未记录</small>';};
})();
