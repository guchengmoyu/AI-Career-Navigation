# -*- coding: utf-8 -*-
"""
A02 职业导航 Flask 后端 —— 接库版（批 1）
================================================================
与旧版差异：
  * MOCK_* 仅作为【数据库不可达时】的降级兜底（与 MCP 服务同一降级哲学）
  * 所有读写口径逐字段复刻 mcp-server/src/service.ts（同一公式 → 三端同数）
  * 数据源：MySQL `ai_career_nav_v12`（与 MCP 插件同一张库）

环境变量（与 MCP/db:import 同一套，可用 .env 或系统环境）：
  MYSQL_HOST=127.0.0.1  MYSQL_PORT=3306  MYSQL_USER=root
  MYSQL_PASSWORD=123456 MYSQL_DATABASE=ai_career_nav_v12

运行：python app.py  →  0.0.0.0:3000（前端 VITE_API_BASE 指向这里）
健康检查：GET /api/health → {"status":"ok","db_mode":true/false}
"""

import json
import os
import random
import re
import threading
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_DOWN

import pymysql
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ----------------------------------------------------------------------------
# 配置与连接（失败 → db_mode=False，回落 MOCK，保证演示永不 500）
# ----------------------------------------------------------------------------
DB_CONF = {
    "host": os.environ.get("MYSQL_HOST", "127.0.0.1"),
    "port": int(os.environ.get("MYSQL_PORT", "3306")),
    "user": os.environ.get("MYSQL_USER", "root"),
    "password": os.environ.get("MYSQL_PASSWORD", "123456"),
    "database": os.environ.get("MYSQL_DATABASE", "ai_career_nav_v12"),
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor,
}

# 与 MCP runtime-data.metadata 对齐的常量（base() 输出用）
SCHEMA_VERSION = "1.2.0"
CALCULATION_VERSION = "a02-mcp-0.2.0"
DATASET_VERSION = "v0.5-core"
DATASET_COMMIT = "9b6a75cdf847132a461a59cb520f90b2e466bb33"
DISCLAIMER = "本服务使用合成模拟数据，结果不代表真实市场统计或招聘结论。"
# 能力衰减基准时刻 = metadata.generated_at（默认查询都以它为 as_of → 无衰减）
BASELINE = datetime(2026, 9, 12, 16, 0, 0, tzinfo=timezone.utc)

DB_MODE = False

# ⚠️ 连接按【线程】隔离，绝不共享。
# 旧版是一个模块级单例 `_pool` 给所有请求共用，而 Flask 默认多线程处理请求：
# 前端一进页面就并发发 profile / progress / scenario 三个请求，A 线程在异常分支
# 里 `_pool.close()` 的同时，B 线程正读同一个 socket → `read of closed file`。
# 实测后果：/api/v1/scenario 直接 500 DB_ERROR，/api/v1/profile 则被 except 吞掉后
# 静默返回 MOCK（dimensions 为空）→ 前端画像页读 `sorted[0].name` 崩溃。
# 另外 pymysql 的连接本身也不是线程安全的，每线程各持一条才是正解。
_local = threading.local()


def _connect():
    return pymysql.connect(host=DB_CONF["host"], port=DB_CONF["port"], user=DB_CONF["user"],
                           password=DB_CONF["password"], database=DB_CONF["database"],
                           charset=DB_CONF["charset"], cursorclass=pymysql.cursors.DictCursor,
                           autocommit=True)


def _get_conn():
    """取本线程自己的连接；本线程还没建过（或已被丢弃）就新建一条。"""
    global DB_MODE
    conn = getattr(_local, "conn", None)
    if conn is None:
        conn = _connect()
        _local.conn = conn
        DB_MODE = True
    return conn


def _drop_conn(conn):
    """只丢弃本线程自己的坏连接；关不掉也无妨，反正不再引用它。"""
    if conn is None:
        return
    if getattr(_local, "conn", None) is conn:
        _local.conn = None
    try:
        conn.close()
    except Exception:
        pass


def get_conn():
    """启动探活用：建立本线程的第一条连接。"""
    return _get_conn()


def q(sql, args=None):
    """查询并返回 list[dict]；连接失效（MySQL 重启/空闲被踢/连接已被关闭）
       时丢弃本线程的坏连接并用新连接重试一次，避免整进程卡死在 MOCK 兜底。
       捕获范围刻意放宽到 Exception：实测 `read of closed file` 是 ValueError，
       不在 (MySQLError, OSError) 里，会直接穿透到路由层变成 500 / 空 MOCK。"""
    last_err = None
    for attempt in (0, 1):
        conn = None
        try:
            conn = _get_conn()
            with conn.cursor() as cur:
                cur.execute(sql, args or ())
                return cur.fetchall()
        except Exception as e:
            last_err = e
            _drop_conn(conn)
            if attempt == 1:
                raise
    raise last_err


