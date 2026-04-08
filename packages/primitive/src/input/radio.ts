import { Ref, isRef } from "@timeless/reactive";

import { MountedEvent } from "@/event";
import { ViewProps } from "@/content/view";

export interface RadioProps {
  id?: string;
  style?: ViewProps["style"];
  attributes?: ViewProps["attributes"];
  dataset?: ViewProps["dataset"];
  checked?: boolean | Ref<boolean>;
  indeterminate?: boolean | Ref<boolean>;
  onChange?: (event: Event) => void;
  onMounted?: ViewProps["onMounted"];
  beforeUnmounted?: ViewProps["beforeUnmounted"];
  onUnmounted?: ViewProps["onUnmounted"];
}

export function Radio(props: RadioProps) {
  const { checked, indeterminate, onMounted, onChange, ...rest } = props;

  let $elm: any = null;
  // return Input({
  //   ...rest,
  //   type: "checkbox",
  //   onMounted(event) {
  //     const $elm = (event as any).target;
  //     const $input = $elm as HTMLInputElement;

  //     if (checked !== undefined) {
  //       if (isRef(checked)) {
  //         checked.subscribe({
  //           onChange(v) {
  //             $input.checked = !!v;
  //           },
  //         });
  //         $input.checked = !!checked.value;
  //       } else {
  //         $input.checked = !!checked;
  //       }
  //     }

  //     if (indeterminate !== undefined) {
  //       if (isRef(indeterminate)) {
  //         indeterminate.subscribe({
  //           onChange(v) {
  //             $input.indeterminate = !!v;
  //           },
  //         });
  //         $input.indeterminate = !!indeterminate.value;
  //       } else {
  //         $input.indeterminate = !!indeterminate;
  //       }
  //     }

  //     if (onMounted) onMounted(event);
  //   },
  //   onChange(e) {
  //     const $input = e.target as HTMLInputElement | null;
  //     if ($input) {
  //       if (checked !== undefined && isRef(checked)) {
  //         (checked as any).as(!!$input.checked);
  //       }
  //       if (indeterminate !== undefined && isRef(indeterminate)) {
  //         (indeterminate as any).as(!!$input.indeterminate);
  //       }
  //     }
  //     if (onChange) onChange(e);
  //   },
  // });
  return {
    t: "radio",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    render() {
      return null;
    },
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
  };
}
