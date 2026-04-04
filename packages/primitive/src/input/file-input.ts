import { Ref, isRef } from "@timeless/reactive";

import { Input, InputProps } from "./input";

export interface FileSelectProps extends Omit<
  InputProps,
  "type" | "value" | "maxLength" | "minLength" | "pattern" | "inputMode"
> {
  accept?: string | Ref<string>;
  multiple?: boolean | Ref<boolean>;
  capture?: string | Ref<string>;
  files?: Ref<FileList | null>;
}

export function FileSelect(props: FileSelectProps = {}) {
  const { accept, multiple, capture, files, attributes, onChange, ...rest } =
    props;

  return Input({
    ...(rest as any),
    type: "file",
    attributes: {
      ...(attributes || {}),
      accept,
      multiple,
      capture,
    },
    onChange(e) {
      const $input = e.target as HTMLInputElement | null;
      if ($input && files && isRef(files)) {
        (files as any).as($input.files || null);
      }
      if (onChange) onChange(e);
    },
  });
}
