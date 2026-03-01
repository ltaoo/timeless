import { Section, Item } from "@/components/index.js";

export default function OverlayView() {
  return View({ class: "space-y-8" }, [
    Section("Popover", [
      Item("Default", [
        (() => {
          const popover$ = new Timeless.ui.PopoverCore({
            align: "middle",
          });
          return View({ class: cn(["inline-block"]) }, [
            Popover(
              {
                store: popover$,
                title: [
                  View(
                    {
                      class:
                        "w-[200px] h-[30px] bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500 select-none",
                    },
                    [Txt("Popover Title")],
                  ),
                ],
                content: [
                  View(
                    {
                      class:
                        "w-[200px] h-[100px] bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500 select-none",
                    },
                    [Txt("Popover Content")],
                  ),
                ],
              },
              [
                Button(
                  {
                    variant: "outline",
                  },
                  [Txt("Open Popover")],
                ),
              ],
            ),
          ]);
        })(),
      ]),
    ]),
  ]);
}
