import { ref, vm } from "@timeless/timeless";

export function ButtonPageModel() {
  const count = ref(0);
  const increment = () => count.as(count.value + 1);
  return {
    count,
    buttons: [
      "default",
      "secondary",
      "outline",
      "ghost",
      "destructive",
      "link",
    ].map((variant) => ({
      variant,
      label: variant[0].toUpperCase() + variant.slice(1),
      store: new vm.ButtonCore({ variant, onClick: increment }),
    })),
    reset: new vm.ButtonCore({
      variant: "secondary",
      onClick: () => count.as(0),
    }),
    disabled: new vm.ButtonCore({ disabled: true, onClick: increment }),
  };
}
