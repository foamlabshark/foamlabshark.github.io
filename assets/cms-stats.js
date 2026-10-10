'use strict';
(() => {
 let dispose;
 window.FoamCMSStats=async C=>{
  if(!C.admin)throw Error('只有管理员可以查看访问统计。');
  dispose?.();
  const {L}=C,esc=L.esc,panel=document.querySelector('#cms-panel');
  const state={interval:'day',count:30,chart:'line'};let data=null,request=0,lastWidth=0;
  panel.innerHTML='<section class="cms-site-stats" data-state="loading"><div class="cms-toolbar"><div><h2>访问统计</h2><p>按日或按月查看网站访问量的变化。</p></div><div class="admin-actions"><button type="button" class="button secondary" data-stats-refresh>刷新</button><button type="button" class="button secondary" data-stats-export disabled>导出 CSV</button></div></div><div class="cms-visit-summary"></div><div class="cms-visit-chart-card"><div class="cms-visit-controls"><div class="cms-visit-switch" role="group" aria-label="统计周期"><button type="button" data-stats-interval="day" aria-pressed="true">每日</button><button type="button" data-stats-interval="month" aria-pressed="false">每月</button></div><label>时间范围 <select data-stats-range aria-label="访问统计时间范围"></select></label><div class="cms-visit-switch" role="group" aria-label="图表类型"><button type="button" data-stats-chart="line" aria-pressed="true">折线图</button><button type="button" data-stats-chart="bar" aria-pressed="false">柱状图</button></div></div><p class="cms-visit-status" role="status" aria-live="polite"></p><div class="cms-visit-plot"></div><p class="cms-visit-point" aria-live="polite">将鼠标移到图上，或选择数据点，查看访问次数。</p><div class="cms-visit-period-summary"></div></div><details class="cms-visit-data"><summary>查看统计明细</summary><div class="cms-visit-table-wrap"></div></details><p class="cms-visit-history"></p><details class="cms-visit-method"><summary>统计口径</summary><p>同一浏览器的所有网站页面关闭后，再次打开计为一次访问。切换页面、刷新和新开标签页沿用当前访问；持续打开的页面跨过零点，也不会产生新访问。日期按北京时间划分，月统计为当月已记录的访问次数。</p><p>累计访问沿用底部当前计数；日、月趋势保留历史记录，累计计数清零后仍可查询这些记录。</p></details></section>';
  const view=panel.querySelector('.cms-site-stats'),status=view.querySelector('.cms-visit-status'),plot=view.querySelector('.cms-visit-plot'),point=view.querySelector('.cms-visit-point'),range=view.querySelector('[data-stats-range]'),exportButton=view.querySelector('[data-stats-export]');
  const number=value=>value.toLocaleString('zh-CN');
  const label=period=>data?.interval==='month'?period.slice(0,7):period;
  function controls(){
   range.innerHTML=(state.interval==='day'?[[30,'近 30 天'],[90,'近 90 天'],[365,'近一年']]:[[6,'近 6 个月'],[12,'近一年'],[24,'近两年']]).map(([value,title])=>'<option value="'+value+'" '+(state.count===value?'selected':'')+'>'+title+'</option>').join('');
   view.querySelectorAll('[data-stats-interval]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.statsInterval===state.interval)));
   view.querySelectorAll('[data-stats-chart]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.statsChart===state.chart)));
  }
  function showPoint(index){
   const item=data?.items[index];if(!item)return;
   point.textContent=label(item.period)+' · '+number(item.visits)+' 次'+(item.complete?'':' · 保留记录');
   plot.querySelectorAll('[data-stats-point]').forEach(e=>e.classList.toggle('is-active',Number(e.dataset.statsPoint)===index));
  }
  function chart(){
   if(!data||!view.isConnected)return;
   const items=data.items,w=Math.max(280,Math.floor(plot.getBoundingClientRect().width)),h=300,left=52,right=18,top=24,bottom=44,cw=w-left-right,ch=h-top-bottom;
   lastWidth=w;
   if(!items.length){plot.innerHTML='<p class="cms-empty">这个时间范围内暂无访问记录。</p>';return;}
   const max=Math.max(1,...items.map(i=>i.visits)),raw=max/4,magnitude=10**Math.floor(Math.log10(raw)),scaled=raw/magnitude,step=(scaled<=1?1:scaled<=2?2:scaled<=5?5:10)*magnitude,ymax=Math.max(4,step*4);
   const x=i=>left+cw*(i+.5)/items.length,y=value=>top+ch*(1-value/ymax);
   const grid=Array.from({length:5},(_,i)=>{const value=ymax*i/4,cy=y(value);return '<line class="cms-visit-grid" x1="'+left+'" y1="'+cy+'" x2="'+(w-right)+'" y2="'+cy+'"/><text class="cms-visit-axis" x="'+(left-10)+'" y="'+(cy+4)+'" text-anchor="end">'+number(value)+'</text>';}).join('');
   const tickCount=Math.min(items.length,w<500?3:6),indexes=[...new Set(Array.from({length:tickCount},(_,i)=>tickCount===1?0:Math.round(i*(items.length-1)/(tickCount-1))))];
   const ticks=indexes.map(i=>'<text class="cms-visit-axis" x="'+x(i)+'" y="'+(h-14)+'" text-anchor="middle">'+esc(data.interval==='month'?items[i].period.slice(0,7):items[i].period.slice(5))+'</text>').join('');
   const title='<title>网站'+(data.interval==='day'?'每日':'每月')+'访问量，单位：次</title>';
   let marks;
   if(state.chart==='line'){
    const coords=items.map((item,i)=>x(i)+','+y(item.visits)).join(' ');
    const area=x(0)+','+(top+ch)+' '+coords+' '+x(items.length-1)+','+(top+ch);
    marks='<polygon class="cms-visit-area" points="'+area+'"/><polyline class="cms-visit-line" points="'+coords+'"/>'+items.map((item,i)=>'<circle class="cms-visit-marker" data-stats-point="'+i+'" cx="'+x(i)+'" cy="'+y(item.visits)+'" r="'+(items.length>90?3:4)+'" tabindex="0" role="img" aria-label="'+esc(label(item.period)+'，'+number(item.visits)+'次'+(item.complete?'':'，保留记录'))+'"><title>'+esc(label(item.period)+'：'+number(item.visits)+' 次')+'</title></circle>').join('');
   }else{
    const bw=Math.max(1,Math.min(54,cw/items.length*.65));
    marks=items.map((item,i)=>'<rect class="cms-visit-bar" data-stats-point="'+i+'" x="'+(x(i)-bw/2)+'" y="'+y(item.visits)+'" width="'+bw+'" height="'+Math.max(2,top+ch-y(item.visits))+'" rx="2" tabindex="0" role="img" aria-label="'+esc(label(item.period)+'，'+number(item.visits)+'次'+(item.complete?'':'，保留记录'))+'"><title>'+esc(label(item.period)+'：'+number(item.visits)+' 次')+'</title></rect>').join('');
   }
   plot.innerHTML='<svg class="cms-visit-svg" viewBox="0 0 '+w+' '+h+'" role="group" aria-label="访问量趋势图">'+title+'<text class="cms-visit-axis" x="'+left+'" y="13">访问次数</text>'+grid+marks+ticks+'</svg>';
  }
  function render(){
   view.querySelector('.cms-visit-summary').innerHTML=[['今日访问',data.today_visits],['本月已记录',data.month_visits],['累计访问',data.total_visits],['当前在线',data.online]].map(([title,value])=>'<div><span>'+title+'</span><strong>'+number(value)+'</strong><small>'+(title==='当前在线'?'人':'次')+'</small></div>').join('');
   const items=data.items,total=items.reduce((sum,item)=>sum+item.visits,0),peak=items.reduce((a,b)=>!a||b.visits>a.visits?b:a,null);
   view.querySelector('.cms-visit-period-summary').innerHTML='<span>区间合计 <strong>'+number(total)+'</strong> 次</span>'+(peak?'<span>最高'+(data.interval==='day'?'日':'月')+' <strong>'+esc(label(peak.period))+'</strong> · '+number(peak.visits)+' 次</span>':'');
   view.querySelector('.cms-visit-table-wrap').innerHTML='<table><caption class="sr-only">网站访问量明细</caption><thead><tr><th scope="col">'+(data.interval==='day'?'日期':'月份')+'</th><th scope="col">访问次数</th><th scope="col">记录</th></tr></thead><tbody>'+items.map(item=>'<tr><td>'+esc(label(item.period))+'</td><td>'+number(item.visits)+'</td><td>'+(item.complete?'已记录':'部分历史记录')+'</td></tr>').join('')+'</tbody></table>';
   view.querySelector('.cms-visit-history').textContent=data.first_recorded_day?'按北京时间统计。可查询记录自 '+data.first_recorded_day+' 起；标记为“部分历史记录”的日期仅汇总尚存的访问记录。':'按北京时间统计，访问发生后将开始保存历史记录。';
   chart();point.textContent='将鼠标移到图上，或选择数据点，查看访问次数。';
  }
  async function load(){
   const id=++request;exportButton.disabled=true;view.dataset.state='loading';view.setAttribute('aria-busy','true');status.textContent='正在读取访问记录…';
   try{
    const result=L.check(await L.client.rpc('foamlab_admin_site_stats',{p_interval:state.interval,p_count:state.count}));
    if(id!==request||!view.isConnected)return;
    if(!result||result.interval!==state.interval||!Array.isArray(result.items)||result.items.length>state.count||!['today_visits','month_visits','total_visits','online'].every(k=>Number.isSafeInteger(result[k])&&result[k]>=0)||!result.items.every(i=>/^\d{4}-\d{2}-\d{2}$/.test(i.period)&&Number.isSafeInteger(i.visits)&&i.visits>=0&&typeof i.complete==='boolean'))throw Error('访问统计数据不完整，请重试。');
    data=result;render();view.dataset.state='ready';exportButton.disabled=false;
    status.textContent='更新于 '+new Date(data.as_of).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false})+' · 北京时间';
   }catch(e){
    if(id!==request||!view.isConnected)return;
    data=null;plot.innerHTML='<p class="cms-empty">访问记录暂时无法读取，点击“刷新”重试。</p>';view.querySelector('.cms-visit-table-wrap').replaceChildren();view.querySelector('.cms-visit-period-summary').replaceChildren();point.textContent='';view.dataset.state='error';status.textContent=e.message||'访问记录读取失败，请重试。';
   }finally{if(id===request&&view.isConnected)view.removeAttribute('aria-busy');}
  }
  view.querySelector('[data-stats-refresh]').onclick=load;
  range.onchange=()=>{state.count=Number(range.value);load();};
  view.querySelectorAll('[data-stats-interval]').forEach(b=>b.onclick=()=>{if(state.interval===b.dataset.statsInterval)return;state.interval=b.dataset.statsInterval;state.count=state.interval==='day'?30:12;controls();load();});
  view.querySelectorAll('[data-stats-chart]').forEach(b=>b.onclick=()=>{state.chart=b.dataset.statsChart;controls();chart();});
  plot.addEventListener('pointerover',e=>{const mark=e.target.closest('[data-stats-point]');if(mark)showPoint(Number(mark.dataset.statsPoint));});
  plot.addEventListener('focusin',e=>{const mark=e.target.closest('[data-stats-point]');if(mark)showPoint(Number(mark.dataset.statsPoint));});
  plot.addEventListener('click',e=>{const mark=e.target.closest('[data-stats-point]');if(mark)showPoint(Number(mark.dataset.statsPoint));});
  exportButton.onclick=()=>{
   if(!data)return;
   const csv='\uFEFF'+[[(data.interval==='day'?'日期':'月份'),'访问次数','记录'].join(','),...data.items.map(i=>[label(i.period),i.visits,i.complete?'已记录':'部分历史记录'].join(','))].join('\r\n');
   const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='foamlab-visits-'+data.interval+'-'+data.as_of.slice(0,10)+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const observer=new ResizeObserver(()=>{if(!view.isConnected){observer.disconnect();return;}if(Math.max(280,Math.floor(plot.getBoundingClientRect().width))!==lastWidth)chart();});observer.observe(plot);dispose=()=>{request++;observer.disconnect();};
  controls();await load();
 };
})();
