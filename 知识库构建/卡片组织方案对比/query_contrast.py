# -*- coding: utf-8 -*-
"""五类 query 的组织方案对比（已补测 趋势解读 / 隐私边界）。

方案A = 一卡一片
方案B = 按业务实体聚合（聚合维度按卡片类别区分）：
  skill_level          -> 按 skill_id（5 等级合一）
  role_skill           -> 按 role_id（一个岗位的全部技能要求合一）
  trend_interpretation -> 按 skill_id（1:1，与方案A 等价）
  ethics_privacy       -> 按 skill_id（1:1，与方案A 等价）
  learning_resource    -> 无聚合维度

新增指标：
  同类干扰相似度 = Top5 中干扰项与期望答案的文本平均相似度
                   （衡量"干扰项有多像正确答案"，越高越容易被误导）

数据源：data/v1.0-full
"""
import csv
import re
import collections
import itertools
import statistics
from pathlib import Path

D = Path(r"D:/aboutProjects/AI-Career_Navigation/ai-career-dataset/data/v1.0-full/csv")


def load(name):
    return list(csv.DictReader(open(D / name, encoding="utf-8-sig")))


cards = load("knowledge_cards.csv")
evals = load("retrieval_eval.csv")
by_id = {c["knowledge_card_id"]: c for c in cards}


def bigrams(s):
    s = re.sub(r"[\s，。？、；：,.\-()（）「」【】“”]", "", s)
    return set(s[i:i + 2] for i in range(len(s) - 1))


def text_of(c):
    return f"{c['title']} {c['content']} {c['keywords']}"


def cover(qb, db):
    return len(qb & db) / len(qb) if qb else 0.0


def jac(b1, b2):
    return len(b1 & b2) / len(b1 | b2) if (b1 | b2) else 0.0


BIGRAM = {c["knowledge_card_id"]: bigrams(text_of(c)) for c in cards}


def entity_of(cid):
    """用于判断"是否同一业务实体"。role_skill 用岗位维度。"""
    c = by_id.get(cid)
    if not c:
        return ""
    if c["category"] == "role_skill":
        return c["related_entity_id"].split("|")[0]
    return c["related_entity_id"]


def agg_key(c):
    cat = c["category"]
    if cat == "skill_level":
        return ("skill", c["related_entity_id"])
    if cat == "role_skill":
        return ("role", c["related_entity_id"].split("|")[0])
    if cat in ("trend_interpretation", "ethics_privacy"):
        return ("skill", c["related_entity_id"])
    return None


def kind(q):
    if "如何判断" in q and "证据" in q:
        return "能力等级证据"
    if "适合什么水平" in q or "适合" in q:
        return "资源推荐"
    if "岗位匹配中如何体现" in q:
        return "岗位匹配"
    if "趋势数据解释" in q:
        return "趋势解读"
    if "数据使用边界" in q:
        return "隐私边界"
    return "未分类"


def build_pools(category):
    pool = [c for c in cards if c["category"] == category]
    poolA = [(c["knowledge_card_id"], BIGRAM[c["knowledge_card_id"]]) for c in pool]
    groups = collections.OrderedDict()
    for c in pool:
        k = agg_key(c)
        if k is None:
            return poolA, None, None
        groups.setdefault(k, []).append(c)
    poolB, lengths = [], []
    for k, members in groups.items():
        txt = " ".join(text_of(c) for c in members)
        poolB.append(("|".join(k), " ".join(m["knowledge_card_id"] for m in members),
                      bigrams(txt)))
        lengths.append(len(txt))
    return poolA, poolB, lengths


def evaluate(query, expect_ids, category):
    qb = bigrams(query)
    poolA, poolB, lengths = build_pools(category)
    exp_set = set(expect_ids.split("|"))
    exp_ent = set(entity_of(i) for i in exp_set)
    exp_bg = set()
    for i in exp_set:
        exp_bg |= BIGRAM[i]

    rankA = sorted(((cid, cover(qb, bg)) for cid, bg in poolA), key=lambda x: -x[1])
    a_top = rankA[:5]
    inter = [jac(exp_bg, BIGRAM[cid]) for cid, _ in a_top if cid not in exp_set]
    resA = dict(
        top=a_top, pool=len(poolA),
        top1=a_top[0][0] in exp_set,
        top5=any(cid in exp_set for cid, _ in a_top),
        same_ent=sum(1 for cid, _ in a_top if entity_of(cid) in exp_ent),
        gap=(a_top[0][1] - a_top[1][1]) if len(a_top) > 1 else 0.0,
        inter=statistics.mean(inter) if inter else 0.0,
    )

    if poolB is None:
        return resA, None

    rankB = sorted(((k, m, cover(qb, bg)) for k, m, bg in poolB), key=lambda x: -x[2])
    b_top = rankB[:5]
    resB = dict(
        top=b_top, pool=len(poolB),
        top1=any(m in exp_set for m in b_top[0][1].split(" ")),
        top5=any(any(m in exp_set for m in ms.split(" ")) for _, ms, _ in b_top),
        gap=(b_top[0][2] - b_top[1][2]) if len(b_top) > 1 else 0.0,
        lengths=lengths,
        # 方案B 各篇得分序列是否与方案A 逐位相同（1:1 类别应为 True）
        identical=([s for _, s in a_top] == [s for _, _, s in b_top]),
    )
    return resA, resB


