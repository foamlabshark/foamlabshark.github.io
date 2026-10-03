# 小镇像素素材

本轮根据站长确认的像素 RPG 方向制作。建筑、植物、地表和角色素材由内置 imagegen 生成，游戏中的移动、分层、光照与动画由本站代码实现。

## 素材布局

所有文件均放在 `source-openfoam/assets/town/`。透明 PNG 保留原始透明通道，以 CSS 或 SVG 的图集坐标显示，各格不用另行裁剪。

| 文件 | 排列 | 内容 |
| --- | --- | --- |
| buildings-atlas.png | 3 × 2 | 学堂、工坊、医院；图书馆、展览馆、竹屋 |
| homes-atlas.png | 3 × 2 | 砖屋、蘑菇屋、灯塔屋；风洞屋、竹屋、路灯 |
| scenery-atlas.png | 3 × 2 | 树、竹林、入口；公告栏、喷泉、长椅 |
| flora-atlas.png | 3 × 2 | 雏菊、薰衣草、草丛；灌木、蕨类、石头 |
| landmarks-atlas.png | 3 × 2 | 溃坝、风机、船舶；翼型风洞、换热器、方腔喷泉 |
| terrain-atlas.png | 2 × 2 | 草地、土路；水面、石板 |
| panda-walk.png | 4 × 4 | 向下、向左、向上、向右；每个方向四帧 |

实际输出：景物图集为 1536 × 1024；地表与熊猫为 1254 × 1254。布局使用比例坐标，不假定生成图像严格为请求尺寸。

## 生成要求

建筑、景物、植物和景点在原先批准的素材上做风格转换：保留对象、视角和格子位置，统一为清晰的 16 位像素簇、深色轮廓、左上光照、温暖屋顶和苔藓石基。每张图集为三列两行，透明背景，每个对象在自己的格子内留出安全边缘。树木与房屋使用一致的观察角度。

地表生成要求：两列两行的无缝材质图集，依次为柔和橄榄绿草地、砂土道路、蓝绿色水面、带苔藓的石板；每个格子铺满材质，不加入房屋、人物、文字或装饰性边框。草地和道路在页面中以 160 像素重复，石板以 100 像素重复。

熊猫生成要求：透明的四列四行行走图集；向下、向左、向上、向右各占一行，每行四个连续步态；圆脸、短爪、淡腮红、青色小围巾；每帧大小和脚底位置一致。角色显示框为 64 像素，实际身体约 48–55 像素，房屋显示框约 226 像素。

特殊住宅与路灯最终提示词：

> Create a companion 1536 x 1024 transparent PNG sprite atlas matching the supplied original pixel RPG village buildings EXACTLY in pixel density, top-front 3/4 view, rich 16-bit pixel clusters, palette, dark pixel outlines, gentle upper-left light and small mossy foundations. Crisp pixel art, no painting, no text or UI. 3 equal columns by 2 equal rows, each cell 512 square, exactly one centered isolated object per cell with safe margins and same ground baseline. Top row: (1) cozy reddish brick cottage with moss and flowers, (2) adorable red-spotted mushroom-roof cottage, (3) blue-and-white cottage topped by a little lighthouse lantern. Bottom row: (4) compact steel-and-timber wind-tunnel laboratory cottage with a fan sign, (5) bamboo-roof cottage matching green bamboo cottage reference, (6) a SINGLE ornate wooden village STREET LAMP, full height, with dark metal pitched cap, pale amber GLASS (not emitting light), wooden column and small stone base. Do not include a bench or other props in the lamp cell. Building proportions match reference; lamp silhouette thinner but height similar. TRANSPARENT background throughout spaces, no scenery backdrop, no gradient backdrop, no contact shadow outside individual small foundations.

## 昼夜与层级

`town-lighting.js` 默认读取设备当地时间，清晨 05–08 时、白天 08–17 时、傍晚 17–20 时、夜晚 20–05 时；颜色在关键时刻之间连续插值。右上角“光照”可以预览四种状态，也可恢复自动。

地面、道路、植物、建筑与人物位于游戏世界；灯芯和地面光晕单独叠加并共享相机变换，避免被全局夜色一起压暗。夜间亮灯、白天关闭光晕。人物按脚底位置排序。手动关闭动画和系统减少动态效果设置均受支持。

调整建筑位置时，同步使用门口坐标、道路连接和碰撞范围；路灯位置只维护一份，同时生成灯柱、灯芯和地面光晕。

## 道路与占地

公共建筑和十个住宅地块采用错落布局，三条弯曲主路相互连接。建筑离主路保留空隙，门口由短路连接；公告栏按建筑占地参与相同检查。新增研究所会扩展南侧街区。路灯、树木和花草经过主路、支路及建筑占地检查后再放置。长椅图格保留在原图集中，场景不再使用。

`tools/check-town-layout.cjs` 检查满员街道、研究所扩展、通行范围与入口位置；`tools/check-town-game.cjs` 检查行走、交互和昼夜光照。
