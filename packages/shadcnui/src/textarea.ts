import { Textarea as H, ViewProps } from "@timeless/headless";
import { InputCore } from "@timeless/ui";

export function Textarea(
  props: ViewProps & {
    store: InputCore<any>;
    id?: string;
  },
) {
  return H({
    ...props,
    class:
      "flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-zinc-950 focus-visible:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:border-zinc-300 dark:focus-visible:bg-zinc-900 dark:focus-visible:ring-zinc-300",
  });
}
