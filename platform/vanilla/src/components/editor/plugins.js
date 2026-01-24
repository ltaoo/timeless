// import { TextSelection } from "https://esm.sh/prosemirror-state";
// import {
//   addListNodes,
//   splitListItem,
//   sinkListItem,
//   liftListItem,
// } from "https://esm.sh/prosemirror-schema-list";
// import {
//   baseKeymap,
//   toggleMark,
//   setBlockType,
//   wrapIn,
//   lift,
// } from "https://esm.sh/prosemirror-commands";
// import { keymap } from "https://esm.sh/prosemirror-keymap";
// import { history, redo, undo } from "https://esm.sh/prosemirror-history";

import { editor_schema } from "./schema.js";
import { markdownInputRules } from "./rules.js";
import { syntaxHighlightPlugin } from "./syntax-highlight-plugin.js";
import {
  getCharsBeforeCursor,
  getLineInfo,
  getCurrentBlock,
  isInNode,
  replaceWithCodeBlock,
  getCharsBeforeCursorInCurrentBlock,
  getTextInCurrentBlockBeforeCursor,
} from "./util.js";

const TAG_STATE_KEY = "inputTag";

function getTagState(state) {
  return tagInputPlugin.getState(state);
}

function setTagState(tr, state) {
  tr.setMeta(TAG_STATE_KEY, state);
}

