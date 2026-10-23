'use strict';
(() => {
 const host=document.querySelector('[data-member-distribution]');if(!host)return;
 const script=document.currentScript,packURL=script.dataset.packRuntime;
 const $=selector=>host.querySelector(selector),chart=$('[data-distribution-chart]'),tabs=[...host.querySelectorAll('[role=tab]')];
 const listDialog=$('#member-distribution-list'),zoomControls=$('[data-distribution-zoom]'),zoomIn=$('[data-distribution-zoom-in]'),zoomOut=$('[data-distribution-zoom-out]');
 const detailDialog=$('#member-distribution-detail'),expand=$('[data-distribution-expand]'),stage=$('[data-distribution-stage]'),plot=$('.member-distribution-plot'),actions=$('.member-distribution-actions'),actionHome=actions.parentElement;
 const researchViews=document.createElement('div');researchViews.className='member-research-views';researchViews.hidden=true;researchViews.setAttribute('role','group');researchViews.setAttribute('aria-label','研究方向展示方式');
 for(const [value,label]of [['bubbles','气泡图'],['words','流动词云']]){const button=document.createElement('button');button.type='button';button.dataset.researchView=value;button.setAttribute('aria-label',label);button.title=label;button.setAttribute('aria-pressed',String(value==='bubbles'));button.append(document.createElement('span'));researchViews.append(button);}plot.append(researchViews);
 const densityControl=document.createElement('label');densityControl.className='member-cloud-density';densityControl.hidden=true;
 const compact=document.createElement('span'),loose=document.createElement('span'),density=document.createElement('input');compact.textContent='紧凑';loose.textContent='舒展';density.type='range';density.min='0';density.max='100';density.step='1';density.value='42';density.dataset.cloudDensity='';density.setAttribute('aria-label','词云疏密');densityControl.append(compact,density,loose);plot.append(densityControl);
 let researchView='bubbles',cloudDensity=42,cloudZoom=1;
 const names={institutions:'学校 / 单位',research:'研究方向',stages:'学习阶段',cohorts:'出生年代'};
 const captions={institutions:'气泡面积与成员人数成正比。悬停、点击或用键盘选中气泡可查看全称与人数。',research:'按分隔符拆分研究方向，保留全部名称；某名称的字按原顺序包含在另一个名称中时，也计入前者。同一成员对同一名称只计一次，一人可计入多个方向。',stages:'按成员填写的当前学习阶段统计，每位成员只计入一个阶段。',cohorts:'按出生年份所属年代统计，例如 90 后为 1990—1999 年出生。个人出生年月不对外展示。'};
 let kind='institutions',data=null,initialized=false,pending=null,lastRead=0,packPromise=null,drawRevision=0,resizeFrame=0,lastSize='',motion=null,motionPaused=false,bubbleZoom=1,view=null,selectedLabel=null,wheelFrame=0,wheelDelta=0,zoomTimer=0;
 const node=(tag,attrs={},content)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value]of Object.entries(attrs))n.setAttribute(key,value);if(content!=null)n.textContent=content;return n;};
 const rows=()=>Array.isArray(data?.[kind])?data[kind].filter(r=>typeof r.label==='string'&&Number.isSafeInteger(r.count)&&r.count>=0):[];
 function packRuntime(){
  if(window.d3?.pack)return Promise.resolve();if(packPromise)return packPromise;
  packPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=packURL;s.async=true;const timer=setTimeout(()=>fail(),15000);const fail=()=>{clearTimeout(timer);s.remove();packPromise=null;reject(Error('图表组件暂时无法加载。'));};s.onerror=fail;s.onload=()=>{clearTimeout(timer);if(window.d3?.pack)resolve();else fail();};document.head.append(s);});return packPromise;
 }
 function select(row,element){
  selectedLabel=row.label;
  for(const n of chart.querySelectorAll('.is-selected'))n.classList.remove('is-selected');element.classList.add('is-selected');
  const share=data.members?` · ${(row.count/data.members*100).toFixed(1)}%`:'';
  const selection=$('[data-distribution-selection]'),message=`${row.label}${row.range?'（'+row.range+'）':''}：${row.count} 人${kind==='research'?'':share}`;
  selection.textContent=message;selection.title=message;
  const detail=$('[data-distribution-detail-selection]');detail.textContent=message;detail.title=message;
 }
 function interactive(element,row){
  element.setAttribute('tabindex','0');element.setAttribute('role','button');element.setAttribute('aria-label',`${row.label}${row.range?'，'+row.range:''}，${row.count} 人`);
  element.append(node('title',{},`${row.label}${row.range?' · '+row.range:''}：${row.count} 人`));
  for(const event of ['pointerenter','focus','click'])element.addEventListener(event,()=>select(row,element));
  element.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(row,element);}});
 }
 function bubbleMotion(svg,items,width,height){
  $('[data-distribution-reset]').setAttribute('aria-label','复原气泡位置');$('[data-distribution-reset]').title='复原气泡位置';
  const preference=matchMedia('(prefers-reduced-motion: reduce)'),control=$('[data-distribution-motion]'),resetControl=$('[data-distribution-reset]');
  let frameId=0,lastTick=0,inView=false,disposed=false,pointer=null,drag=null,zooming=false;
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const enabled=()=>!disposed&&!zooming&&inView&&!document.hidden&&!preference.matches&&!motionPaused&&!listDialog.open&&!document.documentElement.classList.contains('profile-required-open');
  const coordinates=e=>{const rect=svg.getBoundingClientRect();return {x:(e.clientX-rect.left)*width/rect.width,y:(e.clientY-rect.top)*height/rect.height};};
  function place(item){item.g.setAttribute('transform',`translate(${item.x.toFixed(2)},${item.y.toFixed(2)})`);item.circle.setAttribute('transform',`rotate(${item.angle||0}) scale(${1-item.squeeze},${1/(1-item.squeeze)})`);}
  function tick(now){
   frameId=0;if(!enabled())return;
   if(now-lastTick<32){frameId=requestAnimationFrame(tick);return;}
   const dt=lastTick?Math.min(1.5,(now-lastTick)/33):1;lastTick=now;
   for(const [i,item]of items.entries()){
    item.pressure=0;
    if(drag?.item===item)continue;
    // Return displaced bubbles to the packed group while retaining a small buoyant drift.
    item.vx+=(item.homeX-item.x)*.0028*dt+Math.sin(now*.00065+i*2.4)*.009*dt;
    item.vy+=(item.homeY-item.y)*.0028*dt+Math.cos(now*.00058+i*1.9)*.009*dt;
    if(pointer&&!drag){const dx=item.x-pointer.x,dy=item.y-pointer.y,d=Math.hypot(dx,dy)||1,reach=item.r+65;if(d<reach){const force=.48*(1-d/reach)**2;item.vx+=dx/d*force*dt;item.vy+=dy/d*force*dt;}}
    item.vx*=.91;item.vy*=.91;item.x+=clamp(item.vx,-4,4)*dt;item.y+=clamp(item.vy,-4,4)*dt;
   }
   // Resolve pairs by area-based mass. A dragged bubble pushes its neighbours directly.
   for(let pass=0;pass<3;pass++)for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
    const a=items[i],b=items[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.01,overlap=a.r+b.r+3-d;
    const nx=dx/d,ny=dy/d,wa=drag?.item===a?0:drag?.item===b?1:b.r*b.r/(a.r*a.r+b.r*b.r),wb=1-wa;
    if(overlap<=0){
     if(pass===0){const pull=Math.min(.09,Math.max(0,-overlap-6)*.001)/Math.sqrt(items.length)*dt;a.vx+=nx*pull*wa;a.vy+=ny*pull*wa;b.vx-=nx*pull*wb;b.vy-=ny*pull*wb;}
     continue;
    }
    const push=overlap*.65;a.x-=nx*push*wa;a.y-=ny*push*wa;b.x+=nx*push*wb;b.y+=ny*push*wb;
    a.vx-=nx*overlap*.018*wa;a.vy-=ny*overlap*.018*wa;b.vx+=nx*overlap*.018*wb;b.vy+=ny*overlap*.018*wb;
    for(const item of [a,b])if(overlap>item.pressure){item.pressure=overlap;item.angle=Math.atan2(ny,nx)*180/Math.PI;}
   }
   for(const item of items){
    const pad=item.r+8;if(item.x<pad||item.x>width-pad)item.vx*=-.65;if(item.y<pad||item.y>height-pad)item.vy*=-.65;
    item.x=clamp(item.x,pad,width-pad);item.y=clamp(item.y,pad,height-pad);
    // Reciprocal scales produce a soft squeeze without changing the bubble's area.
    item.squeeze+=(Math.min(.07,item.pressure/Math.max(1,item.r)*.12)-item.squeeze)*.25;place(item);
   }
   frameId=requestAnimationFrame(tick);
  }
  function update(){
   control.hidden=preference.matches;control.setAttribute('aria-label',motionPaused?'播放气泡动效':'暂停气泡动效');control.title=motionPaused?'播放气泡动效':'暂停气泡动效';control.dataset.paused=String(motionPaused);
   svg.classList.toggle('member-motion-enabled',!preference.matches&&!motionPaused);
   if(!enabled()){cancelAnimationFrame(frameId);frameId=0;pointer=null;drag=null;svg.classList.remove('is-dragging');}
   else if(!frameId){lastTick=0;frameId=requestAnimationFrame(tick);}
  }
  const move=e=>{if(pan){pointer=null;return;}pointer=coordinates(e);if(drag&&e.pointerId===drag.pointerId){const item=drag.item;item.x=pointer.x-drag.offsetX;item.y=pointer.y-drag.offsetY;item.vx=0;item.vy=0;place(item);}};
  const leave=()=>{if(!drag)pointer=null;};
  const release=e=>{if(drag?.pointerId===e.pointerId){drag=null;svg.classList.remove('is-dragging');if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);if(e.pointerType==='touch')pointer=null;}};
  const down=e=>{if(!enabled()||e.button!==0||e.pointerType==='touch'&&bubbleZoom>1)return;const g=e.target.closest('.member-bubble'),item=items.find(item=>item.g===g);if(!item)return;e.preventDefault();pointer=coordinates(e);drag={item,pointerId:e.pointerId,offsetX:pointer.x-item.x,offsetY:pointer.y-item.y};select(item.row,item.g);svg.setPointerCapture(e.pointerId);svg.classList.add('is-dragging');};
  svg.addEventListener('pointermove',move);svg.addEventListener('pointerleave',leave);svg.addEventListener('pointerdown',down);svg.addEventListener('pointerup',release);svg.addEventListener('pointercancel',release);svg.addEventListener('lostpointercapture',release);
  control.onclick=()=>{motionPaused=!motionPaused;update();};
  resetControl.hidden=false;
  resetControl.onclick=()=>{
   cancelWheelZoom();cancelChartGesture();
   applyZoom(1);
   if(drag&&svg.hasPointerCapture(drag.pointerId))svg.releasePointerCapture(drag.pointerId);
   pointer=null;drag=null;lastTick=0;svg.classList.remove('is-dragging');
   for(const item of items){item.x=item.homeX;item.y=item.homeY;item.vx=0;item.vy=0;item.squeeze=0;item.pressure=0;item.angle=0;item.g.classList.remove('is-selected');place(item);}
   selectedLabel=null;for(const selection of host.querySelectorAll('[data-distribution-selection],[data-distribution-detail-selection]')){selection.textContent='';selection.title='';}centerView();
  };
  const observer=new IntersectionObserver(entries=>{inView=entries.some(e=>e.isIntersecting);update();},{threshold:.01});observer.observe(svg);
  const gate=new MutationObserver(update);gate.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',update);preference.addEventListener('change',update);update();
  return {
   setZooming(value){if(disposed)return;zooming=value;update();},
   dispose(){disposed=true;cancelAnimationFrame(frameId);observer.disconnect();gate.disconnect();document.removeEventListener('visibilitychange',update);preference.removeEventListener('change',update);control.onclick=null;control.hidden=true;resetControl.onclick=null;resetControl.hidden=true;}
  };
 }
 function bubbleLabel(g,row,r,measure){
  r*=bubbleZoom;
  const font=Math.min(detailDialog.open?18:13,Math.max(9,r*.4)),lineHeight=font*1.35,width=r*1.5,maxLines=r>=34?2:1,chars=[...row.label],lines=[];
  measure.font=`550 ${font}px ${getComputedStyle(chart).fontFamily}`;
  while(chars.length&&lines.length<maxLines){
   let line=chars.shift();
   while(chars.length&&measure.measureText(line+chars[0]).width<=width)line+=chars.shift();
   lines.push(line);
  }
  if(chars.length&&lines.length){let last=lines.pop();while([...last].length>1&&measure.measureText(last+'…').width>width)last=[...last].slice(0,-1).join('');lines.push(measure.measureText(last+'…').width<=width?last+'…':last);}
  const showCount=r>=18,total=lines.length+(showCount?1:0),text=node('text',{'text-anchor':'middle','font-size':font,transform:`scale(${1/bubbleZoom})`});
  lines.forEach((line,i)=>text.append(node('tspan',{x:0,y:(i-(total-1)/2)*lineHeight+font*.34,class:'bubble-label'},line)));
  if(showCount)text.append(node('tspan',{x:0,y:((total-1)/2)*lineHeight+font*.34,class:'bubble-count'},row.count+' 人'));
  const previous=g.querySelector('text');if(previous)previous.replaceWith(text);else g.append(text);
 }
 function bubbleChart(svg,list,width,height){
  const root=window.d3.hierarchy({children:list}).sum(d=>d.count||0).sort((a,b)=>b.value-a.value||a.data.label?.localeCompare(b.data.label||'','zh-CN')||0);
  const packed=window.d3.pack().size([width-16,height-16]).padding(6)(root);
  const leaves=packed.leaves(),left=Math.min(...leaves.map(d=>d.x-d.r)),right=Math.max(...leaves.map(d=>d.x+d.r)),top=Math.min(...leaves.map(d=>d.y-d.r)),bottom=Math.max(...leaves.map(d=>d.y+d.r));
  const scale=Math.min((width-20)/(right-left||1),(height-20)/(bottom-top||1)),cx=(left+right)/2,cy=(top+bottom)/2;
  const items=[],measure=document.createElement('canvas').getContext('2d');
  for(const [i,leaf]of leaves.entries()){
   const x=(leaf.x-cx)*scale+width/2,y=(leaf.y-cy)*scale+height/2,r=leaf.r*scale,row=leaf.data,g=node('g',{class:'member-bubble','data-count':row.count,transform:`translate(${x},${y})`,style:`--bubble-hue:${[164,208,282,24,336,48,190,252][i%8]}`});
   const circle=node('circle',{r:r.toFixed(3),'vector-effect':'non-scaling-stroke'});g.append(circle);interactive(g,row);
   bubbleLabel(g,row,r,measure);
   svg.append(g);items.push({g,circle,row,r,x,y,homeX:x,homeY:y,vx:Math.sin(i*2)*.1,vy:Math.cos(i*2)*.1,squeeze:0,pressure:0,angle:0});
  }
  motion=bubbleMotion(svg,items,width,height);return items;
 }
 function barChart(svg,list,width,height){
  const margin={left:36,right:12,top:35,bottom:56},plotW=width-margin.left-margin.right,plotH=height-margin.top-margin.bottom;
  const maximum=Math.max(1,...list.map(r=>r.count)),step=Math.max(1,Math.ceil(maximum/4)),top=Math.ceil(maximum/step)*step;
  for(let value=0;value<=top;value+=step){const y=margin.top+plotH*(1-value/top);svg.append(node('line',{x1:margin.left,y1:y,x2:width-margin.right,y2:y,class:'member-axis'}),node('text',{x:margin.left-8,y:y+4,'text-anchor':'end',class:'member-tick'},value));}
  svg.append(node('text',{x:margin.left,y:17,class:'member-tick'},'人数'));
  const space=plotW/Math.max(1,list.length),barW=Math.min(64,space*.58);
  list.forEach((row,i)=>{
   const x=margin.left+space*(i+.5),h=row.count/top*plotH,y=margin.top+plotH-h;
   const g=node('g',{class:'member-bar',style:`--bubble-hue:${[208,164,282,24,336,48][i%6]}`,'data-count':row.count});
   g.append(node('rect',{x:x-barW/2,y,width:barW,height:h,rx:5}));
   // A transparent target keeps zero values and small bars reachable without changing their height.
   g.append(node('rect',{x:x-space/2+2,y:margin.top,width:space-4,height:plotH+48,class:'member-bar-hit'}));
   g.append(node('text',{x,y:Math.max(18,y-10),'text-anchor':'middle',class:'member-bar-count'},row.count+' 人'));
   g.append(node('text',{x,y:margin.top+plotH+24,'text-anchor':'middle',class:'member-bar-label'},row.label));
   g.append(node('text',{x,y:margin.top+plotH+43,'text-anchor':'middle',class:'member-tick'},data.members?(100*row.count/data.members).toFixed(1)+'%':'0%'));
   interactive(g,row);svg.append(g);
  });
 }
 function renderList(){
  $('#member-distribution-list-title').textContent=names[kind]+' · 数据列表';
  const target=$('[data-distribution-list]');target.replaceChildren();const query=$('#member-distribution-search').value.trim().toLocaleLowerCase();
  const list=rows().filter(r=>(r.label+' '+(r.range||'')).toLocaleLowerCase().includes(query));
  if(!list.length){target.textContent='没有符合条件的统计项目。';return;}
  const table=document.createElement('table'),caption=document.createElement('caption');caption.textContent=names[kind]+'人数统计';caption.className='sr-only';table.append(caption);
  const head=document.createElement('thead'),tr=document.createElement('tr');for(const label of [names[kind],'人数']){const th=document.createElement('th');th.scope='col';th.textContent=label;tr.append(th);}head.append(tr);table.append(head);
  const body=document.createElement('tbody');for(const row of list){const tr=document.createElement('tr');for(const value of [row.label+(row.range?'（'+row.range+'）':''),row.count]){const td=document.createElement('td');td.textContent=value;tr.append(td);}body.append(tr);}table.append(body);target.append(table);
 }
 let fluidPromise=null;
 function fluidRuntime(){
  if(window.FoamWordFluid)return Promise.resolve();if(fluidPromise)return fluidPromise;
  fluidPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/assets/vendor/member-word-fluid.js?v=ebd0b5f32bb9';s.async=true;
   const timer=setTimeout(fail,15000);function fail(){clearTimeout(timer);s.remove();fluidPromise=null;reject(Error('流体组件暂时无法加载'));}
   s.onerror=fail;s.onload=()=>{clearTimeout(timer);if(window.FoamWordFluid)resolve();else fail();};document.head.append(s);
  });return fluidPromise;
 }
 let wordFontPromise=null;
 async function wordFont(){
  const fallback=getComputedStyle(chart).fontFamily;
  if(!wordFontPromise)wordFontPromise=new FontFace('FoamLab Word Art','url(/assets/fonts/zcool-kuaile-regular.woff2)',{weight:'400'}).load().then(font=>{document.fonts.add(font);return '"FoamLab Word Art", '+fallback;}).catch(()=>{wordFontPromise=null;return fallback;});
  let timer;try{return await Promise.race([wordFontPromise,new Promise(resolve=>{timer=setTimeout(()=>resolve(fallback),5000);})]);}finally{clearTimeout(timer);}
 }
 async function wordFlow(placed,width,height,family){
  const canvas=document.createElement('canvas');canvas.className='member-word-flow';canvas.setAttribute('aria-hidden','true');
  const scale=Math.min(devicePixelRatio||1,1.5,Math.sqrt(900000/(width*height)));canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
  const mask=document.createElement('canvas');mask.width=canvas.width;mask.height=canvas.height;
  const ctx=mask.getContext('2d');ctx.scale(scale,scale);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  // Rasterise the glyphs, leaving both character gaps and the spaces between words open.
  function rasterise(items){ctx.clearRect(0,0,width,height);for(const item of items){ctx.save();ctx.translate(item.x,item.y);ctx.rotate(item.angle*Math.PI/180);ctx.font=`400 ${item.font*cloudZoom}px ${family}`;ctx.fillText(item.row.label,0,item.baseline*item.font*cloudZoom);ctx.restore();}}
  rasterise(placed);
  try{await fluidRuntime();const effect=window.FoamWordFluid(canvas,mask);canvas.addEventListener('foam-fluid-restore',()=>{if(canvas.isConnected)void draw();});
   return{canvas,present:()=>effect.present(),cancelInput:()=>effect.cancelInput(),setObstacles(items){rasterise(items);effect.setObstacles(mask);},setEnabled:value=>effect.setEnabled(value),pointer:(x,y,id,phase)=>effect.pointer(x*scale,y*scale,id,phase),dispose:()=>effect.dispose()};
  }catch{canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();const fallback=document.createElement('canvas');fallback.className=canvas.className;fallback.width=canvas.width;fallback.height=canvas.height;fallback.setAttribute('aria-hidden','true');const effect=wordFlowFallback(fallback,mask,width,height);return{...effect,setObstacles(items){rasterise(items);effect.setObstacles(mask);}};}
 }
 function wordFlowFallback(canvas,mask,width,height){
  const ctx=canvas.getContext('2d'),particles=Array.from({length:360},(_,i)=>({x:(.2+(i%3)*.3)*canvas.width+Math.sin(i)*20,y:(.3+(i%2)*.4)*canvas.height+Math.cos(i)*20,vx:Math.sin(i*2)*.7,vy:Math.cos(i*3)*.7,hue:i*137.5%360,age:0}));let ink=mask.getContext('2d').getImageData(0,0,mask.width,mask.height).data;
  let frame=0,enabled=false,disposed=false,last=0,time=0;canvas.dataset.renderer='canvas';
  const solid=(x,y)=>ink[(Math.max(0,Math.min(mask.height-1,Math.round(y)))*mask.width+Math.max(0,Math.min(mask.width-1,Math.round(x))))*4+3]/255;
  function tick(now){frame=0;if(!enabled||disposed)return;if(now-last>32){last=now;time+=.033;ctx.globalCompositeOperation='destination-out';ctx.fillStyle='rgba(0,0,0,.055)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='source-over';const dark=document.documentElement.dataset.theme==='dark';
   for(const p of particles){if(p.age++>550)continue;const oldX=p.x,oldY=p.y,gx=solid(p.x+3,p.y)-solid(p.x-3,p.y),gy=solid(p.x,p.y+3)-solid(p.x,p.y-3);p.vx=(p.vx+Math.sin(p.y*.04+time)*.08-gx*.4)*.98;p.vy=(p.vy+Math.cos(p.x*.035-time)*.08-gy*.4)*.98;p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>canvas.width||p.y<0||p.y>canvas.height){p.age=551;continue;}ctx.strokeStyle=`hsla(${p.hue} 85% ${dark?65:35}% / .3)`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(oldX,oldY);ctx.lineTo(p.x,p.y);ctx.stroke();}
  }frame=requestAnimationFrame(tick);}
  let nextParticle=0;
  return{canvas,setObstacles(next){ink=next.getContext('2d').getImageData(0,0,next.width,next.height).data;},setEnabled(value){enabled=value;if(enabled&&!frame)frame=requestAnimationFrame(tick);if(!enabled){cancelAnimationFrame(frame);frame=0;}},pointer(x,y,id,phase){if(!enabled||phase==='end'||phase==='resume')return;for(let i=0;i<12;i++){const a=i*Math.PI/6;particles[nextParticle++%particles.length]={x:x*canvas.width/width,y:y*canvas.height/height,vx:Math.cos(a)*2,vy:Math.sin(a)*2,hue:(performance.now()*.25+x*.8)%360,age:0};}},dispose(){disposed=true;cancelAnimationFrame(frame);}};
 }
 async function wordCloud(svg,list,width,height,version){
  // Pack every aggregated direction, including the longer names that also count toward shorter ones.
  // Measure once, then find a non-overlapping layout; never fabricate or repeat words to fill space.
  const measure=document.createElement('canvas').getContext('2d'),family=await wordFont();if(version!==drawRevision)return null;svg.style.fontFamily=family;
  const sorted=[...list].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'zh-CN')),maximum=Math.max(...sorted.map(r=>r.count));
  measure.font=`400 100px ${family}`;
  const specs=sorted.map((row,i)=>{const m=measure.measureText(row.label);return{row,weight:.36+.84*Math.sqrt(row.count/maximum),ratio:Math.max(.7,m.width/100,(m.actualBoundingBoxLeft+m.actualBoundingBoxRight)/100),baseline:(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/200,angle:i===0?0:[0,0,-12,0,12,0,-90][i%7]};});
  // Pack once in a compact central area. The slider only scales distances between
  // these fixed centres; glyph sizes, angles, ordering and fluid buffers stay intact.
  const safeTop=56,safeBottom=16,cx=width/2,cy=(safeTop+height-safeBottom)/2,availableW=width*.8,availableH=(height-safeTop-safeBottom)*.85,padding=3,left=(width-availableW)/2,top=cy-availableH/2;
  let base=Math.min(76,Math.sqrt(availableW*availableH*.44/specs.reduce((sum,s)=>sum+s.weight*s.weight*s.ratio,0))),placed=[];
  for(let attempt=0;attempt<22;attempt++){
   placed=[];
   for(const [index,spec]of specs.entries()){
    const font=Math.min(base*spec.weight,availableW*.95/spec.ratio),a=Math.abs(spec.angle)*Math.PI/180,w=font*spec.ratio,h=font*1.25;
    const bw=Math.abs(w*Math.cos(a))+Math.abs(h*Math.sin(a))+padding*2,bh=Math.abs(w*Math.sin(a))+Math.abs(h*Math.cos(a))+padding*2;
    let found=null;
    for(let step=0;step<1800;step++){
     const radius=Math.sqrt(step/1799)*availableH*.54,theta=step*.38+index*2.399;
     const x=cx+Math.cos(theta)*radius*availableW/availableH,y=cy+Math.sin(theta)*radius;
     if(x-bw/2<left||x+bw/2>width-left||y-bh/2<top||y+bh/2>top+availableH)continue;
     if(placed.some(p=>Math.abs(p.x-x)<(p.bw+bw)/2&&Math.abs(p.y-y)<(p.bh+bh)/2))continue;
     found={...spec,font,x,y,bw,bh};break;
    }
    if(!found)break;placed.push(found);
    if(index%20===19){await new Promise(resolve=>setTimeout(resolve,0));if(version!==drawRevision)return null;}
   }
   if(placed.length===specs.length)break;base*=.85;
  }
  if(version!==drawRevision)return null;
  // A finite grid fallback keeps unusual or very large datasets complete, with the list available for reading.
  if(placed.length!==specs.length){const cols=Math.max(1,Math.ceil(Math.sqrt(specs.length*availableW/availableH))),cw=availableW/cols,ch=availableH/Math.ceil(specs.length/cols);placed=specs.map((s,i)=>{const font=Math.max(.5,Math.min(ch*.65,(cw-8)/s.ratio));return{...s,angle:0,font,x:left+cw*(i%cols+.5),y:top+ch*(Math.floor(i/cols)+.5),bw:font*s.ratio+6,bh:font*1.25+6};});}
  const bounds={left:Math.min(...placed.map(p=>p.x-p.bw/2)),right:Math.max(...placed.map(p=>p.x+p.bw/2)),top:Math.min(...placed.map(p=>p.y-p.bh/2)),bottom:Math.max(...placed.map(p=>p.y+p.bh/2))};
  let spread=2;
  for(const item of placed){item.dx=item.x-(bounds.left+bounds.right)/2;item.dy=item.y-(bounds.top+bounds.bottom)/2;if(Math.abs(item.dx)>.01)spread=Math.min(spread,(cx-12-item.bw/2)/Math.abs(item.dx));if(Math.abs(item.dy)>.01)spread=Math.min(spread,(cy-safeTop-item.bh/2)/Math.abs(item.dy));}
  spread=Math.max(1,spread);
  function applySpacing(value){const factor=(1+(spread-1)*value/100)*cloudZoom;for(const item of placed){item.x=cx+item.dx*factor;item.y=cy+item.dy*factor;item.element?.setAttribute('transform',`translate(${item.x.toFixed(3)},${item.y.toFixed(3)}) rotate(${item.angle}) scale(${cloudZoom})`);}}
  applySpacing(cloudDensity);
  for(const [i,item]of placed.entries()){
   const g=node('g',{class:'member-word','data-count':item.row.count,transform:`translate(${item.x.toFixed(3)},${item.y.toFixed(3)}) rotate(${item.angle}) scale(${cloudZoom})`,style:`--word-hue:${[174,199,30,211,158,336,44][i%7]}`});
   const drift=node('g',{class:'member-word-drift'}),text=node('text',{'text-anchor':'middle','dominant-baseline':'alphabetic',y:(item.baseline*item.font).toFixed(3),'font-size':item.font.toFixed(3),'font-weight':400},item.row.label);
   drift.append(text);g.append(drift);interactive(g,item.row);svg.append(g);item.element=g;
  }
  const flow=await wordFlow(placed,width,height,family);if(version!==drawRevision){flow.dispose();return null;}const preference=matchMedia('(prefers-reduced-motion: reduce)'),control=$('[data-distribution-motion]'),reset=$('[data-distribution-reset]');
  let inView=false,disposed=false,densityFrame=0,cloudPinch=null;const drawingPointers=new Map();
  function setDensity(){if(densityFrame||disposed)return;densityFrame=requestAnimationFrame(()=>{densityFrame=0;if(disposed)return;applySpacing(cloudDensity);flow.setObstacles(placed);});}
  function setZoom(value){cloudZoom=Math.max(.5,Math.min(3,value));setDensity();zoomControlsState();}
  const fingerPoints=()=>[...drawingPointers.values()].filter(p=>p.pointerType==='touch');
  const fingerDistance=()=>{const [a,b]=fingerPoints();return Math.max(10,Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY));};
  function beginCloudPinch(){flow.cancelInput?.();cloudPinch={distance:fingerDistance(),zoom:cloudZoom};}
  function cancelInput(){const ids=[...drawingPointers.keys()];drawingPointers.clear();cloudPinch=null;flow.cancelInput?.();for(const id of ids)if(svg.hasPointerCapture(id))svg.releasePointerCapture(id);}
  function update(){
   if(disposed)return;const enabled=inView&&!document.hidden&&!preference.matches&&!motionPaused&&!listDialog.open&&!document.documentElement.classList.contains('profile-required-open');
   svg.classList.toggle('is-flowing',enabled);control.hidden=preference.matches;control.dataset.paused=String(motionPaused);control.setAttribute('aria-label',motionPaused?'播放词云动效':'暂停词云动效');control.title=motionPaused?'播放词云动效':'暂停词云动效';
   flow.setEnabled(enabled);if(!inView||document.hidden||listDialog.open||document.documentElement.classList.contains('profile-required-open'))cancelInput();
  }
  const inject=(e,phase)=>{const r=svg.getBoundingClientRect();flow.pointer((e.clientX-r.left)*width/r.width,(e.clientY-r.top)*height/r.height,e.pointerId,phase);};
  const remember=e=>drawingPointers.set(e.pointerId,{pointerId:e.pointerId,pointerType:e.pointerType,clientX:e.clientX,clientY:e.clientY});
  const down=e=>{if(e.button!==0||disposed||e.pointerType!=='touch'&&!svg.classList.contains('is-flowing'))return;e.preventDefault();cancelWheelZoom();remember(e);svg.setPointerCapture(e.pointerId);if(fingerPoints().length>=2)beginCloudPinch();else inject(e,'start');};
  const move=e=>{if(!drawingPointers.has(e.pointerId))return;e.preventDefault();remember(e);if(cloudPinch){setZoom(cloudPinch.zoom*fingerDistance()/cloudPinch.distance);}else inject(e,'move');};
  const up=e=>{if(!drawingPointers.delete(e.pointerId))return;inject(e,'end');const wasPinching=!!cloudPinch;cloudPinch=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);if(fingerPoints().length>=2)beginCloudPinch();else if(wasPinching){setDensity();flow.cancelInput?.();const remaining=fingerPoints()[0];if(remaining)inject(remaining,'resume');}};
  svg.addEventListener('pointerdown',down);svg.addEventListener('pointermove',move);for(const name of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(name,up);
  window.addEventListener('blur',cancelInput);
  control.onclick=()=>{motionPaused=!motionPaused;update();};reset.hidden=false;reset.setAttribute('aria-label','复原词云');reset.title='复原词云';reset.onclick=()=>{cloudDensity=42;cloudZoom=1;density.value='42';density.setAttribute('aria-valuetext','适中');selectedLabel=null;void draw(true);};
  const observer=new IntersectionObserver(entries=>{inView=entries.some(e=>e.isIntersecting);update();},{threshold:.01});observer.observe(svg);
  const gate=new MutationObserver(update);gate.observe(document.documentElement,{attributes:true,attributeFilter:['class']});gate.observe(listDialog,{attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',update);preference.addEventListener('change',update);update();
  return{canvas:flow.canvas,present:()=>flow.present?.(),setDensity,setZoom,setZooming(){},dispose(){disposed=true;cancelAnimationFrame(densityFrame);cancelInput();flow.dispose();observer.disconnect();gate.disconnect();document.removeEventListener('visibilitychange',update);preference.removeEventListener('change',update);window.removeEventListener('blur',cancelInput);svg.removeEventListener('pointerdown',down);svg.removeEventListener('pointermove',move);for(const name of ['pointerup','pointercancel','lostpointercapture'])svg.removeEventListener(name,up);control.onclick=null;reset.onclick=null;}};
 }
 async function draw(resetView=false){
  const cloud=kind==='research'&&researchView==='words',bubble=kind==='institutions'||kind==='research'&&!cloud;chart.dataset.pannable=String(bubble);plot.dataset.view=cloud?'words':'chart';plot.dataset.research=String(kind==='research');researchViews.hidden=kind!=='research';densityControl.hidden=!cloud;
  chart.setAttribute('aria-label',cloud?'研究方向词云':'成员分布图'+(bubble?'，可拖动空白背景平移':''));
  const center=!resetView&&view?.kind===kind?{x:(chart.scrollLeft+view.width/2-view.offsetX)/view.svgWidth,y:(chart.scrollTop+view.height/2-view.offsetY)/view.svgHeight}:{x:.5,y:.5};
  const version=++drawRevision;clearTimeout(zoomTimer);motion?.dispose();motion=null;$('[data-distribution-motion]').hidden=true;$('[data-distribution-reset]').hidden=true;zoomControls.hidden=true;if(!data)return;
  $('[data-distribution-total]').textContent=data.members+' 人';$('[data-distribution-summary]').textContent='已完善资料的成员';$('[data-distribution-caption]').textContent=captions[kind];for(const selection of host.querySelectorAll('[data-distribution-selection],[data-distribution-detail-selection]')){selection.textContent='';selection.title='';}
  // Keep the previous chart while the cloud font, layout and GPU frame are prepared.
  if(listDialog.open)renderList();if(!cloud)chart.replaceChildren();$('[data-distribution-retry]').hidden=true;
  const list=rows();if(!data.members||!list.length||cloud&&!list.some(r=>r.count>0)){const p=document.createElement('p');p.textContent='成员完善资料后，统计将在这里显示。';const a=document.createElement('a');a.href='/account/#profile-form';a.textContent='前往个人中心';chart.replaceChildren(p,a);densityControl.hidden=true;return;}
  if(bubble){try{await packRuntime();}catch(error){if(version!==drawRevision)return;chart.textContent=error.message+' 可在数据列表中查看统计。';$('[data-distribution-retry]').hidden=false;return;}}
  if(version!==drawRevision)return;
  const width=Math.max(220,chart.clientWidth),height=Math.max(cloud?160:bubble?240:280,chart.clientHeight);
  const shown=cloud?list.filter(r=>r.count>0):bubble?list.filter(r=>r.count>0).slice(0,40):list;
  // Preserve readable bar labels; the chart scrolls horizontally if many birth decades are present.
  const svgWidth=cloud?width:bubble?width*bubbleZoom:Math.max(width,shown.length*(kind==='cohorts'?90:65)+48),svgHeight=bubble?height*bubbleZoom:height;
  const svg=node('svg',{viewBox:`0 0 ${bubble?width:svgWidth} ${bubble?height:svgHeight}`,width:svgWidth,height:svgHeight,role:'group','aria-label':names[kind]+'人数统计','data-zoomed':String(bubble&&bubbleZoom>1)});
  svg.style.marginTop=Math.max(0,(height-svgHeight)/2)+'px';
  svg.append(node('desc',{},captions[kind]));
  let items=null;if(cloud){svg.classList.add('member-wordcloud');const controller=await wordCloud(svg,shown,width,height,version);if(version!==drawRevision){controller?.dispose();return;}chart.replaceChildren(controller.canvas,svg);controller.present();motion=controller;}else if(bubble)items=bubbleChart(svg,shown,width,height);else barChart(svg,shown,svgWidth,height);
  // A viewport of spare space surrounds the drawing, so the background can also pan at 100%.
  const offsetX=bubble?width/2:0,offsetY=bubble?height/2:0;
  if(bubble){const world=document.createElement('div');world.className='member-distribution-world';world.style.width=svgWidth+width+'px';world.style.height=svgHeight+height+'px';svg.style.cssText=`position:absolute;left:${offsetX}px;top:${offsetY}px;margin:0`;world.append(svg);chart.append(world);}else chart.append(svg);
  view={kind,width,height,svgWidth,svgHeight,offsetX,offsetY,svg,world:svg.parentElement,items};
  chart.scrollLeft=Math.max(0,offsetX+center.x*svgWidth-chart.clientWidth/2);chart.scrollTop=Math.max(0,offsetY+center.y*svgHeight-chart.clientHeight/2);
  if(bubble){zoomControls.hidden=false;zoomControlsState();expand.setAttribute('aria-label','大图查看'+(kind==='institutions'?'学校或单位':'研究方向')+'分布');}
  if(cloud){zoomControls.hidden=false;zoomControlsState();expand.setAttribute('aria-label','大图查看研究方向词云');}
  if(selectedLabel){const selected=[...svg.querySelectorAll('.member-bubble,.member-bar,.member-word')].find(g=>g.querySelector('title')?.textContent.startsWith(selectedLabel+'：')||g.getAttribute('aria-label')?.startsWith(selectedLabel+'，'));const row=shown.find(r=>r.label===selectedLabel);if(selected&&row)select(row,selected);}
  if(bubble&&list.length>40)$('[data-distribution-caption]').textContent+=' 图中显示人数最多的 40 项，其余项目可在数据列表中查询。';
  if(pan?.touch)rebaseTouchPan();
 }
 async function refresh(force=false){
  if(pending)return force?pending.then(()=>refresh(true)):pending;initialized=true;
  pending=(async()=>{
   try{
    const saved=window.FoamMemberData.cached('foamlab_member_distribution');
    if(!data&&saved){data=saved.data;void draw();}
    if(kind==='institutions'||kind==='research')void packRuntime().catch(()=>{});
    const value=await window.FoamMemberData.read('foamlab_member_distribution',{force});
    const changed=JSON.stringify(data)!==JSON.stringify(value);data=value;lastRead=Date.now();
    $('[data-distribution-summary]').textContent='已完善资料的成员';$('[data-distribution-retry]').hidden=true;
    if(changed||!chart.querySelector('svg'))await draw();
   }catch{
    if(!data)chart.textContent='成员统计暂时无法读取。';
    $('[data-distribution-summary]').textContent=data?'暂时显示上次读取的统计':'请稍后重试';$('[data-distribution-retry]').hidden=false;
   }finally{pending=null;}
  })();return pending;
 }

 function activate(tab){cancelWheelZoom();cancelChartGesture();kind=tab.dataset.distributionTab;bubbleZoom=1;selectedLabel=null;for(const t of tabs){const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;}$('[role=tabpanel]').setAttribute('aria-labelledby',tab.id);$('#member-distribution-search').value='';void draw(true);}
 density.oninput=()=>{cloudDensity=Number(density.value);density.setAttribute('aria-valuetext',cloudDensity<34?'紧凑':cloudDensity>66?'舒展':'适中');motion?.setDensity?.();};
 for(const [i,button]of [...researchViews.children].entries()){
  button.onclick=()=>{if(researchView===button.dataset.researchView)return;cancelWheelZoom();cancelChartGesture();researchView=button.dataset.researchView;bubbleZoom=1;for(const b of researchViews.children)b.setAttribute('aria-pressed',String(b===button));void draw(true);};
  button.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const other=researchViews.children[1-i];other.focus();other.click();}};
 }
 function cancelWheelZoom(){cancelAnimationFrame(wheelFrame);wheelFrame=0;wheelDelta=0;}
 function holdZoomMotion(){clearTimeout(zoomTimer);motion?.setZooming(true);}
 function releaseZoomMotion(){clearTimeout(zoomTimer);zoomTimer=setTimeout(()=>{if(!pinch)motion?.setZooming(false);},180);}
 function applyZoom(value){
  const next=Math.max(.5,Math.min(3,value));if(next===bubbleZoom||view?.kind!==kind||!view?.items||!view.svg.isConnected)return;
  holdZoomMotion();bubbleZoom=next;
  commitZoom();releaseZoomMotion();
 }
 function zoomControlsState(){
  const cloud=kind==='research'&&researchView==='words',value=cloud?cloudZoom:bubbleZoom,label=cloud?'词云':'气泡图';zoomIn.disabled=value>=3;zoomOut.disabled=value<=.5;zoomControls.setAttribute('aria-label',`${label}缩放，当前 ${Math.round(value*100)}%`);zoomIn.setAttribute('aria-label','放大'+label);zoomIn.title='放大'+label;zoomOut.setAttribute('aria-label','缩小'+label);zoomOut.title='缩小'+label;
 }
 function commitZoom(){
  // Keep the existing world coordinates and physics state; scale the camera, not the packing.
  const {svg,world,width,height,items}=view;view.svgWidth=width*bubbleZoom;view.svgHeight=height*bubbleZoom;
  svg.setAttribute('width',view.svgWidth);svg.setAttribute('height',view.svgHeight);svg.dataset.zoomed=String(bubbleZoom>1);
  world.style.width=view.svgWidth+width+'px';world.style.height=view.svgHeight+height+'px';
  const measure=document.createElement('canvas').getContext('2d');for(const item of items)bubbleLabel(item.g,item.row,item.r,measure);
  zoomControlsState();centerView();
 }
 function changeZoom(step){cancelWheelZoom();cancelChartGesture();if(kind==='research'&&researchView==='words'){motion?.setZoom(cloudZoom+step);zoomControlsState();}else applyZoom(bubbleZoom+step);}
 function centerView(){
  if(!view?.svg.isConnected)return;
  const bounds=view.items?.map(item=>item.circle.getBoundingClientRect());
  if(bounds?.length){
   const rect=chart.getBoundingClientRect();
   chart.scrollBy({left:(Math.min(...bounds.map(r=>r.left))+Math.max(...bounds.map(r=>r.right)))/2-rect.left-chart.clientLeft-chart.clientWidth/2,top:(Math.min(...bounds.map(r=>r.top))+Math.max(...bounds.map(r=>r.bottom)))/2-rect.top-chart.clientTop-chart.clientHeight/2,behavior:'instant'});
  }else chart.scrollTo({left:view.offsetX+view.svgWidth/2-chart.clientWidth/2,top:view.offsetY+view.svgHeight/2-chart.clientHeight/2,behavior:'instant'});
 }
 zoomIn.onclick=()=>changeZoom(.25);zoomOut.onclick=()=>changeZoom(-.25);
 plot.addEventListener('wheel',e=>{
  const cloud=kind==='research'&&researchView==='words';
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||!e.deltaY||view?.kind!==kind||(!cloud&&!chart.querySelector('.member-distribution-world'))||e.target.closest('input'))return;
  e.preventDefault();
  if(pan||pinch||chart.querySelector('.is-dragging'))return;
  const unit=e.deltaMode===1?16:e.deltaMode===2?chart.clientHeight:1;
  wheelDelta=Math.max(-600,Math.min(600,wheelDelta+e.deltaY*unit));
  // Batch high-frequency mouse and trackpad events into one scale change per frame.
  if(!wheelFrame)wheelFrame=requestAnimationFrame(()=>{const delta=wheelDelta;wheelFrame=0;wheelDelta=0;if(cloud)motion?.setZoom(cloudZoom*Math.exp(-delta*.0015));else applyZoom(bubbleZoom*Math.exp(-delta*.0015));});
 },{passive:false});
 // Capture touch pointers on the chart so a pinch can transition back to one-finger panning.
 // A single touch pans; two touches scale by their distance and keep the drawing centred.
 let pan=null,pinch=null,pinchFrame=0,pinchZoom=null,tap=null,lastTap=null;
 const touches=new Map();
 const touchDistance=()=>{const [a,b]=[...touches.values()];return Math.max(10,Math.hypot(a.x-b.x,a.y-b.y));};
 function rebaseTouchPan(){
  if(touches.size!==1)return;
  const [id,point]=touches.entries().next().value;
  pan={id,x:point.x,y:point.y,left:chart.scrollLeft,top:chart.scrollTop,touch:true};
 }
 function finishPinch(){
  if(!pinch)return;const {svg,zoom}=pinch;pinch=null;
  svg.style.removeProperty('transform');svg.style.removeProperty('transform-origin');chart.classList.remove('is-pinching');
  if(view?.svg===svg&&svg.isConnected&&bubbleZoom!==zoom)commitZoom();
 }
 function beginPinch(){
  finishPinch();pan=null;holdZoomMotion();centerView();
  const svg=view.svg,rect=svg.getBoundingClientRect(),bounds=view.items.map(item=>item.circle.getBoundingClientRect());
  const x=(Math.min(...bounds.map(r=>r.left))+Math.max(...bounds.map(r=>r.right)))/2-rect.left,y=(Math.min(...bounds.map(r=>r.top))+Math.max(...bounds.map(r=>r.bottom)))/2-rect.top;
  pinch={distance:touchDistance(),zoom:bubbleZoom,svg};svg.style.transformOrigin=`${x}px ${y}px`;chart.classList.add('is-pinching');
 }
 function flushPinchZoom(){
  cancelAnimationFrame(pinchFrame);pinchFrame=0;
  if(pinchZoom!==null&&pinch){
   bubbleZoom=Math.max(.5,Math.min(3,pinchZoom));pinchZoom=null;
   // Move one composited image while fingers move; resize and relabel only on release.
   pinch.svg.style.transform=`scale(${bubbleZoom/pinch.zoom})`;zoomControlsState();
  }
 }
 function cancelChartGesture(){
  cancelAnimationFrame(pinchFrame);pinchFrame=0;pinchZoom=null;finishPinch();tap=null;lastTap=null;releaseZoomMotion();
  const ids=new Set(touches.keys());if(pan)ids.add(pan.id);
  touches.clear();pan=null;chart.classList.remove('is-panning');
  for(const id of ids)if(chart.hasPointerCapture(id))chart.releasePointerCapture(id);
 }
 chart.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch'||e.button!==0||chart.dataset.pannable!=='true'||!chart.querySelector('.member-distribution-world'))return;
  e.preventDefault();e.stopPropagation();cancelWheelZoom();
  if(!touches.size)tap={id:e.pointerId,x:e.clientX,y:e.clientY,at:performance.now()};
  else{tap=null;lastTap=null;}
  touches.set(e.pointerId,{x:e.clientX,y:e.clientY});chart.setPointerCapture(e.pointerId);chart.classList.add('is-panning');
  if(touches.size===1)rebaseTouchPan();else{flushPinchZoom();beginPinch();}
 },true);
 chart.addEventListener('pointermove',e=>{
  if(e.pointerType!=='touch'||!touches.has(e.pointerId))return;
  e.preventDefault();e.stopPropagation();touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(tap?.id===e.pointerId&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>10){tap=null;lastTap=null;}
  if(touches.size>=2){
   pinchZoom=pinch.zoom*touchDistance()/pinch.distance;
   if(!pinchFrame)pinchFrame=requestAnimationFrame(()=>{pinchFrame=0;flushPinchZoom();});
  }else if(pan?.id===e.pointerId){chart.scrollLeft=pan.left+pan.x-e.clientX;chart.scrollTop=pan.top+pan.y-e.clientY;}
 },true);
 const endTouch=e=>{
  if(e.pointerType!=='touch'||!touches.has(e.pointerId))return;
  // Only two short, nearby taps reset the view; a drag or any multi-touch gesture cancels them.
  const now=performance.now(),shortTap=e.type==='pointerup'&&touches.size===1&&tap?.id===e.pointerId&&now-tap.at<=260&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<=10;
  const doubleTap=shortTap&&lastTap&&now-lastTap.at<=320&&Math.hypot(tap.x-lastTap.x,tap.y-lastTap.y)<=32;
  lastTap=shortTap&&!doubleTap?{x:tap.x,y:tap.y,at:now}:null;tap=null;
  e.stopPropagation();const wasPinching=!!pinch;touches.delete(e.pointerId);
  if(e.type==='pointerup')flushPinchZoom();else{cancelAnimationFrame(pinchFrame);pinchFrame=0;pinchZoom=null;}
  if(touches.size>=2)beginPinch();
  else{
   finishPinch();if(wasPinching){centerView();releaseZoomMotion();}
   if(touches.size)rebaseTouchPan();else{pan=null;chart.classList.remove('is-panning');}
  }
  if(chart.hasPointerCapture(e.pointerId))chart.releasePointerCapture(e.pointerId);
  if(doubleTap)$('[data-distribution-reset]').click();
 };
 for(const event of ['pointerup','pointercancel','lostpointercapture'])chart.addEventListener(event,endTouch,true);
 window.addEventListener('blur',cancelChartGesture);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelChartGesture();});
 // Mouse dragging still distinguishes moving a bubble from panning its background.
 chart.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'||!e.isPrimary||e.button!==0||e.target.closest('.member-bar,.member-bubble')||chart.dataset.pannable!=='true')return;
  pan={id:e.pointerId,x:e.clientX,y:e.clientY,left:chart.scrollLeft,top:chart.scrollTop};
  chart.setPointerCapture(e.pointerId);chart.classList.add('is-panning');e.preventDefault();
 });
 chart.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'&&pan?.id===e.pointerId){chart.scrollLeft=pan.left+pan.x-e.clientX;chart.scrollTop=pan.top+pan.y-e.clientY;}});
 const endPan=e=>{if(e.pointerType==='touch'||pan?.id!==e.pointerId)return;pan=null;chart.classList.remove('is-panning');if(chart.hasPointerCapture(e.pointerId))chart.releasePointerCapture(e.pointerId);};
 for(const event of ['pointerup','pointercancel','lostpointercapture'])chart.addEventListener(event,endPan);
 chart.addEventListener('keydown',e=>{
  if(e.target!==chart||chart.dataset.pannable!=='true')return;
  const delta={ArrowLeft:[-60,0],ArrowRight:[60,0],ArrowUp:[0,-60],ArrowDown:[0,60]}[e.key];
  if(delta){e.preventDefault();chart.scrollBy(...delta);}
 });
 expand.onclick=()=>{
  cancelWheelZoom();cancelChartGesture();bubbleZoom=1;selectedLabel=null;
  $('#member-distribution-detail-title').textContent=names[kind];
  detailDialog.showModal();document.documentElement.classList.add('member-distribution-detail-open');
  $('[data-distribution-detail-body]').append(plot);$('[data-distribution-detail-actions]').append(actions);
  $('[data-distribution-detail-close]').focus({preventScroll:true});void draw(true);
 };
 $('[data-distribution-detail-close]').onclick=()=>detailDialog.close();
 detailDialog.addEventListener('cancel',e=>{e.preventDefault();detailDialog.close();});
 detailDialog.addEventListener('close',()=>{
  cancelWheelZoom();cancelChartGesture();bubbleZoom=1;selectedLabel=null;
  stage.append(plot);actionHome.append(actions);document.documentElement.classList.remove('member-distribution-detail-open');void draw(true).then(()=>expand.focus({preventScroll:true}));
 });
 for(const [i,tab]of tabs.entries()){
  tab.onclick=()=>activate(tab);
  tab.onkeydown=e=>{const next=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;if(next!==null){e.preventDefault();tabs[next].focus();activate(tabs[next]);}};
 }
 $('[data-distribution-list-toggle]').onclick=()=>{cancelChartGesture();renderList();listDialog.showModal();document.documentElement.classList.add('member-distribution-dialog-open');$('#member-distribution-search').focus({preventScroll:true});};
 $('[data-distribution-list-close]').onclick=()=>listDialog.close();
 listDialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();listDialog.close();}});
 listDialog.addEventListener('close',()=>document.documentElement.classList.remove('member-distribution-dialog-open'));
 const outsideDialog=e=>{const r=listDialog.getBoundingClientRect();return e.target===listDialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom);};
 let backdropDown=false;
 listDialog.addEventListener('pointerdown',e=>{backdropDown=outsideDialog(e);});
 listDialog.addEventListener('click',e=>{if(backdropDown&&outsideDialog(e))listDialog.close();backdropDown=false;});
 $('#member-distribution-search').oninput=renderList;$('[data-distribution-retry]').onclick=()=>void refresh(true);
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();void refresh();}},{rootMargin:'250px'});observer.observe(host);}else void refresh();
 const resize=new ResizeObserver(()=>{const size=Math.round(chart.clientWidth)+':'+Math.round(chart.clientHeight);if(size===lastSize)return;lastSize=size;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>void draw());});resize.observe(chart);
 window.addEventListener('foam-profile-saved',()=>{window.FoamMemberData.invalidate('foamlab_member_distribution');if(initialized)void refresh(true);});
 window.addEventListener('focus',()=>{if(initialized&&Date.now()-lastRead>180000)void refresh();});
})();
