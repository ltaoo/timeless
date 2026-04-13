import { computed, ref, refobj, classNames, combine } from "@timeless/timeless";
import {
  View,
  Show,
  ViewProps,
  ViewChildren,
  Match,
  Fragment,
  Label as NativeLabel,
  ListenerManager,
} from "@timeless/timeless";
import { SingleFieldCore } from "@timeless/ui";

import { Separator as BaseSeparator } from "./separator";

export function FieldGroup(props: ViewProps, children: ViewChildren = []) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      class: classNames(["flex flex-col gap-6", cls]),
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
      class: classNames(["space-y-4", cls]),
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
      class: classNames([
        "text-base font-semibold leading-none tracking-tight",
        cls,
      ]),
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
      class: classNames(["text-sm text-muted-foreground", cls]),
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
    class: classNames([orientation === "horizontal" ? "my-6" : "mx-6", cls]),
  });
}

export function FieldLabel(
  props: ViewProps & {
    store?: SingleFieldCore<any>;
    for?: string;
    weight?: "normal" | "medium";
    tone?: "default" | "destructive";
  },
) {
  const {
    class: cls,
    store,
    weight = "medium",
    tone = "default",
    ...rest
  } = props;

  const state_ = refobj(store.state);
  const error_ = ref(store.state.error);

  store.onStateChange((v) => state_.as(v));
  store.onError((v) => error_.as(v));

  return NativeLabel(
    {
      ...rest,
      class: classNames([
        "select-none",
        weight === "normal" ? "font-normal" : "font-medium",
        "group-data-[invalid]:text-destructive",
        combine({ error: error_ }, (t) => (t.error ? "text-destructive" : "")),
        tone === "destructive" ? "text-destructive" : "",
        cls,
      ]),
    },
    [computed(state_, (s) => s.label)],
  );
}
export function FieldInlineLabel(
  props: ViewProps & {
    store?: SingleFieldCore<any>;
    for?: string;
  },
  children,
) {
  const { class: cls, store, ...rest } = props;

  const state_ = refobj(store.state);
  const error_ = ref(store.state.error);
  store.onStateChange((v) => state_.as(v));
  store.onError((v) => error_.as(v));

  return NativeLabel(
    {
      ...rest,
      class: classNames([
        "text-sm font-normal select-none cursor-pointer",
        "group-data-[invalid]:text-destructive",
        computed(error_, (t) => (t ? "text-destructive" : "")),
        cls,
      ]),
    },
    [
      Show({
        when: computed(children, (t) => {
          return !!(t && t.length);
        }),
        ok() {
          return children;
        },
        else() {
          return [computed(state_, (t) => t.label)];
        },
      }),
    ],
  );
}
export function FieldHelp(props: {}, children: ViewChildren = []) {
  void props;
  return View({ class: "text-sm text-muted-foreground" }, children);
}
export function FieldError(props: {}, children: ViewChildren = []) {
  void props;
  return View({ class: "text-sm font-normal text-destructive" }, children);
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
  const orientation = props.orientation || "vertical";

  const listener$ = ListenerManager();

  const state_ = refobj(props.store.state);
  const error_ = refobj(props.store.state.error);
  const invalid_ = computed(error_, (e) => !!e);

  // let $root: HTMLElement | null = null;
  // const applyInvalidToControls = (invalid: boolean) => {
  //   if (!$root) return;
  //   const controls = $root.querySelectorAll("input, textarea, select");
  //   for (let i = 0; i < controls.length; i += 1) {
  //     const el = controls[i] as HTMLElement;
  //     if (invalid) {
  //       if (!el.hasAttribute("aria-invalid")) {
  //         el.setAttribute("data-field-aria-invalid", "");
  //         el.setAttribute("aria-invalid", "true");
  //       }
  //       continue;
  //     }
  //     if (el.hasAttribute("data-field-aria-invalid")) {
  //       el.removeAttribute("data-field-aria-invalid");
  //       el.removeAttribute("aria-invalid");
  //     }
  //   }
  // };

  listener$.push(
    props.store.onStateChange((v) => {
      state_.as(v);
    }),
  );
  listener$.push(
    props.store.onError((v) => {
      error_.as(v);
    }),
  );

  const fid = props.id || props.store.name || props.store.id;

  const { class: cls, dataset, onMounted, onUnmounted, ...rest } = props;

  return View(
    {
      ...rest,
      dataset: {
        ...(dataset || {}),
        invalid: invalid_,
      },
      class: classNames([
        "group",
        "text-neutral-800 dark:text-neutral-300",
        orientation === "horizontal"
          ? "flex w-full items-center gap-3"
          : "flex w-full flex-col gap-2",
        cls,
      ]),
      onMounted(event) {
        // const el = (event as any).target as HTMLElement;
        // $root = el;
        // applyInvalidToControls(invalid_.value);
        if (onMounted) {
          return onMounted(event);
        }
      },
      onUnmounted() {
        listener$.clean();
        if (onUnmounted) {
          onUnmounted();
        }
      },
    },
    [
      Show({
        when: !props.inline,
        ok() {
          // console.log("render label in ok");
          return [
            FieldLabel({
              store: props.store,
              for: fid,
            }),
            Fragment({}, children),
          ];
        },
        else() {
          return [
            Fragment({}, children),
            FieldLabel({
              class: "inline",
              store: props.store,
              for: fid,
            }),
          ];
        },
      }),
      Match({
        when: combine({ state: state_, error: error_ }, (t) => {
          // console.log("Field match", t.error);
          if (t.error) {
            return "error";
          }
          if (t.state.help) {
            return "help";
          }
          return "none";
        }),
        cases: {
          error() {
            return [
              FieldError({ store: props.store }, [
                computed(error_, (e) => e?.message || ""),
              ]),
            ];
          },
          help() {
            return [FieldHelp({ store: props.store }, [props.store.help])];
          },
        },
      }),
    ],
  );
}
