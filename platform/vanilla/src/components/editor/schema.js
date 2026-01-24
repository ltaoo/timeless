// import { Schema } from "https://esm.sh/prosemirror-model";
// import { schema as baseschema } from "https://esm.sh/prosemirror-schema-basic";
// import {
//   addListNodes,
//   splitListItem,
//   sinkListItem,
//   liftListItem,
// } from "https://esm.sh/prosemirror-schema-list";

import { loadHighlightJs } from "./highlight.js";

/** @type {ProsemirrorMod.NodeSpec} */
const node_file_link = {
  inline: true,
  atom: true,
  attrs: {
    app: { default: "trae" },
    absolutePath: { default: "" },
    lineNumber: { default: 1 },
    columnNumber: { default: 1 },
    displayName: { default: "" },
  },
  group: "inline",
  selectable: true,
  draggable: true,
  parseDOM: [
    {
      tag: "span.file-link",
      getAttrs(dom) {
        return {
          app: dom.getAttribute("data-app") || "cursor",
          absolutePath: dom.getAttribute("data-path") || "",
          lineNumber: parseInt(dom.getAttribute("data-line") || "1", 10),
          columnNumber: parseInt(dom.getAttribute("data-column") || "1", 10),
          displayName: dom.getAttribute("data-name") || "",
        };
      },
    },
  ],
  toDOM(node) {
    return [
      "span",
      {
        class: "file-link",
        "data-app": node.attrs.app,
        "data-path": node.attrs.absolutePath,
        "data-line": node.attrs.lineNumber,
        "data-column": node.attrs.columnNumber,
        "data-name": node.attrs.displayName,
      },
      [
        "span",
        { class: "file-link-icon" },
        node.attrs.app === "cursor"
          ? "🔵"
          : node.attrs.app === "trae"
            ? "◆"
            : "🟢",
      ],
      [
        "span",
        { class: "file-link-name" },
        node.attrs.displayName ||
        node.attrs.absolutePath.split("/").pop() ||
        "文件",
      ],
    ];
  },
};

/** @type {ProsemirrorMod.NodeSpec} */
const node_link_card = {
  group: "inline",
  inline: true,
  atom: true,
  draggable: true,
  attrs: {
    href: { default: "" },
    text: { default: "" },
    title: { default: null },
  },
  parseDOM: [
    {
      tag: "span[data-type='link-card']",
      getAttrs(dom) {
        return {
          href: dom.getAttribute("data-href"),
          text: dom.getAttribute("data-text") || dom.textContent,
          title: dom.getAttribute("title"),
        };
      },
    },
  ],
  toDOM(node) {
    return [
      "span",
      {
        "data-type": "link-card",
        "data-href": node.attrs.href,
        "data-text": node.attrs.text,
        title: node.attrs.title,
        class: "link-card-node",
        contentEditable: "false",
      },
      node.attrs.text,
    ];
  },
};

/** @type {ProsemirrorMod.NodeSpec} */
const node_list_item = {
  content: "block+",
  parseDOM: [{ tag: "li" }],
  toDOM() {
    return ["li", 0];
  },
};

/** @type {ProsemirrorMod.NodeSpec} */
const node_blockquote = {
  content: "block+",
  group: "block",
  defining: true,
  parseDOM: [{ tag: "blockquote" }],
  toDOM() {
    return ["blockquote", 0];
  },
};

/** @type {ProsemirrorMod.NodeSpec} */
const node_todo_list = {
  content: "todo_item+",
  group: "block",
  parseDOM: [{ tag: "todo-list" }],
  toDOM() {
    return ["todo-list", 0];
  },
};

