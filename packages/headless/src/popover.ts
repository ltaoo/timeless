import { tp, merge } from "./theme.js";
import { View } from "./view.js";
import { Show } from "./show.js";
import { Portal } from "./portal.js";
import { ref, computed } from "@timeless/reactive";

export function Popover(props: any, children?: any) {
  const {
    store,
    content,
    title,
    theme: t,
    class: cn,
    style: st,
    ...rest
  } = props;
  const state = ref(store.state);
  const events: any[] = [];
  events.push(
    store.onStateChange(() => {
      state.as(store.state);
    }),
  );
  const visible = computed(
    { state },
    (d: any) => d.state.visible || d.state.enter || d.state.exit,
  );
  const layer = store.layer;
  let handlePointerDown: any;

  function normalizeNodes(input: any) {
    if (Array.isArray(input)) {
      return input.map((item) => {
        if (item && typeof item === "object" && item.render) return item;
        return {
          t: "text",
          $elm: document.createTextNode(String(item == null ? "" : item)),
          render() {
            return this.$elm;
          },
          onMounted() {},
          beforeUnmounted() {},
          onUnmounted() {},
        };
      });
    }
    if (input && typeof input === "object" && input.render) return [input];
    if (input === undefined) return [];
    return [
      {
        t: "text",
        $elm: document.createTextNode(String(input == null ? "" : input)),
        render() {
          return this.$elm;
        },
        onMounted() {},
        beforeUnmounted() {},
        onUnmounted() {},
      },
    ];
  }

  let contentNodes =
    content !== undefined ? normalizeNodes(content) : children || [];
  if (title !== undefined) {
    const titleNodes = normalizeNodes(title);
    contentNodes = [
      View({ ...merge(tp(t?.title)) }, titleNodes),
      ...contentNodes,
    ];
  }

  const portal$ = Portal(
    {
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
        if (rest.onUnmounted) rest.onUnmounted();
      },
    },
    [
      Show({ when: visible }, [
        View(
          {
            ...merge(tp(t?.wrapper)),
            style: computed({ state }, (d: any) => {
              const s = d.state;
              const base = merge(tp(t?.wrapper)).style || "";
              return [
                base,
                `opacity:${s.isPlaced ? 1 : 0};`,
                s.isPlaced
                  ? `transform:translate3d(${Math.round(s.x)}px,${Math.round(s.y)}px,0);`
                  : "transform:translate3d(0,-200%,0);",
              ].join("");
            }),
            onMounted($e: HTMLElement) {
              store.popper.setFloating({
                $el: $e,
                getRect() {
                  return $e.getBoundingClientRect();
                },
              });
              if (layer) {
                handlePointerDown = () => {
                  layer.handlePointerDownOnTop();
                };
                document.addEventListener("pointerdown", handlePointerDown);
                $e.addEventListener("pointerdown", () => {
                  layer.pointerDown();
                });
              }
            },
            onUnmounted() {
              store.popper.setFloating(null);
              if (layer && handlePointerDown) {
                document.removeEventListener("pointerdown", handlePointerDown);
                handlePointerDown = null;
              }
            },
          },
          [
            View(
              {
                class: computed({ state }, (d: any) => {
                  const s = d.state;
                  return (
                    merge(
                      tp(t?.content, { enter: s.enter, exit: s.exit }),
                      cn,
                      st,
                    ).class || ""
                  );
                }),
                style: computed({ state }, (d: any) => {
                  const s = d.state;
                  const tr = merge(
                    tp(t?.content, { enter: s.enter, exit: s.exit }),
                    cn,
                    st,
                  );
                  const base = tr.style || "";
                  const visibleFlag = s.visible || s.enter;
                  return visibleFlag ? base : base + "display:none;";
                }),
              },
              contentNodes,
            ),
            View({
              ...merge(tp(t?.arrow)),
              style: computed({ state }, (d: any) => {
                const s = d.state;
                const base = merge(tp(t?.arrow)).style || "";
                if (!s.arrowX && !s.arrowY) return base + "display:none;";
                return [
                  base,
                  s.arrowX ? `left:${s.arrowX}px;` : "",
                  s.arrowY ? `top:${s.arrowY}px;` : "",
                  s.placement
                    ? `transform:rotate(${
                        s.placement.startsWith("top")
                          ? 180
                          : s.placement.startsWith("right")
                            ? -90
                            : s.placement.startsWith("bottom")
                              ? 0
                              : 90
                      }deg);`
                    : "",
                ].join("");
              }),
            }),
          ],
        ),
      ]),
    ],
  );

  return portal$;
}
