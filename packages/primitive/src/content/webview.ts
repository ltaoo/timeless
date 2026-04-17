/**
 * Webview - A component for embedding external web content.
 *
 * Webview loads and displays external URLs/HTML content.
 * It's used for:
 * - Embedding external websites
 * - Loading remote HTML content
 * - Web-based content in the app
 *
 * Note: This is different from an iframe - it's a native webview.
 *
 * @example
 * ```tsx
 * <Webview href="https://example.com" />
 * ```
 */
import { DerivedRef, Ref, isRef } from "@timeless/reactive";

import { MountedEvent } from "@/event/index";
import { ListenerManager } from "@/util/listener";
import { Logger } from "@/util/logger";

import { TimelessElement } from "./type";
import { Box, BoxEvents, BoxProps } from "./box";

/** Props for Webview component */
export type WebviewProps = BoxProps & {
  /** URL to load */
  href: string | DerivedRef<string> | Ref<string>;
} & BoxEvents;

/** Internal state for Webview */
type WebviewState = {
  href: string;
};

/** Logger for debugging webview operations */
const logger = Logger({ prefix: "primitive", scope: "content/webview" });

/**
 * Creates a Webview component.
 *
 * @param props - Webview props including href
 * @returns A TimelessElement representing a webview
 */
export function Webview(props: WebviewProps): TimelessElement<WebviewState> {
  const { href, ...rest } = props;

  let $elm: any = null;
  const listener$ = ListenerManager();
  const box$ = Box<WebviewState>(rest, {} as WebviewState);
  const state = box$.state;
  const events = box$.events;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();

      if (href !== undefined) {
        if (isRef(href)) {
          state.href = href.value;
          const unsub = href.subscribe({
            onChange(v) {
              state.href = v;
            },
          });
          listener$.push(unsub);
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
      listener$.destroy();
      box$.methods.destroy();
      state.rendered = false;
      $elm = null;
    },
  };
}
