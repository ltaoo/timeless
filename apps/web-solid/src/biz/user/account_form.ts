import { ObjectFieldCore, SingleFieldCore } from "@/domains/ui/formv2";

import { InputCore } from "@/domains/ui/form/input";

export function UserAccountForm() {
  const ui = {
    $form: new ObjectFieldCore({
      fields: {
        email: new SingleFieldCore({
          name: "email",
          label: "邮箱",
          input: new InputCore({ defaultValue: "" }),
          rules: [
            {
              required: true,
              // message: "请输入邮箱",
            },
          ],
        }),
        password: new SingleFieldCore({
          name: "password",
          label: "密码",
          input: new InputCore({ defaultValue: "" }),
          rules: [
            {
              required: true,
              // message: "请输入密码",
            },
          ],
        }),
      },
    }),
  };
  return { ui };
}
