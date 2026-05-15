import { ref, isRef, computed } from "@timeless/timeless";
import { FilePicker as NativeFilePicker } from "@timeless/timeless";
import {
  View,
  ViewProps,
  ViewChildren,
  styleNames,
  ListenerManager,
} from "@timeless/timeless";
import { FilePickerCore } from "@timeless/ui-vm";

export function Root(
  props: ViewProps & { store?: FilePickerCore },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Input(
  props: ViewProps & { store: FilePickerCore; id?: string },
) {
  const { store, style: st, class: cls, dataset = {}, id, ...rest } = props;
  return NativeFilePicker(props);
}

export function Clear(
  props: ViewProps & { store: FilePickerCore },
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
  props: ViewProps & { store: FilePickerCore },
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

export function DropZone(
  props: ViewProps & { store: FilePickerCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onMounted(event) {
        const $elm = event.target.get$elm();
        const handleDragOver = (e: any) => {
          e.preventDefault();
          $elm.setAttribute("data-dragging", "true");
        };
        const handleDragLeave = (e: any) => {
          e.preventDefault();
          $elm.removeAttribute("data-dragging");
        };
        const handleDrop = (e: any) => {
          e.preventDefault();
          $elm.removeAttribute("data-dragging");
          if (e.dataTransfer) {
            store.handleDrop(e.dataTransfer);
          }
        };
        const handleClick = () => {
          const input = $elm.parentElement?.querySelector('input[type="file"]');
          if (input) {
            input.click();
          }
        };
        $elm.addEventListener("dragover", handleDragOver);
        $elm.addEventListener("dragleave", handleDragLeave);
        $elm.addEventListener("drop", handleDrop);
        $elm.addEventListener("click", handleClick);
        if (rest.onMounted) {
          rest.onMounted(event);
        }
        return () => {
          $elm.removeEventListener("dragover", handleDragOver);
          $elm.removeEventListener("dragleave", handleDragLeave);
          $elm.removeEventListener("drop", handleDrop);
          $elm.removeEventListener("click", handleClick);
        };
      },
    },
    children,
  );
}

export function Disabled(
  props: ViewProps & { store: FilePickerCore },
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
