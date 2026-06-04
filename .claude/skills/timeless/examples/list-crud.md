# 示例：列表 CRUD

完整的列表增删改查示例，展示响应式数组的全面用法。

---

## 场景

构建一个「用户管理」列表页面，包含：
- 列表展示（Table）
- 搜索过滤
- 新增用户（Dialog + Form）
- 编辑用户（Dialog + Form 复用）
- 删除用户（Popconfirm 确认）
- 批量删除
- 空状态

---

## 完整代码

```js
// === 1. 数据模型 ===

// 响应式用户列表
const users = reactiveArray([
  { id: 1, name: "张三", email: "zhangsan@example.com", role: "admin" },
  { id: 2, name: "李四", email: "lisi@example.com", role: "editor" },
  { id: 3, name: "王五", email: "wangwu@example.com", role: "viewer" },
]);

let nextId = 4;

// 搜索关键词
const searchKeyword = ref("");

// 过滤后的列表（computed 派生）
const filteredUsers = computed({ users, searchKeyword }, ({ users, searchKeyword }) => {
  if (!searchKeyword) return users;
  const kw = searchKeyword.toLowerCase();
  return users.filter(u =>
    u.name.toLowerCase().includes(kw) ||
    u.email.toLowerCase().includes(kw)
  );
});

// 选中项（用 reactiveArray 方便 toggle）
const selectedIds = reactiveArray([]);

// 是否全选
const isAllSelected = computed(
  { filteredUsers, selectedIds },
  (d) => d.filteredUsers.length > 0 && d.filteredUsers.every(u => d.selectedIds.includes(u.id))
);

// 选中数量
const selectedCount = computed(selectedIds, (ids) => ids.length);

// === 2. 搜索框 ===

const searchInput = new InputCore({
  defaultValue: "",
  placeholder: "搜索姓名或邮箱...",
});

searchInput.onStateChange(() => {
  searchKeyword.as(searchInput.state.value);
});

// === 3. 新增/编辑弹窗 ===

const formDialog$ = new DialogCore({ title: "" });
const editingUser = ref(null);  // null = 新增模式, 有值 = 编辑模式

// 表单字段
const nameInput = new InputCore({ defaultValue: "" });
const emailInput = new InputCore({ defaultValue: "" });

const roleOptions = [
  new SelectItemCore({ value: "admin", label: "管理员" }),
  new SelectItemCore({ value: "editor", label: "编辑者" }),
  new SelectItemCore({ value: "viewer", label: "观察者" }),
];
const roleSelect = new SelectCore({ defaultValue: "viewer", options: roleOptions });

const nameField = new SingleFieldCore({
  label: "姓名", name: "name", input: nameInput,
  rules: [{ required: true, message: "必填" }],
});
const emailField = new SingleFieldCore({
  label: "邮箱", name: "email", input: emailInput,
  rules: [
    { required: true, message: "必填" },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "邮箱格式不正确" },
  ],
});
const roleField = new SingleFieldCore({
  label: "角色", name: "role", input: roleSelect,
});

const userForm$ = new ObjectFieldCore({
  fields: { name: nameField, email: emailField, role: roleField },
});

// 打开新增弹窗
function openCreate() {
  editingUser.as(null);
  formDialog$.setTitle?.("新增用户"); // 或设置标题
  userForm$.reset();
  formDialog$.show();
}

// 打开编辑弹窗
function openEdit(user) {
  editingUser.as(user);
  formDialog$.setTitle?.("编辑用户");
  nameInput.setValue(user.name);
  emailInput.setValue(user.email);
  roleSelect.select(user.role);
  formDialog$.show();
}

// 提交表单
async function handleSubmit() {
  const result = await userForm$.validate();
  if (result.error) return;

  const userData = {
    ...result.data,
    id: editingUser.value ? editingUser.value.id : nextId++,
    role: roleSelect.state.value,
  };

  if (editingUser.value) {
    // 编辑：用 replace 替换原对象
    users.replace(editingUser.value, userData);
  } else {
    // 新增：用 push 插入
    users.push(userData);
  }

  formDialog$.hide();
  userForm$.reset();
}

// === 4. 删除确认 ===

const deleteConfirm$ = new PopconfirmCore({});

function confirmDelete(user) {
  deleteConfirm$.store?.setData?.({ user });
  // 或使用全局变量暂存待删除用户
  window._pendingDelete = user;
  // 触发 Popconfirm 显示（通过对应按钮的 Popconfirm）
}

function executeDelete() {
  const user = window._pendingDelete;
  if (!user) return;
  users.remove(user);
  selectedIds.remove(user.id);
  window._pendingDelete = null;
}

// 批量删除
const batchDeleteBtn = new ButtonCore({
  variant: "destructive",
  size: "sm",
  disabled: true,
});

// selectedCount 变化时更新按钮状态
selectedCount.subscribe({
  onChange(cnt) {
    if (cnt > 0) batchDeleteBtn.enable();
    else batchDeleteBtn.disable();
  }
});

batchDeleteBtn.onClick(() => {
  users.removeBy(u => selectedIds.includes(u.id));
  selectedIds.clear();
});

// 全选/取消全选
function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.clear();
  } else {
    const ids = filteredUsers.value.map(u => u.id);
    selectedIds.assign(ids);
  }
}

function toggleSelect(id) {
  selectedIds.toggle(id);
}

// === 5. 构建视图 ===

export default function UserListView() {
  return View({ class: "max-w-4xl mx-auto p-6 space-y-6" }, [

    // 页面标题
    View({ class: "text-2xl font-bold" }, [Txt("用户管理")]),

    // 工具栏
    Flex({ justify: "between", items: "center", gap: 4 }, [
      // 搜索
      View({ class: "w-64" }, [
        Input({ store: searchInput }),
      ]),

      // 操作按钮
      Flex({ gap: 2 }, [
        Button({
          store: new ButtonCore({ variant: "default", onClick: openCreate }),
        }, [Txt("新增用户")]),

        Button({ store: batchDeleteBtn }, [
          Txt(computed(selectedCount, (n) => `批量删除 (${n})`)),
        ]),
      ]),
    ]),

    // 表格
    View({ class: "border rounded-lg overflow-hidden" }, [
      Show({
        when: computed(filteredUsers, (list) => list.length === 0),
        ok: () => [
          View({ class: "text-center py-16 text-gray-400" }, [
            Txt(searchKeyword.value ? "未找到匹配用户" : "暂无用户数据"),
          ]),
        ],
        else: () => [
          Table({}, [
            TableHeader({}, [
              TableRow({}, [
                TableHead({ class: "w-10" }, [
                  Checkbox({
                    store: new CheckboxCore({
                      checked: isAllSelected.value,
                      onChange: toggleSelectAll,
                    }),
                  }),
                ]),
                TableHead({}, [Txt("姓名")]),
                TableHead({}, [Txt("邮箱")]),
                TableHead({}, [Txt("角色")]),
                TableHead({ class: "w-24" }, [Txt("操作")]),
              ]),
            ]),
            TableBody({}, [
              For({
                each: filteredUsers,
                render(user) {
                  const isSelected = computed(selectedIds, (ids) => ids.includes(user.id));

                  return TableRow({
                    class: computed(isSelected, (s) => s ? "bg-blue-50" : ""),
                  }, [
                    TableCell({}, [
                      Checkbox({
                        store: new CheckboxCore({
                          checked: isSelected.value,
                          onChange() { toggleSelect(user.id); },
                        }),
                      }),
                    ]),
                    TableCell({}, [Txt(user.name)]),
                    TableCell({}, [Txt(user.email)]),
                    TableCell({}, [
                      Badge({
                        variant: user.role === "admin" ? "default"
                               : user.role === "editor" ? "secondary"
                               : "outline",
                      }, [Txt(user.role)]),
                    ]),
                    TableCell({}, [
                      Flex({ gap: 1 }, [
                        Button({
                          store: new ButtonCore({
                            variant: "ghost",
                            size: "xs",
                            onClick() { openEdit(user); },
                          }),
                        }, [Txt("编辑")]),

                        // 删除（带 Popconfirm 确认）
                        Popconfirm({
                          store: new PopconfirmCore({
                            onConfirm() { executeDelete(); },
                          }),
                          title: [Txt("确认删除")],
                          description: [Txt("此操作不可撤销")],
                        }, [
                          Button({
                            store: new ButtonCore({
                              variant: "ghost",
                              size: "xs",
                            }),
                          }, [Txt("删除")]),
                        ]),
                      ]),
                    ]),
                  ]);
                },
              }),
            ]),
          ]),
        ],
      }),
    ]),

    // 新增/编辑弹窗
    Dialog({ store: formDialog$ }, [
      Form({ store: userForm$, class: "space-y-4 p-4" }, [
        Field({ store: nameField }, [
          View({ class: "space-y-1.5" }, [
            FieldLabel({}, [Txt("姓名")]),
            Input({ store: nameInput }),
            FieldError({ store: nameField }),
          ]),
        ]),
        Field({ store: emailField }, [
          View({ class: "space-y-1.5" }, [
            FieldLabel({}, [Txt("邮箱")]),
            Input({ store: emailInput }),
            FieldError({ store: emailField }),
          ]),
        ]),
        Field({ store: roleField }, [
          View({ class: "space-y-1.5" }, [
            FieldLabel({}, [Txt("角色")]),
            Select({ store: roleSelect }),
            FieldError({ store: roleField }),
          ]),
        ]),
        Flex({ justify: "end", gap: 2, class: "pt-4 border-t" }, [
          Button({
            store: new ButtonCore({
              variant: "outline",
              onClick() {
                formDialog$.hide();
                userForm$.reset();
              },
            }),
          }, [Txt("取消")]),
          Button({
            store: new ButtonCore({
              variant: "default",
              onClick: handleSubmit,
            }),
          }, [Txt("确认")]),
        ]),
      ]),
    ]),
  ]);
}
```

