import { Section } from "@/components/index.js";

export function GallerySection() {
  const items = [
    { src: "/gallery-landscape.svg", alt: "蓝色山谷", caption: "横图 · 保持原图比例" },
    { src: "/gallery-portrait.svg", alt: "橙色竖幅", caption: "竖图 · 点击缩略图查看大图" },
    { src: "/gallery-missing.jpg", thumbnail: "/gallery-landscape.svg", alt: "加载失败示例", caption: "失败状态 · 可切换其他图片" },
  ];
  const store = new Timeless.vm.GalleryCore({ items, loop: false });
  return Section("Gallery", [
    Timeless.fluent.Gallery({ store, attributes: { n: "gallery-example" } }),
    View({ attributes: { n: "gallery-example-help" }, style: { "margin-top": "12px", "font-size": "13px" } }, ["点击图片预览；方向键切换，Esc 关闭。最后一项演示图片加载失败。"]),
  ]);
}
