import { NativeInput, NativeInputProps } from "./input";

export interface NativePasswordProps extends Omit<NativeInputProps, "type"> {}

export function NativePassword(props: NativePasswordProps = {}) {
  return NativeInput({
    ...(props as any),
    type: "password",
  });
}
