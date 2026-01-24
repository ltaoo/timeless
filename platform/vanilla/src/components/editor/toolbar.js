// import {
//   baseKeymap,
//   toggleMark,
//   setBlockType,
//   wrapIn,
//   lift,
// } from "https://esm.sh/prosemirror-commands";
// import { history, redo, undo } from "https://esm.sh/prosemirror-history";

import { editor_schema } from "./schema.js";

export function createToolbar() {
  const toolbar = document.createElement("div");
  toolbar.className =
    "editor-bottom-bar flex justify-between items-center px-3 py-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-lg";

  // Left side
  const leftGroup = document.createElement("div");
  leftGroup.className = "flex items-center gap-2";

  // Ask button (Placeholder)
  const askBtn = document.createElement("button");
  askBtn.className =
    "flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors";
  askBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
    <span>Ask</span>
  `;
  leftGroup.appendChild(askBtn);

  // Upload Image Button
  const uploadBtn = document.createElement("button");
  uploadBtn.className =
    "toolbar-button flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors";
  uploadBtn.title = "Upload Image";
  // Plus icon
  uploadBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
  uploadBtn.dataset.command = "image";
  leftGroup.appendChild(uploadBtn);

  // Underline Button
  const underlineBtn = document.createElement("button");
  underlineBtn.className =
    "toolbar-button flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors";
  underlineBtn.title = "Underline";
  underlineBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>`;
  underlineBtn.dataset.command = "underline";
  leftGroup.appendChild(underlineBtn);

  // Strikethrough Button
  const strikeBtn = document.createElement("button");
  strikeBtn.className =
    "toolbar-button flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors";
  strikeBtn.title = "Strikethrough";
  strikeBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19c0-5-2.5-6-9-6s-9-6-9-11"/><path d="M5 13h14"/></svg>`; // Simplified strikethrough
  strikeBtn.dataset.command = "strikethrough";
  leftGroup.appendChild(strikeBtn);

  toolbar.appendChild(leftGroup);

  // Right side
  const rightGroup = document.createElement("div");
  rightGroup.className = "flex items-center gap-3";

  // Model Selector
  const modelSelector = document.createElement("button");
  modelSelector.className =
    "flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors";
  modelSelector.innerHTML = `
    <span>GPT-5 mini</span>
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
  `;
  rightGroup.appendChild(modelSelector);

  // Send/Publish Button
  const sendBtn = document.createElement("button");
  sendBtn.className =
    "send-btn flex items-center justify-center w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";
  sendBtn.title = "Publish";
  // Send icon
  sendBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
  
  // Add specific class for identifying this button in event handlers if needed
  sendBtn.dataset.action = "publish";
  
  rightGroup.appendChild(sendBtn);

  toolbar.appendChild(rightGroup);

  return toolbar;
}

export function updateToolbar(view, toolbar) {
  // Minimal update logic as most state-dependent buttons are removed
  // We can add logic here if we need to disable the send button when empty, etc.
  const { state } = view;
  // Example: Disable send button if document is empty
  /*
  const sendBtn = toolbar.querySelector('.send-btn');
  if (sendBtn) {
    const isEmpty = state.doc.textContent.trim().length === 0;
    sendBtn.disabled = isEmpty;
  }
  */
}

