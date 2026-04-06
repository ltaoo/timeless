import {
  type TimelessHost,
  type TimelessElement,
  getHost,
  isElement,
  isRef,
} from "@timeless/timeless";

import { viewStyleToCssText } from "../modules/style";
import { DOMShow } from "@/host/show";
import { DOMView, isDOMView } from "@/host/view";
import { DOMFor } from "@/host/for";
import { DOMGrid } from "@/host/grid";
import { DOMText } from "@/host/text";
import { DOMHost } from "@/host";

export type HostOperation = {
  method: string;
  args: any[];
};

type RecordingState = {
  enabled: boolean;
  ops: HostOperation[];
};

let _recording: null | {
  host: TimelessHost;
  baseHost: TimelessHost;
  state: RecordingState;
} = null;

function ensureRecordingDomHost(): {
  host: TimelessHost;
  state: RecordingState;
} {
  const currentHost = getHost();
  if (_recording) {
    if (_recording.host === currentHost) {
      return { host: _recording.host, state: _recording.state };
    }
    if (_recording.baseHost === currentHost) {
      return { host: _recording.host, state: _recording.state };
    }
  }

  const baseHost = currentHost;

  const state: RecordingState = { enabled: false, ops: [] };
  const proxy = new Proxy(baseHost as any, {
    get(target, prop, receiver) {
      const v = Reflect.get(target, prop, receiver);
      if (typeof prop === "string" && typeof v === "function") {
        return (...args: any[]) => {
          if (state.enabled) state.ops.push({ method: prop, args });
          return v.apply(target, args);
        };
      }
      return v;
    },
  }) as TimelessHost;

  _recording = { host: proxy, baseHost, state };
  return { host: proxy, state };
}

function build(elm: TimelessElement, host: TimelessHost): DOMHost {
  if (elm.t === "view") {
    const view$ = DOMView({
      build(elm: TimelessElement) {
        return build(elm, host);
      },
    });
    elm.$elm = view$;
    view$.render(elm);
    return view$;
  }
  if (elm.t === "text") {
    // console.log("[]in build elm.t is text", elm.value);
    const text$ = DOMText(elm.value as any);
    elm.$elm = text$;
    return text$;
  }
  if (elm.t === "grid") {
    const grid$ = DOMGrid({
      build(elm) {
        return build(elm, host);
      },
    });
    elm.$elm = grid$;
    grid$.render(elm);
    return grid$;
  }
  if (elm.t === "show") {
    const show$ = DOMShow({
      build(elm: TimelessElement) {
        return build(elm, host);
      },
    });
    elm.$elm = show$;
    show$.render(elm);
    return show$;
  }
  if (elm.t === "for") {
    const for$ = DOMFor({
      build(elm: TimelessElement) {
        return build(elm, host);
      },
    });
    elm.$elm = for$;
    for$.render(elm);
    return for$;
  }
  return null;
}

/**
 * Render a TimelessElement or ElementDescriptor into a DOM container.
 * @param elm - The element or descriptor to render
 * @param $root - The DOM container element
 */
export function render(
  elm: TimelessElement,
  $root: HTMLElement | null,
  extra: Partial<{
    onVNodeCreated: (data: any) => void;
  }> = {},
) {
  if (!$root) {
    console.error("[Render] Root element not found");
    return;
  }
  if (!elm) {
    console.error("[Render] Element is null");
    return;
  }

  const { host, state } = ensureRecordingDomHost();

  // setHost(host);
  // registerDomComponents();

  const ops: HostOperation[] = [];
  state.ops = ops;
  state.enabled = true;

  if (isElement(elm)) {
    // const $content = elm.render();
    const host$ = build(elm, host);
    if (!host$) {
      console.error("[Render] Element render return null");
      return;
    }
    if (!isDOMView(host$)) {
      console.error("[Render] Element render return non DOMView");
      return;
    }
    $root.appendChild(host$.$elm);
    return;
  }

  console.error("[Render] Root Element can't be lazy element");
  return;
}
