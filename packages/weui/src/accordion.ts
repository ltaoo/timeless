import { Accordion as H } from "@timeless/timeless";

const t = {
  root: {
    style:
      "width:100%;background:var(--weui-BG-2);border-radius:8px;overflow:hidden;",
  },
  item: { style: "border-bottom:1px solid var(--weui-SEPARATOR-0);" },
  trigger: {
    style:
      "display:flex;align-items:center;justify-content:space-between;padding:var(--weui-CELL-GAP);cursor:pointer;font-size:var(--weui-FONT-SIZE);color:var(--weui-FG-0);",
  },
  chevron: ({ isOpen }) => ({
    style: `font-size:var(--weui-FONT-SIZE-SM);color:var(--weui-FG-2);transition:transform .2s;${isOpen ? "transform:rotate(180deg);" : ""}`,
  }),
  content: ({ isOpen }) => ({
    style: isOpen
      ? "padding:0 var(--weui-CELL-GAP) var(--weui-CELL-GAP);font-size:var(--weui-FONT-SIZE-SM);color:var(--weui-FG-1);line-height:1.6;"
      : "display:none;",
  }),
};

export function Accordion(p: Parameters<typeof H>[0]) {
  return H({ ...p, theme: t });
}
