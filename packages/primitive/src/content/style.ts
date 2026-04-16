/**
 * NativeStyle - A wrapper for rendering native HTML style elements.
 *
 * NativeStyle renders a <style> element with CSS content.
 * It wraps the View component with "style" as the element type.
 *
 * @example
 * ```tsx
 * <NativeStyle>
 *   {`body { margin: 0 }`}
 * </NativeStyle>
 * ```
 */
import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";

/** Props for NativeStyle - same as ViewProps but without 'as' */
export interface NativeStyleProps extends Omit<ViewProps, "as"> {}

/**
 * Creates a native HTML style element.
 *
 * @param props - Style element props
 * @param children - CSS content (string or CSS text elements)
 * @returns A TimelessElement representing a style element
 */
export function NativeStyle(
  props: NativeStyleProps = {},
  children?: ViewChildren,
) {
  return View({ ...props, as: "style" }, children);
}
