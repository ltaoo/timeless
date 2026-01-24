import { executeCommand } from "./command.js";
import { editor_schema } from "./schema.js";

export function createFloatingToolbar(view) {
  const toolbar = document.createElement("div");
  toolbar.className = "floating-toolbar";
  toolbar.style.cssText = `
    position: absolute;
    display: none;
    align-items: center;
    z-index: 1000;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 0.25rem;
    overflow: hidden;
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
    transition: opacity 0.2s ease, transform 0.2s ease, left 0.2s ease, top 0.2s ease;
    pointer-events: none;
  `;

  // Text Buttons Wrapper
  const buttonsWrapper = document.createElement("div");
  buttonsWrapper.className = "floating-toolbar-buttons-wrapper";
  buttonsWrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: opacity 0.2s ease, width 0.2s ease;
    overflow: hidden;
  `;

  // Image Buttons Wrapper
  const imageButtonsWrapper = document.createElement("div");
  imageButtonsWrapper.className = "floating-toolbar-image-buttons-wrapper";
  imageButtonsWrapper.style.cssText = `
    display: none;
    align-items: center;
    gap: 0.25rem;
    transition: opacity 0.2s ease, width 0.2s ease;
    overflow: hidden;
  `;

  const commentWrapper = document.createElement("div");
  commentWrapper.className = "floating-toolbar-comment-wrapper";
  commentWrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: 0.25rem;
    opacity: 0;
    width: 0;
    overflow: hidden;
    transition: opacity 0.2s ease, width 0.2s ease;
    display: none; 
  `;

  // Text Buttons Definition
  const buttons = [
    { 
      command: "strong", 
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>`, 
      title: "粗体", 
      class: "bold" 
    },
    { 
      command: "em", 
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>`, 
      title: "斜体", 
      class: "italic" 
    },
    { 
      command: "link", 
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`, 
      title: "超链接", 
      class: "link" 
    },
    { 
      command: "highlight", 
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 11-6 6v3h9l3-3"></path><path d="m22 7-3-3c-1.5-1.5-3-1.5-4.5 0l-5.5 5.5 3 3 5.5-5.5c1.5-1.5 1.5-3 0-4.5z"></path></svg>`, 
      title: "高亮", 
      class: "highlight" 
    },
    { 
      command: "comment", 
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`, 
      title: "评论", 
      class: "comment" 
    },
  ];

  // Image Buttons Definition
  const imageButtons = [
    {
      command: "replace",
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`, // Upload icon
      title: "替换图片",
      class: "replace"
    },
    {
      command: "delete",
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`, // Trash icon
      title: "删除图片",
      class: "delete"
    }
  ];

  // Helper to create buttons
  const createButton = (btn, isImageBtn = false) => {
    const button = document.createElement("button");
    button.className = "floating-toolbar-button";
    button.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 28px;
      padding: 0 0.375rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.25rem;
      background-color: #ffffff;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      transition: all 0.15s ease;
      flex-shrink: 0;
    `;
    button.title = btn.title;
    button.innerHTML = btn.icon;
    button.dataset.command = btn.command;
    return button;
  };

  // Add Text Buttons
  buttons.forEach((btn) => {
    const button = createButton(btn);
    button.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (btn.command === "comment") {
        showCommentInput(view, toolbar, buttonsWrapper, commentWrapper);
      } else {
        executeCommand(view, btn.command, toolbar);
        hideFloatingToolbar(toolbar);
      }
    });
    buttonsWrapper.appendChild(button);
  });

  // Hidden File Input
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  fileInput.addEventListener("change", (e) => {
    const file = /** @type {HTMLInputElement} */ (e.target).files[0];
    if (file && view.state.selection.node && view.state.selection.node.type.name === "image") {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const src = ev.target.result;
            const tr = view.state.tr.setNodeMarkup(view.state.selection.from, null, {
                ...view.state.selection.node.attrs,
                src,
                title: file.name,
                alt: file.name
            });
            view.dispatch(tr);
            // Re-focus to keep toolbar or selection logic consistent
            view.focus();
        };
        reader.readAsDataURL(file);
    }
    fileInput.value = ""; 
  });

  // Add Image Buttons
  imageButtons.forEach((btn) => {
    const button = createButton(btn, true);
    button.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (btn.command === "replace") {
        fileInput.click();
      } else if (btn.command === "delete") {
        view.dispatch(view.state.tr.deleteSelection());
        hideFloatingToolbar(toolbar);
        view.focus();
      }
    });
    imageButtonsWrapper.appendChild(button);
  });

  // Comment Input setup
  const commentInput = document.createElement("input");
  commentInput.type = "text";
  commentInput.placeholder = "输入评论...";
  commentInput.className = "floating-toolbar-input";
  commentInput.style.cssText = `
    width: 120px;
    height: 28px;
    padding: 0 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    font-size: 14px;
    color: #374151;
    background-color: #ffffff;
    outline: none;
  `;

  const submitBtn = document.createElement("button");
  submitBtn.className = "floating-toolbar-submit";
  submitBtn.innerHTML = "✓";
  submitBtn.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 0.375rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    background-color: #3b82f6;
    cursor: pointer;
    font-size: 14px;
    color: #ffffff;
    transition: all 0.15s ease;
    flex-shrink: 0;
  `;

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "floating-toolbar-cancel";
  cancelBtn.innerHTML = "✕";
  cancelBtn.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    padding: 0 0.375rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    background-color: #ffffff;
    cursor: pointer;
    font-size: 14px;
    color: #6b7280;
    transition: all 0.15s ease;
    flex-shrink: 0;
  `;

  submitBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    submitComment(view, toolbar, buttonsWrapper, commentWrapper, commentInput);
  });

  cancelBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    hideCommentInput(view, toolbar, buttonsWrapper, commentWrapper, commentInput, true);
  });

  commentInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitComment(view, toolbar, buttonsWrapper, commentWrapper, commentInput);
    } else if (e.key === "Escape") {
      e.preventDefault();
      hideCommentInput(view, toolbar, buttonsWrapper, commentWrapper, commentInput, true);
    }
  });

  commentInput.addEventListener("blur", () => {
    setTimeout(() => {
      const { selection } = view.state;
      const hasSelection = !selection.empty && selection.from !== selection.to;
      const isImageNode = selection.node && selection.node.type.name === "image";
      
      if ((!hasSelection && !isImageNode) || document.activeElement !== commentInput) {
        hideCommentInput(view, toolbar, buttonsWrapper, commentWrapper, commentInput);
      }
    }, 150);
  });

  commentWrapper.appendChild(commentInput);
  commentWrapper.appendChild(submitBtn);
  commentWrapper.appendChild(cancelBtn);

  toolbar.appendChild(buttonsWrapper);
  toolbar.appendChild(imageButtonsWrapper);
  toolbar.appendChild(commentWrapper);

  return toolbar;
}

