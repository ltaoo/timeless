import { ref, computed, vm, kit } from "@timeless/timeless";
import { ButtonPageModel } from "./pages/buttons-model.js";
import { FormPageModel } from "./pages/forms-model.js";
import { FloatingPageModel } from "./pages/floating-model.js";
import { ComponentsPageModel } from "./pages/components-model.js";
import { TransitionPageModel } from "./pages/transition-model.js";
import { TablePageModel } from "./pages/table-model.js";
import { ScrollPageModel } from "./pages/scroll-model.js";

const PAGES = [
  { key: "overview", title: "概览", path: "/home/overview", icon: "house" },
  { key: "general", title: "基础组件", path: "/home/general", icon: "bolt" },
  {
    key: "data_entry",
    title: "表单组件",
    path: "/home/data_entry",
    icon: "list",
  },
  {
    key: "floating",
    title: "浮层组件",
    path: "/home/floating",
    icon: "message-square-more",
  },
  {
    key: "navigation",
    title: "导航与折叠",
    path: "/home/navigation",
    icon: "list",
  },
  {
    key: "data_display",
    title: "展示与反馈",
    path: "/home/data_display",
    icon: "grid-3x3",
  },
  {
    key: "layout",
    title: "布局与容器",
    path: "/home/layout",
    icon: "grid-3x3",
  },
  { key: "table", title: "表格与分页", path: "/home/table", icon: "list" },
  { key: "scroll", title: "滚动与虚拟列表", path: "/home/scroll", icon: "list" },
  { key: "transition", title: "过渡动画", path: "/home/transition", icon: "activity" },
];

export function SimplePageModel({
  initialDark = false,
  onThemeChange = () => {},
} = {}) {
  const form = FormPageModel();
  const floating = FloatingPageModel();
  const components = ComponentsPageModel();
  const transition = TransitionPageModel();
  const { routes } = kit.buildRoutes(
    Object.fromEntries(
      PAGES.map((page) => [
        page.key,
        { title: page.title, pathname: page.path },
      ]),
    ),
  );
  const root = new kit.RouteViewCore({
    name: "root",
    pathname: "/",
    title: "Timeless",
    visible: true,
  });
  root.isRoot = true;
  const history = new kit.HistoryCore({
    view: root,
    router: new kit.NavigatorCore(),
    routes,
    views: { root },
    virtual: true,
  });
  const navigation = ref(history.state);
  const path = computed(navigation, (state) => state.href);
  const dark = ref(initialDark);
  onThemeChange(dark.value);
  let viewport;
  const backDisabled = computed(navigation, (state) => state.cursor <= 0);
  const forwardDisabled = computed(
    navigation,
    (state) => state.cursor >= state.stacks.length - 1,
  );
  const back = new vm.ButtonCore({
    variant: "outline",
    size: "icon",
    onClick: () => history.back(),
  });
  const forward = new vm.ButtonCore({
    variant: "outline",
    size: "icon",
    onClick: () => history.forward(),
  });
  const stopHistory = history.onStateChange((state) => {
    form.dismiss();
    floating.dismiss();
    transition.dismiss();
    navigation.as(state);
    if (backDisabled.value) back.disable();
    else back.enable();
    if (forwardDisabled.value) forward.disable();
    else forward.enable();
    if (viewport) viewport.scrollTop = 0;
  });
  function navigate(target) {
    const page = PAGES.find((item) => item.path === target);
    if (!page || target === path.value) return;
    history.push(`root.${page.key}`);
  }
  navigate("/home/general");
  return {
    path,
    outletClass: computed(path, (value) =>
      value === "/home/table" ? "flex h-full min-h-0 flex-col p-6" : "p-6",
    ),
    title: computed(
      path,
      (value) => PAGES.find((page) => page.path === value)?.title,
    ),
    rootClass: computed(
      dark,
      (value) =>
        `${value ? "dark " : ""}flex h-full w-full flex-row tt-bg-background tt-text-foreground`,
    ),
    pages: PAGES.map((page) => ({
      ...page,
      current: computed(path, (value) =>
        value === page.path ? "page" : "false",
      ),
      navigationClass: computed(
        path,
        (value) =>
          `w-full justify-start! ${value === page.path ? "bg-[var(--background)]! tt-text-foreground" : ""}`,
      ),
      pageClass: computed(path, (value) =>
        value === page.path
          ? page.key === "table"
            ? "flex min-h-0 flex-1 flex-col"
            : "flex flex-col gap-6"
          : "hidden",
      ),
      store: new vm.ButtonCore({
        variant: "ghost",
        onClick: () => navigate(page.path),
      }),
    })),
    buttons: ButtonPageModel(),
    form,
    floating,
    components,
    table: TablePageModel(),
    scroll: ScrollPageModel(),
    transition,
    back,
    forward,
    backDisabled,
    forwardDisabled,
    themeIcon: computed(dark, (value) => value ? "sun" : "moon"),
    theme: new vm.ButtonCore({
      variant: "ghost",
      size: "icon",
      onClick: () => {
        dark.as(!dark.value);
        onThemeChange(dark.value);
      },
    }),
    navigate,
    attachViewport(target) {
      viewport = target;
    },
    destroy() {
      stopHistory();
      form.destroy();
      components.destroy();
      transition.destroy();
    },
  };
}
