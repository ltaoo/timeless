import { ref, computed, vm, kit } from "@timeless/timeless";
import { ButtonPageModel } from "./pages/buttons-model.js";
import { FormPageModel } from "./pages/forms-model.js";

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
    key: "layout",
    title: "布局与容器",
    path: "/home/layout",
    icon: "grid-3x3",
  },
];

export function SimplePageModel() {
  const form = FormPageModel();
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
  const dark = ref(false);
  let viewport;
  const backDisabled = computed(navigation, (state) => state.cursor <= 0);
  const forwardDisabled = computed(
    navigation,
    (state) => state.cursor >= state.stacks.length - 1,
  );
  const back = new vm.ButtonCore({
    variant: "ghost",
    onClick: () => history.back(),
  });
  const forward = new vm.ButtonCore({
    variant: "ghost",
    onClick: () => history.forward(),
  });
  const stopHistory = history.onStateChange((state) => {
    form.dismiss();
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
        value === page.path ? "flex flex-col gap-6" : "hidden",
      ),
      store: new vm.ButtonCore({
        variant: "ghost",
        onClick: () => navigate(page.path),
      }),
    })),
    buttons: ButtonPageModel(),
    form,
    back,
    forward,
    backDisabled,
    forwardDisabled,
    theme: new vm.ButtonCore({
      variant: "outline",
      onClick: () => dark.as(!dark.value),
    }),
    navigate,
    attachViewport(target) {
      viewport = target;
    },
    destroy() {
      stopHistory();
      form.destroy();
    },
  };
}
