import { computed, refobj } from "@timeless/timeless";
import { For, Show, ViewChildren, ViewProps } from "@timeless/timeless";
import { TabsPrimitive } from "@timeless/ui-primitive";
import { TabHeaderCore } from "@timeless/inner-vm";

type TabItem = {
  value: string;
  label: string;
  content?: ViewChildren;
};

export function Tabs(
  props: ViewProps & {
    store: TabHeaderCore<any>;
    items?: TabItem[];
  },
  children?: ViewChildren,
) {
  const { store, items, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return TabsPrimitive.Root(
    {
      store,
      style: { width: "100%" },
      ...rest,
    },
    [
      TabsPrimitive.List(
        {
          store,
          style: {
            display: "flex",
            position: "relative",
            "border-bottom": "1px solid var(--weui-SEPARATOR-0)",
            background: "var(--weui-BG-2)",
          },
        },
        [
          For({
            each: items || computed(state_, (d) => d.tabs),
            render(item: TabItem, index) {
              const i = index.value;
              return TabsPrimitive.Tab(
                {
                  store,
                  value: item.value,
                  index: i,
                  style: computed(state_, (d) => {
                    const isActive = d.curId === item.value;
                    const result: Record<string, string> = {
                      flex: "1",
                      height: "44px",
                      border: "none",
                      background: "transparent",
                      "font-size": "var(--weui-FONT-SIZE)",
                      cursor: "pointer",
                      position: "relative",
                      transition: "color .3s",
                      outline: "none",
                      padding: "0 12px",
                      "white-space": "nowrap",
                    };
                    if (isActive) {
                      result.color = "var(--weui-BRAND)";
                      result["font-weight"] = "600";
                    } else {
                      result.color = "var(--weui-FG-1)";
                    }
                    return result;
                  }),
                },
                [
                  item.label,
                  TabsPrimitive.Indicator({
                    store,
                    value: item.value,
                    style: computed(state_, (d) => {
                      const isActive = d.curId === item.value;
                      if (isActive) {
                        return {
                          position: "absolute",
                          bottom: "0",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "24px",
                          height: "2px",
                          background: "var(--weui-BRAND)",
                          "border-radius": "1px",
                        };
                      }
                      return { display: "none" };
                    }),
                  }),
                ],
              );
            },
          }),
        ],
      ),
      Show({
        when: !!children,
        ok() {
          return children || [];
        },
        else() {
          return [
            For({
              each: items || computed(state_, (d) => d.tabs),
              render(item: TabItem) {
                return Show({
                  when: computed(state_, (d) => d.curId === item.value),
                  ok() {
                    return [
                      TabsPrimitive.Content(
                        {
                          store,
                          value: item.value,
                          style: { padding: "0" },
                        },
                        item.content,
                      ),
                    ];
                  },
                });
              },
            }),
          ];
        },
      }),
    ],
  );
}