def execute(sql, args=None):
    """写入；连接失效时的处理同 q()（按线程隔离 + 断线重连一次）。"""
    last_err = None
    for attempt in (0, 1):
        conn = None
        try:
            conn = _get_conn()
            with conn.cursor() as cur:
                return cur.execute(sql, args or ())
        except Exception as e:
            last_err = e
            _drop_conn(conn)
            if attempt == 1:
                raise
    raise last_err


# ----------------------------------------------------------------------------
# 口径复刻：基础包装（= service.ts base()）
# ----------------------------------------------------------------------------
def base(data_split="dev"):
    return {
        "schema_version": SCHEMA_VERSION,
        "calculation_version": CALCULATION_VERSION,
        "trace_id": str(uuid.uuid4()),
        "is_synthetic": True,
        "data_split": data_split,
        "dataset_version": DATASET_VERSION,
        "dataset_commit": DATASET_COMMIT,
        "disclaimer": DISCLAIMER,
        "persistence_mode": "ephemeral",
        "persistence_backend": "local_file",
    }


def clamp(v, lo=0, hi=100):
    return max(lo, min(hi, v))


def rnd(v, digits=1):
    # 与 JS toFixed 对齐：直接 round（不要加 epsilon，否则 41.34999… 会被推成 41.4）
    return round(float(v), digits)


def half_down_1(values):
    """八维分/综合分专用：Decimal 精确均值 + ROUND_HALF_DOWN。
    实测：DIM-02 精确值 41.35 → JS toFixed 舍成 41.3（对话端），
    HALF_UP 会得 41.4 不一致；HALF_DOWN 与对话端八维+综合分全等。"""
    dec = [v if isinstance(v, Decimal) else Decimal(str(v)) for v in values]
    return float((sum(dec) / len(dec)).quantize(Decimal("0.1"), rounding=ROUND_HALF_DOWN))


def fmt_score(v):
    """JS 数字模板语义：51 → '51'，45.9 → '45.9'（对齐对话端 '沟通协作与职业素养 51分'）。"""
    f = float(v)
    return str(int(f)) if f == int(f) else str(f)


def avg(values):
    return sum(values) / len(values) if values else 0


def _user_row(user_id):
    rows = q("SELECT u.*, p.experience_months, p.target_role_id, p.secondary_role_id, p.weekly_learning_hours "
             "FROM users u LEFT JOIN user_profiles p ON p.external_user_id = u.external_user_id "
             "WHERE u.external_user_id = %s", (user_id,))
    if not rows:
        return None
    if rows[0]["data_split"] == "test":
        return None  # 测试集不对演示开放（与 MCP A02_ENABLE_TEST_DATA 逻辑一致）
    return rows[0]


def _effective_scores(user_id, as_of=None):
    """= service.ts effectiveScores()：衰减 + 事件增量。默认 as_of=基准 → 无衰减。"""
    target = datetime.fromisoformat(as_of.replace("Z", "+00:00")) if as_of else BASELINE
    extra_days = max(0.0, (target - BASELINE).total_seconds() / 86400)
    rows = q("SELECT us.skill_id, us.current_score, us.half_life_days, us.confidence "
             "FROM user_skills us WHERE us.external_user_id = %s", (user_id,))
    scores, conf = {}, {}
    for r in rows:
        hl = float(r["half_life_days"] or 365)
        raw = Decimal(str(r["current_score"] or 0))   # 保留 Decimal 精度供均值计算
        if extra_days == 0:
            scores[r["skill_id"]] = raw
        else:
            scores[r["skill_id"]] = Decimal(str(clamp(float(raw) * (2 ** (-extra_days / hl)))))
        conf[r["skill_id"]] = float(r["confidence"] or 0)
    return scores, conf


def _dimensions(user_id, scores, conf):
    """= service.ts calculateCareerProfile 的 dimensions 段（保持 ref_dimensions 顺序）。"""
    dim_rows = q("SELECT dimension_id, name, display_order FROM ref_dimensions ORDER BY display_order")
    skills = q("SELECT skill_id, name, dimension_id FROM ref_skills")
    dims = []
    for d in dim_rows:
        rows = [s for s in skills if s["dimension_id"] == d["dimension_id"]]
        vals = [(s, scores.get(s["skill_id"], 0)) for s in rows]
        vals.sort(key=lambda x: -x[1])
        dims.append({
            "dimension_id": d["dimension_id"],
            "name": d["name"],
            "score": half_down_1([v for _, v in vals]),
            "evidence_count": len(vals),
            "confidence": rnd(avg([conf.get(s["skill_id"], 0) for s, _ in vals]), 2),
            "top_skills": [{"skill_id": s["skill_id"], "name": s["name"], "score": rnd(v)} for s, v in vals[:3]],
        })
    return dims


