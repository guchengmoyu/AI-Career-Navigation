# -*- coding: utf-8 -*-
"""生成「卡片组织方案」对比样例，并输出量化分析。

方案A：一卡一片（一行 knowledge_cards = 一篇文档切片）
方案B：一技能一篇（同一技能的 5 个等级合成一篇 Markdown）

用法：python generate_samples.py [SKILL_ID] [QUERY_CASE]
"""
import csv
import re
import sys
import collections
from pathlib import Path

BASE = Path(r"D:/aboutProjects/AI-Career_Navigation")
CSV_DIR = BASE / "ai-career-dataset/data/v0.5-core/csv"
OUT = BASE / "知识库构建/卡片组织方案对比"
SKILL = sys.argv[1] if len(sys.argv) > 1 else "SKILL-001"


def load(name):
    return list(csv.DictReader(open(CSV_DIR / name, encoding="utf-8-sig")))


cards = load("knowledge_cards.csv")
levels = sorted(
    [c for c in cards if c["related_entity_id"] == SKILL and c["category"] == "skill_level"],
    key=lambda c: c["knowledge_card_id"],
)
if not levels:
    sys.exit(f"未找到技能 {SKILL} 的等级卡片")

skill_name = levels[0]["title"].replace("等级1", "")
domain = re.search(r"属于(.+?)。", levels[0]["content"]).group(1)

# ---------------- 方案A：一卡一片 ----------------
a_dir = OUT / "方案A_一卡一片"
a_dir.mkdir(parents=True, exist_ok=True)
for c in levels:
    md = (
        f"# {c['title']}\n\n"
        f"{c['content']}\n\n"
        "---\n\n"
        f"卡片ID：{c['knowledge_card_id']}\n"
        f"关键词：{c['keywords'].replace('|', ' / ')}\n"
        f"关联：{c['related_entity_type']} / {c['related_entity_id']}\n"
        f"证据等级：{c['claim_level']}（{c['verification_status']}）\n"
        f"数据切分：{c['data_split']}\n"
    )
    (a_dir / f"{c['knowledge_card_id']}.md").write_text(md, encoding="utf-8")

# ---------------- 方案B：一技能一篇 ----------------
b_dir = OUT / "方案B_一技能一篇"
b_dir.mkdir(parents=True, exist_ok=True)
buf = [
    f"# {skill_name}\n",
    f"技能ID：{SKILL}",
    f"所属领域：{domain}\n",
    "## 能力等级要求（1—5 级）\n",
]
for c in levels:
    n = c["knowledge_card_id"].split("-L")[-1]
    body = re.sub(r"^.+?。", "", c["content"], count=1)  # 去掉与标题重复的「X属于Y。」
    buf.append(f"### 等级{n}\n\n{body}\n")
buf += [
    "## 学习资源\n",
    "（数据集中 learning_resource 卡片未与技能建立外键关联，资源类信息无法在本篇内聚合，"
    "需由资源库独立承接。）\n",
    "---\n",
    "聚合自：" + " / ".join(c["knowledge_card_id"] for c in levels),
]
b_path = b_dir / f"{SKILL}_{skill_name}.md"
b_path.write_text("\n".join(buf), encoding="utf-8")

# ---------------- 量化分析 ----------------
W = 70
print("=" * W)
print(f"技能：{skill_name}（{SKILL}）   领域：{domain}")
print("=" * W)

a_chars = sum(len((a_dir / f"{c['knowledge_card_id']}.md").read_text(encoding="utf-8")) for c in levels)
b_chars = len(b_path.read_text(encoding="utf-8"))
print(f"\n[切片数]   方案A = {len(levels)} 片        方案B = 1 篇")
print(f"[字符数]   方案A = {a_chars} 字（5 片合计，含元信息）")
print(f"           方案B = {b_chars} 字（1 篇，无重复元信息）")

sk = [c for c in cards if c["category"] == "skill_level"]
sig = collections.Counter(re.search(r"等级(\d)要求(.+?)。", c["content"]).group(2) for c in sk)
print(f"\n[全表 300 张 skill_level 卡片]")
print(f"  content 唯一文本：{len(set(c['content'] for c in sk))} 种（每张都不同）")
print(f"  但去掉「等级N」数字后的唯一文本：{len(set(re.sub(r'等级\\d', '等级N', c['content']) for c in sk))} 种")
print(f"  → 说明：唯一性全部来自技能名/领域名/一个数字，句式模板只有 {len(sig)} 种：")
for k, v in sig.most_common():
    print(f"      {v:>4} 张   {k}")

