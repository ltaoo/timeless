import { Button as H } from "@timeless/headless";

const VARIANTS = {
  default: "bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90",
  destructive: "bg-red-500 text-zinc-50 hover:bg-red-500/90",
  outline: "border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800",
  secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50",
  ghost: "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
  link: "text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50",
};
const SIZES = { default: "h-10 px-4 py-2", sm: "h-9 rounded-md px-3", lg: "h-11 rounded-md px-8", icon: "h-10 w-10" };

const t = {
  root: ({ variant, size, loading, disabled }) => ({
    class: [
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      VARIANTS[variant] || VARIANTS.default,
      SIZES[size] || SIZES.default,
      loading ? "opacity-70 pointer-events-none" : "",
      disabled ? "opacity-50 pointer-events-none" : "",
    ].filter(Boolean).join(" "),
  }),
  spinner: { class: "mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" },
};

export function Button(p, c) { return H({ ...p, theme: t }, c); }
