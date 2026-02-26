import { tp, merge } from "./theme.js";
import { View } from "./view.js";
import { Show } from "./show.js";
import { Portal } from "./portal.js";
import { ref, computed } from "./core.js";

export function Popover(props, children) {
  const { store, content, title, theme: t, class: cn, style: st, ...rest } = props;
  const state = ref(store.state);
  const events = [];
  events.push(store.onStateChange(() => { state.value = store.state; }));
  const visible = computed({ state }, (d) => d.state.visible || d.state.enter || d.state.exit);
  const layer = store.layer;
  let handlePointerDown;

  function normalizeNodes(input) {
    if (Array.isArray(input)) {
      return input.map((item) => {
        if (item && typeof item === "object" && item.render) return item;
        return {
          t: "text",
          $elm: document.createTextNode(String(item == null ? "" : item)),
          render() { return this.$elm; },
          onMounted() {},
          beforeUnmounted() {},
          onUnmounted() {},
        };
      });
    }
    if (input && typeof input === "object" && input.render) return [input];
    if (input === undefined) return [];
    return [{
      t: "text",
      $elm: document.createTextNode(String(input == null ? "" : input)),
      render() { return this.$elm; },
      onMounted() {},
      beforeUnmounted() {},
      onUnmounted() {},
    }];
  }

  let contentNodes = content !== undefined ? normalizeNodes(content) : (children || []);
  if (title !== undefined) {
    const titleNodes = normalizeNodes(title);
    contentNodes = [
      View({ ...merge(tp(t?.title)) }, titleNodes),
      ...contentNodes,
    ];
  }

  const portal$ = Portal({
    onUnmounted() {
      for (const fn of events) if (typeof fn === "function") fn();
      if (rest.onUnmounted) rest.onUnmounted();
    },
  }, [
    Show({ when: visible }, [
      View({
        ...merge(tp(t?.wrapper)),
        style: computed({ state }, (d) => {
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
        onMounted($e) {
          store.popper.setFloating({ $el: $e, getRect() { return $e.getBoundingClientRect(); } });
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
      }, [
        View({
          class: computed({ state }, (d) => {
            const s = d.state;
            return merge(tp(t?.content, { enter: s.enter, exit: s.exit }), cn, st).class || "";
          }),
          style: computed({ state }, (d) => {
            const s = d.state;
            const tr = merge(tp(t?.content, { enter: s.enter, exit: s.exit }), cn, st);
            const base = tr.style || "";
            const visibleFlag = s.visible || s.enter;
            return [
              base,
              "transition:opacity 160ms ease-out,transform 160ms ease-out;",
              visibleFlag
                ? "opacity:1;transform:translate3d(0,0,0);"
                : "opacity:0;transform:translate3d(0,-4px,0);",
            ].join("");
          }),
        }, contentNodes),
      ]),
    ]),
  ]);

  if (content === undefined) {
    return portal$;
  }

  return View({
    ...rest,
    onMounted($e) {
      if (rest.onMounted) rest.onMounted($e);
      const $ref = $e.firstElementChild || $e;
      store.popper.setReference(
        {
          $el: $ref,
          getRect() {
            return $ref.getBoundingClientRect();
          },
        },
        { force: true },
      );
      if (layer) {
        $e.addEventListener("pointerdown", () => {
          layer.pointerDown();
          const rect = $e.getBoundingClientRect();
          store.toggle({
            x: rect.x,
            y: rect.y + 4,
            width: rect.width,
            height: rect.height,
          });
        });
      } else {
        $e.addEventListener("pointerdown", () => {
          const rect = $e.getBoundingClientRect();
          store.toggle({
            x: rect.left,
            y: rect.bottom + 4,
            width: rect.width,
            height: rect.height,
          });
        });
      }
    },
    onUnmounted() {
      if (rest.onUnmounted) rest.onUnmounted();
    },
  }, [
    ...(children || []),
    portal$,
  ]);
}