def _role_matches(user_id, scores, profile):
    """= service.ts roleMatches 段（ref_role_skills 聚合权重）。"""
    role_rows = q("SELECT role_id, name FROM ref_roles")
    mappings = q("SELECT role_id, skill_id, required_score, importance_weight FROM ref_role_skills")
    target = (profile or {}).get("target_role_id")
    secondary = (profile or {}).get("secondary_role_id")
    months = int((profile or {}).get("experience_months") or 0)
    out = []
    for role in role_rows:
        maps = [m for m in mappings if m["role_id"] == role["role_id"]]
        skill_fit = 100 * sum(float(m["importance_weight"]) *
                              min(float(scores.get(m["skill_id"], 0)) / float(m["required_score"]), 1) for m in maps)
        exp_fit = clamp(45 + months * 2.2, 45, 100)
        pref = 100 if target == role["role_id"] else (72 if secondary == role["role_id"] else 45)
        out.append({
            "role_id": role["role_id"], "name": role["name"],
            "skill_fit": rnd(skill_fit, 2), "experience_fit": rnd(exp_fit, 2),
            "preference_fit": pref,
            "match_score": rnd(0.8 * skill_fit + 0.1 * exp_fit + 0.1 * pref, 2),
        })
    out.sort(key=lambda x: -x["match_score"])
    return [dict(item, rank=i + 1) for i, item in enumerate(out)]


def build_profile(user_id, as_of=None):
    user = _user_row(user_id)
    if not user:
        return None
    profile = q("SELECT * FROM user_profiles WHERE external_user_id = %s", (user_id,)) or [{}]
    scores, conf = _effective_scores(user_id, as_of)
    dims = _dimensions(user_id, scores, conf)
    ranked = sorted(dims, key=lambda d: -d["score"])
    return {
        **base(user["data_split"]),
        "user_id": user_id,
        "persona_code": user["persona_code"],
        "as_of_date": (as_of or BASELINE.isoformat().replace("+00:00", "Z")),
        "overall_score": half_down_1([d["score"] for d in dims]),
        "dimensions": dims,
        "strengths": [f"{d['name']} {fmt_score(d['score'])}分" for d in ranked[:2]],
        "improvement_priorities": [f"{d['name']} {fmt_score(d['score'])}分" for d in reversed(ranked[-2:])],
        "role_matches": _role_matches(user_id, scores, profile[0]),
        "formula": {
            "dimension_score": "mean(current_skill_scores_in_dimension)",
            "skill_decay": "current_score*2^(-additional_days/half_life_days)",
            "role_match": "0.8*skill_fit+0.1*experience_fit+0.1*preference_fit",
        },
    }


# ----------------------------------------------------------------------------
# MOCK 降级兜底（仅 db_mode=False 时使用；结构与上面输出一致的最小集）
# ----------------------------------------------------------------------------
MOCK_PROFILE = {
    "user_id": "USER-G001", "persona_code": "GOLD-001", "overall_score": 65.0,
    "dimensions": [], "strengths": [], "improvement_priorities": [], "role_matches": [],
    "disclaimer": DISCLAIMER,
}
MOCK_PROGRESS = {
    "total_learning_hours": 120.0, "completed_tasks": 15, "streak_days": 15,
    "points_earned": 2450, "recent_events": [], "active_path": None,
    "persistence_mode": "ephemeral", "disclaimer": DISCLAIMER,
}

# 会话内状态（与 MCP 内存 Map 同语义：进程重启即清，persistence_mode=ephemeral 如实标注）
ACTIVE_PATHS = {}      # user_id -> GeneratedPath(dict)
TASK_UPDATES = {}      # task_id -> "pending|in_progress|completed|skipped"
SESSIONS = {}           # session_id -> {user_id, scenario_id, status, started_at, completed_at, responses}

# ----------------------------------------------------------------------------
# HTTP 接口
# ----------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    try:
        q("SELECT 1")   # 真实探活（而不是只看连接对象在不在）
        return jsonify({"status": "ok", "db_mode": True, "database": DB_CONF["database"]})
    except Exception as e:
        return jsonify({"status": "degraded", "db_mode": False, "error": str(e)[:200]})


