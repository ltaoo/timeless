export function createDebugPanel(view) {
  const panel = document.createElement("div");
  panel.className = "debug-panel";

  const header = document.createElement("div");
  header.className = "debug-panel-header";
  header.innerHTML = `
    <span class="debug-panel-title">🔍 Debug Panel</span>
    <div class="debug-panel-actions">
      <button class="debug-btn refresh-btn" title="Refresh">↻</button>
      <button class="debug-btn toggle-btn" title="Toggle Visibility">▼</button>
    </div>
  `;

  const content = document.createElement("div");
  content.className = "debug-panel-content";

  panel.appendChild(header);
  panel.appendChild(content);

  let isExpanded = true;

  header.querySelector(".toggle-btn").addEventListener("click", () => {
    isExpanded = !isExpanded;
    content.style.display = isExpanded ? "block" : "none";
    header.querySelector(".toggle-btn").textContent = isExpanded ? "▼" : "▲";
  });

  header.querySelector(".refresh-btn").addEventListener("click", () => {
    refreshNodeTree();
  });

  function createNodeElement(node, depth = 0, position = 0, selectedNode = null) {
    const nodeContainer = document.createElement("div");
    nodeContainer.className = "debug-node-container";
    nodeContainer.style.marginLeft = `${depth * 16}px`;

    const isSelected = selectedNode && selectedNode.node === node;
    if (isSelected) {
      nodeContainer.classList.add("selected");
    }

    const nodeHeader = document.createElement("div");
    nodeHeader.className = "debug-node-header" + (isSelected ? " selected" : "");

    const expandIcon = document.createElement("span");
    expandIcon.className = "debug-expand-icon";

    const nodeIcon = document.createElement("span");
    nodeIcon.className = "debug-node-icon";

    const nodeInfo = document.createElement("span");
    nodeInfo.className = "debug-node-info";

    const nodePos = document.createElement("span");
    nodePos.className = "debug-node-pos";

    const childrenContainer = document.createElement("div");
    childrenContainer.className = "debug-children";

    const nodeType = node.isText ? "text" : node.type.name;
    const nodeIconChar = node.isText ? "T" :
                         node.isBlock ? "▢" :
                         node.isInline ? "◉" : "○";

    nodeIcon.textContent = nodeIconChar;

    let infoText = `<strong>${nodeType}</strong>`;
    if (node.isText) {
      const textPreview = node.text.length > 20
        ? `"${node.text.substring(0, 20)}..."`
        : `"${node.text}"`;
      infoText += ` ${textPreview}`;
    }

    if (node.marks && node.marks.length > 0) {
      const marksList = node.marks.map(m => m.type.name).join(", ");
      infoText += ` <span class="debug-marks">[${marksList}]</span>`;
    }

    if (node.attrs && Object.keys(node.attrs).length > 0) {
      const attrsStr = Object.entries(node.attrs)
        .filter(([_, v]) => v !== null && v !== "" && v !== undefined)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(" ");
      if (attrsStr) {
        infoText += ` <span class="debug-attrs">${attrsStr}</span>`;
      }
    }

    nodeInfo.innerHTML = infoText;
    nodePos.textContent = `[${position}-${position + node.nodeSize}]`;

    if (isSelected) {
      nodePos.innerHTML += " <span class=\"cursor-marker\">◉</span>";
    }

    nodeHeader.appendChild(expandIcon);
    nodeHeader.appendChild(nodeIcon);
    nodeHeader.appendChild(nodeInfo);
    nodeHeader.appendChild(nodePos);

    nodeContainer.appendChild(nodeHeader);
    nodeContainer.appendChild(childrenContainer);

    let hasChildren = false;
    let childPos = position + 1;

    if (node.isText) {
      expandIcon.textContent = " ";
      expandIcon.style.cursor = "default";
    } else if (node.content.childCount > 0) {
      hasChildren = true;
      expandIcon.textContent = "▼";
      expandIcon.style.cursor = "pointer";

      nodeHeader.addEventListener("click", (e) => {
        if (e.target === expandIcon || e.target === nodeHeader) {
          toggleExpand();
        }
      });

      function toggleExpand() {
        const isCurrentlyExpanded = !childrenContainer.classList.contains("collapsed");
        childrenContainer.classList.toggle("collapsed");
        expandIcon.textContent = isCurrentlyExpanded ? "▶" : "▼";
      }

      node.content.forEach((child) => {
        const childElement = createNodeElement(child, depth + 1, childPos, selectedNode);
        childrenContainer.appendChild(childElement);
        childPos += child.nodeSize;
      });
    } else {
      expandIcon.textContent = "○";
      expandIcon.style.cursor = "default";
    }

    if (!hasChildren) {
      childrenContainer.style.display = "none";
    }

    return nodeContainer;
  }

  function refreshNodeTree() {
    content.innerHTML = "";

    if (!view || !view.state) {
      content.innerHTML = '<div class="debug-empty">No editor view</div>';
      return;
    }

    const doc = view.state.doc;
    const selection = view.state.selection;

    const treeContainer = document.createElement("div");
    treeContainer.className = "debug-tree";

    const docInfo = document.createElement("div");
    docInfo.className = "debug-doc-info";
    const nodeCount = countNodes(doc);
    const textContent = doc.textContent.trim();
    const isEmpty = textContent.length === 0;

    const from = selection.from;
    const to = selection.to;
    const isCollapsed = selection.empty;
    const cursorPos = isCollapsed ? from : null;

    docInfo.innerHTML = `
      <span class="debug-doc-title">Document</span>
      <span class="debug-doc-stats">${nodeCount} nodes${isEmpty ? ' (empty)' : ''}, ${doc.content.size} content size</span>
    `;
    treeContainer.appendChild(docInfo);

    const selectionInfo = document.createElement("div");
    selectionInfo.className = "debug-selection-info";
    const selectionText = isCollapsed
      ? `Cursor: ${from}-${to}`
      : `Selection: ${from}-${to} (${to - from} chars)`;
    selectionInfo.innerHTML = `
      <span class="debug-selection-label">${selectionText}</span>
      <span class="debug-coords">(${selection.head}:${selection.anchor})</span>
    `;
    treeContainer.appendChild(selectionInfo);

    if (isEmpty) {
      const emptyHint = document.createElement("div");
      emptyHint.className = "debug-empty-hint";
      emptyHint.textContent = "📝 Start typing to add content";
      emptyHint.style.cssText = "padding: 16px; text-align: center; color: #666; font-size: 11px;";
      treeContainer.appendChild(emptyHint);
    }

    let selectedNodeInfo = null;
    if (cursorPos !== null) {
      doc.descendants((node, offset) => {
        const nodeStart = offset;
        const nodeEnd = offset + node.nodeSize;
        if (cursorPos >= nodeStart && cursorPos < nodeEnd) {
          selectedNodeInfo = { node, start: nodeStart, end: nodeEnd };
          if (node.isText) {
            return false;
          }
        }
        return true;
      });
    }

    doc.content.forEach((node, offset, index) => {
      const nodeElement = createNodeElement(node, 0, offset + 1, selectedNodeInfo);
      treeContainer.appendChild(nodeElement);
    });

    content.appendChild(treeContainer);
  }

  function countNodes(doc) {
    let count = 0;
    doc.descendants(() => count++);
    return count;
  }

  function updateOnChange(view) {
    if (view.dispatchTransaction) {
      const originalDispatch = view.dispatchTransaction.bind(view);
      view.dispatchTransaction = function(transaction) {
        originalDispatch(transaction);
        if (transaction.docChanged || transaction.selectionSet) {
          refreshNodeTree();
        }
      };
    }
  }

  updateOnChange(view);

  setTimeout(() => {
    refreshNodeTree();
  }, 100);

  return {
    panel,
    refresh: refreshNodeTree,
    destroy() {
      panel.remove();
    }
  };
}

