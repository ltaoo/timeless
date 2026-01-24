import {
  fakeMemoList,
  MemosViewModel,
  PRESET_TEMPLATES,
} from "./memos.model.js";
import { TextEditorView } from "./editor/editor.js";
// import { insertStyle } from "./editor/style.js";

const CopyIconSVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <polyline points="3 6 5 6 21 6"></polyline>
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
</svg>`;

export function MemosView(props) {
  const vm$ = MemosViewModel(props);

  // const hasMemos = reactive(() => vm$.memos.value.length > 0);

  const btnText = ref("发布");
  const slate$ = TextEditorView({});

  const view$ = View({ class: "memos-container" }, [
    View({ id: "memo-input-wrapper", class: "memos-input-wrapper" }, [
      slate$,
      Button(
        {
          id: "submit-memo",
          class: "memo-submit-btn",
          onClick() {
            const r = slate$.methods.getHTML();
            btnText.value = "发布中...";
            props.vm.addMemo(r);
            btnText.value = "发布";
            slate$.methods.setContent("");
          },
        },
        [Txt(btnText)],
      ),
    ]),
    View({
      id: "memos-list",
      class: "memos-list",
      onClick(e) {
        const target = e.target;
        const fileLink = target.closest(".file-link");
        if (fileLink) {
          e.preventDefault();
          e.stopPropagation();
          const absolutePath = fileLink.getAttribute("data-path");
          const lineNumber = fileLink.getAttribute("data-line") || "1";
          const columnNumber = fileLink.getAttribute("data-column") || "1";
          const app = fileLink.getAttribute("data-app") || "trae";

          if (absolutePath) {
            fetch(
              `/api/editor/open?file=${encodeURIComponent(absolutePath)}&line=${lineNumber}&col=${columnNumber}&app=${app}`,
            )
              .then((response) => {
                if (!response.ok) {
                  console.error("Failed to open editor:", response.statusText);
                }
              })
              .catch((error) => {
                console.error("Error opening editor:", error);
              });
          }
        }
      },
    }, [
      Show({
        when: props.vm.state.hasMemo,
        children: [
          For({
            each: props.vm.state.memos,
            render(memo) {
              console.log(
                "[COMPONENT]For of memos in memos.js",
                props.vm.state.memos.value.length,
              );
              return View(
                {
                  class: "memo-item memo-editor prose-editor",
                  dataset: { id: memo.id },
                },
                [
                  View(
                    {
                      class: "memo-content",
                    },
                    [
                      View({ class: "ProseMirror memo-content-inner" }, [
                        DangerouslyInnerHTML(memo.content),
                      ]),
                      View({ class: "memo-time" }, [Txt(memo.createdAt)]),
                    ],
                  ),
                  View({ class: "memo-actions" }, [
                    Button(
                      {
                        class: "memo-action-btn delete",
                        dataset: { id: memo.id },
                      },
                      [Txt("删除")],
                    ),
                  ]),
                ],
              );
            },
          }),
        ],
        fallback: [
          View(
            {
              class: "empty-state",
            },
            [Txt("暂无 memo")],
          ),
        ],
      }),
    ]),
  ]);

  const _style = document.createElement("style");
  _style.textContent = `.memos-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.memos-header {
  flex-shrink: 0;
  padding: 12px 16px;
}
.memos-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--FG-0, #111827);
  margin: 0;
}
.memo-input-wrapper {
  flex-shrink: 0;
  padding: 12px 16px;
  border-bottom: 1px solid var(--FG-4, #e5e7eb);
  background: var(--BG-0, #fff);
  transition: padding 0.3s ease, min-height 0.3s ease;
}
.memo-input-wrapper.collapsed {
  padding: 6px 16px;
  min-height: 32px;
}
.memo-input-wrapper.collapsed .template-bar {
  max-height: 0;
  opacity: 0;
  margin: 0;
  overflow: hidden;
}
.memo-input-wrapper.collapsed .memo-editor {
  min-height: 32px;
  padding: 6px 10px;
}
.memo-input-wrapper.collapsed .memo-submit-btn {
  display: none;
}
.template-bar {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 2px 0;
  margin-bottom: 8px;
  max-height: 32px;
  transition: all 0.3s ease;
}
.template-btn {
  flex-shrink: 0;
  padding: 4px 10px;
  border: 1px solid var(--FG-3, #d1d5db);
  border-radius: 14px;
  background: var(--BG-1, #f9fafb);
  color: var(--FG-1, #374151);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.template-btn:hover {
  background: var(--BG-2, #f3f4f6);
  border-color: var(--FG-2, #9ca3af);
}
.memo-editor {
  width: 100%;
  min-height: 60px;
  border: 1px solid var(--FG-3, #d1d5db);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  background: var(--BG-1, #f9fafb);
  color: var(--FG-0, #111827);
  resize: none;
  outline: none;
  transition: all 0.3s;
  white-space: pre-wrap;
  word-break: break-word;
}
.memo-editor:focus {
  border-color: var(--GREEN, #10b981);
  background: var(--BG-0, #fff);
}
.memo-editor:empty::before {
  content: attr(data-placeholder);
  color: var(--FG-3, #9ca3af);
  pointer-events: none;
}
.memo-submit-btn {
  margin-top: 8px;
  padding: 8px 16px;
  background: var(--GREEN, #10b981);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.memo-submit-btn:hover {
  background: var(--GREEN-DARK, #059669);
}
.memos-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.memo-item {
  border: 1px solid var(--FG-4, #e5e7eb);
  border-radius: 8px;
  margin-bottom: 12px;
  background: var(--BG-0, #fff);
}
.memo-item:last-child {
  margin-bottom: 0;
}
.memo-content {
  padding: 12px;
  margin-bottom: 8px;
}
.memo-content-inner {
  padding: 1rem;
  border-radius: 8px;
  min-height: unset !important;
  background: var(--BG-1, #f9fafb);
}
.memo-text {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--FG-0, #111827);
  white-space: pre-wrap;
  word-break: break-word;
}
.memo-time {
  margin-top: 8px;
  font-size: 12px;
  color: var(--FG-3, #9ca3af);
}
.memo-actions {
  display: flex;
  justify-content: flex-end;
}
.memo-action-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--FG-3, #9ca3af);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}
.memo-action-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--FG-3, #9ca3af);
  font-size: 14px;
}

.ProseMirror {
  outline: none;
  min-height: 40px;
  padding: 4px 8px;
}

.ProseMirror p {
  margin: 0 0 8px 0;
}

.ProseMirror p:last-child {
  margin-bottom: 0;
}

.ProseMirror:empty::before {
  content: attr(data-placeholder);
  color: var(--FG-3, #9ca3af);
  pointer-events: none;
}

blockquote {
  border-left: 3px solid var(--FG-3, #9ca3af);
  margin: 8px 0;
  padding: 4px 0 4px 16px;
  color: var(--FG-1, #374151);
  font-style: italic;
}`;

  return {
    t: "view",
    // escapeHtml(text) {
    //   const div = document.createElement("div");
    //   div.textContent = text;
    //   return div.innerHTML;
    // },
    render() {
      document.body.appendChild(_style);
      // insertStyle();
      return view$.render();
    },
  };
}
