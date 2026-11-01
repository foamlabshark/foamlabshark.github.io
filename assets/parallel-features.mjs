const aliases={'亲和性':['affinity','affinities'],'绑定':['binding','bind'],'节点':['node'],'缓存':['cache'],'带宽':['bandwidth'],'延迟':['latency'],'剖析':['profiling','profiler'],'性能':['performance'],'调度':['scheduler','scheduling'],'排序':['sort'],'检查点':['checkpoint'],'重启':['restart'],'内存':['memory'],'线程':['thread'],'进程':['process'],'并行':['parallel'],'归约':['reduction'],'扫描':['scan'],'同步':['synchroniz','barrier'],'异步':['asynchronous','async'],'向量化':['vectorization','vectorizing'],'矢量化':['vectorization','vectorizing'],'向量':['vector'],'浅水':['shallow water'],'负载均衡':['load balance','load balancing'],'分区':['partition'],'哈希':['hash'],'能耗':['energy'],'功耗':['power'],'可移植':['portability','portable'],'调试':['debug'],'文件':['file'],'拓扑':['topology','topologies'],'批处理':['batch'],'通信':['communication'],'图形处理器':['gpu'],'存储':['storage','memory'],'浮点':['floating point','flop'],'数组':['array'],'局部性':['locality'],'原子':['atomic'],'消息传递':['mpi','message passing'],'加速比':['speedup'],'幽灵单元':['ghost cell'],'矢量':['vector'],'寄存器':['register'],'编译':['compil'],'设备':['device'],'约束':['constraint'],'时钟':['clock'],'芯片':['chip'],'合并访问':['coalesc'],'调度器':['scheduler'],'容器':['container','docker'],'能量':['energy']};
const demos={
calculator: {bind:bindRoofCalculator, html:"<div class=\"calc-inputs\"><label>峰值算力 F · <small>GFLOP/s</small><input id=\"roof-peak\" max=\"1000000000000\" min=\"0.001\" step=\"any\" type=\"number\" value=\"264.4\"/></label><label>带宽 B · <small>GB/s</small><input id=\"roof-bandwidth\" max=\"1000000000000\" min=\"0.001\" step=\"any\" type=\"number\" value=\"22.5\"/></label><label>算术强度 I · <small>FLOP/byte</small><input id=\"roof-intensity\" max=\"1000000000000\" min=\"0\" step=\"any\" type=\"number\" value=\"0.1\"/></label></div><output aria-live=\"polite\" id=\"roof-result\"></output><button class=\"button secondary\" id=\"roof-reset\" type=\"button\">恢复示例值</button>"},
network_calculator: {bind:bindNetworkCalculator, html:"<div class=\"calc-inputs\"><label>固定延迟 α · <small>μs</small><input id=\"net-latency\" max=\"1000000000000\" min=\"0\" step=\"any\" type=\"number\" value=\"5\"/></label><label>消息大小 n · <small>byte</small><input id=\"net-bytes\" max=\"1000000000000\" min=\"0\" step=\"1\" type=\"number\" value=\"8000\"/></label><label>有效带宽 B · <small>GB/s</small><input id=\"net-bandwidth\" max=\"1000000000000\" min=\"0.000001\" step=\"any\" type=\"number\" value=\"1\"/></label></div><output aria-live=\"polite\" id=\"net-result\"></output><button class=\"button secondary\" id=\"net-reset\" type=\"button\">恢复 8000 字节示例</button>"},
scan_demo: {bind:bindScanDemo, html:"<label for=\"scan-input\">各块元素数量</label><input aria-describedby=\"scan-help\" id=\"scan-input\" inputmode=\"text\" maxlength=\"512\" type=\"text\" value=\"3, 4, 6, 3, 8, 7, 5, 4\"/><small id=\"scan-help\">用逗号或空格分隔；每项为 0–1,000,000 的整数。</small><div aria-live=\"polite\" id=\"scan-results\"></div><button class=\"button secondary\" id=\"scan-reset\" type=\"button\">恢复原书数组</button>"},
simd_demo: {bind:bindSimdDemo, html:"<div class=\"calc-inputs\"><label>数组长度 N · <small>0–128 个元素</small><input id=\"simd-n\" max=\"128\" min=\"0\" step=\"1\" type=\"number\" value=\"17\"/></label><label>向量宽度 W · <small>bit</small><select id=\"simd-width\"><option>128</option><option selected=\"\">256</option><option>512</option></select></label><label>元素位宽 b · <small>bit</small><select id=\"simd-element\"><option value=\"32\">32 · float 示例</option><option selected=\"\" value=\"64\">64 · double 示例</option></select></label></div><div aria-live=\"polite\" id=\"simd-results\"></div><button class=\"button secondary\" id=\"simd-reset\" type=\"button\">恢复 17 个 double 示例</button>"},
thread_demo: {bind:bindThreadDemo, html:"<div class=\"calc-inputs\"><label>元素数 N · <small>0–64</small><input id=\"thread-n\" max=\"64\" min=\"0\" step=\"1\" type=\"number\" value=\"13\"/></label><label>线程数 P · <small>1–16</small><input id=\"thread-p\" max=\"16\" min=\"1\" step=\"1\" type=\"number\" value=\"4\"/></label><label>读取模式 · <small>一维示意</small><select id=\"thread-mode\"><option value=\"point\">独立逐元素运算</option><option selected=\"\" value=\"stencil\">读取左右邻居</option></select></label></div><div aria-live=\"polite\" id=\"thread-results\"></div><button class=\"button secondary\" id=\"thread-reset\" type=\"button\">恢复 13 元素 / 4 线程</button>"}
};
function bindRoofCalculator($){
 if(!$('#roof-result'))return;
 const calculate=()=>{
  const fields=[$('#roof-peak'),$('#roof-bandwidth'),$('#roof-intensity')];
  const [peak,bw,intensity]=fields.map(x=>x.valueAsNumber);
  if(fields.some(x=>x.value.trim()===''||!x.validity.valid)||![peak,bw,intensity].every(Number.isFinite)||peak<=0||bw<=0||intensity<0){$('#roof-result').innerHTML='<p class="calc-error">请输入有效数值：算力与带宽须大于 0，算术强度不得为负。</p>';return;}
  const feed=bw*intensity,ceiling=Math.min(peak,feed),ridge=peak/bw;
  const mode=Math.abs(feed-peak)<1e-9*Math.max(peak,1)?'位于平衡点':feed<peak?'带宽受限区域':'计算受限区域';
  const f=n=>n>=1e7||n>0&&n<0.001?n.toExponential(3):n.toLocaleString('zh-CN',{maximumFractionDigits:3});
  $('#roof-result').innerHTML=`<div class="calc-number">${f(ceiling)} <span>GFLOP/s</span></div><strong>${mode}</strong><p>模型上限 = min(${f(peak)}, ${f(bw)} × ${f(intensity)})<br>平衡点：${f(ridge)} FLOP/byte</p><small>这是简化上限，实际应用仍可能受延迟、同步和其他开销限制。</small>`;
 };
 ['#roof-peak','#roof-bandwidth','#roof-intensity'].forEach(sel=>$(sel).addEventListener('input',calculate));
 $('#roof-reset').addEventListener('click',()=>{$('#roof-peak').value='264.4';$('#roof-bandwidth').value='22.5';$('#roof-intensity').value='0.1';calculate()});
 calculate();
}

