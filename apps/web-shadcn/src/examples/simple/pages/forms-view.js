import { View } from "@timeless/timeless";
import {
  Button,
  Input,
  Textarea,
  NumberInput,
  Select,
  DateRangePicker,
  FileInput,
  Checkbox,
  Switch,
  Label,
  Form,
  Field,
} from "@timeless/shadcn";

export function FormPageView(model) {
  const field = (key, title, children) =>
    Field(
      {
        class: "flex w-full flex-col gap-3",
        attributes: { n: `field-${key}` },
      },
      [
        Label({ for: `form-${key}`, attributes: { n: `label-${key}` } }, [
          title,
        ]),
        ...children,
      ],
    );
  return Form(
    {
      class: "flex w-full max-w-2xl flex-col gap-6",
      attributes: { n: "form-page" },
      onSubmit: model.preventSubmit,
    },
    [
      View(
        { class: "text-2xl font-bold", attributes: { n: "form-page-title" } },
        ["表单组件"],
      ),
      View(
        {
          class: "text-sm tt-text-muted-foreground",
          attributes: { n: "form-description" },
        },
        [
          "真实 shadcn 组件：输入、选择、日期范围和文件选择，三端共享同一份页面。",
        ],
      ),
      field("name", "姓名", [
        Input({
          store: model.name,
          id: "form-name",
          attributes: { n: "form-name" },
        }),
      ]),
      field("email", "邮箱", [
        Input({
          store: model.email,
          id: "form-email",
          attributes: { n: "form-email" },
        }),
      ]),
      field("role", "角色 / Select", [
        Select({
          store: model.role,
          id: "form-role",
          attributes: { n: "form-role" },
        }),
      ]),
      field("dates", "日期范围 / DateRangePicker", [
        DateRangePicker({
          store: model.dates,
          id: "form-dates",
          attributes: { n: "form-dates" },
        }),
        View(
          {
            class: "text-sm tt-text-muted-foreground",
            attributes: { n: "form-date-value" },
          },
          [model.dateText],
        ),
      ]),
      field("files", "附件 / FilePicker", [
        FileInput({
          store: model.files,
          id: "form-files",
          attributes: { n: "form-files" },
        }),
        View(
          {
            class: "text-sm tt-text-muted-foreground",
            attributes: { n: "form-file-value" },
          },
          [model.fileNames],
        ),
      ]),
      field("quantity", "席位 / NumberInput", [
        NumberInput({
          store: model.quantity,
          id: "form-quantity",
          attributes: { n: "form-quantity" },
        }),
      ]),
      field("bio", "简介 / Textarea", [
        Textarea({
          store: model.bio,
          id: "form-bio",
          attributes: { n: "form-bio" },
        }),
      ]),
      View(
        {
          class: "flex flex-row items-center gap-3",
          attributes: { n: "form-agreement-row" },
        },
        [
          Checkbox({
            store: model.agreed,
            id: "form-agreed",
            attributes: { n: "form-agreed-box" },
          }),
          Label(
            { for: "form-agreed", attributes: { n: "form-agreed-label" } },
            ["同意示例条款"],
          ),
        ],
      ),
      View(
        {
          class: "flex flex-row items-center gap-3",
          attributes: { n: "form-notification-row" },
        },
        [
          Switch({
            store: model.notifications,
            id: "form-notifications",
            attributes: { n: "form-notifications" },
          }),
          Label(
            {
              for: "form-notifications",
              attributes: { n: "form-notification-label" },
            },
            ["接收通知"],
          ),
        ],
      ),
      View(
        { class: "flex flex-row gap-3", attributes: { n: "form-actions" } },
        [
          Button({ store: model.submit, attributes: { n: "form-submit" } }, [
            "提交表单",
          ]),
          Button({ store: model.reset, attributes: { n: "form-reset" } }, [
            "重置",
          ]),
        ],
      ),
      View(
        {
          class: "rounded-lg tt-bg-muted p-4 text-sm",
          attributes: { n: "form-result", role: "status" },
        },
        [model.result],
      ),
    ],
  );
}