let selectionHighlightMark = null;
let selectionHighlightFrom = 0;
let selectionHighlightTo = 0;

function showCommentInput(view, toolbar, buttonsWrapper, commentWrapper) {
  const { selection } = view.state;
  if (selection.empty) return;

  selectionHighlightFrom = selection.from;
  selectionHighlightTo = selection.to;

  selectionHighlightMark = editor_schema.marks.highlight.create({ color: "transparent" });
  const tr = view.state.tr.addMark(selection.from, selection.to, selectionHighlightMark);
  view.dispatch(tr);

  const buttonsWidth = buttonsWrapper.offsetWidth;
  buttonsWrapper.style.width = `${buttonsWidth}px`;
  buttonsWrapper.style.opacity = "0";

  requestAnimationFrame(() => {
    setTimeout(() => {
      buttonsWrapper.style.display = "none";
      buttonsWrapper.style.width = "0";

      commentWrapper.style.display = "flex";
      requestAnimationFrame(() => {
        commentWrapper.style.opacity = "1";
        commentWrapper.style.width = "auto";
        const input = commentWrapper.querySelector("input");
        if (input) {
          input.focus();
          input.select();
        }
      });
    }, 180);
  });
}

function hideCommentInput(view, toolbar, buttonsWrapper, commentWrapper, commentInput, restoreSelection = false) {
  commentInput.value = "";

  const savedFrom = selectionHighlightFrom;
  const savedTo = selectionHighlightTo;

  if (selectionHighlightMark) {
    const tr = view.state.tr.removeMark(savedFrom, savedTo, selectionHighlightMark.type);
    view.dispatch(tr);
    selectionHighlightMark = null;
    selectionHighlightFrom = 0;
    selectionHighlightTo = 0;
  }

  commentWrapper.style.width = `${commentWrapper.offsetWidth}px`;
  commentWrapper.style.opacity = "0";

  requestAnimationFrame(() => {
    setTimeout(() => {
      commentWrapper.style.display = "none";
      commentWrapper.style.width = "0";

      // Decide which wrapper to show based on current selection
      const { selection } = view.state;
      const isImageNode = selection.node && selection.node.type.name === "image";
      const imageButtonsWrapper = toolbar.querySelector(".floating-toolbar-image-buttons-wrapper");
      
      const targetWrapper = isImageNode ? imageButtonsWrapper : buttonsWrapper;
      
      targetWrapper.style.display = "flex";
      requestAnimationFrame(() => {
        targetWrapper.style.width = "auto";
        targetWrapper.style.opacity = "1";
        
        if (restoreSelection && savedFrom !== savedTo) {
          const tr = view.state.tr.setSelection(view.state.selection.constructor.create(view.state.doc, savedFrom, savedTo));
          view.dispatch(tr);
          view.focus();
        }
      });
    }, 180);
  });
}

