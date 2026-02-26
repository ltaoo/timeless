import timeless from "@timeless/domains";

export function UserAccountForm() {
  const ui = {
    $form: new timeless.ui.ObjectFieldCore({
      fields: {
        email: new timeless.ui.SingleFieldCore({
          label: "邮箱",
          rules: [
            {
              required: true,
              maxLength: 30,
              minLength: 5,
              mode: "email",
            },
          ],
          input: new timeless.ui.InputCore({ defaultValue: "", placeholder: "请输入邮箱" }),
        }),
        password: new timeless.ui.SingleFieldCore({
          label: "密码",
          rules: [
            {
              required: true,
              maxLength: 30,
              minLength: 3,
            },
          ],
          input: new timeless.ui.InputCore({ defaultValue: "", placeholder: "请输入密码", type: "password" }),
        }),
      },
    }),
  };
  return {
    ui,
  };
}
