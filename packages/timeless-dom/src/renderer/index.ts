import {
  type TimelessHost,
  type TimelessElement,
  setHost,
  getHost,
  isElement,
  registerComponent,
  Grid,
  View,
  Txt,
  isRef,
} from "@timeless/timeless";

import * as modules from "../modules/index";
import { viewStyleToCssText } from "../modules/style";

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

function build(elm: TimelessElement, host: TimelessHost): any {
  if (elm.t === "view") {
    const $elm = host.createElement("div");
    elm.$elm = $elm;
    // Apply styles
    if (elm.props?.style) {
      const cssText = viewStyleToCssText(elm.props.style);
      $elm.style.cssText = cssText;
    }

    // Apply class names
    if (elm.props?.styleSets) {
      if (isRef(elm.props.styleSets)) {
        $elm.className = elm.props.styleSets.value.join(" ");
      } else {
        $elm.className = elm.props.styleSets.join(" ");
      }
    }

    // Register event listeners
    if (elm.events) {
      if (elm.events.onClick) {
        $elm.addEventListener("click", elm.events.onClick);
      }
      if (elm.events.onDoubleClick) {
        $elm.addEventListener("dblclick", elm.events.onDoubleClick);
      }
      if (elm.events.onPointerDown) {
        $elm.addEventListener("pointerdown", elm.events.onPointerDown);
      }
      if (elm.events.onFocus) {
        $elm.addEventListener("focus", elm.events.onFocus);
      }
      if (elm.events.onBlur) {
        $elm.addEventListener("blur", elm.events.onBlur);
      }
      if (elm.events.onKeyDown) {
        $elm.addEventListener("keydown", elm.events.onKeyDown);
      }
      if (elm.events.onContextMenu) {
        $elm.addEventListener("contextmenu", elm.events.onContextMenu);
      }
      if (elm.events.onMouseEnter) {
        $elm.addEventListener("mouseenter", elm.events.onMouseEnter);
      }
      if (elm.events.onMouseLeave) {
        $elm.addEventListener("mouseleave", elm.events.onMouseLeave);
      }
      if (elm.events.onDragStart) {
        $elm.addEventListener("dragstart", elm.events.onDragStart);
      }
      if (elm.events.onDrag) {
        $elm.addEventListener("drag", elm.events.onDrag);
      }
      if (elm.events.onDragEnd) {
        $elm.addEventListener("dragend", elm.events.onDragEnd);
      }
      if (elm.events.onDragEnter) {
        $elm.addEventListener("dragenter", elm.events.onDragEnter);
      }
      if (elm.events.onDragOver) {
        $elm.addEventListener("dragover", elm.events.onDragOver);
      }
      if (elm.events.onDragLeave) {
        $elm.addEventListener("dragleave", elm.events.onDragLeave);
      }
      if (elm.events.onDrop) {
        $elm.addEventListener("drop", elm.events.onDrop);
      }
      if (elm.events.onAnimationEnd) {
        $elm.addEventListener("animationend", elm.events.onAnimationEnd);
      }
    }

    // Build and append children
    if (elm.children) {
      for (const child of elm.children) {
        if (isElement(child)) {
          const $sub = build(child, host);
          if ($sub) {
            $elm.appendChild($sub);
          }
        }
      }
    }

    return $elm;
  }

  if (elm.t === "text" && elm.value) {
    const $elm = host.createTextNode(elm.value);
    elm.$elm = $elm;
    return $elm;
  }

  if (elm.t === "grid") {
    const $elm = host.createElement("div");
    elm.$elm = $elm;
    $elm.style.cssText = "display: grid;";

    // Apply grid-specific styles
    if (elm.props) {
      const cols = (elm.props as any).columns ?? 4;
      const gap = (elm.props as any).gap ?? 16;
      $elm.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      $elm.style.gap = `${gap}px`;

      if (elm.props.style) {
        const cssText = viewStyleToCssText(elm.props.style);
        $elm.style.cssText += cssText;
      }
    }

    // Build and append children
    if (elm.children) {
      for (const child of elm.children) {
        if (isElement(child)) {
          const $sub = build(child, host);
          if ($sub) {
            $elm.appendChild($sub);
          }
        }
      }
    }

    return $elm;
  }

  if (elm.t === "for") {
    const $elm = host.createDocumentFragment();
    elm.$elm = $elm;
    if (elm.children) {
      for (const child of elm.children) {
        if (isElement(child)) {
          const $sub = build(child, host);
          if ($sub) {
            $elm.appendChild($sub);
          }
        }
      }
    }
    return $elm;
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
    const $content = build(elm, host);
    if (!$content) {
      console.error("[Render] Element render return null");
      return;
    }
    $root.appendChild($content);
    return { $content, ops };
  }

  console.error("[Render] Root Element can't be lazy element");
  return;
}
