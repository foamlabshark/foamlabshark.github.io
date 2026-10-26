#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""更新已部署的 FoamLab CUDA 阅读器，加入左侧可展开的小标题。

用法：python update_cuda_left_subheadings.py "C:\\path\\foamlabshark.github.io"
此脚本只替换 CUDA 阅读器的 5 个文件，不会提交或推送 Git。
"""
from pathlib import Path
import argparse
import shutil
import sys

FILES = [
    "index.html",
    "reader.js",
    "reader.css",
    "read/index.html",
    "book/manifest.json",
]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo_path", help="本地克隆的 foamlabshark.github.io 仓库根目录")
    args = parser.parse_args()

    repo = Path(args.repo_path).expanduser().resolve()
    package_root = Path(__file__).resolve().parent
    source = package_root / "cuda"

    if not (repo / ".git").exists():
        raise SystemExit("目标目录没有 .git。请先用 GitHub Desktop 克隆 foamlabshark/foamlabshark.github.io。")
    config = repo / ".git" / "config"
    remotes = config.read_text(encoding="utf-8", errors="ignore").lower() if config.is_file() else ""
    if "foamlabshark.github.io" not in remotes:
        raise SystemExit("Git remote 未指向 foamlabshark.github.io。为避免改错仓库，已停止。")
    dest = repo / "cuda"
    if not (dest / "book/manifest.json").is_file():
        raise SystemExit("本地仓库没有已安装的 cuda/book/manifest.json。若是首次安装，请使用 install_into_foamlab.py。")

    for rel in FILES:
        if not (source / rel).is_file():
            raise SystemExit(f"交付包缺少文件：cuda/{rel}")
        if not (dest / rel).is_file():
            raise SystemExit(f"原站缺少 cuda/{rel}。为避免不完整更新，已停止。")

    # Validate all sources and destinations before writing anything.
    changes = []
    for rel in FILES:
        src = source / rel
        dst = dest / rel
        if src.read_bytes() != dst.read_bytes():
            changes.append(rel)
    if not changes:
        print("当前仓库已经是左侧小标题版本，无需更新。")
        return

    for rel in changes:
        shutil.copy2(source / rel, dest / rel)
    print("已更新以下文件：")
    for rel in changes:
        print(f"  cuda/{rel}")
    print("未修改 FoamLab 原站其他文件；没有执行 git commit 或 push。")
    print("请在 GitHub Desktop 检查 Changes，预览后再 Commit、Push。")
    print("部署后：打开 /cuda/read/?slug=cuda-22，左侧应自动展开第 22 章小标题。")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("更新失败：", exc, file=sys.stderr)
        sys.exit(1)
