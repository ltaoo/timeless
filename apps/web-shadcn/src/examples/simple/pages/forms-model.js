import { ref, vm } from "@timeless/timeless";

export function FormPageModel() {
  const name = new vm.InputCore({
    defaultValue: "",
    placeholder: "请输入姓名",
  });
  const email = new vm.InputCore({
    defaultValue: "",
    placeholder: "name@example.com",
    type: "email",
  });
  const bio = new vm.InputCore({
    defaultValue: "",
    placeholder: "简单介绍一下自己",
  });
  const quantity = new vm.NumberInputCore({ defaultValue: 1, min: 1, max: 99 });
  const role = new vm.SelectCore({
    defaultValue: null,
    placeholder: "请选择角色",
    position: "popper",
    options: [
      new vm.SelectItemCore({ value: "developer", label: "开发者" }),
      new vm.SelectItemCore({ value: "designer", label: "设计师" }),
      new vm.SelectItemCore({
        value: "viewer",
        label: "只读访客",
        disabled: true,
      }),
    ],
  });
  const dates = vm.DateRangePickerCore({ today: new Date() });
  const files = new vm.FilePickerCore({
    accept: ".txt,.md,.pdf",
    multiple: true,
  });
  const agreed = new vm.CheckboxCore({ checked: false });
  const notifications = vm.SwitchCore({ defaultValue: true });
  const result = ref(
    "填写资料后提交。示例仅在本次运行中保存数据，不上传文件。",
  );
  const dateText = ref("尚未选择日期范围");
  const fileNames = ref("尚未选择文件");
  const subscriptions = [
    dates.onChange(() =>
      dateText.as(dates.state.dateText || "尚未选择日期范围"),
    ),
    files.onChange((value) =>
      fileNames.as(
        value?.map((file) => file.name).join("、") || "尚未选择文件",
      ),
    ),
    files.onReject(() => result.as("仅支持 .txt、.md、.pdf 文件。")),
  ];
  return {
    name,
    email,
    bio,
    quantity,
    role,
    dates,
    files,
    agreed,
    notifications,
    result,
    dateText,
    fileNames,
    submit: new vm.ButtonCore({
      onClick() {
        if (!name.value.trim()) {
          result.as("请输入姓名。");
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
          result.as("请输入有效的邮箱地址。");
          return;
        }
        if (!role.value) {
          result.as("请选择角色。");
          return;
        }
        if (!dates.value) {
          result.as("请选择日期范围。");
          return;
        }
        if (!agreed.checked) {
          result.as("请先同意示例条款。");
          return;
        }
        result.as(
          `已提交：${name.value.trim()} · ${role.value} · ${dates.state.dateText} · ${files.value?.length ?? 0} 个文件`,
        );
      },
    }),
    reset: new vm.ButtonCore({
      variant: "secondary",
      onClick() {
        name.setValue("");
        email.setValue("");
        bio.setValue("");
        quantity.setValue(1);
        role.clear();
        dates.clear();
        files.clear();
        agreed.setValue(false);
        notifications.setValue(true);
        dateText.as("尚未选择日期范围");
        result.as("表单已重置。");
      },
    }),
    dismiss() {
      role.hide();
      dates.$presence.hide();
    },
    destroy() {
      subscriptions.forEach((stop) => stop());
    },
  };
}
