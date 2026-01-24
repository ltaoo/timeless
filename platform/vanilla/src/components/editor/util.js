// import { TextSelection } from "https://esm.sh/prosemirror-state";

import { editor_schema } from "./schema.js";

export function proseMirrorToSlateJSON(doc) {
  const result = [];

  doc.descendants((node) => {
    if (node.isBlock) {
      if (node.type.name === "paragraph" || node.type.name === "blockquote") {
        const blockNode = {
          type: node.type.name,
          children: [],
        };

        node.descendants((child) => {
          if (child.isText) {
            let textNode = {
              text: child.text,
            };

            if (child.marks.length > 0) {
              textNode.strong = child.marks.some(
                (mark) => mark.type.name === "strong",
              );
              textNode.emphasis = child.marks.some(
                (mark) => mark.type.name === "em",
              );
              textNode.code = child.marks.some(
                (mark) => mark.type.name === "code",
              );
              const tagMark = child.marks.find(
                (mark) => mark.type.name === "tag",
              );
              if (tagMark) {
                textNode.tag = tagMark.attrs.tagName;
              }
            }

            blockNode.children.push(textNode);
          } else if (child.type.name === "file_link") {
            const fileLinkNode = {
              type: "file_link",
              app: child.attrs.app,
              absolutePath: child.attrs.absolutePath,
              lineNumber: child.attrs.lineNumber,
              columnNumber: child.attrs.columnNumber,
              displayName: child.attrs.displayName,
              children: [{ text: "" }],
            };
            blockNode.children.push(fileLinkNode);
          } else if (child.isBlock) {
            const childNode = {
              type: child.type.name,
              children: [],
            };

            child.descendants((textChild) => {
              if (textChild.isText) {
                let textNode = { text: textChild.text };

                if (textChild.marks.length > 0) {
                  textNode.strong = textChild.marks.some(
                    (mark) => mark.type.name === "strong",
                  );
                  textNode.emphasis = textChild.marks.some(
                    (mark) => mark.type.name === "em",
                  );
                  textNode.code = textChild.marks.some(
                    (mark) => mark.type.name === "code",
                  );
                  const tagMark = textChild.marks.find(
                    (mark) => mark.type.name === "tag",
                  );
                  if (tagMark) {
                    textNode.tag = tagMark.attrs.tagName;
                  }
                }

                childNode.children.push(textNode);
              }
            });

            blockNode.children.push(childNode);
          }
        });

        result.push(blockNode);
      } else if (node.type.name === "todo_item") {
        const todoNode = {
          type: "todo_item",
          checked: node.attrs.checked,
          children: [],
        };

        node.descendants((child) => {
          if (child.isText) {
            let textNode = { text: child.text };

            if (child.marks.length > 0) {
              textNode.strong = child.marks.some(
                (mark) => mark.type.name === "strong",
              );
              textNode.emphasis = child.marks.some(
                (mark) => mark.type.name === "em",
              );
              textNode.code = child.marks.some(
                (mark) => mark.type.name === "code",
              );
              const tagMark = child.marks.find(
                (mark) => mark.type.name === "tag",
              );
              if (tagMark) {
                textNode.tag = tagMark.attrs.tagName;
              }
            }

            todoNode.children.push(textNode);
          }
        });

        result.push(todoNode);
      } else if (node.type.name === "image") {
        const imageNode = {
          type: "image",
          src: node.attrs.src,
          alt: node.attrs.alt,
          title: node.attrs.title,
          description: node.textContent,
          children: [{ text: "" }],
        };
        result.push(imageNode);
        return false;
      }
    }
  });

  return result;
}

export function getMarksAtCursor(state) {
  const { $from } = state.selection;
  return $from.marks();
}

export function hasMark(state, markTypeName) {
  const marks = getMarksAtCursor(state);
  return marks.some((mark) => mark.type.name === markTypeName);
}
export function isInNode(state, nodeTypeName) {
  const { $from } = state.selection;
  return $from.parent.type.name === nodeTypeName;
}

export function isInBlockquote(state) {
  return isInNode(state, "blockquote");
}

export function isInCodeBlock(state) {
  return isInNode(state, "code_block");
}
export function getSelectedText(state) {
  const { $from, $to } = state.selection;
  return state.doc.textBetween($from.pos, $to.pos);
}

export function isSelectionEmpty(state) {
  return state.selection.empty;
}

export function isCursorSelection(state) {
  return (
    state.selection instanceof ProsemirrorMod.TextSelection &&
    state.selection.empty
  );
}

