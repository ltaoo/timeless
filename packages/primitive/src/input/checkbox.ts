import { Ref, isRef } from "@timeless/reactive";

import { Input, InputProps } from "./input";

export interface NativeCheckboxProps extends Omit<InputProps, "type"> {
  checked?: boolean | Ref<boolean>;
  indeterminate?: boolean | Ref<boolean>;
}

export function Checkbox(props: NativeCheckboxProps = {}) {
  const { checked, indeterminate, onMounted, onChange, ...rest } = props;

  return Input({
    ...rest,
    type: "checkbox",
    onMounted(event) {
      const $elm = (event as any).target;
      const $input = $elm as HTMLInputElement;

      if (checked !== undefined) {
        if (isRef(checked)) {
          checked._subscribe({
            onChange(v) {
              $input.checked = !!v;
            },
          });
          $input.checked = !!checked.value;
        } else {
          $input.checked = !!checked;
        }
      }

      if (indeterminate !== undefined) {
        if (isRef(indeterminate)) {
          indeterminate._subscribe({
            onChange(v) {
              $input.indeterminate = !!v;
            },
          });
          $input.indeterminate = !!indeterminate.value;
        } else {
          $input.indeterminate = !!indeterminate;
        }
      }

      if (onMounted) onMounted(event);
    },
    onChange(e) {
      const $input = e.target as HTMLInputElement | null;
      if ($input) {
        if (checked !== undefined && isRef(checked)) {
          (checked as any).as(!!$input.checked);
        }
        if (indeterminate !== undefined && isRef(indeterminate)) {
          (indeterminate as any).as(!!$input.indeterminate);
        }
      }
      if (onChange) onChange(e);
    },
  });
}
