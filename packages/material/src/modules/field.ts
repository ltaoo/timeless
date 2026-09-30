import { vm } from "@timeless/timeless";
import {
  computed,
  ref,
  refobj,
  classNames,
  combine,
} from "@timeless/timeless";
import {
  View,
  Show,
  ViewProps,
  ViewChildren,
  Match,
  Fragment,
  Label as NativeLabel,
  ListenerManager,
  TimelessElement,
} from "@timeless/timeless";

import { Separator as BaseSeparator } from "./separator";

export function FieldGroup(props: ViewProps, children: ViewChildren = []) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      class: classNames(["m3-field__group", cls]),
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
      class: classNames(["m3-field__set", cls]),
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
      class: classNames(["m3-field__legend", cls]),
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
      class: classNames(["m3-field__description", cls]),
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
    class: classNames(["m3-field__separator", cls]),
  });
}

export function FieldLabel(
  props: ViewProps & {
    store?: vm.SingleFieldCore<any>;
    for?: string;
    weight?: "normal" | "medium";
    tone?: "default" | "destructive";
  },
): TimelessElement {
  const {
    class: cls,
    store,
    weight = "medium",
    tone = "default",
    ...rest
  } = props;

  const state_ = refobj(store.state);
  const error_ = ref(store.state.error);

  const listener$ = ListenerManager([state_, error_]);

  return NativeLabel(
    {
      ...rest,
      class: classNames([
        "m3-field__label",
        computed(error_, (t) => (t ? "is-invalid" : "")),
        tone === "destructive" ? "is-invalid" : "",
        weight === "normal" ? "is-normal" : "",
        cls,
      ]),
      onMounted(event) {
        listener$.append([
          store.onStateChange((v) => state_.as(v)),
          store.onError((v) => error_.as(v)),
        ]);
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return listener$.destroy;
      },
    },
    [computed(state_, (s) => s.label)],
  );
}

export function FieldInlineLabel(
  props: ViewProps & {
    store?: vm.SingleFieldCore<any>;
    for?: string;
  },
  children?: ViewChildren,
): TimelessElement {
  const { class: cls, store, ...rest } = props;

  const state_ = refobj(store.state);
  const error_ = ref(store.state.error);

  const listener$ = ListenerManager([state_, error_]);

  return NativeLabel(
    {
      ...rest,
      class: classNames([
        "m3-field__inline-label",
        computed(error_, (t) => (t ? "is-invalid" : "")),
        cls,
      ]),
      onMounted(event) {
        listener$.append([
          store.onStateChange((v) => state_.as(v)),
          store.onError((v) => error_.as(v)),
        ]);
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return listener$.destroy;
      },
    },
    [
      Show({
        when: !!children,
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

function FieldHelp(props: {}, children: ViewChildren = []) {
  return View({ class: "m3-field__help" }, children);
}

function FieldError(props: {}, children: ViewChildren = []) {
  return View({ class: "m3-field__error" }, children);
}

export function Field(
  props: ViewProps & {
    store: vm.SingleFieldCore<any>;
    id?: string;
    orientation?: "vertical" | "horizontal";
    inline?: boolean;
  },
  children: ViewChildren = [],
) {
  const orientation = props.orientation || "vertical";

  const listener$ = ListenerManager();

  const state_ = refobj(props.store.state);
  const error_ = refobj(props.store.state.error);
  const invalid_ = computed(error_, (e) => !!e);

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
        "m3-field",
        orientation === "horizontal" ? "m3-field--horizontal" : "",
        cls,
      ]),
      onMounted(event) {
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
              class: "is-inline",
              store: props.store,
              for: fid,
            }),
          ];
        },
      }),
      Match({
        when: combine({ state: state_, error: error_ }, (t) => {
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
