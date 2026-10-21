import type { RichTextDocument } from "@timeless/timeless";

export type RichTextFragment = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  font: string;
  color: string;
  background?: string;
  decoration: string;
  href?: string;
};

/** Keep measurement, painting and link hit testing on the same line boxes. */
export function layoutRichText(
  document: RichTextDocument,
  width: number,
  base: Record<string, string>,
  ctx: CanvasRenderingContext2D,
) {
  const fragments: RichTextFragment[] = [];
  let x = 0,
    y = 0,
    line_height = 0,
    max_width = 0,
    line_start = 0;
  const base_size = Number.parseFloat(base["font-size"]) || 14;
  const flush = () => {
    const height = line_height || base_size * 1.5;
    for (let i = line_start; i < fragments.length; i++) {
      fragments[i].y = y + height - fragments[i].height;
      const align = base["text-align"];
      if (align === "center") fragments[i].x += Math.max(0, (width - x) / 2);
      if (align === "right") fragments[i].x += Math.max(0, width - x);
    }
    max_width = Math.max(max_width, x);
    y += height;
    x = 0;
    line_height = 0;
    line_start = fragments.length;
  };
  ctx.save();
  try {
    for (const span of document.spans) {
      const style = { ...base, ...span.style };
      const size_value = Number.parseFloat(style["font-size"]) || base_size;
      const size = Math.min(
        512,
        Math.max(
          1,
          style["font-size"]?.endsWith("em")
            ? size_value * base_size
            : size_value,
        ),
      );
      const font = `${style["font-style"] ?? "normal"} ${style["font-weight"] ?? "400"} ${size}px ${style["font-family"] ?? "sans-serif"}`;
      ctx.font = font;
      const height = Math.max(
        size * 1.5,
        Number.parseFloat(base["line-height"]) || 0,
      );
      const push = (text: string) => {
        const measured = ctx.measureText(text).width;
        fragments.push({
          text,
          x,
          y,
          width: measured,
          height,
          font,
          color: style.color ?? "#202938",
          background: style["background-color"],
          decoration: style["text-decoration"] ?? "",
          href: span.href,
        });
        x += measured;
        line_height = Math.max(line_height, height);
      };
      for (const word of document.text
        .slice(span.start, span.end)
        .replace(/\t/g, "    ")
        .match(/\n|[^\S\n]+|[^\s]+/gu) ?? []) {
        if (word === "\n") {
          flush();
          continue;
        }
        const measured = ctx.measureText(word).width;
        if (x > 0 && x + measured > width) flush();
        if (measured <= width || /^\s+$/.test(word)) {
          push(word);
          continue;
        }
        // Graphemes keep emoji sequences and combining marks together on narrow lines.
        const segmenter = new Intl.Segmenter(undefined, {
          granularity: "grapheme",
        });
        let part = "";
        for (const { segment } of segmenter.segment(word)) {
          if (part && x + ctx.measureText(part + segment).width > width) {
            push(part);
            flush();
            part = "";
          }
          part += segment;
        }
        if (part) push(part);
      }
    }
    if (line_start < fragments.length || line_height) flush();
    return { fragments, width: max_width, height: y };
  } finally {
    ctx.restore();
  }
}
