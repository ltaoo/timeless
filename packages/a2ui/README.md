# @timeless/a2ui

Timeless 实现的 [A2UI v0.9.1](https://a2ui.org/specification/v0.9.1-a2ui/) 客户端。消息结构直接由官方 JSON Schema 校验；默认提供 Basic Catalog 的 18 个组件和 14 个函数。

## 使用

```ts
import { render } from "@timeless/timeless-dom";
import { renderMessages, BASIC_CATALOG_ID } from "@timeless/a2ui";

const renderer = renderMessages(
  [
    {
      version: "v0.9.1",
      createSurface: {
        surfaceId: "form",
        catalogId: BASIC_CATALOG_ID,
        sendDataModel: true,
      },
    },
    {
      version: "v0.9.1",
      updateComponents: {
        surfaceId: "form",
        components: [
          { id: "root", component: "Column", children: ["name", "save"] },
          {
            id: "name",
            component: "TextField",
            label: "Name",
            value: { path: "/name" },
          },
          {
            id: "save",
            component: "Button",
            child: "save-label",
            action: {
              event: { name: "save", context: { name: { path: "/name" } } },
            },
          },
          { id: "save-label", component: "Text", text: "Save" },
        ],
      },
    },
    {
      version: "v0.9.1",
      updateDataModel: { surfaceId: "form", value: { name: "Alice" } },
    },
  ],
  {
    onClientMessage(message, metadata) {
      // Send through the application's transport; metadata is separate from the envelope.
      console.log(message, metadata);
    },
    onOpenUrl: (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
  },
);

render(renderer.element, document.querySelector("#app"));
renderer.processMessage({
  version: "v0.9.1",
  updateDataModel: { surfaceId: "form", path: "/name", value: "Bob" },
});
// Call renderer.destroy() when the owning view is removed.
```

`A2UIRenderer.processMessage` 接受四类消息：`createSurface`、`updateComponents`、`updateDataModel`、`deleteSurface`。必须先创建 Surface；重复创建和未注册 Catalog 都会报错。顶层组件 ID 为 `root`，未到达的组件和数据引用等待后续消息补齐。

每个 Surface 独立保存组件和数据。组件更新按 ID 替换定义；数据更新使用 JSON Pointer，支持 `~0`/`~1` 转义和模板内相对路径。缺省路径表示整个数据模型；缺省 `value` 删除目标，数组删除保留索引。输入立即写入本地模型，不自动发送网络请求。点击 Action 时才解析 context，输出官方 `action` 消息。

`onClientMessage` 的第二个参数承载能力声明及数据模型元数据；只有 `sendDataModel: true` 的目标 Surface 会包含自身模型，其他 Surface 的数据不会附带发送。校验失败输出官方 `VALIDATION_FAILED` 消息，直接调用 `processMessage` 同时抛出异常。

## 流与生命周期

```ts
import { renderStream } from "@timeless/a2ui";
const renderer = renderStream("/ui", {
  format: "jsonl",
  onError: console.error,
});
// Default format is SSE via EventSource; useFetch enables Fetch-based SSE.
// render(renderer.element, container);
// renderer.abort() cancels the stream; renderer.destroy() also releases the view/model.
```

支持分块 UTF-8、SSE 多行 `data:`、JSONL 和取消读取。传输封装不实现 A2A/AG-UI 会话；应用通过 `processMessage` 和 `onClientMessage` 对接自己的传输层。

## Catalog 扩展

`createBasicCatalog({ components, onOpenUrl })` 可覆盖标准组件的可信本地实现；使用 `new A2UIRenderer({ catalogs: [catalog] })` 注入 Catalog。覆盖示例：

```ts
import { View, Text } from "@timeless/timeless";
import { A2UIRenderer, createBasicCatalog } from "@timeless/a2ui";
const catalog = createBasicCatalog({
  components: {
    Text: (context) =>
      View(
        {
          attributes: { n: `custom-text:${context.definition.id}` },
        },
        [
          Text(
            context.bind(context.definition.text, (value) =>
              String(value ?? ""),
            ),
          ),
        ],
      ),
  },
});
const renderer = new A2UIRenderer({ catalogs: [catalog] });
```

新增组件/函数需要新的 Catalog ID、与官方 Catalog 结构一致的完整 Schema，以及对应的 `components`/`functions` 本地实现。Catalog 按渲染器实例隔离，不远程下载代码。View 通过 context 的绑定、输入、子组件和清理接口访问 Model；业务状态由 Model 保存。函数调用和 `formatString` 仅执行注册函数，不执行 JavaScript。`openUrl` 仅允许绝对 HTTP(S) URL，宿主负责安全打开窗口。

## 版本与迁移

官方 v0.9.1 Schema 同时接受 `v0.9` 和 `v0.9.1`；默认注册这两个版本的 Basic Catalog URL。不支持 v0.8 或 v1.0 Candidate。

原有 `UINode`、`StreamOp`、`applyOps`、`renderSchema` 和全局 `registerComponents` 已移除。服务端改为发送四类官方消息；组件从嵌套树改为 ID 引用；事件改为 `action.event` 或 `action.functionCall`；扩展组件使用实例 Catalog。

默认 Web 组件采用 Timeless 基础控件。Text 支持安全的粗体、斜体、行内代码及标题标记；其余 Markdown 保留为文本。Icon 映射到宿主图标集，缺失时显示占位图标。日期格式支持 `y/yy/yyyy`、`M/MM/MMM/MMMM`、`d/dd`、`E/EEE/EEEE`、`h/hh/H/HH`、`m/mm`、`s/ss`、`a` 与引号字面量；另接受官方示例中的 `YYYY` 作为年份。其他日期格式 token 明确报错。

## 验证

```sh
pnpm --filter ./packages/a2ui run typecheck
pnpm --filter ./packages/a2ui run test
pnpm build
```

测试包含原样保存的官方 Schema 用例，以及数据绑定、模板、事件、DOM 更新、流和清理测试。根构建发布 `timeless.a2ui.umd.min.js`，浏览器先加载 core 和 DOM，再通过 `Timeless.a2ui` 使用；构建同时检查重复依赖和 UMD 加载。