function bindNetworkCalculator($){
 if(!$('#net-result'))return;
 const calculate=()=>{
  const fields=[$('#net-latency'),$('#net-bytes'),$('#net-bandwidth')];
  const [latency,bytes,bw]=fields.map(x=>x.valueAsNumber);
  if(fields.some(x=>!x.validity.valid||x.value.trim()==='')||![latency,bytes,bw].every(Number.isFinite)||latency<0||bytes<0||!Number.isInteger(bytes)||bw<=0){$('#net-result').innerHTML='<p class="calc-error">请输入有效数值：延迟不得为负，消息字节数为非负整数，带宽必须大于 0。</p>';return;}
  const transfer=bytes/(bw*1000),total=latency+transfer;
  const f=n=>n!==0&&(n<0.001||n>=1e7)?n.toExponential(3):n.toLocaleString('zh-CN',{maximumFractionDigits:6});
  $('#net-result').innerHTML=`<div class="calc-number">${f(total)} <span>μs</span></div><strong>一次消息的模型时间</strong><p>固定延迟 ${f(latency)} μs + 传输 ${f(transfer)} μs<br>总时间：${f(total/1000)} ms</p><small>按 1 GB = 10⁹ byte 换算；不包含额外复制、争用或多次消息。零字节情形仍按模型计入启动延迟。</small>`;
 };
 ['#net-latency','#net-bytes','#net-bandwidth'].forEach(sel=>$(sel).addEventListener('input',calculate));
 $('#net-reset').addEventListener('click',()=>{$('#net-latency').value='5';$('#net-bytes').value='8000';$('#net-bandwidth').value='1';calculate()});
 calculate();
}

