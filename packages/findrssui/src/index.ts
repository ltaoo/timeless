// FindRSS UI：从 findrss-reader 的 `frontend/src/components/` 迁出的组件库
// （原地址：`frontend/src/components/findrssui.js` + `findrssui_layer.js` + `frontend/src/findrssui.css`）。
//
// 组件只渲染，交互状态由 `@timeless/timeless` 的 vm core 维护；样式全部走 `--frui-*` token +
// `frui-*` 类，与 `src/style/findrssui.css` 一一对应（见 THEME_DESIGN.md）。
//
// 业务耦合的 `LazyImg`（依赖宿主的 blurhash / DOM 解析）**没有**迁进来，仍留在 findrss-reader。
import {
  Alert,
  Avatar,
  Badge,
  Button,
  ButtonViewModel,
  Card,
  Checkbox,
  ChoiceViewModel,
  Input,
  InputViewModel,
  Radio,
  Separator,
  Switch,
  Tabs,
  Textarea,
  Tree,
  FRAlert,
  FRBadge,
  FRButton,
  FRCard,
  FRInput,
  FRSeparator,
} from "./modules/findrssui";
import { Dialog, DropdownMenu, Toast } from "./modules/findrssui-layer";

// CSS 是构建产物的一部分（`dist/timeless.findrssui.css`），由使用方 `<link>`，不从这里注入 ——
// 原生 ES module 不能 import CSS，静态服务器会因 MIME 不符整棵模块图失败。
// 保留动态 import 只是为了让 `vite build` 把样式表提取进 lib 产物；非打包环境（UMD/静态服务器）
// 下这个分支不会执行，也没有宿主会去 await 它。
try {
  if (typeof window !== "undefined") {
    import("./style/findrssui.css");
  }
} catch {}

export const TimelessFindRSSUIVersion = __Version;

export {
  Alert,
  Avatar,
  Badge,
  Button,
  ButtonViewModel,
  Card,
  Checkbox,
  ChoiceViewModel,
  Input,
  InputViewModel,
  Radio,
  Separator,
  Switch,
  Tabs,
  Tree,
  Textarea,
  Dialog,
  DropdownMenu,
  Toast,
  FRAlert,
  FRBadge,
  FRButton,
  FRCard,
  FRInput,
  FRSeparator,
};