const tagInputPlugin = new ProsemirrorMod.Plugin({
  key: new ProsemirrorMod.PluginKey("genericTagsPlugin"),
  state: {
    init() {
      console.log("[tagPlugin] init");
      return null;
    },
    apply(tr, value) {
      const meta = tr.getMeta(TAG_STATE_KEY);
      if (meta !== undefined) {
        console.log("[tagPlugin] apply meta:", meta);
        return meta;
      }
      return value;
    },
  },
  props: {
    handleTextInput(view, from, to, text) {
      const { state, dispatch } = view;
      const currentTag = getTagState(state);

      if (!currentTag) {
        if (text !== " " && text !== "#") {
          // Check if previous char is # and valid start
          if (from > 0) {
            const before = state.doc.textBetween(from - 1, from);
            if (before === "#") {
              const $position = state.doc.resolve(from);
              const blockStart = $position.start();
              const posOfHash = from - 1;
              let validHash = false;
              if (posOfHash === blockStart) {
                validHash = true;
              } else {
                const charBeforeHash = state.doc.textBetween(
                  posOfHash - 1,
                  posOfHash,
                );
                if (/\s/.test(charBeforeHash)) {
                  validHash = true;
                }
              }

              if (validHash) {
                const tr = state.tr;
                tr.insertText(text, from, to);
                const tagName = text;
                const tagMark = editor_schema.marks.tag.create({ tagName });
                const start = posOfHash;
                const end = from + text.length;
                tr.addMark(start, end, tagMark);
                setTagState(tr, { start: start });
                dispatch(tr);
                return true;
              }
            }
          }
        }
        return false;
      }

      if (text === " ") {
        const tr = state.tr;
        const tagStart = currentTag.start;
        const tagEnd = from;
        const tagContent = state.doc.textBetween(tagStart, tagEnd);
        const tagName = tagContent.replace(/^#/, "");
        if (tagName) {
          const tagMark = editor_schema.marks.tag.create({ tagName });
          tr.removeMark(tagStart, tagEnd, editor_schema.marks.tag);
          tr.addMark(tagStart, tagEnd, tagMark);
        }
        setTagState(tr, null);
        tr.removeStoredMark(editor_schema.marks.tag);
        tr.insertText(text, from, from);
        dispatch(tr);
        return true;
      }
      {
        const tr = state.tr;
        const tagStart = currentTag.start;
        const newEnd = from + text.length;
        const tagContentBefore = state.doc.textBetween(tagStart, from);
        const newTagContent = tagContentBefore + text;
        const tagName = newTagContent.replace(/^#/, "");
        tr.insertText(text, from, to);
        tr.removeMark(tagStart, from, editor_schema.marks.tag);
        if (tagName) {
          const tagMark = editor_schema.marks.tag.create({ tagName });
          tr.addMark(tagStart, newEnd, tagMark);
        }
        dispatch(tr);
        return true;
      }
    },
    handleDOMEvents: {
      compositionend(view) {
        const { state, dispatch } = view;
        const currentTag = getTagState(state);

        if (!currentTag) {
          const { selection } = state;
          const { $from } = selection;
          const from = $from.pos;
          const blockStart = $from.start();
          let pos = from;
          let textAfterHash = "";
          let foundHash = false;
          let hashPos = -1;

          while (pos > blockStart) {
            const char = state.doc.textBetween(pos - 1, pos);
            if (char === " ") {
              break;
            }
            if (char === "#") {
              let validStart = false;
              if (pos - 1 === blockStart) {
                validStart = true;
              } else {
                const charBefore = state.doc.textBetween(pos - 2, pos - 1);
                if (/\s/.test(charBefore)) {
                  validStart = true;
                }
              }

              if (validStart) {
                if (textAfterHash.length > 0 && textAfterHash[0] !== "#") {
                  foundHash = true;
                  hashPos = pos - 1;
                }
              }
              break;
            }
            textAfterHash = char + textAfterHash;
            pos--;
          }

          if (foundHash) {
            const tr = state.tr;
            const tagName = textAfterHash;
            const tagMark = editor_schema.marks.tag.create({ tagName });
            tr.addMark(hashPos, from, tagMark);
            setTagState(tr, { start: hashPos });
            dispatch(tr);
            return false;
          }
          return false;
        }

        const tagStart = currentTag.start;
        const { from } = state.selection;
        if (from <= tagStart) {
          return false;
        }
        const tr = state.tr;
        const tagText = state.doc.textBetween(tagStart, from);
        const tagName = tagText.replace(/^#/, "");
        tr.removeMark(tagStart, from, editor_schema.marks.tag);
        const tagMark = editor_schema.marks.tag.create({ tagName });
        tr.addMark(tagStart, from, tagMark);
        dispatch(tr);
        return false;
      },
    },
  },
});

const urlPastePlugin = new ProsemirrorMod.Plugin({
  key: new ProsemirrorMod.PluginKey("urlPastePlugin"),
  props: {
    handlePaste(view, event, slice) {
      let text = event.clipboardData?.getData("text/plain");
      if (!text && slice && slice.content && slice.content.size > 0) {
        text = slice.content.textBetween(0, slice.content.size, "\n", "\n");
      }
      
      if (!text) return false;

      // Clean up text: remove surrounding whitespace and backticks
      const cleanText = text.trim().replace(/^`+|`+$/g, '');
      
      // URL regex: starts with http/https, no spaces
      const urlRegex = /^(https?:\/\/[^\s]+)$/i;
      const match = cleanText.match(urlRegex);

      if (match) {
        const url = match[1];
        const { schema, tr, selection } = view.state;
        
        // Check if link mark is allowed in current context
        const $from = selection.$from;
        if (!$from.parent.type.allowsMarkType(schema.marks.link)) {
             console.log("[urlPastePlugin] Link mark not allowed in this node:", $from.parent.type.name);
             return false;
        }

        console.log("[urlPastePlugin] Creating link for:", url);

        // Create link mark
        const linkMark = schema.marks.link.create({ href: url });

        if (selection.empty) {
          // Insert text with link mark
          const textNode = schema.text(url, [linkMark]);
          tr.replaceSelectionWith(textNode);
        } else {
          // Apply link mark to selection
          tr.addMark(selection.from, selection.to, linkMark);
        }

        view.dispatch(tr);
        return true;
      }
      return false;
    },
  },
});

export const plugins = [
  ProsemirrorMod.history(),
  tagInputPlugin,
  urlPastePlugin,
  syntaxHighlightPlugin,
  ProsemirrorMod.keymap({
    Tab(state, dispatch) {
      if (isInNode(state, "code_block")) {
        if (dispatch) {
          dispatch(state.tr.insertText("  "));
        }
        return true;
      }
      return false;
    },
    Enter(state, dispatch, view) {
      if (isInNode(state, "code_block")) {
        if (dispatch) {
          const { $from } = state.selection;
          const textBefore = $from.parent.textContent.slice(
            0,
            $from.parentOffset,
          );
          const lastNewLine = textBefore.lastIndexOf("\n");
          const currentLine = textBefore.slice(lastNewLine + 1);
          const match = currentLine.match(/^\s*/);
          const indent = match ? match[0] : "";
          dispatch(state.tr.insertText("\n" + indent));
        }
        return true;
      }
      const { $from } = state.selection;
      console.log(
        "[]Enter",
        getCharsBeforeCursor(state, 10),
        getCurrentBlock(state),
      );
      if (isInNode(state, "paragraph")) {
        const blockStart = $from.start();
        const text = getTextInCurrentBlockBeforeCursor(state).trim();
        const m = text.match(/^```([a-zA-Z0-9]*)$/);
        if (m) {
          const lang = m[1] || "";
          const blockEnd = $from.end();
          replaceWithCodeBlock(state, dispatch, {
            from: blockStart,
            to: blockEnd,
            language: lang,
          });
          return true;
        }
      }
      if ($from.parent.type.name === "todo_item") {
        console.log("[]Enter parent is todo_item");
        const todoContent = $from.parent.textContent || "";
        const isEmpty = todoContent.trim() === "";
        const listItemType = editor_schema.nodes.list_item;
        const parentTopNode = $from.node($from.depth - 2);
        console.log(
          "[]Enter check is inListItem",
          $from.depth > 1,
          parentTopNode.type.name,
        );
        const isInListItem =
          $from.depth > 1 && parentTopNode.type.name === "list_item";

        if (isInListItem) {
          console.log("[]Enter isInListItem");
          if (isEmpty) {
            console.log("[]Enter isInListItem and isEmpty");
            return ProsemirrorMod.liftListItem(listItemType)(
              state,
              dispatch,
              view,
            );
          }
          const listItemDepth = $from.depth - 2;
          const listItemNode = $from.node(listItemDepth);
          console.log("[]Enter the node depth - 2", listItemNode);
          const listItemPos = $from.before(listItemDepth);
          const newTodo = editor_schema.nodes.todo_item.create({
            checked: false,
          });
          const newListItem = editor_schema.nodes.list_item.create({}, newTodo);
          if (dispatch) {
            const insertPos = listItemPos + listItemNode.nodeSize;
            console.log("[]before state.tr.insert(insertPos, newListItem)");
            let tr = state.tr.insert(insertPos, newListItem);
            const caretPos = insertPos + 2;
            tr = tr.setSelection(
              ProsemirrorMod.TextSelection.create(tr.doc, caretPos),
            );
            dispatch(tr);
            view.focus();
          }
          return true;
        }

        if (isEmpty) {
          if (dispatch) {
            const paragraphNode = editor_schema.nodes.paragraph.create();
            const tr = state.tr.replaceSelectionWith(paragraphNode);
            dispatch(tr);
            view.focus();
          }
          return true;
        }
        if (dispatch) {
          // 在 ul 中 todo 回车 创建新行
          const todoNode = editor_schema.nodes.todo_item.create({
            checked: false,
          });
          const node1 = $from.node($from.depth - 1);
          const node2 = $from.node($from.depth - 2);
          console.log("[]Enter insert todo-item", node1, node2);
          const newListItem = editor_schema.nodes.list_item.create(
            {},
            todoNode,
          );
          const tr = state.tr.replaceSelectionWith(newListItem);
          dispatch(tr);
          view.focus();
        }
        return true;
      }
      const isWhat = ProsemirrorMod.splitListItem(
        editor_schema.nodes.list_item,
      )(state, dispatch, view);
      if (isWhat) {
        return true;
      }
      return false;
    },
    Backspace(state, dispatch, view) {
      const { $from, $to } = state.selection;
      if ($from.parent.type.name === "todo_item") {
        if ($from.parent.isTextblock && $from.parent.content.size === 0) {
          if (dispatch) {
            const tr = state.tr.delete($from.before(), $from.after());
            dispatch(tr);
          }
          return true;
        }
        if ($from.pos === $from.before() && $to.pos === $to.after()) {
          if (dispatch) {
            const tr = state.tr.delete($from.before(), $to.after());
            dispatch(tr);
          }
          return true;
        }
      }
      return false;
    },
    Delete(state, dispatch, view) {
      const { $from, $to } = state.selection;
      if ($from.parent.type.name === "todo_item") {
        if ($from.parent.isTextblock && $from.parent.content.size === 0) {
          if (dispatch) {
            const tr = state.tr.delete($from.before(), $from.after());
            dispatch(tr);
          }
          return true;
        }
        if ($from.pos === $from.before() && $to.pos === $to.after()) {
          if (dispatch) {
            const tr = state.tr.delete($from.before(), $to.after());
            dispatch(tr);
          }
          return true;
        }
      }
      return false;
    },
    "Mod-z": ProsemirrorMod.undo,
    "Mod-y": ProsemirrorMod.redo,
    "Mod-Shift-z": ProsemirrorMod.redo,
    "Mod-b": ProsemirrorMod.toggleMark(editor_schema.marks.strong),
    "Mod-i": ProsemirrorMod.toggleMark(editor_schema.marks.em),
    "Mod-`": ProsemirrorMod.toggleMark(editor_schema.marks.code),
    "Shift-Enter"(state, dispatch, view) {
      if (isInNode(state, "code_block")) {
        if (dispatch) {
          const { $from } = state.selection;
          const after = $from.after();
          const p = editor_schema.nodes.paragraph.create();
          const tr = state.tr.insert(after, p);
          tr.setSelection(ProsemirrorMod.TextSelection.create(tr.doc, after + 1));
          dispatch(tr);
          view.focus();
        }
        return true;
      }
      const br = editor_schema.nodes.hard_break.create();
      if (dispatch) {
        const tr = state.tr.replaceSelectionWith(br);
        dispatch(tr);
        view.focus();
      }
      return true;
    },
  }),
  ProsemirrorMod.keymap(ProsemirrorMod.baseKeymap),
  markdownInputRules,
];
