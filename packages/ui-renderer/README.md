# @timeless/ui-renderer

Compose plugin interfaces from Timeless components. The package owns a typed slot
registry, component lifetimes, external observable bindings, and application
mounting. The portable entry has no DOM dependency; `@timeless/ui-renderer-dom` adapts the existing
Timeless DOM host. Business state stays in models and services.

```ts
import { View, Text } from "@timeless/timeless";
import { createDOMRenderer } from "@timeless/ui-renderer-dom";
import type { SlotDefinition } from "@timeless/ui-renderer";
import { counterModel } from "./counter.model";

declare module "@timeless/ui-renderer" {
  interface SlotMap {
    "app.actions": SlotDefinition<"list", { title: string }>;
  }
}

const renderer = createDOMRenderer();
const removeLayout = renderer.slots.register(
  {
    name: "root",
    children: { "app.actions": "list" },
  },
  ({ renderSlot }) =>
    View({ attributes: { n: "app-layout" } }, [
      renderSlot("app.actions", { title: "Actions" }),
    ]),
);

// An injector survives the layout being removed and subsequently reinstalled.
// Return the registration disposer so each declaration lifetime cleans up.
const removePlugin = renderer.slots.inject("app.actions", () =>
  renderer.slots.register(
    { name: "app.actions", id: "counter", order: 10 },
    ({ observe, owner }) =>
      View({ attributes: { n: "counter-action" } }, [
        Text(owner.title),
        Text(observe(counterModel, (snapshot) => snapshot.count)),
      ]),
  ),
);

const container = document.getElementById("app");
if (!container) throw new Error("Missing application container");
const unmount = renderer.mount(container);
// unmount() releases this tree's subscriptions but retains plugin registrations.
// removePlugin() and removeLayout() unload the corresponding contributions.
// renderer.dispose() unmounts every tree and disposes the registry.
```

`counterModel` above implements `Observable<{ count: number }>`:
`getSnapshot()` returns its current snapshot and `subscribe(listener)` returns
an unsubscribe function. `observe(source, selector)` returns a read-only Timeless
ref, skips unchanged selections using `Object.is`, checks the snapshot again
after subscribing, and automatically unsubscribes when its component is removed.
The model owns actions; pass callbacks into components through owner props or
close over the model in the registered factory.

| Slot kind | Registration                    | Selection                                |
| --------- | ------------------------------- | ---------------------------------------- |
| `single`  | optional `priority`             | lowest priority, then first registration |
| `list`    | required `id`, optional `order` | one winner per id, ordered by order      |
| `keyed`   | required `key`                  | `renderSlot(name, owner, { entryKey })`  |
| `chain`   | required `select(owner)`        | first non-null match in priority order   |

Lower numeric priorities win. Reusing a list id or keyed key shadows a previous
entry; removing the winner restores the previous entry. Use a new id/key to add
an independent contribution. `entryKey` can also be an `Observable<string>`.
Only a component that declared a child slot can render that child through its
provided `renderSlot` callback. Declarations collapse recursively on removal.
`slots.declare(name, kind)` is available for independently owned extension points;
its returned disposer has the same declaration lifecycle.

Component props contain `owner`, `matched`, `renderSlot`, `observe`, and
`onCleanup`. They do not receive the registry or a plugin context. Every rendered
occurrence automatically releases its `observe` bindings; use `onCleanup` for
additional subscriptions or resources created by a factory. Every rendered
occurrence gets its own subscriptions and Timeless owner. Unchanged registrations
keep their existing VNodes when other entries change. Owner props describe one
render occurrence; put changing values in refs or observables. Teardown is
permanent for the removed occurrence, and disposers are idempotent. Failed
component construction releases its observer subscriptions. Teardown errors are
aggregated after other component and mount cleanup has been attempted.

For another host, call `createUiRenderer({ mount(element, container) { ... } })`.
The adapter attaches a Timeless tree and returns a detach callback; the renderer
owns its mount and destruction lifecycle. Each container accepts one mount per
renderer, and one renderer supports multiple independent containers.

The DOM adapter inserts a dedicated tree without replacing existing container
content. Structural wrappers use `display: contents` and semantic `n` attributes.
Load UMD builds in this order: Timeless, Timeless.DOM, Timeless.UiRenderer,
Timeless.UiRendererDOM. ESM users import the portable package or its DOM adapter.

This is Timeless's UI composition API. It does not implement React APIs or the
DeepSeek Harness Cordis module loader, generated remote services, or its
application-specific session props. A plugin loader can own the registration
disposers without changing this renderer.

Validation: `pnpm --filter @timeless/ui-renderer test` and
`pnpm --filter @timeless/ui-renderer typecheck`.
