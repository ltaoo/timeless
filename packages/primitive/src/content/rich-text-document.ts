import MarkdownIt from "markdown-it";
import { parseFragment, type DefaultTreeAdapterMap } from "parse5";

export type RichTextFormat = "html" | "markdown";
export type RichTextSpan = {
  /** UTF-16 offsets, shared with AppKit and DirectWrite. */
  start: number;
  end: number;
  style: Record<string, string>;
  href?: string;
  image?: { src: string; alt: string; width?: number; height?: number };
};
export type RichTextDocument = {
  text: string;
  spans: RichTextSpan[];
  /** Reading HTML: scripts, event handlers and unsafe URLs are excluded. */
  html: string;
};

type Node = DefaultTreeAdapterMap["childNode"];
const markdown = new MarkdownIt({ html: true, breaks: false });
const blocks = new Set([
  "p",
  "div",
  "section",
  "article",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
  "ul",
  "ol",
  "li",
  "table",
  "tr",
  "hr",
]);
const allowed = new Set([
  ...blocks,
  "span",
  "strong",
  "b",
  "em",
  "i",
  "s",
  "del",
  "u",
  "mark",
  "code",
  "a",
  "br",
  "thead",
  "tbody",
  "th",
  "td",
  "img",
  "sup",
  "sub",
]);
const dropped = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "template",
  "svg",
  "math",
  "input",
  "button",
  "select",
  "textarea",
  "noscript",
]);
const style_keys = new Set([
  "color",
  "background-color",
  "font-weight",
  "font-style",
  "font-family",
  "font-size",
  "text-decoration",
]);

