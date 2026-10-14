# 传热与传质基础：OpenFOAM v2512 验证程序

本包使用 OpenCFD OpenFOAM v2512 的原生 C++ 有限体积接口，比较温度、归一化浓度的数值解和解析解。五类问题分别提供两级网格，共十个配置完整的串行算例。

## 编译与运行

在 Linux 中安装 OpenCFD OpenFOAM v2512，进入其已加载环境的终端。运行 `foamVersion`，确认输出版本为 v2512。解压本包后，进入包含 Allwmake 的目录：

```bash
sh Allwmake
sh Allrun
python3 check-results.py
```

只运行一个算例：

```bash
cd cases/source-40
sh Allrun
```

Allrun 依次生成网格、检查网格并求解，任一程序报错即停止。重复运行会重写同名日志、history.csv 和 profile.csv。使用 `paraFoam -builtin` 打开某个算例，可查看 T 或 C。程序为串行验证实现，不支持分解并行运行。

## 算例与正文的关系

|目录|正文|物理模型与解析解|
|---|---|---|
|linear-20、linear-40|3.1 平壁导热|定端温、无源，T=400−100x K|
|source-20、source-40|3.5 含内热源的导热|两端300 K，S=0.002 K/s，T=300+100x(1−x) K|
|poisson-20、poisson-40|4.5 有限差分方程的求解|四边300 K，制造解T=300+10sin(πx)sin(πy) K|
|decay-20、decay-40|5.10 有限差分方法|端点300 K，T=300+10sin(πx)exp(−απ²t) K|
|species-20、species-40|14.7 非稳态扩散|端点零，C=sin(πx)exp(−Dπ²t)，C为归一化浓度|

计算域为1 m×1 m×0.01 m，厚度方向一个单元并使用empty。除poisson外，y方向一个单元，两侧绝热；poisson的x、y方向同时加密。扩散系数为1e−5 m²/s。稳态问题组装并收敛求解线性系统一次；非稳态问题完整计算到1000 s，粗网格时间步1 s，细网格0.25 s。

## 文件与参数

|文件|用途|
|---|---|
|applications/heatTheoryFoam/heatTheoryFoam.C|读取场、构造源项、组装扩散方程、计算解析误差与积分收支|
|applications/heatTheoryFoam/Make/|wmake构建配置|
|cases/*/system/heatTheoryDict|mode选择五个验证问题；field为T或C；alpha为热或质量扩散率|
|cases/*/system/blockMeshDict|几何、单元数量和边界面|
|cases/*/system/controlDict|终止时间、时间步、写出频率|
|cases/*/system/fvSchemes|Euler时间离散、Gauss linear corrected扩散离散|
|cases/*/system/fvSolution|PCG+DIC，绝对容差1e−12，relTol为0|
|cases/*/0/T或0/C|场量纲与边界条件|
|verification/*/|此次v2512实际计算的日志、逐步数据与最终剖面|

transient模式从C++解析初值初始化，0目录仍负责指定量纲和边界。五种mode的源项与解析式都在C++中定义，几何长度按1 m构造。若改变长度、初温形状或边界值，须同时修改对应源项和解析式，才能继续使用误差输出。此程序验证标量扩散，不求解流体速度、沸腾界面或辐射输运。

## 结果检查

history.csv每行保存time、rmsError、maxError、mean、initialResidual、finalResidual、balance。均方根误差使用单元体积加权。profile.csv保存x、y、计算值与解析值。log.checkMesh中应有Mesh OK.，log.heatTheoryFoam应正常结束。

温度方程中的balance是温度储存率体积分减去扩散与源项输入，单位K·m³/s。乘以体积热容才成为功率差；归一化浓度方程的对应单位为m³/s。残差、网格误差和收支差分别检验不同问题，三者应一起读取。

steady源项与二维问题的两级网格误差约减少到四分之一。transient算例同时把网格间距减半、时间步减到四分之一，因此不能仅凭这组结果宣称时间格式二阶。线性温度误差已接近求解容差，加密不必继续单调减小。

只使用Python标准库的check-results.py检查各算例终点、日志、误差与积分收支。verification目录保留本次实测数据，可与重新运行产生的结果比较。
