import {
  View,
  ViewProps,
  ViewChildren,
  Checkbox,
  Button,
  ButtonProps,
} from "@timeless/timeless";
import { SwitchCore } from "@timeless/ui-vm";

export function Root(
  props: ButtonProps & {
    store: SwitchCore;
    id?: string;
  },
  children?: ViewChildren,
) {
  const { store, id, ...rest } = props;

  return Button(
    {
      ...rest,
      attributes: {
        role: "switch",
        // "aria-checked": computed(state() => store.state.checked),
      },
      onClick(e) {
        if (e.target) {
          if ((e.target as any).tagName === "INPUT") {
            return;
          }
          // store.toggle();
        }
      },
    },
    [
      Checkbox({
        attributes: {
          id,
        },
        style: {
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          "white-space": "nowrap",
          "border-width": 0,
        },
        // onClick(e) {
        //   e.stopPropagation();
        // },
        onMounted() {
          // el.checked = store.state.checked;
          // store.onStateChange(() => {
          //   el.checked = store.state.checked;
          // });
        },
      }),
      ...(children || []),
    ],
  );
}

export function Thumb(
  props: ViewProps & { store: SwitchCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}
