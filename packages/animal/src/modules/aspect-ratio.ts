import { View, ViewChildren, ViewProps, classNames } from "@timeless/timeless";

export function AspectRatio(
  props: ViewProps & { ratio?: number } = {},
  children?: ViewChildren,
) {
  const { ratio = 16 / 9, class: cls, style, ...rest } = props;
  // style 必须是对象：primitive 的 subscribe_props 用 Object.keys(style) 逐项订阅，
  // 传字符串会按字符下标展开成垃圾样式。
  return View(
    {
      ...rest,
      class: classNames(["animal-ratio", cls]),
      style: {
        "padding-bottom": `${(1 / ratio) * 100}%`,
        ...(typeof style === "object" && style ? style : {}),
      },
    },
    [View({ class: "animal-ratio__inner" }, children)],
  );
}
