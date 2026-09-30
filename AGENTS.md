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

## 样式（主题）包

`shadcn`、`weui`、`bootstrap`、`material`、`fluent`、`animal` 是同一批组件的**多套视觉层**。
组件骨架来自 `@timeless/ui-primitive` + `@timeless/inner-vm`，**组件是共享的，
差别只在样式与 token**。

- 新增一套组件库（脚手架、token 双层设计、`data-tt-style` 作用域、模块骨架、
  构建注册、checklist、验证配方）：见 [`THEME_PACKAGE_GUIDE.md`](./THEME_PACKAGE_GUIDE.md)。
- 各库 token 规范：`packages/<lib>/THEME_DESIGN.md`。
- 每个库的用户手册 = 它自己的示例应用，用 `docs` 命令启动（产物过期会先自动构建）：

  ```bash
  pnpm run docs --lib=shadcn      # 3400   （或 pnpm --filter ./packages/<lib> run docs）
  pnpm run docs --lib=bootstrap   # 3401
  pnpm run docs --lib=material    # 3402
  pnpm run docs --lib=fluent      # 3403
  pnpm run docs --lib=animal      # 3404
  pnpm run docs --lib=weui        # 3405
  ```

  6 个站点按 antd 官网的组件分类组织，左侧是「分类 → 组件」两级菜单，每个分类一个独立
  路由页（`/home/<key>`）。新增库时照抄这套导航模型，见指南 §8.4 / §8.5。

`packages/findrssui`（`@timeless/findrssui`）**不属于上面这一批**：它从 findrss-reader 整体
迁入，自带实现、只有暗色一套预设、没有 `data-tt-style` 作用域、也没有 `docs` 站点（画廊是
findrss 仓自己的 `preview/`）。原仓引的是复制过去的**构建产物**（UMD + CSS），加载顺序必须排在
tree 运行时之后。见指南 §13。

几条硬约束（细节见指南）：

1. `@timeless/shadcn` / `@timeless/weui` 是**全局型**样式（有 `*` / `body` 规则），
   一个页面只加载一套；`bootstrap` / `material` / `fluent` / `animal` 走
   `[data-tt-style="<lib>"]` 作用域，**四套可同页共存**，但**不得**输出全局 `html` /
   `body` / `#root` / 无作用域 `*` 规则。改动作用域库样式后跑 `pnpm check:scope` 验证
   （脚本：`scripts/check-style-scope.mjs`，只覆盖 `SCOPED_LIBS` 里的库）。
2. 新库**只** external `@timeless/timeless`，不互相 import，不内嵌第三方 CSS
   （承上「分析发布产物中的重复依赖」一节）。
3. `packages/types/generate.ts` 里新库必须以 `namespace` + `globals: false` 注册，
   否则同名导出（`Button` / `Input` / `Card` …）会覆盖 shadcn 的全局类型。

## 组件分层：primitive 是 shape，宿主包是实现

`packages/primitive`（`@timeless/inner-primitive`）是所有组件的 **shape**：它回答的是
"当前框架包含了哪些组件"，而不是"这些组件在某个平台上怎么渲染"。每个组件的 VNode
工厂（`View`、`Text`、`Flex`、`Input`、`Portal`、`ListView` …）都在这里定义，并由
`packages/primitive/src/index.ts` 统一导出，所以框架声明的组件清单就是这份导出。

`packages/timeless-dom`、`packages/timeless-native` 是这些组件在宿主平台上的**具体实现**：

```text
packages/primitive/src/<分类>/<组件>.ts     ← shape：组件存在 + props/类型契约
        │
        ├── packages/timeless-dom/src/host/<组件>.ts       ← 浏览器 DOM 实现
        └── packages/timeless-native/src/host/<组件>.ts    ← Native 实现
```

宿主实现与 shape 按文件名对齐（`primitive/src/content/view.ts` ↔
`timeless-dom/src/host/view.ts`）。宿主包另外各自提供 `renderer/*`（挂载、HMR diff、
hydrate）和 `Platform` 实现，但组件形状本身不在这里定义。

### 由此推出的规则

1. 判断框架**有没有**某个组件，看 `packages/primitive` 的导出；判断某个**宿主平台是否已
   实现**，看该宿主包 `host/` 下有没有同名文件（native 目前比 dom 覆盖更少，是子集）。
2. 新增组件时，先在 `packages/primitive` 定义 shape，再在需要的宿主包 `host/` 下实现；
   没有 shape 的宿主实现不构成框架能力。
3. `packages/primitive` 不得直接使用 `document` / `window` / `HTMLElement` 等宿主 API，
   平台差异一律通过 `Platform` 接口注入：`src/platform.ts` 的 `setPlatform` / `getPlatform`
   默认值是 noop，`timeless-dom` 在入口处 `setPlatform` 注入浏览器实现。
4. 组合型组件（如 `floating/dialog`）在 primitive 内部基于更基础的 shape 组合而成
   （Dialog 用 `Box` / `ViewChildren` 组装），因此它同样是一份 shape，由各宿主通过底层
   shape 的实现间接渲染，不需要每个平台单独实现。`primitive` 与宿主包之间保持"一份
   shape、多份实现"：跨平台共有逻辑留在 primitive，需要宿主能力差异的部分才落到
   `host/`。
