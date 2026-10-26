#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""将 CUDA 中文阅读模块安全接入 foamlabshark.github.io 原仓库。

运行： python install_into_foamlab.py /path/to/foamlabshark.github.io
它只准备本地 git 工作树变更，不会执行 git commit 或 push。
"""
from pathlib import Path
import argparse
import hashlib
import re
import shutil
import sys

MARK_SIDEBAR='// foamlab-cuda: dynamic sidebar entry'
MARK_CARD='// foamlab-cuda: theory course card'

SIDEBAR_JS="""
  // foamlab-cuda: dynamic sidebar entry
  // FoamDirectory.nav() replaces the HTML sidebar from the CMS directory.
  // Restore the static CUDA guide after every rebuild of the sidebar.
  const cudaTheoryGroup=nav.querySelector('[data-nav-section="theory"] > .nav-subgroup');
  if(cudaTheoryGroup&&!cudaTheoryGroup.querySelector('a[href="/cuda/"]')){
   const cudaNavItem=document.createElement('div');
   cudaNavItem.className='nav-group';
   cudaNavItem.dataset.navSection='cuda-guide';
   cudaNavItem.innerHTML='<div class="nav-parent"><a href="/cuda/" class="nav-item nav-subitem"><span>CUDA C++ 编程指南</span></a></div>';
   cudaTheoryGroup.append(cudaNavItem);
  }
"""

CARD_JS="""
    // foamlab-cuda: theory course card
    hub.insertAdjacentHTML('beforeend', '<article class="lab-card"><div class="lab-card-body"><h2><a href="/cuda/">CUDA C++ 编程指南</a></h2><p>CUDA 12.8 中文工作译稿，按章节阅读，保留代码、公式与原书插图；尚需技术审校。</p><a class="button secondary" href="/cuda/">查看课程目录 →</a></div></article>');
"""

def ensure_patch(original, marker, needle, payload, name):
    if marker in original:
        return original,False
    lines=original.splitlines(keepends=True)
    hits=[i for i,line in enumerate(lines) if needle in line]
    if len(hits)!=1:
        raise ValueError(f'{name} 的插入点匹配到 {len(hits)} 处，停止修改。请朋友先检查原站是否更新。')
    i=hits[0]
    eol='\r\n' if '\r\n' in lines[i] else '\n'
    lines.insert(i+1,payload.strip('\n').replace('\n',eol)+eol)
    return ''.join(lines),True

def cache_bust(content,stem,version):
    pattern=r'(/assets/'+re.escape(stem)+r'\\.js\\?v=)[^"\\s<>]+'
    # Python regex literal above uses normal escaped dot/question after compilation.
    pattern=rf'(/assets/{re.escape(stem)}\.js\?v=)[^"\s<>]+'
    out,count=re.subn(pattern,lambda m:m.group(1)+version,content)
    if count!=1:
        raise ValueError(f'theory/index.html 中 {stem}.js 的缓存版本引用有 {count} 处，停止修改')
    return out

def main():
    arg=argparse.ArgumentParser(description=__doc__)
    arg.add_argument('repo_path',help='从 GitHub 克隆的 foamlabshark.github.io 原仓库的本地目录')
    arg.add_argument('--dry-run',action='store_true',help='只进行验证，不写入文件')
    args=arg.parse_args()
    repo=Path(args.repo_path).expanduser().resolve()
    src=Path(__file__).resolve().parent/'cuda'
    required=['theory/index.html','assets/runtime-ui.js','assets/theory-catalog.js']
    for path in required:
        if not (repo/path).is_file():
            raise SystemExit(f'缺少 {repo/path}；请确认这是 foamlabshark.github.io 原仓库根目录。')
    if not (repo/'.git').exists():
        raise SystemExit('目标目录没有 .git。请使用 GitHub Desktop 或 git clone 克隆朋友的原仓库。')
    config=repo/'.git/config'
    # In ordinary clones .git/config contains the repository's origin URL.
    if config.is_file():
        remotes=config.read_text(encoding='utf-8',errors='ignore').lower()
        if 'foamlabshark.github.io' not in remotes:
            raise SystemExit('目标仓库的 git remote 不是 foamlabshark.github.io，停止以免修改错仓库。')
    if not (src/'book/manifest.json').is_file():
        raise SystemExit('找不到 cuda/book/manifest.json，请完整解压交付包。')

    dest_cuda=repo/'cuda'
    if dest_cuda.exists():
        # Treat an existing cuda module as a possible user's own project; do not overwrite it.
        raise SystemExit('原站根目录已有 cuda/ 文件夹，停止，避免覆盖已有内容。请朋友人工确认如何合并。')
    js_path=repo/'assets/runtime-ui.js'
    cat_path=repo/'assets/theory-catalog.js'
    page_path=repo/'theory/index.html'
    js_old=js_path.read_text(encoding='utf-8')
    cat_old=cat_path.read_text(encoding='utf-8')
    page_old=page_path.read_text(encoding='utf-8')
    js,patched_js=ensure_patch(js_old,MARK_SIDEBAR,'nav.innerHTML=townLink+groups.map',SIDEBAR_JS,'runtime-ui.js')
    cat,patched_cat=ensure_patch(cat_old,MARK_CARD,'hub.innerHTML=children.map(row=>',CARD_JS,'theory-catalog.js')
    page=page_old
    original_nav='<div id="nav-children-theory" class="nav-subgroup" hidden>'
    if 'href="/cuda/"' not in page and original_nav in page:
        page=page.replace(original_nav,original_nav+'\n <a class="nav-item nav-subitem" href="/cuda/"><span>CUDA C++ 编程指南</span></a>',1)
    elif original_nav not in page:
        raise SystemExit('原站 theory/index.html 侧边栏结构已变化，需要手动核对。')
    version='cuda-'+hashlib.sha256((js+cat).encode('utf-8')).hexdigest()[:10]
    page=cache_bust(page,'runtime-ui',version)
    page=cache_bust(page,'theory-catalog',version)
    if not all(['href="/cuda/"' in page,MARK_SIDEBAR in js,MARK_CARD in cat]):
        raise SystemExit('接入验证失败，未写入任何文件。')
    print('验证通过：文件可放入原站仓库，且动态侧边栏和课程卡片的接入点都已识别。')
    print('变更：新增 cuda/；修改 assets/runtime-ui.js、assets/theory-catalog.js、theory/index.html。')
    if args.dry_run:
        print('Dry-run：没有写入任何文件。')
        return
    # All content is validated in memory first; the script does not commit/push.
    shutil.copytree(src,dest_cuda)
    js_path.write_text(js,encoding='utf-8')
    cat_path.write_text(cat,encoding='utf-8')
    page_path.write_text(page,encoding='utf-8')
    print('本地接入完成。请在 GitHub Desktop 中检查 Changes，再 Commit、Push。')
    print('部署后的网址：https://foamlabshark.github.io/cuda/ 和 https://foamlabshark.github.io/theory/')

if __name__=='__main__':
    try:main()
    except Exception as exc:
        print('失败：',exc,file=sys.stderr)
        sys.exit(1)
