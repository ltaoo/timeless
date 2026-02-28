import { Dialog as H } from "@timeless/headless";

const t = {
  overlay: ({ enter, exit }) => ({
    class: ["fixed inset-0 z-50 bg-black/80", enter ? "animate-in fade-in duration-300" : "", exit ? "animate-out fade-out duration-300" : ""].filter(Boolean).join(" "),
  }),
  wrapper: () => ({
    class: ["fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]"].filter(Boolean).join(" "),
  }),
  content: ({ enter, exit }) => ({
    class: ["grid gap-4 border border-zinc-200 bg-white p-6 shadow-lg sm:rounded-lg dark:border-zinc-800 dark:bg-zinc-950", enter ? "animate-in fade-in-0 zoom-in-95 duration-300" : "", exit ? "animate-out fade-out-0 zoom-out-95 duration-300" : ""].filter(Boolean).join(" "),
  }),
  titleWrap: { class: "flex flex-col space-y-1.5 text-center sm:text-left" },
  title: { class: "text-lg font-semibold leading-none tracking-tight" },
  body: {},
  closeBtn: { class: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 cursor-pointer" },
  footer: { class: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2" },
  cancelBtn: { class: "inline-flex items-center justify-center rounded-md text-sm font-medium border border-zinc-200 bg-white h-10 px-4 py-2 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:text-zinc-50" },
  okBtn: { class: "inline-flex items-center justify-center rounded-md text-sm font-medium bg-zinc-900 text-zinc-50 h-10 px-4 py-2 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90" },
};

export function Dialog(p: any, c: any) { return H({ ...p, theme: t }, c); }
