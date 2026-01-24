/**
 * @file 富文本编辑器
 */
// import {
//   inputRules,
//   wrappingInputRule,
//   textblockTypeInputRule,
//   InputRule,
// } from "https://esm.sh/prosemirror-inputrules";

import { editor_schema } from "./schema.js";

function headingRule(level) {
  return new ProsemirrorMod.InputRule(
    new RegExp("^(#{1," + level + "})\\s"),
    (state, match, start, end) => {
      const { tr } = state;
      tr.delete(start, end);
      tr.setBlockType(start, start, editor_schema.nodes.heading, { level });
      return tr;
    },
  );
}

function codeBlockRule() {
  return ProsemirrorMod.textblockTypeInputRule(
    /^```([a-zA-Z0-9]*)?\s$/,
    editor_schema.nodes.code_block,
    (match) => {
      return { language: match[1] || "" };
    },
  );
}

function bulletListRule() {
  return ProsemirrorMod.wrappingInputRule(
    /^\s*([-+*])\s$/,
    editor_schema.nodes.bullet_list,
  );
}

function orderedListRule() {
  return ProsemirrorMod.wrappingInputRule(
    /^(\d+)\.\s$/,
    editor_schema.nodes.ordered_list,
    (match) => {
      return { start: parseInt(match[1], 10) };
    },
  );
}

function todoItemRule() {
  return ProsemirrorMod.textblockTypeInputRule(
    /^\[\s?(x?)\]\s$/i,
    editor_schema.nodes.todo_item,
    (match) => ({ checked: !!match[1] }),
  );
}

function todoItemInListRule() {
  return new ProsemirrorMod.InputRule(/^\[\s?(x?)\]\s$/i, (state, match) => {
    const { $from } = state.selection;
    if ($from.parent.type.name !== "paragraph") {
      return null;
    }
    const listItemDepth = $from.depth - 1;
    const listItemNode = $from.node(listItemDepth);
    if (!listItemNode || listItemNode.type.name !== "list_item") {
      return null;
    }

    const listItemPos = $from.before(listItemDepth);
    const checked = !!match[1];
    const todoNode = editor_schema.nodes.todo_item.create({ checked });
    const newListItem = state.schema.nodes.list_item.create({}, todoNode);
    const tr = state.tr.replaceWith(
      listItemPos,
      listItemPos + listItemNode.nodeSize,
      newListItem,
    );
    return tr;
  });
}

function quoteRule() {
  return ProsemirrorMod.wrappingInputRule(
    /^\s*>\s$/,
    editor_schema.nodes.blockquote,
  );
}

function tableRule() {
  return new ProsemirrorMod.InputRule(
    /^\|\|\|\s$/,
    (state, match, start, end) => {
      const tr = state.tr;
      const cells = [];
      for (let i = 0; i < 3; i++) {
        cells.push(editor_schema.nodes.table_header.createAndFill());
      }
      const header = editor_schema.nodes.table_row.create(null, cells);
      
      const rows = [header];
      for (let i = 0; i < 2; i++) {
        const rowCells = [];
        for (let j = 0; j < 3; j++) {
          rowCells.push(editor_schema.nodes.table_cell.createAndFill());
        }
        rows.push(editor_schema.nodes.table_row.create(null, rowCells));
      }
      
      const table = editor_schema.nodes.table.create(null, rows);
      tr.replaceRangeWith(start, end, table);
      return tr;
    }
  );
}

function strikethroughRule() {
  return new ProsemirrorMod.InputRule(
    /~{2}([^~]+)~{2}$/,
    (state, match, start, end) => {
      const tr = state.tr;
      if (match[1]) {
        const text = match[1];
        const mark = editor_schema.marks.strikethrough.create();
        tr.replaceWith(start, end, editor_schema.text(text, [mark]));
      }
      return tr;
    }
  );
}

function inlineCodeRule() {
  return new ProsemirrorMod.InputRule(
    /`([^`]+)`$/,
    (state, match, start, end) => {
      const tr = state.tr;
      if (match[1]) {
        const text = match[1];
        const mark = editor_schema.marks.code.create();
        tr.replaceWith(start, end, editor_schema.text(text, [mark]));
        // Ensure the code mark doesn't continue after the input rule
        tr.removeStoredMark(editor_schema.marks.code);
      }
      return tr;
    }
  );
}

export const markdownInputRules = ProsemirrorMod.inputRules({
  rules: [
    headingRule(1),
    headingRule(2),
    headingRule(3),
    // codeBlockRule(),
    bulletListRule(),
    orderedListRule(),
    todoItemRule(),
    quoteRule(),
    tableRule(),
    strikethroughRule(),
    inlineCodeRule(),
  ],
});
