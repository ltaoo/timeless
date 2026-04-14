import { computed, Fragment, refobj } from "@timeless/timeless";
import { For, Show, ViewChildren, ViewProps } from "@timeless/timeless";
import { ToastPrimitive } from "@timeless/ui-primitive";
import { ToastCore } from "@timeless/ui-vm";

export function Toast(
  props: ViewProps & { store: ToastCore },
  children: ViewChildren = [],
) {
  const { store, ...rest } = props;
  const state_ = refobj({});

  // store.onStateChange((v) => {
  //   state_.as(v);
  // });

  return ToastPrimitive.Root({ store }, [
    // Show({
    //   when: computed(state_, (d) => !!d.mask),
    //   ok() {
    //     return [
    //       ToastPrimitive.Mask(
    //         {
    //           store,
    //           class: "fixed inset-0 z-[998] bg-black/20",
    //         },
    //         [],
    //       ),
    //     ];
    //   },
    // }),
    // ToastPrimitive.Viewport(
    //   {
    //     store,
    //     class:
    //       "fixed left-1/2 top-1/2 z-[999] -translate-x-1/2 -translate-y-1/2",
    //     ...rest,
    //   },
    //   [
    //     ToastPrimitive.Item(
    //       {
    //         store,
    //         class: computed(state_, (d) => {
    //           const baseClass =
    //             "flex flex-col items-center gap-2 rounded-lg bg-zinc-900 px-6 py-4 text-zinc-50 shadow-lg dark:bg-zinc-50 dark:text-zinc-900";
    //           const enterClass = d.enter ? "animate-in fade-in" : "";
    //           const exitClass = d.exit ? "animate-out fade-out" : "";
    //           return [baseClass, enterClass, exitClass]
    //             .filter(Boolean)
    //             .join(" ");
    //         }),
    //       },
    //       [
    //         Show({
    //           when: computed(state_, (d) => d.icon === "loading"),
    //           ok() {
    //             return [
    //               ToastPrimitive.Icon(
    //                 {
    //                   store,
    //                   class:
    //                     "h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent",
    //                 },
    //                 [],
    //               ),
    //             ];
    //           },
    //         }),
    //         For({
    //           each: computed(state_, (d) => d.texts || []),
    //           render(text: string) {
    //             return ToastPrimitive.Text({
    //               store,
    //               text,
    //               class: "text-sm text-center",
    //             });
    //           },
    //         }),
    //         Fragment({}, children),
    //       ],
    //     ),
    //   ],
    // ),
  ]);
}
