import { View } from "@timeless/headless";

export function ScrollArea(props: any, children: any) {
  const { class: cn, ...rest } = props || {};
  return View({
    ...rest,
    class: ["relative overflow-auto", cn].filter(Boolean).join(" "),
    style: [rest.style, "scrollbar-width: thin; scrollbar-color: rgb(161 161 170 / 0.3) transparent;"].filter(Boolean).join(";"),
  }, children);
}