@app.route("/api/v1/profile/<user_id>", methods=["GET"])
def get_profile(user_id):
    try:
        prof = build_profile(user_id, request.args.get("as_of_date"))
        if prof:
            return jsonify({"data": prof})
    except Exception:
        # 降级可以，但必须留下痕迹：以前这里 `pass`，后端静默给空 MOCK，
        # 前端拿到 dimensions=[] 直接崩，日志里却什么都没有，极难排查。
        app.logger.exception("[profile] build_profile failed, fallback to MOCK")
    return jsonify({"data": dict(MOCK_PROFILE, user_id=user_id), "fallback": True})


@app.route("/api/v1/profile/calculate", methods=["POST"])
def calc_profile():
    body = request.get_json(force=True, silent=True) or {}
    user_id = body.get("user_id", "USER-G001")
    try:
        prof = build_profile(user_id, body.get("as_of_date"))
        if prof:
            return jsonify({"data": prof})
    except Exception:
        app.logger.exception("[profile] build_profile failed, fallback to MOCK")
    return jsonify({"data": dict(MOCK_PROFILE, user_id=user_id), "fallback": True})


# ---- 进度（= service.ts progressSummary / allEvents，公式逐行一致） -----------
ESTIMATE = {"task_completed": 45, "course_completed": 60, "project_completed": 120,
            "skill_practice": 30, "assessment_completed": 45, "scenario": 20}
COMPLETED_TYPES = ("task_completed", "course_completed", "project_completed", "assessment_completed")


def _dump_row(row):
    """行序列化：datetime → ISO 字符串；Decimal → number（pymysql 会给字符串化，
    前端按 number 使用，遇到 .toFixed 等方法会直接崩掉整页）。"""
    out = {}
    for k, v in row.items():
        if isinstance(v, datetime):
            out[k] = v.isoformat()
        elif isinstance(v, Decimal):
            out[k] = float(v)
        else:
            out[k] = v
    return out


def _events(user_id, limit=None):
    rows = q("SELECT * FROM growth_events WHERE external_user_id = %s ORDER BY event_time DESC",
             (user_id,))
    if limit:
        rows = rows[:limit]
    return [_dump_row(r) for r in rows]


def _progress_summary(user_id):
    user = _user_row(user_id)
    if not user:
        return None
    rows = q("SELECT * FROM growth_events WHERE external_user_id = %s", (user_id,))
    events = sorted(rows, key=lambda e: e["event_time"], reverse=True)

    total_minutes = 0
    for e in events:
        total_minutes += int(e["duration_minutes"]) if e.get("duration_minutes") is not None \
            else ESTIMATE.get(e["event_type"], 0)
    completed_tasks = sum(1 for e in rows if e["event_type"] in COMPLETED_TYPES)

    days = sorted({e["event_time"].date() for e in rows if e["status"] == "completed"}, reverse=True)
    streak = 1 if days else 0
    for i in range(1, len(days)):
        if (days[i - 1] - days[i]).days == 1:
            streak += 1
        else:
            break

    points = sum(int(e["points_earned"]) if e.get("points_earned") is not None
                 else max(0, float(e["score_delta"] or 0) * 2) for e in rows)

    active = ACTIVE_PATHS.get(user_id)
    active_path = None
    if active:
        tasks = [t for ph in active["phases"] for t in ph["tasks"]]
        done = sum(1 for t in tasks if TASK_UPDATES.get(t["task_id"], {}).get("status") == "completed")
        total = len(tasks)
        active_path = {
            "path_id": active["path_id"], "title": active["title"],
            "completed_tasks": done, "total_tasks": total,
            "progress_percent": rnd(100 * done / total) if total else 0,
        }

    recent = [_dump_row(e) for e in events[:20]]
    return {
        **base(user["data_split"]),
        "user_id": user_id,
        "total_learning_hours": rnd(total_minutes / 60),
        "duration_is_estimated_for_baseline": True,
        "completed_tasks": completed_tasks,
        "streak_days": streak,
        "points_earned": points,
        "active_path": active_path,
        "recent_events": recent,
        "profile_recalculation_recommended": any(
            e.get("skill_id") and e.get("score_delta") and str(e["event_id"]).startswith("EVT-DEMO")
            for e in rows),
    }


@app.route("/api/v1/progress/<user_id>/summary", methods=["GET"])
def progress_summary(user_id):
    try:
        data = _progress_summary(user_id)
        if data:
            return jsonify({"data": data})
    except Exception:
        pass
    return jsonify({"data": MOCK_PROGRESS, "fallback": True})


