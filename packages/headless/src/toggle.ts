import { tp, merge } from "./theme.js";
import { View } from "./view.js";
import { ref, computed } from "@timeless/reactive";

export function Toggle(props: any) {
  const { store, value, disabled, theme: t, class: cn, style: st } = props;

  const isOn = (d: any) => (store ? d.state.checked || d.state.value : d.state);

  if (store) {
    const state = ref(store.state);
    const events: any[] = [];
    if (store.onStateChange)
      events.push(
        store.onStateChange(() => {
          state.as(store.state);
        }),
      );

    return View(
      {
        type: "button",
        class: computed(
          { state },
          (d: any) =>
            merge(
              tp(t?.root, { on: isOn(d), disabled: d.state.disabled }),
              cn,
              st,
            ).class,
        ),
        // style: computed({ state }, (d: any) => merge(tp(t?.root, { on: isOn(d), disabled: d.state.disabled }), cn, st).style),
        onClick() {
          store.toggle();
        },
        onUnmounted() {
          for (const fn of events) if (typeof fn === "function") fn();
          if (props.onUnmounted) props.onUnmounted();
        },
      },
      [
        View({
          type: "span",
          class: computed(
            { state },
            (d: any) => merge(tp(t?.thumb, { on: isOn(d) })).class || "",
          ),
          style: computed(
            { state },
            (d: any) => merge(tp(t?.thumb, { on: isOn(d) })).style || "",
          ),
        }),
      ],
    );
  }

  const stateRef = value;
  return View(
    {
      type: "button",
      class: computed(
        { state: stateRef },
        (d: any) => merge(tp(t?.root, { on: d.state, disabled }), cn, st).class,
      ),
      // style: computed(
      //   { state: stateRef },
      //   (d: any) => merge(tp(t?.root, { on: d.state, disabled }), cn, st).style,
      // ),
      onClick() {
        if (!disabled) stateRef.value = !stateRef.value;
      },
    },
    [
      View({
        type: "span",
        class: computed(
          { state: stateRef },
          (d: any) => merge(tp(t?.thumb, { on: d.state })).class || "",
        ),
        style: computed(
          { state: stateRef },
          (d: any) => merge(tp(t?.thumb, { on: d.state })).style || "",
        ),
      }),
    ],
  );
}