export function getAncestorChain(state) {
  const { $from } = state.selection;
  const chain = [];

  for (let depth = 0; depth <= $from.depth; depth++) {
    chain.push({
      node: $from.node(depth),
      depth,
      index: $from.index(depth),
      start: $from.start(depth),
      end: $from.end(depth),
    });
  }

  return chain;
}

/**
 *
 * @param {*} state
 * @returns
 */
export function getParentNodeInfo(state) {
  const { $from } = state.selection;
  if ($from.depth < 1) return null;
  const depth = $from.depth - 1;
  return {
    node: $from.node(depth),
    depth,
    index: $from.index(depth),
    start: $from.start(depth),
    end: $from.end(depth),
  };
}

export function getOffsetInCurrentLine(state) {
  const { $from } = state.selection;
  return $from.pos - $from.start();
}

export function getLineInfo(state) {
  const { $from, $to } = state.selection;
  const doc = state.doc;

  let lineStart = 0;
  let lineNumber = 1;

  for (let pos = 0; pos < $from.pos; pos++) {
    const char = doc.textBetween(pos, pos + 1);
    if (char === "\n") {
      lineNumber++;
      lineStart = pos + 1;
    }
  }

  const lineEnd = $from.end();
  const totalLines = lineNumber;

  for (let pos = lineEnd; pos < doc.content.size; pos++) {
    const char = doc.textBetween(pos, pos + 1);
    if (char === "\n") {
      break;
    }
  }

  return {
    lineNumber,
    totalLines,
    lineStart,
    lineEnd,
    offsetInLine: $from.pos - lineStart,
  };
}

export function getCharsBeforeCursor(state, n) {
  const { $from } = state.selection;
  const start = Math.max(0, $from.pos - n);
  return state.doc.textBetween(start, $from.pos);
}

export function getCharsAfterCursor(state, n) {
  const { $from } = state.selection;
  const end = Math.min($from.pos + n, $from.doc.content.size);
  return state.doc.textBetween($from.pos, end);
}

// 获取当前节点内的文本（在节点开始和光标之间）
export function getTextInCurrentBlockBeforeCursor(state) {
  const { $from } = state.selection;
  const blockStart = $from.start(); // 当前块级节点开始位置
  return state.doc.textBetween(blockStart, $from.pos);
}

// 获取当前节点内前 n 个字符
export function getCharsBeforeCursorInCurrentBlock(state, n) {
  const { $from } = state.selection;
  const blockStart = $from.start();
  const cursorPos = $from.pos;
  const start = Math.max(blockStart, cursorPos - n);
  return state.doc.textBetween(start, cursorPos);
}

export function getCurrentBlockText(state) {
  const { $from, $to } = state.selection;
  // 获取从段落起点到终点的文本
  const from = $from.start();
  const to = $from.end();
  return state.doc.textBetween(from, to);
}

export function getLineTextBeforeCursor(state, chars) {
  const { $from } = state.selection;
  const lineStart = $from.start();
  const cursorPos = $from.pos;
  const textBefore = state.doc.textBetween(lineStart, cursorPos);

  if (chars !== undefined) {
    return textBefore.slice(-chars);
  }
  return textBefore;
}

export function getCurrentBlock(state) {
  const { $from } = state.selection;
  // 向上查找直到找到一个块级节点
  for (let depth = $from.depth; depth >= 0; depth--) {
    const node = $from.node(depth);
    if (node.isBlock) {
      return node;
    }
  }
  return null;
}

export function getCurrentBlockType(state) {
  return getCurrentBlock(state)?.type.name || null;
}

// 将当前段落替换为 code_block
export function replaceWithCodeBlock(state, dispatch, options = null) {
  const { $from, $to } = state.selection;
  const from = options?.from ?? $from.start();
  const to = options?.to ?? $to.end();
  const language = options?.language ?? "";
  const collapsed = options?.collapsed ?? false;
  const showLineNumbers = options?.showLineNumbers ?? true;

  if (dispatch) {
    const tr = state.tr;
    const codeBlockNode = editor_schema.nodes.code_block.create({
      language,
      collapsed,
      showLineNumbers,
    });
    tr.replaceRangeWith(from, to, codeBlockNode);
    const caretPos = from + 1;
    tr.setSelection(ProsemirrorMod.TextSelection.create(tr.doc, caretPos));
    dispatch(tr);
  }
  return true;
}
