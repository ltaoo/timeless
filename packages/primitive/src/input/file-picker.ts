import { Ref, isRef } from "@timeless/reactive";

import { Box, BoxProps } from "@/content/box";
import { MountedEvent } from "@/event";
import { ListenerManager } from "@/util/listener";

export type FilePickerProps = BoxProps & {
  accept?: string | Ref<string>;
  multiple?: boolean | Ref<boolean>;
  capture?: string | Ref<string>;
  files?: Ref<FileList | null>;
  onChange?: (event: Event) => void;
};
type FilePickerState = {
  accept: string;
  multiple: boolean;
};

export function FilePicker(props: FilePickerProps = {}) {
  const { accept, multiple, capture, files, ...rest } = props;

  let $elm: any = null;
  const box$ = Box<FilePickerState>(rest, {
    accept: "",
    multiple: false,
  });

  const state = box$.state;
  const events = box$.events;

  const methods = {
    subscribe_value() {
      box$.methods.subscribe_props();
      const accept = props.accept;
      if (accept !== undefined) {
        if (isRef(accept)) {
          state.accept = accept.value;
          const unsubscribe = accept.subscribe({
            onChange(v) {
              state.accept = v;
            },
          });
          box$.methods.add_listen(unsubscribe);
        } else {
          state.accept = accept;
        }
      }
    },
  };

  methods.subscribe_value();

  return {
    t: "file-picker",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    state,
    children: [],
    events,
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        const unsubscribe = props.onMounted(event);
        box$.methods.add_listen(unsubscribe);
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      box$.methods.destroy();
    },
  };
}
