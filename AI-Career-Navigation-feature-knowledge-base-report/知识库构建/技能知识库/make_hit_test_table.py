# -*- coding: utf-8 -*-
"""生成「命中测试」配套的两张表。

产出 1：技能知识库/命中测试对照表.csv
  全部 200 条评测用例 → 应命中文档的映射（含未覆盖的 146 条，标记归属谁承接）

产出 2：技能知识库/命中测试记录表.csv
  仅筛选出本库可测的 54 条，结果列留空，供平台「命中测试」跑完后直接填写。
  列结构对应《效果评估报告框架》第 4.2 / 4.3 节的三项加严指标。

用法：python make_hit_test_table.py
"""
import csv
import re
import collections
from pathlib import Path

BASE = Path(r"D:/aboutProjects/AI-Career_Navigation")
SRC = BASE / "ai-career-dataset/data/v1.0-full/csv"
OUT = BASE / "知识库构建/技能知识库"

# 卡片 ID 前缀 → 承接该卡片的库
OWNER = {
    "SKILL": "技能知识库（已建）",
    "RES": "学习资源库（待建，表格型）",
    "ROLE": "岗位技能要求库（待建，表格型）",
    "TREND": "趋势数据解释（归属待定）",
    "ETHICS": "隐私与合规边界（归属待定）",
}


def load(name):
    return list(csv.DictReader(open(SRC / name, encoding="utf-8-sig")))


def main():
    skills = {s["skill_id"]: s["name"] for s in load("skills.csv")}
    rows = load("retrieval_eval.csv")

    out = []
    sheet = []
    stat = collections.Counter()
    for r in rows:
        ids = [i for i in r["expected_card_ids"].split("|") if i]
        cats = set()
        docs = []
        levels = []
        for cid in ids:
            m = re.match(r"KC-([A-Z]+)-", cid)
            cat = m.group(1) if m else "UNKNOWN"
            cats.add(cat)
            if cat == "SKILL":
                mm = re.match(r"KC-(SKILL-\d+)-L(\d+)", cid)
                sid = mm.group(1)
                levels.append("L" + mm.group(2))
                docs.append(f"★ {sid}_{skills.get(sid, '?')}.md")
            elif cat == "TREND":
                sid = "SKILL-" + cid.rsplit("-", 1)[-1]
                docs.append(f"{sid}（{skills.get(sid, '?')}）趋势段")
            elif cat == "ETHICS":
                sid = "SKILL-" + cid.rsplit("-", 1)[-1]
                docs.append(f"{sid}（{skills.get(sid, '?')}）合规段")
            elif cat == "RES":
                docs.append(f"资源卡 {cid}")
            elif cat == "ROLE":
                docs.append(f"岗位技能卡 {cid}")

        # 整条用例是否完全落在本库覆盖范围
        covered = cats == {"SKILL"}
        key = "本库可测" if covered else "本库不可测"
        stat[key] += 1
        stat["_" + "+".join(sorted(cats))] += 1

        out.append({
            "case_id": r["retrieval_case_id"],
            "query": r["query"],
            "expected_card_ids": r["expected_card_ids"],
            "expected_doc": " / ".join(dict.fromkeys(docs)),
            "covered_by": " / ".join(sorted(OWNER.get(c, c) for c in cats)),
            "本库是否覆盖": "是" if covered else "否",
            "hit": "",
        })

        if covered:
            doc = re.sub(r"^★ ", "", docs[0])
            sheet.append({
                "case_id": r["retrieval_case_id"],
                "query": r["query"],
                "期望文档": doc,
                "期望等级": " / ".join(levels),
                "期望卡片ID": r["expected_card_ids"],
                # --- 检索层：由平台「命中测试」填 ---
                "检索_Top1文档": "",
                "检索_Top1匹配度": "",
                "检索_Top5期望项最高排名": "",
                "检索_Top5同源条数": "",
                "检索_命中@1": "",
                "检索_命中@5": "",
                # --- 答案层：让智能体作答后填 ---
                "答案_引用等级是否正确": "",
                "答案_引用ID是否命中期望": "",
                "答案_Top1可回答性": "",
                "备注": "",
            })

    cols = ["case_id", "query", "expected_card_ids", "expected_doc",
            "covered_by", "本库是否覆盖", "hit"]
    with open(OUT / "命中测试对照表.csv", "w", encoding="utf-8-sig",
              newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(out)

    sheet_cols = list(sheet[0].keys())
    with open(OUT / "命中测试记录表.csv", "w", encoding="utf-8-sig",
              newline="") as f:
        w = csv.DictWriter(f, fieldnames=sheet_cols)
        w.writeheader()
        w.writerows(sheet)

    W = 66
    print("=" * W)
    print("命中测试配套表已生成")
    print("=" * W)
    print(f"① 对照表（全部用例）：{OUT / '命中测试对照表.csv'}")
    print(f"   共 {len(out)} 条，本库可测 {stat['本库可测']} 条 / "
          f"需其他库 {stat['本库不可测']} 条")
    print(f"② 记录表（本库可测）：{OUT / '命中测试记录表.csv'}")
    print(f"   共 {len(sheet)} 条，结果列留空待填")
    print()
    print("记录表列结构：")
    for c in sheet_cols:
        print(f"   {c}")
    print()
    print("按卡片类别分布：")
    for k, v in sorted(stat.items()):
        if k.startswith("_"):
            print(f"  {k[1:]:<16} {v:>3} 条")
    print()
    print("记录表前 3 条样例：")
    for r in sheet[:3]:
        print(f"  [{r['case_id']}] {r['query']}")
        print(f"     期望文档：{r['期望文档']}   期望等级：{r['期望等级']}")


if __name__ == "__main__":
    main()
