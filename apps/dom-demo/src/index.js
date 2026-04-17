import {
  Show,
  Grid,
  View,
  For,
  Icon,
  Input,
  Button,
  Popper,
  Portal,
  Fragment,
  Img,
  Checkbox,
  FilePicker,
  Select,
  NumberInput,
  DismissableLayer,
  ref,
  styleNames,
  combine,
  computed,
  refarr,
  refobj,
  getobj,
  classNames,
  Label,
  Row,
  Column,
  SplitView,
  SplitPane,
  ScrollView,
  TabView,
  TabPane,
  getDeps,
  printDepTree,
  findLeakedDeps,
} from "@timeless/timeless";
import { patch } from "@timeless/timeless";
import { render, platform } from "@timeless/timeless-dom";

import Page from "./pages/index.js";

/**
 * 测试：组件销毁后是否正确清除对响应式数据的监听，避免内存泄漏
 *
 * 依赖链路说明：
 *   ref/refarr/refobj  ←  computed(ref, fn)  ←  Text/View(style binding)
 *                                                   ↑
 *   For 内部会创建:
 *     - subscribe(each)          → 监听 items_ 的 onChange/onPatch
 *     - computed(each, fn) as idx → 每个 item 一个 idx，监听 items_
 *   render 函数里:
 *     - computed(item, fn)        → 在 registry 中为 item 创建 refObject，并 subscribe
 *
 * 预期：组件销毁后，上述所有 subscribe 都应被清除
 */
