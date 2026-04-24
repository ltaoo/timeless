import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { isElement, ViewChildren } from "@/content/type";
import { Box, BoxProps } from "@/content/box";
import { MountedEvent } from "@/event";

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
  disabled?: boolean;
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

  let $elm: any = null;
  const box$ = Box<LinkState>(rest, {} as LinkState);
  const state = box$.state;
  const events = box$.events;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();
      if (href) {
        if (isRef(href)) {
          state.href = href.value;
          href.subscribe({
            onChange(v) {
              state.href = v;
            },
          });
        } else {
          state.href = href;
        }
      }
      if (target) {
        if (isRef(target)) {
          state.target = target.value;
          target.subscribe({
            onChange(v) {
              state.target = v;
            },
          });
        } else {
          state.target = target;
        }
      }
      if (rel) {
        if (isRef(rel)) {
          state.rel = rel.value;
          rel.subscribe({
            onChange(v) {
              state.rel = v;
            },
          });
        } else {
          state.rel = rel;
        }
      }
    },
  };

  methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  return {
    t: "link",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
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
