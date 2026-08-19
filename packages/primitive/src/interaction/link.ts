import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

import { isElement, ViewChildren } from "@/content/type";
import { Box, BoxProps } from "@/content/box";
import { MountedEvent } from "@/event";
import { bind_disabled } from "@/util/disabled";

export type LinkTarget =
  | "_self"
  | "_blank"
  | "_parent"
  | "_top"
  | (string & {});

export type LinkProps = BoxProps & {
  href?: string | DerivedRef<string> | Ref<string>;
  target?: LinkTarget | Ref<LinkTarget>;
  rel?: string | Ref<string>;
  disabled?: boolean | Ref<boolean>;
  download?: boolean | string | Ref<boolean | string>;
  referrerPolicy?: ReferrerPolicy | Ref<string>;
  hreflang?: string | Ref<string>;
  hrefLang?: string | Ref<string>;
  type?: string | Ref<string>;
  ping?: string | Ref<string>;
};
type LinkState = {
  href?: string;
  target?: LinkTarget;
  rel?: string;
  disabled: boolean;
  download?: boolean | string;
  referrerPolicy?: ReferrerPolicy;
  hreflang?: string;
  hrefLang?: string;
  type?: string;
  ping?: string;
};

export function Link(props: LinkProps = {}, children?: ViewChildren) {
  const {
    href,
    target,
    rel,
    disabled,
    download,
    referrerPolicy,
    hreflang,
    hrefLang,
    type,
    ping,
    attributes,
    ...rest
  } = props;

  let link_attributes = attributes;
  if (disabled !== undefined) {
    link_attributes = { ...attributes };
    delete link_attributes.href;
    delete link_attributes["aria-disabled"];
  }

  let $elm: any = null;
  const box$ = Box<LinkState>(
    { ...rest, attributes: link_attributes },
    { disabled: false },
  );
  const state = box$.state;
  const events = box$.events;

  const methods = {
    apply_href(value?: string) {
      state.href = value;
      box$.methods.apply_attr("href", state.disabled ? undefined : value);
    },

    apply_disabled(value: boolean) {
      state.disabled = value;
      state.attributes["aria-disabled"] = value ? "true" : undefined;
      box$.methods.apply_attr("aria-disabled", value ? "true" : undefined);
      box$.methods.apply_attr("href", value ? undefined : state.href);
    },

    subscribe_props() {
      box$.methods.subscribe_props();
      if (href) {
        if (isRef(href)) {
          methods.apply_href(href.value);
          box$.methods.unsubscribe(
            href.subscribe({
              onChange(value) {
                methods.apply_href(value);
              },
            }),
          );
        } else {
          methods.apply_href(href);
        }
      }
      if (target) {
        if (isRef(target)) {
          state.target = target.value;
          box$.methods.unsubscribe(
            target.subscribe({
              onChange(v) {
                state.target = v;
              },
            }),
          );
        } else {
          state.target = target;
        }
      }
      if (rel) {
        if (isRef(rel)) {
          state.rel = rel.value;
          box$.methods.unsubscribe(
            rel.subscribe({
              onChange(v) {
                state.rel = v;
              },
            }),
          );
        } else {
          state.rel = rel;
        }
      }
      bind_disabled({
        value: disabled,
        set_disabled: methods.apply_disabled,
        add_cleanup: box$.methods.unsubscribe,
      });
    },
  };

  methods.subscribe_props();
  box$.methods.add_event();
  const on_click = events.onClick;
  events.onClick = function (event) {
    if (state.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    on_click?.(event);
  };
  box$.methods.build_children(children);

  return {
    t: "link",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    events,
    children: state.children,
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.onUnmounted) {
          node.onUnmounted();
        }
      }
      state.rendered = false;
      $elm = null;
    },
  };
}
