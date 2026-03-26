import { computed, refobj } from "@timeless/reactive";
import {
  DialogPrimitive,
  View,
  ViewChildren,
  ViewProps,
  Show,
  Txt,
} from "@timeless/headless";
import { DialogCore } from "@timeless/ui";

import { Button } from "./button";

export function Dialog(
  props: ViewProps & { store: DialogCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return DialogPrimitive.Root({ store }, [
    DialogPrimitive.Overlay({
      store,
      class: computed(state_, (d) => {
        const baseClass =
          "fixed inset-0 isolate z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs";
        const enterClass = d.enter ? "animate-in fade-in-0 duration-100" : "";
        const exitClass = d.exit ? "animate-out fade-out-0 duration-100" : "";
        return [baseClass, enterClass, exitClass].filter(Boolean).join(" ");
      }),
    }),
    View(
      {
        class: "fixed inset-0 z-50 flex items-center justify-center p-4",
        onClick: (e: Event) => {
          if (e.target === e.currentTarget && store.closeable) {
            store.hide();
          }
        },
      },
      [
        DialogPrimitive.Content(
          {
            store,
            class: computed(state_, (d) => {
              const baseClass =
                "relative w-full max-w-sm grid gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none";
              const enterClass = d.enter
                ? "animate-in fade-in-0 zoom-in-95 duration-100"
                : "";
              const exitClass = d.exit
                ? "animate-out fade-out-0 zoom-out-95 duration-100"
                : "";
              return [baseClass, enterClass, exitClass]
                .filter(Boolean)
                .join(" ");
            }),
            ...rest,
          },
          [
            Show({ when: computed(state_, (d) => !!d.title) }, [
              DialogPrimitive.Header(
                {
                  store,
                  class: "flex flex-col gap-2",
                },
                [
                  DialogPrimitive.Title(
                    {
                      store,
                      class: "text-base leading-none font-medium",
                    },
                    [Txt(computed(state_, (d) => d.title || ""))],
                  ),
                ],
              ),
            ]),
            DialogPrimitive.Body({ store }, children || []),
            DialogPrimitive.Close(
              {
                store,
                class:
                  "absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
              },
              [Txt("✕")],
            ),
            Show({ when: computed(state_, (d) => !!d.footer) }, [
              DialogPrimitive.Footer(
                {
                  store,
                  class:
                    "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t border-border bg-muted/50 p-4 sm:flex-row sm:justify-end",
                },
                [
                  Button({ store: store.cancelBtn }, ["取消"]),
                  Button({ store: store.okBtn }, ["确认"]),
                ],
              ),
            ]),
          ],
        ),
      ],
    ),
  ]);
}
