# 完整数据包获取说明

`v1.0-full` 含 500 名用户、1500 个岗位、600 项资源、20000 条成长事件和完整独立评测集。

为避免增加 Git 仓库体积，本目录不跟踪完整生成文件。请选择以下任一方式：

1. PR #1 合并并发布 `dataset-v1.2.0` 后，从团队仓库的 GitHub Release 下载 `A02_v1.0-full_data_schema-1.2.0_20260913.zip`，解压到本目录；
2. Release 发布前，在 `ai-career-dataset` 目录运行 `npm run generate`，本地生成相同数据。

目录名 `v1.0-full` 表示完整数据规模；包内 `schema_version=1.2.0` 表示当前数据契约版本。旧 `dataset-v1.0` Release 仅用于历史追溯，不再作为最新联调数据。

使用前运行 `npm run validate`，并将结果与 `reports/checksums.sha256` 对照。所有岗位、薪资和趋势均为模拟演示数据，不得作为真实市场统计使用。

