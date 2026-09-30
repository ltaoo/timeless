/**
 * @file 数据展示 / 布局 / 导航 / 反馈 / 其他 用到的区块。
 *
 * 每个导出函数 = 左侧菜单的一个条目：函数名里的 Section 标题就是
 * components/index.js 里 sectionId() 的输入，也是 pages/home/categories.js
 * 里 anchor 的来源 —— 三处同名，不手写字面量。
 *
 * store 一律建在函数内部：分类页被 keep-alive 保活，模块级 store 会在多次
 * 往返访问之间串状态。
 */
import { Section, Item } from "@/components/index.js";
export function AffixSection() {
  return Section("Affix", [
    Item("Offset Top 20px", [
      View({ class: classNames(["h-[600px] space-y-4"]) }, [
        View({ class: classNames(["text-sm text-zinc-400"]) }, [
          "Scroll down to see the affix effect",
        ]),
        Affix(
          {
            store: new Timeless.vm.AffixCore({ top: 20 }),
            offsetTop: 20,
            class:
              "inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white shadow-md",
          },
          ["Affix — Fixed at 20px from top"],
        ),
        For({
          each: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
          render(i) {
            return View(
              {
                class:
                  "rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 text-sm",
              },
              [`Content item ${i} — Keep scrolling...`],
            );
          },
        }),
      ]),
    ]),
  ]);
}

export function ProgressSection() {
  const progressVal = ref(60);

  return Section("Progress", [
    Item("60%", [Progress({ value: progressVal, max: 100 })]),
    Item("Controls", [
      Button(
        {
          store: new Timeless.vm.ButtonCore({
            size: "sm",
            onClick() {
              progressVal.as(Math.max(0, progressVal.value - 10));
            },
          }),
        },
        ["-10"],
      ),
      Button(
        {
          store: new Timeless.vm.ButtonCore({
            size: "sm",
            onClick() {
              progressVal.as(Math.min(100, progressVal.value + 10));
            },
          }),
        },
        ["+10"],
      ),
    ]),
  ]);
}

export function StepsSection() {
  const stepIdx = ref(1);

  return Section("Steps", [
    Item("3 Steps", [
      Steps({
        store: new Timeless.vm.StepCore({
          value: stepIdx.value,
        }),
        items: [
          { title: "Account" },
          { title: "Profile" },
          { title: "Complete" },
        ],
      }),
    ]),
    Item("Controls", [
      Button(
        {
          store: new Timeless.vm.ButtonCore({
            size: "sm",
            onClick() {
              stepIdx.as(Math.max(0, stepIdx.value - 1));
            },
          }),
        },
        ["Prev"],
      ),
      Button(
        {
          store: new Timeless.vm.ButtonCore({
            size: "sm",
            onClick() {
              stepIdx.as(Math.min(3, stepIdx.value + 1));
            },
          }),
        },
        ["Next"],
      ),
    ]),
  ]);
}

export function SkeletonSection() {
  return Section("Skeleton", [
    Item("Default", [
      View({ class: classNames(["space-y-3 w-[250px]"]) }, [
        Skeleton({
          class: classNames(["h-[125px] w-full rounded-xl"]),
        }),
        View({ class: classNames(["space-y-2"]) }, [
          Skeleton({ class: classNames(["h-4 w-full"]) }),
          Skeleton({ class: classNames(["h-4 w-[200px]"]) }),
        ]),
      ]),
    ]),
  ]);
}

export function ScrollAreaSection() {
  return Section("ScrollArea", [
    Item("Default", [
      ScrollArea(
        {
          class: classNames([
            "h-[200px] w-[250px] rounded-md border border-zinc-200 p-4 dark:border-zinc-800",
          ]).toString(),
        },
        [
          View({ class: classNames(["space-y-4"]) }, [
            ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) =>
              View({ class: classNames(["text-sm"]) }, [
                `Item ${i} — Scrollable content area`,
              ]),
            ),
          ]),
        ],
      ),
    ]),
  ]);
}

export function AspectRatioSection() {
  return Section("AspectRatio", [
    Item("16:9", [
      View({ class: classNames(["w-[300px]"]) }, [
        AspectRatio({ ratio: 16 / 9 }, [
          View(
            {
              class: classNames([
                "flex items-center justify-center w-full h-full rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500",
              ]),
            },
            ["16 : 9"],
          ),
        ]),
      ]),
    ]),
  ]);
}

export function TableSection() {
  return Section("Table", [
    Item("Default", [
      Table({}, [
        TableHeader({}, [
          TableRow({}, [
            TableHead({}, ["Name"]),
            TableHead({}, ["Status"]),
            TableHead({}, ["Role"]),
          ]),
        ]),
        TableBody({}, [
          TableRow({}, [
            TableCell({}, ["Alice"]),
            TableCell({}, ["Active"]),
            TableCell({}, ["Admin"]),
          ]),
          TableRow({}, [
            TableCell({}, ["Bob"]),
            TableCell({}, ["Inactive"]),
            TableCell({}, ["User"]),
          ]),
          TableRow({}, [
            TableCell({}, ["Charlie"]),
            TableCell({}, ["Active"]),
            TableCell({}, ["Editor"]),
          ]),
        ]),
      ]),
    ]),
  ]);
}
