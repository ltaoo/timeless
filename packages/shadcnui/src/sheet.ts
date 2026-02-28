import { Sheet as H } from "@timeless/headless";

const WRAPPER_CLASSES = {
  right: "inset-y-0 right-0 h-full w-3/4 max-w-sm",
  left: "inset-y-0 left-0 h-full w-3/4 max-w-sm",
  top: "inset-x-0 top-0 w-full",
  bottom: "inset-x-0 bottom-0 w-full",
};

const CONTENT_CLASSES = {
  right: "border-l",
  left: "border-r",
  top: "border-b",
  bottom: "border-t",
};

const t = {
  overlay: ({ enter, exit }) => ({
    class: [
      "fixed inset-0 z-50 bg-black/80",
      enter ? "animate-in fade-in duration-300" : "",
      exit ? "animate-out fade-out duration-300" : "",
    ]
      .filter(Boolean)
      .join(" "),
  }),
  wrapper: ({ side }) => {
    const s = side || "right";
    return {
      class: [
        "fixed z-50",
        WRAPPER_CLASSES[s] || WRAPPER_CLASSES.right,
      ]
        .filter(Boolean)
        .join(" "),
    };
  },
  content: ({ side, enter, exit }) => {
    const s = side || "right";
    const inMap: Record<string, string> = {
      right: "slide-in-from-right",
      left: "slide-in-from-left",
      top: "slide-in-from-top",
      bottom: "slide-in-from-bottom",
    };
    const outMap: Record<string, string> = {
      right: "slide-out-to-right",
      left: "slide-out-to-left",
      top: "slide-out-to-top",
      bottom: "slide-out-to-bottom",
    };
    return {
      class: [
        "relative h-full w-full gap-4 bg-white p-6 shadow-lg ease-in-out dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 transition",
        CONTENT_CLASSES[s] || CONTENT_CLASSES.right,
        enter ? `animate-in ${inMap[s] || inMap.right} duration-300` : "",
        exit ? `animate-out ${outMap[s] || outMap.right} duration-300` : "",
      ]
        .filter(Boolean)
        .join(" "),
    };
  },
  closeBtn: {
    class:
      "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 cursor-pointer",
  },
};

export function Sheet(p: any, c: any) {
  return H({ ...p, theme: t }, c);
}
