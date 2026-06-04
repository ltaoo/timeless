# 示例：弹窗表单

完整的弹窗表单示例，展示 store 驱动模式下的 Dialog + Form 组合用法。

---

## 场景

构建一个「新增用户」的弹窗表单，包含：
- 触发按钮
- Dialog 弹窗
- 表单字段：姓名、邮箱、角色（Select）
- 表单验证
- 提交按钮（loading 状态）

---

## 完整代码

```js
// === 1. 创建控制器 ===

// 弹窗
const dialog$ = new DialogCore({
  title: "新增用户",
  footer: false,  // 使用自定义 footer
});

// 触发按钮
const triggerBtn = new ButtonCore({
  variant: "default",
});

// 表单字段
const nameField = new SingleFieldCore({
  label: "姓名",
  name: "name",
  input: new InputCore({
    defaultValue: "",
    placeholder: "请输入姓名",
  }),
  rules: [
    { required: true, message: "姓名不能为空" },
    { min: 2, message: "姓名至少 2 个字符" },
  ],
});

const emailField = new SingleFieldCore({
  label: "邮箱",
  name: "email",
  input: new InputCore({
    defaultValue: "",
    placeholder: "email@example.com",
  }),
  rules: [
    { required: true, message: "邮箱不能为空" },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "邮箱格式不正确" },
  ],
});

// Select 选项
const roleOptions = [
  new SelectItemCore({ value: "admin", label: "管理员" }),
  new SelectItemCore({ value: "editor", label: "编辑者" }),
  new SelectItemCore({ value: "viewer", label: "观察者" }),
];

const roleSelect = new SelectCore({
  defaultValue: "viewer",
  options: roleOptions,
});

const roleField = new SingleFieldCore({
  label: "角色",
  name: "role",
  input: roleSelect,
  rules: [{ required: true, message: "请选择角色" }],
});

// 表单
const form$ = new ObjectFieldCore({
  fields: {
    name: nameField,
    email: emailField,
    role: roleField,
  },
});

// 提交/取消按钮
const submitBtn = new ButtonCore({
  variant: "default",
});

const cancelBtn = new ButtonCore({
  variant: "outline",
});

// === 2. 绑定业务逻辑 ===

triggerBtn.onClick(() => {
  dialog$.show();
});

cancelBtn.onClick(() => {
  // 重置表单并关闭
  form$.reset();
  dialog$.hide();
});

submitBtn.onClick(async () => {
  // 验证表单
  const result = await form$.validate();
  if (result.error) {
    // 错误已自动显示在各 Field 上
    return;
  }

  submitBtn.setLoading(true);

  try {
    // 模拟 API 请求
    await saveUser(result.data);
    dialog$.hide();
    form$.reset();

    // 通知用户
    // toast$.show({ texts: ["用户创建成功"] });
  } catch (err) {
    // 错误处理
  } finally {
    submitBtn.setLoading(false);
  }
});

dialog$.onHide(() => {
  form$.reset();
});

// === 3. 构建视图 ===

export default function UserCreateView() {
  return View({}, [
    // 触发按钮
    Button({ store: triggerBtn }, [Txt("新增用户")]),

    // 弹窗
    Dialog({ store: dialog$ }, [
      Form({ store: form$, class: "space-y-4 p-4" }, [

        // 姓名字段
        Field({ store: nameField }, [
          View({ class: "space-y-1.5" }, [
            FieldLabel({}, [Txt(nameField.state.label)]),
            Input({ store: nameField.input, id: nameField.id }),
            FieldError({ store: nameField }),
          ]),
        ]),

        // 邮箱字段
        Field({ store: emailField }, [
          View({ class: "space-y-1.5" }, [
            FieldLabel({}, [Txt(emailField.state.label)]),
            Input({ store: emailField.input, id: emailField.id }),
            FieldError({ store: emailField }),
          ]),
        ]),

        // 角色字段
        Field({ store: roleField }, [
          View({ class: "space-y-1.5" }, [
            FieldLabel({}, [Txt(roleField.state.label)]),
            Select({ store: roleSelect, id: roleField.id }),
            FieldError({ store: roleField }),
          ]),
        ]),

        // 自定义 footer 按钮
        Flex({ justify: "end", gap: 2, class: "pt-4 border-t" }, [
          Button({ store: cancelBtn }, [Txt("取消")]),
          Button({ store: submitBtn }, [Txt("确认创建")]),
        ]),
      ]),
    ]),
  ]);
}

// === 模拟 API ===
async function saveUser(data) {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}
```

---

## 关键要点

1. **Dialog 生命周期管理**：`show()` / `hide()`，关闭时重置表单
2. **表单验证**：每个 Field 有独立的 `rules`，`form$.validate()` 递归验证所有字段
3. **Field + Input 绑定**：`Field({ store: field$ })` 套 `Input({ store: field$.input })`
4. **异步提交**：提交时 `setLoading(true)`，完成后 `setLoading(false)`
5. **错误显示**：`FieldError` 自动订阅 `store.error`，错误时显示，修正后自动消失
6. **表单重置**：`form$.reset()` 清除所有值和错误

---

## Field API 速查

```js
Field({ store: field$ }, [
  FieldLabel({}, [...]),       // state.label
  FieldDescription({}, [...]), // 描述文本
  FieldHelp({}, [...]),        // 帮助文本
  FieldError({ store }),       // 错误信息（自动显示/隐藏）
  Input({ store: field$.input }),
]);

// 布局方向
Field({ store: field$, orientation: "horizontal" }, [...]);  // 水平布局
Field({ store: field$, inline: true }, [...]);               // 内联布局
```
