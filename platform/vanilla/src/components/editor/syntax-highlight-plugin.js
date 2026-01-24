import { loadHighlightJs } from "./highlight.js";

function getDecorations(doc) {
  const decorations = [];
  const blocks = [];

  doc.descendants((node, pos) => {
    if (node.type.name === "code_block") {
      blocks.push({ node, pos });
    }
  });

  if (blocks.length === 0) return ProsemirrorMod.DecorationSet.empty;

  if (!window.hljs) {
    return ProsemirrorMod.DecorationSet.empty;
  }

  blocks.forEach(({ node, pos }) => {
    const language = node.attrs.language;
    const text = node.textContent;
    if (!text) return;

    let result;
    try {
      if (language && window.hljs.getLanguage(language)) {
        result = window.hljs.highlight(text, { language });
      } else {
        result = window.hljs.highlightAuto(text);
      }
    } catch (e) {
      console.warn("Highlight error", e);
      return;
    }

    const div = document.createElement("div");
    div.innerHTML = result.value;

    let currentPos = pos + 1;

    function traverse(domNode) {
      if (domNode.nodeType === 3) {
        // Text node
        currentPos += domNode.length;
      } else if (domNode.nodeType === 1) {
        // Element
        const className = domNode.className;
        const start = currentPos;

        domNode.childNodes.forEach((child) => traverse(child));

        if (className.includes("hljs-")) {
          decorations.push(
            ProsemirrorMod.Decoration.inline(start, currentPos, { class: className }),
          );
        }
      }
    }

    div.childNodes.forEach(traverse);
  });

  return ProsemirrorMod.DecorationSet.create(doc, decorations);
}

export const syntaxHighlightPlugin = new ProsemirrorMod.Plugin({
  key: new ProsemirrorMod.PluginKey("syntaxHighlight"),
  state: {
    init(_, { doc }) {
      return getDecorations(doc);
    },
    apply(tr, set, oldState, newState) {
      if (tr.docChanged || tr.getMeta("highlightUpdate")) {
        return getDecorations(newState.doc);
      }
      return set.map(tr.mapping, tr.doc);
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
  view(editorView) {
    if (!window.hljs) {
      loadHighlightJs().then(() => {
        const tr = editorView.state.tr.setMeta("highlightUpdate", true);
        editorView.dispatch(tr);
      });
    }
    return {};
  },
});
