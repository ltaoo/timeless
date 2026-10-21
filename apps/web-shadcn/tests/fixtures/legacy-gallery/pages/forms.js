import {
  Checkbox,
  Input,
  NumberInput,
  Radio,
  Select,
  Textarea,
} from "@timeless/timeless";
import { Action, Section, Stack, TextView } from "../components.js";

export function FormPageView(model) {
  return [
    Section(
      "form-fields",
      "资料表单",
      "输入、选择、校验与重置组成一个可运行的表单示例。",
      [
        TextView("name-label", "姓名 *", "field-label"),
        Input({
          class: "field",
          attributes: { n: "form-name", "aria-label": "姓名" },
          value: model.name,
          placeholder: "例如：Timeless",
          onInput: (event) => model.setName(event.target.value),
        }),
        TextView("email-label", "邮箱 *", "field-label"),
        Input({
          class: "field",
          attributes: { n: "form-email", "aria-label": "邮箱" },
          value: model.email,
          placeholder: "you@example.com",
          onInput: (event) => model.setEmail(event.target.value),
        }),
        Stack(
          "form-select-number",
          [
            Stack(
              "role-field",
              [
                TextView("role-label", "角色 *", "field-label"),
                Select({
                  class: "field",
                  attributes: { n: "form-role", "aria-label": "角色" },
                  value: model.role,
                  placeholder: "请选择角色",
                  options: model.roles,
                  onChange: (event) => model.setRole(event.target.value),
                }),
              ],
              "stack grow",
            ),
            Stack(
              "quantity-field",
              [
                TextView("quantity-label", "席位数量（1–99）", "field-label"),
                NumberInput({
                  class: "field",
                  attributes: { n: "form-quantity", "aria-label": "席位数量" },
                  value: model.quantity,
                  onChange: (event) => model.setQuantity(event.target.value),
                }),
              ],
              "stack grow",
            ),
          ],
          "row",
        ),
        TextView("bio-label", "个人简介", "field-label"),
        Textarea({
          class: "field textarea",
          attributes: { n: "form-bio", "aria-label": "个人简介" },
          value: model.bio,
          placeholder: "介绍一下自己…",
          onInput: (event) => model.setBio(event.target.value),
        }),
        TextView("plan-label", "使用方案", "field-label"),
        Stack(
          "plan-options",
          [
            Radio({
              attributes: { n: "plan-personal", "aria-label": "个人方案" },
              name: "plan",
              checked: model.personal,
              onChange: () => model.setPlan("personal"),
            }),
            TextView("plan-personal-label", "个人"),
            Radio({
              attributes: { n: "plan-team", "aria-label": "团队方案" },
              name: "plan",
              checked: model.team,
              onChange: () => model.setPlan("team"),
            }),
            TextView("plan-team-label", "团队"),
          ],
          "wrap",
        ),
        Stack(
          "agreement-field",
          [
            Checkbox({
              attributes: { n: "form-agreed", "aria-label": "同意示例条款" },
              checked: model.agreed,
              onChange: (event) => model.setAgreed(event.target.checked),
            }),
            TextView("agreement-label", "我同意示例条款"),
          ],
          "row",
        ),
        Stack(
          "form-actions",
          [
            Action("form-submit", "提交资料", () => model.submit()),
            Action("form-reset", "重置", () => model.reset(), "button outline"),
          ],
          "wrap",
        ),
        TextView("form-result", model.result, "notice"),
      ],
    ),
    Section(
      "disabled-form",
      "Disabled / 禁用状态",
      "禁用控件不接受输入，视觉状态由 class 样式控制。",
      [
        Input({
          class: "field",
          attributes: { n: "disabled-input", "aria-label": "禁用输入框" },
          value: "只读示例",
          disabled: true,
        }),
        Select({
          class: "field",
          attributes: { n: "disabled-select", "aria-label": "禁用选择框" },
          options: model.roles,
          placeholder: "不可选择",
          disabled: true,
        }),
      ],
    ),
  ];
}