@app.route("/api/v1/progress/<user_id>/events", methods=["GET"])
def progress_events(user_id):
    limit = request.args.get("limit", 20, type=int)
    try:
        return jsonify({"data": {"user_id": user_id, "count": limit, "events": _events(user_id, limit)}})
    except Exception:
        return jsonify({"data": {"user_id": user_id, "count": 0, "events": []}, "fallback": True})


# ---- 路径（= service.ts generateCareerPath / buildPath / taskForGap） ---------
@app.route("/api/v1/path/generate", methods=["POST"])
def path_generate():
    body = request.get_json(force=True, silent=True) or {}
    user_id = body.get("user_id", "USER-G001")
    role_id = body.get("target_role_id", "ROLE-AI-ALG")
    horizon = clamp(round(float(body.get("horizon_years") or 3)), 1, 5)
    # 与 MCP 一致：未传/传 0 时默认取用户资料的 weekly_learning_hours
    profile = q("SELECT weekly_learning_hours FROM user_profiles WHERE external_user_id = %s",
                (user_id,)) or [{"weekly_learning_hours": 10}]
    default_weekly = int(profile[0]["weekly_learning_hours"] or 10)
    weekly = clamp(round(float(body.get("weekly_hours") or default_weekly)), 1, 40)
    priority = body.get("priority") or "balanced"
    try:
        return jsonify({"data": _generate_path(user_id, role_id, horizon, weekly, priority),
                        "fallback": False})
    except Exception as e:
        print(f"[a02] path/generate fallback: {e}")   # 单行日志；不打印整段堆栈
        return jsonify({"data": {"user_id": user_id, "target_role_id": role_id,
                                 "gap_analysis": {"critical_gaps": [], "minor_gaps": []},
                                 "branches": [], "disclaimer": DISCLAIMER}, "fallback": True})


def _generate_path(user_id, role_id, horizon, weekly, priority):
    user = _user_row(user_id)
    if not user:
        raise ValueError("USER_NOT_FOUND")
    roles = q("SELECT * FROM ref_roles WHERE role_id = %s", (role_id,))
    if not roles:
        raise ValueError("ROLE_NOT_FOUND")
    scores, _ = _effective_scores(user_id)
    mappings = q("SELECT * FROM ref_role_skills WHERE role_id = %s", (role_id,))
    skill_names = {r["skill_id"]: r["name"] for r in q("SELECT skill_id, name FROM ref_skills")}

    gaps = []
    for m in mappings:
        current = rnd(scores.get(m["skill_id"], 0))
        gap = rnd(max(0.0, float(m["required_score"]) - current))
        gaps.append({
            "skill_id": m["skill_id"], "skill_name": skill_names.get(m["skill_id"], ""),
            "current_score": current, "required_score": float(m["required_score"]), "gap": gap,
            "importance_weight": float(m["importance_weight"]),
            "priority_score": rnd(gap * float(m["importance_weight"]), 3),
            "is_core": bool(m["is_core"]),
        })
    gaps.sort(key=lambda g: (g["current_score"], -g["priority_score"]))
    critical = [g for g in gaps if g["gap"] >= 20 or g["is_core"]][:8]
    minor = [g for g in gaps if g["gap"] < 20 and not g["is_core"]][:8]
    top6 = gaps[:6]

    profile = q("SELECT * FROM user_profiles WHERE external_user_id = %s", (user_id,)) or [{}]
    resources = _resources_index()

    branches = [_build_branch(user, roles[0], horizon, weekly, priority, "fast_gap", top6, scores, resources, profile[0]),
                _build_branch(user, roles[0], horizon, weekly, priority, "project_driven", top6, scores, resources, profile[0])]
    return {
        **base(user["data_split"]),
        "user_id": user_id,
        "target_role_id": role_id,
        "target_role_name": roles[0]["name"],
        "gap_analysis": {"critical_gaps": critical, "minor_gaps": minor},
        "branches": branches,
        "generation_note": "路径仅为模拟规划；调用 manage_progress(action=activate_path) 后才记录激活状态。",
    }


def _resources_index():
    """resource.skill_mappings 结构（= RuntimeData.Resource 形状）。"""
    res_rows = q("SELECT * FROM ref_resources")
    maps = q("SELECT * FROM ref_resource_skills")
    out = {}
    for r in res_rows:
        item = dict(r)
        item["skill_mappings"] = [m for m in maps if m["resource_id"] == r["resource_id"]]
        out[r["resource_id"]] = item
    return list(out.values())


def _resource_rank(res, stage, branch):
    rtype = res["resource_type"] or ""
    type_pen = 0 if (branch == "project_driven" and any(k in rtype for k in ("project", "task", "practice"))) else 5
    stage_pen = 4 if (stage == "student" and res["difficulty"] == "advanced") else 0
    return type_pen + stage_pen + float(res["estimated_hours"] or 0) / 100


