/* Small, account-backed discoveries. The terminal only dispatches registered effects. */
'use strict';
(() => {
 const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fx=()=>window.FoamTownEggFX,g=()=>window.FoamTownGame?.active,uid=()=>window.foamAuth?.user?.id||'guest',ctx=()=>window.FoamTownEggContext?.get()||{};
 const china=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d||new Date()).reduce((o,p)=>(o[p.type]=p.value,o),{});
 const day=()=>{const d=china();return d.year+'-'+d.month+'-'+d.day;};
 let catalog=[],found=new Map(),meta={},account='',pending=new Set(),dialog=null,queue=Promise.resolve(),lastInput=performance.now(),why=0,splitAt=0,boundaryStart=0,boundaryStage=0,studyTime=0;
 const ready=fetch('/assets/town/eggs.json').then(r=>{if(!r.ok)throw Error('彩蛋目录暂时无法读取');return r.json();}).then(c=>catalog=c);
 ready.catch(()=>{});
 // A navigation can cancel the shared fetch before background discoveries finish.
 async function catalogAvailable(){try{await ready;return true;}catch{return false;}}
 async function rpc(operation,payload={}){await window.foamAuth?.ready;const client=window.foamAuth?.client;if(!client||uid()==='guest')throw Error('登录并入住后，发现记录会随账号保存。');const {data,error}=await client.rpc('foamlab_town_eggs',{operation,payload});if(error)throw error;return data;}
 const activeFound=entries=>new Map(entries.filter(([id])=>catalog.some(row=>row.id===id)));
 function apply(data){if(!data)return;meta=data;found=activeFound((data.found||[]).map(x=>[x.id,x.at]));}
 let stateLoadedFor='',refreshPending=null;
 async function refresh(){
  if(!await catalogAvailable())return false;await window.foamAuth?.ready;const id=uid();
  if(id!==account){account=id;stateLoadedFor='';checkedAt.clear();found.clear();meta={};pending.clear();try{if(id==='guest')found=activeFound(JSON.parse(sessionStorage.getItem('foamlab.egg.guest')||'[]'));}catch{}}
  if(id==='guest'){stateLoadedFor=id;return;}
  if(refreshPending?.id===id)return refreshPending.promise;
  const request={id,promise:null};refreshPending=request;
  request.promise=rpc('state').then(data=>{if(uid()===id){apply(data);stateLoadedFor=id;}}).finally(()=>{if(refreshPending===request)refreshPending=null;});
  return request.promise;
 }
 async function event(kind,data={}){await ready;await window.foamAuth?.ready;const owner=uid();if(owner==='guest')return null;if(stateLoadedFor!==owner)await refresh();const result=await rpc('event',{kind,...data,request_id:crypto.randomUUID()});if(uid()!==owner)return null;const previous=new Set(found.keys());apply(result);for(const [id] of found)if(!previous.has(id)){const row=catalog.find(r=>r.id===id);discoveryToast(id,'发现彩蛋：'+(row?.name||id));window.dispatchEvent(new CustomEvent('foamlab:egg-found',{detail:{id,data:result}}));}if(result.notice)fx().toast(result.notice);window.dispatchEvent(new Event('foamlab:activity'));return result;}
 // W02 is announced once per account (or visitor browser), including across reloads.
 const recruitmentNotices=new Set();
 function discoveryToast(id,text){
  if(id==='W02'){const key='foamlab.egg.notice.W02.'+uid();if(recruitmentNotices.has(key))return;
   try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1');}catch{}
   recruitmentNotices.add(key);
  }
  fx().toast(text);
 }
 async function find(id){if(!await catalogAvailable())return false;await window.foamAuth?.ready;if(stateLoadedFor!==uid())await refresh().catch(()=>{});const row=catalog.find(r=>r.id===id);if(!row||pending.has(id))return false;const repeat=['T16','P01','P02'].includes(id);if(found.has(id)&&!repeat)return true;pending.add(id);const owner=uid();try{if(owner==='guest'){found.set(id,new Date().toISOString());try{sessionStorage.setItem('foamlab.egg.guest',JSON.stringify([...found]));}catch{}discoveryToast(id,'发现彩蛋：'+row.name+' · 登录入住后可保存和领奖');return true;}const data=await rpc('find',{id});if(uid()!==owner)return false;if(data.resident===false||data.eligible===false)return false;apply(data);if(data.fresh){discoveryToast(id,'发现彩蛋：'+row.name+(row.reward?' · 称号「'+row.reward+'」':row.card?' · 隐藏画卡「'+row.card+'」':''));dispatchEvent(new Event('foamlab:activity'));}return true;}catch(error){if(g())fx().toast('彩蛋暂未保存，可稍后重试');return false;}finally{pending.delete(id);}}
 function discover(id){queue=queue.catch(()=>{}).then(()=>find(id));return queue;}
 function modal(title,html){if(dialog?.open)dialog.close();const focus=document.activeElement;const d=document.createElement('dialog');d.className='egg-dialog';d.setAttribute('aria-label',title);d.innerHTML=`<header><h2>${E(title)}</h2><button type="button" aria-label="关闭">×</button></header><div class="egg-dialog-content">${html}</div>`;document.body.append(d);d.querySelector('header button').onclick=()=>d.close();d.addEventListener('close',()=>{d.remove();if(dialog===d)dialog=null;if(focus?.isConnected)focus.focus({preventScroll:true});},{once:true});d.addEventListener('cancel',e=>e.stopPropagation());d.addEventListener('keydown',e=>{if(e.key==='Escape')e.stopPropagation();});g()?.stopMovement();dialog=d;d.showModal();return d;}
 function secret(row){if(window.FoamEggSecret)return window.FoamEggSecret(row);const night=row.id==='T27',grid=Array.from({length:8},(_,i)=>`<path d="M${i*40} 0V320M0 ${i*40}H320"/>`).join('');return `<article class="egg-secret ${night?'is-night':''}"><div class="egg-secret-art"><svg viewBox="0 0 320 320" aria-hidden="true"><defs><linearGradient id="egg-card-sky-${row.id}" x2="0" y2="1"><stop stop-color="${night?'#17253e':'#366454'}"/><stop offset="1" stop-color="${night?'#69507a':'#9aba80'}"/></linearGradient></defs><rect width="320" height="320" fill="url(#egg-card-sky-${row.id})"/>${night?'<circle cx="252" cy="50" r="20" fill="#f4d896"/><g stroke="#f7ce85" stroke-width="2"><path d="M60 42v44m-22-22h44m-36-15 30 30m0-30-30 30M241 130v32m-16-16h32"/></g><rect x="66" y="78" width="188" height="100" rx="12" fill="#213f44" stroke="#d5b36b" stroke-width="6"/><path d="M85 100l20 13-20 13m38 3h90M91 154h75" fill="none" stroke="#a6d8ae" stroke-width="5"/>':`<g stroke="#c3e5a7" stroke-width="1.2" opacity=".4">${grid}</g><path d="M63 195V89l104-46 94 48v107L161 249Z" fill="#edf0ba55" stroke="#f4d88b" stroke-width="4"/><path d="m63 89 98 49 100-47M161 138v111M114 66l100 48M90 181l149-68M64 125l96 47 100-48" fill="none" stroke="#f1d496" stroke-width="2"/>`}<path d="M0 284Q88 235 165 269T320 280V320H0Z" fill="#b3c991"/></svg><div class="egg-card-panda" data-form="cub" data-outfit="${night?'scarf':'goggles'}">${window.foamPandaArt?.()||''}</div></div><h3>${E(row.card)}</h3><p>${night?'从第一张网格，到日志最后一行 End。':'把空间分成小小的单元，流动的故事从这里开始。'}</p></article>`;}
 const illustrationCleanup=new WeakMap();
 function illustrate(host){
  illustrationCleanup.get(host)?.();
  const pictures=[...host.querySelectorAll('[data-egg-art]')];if(!pictures.length)return;
  const draw=node=>{const row=catalog.find(r=>r.id===node.dataset.eggArt);if(row)node.innerHTML=window.FoamEggIllustration?.(row)||'';};
  if(!window.IntersectionObserver){pictures.forEach(draw);return;}
  let remaining=pictures.length;
  const cleanup=()=>{observer.disconnect();removal.disconnect();illustrationCleanup.delete(host);};
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){draw(entry.target);observer.unobserve(entry.target);if(--remaining===0)cleanup();}},{rootMargin:'160px'});
  // A collection tab replaces its contents without removing the host itself.
  const removal=new MutationObserver(()=>{if(!host.isConnected||!host.contains(pictures[0]))cleanup();});
  removal.observe(document.body,{childList:true,subtree:true});illustrationCleanup.set(host,cleanup);pictures.forEach(node=>observer.observe(node));
 }
 async function mount(host){
  await ready;if(!host.isConnected)return;await refresh().catch(()=>{});if(!host.isConnected)return;
  host.innerHTML=`<div class="egg-hub-head"><p>已发现 <b>${found.size} / ${catalog.length}</b> · 20、40、80 项及全部集齐有特别收藏</p><button type="button" class="egg-entry" data-egg-terminal>打开小终端 <kbd>\x60</kbd></button></div><p class="egg-caption">${uid()==='guest'?'访客发现只保存在当前浏览器会话；登录并入住后可保存与领奖。':'发现记录随账号保存。未发现的彩蛋只留下一句线索。'}隐藏画卡在本页收藏，独立于基础画册的 48 张画卡。</p><div class="egg-grid-list">${catalog.map(r=>{
   const yes=found.has(r.id),reward=[r.reward?'称号 · '+r.reward:'',r.card?'隐藏画卡 · '+r.card:''].filter(Boolean).join('；');
   return `<article class="egg-tile ${yes?'is-found':''}" data-egg-id="${r.id}"><small>${r.id} · ${yes?new Date(found.get(r.id)).toLocaleString('zh-CN',{hour12:false}):'尚未发现'}</small>${yes?`<div class="egg-discovery-art" data-egg-art="${r.id}" aria-hidden="true"></div>`:'<div class="egg-discovery-art egg-undiscovered-art" aria-hidden="true"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 7"/><path d="M83 82c0-25 39-27 39-2 0 18-23 18-23 36" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><circle cx="99" cy="137" r="5" fill="currentColor"/></svg></div>'}<h4>${yes?E(r.name):'未知彩蛋'}</h4><p class="egg-description">${E(yes?r.description:r.hint)}</p><footer class="egg-discovery-footer">${yes&&reward?`<p class="egg-discovery-reward">${E(reward)}</p>`:''}${yes&&r.card?`<button type="button" data-egg-card="${r.id}">翻看画卡</button>`:''}</footer></article>`;
  }).join('')}</div>`;
  illustrate(host);window.FoamTownEggEvents?.milestones(host);host.querySelector('[data-egg-terminal]').onclick=terminal;host.querySelectorAll('[data-egg-card]').forEach(b=>b.onclick=()=>modal('隐藏画卡',secret(catalog.find(r=>r.id===b.dataset.eggCard))));
 }
 async function album(){const d=modal('小镇彩蛋','<div data-egg-hub>正在翻开图鉴…</div>');await mount(d.querySelector('[data-egg-hub]'));}
 let realResiduals=null;
 async function residuals(){if(realResiduals)return realResiduals;const response=await fetch('/assets/town/province-cases/beijing-solver.log.gz');if(!response.ok)throw Error('日志暂时无法读取');const raw=await response.arrayBuffer();const bytes=new Uint8Array(raw);let text;if(bytes[0]===31&&bytes[1]===139){if(!window.DecompressionStream)throw Error('请在省份关卡中查看完整求解日志');text=await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).text();}else text=new TextDecoder().decode(raw);realResiduals=text.split('\n').filter(l=>/^Time =|Initial residual/.test(l)).slice(0,20).join('\n')+'\nEnd';return realResiduals;}
 function board(){return '<div class="egg-blackboard"><strong>不可压缩、恒定密度流体的动量方程</strong><div class="egg-equation">∂U/∂t + (U · ∇)U = −∇p/ρ + ν∇²U + f</div><dl><dt>∂U/∂t</dt><dd>固定位置上速度随时间的变化</dd><dt>(U · ∇)U</dt><dd>流体运动带来的对流加速度</dd><dt>−∇p/ρ</dt><dd>压力梯度产生的加速度</dd><dt>ν∇²U</dt><dd>黏性引起的动量扩散</dd><dt>f</dt><dd>单位质量所受的体积力</dd></dl><p>连续性条件：∇ · U = 0。这里的 p 是压力，ρ 是密度。</p></div>';}
 const fortunes=['先检查边界名称，再检查边界条件。','量纲写对，方程才有共同语言。','checkMesh 是开始计算前的好习惯。','先把一个简单算例跑通，再增加物理模型。','压力是 Pa 还是 m²/s²，要看 dimensions。','网格变细后，记得重新检查时间步。','残差下降和物理量稳定，要一起看。','周期边界把两侧流动连接起来。','empty 边界用于不求解的二维方向。','先读日志中的第一条错误。','0.orig 保存初始化之前的场。','setFields 负责给选定区域设置初始值。','写出间隔和求解时间步是两件事。','速度矢量的三个分量对应坐标轴。','求解器与物理模型要相互配合。','今天的竹笋，要一根一根捡。','多走一步，也许就遇到新邻居。','看懂一个边界条件，也是一份进步。','把常用配置写成自己的笔记。','算例目录里，Allrun 往往藏着运行顺序。'];
 async function run(command,out,rich){await ready;const text=command.trim().replace(/\s+/g,' ').slice(0,160);const row=catalog.find(r=>r.command===text)||(/^(pandasay)( |$)/.test(text)?catalog.find(r=>r.id==='T26'):null);rich.replaceChildren();if(!row){out.textContent='command not found: '+text;return;}out.textContent='$ '+text;let success=true;
  if(window.FoamTownEggEvents?.command){const handled=await window.FoamTownEggEvents.command(row.id,text,out,rich);if(handled!==null){if(handled)await discover(row.id);return;}}
  switch(row.id){
   case'T01':fx().grid();out.textContent+='\n网格已生成。';break;
   case'T02':out.textContent+='\n'+await residuals();fx().bubble('icoFoam\n残差日志见小终端\nEnd');break;
   case'T03':fx().ghost();out.textContent+='\n第二只熊猫会跟着你散步 10 秒。';break;
   case'T04':fx().particles('paper');out.textContent+='\n纸张飞起来，又回到原处。';break;
   case'T06':rich.innerHTML=board();break;
   case'T07':why++;success=why>=3;out.textContent+='\n'+(success?'先查 checkMesh':'再想想，还想问为什么吗？');if(success){fx().pose('stretch');fx().bubble('先查 checkMesh');why=0;}break;
   case'T08':fx().bubble('Checking geometry…\nChecking topology…\nMesh OK.');out.textContent+='\nMesh OK. · 小镇彩蛋';break;
   case'T10':fx().pose('cheer');out.textContent+='\n危险操作已被熊猫拦截。';break;
   case'T11':fx().bubble('竹伯：你没有村长权限。');out.textContent+='\n竹伯：你没有村长权限。';break;
   case'T12':out.textContent+='\n0  constant  system';break;
   case'T13':if(!meta.resident)throw Error('入住后就可以回自己的小屋。');closeTerminal();await window.FoamTownEggContext?.home(meta.homePage||0);fx().bubble('到家了。');break;
   case'T14':out.textContent+='\nv2512 · 熊猫小镇特别版';break;
   case'T15':{const pool=catalog.filter(r=>!found.has(r.id));out.textContent+='\n'+(pool.length?pool.sort(()=>Math.random()-.5).slice(0,3).map(r=>'· '+r.hint).join('\n'):'你已经全都知道了。');break;}
   case'T16':splitAt=Date.now();fx().split();out.textContent+='\n风景暂时分散了，趁记忆还热，让它们重逢吧。';break;
   case'T17':success=splitAt>0&&Date.now()-splitAt<=60000;if(success){fx().rejoin();splitAt=0;out.textContent+='\n四块拼图重新合在一起。';}else out.textContent+='\n先用 decomposePar 拆分，随后一分钟内重组。';break;
   case'T18':fx().water();out.textContent+='\n街道左半边的初始水域已设置，持续 20 秒。';break;
   case'T19':fx().stream();out.textContent+='\n流线绕过小镇建筑。';break;
   case'T20':{const name=ctx().name||'熊猫小镇';rich.innerHTML=`<div class="egg-postcard">${window.foamPandaArt?.()||''}<h3>${E(name)}来信</h3><p>今天也在这里，遇见一点新的流动。</p><small>${E(day())}</small></div>`;out.textContent+='\nWriting VTK…\n小镇明信片已生成。';break;}
   case'T21':out.textContent+=`\nstartTime      ${meta.joined?new Date(meta.joined).toLocaleDateString('zh-CN'):'尚未入住'};\nendTime        ∞;\ndeltaT         1 天;\nwriteInterval  ${meta.photos||0} 张合影;\napplication    ${ctx().form||'cub'};`;break;
   case'T22':{
    const c=ctx(),game=g(),residents=new Map((c.online||[]).map(p=>[p.user_id,p]));if(c.self)residents.set(c.self.user_id,c.self);
    const moving=m=>Math.hypot(m?.vx||0,m?.vy||0)>1;
    const people=[...residents.values()].map(p=>{const me=p.user_id===c.self?.user_id;return `Lv.${p.level??'—'}  ${p.name||'熊猫邻居'}${me?'（我）':''}  ${me?(c.status||'闲逛'):'在线'}`;});
    const npcs=[...(game?.npcs.values()||[])].map(m=>`${m.npc.name}  ${moving(m)?'走动中':'驻足中'}`);
    out.textContent+='\n'+(c.name||'小镇')+' · 当前活动快照\n更新于 '+new Date().toLocaleTimeString('zh-CN',{hour12:false})+'\n'+(c.connected?'当前在线 '+residents.size+' 位居民':c.self?'在线名单连接中；先显示自己的状态。':'访客浏览，在线名单暂未连接。')+'\n\n居民 · 等级 / 名称 / 状态\n'+(people.join('\n')||'暂未获取到在线居民。')+'\n\n小镇 NPC · '+npcs.length+' 位\n'+(npcs.join('\n')||'暂未获取到 NPC。')+'\n\n再次输入 top 刷新。';break;
   }
   case'T23':await refresh();out.textContent+='\n'+[{created_at:meta.joined,kind:'入住小镇',points:0},...(meta.milestones||[])].filter(x=>x.created_at).map(x=>'commit '+new Date(x.created_at).toLocaleDateString('zh-CN')+'  '+({checkin:'每日签到',lesson:'学习课程',town_visit:'探访小镇',province_case:'省份关卡'}[x.kind]||'成长记录')+(x.points?' +'+x.points+' 经验':'')).join('\n');break;
   case'T24':out.textContent+='\n'+(ctx().online?.length||0)+' 位在线邻居';break;
   case'T25':{let h=0;for(const c of day()+uid())h=(h*31+c.charCodeAt(0))>>>0;out.textContent+='\n'+fortunes[h%fortunes.length];break;}
   case'T26':{const words=text.replace(/^pandasay\s*/,'').slice(0,40)||'你好';out.textContent+='\n  ʕ •ᴥ• ʔ\n / '+words+' /';break;}
   case'T27':fx().grid();out.textContent+='\nblockMesh → icoFoam\n'+await residuals();fx().after(()=>{fx().pose('firework');fx().particles();},1000);break;
   case'T28':closeTerminal();fx().pose('wave');break;
   case'T29':await event('readme');out.textContent+='\n小镇说明书\n学堂学算例，湖边钓知识，展览馆分享计算图片。\n夹页上有一枚浅浅的钉痕。旧纸的另一半，似乎听过夜里的水声。';break;
   case'Q04':success=boundaryStage===2&&Date.now()-boundaryStart<600000;if(success){fx().appearance('egg-paper-panda',10000);out.textContent+='\nempty · 熊猫暂时变成二维纸片。';boundaryStage=0;}else out.textContent+='\n先依次找到入口和出口。';break;
  }
  if(row.id!=='T07')why=0;
  if(success)await discover(row.id);
 }
 let terminalPanel=null;
 function placeTerminal(){const panel=terminalPanel;if(!panel||panel.hidden)return;const vv=window.visualViewport,keyboard=vv?Math.max(0,innerHeight-vv.height-vv.offsetTop):0;const menu=document.querySelector('.town-game-tools')?.getBoundingClientRect(),bar=document.querySelector('.town-game-hotbar')?.getBoundingClientRect();const barBottom=bar&&bar.top>innerHeight*.6?innerHeight-bar.top+12:0;const bottom=keyboard>100?keyboard+10:Math.max(94,barBottom,innerHeight-(menu?.top||innerHeight-100)+12);panel.style.bottom=bottom+'px';panel.style.maxHeight=Math.max(130,(vv?.height||innerHeight)-bottom+keyboard-28)+'px';}
 function closeTerminal(){if(!terminalPanel)return;terminalPanel.hidden=true;terminalPanel.querySelector('.egg-terminal-results').hidden=true;terminalPanel.querySelector('[data-egg-output]').setAttribute('aria-expanded','false');terminalPanel.querySelector('[role=status]').hidden=true;document.querySelector('[data-town=terminal]')?.setAttribute('aria-expanded','false');g()?.viewport.focus({preventScroll:true});}
 async function terminal(){await ready;g()?.stopMovement();document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  if(!terminalPanel){const panel=document.createElement('section');panel.className='egg-terminal-dock';panel.id='town-terminal';panel.setAttribute('role','region');panel.setAttribute('aria-label','小镇终端');panel.innerHTML='<div class="egg-terminal-results" id="egg-terminal-results" hidden><div class="egg-terminal-output" role="log">输入 help 可以寻找彩蛋线索。</div><div data-egg-rich></div></div><form class="egg-terminal-form"><label for="egg-command" aria-label="命令">❯</label><input id="egg-command" maxlength="160" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" aria-label="输入彩蛋命令" placeholder="输入命令，试试 help"><button type="submit">运行</button><button type="button" data-egg-output aria-controls="egg-terminal-results" aria-expanded="false">回应</button><button type="button" data-egg-close aria-label="关闭终端">×</button></form><p class="egg-terminal-status" role="status" hidden></p>';document.body.append(panel);terminalPanel=panel;
   const form=panel.querySelector('form'),out=panel.querySelector('[role=log]'),input=panel.querySelector('input'),rich=panel.querySelector('[data-egg-rich]'),results=panel.querySelector('.egg-terminal-results'),toggle=panel.querySelector('[data-egg-output]'),status=panel.querySelector('[role=status]');
   panel.querySelector('[data-egg-close]').onclick=closeTerminal;toggle.onclick=()=>{results.hidden=!results.hidden;toggle.setAttribute('aria-expanded',String(!results.hidden));};
   form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('[type=submit]');if(button.disabled||!input.value.trim())return;button.disabled=true;results.hidden=true;toggle.setAttribute('aria-expanded','false');const owner=g();try{await run(input.value,out,rich);}catch(error){out.textContent=error.message||'暂时没有回应，请再试一次。';}finally{button.disabled=false;if(owner===g()&&panel.isConnected){const lines=out.textContent.split('\n').filter(s=>s.trim()&&!s.startsWith('$ '));status.textContent=rich.firstElementChild?'回应已准备好，点击「回应」查看。':(lines[0]||'小镇已经回应，点击「回应」查看。');status.hidden=false;input.blur();}}};
  }
  terminalPanel.hidden=false;document.querySelector('[data-town=terminal]')?.setAttribute('aria-expanded','true');placeTerminal();terminalPanel.querySelector('input').focus({preventScroll:true});
 }
 addEventListener('resize',placeTerminal);window.visualViewport?.addEventListener('resize',placeTerminal);window.visualViewport?.addEventListener('scroll',placeTerminal);
 // Handle Escape before the game's window listener can open Settings.
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&terminalPanel&&!terminalPanel.hidden&&!document.querySelector('dialog[open]')){e.preventDefault();e.stopImmediatePropagation();closeTerminal();}},{capture:true});
 function help(){const d=modal('快捷键与小线索','<p><kbd>Ctrl K</kbd> 搜索学习资料</p><p><kbd>?</kbd> 打开这份说明</p><p><kbd>Esc</kbd> 关闭当前弹窗</p><p>小镇中：WASD / 方向键移动，R 切换速度，E 互动，H 操作说明。</p><p class="egg-caption">在小镇按 <kbd>\x60</kbd> 打开小终端。也可以点击底部操作提示栏的“终端”。</p><button type="button" class="egg-entry">去小镇寻找彩蛋</button>');d.querySelector('.egg-entry').onclick=()=>{d.close();if(g())album();else location.href='/town/';};void discover('L04');}
 const editing=e=>e.target?.isContentEditable||e.target?.closest?.('input,textarea,select');
 let keys=[];
 document.addEventListener('keydown',e=>{lastInput=performance.now();if(e.repeat||e.isComposing||e.ctrlKey||e.metaKey||e.altKey||editing(e))return;if(document.querySelector('dialog[open]'))return;if(e.key==='`'||e.code==='Backquote'){e.preventDefault();e.stopImmediatePropagation();void terminal();return;}if(e.key==='?'){e.preventDefault();e.stopImmediatePropagation();help();return;}if(g()){if(['KeyD','ArrowRight'].includes(e.code)&&g().me.x>=g().width-95)outlet();keys.push(e.code);keys=keys.slice(-10);if(keys.join(',')==='ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,KeyB,KeyA'){fx().retro();void discover('C01');keys=[];}}},{capture:true});
 document.addEventListener('pointerdown',()=>lastInput=performance.now());
 const checkedAt=new Map();function observed(id){if(uid()==='guest'&&['P10','F04','F07','F09','B04','B05','S03','S04','S06','S09','K07'].includes(id))return;if(!found.has(id)&&!pending.has(id)&&Date.now()-(checkedAt.get(id)||0)>60000){checkedAt.set(id,Date.now());void discover(id);}}
 function mapMesh(){const world=document.querySelector('.town-map-world');if(!found.has('P10')||!world||world.querySelector('.egg-map-mesh'))return;const points=[...world.querySelectorAll('[data-province]')].filter(n=>!['plaza','overseas'].includes(n.dataset.province)).map(n=>({x:parseFloat(n.style.left)+n.offsetWidth/2,y:parseFloat(n.style.top)+n.querySelector('svg').getBoundingClientRect().height*.75}));const edges=new Set();let paths='';for(let i=0;i<points.length;i++){const a=points[i];points.map((b,j)=>({b,j,d:Math.hypot(b.x-a.x,b.y-a.y)})).filter(p=>p.j!==i).sort((a,b)=>a.d-b.d).slice(0,3).forEach(({b,j})=>{const key=[i,j].sort((a,b)=>a-b).join(':');if(edges.has(key))return;edges.add(key);paths+=`M${a.x} ${a.y}L${b.x} ${b.y}`;});}const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${parseFloat(world.style.width)} ${parseFloat(world.style.height)}`);svg.setAttribute('class','egg-map-mesh');svg.setAttribute('aria-hidden','true');svg.innerHTML=`<path d="${paths}" fill="none" stroke="#c29b50" stroke-width="2.5" opacity=".55"/>`;world.prepend(svg);}
 let scans=0;function decorate(){if(document.hidden)return;mapMesh();const state=window.FoamTownProgress?.get?.(),balance=state?.balance;
  if(document.querySelector('[data-buy-box]')&&balance===0){const p=document.querySelector('.town-shop-status');if(p&&!p.textContent)p.textContent='阿团：先欠着吧，去散步捡些竹笋再来。';observed('B04');}
  document.querySelectorAll('.town-exhibit').forEach(n=>{const likes=Number(n.querySelector('[data-gallery-like] b')?.textContent);n.classList.toggle('egg-gold-frame',likes>=100);if(likes>=100)observed('S09');});
  document.querySelectorAll('.town-mail').forEach(n=>{if(n.dataset.eggDecorated)return;n.dataset.eggDecorated='true';const text=n.querySelector('p')?.textContent?.replace(/[\p{P}\p{Z}\s]/gu,'')||'';if(text.length>=2&&text===[...text].reverse().join('')){n.classList.add('egg-palindrome');observed('S04');}const at=n.dataset.createdAt;if(at&&Number(china(new Date(at)).hour)<5){n.classList.add('egg-night-mail');observed('S06');}});
  const house=document.querySelector('.town-photo-grid');if(house&&Number(house.dataset.total)>=100){house.classList.add('egg-film');observed('S03');}
  const cards=window.FoamPandaCards,have=cards?.owned();if(have&&state){if(cards.cards.filter(c=>c.rarity==='common').every(c=>have.has(c.id))){observed('F09');const album=document.querySelector('.tac-grid');if(album&&!album.parentElement.querySelector('.egg-album-cheer')){const n=document.createElement('div');n.className='egg-album-cheer';n.innerHTML=(window.foamPandaArt?.()||'')+'<p>普通画卡集齐了，给你鼓鼓掌！</p>';album.before(n);if(!fx().quiet())window.foamPandaMotion?.play(n,'cheer');}}if(cards.cards.every(c=>have.has(c.id))){observed('K07');const album=document.querySelector('.tac-grid');if(album&&!album.parentElement.querySelector('.egg-collage')){const wall=document.createElement('div');wall.className='egg-collage';wall.setAttribute('aria-label','48 张画卡全景');wall.innerHTML=cards.cards.map(c=>'<div>'+cards.front(c.id)+'</div>').join('');album.before(wall);}}}
  const date=china(),month=Number(date.month),dayN=Number(date.day),signs=['capricorn','aquarius','pisces','aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn'],cut=[20,19,21,20,21,22,23,23,23,24,23,22],sign=signs[month-1+(dayN>=cut[month-1]?1:0)];const current=document.querySelector('[data-art-card="star-'+sign+'"]');if(current){current.classList.add('egg-zodiac-glow');observed('K05');}
  const query=document.querySelector('#global-search'),search=document.querySelector('#search-results');if(query&&search){const yes=/^(panda|熊猫)$/i.test(query.value.trim());let panda=search.querySelector('.egg-search-panda');if(yes&&!panda){panda=document.createElement('span');panda.className='egg-search-panda';panda.setAttribute('aria-label','你找到小熊猫了');panda.innerHTML=window.foamPandaArt?.()||'';search.prepend(panda);observed('W07');}if(!yes)panda?.remove();}
  scans++;if(state&&balance>999){if(scans%20===0)fx().particles();const status=document.querySelector('.town-shop-status');if(status&&!status.textContent)status.textContent='阿团：老板，今天想挑点什么？';observed('F07');}if(state&&balance===3141&&!found.has('B05')){fx().bubble('π');observed('B05');}
 }
 function outlet(){rightHits++;if(rightHits===3){rightHits=0;if(boundaryStage===1)boundaryStage=2;fx().bubble('计算域边界\ntype wall;');void discover('P01');}}
 let leftTime=0,rightHits=0,rightHeld=false,snowDay='',lunch=false,idleDone=false,wasGame=null,spotClicks=[];
 function tick(){if(document.hidden)return;const game=g();if(game||document.querySelector('dialog[open],.town-map-world'))decorate();if(!game)return;if(wasGame!==game){wasGame=game;lunch=false;leftTime=0;rightHits=0;rightHeld=false;idleDone=false;spotClicks=[];lastInput=performance.now();game.listen('destroy',()=>{fx().clear();closeTerminal();});
   void refresh().then(()=>{if(g()!==game)return;if(meta.resident){observed('P10');observed('F04');}}).catch(()=>{});if(new URLSearchParams(location.search).has('terminal')){history.replaceState(null,'',location.pathname+location.hash);void terminal();}
  }
  const date=china(),hour=Number(date.hour),minute=Number(date.minute);if(hour===12&&minute<30){if(!lunch){lunch=true;game.npcs.forEach(m=>{m.eggOldBusy=m.busy;m.busy=true;fx().quiet()||window.foamPandaMotion?.play(m.el,'munch');});observed('D08');}}else if(lunch){lunch=false;game.npcs.forEach(m=>{m.busy=m.eggOldBusy||false;});}
  if([12,1,2].includes(Number(date.month))&&['heilongjiang','jilin','neimenggu'].includes(game.config.province)&&snowDay!==day()+game.config.province){snowDay=day()+game.config.province;fx().particles('snow');observed('M05');}
  const open=!!document.querySelector('dialog[open]')||document.querySelector('#town-app')?.dataset.overlay;if(open){leftTime=0;return;}
  if(game.me.x<=90){leftTime++;if(leftTime===5){boundaryStart=Date.now();boundaryStage=1;fx().bubble('inlet：fixedValue →');void discover('P02');}}else leftTime=0;
  const right=game.me.x>=game.width-95&&game.pad==='right';if(right&&!rightHeld)outlet();rightHeld=right;
  if(Math.hypot(game.me.vx||0,game.me.vy||0)>5){lastInput=performance.now();idleDone=false;}if(!idleDone&&performance.now()-lastInput>300000){idleDone=true;fx().nap();fx().bubble('休息一下，把书放在身边。');observed('F08');}
 }
 setInterval(tick,1000);
 const lesson=()=>!!document.body.dataset.lesson||document.body.dataset.section==='lesson'||!!document.querySelector('#lab-complete,#complete-lesson');
 const reading=setInterval(()=>{if(!lesson()||document.hidden)return;studyTime+=5;if(studyTime>=600&&innerHeight+scrollY>=document.documentElement.scrollHeight-180){const main=document.querySelector('main');if(main&&!main.querySelector('.egg-reading')){const n=document.createElement('div');n.className='egg-reading';n.innerHTML=(window.foamPandaArt?.()||'')+'<p>这一课读完了，给认真学习的你一个赞。</p>';main.append(n);window.foamPandaMotion?.play(n,'cheer');observed('L02');}clearInterval(reading);}},5000);
 window.addEventListener('beforeprint',()=>{if(lesson()){let n=document.querySelector('.egg-print-panda');if(!n){n=document.createElement('div');n.className='egg-print-panda';n.innerHTML=window.foamPandaArt?.()||'';document.body.append(n);}observed('L03');}});
 window.addEventListener('foam-auth-change',()=>{void refresh().catch(()=>{});});window.addEventListener('foamlab:province-passed',()=>{observed('F04');fx().after(()=>{if(found.has('F04')&&document.querySelector('.province-difficulty.is-advanced'))document.querySelector('.province-case-heading>svg')?.classList.add('egg-medal-glow');},800);});
 window.addEventListener('foamlab:town-game',()=>{lastInput=performance.now();});
 if(document.querySelector('#town-app'))Promise.resolve(window.foamAuth?.ready).then(()=>refresh()).catch(()=>{});
 window.FoamTownEggs={ready,mapMesh,terminal,toggleTerminal:()=>terminalPanel&&!terminalPanel.hidden?closeTerminal():terminal(),album,mount,discover,refresh,event,apply,modal,secret,residuals,china,get meta(){return meta;},get catalog(){return catalog;},get found(){return new Map(found);},count:()=>found.size};
 console.info('ʕ •ᴥ• ʔ  FoamLab 熊猫小镇：欢迎一起把流动变成故事。线索：在小镇按 `。');
})();