/** @type {ProsemirrorMod.NodeSpec} */
const node_todo_item = {
  attrs: { checked: { default: false } },
  content: "inline*",
  group: "block",
  parseDOM: [
    {
      tag: "todo-item",
      getAttrs(dom) {
        return {
          checked:
            dom.hasAttribute("data-checked") &&
            dom.getAttribute("data-checked") === "true",
        };
      },
    },
  ],
  toDOM(node) {
    return [
      "todo-item",
      {
        "data-checked": node.attrs.checked ? "true" : null,
      },
      [
        "span",
        { class: "todo-checkbox-wrapper", contentEditable: "false" },
        [
          "input",
          {
            type: "checkbox",
            class: "todo-checkbox",
            tabindex: "-1",
            "data-clickable": "true",
            checked: node.attrs.checked ? "checked" : null,
          },
        ],
      ],
      ["span", { class: "todo-content" }, 0],
    ];
  },
};

/** @type {ProsemirrorMod.NodeSpec} */
const node_image = {
  inline: false,
  group: "block",
  content: "inline*",
  draggable: true,
  selectable: true,
  attrs: {
    src: {},
    alt: { default: null },
    title: { default: null },
  },
  parseDOM: [
    {
      tag: "div.image-node",
      getAttrs(dom) {
        const img = dom.querySelector("img");
        return {
          src: img ? img.getAttribute("src") : null,
          alt: img ? img.getAttribute("alt") : null,
          title: img ? img.getAttribute("title") : null,
        };
      },
    },
    {
      tag: "figure.image-wrapper",
      getAttrs(dom) {
        const img = dom.querySelector("img");
        return {
          src: img ? img.getAttribute("src") : null,
          alt: img ? img.getAttribute("alt") : null,
          title: img ? img.getAttribute("title") : null,
        };
      },
    },
    {
      tag: "img[src]",
      getAttrs(dom) {
        return {
          src: dom.getAttribute("src"),
          title: dom.getAttribute("title"),
          alt: dom.getAttribute("alt"),
        };
      },
    },
  ],
  toDOM(node) {
    return [
      "div",
      { class: "image-node" },
      [
        "img",
        {
          src: node.attrs.src,
          alt: node.attrs.alt,
          title: node.attrs.title,
          contenteditable: "false",
          draggable: "false",
        },
      ],
      ["div", { class: "image-caption" }, 0],
    ];
  },
};

/** @type {ProsemirrorMod.NodeSpec} */
const node_code_block = {
  attrs: {
    language: { default: "" },
    showLineNumbers: { default: true },
  },
  content: "text*",
  marks: "",
  group: "block",
  code: true,
  defining: true,
  parseDOM: [
    {
      tag: "pre.code-block",
      preserveWhitespace: "full",
      getAttrs(dom) {
        return {
          language: dom.getAttribute("data-language") || "",
          // showLineNumbers: dom.getAttribute("data-line-numbers") !== "false",
        };
      },
    },
  ],
  toDOM(node) {
    const language = node.attrs.language || "text";

    // Header with language and copy button
    const header = [
      "div",
      { class: "code-block-header", contenteditable: "false" },
      [
        "div",
        { class: "code-block-info" },
        ["span", { class: "code-language" }, language],
      ],
      [
        "div",
        { class: "code-block-actions" },
        [
          "button",
          {
            class: "code-action-btn",
            "data-action": "copy",
            title: "复制代码",
          },
          "📋",
        ],
        [
          "button",
          {
            class: "code-action-btn",
            "data-action": "toggle-lines",
            title: "切换行号",
          },
          "#",
        ],
      ],
    ];

    // Line numbers (if enabled)
    const lines = (node.textContent || "").split("\n");
    // const lineNumbers = node.attrs.showLineNumbers
    //   ? [
    //       "div",
    //       {
    //         class: "code-line-numbers",
    //         contenteditable: "false",
    //         "aria-hidden": "true",
    //       },
    //       ["pre", {}, lines.map((_, i) => i + 1).join("\n")],
    //     ]
    //   : null;

    // Code content area
    const codeContent = [
      "div",
      { class: "code-highlight" },
      ["code", { class: `hljs language-${language}` }, 0],
    ];

    // Wrapper for line numbers + code
    // const wrapperChildren = [lineNumbers, codeContent].filter(Boolean);
    const wrapperChildren = [codeContent].filter(Boolean);
    const wrapper = ["div", { class: "code-wrapper" }, ...wrapperChildren];

    const content = ["div", { class: "code-block-content" }, wrapper];

    return [
      "pre",
      {
        class: "code-block",
        "data-language": language,
        // "data-line-numbers": node.attrs.showLineNumbers,
      },
      header,
      content,
    ];
  },
};

