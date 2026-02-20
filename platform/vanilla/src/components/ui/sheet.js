import { Sheet as H } from "../headless/sheet.js";

const SIDE_CLASSES = {
  right: "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l",
  left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r",
  top: "inset-x-0 top-0 w-full border-b",
  bottom: "inset-x-0 bottom-0 w-full border-t",
};

const t = {
  overlay: ({ enter, exit }) => ({
    class: ["fixed inset-0 z-50 bg-black/80", enter ? "animate-in fade-in" : "", exit ? "animate-out fade-out" : ""].filter(Boolean).join(" "),
  }),
  content: ({ side, visible, enter }) => ({
    class: ["fixed z-50 gap-4 bg-white p-6 shadow-lg transition-transform duration-300 ease-in-out dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800", SIDE_CLASSES[side] || SIDE_CLASSES.right].join(" "),
    style: (visible && enter) ? "transform:translate(0,0);" : "",
  }),
  closeBtn: { class: "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 cursor-pointer" },
};

export function Sheet(p, c) { return H({ ...p, theme: t }, c); }
