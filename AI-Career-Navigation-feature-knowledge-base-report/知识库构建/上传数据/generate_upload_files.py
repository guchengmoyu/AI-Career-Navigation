#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
从 v1.0-full 生成「上传用」裁剪版数据文件。
原则：保留 业务字段 + 可自证"演示数据"的合规字段 + 有区分度的字段；裁掉恒定值/冗余/审计字段。
输出：CSV(utf-8-sig) + XLSX，供百宝箱表格型知识库上传。
"""
import os
import pandas as pd

SRC = r"D:\aboutProjects\AI-Career_Navigation\ai-career-dataset\data\v1.0-full\csv"
OUT = r"D:\aboutProjects\AI-Career_Navigation\知识库构建\上传数据"

# 字段裁剪清单（保序）
SPECS = [
    {
        "name": "岗位库",
        "src": "jobs.csv",
        "cols": [
            "job_id", "role_id", "title", "industry", "city", "work_mode",
            "experience_level", "education_level", "employment_type",
            "salary_min_cny_month", "salary_max_cny_month", "summary",
            "display_disclaimer", "claim_level", "data_split",
        ],
        "drop_reason": {
            "company_code": "180 个「模拟企业-XXX」占位值，与 disclaimer 重复",
            "required_experience_months": "被 experience_level 覆盖",
            "posted_at": "审计时间字段", "expires_at": "审计时间字段",
            "salary_is_simulated": "全表恒定 True，由 display_disclaimer 表达更直接",
            "is_market_fact": "全表恒定 False", "is_synthetic": "全表恒定 True",
            "schema_version": "审计", "origin": "审计", "source_ids": "审计",
            "generated_at": "审计", "confidence": "审计", "verification_status": "审计",
            "last_verified_at": "审计", "license_scope": "审计",
        },
    },
    {
        "name": "学习资源库",
        "src": "learning_resources.csv",
        "cols": [
            "resource_id", "title", "resource_type", "provider", "url",
            "difficulty", "estimated_hours", "prerequisite_score",
            "page_kind", "metadata_scope", "verified_individual_page",
            "claim_level", "summary",
        ],
        "drop_reason": {
            "cost_type": "全表恒定 free_or_demo",
            "language": "全表恒定 zh-CN",
            "is_market_fact": "全表恒定 False",
            "is_synthetic": "与 claim_level 冗余",
            "data_split": "全表恒定 dev",
            "estimated_hours_is_simulated": "全表恒定 True，与 claim_level 冗余",
            "schema_version": "审计", "origin": "审计", "source_ids": "审计",
            "generated_at": "审计", "confidence": "审计", "verification_status": "审计",
            "last_verified_at": "审计", "license_scope": "审计",
        },
    },
    {
        "name": "岗位技能要求库",
        "src": "job_skills.csv",
        "cols": [
            "job_skill_id", "job_id", "skill_id",
            "required_score", "importance_weight", "requirement_type", "data_split",
        ],
        "drop_reason": {
            "is_market_fact": "全表恒定 False（派生关系表不承载事实声明）",
            "claim_level": "全表恒定 synthetic，由 jobs 表承担合规表述",
            "is_synthetic": "全表恒定 True",
            "schema_version": "审计", "origin": "审计", "source_ids": "审计",
            "generated_at": "审计", "confidence": "审计", "verification_status": "审计",
            "last_verified_at": "审计", "license_scope": "审计",
        },
    },
]

os.makedirs(OUT, exist_ok=True)
report = []

for spec in SPECS:
    src_path = os.path.join(SRC, spec["src"])
    df = pd.read_csv(src_path, encoding="utf-8-sig")
    before_cols = list(df.columns)
    missing = [c for c in spec["cols"] if c not in before_cols]
    if missing:
        raise SystemExit(f"[{spec['name']}] 源表缺少字段: {missing}")

    out = df[spec["cols"]].copy()

    # 空值检查
    nulls = out.isna().sum()
    null_cols = {k: int(v) for k, v in nulls.items() if v > 0}

    # 写文件
    csv_path = os.path.join(OUT, spec["src"])
    xlsx_path = os.path.join(OUT, spec["src"].replace(".csv", ".xlsx"))
    out.to_csv(csv_path, index=False, encoding="utf-8-sig", lineterminator="\r\n")
    out.to_excel(xlsx_path, index=False, sheet_name="Sheet1")

    dropped = [c for c in before_cols if c not in spec["cols"]]
    report.append({
        "name": spec["name"],
        "file": spec["src"],
        "rows": len(out),
        "cols_before": len(before_cols),
        "cols_after": len(out.columns),
        "dropped": dropped,
        "null_cols": null_cols,
        "csv": csv_path,
        "xlsx": xlsx_path,
    })

print("=" * 78)
for r in report:
    print(f"\n【{r['name']}】 {r['file']}")
    print(f"  行数      : {r['rows']}")
    print(f"  列数      : {r['cols_before']} → {r['cols_after']}  (裁掉 {len(r['dropped'])} 列)")
    print(f"  裁掉      : {', '.join(r['dropped'])}")
    print(f"  保留列含空: {r['null_cols'] if r['null_cols'] else '无空值 ✓'}")
    print(f"  输出      : {os.path.basename(r['csv'])} / {os.path.basename(r['xlsx'])}")

print("\n" + "=" * 78)
print("输出目录:", OUT)
for f in sorted(os.listdir(OUT)):
    p = os.path.join(OUT, f)
    print(f"  {f:38s} {os.path.getsize(p)/1024:8.1f} KB")
