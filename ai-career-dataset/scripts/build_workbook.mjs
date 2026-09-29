import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const FULL_CSV_DIR = path.join(ROOT, "data", "v1.0-full", "csv");
const REPORT_DIR = path.join(ROOT, "reports");
const OUTPUT_DIR = path.join(ROOT, "outputs", "quality-report");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "A02_模拟数据与质量报告_v1.2.0.xlsx");
const PREVIEW_DIR = path.join(REPORT_DIR, "workbook_previews");
const FONT = "Arial";
const COLORS = {
  navy: "#1F4E78",
  blue: "#2F75B5",
  teal: "#0F766E",
  amber: "#D97706",
  red: "#B91C1C",
  green: "#2E7D32",
  text: "#1F2937",
  muted: "#64748B",
  paleBlue: "#EAF2F8",
  paleTeal: "#E8F5F2",
  paleAmber: "#FFF4E5",
  paleRed: "#FDECEC",
  line: "#D9E2F3",
  white: "#FFFFFF",
};
const RESOURCE_MIX_LOOKUP = {
  "v0.2-seed": { verified_course_metadata: 6, public_catalog_topic_card: 12, synthetic_project: 24, synthetic_assessment: 12, synthetic_guide: 6 },
  "v0.5-core": { verified_course_metadata: 12, public_catalog_topic_card: 28, synthetic_project: 100, synthetic_assessment: 40, synthetic_guide: 20 },
};

