import { View } from "@timeless/headless";

export function AspectRatio(props, children) {
  const { ratio = 16 / 9, class: cn, ...rest } = props || {};
  return View({
    ...rest,
    class: ["relative w-full", cn].filter(Boolean).join(" "),
    style: `padding-bottom: ${(1 / ratio) * 100}%;${rest.style ? rest.style : ""}`,
  }, [
    View({ class: "absolute inset-0" }, children),
  ]);
}
