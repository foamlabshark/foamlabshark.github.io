/* Linked geometry/equation explorers. All numerical updates are local. */
'use strict';
(function(root){
 const finite={
  pressureFace(p,i,D=1,h=1){
   const left=(p[i+1]-p[i-1])/(2*h),right=(p[i+2]-p[i])/(2*h);
   const average=(left+right)/2,compact=(p[i+1]-p[i])/h;
   return {left,right,average,compact,linear:1,corrected:1-D*(compact-average)};
  },
  pressureRepair(pred,fraction=1){
   const p=[0];
   for(let i=1;i<pred.length-1;i++)p.push(p[i-1]+pred[i]-pred[0]);
   const flux=pred.map((v,i)=>i&&i<pred.length-1?v-fraction*(p[i]-p[i-1]):v);
   return {p,flux,residual:flux.slice(1).map((v,i)=>v-flux[i])};
  },
  time(z,method,count=16,eulerStart=true){
   const a=[1];
   for(let n=1;n<=count;n++){
    const old=a[n-1],older=a[n-2];let value;
    if(method==='fe')value=(1-z)*old;
    else if(method==='be'||(n===1&&(method==='bdf'||method==='lf'||eulerStart)))value=old/(1+z);
    else if(method==='cn')value=(1-z/2)/(1+z/2)*old;
    else if(method==='bdf')value=(4*old-older)/(3+2*z);
    else if(method==='lf')value=older-2*z*old;
    else throw new Error('Unknown time method');
    a.push(value);
   }
   return a;
  },
  limiter(r,scheme){
   if(scheme==='quick')return (r+3)/4;
   if(r<=0)return 0;
   if(scheme==='minmod')return Math.min(1,r);
   if(scheme==='osher')return Math.min(2,r);
   if(scheme==='superbee')return Math.max(Math.min(1,2*r),Math.min(2,r));
   if(scheme==='muscl')return Math.min(2*r,(r+1)/2,2);
   if(scheme==='smart')return r<.2?4*r:r<7/3?(r+3)/4:4/3;
   return Number.isFinite(r)?2*r/(1+r):2;
  },
  normalized(s,scheme){
   if(scheme==='quick')return .75*s+.375;
   if(s<=0||s>=1)return s;
   return s+.5*this.limiter(s/(1-s),scheme)*(1-s);
  },
  reconstruct(values,scheme,reverse=false){const weights={upwind:[0,1,0],downwind:[0,0,1],central:[0,.5,.5],sou:[-.5,1.5,0],quick:[-.125,.75,.375],fromm:[-.25,1,.25]}[scheme];const order=reverse?[2,1,0]:[0,1,2];return {weights,order,value:weights.reduce((s,w,i)=>s+w*values[order[i]],0)};},
  balance:(inner,outlet)=>({owner:inner-1,neighbour:outlet-inner,total:outlet-1}),
  split(angle,method,gy=.5){const r=angle*Math.PI/180,c=Math.cos(r),s=Math.sin(r),E=method==='minimum'?c:method==='equal'?1:1/c;return {sx:c,sy:s,E,tx:c-E,ty:s,implicit:-E,correction:-(c-E+gy*s),total:-(c+gy*s)};},
  diffusion(n,g=1){return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?g*(i===0||i===n-1?3:2):Math.abs(i-j)===1?-g:0));},
  residual(A,x,b){return Math.max(...A.map((row,i)=>Math.abs(b[i]-row.reduce((s,v,j)=>s+v*x[j],0))));}
 };
 if(typeof module==='object'&&module.exports){module.exports=finite;return;}
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=n=>Math.abs(n)<1e-10?'0':Number(n.toFixed(3)).toString();
 function mount(host,type){
  if(type==='pressure')return pressureExplorer(host);
  if(type==='time')return timeExplorer(host);
  if(type==='limiter')return limiterExplorer(host);
  if(type==='reconstruction')return reconstruction(host);
  if(type==='nonorth')return nonorth(host);
  if(!['flux','balance','matrix'].includes(type))return null;
  let playing=false,timer=0,step=0,selected={kind:type==='matrix'?'cell':'face',index:type==='matrix'?2:1},hover=null;
  const v={inner:1.4,outlet:1,u:2,angle:30,area:1,g:1},x=Array(5).fill(0);
  const title={flux:'从速度投影到面通量',balance:'同一个面，两侧的守恒方程',matrix:'从单元连接到矩阵系数'}[type];
  host.classList.add('fvm-explorer');
  host.innerHTML=`<div class="fvm-explorer-heading"><span class="fvm-explorer-kicker">交互推导</span><h3>${title}</h3><p>${type==='flux'?'拖动速度箭头端点，观察投影、夹角与流入流出符号。':'移到图中的单元、面或矩阵元素上查看对应关系；点击可固定选择。'}</p></div><div class="fvm-explorer-controls fvm-controls"></div><div class="fvm-linked-view"><div class="fvm-scene-scroll"><svg class="fvm-explorer-scene" viewBox="0 0 900 390" aria-label="${title}" role="group"></svg></div><div class="fvm-equation-panel"></div></div><div class="fvm-explorer-detail" aria-live="polite"></div><output class="fvm-readout" aria-live="off"></output><div class="fvm-actions"></div>`;
  const controls=host.querySelector('.fvm-controls'),svg=host.querySelector('svg'),panel=host.querySelector('.fvm-equation-panel'),detail=host.querySelector('.fvm-explorer-detail'),out=host.querySelector('output'),actions=host.querySelector('.fvm-actions');
  function slider(key,label,min,max,value,delta){const el=document.createElement('label');el.innerHTML=`<span>${label} <b>${value}</b></span><input type="range" min="${min}" max="${max}" step="${delta}" value="${value}" aria-label="${label}">`;controls.append(el);el.lastChild.addEventListener('input',e=>{v[key]=+e.target.value;el.querySelector('b').textContent=e.target.value;render();});}
  const marker=`<defs><marker id="arrow-${type}" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1 11 6 1 11Z" fill="context-stroke"/></marker><pattern id="grid-${type}" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#d8e5dc" stroke-width=".6"/></pattern></defs><rect width="900" height="390" fill="url(#grid-${type})"/>`;
  const text=(a,b,t,size=18,cls='')=>`<text x="${a}" y="${b}" class="${cls}" style="font-size:${size}px">${esc(t)}</text>`;
  const arrow=(a,b,c,d,cls='')=>`<path d="M${a} ${b}L${c} ${d}" class="fvm-flow ${cls}" marker-end="url(#arrow-${type})"/>`;
  function target(kind,index,label,body){return `<g data-kind="${kind}" data-index="${index}" tabindex="0" role="button" aria-label="${esc(label)}" class="fvm-hotspot">${body}<title>${esc(label)}</title></g>`;}
  function cell(index,x0,y,w,h,name){return target('cell',index,`选择单元 ${name}`,`<rect x="${x0}" y="${y}" width="${w}" height="${h}" rx="6" class="fvm-cell-shape"/>${text(x0+w/2,y+h/2,name,26,'fvm-centred')}<circle cx="${x0+w/2}" cy="${y+h/2+20}" r="4" class="fvm-centre-dot"/>`);}
  function render(){
   let s=marker;
   if(type==='balance'){
    const r=finite.balance(v.inner,v.outlet);
    s+=text(42,43,'整体边界',15)+`<rect x="139" y="80" width="620" height="240" rx="12" class="fvm-domain"/>`;
    s+=cell(0,160,100,290,200,'P')+cell(1,450,100,290,200,'N');
    const rates=[1,v.inner,v.outlet];
    [160,450,740].forEach((xx,i)=>{s+=target('face',i,['入口面','共享面 f','出口面'][i],`<path d="M${xx} 105V295" class="fvm-face-line"/><rect x="${xx-18}" y="100" width="36" height="200" fill="transparent"/>`)+arrow(xx-50,200,xx+48,200,i===1?'fvm-shared-flow':'')+text(xx,65,['入口 1','内面 '+fmt(v.inner),'出口 '+fmt(v.outlet)][i],18,'fvm-centred');});
    s+=text(300,351,'外法向 →',16,'fvm-centred')+text(592,351,'← 外法向',16,'fvm-centred');
    panel.innerHTML=`<div class="fvm-equation" data-cell="0"><span>单元 P</span><strong><em data-face="1">+ ${fmt(v.inner)}</em><em data-face="0">− 1</em> = ${fmt(r.owner)}</strong><small>共享面流出 − 入口流入</small></div><div class="fvm-equation" data-cell="1"><span>单元 N</span><strong><em data-face="2">+ ${fmt(v.outlet)}</em><em data-face="1">− ${fmt(v.inner)}</em> = ${fmt(r.neighbour)}</strong><small>出口流出 − 共享面流入</small></div><div class="fvm-equation fvm-total"><span>两单元相加</span><strong>${fmt(r.owner)} + (${fmt(r.neighbour)}) = ${fmt(r.total)}</strong><small>内部面的 +${fmt(v.inner)} 与 −${fmt(v.inner)} 相消</small></div>`;
    out.textContent=`净流出：P 为 ${fmt(r.owner)}，N 为 ${fmt(r.neighbour)}，整体为 ${fmt(r.total)} m³/s。若要求稳态不可压缩流动，最终还须使每个单元的净流出为零。`;
   }else if(type==='flux'){
    const a=v.angle*Math.PI/180,len=48*v.u,cx=420,cy=220,ux=cx+len*Math.cos(a),uy=cy-len*Math.sin(a),q=v.u*v.area*Math.cos(a);
    s+=cell(0,170,80,420,270,'控制体 P');
    s+=target('face',1,'面积向量 S：大小为面面积，方向为外法向',`<path d="M590 85V345" class="fvm-face-line"/><rect x="572" y="82" width="36" height="265" fill="transparent"/>`);
    s+=arrow(cx,cy,cx+90+20*v.area,cy)+text(cx+90+20*v.area,cy+33,'S',22);
    s+=`<path d="M${ux} ${uy}V${cy}" class="fvm-projection"/>`+arrow(cx,cy,ux,uy,'fvm-velocity')+arrow(cx,cy,ux,cy,'fvm-projected');
    s+=`<path d="M${cx+48} ${cy} A48 48 0 0 0 ${cx+48*Math.cos(a)} ${cy-48*Math.sin(a)}" class="fvm-angle"/>`+text(cx+60,cy-19,'θ',19);
    s+=target('vector',0,'速度箭头端点：拖动改变夹角；键盘左右键也可调整',`<circle cx="${ux}" cy="${uy}" r="17" class="fvm-drag-handle"/>${text(ux+21,uy-10,'U',23)}`);
    s+=text(40,42,'速度与面法向的点积',17)+text(42,374,'拖动橙色端点；绿色箭头为外向面积向量',15);
    panel.innerHTML=`<div class="fvm-equation"><span>速度的法向分量</span><strong>U cos θ = ${fmt(v.u*Math.cos(a))}</strong><small>θ = ${v.angle}°，速度 ${fmt(v.u)} m/s</small></div><div class="fvm-equation" data-face="1"><span>体积通量</span><strong>U · S = ${fmt(q)} m³/s</strong><small>${fmt(v.u)} × ${fmt(v.area)} × cos(${v.angle}°)</small></div><div class="fvm-equation fvm-total"><span>相对于当前单元</span><strong>${q>1e-9?'流出':q< -1e-9?'流入':'通量为零'}</strong><small>${Math.abs(q)<1e-9?'速度沿面运动，没有穿过该面。':'符号由速度与外法向的夹角决定。'}</small></div>`;
    out.textContent=`U · S = ${q.toFixed(3)} m³/s；${q>1e-9?'正值表示流出':q< -1e-9?'负值表示流入':'速度与面法向垂直，通量为零'}。`;
   }else{
    const n=5,A=finite.diffusion(n,v.g),b=[2*v.g,0,0,0,0];
    s+=text(35,35,'一维定常扩散：左边界 φ = 1，右边界 φ = 0',17);
    for(let i=0;i<n;i++)s+=cell(i,110+136*i,65,136,94,'C'+i)+text(178+136*i,187,'φ = '+fmt(x[i]),15,'fvm-centred');
    for(let i=0;i<n-1;i++)s+=target('face',i,'共享面 '+i+'：连接 C'+i+' 与 C'+(i+1),`<path d="M${246+136*i} 65V159" class="fvm-face-line"/><rect x="${230+136*i}" y="62" width="32" height="100" fill="transparent"/>`);
    s+=text(45,245,'矩阵 A',18)+text(565,245,'当前未知量 φ',18)+text(760,245,'右端 b',18);
    for(let i=0;i<n;i++){for(let j=0;j<n;j++)s+=target('coefficient',i*n+j,`A 的第 ${i} 行第 ${j} 列，系数 ${fmt(A[i][j])}`,`<rect x="${120+j*62}" y="${250+i*25}" width="61" height="25" rx="3" class="fvm-matrix-entry ${A[i][j]===0?'fvm-zero':''}"/>${text(151+j*62,268+i*25,fmt(A[i][j]),16,'fvm-centred')}`);s+=text(643,268+i*25,fmt(x[i]),16,'fvm-centred')+text(790,268+i*25,fmt(b[i]),16,'fvm-centred');}
    const active=hover||selected,index=active.kind==='cell'?active.index:active.kind==='coefficient'?Math.floor(active.index/5):active.index;
    panel.innerHTML=`<div class="fvm-equation"><span>共享面的扩散系数</span><strong>g = Γ S / d = ${fmt(v.g)}</strong><small>内部面为两侧方程各提供一个对角项和一个邻接项。</small></div><div class="fvm-equation fvm-row-equation"><span>第 ${index} 行</span><strong>${A[index].map((a,j)=>a?`<em data-cell="${j}">${a>0?'+':'−'} ${fmt(Math.abs(a))} φ<sub>${j}</sub></em>`:'').join('')} = ${fmt(b[index])}</strong><small>边界到体心距离为 d/2，所以边界导热系数为 2g。</small></div><div class="fvm-equation fvm-total"><span>Jacobi 迭代</span><strong>第 ${step} 轮</strong><small>残差 max |b − Aφ| = ${finite.residual(A,x,b).toExponential(3)}</small></div>`;
    out.textContent=`第 ${step} 轮；未归一化残差 ${finite.residual(A,x,b).toExponential(3)}。线性解的五个中心值依次为 0.9、0.7、0.5、0.3、0.1。`;
   }
   svg.innerHTML=s;highlight();
  }
  function highlight(){
   const active=hover||selected,{kind,index}=active;
   host.querySelectorAll('[data-kind]').forEach(el=>{const k=el.dataset.kind,i=+el.dataset.index;let on=k===kind&&i===index;
    if(type==='matrix'){if(kind==='cell'&&k==='coefficient')on=Math.floor(i/5)===index;
     if(kind==='face'&&k==='cell')on=i===index||i===index+1;
     if(kind==='face'&&k==='coefficient'){const row=Math.floor(i/5),col=i%5;on=[index,index+1].includes(row)&&[index,index+1].includes(col);}
     if(kind==='coefficient'&&k==='cell')on=i===Math.floor(index/5)||i===index%5;
    }el.classList.toggle('is-linked',on);el.setAttribute('aria-pressed',String(k===selected.kind&&i===selected.index));});
   panel.querySelectorAll('[data-face],[data-cell]').forEach(el=>el.classList.toggle('is-linked',kind==='face'&&+el.dataset.face===index||kind==='cell'&&+el.dataset.cell===index));
   if(type==='matrix'){
    let row=kind==='coefficient'?Math.floor(index/5):index;row=Math.min(row,4);const A=finite.diffusion(5,v.g),b=[2*v.g,0,0,0,0];
    const box=panel.querySelector('.fvm-row-equation');box.querySelector('span').textContent='第 '+row+' 行';box.querySelector('strong').innerHTML=A[row].map((a,j)=>a?`<em>${a>0?'+':'−'} ${fmt(Math.abs(a))} φ<sub>${j}</sub></em>`:'').join('')+' = '+fmt(b[row]);
    detail.textContent=kind==='face'?`共享面 ${index} 连接 C${index} 和 C${index+1}：两个对角元各加 g，两个相互耦合系数各为 −g。`:kind==='coefficient'?Math.abs(Math.floor(index/5)-index%5)>1?'这两个单元不共享面；当前两点扩散模板不直接耦合，系数为零。':Math.floor(index/5)===index%5?`对角系数收集 C${row} 的各面导热贡献。边界单元还包含给定值边界的 2g。`:`非对角系数 −g 把邻单元温度带入 C${row} 的方程。`:`单元 C${index} 对应矩阵第 ${index} 行。非零列就是与它直接耦合的未知量。`;
   }else if(type==='balance')detail.textContent=kind==='face'?(index===1?'共享面只有一个数值通量。相对于 P 是流出，相对于 N 是流入，所以两条方程中的符号相反。':index===0?'入口面只属于整体外边界，它向 P 输入流体；相对于 P 的外向通量为 −1。':'出口面把流体从 N 带出；改变出口流量会改变整体收支。'):`选中${index===0?' P':' N'}：绿色边框是控制体，方程只累计它的外向面通量。`;
   else detail.textContent=kind==='vector'?'速度大小相同，转动方向仍会改变穿过面的流量。把夹角转到 90°，检查法向投影怎样归零。':'面积向量垂直于面，大小等于面面积。只有速度沿这个方向的分量参与穿面输运。';
  }
  function choose(el,pin=false){if(!el)return;const next={kind:el.dataset.kind,index:+el.dataset.index};if(pin){selected=next;hover=null;}else hover=next;highlight();}
  svg.addEventListener('pointerover',e=>choose(e.target.closest('[data-kind]')));
  svg.addEventListener('pointerleave',()=>{hover=null;highlight();});
  svg.addEventListener('focusin',e=>choose(e.target.closest('[data-kind]')));
  svg.addEventListener('click',e=>choose(e.target.closest('[data-kind]'),true));
  svg.addEventListener('keydown',e=>{const el=e.target.closest('[data-kind]');if(!el)return;if(['Enter',' '].includes(e.key)){e.preventDefault();choose(el,true);}if(type==='flux'&&el.dataset.kind==='vector'&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();setAngle(v.angle+(e.key==='ArrowLeft'?1:-1));svg.querySelector('[data-kind="vector"]').focus();}});
  let dragging=false;
  function setAngle(angle){v.angle=Math.max(0,Math.min(180,Math.round(angle)));const input=controls.querySelector('input[aria-label="速度与外法向夹角 / °"]');input.value=v.angle;input.previousElementSibling.querySelector('b').textContent=v.angle;render();}
  svg.addEventListener('pointerdown',e=>{if(type!=='flux'||!e.target.closest('[data-kind="vector"]'))return;e.preventDefault();dragging=true;svg.setPointerCapture(e.pointerId);});
  svg.addEventListener('pointermove',e=>{if(!dragging)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());setAngle(Math.atan2(220-p.y,p.x-420)*180/Math.PI);});
  svg.addEventListener('pointerup',()=>{dragging=false;});svg.addEventListener('pointercancel',()=>{dragging=false;});
  let play;
  function pause(){playing=false;clearTimeout(timer);host.classList.remove('is-playing');if(play)play.textContent='播放';}
  function advance(){const A=finite.diffusion(5,v.g),b=[2*v.g,0,0,0,0],next=x.map((_,i)=>(b[i]-A[i].reduce((s,a,j)=>s+(j===i?0:a*x[j]),0))/A[i][i]);x.splice(0,5,...next);step++;render();if(step>=300)pause();}
  function tick(){if(!playing||document.hidden||!host.isConnected){pause();return;}advance();timer=setTimeout(tick,220);}
  function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);actions.append(b);return b;}
  if(type==='flux'){slider('u','速度 U / (m/s)',.1,5,2,.1);slider('area','面积 S / m²',.2,3,1,.1);slider('angle','速度与外法向夹角 / °',0,180,30,1);}
  if(type==='balance'){slider('inner','内面流量 / (m³/s)',0,2,1.4,.1);slider('outlet','出口流量 / (m³/s)',0,2,1,.1);}
  if(type==='matrix'){slider('g','导热系数 g',.2,3,1,.1);button('单步',()=>{pause();advance();});play=button('播放',()=>{if(playing)pause();else{playing=true;play.textContent='暂停';tick();}});button('重置',()=>{pause();step=0;x.fill(0);render();});}
  render();const io=new IntersectionObserver(es=>{if(!es[0].isIntersecting)pause();});io.observe(host);
  return {pause,destroy(){pause();io.disconnect();}};
 }
 function nonorth(host){
  let angle=30,method='minimum',gy=.5,active='S',drag=false;
  const id='fvm-split-'+Math.random().toString(36).slice(2);
  host.classList.add('fvm-explorer');
  host.innerHTML=`<div class="fvm-explorer-heading"><span class="fvm-explorer-kicker">交互推导</span><h3>同一通量，三种非正交分解</h3><p>拖动面法向箭头，或切换分解方法；移到向量和方程项上，查看它们怎样对应。</p></div><div class="fvm-explorer-controls fvm-controls"><label><span>非正交角 θ / ° <b>30</b></span><input aria-label="非正交角 θ / °" type="range" min="0" max="80" step="1" value="30"></label><label><span>切向梯度 gᵧ <b>0.5</b></span><input aria-label="切向梯度 gᵧ" type="range" min="-2" max="2" step="0.1" value="0.5"></label><label><span>面积向量分解</span><select aria-label="面积向量分解"><option value="minimum">最小修正</option><option value="equal">等幅修正</option><option value="over">过松弛分解</option></select></label></div><div class="fvm-linked-view"><div class="fvm-scene-scroll"><svg class="fvm-explorer-scene" viewBox="0 0 900 390" role="group" aria-label="面积向量与中心连线的非正交分解"></svg></div><div class="fvm-equation-panel"></div></div><div class="fvm-explorer-detail" aria-live="polite"></div><output class="fvm-readout"></output>`;
  const svg=host.querySelector('svg'),panel=host.querySelector('.fvm-equation-panel'),detail=host.querySelector('.fvm-explorer-detail'),out=host.querySelector('output'),inputs=host.querySelectorAll('input');
  function highlight(key){active=key;host.querySelectorAll('[data-part]').forEach(e=>e.classList.toggle('is-linked',e.dataset.part===key));detail.textContent={S:'S 是真实面面积向量。它与中心连线的夹角为 θ，总扩散通量始终由 −∇φ · S 决定。',E:'E 平行于中心连线。沿这个方向的导数可以用两中心差商表示，因此这部分隐式进入矩阵。',T:'T = S − E 是剩余向量。它与已有梯度点乘，形成显式修正；切换分解会同时改变 E 和 T。'}[key];}
  function draw(){const a=finite.split(angle,method,gy),x0=160,y0=280,k=Math.min(200,620/Math.max(1,a.E)),sx=x0+k*a.sx,sy=y0-k*a.sy,ex=x0+k*a.E;
   const vector=(part,x,y,u,v,label)=>`<g data-part="${part}" tabindex="0" role="button" aria-label="${label}" class="fvm-hotspot"><path d="M${x} ${y}L${u} ${v}" stroke="transparent" stroke-width="24"/><path d="M${x} ${y}L${u} ${v}" class="fvm-flow" marker-end="url(#${id})"/><text x="${(x+u)/2+8}" y="${(y+v)/2-15}">${part}</text></g>`;
   svg.innerHTML=`<defs><marker id="${id}" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1 11 6 1 11Z" fill="context-stroke"/></marker></defs><text x="38" y="42">面积向量移至 C 比较方向；|S| = 1、Γ = 1、CF = 1、gₓ = 1</text><path d="M65 ${y0}H825" stroke="#aac7b7" stroke-width="2" stroke-dasharray="7 7"/><circle cx="${x0}" cy="${y0}" r="5" fill="#24624f"/><text x="${x0-8}" y="${y0+35}">C</text><circle cx="${x0+k}" cy="${y0}" r="5" fill="#24624f"/><text x="${x0+k-5}" y="${y0+35}">F</text><text x="812" y="${y0+35}">e</text>${vector('E',x0,y0,ex,y0,'隐式向量 E')}${vector('T',ex,y0,sx,sy,'修正向量 T')}${vector('S',x0,y0,sx,sy,'真实面积向量 S')}<circle data-normal-handle cx="${sx}" cy="${sy}" r="11" fill="#dba855" stroke="#235c4c" stroke-width="2" tabindex="0" role="slider" aria-label="拖动改变非正交角" aria-valuemin="0" aria-valuemax="80" aria-valuenow="${angle}"/><text x="38" y="365">θ = ${angle}°　　|E| = ${fmt(a.E)}　　|T| = ${fmt(Math.hypot(a.tx,a.ty))}</text>`;
   panel.innerHTML=`<div class="fvm-equation" data-part="E" tabindex="0"><small>隐式两点部分</small><strong>−gₓ E = ${fmt(a.implicit)}</strong><p>中心差商贡献，进入矩阵。</p></div><div class="fvm-equation" data-part="T" tabindex="0"><small>显式非正交修正</small><strong>−∇φ · T = ${fmt(a.correction)}</strong><p>由已有梯度补齐剩余方向。</p></div><div class="fvm-equation" data-part="S" tabindex="0"><small>相加得到真实通量</small><strong>−∇φ · S = ${fmt(a.total)}</strong><p>${fmt(a.implicit)} + (${fmt(a.correction)}) = ${fmt(a.total)}</p></div>`;
   out.textContent=`固定当前几何与梯度，三种分解的总通量相同。θ 增大时，最小修正削弱隐式项，过松弛分解增强隐式项；显式项随之补偿。`;highlight(active);
  }
  inputs[0].addEventListener('input',e=>{angle=+e.target.value;e.target.previousElementSibling.querySelector('b').textContent=angle;draw();});
  inputs[1].addEventListener('input',e=>{gy=+e.target.value;e.target.previousElementSibling.querySelector('b').textContent=gy;draw();});
  host.querySelector('select').addEventListener('change',e=>{method=e.target.value;draw();});
  host.addEventListener('pointerover',e=>{const part=e.target.closest('[data-part]');if(part)highlight(part.dataset.part);});
  host.addEventListener('focusin',e=>{const part=e.target.closest('[data-part]');if(part)highlight(part.dataset.part);});
  function setAngle(value){angle=Math.max(0,Math.min(80,Math.round(value)));inputs[0].value=angle;inputs[0].previousElementSibling.querySelector('b').textContent=angle;draw();}
  svg.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-normal-handle]'))return;drag=true;svg.setPointerCapture(e.pointerId);e.preventDefault();});
  svg.addEventListener('pointermove',e=>{if(!drag)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());setAngle(Math.atan2(280-p.y,p.x-160)*180/Math.PI);});
  svg.addEventListener('pointerup',()=>{drag=false;});svg.addEventListener('pointercancel',()=>{drag=false;});
  svg.addEventListener('keydown',e=>{if(!e.target.matches('[data-normal-handle]')||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();setAngle(angle+(['ArrowUp','ArrowLeft'].includes(e.key)?1:-1));svg.querySelector('[data-normal-handle]').focus();});
  draw();return {pause(){drag=false;},destroy(){drag=false;}};
 }
 function reconstruction(host){
  const names={upwind:'一阶迎风',central:'中心差分',sou:'二阶迎风 SOU',quick:'QUICK',fromm:'FROMM',downwind:'下风'};
  const values=[0,1,1],uid='reconstruction-'+Math.random().toString(36).slice(2);
  let scheme='quick',reverse=false,drag=-1,active=1;
  host.classList.add('fvm-explorer','fvm-reconstruction');
  host.innerHTML='<div class="fvm-explorer-heading"><span class="fvm-explorer-kicker">交互推导</span><h3>拖动三个单元值，观察面值怎样重构</h3><p>橙色点可上下拖动；移到点或公式项上查看权重。切换流向后，上游模板随之反转。</p></div><div class="fvm-controls fvm-explorer-controls"><label><span>插值格式</span><select aria-label="插值格式">'+Object.entries(names).map(([k,n])=>'<option value="'+k+'" '+(k===scheme?'selected':'')+'>'+n+'</option>').join('')+'</select></label><label><span>流动方向</span><select aria-label="流动方向"><option value="right">向右 →</option><option value="left">向左 ←</option></select></label></div><div class="fvm-actions"></div><div class="fvm-linked-view"><div class="fvm-scene-scroll"><svg class="fvm-explorer-scene" viewBox="0 0 900 430" role="group" aria-label="上游重构曲线与单元值"></svg></div><div class="fvm-equation-panel"></div></div><div class="fvm-explorer-detail" aria-live="polite"></div><output class="fvm-readout"></output>';
  const controls=host.querySelector('.fvm-controls'),svg=host.querySelector('svg'),panel=host.querySelector('.fvm-equation-panel'),detail=host.querySelector('.fvm-explorer-detail'),out=host.querySelector('output'),actions=host.querySelector('.fvm-actions');
  const sliders=values.map((v,i)=>{
   const label=document.createElement('label'),name=['左','中','右'][i]+'单元值';
   label.innerHTML='<span>'+name+' <b>'+v+'</b></span><input type="range" min="0" max="1" step=".01" value="'+v+'" aria-label="'+name+'">';
   controls.append(label);const input=label.querySelector('input');input.addEventListener('input',()=>setValue(i,+input.value));return input;
  });
  for(const [label,preset] of [['阶跃',[0,1,1]],['线性',[0,.5,1]],['尖峰',[0,1,0]]]){
   const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{values.splice(0,3,...preset);sync();draw();});actions.append(b);
  }
  const Y=v=>330-(v+.5)*130,X=i=>250+180*i;
  const text=(x,y,s,cls='')=>'<text x="'+x+'" y="'+y+'" class="'+cls+'">'+esc(s)+'</text>';
  function sync(){sliders.forEach((s,i)=>{s.value=values[i];s.previousElementSibling.querySelector('b').textContent=fmt(values[i]);});}
  function setValue(i,v){values[i]=Math.max(0,Math.min(1,Math.round(v*100)/100));sync();draw();}
  function highlight(i){
   active=i;host.querySelectorAll('[data-node]').forEach(el=>el.classList.toggle('is-linked',+el.dataset.node===i));
   const a=finite.reconstruct(values,scheme,reverse),j=a.order.indexOf(i);
   detail.textContent=['左','中','右'][i]+'单元现在是 '+['U（再上游）','C（紧邻上游）','D（下游）'][j]+'，值为 '+fmt(values[i])+'；权重 '+fmt(a.weights[j])+'，对面值的贡献为 '+fmt(a.weights[j]*values[i])+'。'+(a.weights[j]<0?'负权重允许外推，也可能使面值越过邻值范围。':a.weights[j]===0?'当前格式没有使用这个点。':'改变该单元值会按相应权重改变面值。');
  }
  function draw(){
   const a=finite.reconstruct(values,scheme,reverse),dir=reverse?-1:1,fx=X(1)+90*dir;
   const lo=Math.min(values[1],values[a.order[2]]),hi=Math.max(values[1],values[a.order[2]]),outside=a.value<lo-1e-10||a.value>hi+1e-10;
   const [u,c,d]=a.order.map(i=>values[i]);
   function curve(t){return scheme==='quick'?c+.5*(d-u)*t+(.5*(u+d)-c)*t*t:scheme==='central'?c+(d-c)*t:scheme==='sou'?c+(c-u)*t:scheme==='fromm'?c+.5*(d-u)*t:scheme==='downwind'?d:c;}
   const path=Array.from({length:151},(_,i)=>{const xx=160+i*3.6,t=(xx-X(1))/180*dir;return (i?'L':'M')+xx+' '+Y(curve(t));}).join(' ');
   let drawing='<defs><clipPath id="'+uid+'-clip"><rect x="100" y="65" width="680" height="310"/></clipPath><marker id="'+uid+'-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#37715d"/></marker></defs><rect x="100" y="'+Y(hi)+'" width="680" height="'+Math.max(2,Y(lo)-Y(hi))+'" fill="#dcebdc"/>';
   drawing+=text(105,34,'绿色带：面两侧值的范围；橙色曲线：当前重构');
   for(const v of [-.5,0,.5,1,1.5])drawing+='<path d="M100 '+Y(v)+'H780" stroke="#cbdad0" stroke-width=".7"/>'+text(60,Y(v)+5,fmt(v));
   drawing+='<path d="M'+fx+' 65V375" stroke="#265e4d" stroke-width="2" stroke-dasharray="7 5"/>'+text(fx+10,85,'面 f')+'<g clip-path="url(#'+uid+'-clip)"><path d="'+path+'" fill="none" stroke="#b0782e" stroke-width="3"/></g>';
   values.forEach((v,i)=>{
    drawing+='<g data-node="'+i+'" class="fvm-hotspot" tabindex="0" role="slider" aria-label="'+['左','中','右'][i]+'单元值，拖动或用上下键调整" aria-valuemin="0" aria-valuemax="1" aria-valuenow="'+v+'"><path d="M'+X(i)+' '+Y(v)+'V375" stroke="#9cb7a6" stroke-dasharray="4 4"/><circle cx="'+X(i)+'" cy="'+Y(v)+'" r="12" class="fvm-drag-handle"/>'+text(X(i),397,['U','C','D'][a.order.indexOf(i)]+' = '+fmt(v),'fvm-centred')+'</g>';
   });
   drawing+='<circle cx="'+fx+'" cy="'+Y(a.value)+'" r="8" fill="'+(outside?'#ae542d':'#286752')+'" stroke="#fff" stroke-width="2"/>'+text(fx+16,Y(a.value)-12,'φf = '+fmt(a.value))+'<path d="M'+(reverse?720:150)+' 414H'+(reverse?150:720)+'" stroke="#37715d" stroke-width="2" marker-end="url(#'+uid+'-arrow)"/>';
   svg.innerHTML=drawing;
   panel.innerHTML='<div class="fvm-equation"><span>'+names[scheme]+' · 面值</span><strong>'+a.weights.map((w,j)=>'<em data-node="'+a.order[j]+'" tabindex="0">'+(w<0?'−':'+')+fmt(Math.abs(w))+' × '+fmt(values[a.order[j]])+'</em>').join('')+' = '+fmt(a.value)+'</strong><small>三项依次来自 U、C、D；权重之和为 1。</small></div><div class="fvm-equation"><span>按全局向右为正的面流率</span><strong>m = '+dir+'，m φf = '+fmt(dir*a.value)+'</strong><small>流率相同，改变重构会改变标量输运通量。</small></div><div class="fvm-equation fvm-total"><span>与当前相邻值范围比较</span><strong>'+(outside?'面值越界':'面值在范围内')+' · ['+fmt(lo)+', '+fmt(hi)+']</strong><small>这里检查当前面重构；整个方程的有界性还与其余系数及时间推进有关。</small></div>';
   out.textContent=names[scheme]+'，'+(reverse?'向左':'向右')+'流动；面值 '+fmt(a.value)+'，标量通量 '+fmt(dir*a.value)+'。';highlight(active);
  }
  host.querySelector('[aria-label="插值格式"]').addEventListener('change',e=>{scheme=e.target.value;draw();});
  host.querySelector('[aria-label="流动方向"]').addEventListener('change',e=>{reverse=e.target.value==='left';draw();});
  host.addEventListener('pointerover',e=>{const n=e.target.closest('[data-node]');if(n)highlight(+n.dataset.node);});
  host.addEventListener('focusin',e=>{const n=e.target.closest('[data-node]');if(n)highlight(+n.dataset.node);});
  svg.addEventListener('pointerdown',e=>{const n=e.target.closest('[data-node]');if(!n)return;drag=+n.dataset.node;svg.setPointerCapture(e.pointerId);e.preventDefault();});
  svg.addEventListener('pointermove',e=>{if(drag<0)return;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());setValue(drag,(330-p.y)/130-.5);});
  svg.addEventListener('pointerup',()=>{drag=-1;});svg.addEventListener('pointercancel',()=>{drag=-1;});
  svg.addEventListener('keydown',e=>{const n=e.target.closest('[data-node]');if(!n||!['ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const i=+n.dataset.node;setValue(i,values[i]+(e.key==='ArrowUp'?.01:-.01));svg.querySelector('[data-node="'+i+'"]').focus();});
  draw();return {pause(){drag=-1;},destroy(){drag=-1;}};
 }
 function limiterExplorer(host){
  const names={vanleer:'van Leer',minmod:'MINMOD',osher:'OSHER',muscl:'MUSCL',superbee:'SUPERBEE',smart:'修正 SMART',quick:'未限制 QUICK'};
  let s=.5,scheme='vanleer',drag=false,active='nvd';
  const plotId='limiter-'+Math.random().toString(36).slice(2);
  host.classList.add('fvm-explorer','fvm-limiter-linked');
  host.innerHTML='<div class="fvm-explorer-heading"><span class="fvm-explorer-kicker">交互推导</span><h3>同一面值，在两张图中如何对应</h3><p>拖动左图的圆点，或点击图内任意横向位置。两张图与下方三点剖面同步更新；移到图或公式上可查看对应关系。</p></div><div class="fvm-controls"><label><span>高分辨率格式</span><select aria-label="高分辨率格式">'+Object.entries(names).map(([k,n])=>'<option value="'+k+'">'+n+'</option>').join('')+'</select></label><label><span>归一化上游值 s = <b>0.5</b></span><input type="range" min="-.25" max="1.25" value=".5" step=".005" aria-label="归一化上游值"></label></div><div class="fvm-actions"></div><div class="fvm-scene-scroll"><svg class="fvm-explorer-scene" viewBox="0 0 1000 650" role="group" aria-label="归一化变量图、Sweby 图与局部三点剖面"></svg></div><div class="fvm-equation-panel"></div><div class="fvm-explorer-detail" aria-live="polite"></div><output class="fvm-readout"></output>';
  const svg=host.querySelector('svg'),slider=host.querySelector('input'),panel=host.querySelector('.fvm-equation-panel'),detail=host.querySelector('.fvm-explorer-detail'),out=host.querySelector('output');
  const X=v=>88+(v+.25)/1.5*360,Y=v=>350-(v+.25)/1.5*260,R=v=>590+(v+1)/5*330,P=v=>350-(v+.4)/3.2*260;
  const tx=(x,y,t,c='')=>'<text x="'+x+'" y="'+y+'" class="'+c+'">'+esc(t)+'</text>';
  const line=(x,y,x2,y2,color='#a4bdad',dash='')=>'<path d="M'+x+' '+y+'L'+x2+' '+y2+'" fill="none" stroke="'+color+'" stroke-width="1.5"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
  const path=(fn,start,end,x,y)=>Array.from({length:401},(_,i)=>{const v=start+(end-start)*i/400;return(i?'L':'M')+x(v)+' '+y(fn(v));}).join(' ');
  function highlight(key){
   active=key;host.querySelectorAll('[data-link]').forEach(e=>e.classList.toggle('is-linked',e.dataset.link===key));
   detail.textContent={nvd:'左图：横坐标 s 是 C 相对于 U、D 的位置；纵坐标 F(s) 给出面值。浅绿色三角形表示稳态 CBC 范围，深绿色部分同时满足 TVD 空间上界。',tvd:'右图：r = s / (1 − s)，限制器 ψ 决定保留多少高阶修正。绿色区域的上边界为 min(2r, 2)；时间更新还需满足相应时间步条件。',profile:'下方剖面：固定 U = 0、D = 1，移动 C = s。虚线为未限制 QUICK，橙色点为选定格式的面值；两者差异正是被限制器改变的部分。'}[key];
  }
  function draw(){
   const f=finite.normalized(s,scheme),r=s===1?Infinity:s/(1-s),psi=finite.limiter(r,scheme),q=.75*s+.375,inRange=s>=0&&s<=1,tvdBound=r>0?Math.min(2*r,2):0;
   slider.value=s;slider.previousElementSibling.querySelector('b').textContent=fmt(s);
   let d='<defs><clipPath id="nvd-linked-clip"><rect x="70" y="72" width="400" height="285"/></clipPath><clipPath id="tvd-linked-clip"><rect x="580" y="72" width="350" height="285"/></clipPath></defs>';
   d+='<g data-link="nvd" tabindex="0" aria-label="归一化变量图"><rect x="40" y="40" width="445" height="365" rx="16" class="fvm-plot-card"/>'+tx(72,72,'归一化变量图 NVD')+'<path d="M'+X(0)+' '+Y(0)+'L'+X(0)+' '+Y(1)+'L'+X(1)+' '+Y(1)+'Z" fill="#e2eee3"/><path d="M'+X(0)+' '+Y(0)+'L'+X(.5)+' '+Y(1)+'L'+X(1)+' '+Y(1)+'Z" fill="#bdd5bb"/>';
   for(const v of [0,.5,1])d+=line(X(v),Y(-.25),X(v),Y(1.25)) +line(X(-.25),Y(v),X(1.25),Y(v))+tx(X(v),376,fmt(v),'fvm-centred')+tx(57,Y(v)+5,fmt(v));
   d+=line(X(0),Y(0),X(1),Y(1),'#578169','5 4');
   d+='<g clip-path="url(#nvd-linked-clip)"><path d="'+path(v=>finite.normalized(v,scheme),-.25,1.25,X,Y)+'" fill="none" stroke="#ae7428" stroke-width="3"/></g>';
   d+=line(X(s),Y(0),X(s),Y(f),'#aa7027','3 4')+line(X(0),Y(f),X(s),Y(f),'#aa7027','3 4')+'<circle cx="'+X(.5)+'" cy="'+Y(.75)+'" r="4" fill="#214e3f"/>'+tx(X(.5)+9,Y(.75)-12,'Q');
   d+='<circle data-nvd-handle cx="'+X(s)+'" cy="'+Y(f)+'" r="10" class="fvm-drag-handle" tabindex="0" role="slider" aria-label="归一化值拖动点" aria-valuemin="-.25" aria-valuemax="1.25" aria-valuenow="'+s+'"/>'+tx(412,390,'s')+tx(72,98,'F(s)')+'</g>';
   d+='<g data-link="tvd" tabindex="0" aria-label="Sweby 限制器图"><rect x="520" y="40" width="450" height="365" rx="16" class="fvm-plot-card"/>'+tx(554,72,'限制器图 Sweby')+'<path d="M'+R(0)+' '+P(0)+'L'+R(1)+' '+P(2)+'L'+R(4)+' '+P(2)+'L'+R(4)+' '+P(0)+'Z" fill="#bdd5bb"/>';
   for(const v of [0,1,2,3,4])d+=line(R(v),P(0),R(v),P(2.5))+tx(R(v),376,fmt(v),'fvm-centred');
   for(const v of [0,1,2])d+=line(R(-1),P(v),R(4),P(v))+tx(556,P(v)+5,fmt(v));
   d+='<g clip-path="url(#tvd-linked-clip)"><path d="'+path(v=>finite.limiter(v,scheme),-1,4,R,P)+'" fill="none" stroke="#ae7428" stroke-width="3"/></g>';
   if(Number.isFinite(r)&&r>=-1&&r<=4)d+=line(R(r),P(0),R(r),P(psi),'#aa7027','3 4')+'<circle cx="'+R(r)+'" cy="'+P(psi)+'" r="8" fill="#ae7428"/>';
   else d+=tx(590,120,'当前 r '+(Number.isFinite(r)?'= '+fmt(r):'→ +∞')+'，超出图示横轴');
   d+=tx(921,390,'r')+tx(554,98,'ψ(r)')+'</g>';
   const px=[220,460,700],py=v=>595-(v+.25)*75;
   d+='<g data-link="profile" tabindex="0" aria-label="三点剖面与面值"><rect x="40" y="427" width="930" height="207" rx="16" class="fvm-plot-card"/>'+tx(65,454,'局部三点剖面 · 流动向右');
   d+='<rect x="200" y="'+py(Math.max(s,1))+'" width="520" height="'+Math.max(1,py(Math.min(s,1))-py(Math.max(s,1)))+'" fill="#e2eee3"/>';
   d+=line(px[0],py(0),px[1],py(s),'#6f9781')+line(px[1],py(s),px[2],py(1),'#6f9781')+line(580,478,580,590,'#426653','4 5');
   [0,s,1].forEach((v,i)=>{d+='<circle cx="'+px[i]+'" cy="'+py(v)+'" r="7" fill="#356d55"/>'+tx(px[i],611,['U = 0','C = '+fmt(s),'D = 1'][i],'fvm-centred');});
   d+='<path d="'+path(t=>s+.5*t+(.5-s)*t*t,-1,1,t=>460+240*t,py)+'" fill="none" stroke="#68796f" stroke-dasharray="5 4" stroke-width="1.5"/>';
   d+='<circle cx="580" cy="'+py(q)+'" r="6" fill="none" stroke="#68796f" stroke-width="2"/><circle cx="580" cy="'+py(f)+'" r="8" fill="#ae7428"/>'+tx(595,py(f)-10,'φf = '+fmt(f))+tx(772,505,'空心点：未限制 QUICK')+tx(772,535,'实心点：'+names[scheme])+'</g>';
   svg.innerHTML=d.replaceAll('nvd-linked-clip',plotId+'-nvd').replaceAll('tvd-linked-clip',plotId+'-tvd');
   panel.innerHTML='<div class="fvm-equation" data-link="nvd" tabindex="0"><span>归一化值</span><strong>s = (φC − φU) / (φD − φU) = '+fmt(s)+'</strong><small>F(s) = '+fmt(f)+'；'+(inRange?'当前三点剖面单调。':'中间节点是局部极值。')+'</small></div><div class="fvm-equation" data-link="tvd" tabindex="0"><span>转换到梯度比</span><strong>r = s / (1 − s) = '+(Number.isFinite(r)?fmt(r):'∞')+'</strong><small>ψ(r) = '+fmt(psi)+'；'+(psi>=-1e-12&&psi<=tvdBound+1e-12?'位于 TVD 空间允许区。':'超过 TVD 空间允许区。')+'</small></div><div class="fvm-equation fvm-total" data-link="profile" tabindex="0"><span>还原实际面值</span><strong>φf = '+fmt(s)+' + ½ × '+fmt(psi)+' × '+fmt(1-s)+' = '+fmt(f)+'</strong><small>U = 0，D = 1；归一化面值与这里的实际面值相同。</small></div>';
   out.textContent=names[scheme]+'：s = '+fmt(s)+'，面值 '+fmt(f)+'。'+(scheme==='smart'&&s>0&&s<.2?'修正 SMART 在这一段满足稳态 CBC，但超过 TVD 上界；两种条件并不相同。':'');
   if(!Number.isFinite(psi))panel.querySelector('.fvm-total strong').textContent='QUICK 极限重构：φf = ¾φC + ⅜φD − ⅛φU = '+fmt(f);
   highlight(active);
  }
  function set(v){s=Math.round(Math.max(-.25,Math.min(1.25,v))*200)/200;draw();}
  slider.addEventListener('input',()=>set(+slider.value));host.querySelector('select').addEventListener('change',e=>{scheme=e.target.value;draw();});
  for(const [name,v]of [['线性剖面',.5],['上游陡变',.9],['下游陡变',.1],['局部极值',1.15]]){const b=document.createElement('button');b.type='button';b.textContent=name;b.addEventListener('click',()=>set(v));host.querySelector('.fvm-actions').append(b);}
  host.addEventListener('pointerover',e=>{const n=e.target.closest('[data-link]');if(n)highlight(n.dataset.link);});host.addEventListener('focusin',e=>{const n=e.target.closest('[data-link]');if(n)highlight(n.dataset.link);});
  function pointer(e){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());set((p.x-88)/360*1.5-.25);}
  svg.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-link="nvd"]'))return;drag=true;svg.setPointerCapture(e.pointerId);e.preventDefault();pointer(e);});
  svg.addEventListener('pointermove',e=>{if(drag)pointer(e);});svg.addEventListener('pointerup',()=>{drag=false;});svg.addEventListener('pointercancel',()=>{drag=false;});
  svg.addEventListener('keydown',e=>{if(!e.target.hasAttribute('data-nvd-handle')||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();set(s+(e.key==='ArrowRight'?.005:-.005));svg.querySelector('[data-nvd-handle]').focus();});
  draw();return {pause(){drag=false;},destroy(){drag=false;}};
 }
 function timeExplorer(host){
  const names={fe:'前向 Euler',be:'后向 Euler',cn:'隐式梯形 CN',bdf:'BDF2 / backward',lf:'三层中心 / leapfrog'};
  let z=.5,method='cn',step=4,eulerStart=true,playing=false,timer=0,active='solution',dragging=false;
  const count=16,id='time-'+Math.random().toString(36).slice(2);
  host.classList.add('fvm-explorer','fvm-time-linked');
  host.innerHTML='<div class="fvm-explorer-heading"><span class="fvm-explorer-kicker">交互推导</span><h3>同一个冷却问题，时间格式怎样改变结果</h3><p>物体向环境散热，归一化温差满足 dc/dt = −λc。改变 λΔt，点击曲线上的时间点，或拖动时间游标，逐步查看新值来自哪些历史值。</p></div>'+
   '<div class="fvm-controls"><label><span>时间格式</span><select aria-label="时间格式">'+Object.entries(names).map(([k,n])=>'<option value="'+k+'"'+(k===method?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'+
   '<label><span>衰减率 × 步长 λΔt = <b>0.5</b></span><input type="range" min=".05" max="3" step=".05" value=".5" aria-label="衰减率乘时间步"></label>'+
   '<label class="fvm-time-start"><span>CN 的第一步</span><select aria-label="CN 启动方式"><option value="euler">Euler 启动（本章 OpenFOAM 算例）</option><option value="direct">直接使用梯形公式</option></select></label></div>'+
   '<div class="fvm-actions"></div><div class="fvm-scene-scroll"><svg class="fvm-explorer-scene" viewBox="0 0 1000 520" role="group" aria-label="冷却时间曲线与历史层贡献"></svg></div>'+
   '<label class="fvm-time-step"><span>查看时间层 <b>4</b></span><input type="range" min="1" max="16" step="1" value="4" aria-label="查看时间层"></label>'+
   '<div class="fvm-equation-panel"></div><div class="fvm-explorer-detail" aria-live="polite"></div><output class="fvm-readout"></output>';
  const svg=host.querySelector('svg'),panel=host.querySelector('.fvm-equation-panel'),detail=host.querySelector('.fvm-explorer-detail'),out=host.querySelector('output');
  const slider=host.querySelector('[aria-label="衰减率乘时间步"]'),timeline=host.querySelector('[aria-label="查看时间层"]'),startControl=host.querySelector('[aria-label="CN 启动方式"]');
  const num=v=>Math.abs(v)>9999||Math.abs(v)>0&&Math.abs(v)<.0001?v.toExponential(3):Number(v.toFixed(6)).toString();
  const X=n=>82+n/count*535;
  const text=(x,y,s,cls='')=>'<text x="'+x+'" y="'+y+'" class="'+cls+'">'+esc(s)+'</text>';
  function highlight(key){
   active=key;host.querySelectorAll('[data-time-link]').forEach(el=>el.classList.toggle('is-linked',el.dataset.timeLink===key));
   detail.textContent={
    solution:'橙色折线是离散时间解，绿色曲线是 exp(−λt)。游标处同时显示数值值和解析值。纵轴根据完整序列自动缩放；发散时解析曲线会被压到零附近。',
    history:'历史值是已经算出的时间层。BDF2 和三层中心格式需要两层历史；CN 只显示相邻解，但 OpenFOAM 内部还保存旧导数。',
    new:'当前值由所选递推式决定。稳定只限制误差是否增长；正负交替和实际衰减速度偏差仍须分别观察。'
   }[key];
  }
  function draw(){
   const a=finite.time(z,method,count,eulerStart),low=Math.min(0,...a),high=Math.max(1,...a),span=high-low;
   const ymin=low-span*.08,ymax=high+span*.08,Y=v=>350-(v-ymin)/(ymax-ymin)*260;
   const exact=Math.exp(-z*step),value=a[step],previous=a[step-1],older=step>1?a[step-2]:null;
   const first=step===1&&(method==='bdf'||method==='lf'||method==='cn'&&eulerStart);
   let formula,coefficient,history,growth;
   if(method==='fe'){formula='cⁿ⁺¹ = (1 − z)cⁿ';coefficient=1;history=(1-z)*previous;growth=1-z;}
   else if(method==='be'||first){formula='(1 + z)cⁿ⁺¹ = cⁿ';coefficient=1+z;history=previous;growth=1/(1+z);}
   else if(method==='cn'){formula='(1 + z/2)cⁿ⁺¹ = (1 − z/2)cⁿ';coefficient=1+z/2;history=(1-z/2)*previous;growth=(1-z/2)/(1+z/2);}
   else if(method==='bdf'){formula='(3 + 2z)cⁿ⁺¹ = 4cⁿ − cⁿ⁻¹';coefficient=3+2*z;history=4*previous-older;growth=null;}
   else {formula='cⁿ⁺¹ = cⁿ⁻¹ − 2z cⁿ';coefficient=1;history=older-2*z*previous;growth=null;}
   slider.value=z;slider.previousElementSibling.querySelector('b').textContent=num(z);
   timeline.value=step;timeline.previousElementSibling.querySelector('b').textContent=step;
   startControl.disabled=method!=='cn';
   let d='<defs><clipPath id="'+id+'"><rect x="70" y="80" width="555" height="290"/></clipPath></defs>';
   d+='<g data-time-link="solution" tabindex="0" aria-label="时间曲线"><rect class="fvm-plot-card" x="30" y="25" width="610" height="400" rx="15"/>'+text(65,59,'归一化温差 c · '+names[method]);
   for(let i=0;i<=4;i++){const v=low+(high-low)*i/4;d+='<path d="M82 '+Y(v)+'H617" stroke="#cfddd2"/>'+text(72,Y(v)+5,num(v),'fvm-time-tick');}
   for(let n=0;n<=count;n+=4)d+='<path d="M'+X(n)+' 90V350" stroke="#e0e9e2"/>'+text(X(n),381,num(n*z),'fvm-centred');
   d+=text(465,410,'无量纲时间 λt');
   d+='<g clip-path="url(#'+id+')"><path d="'+Array.from({length:321},(_,i)=>(i?'L':'M')+X(i/20)+' '+Y(Math.exp(-z*i/20))).join(' ')+'" fill="none" stroke="#356a51" stroke-width="3"/>';
   d+='<path d="'+a.map((v,n)=>(n?'L':'M')+X(n)+' '+Y(v)).join(' ')+'" fill="none" stroke="#b67829" stroke-width="2.5"/>';
   for(let n=0;n<=count;n++)d+='<circle data-time-point="'+n+'" cx="'+X(n)+'" cy="'+Y(a[n])+'" r="'+(step===n?8:4.5)+'" fill="#b67829" stroke="#f7faf6" stroke-width="1.5"/>';
   d+='</g><path data-time-cursor d="M'+X(step)+' 87V354" stroke="#284f43" stroke-width="2" stroke-dasharray="4 5"/><circle data-time-handle cx="'+X(step)+'" cy="354" r="9" class="fvm-drag-handle" tabindex="0" role="slider" aria-label="时间游标" aria-valuemin="1" aria-valuemax="16" aria-valuenow="'+step+'"/>';
   d+='<circle cx="'+X(step)+'" cy="'+Y(exact)+'" r="6" fill="#f7faf6" stroke="#356a51" stroke-width="2"/></g>';
   d+='<g data-time-link="history" tabindex="0" aria-label="过去的两个时间值"><rect class="fvm-plot-card" x="660" y="25" width="310" height="192" rx="15"/>'+text(684,61,'从历史层取值')+text(684,103,'前一层 c'+(step-1)+' = '+num(previous))+text(684,144,older===null?'第二层历史尚不存在':'更早层 c'+(step-2)+' = '+num(older))+text(684,185,'所用历史组合 = '+num(history))+'</g>';
   d+='<g data-time-link="new" tabindex="0" aria-label="新时间值与误差"><rect class="fvm-plot-card" x="660" y="232" width="310" height="193" rx="15"/>'+text(684,269,'第 '+step+' 层 · λt = '+num(step*z))+text(684,311,'数值 c = '+num(value))+text(684,352,'解析 c = '+num(exact))+text(684,393,'绝对误差 '+num(Math.abs(value-exact)))+'</g>';
   d+='<path d="M66 453H96" stroke="#b67829" stroke-width="3"/>'+text(104,459,'离散解')+'<path d="M240 453H270" stroke="#356a51" stroke-width="3"/>'+text(278,459,'解析衰减 exp(−λt)')+text(66,493,'点击曲线点或拖动游标；键盘左右键可逐层查看。');
   svg.innerHTML=d;
   panel.innerHTML='<div class="fvm-equation" data-time-link="history" tabindex="0"><span>本步递推'+(first?' · Euler 启动':'')+'</span><strong>'+formula+'</strong><small>z = λΔt = '+num(z)+'</small></div>'+
    '<div class="fvm-equation" data-time-link="new" tabindex="0"><span>代入当前数值</span><strong>'+num(coefficient)+' × c = '+num(history)+'</strong><small>新值 c = '+num(value)+'</small></div>'+
    '<div class="fvm-equation" data-time-link="solution" tabindex="0"><span>时间模态</span><strong>'+(growth===null?'需要两个时间根':'本步放大因子 G = '+num(growth))+'</strong><small>'+
    (method==='lf'?'寄生根 −z − √(1 + z²) 的模始终大于 1。':method==='bdf'?'(3 + 2z)G² − 4G + 1 = 0；两层历史共同决定结果。':Math.abs(growth)>1?'|G| > 1：扰动逐步放大。':growth<0?'G < 0：每一步交替变号。':'0 ≤ G ≤ 1：本步保持非负衰减。')+'</small></div>';
   out.textContent=names[method]+'，第 '+step+' 层，c = '+num(value)+'，绝对误差 '+num(Math.abs(value-exact))+'。'+(method==='lf'?'注意交替时间模态会增长。':'');
   highlight(active);
  }
  function pause(){playing=false;clearTimeout(timer);play.textContent='播放';}
  function next(){if(step>=count){pause();return;}step++;draw();}
  function tick(){if(!playing||document.hidden||!host.isConnected){pause();return;}next();if(playing)timer=setTimeout(tick,650);}
  const actions=host.querySelector('.fvm-actions');
  function button(name,fn){const b=document.createElement('button');b.type='button';b.textContent=name;b.addEventListener('click',fn);actions.append(b);return b;}
  button('单步',()=>{pause();next();});
  const play=button('播放',()=>{if(playing)pause();else{if(step>=count)step=0;playing=true;play.textContent='暂停';tick();}});
  button('重置时间',()=>{pause();step=1;draw();});
  for(const [name,value] of [['较小步长',.5],['观察交替',1.5],['观察发散',2.5]])
   button(name,()=>{pause();z=value;draw();});
  slider.addEventListener('input',()=>{pause();z=+slider.value;draw();});
  timeline.addEventListener('input',()=>{pause();step=+timeline.value;draw();});
  host.querySelector('[aria-label="时间格式"]').addEventListener('change',e=>{pause();method=e.target.value;draw();});
  startControl.addEventListener('change',()=>{pause();eulerStart=startControl.value==='euler';draw();});
  host.addEventListener('pointerover',e=>{const item=e.target.closest('[data-time-link]');if(item)highlight(item.dataset.timeLink);});
  host.addEventListener('focusin',e=>{const item=e.target.closest('[data-time-link]');if(item)highlight(item.dataset.timeLink);});
  function pointer(e){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());step=Math.max(1,Math.min(count,Math.round((p.x-82)/535*count)));draw();}
  svg.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-time-link="solution"]'))return;pause();dragging=true;svg.setPointerCapture(e.pointerId);e.preventDefault();pointer(e);});
  svg.addEventListener('pointermove',e=>{if(dragging)pointer(e);});
  svg.addEventListener('pointerup',()=>{dragging=false;});svg.addEventListener('pointercancel',()=>{dragging=false;});
  svg.addEventListener('keydown',e=>{if(!e.target.hasAttribute('data-time-handle')||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();pause();step=Math.max(1,Math.min(count,step+(e.key==='ArrowRight'?1:-1)));draw();svg.querySelector('[data-time-handle]').focus();});
  const observer=new IntersectionObserver(items=>{if(!items[0].isIntersecting)pause();});observer.observe(host);
  draw();return {pause(){dragging=false;pause();},destroy(){dragging=false;pause();observer.disconnect();}};
 }
 function pressureExplorer(host){
  let mode='stencil',values=[1,-1,1,-1,1,-1,1,-1],face=3,D=.5,amplitude=1;
  let pred=[1,1.4,.8,1.3,.7,1.2,1],fraction=0,active='compact',drag=-1,playing=false,timer=0;
  const id='pressure-'+Math.random().toString(36).slice(2);
  host.classList.add('fvm-explorer','fvm-pressure-linked');
  host.innerHTML='<div class="fvm-explorer-heading"><span class="fvm-explorer-kicker">交互推导</span>'+
   '<h3>压力怎样影响面通量</h3><p>先比较两种压力梯度，再观察压力修正怎样消除单元质量缺口。拖动压力点、选择面，图形与方程同步高亮。</p></div>'+
   '<div class="fvm-explorer-controls fvm-controls">'+
   '<label><span>观察内容</span><select aria-label="压力观察内容"><option value="stencil">压力差与棋盘格</option><option value="repair">压力修正与守恒</option></select></label>'+
   '<label class="fvm-pressure-stencil"><span>压力振幅 <b>1</b></span><input aria-label="压力振幅" type="range" min="0" max="2" step=".05" value="1"></label>'+
   '<label class="fvm-pressure-stencil"><span>动量响应 D <b>0.5</b></span><input aria-label="动量响应 D" type="range" min=".1" max="2" step=".1" value=".5"></label>'+
   '<label class="fvm-pressure-repair" hidden><span>选中面的预测通量 <b>1.3</b></span><input aria-label="预测面通量" type="range" min="0" max="2" step=".05" value="1.3"></label></div>'+
   '<div class="fvm-actions fvm-pressure-presets"></div>'+
   '<div class="fvm-linked-view"><div class="fvm-scene-scroll"><svg class="fvm-explorer-scene" viewBox="0 0 1000 520" role="group" aria-label="压力与面通量联动"></svg></div><div class="fvm-equation-panel"></div></div>'+
   '<div class="fvm-actions fvm-pressure-steps" hidden></div>'+
   '<div class="fvm-explorer-detail" aria-live="polite"></div><output class="fvm-readout"></output>';
  const svg=host.querySelector('svg'),panel=host.querySelector('.fvm-equation-panel'),detail=host.querySelector('.fvm-explorer-detail'),out=host.querySelector('output');
  const presets=host.querySelector('.fvm-pressure-presets'),steps=host.querySelector('.fvm-pressure-steps'),controls=host.querySelector('.fvm-controls');
  const X=i=>115+110*i,Y=p=>222-58*p;
  const t=(x,y,s,extra='')=>'<text x="'+x+'" y="'+y+'" '+extra+'>'+esc(s)+'</text>';
  const descriptions={
   average:'宽模板：先在 C、F 用各自两侧压力求中心梯度，再插值到面。交替高低压力可在这一模板中相消。',
   compact:'紧凑模板：直接用面两侧 pF − pC。橙色连线的斜率决定面通量能否感受到这个压力差。',
   flux:'Rhie–Chow 从插值速度中移除宽模板压力作用，再加入紧凑梯度。固定 Ū = 1、中心间距 h = 1，仅观察压力修正。',
   repair:'图中每个内部面只保存一个通量。单元净流出为右面通量减左面通量；压力修正同时影响相邻两个单元，符号相反。'
  };
  function link(key){active=key;host.querySelectorAll('[data-pressure-link]').forEach(e=>e.classList.toggle('is-linked',e.dataset.pressureLink===key));detail.textContent=descriptions[key]||descriptions.repair;}
  function draw(){
   controls.querySelectorAll('.fvm-pressure-stencil').forEach(e=>e.hidden=mode!=='stencil');
   controls.querySelectorAll('.fvm-pressure-repair').forEach(e=>e.hidden=mode!=='repair');
   presets.hidden=mode!=='stencil';steps.hidden=mode!=='repair';
   let s='<defs><marker id="'+id+'" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L11 6L1 11Z" fill="context-stroke"/></marker></defs>';
   if(mode==='stencil'){
    const r=finite.pressureFace(values,face,D);
    s+=t(45,38,'单元压力 · 拖动圆点改变压力；点击内部面选择 C、F')+
     '<path d="M65 222H950" stroke="#a9c1b2" stroke-dasharray="5 5"/>';
    for(let i=0;i<8;i++){
     s+='<rect x="'+(X(i)-50)+'" y="355" width="100" height="85" rx="8" fill="'+(i===face||i===face+1?'#ebd1a7':'#e6eee7')+'" stroke="#6e8e7d"/>'+
      t(X(i),383,i===face?'C':i===face+1?'F':'P'+i,'text-anchor="middle"')+t(X(i),417,'p = '+fmt(values[i]),'text-anchor="middle"')+
      '<path d="M'+X(i)+' '+Y(values[i])+'V340" stroke="#a9c1b2" stroke-dasharray="3 5"/>'+
      '<circle data-pressure-point="'+i+'" cx="'+X(i)+'" cy="'+Y(values[i])+'" r="9" class="fvm-drag-handle" tabindex="0" role="slider" aria-label="单元 P'+i+' 压力" aria-valuemin="-2" aria-valuemax="2" aria-valuenow="'+values[i]+'"/>';
    }
    s+='<g data-pressure-link="average" tabindex="0" aria-label="宽模板压力梯度">'+
     '<path d="M'+X(face-1)+' '+Y(values[face-1])+'L'+X(face+1)+' '+Y(values[face+1])+'M'+X(face)+' '+Y(values[face])+'L'+X(face+2)+' '+Y(values[face+2])+'" class="fvm-pressure-wide"/>'+
     t(80,69,'绿色虚线：两个中心梯度')+'</g>';
    s+='<g data-pressure-link="compact" tabindex="0" aria-label="紧凑压力梯度">'+
     '<path d="M'+X(face)+' '+Y(values[face])+'L'+X(face+1)+' '+Y(values[face+1])+'" class="fvm-pressure-compact"/>'+
     t(80,96,'橙色实线：面两侧的压力差')+'</g>';
    for(let i=1;i<=5;i++){
     const x=(X(i)+X(i+1))/2;
     s+='<g data-pressure-face="'+i+'" tabindex="0" role="button" aria-label="选择内部面 '+i+'" aria-pressed="'+(face===i)+'">'+
      '<rect x="'+(x-14)+'" y="340" width="28" height="113" fill="transparent"/>'+
      '<path d="M'+x+' 350V445" stroke="'+(face===i?'#b8792d':'#507d68')+'" stroke-width="'+(face===i?6:2)+'"/>'+t(x,475,'f'+i,'text-anchor="middle"')+'</g>';
    }
    s+=t(650,497,'h = 1；插值速度 Ū = 1');
    panel.innerHTML='<div class="fvm-equation" data-pressure-link="average" tabindex="0"><span>中心梯度再插值</span><strong>('+fmt(r.left)+' + '+fmt(r.right)+') / 2 = '+fmt(r.average)+'</strong><small>宽模板平均梯度</small></div>'+
     '<div class="fvm-equation" data-pressure-link="compact" tabindex="0"><span>紧凑压力差</span><strong>('+fmt(values[face+1])+' − '+fmt(values[face])+') / 1 = '+fmt(r.compact)+'</strong><small>只用 C、F 两个压力</small></div>'+
     '<div class="fvm-equation" data-pressure-link="flux" tabindex="0"><span>修正后的面速度</span><strong>1 − '+fmt(D)+' × ('+fmt(r.compact)+' − '+fmt(r.average)+') = '+fmt(r.corrected)+'</strong><small>线性速度插值始终为 1</small></div>';
    out.textContent='面 f'+face+'：宽模板梯度 '+fmt(r.average)+'，紧凑梯度 '+fmt(r.compact)+'；Rhie–Chow 面速度 '+fmt(r.corrected)+'。'+(Math.abs(r.compact-r.average)<1e-10?'两种梯度相同，修正为零。':'相邻压力差产生了额外通量响应。');
   }else{
    const r=finite.pressureRepair(pred,fraction);
    s+=t(40,38,'六个单元 · 两端指定通量 1 · 压力参考 p′₀ = 0')+
     t(40,68,'橙色：预测通量；绿色：当前修正通量；单元内显示净流出');
    for(let i=0;i<6;i++){
     const x=110+130*i,res=r.residual[i];
     s+='<g data-pressure-link="repair"><rect x="'+x+'" y="135" width="130" height="175" rx="7" fill="'+(Math.abs(res)<1e-10?'#e1eee2':'#efdab9')+'" stroke="#577c66"/>'+
      t(x+65,170,'C'+i,'text-anchor="middle"')+t(x+65,218,'净流出 '+fmt(res),'text-anchor="middle"')+
      t(x+65,278,'p′ = '+fmt(r.p[i]),'text-anchor="middle"')+'</g>';
    }
    for(let i=0;i<7;i++){
     const x=110+130*i;
     s+='<g '+(i>0&&i<6?'data-pressure-face="'+i+'" tabindex="0" role="button" aria-label="选择内部面 '+i+'"':'')+'>'+
      '<rect x="'+(x-19)+'" y="78" width="38" height="267" fill="transparent"/>'+
      '<path d="M'+(x-23)+' 110H'+(x+24)+'" stroke="#b8792d" stroke-width="3" marker-end="url(#'+id+')"/>'+
      t(x,94,fmt(pred[i]),'text-anchor="middle"')+
      '<path d="M'+(x-23)+' 330H'+(x+24)+'" stroke="#2f7457" stroke-width="4" marker-end="url(#'+id+')"/>'+
      t(x,363,fmt(r.flux[i]),'text-anchor="middle"')+
      (face===i?'<path d="M'+x+' 128V315" stroke="#b8792d" stroke-width="5"/>':'')+'</g>';
    }
    s+='<rect x="100" y="419" width="800" height="12" rx="6" fill="#dce7df"/>'+
     '<rect x="100" y="419" width="'+800*fraction+'" height="12" rx="6" fill="#37765a"/>'+
     t(100,473,'修正进度 '+Math.round(100*fraction)+'%')+t(460,473,'最大质量缺口 '+fmt(Math.max(...r.residual.map(Math.abs))));
    const dp=r.p[face]-r.p[face-1];
    panel.innerHTML='<div class="fvm-equation" data-pressure-link="repair" tabindex="0"><span>选中面 f'+face+' 的压力差</span><strong>p′'+face+' − p′'+(face-1)+' = '+fmt(dp)+'</strong><small>本例面响应系数为 1</small></div>'+
     '<div class="fvm-equation" data-pressure-link="repair" tabindex="0"><span>面通量更新</span><strong>'+fmt(pred[face])+' − '+fmt(fraction)+' × '+fmt(dp)+' = '+fmt(r.flux[face])+'</strong><small>完整修正后的目标通量为 1</small></div>'+
     '<div class="fvm-equation" data-pressure-link="repair" tabindex="0"><span>整体与局部守恒</span><strong>整体净流出 = '+fmt(r.residual.reduce((a,b)=>a+b,0))+'</strong><small>还须逐个单元检查净流出是否为零</small></div>';
    const input=controls.querySelector('[aria-label="预测面通量"]');input.value=pred[face];input.previousElementSibling.querySelector('b').textContent=fmt(pred[face]);
    out.textContent=fraction===1?'完整修正：每个面通量均为 1，各单元净流出均为 0。':'整体流入等于流出，但内部单元仍存在质量缺口；执行完整压力修正后逐个消除。';
   }
   svg.innerHTML=s;
   svg.querySelectorAll('[data-pressure-point]').forEach(el=>svg.append(el));
   link(mode==='repair'?'repair':active);
  }
  function pause(){playing=false;clearTimeout(timer);if(play)play.textContent='播放修正';}
  function button(parent,name,fn){const b=document.createElement('button');b.type='button';b.textContent=name;b.addEventListener('click',fn);parent.append(b);return b;}
  for(const [name,fn]of [['棋盘格',i=>i%2?-1:1],['线性压力',i=>(i-3.5)/3.5],['均匀压力',()=>1],['平滑起伏',i=>Math.sin(i*Math.PI/4)]]){
   button(presets,name,()=>{values=Array.from({length:8},(_,i)=>amplitude*fn(i));draw();});
  }
  function tick(){if(!playing||document.hidden||!host.isConnected){pause();return;}fraction=Math.min(1,fraction+.05);draw();if(fraction>=1)pause();else timer=setTimeout(tick,90);}
  button(steps,'完整修正',()=>{pause();fraction=1;draw();});
  const play=button(steps,'播放修正',()=>{if(playing)pause();else{if(fraction>=1)fraction=0;playing=true;play.textContent='暂停';tick();}});
  button(steps,'重新预测',()=>{pause();fraction=0;draw();});
  controls.querySelector('select').addEventListener('change',e=>{pause();mode=e.target.value;fraction=0;draw();});
  controls.querySelector('[aria-label="压力振幅"]').addEventListener('input',e=>{const old=amplitude;amplitude=+e.target.value;values=old?values.map(v=>v*amplitude/old):values.map((v,i)=>amplitude*(i%2?-1:1));e.target.previousElementSibling.querySelector('b').textContent=fmt(amplitude);draw();});
  controls.querySelector('[aria-label="动量响应 D"]').addEventListener('input',e=>{D=+e.target.value;e.target.previousElementSibling.querySelector('b').textContent=fmt(D);draw();});
  controls.querySelector('[aria-label="预测面通量"]').addEventListener('input',e=>{pause();fraction=0;pred[face]=+e.target.value;draw();});
  host.addEventListener('pointerover',e=>{const item=e.target.closest('[data-pressure-link]');if(item)link(item.dataset.pressureLink);});
  host.addEventListener('focusin',e=>{const item=e.target.closest('[data-pressure-link]');if(item)link(item.dataset.pressureLink);});
  svg.addEventListener('click',e=>{const item=e.target.closest('[data-pressure-face]');if(item){face=+item.dataset.pressureFace;draw();}});
  svg.addEventListener('keydown',e=>{const node=e.target.closest('[data-pressure-point]'),f=e.target.closest('[data-pressure-face]');
   if(node&&['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const i=+node.dataset.pressurePoint;values[i]=Math.max(-2,Math.min(2,values[i]+(e.key==='ArrowUp'?.05:-.05)));draw();svg.querySelector('[data-pressure-point="'+i+'"]').focus();}
   if(f&&['Enter',' '].includes(e.key)){e.preventDefault();face=+f.dataset.pressureFace;draw();svg.querySelector('[data-pressure-face="'+face+'"]').focus();}
  });
  svg.addEventListener('pointerdown',e=>{const node=e.target.closest('[data-pressure-point]');if(!node)return;e.preventDefault();drag=+node.dataset.pressurePoint;svg.setPointerCapture(e.pointerId);});
  svg.addEventListener('pointermove',e=>{if(drag<0)return;const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());values[drag]=Math.max(-2,Math.min(2,Math.round((222-pt.y)/58*100)/100));draw();});
  svg.addEventListener('pointerup',()=>{drag=-1;});svg.addEventListener('pointercancel',()=>{drag=-1;});
  const io=new IntersectionObserver(es=>{if(!es[0].isIntersecting)pause();});io.observe(host);draw();
  return {pause,destroy(){pause();io.disconnect();}};
 }
 root.FoamFVMExplorer={mount,math:finite};
})(typeof window==='undefined'?globalThis:window);
