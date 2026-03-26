import { computed, refobj, cn } from "@timeless/reactive";
import { View, Show, ViewProps, ViewChildren, h } from "@timeless/headless";
import { SingleFieldCore } from "@timeless/ui";

import { Label as BaseLabel } from "./label";
import { Separator as BaseSeparator } from "./separator";

export function FieldGroup(props: ViewProps, children: ViewChildren = []) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      class: cn(["flex flex-col gap-6", cls]),
    },
    children,
  );
}

export function FieldSet(props: ViewProps, children: ViewChildren = []) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      as: "fieldset",
      class: cn(["space-y-4", cls]),
    },
    children,
  );
}

export function FieldLegend(props: ViewProps, children: ViewChildren = []) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      as: "legend",
      class: cn(["text-base font-semibold leading-none tracking-tight", cls]),
    },
    children,
  );
}

export function FieldDescription(
  props: ViewProps,
  children: ViewChildren = [],
) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      class: cn(["text-sm text-muted-foreground", cls]),
    },
    children,
  );
}

export function FieldSeparator(
  props: ViewProps & { orientation?: "horizontal" | "vertical" } = {},
) {
  const { class: cls, orientation = "horizontal", ...rest } = props;
  return BaseSeparator({
    ...rest,
    orientation,
    class: cn([orientation === "horizontal" ? "my-6" : "mx-6", cls]),
  });
}

export function FieldLabel(
  props: ViewProps & {
    store?: SingleFieldCore<any>;
    for?: string;
    weight?: "normal" | "medium";
    tone?: "default" | "destructive";
  },
  children?: ViewChildren,
) {
  const {
    class: cls,
    store,
    for: htmlFor,
    weight = "medium",
    tone = "default",
    ...rest
  } = props;

  const state_ = refobj(store.state);
  store.onStateChange((v) => state_.as(v));

  return View(
    {
      ...rest,
      attributes: {
        for: htmlFor,
      },
      as: "label",
      class: cn([
        "select-none",
        weight === "normal" ? "font-normal" : "font-medium",
        tone === "destructive" ? "text-destructive" : "",
        cls,
      ]),
    },
    [computed(state_, (s) => s.label)],
  );
}

export function Field(
  props: ViewProps & {
    store: SingleFieldCore<any>;
    id?: string;
    // autoRender?: boolean;
    orientation?: "vertical" | "horizontal";
    inline?: boolean;
    // hideLabel?: boolean;
  },
  children: ViewChildren = [],
) {
  const orientation = (props as any).orientation || "vertical";

  const state_ = refobj(props.store.state);
  const error_ = refobj(props.store.state.error);

  props.store.onStateChange((v) => {
    state_.as(v);
  });
  props.store.onError((v) => {
    error_.as(v);
  });

  const fid =
    props.id ||
    props.store.id ||
    `field-${props.store.name || Math.random().toString(36).slice(2, 11)}`;

  const { class: cls, ...rest } = props;

  return View(
    {
      ...rest,
      class: cn([
        "text-neutral-800 dark:text-neutral-300",
        orientation === "horizontal"
          ? "flex w-full items-center gap-3"
          : "flex w-full flex-col gap-2",
        cls,
      ]),
    },
    [
      Show(
        {
          when: !props.inline,
          fallback: [
            ...children,
            FieldLabel({
              class: "inline",
              store: props.store,
              for: fid,
            }),
          ],
        },
        [
          FieldLabel({
            store: props.store,
            for: fid,
          }),
          ...children,
        ],
      ),
      Show({ when: computed(error_, (t) => !!t) }, [
        h(View, { class: "text-sm font-normal text-destructive" }, [
          computed(error_, (t) => (t ? t.message : "")),
        ]),
      ]),
    ],
  );
}
