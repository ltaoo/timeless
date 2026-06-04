# 页面标准写法

每个页面由两个文件组成：**Model 文件**（业务逻辑）+ **View 文件**（视图渲染）。

## props 类型

页面组件和 Model 函数的 `props` 参数类型为 `ViewComponentProps`（定义在 `apps/web-shadcn/types/global.d.ts`）：

```ts
type ViewComponentProps = {
  view: RouteViewCore;        // 当前路由视图节点
  views: Record<PageKey, any>; // 所有路由视图
  history: HistoryCore;       // 路由历史控制器
  app: ApplicationModel;      // 应用实例
  client: HttpClient;         // HTTP 客户端
  storage: StorageCore;       // 本地存储
};
```

**所有页面函数必须用 JSDoc 标注 props 类型**：

```js
/** @param {ViewComponentProps} props */
export default function HomePageView(props) { /* ... */ }

/** @param {ViewComponentProps} props */
export function HomePageModel(props) { /* ... */ }
```

---

## 文件命名

```
pages/
  home/
    index.js                    ← View 文件（默认导出页面组件）
    index.model.js              ← Model 文件（导出 ViewModel 函数）
  settings/
    index.js
    index.model.js
```

子页面同理：
```
pages/home/
  index.download_task.js        ← View
  index.download_task.model.js  ← Model
```

---

## Model 文件（`*.model.js`）

Model 持有所有业务状态、UI Core 实例、方法和事件订阅。有两种模式：

### 模式一：defineModel（推荐，适合有 API 请求的复杂页面）

```js
// home.model.js
/** @param {ViewComponentProps} props */
export function HomePageModel(props) {
  // ===== 1. 响应式状态 =====
  const loading_ = ref(false);
  const items_ = refarr([]);
  const count_ = ref(0);
  const keyword_ = ref("");

  // ===== 2. 接口请求 =====
  const services = {
    list: new Timeless.kit.RequestCore(
      (params) => request.get("/api/items", params),
      { client },
    ),
    delete: new Timeless.kit.RequestCore(
      (id) => request.post("/api/items/delete", { id }),
      { client },
    ),
  };
  const list$ = new Timeless.kit.ListCore(services.list, { pageSize: 20 });

  // ===== 3. UI Core 实例 =====
  const view_page$ = new Timeless.ui.ScrollViewCore({});
  const search_input$ = new Timeless.ui.InputCore({
    placeholder: "搜索...",
    onChange(v) { keyword_.as(v); },
  });
  const search_btn$ = new Timeless.ui.ButtonCore({
    async onClick() { await methods.search(); },
  });
  const delete_dialog$ = new Timeless.ui.DialogCore();

  // ===== 4. 导出的状态 =====
  const state = {
    loading: loading_,
    items: items_,
    count: count_,
  };

  // ===== 5. 导出的 UI =====
  const ui = {
    view_page$,
    search_input$,
    search_btn$,
    delete_dialog$,
  };

  // ===== 6. 方法 =====
  const methods = {
    async search() {
      loading_.as(true);
      const r = await list$.init({ keyword: keyword_.value });
      loading_.as(false);
      if (r.error) return;
      items_.as(list$.response.dataSource || []);
      count_.as(list$.response.total);
    },
    async deleteItem(item) {
      const r = await services.delete.run(item.id);
      if (r.error) return;
      items_.remove((t) => t.id === item.id);
      count_.decrement();
    },
    async init() {
      await methods.search();
    },
  };

  // ===== 7. 事件监听 =====
  const listeners = [
    list$.onDataSourceAdded((newItems) => {
      items_.push(...newItems);
    }),
  ];

  // ===== 8. 返回 defineModel =====
  return defineModel({
    state,
    methods,
    ui,
    services,
    listeners,
  });
}
```

### 模式二：Timeless.base() 事件总线（适合纯前端状态管理、无 API 请求的场景）

参考 `packages/base/src/base.ts` 中 `HomeActionCreatePageViewModel` 模式：

```js
// settings.model.js
/** @param {ViewComponentProps} props */
export function SettingsPageModel(props) {
  // 内部状态（非响应式，通过事件通知变化）
  let _state = {
    theme: "light",
    language: "zh",
    notifications: true,
  };

  // 事件总线
  const bus = Timeless.base();

  // 方法
  const methods = {
    refresh() {
      bus.emit("StateChange", { ..._state });
    },
    setTheme(theme) {
      _state = { ..._state, theme };
      methods.refresh();
    },
    setLanguage(lang) {
      _state = { ..._state, language: lang };
      methods.refresh();
    },
    toggleNotifications() {
      _state = { ..._state, notifications: !_state.notifications };
      methods.refresh();
    },
  };

  // UI Core
  const ui = {
    theme_select$: new Timeless.ui.SelectCore({
      defaultValue: _state.theme,
      options: [
        new Timeless.ui.SelectItemCore({ label: "浅色", value: "light" }),
        new Timeless.ui.SelectItemCore({ label: "深色", value: "dark" }),
        new Timeless.ui.SelectItemCore({ label: "跟随系统", value: "system" }),
      ],
      onChange(v) { methods.setTheme(v); },
    }),
  };

  return {
    get state() {
      return { ..._state };
    },
    methods,
    ui,
    onStateChange(handler) {
      return bus.on("StateChange", handler);
    },
    destroy() {
      bus.destroy();
    },
  };
}
```