export function insertDebugPanelStyles() {
  if (document.getElementById("debug-panel-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "debug-panel-styles";
  style.textContent = `
    .debug-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 380px;
      max-height: 500px;
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 8px;
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      color: #d4d4d4;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      overflow: hidden;
    }

    .debug-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: #252526;
      border-bottom: 1px solid #333;
      cursor: pointer;
      user-select: none;
    }

    .debug-panel-title {
      font-weight: 600;
      color: #9cdcfe;
    }

    .debug-panel-actions {
      display: flex;
      gap: 8px;
    }

    .debug-btn {
      background: transparent;
      border: 1px solid #444;
      color: #d4d4d4;
      padding: 2px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      transition: all 0.15s ease;
    }

    .debug-btn:hover {
      background: #3c3c3c;
      border-color: #555;
    }

    .debug-panel-content {
      max-height: 450px;
      overflow-y: auto;
      padding: 8px 0;
    }

    .debug-empty {
      padding: 20px;
      text-align: center;
      color: #666;
    }

    .debug-tree {
      padding: 0 8px;
    }

    .debug-doc-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      margin-bottom: 8px;
      background: #2d2d2d;
      border-radius: 4px;
    }

    .debug-doc-title {
      color: #4ec9b0;
      font-weight: 600;
    }

    .debug-doc-stats {
      color: #858585;
      font-size: 11px;
    }

    .debug-selection-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 12px;
      margin-bottom: 8px;
      background: #1a1a2e;
      border: 1px solid #3a3a5e;
      border-radius: 4px;
    }

    .debug-selection-label {
      color: #f8d866;
      font-weight: 500;
    }

    .debug-coords {
      color: #6a9955;
      font-size: 10px;
    }

    .debug-node-container {
      margin: 2px 0;
    }

    .debug-node-container.selected > .debug-node-header {
      background: #2d3a4a;
      border-left: 2px solid #4fc1ff;
    }

    .debug-node-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.1s ease;
    }

    .debug-node-header:hover {
      background: #2a2d2e;
    }

    .debug-node-header.selected {
      background: #2d3a4a;
    }

    .debug-expand-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      font-size: 10px;
      color: #858585;
      transition: transform 0.15s ease;
    }

    .debug-node-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      font-size: 12px;
      font-weight: bold;
      color: #dcdcaa;
    }

    .debug-node-info {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #ce9178;
    }

    .debug-node-info strong {
      color: #4ec9b0;
      font-weight: 600;
    }

    .debug-marks {
      color: #c586c0;
    }

    .debug-attrs {
      color: #9cdcfe;
    }

    .debug-node-pos {
      font-size: 10px;
      color: #6a9955;
      font-family: 'SF Mono', monospace;
      background: #1e1e1e;
      padding: 1px 4px;
      border-radius: 2px;
    }

    .cursor-marker {
      color: #4fc1ff;
      margin-left: 4px;
      animation: blink 1s infinite;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.3; }
    }

    .debug-children {
      margin-left: 8px;
      border-left: 1px dashed #3c3c3c;
      padding-left: 8px;
    }

    .debug-children.collapsed {
      display: none;
    }

    .debug-node-container:has(.debug-children.collapsed) > .debug-node-header .debug-expand-icon {
      transform: rotate(-90deg);
    }

    .debug-panel-content::-webkit-scrollbar {
      width: 8px;
    }

    .debug-panel-content::-webkit-scrollbar-track {
      background: #1e1e1e;
    }

    .debug-panel-content::-webkit-scrollbar-thumb {
      background: #424242;
      border-radius: 4px;
    }

    .debug-panel-content::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `;

  document.head.appendChild(style);
}