W = 78
print("=" * W)
print("五类 query 的组织方案对比   （v1.0-full：1200 张卡片 / 200 条评测集）")
print("=" * W)

SAMPLES = [
    ("RETR-001", "能力等级证据"),
    ("RETR-026", "岗位匹配"),
    ("RETR-010", "资源推荐"),
    ("RETR-031", "趋势解读"),
    ("RETR-032", "隐私边界"),
]
by_case = {x["retrieval_case_id"]: x for x in evals}

for idx, (case_id, label) in enumerate(SAMPLES, 1):
    x = by_case[case_id]
    query, expect = x["query"], x["expected_card_ids"]
    category = by_id[expect.split("|")[0]]["category"]
    resA, resB = evaluate(query, expect, category)
    exp_set = set(expect.split("|"))

    print()
    print("-" * W)
    print(f"[{idx}/5] {case_id} · {label} · 卡片类别 {category}")
    print(f"  query  = {query}")
    print(f"  expect = {expect}")
    print("-" * W)

    print(f"\n  方案A · 一卡一片（候选池 {resA['pool']} 片）")
    for i, (cid, sc) in enumerate(resA["top"], 1):
        tag = "  ← 期望答案" if cid in exp_set else ""
        t = by_id[cid]["title"]
        print(f"    Top{i}  {cid:<22} {sc:.4f}   {t[:18]:<20}{tag}")
    print(f"    Top1命中={resA['top1']}  Top5命中={resA['top5']}  "
          f"Top5同实体={resA['same_ent']}/5")
    print(f"    Top1-Top2分差={resA['gap']:.4f}   "
          f"干扰项与答案的平均相似度={resA['inter']:.3f}")

    if resB is None:
        print(f"\n  方案B · 不适用（该类卡片一对一无聚合实体）")
    else:
        note = "  ← 与方案A 逐位相同" if resB["identical"] else ""
        print(f"\n  方案B · 按实体聚合（候选池 {resB['pool']} 篇）{note}")
        for i, (key, members, sc) in enumerate(resB["top"], 1):
            ml = members.split(" ")
            tag = "  ← 含期望答案" if any(m in exp_set for m in ml) else ""
            print(f"    Top{i}  {key:<22} {sc:.4f}   （{len(ml)} 张卡）{tag}")
        print(f"    Top1命中={resB['top1']}  Top5命中={resB['top5']}  "
              f"Top1-Top2分差={resB['gap']:.4f}")
        mx = max(resB["lengths"])
        print(f"    单篇字数 {min(resB['lengths'])} ~ {mx}"
              + ("   ⚠ 超 500 字分段阈值" if mx > 500 else ""))

# ---------------- 批量统计 ----------------
print()
print("=" * W)
print("批量统计（全部 200 条 query）")
print("=" * W)
hdr = (f"{'类别':<12}{'条数':>5}{'A_Top1':>8}{'A_Top5':>8}{'A同实体':>9}"
       f"{'A干扰相似':>10}{'B_Top1':>8}{'B池':>6}{'A=B?':>7}")
print(hdr)
print("-" * W)

rows = []
for k in ["能力等级证据", "岗位匹配", "资源推荐", "趋势解读", "隐私边界"]:
    subset = [x for x in evals if kind(x["query"]) == k]
    if not subset:
        continue
    category = by_id[subset[0]["expected_card_ids"].split("|")[0]]["category"]
    n = a1 = a5 = asum = aint = b1 = 0
    bpool = None
    ident = None
    for x in subset:
        rA, rB = evaluate(x["query"], x["expected_card_ids"], category)
        n += 1
        a1 += rA["top1"]
        a5 += rA["top5"]
        asum += rA["same_ent"]
        aint += rA["inter"]
        if rB:
            b1 += rB["top1"]
            bpool = rB["pool"]
            ident = rB["identical"]
    b1s = f"{b1/n*100:.0f}%" if bpool else "—"
    bps = str(bpool) if bpool else "不适用"
    eqs = ("是" if ident else "否") if bpool else "—"
    print(f"{k:<12}{n:>5}{a1/n*100:>7.0f}%{a5/n*100:>7.0f}%{asum/n:>9.2f}"
          f"{aint/n:>10.3f}{b1s:>8}{bps:>6}{eqs:>7}")
    rows.append((k, category, n))

print("-" * W)
print("A同实体   = Top5 中来自期望卡片所属业务实体的平均条数（越高越冗余）")
print("A干扰相似 = Top5 中干扰项与期望答案的文本平均相似度（越高越易误导）")
print("A=B?      = 方案B 的得分序列是否与方案A 逐位相同")

# ---------------- 类内模板化程度 ----------------
print()
print("=" * W)
print("类内模板化程度（不同实体卡片两两相似度，随机采样 2000 对）")
print("=" * W)
for cat in ["skill_level", "role_skill", "learning_resource",
            "trend_interpretation", "ethics_privacy"]:
    sub = [c for c in cards if c["category"] == cat]
    if len(sub) < 2:
        continue
    sims = []
    for a, b in itertools.islice(itertools.combinations(sub, 2), 2000):
        sims.append(jac(BIGRAM[a["knowledge_card_id"]], BIGRAM[b["knowledge_card_id"]]))
    print(f"  {cat:<22} 卡片 {len(sub):>4} 张   平均相似度 {statistics.mean(sims):.3f}"
          f"   范围 {min(sims):.3f} ~ {max(sims):.3f}")
