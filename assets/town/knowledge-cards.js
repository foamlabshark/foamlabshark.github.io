/* OpenFOAM v2512 town knowledge cards. Locked cards are concealed by the UI. */
window.FoamTownCards = [
  {
    "id": "blockmesh",
    "title": "blockMesh",
    "text": "读取 system/blockMeshDict，按“块”生成六面体网格。方腔、管道这类规则几何最常用它。",
    "href": "/commands/blockmesh/",
    "rarity": "common"
  },
  {
    "id": "checkmesh",
    "title": "checkMesh",
    "text": "检查网格质量，报告非正交性、偏斜度等指标，帮助发现需要改进的网格。",
    "href": "/commands/checkmesh/",
    "rarity": "common"
  },
  {
    "id": "snappy",
    "title": "snappyHexMesh",
    "text": "在背景六面体网格上按 STL 几何切割、贴合表面，并可以添加边界层。",
    "href": "/commands/snappyhexmesh/",
    "rarity": "common"
  },
  {
    "id": "decompose",
    "title": "decomposePar",
    "text": "按 system/decomposeParDict 把算例切分成 processor* 目录，用于并行计算。",
    "href": "/commands/decomposepar/",
    "rarity": "common"
  },
  {
    "id": "reconstruct",
    "title": "reconstructPar",
    "text": "把各个 processor* 目录里的结果合并回单个算例，方便后处理。",
    "href": "/commands/reconstructpar/",
    "rarity": "common"
  },
  {
    "id": "setfields",
    "title": "setFields",
    "text": "按 system/setFieldsDict 给指定区域设置初始场值，两相流的初始液面常用它。",
    "href": "/commands/setfields/",
    "rarity": "common"
  },
  {
    "id": "icofoam",
    "title": "icoFoam",
    "text": "不可压、层流、瞬态求解器，经典的方腔算例就用它。",
    "href": "/commands/icofoam/",
    "rarity": "common"
  },
  {
    "id": "simplefoam",
    "title": "simpleFoam",
    "text": "不可压稳态求解器，使用 SIMPLE 算法，常配合湍流模型计算外流和内流。",
    "href": "/commands/simplefoam/",
    "rarity": "common"
  },
  {
    "id": "pimplefoam",
    "title": "pimpleFoam",
    "text": "不可压瞬态求解器，PIMPLE 结合 PISO 与 SIMPLE 的迭代。时间步仍要按稳定性与时间精度要求选择。",
    "href": "/commands/pimplefoam/",
    "rarity": "common"
  },
  {
    "id": "interfoam",
    "title": "interFoam",
    "text": "基于 VOF 方法的两相不可压求解器，溃坝算例 damBreak 用的就是它。",
    "href": "/commands/interfoam/",
    "rarity": "common"
  },
  {
    "id": "foamtovtk",
    "title": "foamToVTK",
    "text": "把结果转换为 VTK 格式，方便在其他可视化软件中查看。",
    "href": "/commands/foamtovtk/",
    "rarity": "common"
  },
  {
    "id": "postprocess",
    "title": "postProcess",
    "text": "计算结束后对已保存的时刻运行函数对象，例如 postProcess -func vorticity。",
    "href": "/commands/postprocess/",
    "rarity": "common"
  },
  {
    "id": "mapfields",
    "title": "mapFields",
    "text": "把一个算例的场映射到另一套网格上，常用来为新计算提供初始值。",
    "href": "/commands/mapfields/",
    "rarity": "common"
  },
  {
    "id": "toposet",
    "title": "topoSet",
    "text": "按几何条件选出单元、面或点的集合，还可以转换成 cellZone 供其他设置使用。",
    "href": "/commands/toposet/",
    "rarity": "common"
  },
  {
    "id": "foamdict",
    "title": "foamDictionary",
    "text": "在命令行读取或修改字典条目，适合写脚本批量调整参数。",
    "href": "/commands/foamdictionary/",
    "rarity": "common"
  },
  {
    "id": "foammonitor",
    "title": "foamMonitor",
    "text": "用 gnuplot 实时画出 postProcessing 中的数据文件，例如残差曲线。",
    "href": "/commands/foammonitor/",
    "rarity": "common"
  },
  {
    "id": "controldict",
    "title": "controlDict",
    "text": "控制开始与结束时间、时间步长和写出频率，函数对象也在这里加载。",
    "href": "/dictionaries/system-controldict/",
    "rarity": "common"
  },
  {
    "id": "fvschemes",
    "title": "fvSchemes",
    "text": "规定各项的离散格式：时间项、梯度项、对流项、拉普拉斯项等。",
    "href": "/dictionaries/system-fvschemes/",
    "rarity": "common"
  },
  {
    "id": "fvsolution",
    "title": "fvSolution",
    "text": "设置线性求解器与容差，以及 SIMPLE、PISO、PIMPLE 的算法参数和松弛因子。",
    "href": "/dictionaries/system-fvsolution/",
    "rarity": "common"
  },
  {
    "id": "courant",
    "title": "Courant 数",
    "text": "Courant 数衡量一个时间步内流动穿过多少网格。允许值取决于算法与精度要求；自适应步长还需开启 adjustTimeStep。",
    "href": "/function-objects/courantno/",
    "rarity": "common"
  },
  {
    "id": "yplus",
    "title": "y⁺",
    "text": "壁面第一层网格的无量纲距离。壁面函数和低雷诺数处理对它的要求不同。",
    "href": "/function-objects/yplus/",
    "rarity": "common"
  },
  {
    "id": "forcecoeffs",
    "title": "forceCoeffs",
    "text": "计算阻力、升力和力矩系数，需要给出参考速度、参考长度和参考面积。",
    "href": "/function-objects/forcecoeffs/",
    "rarity": "common"
  },
  {
    "id": "probes",
    "title": "probes",
    "text": "在指定的点上记录场值随时间的变化，适合观察振荡和收敛。",
    "href": "/function-objects/probes/",
    "rarity": "common"
  },
  {
    "id": "fieldaverage",
    "title": "fieldAverage",
    "text": "对场做时间平均。开始统计前，最好先跳过初始的过渡阶段。",
    "href": "/function-objects/fieldaverage/",
    "rarity": "common"
  },
  {
    "id": "q",
    "title": "Q 准则",
    "text": "Q > 0 表示旋转强于应变。画 Q 的正值等值面，可以看到涡结构。",
    "href": "/function-objects/q/",
    "rarity": "common"
  },
  {
    "id": "wallshear",
    "title": "wallShearStress",
    "text": "计算壁面剪切应力。不可压缩算例的结果已经除以密度。",
    "href": "/function-objects/wallshearstress/",
    "rarity": "common"
  },
  {
    "id": "kinematic",
    "title": "运动压力",
    "text": "不可压缩求解器中的 p 是压力除以密度，单位是 m²/s²，不是 Pa。",
    "href": "/commands/icofoam/",
    "rarity": "common"
  },
  {
    "id": "zero",
    "title": "0 目录",
    "text": "存放初始条件和边界条件，每个场一个文件，例如 0/U 和 0/p。",
    "href": "/read/?slug=first-cavity-result",
    "rarity": "common"
  },
  {
    "id": "parallel",
    "title": "-parallel",
    "text": "并行运行写作 mpirun -np 4 求解器 -parallel。忘了加 -parallel，四个进程会各自算一遍。",
    "href": "/commands/decomposepar/",
    "rarity": "common"
  },
  {
    "id": "converge",
    "title": "收敛判断",
    "text": "稳态计算不只看残差下降，还要看关心的量（如力系数）是否已经稳定。",
    "href": "/function-objects/forcecoeffs/",
    "rarity": "common"
  },
  {
    "id": "renumber",
    "title": "renumberMesh",
    "text": "重新编号网格可改善矩阵带宽。使用 -overwrite 时会覆盖当前网格，运行前先备份。",
    "href": "/commands/renumbermesh/",
    "rarity": "common"
  },
  {
    "id": "merge",
    "title": "mergeMeshes",
    "text": "把另一套网格加入当前算例；合并网格不等于自动连接两个区域的接口。",
    "href": "/commands/mergemeshes/",
    "rarity": "common"
  },
  {
    "id": "transform",
    "title": "transformPoints",
    "text": "平移、旋转或缩放网格坐标。缩放几何后，还要检查物性和边界条件是否采用一致的单位。",
    "href": "/commands/transformpoints/",
    "rarity": "common"
  },
  {
    "id": "extrude",
    "title": "extrudeMesh",
    "text": "把已有面网格沿指定方向拉伸成体网格。层数和层间扩张比会改变厚度方向的分辨率。",
    "href": "/commands/extrudemesh/",
    "rarity": "common"
  },
  {
    "id": "features",
    "title": "surfaceFeatureExtract",
    "text": "从表面几何提取特征边，为 snappyHexMesh 保留尖角和棱边提供依据。",
    "href": "/commands/surfacefeatureextract/",
    "rarity": "common"
  },
  {
    "id": "surfacecheck",
    "title": "surfaceCheck",
    "text": "先检查三角面片的连通性、开口和几何范围，再生成体网格，更容易定位几何问题。",
    "href": "/commands/surfacecheck/",
    "rarity": "common"
  },
  {
    "id": "subset",
    "title": "subsetMesh",
    "text": "按 cellSet 或 cellZone 提取子网格。切割出的新边界需要重新核对边界条件。",
    "href": "/commands/subsetmesh/",
    "rarity": "common"
  },
  {
    "id": "createpatch",
    "title": "createPatch",
    "text": "从已有边界或面集合建立新的 patch。它修改边界分组，不能代替体网格生成。",
    "href": "/commands/createpatch/",
    "rarity": "common"
  },
  {
    "id": "listtimes",
    "title": "foamListTimes",
    "text": "列出算例中的时间目录，可按时间范围筛选。带删除选项前应先确认选中的目录。",
    "href": "/commands/foamlisttimes/",
    "rarity": "common"
  },
  {
    "id": "parafoam",
    "title": "paraFoam",
    "text": "打开算例进行可视化。进入 ParaView 后仍需选择要读取的场，并点击 Apply。",
    "href": "/commands/parafoam/",
    "rarity": "common"
  },
  {
    "id": "wmake",
    "title": "wmake",
    "text": "根据 Make/files 和 Make/options 编译程序。源文件列表、头文件路径和链接库缺一不可。",
    "href": "/commands/wmake/",
    "rarity": "common"
  },
  {
    "id": "wclean",
    "title": "wclean",
    "text": "清理 wmake 生成的中间编译文件。修改编译选项后重新编译，可避免沿用旧的目标文件。",
    "href": "/commands/wclean/",
    "rarity": "common"
  },
  {
    "id": "getdict",
    "title": "foamGetDict",
    "text": "从安装环境中的模板复制字典到算例。复制后还需按自己的几何、场名和计算目标修改参数。",
    "href": "/commands/foamgetdict/",
    "rarity": "common"
  },
  {
    "id": "help",
    "title": "foamHelp",
    "text": "查询求解器、边界条件和函数对象的帮助；先确认当前加载的 OpenFOAM 版本。",
    "href": "/commands/foamhelp/",
    "rarity": "common"
  },
  {
    "id": "search",
    "title": "foamSearch",
    "text": "在算例字典中查找指定条目，适合比较教程里的配置。找到示例后仍要理解它的适用条件。",
    "href": "/commands/foamsearch/",
    "rarity": "common"
  },
  {
    "id": "log",
    "title": "foamLog",
    "text": "从求解日志提取残差等数据。画图前先检查列名和时间轴，避免把不同场的数据混在一起。",
    "href": "/commands/foamlog/",
    "rarity": "common"
  },
  {
    "id": "potential",
    "title": "potentialFoam",
    "text": "求解势流，可为其他流动计算提供初始速度场；它不能描述黏性边界层和真实分离。",
    "href": "/commands/potentialfoam/",
    "rarity": "common"
  },
  {
    "id": "laplacian",
    "title": "laplacianFoam",
    "text": "求解扩散方程，常用来学习固体导热。输入扩散系数时要核对方程采用的物理量和量纲。",
    "href": "/commands/laplacianfoam/",
    "rarity": "common"
  },
  {
    "id": "scalartransport",
    "title": "scalarTransportFoam",
    "text": "在给定速度场中推进被动标量；求解标量不意味着同时求解速度的变化。",
    "href": "/commands/scalartransportfoam/",
    "rarity": "common"
  },
  {
    "id": "srf",
    "title": "SRFSimpleFoam",
    "text": "在单一旋转参考系中求稳态流动。相对速度 Urel 与静止参考系中的速度不是同一个量。",
    "href": "/commands/srfsimplefoam/",
    "rarity": "common"
  },
  {
    "id": "rhocentral",
    "title": "rhoCentralFoam",
    "text": "密度基可压缩求解器，可用于激波等高速流动。时间步仍需满足相应的稳定性要求。",
    "href": "/commands/rhocentralfoam/",
    "rarity": "common"
  },
  {
    "id": "sonicliquid",
    "title": "sonicLiquidFoam",
    "text": "计算可压缩液体的瞬态流动。即使液体密度变化很小，压力波传播也可能很重要。",
    "href": "/commands/sonicliquidfoam/",
    "rarity": "common"
  },
  {
    "id": "mhd",
    "title": "mhdFoam",
    "text": "计算导电流体与磁场的耦合作用。磁场参数和电导率会影响流动中的电磁力。",
    "href": "/commands/mhdfoam/",
    "rarity": "common"
  },
  {
    "id": "electrostatic",
    "title": "electrostaticFoam",
    "text": "求解静电场问题。这里的电势与流动求解器中的压力、面通量要按各自的字段含义区分。",
    "href": "/commands/electrostaticfoam/",
    "rarity": "common"
  },
  {
    "id": "ddtscheme",
    "title": "时间离散",
    "text": "ddtSchemes 决定时间导数的离散方法。切换为高阶格式后，仍需通过减小时间步比较时间离散误差。",
    "href": "/dictionaries/system-fvschemes/",
    "rarity": "common"
  },
  {
    "id": "gradient",
    "title": "梯度格式",
    "text": "gradSchemes 控制单元场梯度的计算。梯度也会参与对流重构和非正交修正。",
    "href": "/dictionaries/system-fvschemes/",
    "rarity": "common"
  },
  {
    "id": "diffusionscheme",
    "title": "扩散离散",
    "text": "laplacianSchemes 同时涉及扩散系数插值与法向梯度处理，不能只看格式名称的第一个词。",
    "href": "/dictionaries/system-fvschemes/",
    "rarity": "common"
  },
  {
    "id": "interpolation",
    "title": "从单元到面",
    "text": "interpolationSchemes 指定场从单元中心插值到面上的方法；面通量计算会用到这种转换。",
    "href": "/dictionaries/system-fvschemes/",
    "rarity": "common"
  },
  {
    "id": "upwind",
    "title": "上风格式",
    "text": "上风格式按流向选择上游值，通常较稳健，但会带来数值扩散。细网格能帮助检验其影响。",
    "href": "/dictionaries/system-fvschemes/",
    "rarity": "common"
  },
  {
    "id": "limited",
    "title": "限制器",
    "text": "限制器在较高精度与抑制非物理振荡之间折中。评价格式时要同时检查极值和空间剖面。",
    "href": "/dictionaries/system-fvschemes/",
    "rarity": "common"
  },
  {
    "id": "linearsolver",
    "title": "矩阵与求解器",
    "text": "选择线性求解器时要考虑矩阵是否对称。时间推进算法与矩阵求解算法属于不同层次。",
    "href": "/dictionaries/system-fvsolution/",
    "rarity": "common"
  },
  {
    "id": "nonorthogonal",
    "title": "非正交修正",
    "text": "非正交修正处理面法向与单元中心连线不对齐的影响。增加修正次数不能代替改善坏网格。",
    "href": "/dictionaries/system-fvsolution/",
    "rarity": "common"
  },
  {
    "id": "relaxation",
    "title": "松弛因子",
    "text": "松弛能减小相邻迭代的更新幅度，帮助某些稳态计算稳定，但过小会拖慢收敛。",
    "href": "/dictionaries/system-fvsolution/",
    "rarity": "common"
  },
  {
    "id": "residualcontrol",
    "title": "residualControl",
    "text": "按指定字段的残差控制算法收敛。除了满足残差阈值，也应检查质量守恒和目标物理量。",
    "href": "/dictionaries/system-fvsolution/",
    "rarity": "common"
  },
  {
    "id": "writeprecision",
    "title": "写出精度",
    "text": "writePrecision 控制文本结果保留的数字位数，它不是线性求解器的残差容差。",
    "href": "/dictionaries/system-controldict/",
    "rarity": "common"
  },
  {
    "id": "restart",
    "title": "从最新时间继续",
    "text": "startFrom latestTime 从已有最新时间目录继续运行。续算前核对最终目录和新 endTime。",
    "href": "/dictionaries/system-controldict/",
    "rarity": "common"
  },
  {
    "id": "dimensions",
    "title": "量纲检查",
    "text": "场文件的 dimensions 按质量、长度、时间等基本量纲给出指数，帮助发现不一致的物理运算。",
    "href": "/dictionaries/system-fvschemes/",
    "rarity": "common"
  },
  {
    "id": "fixedvalue",
    "title": "固定值边界",
    "text": "fixedValue 直接规定边界上的场值。入口速度与壁面温度都可能用它，但物理含义由字段决定。",
    "href": "/dictionaries/system-fvsolution/",
    "rarity": "common"
  },
  {
    "id": "zerogradient",
    "title": "零梯度边界",
    "text": "zeroGradient 规定边界法向梯度为零，并不代表该字段的数值等于零。",
    "href": "/dictionaries/system-fvsolution/",
    "rarity": "common"
  },
  {
    "id": "empty",
    "title": "二维计算的 empty",
    "text": "二维网格厚度方向通常只放一层单元，并给对应前后面使用 empty；场文件与网格边界类型要一致。",
    "href": "/commands/blockmesh/",
    "rarity": "common"
  },
  {
    "id": "symmetry",
    "title": "对称边界",
    "text": "对称面限制法向流动，并对切向量施加相应对称条件。几何和物理条件都对称时才适用。",
    "href": "/commands/blockmesh/",
    "rarity": "common"
  },
  {
    "id": "cyclic",
    "title": "周期边界",
    "text": "cyclic 将一对边界连接，表示空间周期重复。成对面的几何对应关系必须正确。",
    "href": "/commands/createpatch/",
    "rarity": "common"
  },
  {
    "id": "inletoutlet",
    "title": "可能回流的出口",
    "text": "inletOutlet 在流出时采用零梯度，回流时使用指定入口值，适合需要处理反向通量的边界。",
    "href": "/commands/foamhelp/",
    "rarity": "common"
  },
  {
    "id": "noslip",
    "title": "无滑移壁面",
    "text": "静止固壁上的 noSlip 把流体速度设为零；这与无黏流动中的滑移壁面不同。",
    "href": "/commands/icofoam/",
    "rarity": "common"
  },
  {
    "id": "movingwall",
    "title": "运动壁面速度",
    "text": "movingWallVelocity 根据网格边界的运动处理壁面速度，使用前应核对网格运动和参考系。",
    "href": "/commands/pimplefoam/",
    "rarity": "common"
  },
  {
    "id": "codedboundary",
    "title": "codedFixedValue",
    "text": "用 C++ 代码计算固定值边界，可根据坐标和时间生成剖面；它依赖运行时编译环境。",
    "href": "/commands/foamhelp/",
    "rarity": "rare"
  },
  {
    "id": "codestream",
    "title": "#codeStream",
    "text": "在读字典时执行代码并生成条目。初始场中的一次生成，不会自动变成每个时间步都更新。",
    "href": "/programming/",
    "rarity": "rare"
  },
  {
    "id": "codedsource",
    "title": "自定义源项",
    "text": "通过编码源项向离散方程加入作用项，需要核对量纲、作用区域和显隐式处理。",
    "href": "/programming/",
    "rarity": "rare"
  },
  {
    "id": "overset",
    "title": "重叠网格插值",
    "text": "重叠网格通过供体与受体单元交换场值。插值连接并不意味着每个接口都天然严格守恒。",
    "href": "/topics/meshing/",
    "rarity": "rare"
  },
  {
    "id": "ami",
    "title": "滑移接口 AMI",
    "text": "AMI 在两侧不完全匹配的面网格间插值。旋转区域和静止区域可通过它交换信息。",
    "href": "/topics/meshing/",
    "rarity": "rare"
  },
  {
    "id": "mrf",
    "title": "MRF 旋转区域",
    "text": "MRF 在指定区域使用旋转参考系近似，通常不让网格实际转动；它与真实瞬态滑移网格不同。",
    "href": "/dictionaries/constant-mrfproperties/",
    "rarity": "rare"
  },
  {
    "id": "refinement",
    "title": "动态网格加密",
    "text": "按指定场的阈值细化或合并单元，需要同时控制最大单元数、最大层级和细化区域。",
    "href": "/topics/meshing/",
    "rarity": "rare"
  },
  {
    "id": "meshindependence",
    "title": "网格无关性",
    "text": "至少用有层次的网格加密比较同一物理量；单次 checkMesh 通过不能证明结果与网格无关。",
    "href": "/commands/checkmesh/",
    "rarity": "rare"
  },
  {
    "id": "forces",
    "title": "forces 的参考点",
    "text": "力矩依赖所选参考点。比较不同算例的力矩前，要统一参考点、坐标轴和单位。",
    "href": "/function-objects/forces/",
    "rarity": "rare"
  },
  {
    "id": "surfaceintegral",
    "title": "面积分与面求和",
    "text": "surfaceFieldValue 的 areaIntegrate 与 sum 含义不同，必须结合字段量纲判断是否还要乘面积。",
    "href": "/function-objects/surfacefieldvalue/",
    "rarity": "rare"
  },
  {
    "id": "volumeaverage",
    "title": "体积加权平均",
    "text": "volFieldValue 的 volAverage 考虑单元体积，不等于对每个单元值做简单算术平均。",
    "href": "/function-objects/volfieldvalue/",
    "rarity": "rare"
  },
  {
    "id": "vorticity",
    "title": "涡量与旋转",
    "text": "vorticity 计算速度的旋度。强剪切区也可能有很大涡量，识别涡结构时应结合其他指标。",
    "href": "/function-objects/vorticity/",
    "rarity": "rare"
  },
  {
    "id": "lambda2",
    "title": "Lambda2 涡判据",
    "text": "Lambda2 通过速度梯度构造的矩阵特征值识别涡结构，常观察负值区域；阈值应结合流动尺度选择。",
    "href": "/function-objects/lambda2/",
    "rarity": "rare"
  },
  {
    "id": "gradfo",
    "title": "grad 函数对象",
    "text": "grad 可对标量场求梯度，也可对矢量场计算梯度张量。输出类型随输入字段变化。",
    "href": "/function-objects/grad/",
    "rarity": "rare"
  },
  {
    "id": "streamlines",
    "title": "流线不是迹线",
    "text": "稳态流动中流线和质点迹线重合，瞬态流动中通常不同；看图前先明确显示的是哪一种。",
    "href": "/function-objects/streamline/",
    "rarity": "rare"
  },
  {
    "id": "timeaverage",
    "title": "平均时间窗口",
    "text": "场平均的起算时刻和累计时长会影响结果。湍流统计应先避开初始过渡，再检查统计量是否稳定。",
    "href": "/function-objects/fieldaverage/",
    "rarity": "rare"
  },
  {
    "id": "wallunits",
    "title": "近壁分辨率",
    "text": "y⁺ 只是近壁网格检查的一部分，还要关注沿壁面分辨率、层数和增长率。",
    "href": "/function-objects/yplus/",
    "rarity": "rare"
  },
  {
    "id": "massbalance",
    "title": "质量守恒核对",
    "text": "检查进出口流量差时，要核对通量方向和质量流量、体积流量的区别。",
    "href": "/function-objects/surfacefieldvalue/",
    "rarity": "rare"
  },
  {
    "id": "pressureunits",
    "title": "压力的量纲",
    "text": "运动学压力、热力学压力与 p_rgh 的含义不同；按文件中的 dimensions 和求解器定义换算。",
    "href": "/commands/foamhelp/",
    "rarity": "rare"
  },
  {
    "id": "boundedness",
    "title": "有界不等于精确",
    "text": "结果没有越过物理上下限，只能说明有界性表现，不能替代网格、时间步和离散误差验证。",
    "href": "/dictionaries/system-fvschemes/",
    "rarity": "rare"
  },
  {
    "id": "hidden-first-principles",
    "title": "守恒的回声",
    "text": "把每个单元的面通量相加，内部面的相反贡献应互相抵消；这正是有限体积法守恒性的关键。",
    "href": "/topics/finite-volume/",
    "rarity": "hidden"
  },
  {
    "id": "hidden-observer",
    "title": "湖畔观察者",
    "text": "同一份结果可以有不同色标。比较两幅云图时，先统一字段、时间、单位与色标范围。",
    "href": "/commands/parafoam/",
    "rarity": "hidden"
  },
  {
    "id": "hidden-connections",
    "title": "街道之间",
    "text": "求解器、网格、边界与离散格式共同定义计算问题；单独复制其中一份字典，未必能得到同样结果。",
    "href": "/courses/",
    "rarity": "hidden"
  },
  {
    "id": "hidden-daily",
    "title": "竹林晨光",
    "text": "一份可复现的计算记录，应同时保存输入文件、版本、运行命令、日志和比较结果。",
    "href": "/sharing/",
    "rarity": "hidden"
  },
  {
    "id": "hidden-library",
    "title": "知识的边界",
    "text": "当结果出乎预期，先检查量纲、边界、网格和守恒，再调整算法参数，让每一次修改都有依据。",
    "href": "/courses/",
    "rarity": "hidden"
  }
];
