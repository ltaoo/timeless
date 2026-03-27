import { refobj, computed, classNames, sn, combine } from "@timeless/reactive";
import { TagSelectCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "../primitive/view";
import { Show } from "../primitive/show";
import { For } from "../primitive/for";
import { Fragment } from "../primitive/fragment";
import { NativeInput } from "../native/input";
import { h } from "../util/h";
import { Portal as NativePortal } from "./portal";
import * as PopperPrimitive from "./popper";

export function Root(
  props: ViewProps & { store: TagSelectCore<any> },
  children?: ViewChildren,
) {
  return PopperPrimitive.Root(
    {
      ...props,
      store: props.store.popper,
    },
    children,
  );
}

export function Trigger(
  props: ViewProps & { store: TagSelectCore<any>; id?: string },
  children: ViewChildren = [],
) {
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const events: any[] = [];

  const _input$ = View(
    {
      as: "input",
      attributes: {
        ...(rest.attributes || {}),
        id: props.store.id || props.id || rest.attributes?.id,
      },
      style:
        "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;",
      onFocus() {
        if (props.store.presence.state.visible) {
          return;
        }
        props.store.presence.show();
        props.store.popper.place();
      },
      onClick(e) {
        e.stopPropagation();
      },
      onMounted($elm: HTMLInputElement) {
        $elm.value = store.state.values.join(",") || "";
        events.push(
          store.onStateChange(() => {
            $elm.value = store.state.values.join(",") || "";
          }),
        );
      },
    },
    [],
  );

  return View(
    {
      ...rest,
      onMounted($elm: HTMLDivElement) {
        store.popper.setReference(
          {
            $el: $elm,
            getRect() {
              return $elm.getBoundingClientRect();
            },
          },
          { force: true },
        );

        $elm.addEventListener("pointerdown", (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.target.tagName === "INPUT") {
            return;
          }
          if (store.disabled) {
            return;
          }
          if (props.store.presence.state.visible) {
            props.store.presence.hide();
            return;
          }
          props.store.presence.show();
          props.store.popper.place();
        });

        if (rest.onMounted) {
          rest.onMounted($elm);
        }
      },
      onUnmounted() {
        for (const fn of events) {
          if (typeof fn === "function") fn();
        }
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    [_input$, ...children],
  );
}

export function Value(
  props: ViewProps & { store: TagSelectCore<any> },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange((v) => {
    state.as(v);
  });

  return View(
    {
      ...rest,
      as: "span",
    },
    [
      computed(state, (d) => {
        if (d.selectedOptions.length === 0) {
          return d.placeholder || "Select tags...";
        }
        return d.selectedOptions.map((o) => o.label).join(", ");
      }),
    ],
  );
}

export function TagList(
  props: ViewProps & { store: TagSelectCore<any> },
  children: ViewChildren,
) {
  return View(props, children);
}

export function Tag(
  props: ViewProps & { store: TagSelectCore<any>; value: any },
  children: ViewChildren,
) {
  const { store, value, ...rest } = props;

  return View(rest, children);
}

export function TagRemove(
  props: ViewProps & { store: TagSelectCore<any>; value: any },
  children: ViewChildren,
) {
  const { store, value, ...rest } = props;

  return View(
    {
      ...rest,
      onClick(e) {
        e.stopPropagation();
        store.removeTag(value);
      },
    },
    children,
  );
}

export function Icon(props: ViewProps, children: ViewChildren) {
  return View(props, children);
}

export function Portal(
  props: ViewProps & {
    store: TagSelectCore<any>;
    animation?: { in: string; out: string };
  },
  children: ViewChildren = [],
) {
  return NativePortal({}, children);
}

export function Content(
  props: ViewProps & {
    store: TagSelectCore<any>;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  const { store, animation, ...rest } = props;

  const presence_ = refobj(store.presence.state);
  let _was_exiting = false;

  store.presence.onStateChange((v) => {
    presence_.as(v);
  });

  return h(
    Show,
    {
      when: computed(presence_, (t) => {
        return t.mounted;
      }),
    },
    [
      NativePortal({}, [
        PopperPrimitive.Content(
          {
            store: store.popper,
            onDismiss() {
              store.hide();
            },
          },
          [
            View(
              {
                ...rest,
                class: classNames([
                  rest.class,
                  computed(presence_, (t) => {
                    if (t.exit) {
                      _was_exiting = true;
                    }
                    if (!t.mounted && _was_exiting) {
                      _was_exiting = false;
                      return animation?.out || "";
                    }
                    if (t.mounted) {
                      _was_exiting = false;
                    }
                    return [
                      t.enter && animation?.in ? animation.in : "",
                      t.exit && animation?.out ? animation.out : "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                  }),
                ]),
                onAnimationEnd(e: AnimationEvent) {
                  if (e.target === e.currentTarget) {
                    store.presence.handleAnimationEnd();
                  }
                  if (rest.onAnimationEnd) {
                    rest.onAnimationEnd(e);
                  }
                },
              },
              children,
            ),
          ],
        ),
      ]),
    ],
  );
}

export function Viewport(
  props: ViewProps & { store: TagSelectCore<any> },
  children: ViewChildren,
) {
  return View(props, children);
}

export function FilteredList(
  props: ViewProps & {
    store: TagSelectCore<any>;
    each: (
      option: {
        value: any;
        label: string;
        selected: boolean;
        focused: boolean;
      },
      index: number,
    ) => ViewChildren;
  },
) {
  const { store, each, ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange((v) => {
    state.as(v);
  });

  return View(rest, [
    For({
      each: computed(state, (d) => {
        return d.filteredOptions;
      }),
      render(item, index) {
        return Fragment({}, each(item, index));
      },
    }),
  ]);
}

export function Empty(
  props: ViewProps & { store: TagSelectCore<any> },
  children: ViewChildren,
) {
  const { store, ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange((v) => {
    state.as(v);
  });

  return h(
    Show,
    {
      when: computed(state, (d) => d.filteredOptions.length === 0),
    },
    [View(rest, children)],
  );
}

export function Item(
  props: ViewProps & { store: TagSelectCore<any>; value: any },
  children: ViewChildren,
) {
  const { store, value, ...rest } = props;

  return View(
    {
      ...rest,
      onClick() {
        store.toggle(value);
      },
      onMouseEnter() {
        store.focusOption(value);
      },
      onMouseLeave() {
        store.blurOption(value);
      },
    },
    children,
  );
}

export function ItemText(props: ViewProps, children: ViewChildren) {
  return View({ ...props, as: "span" }, children);
}

export function ItemIndicator(
  props: ViewProps & { store: TagSelectCore<any>; value: any },
  children: ViewChildren,
) {
  const { store, value, ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange((v) => {
    state.as(v);
  });

  const selected = computed(state, (d) => d.values.includes(value));

  return View(
    {
      ...rest,
      style: sn([
        rest.style,
        combine({ ss: rest.style, selected }, ({ ss, selected }) => {
          return selected ? ss || "" : "display:none;";
        }),
      ]),
    },
    children,
  );
}

export function Clear(
  props: ViewProps & { store: TagSelectCore<any> },
  children: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onClick(e) {
        e.stopPropagation();
        store.clear();
      },
    },
    children,
  );
}

export function Search(
  props: ViewProps & {
    store: TagSelectCore<any>;
    placeholder?: string;
  },
  children?: ViewChildren,
) {
  const { store, placeholder = "Search...", ...rest } = props;

  return NativeInput({
    ...rest,
    type: "text",
    placeholder,
    onInput(e: Event) {
      const target = e.target as HTMLInputElement;
      store.setKeyword(target.value);
    },
    onClick(e: Event) {
      e.stopPropagation();
    },
    onMounted($elm: HTMLInputElement) {
      $elm.value = store.state.keyword;
      store.onStateChange((state) => {
        if ($elm.value !== state.keyword) {
          $elm.value = state.keyword;
        }
      });
      if (rest.onMounted) {
        rest.onMounted($elm);
      }
    },
  });
}
