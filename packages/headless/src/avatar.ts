import { tp, merge } from "./theme.js";
import { View } from "./view.js";
import { Txt } from "./text.js";
import { computed, ref, isRef } from "@timeless/reactive";

export function Avatar(props: any) {
  const { src, alt, fallback, size = "default", theme: t, class: cn, style: st } = props || {};
  const imgError = ref(false);
  const srcRef = isRef(src) ? src : ref(src || "");

  return View({ ...merge(tp(t?.root, { size }), cn, st) }, [
    (() => {
      const $img = document.createElement("img");
      const ir = merge(tp(t?.image));
      if (ir.class) $img.className = ir.class;
      if (ir.style) $img.style.cssText = ir.style;
      const updateSrc = (v: string) => {
        if (v) { $img.src = v; $img.style.display = ""; }
        else { $img.style.display = "none"; imgError.value = true; }
      };
      updateSrc(srcRef.value);
      if (isRef(src)) src._subscribe({ onChange: updateSrc });
      $img.addEventListener("load", () => { imgError.value = false; });
      $img.addEventListener("error", () => { imgError.value = true; $img.style.display = "none"; });
      if (alt) $img.alt = alt;
      return { t: "view", $elm: $img, render() { return $img; }, onMounted() {}, beforeUnmounted() {}, onUnmounted() {}, append(node: any) { $img.appendChild(node); }, setContent(html: string) { $img.innerHTML = html; }, class$: null };
    })(),
    View({
      ...merge(tp(t?.fallback)),
      style: computed({ imgError }, (d: any) => {
        const base = merge(tp(t?.fallback)).style || "";
        return (d.imgError || !srcRef.value) ? base : base + "display:none;";
      }),
      class: computed({ imgError }, (d: any) => {
        const base = merge(tp(t?.fallback)).class || "";
        return (d.imgError || !srcRef.value) ? base : base + " hidden";
      }),
    }, [Txt(fallback || (alt ? alt.charAt(0).toUpperCase() : "?"))]),
  ]);
}
