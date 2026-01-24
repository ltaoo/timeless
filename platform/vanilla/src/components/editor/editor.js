/**
 * @file 富文本编辑器
 */
import { editor_schema } from "./schema.js";
import { createToolbar, updateToolbar } from "./toolbar.js";
import { executeCommand } from "./command.js";
import { proseMirrorToSlateJSON } from "./util.js";
import { plugins } from "./plugins.js";
import { insertStyle } from "./style.js";
import {
  createFloatingToolbar,
  updateFloatingToolbar,
} from "./floatingToolbar.js";
import { createLinkTooltip } from "./linkTooltip.js";
import {
  createSlashMenu,
  showSlashMenu,
  hideSlashMenu,
  isSlashMenuVisible,
  selectNextMenuItem,
  selectPrevMenuItem,
  executeSelectedMenuItem,
} from "./slashMenu.js";
import { createDebugPanel, insertDebugPanelStyles } from "./debug.js";

export function TextEditorView(props) {
  const editor$ = View({
    class: "editor__input",
  });
  const view$ = View(
    {
      class: "memo-editor prose-editor",
    },
    [editor$],
  );

  const $toolbar = createToolbar();
  $toolbar.addEventListener("mousedown", (e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    if (!target) {
      return false;
    }
    
    // Handle Send/Publish button
    const sendBtn = target.closest(".send-btn");
    if (sendBtn && !/** @type {HTMLButtonElement} */ (sendBtn).disabled) {
      e.preventDefault();
      const content = methods.getContent();
      const html = methods.getHTML();
      // Dispatch a custom event or call a method
      // For now, let's log it or assume there's a prop for it.
      // Since we don't have a direct prop passed for onSend, we can emit a custom event
      const event = new CustomEvent("editor:publish", { 
        detail: { content, html },
        bubbles: true 
      });
      $toolbar.dispatchEvent(event);
      return;
    }

    const button = target.closest(".toolbar-button");
    if (button && !/** @type {HTMLButtonElement} */ (button).disabled) {
      e.preventDefault();
      executeCommand(prosemirror_, /** @type {HTMLElement} */ (button).dataset.command, $toolbar);
    }
  });

  const prosemirror_ = new ProsemirrorMod.EditorView(editor$.$elm, {
    state: ProsemirrorMod.EditorState.create({
      doc: ProsemirrorMod.DOMParser.fromSchema(editor_schema).parse(
        document.createElement("div"),
      ),
      plugins: [
        ...plugins,
        new ProsemirrorMod.Plugin({
          key: new ProsemirrorMod.PluginKey("DebugPanelPlugin"),
          props: {
            handleTextInput() {
              setTimeout(() => {
                debugPanel.refresh();
              }, 0);
            },
          },
        }),
      ],
    }),
    dispatchTransaction(transaction) {
      const newState = prosemirror_.state.apply(transaction);
      prosemirror_.updateState(newState);
      updateToolbar(prosemirror_, $toolbar);
      updateFloatingToolbar(prosemirror_, $floatingToolbar);
      linkTooltip.update(prosemirror_);

      const { from } = newState.selection;
      const textBefore = newState.doc.textBetween(Math.max(0, from - 3), from);

      if (isSlashMenuVisible($slashMenu)) {
        if (textBefore === " /" && from >= 2) {
          showSlashMenu(prosemirror_, $slashMenu);
        } else {
          hideSlashMenu($slashMenu);
        }
      } else if (transaction.docChanged && textBefore === " /" && from >= 2) {
        const nodeBefore = newState.doc.nodeAt(from - 2);
        if (nodeBefore && nodeBefore.isText) {
          showSlashMenu(prosemirror_, $slashMenu);
        }
      }

      methods._onChange?.(proseMirrorToSlateJSON(newState.doc));
    },
    handleDOMEvents: {
      change: (view, event) => {
        const target = /** @type {HTMLInputElement} */ (event.target);
        if (!target || !target.classList) {
          return false;
        }
        if (
          target.classList.contains("todo-checkbox") &&
          target.getAttribute("data-clickable") === "true"
        ) {
          const { state, dispatch } = view;
          const todoDom = target.closest("todo-item");
          if (!todoDom) return false;
          const pos = view.posAtDOM(todoDom, 0);
          const $pos = state.doc.resolve(pos);
          if ($pos.nodeAfter && $pos.nodeAfter.type.name === "todo_item") {
            const tr = state.tr.setNodeMarkup(pos, null, {
              checked: target.checked,
            });
            dispatch(tr);
          } else if ($pos.parent && $pos.parent.type.name === "todo_item") {
            const tr = state.tr.setNodeMarkup($pos.before(), null, {
              checked: target.checked,
            });
            dispatch(tr);
          }
          return true;
        }
        return false;
      },
      click: (view, event) => {
        const target = /** @type {HTMLElement} */ (event.target);
        if (!target) return false;

        // Handle code block action buttons
        const actionBtn = target.closest(".code-action-btn");
        if (actionBtn) {
          event.preventDefault();
          event.stopPropagation();

          const action = actionBtn.getAttribute("data-action");
          const codeBlock = actionBtn.closest("pre.code-block");

          if (action === "copy" && codeBlock) {
            // Find the code element and copy its text content
            const codeElement = codeBlock.querySelector("code");
            if (codeElement) {
              const text = codeElement.textContent;
              navigator.clipboard
                .writeText(text)
                .then(() => {
                  // Visual feedback
                  const originalText = actionBtn.textContent;
                  actionBtn.textContent = "✓";
                  setTimeout(() => {
                    actionBtn.textContent = originalText;
                  }, 1000);
                })
                .catch((err) => {
                  console.error("Failed to copy:", err);
                });
            }
            return true;
          } else if (action === "toggle-lines" && codeBlock) {
            // Toggle line numbers
            const { state, dispatch } = view;
            const pos = view.posAtDOM(codeBlock, 0);
            const $pos = state.doc.resolve(pos);

            if ($pos.nodeAfter && $pos.nodeAfter.type.name === "code_block") {
              const currentValue = $pos.nodeAfter.attrs.showLineNumbers;
              const tr = state.tr.setNodeMarkup(pos, null, {
                ...$pos.nodeAfter.attrs,
                showLineNumbers: !currentValue,
              });
              dispatch(tr);
              return true;
            }
          }
        }

        const fileLink = target.closest(".file-link");
        if (fileLink) {
          event.preventDefault();
          event.stopPropagation();
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
          return true;
        }
        return false;
      },
      mousedown: (view, event) => {
        const target = /** @type {HTMLElement} */ (event.target);
        if (!target) return false;

        const fileLink = target.closest(".file-link");
        if (fileLink) {
          event.preventDefault();
          event.stopPropagation();

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
          return true;
        }
        return false;
      },
      keydown: (view, event) => {
        if (isSlashMenuVisible($slashMenu)) {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            selectNextMenuItem($slashMenu);
            return true;
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            selectPrevMenuItem($slashMenu);
            return true;
          } else if (event.key === "Enter") {
            event.preventDefault();
            if (executeSelectedMenuItem($slashMenu, prosemirror_)) {
              return true;
            }
          } else if (event.key === "Escape") {
            event.preventDefault();
            hideSlashMenu($slashMenu);
            return true;
          }
        }
        return false;
      },
      paste: (view, event) => {
        const files = event.clipboardData?.files;
        if (!files || files.length === 0) return false;

        const images = Array.from(files).filter((file) =>
          file.type.startsWith("image/"),
        );

        if (images.length === 0) return false;

        event.preventDefault();

        images.forEach((image) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const src = e.target.result;
            const node = editor_schema.nodes.image.create({
              src,
              title: image.name,
              alt: image.name,
            });

            const { state, dispatch } = view;
            let tr = state.tr;
            
            tr = tr.replaceSelectionWith(node);
            
            // Ensure a paragraph exists after the image for the cursor
            // replaceSelectionWith usually places selection after the inserted node
            const $pos = tr.selection.$to;
            const nodeAfter = $pos.nodeAfter;
            
            if (!nodeAfter || !nodeAfter.isTextblock) {
              const p = editor_schema.nodes.paragraph.create();
              tr = tr.insert($pos.pos, p);
            }
            
            tr = tr.scrollIntoView();
            dispatch(tr);
            view.focus();
          };
          reader.readAsDataURL(image);
        });

        return true;
      },
      dragenter: (view, event) => {
        const files = event.dataTransfer?.items;
        if (!files || files.length === 0) return false;

        const hasImage = Array.from(files).some(item => item.kind === 'file' && item.type.startsWith('image/'));
        if (!hasImage) return false;

        const editorContainer = view.dom.closest(".memo-editor");
        if (editorContainer) {
          editorContainer.classList.add("drag-over");
        }
        return false;
      },
      dragover: (view, event) => {
        const files = event.dataTransfer?.items;
        if (!files || files.length === 0) return false;

        const hasImage = Array.from(files).some(item => item.kind === 'file' && item.type.startsWith('image/'));
        if (!hasImage) return false;

        event.preventDefault(); // Necessary to allow dropping
        return false;
      },
      dragleave: (view, event) => {
        const editorContainer = view.dom.closest(".memo-editor");
        if (editorContainer) {
          // check if we are truly leaving the editor (not just entering a child element)
          const relatedTarget = event.relatedTarget;
          if (!editorContainer.contains(/** @type {Node} */ (relatedTarget))) {
            editorContainer.classList.remove("drag-over");
          }
        }
        return false;
      },
      drop: (view, event) => {
        const editorContainer = view.dom.closest(".memo-editor");
        if (editorContainer) {
          editorContainer.classList.remove("drag-over");
        }

        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        const images = Array.from(files).filter((file) =>
          file.type.startsWith("image/"),
        );

        if (images.length === 0) return false;

        event.preventDefault();

        const coordinates = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        if (!coordinates) return false;

        images.forEach((image) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const src = e.target.result;
            const node = editor_schema.nodes.image.create({
              src,
              title: image.name,
              alt: image.name,
            });

            const $pos = view.state.doc.resolve(coordinates.pos);
            let tr = view.state.tr;
            let insertPos = coordinates.pos;
            
            if ($pos.parent.isTextblock) {
              tr = tr.split(coordinates.pos);
              insertPos = coordinates.pos + 1;
            }
            
            tr = tr.insert(insertPos, node);
            
            // Ensure a paragraph exists after the image for the cursor
            const afterPos = insertPos + node.nodeSize;
            const $after = tr.doc.resolve(afterPos);
            const nodeAfter = $after.nodeAfter;
            let selectionPos = afterPos + 1;
            
            if (!nodeAfter || !nodeAfter.isTextblock) {
              const p = editor_schema.nodes.paragraph.create();
              tr = tr.insert(afterPos, p);
              selectionPos = afterPos + 1;
            }
            
            const selection = ProsemirrorMod.TextSelection.create(tr.doc, selectionPos);
            tr = tr.setSelection(selection);
            tr = tr.scrollIntoView();
            
            view.dispatch(tr);
            view.focus();
          };
          reader.readAsDataURL(image);
        });

        return true;
      },
    },
  });

  /** @type {any} */ (window).prosemirror = prosemirror_;

  const $floatingToolbar = createFloatingToolbar(prosemirror_);
  prosemirror_.dom.parentNode.appendChild($floatingToolbar);

  const linkTooltip = createLinkTooltip(prosemirror_);
  prosemirror_.dom.parentNode.appendChild(linkTooltip.dom);

  const $slashMenu = createSlashMenu(prosemirror_);
  prosemirror_.dom.parentNode.appendChild($slashMenu);

  insertDebugPanelStyles();
  const debugPanel = createDebugPanel(prosemirror_);
  document.body.appendChild(debugPanel.panel);

  const methods = {
    getContent() {
      const json = proseMirrorToSlateJSON(prosemirror_.state.doc);
      return json;
    },
    getHTML() {
      const fragment = ProsemirrorMod.DOMSerializer.fromSchema(
        editor_schema,
      ).serializeFragment(prosemirror_.state.doc.content);
      const div = document.createElement("div");
      div.appendChild(fragment);
      return div.innerHTML;
    },
    setContent(content) {
      const div = document.createElement("div");
      div.innerHTML = content;
      const doc = ProsemirrorMod.DOMParser.fromSchema(editor_schema).parse(div);
      const newState = ProsemirrorMod.EditorState.create({
        doc,
        plugins: prosemirror_.state.plugins,
      });
      prosemirror_.updateState(newState);
    },
    focus() {
      prosemirror_.focus();
    },
    onChange(callback) {
      methods._onChange = callback;
    },
    execCommand(command) {
      executeCommand(prosemirror_, command, $toolbar);
    },
    toggleDebugPanel() {
      if (debugPanel && debugPanel.panel) {
        const isVisible = debugPanel.panel.style.display !== "none";
        debugPanel.panel.style.display = isVisible ? "none" : "block";
      }
    },
    refreshDebugPanel() {
      if (debugPanel && debugPanel.refresh) {
        debugPanel.refresh();
      }
    },
  };

  return {
    t: "view",
    methods,
    render() {
      const $elm = view$.render();
      insertStyle();

      updateToolbar(prosemirror_, $toolbar);
      $elm.appendChild($toolbar);

      return $elm;
    },
  };
}
