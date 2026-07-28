/**
 * 完整场景单测：断言所有渲染相关状态
 *
 * 场景：表单弹窗 → Select 下拉选择（键盘+鼠标） → 确认关闭
 *
 * 每一步断言全部组件 state——这些 state 在不同宿主平台（DOM/Native/Canvas）
 * 上直接驱动渲染。断言了 state 即断言了展示效果。
 */

import { describe, it, expect, vi } from "vitest";

import { ButtonCore } from "@/button";
import { DialogCore } from "@/dialog";
import { SelectCore } from "@/select";
import { SelectItemCore } from "@/select/item";
import { DismissableLayerCore } from "@/dismissable-layer";
import { PresenceCore } from "@/presence";

function item<T>(value: T, label: string, disabled = false) {
  const i = new SelectItemCore<T>({ value, label });
  i.disabled = disabled;
  return i;
}

// —— 辅助：快照所有渲染相关状态 ——

/** Dialog 渲染需要的全部状态 */
function snapDialog(d: DialogCore) {
  return {
    open: d.open,
    title: d.title,
    footer: d.footer,
    closeable: d.closeable,
    mask: d.mask,
    presence: { ...d.presence.state },
    okBtn: { ...d.okBtn.state },
    cancelBtn: { ...d.cancelBtn.state },
    state: { ...d.state },
  };
}

/** Select 渲染需要的全部状态 */
function snapSelect<T>(s: SelectCore<T>) {
  return {
    open: s.open,
    value: s.value,
    placeholder: s.placeholder,
    disabled: s.disabled,
    focused: s.focused,
    allowClear: s.allowClear,
    loading: s.loading,
    status: s.status,
    search: s.search,
    presence: { ...s.presence$.state },
    state: { ...s.state },
    options: s.options.map((o) => ({
      value: o.value,
      label: o.label,
      selected: o.selected,
      focused: o.focused,
      disabled: o.disabled,
    })),
    // 当前选中项
    selectedItem: s.selected_item$
      ? {
          value: s.selected_item$.value,
          label: s.selected_item$.label,
          selected: s.selected_item$.selected,
          focused: s.selected_item$.focused,
        }
      : null,
    // 当前聚焦项
    focusedItem: s.focused_item$
      ? {
          value: s.focused_item$.value,
          label: s.focused_item$.label,
          focused: s.focused_item$.focused,
        }
      : null,
  };
}

