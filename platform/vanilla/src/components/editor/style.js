const style = document.createElement("style");
style.id = "prosemirror-editor-styles";
style.textContent = `
/* Toolbar Styles */
.editor-bottom-bar {
	background-color: var(--BG-0);
	border-top: 1px solid var(--FG-4);
}

/* Editor Container */
.memo-editor {
	border: 1px solid var(--FG-4);
	background-color: var(--BG-0);
	border-radius: 8px;
	overflow: hidden;
}

/* ProseMirror Content */
.memo-editor .ProseMirror {
	outline: none;
	padding: 1rem;
	min-height: 120px;
	max-height: 500px;
	overflow-y: auto;
	line-height: 1.625;
	color: var(--FG-0);
}

.memo-editor .ProseMirror p { margin-bottom: 0.6rem; }

/* Typography */
.memo-editor .ProseMirror h1 {
	font-size: 1.875rem;
	line-height: 2.25rem;
	font-weight: 600;
	margin-bottom: 0.5rem;
	color: var(--FG-0);
}
.memo-editor .ProseMirror h2 {
	font-size: 1.5rem;
	line-height: 2rem;
	font-weight: 600;
	margin-bottom: 0.5rem;
	color: var(--FG-0);
}
.memo-editor .ProseMirror h3 {
	font-size: 1.25rem;
	line-height: 1.75rem;
	font-weight: 600;
	margin-bottom: 0.5rem;
	color: var(--FG-0);
}
.memo-editor .ProseMirror strong { font-weight: 700; }
.memo-editor .ProseMirror em { font-style: italic; }

/* Inline Code */
.memo-editor .ProseMirror code {
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
	font-size: 0.875rem;
	line-height: 1.25rem;
	background-color: var(--BG-2);
	padding: 0.125rem 0.375rem;
	border-radius: 0.25rem;
	color: var(--RED);
}

/* Code Blocks */
.memo-editor .ProseMirror pre {
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
	font-size: 0.875rem;
	line-height: 1.25rem;
	background-color: var(--BG-1);
	border-radius: 8px;
	overflow-x: auto;
	margin: 1rem 0;
	border: 1px solid var(--FG-4);
}
.memo-editor .ProseMirror pre code {
	background: transparent;
	padding: 0;
	color: inherit;
}

/* Blockquotes */
.memo-editor .ProseMirror blockquote {
	border-left: 3px solid var(--FG-3);
	margin: 1rem 0;
	padding: 0.5rem 0.5rem 0.5rem 1rem;
	color: var(--FG-1);
	background-color: var(--BG-1);
	border-radius: 4px;
}

/* Lists */
.memo-editor .ProseMirror ul,
.memo-editor .ProseMirror ol {
	margin: 1rem 0;
	padding-left: 2rem;
}
.memo-editor .ProseMirror ul { list-style: disc; }
.memo-editor .ProseMirror ol { list-style: decimal; }
.memo-editor .ProseMirror ul li::marker,
.memo-editor .ProseMirror ol li::marker {
	color: var(--FG-2);
}
.memo-editor .ProseMirror li { margin: 0.25rem 0; }

/* Links */
.memo-editor .ProseMirror a {
	color: var(--GREEN);
	text-decoration: underline;
	transition: opacity 0.2s ease;
}
.memo-editor .ProseMirror a:hover {
	opacity: 0.8;
}

.memo-editor .ProseMirror img {
  display: block;
  max-width: 100%;
  max-height: 500px;
  height: auto;
  margin: 1rem auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: default;
}

.memo-editor .ProseMirror img:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.memo-editor .ProseMirror img.ProseMirror-selectednode {
  outline: 2px solid var(--GREEN);
  box-shadow: 0 0 0 4px rgba(7, 193, 96, 0.2);
}

/* Horizontal Rule */
.memo-editor .ProseMirror hr {
	border: none;
	border-top: 1px solid var(--FG-4);
	margin: 2rem 0;
}

.memo-editor .ProseMirror hr {
pointer-events: none;
user-select: none;
}

.memo-editor .ProseMirror .selection-highlight {
display: block;
list-style: none;
padding: 0;
margin: 1rem 0;
}

.memo-editor .ProseMirror todo-item {
display: flex;
align-items: flex-start;
margin: 0.5rem 0;
}

.memo-editor .ProseMirror .todo-checkbox-wrapper {
display: flex;
align-items: center;
padding: 2px 0;
}

/* Todo Items */
.memo-editor .ProseMirror .todo-checkbox {
	-webkit-appearance: none;
	appearance: none;
	width: 18px;
	height: 18px;
	border: 2px solid var(--FG-3);
	border-radius: 0.25rem;
	cursor: pointer;
	position: relative;
	flex-shrink: 0;
	margin-right: 0.5rem;
	transition: background-color 0.2s ease, border-color 0.2s ease;
	background-color: var(--BG-0);
	outline: none;
}
.memo-editor .ProseMirror .todo-checkbox:focus {
	outline: 2px solid var(--GREEN);
	outline-offset: 2px;
}
.memo-editor .ProseMirror .todo-checkbox:checked {
	background-color: var(--GREEN);
	border-color: var(--GREEN);
}
.memo-editor .ProseMirror .todo-checkbox:checked::after {
content: "";
position: absolute;
left: 4px;
top: 1px;
width: 4px;
height: 10px;
border-right: 2px solid #ffffff;
border-bottom: 2px solid #ffffff;
transform: rotate(45deg);
}

.memo-editor .ProseMirror .todo-content {
	flex: 1;
	outline: none;
	line-height: 1.625;
	min-height: 1.6em;
	color: var(--FG-0);
	cursor: text;
}
.memo-editor .ProseMirror .todo-content:empty::before {
	content: "待办事项内容";
	color: var(--FG-2);
}

.memo-editor .ProseMirror todo-item[data-checked="true"] .todo-content {
	text-decoration: line-through;
	color: var(--FG-2);
}
.memo-editor .ProseMirror todo-item[data-checked="true"] {
	opacity: 0.6;
}

.memo-editor .ProseMirror todo-item:empty::before {
	content: "未输入";
	color: var(--FG-2);
	pointer-events: none;
}

/* Tags */
.memo-editor .ProseMirror .tag {
	display: inline-block;
	background-color: var(--BG-2);
	color: var(--GREEN);
	padding: 0.125rem 0.5rem;
	border-radius: 9999px;
	font-size: 0.875rem;
	line-height: 1.25rem;
	font-weight: 500;
	border: 1px solid var(--FG-4);
}

/* Highlights */
.memo-editor .ProseMirror .highlight {
	background-color: rgba(254, 240, 138, 0.4);
	padding: 0.125rem 0;
	border-radius: 0.125rem;
	cursor: text;
}

/* Comments */
.memo-editor .ProseMirror .comment {
	background-color: var(--BG-2);
	border-bottom: 2px solid var(--GREEN);
	padding: 0.125rem 0.25rem;
	border-radius: 0.25rem;
	cursor: pointer;
	transition: background-color 0.2s ease;
}
.memo-editor .ProseMirror .comment:hover {
	background-color: var(--BG-COLOR-ACTIVE);
}

/* Floating Toolbar */
.floating-toolbar-button {
	background-color: var(--BG-0) !important;
	border: 1px solid var(--FG-3) !important;
	color: var(--FG-0) !important;
	border-radius: 6px !important;
	transition: all 0.2s ease !important;
}
.floating-toolbar-button:hover:not(:disabled) {
	background-color: var(--BG-COLOR-ACTIVE) !important;
	border-color: var(--FG-2) !important;
}

.floating-toolbar-input {
	background-color: var(--BG-0) !important;
	border: 1px solid var(--FG-3) !important;
	color: var(--FG-0) !important;
	border-radius: 6px !important;
}
.floating-toolbar-input:focus {
	border-color: var(--GREEN) !important;
}

.floating-toolbar-submit {
	background-color: var(--GREEN) !important;
	border-color: var(--GREEN) !important;
	color: #ffffff !important;
	border-radius: 6px !important;
}
.floating-toolbar-submit:hover {
	opacity: 0.9;
}

.floating-toolbar-cancel {
	background-color: var(--BG-1) !important;
	border: 1px solid var(--FG-3) !important;
	color: var(--FG-1) !important;
	border-radius: 6px !important;
}
.floating-toolbar-cancel:hover {
	background-color: var(--BG-2) !important;
}

/* Selection Highlight */
.memo-editor .ProseMirror .selection-highlight {
	border-bottom: 2px dashed var(--GREEN);
	background-color: rgba(7, 193, 96, 0.1);
}

/* File Links */
.memo-editor .ProseMirror .file-link {
	display: inline-flex;
	align-items: center;
	background-color: var(--BG-1);
	border: 1px solid var(--FG-4);
	border-radius: 6px;
	padding: 0.25rem 0.5rem;
	cursor: pointer;
	color: var(--FG-0);
	font-size: 0.875rem;
	line-height: 1.25rem;
	text-decoration: none;
	transition: background-color 0.2s ease, border-color 0.2s ease;
}
.memo-editor .ProseMirror .file-link:hover {
	background-color: var(--BG-COLOR-ACTIVE);
	border-color: var(--FG-3);
}
.memo-editor .ProseMirror .file-link-icon {
	margin-right: 0.375rem;
	font-size: 1rem;
}
.memo-editor .ProseMirror .file-link-name {
	font-weight: 500;
}

/* Code Block Styles */
.memo-editor .ProseMirror pre.code-block {
  background-color: #0d1117;
  border-radius: 0.5rem;
  overflow: hidden;
  margin: 1rem 0;
  position: relative;
}
[data-theme="dark"] .memo-editor .ProseMirror pre.code-block {
  background-color: #0d1117;
}

.memo-editor .ProseMirror pre.code-block .code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #161b22;
  border-bottom: 1px solid #30363d;
}
[data-theme="dark"] .memo-editor .ProseMirror pre.code-block .code-block-header {
  background-color: #161b22;
  border-bottom-color: #30363d;
}

.memo-editor .ProseMirror pre.code-block .code-block-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.memo-editor .ProseMirror pre.code-block .code-language {
  font-size: 0.75rem;
  font-weight: 600;
  color: #58a6ff;
  background-color: rgba(56, 139, 253, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}



.memo-editor .ProseMirror pre.code-block .code-block-actions {
  display: flex;
  gap: 0.25rem;
}

.memo-editor .ProseMirror pre.code-block .code-action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #8b949e;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.memo-editor .ProseMirror pre.code-block .code-action-btn:hover {
  background-color: rgba(177, 186, 196, 0.12);
  color: #c9d1d9;
}
[data-theme="dark"] .memo-editor .ProseMirror pre.code-block .code-action-btn:hover {
  background-color: rgba(240, 246, 252, 0.1);
  color: #f0f6fc;
}

.memo-editor .ProseMirror pre.code-block .code-block-content {
  padding: 0;
}

.memo-editor .ProseMirror pre.code-block .code-wrapper {
  display: flex;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.625;
}

.memo-editor .ProseMirror pre.code-block .code-line-numbers {
  flex-shrink: 0;
  padding: 1rem 0.75rem;
  text-align: right;
  background-color: rgba(27, 31, 35, 0.5);
  border-right: 1px solid #30363d;
  user-select: none;
}
.memo-editor .ProseMirror pre.code-block .code-line-numbers pre {
  margin: 0;
  color: #6e7681;
  font-size: 0.875rem;
  line-height: 1.625;
}

.memo-editor .ProseMirror pre.code-block .code-highlight {
  flex: 1;
  padding: 1rem;
  overflow-x: auto;
}

.memo-editor .ProseMirror pre.code-block .code-highlight code {
  background: transparent;
  padding: 0;
  margin: 0;
  color: #c9d1d9;
  font-family: inherit;
  font-size: inherit;
}



.memo-editor .ProseMirror pre.code-block[data-line-numbers="false"] .code-line-numbers {
  display: none;
}

/* Syntax highlighting for code blocks */
.memo-editor .ProseMirror pre.code-block .hljs-keyword {
  color: #ff7b72;
}
.memo-editor .ProseMirror pre.code-block .hljs-built_in {
  color: #79c0ff;
}
.memo-editor .ProseMirror pre.code-block .hljs-type {
  color: #ffa657;
}
.memo-editor .ProseMirror pre.code-block .hljs-literal {
  color: #79c0ff;
}
.memo-editor .ProseMirror pre.code-block .hljs-number {
  color: #79c0ff;
}
.memo-editor .ProseMirror pre.code-block .hljs-string {
  color: #a5d6ff;
}
.memo-editor .ProseMirror pre.code-block .hljs-symbol {
  color: #ff7b72;
}
.memo-editor .ProseMirror pre.code-block .hljs-bullet {
  color: #7ee787;
}
.memo-editor .ProseMirror pre.code-block .hljs-title {
  color: #d2a8ff;
}
.memo-editor .ProseMirror pre.code-block .hljs-section {
  color: #d2a8ff;
}
.memo-editor .ProseMirror pre.code-block .hljs-selector-id {
  color: #d2a8ff;
}
.memo-editor .ProseMirror pre.code-block .hljs-selector-class {
  color: #7ee787;
}
.memo-editor .ProseMirror pre.code-block .hljs-attribute {
  color: #79c0ff;
}
.memo-editor .ProseMirror pre.code-block .hljs-attr {
  color: #79c0ff;
}
.memo-editor .ProseMirror pre.code-block .hljs-variable {
  color: #ffa657;
}
.memo-editor .ProseMirror pre.code-block .hljs-params {
  color: #c9d1d9;
}
.memo-editor .ProseMirror pre.code-block .hljs-comment {
  color: #8b949e;
  font-style: italic;
}
.memo-editor .ProseMirror pre.code-block .hljs-meta {
  color: #79c0ff;
}
.memo-editor .ProseMirror pre.code-block .hljs-function {
  color: #d2a8ff;
}
.memo-editor .ProseMirror pre.code-block .hljs-tag {
  color: #7ee787;
}
.memo-editor .ProseMirror pre.code-block .hljs-name {
  color: #ff7b72;
}
.memo-editor .ProseMirror pre.code-block .hljs-emphasis {
  font-style: italic;
}
.memo-editor .ProseMirror pre.code-block .hljs-strong {
  font-weight: bold;
}
.memo-editor .ProseMirror pre.code-block .hljs-addition {
  color: #7ee787;
  background-color: rgba(55, 140, 63, 0.1);
}
.memo-editor .ProseMirror pre.code-block .hljs-deletion {
  color: #ff7b72;
  background-color: rgba(255, 123, 114, 0.1);
}

/* Slash Menu */
.slash-menu {
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	background-color: var(--BG-0);
	border: 1px solid var(--FG-4);
	border-radius: 8px;
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.slash-menu-category {
	border-bottom: 1px solid var(--FG-4);
	color: var(--FG-1);
	font-size: 0.75rem;
	font-weight: 600;
	text-transform: uppercase;
	padding: 0.5rem 0.75rem;
}
.slash-menu-icon {
	background: var(--BG-2) !important;
	color: var(--FG-1) !important;
	border-radius: 6px !important;
	width: 32px !important;
	height: 32px !important;
	display: flex !important;
	align-items: center !important;
	justify-content: center !important;
}
.slash-menu-item {
	padding: 0.5rem 0.75rem;
	cursor: pointer;
	transition: background-color 0.15s ease;
	border-radius: 6px;
	margin: 0.25rem;
}
.slash-menu-item:hover,
.slash-menu-item[data-selected="true"] {
	background: var(--BG-COLOR-ACTIVE) !important;
}
.slash-menu-item > div > div:first-child {
	color: var(--FG-0);
	font-weight: 500;
}
.slash-menu-item > div > div:last-child {
	color: var(--FG-1);
	font-size: 0.875rem;
}
.slash-menu-shortcut {
	color: var(--FG-2);
	font-size: 0.75rem;
	background: var(--BG-2);
	padding: 0.125rem 0.375rem;
	border-radius: 4px;
	border: 1px solid var(--FG-4);
}

.memo-editor.drag-over {
    border: 2px dashed var(--GREEN);
    background-color: rgba(7, 193, 96, 0.05);
}

.image-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 1rem 0;
    max-width: 100%;
}

.image-node img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    user-select: none;
    -webkit-user-select: none;
    cursor: default;
}

.image-node.ProseMirror-selectednode img {
    outline: 2px solid var(--GREEN);
}

.image-caption {
    font-size: 0.875rem;
    color: var(--FG-2);
    margin-top: 0.5rem;
    text-align: center;
    min-width: 100px;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.image-caption:hover {
    background-color: var(--BG-2);
}

.image-caption:empty::before {
    content: "添加描述...";
    color: var(--FG-3);
    pointer-events: none;
}

/* Hide ProseMirror separator to prevent visual artifacts */
.memo-editor .ProseMirror .ProseMirror-separator {
  display: none !important;
}

/* Tables */
.memo-editor .ProseMirror table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 1rem 0;
  overflow: hidden;
}
.memo-editor .ProseMirror td,
.memo-editor .ProseMirror th {
  min-width: 1em;
  border: 1px solid var(--FG-4);
  padding: 3px 5px;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
}
.memo-editor .ProseMirror th {
  font-weight: bold;
  text-align: left;
  background-color: var(--BG-1);
}
.memo-editor .ProseMirror .column-resize-handle {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: -2px;
  width: 4px;
  background-color: #adf;
  pointer-events: none;
  z-index: 20;
}
.memo-editor .ProseMirror.resize-cursor {
  cursor: col-resize;
}

/* Links */
.memo-editor .ProseMirror a {
  color: var(--GREEN);
  text-decoration: underline;
  cursor: pointer;
}
.memo-editor .ProseMirror a.link-card {
  display: inline-flex;
  padding: 0.5rem 1rem;
  background-color: var(--BG-1);
  border: 1px solid var(--FG-4);
  border-radius: 0.5rem;
  text-decoration: none;
  color: var(--FG-0);
  margin: 0.25rem 0;
  font-size: 0.9em;
  align-items: center;
}
.memo-editor .ProseMirror .link-card-node {
  display: inline-flex;
  padding: 0.5rem 1rem;
  background-color: var(--BG-1);
  border: 1px solid var(--FG-4);
  border-radius: 0.5rem;
  text-decoration: none;
  color: var(--FG-0);
  margin: 0.25rem 0;
  font-size: 0.9em;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.memo-editor .ProseMirror .link-card-node:hover {
  background-color: var(--BG-2);
}
.memo-editor .ProseMirror .link-card-node.ProseMirror-selectednode {
  outline: 2px solid var(--BLUE);
}
.memo-editor .ProseMirror a.link-card:before {
  content: "🔗";
  margin-right: 8px;
}

.memo-editor .ProseMirror a.link-card:hover {
  background-color: var(--BG-2);
}
`;
export function insertStyle() {
	document.head.appendChild(style);
}
