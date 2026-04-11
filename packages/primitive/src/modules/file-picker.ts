import { ref, isRef, computed } from "@timeless/reactive";
import { FileInputCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { FilePicker as NativeInputPicker } from "@/input/file-picker";
import { styleNames } from "@/style";
import { ListenerManager } from "@/util/listener";

export function Root(
  props: ViewProps & { store?: FileInputCore },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Input(
  props: ViewProps & { store: FileInputCore; id?: string },
) {
  const { store, style: st, class: cls, dataset = {}, id, ...rest } = props;
  return NativeInputPicker(props);
}

export function Clear(
  props: ViewProps & { store: FileInputCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onMounted(event) {
        const $e = event.target;
        const handleClick = (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          store.clear();
          setTimeout(() => {
            store.focus();
          }, 0);
        };
        $e.addEventListener("click", handleClick);
        if (rest.onMounted) {
          rest.onMounted(event);
        }
        return () => {
          $e.removeEventListener("click", handleClick);
        };
      },
    },
    children,
  );
}

export function Loading(
  props: ViewProps & { store: FileInputCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const loading_ = ref(store.loading || false);

  const listener$ = ListenerManager();

  return View(
    {
      ...rest,
      style: styleNames([
        rest.style,
        computed(loading_, (t) => {
          return {
            display: t ? "" : "none",
          };
        }),
      ]),
      onMounted(event) {
        listener$.add(
          store.onStateChange(() => {
            loading_.as(store.loading || false);
          }),
        );
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return listener$.clean;
      },
    },
    children,
  );
}

export function Disabled(
  props: ViewProps & { store: FileInputCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const disabled$ = ref(store.disabled || false);

  if (store.onStateChange) {
    store.onStateChange(() => {
      disabled$.as(store.disabled || false);
    });
  }

  return View(
    {
      ...rest,
      onMounted(event) {
        const $elm = event.target;
        const updateState = () => {
          if (disabled$.value) {
            $elm.setAttribute("data-disabled", "true");
          } else {
            $elm.removeAttribute("data-disabled");
          }
        };
        disabled$.subscribe({ onChange: updateState });
        updateState();
        if (rest.onMounted) rest.onMounted(event);
      },
    },
    children,
  );
}
