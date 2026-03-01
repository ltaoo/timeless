import { ref, refobj, computed } from "@timeless/reactive";
import { XOutlined } from "@timeless/icons/x";

import { tp, merge } from "./theme";
import { View, ViewChildren, ViewProps } from "./view";
import { Portal } from "./portal";
import { Presence } from "./presence";
import { DialogCore } from "@timeless/ui";

export function Sheet(
  props: ViewProps & {
    store: DialogCore;
    side?: "right" | "top" | "bottom" | "left";
    theme?: any;
  },
  children?: ViewChildren,
) {
  const {
    store,
    side = "right",
    theme: t,
    class: cn,
    style: st,
    ...rest
  } = props;
  const state = refobj(store.state);
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
      Presence({ store: store.presence }, [
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
              return (
                merge(
                  tp(t?.wrapper, {
                    side,
                    visible: d.visible,
                    enter: d.enter,
                    exit: d.exit,
                  }),
                  cn,
                  st,
                ).class || ""
              );
            }),
            style: computed(state, (d) => {
              return (
                merge(
                  tp(t?.wrapper, {
                    side,
                    visible: d.visible,
                    enter: d.enter,
                    exit: d.exit,
                  }),
                  cn,
                  st,
                ).style || ""
              );
            }),
          },
          [
            View(
              {
                class: computed(state, (d) => {
                  return (
                    merge(
                      tp(t?.content, {
                        side,
                        visible: d.visible,
                        enter: d.enter,
                        exit: d.exit,
                      }),
                    ).class || ""
                  );
                }),
                style: computed(state, (d) => {
                  return (
                    merge(
                      tp(t?.content, {
                        side,
                        visible: d.visible,
                        enter: d.enter,
                        exit: d.exit,
                      }),
                    ).style || ""
                  );
                }),
              },
              [
                View(
                  {
                    ...merge(tp(t?.closeBtn)),
                    onClick() {
                      store.hide();
                    },
                  },
                  [XOutlined],
                ),
                ...(children || []),
              ],
            ),
          ],
        ),
      ]),
    ],
  );
}