def _task_for_gap(user, gap, branch, scores, resources, index):
    matched = [res for res in resources
               if (res["data_split"] != "test")
               and any(m["skill_id"] == gap["skill_id"] for m in res["skill_mappings"])
               and float(res["prerequisite_score"] or 0) <= scores.get(gap["skill_id"], 0) + 15]

    def _preferred(res):
        rtype = (res["resource_type"] or "").lower()
        if branch == "project_driven":
            return any(k in rtype for k in ("project", "task", "practice"))
        return "project" not in rtype

    preferred = [res for res in matched if _preferred(res)]
    candidates = preferred or matched
    stage = user.get("stage") or "student"
    candidates = sorted(candidates, key=lambda r: _resource_rank(r, stage, branch))
    res = candidates[0] if candidates else None
    suffix = "F" if branch == "fast_gap" else "P"
    return {
        "task_id": f"TASK-{user['external_user_id'][5:]}-{suffix}-{index + 1:02d}",
        "title": (res["title"] if res else f"{gap['skill_name']}可验证练习"),
        "task_type": (res["resource_type"] if res else ("project" if branch == "project_driven" else "practice")),
        "difficulty": (res["difficulty"] if res else ("beginner" if gap["current_score"] < 40 else "intermediate")),
        "estimated_hours": min(float((res or {}).get("estimated_hours") or (24 if branch == "project_driven" else 10)),
                               80 if branch == "project_driven" else 48),
        "skill_id": gap["skill_id"],
        "resource_id": (res["resource_id"] if res else None),
        "provider": (res["provider"] if res else None),
        "resource_url": (res["url"] if res else None),
        "status": "pending",
    }


