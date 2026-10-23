import { computed, ref, vm } from "@timeless/timeless";

export function ComponentsPageModel() {
  const tabs = new vm.TabHeaderCore({
    key: "value",
    selected: "account",
    options: [
      { value: "account", label: "账户", description: "账户设置内容。" },
      { value: "password", label: "密码", description: "密码设置内容。" },
      { value: "notifications", label: "通知", description: "通知偏好设置。" },
    ],
  });
  const accordion = vm.AccordionCore({ defaultOpenItems: [0] });
  const multiple = vm.AccordionCore({ type: "multiple" });
  const steps = new vm.StepCore({ value: 0 });
  const step = ref(0);
  const progress = ref(60);
  const progressStore = new vm.ProgressCore({ value: 30 });
  const storeValue = ref(30);
  const stop = [
    steps.onChange((value) => step.as(value)),
    progressStore.onValueChange((value) => storeValue.as(value)),
  ];
  function advanceProgress(delta) {
    progress.as(Math.max(0, Math.min(100, progress.value + delta)));
    progressStore.setValue(
      Math.max(0, Math.min(100, storeValue.value + delta)),
    );
  }
  return {
    tabs,
    accordion,
    multiple,
    steps,
    stepText: computed(step, (value) => `步骤 ${value + 1} / 3`),
    previous: new vm.ButtonCore({
      variant: "outline",
      onClick: () => steps.change(Math.max(0, steps.value - 1)),
    }),
    next: new vm.ButtonCore({
      onClick: () => steps.change(Math.min(2, steps.value + 1)),
    }),
    progress,
    progressStore,
    progressText: computed(progress, (value) => `Ref：${value}%`),
    storeText: computed(storeValue, (value) => `Store：${value}%`),
    decrease: new vm.ButtonCore({
      variant: "outline",
      onClick: () => advanceProgress(-10),
    }),
    increase: new vm.ButtonCore({ onClick: () => advanceProgress(10) }),
    destroy() {
      stop.forEach((unsubscribe) => unsubscribe());
    },
  };
}
