import { Toast as H } from "../headless/toast.js";

const t = {
  mask: { class: "fixed inset-0 z-[998] bg-black/20" },
  body: ({ enter, exit }) => ({
    class: ["fixed left-1/2 top-1/2 z-[999] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 rounded-lg bg-zinc-900 px-6 py-4 text-zinc-50 shadow-lg dark:bg-zinc-50 dark:text-zinc-900", enter ? "animate-in fade-in zoom-in-95" : "", exit ? "animate-out fade-out zoom-out-95" : ""].filter(Boolean).join(" "),
  }),
  spinner: { class: "h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" },
  text: { class: "text-sm text-center" },
};

export function Toast(p) { return H({ ...p, theme: t }); }