describe("完整场景：键盘+鼠标操作 → 每一步全状态断言", () => {
  // 共享组件
  const dialog = new DialogCore({ title: "选择城市" });
  const select = new SelectCore<string>({
    defaultValue: null,
    placeholder: "请选择",
    options: [
      item("bj", "北京"),
      item("sh", "上海"),
      item("sz", "深圳"),
      item("gz", "广州", true), // 禁用
    ],
  });
  const layer = new DismissableLayerCore();
  const openBtn = new ButtonCore();

  // 事件日志
  const events: string[] = [];
  const dialogVisibleLog: boolean[] = [];
  const selectChangeLog: (string | null)[] = [];
  let confirmed = false;
  let cancelled = false;

  // 连接各组件
  openBtn.onClick(() => dialog.show());
  dialog.onShow(() => events.push("dialog:Show"));
  dialog.onHidden(() => events.push("dialog:Hidden"));
  dialog.onVisibleChange((v) => dialogVisibleLog.push(v));
  dialog.onOk(() => { confirmed = true; });
  dialog.onCancel(() => { cancelled = true; });
  select.onChange((v) => selectChangeLog.push(v));
  layer.onDismiss(() => dialog.hide());

  it("步骤 0：初始状态——所有组件已创建，弹窗关闭，下拉未展开", () => {
    // —— Dialog 渲染状态 ——
    expect(snapDialog(dialog)).toMatchObject({
      open: false,
      title: "选择城市",
      footer: true,
      closeable: true,
      mask: true,
      presence: {
        mounted: false,
        enter: false,
        visible: false,
        exit: false,
        text: "unknown",
      },
      okBtn: {
        text: "Click it",
        loading: false,
        disabled: false,
        variant: "default",
        size: "default",
      },
      cancelBtn: {
        text: "Click it",
        loading: false,
        disabled: false,
        variant: "secondary",
        size: "default",
      },
    });
    // 弹窗 state 快照
    expect(dialog.state).toMatchObject({
      open: false,
      enter: false,
      visible: false,
      exit: false,
      viewported: false,
    });

    // —— Select 渲染状态 ——
    const snap0 = snapSelect(select);
    expect(snap0.open).toBe(false);
    expect(snap0.value).toBeNull();
    expect(snap0.selectedItem).toBeNull();
    expect(snap0.focusedItem).toBeNull();
    expect(snap0.placeholder).toBe("请选择");
    expect(snap0.disabled).toBe(false);
    expect(snap0.focused).toBe(false);
    expect(snap0.presence).toMatchObject({
      mounted: false, enter: false, visible: false, exit: false,
    });
    // 所有选项：none selected, none focused
    expect(snap0.options).toEqual([
      { value: "bj", label: "北京", selected: false, focused: false, disabled: false },
      { value: "sh", label: "上海", selected: false, focused: false, disabled: false },
      { value: "sz", label: "深圳", selected: false, focused: false, disabled: false },
      { value: "gz", label: "广州", selected: false, focused: false, disabled: true },
    ]);

    expect(confirmed).toBe(false);
    expect(cancelled).toBe(false);
  });

  it("步骤 1：点击按钮 → 弹窗进入动画中（open 异步，由 presence.onShow 在 120ms 后设置）", () => {
    openBtn.click();

    // —— 立即态：弹窗正在进入 ——
    // dialog.open 由 presence.onShow() 异步设置（120ms 后），同步仍是 false
    expect(dialog.open).toBe(false);
    expect(dialog.presence.state.mounted).toBe(true);
    expect(dialog.presence.state.enter).toBe(true);
    expect(dialog.presence.state.visible).toBe(true);
    expect(dialog.presence.state.exit).toBe(false);
    expect(dialog.presence.state.text).toBe("enter");

    // state 快照反映动画阶段：open 来自 dialog.open（异步），enter/visible 来自 presence（同步）
    expect(dialog.state.open).toBe(false);
    expect(dialog.state.enter).toBe(true);
    expect(dialog.state.visible).toBe(true);

    // Select 仍未操作
    expect(select.open).toBe(false);
    expect(select.value).toBeNull();

    // 事件：dialog:Show / VisibleChange 由 presence.onShow 异步触发（120ms 后），同步未触发
    expect(events).not.toContain("dialog:Show");
    expect(dialogVisibleLog).not.toContain(true);
  });

  it("步骤 2：等待动画完成 → 弹窗完全可见（open 变为 true，事件已触发）", async () => {
    await new Promise((r) => setTimeout(r, 200));

    // —— 完成态：弹窗已显示 ——
    // 120ms 后 presence.onShow → dialog.open = true, emit Show + VisibleChange
    expect(dialog.open).toBe(true);
    expect(dialog.presence.state).toMatchObject({
      mounted: true,
      enter: false,
      visible: true,
      exit: false,
      text: "visible",
    });
    expect(dialog.state.open).toBe(true);
    expect(dialog.state.enter).toBe(false);
    expect(dialog.state.visible).toBe(true);

    // 异步事件已触发
    expect(events).toContain("dialog:Show");
    expect(dialogVisibleLog).toContain(true);
  });

  it("步骤 3：模拟 click Select 触发器 → 下拉展开", () => {
    select.handleClickTrigger();

    // —— 下拉已展开 ——
    expect(select.open).toBe(true);
    expect(select.focused).toBe(true);
    expect(select.presence$.state.enter).toBe(true);
    expect(select.presence$.state.visible).toBe(true);

    // 弹窗仍可见
    expect(dialog.open).toBe(true);

    // 暂无选中项、暂无聚焦项（所有选项默认无聚焦）
    expect(select.value).toBeNull();
    expect(select.selected_item$).toBeNull();
    expect(select.focused_item$).toBeNull();

    // 选项状态：全部未选中、未聚焦
    const snap3 = snapSelect(select);
    expect(snap3.options).toMatchObject([
      { selected: false, focused: false },
      { selected: false, focused: false },
      { selected: false, focused: false },
      { selected: false, focused: false },
    ]);
  });

  it("步骤 4：键盘 ↓ → focusNextOption → 聚焦第 1 个（跳过禁用的 gz）", () => {
    select.focusNextOption();

    const snap4 = snapSelect(select);

    // 下拉仍展开
    expect(snap4.open).toBe(true);

    // 聚焦第一个非禁用选项 "北京"
    expect(snap4.focusedItem).toMatchObject({ value: "bj", label: "北京", focused: true });

    // 选项级别验证
    expect(snap4.options[0]).toMatchObject({ value: "bj", focused: true, selected: false });
    expect(snap4.options[1]).toMatchObject({ value: "sh", focused: false });
    expect(snap4.options[2]).toMatchObject({ value: "sz", focused: false });
    expect(snap4.options[3]).toMatchObject({ value: "gz", focused: false, disabled: true });

    // 值仍为 null
    expect(snap4.value).toBeNull();
    expect(snap4.selectedItem).toBeNull();
  });

  it("步骤 5：键盘 ↓ → focusNextOption → 聚焦第 2 个", () => {
    select.focusNextOption();

    const snap5 = snapSelect(select);

    expect(snap5.focusedItem).toMatchObject({ value: "sh", label: "上海", focused: true });

    // 前一个失去聚焦
    expect(snap5.options[0]).toMatchObject({ value: "bj", focused: false });
    expect(snap5.options[1]).toMatchObject({ value: "sh", focused: true });
  });

  it("步骤 6：键盘 ↓ → focusNextOption → 聚焦第 3 个", () => {
    select.focusNextOption();

    const snap6 = snapSelect(select);

    // 跳过禁用的 gz，命中 "深圳"
    expect(snap6.focusedItem).toMatchObject({ value: "sz", label: "深圳", focused: true });

    expect(snap6.options[1]).toMatchObject({ value: "sh", focused: false });
    expect(snap6.options[2]).toMatchObject({ value: "sz", focused: true });
    expect(snap6.options[3]).toMatchObject({ value: "gz", focused: false, disabled: true });
  });

  it("步骤 7：键盘 ↓ → 循环回到第 1 个（跳过禁用的 gz）", () => {
    select.focusNextOption();

    const snap7 = snapSelect(select);

    expect(snap7.focusedItem).toMatchObject({ value: "bj", label: "北京", focused: true });
    expect(snap7.options[2]).toMatchObject({ value: "sz", focused: false });
  });

  it("步骤 8：键盘 ↑ → focusPrevOption → 回到第 3 个", () => {
    select.focusPrevOption();

    const snap8 = snapSelect(select);

    expect(snap8.focusedItem).toMatchObject({ value: "sz", label: "深圳", focused: true });
    expect(snap8.options[0]).toMatchObject({ value: "bj", focused: false });
  });

  it("步骤 9：键盘 Enter → selectFocusedOption → 选中并关闭下拉", () => {
    select.selectFocusedOption();

    // —— 值已选中 ——
    expect(select.value).toBe("sz");
    expect(select.open).toBe(false);
    expect(select.selected_item$).not.toBeNull();
    expect(select.selected_item$!.value).toBe("sz");

    const snap9 = snapSelect(select);

    // 选中项状态
    expect(snap9.selectedItem).toMatchObject({
      value: "sz",
      label: "深圳",
      selected: true,
      focused: true,
    });

    // 下拉已关闭
    expect(snap9.open).toBe(false);

    // 选项级别：只有 "深圳" 是 selected
    expect(snap9.options[0]).toMatchObject({ value: "bj", selected: false });
    expect(snap9.options[2]).toMatchObject({ value: "sz", selected: true });

    // Change 事件
    expect(selectChangeLog).toEqual(["sz"]);

    // 弹窗仍然可见
    expect(dialog.open).toBe(true);
  });

  it("步骤 10：鼠标点击确认按钮 → OK 事件 → 弹窗关闭", async () => {
    dialog.ok();

    // ok() 不自动关闭弹窗
    expect(confirmed).toBe(true);
    expect(dialog.open).toBe(true);

    // 手动关闭
    dialog.hide();

    // —— 立即态：弹窗退出中 ——
    // hide() 同步设置 exit=true, enter=false，但 visible 保持 true（退场动画中）
    // dialog.open 保持 true（由 presence.onHidden 在 150ms 后设为 false）
    expect(dialog.presence.state.exit).toBe(true);
    expect(dialog.presence.state.enter).toBe(false);
    expect(dialog.presence.state.visible).toBe(true);
    expect(dialog.presence.state.text).toBe("exit");

    expect(dialog.state.exit).toBe(true);
    expect(dialog.open).toBe(true);

    // Select 值保留
    expect(select.value).toBe("sz");

    // 等待退场动画
    await new Promise((r) => setTimeout(r, 200));

    // —— 完成态：弹窗已卸载 ——
    // 150ms 后 presence.onHidden → visible=false, dialog.open=false, emit Hidden + VisibleChange
    // unmount() → mounted=false
    expect(dialog.presence.state).toMatchObject({
      mounted: false,
      enter: false,
      visible: false,
      exit: false,
      text: "unknown",
    });
    expect(dialog.open).toBe(false);

    // Hidden 事件已触发
    expect(events).toContain("dialog:Hidden");
    expect(dialogVisibleLog).toContain(false);
  });

  it("步骤 11：重新打开弹窗 → Select 保留上次值 → 鼠标点击选项切换", async () => {
    dialog.show();
    await new Promise((r) => setTimeout(r, 200));
    expect(dialog.open).toBe(true);

    // —— Select 保留上次的选中值 ——
    const snapPre = snapSelect(select);
    expect(snapPre.value).toBe("sz");
    expect(snapPre.selectedItem).toMatchObject({
      value: "sz", label: "深圳", selected: true,
    });

    // 打开下拉
    select.handleClickTrigger();
    expect(select.open).toBe(true);

    // 上次选中的选项仍是 selected
    expect(snapSelect(select).options[2]).toMatchObject({
      value: "sz", selected: true,
    });

    // 鼠标悬停聚焦 "北京"（模拟 hover）
    const optBj = select.options.find((o) => o.value === "bj")!;
    select.handleMouseEnterItem(optBj);
    expect(snapSelect(select).focusedItem).toMatchObject({
      value: "bj", label: "北京", focused: true,
    });

    // 鼠标点击 "北京"
    select.handleClickItem(optBj);

    // —— 值已切换 ——
    expect(select.value).toBe("bj");
    expect(select.open).toBe(false);
    expect(snapSelect(select).selectedItem).toMatchObject({
      value: "bj", label: "北京", selected: true,
    });

    // 旧选项被取消
    expect(snapSelect(select).options[2]).toMatchObject({
      value: "sz", selected: false,
    });

    // Change 事件记录
    expect(selectChangeLog).toEqual(["sz", "bj"]);

    // 关闭弹窗
    dialog.hide();
    await new Promise((r) => setTimeout(r, 200));
  });

  it("步骤 12：点击遮罩（DismissableLayer）→ 弹窗关闭", async () => {
    // 重新打开
    dialog.show();
    await new Promise((r) => setTimeout(r, 200));
    expect(dialog.open).toBe(true);

    // 模拟点击弹窗外 / 遮罩
    layer.dismiss();

    // dismiss → dialog.hide() 被调用
    await new Promise((r) => setTimeout(r, 200));
    expect(dialog.open).toBe(false);
    expect(dialog.presence.state.mounted).toBe(false);
  });

  it("步骤 13：取消按钮 → 弹窗关闭 + onCancel 触发", async () => {
    cancelled = false;
    dialog.show();
    await new Promise((r) => setTimeout(r, 200));

    // 点击取消按钮（cancelBtn 的 onClick 已连线到 dialog.hide()）
    dialog.cancelBtn.click();

    // 由于 cancelBtn.click → dialog.hide()
    // hide 完成后 presence.onHidden 触发 Cancel 事件
    await new Promise((r) => setTimeout(r, 200));

    expect(cancelled).toBe(true);
    expect(dialog.open).toBe(false);
  });

  it("步骤 14：完整事件序列验证", () => {
    // dialog:Show 至少触发 3 次（步骤1、11、12、13 open）
    const showCount = events.filter((e) => e === "dialog:Show").length;
    expect(showCount).toBeGreaterThanOrEqual(3);

    // dialog:Hidden 至少触发 3 次
    const hiddenCount = events.filter((e) => e === "dialog:Hidden").length;
    expect(hiddenCount).toBeGreaterThanOrEqual(3);

    // visibleChange 序列
    expect(dialogVisibleLog.length).toBeGreaterThanOrEqual(6);

    // select change 序列
    expect(selectChangeLog).toEqual(["sz", "bj"]);
  });
});