function bindScanDemo($){
 if(!$('#scan-results'))return;
 const compute=()=>{
  const tokens=$('#scan-input').value.trim().split(/[,，\s]+/).filter(Boolean);
  if(tokens.length<1||tokens.length>32||tokens.some(t=>!/^\d+$/.test(t)||Number(t)>1000000)){$('#scan-results').innerHTML='<p class="calc-error">请输入 1–32 个非负整数，每项不超过 1,000,000。</p>';return;}
  const xs=tokens.map(Number),exclusive=[],inclusive=[];let sum=0;
  xs.forEach(v=>{exclusive.push(sum);sum+=v;inclusive.push(sum)});
  const stages=[{label:'输入',values:xs.slice(),distance:0}];let current=xs.slice(),work=0;
  for(let distance=1;distance<xs.length;distance*=2){const old=current;current=old.map((v,i)=>i<distance?v:v+old[i-distance]);work+=xs.length-distance;stages.push({label:'距离 '+distance,values:current,distance});}
  const row=(name,arr)=>`<tr><th scope="row">${name}</th>${arr.map(v=>`<td>${v}</td>`).join('')}</tr>`;
  $('#scan-results').innerHTML=`<p class="scan-total">总元素数 <strong>${sum}</strong> · ${xs.length} 个块</p><div class="table-wrap"><table class="scan-grid"><caption>前缀结果</caption><tbody>${row('数量',xs)}${row('Exclusive',exclusive)}${row('Inclusive',inclusive)}</tbody></table></div><h3>各块写到哪里？</h3><div class="table-wrap"><table class="scan-grid"><thead><tr><th>块</th><th>数量</th><th>输出区间 [起点,终点)</th></tr></thead><tbody>${xs.map((v,i)=>`<tr><td>${i}</td><td>${v}</td><td>[${exclusive[i]}, ${inclusive[i]})${v===0?' · 空':''}</td></tr>`).join('')}</tbody></table></div><details class="scan-stages"><summary>查看步长翻倍的 ${stages.length-1} 轮计算 · ${work} 次加法</summary><p class="muted">每一轮均读取上一轮的快照；这是逻辑阶段，不是实际执行时间。</p><div class="table-wrap"><table class="scan-grid"><tbody>${stages.map(st=>row(st.label,st.values)).join('')}</tbody></table></div></details>`;
 };
 $('#scan-input').addEventListener('input',compute);
 $('#scan-reset').addEventListener('click',()=>{$('#scan-input').value='3, 4, 6, 3, 8, 7, 5, 4';compute()});
 compute();
}

