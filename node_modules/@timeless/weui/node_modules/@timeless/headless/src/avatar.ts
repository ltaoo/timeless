import { computed, ref, isRef, Ref } from "@timeless/reactive";

import { View, ViewChildren, ViewProps } from "./view";
// import { Txt } from "./text";

export function Root(
  props: ViewProps & { size?: "default" | "large" },
  children?: ViewChildren,
) {
  const { size = "default", ...rest } = props || {};
  return View(
    {
      ...rest,
      // "data-avatar": "",
      // "data-size": size,
    },
    children,
  );
}

export function Image(
  props: ViewProps & {
    src: string | Ref<string>;
    alt?: string;
    onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void;
  },
) {
  const { src, alt, onLoadingStatusChange, ...rest } = props || {};

  const srcRef = isRef(src) ? src : ref(src || "");

  const $img = document.createElement("img");

  const updateSrc = (v: string) => {
    if (v) {
      $img.src = v;
      $img.style.display = "";
      onLoadingStatusChange?.("loading");
    } else {
      $img.style.display = "none";
      onLoadingStatusChange?.("error");
    }
  };

  updateSrc(srcRef.value);
  if (isRef(src)) {
    src._subscribe({ onChange: updateSrc });
  }

  $img.addEventListener("load", () => {
    onLoadingStatusChange?.("loaded");
  });

  $img.addEventListener("error", () => {
    onLoadingStatusChange?.("error");
    $img.style.display = "none";
  });

  if (alt) $img.alt = alt;
  if (rest.class) $img.className = String(rest.class);

  return {
    t: "view",
    $elm: $img,
    render() {
      return $img;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {},
    append(node: any) {
      $img.appendChild(node);
    },
    setContent(html: string) {
      $img.innerHTML = html;
    },
    class$: null,
  };
}

export function Fallback(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      // "data-avatar-fallback": "",
    },
    children,
  );
}

// Convenience component that combines Root, Image, and Fallback
export function Avatar(
  props: ViewProps & {
    src: string | Ref<string>;
    alt?: string;
    size?: "default" | "large";
    fallback?: string;
  },
  children?: ViewChildren,
) {
  const { src, alt, fallback, size = "default", ...rest } = props || {};

  const imgError = ref(false);
  const srcRef = isRef(src) ? src : ref(src || "");

  return Root({ ...rest, size }, [
    Image({
      src: srcRef,
      alt,
      onLoadingStatusChange: (status) => {
        imgError.as(status === "error");
      },
    }),
    Fallback(
      {
        style: computed(imgError, (d) => {
          return d || !srcRef.value ? "" : "display:none;";
        }),
      },
      children ?? [fallback || (alt ? alt.charAt(0).toUpperCase() : "?")],
    ),
  ]);
}
