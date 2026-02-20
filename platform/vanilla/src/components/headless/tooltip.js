import { tp, merge } from "./theme.js";
import { View } from "../ui/view.js";

export function Tooltip(props, children) {
  const { content, side = "top", theme: t, class: cn, style: st } = props || {};
  let $tip = null, $wrapper = null;
  const OFFSET = 8;
  const SIDE_STYLE = {
    top: (r, tr) => `left:${r.left + r.width / 2 - tr.width / 2}px;top:${r.top - tr.height - OFFSET}px;`,
    bottom: (r, tr) => `left:${r.left + r.width / 2 - tr.width / 2}px;top:${r.bottom + OFFSET}px;`,
    left: (r, tr) => `left:${r.left - tr.width - OFFSET}px;top:${r.top + r.height / 2 - tr.height / 2}px;`,
    right: (r, tr) => `left:${r.right + OFFSET}px;top:${r.top + r.height / 2 - tr.height / 2}px;`,
  };

  const tipM = merge(tp(t?.tip), cn, st);
  function show() {
    if (!$tip || !$wrapper) return;
    const rect = $wrapper.getBoundingClientRect();
    $tip.style.display = "block";
    const tipRect = $tip.getBoundingClientRect();
    $tip.style.cssText = `position:fixed;z-index:999;display:block;${(SIDE_STYLE[side] || SIDE_STYLE.top)(rect, tipRect)}${tipM.style || ""}`;
    if (tipM.class) $tip.className = tipM.class;
  }
  function hide() { if ($tip) $tip.style.display = "none"; }

  const tip$ = View({
    ...tipM,
    style: `position:fixed;display:none;${tipM.style || ""}`,
  }, [typeof content === "object" && content.render ? content : { t: "text", $elm: document.createTextNode(String(content || "")), render() { return this.$elm; }, onMounted() {}, beforeUnmounted() {}, onUnmounted() {} }]);

  const wM = merge(tp(t?.wrapper));
  return View({
    ...wM,
    onMounted(el) {
      $wrapper = el;
      $tip = tip$.$elm;
      document.body.appendChild(tip$.render());
      el.addEventListener("mouseenter", show);
      el.addEventListener("mouseleave", hide);
    },
    onUnmounted() { if ($tip && $tip.parentNode) $tip.parentNode.removeChild($tip); },
  }, children);
}
