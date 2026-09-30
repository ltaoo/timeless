import { computed } from "@timeless/timeless";
import type { ViewStyleProperties } from "@timeless/timeless";

/**
 * 浮动层箭头（popover / popconfirm / tooltip 共用）。
 *
 * Bootstrap 的箭头是一个 45° 旋转的小方块，贴在被锚定元素那一侧的对边：
 *   placement=bottom → 箭头在浮层顶部（.is-top）
 *   placement=top    → 箭头在浮层底部（.is-bottom）
 *   placement=right  → 箭头在浮层左侧（.is-left）
 *   placement=left   → 箭头在浮层右侧（.is-right）
 *
 * class 负责“贴哪条边 + 隐藏哪两条边框”，style 负责沿交叉轴的偏移
 * （优先用 popper 给的 arrow.x / arrow.y，退化时按 align 取 50% / 1rem）。
 */
export function makeArrowStyle(popper_state_: any, base: string) {
  const class_ = computed(popper_state_, (t: any) => {
    const side = String(t.placement || "bottom").split("-")[0];
    const edge =
      side === "bottom"
        ? "is-top"
        : side === "top"
          ? "is-bottom"
          : side === "right"
            ? "is-left"
            : "is-right";
    return [base, edge].filter(Boolean).join(" ");
  });

  const style_ = computed(popper_state_, (s: any) => {
    const [side, align = "center"] = String(s.placement || "bottom").split("-");
    const styles: ViewStyleProperties = {};
    const horizontal = side === "top" || side === "bottom";

    if (side === "top") styles.bottom = "-0.3125rem";
    if (side === "bottom") styles.top = "-0.3125rem";
    if (side === "left") styles.right = "-0.3125rem";
    if (side === "right") styles.left = "-0.3125rem";

    let transform = "rotate(45deg)";
    const arrow = s.arrow || null;

    if (arrow && arrow.x != null && horizontal) {
      styles.left = `${arrow.x}px`;
      transform = "translateX(-50%) rotate(45deg)";
    } else if (arrow && arrow.y != null && !horizontal) {
      styles.top = `${arrow.y}px`;
      transform = "translateY(-50%) rotate(45deg)";
    } else if (align === "center" || align === "middle" || align == null) {
      if (horizontal) {
        styles.left = "50%";
        transform = "translateX(-50%) rotate(45deg)";
      } else {
        styles.top = "50%";
        transform = "translateY(-50%) rotate(45deg)";
      }
    } else if (align === "start") {
      if (horizontal) styles.left = "1rem";
      else styles.top = "1rem";
    } else if (align === "end") {
      if (horizontal) styles.right = "1rem";
      else styles.bottom = "1rem";
    }

    styles.transform = transform;
    return styles;
  });

  return { class: class_, style: style_ };
}
