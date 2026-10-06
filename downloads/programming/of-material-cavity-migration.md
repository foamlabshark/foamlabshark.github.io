# cavity2D：OpenCFD OpenFOAM v2512 后处理

本算例已在本机 OpenFOAM v2512 上验证。进入本目录并加载 OpenFOAM 环境后运行：

```sh
# 已有计算结果：采样最新时刻并绘图
sh run_sampling.sh

# 无图形桌面：采样并保存 PNG，不打开窗口、不等待输入
sh run_sampling.sh --no-gui

# 从头计算并后处理（沿用原脚本的清理旧计算结果行为）
sh run_all.sh
# 无图形桌面完整运行
sh run_all.sh --no-gui
```

有图形桌面时保留原来的两个 Qt 对比窗口，按 Enter 关闭。没有 DISPLAY / WAYLAND_DISPLAY 时自动只保存图片。脚本也可从其他目录通过完整路径调用。

## 兼容性修改

- `system/controlDict`：移除 Foundation OpenFOAM 9 的 `cellMinMag.cfg`、`cellMaxMag.cfg` 引用；v2512 不提供这两个配置及对应的 `volFieldValue` 操作。
- 先由 `mag` 生成内存中的标量场 `magU = |U|`，再由 `volFieldValue` 统计内部单元的最小值和最大值。保留 `cellMin`、`cellMax`、`cellMinMag`、`cellMaxMag` 四个统计目录及每时间步输出。速度模的输出列名变为 `min(magU)` / `max(magU)`。
- 统计范围仍为内部单元。不能直接对向量逐分量求极值后取模，也不能用包含边界面的统计替代。
- `system/sampleDict`：显式加载 `sampling` 库；两条中心线位于二维网格厚度的中面 `z=0.5`，保留原来的 face 采样、插值方法及速度分量。
- 绘图自动使用最新时刻，不再固定目录 `50`；仍与原有 Ghia 数据比较。
- 运行脚本记录标准错误，任一步失败立即返回非零状态。清理使用 `foamCleanTutorials -no-auto`，保留初始 `0/`，并避免 v2512 默认清理模式在没有 `0.orig/` 时返回 1。

## 输出

- `postProcessing/cellMin/0/volFieldValue.dat`：压力最小值。
- `postProcessing/cellMax/0/volFieldValue.dat`：压力最大值。
- `postProcessing/cellMinMag/0/volFieldValue.dat`：内部单元速度模最小值。
- `postProcessing/cellMaxMag/0/volFieldValue.dat`：内部单元速度模最大值。
- `postProcessing/sampleDict/<最新时刻>/l1_U.xy`：横向中心线，列为 x、Ux、Uy、Uz。
- `postProcessing/sampleDict/<最新时刻>/l2_U.xy`：纵向中心线，列为 y、Ux、Uy、Uz。
- `gnuplot/UX_yline.png`、`gnuplot/UY_xline.png`：两张对比图。
- `log.blockMesh`、`log.checkMesh`、`log.icoFoam`、`log.sampleDict`：运行日志，包含标准错误。

## 验证结果

本算例运行到 `t=50`，网格检查通过；四项统计各输出 1000 个时间步。最终值与直接从 `50/p`、`50/U` 的 400 个内部单元计算的结果一致：

| 量 | t=50 |
| --- | ---: |
| min(p) | -0.348768513 |
| max(p) | 0.744098309 |
| min(|U|) | 0.000143419111 |
| max(|U|) | 0.840486876 |

两条中心线各生成 21 个有效采样点，并成功生成两张 PNG。另在临时副本中验证了完整 `sh run_all.sh --no-gui` 流程、最新时刻为 `2` 时的自动绘图，以及配置错误时求解/后处理立即停止。当前执行环境没有图形桌面，Qt 窗口未进行人工交互验证。

接口依据以本机 v2512 源码与配置为准；相关官方说明：[采样功能对象](https://www.openfoam.com/documentation/user-guide/7-post-processing/7.4-sampling-data)、[原 OpenFOAM 9 的 minMag/maxMag 实现](https://github.com/OpenFOAM/OpenFOAM-9/blob/master/src/functionObjects/field/fieldValues/volFieldValue/volFieldValueTemplates.C)。
