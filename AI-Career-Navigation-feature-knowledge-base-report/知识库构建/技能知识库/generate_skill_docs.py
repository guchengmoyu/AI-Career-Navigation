# -*- coding: utf-8 -*-
"""全量生成「一技能一篇」知识库上传文档（60 篇）。

数据源：ai-career-dataset/data/v1.0-full/csv
  - knowledge_cards.csv   60 技能 × 5 等级 = 300 张 skill_level 卡片
  - skills.csv            60 条技能主数据（技能名 / 领域 / 定义 / 评分区间）

产出：
  技能知识库/                      60 篇 Markdown（可直接上传）
  技能知识库/上传清单.csv          文件名 → 数据属性映射，供百宝箱建库时填
  技能知识库/生成统计.json         篇幅与长度分布，供报告引用

设计要点（依据「五类query完整对比」的实测结论）：
  1. 每篇由同一技能的 5 张等级卡片聚合，等级正文保持原始措辞，不新增内容。
  2. 每个等级小标题内嵌技能名（「等级3｜Python编程」）——若平台按标题分段，
     任何一段都自带技能名，可压制跨技能干扰（实测 trend/ethics 类
     类内相似度 0.78~0.80，靠正文已无法区分实体）。
  3. 文末保留来源卡片 ID 与合规元数据，支撑评测规则里的「回答引用来源 ID」。

用法：
  python generate_skill_docs.py                 # 生成保真版 → 技能知识库/
  python generate_skill_docs.py --dry-run       # 只统计，不写文件
  python generate_skill_docs.py --strip-boilerplate
        # 对照实验：剥离 5 个等级重复出现的通用评估句，输出到 → 技能知识库_去模板版/
"""
import csv
import json
import re
import sys
import statistics
import collections
from pathlib import Path

BASE = Path(r"D:/aboutProjects/AI-Career_Navigation")
SRC = BASE / "ai-career-dataset/data/v1.0-full/csv"

DRY_RUN = "--dry-run" in sys.argv
STRIP = "--strip-boilerplate" in sys.argv

# 保真版与去模板版分开落盘，避免互相覆盖
OUT = BASE / ("知识库构建/技能知识库_去模板版" if STRIP else "知识库构建/技能知识库")

# 300 张卡片里逐字重复的通用评估句（模板噪音，非技能信息）
BOILERPLATE = "评估应引用近期课程、项目、测评或工作样例。"


def load(name):
    return list(csv.DictReader(open(SRC / name, encoding="utf-8-sig")))


def slug(name):
    """技能名转安全文件名片段：去掉路径非法字符，保留中文"""
    return re.sub(r'[\\/:*?"<>|]', "", name).strip()


def level_body(content, strip_boilerplate=False):
    """从卡片 content 中取出等级要求部分。

    原文形如：「Python编程属于编程与计算基础。等级1要求学习者理解基础概念并在指导下完成任务。评估应引用…」
    首句与文档标题重复，去掉；末句为全表通用模板句，仅在实验模式下剥离。
    """
    body = re.sub(r"^.+?。", "", content, count=1)          # 去首句（技能名+领域）
    if strip_boilerplate:
        body = body.replace(BOILERPLATE, "").strip()
        body = re.sub(r"。\s*$", "。", body) if body else body
    return body.strip()


def render(skill, levels, strip_boilerplate=False):
    """组装一篇技能文档"""
    sid = skill["skill_id"]
    name = skill["name"]
    domain = skill["dimension_name"]
    definition = skill["definition"]

    buf = [
        f"# {name}\n",
        f"**技能 ID**：{sid}",
        f"**所属领域**：{domain}",
        f"**技能定义**：{definition}",
        f"**能力评分区间**：{skill['score_min']}–{skill['score_max']} 分"
        f"（评分体系内相对位置，非市场薪资或就业保证）\n",
        "## 能力等级要求（1—5 级）\n",
    ]

    for c in levels:
        n = c["knowledge_card_id"].rsplit("-L", 1)[-1]
        buf.append(f"### 等级{n}｜{name}\n")
        buf.append(level_body(c["content"], strip_boilerplate) + "\n")

    c0 = levels[0]
    buf += [
        "---\n",
        f"**来源卡片**：{' / '.join(c['knowledge_card_id'] for c in levels)}  ",
        f"**证据等级**：{c0['claim_level']}｜**核验状态**：{c0['verification_status']}"
        f"｜**数据切分**：{c0['data_split']}  ",
        f"**许可范围**：{c0['license_scope']}｜**是否市场事实**：{c0['is_market_fact']}",
    ]
    return "\n".join(buf) + "\n"