### 模式三：简单页面（只有 UI Core，无复杂状态）

```js
// form.model.js
export function FormPageModel() {
  const name_field$ = new Timeless.ui.SingleFieldCore({
    label: "名称",
    name: "name",
    input: new Timeless.ui.InputCore({ placeholder: "请输入名称" }),
    rules: [{ required: true }],
  });
  const form$ = new Timeless.ui.ObjectFieldCore({
    fields: { name: name_field$ },
  });
  const submit_btn$ = new Timeless.ui.ButtonCore({
    async onClick() {
      const r = await form$.validate();
      if (r.error) return;
      console.log(r.data);
    },
  });

  return {
    ui: { name_field$, form$, submit_btn$ },
  };
}
```

---

## View 文件（`*.js`）

View 文件负责实例化 Model、组装布局、绑定生命周期：

```js
// home.js
import { HomePageModel } from "./home.model.js";

// 子组件（可选，复杂页面拆分子组件）
function ItemCard(props) {
  const { item, vm$ } = props;
  return View({ class: "p-3 border rounded" }, [
    View({ class: "font-medium" }, [computed(item, (t) => t.name)]),
    Button({
      store: new Timeless.ui.ButtonCore({
        size: "sm",
        variant: "ghost",
        onClick() { vm$.methods.deleteItem(item); },
      }),
    }, ["删除"]),
  ]);
}

// 页面组件（默认导出）
/** @param {ViewComponentProps} props */
export default function HomePageView(props) {
  // 1. 实例化 Model
  const vm$ = HomePageModel(props);

  // 2. 返回视图，绑定 onMounted 调用 init
  return ScrollView({
    class: "p-6",
    store: vm$.ui.view_page$,
    onMounted() {
      vm$.methods.init();
    },
  }, [
    // 搜索栏
    Flex({ class: "mb-4 gap-2" }, [
      Input({ store: vm$.ui.search_input$ }),
      Button({ store: vm$.ui.search_btn$ }, ["搜索"]),
    ]),

    // 列表
    For({
      each: vm$.state.items,
      render(item) {
        return ItemCard({ item, vm$ });
      },
    }),

    // 空状态
    Show({
      when: computed(vm$.state.count, (d) => d === 0),
      ok() {
        return [View({ class: "text-center text-zinc-400 py-8" }, ["暂无数据"])];
      },
    }),

    // 弹窗
    Dialog({ store: vm$.ui.delete_dialog$ }, ["确认删除？"]),
  ]);
}
```

### View 使用 base() 模式的 Model

当 Model 使用 `Timeless.base()` 事件总线时，View 需要手动订阅 `onStateChange`：

```js
import { SettingsPageModel } from "./settings.model.js";

/** @param {ViewComponentProps} props */
export default function SettingsPageView(props) {
  const vm$ = SettingsPageModel(props);

  // 用 refobj 包装初始状态，订阅变化
  const state_ = refobj(vm$.state);
  const unsub = vm$.onStateChange((v) => {
    state_.as(v);
  });

  return ScrollView({
    class: "p-6",
    onUnmounted() {
      unsub();        // 清理订阅
      vm$.destroy();  // 销毁事件总线
    },
  }, [
    View({}, [
      "当前主题：",
      computed(state_, (s) => s.theme),
    ]),
    Select({ store: vm$.ui.theme_select$ }),
  ]);
}
```

---

## 选择哪种模式？

| 场景 | 推荐模式 |
|------|---------|
| 有 API 请求、列表分页、CRUD 操作 | `defineModel` + `RequestCore` + `ListCore` |
| 纯前端状态管理、配置页、设置页 | `Timeless.base()` 事件总线 |
| 只有表单提交、无复杂状态 | 简单返回 `{ ui }` |

---

## 关键约定

1. **Model 函数命名**：`XxxPageModel` 或 `XxxViewModel`，接收 `props` 参数
2. **props 类型标注**：必须用 `/** @param {ViewComponentProps} props */` JSDoc 标注（类型定义在 `apps/web-shadcn/types/global.d.ts`）
3. **UI Core 命名**：以 `$` 结尾，如 `search_btn$`、`delete_dialog$`
3. **内部响应式变量命名**：以 `_` 结尾，如 `loading_`、`items_`（区别于导出的 state）
4. **View 默认导出**：`export default function XxxPageView(props)`
5. **生命周期**：在 View 的 `onMounted` 中调用 `vm$.methods.init()`
6. **清理**：base() 模式需在 `onUnmounted` 中调用 `unsub()` 和 `vm$.destroy()`；defineModel 模式由框架自动处理

---

## 完整参考

- defineModel 完整示例：`apps/web-shadcn/src/pages/home/index.download_task.model.js` + `index.download_task.js`
- base() 事件总线示例：`apps/web-shadcn/src/pages/home/index.llm.js`（LLMStoreModel）
- 表单验证示例：`apps/web-shadcn/src/pages/home/index.validate.model.js` + `index.validate.js`
- base.ts 源码：`packages/base/src/base.ts`
