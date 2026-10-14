# Disclosure

`Disclosure` uses `View` and `Button` to show and hide a section without selecting a host tag. It keeps the body mounted, so inputs and local state survive collapse. The trigger supports the host button's keyboard activation and exposes `aria-expanded` / `aria-controls`.

```ts
import { Disclosure, View, ref } from "@timeless/timeless";

const open = ref(false);
const details = Disclosure({
  summary: ["Show details"],
  open,
  triggerProps: { class: "details-trigger" },
  contentProps: { attributes: { id: "details-body" } },
  onToggle(value) { console.log(value); },
}, [View({}, ["Details content"])]);
```

`open` defaults to `false`. Pass a boolean for the initial state or a writable `Ref<boolean>` for shared control. `onToggle` runs after trigger activation; external ref changes only update the displayed state. Calling `preventDefault()` in `triggerProps.onClick` cancels a toggle. The trigger is always a button with `type="button"`, including inside a form. A disabled trigger uses `triggerProps.disabled`. Style the trigger and body through their props; an unstyled visibility wrapper surrounds the body so flex/grid classes cannot override collapse. no theme is required for the state behavior.
