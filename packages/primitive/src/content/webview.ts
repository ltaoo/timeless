import { DerivedRef, Ref, isRef } from "@timeless/reactive";

import { MountedEvent } from "@/event/index";
import { Logger } from "@/util/logger";

import { TimelessElement } from "./type";
import { Box, BoxEvents, BoxProps } from "./box";

export type WebviewProps = BoxProps & {
  href: string | DerivedRef<string> | Ref<string>;
} & BoxEvents;

type WebviewState = {
  href: string;
};

const logger = Logger({ prefix: "primitive", scope: "content/webview" });

export function Webview(props: WebviewProps): TimelessElement<WebviewState> {
  const { href, ...rest } = props;

  let $elm: any = null;
  const box$ = Box<WebviewState>(rest, {} as WebviewState);
  const state = box$.state;
  const events = box$.events;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();

      if (href !== undefined) {
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
    },
  };

  methods.subscribe_props();

  return {
    t: "webview",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event: MountedEvent) {
      logger.log("onMounted", state.children.length);
      state.rendered = true;
      if (rest.onMounted) {
        box$.methods.unsubscribe(rest.onMounted(event));
      }
    },
    beforeUnmounted() {
      if (rest.beforeUnmounted) {
        rest.beforeUnmounted();
      }
    },
    onUnmounted() {
      // console.log("[primitive]view - onUnmounted", onUnmounted);
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
      box$.methods.destroy();
      state.rendered = false;
      $elm = null;
    },
  };
}
