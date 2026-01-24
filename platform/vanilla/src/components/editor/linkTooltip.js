import { editor_schema } from "./schema.js";

export function createLinkTooltip(view) {
  const tooltip = document.createElement("div");
  tooltip.className = "link-tooltip";
  tooltip.style.cssText = `
    position: absolute;
    display: none;
    z-index: 1000;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 0.75rem;
    width: 280px;
    font-size: 14px;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  `;

  const form = document.createElement("div");
  form.style.cssText = "display: flex; flex-direction: column; gap: 0.75rem;";

  // Text Input
  const textGroup = document.createElement("div");
  const textLabel = document.createElement("label");
  textLabel.textContent = "Text";
  textLabel.style.cssText = "display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;";
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.style.cssText = "width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; box-sizing: border-box;";
  textGroup.appendChild(textLabel);
  textGroup.appendChild(textInput);

  // Link Input
  const linkGroup = document.createElement("div");
  const linkLabel = document.createElement("label");
  linkLabel.textContent = "Link";
  linkLabel.style.cssText = "display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px;";
  const linkInput = document.createElement("input");
  linkInput.type = "text";
  linkInput.style.cssText = "width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px; box-sizing: border-box;";
  linkGroup.appendChild(linkLabel);
  linkGroup.appendChild(linkInput);

  // Card Toggle
  const cardGroup = document.createElement("div");
  cardGroup.style.cssText = "display: flex; align-items: center; gap: 8px;";
  const cardCheckbox = document.createElement("input");
  cardCheckbox.type = "checkbox";
  cardCheckbox.id = "link-tooltip-card-toggle";
  const cardLabelFor = document.createElement("label");
  cardLabelFor.htmlFor = "link-tooltip-card-toggle";
  cardLabelFor.textContent = "Show as card";
  cardLabelFor.style.cssText = "font-size: 14px; color: #374151; cursor: pointer;";
  cardGroup.appendChild(cardCheckbox);
  cardGroup.appendChild(cardLabelFor);

  // Buttons
  const btnGroup = document.createElement("div");
  btnGroup.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-top: 4px;";

  const unlinkBtn = document.createElement("button");
  unlinkBtn.textContent = "Remove Link";
  unlinkBtn.style.cssText = "padding: 6px 10px; background: transparent; color: #ef4444; border: 1px solid transparent; border-radius: 4px; cursor: pointer; font-size: 12px;";
  unlinkBtn.onmouseover = () => unlinkBtn.style.background = "#fee2e2";
  unlinkBtn.onmouseout = () => unlinkBtn.style.background = "transparent";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.style.cssText = "padding: 6px 12px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;";
  saveBtn.onmouseover = () => saveBtn.style.background = "#1d4ed8";
  saveBtn.onmouseout = () => saveBtn.style.background = "#2563eb";

  btnGroup.appendChild(unlinkBtn);
  btnGroup.appendChild(saveBtn);

  form.appendChild(textGroup);
  form.appendChild(linkGroup);
  form.appendChild(cardGroup);
  form.appendChild(btnGroup);
  tooltip.appendChild(form);

  let currentFrom, currentTo;

  const closeTooltip = () => {
    tooltip.style.display = "none";
    currentFrom = null;
    currentTo = null;
    tooltip.removeAttribute('data-from');
    tooltip.removeAttribute('data-to');
    tooltip.removeAttribute('data-type'); // 'mark' or 'node'
  };

  saveBtn.onclick = (e) => {
    e.preventDefault();
    if (currentFrom === null) return;

    const href = linkInput.value;
    const text = textInput.value;
    const isCard = cardCheckbox.checked;

    if (!href) return;

    const { state, dispatch } = view;
    let tr = state.tr;
    const type = tooltip.getAttribute('data-type');

    if (type === 'node') {
        // Was a card
        if (isCard) {
            // Update card attrs
            tr.setNodeMarkup(currentFrom, null, { href, text, title: null });
        } else {
            // Convert to text link
            const textNode = editor_schema.text(text, [editor_schema.marks.link.create({ href })]);
            tr.replaceWith(currentFrom, currentTo, textNode);
        }
    } else {
        // Was a text link
        if (isCard) {
             // Convert to card node
             const cardNode = editor_schema.nodes.link_card.create({ href, text });
             tr.replaceWith(currentFrom, currentTo, cardNode);
        } else {
             // Update text link
             // Update text content first if changed
             const currentText = state.doc.textBetween(currentFrom, currentTo);
             let newTo = currentTo;
             
             if (text !== currentText) {
                tr.insertText(text, currentFrom, currentTo);
                newTo = currentFrom + text.length;
             }

             // Apply mark
             const markType = editor_schema.marks.link;
             const attrs = { href };
             
             // Remove old mark and add new one
             tr.removeMark(currentFrom, newTo, markType);
             tr.addMark(currentFrom, newTo, markType.create(attrs));
        }
    }
    
    dispatch(tr);
    view.focus();
    closeTooltip();
  };

  unlinkBtn.onclick = (e) => {
    e.preventDefault();
    if (currentFrom === null) return;
    const { state, dispatch } = view;
    const type = tooltip.getAttribute('data-type');
    
    if (type === 'node') {
        // Remove node
        dispatch(state.tr.delete(currentFrom, currentTo));
    } else {
        // Remove mark
        dispatch(state.tr.removeMark(currentFrom, currentTo, editor_schema.marks.link));
    }
    
    view.focus();
    closeTooltip();
  };

  // Prevent closing when clicking inside
  tooltip.addEventListener("mousedown", (e) => e.stopPropagation());

  return {
    dom: tooltip,
    update(view, lastState) {
      const { state } = view;
      const { selection } = state;
      
      if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(selection)) {
        return;
      }

      // Check for link_card node selection
      if (selection instanceof ProsemirrorMod.NodeSelection && selection.node.type.name === 'link_card') {
          const node = selection.node;
          const from = selection.from;
          const to = selection.to;
          
          currentFrom = from;
          currentTo = to;
          
          linkInput.value = node.attrs.href;
          textInput.value = node.attrs.text;
          cardCheckbox.checked = true;
          
          tooltip.setAttribute('data-from', from);
          tooltip.setAttribute('data-to', to);
          tooltip.setAttribute('data-type', 'node');
          
          tooltip.style.display = "block";
          
          // Position for node
          const startCoords = view.coordsAtPos(from);
          const endCoords = view.coordsAtPos(to); // This might be next line if block? inline block.
          // For node selection, let's use the node DOM
          const nodeDom = view.nodeDOM(from);
          let left, top;
          
          if (nodeDom && nodeDom.getBoundingClientRect) {
               const rect = nodeDom.getBoundingClientRect();
               const parentRect = tooltip.offsetParent ? tooltip.offsetParent.getBoundingClientRect() : document.body.getBoundingClientRect();
               const centerLeft = rect.left + rect.width / 2;
               left = centerLeft - parentRect.left;
               top = rect.bottom - parentRect.top + 10;
          } else {
               // Fallback
               const centerLeft = (startCoords.left + endCoords.left) / 2;
               const parentRect = tooltip.offsetParent ? tooltip.offsetParent.getBoundingClientRect() : document.body.getBoundingClientRect();
               left = centerLeft - parentRect.left;
               top = endCoords.bottom - parentRect.top + 10;
          }

          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top}px`;
          tooltip.style.transform = "translateX(-50%)";
          return;
      }

      if (selection.empty) {
        const $pos = selection.$from;
        let mark = null;
        let node = $pos.nodeAfter; 
        
        // Check nodeAfter first
        if (node && node.marks) {
           mark = node.marks.find(m => m.type.name === 'link');
        }
        
        // If not, check nodeBefore
        if (!mark) {
            node = $pos.nodeBefore;
            if (node && node.marks) {
                mark = node.marks.find(m => m.type.name === 'link');
            }
        }

        if (mark) {
            // Find range
            let from = $pos.pos;
            let to = $pos.pos;
            const doc = state.doc;
            
            // Scan back
            while (from > 0) {
                if (doc.rangeHasMark(from - 1, from, editor_schema.marks.link)) {
                    from--;
                } else {
                    break;
                }
            }
            // Scan forward
            while (to < doc.content.size) {
                 if (doc.rangeHasMark(to, to + 1, editor_schema.marks.link)) {
                    to++;
                 } else {
                    break;
                 }
            }
            
            if (to > from) {
                currentFrom = from;
                currentTo = to;
                
                const rangeChanged = (tooltip.getAttribute('data-from') != from || tooltip.getAttribute('data-to') != to);
                
                if (tooltip.style.display === "none" || rangeChanged) {
                     linkInput.value = mark.attrs.href;
                     textInput.value = doc.textBetween(from, to);
                     cardCheckbox.checked = false;
                     
                     tooltip.setAttribute('data-from', from);
                     tooltip.setAttribute('data-to', to);
                     tooltip.setAttribute('data-type', 'mark');
                }

                tooltip.style.display = "block";
                
                // Position
                const startCoords = view.coordsAtPos(from);
                const endCoords = view.coordsAtPos(to);
                const centerLeft = (startCoords.left + endCoords.left) / 2;
                
                const parentRect = tooltip.offsetParent ? tooltip.offsetParent.getBoundingClientRect() : document.body.getBoundingClientRect();
                
                const left = centerLeft - parentRect.left;
                const top = endCoords.bottom - parentRect.top + 10;
                
                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
                tooltip.style.transform = "translateX(-50%)";
                return;
            }
        }
      }
      
      closeTooltip();
    }
  };
}
