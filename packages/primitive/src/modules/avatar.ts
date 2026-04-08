import { computed, ref, isRef, Ref } from "@timeless/reactive";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { Img } from "@/content/img";

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
  // const host = getHost();
  const { src, alt, onLoadingStatusChange, ...rest } = props || {};

  let $elm: any = null;
  // const srcRef = isRef(src) ? src : ref(src || "");

  // const $img = safeCreateElement("img");
  // let rendered = false;

  // const setProp = (key: string, value: any) => {
  //   if (host.setProperty) {
  //     host.setProperty($img, key, value);
  //     return;
  //   }
  //   ($img as any)[key] = value;
  // };

  // const updateSrc = (v: unknown) => {
  //   const srcText = String(v ?? "");
  //   if (srcText) {
  //     setProp("src", srcText);
  //     host.patchStyle?.($img, { display: "" });
  //     onLoadingStatusChange?.("loading");
  //   } else {
  //     host.patchStyle?.($img, { display: "none" });
  //     onLoadingStatusChange?.("error");
  //   }
  // };

  // updateSrc(srcRef.value);
  // if (isRef(src)) {
  //   src.subscribe({ onChange: updateSrc });
  // }

  // const handleLoad = () => {
  //   onLoadingStatusChange?.("loaded");
  // };

  // const handleError = () => {
  //   onLoadingStatusChange?.("error");
  //   host.patchStyle?.($img, { display: "none" });
  // };

  // host.addEventListener($img, "load", handleLoad);
  // host.addEventListener($img, "error", handleError);

  // if (alt) setProp("alt", alt);
  // if (rest.class) host.setClassName($img, String(rest.class));

  return Img(props);
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
        style: {
          display: computed(imgError, (d) =>
            d || !srcRef.value ? undefined : "none",
          ),
        },
      },
      children ?? [fallback || (alt ? alt.charAt(0).toUpperCase() : "?")],
    ),
  ]);
}
