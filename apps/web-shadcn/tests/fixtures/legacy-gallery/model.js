import { computed, ref } from "@timeless/timeless";

export const PAGES = [
  {
    key: "general",
    title: "基础组件",
    detail: "Button · Badge · Typography",
    path: "/home/general",
  },
  {
    key: "data_entry",
    title: "表单组件",
    detail: "Input · Select · Checkbox · Radio",
    path: "/home/data_entry",
  },
  {
    key: "interaction",
    title: "交互组件",
    detail: "Modal · Popover · Tooltip · Accordion · Tabs",
    path: "/home/interaction",
  },
  {
    key: "layout",
    title: "布局与容器",
    detail: "Flex · Grid · Card · ScrollView",
    path: "/home/layout",
  },
];

function BasicModel() {
  const count = ref(0);
  const loading = ref(false);
  return {
    count,
    loading,
    loadingLabel: computed(loading, (value) =>
      value ? "正在加载…" : "点击加载",
    ),
    increment() {
      count.as(count.value + 1);
    },
    load() {
      if (loading.value) return;
      loading.as(true);
      setTimeout(() => loading.as(false), 800);
    },
  };
}

function FormModel() {
  const name = ref("");
  const email = ref("");
  const bio = ref("");
  const quantity = ref(1);
  const role = ref([]);
  const agreed = ref(false);
  const plan = ref("personal");
  const result = ref("填写资料后提交，示例数据仅保留在本次运行中。");
  return {
    name,
    email,
    bio,
    quantity,
    role,
    agreed,
    result,
    roles: [
      { value: "developer", label: "开发者" },
      { value: "designer", label: "设计师" },
      { value: "other", label: "其他" },
    ],
    personal: computed(plan, (value) => value === "personal"),
    team: computed(plan, (value) => value === "team"),
    setName(value) {
      name.as(value);
    },
    setEmail(value) {
      email.as(value);
    },
    setBio(value) {
      bio.as(value);
    },
    setQuantity(value) {
      const parsed = Number(value);
      quantity.as(
        Number.isFinite(parsed)
          ? Math.max(1, Math.min(99, Math.trunc(parsed)))
          : 1,
      );
    },
    setRole(value) {
      role.as(value ? [value] : []);
    },
    setAgreed(value) {
      agreed.as(value);
    },
    setPlan(value) {
      plan.as(value);
    },
    submit() {
      if (!name.value.trim()) {
        result.as("请输入姓名。");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        result.as("请输入有效的邮箱地址。");
        return;
      }
      if (!role.value.length) {
        result.as("请选择角色。");
        return;
      }
      if (!agreed.value) {
        result.as("请先同意示例条款。");
        return;
      }
      const label = this.roles.find(
        (item) => item.value === role.value[0],
      )?.label;
      result.as(
        `已提交：${name.value.trim()} · ${label} · ${plan.value === "team" ? "团队" : "个人"} · ${quantity.value} 个席位`,
      );
    },
    reset() {
      name.as("");
      email.as("");
      bio.as("");
      quantity.as(1);
      role.as([]);
      agreed.as(false);
      plan.as("personal");
      result.as("表单已重置。");
    },
  };
}