function submitComment(view, toolbar, buttonsWrapper, commentWrapper, commentInput) {
  const content = commentInput.value.trim();
  if (content) {
    const { state, dispatch } = view;
    const commentId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const commentMark = editor_schema.marks.comment.create({
      commentId,
      author: "当前用户",
      content: content,
      timestamp: new Date().toISOString(),
    });
    const tr = state.tr.addMark(
      state.selection.from,
      state.selection.to,
      commentMark
    );
    dispatch(tr);
  }

  hideCommentInput(view, toolbar, buttonsWrapper, commentWrapper, commentInput);
}

function updateToolbarPosition(view, toolbar, selection) {
  const domSelection = window.getSelection();
  let left = 0;
  let top = 0;
  let shouldShow = true;

  const isNodeSelection = !!selection.node;

  if (isNodeSelection) {
    // For NodeSelection (e.g., Image), use view coords
    const nodeDOM = view.nodeDOM(selection.from);
    if (nodeDOM && nodeDOM.getBoundingClientRect) {
      const rect = nodeDOM.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      top = rect.top - toolbar.offsetHeight - 8;
      left = centerX;
      
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      if (rect.bottom < 0 || rect.top > viewportHeight) {
        shouldShow = false;
      } else {
        if (top < 8) top = 8;
        const halfWidth = toolbar.offsetWidth / 2;
        if (left - halfWidth < 8) left = halfWidth + 8;
        else if (left + halfWidth > viewportWidth - 8) left = viewportWidth - halfWidth - 8;
      }
    } else {
        // Fallback
        const coords = view.coordsAtPos(selection.from);
        left = coords.left;
        top = coords.top - toolbar.offsetHeight - 8;
    }
  } else if (domSelection && domSelection.rangeCount > 0) {
    const range = domSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    const centerX = rect.left + rect.width / 2;
    top = rect.top - toolbar.offsetHeight - 8;
    
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    if (rect.bottom < 0 || rect.top > viewportHeight) {
      shouldShow = false;
    } else {
      if (top < 8) top = 8;
      
      left = centerX;
      const halfWidth = toolbar.offsetWidth / 2;
      if (left - halfWidth < 8) left = halfWidth + 8;
      else if (left + halfWidth > viewportWidth - 8) left = viewportWidth - halfWidth - 8;
    }
  } else {
    // Fallback
    const { from, to } = selection;
    const startCoords = view.coordsAtPos(from);
    const endCoords = view.coordsAtPos(to);
    const minX = Math.min(startCoords.left, endCoords.left);
    const maxX = Math.max(startCoords.right, endCoords.right);
    const centerX = (minX + maxX) / 2;
    
    left = centerX;
    top = startCoords.top - toolbar.offsetHeight - 8;
  }

  if (!shouldShow) {
    hideFloatingToolbar(toolbar);
    return;
  }

  const containerRect = toolbar.offsetParent ? toolbar.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
  toolbar.style.left = `${left - containerRect.left}px`;
  toolbar.style.top = `${top - containerRect.top}px`;

  // If already visible and stable, just update transform to be sure
  if (toolbar.style.display === "flex" && toolbar.style.opacity === "1" && !toolbar._hideTimeout) {
    toolbar.style.transform = "translateX(-50%) translateY(0)";
    return;
  }

  if (toolbar._hideTimeout) {
    clearTimeout(toolbar._hideTimeout);
    toolbar._hideTimeout = null;
  }

  toolbar.style.display = "flex";
  toolbar.style.pointerEvents = "auto";
  
  requestAnimationFrame(() => {
    toolbar.style.opacity = "1";
    toolbar.style.transform = "translateX(-50%) translateY(0)";
  });
}

