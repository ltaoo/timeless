// import {
//   baseKeymap,
//   toggleMark,
//   setBlockType,
//   wrapIn,
//   lift,
// } from "https://esm.sh/prosemirror-commands";
// import { history, redo, undo } from "https://esm.sh/prosemirror-history";
// import { Fragment } from "https://esm.sh/prosemirror-model";

import { editor_schema } from "./schema.js";

export function executeCommand(view, command, toolbar) {
  const { state, dispatch } = view;

  switch (command) {
    case "strong":
      ProsemirrorMod.toggleMark(editor_schema.marks.strong)(state, dispatch);
      break;
    case "em":
      ProsemirrorMod.toggleMark(editor_schema.marks.em)(state, dispatch);
      break;
    case "code":
      ProsemirrorMod.toggleMark(editor_schema.marks.code)(state, dispatch);
      break;
    case "underline":
      ProsemirrorMod.toggleMark(editor_schema.marks.underline)(state, dispatch);
      break;
    case "strikethrough":
      ProsemirrorMod.toggleMark(editor_schema.marks.strikethrough)(state, dispatch);
      break;
    case "link":
      const href = prompt("请输入链接地址:", "https://");
      if (href) {
        const linkMark = editor_schema.marks.link.create({ href });
        const tr = state.tr.addMark(
          state.selection.from,
          state.selection.to,
          linkMark,
        );
        dispatch(tr);
      }
      break;
    case "paragraph":
      ProsemirrorMod.setBlockType(editor_schema.nodes.paragraph)(
        state,
        dispatch,
      );
      break;
    case "heading1":
      ProsemirrorMod.setBlockType(editor_schema.nodes.heading, { level: 1 })(
        state,
        dispatch,
      );
      break;
    case "heading2":
      ProsemirrorMod.setBlockType(editor_schema.nodes.heading, { level: 2 })(
        state,
        dispatch,
      );
      break;
    case "heading3":
      ProsemirrorMod.setBlockType(editor_schema.nodes.heading, { level: 3 })(
        state,
        dispatch,
      );
      break;
    case "code_block":
      ProsemirrorMod.setBlockType(editor_schema.nodes.code_block)(
        state,
        dispatch,
      );
      break;
    case "bullet_list":
      ProsemirrorMod.wrapIn(editor_schema.nodes.bullet_list)(state, dispatch);
      break;
    case "ordered_list":
      ProsemirrorMod.wrapIn(editor_schema.nodes.ordered_list)(state, dispatch);
      break;
    case "blockquote":
      ProsemirrorMod.wrapIn(editor_schema.nodes.blockquote)(state, dispatch);
      break;
    case "todo_item":
      const todoNode = editor_schema.nodes.todo_item.create({
        checked: false,
      });
      const todoTr = state.tr.replaceSelectionWith(todoNode);
      dispatch(todoTr);
      break;
    case "image":
      const imageUrl = prompt("请输入图片地址:", "https://");
      if (imageUrl) {
        const imageNode = editor_schema.nodes.image.create({ src: imageUrl });
        const tr = state.tr.replaceSelectionWith(imageNode);
        dispatch(tr);
      }
      break;
    case "horizontal_rule": {
      const hrNode = editor_schema.nodes.horizontal_rule.create();
      const paragraphNode = editor_schema.nodes.paragraph.create();

      let tr = state.tr;
      tr = tr.deleteSelection();
      const pos = tr.selection.from;
      tr = tr.insert(
        pos,
        ProsemirrorMod.Fragment.from([hrNode, paragraphNode]),
      );
      tr = tr.setSelection(
        tr.selection.constructor.near(tr.doc.resolve(pos + 1)),
      );

      dispatch(tr);
      break;
    }
    case "file_link": {
      const app =
        prompt("请输入编辑器类型 (cursor/vscode):", "cursor") || "cursor";
      const absolutePath = prompt("请输入文件绝对路径:", "/path/to/file");
      if (!absolutePath) break;

      const lineNumber = parseInt(prompt("请输入行号:", "1") || "1", 10);
      const columnNumber = parseInt(prompt("请输入列号:", "1") || "1", 10);

      const fileLinkNode = editor_schema.nodes.file_link.create({
        app,
        absolutePath,
        lineNumber,
        columnNumber,
        displayName: absolutePath.split("/").pop() || "文件",
      });

      const tr = state.tr.replaceSelectionWith(fileLinkNode);
      dispatch(tr);
      break;
    }
    case "trae_link": {
      const absolutePath =
        "/Users/litao/Documents/workspace/timeless/domains/index.ts";
      const lineNumber = 10;
      const columnNumber = 10;

      const fileLinkNode = editor_schema.nodes.file_link.create({
        app: "trae",
        absolutePath,
        lineNumber,
        columnNumber,
        displayName: "index.ts",
      });

      const tr = state.tr.replaceSelectionWith(fileLinkNode);
      dispatch(tr);
      break;
    }
    case "highlight":
      ProsemirrorMod.toggleMark(editor_schema.marks.highlight)(state, dispatch);
      break;
    case "undo":
      ProsemirrorMod.undo(state, dispatch);
      break;
    case "redo":
      ProsemirrorMod.redo(state, dispatch);
      break;
  }

  view.focus();
}