function parseCsv(text) {
  const input = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length) {
    row.push(field.replace(/\r$/, ""));
    if (row.some((value) => value !== "")) rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

async function readCsv(filePath) {
  return parseCsv(await fs.readFile(filePath, "utf8"));
}

function truncate(value, limit = 120) {
  const text = String(value ?? "");
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function countBy(rows, field) {
  const counts = {};
  for (const row of rows) counts[row[field]] = (counts[row[field]] ?? 0) + 1;
  return counts;
}

function baseSheet(sheet, tabColor) {
  sheet.showGridLines = false;
  sheet.tabColor = tabColor;
}

function titleBlock(sheet, title, subtitle, lastColumn) {
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange(`A1:${lastColumn}1`).format.font = { name: FONT, size: 16, bold: true, color: COLORS.navy };
  sheet.getRange(`A2:${lastColumn}2`).format.font = { name: FONT, size: 9, italic: true, color: COLORS.muted };
  sheet.getRange(`A3:${lastColumn}3`).format.fill = COLORS.line;
  sheet.getRange(`A3:${lastColumn}3`).format.rowHeight = 3;
}

function styleHeader(range) {
  range.format = {
    fill: COLORS.navy,
    font: { name: FONT, size: 10, bold: true, color: COLORS.white },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: {
      bottom: { style: "thin", color: COLORS.white },
      right: { style: "thin", color: COLORS.white },
    },
  };
  range.format.rowHeight = 30;
}

function styleSection(range, fill = COLORS.paleBlue) {
  range.format = {
    fill,
    font: { name: FONT, size: 11, bold: true, color: COLORS.navy },
    borders: { bottom: { style: "thin", color: COLORS.line } },
  };
  range.format.rowHeight = 24;
}

function styleBody(range) {
  range.format.font = { name: FONT, size: 10, color: COLORS.text };
  range.format.verticalAlignment = "top";
}

const manifests = {};
const knowledgeCardsByVersion = {};
for (const version of ["v0.2-seed", "v0.5-core", "v1.0-full"]) {
  manifests[version] = JSON.parse(await fs.readFile(path.join(ROOT, "data", version, "manifest.json"), "utf8"));
  knowledgeCardsByVersion[version] = await readCsv(path.join(ROOT, "data", version, "csv", "knowledge_cards.csv"));
}
const validation = JSON.parse(await fs.readFile(path.join(REPORT_DIR, "validation_report.json"), "utf8"));
const users = await readCsv(path.join(FULL_CSV_DIR, "users.csv"));
const roles = await readCsv(path.join(FULL_CSV_DIR, "roles.csv"));
const expected = await readCsv(path.join(FULL_CSV_DIR, "golden_expected_results.csv"));
const sources = await readCsv(path.join(FULL_CSV_DIR, "source_registry.csv"));
const resources = await readCsv(path.join(FULL_CSV_DIR, "learning_resources.csv"));
const dataDictionary = await readCsv(path.join(ROOT, "schemas", "data_dictionary.csv"));
const manualReview = await readCsv(path.join(ROOT, "reviews", "golden_manual_review.csv"));
const roleNames = new Map(roles.map((row) => [row.role_id, row.name]));
const expectedByUser = new Map(expected.map((row) => [row.user_id, row]));
const reviewByUser = new Map(manualReview.map((row) => [row.user_id, row]));

const workbook = Workbook.create();
const overview = workbook.worksheets.add("总览");
const scale = workbook.worksheets.add("版本规模");
const golden = workbook.worksheets.add("黄金用户");
const evaluation = workbook.worksheets.add("评测覆盖");
const quality = workbook.worksheets.add("质量校验");
const sourceSheet = workbook.worksheets.add("来源台账");
const dictionary = workbook.worksheets.add("数据字典");

baseSheet(overview, COLORS.navy);
titleBlock(overview, "A02 模拟数据与质量报告", "面向团队联调、评测与答辩；岗位、薪资和趋势均为模拟演示数据", "H");
overview.getRange("A5:B11").values = [
  ["指标", "结果"],
  ["数据契约版本", validation.schema_version],
  ["自动验证", ""],
  ["已核验官方课程/专题页", validation.summary.verified_primary_resources],
  ["完整包用户", ""],
  ["完整包岗位", ""],
  ["完整包成长事件", ""],
];
overview.getRange("B7").formulas = [["=IF('质量校验'!B5=0,\"通过\",\"存在失败\")"]];
overview.getRange("B9").formulas = [["='版本规模'!B8"]];
overview.getRange("B10").formulas = [["='版本规模'!C8"]];
overview.getRange("B11").formulas = [["='版本规模'!E8"]];
styleHeader(overview.getRange("A5:B5"));
styleBody(overview.getRange("A6:B11"));
overview.getRange("B8:B11").format.numberFormat = "#,##0";
overview.getRange("A13").values = [["事实声明层级"]];
styleSection(overview.getRange("A13:H13"));
overview.getRange("A14:C17").values = [
  ["claim_level", "含义", "界面与答辩使用"],
  ["verified_primary", "逐页核验的官方页面元数据", "可展示来源机构和原始链接，不复制课程正文"],
  ["primary_derived", "参考官方分类后由团队改写或扩展", "必须说明映射、翻译或模拟假设"],
  ["synthetic", "固定规则生成的模拟记录", "必须标注演示数据，不能当作真实就业统计"],
];
styleHeader(overview.getRange("A14:C14"));
styleBody(overview.getRange("A15:C17"));
overview.getRange("A19").values = [["发布说明"]];
styleSection(overview.getRange("A19:H19"), COLORS.paleAmber);
const overviewNotes = [
  "自动检查已经覆盖规模、主外键、权重、分数、趋势、来源、隐私、公平性和可重复生成。",
  "22 条智慧教育平台课程或课程专题页已核验；98 条目录主题卡单独标记为团队派生。",
  "黄金案例自动预检完成，但仍需团队成员填写复核表并签字。",
  "真实用户反馈模板保持空白，不能用模拟记录替代第三周真实测试。",
];
overviewNotes.forEach((note, index) => {
  const row = 20 + index;
  overview.mergeCells(`A${row}:H${row}`);
  overview.getRange(`A${row}`).values = [[note]];
  overview.getRange(`A${row}:H${row}`).format.wrapText = true;
  overview.getRange(`A${row}:H${row}`).format.font = { name: FONT, size: 10, color: COLORS.text };
  overview.getRange(`A${row}:H${row}`).format.rowHeight = 24;
});
overview.getRange("A5:A11").format.font = { name: FONT, size: 10, bold: true, color: COLORS.text };
overview.getRange("B7").conditionalFormats.add("containsText", { text: "通过", format: { fill: COLORS.paleTeal, font: { color: COLORS.green, bold: true } } });
overview.getRange("B7").conditionalFormats.add("containsText", { text: "失败", format: { fill: COLORS.paleRed, font: { color: COLORS.red, bold: true } } });
overview.getRange("A1:H23").format.font.name = FONT;
overview.getRange("A:A").format.columnWidth = 28;
overview.getRange("B:B").format.columnWidth = 22;
overview.getRange("C:C").format.columnWidth = 56;
overview.getRange("D:H").format.columnWidth = 12;

baseSheet(scale, COLORS.blue);
titleBlock(scale, "分阶段数据规模", "种子包用于快速联调，核心包用于闭环联调，完整包用于性能与正式评测", "P");
const versionRows = ["v0.2-seed", "v0.5-core", "v1.0-full"].map((version) => {
  const tables = manifests[version].tables;
  return [version, tables.users.rows, tables.jobs.rows, tables.learning_resources.rows, tables.growth_events.rows, tables.trend_snapshots.rows, tables.scenario_cases.rows, tables.knowledge_cards.rows];
});
scale.getRange("A5:H8").values = [
  ["版本", "用户", "岗位", "学习资源", "成长事件", "趋势快照", "场景案例", "知识卡片"],
  ...versionRows,
];
styleHeader(scale.getRange("A5:H5"));
styleBody(scale.getRange("A6:H8"));
scale.getRange("B6:H8").format.numberFormat = "#,##0";
scale.getRange("A11").values = [["学习资源构成"]];
styleSection(scale.getRange("A11:F11"));
const resourceCountRows = [
  ["已核验课程/专题页", "verified_course_metadata"],
  ["公开目录派生主题卡", "public_catalog_topic_card"],
  ["模拟实践项目", "synthetic_project"],
  ["模拟测评/训练", "synthetic_assessment"],
  ["模拟指南", "synthetic_guide"],
].map(([label, type]) => {
  const counts = {};
  for (const version of ["v0.2-seed", "v0.5-core", "v1.0-full"]) {
    const csvRows = version === "v1.0-full" ? resources : null;
    counts[version] = csvRows ? csvRows.filter((row) => row.resource_type === type).length : RESOURCE_MIX_LOOKUP[version][type];
  }
  return [label, counts["v0.2-seed"], counts["v0.5-core"], counts["v1.0-full"], type];
});
scale.getRange("A12:E17").values = [
  ["资源类别", "v0.2", "v0.5", "v1.0", "resource_type"],
  ...resourceCountRows,
];
styleHeader(scale.getRange("A12:E12"));
styleBody(scale.getRange("A13:E17"));
scale.getRange("B13:D17").format.numberFormat = "#,##0";
scale.getRange("A20").values = [["知识卡类别构成"]];
styleSection(scale.getRange("A20:G20"), COLORS.paleTeal);
const knowledgeCategoryRows = [
  ["技能等级", "skill_level", "技能证据与等级解释", "否"],
  ["学习资源", "learning_resource", "课程、任务与指南检索", "否"],
  ["直接岗位能力", "role_skill", "存在 role_skills 关系", "是"],
  ["相邻岗位能力", "role_adjacent_skill", "合成扩展，仅用于检索与路线探索", "否"],
  ["趋势解释", "trend_interpretation", "模拟趋势边界说明", "否"],
  ["伦理与隐私", "ethics_privacy", "数据使用边界", "否"],
].map(([label, category, semantics, scoreable]) => [
  label,
  countBy(knowledgeCardsByVersion["v0.2-seed"], "category")[category] ?? 0,
  countBy(knowledgeCardsByVersion["v0.5-core"], "category")[category] ?? 0,
  countBy(knowledgeCardsByVersion["v1.0-full"], "category")[category] ?? 0,
  category,
  scoreable,
  semantics,
]);
scale.getRange("A21:G27").values = [
  ["知识卡类别", "v0.2", "v0.5", "v1.0", "category", "参与匹配评分", "语义与用途"],
  ...knowledgeCategoryRows,
];
styleHeader(scale.getRange("A21:G21"));
styleBody(scale.getRange("A22:G27"));
scale.getRange("B22:D27").format.numberFormat = "#,##0";
const scaleChart = scale.charts.add("bar", scale.getRange("A5:D8"));
scaleChart.title = "用户、岗位和学习资源规模";
scaleChart.titleTextStyle.fontSize = 12;
scaleChart.titleTextStyle.typeface = FONT;
scaleChart.legend = { position: "top", textStyle: { typeface: FONT, fontSize: 10 } };
scaleChart.xAxis = { axisType: "textAxis", textStyle: { typeface: FONT, fontSize: 9 } };
scaleChart.yAxis = { numberFormatCode: "#,##0", numberFormatSourceLinked: false, textStyle: { typeface: FONT, fontSize: 9 } };
scaleChart.setPosition("J5", "P18");
const chartColors = [COLORS.blue, COLORS.teal, COLORS.amber];
scaleChart.series.items.forEach((series, index) => { series.fill = chartColors[index % chartColors.length]; });
scale.freezePanes.freezeRows(5);
scale.getRange("A:P").format.font.name = FONT;
scale.getRange("A:A").format.columnWidth = 26;
scale.getRange("B:H").format.columnWidth = 14;
scale.getRange("E:E").format.columnWidth = 28;
scale.getRange("F:F").format.columnWidth = 16;
scale.getRange("G:G").format.columnWidth = 40;

baseSheet(golden, COLORS.teal);
titleBlock(golden, "黄金用户案例", "12 名人工精修案例；自动预检已完成，人工签字状态来自 reviews/golden_manual_review.csv", "M");
const goldenUsers = users.filter((row) => row.is_golden === "true");
const goldenRows = goldenUsers.map((user) => {
  const result = expectedByUser.get(user.user_id);
  const review = reviewByUser.get(user.user_id);
  return [
    user.user_id,
    user.stage === "student" ? "高校生" : "职场新人",
    user.academic_or_job_status,
    roleNames.get(user.target_role_id),
    roleNames.get(user.secondary_role_id),
    Number(user.weekly_learning_hours),
    Number(result.expected_primary_rank),
    Number(result.initial_radar_average),
    Number(result.final_radar_average),
    Number(result.minimum_expected_growth),
    result.target_role_status === "current_best_match" ? "当前最佳匹配" : "目标岗需刷新证据",
    Number(result.expected_path_branches),
    review.status === "approved" ? "已签字" : "待团队签字",
  ];
});
golden.getRange("A5:M17").values = [
  ["用户ID", "人群", "当前状态", "目标岗位", "备选岗位", "每周小时", "目标岗排名", "初始雷达均分", "最终雷达均分", "最低增长", "目标状态", "路线数", "人工复核"],
  ...goldenRows,
];
styleHeader(golden.getRange("A5:M5"));
styleBody(golden.getRange("A6:M17"));
golden.getRange("F6:F17").format.numberFormat = "0";
golden.getRange("G6:G17").format.numberFormat = "0";
golden.getRange("H6:J17").format.numberFormat = "0.0";
golden.getRange("L6:L17").format.numberFormat = "0";
golden.getRange("M6:M17").conditionalFormats.add("containsText", { text: "待", format: { fill: COLORS.paleAmber, font: { color: COLORS.amber, bold: true } } });
golden.getRange("K6:K17").conditionalFormats.add("containsText", { text: "刷新", format: { fill: COLORS.paleBlue, font: { color: COLORS.blue, bold: true } } });
golden.freezePanes.freezeRows(5);
golden.freezePanes.freezeColumns(1);
golden.getRange("A:M").format.font.name = FONT;
golden.getRange("A:A").format.columnWidth = 15;
golden.getRange("B:B").format.columnWidth = 11;
golden.getRange("C:C").format.columnWidth = 18;
golden.getRange("D:E").format.columnWidth = 22;
golden.getRange("F:L").format.columnWidth = 14;
golden.getRange("M:M").format.columnWidth = 16;

baseSheet(evaluation, COLORS.amber);
titleBlock(evaluation, "独立评测覆盖", "完整评测使用 test 用户和测试岗位；开发和演示案例不参与正式指标调参", "F");
const fullTables = manifests["v1.0-full"].tables;
evaluation.getRange("A5:F11").values = [
  ["评测集", "案例数", "数据划分", "覆盖重点", "验收口径", "文件"],
  ["岗位匹配", fullTables.matching_eval.rows, "test", "100名用户×3岗位", "排序一致率与分数分项可复现", "matching_eval.csv"],
  ["路径约束", fullTables.path_eval.rows, "test", "2类人群×3岗位", "时间约束、首要差距、双分支", "path_eval.csv"],
  ["长期陪伴对话", fullTables.dialogue_eval.rows, "test", "学生/新人各75", "要求项命中且禁用模式不出现", "dialogue_eval.csv"],
  ["公平性反事实", fullTables.fairness_eval.rows, "test", "4类非评分属性", "匹配分差必须为0", "fairness_eval.csv"],
  ["隐私与越权", fullTables.privacy_security_eval.rows, "test", "10类风险", "执行安全动作且不执行禁用动作", "privacy_security_eval.csv"],
  ["知识检索", fullTables.retrieval_eval.rows, "test", "Top5检索", "目标卡片命中且引用来源ID", "retrieval_eval.csv"],
];
styleHeader(evaluation.getRange("A5:F5"));
styleBody(evaluation.getRange("A6:F11"));
evaluation.getRange("B6:B11").format.numberFormat = "#,##0";
evaluation.getRange("A13").values = [["说明"]];
styleSection(evaluation.getRange("A13:F13"), COLORS.paleAmber);
const evaluationNotes = [
  "匹配、路径与公平性文件嵌入测试用户的60项技能分快照，种子包和核心包也能独立执行冒烟评测。",
  "正式答辩指标应由系统运行结果回填，当前文件提供预期结果与验收规则，不伪造模型表现。",
  "知识库建议记录 Recall@5、命中率和引用正确率；匹配建议记录排序一致率和解释完整率。",
];
evaluationNotes.forEach((note, index) => {
  const row = 14 + index;
  evaluation.mergeCells(`A${row}:F${row}`);
  evaluation.getRange(`A${row}`).values = [[note]];
  evaluation.getRange(`A${row}:F${row}`).format.wrapText = true;
  evaluation.getRange(`A${row}:F${row}`).format.font = { name: FONT, size: 10, color: COLORS.text };
  evaluation.getRange(`A${row}:F${row}`).format.rowHeight = 28;
});
evaluation.getRange("A:F").format.font.name = FONT;
evaluation.getRange("A:A").format.columnWidth = 20;
evaluation.getRange("B:C").format.columnWidth = 13;
evaluation.getRange("D:D").format.columnWidth = 26;
evaluation.getRange("E:E").format.columnWidth = 42;
evaluation.getRange("F:F").format.columnWidth = 28;

baseSheet(quality, COLORS.green);
titleBlock(quality, "数据质量校验", "自动检查结果来自 reports/validation_report.json；待人工完成项不计为技术失败", "E");
const checkRows = validation.checks.map((row) => [
  row.version,
  row.check_id,
  row.severity === "warning" ? "人工待办" : "自动门槛",
  row.passed ? "通过" : row.severity === "warning" ? "待完成" : "失败",
  row.detail,
]);
const qualityEndRow = 10 + checkRows.length;
quality.getRange("A4:B7").values = [
  ["汇总", "数量"],
  ["失败项", ""],
  ["人工待完成", ""],
  ["已通过", ""],
];
styleHeader(quality.getRange("A4:B4"));
styleBody(quality.getRange("A5:B7"));
quality.getRange("B5").formulas = [[`=COUNTIF(D10:D${qualityEndRow},\"失败\")`]];
quality.getRange("B6").formulas = [[`=COUNTIF(D10:D${qualityEndRow},\"待完成\")`]];
quality.getRange("B7").formulas = [[`=COUNTIF(D10:D${qualityEndRow},\"通过\")`]];
quality.getRange(`A10:E${qualityEndRow}`).values = [
  ["版本", "检查ID", "类型", "结果", "说明"],
  ...checkRows,
];
styleHeader(quality.getRange("A10:E10"));
styleBody(quality.getRange(`A11:E${qualityEndRow}`));
quality.getRange(`D11:D${qualityEndRow}`).conditionalFormats.add("containsText", { text: "失败", format: { fill: COLORS.paleRed, font: { color: COLORS.red, bold: true } } });
quality.getRange(`D11:D${qualityEndRow}`).conditionalFormats.add("containsText", { text: "待完成", format: { fill: COLORS.paleAmber, font: { color: COLORS.amber, bold: true } } });
quality.getRange(`D11:D${qualityEndRow}`).conditionalFormats.add("containsText", { text: "通过", format: { fill: COLORS.paleTeal, font: { color: COLORS.green } } });
quality.freezePanes.freezeRows(10);
quality.freezePanes.freezeColumns(1);
quality.getRange(`A1:E${qualityEndRow}`).format.font.name = FONT;
quality.getRange("A:A").format.columnWidth = 17;
quality.getRange("B:B").format.columnWidth = 36;
quality.getRange("C:D").format.columnWidth = 14;
quality.getRange("E:E").format.columnWidth = 68;

baseSheet(sourceSheet, COLORS.navy);
titleBlock(sourceSheet, "来源与使用边界", "来源台账记录机构、许可、改写方式和核验日期；URL 为可追溯入口", "I");
sourceSheet.getRange("A4").values = [["来源框架"]];
styleSection(sourceSheet.getRange("A4:I4"));
const sourceRows = sources.map((row) => [
  row.source_id, row.title, row.organization, row.source_type, row.claim_level, row.license_scope,
  row.last_verified_at, row.transform_note, row.url,
]);
sourceSheet.getRange("A5:I13").values = [
  ["来源ID", "标题", "机构", "类型", "声明层级", "许可范围", "核验日期", "改写与使用说明", "URL"],
  ...sourceRows,
];
styleHeader(sourceSheet.getRange("A5:I5"));
styleBody(sourceSheet.getRange("A6:I13"));
const verifiedResources = resources.filter((row) => row.claim_level === "verified_primary");
sourceSheet.getRange("A15").values = [[`已核验课程与课程专题页（${verifiedResources.length}条）`]];
styleSection(sourceSheet.getRange("A15:I15"), COLORS.paleTeal);
const verifiedRows = verifiedResources.map((row) => [
  row.resource_id, row.title, row.provider, row.page_kind, row.verification_status, row.last_verified_at, row.metadata_scope, row.estimated_hours_is_simulated === "true" ? "是" : "否", row.url,
]);
const sourceCourseEndRow = 16 + verifiedRows.length;
sourceSheet.getRange(`A16:I${sourceCourseEndRow}`).values = [
  ["资源ID", "标题", "提供方", "页面类型", "核验状态", "核验日期", "保存范围", "时长为模拟估计", "URL"],
  ...verifiedRows,
];
styleHeader(sourceSheet.getRange("A16:I16"));
styleBody(sourceSheet.getRange(`A17:I${sourceCourseEndRow}`));
sourceSheet.getRange("A5:I13").format.wrapText = true;
sourceSheet.getRange(`A16:I${sourceCourseEndRow}`).format.wrapText = true;
sourceSheet.getRange(`A1:I${sourceCourseEndRow}`).format.font.name = FONT;
sourceSheet.getRange("A:A").format.columnWidth = 16;
sourceSheet.getRange("B:B").format.columnWidth = 38;
sourceSheet.getRange("C:C").format.columnWidth = 30;
sourceSheet.getRange("D:F").format.columnWidth = 18;
sourceSheet.getRange("G:G").format.columnWidth = 24;
sourceSheet.getRange("H:H").format.columnWidth = 46;
sourceSheet.getRange("I:I").format.columnWidth = 58;

baseSheet(dictionary, COLORS.muted);
titleBlock(dictionary, "数据字典", "字段类型、必填性、主键和示例由完整数据包自动生成", "I");
const dictionaryRows = dataDictionary.map((row) => [
  row.table_name,
  row.table_description,
  row.module_owner,
  row.field_name,
  row.data_type,
  row.required === "true" ? "是" : "否",
  row.primary_key === "true" ? "是" : "否",
  row.description,
  /^\d{4}-\d{2}-\d{2}/.test(row.example) ? `\u200B${truncate(row.example, 100)}` : truncate(row.example, 100),
]);
const dictionaryEndRow = 5 + dictionaryRows.length;
dictionary.getRange(`A5:I${dictionaryEndRow}`).values = [
  ["数据表", "表说明", "模块", "字段", "类型", "必填", "主键", "字段说明", "示例"],
  ...dictionaryRows,
];
styleHeader(dictionary.getRange("A5:I5"));
styleBody(dictionary.getRange(`A6:I${dictionaryEndRow}`));
dictionary.getRange(`A6:I${dictionaryEndRow}`).format.wrapText = true;
dictionary.freezePanes.freezeRows(5);
dictionary.freezePanes.freezeColumns(1);
dictionary.getRange(`A1:I${dictionaryEndRow}`).format.font.name = FONT;
dictionary.getRange("A:A").format.columnWidth = 26;
dictionary.getRange("B:B").format.columnWidth = 34;
dictionary.getRange("C:C").format.columnWidth = 16;
dictionary.getRange("D:D").format.columnWidth = 28;
dictionary.getRange("E:G").format.columnWidth = 11;
dictionary.getRange("H:H").format.columnWidth = 45;
dictionary.getRange("I:I").format.columnWidth = 38;

await fs.mkdir(PREVIEW_DIR, { recursive: true });
await workbook.recalculate();
const previewSpecs = [
  ["总览", "A1:H23", "overview.png"],
  ["版本规模", "A1:P27", "scale.png"],
  ["黄金用户", "A1:M17", "golden.png"],
  ["评测覆盖", "A1:F16", "evaluation.png"],
  ["质量校验", "A1:E35", "quality.png"],
  ["来源台账", `A1:I${sourceCourseEndRow}`, "sources.png"],
  ["数据字典", "A1:I35", "dictionary.png"],
];
for (const [sheetName, range, fileName] of previewSpecs) {
  const preview = await workbook.render({ sheetName, range, scale: 1.2, format: "png" });
  await fs.writeFile(path.join(PREVIEW_DIR, fileName), new Uint8Array(await preview.arrayBuffer()));
}

const overviewInspect = await workbook.inspect({
  kind: "table",
  range: "总览!A1:H23",
  include: "values,formulas",
  tableMaxRows: 25,
  tableMaxCols: 10,
});
const errorInspect = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
await fs.writeFile(path.join(REPORT_DIR, "workbook_inspection.txt"), `${overviewInspect.ndjson}\n${errorInspect.ndjson}\n`, "utf8");

await fs.mkdir(OUTPUT_DIR, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(OUTPUT_PATH);

console.log(JSON.stringify({
  status: "created",
  output: OUTPUT_PATH,
  sheets: previewSpecs.map(([sheetName]) => sheetName),
  preview_dir: PREVIEW_DIR,
}, null, 2));