def main():
    cards = load("knowledge_cards.csv")
    skills = {s["skill_id"]: s for s in load("skills.csv")}
    levels_by_skill = collections.OrderedDict()
    for c in cards:
        if c["category"] != "skill_level":
            continue
        levels_by_skill.setdefault(c["related_entity_id"], []).append(c)

    for sid in levels_by_skill:
        levels_by_skill[sid].sort(key=lambda c: c["knowledge_card_id"])

    OUT.mkdir(parents=True, exist_ok=True)

    # ---------- 生成 ----------
    manifest = []
    lengths = []
    lengths_stripped = []
    written = 0

    for sid, levels in levels_by_skill.items():
        skill = skills.get(sid)
        if not skill:
            print(f"  !! {sid} 在 skills.csv 中无主数据，跳过")
            continue
        if len(levels) != 5:
            print(f"  !! {sid} 等级卡数量为 {len(levels)}，非 5")

        md = render(skill, levels, STRIP)
        length = len(md)
        # 两个版本的篇幅都统计，便于对照
        lengths.append(len(render(skill, levels, False)))
        lengths_stripped.append(len(render(skill, levels, True)))

        fname = f"{sid}_{slug(skill['name'])}.md"
        if not DRY_RUN:
            # 显式使用 LF 换行：Windows 文本模式默认写 CRLF，会让平台字符计数翻倍换行
            with open(OUT / fname, "w", encoding="utf-8", newline="\n") as f:
                f.write(md)
            written += 1

        manifest.append({
            "文件名": fname,
            "skill_id": sid,
            "技能名": skill["name"],
            "所属领域": skill["dimension_name"],
            "技能定义": skill["definition"],
            "字符数": length,
            "来源卡片ID": " / ".join(c["knowledge_card_id"] for c in levels),
            "证据等级": levels[0]["claim_level"],
            "数据切分": levels[0]["data_split"],
        })

    # ---------- 上传清单 ----------
    if not DRY_RUN:
        cols = ["文件名", "skill_id", "技能名", "所属领域", "技能定义", "字符数",
                "来源卡片ID", "证据等级", "数据切分"]
        with open(OUT / "上传清单.csv", "w", encoding="utf-8-sig",
                  newline="") as f:
            w = csv.DictWriter(f, fieldnames=cols)
            w.writeheader()
            w.writerows(manifest)

    # ---------- 写盘回读校验 ----------
    verify_msg = ""
    if not DRY_RUN:
        disk = [len((OUT / m["文件名"]).read_text(encoding="utf-8")
                    .replace("\r\n", "\n")) for m in manifest]
        mismatch = [m["文件名"] for m, d in zip(manifest, disk)
                    if d != m["字符数"]]
        verify_msg = (f"  !! {len(mismatch)} 篇字符数与内存值不一致：{mismatch[:5]}"
                      if mismatch else
                      f"  ✓ {len(disk)} 篇写盘回读校验通过（字符数一致，换行为 LF）")

    # ---------- 统计 ----------
    def desc(seq):
        return {
            "最小": min(seq),
            "最大": max(seq),
            "中位数": int(statistics.median(seq)),
            "均值": round(statistics.mean(seq), 1),
            "超过500字篇数": sum(1 for x in seq if x > 500),
            "超过800字篇数": sum(1 for x in seq if x > 800),
        }

    stat = {
        "版本": "去模板版（剥离通用评估句）" if STRIP else "保真版（原文措辞）",
        "输出目录": str(OUT),
        "文档数": len(manifest),
        "每篇等级数": 5,
        "数据源": "ai-career-dataset/data/v1.0-full（引用完整性 200/200）",
        "字符数_本版": desc([m["字符数"] for m in manifest]),
        "字符数_保真版": desc(lengths),
        "字符数_去模板版": desc(lengths_stripped),
        "领域分布": dict(collections.Counter(m["所属领域"] for m in manifest)),
    }
    if not DRY_RUN:
        with open(OUT / "生成统计.json", "w", encoding="utf-8", newline="\n") as f:
            json.dump(stat, f, ensure_ascii=False, indent=2)

    # ---------- 控制台报告 ----------
    W = 68
    print("=" * W)
    print(("【干跑】" if DRY_RUN else "【已生成】")
          + f"  技能文档 {len(manifest)} 篇  ·  {stat['版本']}")
    print("=" * W)
    print(f"输出目录：{OUT}")
    if verify_msg:
        print(verify_msg)
    print()
    for label, key in (("本版实际", "字符数_本版"),
                       ("对照·保真版", "字符数_保真版"),
                       ("对照·去模板版", "字符数_去模板版")):
        d = stat[key]
        flag = "✓ 全部 ≤800，可整篇落入单个分段" if d["超过800字篇数"] == 0 \
            else f"✗ {d['超过800字篇数']} 篇超 800"
        print(f"{label:<14} 最小 {d['最小']:>3} / 中位 {d['中位数']:>3}"
              f" / 最大 {d['最大']:>3} 字   {flag}")
    print()
    print("领域分布：")
    for k, v in stat["领域分布"].items():
        print(f"  {k:<16} {v:>2} 篇")
    print()
    print("篇幅最长 5 篇 / 最短 5 篇：")
    rank = sorted(manifest, key=lambda m: -m["字符数"])
    for m in rank[:5]:
        print(f"  {m['字符数']:>5}  {m['文件名']}")
    print("  ...")
    for m in rank[-5:]:
        print(f"  {m['字符数']:>5}  {m['文件名']}")


if __name__ == "__main__":
    main()