/** @type {ProsemirrorMod.NodeSpec} */
const node_horizontal_line = {
  group: "block",
  selectable: false,
  parseDOM: [{ tag: "hr" }],
  toDOM() {
    return ["hr", { contentEditable: "false" }];
  },
};

/** @type {ProsemirrorMod.MarkSpec} */
const mark_link = {
  attrs: {
    href: { default: "" },
    title: { default: null },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: "a[href]",
      getAttrs(dom) {
        return {
          href: dom.getAttribute("href"),
          title: dom.getAttribute("title"),
        };
      },
    },
  ],
  toDOM(node) {
    const attrs = { href: node.attrs.href, title: node.attrs.title };
    return ["a", attrs, 0];
  },
};

/** @type {ProsemirrorMod.MarkSpec} */
const mark_code = {
  inclusive: false,
  parseDOM: [{ tag: "code" }],
  toDOM() {
    return ["code", 0];
  },
};

/** @type {ProsemirrorMod.MarkSpec} */
const mark_tag = {
  attrs: {
    tagName: { default: "" },
  },
  inclusive: true,
  parseDOM: [
    {
      tag: "span.tag",
      getAttrs(dom) {
        return { tagName: dom.getAttribute("data-tag-name") || "" };
      },
    },
  ],
  toDOM(node) {
    return ["span", { class: "tag", "data-tag-name": node.attrs.tagName }, 0];
  },
};

/** @type {ProsemirrorMod.MarkSpec} */
const mark_highlight = {
  attrs: {
    color: { default: "#fef08a" },
  },
  inclusive: true,
  parseDOM: [
    {
      tag: "span.highlight",
      getAttrs(dom) {
        return {
          color: dom.getAttribute("data-highlight-color") || "#fef08a",
        };
      },
    },
  ],
  toDOM(node) {
    return [
      "span",
      { class: "highlight", "data-highlight-color": node.attrs.color },
      0,
    ];
  },
};

/** @type {ProsemirrorMod.MarkSpec} */
const mark_comment = {
  attrs: {
    commentId: { default: "" },
    author: { default: "" },
    content: { default: "" },
    timestamp: { default: "" },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: "span.comment",
      getAttrs(dom) {
        return {
          commentId: dom.getAttribute("data-comment-id") || "",
          author: dom.getAttribute("data-comment-author") || "",
          content: dom.getAttribute("data-comment-content") || "",
          timestamp: dom.getAttribute("data-comment-timestamp") || "",
        };
      },
    },
  ],
  toDOM(node) {
    return [
      "span",
      {
        class: "comment",
        "data-comment-id": node.attrs.commentId,
        "data-comment-author": node.attrs.author,
        "data-comment-content": node.attrs.content,
        "data-comment-timestamp": node.attrs.timestamp,
      },
      0,
    ];
  },
};

/** @type {ProsemirrorMod.NodeSpec} */
const node_table = {
  content: "table_row+",
  tableRole: "table",
  isolating: true,
  group: "block",
  parseDOM: [{ tag: "table" }],
  toDOM() {
    return ["table", ["tbody", 0]];
  },
};

/** @type {ProsemirrorMod.NodeSpec} */
const node_table_row = {
  content: "(table_cell | table_header)*",
  tableRole: "row",
  parseDOM: [{ tag: "tr" }],
  toDOM() {
    return ["tr", 0];
  },
};

