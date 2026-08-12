# Timeless 仓库开发约定

## 分析发布产物中的重复依赖

检查目标是根构建最终发布的浏览器产物，而不是简单比较所有
`packages/*/dist`。各 package 的独立产物可以用于单独发布或调试；只有
`scripts/build.js` 中 `ARTIFACTS` 收集到 `dist/timeless/<version>/` 的文件，
才属于会被一起加载、需要检查跨文件重复依赖的发布集合。

### 标准检查命令

执行完整生产构建：

```bash
pnpm build
```

根 `build` 脚本会在打包完成后自动执行：

```bash
node scripts/analyze-build.js
```

如果产物已经是最新的，也可以单独运行分析脚本。最终汇总报告位于：

```text
dist/timeless/<version>/bundle-analysis.json
```

每个接入分析插件的 package 还会生成原始模块图：

```text
packages/<package>/dist/bundle-analysis.json
```

### 通过标准

分析结果必须同时满足：

```json
{
  "ok": true,
  "duplicates": [],
  "opaque_workspace_bundles": []
}
```

- `duplicates` 为空：没有同一个 workspace package 或第三方依赖被内嵌到两个发布 JS 中。
- `opaque_workspace_bundles` 为空：聚合包没有从另一个 workspace package 的 `dist` 预构建文件再次打包。
- 命令输出包含 `Bundle dependency analysis passed: no duplicate dependencies.`。
- `pnpm build` 最终退出码为 `0`。

`external_imports` 表示运行时从其他发布文件取得的依赖，不属于当前文件内嵌的重复内容。

### 分析原理

`scripts/vite-plugin-bundle-analysis.ts` 在 UMD 的 `generateBundle` 阶段读取
Rollup/Rolldown 的 `output.modules`，按模块真实路径将内容归属到：

- workspace package，例如 `@timeless/inner-vm`；
- 第三方 package，例如 `mitt`、`dayjs`、`axios`；
- 当前 package 自身源码。

`scripts/analyze-build.js` 随后只读取最终发布清单中的 JS，并执行两类检查：

1. 同一个依赖是否出现在多个发布 JS 的模块图中；
2. 聚合包是否包含 `packages/<name>/dist/...`，因为预构建文件会隐藏其内部真实模块，可能导致重复检查漏报。

不要仅通过搜索压缩后的函数名或比较文件大小判断重复。压缩会改变符号，tree-shaking
也会让同一依赖在不同文件中呈现不同大小；应以构建器提供的模块图为准。

### 发现重复后的处理原则

1. 为依赖确定唯一的发布归属。通用 `inner-*` 通常由 `timeless.umd.min.js` 持有。
2. 由 core 提供稳定的直接或命名空间导出，例如 `Timeless.icons`、`Timeless.utils`。
3. shadcn、weui 等扩展 UMD 只 external `@timeless/timeless`，不要再次直接导入并内嵌同一个 `inner-*`。
4. 如果一个独立 UMD 的能力已经由 core 提供，不要再把该 UMD 加入 `scripts/build.js` 的 `ARTIFACTS`。
5. 聚合 core 应通过源码 alias 构建 workspace 依赖，避免从依赖的 `dist` 二次打包，以保证完整模块图可见。
6. 修改后重新执行完整 `pnpm build`，确认报告通过，并对按实际加载顺序组合的 UMD 做冒烟测试。

例如 `mitt` 应沿同一个实例逐层转导出：

```text
mitt -> @timeless/inner-base -> @timeless/inner-primitive -> @timeless/timeless
```

不要在 `@timeless/timeless` 入口再次直接从 `mitt` 创建另一条打包路径。
