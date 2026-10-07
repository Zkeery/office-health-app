# 工位行动 · 文档

| 想了解什么 | 从这里看 |
| --- | --- |
| 安装、运行与操作流程 | [项目首页](../README.md) |
| 配置地点搜索与附近查询 | [高德地图配置](amap-setup.md) |
| 查看页面实现 | [页面源码](../src/pages/) |
| 检查预算、餐单和记录规则 | [业务回归检查](../tests/business.test.mjs) |

在仓库根目录运行 `node --test tests/business.test.mjs` 可检查业务规则；`npm run build` 构建应用，`npm run lint` 检查代码。

<details>
<summary>产品设计与开发记录</summary>

- [产品需求文档](PRD/PRD.md)：包含当前功能和后续规划，具体区分以文档中的实现边界为准。
- [历史验证记录](verification-2026-09-09.md)：对应阶段的验证结果。
- [项目介绍](项目介绍/Office-Health-Broke-项目经历.md)与[用户验证口径](项目介绍/用户验证口径.md)：项目背景和证据说明。

</details>
