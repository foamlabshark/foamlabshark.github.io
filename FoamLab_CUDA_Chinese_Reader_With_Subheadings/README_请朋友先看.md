# 发给 FoamLab 管理员：CUDA 中文编程指南网站接入包

**要上传的目标：** `https://github.com/foamlabshark/foamlabshark.github.io` （朋友的原仓库）

**不是：** `lizhexian336/lizhexian336.github.io` （用户自己的副本）。

本 ZIP 中的 `cuda/` 是独立阅读模块，包含 25 章网页、章节数据和 56 个原书图像。新版阅读器已将各章小标题加入左侧目录，当前阅读章节会自动展开。为了与原站对齐，提供 `install_into_foamlab.py` 自动添加导航和课程卡片的接入脚本。

## 朋友最简单的操作方式（推荐 GitHub Desktop）

1. 用 GitHub Desktop 或 Git 克隆 **原仓库** `foamlabshark/foamlabshark.github.io`，在电脑上确认可看到 `theory/` 和 `assets/`。
2. 解压本 ZIP，确认里面是同级的 `cuda/` 文件夹和 `install_into_foamlab.py`，不要只上传 ZIP 文件。
3. 安装 Python 3（如果电脑已有 Python 则不用）。在解压包所在目录打开命令提示符/终端，运行：

   ```powershell
   python install_into_foamlab.py "C:\你的路径\foamlabshark.github.io" --dry-run
   ```

   如果显示“验证通过”，去掉 `--dry-run` 再运行一次：

   ```powershell
   python install_into_foamlab.py "C:\你的路径\foamlabshark.github.io"
   ```

4. GitHub Desktop 会显示 `cuda/` 新文件及 3 个原站修改文件：
   - `assets/runtime-ui.js`：解决 CMS 动态重绘后 CUDA 左侧入口消失的问题。
   - `assets/theory-catalog.js`：在「基础理论与原理」课程卡片中新增 CUDA 第七张卡片。
   - `theory/index.html`：侧栏静态回退入口及脚本缓存版本更新。
5. **先逐个检查 Changes，再 Commit → Push origin**。建议先创建测试分支、预览后再合并。该脚本本身**不会**自动提交或推送代码。
6. GitHub Pages 部署完成后，访问：
   - `https://foamlabshark.github.io/cuda/`
   - `https://foamlabshark.github.io/cuda/read/?slug=cuda-01`
   - `https://foamlabshark.github.io/theory/`（新增 CUDA 课程卡片；展开左侧理论栏目也能看到入口）

**注意：** `https://foamlabshark.github.io/topics/finite-volume/` 是原站的有限体积法专题页面，并非 CUDA 上传目录。建议将 CUDA 放在独立 `/cuda/`，通过 `/theory/` 链接，保留原站的课程组织结构。

## 如果此前已经上传过旧版 CUDA 页面（本次左侧小标题更新）

如果朋友已经安装了旧版 `/cuda/`，不要再次运行首次安装脚本，因为它会故意阻止覆盖现有目录。请使用新增的 `update_cuda_left_subheadings.py`：

```powershell
python update_cuda_left_subheadings.py "C:\你的路径\foamlabshark.github.io"
```

该更新脚本会检查 Git 仓库 remote 是否指向 `foamlabshark.github.io`，并且只更新这 5 个文件：
- `cuda/index.html`
- `cuda/reader.js`
- `cuda/reader.css`
- `cuda/read/index.html`
- `cuda/book/manifest.json`

它不会更改 25 章正文或原站导航脚本，也不会自动提交/推送。更新后，在 GitHub Desktop 检查变更并提交推送即可。

新左侧目录行为：
- 每章标题旁边有展开/折叠按钮；
- 阅读某章时自动展开该章的小标题；
- 点击小标题跳转到正文对应标题；
- 其他章节的小标题默认收起，避免左侧目录过长。

## 这包做了哪些事

- 独立的 `cuda/` 网页可直接放在 GitHub Pages 仓库根目录，无需新域名或服务器。
- 章节目录、内页、图像、代码及公式均使用 `/cuda/` 绝对路径。
- 左侧目录支持按章节展开小标题；进入章节时自动展开当前章，点击小标题可跳转到正文对应位置。
- 阅读器左侧目录现已支持展开每一章的小标题；阅读章节时会自动展开当前章，并可直接点击小标题跳转到正文对应位置。
- 根据原站最新 `assets/runtime-ui.js` 和 `assets/theory-catalog.js` 的**现有结构**编写了有匹配检查的补丁脚本。原站如果之后改动较大，脚本会报错退出，不会猜测替换位置。
- 不覆盖原站原有六门课程，不触碰数据库、帐号登录或已有 `/read/` 内容。
- 项目自带独立阅读器，界面样式与 FoamLab 接近，但不是原站现有 `/read/?slug=...` 的 Supabase 阅读系统。需要完全融入原站数据系统时须另行开发。

## 上传前需要注意

- **版权/公开发布授权：** 这份翻译源自 NVIDIA 的 CUDA C++ Programming Guide，原书声明对复制、再发布有要求。管理员应先确认具有公开发布这份翻译的合法授权，再把全文提交到公开仓库。
- **译稿质量：** v34 是机器辅助的工作译稿，尚未逐章节技术审校、CUDA 示例也没有全量编译测试；不要标记为官方或最终译本。
- **安全：** 此脚本对朋友本地仓库内的 3 个文本文件做最小修改，并复制 `cuda/` 文件夹；不会访问 GitHub API、不会安装第三方依赖，也不会自动 push。如原仓库已存在 `cuda/`，脚本会停止以免覆盖。
- **缓存：** 部署后如果课程卡片仍显示旧内容，建议按 Ctrl + F5 强制刷新。