dup = [f"L{i+1}≈L{i+2}" for i in range(len(levels) - 1)
       if re.sub(r"等级\d", "", levels[i]["content"]) == re.sub(r"等级\d", "", levels[i + 1]["content"])]
print(f"\n[本技能]   去数字后文字相同的等级对：{', '.join(dup) if dup else '无'}")

# ---------------- 全库模拟检索 ----------------
def bigrams(s):
    s = re.sub(r"[\s，。？、；：,.]", "", s)
    return set(s[i:i + 2] for i in range(len(s) - 1))


def cover(qb, text):
    """query bigram 被文档覆盖的比例（模拟召回能力，对长文档公平）"""
    return len(qb & bigrams(text)) / len(qb)


rr = load("retrieval_eval.csv")
case = next((x for x in rr if x["expected_card_ids"].startswith(f"KC-{SKILL}-L")), None)
query = case["query"] if case else f"如何判断{skill_name}等级1，需要哪些证据？"
expect = case["expected_card_ids"] if case else f"{SKILL}-L1"

print("\n" + "=" * W)
print(f"[全库模拟检索]  用例 {case['retrieval_case_id'] if case else '(构造)'}")
print(f"  query = 「{query}」")
print(f"  期望答案 = {expect}")
print("  算法：字符 bigram 覆盖率（仅作相对比较，非真实 embedding）")
print("=" * W)

qb = bigrams(query)

# 冗余度：同一技能内部相邻等级切片之间的互相似度
print("\n[冗余度诊断] 同一技能内相邻等级切片的互相似度（Jaccard）")
for i in range(len(levels) - 1):
    t1 = levels[i]["title"] + " " + levels[i]["content"] + " " + levels[i]["keywords"]
    t2 = levels[i + 1]["title"] + " " + levels[i + 1]["content"] + " " + levels[i + 1]["keywords"]
    b1, b2 = bigrams(t1), bigrams(t2)
    j = len(b1 & b2) / len(b1 | b2)
    print(f"  L{i+1} vs L{i+2}: {j:.3f}  {'← 近乎重复' if j > 0.9 else ''}")

# 方案A 候选池 = 全部 300 张 skill_level 卡片
poolA = sorted(((c["knowledge_card_id"], c["related_entity_id"],
                 c["title"] + " " + c["content"] + " " + c["keywords"]) for c in sk),
               key=lambda x: -cover(qb, x[2]))
print(f"\n方案A（候选池 {len(poolA)} 片）Top5：")
for i, (cid, ent, txt) in enumerate(poolA[:5], 1):
    hit = "  <-- 期望答案" if cid == expect else ""
    print(f"  Top{i}  {cid:<24} {cover(qb, txt):.4f}   技能={ent}{hit}")
same_cnt = sum(1 for _, ent, _ in poolA[:5] if ent == SKILL)
print(f"  → Top5 中来自同一技能 {SKILL} 的切片：{same_cnt}/5")
if len(poolA) > 1:
    print(f"  → Top1({poolA[0][0]}) 与 Top2({poolA[1][0]}) 覆盖率分差："
          f"{cover(qb,poolA[0][2])-cover(qb,poolA[1][2]):.4f}")

# 方案B 候选池 = 60 篇技能文档
btext = {}
for s in sorted(set(c["related_entity_id"] for c in sk)):
    lv = sorted([c for c in sk if c["related_entity_id"] == s], key=lambda c: c["knowledge_card_id"])
    nm = lv[0]["title"].replace("等级1", "")
    btext[s] = nm + " " + " ".join(re.sub(r"^.+?。", "", c["content"], count=1) for c in lv)
poolB = sorted(((s, btext[s]) for s in btext), key=lambda x: -cover(qb, x[1]))
print(f"\n方案B（候选池 {len(poolB)} 篇）Top5：")
for i, (s, txt) in enumerate(poolB[:5], 1):
    hit = "  <-- 期望答案所在篇" if s == SKILL else ""
    print(f"  Top{i}  {s:<12} {btext[s][:22] + '...':<26} {cover(qb, txt):.4f}{hit}")
same_cnt = sum(1 for s, _ in poolB[:5] if s == SKILL)
print(f"  → Top5 中来自同一技能的文档：{same_cnt}/5")

print("\n" + "=" * W)
print("输出目录：", OUT)
