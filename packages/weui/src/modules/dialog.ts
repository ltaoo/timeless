import { computed, Fragment, refobj } from "@timeless/timeless";
import { View, ViewChildren, ViewProps, Show } from "@timeless/timeless";
import { DialogPrimitive } from "@timeless/ui-primitive";
import { DialogCore, getGlobalLayerManager } from "@timeless/ui-vm";

const DIALOG_BASE_Z = 200;
const Z_INDEX_NEST_GAP = 50;

export function Dialog(
  props: ViewProps & { store: DialogCore; zIndex?: number },
  children?: ViewChildren | (() => ViewChildren),
) {
  const { store, zIndex: manualZIndex, ...rest } = props;
  const state_ = refobj(store.state);
  const presence_state_ = refobj(store.presence.state);

  const zIndex = manualZIndex ?? DIALOG_BASE_Z + getGlobalLayerManager().size * Z_INDEX_NEST_GAP;

  const unlistens = [
    store.onStateChange((v) => {
      state_.as(v);
    }),
    store.presence.onStateChange((v) => {
      presence_state_.as(v);
    }),
  ];

  return DialogPrimitive.Root(
    {
      store,
      onUnmounted() {
        unlistens.forEach((fn) => fn());
      },
    },
    () => [
      DialogPrimitive.Overlay({
        store,
        style: computed(presence_state_, (d) => {
          const result: Record<string, string> = {
            position: "fixed",
            inset: "0",
            "z-index": `${zIndex}`,
            background: "var(--weui-OVERLAY)",
          };
          if (d.enter) {
            result.animation = "weui-fade-in .3s";
          }
          if (d.exit) {
            result.animation = "weui-fade-out .3s";
          }
          return result;
        }),
      }),
      View(
        {
          style: {
            position: "fixed",
            left: "50%",
            top: "50%",
            "z-index": `${zIndex + 1}`,
            transform: "translate(-50%,-50%)",
            width: "calc(100% - 64px)",
            "max-width": "320px",
          },
        },
        [
          DialogPrimitive.Content(
            {
              ...rest,
              store,
              style: computed(presence_state_, (d) => {
                const result: Record<string, string> = {
                  background: "var(--weui-BG-2)",
                  "border-radius": "12px",
                  overflow: "hidden",
                  "text-align": "center",
                };
                if (d.enter) {
                  result.animation = "weui-slide-up .3s";
                }
                if (d.exit) {
                  result.animation = "weui-slide-down .3s";
                }
                return result;
              }),
            },
            [
              Show({
                when: computed(state_, (d) => !!d.title),
                ok() {
                  return [
                    DialogPrimitive.Header(
                      {
                        store,
                        style: { padding: "32px 24px 16px" },
                      },
                      [
                        DialogPrimitive.Title(
                          {
                            store,
                            style: {
                              "font-weight": "700",
                              "font-size": "var(--weui-FONT-SIZE)",
                              color: "var(--weui-FG-0)",
                              "line-height": "1.4",
                            },
                          },
                          [computed(state_, (d) => d.title || "")],
                        ),
                      ],
                    ),
                  ];
                },
              }),
              View(
                {
                  style: {
                    padding: "0 24px 32px",
                    "font-size": "var(--weui-FONT-SIZE-SM)",
                    color: "var(--weui-FG-1)",
                    "line-height": "1.6",
                  },
                },
                typeof children === "function" ? children() : children || [],
              ),
              DialogPrimitive.Close(
                {
                  store,
                  style: { display: "none" },
                },
                [],
              ),
              Show({
                when: computed(state_, (d) => !!d.footer),
                ok() {
                  return [
                    DialogPrimitive.Footer(
                      {
                        store,
                        style: {
                          display: "flex",
                          "border-top": "1px solid var(--weui-SEPARATOR-0)",
                        },
                      },
                      [
                        View(
                          {
                            style: {
                              flex: "1",
                              height: "56px",
                              display: "flex",
                              "align-items": "center",
                              "justify-content": "center",
                              background: "transparent",
                              color: "var(--weui-FG-1)",
                              "font-size": "var(--weui-FONT-SIZE)",
                              cursor: "pointer",
                              "border-right":
                                "1px solid var(--weui-SEPARATOR-0)",
                            },
                            onClick() {
                              store.cancelBtn.click();
                            },
                          },
                          ["取消"],
                        ),
                        View(
                          {
                            style: {
                              flex: "1",
                              height: "56px",
                              display: "flex",
                              "align-items": "center",
                              "justify-content": "center",
                              background: "transparent",
                              color: "var(--weui-BRAND)",
                              "font-size": "var(--weui-FONT-SIZE)",
                              "font-weight": "700",
                              cursor: "pointer",
                            },
                            onClick() {
                              store.okBtn.click();
                            },
                          },
                          ["确认"],
                        ),
                      ],
                    ),
                  ];
                },
              }),
            ],
          ),
        ],
      ),
    ],
  );
}
