# Button 按钮

## 用法

```js
import { Button } from "@/components/index.js";

Button(
  {
    store: new Timeless.ui.ButtonCore({
      variant: "primary", // primary | secondary | outline | ghost | danger | link
      size: "sm", // xs | sm | md | lg | icon-xs | icon-sm | icon | icon-lg
      loading: false,
      disabled: false,
      onClick() {
        console.log("clicked");
      },
    }),
  },
  ["确认"],
);
```

## 带图标

```js
// 带前缀图标
Button(
  {
    store: new Timeless.ui.ButtonCore({}),
    prefix: [Timeless.icons.DownloadOutlined({ class: "w-4 h-4" })],
  },
  ["Download"],
);

// 图标按钮
Button({ store: new Timeless.ui.ButtonCore({ size: "icon" }) }, [
  Timeless.icons.BoltOutlined(),
]);
```

## Core API

```ts
new ButtonCore({
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link",
  size?: "xs" | "sm" | "md" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg",
  loading?: boolean,
  disabled?: boolean,
  onClick?: () => void,
})

btn$.setLoading(true)
btn$.setDisabled(true)
btn$.enable()
```
