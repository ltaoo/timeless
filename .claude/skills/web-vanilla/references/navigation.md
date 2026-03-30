# 路由与导航

## 编程式导航

```js
props.history.push("root.home.index");
props.history.replace("root.home.index");
props.history.back();

// 带参数
props.history.push("root.home.detail", { id: 123 });
```

## 菜单联动

```js
const sidemenu$ = Timeless.kit.RouteMenusModel({
  view: props.view,
  history: props.history,
  menus: [
    { title: "首页", url: "root.home.index" },
    { title: "设置", url: "root.home.settings" },
  ],
});

// 高亮判断
sidemenu$.isActive(url);
sidemenu$.isSubRoute(url);
```
