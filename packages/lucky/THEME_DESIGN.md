# Lucky 设计规范

`@timeless/lucky` 将 lucky 项目中首页、我的、下单截图提炼的视觉规范迁入 Timeless，
组件结构与 animal / fluent 对齐，交互复用 `@timeless/timeless` 的 ui primitive 与 vm。
品牌蓝、我的浅蓝背景、选项淡蓝来自截图取色；字号、间距、圆角及橙色价格是视觉推导。
这是设计参考实现，不声称为官方设计源文件。浅色是唯一有截图依据的主题，不提供暗色。

## 1. 来源与双层变量

迁移来源：`lucky/.design` 的 `tokens.lucky`、`lucky/design-system/DESIGN.md`。
本包 `.design` 记录迁移契约，`src/tokens.json` 保存原来的 62 个变量及单位语义。
第一层 `src/style/tokens.css` 使用 `--lucky-<组>-<名称>`，保留来源 camelCase 名称。
第二层 `src/style/alias.css` 将它们映射为 Timeless 的稳定语义名；组件仅消费第二层。

| 角色 | 来源变量 | 值 | 常用别名 |
|---|---|---|---|
| 品牌 / 主操作 | color.brand | #0921a4 | --primary / --ring |
| 选项选中底 | color.brandSoft | #f3f4fe | --accent |
| 页面 / 白卡 | color.page / surface | #f5f5f5 / #ffffff | --background / --card |
| 我的背景 | color.profile | #e6e9f6 | --profile-surface |
| 正文 / 次要文字 | color.text / textSecondary | #333333 / #666666 | --foreground / --muted-foreground |
| 价格 | color.price | #ff5427 | --price |
| 次操作 / 会员 | color.goldSoft / member | #f1e2c7 / #262b30 | --secondary / --member-surface |
| 卡片 / 选项 / 我的卡片 / 胶囊 | radius.card / option / profileCard / pill | 12 / 14 / 26 / 999 px | --radius-lg / --option-radius / --profile-radius / --radius-pill |
| 主控件 / 选项 | size.touch / option | 44 / 46 px | --control-height / --option-height |

通用别名还包括 card-foreground、popover、popover-foreground、primary-foreground、
secondary-foreground、muted、accent-foreground、destructive、destructive-foreground、
border、input、radius，以及 font-sans、font-mono、font-size、line-height、spacer、
control-height-sm/lg、shadow-sm/shadow/shadow-lg、duration-fast/normal 和 disabled-opacity。
完整值与派生关系以 `src/style/alias.css` 为准。
stroke1/2/3、surface-1/2/3/4/5、foreground-2/3/4、shadow-2/4/8/16/28/64
是复用复杂组件槽位的语义扩展；不暴露 Fluent 原始 token。
destructive (#d92d20)、warning (#946200)、36px 小控件、2px 焦点环和浮层阴影是
为通用组件补充的工程值，区别于截图提取值；橙色价格不兼作错误色。

## 2. 排版、布局与动效

中文使用平台字体，不加载字体网络资源；数字使用 Arial Narrow / Impact 回退。
字阶 11、12、13、14、16、18、22、24、28px；正文行高 1.5。
间距 4、8、12、16、20、24、32px；页面参考宽度 414px，不强制通用组件固定宽度。
基础卡片无描边、无抬升阴影；浮层用轻阴影。主按钮深蓝胶囊，次按钮浅金。
选项 46px 高、14px 圆角，选中态淡蓝底+品牌蓝描边。
动效 120 / 180ms，不位移；`prefers-reduced-motion` 在作用域内关闭动效。
禁用态透明度 0.45；保留可见键盘焦点，加载时避免重复触发。

## 3. 组件

完整基础/表单/反馈/导航/数据/高级组件与 fluent 导出对齐（Button、Input、Card、
Dialog、Sheet、Tabs、Table、Tree、Flow 等），不包含应用级登录或下单业务状态。
Button 支持 primary、secondary、outline、subtle、transparent、danger、success、warning、info；
default 映射主操作，ghost/link/destructive 等保留跨库别名。
Card 增加可选 `variant: "surface" | "profile" | "member"`。
Price 的 `amount` 为非负安全整数分（2000 显示 ¥20.00），支持 currency 展示前缀。
OptionChip 复用 ButtonCore，`selected` 接受 boolean 或 Ref<boolean>，暴露 aria-pressed；
宿主负责选择状态，互斥规格组应使用 RadioGroup 的语义，而非把独立按钮假装成单选组。

## 4. 使用与覆盖

```ts
import { Button, Card, CardContent, Price } from "@timeless/lucky";
import { vm } from "@timeless/timeless";
// 宿主元素设置 data-tt-style="lucky"；浏览器入口自动加载 CSS。
const content = Card({}, [CardContent({}, [
  Price({ amount: 2000 }),
  Button({ store: new vm.ButtonCore({ variant: "primary" }) }, ["立即下单"]),
])]);
```

```css
@import "@timeless/lucky/globals.css";
[data-tt-style="lucky"] { --primary: #0921a4; --radius-lg: 12px; }
```

SSR / Node 导入不会执行 CSS 导入。UMD 挂载 `Timeless.lucky`，不会覆盖核心命名空间。
作用域只能选一个样式库；可在同页不同子树与 animal / fluent 共存。
树/流程共享状态类 `.is-*` 保持原样，动画名 `lucky-*`，无全局重置。

## 5. 文档与验证

`pnpm run docs --lib=lucky` → http://127.0.0.1:3406
文档包含分类组件画廊及设计规范预览孤岛，变量调参只影响孤岛。
暗色开关停用，说明其原因；不会伪造未采集的暗色主题。

```sh
pnpm --filter @timeless/lucky run build
pnpm check:scope
pnpm build
```

浏览器验证由用户手动进行；本次开发只运行非浏览器检查。
