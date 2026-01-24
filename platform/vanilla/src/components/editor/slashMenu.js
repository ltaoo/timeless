// import { Fragment } from "https://esm.sh/prosemirror-model";

import { editor_schema } from "./schema.js";
import { executeCommand } from "./command.js";

const MENU_ITEMS = [
  {
    category: "基础排版",
    items: [
      { id: "heading1", label: "标题 1", icon: "h1", description: "最高级标题" },
      { id: "heading2", label: "标题 2", icon: "h2", description: "次级标题" },
      { id: "heading3", label: "标题 3", icon: "h3", description: "小标题" },
      { id: "bullet_list", label: "无序列表", icon: "bullet_list", description: "项目符号列表" },
      { id: "ordered_list", label: "有序列表", icon: "ordered_list", description: "编号列表" },
      { id: "blockquote", label: "引用", icon: "blockquote", description: "引用文本" },
      { id: "code_block", label: "代码块", icon: "code_block", description: "代码片段" },
      { id: "horizontal_rule", label: "分割线", icon: "horizontal_rule", description: "水平分割线" },
    ],
  },
  {
    category: "快捷输入",
    items: [
      {
        id: "today_todo",
        label: "今日代办",
        icon: "checkbox",
        description: "插入今日待办事项",
      },
      {
        id: "meeting_record",
        label: "会议记录",
        icon: "notes",
        description: "插入会议记录模板",
      },
      {
        id: "inspiration",
        label: "灵感闪现",
        icon: "lightbulb",
        description: "记录突发灵感",
      },
    ],
  },
  {
    category: "插入",
    items: [
      { id: "link", label: "链接", icon: "link", description: "插入超链接" },
      { id: "image", label: "图片", icon: "image", description: "插入图片" },
    ],
  },
];

const iconSVGs = {
  checkbox: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="6" height="6" rx="1"/><path d="M12 3v18M3 9h18"/></svg>`,
  notes: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></svg>`,
  lightbulb: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.9V17h8v-2.1A7 7 0 0 0 12 2z"/></svg>`,
  link: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  h1: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8M4 18V6M12 18V6M17 12l3-2v8"/></svg>`,
  h2: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8M4 18V6M12 18V6M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>`,
  h3: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8M4 18V6M12 18V6M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2c2 0 4 1 4 3s-2 2.5-4 2.5h-2"/></svg>`,
  bullet_list: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
  ordered_list: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>`,
  blockquote: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  code_block: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  horizontal_rule: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  image: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
};

export function createSlashMenu(view) {
  const menu = document.createElement("div");
  menu.className = "slash-menu";
  menu.style.cssText = `
    position: absolute;
    display: none;
    z-index: 1001;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 10px 38px -10px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    min-width: 240px;
    max-height: 300px;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    padding: 4px;
    box-sizing: border-box;
  `;

  MENU_ITEMS.forEach((category, catIndex) => {
    const categoryEl = document.createElement("div");
    categoryEl.className = "slash-menu-category";
    categoryEl.style.cssText = `
      padding: 8px 12px 4px;
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;
    categoryEl.textContent = category.category;
    menu.appendChild(categoryEl);

    const itemsContainer = document.createElement("div");
    itemsContainer.style.cssText = `padding: 4px;`;

    category.items.forEach((item, itemIndex) => {
      const itemEl = document.createElement("button");
      itemEl.className = "slash-menu-item";
      itemEl.dataset.command = item.id;
      itemEl.style.cssText = `
        display: flex;
        align-items: center;
        width: 100%;
        padding: 10px 12px;
        border: none;
        border-radius: 6px;
        background: transparent;
        cursor: pointer;
        text-align: left;
        transition: all 0.15s ease;
        gap: 12px;
      `;
      itemEl.innerHTML = `
        <span class="slash-menu-icon" style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #f1f5f9; border-radius: 6px; color: #475569; flex-shrink: 0;">
          ${iconSVGs[item.icon] || ""}
        </span>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 14px; font-weight: 500; color: #1e293b; line-height: 1.4;">${
            item.label
          }</div>
          <div style="font-size: 12px; color: #94a3b8; line-height: 1.3; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${
            item.description
          }</div>
        </div>
      `;

      if (catIndex === 0 && itemIndex === 0) {
        itemEl.dataset.selected = "true";
        itemEl.style.background = "#f1f5f9";
      }

      itemEl.addEventListener("mouseenter", () => {
        menu.querySelectorAll(".slash-menu-item").forEach((el) => {
          el.style.background = "transparent";
          el.dataset.selected = "false";
        });
        itemEl.style.background = "#f1f5f9";
        itemEl.dataset.selected = "true";
      });

      itemEl.addEventListener("mouseleave", () => {
        if (itemEl.dataset.selected !== "true") {
          itemEl.style.background = "transparent";
        }
      });

      itemEl.addEventListener("mousedown", (e) => {
        e.preventDefault();
        executeSlashCommand(view, item.id, menu);
      });

      itemsContainer.appendChild(itemEl);
    });

    menu.appendChild(itemsContainer);
  });

  return menu;
}

