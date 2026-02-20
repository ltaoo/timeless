import { Tabs as H } from "../headless/tabs.js";

const t = {
  root: { style: "width:100%;" },
  list: { style: "display:flex;position:relative;border-bottom:1px solid var(--weui-SEPARATOR-0);background:var(--weui-BG-2);" },
  tab: ({ active }) => ({
    style: [
      "flex:1;height:44px;border:none;background:transparent;font-size:var(--weui-FONT-SIZE);cursor:pointer;position:relative;transition:color .3s;outline:none;padding:0 12px;white-space:nowrap;",
      active ? "color:var(--weui-BRAND);font-weight:600;" : "color:var(--weui-FG-1);",
    ].join(""),
  }),
  indicator: ({ active }) => ({
    style: active
      ? "position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:24px;height:2px;background:var(--weui-BRAND);border-radius:1px;"
      : "display:none;",
  }),
  content: { style: "padding:0;" },
};

export function Tabs(p) { return H({ ...p, theme: t }); }