function ApplicationView() {
  // ========== 响应式数据 ==========
  const visible_ = ref(false);
  const count_ = ref(0);
  const theme_ = refobj({ color: "red", size: 14 });
  const items_ = refarr([
    { id: 1, text: "Item A" },
    { id: 2, text: "Item B" },
    { id: 3, text: "Item C" },
  ]);

  // 收集所有中间产生的 computed ref，用于追踪
  // key: 描述, value: DerivedRef
  const trackedComputeds = [];

  // ========== 辅助函数 ==========
  function logDeps(label) {
    console.log(`\n===== ${label} =====`);
    console.log("visible_ deps:", getDeps(visible_).length, getDeps(visible_));
    console.log("count_ deps:", getDeps(count_).length, getDeps(count_));
    console.log("theme_ deps:", getDeps(theme_).length, getDeps(theme_));
    console.log("items_ deps:", getDeps(items_).length, getDeps(items_));

    // 打印所有收集到的 computed 的 deps
    if (trackedComputeds.length > 0) {
      console.log("--- tracked computeds ---");
      for (const { label: l, ref: r } of trackedComputeds) {
        console.log(`  ${l}: value=${r.value}, deps=${getDeps(r).length}`, getDeps(r));
      }
    }

    printDepTree([visible_, count_, theme_, items_]);
  }

  function checkLeak(label) {
    console.log(`\n[CHECK] ${label || ""}`);
    const refs = [visible_, count_, theme_, items_];
    const totalDeps = findLeakedDeps(refs);
    console.log(`  主 ref 总 deps: ${totalDeps.length}`);
    totalDeps.forEach((dep) => {
      console.log(`    - ${dep.trackId}`, dep.trackInfo || "");
    });

    // 检查 computed 上的 deps（这些是 computed → Text 的监听）
    let computedLeaks = 0;
    for (const { label: l, ref: r } of trackedComputeds) {
      const deps = getDeps(r);
      if (deps.length > 0) {
        computedLeaks += deps.length;
        console.warn(`  [LEAK?] computed "${l}" still has ${deps.length} deps:`, deps);
      }
    }

    if (computedLeaks === 0 && totalDeps.length === 0) {
      console.log("  ✓ 所有 deps 已清除，无泄漏");
    }
  }

  // ========== 状态显示 ==========
  const depsDisplay_ = ref("");

  function refreshDepsDisplay() {
    const lines = [
      `visible_: ${getDeps(visible_).length}`,
      `count_: ${getDeps(count_).length}`,
      `theme_: ${getDeps(theme_).length}`,
      `items_: ${getDeps(items_).length}`,
      `computeds: ${trackedComputeds.length}`,
      `total: ${findLeakedDeps([visible_, count_, theme_, items_]).length}`,
    ];
    depsDisplay_.as(lines.join(" | "));
  }

  // ========== 追踪 computed 工厂 ==========
  // 包装 computed，同时收集到 trackedComputeds 数组中
  function trackedComputed(deps, fn, label) {
    const c = computed(deps, fn);
    trackedComputeds.push({ label, ref: c });
    return c;
  }

  // ========== UI ==========
  return View(
    {
      style: {
        color: "#fff",
        padding: "20px",
        "font-family": "monospace",
      },
    },
    [
      // 标题
      View(
        { style: { "font-size": "18px", "font-weight": "bold", "margin-bottom": "16px" } },
        ["Dep Leak Test - Reactive Cleanup Verification"],
      ),

      // 实时 deps 状态
      View(
        {
          style: {
            padding: "8px",
            "background-color": "rgba(255,255,255,0.1)",
            "margin-bottom": "16px",
            "font-size": "12px",
          },
        },
        [depsDisplay_],
      ),

      // ========== 操作按钮 ==========
      Row({ gap: 8, style: { "margin-bottom": "16px", "flex-wrap": "wrap" } }, [
        Button(
          {
            onClick() {
              logDeps("Manual Print");
              refreshDepsDisplay();
            },
          },
          ["Print Deps"],
        ),
        Button(
          {
            onClick() {
              visible_.as((prev) => !prev);
              setTimeout(() => {
                logDeps(`After Toggle Show (visible=${visible_.value})`);
                refreshDepsDisplay();
              }, 100);
            },
          },
          ["Toggle Show"],
        ),
        Button(
          {
            onClick() {
              count_.as((prev) => prev + 1);
              setTimeout(() => {
                logDeps(`After Increment count (count=${count_.value})`);
                refreshDepsDisplay();
              }, 100);
            },
          },
          ["Increment Count"],
        ),
        Button(
          {
            onClick() {
              items_.push({ id: Date.now(), text: `Item ${items_.value.length + 1}` });
              setTimeout(() => {
                logDeps(`After Add Item (length=${items_.value.length})`);
                refreshDepsDisplay();
              }, 100);
            },
          },
          ["Add Item"],
        ),
        Button(
          {
            onClick() {
              if (items_.value.length > 0) {
                items_.remove(items_.value[items_.value.length - 1]);
              }
              setTimeout(() => {
                logDeps(`After Remove Last (length=${items_.value.length})`);
                refreshDepsDisplay();
              }, 100);
            },
          },
          ["Remove Last"],
        ),
        Button(
          {
            onClick() {
              items_.as([]);
              setTimeout(() => {
                logDeps("After Clear Items");
                refreshDepsDisplay();
              }, 100);
            },
          },
          ["Clear Items"],
        ),
        Button(
          {
            onClick() {
              theme_.set("color", theme_.value.color === "red" ? "blue" : "red");
              setTimeout(() => {
                logDeps(`After Toggle Theme (color=${theme_.value.color})`);
                refreshDepsDisplay();
              }, 100);
            },
          },
          ["Toggle Theme"],
        ),
        Button(
          {
            onClick() {
              checkLeak("Manual Check");
              refreshDepsDisplay();
            },
          },
          ["Check Leak"],
        ),
      ]),

      // ========== 测试1: ref + Show ==========
      // Show subscribe visible_，隐藏后该 subscribe 应清除
      View(
        { style: { "margin-bottom": "12px", "border-bottom": "1px solid rgba(255,255,255,0.2)", "padding-bottom": "12px" } },
        [
          View({ style: { "font-weight": "bold", "margin-bottom": "4px" } }, [
            "Test 1: ref + Show (visible_)",
          ]),
          View({ style: { "font-size": "12px", color: "gray" } }, [
            "Show subscribe visible_。隐藏后 visible_ 的 deps 应减少",
          ]),
          Show({
            when: visible_,
            onMounted() {
              console.log("[Test1 Show] onMounted");
            },
            onUnmounted() {
              console.log("[Test1 Show] onUnmounted");
            },
            ok() {
              return View(
                {
                  style: { padding: "8px", "background-color": "rgba(0,255,0,0.2)" },
                },
                ["Show is visible!"],
              );
            },
          }),
        ],
      ),

      // ========== 测试2: ref + computed style (始终存在) ==========
      // computed(count_, fn) 会 subscribe count_
      // View 的 style 绑定会 subscribe computed 的返回值
      // 反复 increment 时这些 deps 数量不应增长
      View(
        { style: { "margin-bottom": "12px", "border-bottom": "1px solid rgba(255,255,255,0.2)", "padding-bottom": "12px" } },
        [
          View({ style: { "font-weight": "bold", "margin-bottom": "4px" } }, [
            "Test 2: ref + computed style (count_) - always mounted",
          ]),
          View({ style: { "font-size": "12px", color: "gray" } }, [
            "computed(count_) subscribe count_，反复 increment 时 deps 不应增长",
          ]),
          View(
            {
              style: trackedComputed(count_, (c) => ({
                padding: "8px",
                "background-color": c % 2 === 0 ? "rgba(0,0,255,0.2)" : "rgba(255,0,255,0.2)",
              }), "test2:style(count_)"),
            },
            ["Count: ", count_],
          ),
        ],
      ),

      // ========== 测试3: refobj + computed 在 Show 内 ==========
      // Show 内创建 computed(theme_, fn)，subscribe theme_
      // 隐藏后 computed.destroy() 应 unsubscribe theme_
      // computed 自身的 deps（Text 绑定）也应被清除
      View(
        { style: { "margin-bottom": "12px", "border-bottom": "1px solid rgba(255,255,255,0.2)", "padding-bottom": "12px" } },
        [
          View({ style: { "font-weight": "bold", "margin-bottom": "4px" } }, [
            "Test 3: refobj + computed inside Show (theme_)",
          ]),
          View({ style: { "font-size": "12px", color: "gray" } }, [
            "Show 隐藏后，computed(theme_) 应 destroy，theme_ deps 减少，computed 自身 deps 清零",
          ]),
          Show({
            when: visible_,
            ok() {
              // 这里的 trackedComputed 会在每次 Show ok() 被调用时创建新的 computed
              const styleComputed = trackedComputed(theme_, (t) => ({
                padding: "8px",
                color: t.color,
                "font-size": t.size + "px",
                "background-color": "rgba(255,255,0,0.2)",
              }), "test3:style(theme_)");

              const colorComputed = trackedComputed(theme_, (t) => t.color, "test3:color(theme_)");
              const sizeComputed = trackedComputed(theme_, (t) => String(t.size), "test3:size(theme_)");

              return View(
                {
                  style: styleComputed,
                  onMounted() {
                    console.log("[Test3] onMounted, theme_ deps:", getDeps(theme_).length);
                  },
                  onUnmounted() {
                    console.log("[Test3] onUnmounted, theme_ deps:", getDeps(theme_).length);
                  },
                },
                [
                  "Theme color: ", colorComputed,
                  " | size: ", sizeComputed,
                ],
              );
            },
          }),
        ],
      ),

      // ========== 测试4: refarr + For + computed(item) ==========
      // For subscribe items_ (onChange/onPatch)
      // For 内部为每个 item 创建 idx = computed(items_, fn)，subscribe items_
      // render 中 computed(item, fn) 在 registry 创建 refObject(item) 并 subscribe
      // 删除 item 时:
      //   - For.remove() 应调用 idx.destroy() → unsubscribe items_
      //   - computed(item) 应被 destroy → unsubscribe refObject(item)
      View(
        { style: { "margin-bottom": "12px", "border-bottom": "1px solid rgba(255,255,255,0.2)", "padding-bottom": "12px" } },
        [
          View({ style: { "font-weight": "bold", "margin-bottom": "4px" } }, [
            "Test 4: refarr + For + computed(item) (items_)",
          ]),
          View({ style: { "font-size": "12px", color: "gray" } }, [
            "For subscribe items_; idx = computed(items_); computed(item, t=>t.text) subscribe refObject(item)",
          ]),
          View({ style: { "font-size": "12px", color: "gray" } }, [
            "删除 item 后: idx.destroy() 应 unsub items_; computed(item).destroy() 应 unsub refObject(item)",
          ]),
          For({
            key: "id",
            each: items_,
            render(item, idx) {
              // computed(item, fn) 会:
              // 1. 在 registry 查找或创建 refObject(item)
              // 2. subscribe refObject(item)
              // 3. 返回 DerivedRef，被 Text 消费时 Text 会 subscribe 这个 DerivedRef
              const textComputed = trackedComputed(
                item,
                (t) => t.text,
                `test4:text(item#${item.id})`,
              );

              return View(
                {
                  style: {
                    padding: "4px 8px",
                    "background-color": "rgba(255,255,255,0.1)",
                    "margin-bottom": "2px",
                    display: "flex",
                    gap: "8px",
                  },
                },
                [
                  // idx 是 For 内部创建的 computed(items_, fn)
                  // 它 subscribe items_，删除时应 idx.destroy()
                  idx,
                  " - ",
                  // textComputed subscribe refObject(item)
                  textComputed,
                  View(
                    {
                      style: { cursor: "pointer", color: "red" },
                      onClick() {
                        console.log(`\n--- Before Remove item#${item.id} ---`);
                        console.log(`items_ deps: ${getDeps(items_).length}`);
                        console.log(`textComputed deps: ${getDeps(textComputed).length}`);

                        items_.remove(item);

                        setTimeout(() => {
                          console.log(`--- After Remove item#${item.id} ---`);
                          console.log(`items_ deps: ${getDeps(items_).length}`);
                          console.log(`textComputed deps: ${getDeps(textComputed).length}`);
                          logDeps(`After Remove item#${item.id}`);
                          refreshDepsDisplay();
                        }, 100);
                      },
                    },
                    ["[x]"],
                  ),
                ],
              );
            },
            onMounted() {
              console.log("[Test4 For] onMounted");
              logDeps("Test4 For Mounted");
            },
          }),
        ],
      ),

      // ========== 测试5: refarr + For + computed(item) 在 Show 内 ==========
      // 和测试4一样的 dep 链路，但包在 Show 内
      // Show 隐藏后: For 对 items_ 的 subscribe、所有 idx computed、所有 computed(item) 都应清除
      View(
        { style: { "margin-bottom": "12px" } },
        [
          View({ style: { "font-weight": "bold", "margin-bottom": "4px" } }, [
            "Test 5: refarr + For + computed(item) inside Show",
          ]),
          View({ style: { "font-size": "12px", color: "gray" } }, [
            "Show 隐藏后: For.subscribe(items_) + 所有 idx + 所有 computed(item) 都应被清除",
          ]),
          Show({
            when: visible_,
            ok() {
              return Column({ gap: 2 }, [
                For({
                  key: "id",
                  each: items_,
                  render(item, idx) {
                    // 追踪这个 computed，Show 隐藏后它应该没有 deps
                    const textComputed = trackedComputed(
                      item,
                      (t) => t.text,
                      `test5:text(item#${item.id})`,
                    );
                    return View(
                      {
                        style: {
                          padding: "4px 8px",
                          "background-color": "rgba(0,255,255,0.2)",
                        },
                        onMounted() {
                          console.log(`[Test5 item#${item.id}] onMounted`);
                        },
                        onUnmounted() {
                          console.log(`[Test5 item#${item.id}] onUnmounted`);
                        },
                      },
                      ["(in Show) ", idx, " - ", textComputed],
                    );
                  },
                  onMounted() {
                    console.log("[Test5 For] onMounted");
                    logDeps("Test5 For in Show Mounted");
                  },
                  onUnmounted() {
                    console.log("[Test5 For] onUnmounted");
                    setTimeout(() => {
                      logDeps("Test5 For in Show Unmounted (after tick)");
                      checkLeak("Test5 After Show Hidden");
                      refreshDepsDisplay();
                    }, 100);
                  },
                }),
              ]);
            },
          }),
        ],
      ),
    ],
  );
}

const elm = ApplicationView({});
console.log(elm);
render(elm, document.getElementById("root"), {
  onVNodeTreeCreated(data) {
    console.log(data);
  },
});
