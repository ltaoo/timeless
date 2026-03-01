import { Select as H } from "@timeless/headless";

const t = {
  root: { style: "position:relative;flex:1;" },
  trigger: { style: "display:flex;align-items:center;justify-content:space-between;height:100%;padding:0;background:transparent;cursor:pointer;font-size:var(--weui-FONT-SIZE);color:var(--weui-FG-0);" },
  valueText: ({ hasValue }) => ({
    style: hasValue ? "color:var(--weui-FG-0);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" : "color:var(--weui-FG-2);",
  }),
  arrow: { style: "margin-left:auto;padding-left:8px;color:var(--weui-FG-2);" },
  dropdown: {},
  list: { style: "background:var(--weui-BG-2);color:var(--weui-FG-0);border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.12);overflow:hidden;" },
  option: ({ selected }) => ({
    style: [
      "padding:12px var(--weui-CELL-GAP);font-size:var(--weui-FONT-SIZE);color:var(--weui-FG-0);cursor:pointer;transition:background .2s;",
      selected ? "background:var(--weui-STATELAYER-PRESSED);" : "",
    ].join(""),
  }),
};

export function Select(p: Parameters<typeof H>[0]) { return H({ ...p, theme: t }); }
