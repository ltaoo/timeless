# 创建页面

## 新建页面

```js
export default function MyFeaturePage(props) {
  const view$ = new Timeless.ui.ScrollViewCore({});
  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    // 页面内容
  ]);
}
```

## 注册路由

```js
Timeless.buildRoutes({
  root: {
    children: {
      my_feature: {
        title: "My Feature",
        pathname: "/my-feature",
        component: Timeless.lazy("@/pages/my-feature/index.js"),
      },
    },
  },
});
```

## 布局页

```js
export default function MyLayout(props) {
  return SidebarLayout(
    {
      sidebar: [
        /* 侧边栏 */
      ],
    },
    [KeepAliveSubViews(props)],
  );
}
```
