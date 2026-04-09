import { Ref, isRef } from "@timeless/reactive";

import { Input, InputProps } from "./input";
import { MountedEvent } from "@/event";

export interface FileSelectProps {
  accept?: string | Ref<string>;
  multiple?: boolean | Ref<boolean>;
  capture?: string | Ref<string>;
  files?: Ref<FileList | null>;
  onMounted?: (event: MountedEvent) => void;
  onChange?: (event: Event) => void;
}

export function FileSelect(props: FileSelectProps = {}) {
  const { accept, multiple, capture, files, onMounted, onChange, ...rest } =
    props;

  let $elm: any = null;
  const state = {};
  // return Input({
  //   ...(rest as any),
  //   type: "file",
  //   attributes: {
  //     ...(attributes || {}),
  //     accept,
  //     multiple,
  //     capture,
  //   },
  //   onChange(e) {
  //     const $input = e.target as HTMLInputElement | null;
  //     if ($input && files && isRef(files)) {
  //       (files as any).as($input.files || null);
  //     }
  //     if (onChange) onChange(e);
  //   },
  // });
  return {
    t: "file",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    state,
    children: [],
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
  };
}
