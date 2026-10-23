import { computed, ref, vm } from "@timeless/timeless";

export function FloatingPageModel() {
  const modalOpen = ref(false);
  const popoverOpen = ref(false);
  const drawerOpen = ref(false);
  const hovered = ref(false);
  const focused = ref(false);
  const tooltipVisible = ref(false);
  const name = new vm.InputCore({ defaultValue: "Timeless" });
  const error = ref("");
  const result = ref("尚未保存。页面切换保留输入并关闭浮层。");
  const dropdown = new vm.DropdownMenuCore({
    trigger: "click",
    align: "start",
    items: [
      new vm.MenuItemCore({
        label: "编辑资料",
        onClick() {
          result.as("DropdownMenu：编辑资料");
          dropdown.hide();
        },
      }),
      new vm.MenuItemCore({
        label: "复制名称",
        onClick() {
          result.as(`DropdownMenu：${name.value}`);
          dropdown.hide();
        },
      }),
      new vm.MenuSeparatorCore(),
      new vm.MenuItemCore({ label: "删除（禁用）", disabled: true }),
    ],
  });
  const contextMenu = new vm.ContextMenuCore({
    align: "start",
    items: [
      new vm.MenuItemCore({
        label: "复制",
        onClick() {
          result.as("ContextMenu：复制");
          contextMenu.hide({ reason: "selection" });
        },
      }),
      new vm.MenuItemCore({
        label: "查看详情",
        onClick() {
          contextMenu.hide({ reason: "selection" });
          drawerOpen.as(true);
        },
      }),
      new vm.MenuSeparatorCore(),
      new vm.MenuItemCore({ label: "粘贴（禁用）", disabled: true }),
    ],
  });
  function closeTooltip() {
    tooltipVisible.as(false);
  }
  function setTooltipState(source, value) {
    (source === "hover" ? hovered : focused).as(value);
    tooltipVisible.as(hovered.value || focused.value);
  }
  return {
    modalOpen,
    popoverOpen,
    drawerOpen,
    dropdown,
    contextMenu,
    dropdownTrigger: new vm.ButtonCore({ variant: "outline" }),
    openDrawer: new vm.ButtonCore({
      variant: "outline",
      onClick: () => drawerOpen.as(true),
    }),
    closeDrawer: () => drawerOpen.as(false),
    drawerClose: new vm.ButtonCore({ onClick: () => drawerOpen.as(false) }),
    tooltipVisible,
    popoverExpanded: computed(popoverOpen, (open) => String(open)),
    name,
    error,
    result,
    openModal: new vm.ButtonCore({
      onClick() {
        error.as("");
        modalOpen.as(true);
      },
    }),
    cancelModal: new vm.ButtonCore({
      variant: "outline",
      onClick: () => modalOpen.as(false),
    }),
    saveModal: new vm.ButtonCore({
      onClick() {
        if (!name.value.trim()) {
          error.as("请输入显示名称。");
          return;
        }
        result.as(`已保存：${name.value.trim()}`);
        modalOpen.as(false);
      },
    }),
    togglePopover: new vm.ButtonCore({
      variant: "outline",
      onClick: () => popoverOpen.as(!popoverOpen.value),
    }),
    closePopover: new vm.ButtonCore({
      onClick: () => popoverOpen.as(false),
    }),
    tooltip: new vm.ButtonCore({ variant: "outline" }),
    closeModal: () => modalOpen.as(false),
    dismissPopover: () => popoverOpen.as(false),
    closeTooltip,
    setTooltipState,
    dismiss() {
      modalOpen.as(false);
      popoverOpen.as(false);
      drawerOpen.as(false);
      dropdown.hide();
      contextMenu.hide({ reason: "route change" });
      hovered.as(false);
      focused.as(false);
      closeTooltip();
    },
  };
}
