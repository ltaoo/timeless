# 示例：构建一个简单页面

完整的 store-driven 页面构建示例，包含标题、列表和操作按钮。

---

## 场景

构建一个「任务列表」页面，包含：
- 页面标题
- 一个任务列表（可添加、删除）
- 文本输入框 + 添加按钮
- 空状态提示

---

## 完整代码

```js
// === 1. 创建控制器（Core） ===

// 任务列表数据
const tasks = reactiveArray([
  { id: 1, title: "完成设计稿", done: false },
  { id: 2, title: "编写单元测试", done: true },
]);

// 输入框
const taskInput = new InputCore({
  defaultValue: "",
  placeholder: "输入新任务...",
});

// 添加按钮
const addBtn = new ButtonCore({
  variant: "default",
  size: "sm",
});

// 清除按钮
const clearBtn = new ButtonCore({
  variant: "outline",
  size: "sm",
  disabled: true,
});

// === 2. 绑定业务逻辑 ===

let nextId = 3;

addBtn.onClick(() => {
  const title = taskInput.state.value;
  if (!title || !title.trim()) return;

  // 将新任务插入列表头部
  tasks.insert(0, { id: nextId++, title: title.trim(), done: false });

  // 清空输入
  taskInput.setValue("");

  // 启用清除按钮（如果有任务）
  clearBtn.enable();
});

clearBtn.onClick(() => {
  tasks.clear();
  clearBtn.disable();
});

// 响应列表变化，控制清除按钮状态
tasks.subscribe({
  onChange(items) {
    if (items.length === 0) {
      clearBtn.disable();
    } else {
      clearBtn.enable();
    }
  }
});

// === 3. 构建视图 ===

export default function TaskPageView() {
  return View({ class: "max-w-lg mx-auto p-6 space-y-6" }, [

    // 标题
    View({ class: "text-2xl font-bold" }, [
      Txt("任务列表"),
    ]),

    // 输入区域
    Flex({ gap: 2 }, [
      Input({
        store: taskInput,
        class: "flex-1",
      }),
      Button({ store: addBtn }, [
        Txt("添加"),
      ]),
    ]),

    // 列表区域
    View({ class: "space-y-2" }, [
      Show({
        when: computed(tasks, (items) => items.length === 0),
        ok: () => [
          View({ class: "text-center text-gray-400 py-8" }, [
            Txt("暂无任务，请添加"),
          ]),
        ],
        else: () => [
          For({
            each: tasks,
            render(task, idx) {
              return View({
                class: computed(task.done), // 已完成任务展示不同样式
                style: {
                  padding: "0.75rem 1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: task.done ? "#f0fdf4" : "#f9fafb",
                },
              }, [
                Flex({ justify: "between", items: "center" }, [
                  // 任务标题
                  View({
                    class: computed(task.done, (done) =>
                      done ? "line-through text-gray-400" : "text-gray-900"
                    ),
                  }, [
                    Txt(task.title),
                  ]),

                  // 操作按钮
                  Flex({ gap: 2 }, [
                    // 切换完成状态
                    Button({
                      store: new ButtonCore({
                        variant: task.done ? "outline" : "default",
                        size: "xs",
                        onClick() {
                          task.done = !task.done;
                          // 触发列表刷新
                          tasks.refresh();
                        },
                      }),
                    }, [Txt(task.done ? "撤销" : "完成")]),

                    // 删除
                    Button({
                      store: new ButtonCore({
                        variant: "ghost",
                        size: "xs",
                        onClick() {
                          tasks.remove(task);
                        },
                      }),
                    }, [Txt("删除")]),
                  ]),
                ]),
              ]);
            },
          }),
        ],
      }),
    ]),

    // 底部清除按钮
    View({ class: "pt-4 border-t" }, [
      Button({ store: clearBtn }, [
        Txt("清除全部"),
      ]),
    ]),
  ]);
}
```

---

## 关键要点

1. **数据驱动**：`tasks` 是 `reactiveArray`，`push`/`remove`/`clear` 自动触发列表增量更新
2. **条件渲染**：`Show({ when: ... })` 根据列表是否为空切换空状态和列表
3. **列表渲染**：`For({ each: tasks, render })` 渲染任务列表，只增量更新变化项
4. **响应式样式**：`class: computed(...)` 根据任务状态动态切换样式
5. **双向绑定**：输入框 → `InputCore`，按钮 → `ButtonCore`，数据由 Core 持有

---

## 挂载

```js
const page = TaskPageView();
document.getElementById("app").appendChild(page.render());
page.onMounted();
```