function InteractionModel(floatingSupported) {
  const modalOpen = ref(false);
  const popoverOpen = ref(false);
  const tooltip = ref({ hover: false, focus: false });
  const modalName = ref("Timeless");
  const popoverMessage = ref("有新消息时通知我");
  const expanded = ref(false);
  const tab = ref("preview");
  const alert = ref(true);
  const toast = ref(false);
  const confirming = ref(false);
  const result = ref("尚未执行操作。");
  return {
    floatingSupported,
    modalOpen,
    popoverOpen,
    modalName,
    popoverMessage,
    tooltipVisible: computed(tooltip, (state) => state.hover || state.focus),
    openModal() {
      this.dismissOverlays();
      modalOpen.as(true);
    },
    closeModal() {
      modalOpen.as(false);
    },
    setModalName(value) {
      modalName.as(value);
    },
    saveModal() {
      if (!modalName.value.trim()) {
        result.as("Modal：请输入显示名称。");
        return;
      }
      result.as(`Modal 已保存：${modalName.value.trim()}`);
      modalOpen.as(false);
    },
    togglePopover() {
      const next = !popoverOpen.value;
      this.dismissOverlays();
      popoverOpen.as(next);
    },
    closePopover() {
      popoverOpen.as(false);
    },
    setPopoverMessage(value) {
      popoverMessage.as(value);
    },
    savePopover() {
      result.as(`Popover 已保存：${popoverMessage.value}`);
      popoverOpen.as(false);
    },
    setTooltipState(source, active) {
      if (modalOpen.value || popoverOpen.value) return;
      tooltip.as({ ...tooltip.value, [source]: active });
    },
    closeTooltip() {
      tooltip.as({ hover: false, focus: false });
    },
    dismissOverlays() {
      modalOpen.as(false);
      popoverOpen.as(false);
      this.closeTooltip();
    },
    accordionClass: computed(expanded, (value) => (value ? "stack" : "hidden")),
    accordionLabel: computed(expanded, (value) =>
      value ? "收起：可以保留页面状态吗？ −" : "展开：可以保留页面状态吗？ +",
    ),
    previewClass: computed(tab, (value) =>
      value === "preview" ? "panel" : "hidden",
    ),
    detailsClass: computed(tab, (value) =>
      value === "details" ? "panel" : "hidden",
    ),
    previewButton: computed(tab, (value) =>
      value === "preview" ? "button" : "button ghost",
    ),
    detailsButton: computed(tab, (value) =>
      value === "details" ? "button" : "button ghost",
    ),
    alertClass: computed(alert, (value) => (value ? "notice" : "hidden")),
    toastClass: computed(toast, (value) => (value ? "toast" : "hidden")),
    confirmClass: computed(confirming, (value) =>
      value ? "notice" : "hidden",
    ),
    result,
    toggleAccordion() {
      expanded.as(!expanded.value);
    },
    selectTab(value) {
      tab.as(value);
    },
    dismissAlert() {
      alert.as(false);
    },
    restoreAlert() {
      alert.as(true);
    },
    showToast() {
      toast.as(true);
    },
    closeToast() {
      toast.as(false);
    },
    askConfirm() {
      confirming.as(true);
    },
    cancelConfirm() {
      confirming.as(false);
      result.as("已取消操作。");
    },
    confirm() {
      confirming.as(false);
      result.as("操作已确认。");
    },
  };
}

export function MacOSApplicationModel() {
  // Native navigation owns its history without browser globals.
  const navigation = ref({ paths: [PAGES[0].path], index: 0 });
  let viewport;
  function resetScroll() {
    if (viewport) viewport.scrollTop = 0;
  }
  const path = computed(navigation, ({ paths, index }) => paths[index]);
  const current = computed(path, (value) =>
    PAGES.find((page) => page.path === value),
  );
  const floatingSupported = __TIMELESS_PLATFORM__.startsWith("macOS");
  const interaction = InteractionModel(floatingSupported);
  return {
    platform: __TIMELESS_PLATFORM__,
    path,
    attachViewport(target) {
      viewport = target;
    },
    title: computed(current, (page) => page.title),
    description: computed(current, (page) =>
      page.key === "interaction" && !floatingSupported
        ? "Accordion · Tabs · Alert · Toast"
        : page.detail,
    ),
    backDisabled: computed(navigation, ({ index }) => index === 0),
    forwardDisabled: computed(
      navigation,
      ({ paths, index }) => index === paths.length - 1,
    ),
    pages: PAGES.map((page) => ({
      ...page,
      navigationClass: computed(path, (value) =>
        value === page.path ? "nav-item selected" : "nav-item",
      ),
      pageClass: computed(path, (value) =>
        value === page.path ? "page-content" : "hidden",
      ),
    })),
    basic: BasicModel(),
    form: FormModel(),
    interaction,
    navigate(target) {
      if (!PAGES.some((page) => page.path === target) || path.value === target)
        return;
      const paths = navigation.value.paths.slice(0, navigation.value.index + 1);
      interaction.dismissOverlays();
      paths.push(target);
      navigation.as({ paths, index: paths.length - 1 });
      resetScroll();
    },
    back() {
      const { paths, index } = navigation.value;
      if (index > 0) {
        interaction.dismissOverlays();
        navigation.as({ paths, index: index - 1 });
        resetScroll();
      }
    },
    forward() {
      const { paths, index } = navigation.value;
      if (index < paths.length - 1) {
        interaction.dismissOverlays();
        navigation.as({ paths, index: index + 1 });
        resetScroll();
      }
    },
  };
}
