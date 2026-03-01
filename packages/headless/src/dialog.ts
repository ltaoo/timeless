import { ref, computed } from "@timeless/reactive";
import { DialogCore } from "@timeless/ui";

import { tp, merge } from "./theme";
import { View, ViewChildren, ViewProps } from "./view";
import { Txt } from "./text";
import { Show } from "./show";
import { Portal } from "./portal";
import { Presence } from "./presence";

export function Dialog(
  props: ViewProps & {
    store: DialogCore;
    theme?: any;
  },
  children?: ViewChildren,
) {
  const { store, theme: t, class: cls, style: st, ...rest } = props;
  const state = ref(store.state);
  const events: any[] = [];
  events.push(
    store.onStateChange(() => {
      state.as(store.state);
    }),
  );

  return Portal(
    {
      onUnmounted() {
        for (const fn of events) {
          if (typeof fn === "function") {
            fn();
          }
        }
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    [
      Presence({ store: store.presence || store }, [
        View({
          class: computed(state, (d) => {
            return (
              merge(tp(t?.overlay, { enter: d.enter, exit: d.exit })).class ||
              ""
            );
          }),
          style: computed(state, (d) => {
            return (
              merge(tp(t?.overlay, { enter: d.enter, exit: d.exit })).style ||
              ""
            );
          }),
          onClick() {
            store.hide();
          },
        }),
        View(
          {
            class: computed(state, (d) => {
              return merge(tp(t?.wrapper), cls, st).class || "";
            }),
            style: computed(state, (d) => {
              return merge(tp(t?.wrapper), cls, st).style || "";
            }),
          },
          [
            View(
              {
                class: computed(state, (d) => {
                  return (
                    merge(tp(t?.content, { enter: d.enter, exit: d.exit }))
                      .class || ""
                  );
                }),
                style: computed(state, (d) => {
                  return (
                    merge(tp(t?.content, { enter: d.enter, exit: d.exit }))
                      .style || ""
                  );
                }),
              },
              [
                Show({ when: computed(state, (d) => !!d.title) }, [
                  View({ ...merge(tp(t?.titleWrap)) }, [
                    View({ ...merge(tp(t?.title)) }, [
                      Txt(computed(state, (d) => d.title || "")),
                    ]),
                  ]),
                ]),
                View({ ...merge(tp(t?.body)) }, children || []),
                View(
                  {
                    ...merge(tp(t?.closeBtn)),
                    onClick() {
                      store.hide();
                    },
                  },
                  [Txt("\u2715")],
                ),
                Show({ when: computed(state, (d) => !!d.footer) }, [
                  View({ ...merge(tp(t?.footer)) }, [
                    View(
                      {
                        type: "button",
                        ...merge(tp(t?.cancelBtn)),
                        onClick() {
                          store.cancel();
                        },
                      },
                      [Txt("\u53D6\u6D88")],
                    ),
                    View(
                      {
                        type: "button",
                        ...merge(tp(t?.okBtn)),
                        onClick() {
                          store.ok();
                        },
                      },
                      [Txt("\u786E\u8BA4")],
                    ),
                  ]),
                ]),
              ],
            ),
          ],
        ),
      ]),
    ],
  );
}