function bindSimdDemo($){
 if(!$('#simd-results'))return;
 const compute=()=>{
  const n=$('#simd-n').valueAsNumber,w=Number($('#simd-width').value),b=Number($('#simd-element').value);
  if(!$('#simd-n').validity.valid||!Number.isInteger(n)||n<0||n>128||![128,256,512].includes(w)||![32,64].includes(b)){$('#simd-results').innerHTML='<p class="calc-error">数组长度必须是 0–128 的整数，请选择有效位宽。</p>';return;}
  const lanes=w/b,groups=Math.floor(n/lanes),mainEnd=groups*lanes,tail=n-mainEnd;
  const groupRow=(name,start,count)=>`<div class="simd-group"><small>${name} · [${start}, ${start+count})</small><div class="lane-row">${Array.from({length:count},(_,j)=>`<span class="lane-box">${start+j}</span>`).join('')}</div></div>`;
  let rows='';for(let i=0;i<Math.min(groups,8);i++)rows+=groupRow('向量组 '+i,i*lanes,lanes);
  if(groups>8)rows+=`<p class="muted">其余 ${groups-8} 个完整向量组省略，主区间结束于 ${mainEnd}。</p>`;
  if(tail)rows+=groupRow('尾部元素',mainEnd,tail);
  $('#simd-results').innerHTML=`<p class="scan-total">每个向量 <strong>${lanes}</strong> 个元素</p><p>${groups} 个完整向量组 + ${tail} 个尾部元素</p><p class="muted">主区间 [0, ${mainEnd})；尾部区间 [${mainEnd}, ${n})。</p>${n===0?'<p>空数组：没有元素需要加载。</p>':rows}<p class="muted">假设不需要起始剥离。尾部可采用标量循环或适当掩码；方框数量不是时钟周期或实测加速比。</p>`;
 };
 ['#simd-n','#simd-width','#simd-element'].forEach(sel=>$(sel).addEventListener('input',compute));
 $('#simd-reset').addEventListener('click',()=>{$('#simd-n').value='17';$('#simd-width').value='256';$('#simd-element').value='64';compute()});
 compute();
}

function bindThreadDemo($){
 if(!$('#thread-results'))return;
 const compute=()=>{
  const n=$('#thread-n').valueAsNumber,p=$('#thread-p').valueAsNumber,mode=$('#thread-mode').value;
  if(!$('#thread-n').validity.valid||!$('#thread-p').validity.valid||!Number.isInteger(n)||!Number.isInteger(p)||n<0||n>64||p<1||p>16){$('#thread-results').innerHTML='<p class="calc-error">元素数须为 0–64 的整数，线程数须为 1–16 的整数。</p>';return;}
  const ranges=Array.from({length:p},(_,t)=>({t,b:Math.floor(n*t/p),e:Math.floor(n*(t+1)/p)}));
  const owner=i=>ranges.find(r=>r.b<=i&&i<r.e)?.t;
  const rows=ranges.map(({t,b,e})=>{
   let neighbors=[];if(mode==='stencil'&&b<e){if(b>0)neighbors.push(`${b-1}（线程 ${owner(b-1)}）`);if(e<n)neighbors.push(`${e}（线程 ${owner(e)}）`)}
   return `<tr><th scope="row">线程 ${t}</th><td>[${b}, ${e})</td><td>${e-b}${b===e?' · 空块':''}</td><td>${b===e?'无工作':mode==='point'?'不需要':neighbors.join('、')||'无跨区邻居'}</td></tr>`;
  }).join('');
  const empty=ranges.filter(r=>r.b===r.e).length;
  $('#thread-results').innerHTML=`<p class="scan-total"><strong>${p-empty}</strong> 个非空分区 · <strong>${empty}</strong> 个空线程</p><p>覆盖 [0, ${n})，没有重复或遗漏；所有分区长度之和为 ${n}。</p><div class="thread-table-wrap"><table><thead><tr><th>线程</th><th>写入区间</th><th>元素数</th><th>所需跨区输入索引</th></tr></thead><tbody>${rows}</tbody></table></div><p class="muted">${mode==='stencil'?'左右邻居来自上一轮只读缓冲区。若先由其他线程生成这些输入，必须在读取前完成同步；全局边界外的值由边界条件另行规定。':'独立逐元素内核可写各自分区；后续消费者跨区读取结果时，仍需按依赖同步。'}</p><p class="muted">空线程仍须参加团队要求的屏障。此演示仅划分索引，不模拟真实线程执行、NUMA 放置或加速比。</p>`;
 };
 ['#thread-n','#thread-p','#thread-mode'].forEach(sel=>$(sel).addEventListener('input',compute));
 $('#thread-reset').addEventListener('click',()=>{$('#thread-n').value='13';$('#thread-p').value='4';$('#thread-mode').value='stencil';compute()});compute();
}

