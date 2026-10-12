import {
  View,
  ref,
  release,
  destroyElement,
  type TimelessElement,
  type DerivedRef,
} from "@timeless/timeless";
import { createBasicCatalog, LEGACY_CATALOG_ID } from "./catalog";
import { outlet, owned } from "./view";
import { A2UIModel, SurfaceModel } from "./model";
import { pointer, readData } from "./data-model";
import { ProtocolError } from "./validation";
import type {
  A2UIOptions,
  ChildList,
  ComponentContext,
  ComponentDefinition,
  JsonValue,
} from "./types";

interface Occurrence {
  id: string;
  scope: string;
  definition: ComponentDefinition;
}
export class A2UIRenderer {
  readonly model: A2UIModel;
  readonly element: TimelessElement;
  private destroyed = false;
  private abort_stream: (() => void) | undefined;
  constructor(options: A2UIOptions = {}) {
    const basic = createBasicCatalog({ onOpenUrl: options.onOpenUrl });
    const catalogs = options.catalogs ?? [
      basic,
      { ...basic, id: LEGACY_CATALOG_ID },
    ];
    this.model = new A2UIModel({ ...options, catalogs });
    this.element = outlet(
      "a2ui-surfaces",
      () => [...this.model.surfaces.values()],
      (update) => this.model.subscribe(update),
      (surface) =>
        View(
          {
            attributes: { n: `a2ui-surface:${surface.definition.surfaceId}` },
            style: {
              "--a2ui-primary": String(
                surface.definition.theme?.primaryColor ?? "#2563eb",
              ),
            },
          },
          [this.componentList(surface, ["root"], "/", [])],
        ),
      (left, right) => left === right,
    );
  }
  processMessage(message: unknown): void {
    this.model.apply(message);
  }
  processMessages(messages: readonly unknown[]): void {
    for (const message of messages) this.processMessage(message);
  }
  setStreamAbort(abort: () => void): void {
    this.abort_stream = abort;
  }
  abort(): void {
    this.abort_stream?.();
    this.abort_stream = undefined;
  }
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.abort();
    try {
      destroyElement(this.element);
    } finally {
      this.model.dispose();
    }
  }
  private componentList(
    surface: SurfaceModel,
    children: ChildList,
    scope: string,
    ancestors: string[],
  ): TimelessElement {
    const read = (): Occurrence[] => {
      const references = Array.isArray(children)
        ? children.map((id) => ({ id, scope }))
        : (() => {
            const path = pointer(children.path, scope);
            const values = readData(surface.data, path);
            if (values === undefined || values === null) return [];
            if (!Array.isArray(values))
              throw new ProtocolError(
                "Template data must be an array",
                surface.definition.surfaceId,
                path,
              );
            return Array.from({ length: values.length }, (_, index) => ({
              id: children.componentId,
              scope: `${path === "/" ? "" : path}/${index}`,
            }));
          })();
      return references.flatMap((reference) => {
        const definition = surface.components.get(reference.id);
        return definition ? [{ ...reference, definition }] : [];
      });
    };
    return outlet(
      `a2ui-children:${surface.definition.surfaceId}:${scope}`,
      read,
      (update) => surface.subscribe(update),
      (item) => {
        if (ancestors.includes(item.id))
          throw new ProtocolError(
            "Cyclic component reference",
            surface.definition.surfaceId,
          );
        return this.component(surface, item, [...ancestors, item.id]);
      },
      (left, right) =>
        left.id === right.id &&
        left.scope === right.scope &&
        left.definition === right.definition,
    );
  }
  private component(
    surface: SurfaceModel,
    item: Occurrence,
    ancestors: string[],
  ): TimelessElement {
    const cleanups: (() => void)[] = [];
    let closed = false;
    const watch = <T>(read: () => T): DerivedRef<T> => {
      const value = ref(read());
      const unsubscribe = surface.subscribe(() => {
        if (!closed) {
          const next = read();
          if (!Object.is(value.value, next)) value.as(next);
        }
      });
      cleanups.push(() => {
        try {
          unsubscribe();
        } finally {
          value.destroy();
          release(value);
        }
      });
      return value;
    };
    const context: ComponentContext = {
      definition: item.definition,
      surface: surface.definition,
      scope: item.scope,
      read: (expression) => surface.resolve(expression, item.scope),
      watch,
      bind: (expression, convert) =>
        watch(() => convert(surface.resolve(expression, item.scope))),
      input: () => surface.input(item.definition, item.scope),
      write: (value) => surface.writeInput(item.definition, item.scope, value),
      errors: () => surface.errors(item.definition, item.scope),
      act: (action) => surface.act(item.definition, item.scope, action),
      child: (id) => context.children([id]),
      children: (children) => {
        const view = this.componentList(
          surface,
          children,
          item.scope,
          ancestors,
        );
        cleanups.push(() => destroyElement(view));
        return view;
      },
      local: (key, fallback) =>
        surface.local(JSON.stringify([item.id, item.scope, key]), fallback),
      setLocal: (key, value: JsonValue) =>
        surface.setLocal(JSON.stringify([item.id, item.scope, key]), value),
      onCleanup: (cleanup) => cleanups.push(cleanup),
    };
    try {
      const factory = Object.hasOwn(
        surface.catalog.components,
        item.definition.component,
      )
        ? surface.catalog.components[item.definition.component]
        : undefined;
      if (!factory)
        throw new ProtocolError(
          `Unsupported component: ${item.definition.component}`,
          surface.definition.surfaceId,
        );
      const content = factory(context);
      const view = View(
        {
          attributes: {
            n: `a2ui-component:${surface.definition.surfaceId}:${item.id}:${item.scope}`,
            "aria-label": context.bind(
              item.definition.accessibility?.label,
              (value) => (value === undefined ? undefined : String(value)),
            ),
            "aria-description": context.bind(
              item.definition.accessibility?.description,
              (value) => (value === undefined ? undefined : String(value)),
            ),
          },
          style: { flexGrow: item.definition.weight ?? 0 },
        },
        content,
      );
      return owned(view, [
        ...cleanups,
        () => {
          closed = true;
        },
      ]);
    } catch (error) {
      closed = true;
      const errors: unknown[] = [error];
      for (const cleanup of cleanups.reverse()) {
        try {
          cleanup();
        } catch (failure) {
          errors.push(failure);
        }
      }
      if (errors.length > 1)
        throw new AggregateError(errors, "A2UI component construction failed");
      throw error;
    }
  }
}
