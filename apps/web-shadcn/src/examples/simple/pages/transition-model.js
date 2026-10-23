import { computed, ref, vm } from "@timeless/timeless";

export function TransitionPageModel() {
  const effects = [
    {
      key: "fade",
      title: "Fade / 淡入淡出",
      enter: "tt-fade-in",
      exit: "tt-fade-out",
    },
    {
      key: "bottom",
      title: "Slide / 从底部滑入",
      enter: "tt-fade-in tt-slide-in-from-bottom",
      exit: "tt-fade-out tt-slide-out-to-bottom",
    },
    {
      key: "zoom",
      title: "Zoom / 缩放与淡入",
      enter: "tt-fade-in tt-zoom-in-95",
      exit: "tt-fade-out tt-zoom-out-95",
    },
    {
      key: "right",
      title: "Slide / 从右侧滑入",
      enter: "tt-fade-in tt-slide-in-from-right",
      exit: "tt-fade-out tt-slide-out-to-right",
    },
  ].map((effect) => {
    const presence = new vm.PresenceCore();
    return {
      ...effect,
      presence,
      show: new vm.ButtonCore({
        variant: "outline",
        onClick: () => presence.show(),
      }),
      hide: new vm.ButtonCore({
        variant: "outline",
        onClick: () => presence.hide(),
      }),
    };
  });
  const base =
    "rounded-lg tt-bg-primary p-4 text-sm tt-text-primary-foreground";
  const stickyClass = ref(base);
  const stickyState = ref("visible");
  const hideSticky = new vm.ButtonCore({
    variant: "outline",
    onClick() {
      stickyState.as("exiting");
      stickyClass.as(base + " tt-animate-out tt-fade-out tt-duration-300");
    },
  });
  function restore() {
    stickyClass.as(base);
    stickyState.as("visible");
    hideSticky.enable();
  }
  return {
    effects,
    stickyClass,
    stickyStatus: computed(
      stickyState,
      (value) =>
        ({
          visible: "显示中",
          exiting: "正在消失…",
          hidden: "动画结束，保持隐藏；布局位置保留。",
        })[value],
    ),
    hideSticky,
    restoreSticky: new vm.ButtonCore({ onClick: restore }),
    stickyEnded() {
      stickyState.as("hidden");
      hideSticky.disable();
    },
    dismiss() {
      effects.forEach(({ presence }) => presence.reset());
      restore();
    },
    destroy() {
      effects.forEach(({ presence }) => {
        presence.reset();
        presence.destroy();
      });
    },
  };
}