---

## 关键要点

### 响应式数组操作

| 操作 | 方法 | 通知类型 |
|------|------|---------|
| 新增 | `users.push(item)` | `"insert"` — 只插入新 DOM |
| 删除 | `users.remove(item)` | `"delete"` — 只移除对应 DOM |
| 编辑 | `users.replace(old, new)` | `"refresh"` — 整体重渲染该行 |
| 批量删除 | `users.removeBy(predicate)` | `"refresh"` |
| 清空 | `users.clear()` | `"refresh"` |

### 搜索过滤模式

```js
// 用 computed 派生过滤后的列表
const filtered = computed({ users, searchKeyword }, (d) => {
  return d.users.filter(u => u.name.includes(d.searchKeyword));
});

// For 渲染过滤后的列表
For({ each: filtered, render(item) { ... } });
```

### 新增/编辑复用

```js
// 用 ref 区分模式
const editingUser = ref(null);  // null = 新增, 有值 = 编辑

// 新增
editingUser.as(null);
formDialog$.show();

// 编辑
editingUser.as(user);
nameInput.setValue(user.name);
formDialog$.show();

// 提交时判断
if (editingUser.value) {
  users.replace(editingUser.value, newData);  // 编辑
} else {
  users.push(newData);                         // 新增
}
```

### 选中状态管理

```js
const selectedIds = reactiveArray([]);

// 切换单选
function toggleSelect(id) {
  selectedIds.toggle(id);
}

// 全选/取消全选
function toggleSelectAll() {
  if (isAllSelected.value) selectedIds.clear();
  else selectedIds.assign(filteredUsers.value.map(u => u.id));
}

// 选中数量
const selectedCount = computed(selectedIds, (ids) => ids.length);
```
