import { Sheet as H } from "../headless/sheet.js";

const SIDE_TRANSFORM = {
  right: { base: "translateX(100%)", enter: "translateX(0)" },
  left: { base: "translateX(-100%)", enter: "translateX(0)" },
  top: { base: "translateY(-100%)", enter: "translateY(0)" },
  bottom: { base: "translateY(100%)", enter: "translateY(0)" },
};
const SIDE_POS = {
  right: "top:0;right:0;bottom:0;width:75%;max-width:400px;",
  left: "top:0;left:0;bottom:0;width:75%;max-width:400px;",
  top: "top:0;left:0;right:0;",
  bottom: "bottom:0;left:0;right:0;",
};

const t = {
  overlay: ({ enter, exit }) => ({
    style: [
      "position:fixed;inset:0;z-index:50;background:var(--weui-OVERLAY);",
      enter ? "animation:weui-fade-in 0.2s ease-out;" : "",
      exit ? "animation:weui-fade-out 0.18s ease-in forwards;" : "",
    ].join(""),
  }),
  content: ({ side, enter, exit }) => {
    const tr = SIDE_TRANSFORM[side] || SIDE_TRANSFORM.right;
    const sideKey = SIDE_POS[side] ? side : "right";
    const animation = enter
      ? `animation:weui-sheet-in-${sideKey} 0.2s ease-out forwards;`
      : exit
        ? `animation:weui-sheet-out-${sideKey} 0.16s ease-in forwards;`
        : "";
    return {
      style: [
        "position:fixed;z-index:50;background:var(--weui-BG-2);padding:var(--weui-CELL-GAP);box-shadow:-2px 0 8px rgba(0,0,0,.1);",
        SIDE_POS[side] || SIDE_POS.right,
        `transform:${tr.enter};`,
        animation,
      ].join(""),
    };
  },
  closeBtn: { style: "position:absolute;right:16px;top:16px;cursor:pointer;color:var(--weui-FG-2);font-size:18px;" },
};

export function Sheet(p, c) { return H({ ...p, theme: t }, c); }
