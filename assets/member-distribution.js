'use strict';
(() => {
 const host=document.querySelector('[data-member-distribution]');if(!host)return;
 const script=document.currentScript,packURL=script.dataset.packRuntime;
 const $=selector=>host.querySelector(selector),chart=$('[data-distribution-chart]'),tabs=[...host.querySelectorAll('[role=tab]')];
 const listDialog=$('#member-distribution-list'),zoomControls=$('[data-distribution-zoom]'),zoomIn=$('[data-distribution-zoom-in]'),zoomOut=$('[data-distribution-zoom-out]');
 const detailDialog=$('#member-distribution-detail'),expand=$('[data-distribution-expand]'),stage=$('[data-distribution-stage]'),plot=$('.member-distribution-plot'),actions=$('.member-distribution-actions'),actionHome=actions.parentElement;
 const names={institutions:'学校 / 单位',research:'研究方向',stages:'学习阶段',cohorts:'出生年代'};
 const captions={institutions:'气泡面积与成员人数成正比。悬停、点击或用键盘选中气泡可查看全称与人数。',research:'按分隔符拆分研究方向，保留全部名称；某名称的字按原顺序包含在另一个名称中时，也计入前者。同一成员对同一名称只计一次，一人可计入多个方向。',stages:'按成员填写的当前学习阶段统计，每位成员只计入一个阶段。',cohorts:'按出生年份所属年代统计，例如 90 后为 1990—1999 年出生。个人出生年月不对外展示。'};
 let kind='institutions',data=null,initialized=false,pending=null,lastRead=0,packPromise=null,drawRevision=0,resizeFrame=0,lastSize='',stopPhysics=null,motionPaused=false,bubbleZoom=1,view=null,selectedLabel=null,wheelFrame=0,wheelDelta=0;
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
  const preference=matchMedia('(prefers-reduced-motion: reduce)'),control=$('[data-distribution-motion]'),resetControl=$('[data-distribution-reset]');
  let frameId=0,lastTick=0,inView=false,disposed=false,pointer=null,drag=null;
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const enabled=()=>!disposed&&inView&&!document.hidden&&!preference.matches&&!motionPaused&&!listDialog.open&&!document.documentElement.classList.contains('profile-required-open');
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
   cancelWheelZoom();
   if(bubbleZoom!==1){bubbleZoom=1;selectedLabel=null;void draw(true);return;}
   if(drag&&svg.hasPointerCapture(drag.pointerId))svg.releasePointerCapture(drag.pointerId);
   pointer=null;drag=null;lastTick=0;svg.classList.remove('is-dragging');
   for(const item of items){item.x=item.homeX;item.y=item.homeY;item.vx=0;item.vy=0;item.squeeze=0;item.pressure=0;item.angle=0;item.g.classList.remove('is-selected');place(item);}
   selectedLabel=null;for(const selection of host.querySelectorAll('[data-distribution-selection],[data-distribution-detail-selection]')){selection.textContent='';selection.title='';}centerView();
  };
  const observer=new IntersectionObserver(entries=>{inView=entries.some(e=>e.isIntersecting);update();},{threshold:.01});observer.observe(svg);
  const gate=new MutationObserver(update);gate.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',update);preference.addEventListener('change',update);update();
  return ()=>{disposed=true;cancelAnimationFrame(frameId);observer.disconnect();gate.disconnect();document.removeEventListener('visibilitychange',update);preference.removeEventListener('change',update);control.onclick=null;control.hidden=true;resetControl.onclick=null;resetControl.hidden=true;};
 }
 function bubbleLabel(g,row,r,measure){
  const font=Math.min(detailDialog.open?18:13,Math.max(9,r*.4)),lineHeight=font*1.35,width=r*1.5,maxLines=r>=34?2:1,chars=[...row.label],lines=[];
  measure.font=`550 ${font}px ${getComputedStyle(chart).fontFamily}`;
  while(chars.length&&lines.length<maxLines){
   let line=chars.shift();
   while(chars.length&&measure.measureText(line+chars[0]).width<=width)line+=chars.shift();
   lines.push(line);
  }
  if(chars.length&&lines.length){let last=lines.pop();while([...last].length>1&&measure.measureText(last+'…').width>width)last=[...last].slice(0,-1).join('');lines.push(measure.measureText(last+'…').width<=width?last+'…':last);}
  const showCount=r>=18,total=lines.length+(showCount?1:0),text=node('text',{'text-anchor':'middle','font-size':font});
  lines.forEach((line,i)=>text.append(node('tspan',{x:0,y:(i-(total-1)/2)*lineHeight+font*.34,class:'bubble-label'},line)));
  if(showCount)text.append(node('tspan',{x:0,y:((total-1)/2)*lineHeight+font*.34,class:'bubble-count'},row.count+' 人'));
  g.append(text);
 }
 function bubbleChart(svg,list,width,height){
  const root=window.d3.hierarchy({children:list}).sum(d=>d.count||0).sort((a,b)=>b.value-a.value||a.data.label?.localeCompare(b.data.label||'','zh-CN')||0);
  const packed=window.d3.pack().size([width-16,height-16]).padding(6)(root);
  const leaves=packed.leaves(),left=Math.min(...leaves.map(d=>d.x-d.r)),right=Math.max(...leaves.map(d=>d.x+d.r)),top=Math.min(...leaves.map(d=>d.y-d.r)),bottom=Math.max(...leaves.map(d=>d.y+d.r));
  const scale=Math.min((width-20)/(right-left||1),(height-20)/(bottom-top||1)),cx=(left+right)/2,cy=(top+bottom)/2;
  const items=[],measure=document.createElement('canvas').getContext('2d');
  for(const [i,leaf]of leaves.entries()){
   const x=(leaf.x-cx)*scale+width/2,y=(leaf.y-cy)*scale+height/2,r=leaf.r*scale,row=leaf.data,g=node('g',{class:'member-bubble','data-count':row.count,transform:`translate(${x},${y})`,style:`--bubble-hue:${[164,208,282,24,336,48,190,252][i%8]}`});
   const circle=node('circle',{r:r.toFixed(3)});g.append(circle);interactive(g,row);
   bubbleLabel(g,row,r,measure);
   svg.append(g);items.push({g,circle,row,r,x,y,homeX:x,homeY:y,vx:Math.sin(i*2)*.1,vy:Math.cos(i*2)*.1,squeeze:0,pressure:0,angle:0});
  }
  stopPhysics=bubbleMotion(svg,items,width,height);
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
 async function draw(resetView=false){
  const center=!resetView&&view?.kind===kind?{x:(chart.scrollLeft+view.width/2-view.offsetX)/view.svgWidth,y:(chart.scrollTop+view.height/2-view.offsetY)/view.svgHeight}:{x:.5,y:.5};
  const version=++drawRevision;stopPhysics?.();stopPhysics=null;$('[data-distribution-motion]').hidden=true;$('[data-distribution-reset]').hidden=true;zoomControls.hidden=true;if(!data)return;
  $('[data-distribution-total]').textContent=data.members+' 人';$('[data-distribution-summary]').textContent='已完善资料的成员';$('[data-distribution-caption]').textContent=captions[kind];for(const selection of host.querySelectorAll('[data-distribution-selection],[data-distribution-detail-selection]')){selection.textContent='';selection.title='';}
  if(listDialog.open)renderList();chart.replaceChildren();$('[data-distribution-retry]').hidden=true;
  const list=rows();if(!data.members||!list.length){const p=document.createElement('p');p.textContent='成员完善资料后，统计将在这里显示。';const a=document.createElement('a');a.href='/account/#profile-form';a.textContent='前往个人中心';chart.append(p,a);return;}
  const bubble=kind==='institutions'||kind==='research';chart.dataset.pannable=String(bubble);
  if(bubble){try{await packRuntime();}catch(error){if(version!==drawRevision)return;chart.textContent=error.message+' 可在数据列表中查看统计。';$('[data-distribution-retry]').hidden=false;return;}}
  if(version!==drawRevision)return;
  const width=Math.max(220,chart.clientWidth),height=Math.max(280,chart.clientHeight);
  const shown=bubble?list.filter(r=>r.count>0).slice(0,40):list;
  // Preserve readable bar labels; the chart scrolls horizontally if many birth decades are present.
  const svgWidth=bubble?width*bubbleZoom:Math.max(width,shown.length*(kind==='cohorts'?90:65)+48),svgHeight=bubble?height*bubbleZoom:height;
  const svg=node('svg',{viewBox:`0 0 ${svgWidth} ${svgHeight}`,width:svgWidth,height:svgHeight,role:'group','aria-label':names[kind]+'人数统计','data-zoomed':String(bubble&&bubbleZoom>1)});
  svg.style.marginTop=Math.max(0,(height-svgHeight)/2)+'px';
  svg.append(node('desc',{},captions[kind]));
  if(bubble)bubbleChart(svg,shown,svgWidth,svgHeight);else barChart(svg,shown,svgWidth,height);
  // A viewport of spare space surrounds the drawing, so the background can also pan at 100%.
  const offsetX=bubble?width/2:0,offsetY=bubble?height/2:0;
  if(bubble){const world=document.createElement('div');world.className='member-distribution-world';world.style.width=svgWidth+width+'px';world.style.height=svgHeight+height+'px';svg.style.cssText=`position:absolute;left:${offsetX}px;top:${offsetY}px;margin:0`;world.append(svg);chart.append(world);}else chart.append(svg);
  view={kind,width,height,svgWidth,svgHeight,offsetX,offsetY};
  chart.scrollLeft=Math.max(0,offsetX+center.x*svgWidth-chart.clientWidth/2);chart.scrollTop=Math.max(0,offsetY+center.y*svgHeight-chart.clientHeight/2);
  if(bubble){zoomControls.hidden=false;zoomIn.disabled=bubbleZoom>=3;zoomOut.disabled=bubbleZoom<=.5;zoomControls.setAttribute('aria-label',`气泡图缩放，当前 ${Math.round(bubbleZoom*100)}%`);expand.setAttribute('aria-label','大图查看'+(kind==='institutions'?'学校或单位':'研究方向')+'分布');}
  if(selectedLabel){const selected=[...svg.querySelectorAll('.member-bubble,.member-bar')].find(g=>g.querySelector('title')?.textContent.startsWith(selectedLabel+'：')||g.getAttribute('aria-label')?.startsWith(selectedLabel+'，'));const row=shown.find(r=>r.label===selectedLabel);if(selected&&row)select(row,selected);}
  if(bubble&&list.length>40)$('[data-distribution-caption]').textContent+=' 图中显示人数最多的 40 项，其余项目可在数据列表中查询。';
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

 function activate(tab){cancelWheelZoom();kind=tab.dataset.distributionTab;bubbleZoom=1;selectedLabel=null;for(const t of tabs){const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;}$('[role=tabpanel]').setAttribute('aria-labelledby',tab.id);$('#member-distribution-search').value='';void draw(true);}
 function cancelWheelZoom(){cancelAnimationFrame(wheelFrame);wheelFrame=0;wheelDelta=0;}
 function applyZoom(value){const next=Math.max(.5,Math.min(3,value));if(next===bubbleZoom)return;bubbleZoom=next;void draw(true);}
 function changeZoom(step){cancelWheelZoom();applyZoom(bubbleZoom+step);}
 function centerView(){if(view)chart.scrollTo({left:view.offsetX+view.svgWidth/2-chart.clientWidth/2,top:view.offsetY+view.svgHeight/2-chart.clientHeight/2,behavior:'instant'});}
 zoomIn.onclick=()=>changeZoom(.25);zoomOut.onclick=()=>changeZoom(-.25);
 plot.addEventListener('wheel',e=>{
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||!e.deltaY||view?.kind!==kind||!chart.querySelector('.member-distribution-world'))return;
  e.preventDefault();
  if(pan||chart.querySelector('.is-dragging'))return;
  const unit=e.deltaMode===1?16:e.deltaMode===2?chart.clientHeight:1;
  wheelDelta=Math.max(-600,Math.min(600,wheelDelta+e.deltaY*unit));
  // Batch high-frequency mouse and trackpad events into one redraw per frame.
  if(!wheelFrame)wheelFrame=requestAnimationFrame(()=>{const delta=wheelDelta;wheelFrame=0;wheelDelta=0;applyZoom(bubbleZoom*Math.exp(-delta*.0015));});
 },{passive:false});
 // Touch pans the background directly; at enlarged scales it can also start over a bubble.
 // Using one gesture controller avoids native scroll inertia moving the chart after a reset.
 let pan=null;
 chart.addEventListener('pointerdown',e=>{
  const touchCamera=e.pointerType==='touch'&&(bubbleZoom>1||motionPaused||matchMedia('(prefers-reduced-motion: reduce)').matches);
  if(!e.isPrimary||e.button!==0||e.target.closest('.member-bar')||e.target.closest('.member-bubble')&&!touchCamera||chart.dataset.pannable!=='true')return;
  pan={id:e.pointerId,x:e.clientX,y:e.clientY,left:chart.scrollLeft,top:chart.scrollTop};
  chart.setPointerCapture(e.pointerId);chart.classList.add('is-panning');e.preventDefault();
 });
 chart.addEventListener('pointermove',e=>{if(pan?.id===e.pointerId){chart.scrollLeft=pan.left+pan.x-e.clientX;chart.scrollTop=pan.top+pan.y-e.clientY;}});
 const endPan=e=>{if(pan?.id!==e.pointerId)return;pan=null;chart.classList.remove('is-panning');if(chart.hasPointerCapture(e.pointerId))chart.releasePointerCapture(e.pointerId);};
 for(const event of ['pointerup','pointercancel','lostpointercapture'])chart.addEventListener(event,endPan);
 chart.addEventListener('keydown',e=>{
  if(e.target!==chart||chart.dataset.pannable!=='true')return;
  const delta={ArrowLeft:[-60,0],ArrowRight:[60,0],ArrowUp:[0,-60],ArrowDown:[0,60]}[e.key];
  if(delta){e.preventDefault();chart.scrollBy(...delta);}
 });
 expand.onclick=()=>{
  cancelWheelZoom();bubbleZoom=1;selectedLabel=null;
  $('#member-distribution-detail-title').textContent=names[kind];
  detailDialog.showModal();document.documentElement.classList.add('member-distribution-detail-open');
  $('[data-distribution-detail-body]').append(plot);$('[data-distribution-detail-actions]').append(actions);
  $('[data-distribution-detail-close]').focus({preventScroll:true});void draw(true);
 };
 $('[data-distribution-detail-close]').onclick=()=>detailDialog.close();
 detailDialog.addEventListener('cancel',e=>{e.preventDefault();detailDialog.close();});
 detailDialog.addEventListener('close',()=>{
  cancelWheelZoom();bubbleZoom=1;selectedLabel=null;
  stage.append(plot);actionHome.append(actions);document.documentElement.classList.remove('member-distribution-detail-open');void draw(true).then(()=>expand.focus({preventScroll:true}));
 });
 for(const [i,tab]of tabs.entries()){
  tab.onclick=()=>activate(tab);
  tab.onkeydown=e=>{const next=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;if(next!==null){e.preventDefault();tabs[next].focus();activate(tabs[next]);}};
 }
 $('[data-distribution-list-toggle]').onclick=()=>{renderList();listDialog.showModal();document.documentElement.classList.add('member-distribution-dialog-open');$('#member-distribution-search').focus({preventScroll:true});};
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
