/**
 * @file 导航类区块。
 *
 * 每个导出函数 = 左侧菜单的一个条目：函数名里的 Section 标题就是
 * components/index.js 里 sectionId() 的输入，也是 pages/home/categories.js
 * 里 anchor 的来源 —— 三处同名，不手写字面量。
 *
 * store 一律建在函数内部：分类页被 keep-alive 保活，模块级 store 会在多次
 * 往返访问之间串状态。
 */
import { Section, Item } from "@/components/index.js";
export function TabsSection() {
  return Section("Tabs", [
    Item("Default", [
      Tabs({
        store: new Timeless.vm.TabHeaderCore({
          key: "value",
          selected: "tab2",
          options: [
            {
              label: "Account",
              value: "tab1",
              // content: Txt("Account settings content."),
            },
            {
              label: "Password",
              value: "tab2",
              // content: Txt("Password settings content."),
            },
            {
              label: "Notifications",
              value: "tab3",
              // content: Txt("Notification preferences."),
            },
          ],
        }),
      }),
    ]),
  ]);
}

export function AccordionSection() {
  return Section("Accordion", [
    Item("Default", [
      Accordion({
        store: Timeless.vm.AccordionCore({ type: "single" }),
        items: [
          {
            title: "Is it accessible?",
            content: ["Yes. It adheres to the WAI-ARIA design pattern."],
          },
          {
            title: "Is it styled?",
            content: [
              "Yes. It comes with default styles that match the other components.",
            ],
          },
          {
            title: "Is it animated?",
            content: ["Yes. It uses CSS transitions for smooth open/close."],
          },
        ],
      }),
    ]),
  ]);
}