function showFloatingToolbar(view, toolbar, selection) {
  if (selection.empty && !selection.node) {
    hideFloatingToolbar(toolbar);
    return;
  }
  updateToolbarPosition(view, toolbar, selection);
}

function hideFloatingToolbar(toolbar) {
  if (toolbar._hideTimeout) return;
  
  if (toolbar.style.display === "none" && toolbar.style.opacity === "0") return;

  toolbar.style.opacity = "0";
  toolbar.style.transform = "translateX(-50%) translateY(10px)";
  toolbar.style.pointerEvents = "none";

  toolbar._hideTimeout = setTimeout(() => {
    toolbar.style.display = "none";
    toolbar._hideTimeout = null;
  }, 200);
}

export function updateFloatingToolbar(view, toolbar) {
  if (view.composing) {
    hideFloatingToolbar(toolbar);
    return;
  }

  const { selection } = view.state;
  const isNodeSelection = !!selection.node;
  const isImageNode = isNodeSelection && selection.node.type.name === "image";
  const hasTextSelection = !selection.empty && !isNodeSelection;

  // Don't show toolbar in code blocks
  const isCodeBlock = selection.$from.parent.type.name === "code_block";
  
  if ((hasTextSelection || isImageNode) && !isCodeBlock) {
    const buttonsWrapper = toolbar.querySelector(".floating-toolbar-buttons-wrapper");
    const imageButtonsWrapper = toolbar.querySelector(".floating-toolbar-image-buttons-wrapper");
    const commentWrapper = toolbar.querySelector(".floating-toolbar-comment-wrapper");

    // If comment input is active, don't mess with visibility unless necessary
    // But updateFloatingToolbar is called on transaction, so usually after selection change.
    // If we are typing comment, selection might not change significantly or logic handles it.
    // However, if we just selected an image, we should switch.
    
    // Check if comment wrapper is visible
    if (commentWrapper.style.display === "flex" && commentWrapper.style.opacity !== "0") {
        // Commenting mode, don't switch back unless selection becomes invalid?
        // Keep as is for now.
        return; 
    }

    if (isImageNode) {
        buttonsWrapper.style.display = "none";
        imageButtonsWrapper.style.display = "flex";
        imageButtonsWrapper.style.width = "auto";
        imageButtonsWrapper.style.opacity = "1";
    } else {
        imageButtonsWrapper.style.display = "none";
        buttonsWrapper.style.display = "flex";
        buttonsWrapper.style.width = "auto";
        buttonsWrapper.style.opacity = "1";
    }

    showFloatingToolbar(view, toolbar, selection);
  } else {
    hideFloatingToolbar(toolbar);
  }
}
