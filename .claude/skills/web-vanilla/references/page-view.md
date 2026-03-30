# PageView 消费 Model

## 视图渲染 Model 状态

```js
import { HomePageViewModel } from "./index.model.js";

export default function HomePageView(props) {
  const { state, methods } = HomePageViewModel(props);

  // 页面加载时调用方法
  methods.fetchUsers();

  return ScrollView({ class: "p-6" }, [
    // 直接渲染 state 中的值（Ref 自动解包）
    View({}, [state.name]),

    // 渲染派生值用 computed
    View({}, [computed(state.users, (t) => t.length)]),

    // 条件渲染 loading（Ref 自动解包）
    Show({ when: state.loading }, h(View, {}, ["加载中..."])),
  ]);
}
```

## 完整示例

```js
// index.model.js
import { defineModel } from "@/biz/model.js";
import { ref, refarr } from "@/components/index.js";

export const HomePageViewModel = defineModel((props) => {
  const loading = ref(false);
  const users = refarr([]);

  const request = {
    list: new Timeless.kit.RequestCore(
      (params) => props.request.post("/api/user/list", params),
      {
        client: props.client,
        process(r) {
          if (r.error) return r.error;
          return Timeless.Result.Ok(r.data);
        },
      },
    ),
  };
  const ui = {
    view$: new Timeless.ui.ScrollViewCore({
      onReachBottom() {
        // ...
      },
    }),
    btn_refresh$: new Timeless.ui.ButtonCore({
      onClick() {
        methods.fetchUsers();
      },
    })
  };

  const state = { loading, users };

  const methods = {
    async fetchUsers() {
      loading.as(true);
      const r = await request.list.run({ page: 1, size: 10 });
      loading.as(false);
      if (r.error) return;
      users.as(r.data.list);
    },
  };

  return { state, ui, methods };
});

// index.js - 视图
import { HomePageViewModel } from "./index.model.js";

export default function HomePageView(props) {
  const vm$ = HomePageViewModel(props);

  props.view.onMounted(() => {
    vm$.methods.fetchUsers();
  });

  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    Show(
      { when: vm$.state.loading, fallback: renderContent() },
      h(View, {}, ["加载中..."]),
    ),
  ]);

  function renderContent() {
    return View({ class: "space-y-4" }, [
      // 直接渲染 ref 值（自动解包）
      View({}, ["用户名: ", vm$.state.name]),

      // computed 派生渲染
      View({}, ["用户数: ", computed(vm$.state.users, (list) => list.length)]),

      // 列表渲染
      For({
        each: vm$.state.users,
        render(user) {
          return View({ class: "p-2 border rounded" }, [
            // For 列表中 computed 派生渲染
            computed(user, (t) => t.name),
            " - ",
            computed(user, (t) => t.email),
          ]);
        },
      }),

      // 点击按钮调用 methods
      Button(
        {
          store: vm$.ui.btn_refresh$,
        },
        ["刷新列表"],
      ),
    ]);
  }
}
```

## 最佳实践

- 视图层只渲染 state，不处理业务逻辑
- 直接使用 `state.xxx` 渲染 Ref 值（自动解包）
- 需要计算派生值时使用 `computed()`
- 组件预先定义在 view model 中
- 交互操作调用 methods 中的方法
