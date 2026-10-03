insert into public.foamlab_sections(key,name,href,nav_group,sort_order,visible) values('town','熊猫小镇','/town/','资源与社区',585,true) on conflict(key) do nothing;
insert into public.foamlab_content(slug,kind,title,summary,body,track,series,author_name,status,sort_order,comments_enabled,cover_url,metadata,published_at,section_ids) values('town-landmark-dam','article','溃坝水景：水面为什么会翻卷？','水槽一侧的水柱突然失去挡板，水沿底部向前推进，撞上侧壁后再向上翻卷。这个过程同时包含水和空气，界面的位置随时间变化。','![溃坝水景：水面为什么会翻卷？](/assets/town/landmarks/dam.svg)

水槽一侧的水柱突然失去挡板，水沿底部向前推进，撞上侧壁后再向上翻卷。这个过程同时包含水和空气，界面的位置随时间变化。

## 怎样描述水和空气

`interFoam` 使用体积分数描述每个单元里的水量。`alpha.water = 1` 表示单元内充满水，`alpha.water = 0` 表示充满空气；两者之间的数值用于表示穿过单元的水气界面。

算例中的 `system/setFieldsDict` 把初始水柱所在区域设置为水相。`constant/g` 指定重力，`0/U` 给出初始速度和速度边界条件。水柱开始流动后，压力、速度和体积分数会相互影响。

## 看结果时看什么

先观察水柱前缘到达侧壁的时间，再观察回流和界面形状。网格太粗时，水面会显得模糊；时间步太大时，界面的推进也会受影响。可把相同物理时刻的水面轮廓叠在一起比较。

这座小水景对应两相流里常见的溃坝问题。沿着它，可以继续学习 VOF、相分数方程和界面压缩。

## 对应的 v2512 算例

求解器：`interFoam`。安装中的算例目录：

```text
$FOAM_TUTORIALS/multiphase/interFoam/laminar/damBreak/damBreak
```

[继续学习 →](/topics/multiphase/) · [返回熊猫小镇](/town/#map)
','熊猫小镇','街道里的 CFD','FoamLab','published',0,true,'/assets/town/landmarks/dam.svg','{"town_spot": "dam"}'::jsonb,now(),array(select id from public.foamlab_sections where key='town')) on conflict(slug) do nothing;
insert into public.foamlab_content(slug,kind,title,summary,body,track,series,author_name,status,sort_order,comments_enabled,cover_url,metadata,published_at,section_ids) values('town-landmark-wind','article','风力广场：山坡怎样改变风场？','风吹过山坡时，局部速度、流向和湍流强度都会改变。山脊附近可能出现加速区，背风侧则可能产生分离和回流，这些变化会影响风机选址。','![风力广场：山坡怎样改变风场？](/assets/town/landmarks/wind.svg)

风吹过山坡时，局部速度、流向和湍流强度都会改变。山脊附近可能出现加速区，背风侧则可能产生分离和回流，这些变化会影响风机选址。

## 从地形到流场

`turbineSiting` 是稳态不可压缩流动算例。`simpleFoam` 求解平均速度和压力，湍流模型补充平均方程中尚未封闭的雷诺应力项。

计算首先需要覆盖地形的网格。入口速度规定上游来流，地面边界影响近壁速度分布；湍流入口条件则影响来流中扰动的强弱。修改这些条件后，应把测量高度和地形位置一并记录，才便于比较风速。

## 怎样读懂风场

选择与风机轮毂高度相近的水平切面，比较速度大小和流向；再沿山坡画一条竖直剖面，观察近地面速度随高度的变化。

街道上的风机是一处场景装饰。这个教程主要用于学习地形风场和选址问题；叶片载荷、转子运动等研究可以继续使用旋转区域或滑移网格方法。

## 对应的 v2512 算例

求解器：`simpleFoam`。安装中的算例目录：

```text
$FOAM_TUTORIALS/incompressible/simpleFoam/turbineSiting
```

[继续学习 →](/topics/turbulence/) · [返回熊猫小镇](/town/#map)
','熊猫小镇','街道里的 CFD','FoamLab','published',1,true,'/assets/town/landmarks/wind.svg','{"town_spot": "wind"}'::jsonb,now(),array(select id from public.foamlab_sections where key='town')) on conflict(slug) do nothing;
insert into public.foamlab_content(slug,kind,title,summary,body,track,series,author_name,status,sort_order,comments_enabled,cover_url,metadata,published_at,section_ids) values('town-landmark-ship','article','船舶港湾：船行过后为什么会留下波浪？','船体在水中前进时，会改变周围的压力和速度。水面随之升降，在船首、船侧和船尾形成不同的波形。船体受到的力同时包含压力作用和壁面剪切作用。','![船舶港湾：船行过后为什么会留下波浪？](/assets/town/landmarks/ship.svg)

船体在水中前进时，会改变周围的压力和速度。水面随之升降，在船首、船侧和船尾形成不同的波形。船体受到的力同时包含压力作用和壁面剪切作用。

## 把船体放进计算域

`DTCHull` 使用船体几何建立外部流动网格。船体附近和自由液面附近需要足够的分辨率：前者影响壁面作用力，后者影响波面的形状。

`interFoam` 同时处理水和空气；RAS 湍流模型描述平均意义上的湍流作用。读取算例时，可以先找到船体对应的边界名称，再对照速度边界、近壁模型和计算力的 `functions` 配置。

## 波面和阻力一起看

在后处理中，把水相体积分数为 0.5 的等值面作为界面位置的一种常用显示方式。沿船体纵向绘制水面高度，还可以更清楚地比较波峰、波谷的位置。

船体阻力往往要经过一段发展过程才适合统计。把阻力时序和波面同时保存，比只看最后一张云图更容易判断流动是否进入稳定的统计状态。

## 对应的 v2512 算例

求解器：`interFoam`。安装中的算例目录：

```text
$FOAM_TUTORIALS/multiphase/interFoam/RAS/DTCHull
```

[继续学习 →](/topics/multiphase/) · [返回熊猫小镇](/town/#map)
','熊猫小镇','街道里的 CFD','FoamLab','published',2,true,'/assets/town/landmarks/ship.svg','{"town_spot": "ship"}'::jsonb,now(),array(select id from public.foamlab_sections where key='town')) on conflict(slug) do nothing;
insert into public.foamlab_content(slug,kind,title,summary,body,track,series,author_name,status,sort_order,comments_enabled,cover_url,metadata,published_at,section_ids) values('town-landmark-airfoil','article','翼型风廊：升力来自哪里的压力差？','气流绕过翼型后，上下表面的压力分布会发生变化。把压力和剪切应力沿翼型表面积分，就能得到总作用力，再分解成升力和阻力。','![翼型风廊：升力来自哪里的压力差？](/assets/town/landmarks/airfoil.svg)

气流绕过翼型后，上下表面的压力分布会发生变化。把压力和剪切应力沿翼型表面积分，就能得到总作用力，再分解成升力和阻力。

## 攻角怎样进入算例

二维翼型算例通常通过来流方向与翼型弦线的夹角表示攻角。阅读 `0/U` 时，除了速度大小，还要注意速度矢量的方向。改变攻角时，后处理中的升力、阻力方向也需要与新的来流方向对应。

`simpleFoam` 计算稳态不可压缩流动。`system/fvSchemes` 控制空间离散，`system/fvSolution` 设置方程求解和 SIMPLE 迭代。翼型附近的网格密度、壁面法向分辨率和尾迹区域的加密都会影响结果。

## 从云图走向定量比较

压力系数可写为 $C_p=(p-p_\infty)/(\tfrac12\rho U_\infty^2)$。如果输出的 `p` 是运动学压力，则分子使用运动学压力差，分母相应使用 $\tfrac12 U_\infty^2$。

沿翼型表面绘制 $C_p$，比仅凭颜色深浅判断升力更直观。改变网格或格式后，还可以比较升力系数、阻力系数和分离位置。

## 对应的 v2512 算例

求解器：`simpleFoam`。安装中的算例目录：

```text
$FOAM_TUTORIALS/incompressible/simpleFoam/airFoil2D
```

[继续学习 →](/topics/finite-volume/) · [返回熊猫小镇](/town/#map)
','熊猫小镇','街道里的 CFD','FoamLab','published',3,true,'/assets/town/landmarks/airfoil.svg','{"town_spot": "airfoil"}'::jsonb,now(),array(select id from public.foamlab_sections where key='town')) on conflict(slug) do nothing;
insert into public.foamlab_content(slug,kind,title,summary,body,track,series,author_name,status,sort_order,comments_enabled,cover_url,metadata,published_at,section_ids) values('town-landmark-heat','article','散热花园：热量怎样从固体进入空气？','发热物体先通过固体导热把能量传到表面，再由周围流体带走。计算这一过程，需要同时处理固体中的导热和流体中的流动与传热。','![散热花园：热量怎样从固体进入空气？](/assets/town/landmarks/heat.svg)

发热物体先通过固体导热把能量传到表面，再由周围流体带走。计算这一过程，需要同时处理固体中的导热和流体中的流动与传热。

## 一个算例，多个区域

`multiRegionHeater` 把计算域分成流体区和固体区。区域名称记录在 `constant/regionProperties` 中，各区域分别保存自己的网格、物性和场文件。

`chtMultiRegionFoam` 在流体区求解流动和能量方程，在固体区求解导热方程。两侧的接口边界通过温度和热通量联系起来，因此接口的对应关系、材料导热系数和边界条件都需要配套设置。

## 选择哪些量来观察

温度最高的位置决定了局部散热需求；进出口温差和质量流量则可以用于估计流体带走的热量。对比输入热功率、出口能量和壁面传热，还能检查整个系统的能量收支。

增大入口流速通常会改变对流换热，同时也会影响压降。研究散热性能时，可以把温度降低量与流动阻力一起比较。

## 对应的 v2512 算例

求解器：`chtMultiRegionFoam`。安装中的算例目录：

```text
$FOAM_TUTORIALS/heatTransfer/chtMultiRegionFoam/multiRegionHeater
```

[继续学习 →](/courses/) · [返回熊猫小镇](/town/#map)
','熊猫小镇','街道里的 CFD','FoamLab','published',4,true,'/assets/town/landmarks/heat.svg','{"town_spot": "heat"}'::jsonb,now(),array(select id from public.foamlab_sections where key='town')) on conflict(slug) do nothing;
insert into public.foamlab_content(slug,kind,title,summary,body,track,series,author_name,status,sort_order,comments_enabled,cover_url,metadata,published_at,section_ids) values('town-landmark-cavity','article','方腔喷泉：一面运动的墙怎样带动整腔流体？','一个方形腔体装满流体，顶盖沿水平方向运动，其余壁面保持静止。顶盖通过黏性作用带动附近流体，流体沿壁面转弯，逐渐形成回流涡。','![方腔喷泉：一面运动的墙怎样带动整腔流体？](/assets/town/landmarks/cavity.svg)

一个方形腔体装满流体，顶盖沿水平方向运动，其余壁面保持静止。顶盖通过黏性作用带动附近流体，流体沿壁面转弯，逐渐形成回流涡。

## 最适合开始的三个文件

`system/blockMeshDict` 定义方腔的尺寸和网格。`0/U` 把顶盖设置为给定的切向速度，并把静止壁面设置为无滑移条件。`constant/transportProperties` 中的运动黏度决定了黏性扩散的强弱。

`icoFoam` 用于瞬态、层流、不可压缩牛顿流体计算。运行时间、时间步长和结果输出间隔集中在 `system/controlDict` 中。

## 顶盖速度为什么重要

用顶盖速度 $U$、腔长 $L$ 和运动黏度 $\nu$ 定义雷诺数 $Re=UL/\nu$。改变其中一个量，就会改变惯性作用与黏性作用的相对强弱，回流结构也随之变化。

先画速度矢量和流线，找到主涡的位置；再提取中心线上的速度剖面，比较不同网格的结果。这是从“跑通计算”进入“分析计算”的一个小练习。

## 对应的 v2512 算例

求解器：`icoFoam`。安装中的算例目录：

```text
$FOAM_TUTORIALS/incompressible/icoFoam/cavity/cavity
```

[继续学习 →](/start/) · [返回熊猫小镇](/town/#map)
','熊猫小镇','街道里的 CFD','FoamLab','published',5,true,'/assets/town/landmarks/cavity.svg','{"town_spot": "cavity"}'::jsonb,now(),array(select id from public.foamlab_sections where key='town')) on conflict(slug) do nothing;
