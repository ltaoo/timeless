import { ref, computed, uncomputed } from "@timeless/reactive";
import { ToastCore } from "@timeless/ui";

import { tp, merge } from "./theme";
import { View, ViewProps } from "./view";
import { Txt } from "./text";
import { For } from "./for";
import { Show } from "./show";
import { Portal } from "./portal";
import { Presence } from "./presence";

export function Toast(
  props: ViewProps & {
    store: ToastCore;
    theme?: any;
  },
) {
  const { store, theme: t, class: cls, style: st } = props;
  const state = ref(store.state);
  const events: any[] = [() => uncomputed(state)];
  events.push(
    store.onStateChange(() => {
      state.as(store.state);
    }),
  );
  const texts = computed(state, (d) => d.texts || []);

  return Portal(
    {
      onUnmounted() {
        for (const fn of events) {
          if (typeof fn === "function") {
            fn();
          }
        }
      },
    },
    [
      Presence({ store: store.presence }, [
        Show({ when: computed(state, (d) => !!d.mask) }, [
          View({ ...merge(tp(t?.mask)) }),
        ]),
        View(
          {
            class: computed(state, (d) => {
              return (
                merge(tp(t?.wrapper, { enter: d.enter, exit: d.exit }), cls, st)
                  .class || ""
              );
            }),
            style: computed(state, (d) => {
              return (
                merge(tp(t?.wrapper, { enter: d.enter, exit: d.exit }), cls, st)
                  .style || ""
              );
            }),
          },
          [
            View(
              {
                class: computed(state, (d) => {
                  return (
                    merge(tp(t?.body, { enter: d.enter, exit: d.exit }))
                      .class || ""
                  );
                }),
                style: computed(state, (d) => {
                  return (
                    merge(tp(t?.body, { enter: d.enter, exit: d.exit }))
                      .style || ""
                  );
                }),
              },
              [
                Show(
                  {
                    when: computed(state, (d) => d.icon === "loading"),
                  },
                  [View({ ...merge(tp(t?.spinner)) })],
                ),
                For({
                  each: texts,
                  render(text: any) {
                    return View({ ...merge(tp(t?.text)) }, [Txt(text)]);
                  },
                }),
              ],
            ),
          ],
        ),
      ]),
    ],
  );
}
