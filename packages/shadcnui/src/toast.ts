import { Toast as H } from "@timeless/headless";

const t = {
  mask: { class: "fixed inset-0 z-[998] bg-black/20" },
  wrapper: {
    class: "fixed left-1/2 top-1/2 z-[999] -translate-x-1/2 -translate-y-1/2",
  },
  body: ({ enter, exit }) => ({
    class: [
      "flex flex-col items-center gap-2 rounded-lg bg-zinc-900 px-6 py-4 text-zinc-50 shadow-lg dark:bg-zinc-50 dark:text-zinc-900",
      enter ? "animate-in fade-in" : "",
      exit ? "animate-out fade-out" : "",
    ]
      .filter(Boolean)
      .join(" "),
  }),
  spinner: {
    class:
      "h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent",
  },
  text: { class: "text-sm text-center" },
};

export function Toast(p: any) {
  return H({ ...p, theme: t });
}