/** @type {ProsemirrorMod.NodeSpec} */
const node_table_cell = {
  content: "block+",
  attrs: {
    colspan: { default: 1 },
    rowspan: { default: 1 },
    colwidth: { default: null },
    background: { default: null },
  },
  tableRole: "cell",
  isolating: true,
  parseDOM: [
    {
      tag: "td",
      getAttrs(dom) {
        return {
          colspan: Number(dom.getAttribute("colspan") || 1),
          rowspan: Number(dom.getAttribute("rowspan") || 1),
          colwidth: dom.getAttribute("data-colwidth")
            ? dom.getAttribute("data-colwidth").split(",").map(Number)
            : null,
          background: dom.style.backgroundColor || null,
        };
      },
    },
  ],
  toDOM(node) {
    let attrs = {};
    if (node.attrs.colspan != 1) attrs.colspan = node.attrs.colspan;
    if (node.attrs.rowspan != 1) attrs.rowspan = node.attrs.rowspan;
    if (node.attrs.colwidth)
      attrs["data-colwidth"] = node.attrs.colwidth.join(",");
    if (node.attrs.background)
      attrs.style = `background-color: ${node.attrs.background}`;
    return ["td", attrs, 0];
  },
};

/** @type {ProsemirrorMod.NodeSpec} */
const node_table_header = {
  content: "block+",
  attrs: {
    colspan: { default: 1 },
    rowspan: { default: 1 },
    colwidth: { default: null },
    background: { default: null },
  },
  tableRole: "header_cell",
  isolating: true,
  parseDOM: [
    {
      tag: "th",
      getAttrs(dom) {
        return {
          colspan: Number(dom.getAttribute("colspan") || 1),
          rowspan: Number(dom.getAttribute("rowspan") || 1),
          colwidth: dom.getAttribute("data-colwidth")
            ? dom.getAttribute("data-colwidth").split(",").map(Number)
            : null,
          background: dom.style.backgroundColor || null,
        };
      },
    },
  ],
  toDOM(node) {
    let attrs = {};
    if (node.attrs.colspan != 1) attrs.colspan = node.attrs.colspan;
    if (node.attrs.rowspan != 1) attrs.rowspan = node.attrs.rowspan;
    if (node.attrs.colwidth)
      attrs["data-colwidth"] = node.attrs.colwidth.join(",");
    if (node.attrs.background)
      attrs.style = `background-color: ${node.attrs.background}`;
    return ["th", attrs, 0];
  },
};

/** @type {ProsemirrorMod.MarkSpec} */
const mark_underline = {
  parseDOM: [
    { tag: "u" },
    {
      style: "text-decoration",
      getAttrs: (value) => (value.includes("underline") ? {} : false),
    },
  ],
  toDOM() {
    return ["u", 0];
  },
};

/** @type {ProsemirrorMod.MarkSpec} */
const mark_strikethrough = {
  parseDOM: [
    { tag: "s" },
    { tag: "del" },
    { tag: "strike" },
    {
      style: "text-decoration",
      getAttrs: (value) => (value.includes("line-through") ? {} : false),
    },
  ],
  toDOM() {
    return ["s", 0];
  },
};

export const editor_schema = new ProsemirrorMod.Schema({
  nodes: ProsemirrorMod.addListNodes(
    ProsemirrorMod.schema.spec.nodes,
    "paragraph block*",
    "block",
  ).append({
    file_link: node_file_link,
    link_card: node_link_card,
    list_item: node_list_item,
    blockquote: node_blockquote,
    todo_list: node_todo_list,
    todo_item: node_todo_item,
    code_block: node_code_block,
    horizontal_rule: node_horizontal_line,
    image: node_image,
    table: node_table,
    table_row: node_table_row,
    table_cell: node_table_cell,
    table_header: node_table_header,
  }),
  marks: ProsemirrorMod.schema.spec.marks.append({
    link: mark_link,
    code: mark_code,
    tag: mark_tag,
    highlight: mark_highlight,
    comment: mark_comment,
    underline: mark_underline,
    strikethrough: mark_strikethrough,
  }),
});

loadHighlightJs();
