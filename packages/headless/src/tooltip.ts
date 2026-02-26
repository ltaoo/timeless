import { tp, merge } from "./theme.js";
import { View } from "./view.js";

export function Tooltip(props: any, children?: any) {
  const { content, side = "top", destroyOnHide = false, theme: t, class: cn, style: st } = props || {};
  let $tip: any = null, $wrapper: any = null;
  const OFFSET = 8;
  const SIDE_STYLE: any = {
    top: (r: any, tr: any) => `left:${r.left + r.width / 2 - tr.width / 2}px;top:${r.top - tr.height - OFFSET}px;`,
    bottom: (r: any, tr: any) => `left:${r.left + r.width / 2 - tr.width / 2}px;top:${r.bottom + OFFSET}px;`,
    left: (r: any, tr: any) => `left:${r.left - tr.width - OFFSET}px;top:${r.top + r.height / 2 - tr.height / 2}px;`,
    right: (r: any, tr: any) => `left:${r.right + OFFSET}px;top:${r.top + r.height / 2 - tr.height / 2}px;`,
  };

  const tipM = merge(tp(t?.tip), cn, st);
  const tip$ = View({
    ...tipM,
    style: `position:fixed;display:none;${tipM.style || ""}`,
  }, [typeof content === "object" && content.render ? content : { t: "text", $elm: document.createTextNode(String(content || "")), render() { return this.$elm; }, onMounted() {}, beforeUnmounted() {}, onUnmounted() {} }]);

  const TRANSITION = "opacity 150ms ease,transform 150ms ease";
  const ENTER = { opacity: "1", transform: "scale(1)" };
  const EXIT = { opacity: "0", transform: "scale(0.96)" };

  function show() {
    if (!$wrapper) return;
    if (!$tip) {
      document.body.appendChild(tip$.render());
      $tip = tip$.$elm;
    }
    const rect = $wrapper.getBoundingClientRect();
    $tip.style.cssText = `position:fixed;display:block;opacity:0;${tipM.style || ""}`;
    const tipRect = $tip.getBoundingClientRect();
    $tip.style.cssText = `position:fixed;z-index:999;display:block;pointer-events:none;transition:${TRANSITION};${(SIDE_STYLE[side] || SIDE_STYLE.top)(rect, tipRect)}${tipM.style || ""}`;
    Object.assign($tip.style, EXIT);
    if (tipM.class) $tip.className = tipM.class;
    requestAnimationFrame(() => { Object.assign($tip.style, ENTER); });
  }
  function hide() {
    if (!$tip) return;
    Object.assign($tip.style, EXIT);
    const onEnd = () => {
      $tip.removeEventListener("transitionend", onEnd);
      if (destroyOnHide) {
        if ($tip.parentNode) $tip.parentNode.removeChild($tip);
        $tip = null;
      } else {
        $tip.style.display = "none";
      }
    };
    $tip.addEventListener("transitionend", onEnd);
  }

  const wM = merge(tp(t?.wrapper));
  return View({
    ...wM,
    onMounted(el: any) {
      $wrapper = el;
      el.addEventListener("mouseenter", show);
      el.addEventListener("mouseleave", hide);
    },
    onUnmounted() { if ($tip && $tip.parentNode) $tip.parentNode.removeChild($tip); },
  }, children);
}