function executeSlashCommand(view, command, menu) {
  const { state, dispatch } = view;
  const { from, to } = state.selection;

  // Delete the trigger characters
  const tr = state.tr.delete(from - 2, to);
  dispatch(tr);

  // Use the updated state
  const currentState = view.state;
  const currentDispatch = view.dispatch;

  switch (command) {
    case "today_todo": {
      const todoNode = editor_schema.nodes.todo_item.create({ checked: false });
      currentDispatch(currentState.tr.replaceSelectionWith(todoNode));
      break;
    }
    case "meeting_record": {
      const newNodes = [
        editor_schema.nodes.heading.create(
          { level: 2 },
          editor_schema.text("会议记录"),
        ),
        editor_schema.nodes.paragraph.create(editor_schema.text("日期：")),
        editor_schema.nodes.paragraph.create(editor_schema.text("参与者：")),
        editor_schema.nodes.bullet_list.create({}, [
          editor_schema.nodes.list_item.create(
            {},
            editor_schema.nodes.paragraph.create(
              editor_schema.text("议程要点"),
            ),
          ),
          editor_schema.nodes.list_item.create(
            {},
            editor_schema.nodes.paragraph.create(
              editor_schema.text("讨论内容"),
            ),
          ),
          editor_schema.nodes.list_item.create(
            {},
            editor_schema.nodes.paragraph.create(
              editor_schema.text("决策事项"),
            ),
          ),
          editor_schema.nodes.list_item.create(
            {},
            editor_schema.nodes.paragraph.create(
              editor_schema.text("待办任务"),
            ),
          ),
        ]),
      ];

      const tr = currentState.tr.replaceWith(
        currentState.selection.from,
        currentState.selection.from,
        ProsemirrorMod.Fragment.from(newNodes),
      );
      currentDispatch(tr);
      break;
    }
    case "inspiration": {
      const newNodes = [
        editor_schema.nodes.heading.create(
          { level: 3 },
          editor_schema.text("💡 灵感闪现"),
        ),
        editor_schema.nodes.paragraph.create(
          editor_schema.text("记录灵感的时间、地点、场景..."),
        ),
      ];

      const tr = currentState.tr.replaceWith(
        currentState.selection.from,
        currentState.selection.from,
        ProsemirrorMod.Fragment.from(newNodes),
      );
      currentDispatch(tr);
      break;
    }
    default:
      executeCommand(view, command, null);
      break;
  }

  view.focus();
  hideSlashMenu(menu);
}

export function showSlashMenu(view, menu) {
  const { state } = view;
  const { selection } = state;
  const { from } = selection;

  if (from < 0 || from > state.doc.content.size) {
    return;
  }

  const coords = view.coordsAtPos(from);
  const menuRect = menu.getBoundingClientRect();
  const editorRect = view.dom.getBoundingClientRect();

  let left = coords.left;
  let top = coords.bottom + 8;

  if (left + menuRect.width > editorRect.right) {
    left = editorRect.right - menuRect.width - 8;
  }
  if (left < editorRect.left) {
    left = editorRect.left + 8;
  }

  if (top + menuRect.height > editorRect.bottom) {
    top = coords.top - menuRect.height - 8;
  }

  menu.style.display = "block";
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.opacity = "0";
  menu.style.transform = "scale(0.95)";
  menu.style.transition = "opacity 0.15s ease, transform 0.15s ease";

  requestAnimationFrame(() => {
    menu.style.opacity = "1";
    menu.style.transform = "scale(1)";
  });
}

export function hideSlashMenu(menu) {
  menu.style.opacity = "0";
  menu.style.transform = "scale(0.95)";

  setTimeout(() => {
    menu.style.display = "none";
    menu.style.opacity = "";
    menu.style.transform = "";
  }, 150);
}

export function isSlashMenuVisible(menu) {
  return menu.style.display === "block";
}

export function getSelectedMenuItem(menu) {
  return menu.querySelector('.slash-menu-item[data-selected="true"]');
}

export function selectNextMenuItem(menu) {
  const items = Array.from(menu.querySelectorAll(".slash-menu-item"));
  if (items.length === 0) return null;

  const currentIndex = items.findIndex(
    (item) => item.dataset.selected === "true",
  );

  items.forEach((item) => {
    item.dataset.selected = "false";
    item.style.background = "transparent";
  });

  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % items.length : 0;
  items[nextIndex].dataset.selected = "true";
  items[nextIndex].style.background = "#f1f5f9";

  items[nextIndex].scrollIntoView({ block: "nearest" });

  return items[nextIndex];
}

export function selectPrevMenuItem(menu) {
  const items = Array.from(menu.querySelectorAll(".slash-menu-item"));
  if (items.length === 0) return null;

  const currentIndex = items.findIndex(
    (item) => item.dataset.selected === "true",
  );

  items.forEach((item) => {
    item.dataset.selected = "false";
    item.style.background = "transparent";
  });

  const prevIndex =
    currentIndex >= 0
      ? (currentIndex - 1 + items.length) % items.length
      : items.length - 1;
  items[prevIndex].dataset.selected = "true";
  items[prevIndex].style.background = "#f1f5f9";

  items[prevIndex].scrollIntoView({ block: "nearest" });

  return items[prevIndex];
}

export function executeSelectedMenuItem(menu, view) {
  const selected = getSelectedMenuItem(menu);
  if (selected) {
    const command = selected.dataset.command;
    executeSlashCommand(view, command, menu);
    return true;
  }
  return false;
}