def _build_branch(user, role, horizon, weekly, priority, branch, gaps, scores, resources, profile):
    ordered = sorted(gaps, key=lambda g: -g["gap"]) if branch == "project_driven" else gaps
    tasks = [_task_for_gap(user, g, branch, scores, resources, i) for i, g in enumerate(ordered)]
    phase_titles = (["核心短板补齐", "技能练习与验证", "岗位综合验证"] if branch == "fast_gap"
                    else ["小项目起步", "综合项目交付", "作品集与模拟面试"])
    months = horizon * 12
    phases = []
    for i in range(3):
        phase_tasks = [t for idx, t in enumerate(tasks) if idx % 3 == i]
        dur = months - (months // 3) * 2 if i == 2 else months // 3
        phases.append({
            "phase_order": i + 1, "title": phase_titles[i], "duration_months": dur,
            "milestones": [f"完成{t['title']}并留存可验证产出" for t in phase_tasks],
            "tasks": phase_tasks,
        })
    total_hours = rnd(sum(t["estimated_hours"] for t in tasks))
    ref = q("SELECT path_id FROM career_paths WHERE external_user_id = %s AND target_role_id = %s LIMIT 1",
            (user["external_user_id"], role["role_id"]))
    rid = f"{user['external_user_id'][5:]}-{role['role_id']}-{priority}-{horizon}Y-{weekly}H-{branch}".upper()
    return {
        "path_id": f"GEN-{rid}",
        "branch_type": branch,
        "title": f"{role['name']}{'快速补差' if branch == 'fast_gap' else '项目驱动'}路线",
        "target_role_id": role["role_id"], "target_role_name": role["name"],
        "horizon_years": horizon, "weekly_hours": weekly,
        "reference_path_id": (ref[0]["path_id"] if ref else None),
        "phases": phases,
        "total_estimated_hours": total_hours,
        "constraint_checks": {
            "within_weekly_limit": total_hours <= weekly * 52 * horizon,
            "within_horizon": sum(p["duration_months"] for p in phases) == horizon * 12,
            "has_verifiable_deliverables": all(len(p["milestones"]) > 0 for p in phases),
        },
    }


@app.route("/api/v1/progress/path/activate", methods=["POST"])
def path_activate():
    body = request.get_json(force=True, silent=True) or {}
    user_id, path_id = body.get("user_id"), body.get("path_id")
    # 与 MCP 一致：activate 只接受本进程 generate 出来的路径
    path = next((p for p in ACTIVE_PATHS.values() if p["path_id"] == path_id and p["_uid"] == user_id), None)
    if path is None:
        # 允许前端把刚 generate 的完整对象回传（幂等重激活）
        if isinstance(body.get("active_path"), dict) and body["active_path"].get("path_id") == path_id:
            path = dict(body["active_path"], _uid=user_id)
        else:
            return jsonify({"error": {"code": "PATH_NOT_FOUND", "message": "路径不存在或不属于该用户，请先调用 generate_career_path"}}), 404
    ACTIVE_PATHS[user_id] = path
    return jsonify({"data": dict(base(), **{"user_id": user_id, "active_path": path})})


@app.route("/api/v1/progress/tasks/<task_id>", methods=["PATCH"])
def update_task(task_id):
    body = request.get_json(force=True, silent=True) or {}
    status = body.get("status", "pending")
    if status not in ("pending", "in_progress", "completed", "skipped"):
        return jsonify({"error": {"code": "INVALID_STATUS", "message": f"不支持的状态 {status}"}}), 400
    TASK_UPDATES[task_id] = {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}
    return jsonify({"data": {"task_id": task_id, "status": status,
                             "updated_at": TASK_UPDATES[task_id]["updated_at"]}})


# ---- 场景（= service.ts evaluateScenario / publicScenario / scoreScenario） --
def _public_scenario(s):
    return {k: s[k] for k in ("scenario_id", "module_id", "module_name", "title", "difficulty",
                              "target_role_id", "target_user_stage", "context", "initial_prompt",
                              "privacy_focus")}


@app.route("/api/v1/scenario", methods=["GET"])
def scenario_list():
    user_id = request.args.get("user_id")
    module_id = request.args.get("module_id")
    difficulty = request.args.get("difficulty")
    sql = "SELECT * FROM scenario_cases WHERE data_split <> 'test'"
    args = []
    if module_id:
        sql += " AND module_id = %s"
        args.append(module_id)
    if difficulty:
        sql += " AND difficulty = %s"
        args.append(difficulty)
    try:
        rows = q(sql + " ORDER BY scenario_id", args)
        return jsonify({"data": dict(base(), **{"action": "list", "count": len(rows),
                                                "scenarios": [_public_scenario(r) for r in rows]})})
    except Exception as e:
        return jsonify({"error": {"code": "DB_ERROR", "message": str(e)[:200]}}), 500


@app.route("/api/v1/scenario/start", methods=["POST"])
def scenario_start():
    body = request.get_json(force=True, silent=True) or {}
    user_id, scenario_id = body.get("user_id"), body.get("scenario_id")
    rows = q("SELECT * FROM scenario_cases WHERE scenario_id = %s AND data_split <> 'test'", (scenario_id,))
    if not rows:
        return jsonify({"error": {"code": "SCENARIO_NOT_FOUND", "message": f"未找到场景 {scenario_id}"}}), 404
    session_id = f"SESSION-{uuid.uuid4()}"
    now = datetime.now(timezone.utc)
    SESSIONS[session_id] = {"user_id": user_id, "scenario_id": scenario_id, "status": "in_progress",
                            "started_at": now, "completed_at": None, "responses": []}
    try:
        execute("INSERT INTO scenario_sessions (session_id, external_user_id, scenario_id, status, started_at) "
                "VALUES (%s, %s, %s, 'in_progress', %s)",
                (session_id, user_id, scenario_id, now.replace(tzinfo=None)))
    except Exception:
        pass  # 库写失败不影响演示会话（内存态为准，与 MCP overlay 同哲学）
    return jsonify({"data": dict(base(), **{"action": "start", "session_id": session_id,
                                            "scenario": _public_scenario(rows[0])})})


SYNONYMS = {
    "目标": ["目标", "需求", "结果"], "截止": ["截止", "期限", "时间"], "负责人": ["负责人", "责任人", "谁负责"],
    "记录": ["记录", "纪要", "文档"], "同步": ["同步", "沟通", "跟进"], "来源": ["来源", "引用", "核验"],
    "隐私": ["隐私", "脱敏", "授权", "最小必要"], "风险": ["风险", "影响", "备份"], "反馈": ["反馈", "复盘", "改进"],
}


def score_scenario(scenario, response):
    """= service.ts scoreScenario()（逐行移植：同义词命中 / 五维规则 / 红旗扣分）。"""
    text = re.sub(r"\s+", "", response.lower())
    expected = [a.strip() for a in (scenario["expected_actions"] or "").split("|") if a.strip()]
    red_flags = [f.strip() for f in (scenario["red_flags"] or "").split("|") if f.strip()]

    def hit_action(action):
        if re.sub(r"\s+", "", action).lower() in text:
            return True
        return any((key in action) and any(w in text for w in words)
                   for key, words in SYNONYMS.items())

    hits = [a for a in expected if hit_action(a)]
    missing = [a for a in expected if a not in hits]
    flag_hits = [f for f in red_flags if f.replace(" ", "").lower() in text]

    clarification = 20 if any(c in response for c in ("?", "?", "确认", "澄清", "请问", "了解")) else \
        (12 if any(any(k in a for k in ("澄清", "确认", "询问")) for a in hits) else 4)
    privacy_words = ["隐私", "脱敏", "授权", "权限", "来源", "核验", "最小必要"]
    evidence_privacy = 20 if any(w in text for w in privacy_words) else \
        (4 if (scenario.get("privacy_focus") in ("high", "strict")) else 12)
    collaboration = 20 if any(w in text for w in ("负责人", "同步", "协作", "沟通", "共识")) else 8
    reflection = 15 if any(w in text for w in ("复盘", "反思", "改进", "下一次", "跟进")) else 5
    task_completion = rnd(25 * len(hits) / max(1, len(expected)))
    penalty = min(30, len(flag_hits) * 10)
    total = clamp(task_completion + clarification + evidence_privacy + collaboration + reflection - penalty)
    return {
        "overall_score": rnd(total),
        "dimensions": {
            "task_completion": {"score": task_completion, "max_score": 25},
            "clarification": {"score": clarification, "max_score": 20},
            "evidence_and_privacy": {"score": evidence_privacy, "max_score": 20},
            "collaboration": {"score": collaboration, "max_score": 20},
            "reflection": {"score": reflection, "max_score": 15},
        },
        "matched_expected_actions": hits,
        "missing_expected_actions": missing,
        "red_flag_hits": flag_hits,
        "penalty": penalty,
        "evidence_excerpt": response[:300],
        "highlights": [f"已覆盖：{a}" for a in hits[:3]],
        "improvement_suggestions": [f"建议补充：{a}" for a in missing[:3]] +
                                   (["避免上述风险行为，并说明替代做法"] if flag_hits else []),
        "proposed_profile_updates": [
            {"dimension_id": "DIM-06", "suggested_delta": 2 if total >= 80 else 0,
             "reason": "问题拆解与任务完成表现"},
            {"dimension_id": "DIM-07", "suggested_delta": 2 if total >= 80 else (1 if total >= 60 else 0),
             "reason": "沟通、协作与隐私表现"},
        ],
        "update_applied": False,
        "evaluation_rule": "预期行为命中+澄清/隐私/协作/反思规则-红旗行为扣分",
    }


@app.route("/api/v1/scenario/evaluate", methods=["POST"])
def scenario_evaluate():
    body = request.get_json(force=True, silent=True) or {}
    session_id = body.get("session_id", "")
    response_text = (body.get("response_text") or "").strip()
    session = SESSIONS.get(session_id)
    if not session:
        # 允许前端刷新后重放：尝试从库恢复
        rows = q("SELECT * FROM scenario_sessions WHERE session_id = %s", (session_id,))
        if rows:
            r = rows[0]
            session = {"user_id": r["external_user_id"], "scenario_id": r["scenario_id"],
                       "status": r["status"], "started_at": r["started_at"],
                       "completed_at": r["completed_at"], "responses": []}
            SESSIONS[session_id] = session
    if not session:
        return jsonify({"error": {"code": "SESSION_NOT_FOUND", "message": f"未找到场景会话 {session_id}"}}), 404
    if session["status"] == "completed":
        return jsonify({"error": {"code": "SESSION_COMPLETED", "message": "该场景会话已完成"}}), 409
    if not response_text or len(response_text) > 5000:
        return jsonify({"error": {"code": "INVALID_RESPONSE", "message": "回复长度必须为1至5000字"}}), 400
    rows = q("SELECT * FROM scenario_cases WHERE scenario_id = %s", (session["scenario_id"],))
    evaluation = score_scenario(rows[0], response_text)
    session["responses"].append({"response_text": response_text,
                                 "submitted_at": datetime.now(timezone.utc).isoformat(),
                                 "evaluation": evaluation})
    session["status"] = "completed"
    session["completed_at"] = datetime.now(timezone.utc)
    try:
        execute("UPDATE scenario_sessions SET status='completed', completed_at=%s, evaluation=%s "
                "WHERE session_id=%s",
                (session["completed_at"].replace(tzinfo=None),
                 json.dumps({"responses": session["responses"]}, ensure_ascii=False),
                 session_id))
    except Exception:
        pass
    return jsonify({"data": dict(base(), **{"action": "submit_and_evaluate",
                                            "session_id": session_id,
                                            "scenario_id": session["scenario_id"], **evaluation})})


if __name__ == "__main__":
    try:
        get_conn()
        print(f"[a02] MySQL connected: {DB_CONF['database']} (db_mode=True)")
    except Exception as e:
        print(f"[a02] MySQL unavailable, fallback to MOCK: {e}")
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", "3000")))
