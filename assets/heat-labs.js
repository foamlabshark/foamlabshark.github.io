'use strict';
(() => {
 const ns='http://www.w3.org/2000/svg',green='#287566',gold='#c79854',blue='#36889c';
 let serial=0;
 const control=(id,label,min,max,step,value)=>`<label for="${id}">${label}<input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"><output for="${id}"></output></label>`;
 function mount(el){
  if(el.dataset.mounted)return;el.dataset.mounted='true';
  const key=['resistance','diffusion','exchanger'].find(k=>el.classList.contains('heat-lab-'+k));if(!key)return;const id='heat-'+(++serial)+'-';let raf=0,last=0,playFo=0;
  const controls=key==='resistance'?control(id+'a','热侧 h / W·m⁻²·K⁻¹',5,150,1,20)+control(id+'b','壁厚 L / mm',5,200,1,50)+control(id+'c','导热系数 k / W·m⁻¹·K⁻¹',.1,10,.1,1)+control(id+'d','冷侧 h / W·m⁻²·K⁻¹',5,150,1,10)
   :key==='diffusion'?control(id+'a','Fourier 数 Fo = αt / L²',0,.5,.001,0)+`<button type="button" class="button secondary" data-play>播放扩散</button>`
   :control(id+'a','NTU = UA / Cmin',0,5,.05,1)+control(id+'b','热容量比 Cr',.05,1,.01,.5)+`<label for="${id}mode">流向<select id="${id}mode"><option value="counter">逆流</option><option value="parallel">并流</option></select></label>`;
  el.innerHTML=`<div class="heat-controls">${controls}</div><svg viewBox="0 0 720 340" role="img" aria-label="${key==='resistance'?'传热路径上的温度':key==='diffusion'?'正弦温度分布的扩散衰减':'效能随 NTU 的变化'}"></svg><p class="heat-readout" aria-live="polite"></p><p class="heat-point" aria-live="off">移动到曲线或节点查看数值。</p>`;
  const svg=el.querySelector('svg'),out=el.querySelector('.heat-readout'),point=el.querySelector('.heat-point');
  const get=s=>Number(el.querySelector('#'+id+s).value);
  function tag(name,attrs,text){const t=document.createElementNS(ns,name);for(const[k,v]of Object.entries(attrs))t.setAttribute(k,v);if(text)t.textContent=text;svg.append(t);return t;}
  const X=x=>65+590*x,Y=y=>275-230*y;
  function axes(xlabel,ylabel){svg.replaceChildren();tag('path',{d:'M65 35V275H670',fill:'none',stroke:green,'stroke-width':1.4});tag('text',{x:350,y:325,'text-anchor':'middle',fill:green},xlabel);tag('text',{x:65,y:24,fill:green},ylabel);for(let i=0;i<=4;i++){tag('path',{d:`M65 ${Y(i/4)}H655`,stroke:green,'stroke-opacity':.13});tag('text',{x:52,y:Y(i/4)+6,'text-anchor':'end',fill:green},String(i/4));}if(key!=='resistance')for(let i=0;i<=4;i++)tag('text',{x:X(i/4),y:300,'text-anchor':'middle',fill:green},String(i/4*(key==='exchanger'?5:1)));}
  function curve(fn,color,dashed=false){const d=Array.from({length:161},(_,i)=>`${i?'L':'M'}${X(i/160)} ${Y(fn(i/160))}`).join(' ');tag('path',{d,fill:'none',stroke:color,'stroke-width':3,...(dashed?{'stroke-dasharray':'7 6'}:{})});}
  function draw(){
   for(const input of el.querySelectorAll('input'))input.nextElementSibling.value=input.value;
   if(key==='resistance'){
    const r=[1/get('a'),get('b')/1000/get('c'),1/get('d')],total=r.reduce((a,b)=>a+b,0),q=100/total,T=[400];for(const v of r)T.push(T.at(-1)-q*v);
    axes('传热路径节点（间距不表示真实厚度）','(T − 300 K) / 100 K');
    const labels=['热流体','热侧表面','冷侧表面','冷流体'];
    for(let i=0;i<3;i++){const line=tag('path',{d:`M${X(i/3)} ${Y((T[i]-300)/100)}L${X((i+1)/3)} ${Y((T[i+1]-300)/100)}`,fill:'none',stroke:i===1?gold:green,'stroke-width':5});line.addEventListener('pointerenter',()=>{line.setAttribute('stroke-width',9);point.textContent=`${['热侧对流','壁内导热','冷侧对流'][i]}：温降 ${(T[i]-T[i+1]).toFixed(2)} K，占总热阻 ${(100*r[i]/total).toFixed(1)}%。`;});line.addEventListener('pointerleave',()=>line.setAttribute('stroke-width',5));}
    for(let i=0;i<4;i++){const c=tag('circle',{cx:X(i/3),cy:Y((T[i]-300)/100),r:7,fill:gold,stroke:green,tabindex:0,'aria-label':labels[i]+T[i].toFixed(2)+' K'});tag('text',{x:X(i/3),y:300,'text-anchor':'middle',fill:green},labels[i]);const show=()=>{point.textContent=`${labels[i]}：${T[i].toFixed(2)} K`;c.setAttribute('r',10);};c.addEventListener('pointerenter',show);c.addEventListener('focus',show);c.addEventListener('pointerleave',()=>c.setAttribute('r',7));c.addEventListener('blur',()=>c.setAttribute('r',7));}
    out.textContent=`热流密度 ${q.toFixed(2)} W/m²；总面热阻 ${total.toFixed(4)} m²·K/W。`;
   }else if(key==='diffusion'){
    const fo=get('a'),amp=Math.exp(-(Math.PI**2)*fo);axes('x / L','(T − T0) / 初始幅值');curve(x=>Math.sin(Math.PI*x),gold,true);curve(x=>amp*Math.sin(Math.PI*x),green);
    out.textContent=`Fo = ${fo.toFixed(3)}；当前最大温升为初始幅值的 ${(100*amp).toFixed(2)}%。虚线为初始分布。`;
   }else{
    const cr=get('b'),n=get('a'),mode=el.querySelector('select').value;const eps=N=>mode==='parallel'?(1-Math.exp(-N*(1+cr)))/(1+cr):Math.abs(cr-1)<1e-8?N/(1+N):(1-Math.exp(-N*(1-cr)))/(1-cr*Math.exp(-N*(1-cr)));
    axes('NTU（横轴范围 0—5）','效能 ε');curve(x=>eps(5*x),green);tag('circle',{cx:X(n/5),cy:Y(eps(n)),r:8,fill:gold,stroke:green});
    out.textContent=`效能 ${eps(n).toFixed(3)}；热侧出口 ${(400-100*eps(n)*cr).toFixed(2)} K，冷侧出口 ${(300+100*eps(n)).toFixed(2)} K。`;
   }
  }
  svg.addEventListener('pointermove',e=>{if(key==='resistance')return;const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const t=p.matrixTransform(svg.getScreenCTM().inverse()),x=Math.max(0,Math.min(1,(t.x-65)/590));if(key==='diffusion')point.textContent=`x/L = ${x.toFixed(3)}；归一化温升 ${(Math.sin(Math.PI*x)*Math.exp(-(Math.PI**2)*get('a'))).toFixed(4)}。`;else point.textContent=`当前位置 NTU = ${(5*x).toFixed(2)}；拖动上方滑块选择对应工作点。`;});
  el.addEventListener('input',draw);el.addEventListener('change',draw);
  const button=el.querySelector('[data-play]');
  function stop(){cancelAnimationFrame(raf);raf=0;last=0;if(button)button.textContent='播放扩散';}
  function frame(t){if(!el.isConnected||document.hidden){stop();return;}const a=el.querySelector('input');if(last)playFo=Math.min(.5,playFo+(t-last)*.000025);a.value=playFo;last=t;draw();if(playFo>=.5){stop();return;}raf=requestAnimationFrame(frame);}
  button?.addEventListener('click',()=>{if(raf){stop();return;}if(get('a')>=.5)el.querySelector('input').value=0;playFo=get('a');button.textContent='暂停';raf=requestAnimationFrame(frame);});
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();}).observe(el);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});draw();
 }
 window.FoamHeat={mount:()=>document.querySelectorAll('.heat-lab').forEach(mount)};window.FoamHeat.mount();
})();