function escape_html(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safe_url(value: string) {
  const normalized = value.replace(/[\u0000-\u0020\u007f]/g, "");
  return /^(?:https?:|mailto:|tel:)/i.test(normalized) ||
    !/^[^/?#]*:/.test(normalized)
    ? value
    : "";
}

/** Parse once in the model; hosts only measure and draw the resulting spans. */
export function parseRichText(
  content: string,
  format: RichTextFormat = "html",
): RichTextDocument {
  const root = parseFragment(
    format === "markdown" ? markdown.render(content) : content,
  );
  const document: RichTextDocument = { text: "", spans: [], html: "" };
  let content_end = 0;
  let marker_end = -1;
  const append = (
    text: string,
    style: Record<string, string> = {},
    href?: string,
    separator = false,
    image?: RichTextSpan["image"],
  ) => {
    if (!text) return;
    const start = document.text.length;
    document.text += text;
    if (!separator) content_end = document.text.length;
    const previous = document.spans[document.spans.length - 1];
    if (
      previous &&
      !image &&
      !previous.image &&
      previous.href === href &&
      JSON.stringify(previous.style) === JSON.stringify(style)
    ) {
      previous.end = document.text.length;
    } else {
      document.spans.push({
        start,
        end: document.text.length,
        style: { ...style },
        ...(href ? { href } : {}),
        ...(image ? { image } : {}),
      });
    }
  };
  const boundary = (lines: number, before = false) => {
    if (!document.text) return;
    if (before && document.text.length === marker_end) return;
    const trailing = document.text.match(/\n*$/)![0].length;
    if (trailing < lines)
      append("\n".repeat(lines - trailing), {}, undefined, true);
  };
  const walk = (
    node: Node,
    inherited: Record<string, string>,
    href?: string,
    pre = false,
    depth = 0,
    list?: { ordered: boolean; next: number; depth: number },
  ): string => {
    if (depth > 64) return "";
    if (node.nodeName === "#text") {
      let text = (node as DefaultTreeAdapterMap["textNode"]).value;
      if (!pre) {
        text = text.replace(/\s+/g, " ");
        if (!document.text || /[\s]$/.test(document.text))
          text = text.replace(/^ /, "");
      }
      append(text, inherited, href);
      return escape_html(text);
    }
    if (!("tagName" in node)) return "";
    const tag = node.tagName;
    const attrs = Object.fromEntries(
      node.attrs.map((attr) => [attr.name, attr.value]),
    );
    if (
      dropped.has(tag) ||
      "hidden" in attrs ||
      attrs["aria-hidden"] === "true" ||
      /display\s*:\s*none/i.test(attrs.style ?? "")
    )
      return "";
    const style = { ...inherited };
    const own: Record<string, string> = {};
    if (["strong", "b", "th"].includes(tag)) own["font-weight"] = "700";
    if (["em", "i"].includes(tag)) own["font-style"] = "italic";
    if (["s", "del"].includes(tag)) own["text-decoration"] = "line-through";
    if (tag === "u") own["text-decoration"] = "underline";
    if (tag === "mark") own["background-color"] = "#fff2a8";
    if (tag === "code" || tag === "pre") {
      own["font-family"] = "monospace";
      own["background-color"] = "#eeeeee";
    }
    if (/^h[1-6]$/.test(tag)) {
      own["font-size"] = `${[2, 1.5, 1.25, 1.1, 1, 1][Number(tag[1]) - 1]}em`;
      own["font-weight"] = "700";
    }
    for (const declaration of (attrs.style ?? "").split(";")) {
      const colon = declaration.indexOf(":");
      if (colon < 0) continue;
      const key = declaration.slice(0, colon).trim().toLowerCase();
      const value = declaration.slice(colon + 1).trim();
      if (
        style_keys.has(key) &&
        value &&
        !/[<>\\]|url\s*\(|expression\s*\(|[\u0000-\u001f]/i.test(value)
      )
        own[key] = value;
    }
    const link = tag === "a" ? safe_url(attrs.href ?? "") || undefined : href;
    if (tag === "a" && link) {
      own.color ??= "#2563eb";
      own["text-decoration"] = "underline";
    }
    if (own["text-decoration"] && inherited["text-decoration"]) {
      own["text-decoration"] = [
        ...new Set(
          `${inherited["text-decoration"]} ${own["text-decoration"]}`
            .split(" ")
            .filter((value) => value !== "none"),
        ),
      ].join(" ");
    }
    Object.assign(style, own);
    if (blocks.has(tag)) boundary(tag === "li" || tag === "tr" ? 1 : 2, true);
    if (tag === "li") {
      append(
        "  ".repeat(Math.max(0, (list?.depth ?? 1) - 1)) +
          (list?.ordered ? `${list.next++}. ` : "• "),
        inherited,
      );
      marker_end = document.text.length;
    }
    if (tag === "blockquote") {
      append("│ ", inherited);
      marker_end = document.text.length;
    }
    if (tag === "br") append("\n", style, link);
    if (tag === "hr") append("────────", style);
    const image_src = tag === "img" ? safe_url(attrs.src ?? "") : "";
    const image_size: { width?: number; height?: number } = {};
    if (tag === "img") {
      for (const key of ["width", "height"] as const) {
        const value = Number(attrs[key]);
        if (Number.isFinite(value) && value > 0) image_size[key] = value;
      }
      // Hosts without image attachments retain the alternative text.
      append(
        attrs.alt || (image_src ? "\uFFFC" : ""),
        style,
        link,
        false,
        image_src
          ? { src: image_src, alt: attrs.alt ?? "", ...image_size }
          : undefined,
      );
    }
    const child_list =
      tag === "ul" || tag === "ol"
        ? {
            ordered: tag === "ol",
            next: Number.parseInt(attrs.start ?? "1", 10) || 1,
            depth: (list?.depth ?? 0) + 1,
          }
        : list;
    const children = node.childNodes
      .map((child) =>
        walk(child, style, link, pre || tag === "pre", depth + 1, child_list),
      )
      .join("");
    // shortcut: native/canvas tables retain tab-separated cells; add block layout for table geometry.
    if (tag === "td" || tag === "th") append("\t", {}, undefined, true);
    if (blocks.has(tag)) boundary(tag === "li" || tag === "tr" ? 1 : 2);
    if (!allowed.has(tag)) return children;
    let attributes = ` data-n="rich-text-${tag}"`;
    for (const name of ["class", "id", "title"]) {
      if (attrs[name]) attributes += ` ${name}="${escape_html(attrs[name])}"`;
    }
    if (Object.keys(own).length)
      attributes += ` style="${escape_html(
        Object.entries(own)
          .map(([key, value]) => `${key}:${value}`)
          .join(";"),
      )}"`;
    if (tag === "a" && link) attributes += ` href="${escape_html(link)}"`;
    if (tag === "ol" && attrs.start)
      attributes += ` start="${escape_html(attrs.start)}"`;
    if (tag === "img") {
      for (const [key, value] of Object.entries(image_size))
        attributes += ` ${key}="${value}"`;
      return image_src
        ? `<img${attributes} src="${escape_html(image_src)}" alt="${escape_html(attrs.alt ?? "")}">`
        : escape_html(attrs.alt ?? "");
    }
    return tag === "br" || tag === "hr"
      ? `<${tag}${attributes}>`
      : `<${tag}${attributes}>${children}</${tag}>`;
  };
  document.html = root.childNodes.map((node) => walk(node, {})).join("");
  document.text = document.text.slice(0, content_end);
  document.spans = document.spans
    .filter((span) => span.start < document.text.length)
    .map((span) => ({
      ...span,
      end: Math.min(span.end, document.text.length),
    }));
  return document;
}
