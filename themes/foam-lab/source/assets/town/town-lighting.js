'use strict';
(() => {
 const root=document.querySelector('#town-app');if(!root)return;
 const key='foamlab.town.lighting',names={auto:'自动',dawn:'清晨',day:'白天',dusk:'傍晚',night:'夜晚'};
 const hours={dawn:6.5,day:12,dusk:18.5,night:22};let mode='auto';
 try{const value=localStorage.getItem(key);if(value in names)mode=value;}catch{}
 const anchors=[[0,.66,.85,.02,12],[5,.65,.76,.08,2],[6.5,.92,.85,.13,-5],[8,1,.97,0,0],[16,1,.97,0,0],[18,.85,.9,.23,-8],[19.5,.65,.78,.13,1],[21,.66,.85,.02,12],[24,.66,.85,.02,12]];
 function state(hour){const period=hour>=5&&hour<8?'dawn':hour>=8&&hour<17?'day':hour>=17&&hour<20?'dusk':'night';const end=anchors.findIndex(a=>a[0]>hour),a=anchors[Math.max(0,end-1)],b=anchors[end<0?anchors.length-1:end],t=(hour-a[0])/Math.max(.01,b[0]-a[0]);return{period,values:a.slice(1).map((v,i)=>v+(b[i+1]-v)*t)};}
 function update(now=new Date()){
  const hour=mode==='auto'?now.getHours()+now.getMinutes()/60:hours[mode],s=state(hour);root.dataset.period=s.period;root.dataset.lighting=mode;
  for(const [i,key]of ['brightness','saturation','sepia','hue'].entries())root.style.setProperty('--town-'+key,String(s.values[i])+(key==='hue'?'deg':''));
  root.style.setProperty('--town-lamp-opacity',String(s.period==='night'?1:s.period==='dusk'?.72:s.period==='dawn'?.35:0));
  const text=names[s.period]+' · '+new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
  const label=root.querySelector('#town-game-clock');if(label){label.textContent=text;label.title=mode==='auto'?'按设备时间自动变化':'光照预览：'+names[mode]+'；时钟为设备时间';}
  const button=root.querySelector('[data-town=theme]');if(button){button.setAttribute('aria-label','光照：'+names[mode]+'，点击设置');button.title='光照：'+names[mode];const span=button.querySelector('span');if(span)span.textContent=mode==='auto'?'光照':names[mode];}
 }
 function set(value){if(!(value in names))return;mode=value;try{localStorage.setItem(key,mode);}catch{}update();}
 window.addEventListener('storage',e=>{if(e.key===key){mode=e.newValue in names?e.newValue:'auto';update();}});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
 setInterval(()=>{if(!document.hidden)update();},30000);update();
 window.FoamTownLighting={update,set,get mode(){return mode;},state};
})();
