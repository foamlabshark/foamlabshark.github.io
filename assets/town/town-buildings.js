'use strict';
/* Panda Town building interiors. Discussion, announcements, articles and comments are read and written
 * through the main site's own code (window.FoamLab: same Supabase tables, permissions and rendering), so what
 * you post in town appears on the main pages and the other way round. The OpenFOAM practice parts (cavity run
 * replay, error clinic, daily quiz, mesh bench) are local to the browser. */
(() => {
 const root=document.querySelector('#town-app');if(!root)return;
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const L=()=>window.FoamLab;const store={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d;}catch{return d;}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}};
 const uid=()=>window.foamAuth?.user?.id||'guest';const today=()=>{const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;};
 const date=s=>s?new Intl.DateTimeFormat('zh-CN',{month:'numeric',day:'numeric'}).format(new Date(s)):'';
 const LIST='id,slug,kind,title,summary,track,series,cover_url,metadata,author_id,author_name,sort_order,published_at,created_at,updated_at,comments_enabled';
 const CATEGORIES=['使用问题','网格与几何','数值方法','编程开发','结果与后处理','经验交流'];
 const STATUS={open:'讨论中',resolved:'已解决',closed:'已关闭'};
 const TRACKS=[['起步与算例','起步与算例'],['几何与网格','几何与网格'],['数值方法','离散与求解'],['物理模型','物理模型'],['计算与数据分析','计算与数据分析'],['验证与研究方法','验证与研究方法']];
 const BUILDINGS={
  notice:{icon:'📜',sub:'本镇留言 · 网站公告',tabs:[['board','本镇留言'],['news','网站公告']],full:'/announcements/'},
  shop:{icon:'🎋',sub:'竹笋铺 · 服饰、装饰与竹林盲盒',tabs:[['shop','竹笋商店']],full:null},
  school:{icon:'🏫',sub:'学堂 · 课程、每日一题与算例实训',tabs:[['map','课程地图'],['run','算例实训'],['quiz','每日一题']],full:'/courses/'},
  workshop:{icon:'🛠️',sub:'网格工坊 · blockMesh 与 checkMesh 的家',tabs:[['bench','网格实验台'],['run','算例实训'],['lessons','网格课程'],['tools','网格工具']],full:'/topics/meshing/'},
  hospital:{icon:'🏥',sub:'答疑医院 · 与讨论中心同步的问答',tabs:[['forum','问诊大厅'],['clinic','报错诊室']],full:'/community/'},
  library:{icon:'📚',sub:'图书馆 · 检索、资料与知识卡',tabs:[['search','全站检索'],['shelf','资料书架'],['knowledge','知识卡']],full:'/resources/'},
  gallery:{icon:'🖼️',sub:'展览馆 · 实践与分享、算例成果',tabs:[['images','图片展览'],['works','实践文章'],['run','实训成果']],full:'/sharing/'},
  spot:{icon:'⛲',sub:'小镇景点 · 街道里的 CFD',tabs:[['story','景点故事']],full:null},
  institute:{icon:'🔬',sub:'研究所 · 同一学校或团队的邻居',tabs:[['members','成员']],full:null},
 };

 /* ---- OpenFOAM practice content -------------------------------------------------------- */
 const QUIZ=[
  ['不可压缩求解器（如 icoFoam、simpleFoam）中的 p 是什么量？',['以 Pa 为单位的压力','压力除以密度，单位 m²/s²','密度'],1,'不可压缩求解器求解的是运动压力 p/ρ，所以 0/p 的量纲是 [0 2 -2 0 0 0 0]。','/commands/icofoam/'],
  ['结束时间 endTime 和时间步长 deltaT 写在哪个文件里？',['system/controlDict','system/fvSchemes','system/fvSolution'],0,'controlDict 控制时间、写出频率，并加载函数对象。','/dictionaries/system-controldict/'],
  ['方腔算例 blockMeshDict 里 hex (...) (20 20 1) 中的 (20 20 1) 表示什么？',['三个方向的网格数','三个方向的长度','网格分级比'],0,'它是这个块在 x、y、z 三个方向上划分的单元数，20×20×1 共 400 个单元。','/dictionaries/system-blockmeshdict/'],
  ['二维算例的前后两个面，边界类型通常设为什么？',['wall','empty','symmetry'],1,'empty 告诉 OpenFOAM 这个方向不求解，方腔算例的 frontAndBack 就是 empty。','/dictionaries/system-blockmeshdict/'],
  ['想检查网格的非正交性和偏斜度，应该运行哪个命令？',['blockMesh','checkMesh','foamToVTK'],1,'checkMesh 报告网格统计、拓扑和几何质量；带 *** 的条目要重点看。','/commands/checkmesh/'],
  ['并行计算之前，先要运行哪个命令切分算例？',['reconstructPar','decomposePar','mapFields'],1,'decomposePar 按 decomposeParDict 生成 processor* 目录；算完用 reconstructPar 合并。','/commands/decomposepar/'],
  ['不可压稳态湍流计算（例如 pitzDaily）常用哪个求解器？',['simpleFoam','icoFoam','interFoam'],0,'simpleFoam 使用 SIMPLE 算法，配合 RAS 湍流模型。','/commands/simplefoam/'],
  ['梯度、对流、拉普拉斯项的离散格式写在哪里？',['system/fvSolution','system/fvSchemes','constant/transportProperties'],1,'fvSchemes 规定各项的离散格式；fvSolution 管线性求解器和算法。','/dictionaries/system-fvschemes/'],
  ['松弛因子 relaxationFactors 写在哪个文件里？',['system/fvSolution','system/fvSchemes','system/controlDict'],0,'fvSolution 里有线性求解器、SIMPLE/PISO/PIMPLE 参数和松弛因子。','/dictionaries/system-fvsolution/'],
  ['溃坝 damBreak 这类自由液面问题，常用哪个求解器？',['buoyantPimpleFoam','interFoam','simpleFoam'],1,'interFoam 用 VOF 方法追踪两种不相溶流体的界面。','/commands/interfoam/'],
  ['初始条件和边界条件放在算例的哪个目录？',['0','constant','system'],0,'0 目录里每个场一个文件，例如 0/U、0/p。','/read/?slug=first-cavity-result'],
  ['网格文件 polyMesh 位于哪里？',['system/polyMesh','constant/polyMesh','0/polyMesh'],1,'blockMesh、snappyHexMesh 等把网格写到 constant/polyMesh。','/commands/blockmesh/'],
  ['计算结束后想得到涡量场，最方便的做法是？',['重新运行求解器','postProcess -func vorticity','checkMesh -vorticity'],1,'postProcess 会对已保存的时刻运行函数对象。','/commands/postprocess/'],
  ['Courant 数的定义是？',['U·Δt / Δx','Δx / (U·Δt)','U·Δx / ν'],0,'Co = |U|Δt/Δx，表示一个时间步内流体跨过了几个单元。','/function-objects/courantno/'],
  ['方腔算例中，顶盖 movingWall 的速度边界条件是？',['zeroGradient','fixedValue，值为 (1 0 0)','noSlip'],1,'顶盖以 1 m/s 向右运动，所以是 fixedValue uniform (1 0 0)。','/read/?slug=first-cavity-result'],
  ['封闭方腔里压力只由梯度决定，求解时需要怎样处理？',['给出参考点 pRefCell 和 pRefValue','设置一个入口压力','什么都不用做'],0,'封闭区域压力差一个常数，需要在 fvSolution 的算法字典里指定参考点。','/dictionaries/system-fvsolution/'],
  ['icoFoam 使用哪种压力–速度耦合算法？',['SIMPLE','PISO','只解动量方程'],1,'运行日志开头就写着 “PISO: Operating solver in PISO mode”。','/commands/icofoam/'],
  ['snappyHexMesh 开始前需要准备什么？',['一套背景网格（常由 blockMesh 生成）','已经算完的结果','并行分区'],0,'snappyHexMesh 在背景六面体网格上切割、贴合几何。','/commands/snappyhexmesh/'],
  ['壁面第一层网格 y⁺ 在 30–300 之间时，通常配合哪种近壁处理？',['壁面函数','直接解析粘性底层的低雷诺数处理','不需要近壁处理'],0,'这个区间位于对数律区，适合使用壁面函数。','/function-objects/yplus/'],
  ['v2512 方腔算例（20×20×1）一共有多少个单元？',['882','400','1640'],1,'blockMesh 日志：nCells: 400。882 是点数，1640 是面数。','/commands/blockmesh/'],
 ];
 const CLINIC=[
  ['missing-field','--> FOAM FATAL IO ERROR: (openfoam-2512)\ncannot find file "/home/panda/run/cavity/0/U"',['缺少场文件 0/U，或 0 目录被清理掉了','网格质量太差','时间步太大'],0,'找不到初始场。常见原因是运行过 Allclean，或者只拷贝了网格。','从 0.orig 复制一份，或者补回 0/U，再重新运行。','/read/?slug=first-cavity-result'],
  ['patch-entry','--> FOAM FATAL IO ERROR: (openfoam-2512)\nCannot find patchField entry for movingWall',['求解器版本不对','0/U 的 boundaryField 里缺少 movingWall 这一项','movingWall 的网格坏了'],1,'场文件的边界列表必须覆盖网格里的每一个 patch。','对照 constant/polyMesh/boundary，把缺少的 patch 补进 0/U。','/read/?slug=first-cavity-result'],
  ['bc-typo','--> FOAM FATAL IO ERROR: (openfoam-2512)\nUnknown patchField type fixedValu for patch movingWall of field U',['边界条件名称拼错了','缺少 fvSchemes','时间步太大'],0,'fixedValu 少了一个 e。报错下面会列出所有可用的边界类型。','改成 fixedValue；不确定名字时，看报错里的可用列表。','/read/?slug=first-cavity-result'],
  ['schemes','--> FOAM FATAL IO ERROR: (openfoam-2512)\nEntry \'div(phi,U)\' not found in dictionary "system/fvSchemes/divSchemes"',['网格有负体积','fvSchemes 里缺少对流项 div(phi,U) 的格式','缺少 transportProperties'],1,'求解器要离散 div(phi,U)，但 fvSchemes 没有给出它的格式。','在 divSchemes 里补上 div(phi,U)，例如参考同类教程的写法。','/dictionaries/system-fvschemes/'],
  ['courant','Time = 0.064\nCourant Number mean: 3.41 max: 87.6\n...\n#0  Foam::error::printStack(Foam::Ostream&)\nFloating point exception (core dumped)',['时间步太大，计算发散','缺少场文件','网格文件损坏'],0,'Courant 数远大于 1，误差逐步放大，最后出现浮点异常。','减小 controlDict 里的 deltaT；支持自适应时间步的求解器可以开启 adjustTimeStep 并设置 maxCo。','/function-objects/courantno/'],
  ['quality','    Mesh non-orthogonality Max: 78.4 average: 21.3\n   *Number of severely non-orthogonal (> 70 degrees) faces: 132.\n  ***Max skewness = 6.2, 18 highly skew faces detected which may impair the quality of the results',['网格质量差：非正交性高、偏斜面多','边界条件写错','并行分区不均匀'],0,'checkMesh 用 * 和 *** 标出了需要注意的质量问题。','优先改善网格；暂时可以在 fvSolution 里增加 nNonOrthogonalCorrectors，并用有限修正的拉普拉斯格式。','/commands/checkmesh/'],
  ['parallel','$ mpirun -np 4 simpleFoam\nCreate time\nCreate time\nCreate time\nCreate time',['忘了加 -parallel，四个进程各自算了一遍','网格太大','decomposePar 用错了方法'],0,'没有 -parallel 时，每个进程都把整个算例当作串行计算来跑。','改为 mpirun -np 4 simpleFoam -parallel，并确认进程数与分区数一致。','/commands/decomposepar/'],
  ['bounding','bounding k, min: -2.1e-05 max: 0.48 average: 0.012\nbounding epsilon, min: -0.37 max: 912 average: 3.4\n（每个时间步都在出现）',['湍流量趋于发散','只是正常的提示，不用管','缺少 0/U'],0,'计算初期偶尔出现 bounding 很常见；每一步都有，说明湍流量正在发散。','检查入口 k、epsilon 的取值，近壁网格和壁面函数；必要时先用一阶格式起步。','/function-objects/yplus/'],
  ['no-env','$ blockMesh\nblockMesh: command not found',['当前终端没有加载 OpenFOAM 环境','blockMeshDict 写错了','网格太大'],0,'系统找不到 OpenFOAM 的命令，说明环境变量还没有设置。','source 安装目录里的 etc/bashrc，然后用 foamVersion 确认版本。','/read/?slug=start-openfoam-v2512'],
 ];
 const MESH_TOOLS=[['blockMesh','由 blockMeshDict 生成结构化六面体块网格','/commands/blockmesh/'],['checkMesh','检查网格拓扑与质量','/commands/checkmesh/'],['snappyHexMesh','按 STL 几何切割背景网格、贴合表面、加边界层','/commands/snappyhexmesh/'],['surfaceFeatureExtract','从 STL 提取特征边，帮助 snappyHexMesh 保留棱角','/commands/surfacefeatureextract/'],['extrudeMesh','把面网格拉伸成体网格，常用于二维算例','/commands/extrudemesh/'],['refineMesh','按区域加密已有网格','/commands/refinemesh/'],['topoSet','按几何条件选出单元、面、点集合','/commands/toposet/'],['createPatch','新建或合并边界 patch','/commands/createpatch/'],['transformPoints','平移、旋转、缩放网格','/commands/transformpoints/'],['renumberMesh','重新编号以减小矩阵带宽','/commands/renumbermesh/']];

 /* Shared five-stage training navigation; records and rendering are owned by town-training.js. */
 const RUN=window.FoamTownTraining.steps;
 const NAMES={school:'学堂',workshop:'网格工坊',gallery:'展览馆',hospital:'答疑医院',library:'图书馆',notice:'公告栏'};
 const runState=()=>window.FoamTownTraining?.state()||{step:0,done:false,empty:true};

 /* ---- shell ------------------------------------------------------------------------------ */
 let ctx=null,tab=null,back=null,live=null;
 const view=()=>document.querySelector('.tb-view');
 function open(kind,c){const b=BUILDINGS[kind];if(!b)return false;ctx={...c,kind};back=null;live=null;
  c.dialog(c.name,`<div class="tb" data-kind="${kind}"><div class="tb-hero"><span class="tb-icon" aria-hidden="true">${window.FoamTownGlyph?.(kind==='notice'?'notice':kind==='spot'?'fountain':kind)||b.icon}</span><div class="tb-hero-text"><p>${E(b.sub)}</p>${c.reward||''}</div>${b.full?`<a class="tb-full" href="${b.full}">在完整页面打开 ↗</a>`:''}</div><div class="tb-tabs" role="tablist">${b.tabs.map(([id,label])=>`<button type="button" role="tab" data-tb="tab" data-tab="${id}" aria-selected="false">${label}${id==='run'&&runAt(kind)?'<i class="tb-dot" aria-label="实训任务在这里"></i>':''}</button>`).join('')}</div><div class="tb-view" role="tabpanel" tabindex="-1"></div></div>`);
  const first=c.tab||(b.tabs.some(t=>t[0]==='run')&&runAt(kind)?'run':b.tabs[0][0]);show(first);window.dispatchEvent(new CustomEvent('foamlab:town-panel',{detail:{kind}}));return true;}
 const runAt=kind=>{const s=runState();return !s.done&&RUN[s.step]?.at===kind;};
 function show(id){tab=id;back=null;const full=document.querySelector('.tb-full');if(full)full.hidden=ctx.kind==='notice'&&id==='board';document.querySelectorAll('.tb-tabs [data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===id)));const fn=TABS[ctx.kind+':'+id]||TABS[id];guard(fn);}
 async function guard(fn,...args){const host=view();if(!host)return;live=Symbol();const token=live;host.innerHTML='<div class="tb-loading"><span></span>正在读取…</div>';host.scrollTop=0;
  try{await L()?.ready;if(token!==live)return;await fn(host,...args);}catch(error){if(token!==live)return;host.innerHTML=`<div class="tb-error" role="alert"><strong>暂时无法读取</strong><p>${E(error.message||'请稍后重试。')}</p><button type="button" data-tb="retry">重试</button></div>`;host.querySelector('[data-tb=retry]').onclick=()=>guard(fn,...args);}}
 const check=r=>L().check(r);
 const empty=text=>`<div class="tb-empty">${E(text)}</div>`;
 const backButton=(label='返回')=>`<button type="button" class="tb-back" data-tb="back">← ${E(label)}</button>`;
 function detail(fn,...args){const prev=tab;back=()=>show(prev);guard(fn,...args);}
 function goTo(kind){const g=window.FoamTownGame?.active,i=g?.config.buildings.findIndex(b=>b[0]===kind);ctx.close();if(g&&i>=0)g.walkToBuilding(i,()=>g.config.interact?.(i));}

 /* ---- generic reader: any published content, with the site's own comments ---------------- */
 async function reader(host,slug){const item=check(await L().client.from('foamlab_content').select('*').eq('slug',slug).eq('status','published').maybeSingle());
  if(!item||item.metadata?.admin_only){host.innerHTML=backButton()+empty('这篇内容尚未发布，或已经移入归档。');return;}
  await L().names([item.author_id]);
  host.innerHTML=`${back?backButton():''}<article class="tb-article"><div class="eyebrow">${E(item.track||item.kind)}</div><h2>${E(L().headingTitle?.(item)||item.title)}</h2><div class="article-meta community-byline">${L().authorMeta(item)}</div>${item.summary?`<p class="lab-lead">${E(item.summary)}</p>`:''}<div class="prose">${L().markdown(item.body)}</div><p class="tb-actions"><a class="button secondary" href="/read/?slug=${encodeURIComponent(item.slug)}">在完整页面阅读 ↗</a></p><section class="lab-comments tb-comments"><h3>评论与补充 <small>与网站同步</small></h3></section></article>`;
  const comments=host.querySelector('.tb-comments');if(item.comments_enabled)await L().messages(comments,{content_id:item.id});else comments.insertAdjacentHTML('beforeend','<p class="muted">作者已关闭这篇内容的评论。</p>');}
 function cards(rows,opts={}){if(!rows.length)return empty(opts.empty||'这里还没有内容。');return `<div class="tb-cards ${opts.cls||''}">${rows.map(r=>`<button type="button" class="tb-card" data-tb="read" data-slug="${E(r.slug)}">${opts.cover&&r.cover_url?`<img src="${E(L().safeURL(r.cover_url))}" alt="" loading="lazy">`:''}<strong>${E(L().headingTitle?.(r)||r.title)}</strong>${r.summary?`<span>${E(r.summary)}</span>`:''}<small>${opts.meta?opts.meta(r):E(r.track||'')}</small></button>`).join('')}</div>`;}
 function contentQuery(kinds){return L().client.from('foamlab_content').select(LIST).eq('status','published').in('kind',kinds);}

 /* ---- tabs --------------------------------------------------------------------------------- */
 const TABS={
  async news(host){const rows=check(await contentQuery(['announcement']).order('created_at',{ascending:false}).range(0,59));await L().names(rows.map(r=>r.author_id));
   host.innerHTML=`<div class="tb-board">${rows.length?rows.map((r,i)=>`<button type="button" class="tb-note ${i<1?'is-new':''}" data-tb="read" data-slug="${E(r.slug)}" style="--tilt:${[-1.4,1,-.5,1.6,-1.1,.6][i%6]}deg"><i class="tb-pin" aria-hidden="true"></i><small>${date(r.published_at||r.created_at)}</small><strong>${E(r.title)}</strong><span>${E(r.summary||'')}</span></button>`).join(''):empty('公告栏上还没有贴新纸。')}</div>`;},
  async 'hospital:forum'(host,state={category:'全部',q:''}){
   const rows=check(await L().client.from('foamlab_threads').select('id,title,category,version,status,pinned,created_at,updated_at,author_id,accepted_message_id').neq('status','hidden').order('pinned',{ascending:false}).order('created_at',{ascending:false}).order('id').range(0,149));
   const counts={};if(rows.length){const r=await L().client.from('foamlab_messages').select('thread_id').in('thread_id',rows.map(t=>t.id)).eq('status','visible').range(0,4999);for(const m of r.data||[])counts[m.thread_id]=(counts[m.thread_id]||0)+1;}
   await L().names(rows.map(r=>r.author_id));const canAsk=!!L().user&&L().role!=='blocked';
   host.innerHTML=`<div class="tb-toolbar"><input type="search" class="tb-search" placeholder="搜索问题标题、分类、版本" aria-label="搜索讨论" value="${E(state.q)}"><button type="button" class="tb-primary" data-tb="compose">${canAsk?'我要提问 +':'登录后提问'}</button></div><div class="tb-chips">${['全部',...CATEGORIES].map(c=>`<button type="button" data-tb="cat" data-cat="${c}" aria-pressed="${c===state.category}">${c}</button>`).join('')}</div><ol class="tb-threads"></ol><p class="tb-note-small">与讨论中心是同一份数据：在这里发的问题和回答，网站上立刻能看到。</p>`;
   const list=host.querySelector('.tb-threads'),draw=()=>{const words=state.q.toLowerCase().split(/\s+/).filter(Boolean);const shown=rows.filter(t=>(state.category==='全部'||t.category===state.category)&&words.every(w=>[t.title,t.category,t.version].join(' ').toLowerCase().includes(w)));
    list.innerHTML=shown.map(t=>`<li><button type="button" data-tb="thread" data-id="${E(t.id)}"><span class="tb-status is-${E(t.status)}">${t.pinned?'置顶 · ':''}${STATUS[t.status]||t.status}</span><strong>${E(t.title)}</strong><small>${E(t.category)} · ${E(t.version)} · ${E(L().authorMeta(t).match(/<strong>(.*?)<\/strong>/)?.[1]||'社区成员')} · ${date(t.created_at)}</small><b aria-label="回复数">${counts[t.id]||0} 💬</b></button></li>`).join('')||`<li class="tb-empty">没有找到符合条件的问题。</li>`;};
   draw();host.querySelector('.tb-search').oninput=e=>{state.q=e.target.value;draw();};host.querySelectorAll('[data-tb=cat]').forEach(b=>b.onclick=()=>{state.category=b.dataset.cat;host.querySelectorAll('[data-tb=cat]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw();});
   host.querySelector('[data-tb=compose]').onclick=()=>canAsk?detail(TABS.compose):L().login();
   list.onclick=e=>{const b=e.target.closest('[data-tb=thread]');if(b)detail(TABS.thread,b.dataset.id);};},
  async compose(host){host.innerHTML=`${backButton('返回问诊大厅')}<form class="tb-form" id="tb-topic-form"><h3>提出问题</h3><label><span>问题标题</span><input name="title" minlength="5" maxlength="180" required placeholder="例如：checkMesh 报告非正交性过高怎么办？"></label><div class="tb-form-row"><label><span>分类</span><select name="category">${CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select></label><label><span>软件版本</span><input name="version" value="v2512" maxlength="50" required></label></div><label><span>问题详情 · Markdown / TeX</span><textarea name="body" rows="12" minlength="10" maxlength="40000" required>## 要解决的问题\n\n## 环境与运行命令\n\n\`\`\`bash\necho "$WM_PROJECT_VERSION"\n\`\`\`\n\n## 最小配置与报错日志\n\n## 已尝试的方法\n</textarea></label><div class="tb-form-actions"><button type="submit" class="tb-primary">发布到讨论中心</button><button type="button" data-tb="preview">预览</button></div><div class="prose lab-preview" hidden></div><p class="form-status" role="status"></p></form>`;
   const f=host.querySelector('form');f.querySelector('[data-tb=preview]').onclick=()=>{const p=f.querySelector('.lab-preview');p.innerHTML=L().markdown(f.elements.body.value);p.hidden=!p.hidden;};
   f.onsubmit=async e=>{e.preventDefault();const b=f.querySelector('[type=submit]');b.disabled=true;try{const title=f.elements.title.value.trim(),body=f.elements.body.value.trim();if(title.length<5)throw Error('标题至少需要 5 个字。');if(body.length<10)throw Error('问题详情至少需要 10 个有效字符。');await L().ensureProfile();const r=check(await L().client.from('foamlab_threads').insert({title,body,category:f.elements.category.value,version:f.elements.version.value,author_id:L().user.id}).select('id').single());window.dispatchEvent(new Event('foamlab:activity'));window.dispatchEvent(new CustomEvent('foamlab:town-post',{detail:{kind:'thread'}}));back=()=>show('forum');guard(TABS.thread,r.id);}catch(error){f.querySelector('.form-status').textContent=error.message;b.disabled=false;}};},
  async thread(host,id){const thread=check(await L().client.from('foamlab_threads').select('*').eq('id',id).neq('status','hidden').maybeSingle());if(!thread){host.innerHTML=backButton()+empty('讨论不存在或已隐藏。');return;}await L().names([thread.author_id]);
   const me=L().user,mine=me?.id===thread.author_id;
   host.innerHTML=`${backButton('返回问诊大厅')}<article class="lab-topic tb-topic"><span class="pill">${E(thread.category)} · ${E(thread.version)}</span><h2>${E(thread.title)}</h2><div class="article-meta community-byline">${L().authorMeta(thread)}<span class="tb-status is-${E(thread.status)}">${STATUS[thread.status]||''}</span></div><div class="prose">${L().markdown(thread.body)}</div>${mine&&thread.status!=='closed'?`<button type="button" class="tb-secondary" data-tb="resolve">${thread.status==='resolved'?'重新打开问题':'标记问题已解决'}</button>`:''}</article><section class="lab-comments tb-comments" id="tb-replies"><h3>回答与讨论 <small>与网站同步</small></h3></section><p class="tb-actions"><a class="button secondary" href="/community/?topic=${encodeURIComponent(id)}">在讨论中心打开 ↗</a></p>`;
   host.querySelector('[data-tb=resolve]')?.addEventListener('click',async e=>{const b=e.currentTarget;b.disabled=true;try{if(thread.accepted_message_id&&thread.status==='resolved')check(await L().client.rpc('foamlab_accept_answer',{thread_id:id,message_id:null}));else check(await L().client.from('foamlab_threads').update({status:thread.status==='resolved'?'open':'resolved'}).eq('id',id));guard(TABS.thread,id);}catch(error){window.foamNotify?.(error.message);b.disabled=false;}});
   const replies=host.querySelector('#tb-replies'),decorate=()=>acceptControls(replies,thread,()=>guard(TABS.thread,id));
   const onMessages=()=>{if(!replies.isConnected){window.removeEventListener('foamlab:messages',onMessages);return;}decorate();};window.addEventListener('foamlab:messages',onMessages);
   await L().messages(replies,{thread_id:id},thread.status!=='closed');decorate();},
  async 'hospital:clinic'(host){const solved=store.get('foamlab.town.clinic.'+uid(),[]);const daily=CLINIC[Math.abs([...today()].reduce((a,c)=>a*31+c.charCodeAt(0),7))%CLINIC.length];
   host.innerHTML=`<div class="tb-clinic-head"><div><h3>今日病例</h3><p>读一段真实形式的报错，判断最可能的原因。已会诊 <b>${solved.length}/${CLINIC.length}</b> 例。</p></div></div><div class="tb-case-slot"></div><h4>全部病例</h4><div class="tb-case-list">${CLINIC.map(c=>`<button type="button" data-tb="case" data-id="${c[0]}" class="${solved.includes(c[0])?'is-solved':''}"><code>${E(c[1].split('\n').find(l=>l.trim()&&!l.startsWith('-->'))||c[1])}</code>${solved.includes(c[0])?'<i>✓</i>':''}</button>`).join('')}</div><p class="tb-note-small">日志为节选，路径与数字是示例；遇到真实问题，带上完整日志去问诊大厅提问。</p>`;
   const slot=host.querySelector('.tb-case-slot'),drawCase=c=>{slot.innerHTML=`<article class="tb-case"><pre class="tb-log">${E(c[1])}</pre><p><strong>最可能的原因是？</strong></p><div class="tb-options">${c[2].map((o,i)=>`<button type="button" data-i="${i}">${E(o)}</button>`).join('')}</div><div class="tb-verdict" hidden></div></article>`;
    slot.querySelectorAll('.tb-options button').forEach(b=>b.onclick=()=>{const ok=Number(b.dataset.i)===c[3];void window.FoamTownEggs?.event('clinic',{id:c[0],choice:Number(b.dataset.i)}).catch(()=>{});slot.querySelectorAll('.tb-options button').forEach(x=>{x.disabled=true;x.classList.toggle('is-right',Number(x.dataset.i)===c[3]);});if(!ok)b.classList.add('is-wrong');const v=slot.querySelector('.tb-verdict');v.hidden=false;v.innerHTML=`<p><strong>${ok?'诊断正确！':'再想想：'}</strong>${E(c[4])}</p><p><strong>治疗方案：</strong>${E(c[5])}</p><a class="tb-link" href="${E(c[6])}">查看相关说明 →</a>`;if(ok&&!solved.includes(c[0])){solved.push(c[0]);store.set('foamlab.town.clinic.'+uid(),solved);window.dispatchEvent(new CustomEvent('foamlab:town-learn',{detail:{kind:'clinic'}}));host.querySelector('.tb-clinic-head b').textContent=solved.length+'/'+CLINIC.length;}});};
   drawCase(daily);host.querySelectorAll('[data-tb=case]').forEach(b=>b.onclick=()=>{drawCase(CLINIC.find(c=>c[0]===b.dataset.id));slot.scrollIntoView({block:'nearest'});});},
  async 'school:map'(host){const rows=check(await contentQuery(['lesson']).order('sort_order').order('created_at',{ascending:false}).range(0,999));const core=TRACKS.map(([id,label])=>({id,label,rows:rows.filter(r=>r.track===id)})).filter(t=>t.rows.length);const other=[...new Set(rows.map(r=>r.track).filter(t=>t&&!TRACKS.some(x=>x[0]===t)))];
   host.innerHTML=`<p class="tb-intro">六间教室对应基础课程的六个部分。点一讲就能在小镇里阅读，评论与网站同步。</p><div class="tb-rooms">${core.map((t,i)=>`<section class="tb-room"><header><b>${i+1}</b><h3>${E(t.label)}</h3><small>${t.rows.length} 讲</small></header><ol>${t.rows.map(r=>`<li><button type="button" data-tb="read" data-slug="${E(r.slug)}">${E(r.title)}</button></li>`).join('')}</ol></section>`).join('')||empty('课程正在整理中。')}</div>${other.length?`<details class="tb-more"><summary>更多专栏（${other.length}）</summary>${other.map(t=>`<h4>${E(t)}</h4><ol>${rows.filter(r=>r.track===t).map(r=>`<li><button type="button" data-tb="read" data-slug="${E(r.slug)}">${E(r.title)}</button></li>`).join('')}</ol>`).join('')}</details>`:''}`;},
  async 'workshop:lessons'(host){const rows=check(await contentQuery(['lesson']).eq('track','几何与网格').order('sort_order').range(0,199));host.innerHTML=`<p class="tb-intro">网格相关的课程。在工坊里读完，可以直接去实验台试一试。</p>${cards(rows,{empty:'网格课程正在整理中。'})}`;},
  async 'workshop:tools'(host){host.innerHTML=`<p class="tb-intro">工坊墙上挂着的工具。点开查看完整的命令说明。</p><div class="tb-tools">${MESH_TOOLS.map(([n,d,h])=>`<a class="tb-tool" href="${h}"><code>${n}</code><span>${E(d)}</span></a>`).join('')}</div>`;},
  async 'workshop:bench'(host){const s=store.get('foamlab.town.bench',{n:20,gx:1,gy:1});
   host.innerHTML=`<div class="tb-bench"><div class="tb-bench-controls"><h3>方腔的 blockMeshDict</h3><label><span>每个方向的单元数 <b data-out="n"></b></span><input type="range" min="5" max="60" step="1" name="n" value="${s.n}"></label><label><span>x 方向分级 simpleGrading <b data-out="gx"></b></span><input type="range" min="-10" max="10" step="1" name="gx" value="${Math.round(Math.log2(s.gx)*5)}"></label><label><span>y 方向分级 <b data-out="gy"></b></span><input type="range" min="-10" max="10" step="1" name="gy" value="${Math.round(Math.log2(s.gy)*5)}"></label><pre class="tb-dict"></pre><dl class="tb-stats"></dl></div><figure class="tb-bench-mesh"><svg viewBox="-8 -8 256 256" aria-label="网格预览"></svg><figcaption>顶盖（movingWall）以 1 m/s 向右运动；边长 0.1 m。分级比 = 最后一个单元与第一个单元的尺寸比。</figcaption></figure></div>`;
   const form=host.querySelector('.tb-bench-controls'),svg=host.querySelector('svg'),dict=host.querySelector('.tb-dict'),stats=host.querySelector('.tb-stats');
   const edges=(n,r)=>{const q=n>1?Math.pow(r,1/(n-1)):1;let sizes=[...Array(n)].map((_,i)=>Math.pow(q,i));const sum=sizes.reduce((a,b)=>a+b,0);sizes=sizes.map(x=>x/sum);const out=[0];for(const x of sizes)out.push(out.at(-1)+x);return{out,min:Math.min(...sizes)};};
   const draw=()=>{const n=Number(form.querySelector('[name=n]').value),gx=Math.pow(2,Number(form.querySelector('[name=gx]').value)/5),gy=Math.pow(2,Number(form.querySelector('[name=gy]').value)/5),fx=edges(n,gx),fy=edges(n,gy),f=v=>Number(v.toPrecision(3));store.set('foamlab.town.bench',{n,gx,gy});
    form.querySelector('[data-out=n]').textContent=n;form.querySelector('[data-out=gx]').textContent=f(gx);form.querySelector('[data-out=gy]').textContent=f(gy);
    svg.innerHTML=`<rect x="0" y="0" width="240" height="240" fill="var(--tb-mesh-fill)" stroke="var(--tb-mesh-line)" stroke-width="2"/>${fx.out.slice(1,-1).map(x=>`<line x1="${(x*240).toFixed(2)}" y1="0" x2="${(x*240).toFixed(2)}" y2="240"/>`).join('')}${fy.out.slice(1,-1).map(y=>`<line x1="0" y1="${(240-y*240).toFixed(2)}" x2="240" y2="${(240-y*240).toFixed(2)}"/>`).join('')}<path d="M10 -4H230" stroke="#e0644f" stroke-width="3" marker-end="url(#tb-arrow)"/><defs><marker id="tb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#e0644f"/></marker></defs>`;
    dict.textContent=`scale 0.1;\n\nvertices\n(\n    (0 0 0) (1 0 0) (1 1 0) (0 1 0)\n    (0 0 0.1) (1 0 0.1) (1 1 0.1) (0 1 0.1)\n);\n\nblocks\n(\n    hex (0 1 2 3 4 5 6 7) (${n} ${n} 1) simpleGrading (${f(gx)} ${f(gy)} 1)\n);`;
    const dx=0.1*Math.min(fx.min,fy.min),co=1*0.005/dx,dt=Math.min(0.005,dx/1);
    stats.innerHTML=`<div><dt>单元数 nCells</dt><dd>${n*n}</dd></div><div><dt>最小单元尺寸</dt><dd>${f(dx*1000)} mm</dd></div><div class="${co>1?'is-warn':''}"><dt>按 deltaT = 0.005 s 估算的最大 Courant 数</dt><dd>${f(co)}${co>1?' · 偏大':''}</dd></div><div><dt>让 Co ≤ 1 的 deltaT</dt><dd>≤ ${f(dt)} s</dd></div>`;};
   form.addEventListener('input',draw);draw();
   host.insertAdjacentHTML('beforeend',`<p class="tb-note-small">估算用 Co = U·Δt/Δx，取顶盖速度 U = 1 m/s。v2512 自带算例是 20×20×1、deltaT = 0.005 s，真实运行的最大 Courant 数约为 0.85。</p>`);},
  async run(host){return window.FoamTownTraining.render(host,ctx.kind,goTo);},
  async board(host){return window.FoamTownBoard.render(host,ctx.province);},
  async shop(host){return window.FoamTownProgress.shop(host);},
  'gallery:run':null,
  async 'school:quiz'(host){const key='foamlab.town.quiz.'+uid(),record=store.get(key,{days:{},streak:0,last:null}),dayIndex=Math.abs([...today()].reduce((a,c)=>a*33+c.charCodeAt(0),11))%QUIZ.length;let index=dayIndex,practice=false;
   const draw=()=>{const q=QUIZ[index],answered=!practice&&record.days[today()];host.innerHTML=`<div class="tb-quiz"><header><span>${practice?'练习模式':'今天的题目'}</span><b>连续答对 ${record.streak} 天</b></header><h3>${E(q[0])}</h3><div class="tb-options">${q[1].map((o,i)=>`<button type="button" data-i="${i}">${String.fromCharCode(65+i)}. ${E(o)}</button>`).join('')}</div><div class="tb-verdict" hidden></div><div class="tb-run-actions"><button type="button" data-tb="practice">${practice?'再来一题':'换一题练习'}</button></div></div>`;
    const reveal=(pick)=>{host.querySelectorAll('.tb-options button').forEach(x=>{x.disabled=true;x.classList.toggle('is-right',Number(x.dataset.i)===q[2]);if(Number(x.dataset.i)===pick&&pick!==q[2])x.classList.add('is-wrong');});const v=host.querySelector('.tb-verdict');v.hidden=false;v.innerHTML=`<p><strong>${pick===q[2]?'答对了！':'正确答案是 '+String.fromCharCode(65+q[2])+'。'}</strong>${E(q[3])}</p><a class="tb-link" href="${E(q[4])}">查看相关说明 →</a>`;};
    if(answered)reveal(answered.pick);
    host.querySelectorAll('.tb-options button').forEach(b=>b.onclick=()=>{const pick=Number(b.dataset.i);if(!practice&&!record.days[today()]){const ok=pick===q[2];const y=new Date();y.setDate(y.getDate()-1);const yk=`${y.getFullYear()}-${y.getMonth()+1}-${y.getDate()}`;record.streak=ok?(record.last===yk&&record.lastOk?record.streak+1:1):0;record.last=today();record.lastOk=ok;record.days={[today()]:{pick,ok}};store.set(key,record);if(ok)window.dispatchEvent(new CustomEvent('foamlab:town-learn',{detail:{kind:'quiz'}}));}reveal(pick);host.querySelector('header b').textContent='连续答对 '+record.streak+' 天';});
    host.querySelector('[data-tb=practice]').onclick=()=>{practice=true;let next;do{next=Math.floor(Math.random()*QUIZ.length);}while(next===index&&QUIZ.length>1);index=next;draw();};};draw();},
  async 'library:search'(host,q=''){host.innerHTML=`<form class="tb-toolbar" role="search"><input type="search" class="tb-search" name="q" placeholder="例如：snappyHexMesh、壁面函数、fvSolution" aria-label="全站检索" value="${E(q)}" maxlength="120"><button type="submit" class="tb-primary">检索</button></form><div class="tb-results">${q?'<div class="tb-loading"><span></span>正在检索…</div>':`<div class="tb-suggest"><p>常用检索：</p>${['blockMesh','checkMesh','边界条件','湍流模型','并行计算','后处理','fvSchemes','y+'].map(w=>`<button type="button" data-q="${E(w)}">${E(w)}</button>`).join('')}</div>`}</div>`;
   const form=host.querySelector('form');form.onsubmit=e=>{e.preventDefault();const v=form.elements.q.value.trim();if(v)TABS['library:search'](host,v);};host.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>TABS['library:search'](host,b.dataset.q));if(!q)return;
   const results=host.querySelector('.tb-results');try{const rows=check(await L().client.rpc('foamlab_search_content_context',{query:q}))||[];const kinds={lesson:'课程',course:'课程',article:'文章',log:'笔记',resource:'资料',tool:'工具',module:'模块',announcement:'公告',assignment:'作业',reference:'参考'};
    await window.FoamDirectory?.ready;
    if(!results.isConnected)return;
    results.replaceChildren();
    if(!rows.length)results.innerHTML=empty('没有找到相关内容，换个关键词试试。');
    const list=document.createElement('div');list.className='tb-hits';results.append(list);
    for(const r of rows){const preview=window.FoamSearch.card({...r,kind:kinds[r.kind]||r.kind,url:'/read/?slug='+encodeURIComponent(r.slug)},q);if(!preview)continue;const button=document.createElement('button');button.type='button';button.className='search-hit';button.dataset.tb='read';button.dataset.slug=r.slug;button.style.cssText='width:100%;text-align:left';button.append(...preview.childNodes);list.append(button);}
}catch(error){results.innerHTML=empty('暂时无法检索：'+error.message);}},
  'library:knowledge'(host){window.FoamTownPlay.mountCollection(host);},
  async 'library:shelf'(host){const rows=check(await contentQuery(['resource','recommendation']).order('sort_order').order('created_at',{ascending:false}).range(0,299));if(ctx.kind!=='library'||tab!=='shelf'||host!==view())return;const tracks=[...new Set(rows.map(r=>r.track).filter(Boolean))];
   host.innerHTML=`<div class="tb-chips">${['全部',...tracks].map((t,i)=>`<button type="button" data-shelf="${E(t)}" aria-pressed="${!i}">${E(t)}</button>`).join('')}</div><div class="tb-shelf"></div>`;const shelf=host.querySelector('.tb-shelf'),draw=t=>{shelf.innerHTML=cards(rows.filter(r=>t==='全部'||r.track===t),{empty:'书架上还没有资料。'});};draw('全部');host.querySelectorAll('[data-shelf]').forEach(b=>b.onclick=()=>{host.querySelectorAll('[data-shelf]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw(b.dataset.shelf);});},
  async 'gallery:images'(host){await window.FoamTownGallery.render(host);},
  async 'gallery:works'(host){const rows=check(await contentQuery(['article','log']).order('created_at',{ascending:false}).range(0,119)).filter(r=>r.track!=='熊猫小镇');await L().names(rows.map(r=>r.author_id));
   host.innerHTML=`<p class="tb-intro">大家的计算案例、技术文章和研究笔记。读完可以直接在这里评论。</p>${cards(rows,{cover:true,cls:'is-gallery',empty:'展览馆还在布展，欢迎投稿。',meta:r=>E((L().authorMeta(r).match(/<strong>(.*?)<\/strong>/)?.[1])||'社区成员')+' · '+date(r.published_at||r.created_at)})}<p class="tb-actions"><a class="button secondary" href="/studio/">我也要投稿 ↗</a></p>`;},
  async 'spot:story'(host){await reader(host,'town-landmark-'+ctx.spot);},
  async 'institute:members'(host){const members=ctx.members||[];host.innerHTML=members.length?`<div class="tb-members">${members.map(m=>`<a class="tb-member" href="#${E(ctx.province)}/house/${E(m.user_id)}"><strong>${E(m.name)}</strong><small>Lv.${E(m.level)} · ${E(m.title||'')}</small></a>`).join('')}</div>`:empty('研究所里暂时没有成员。');},
 };
 TABS['gallery:run']=TABS.run;TABS['school:run']=TABS.run;TABS['workshop:run']=TABS.run;
 function acceptControls(host,thread,refresh){const me=L().user,eligible=me&&(me.id===thread.author_id||L().role==='admin');
  host.querySelectorAll('[data-message-id]').forEach(el=>{el.querySelectorAll('.town-accepted,[data-town-accept]').forEach(b=>b.remove());const accepted=el.dataset.messageId===thread.accepted_message_id;el.classList.toggle('is-accepted',accepted);const meta=el.querySelector('.lab-message-meta');if(!meta)return;
   if(accepted){const badge=document.createElement('span');badge.className='town-accepted';badge.textContent='✓ 已采纳';meta.append(badge);}
   if(!eligible||el.dataset.authorId===thread.author_id||!['open','resolved'].includes(thread.status))return;const b=document.createElement('button');b.type='button';b.className='text-button';b.dataset.townAccept='';b.textContent=accepted?'取消采纳':'采纳回答';
   b.onclick=async()=>{if(accepted&&!confirm('取消采纳这条回答？仅撤回采纳奖励。'))return;b.disabled=true;try{check(await L().client.rpc('foamlab_accept_answer',{thread_id:thread.id,message_id:accepted?null:el.dataset.messageId}));refresh();}catch(error){window.foamNotify?.(error.message);b.disabled=false;}};meta.append(b);});}
 /* Clicks inside a building: read an item, go back. */
 document.addEventListener('click',e=>{const box=e.target.closest('.tb');if(!box)return;const b=e.target.closest('[data-tb]');if(!b)return;
  if(b.dataset.tb==='tab'){show(b.dataset.tab);return;}
  if(b.dataset.tb==='back'){(back||(()=>show(tab)))();return;}
  if(b.dataset.tb==='read'){e.preventDefault();detail(reader,b.dataset.slug);}});
 window.FoamTownBuildings={open,runState,RUN,NAMES,goTo:kind=>ctx?goTo(kind):null};
})();
