import { Input, InputProps } from "./input";

export interface PasswordInputProps extends Omit<InputProps, "type"> {}

export function PasswordInput(props: PasswordInputProps = {}) {
  return Input({
    ...(props as any),
    type: "password",
  });
}