function addFilter(host, label, callback) {
  const field=document.createElement('label'), input=document.createElement('input');
  field.className='search-field'; input.type='search'; input.placeholder=label; input.setAttribute('aria-label',label);
  field.append(input); host.prepend(field); input.addEventListener('input',()=>callback(input.value.trim()));
}
export async function enhance(article,item) {
  const body=article.querySelector('.prose');
  if (!body || window.foamCurrentContent?.id!==item.id) return;
  const css=document.createElement('link');
  css.rel='stylesheet'; css.href='/assets/parallel-features.css';
  await new Promise(resolve=>{css.onload=css.onerror=resolve; document.head.append(css);});
  if (!body.isConnected || window.foamCurrentContent?.id!==item.id) return;
  const feature=item.metadata.parallel_book.feature;
  if (Object.hasOwn(demos,feature)) {
    const container=body.querySelector('.parallel-demo');
    if (!container) return;
    container.innerHTML=demos[feature].html;
    const $=selector=>container.querySelector(selector);
    demos[feature].bind($);
  } else if (feature==='refs') {
    for(const a of body.querySelectorAll('a[title]')) if(/^R\d+$/.test(a.title))a.id='ref-'+a.title.slice(1);
  } else if (feature==='index') {
    for(const el of body.querySelectorAll('[class*="hpc-anchor-"]')) {
      const marker=[...el.classList].find(c=>c.startsWith('hpc-anchor-'));
      if(marker)el.id=marker.slice('hpc-anchor-'.length);
    }
    const pages=[...body.querySelectorAll('section.page')];
    const normalize=s=>s.normalize('NFKC').toLowerCase().replace(/[\s_\-–—]+/g,'');
    const rows=[];
    let context=[];
    for(const li of body.querySelectorAll('li.entry')) {
      const level=Number([...li.classList].find(c=>c.startsWith('hpc-indent-'))?.split('-').pop()||0);
      context.length=level; context[level]=li.textContent;
      const spans=(li.querySelector('.refs')?.textContent||'').split(',').map(t=>t.trim().split(/[–—-]/).map(Number));
      rows.push({li,spans,text:normalize(context.join(' '))});
    }
    const tools=body.querySelector('.hpc-index-tools');
    const pageLabel=document.createElement('label'), input=document.createElement('input'), output=document.createElement('output');
    input.type='number';input.min='1';input.max='667';input.placeholder='纸书页码';pageLabel.append('换算 PDF 页码 ',input,' ',output);tools.append(pageLabel);
    input.addEventListener('input',()=>{output.textContent=input.value?(input.validity.valid?'PDF 第 '+(input.valueAsNumber+36)+' 页':'请输入 1–667 的整数。'):'';});
    const status=document.createElement('p');status.setAttribute('role','status');tools.append(status);
    addFilter(tools,'检索索引词或纸书页码',query=>{
      const words=query.split(/\s+/).filter(Boolean);
      let matched=0;
      for(const row of rows){
        const hit=words.every(word=>/^\d+$/.test(word)?row.spans.some(([lo,hi])=>lo>0&&Number(word)>=lo&&Number(word)<=(hi||lo)):(aliases[word]||[word]).some(w=>row.text.includes(normalize(w))));
        row.li.hidden=!hit;if(hit)matched++;
      }
      for(const page of pages)page.hidden=!!query&&!page.querySelector('.entry:not([hidden])');
      status.textContent=query?'找到 '+matched+' 个词条':'';
    });
  } else if (feature==='glossary'||feature==='terms') {
    const terms=[...body.querySelectorAll(feature==='terms'?'.hpc-term':'tbody tr')];
    addFilter(body,'查找中文、英文或缩写',value=>{const query=value.toLocaleLowerCase();for(const term of terms)term.hidden=!term.textContent.toLocaleLowerCase().includes(query);});
  }
  if (location.hash) requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());
}
