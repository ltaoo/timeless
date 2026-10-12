import type { kit } from "@timeless/timeless";

const ranges = new WeakMap<
  kit.TextRange,
  {
    ranges: Range[];
    root: Element;
    start: number;
    end: number;
    options: kit.TextRangeOptions;
  }
>();

const highlight_owners = new WeakMap<
  Set<Range>,
  Map<Range, { count: number; preserved: boolean }>
>();

function element(value: any): Element {
  if (value?.target) value = value.target;
  while (value && typeof value.get$elm === "function") value = value.get$elm();
  if (!value?.ownerDocument || value.nodeType !== 1)
    throw new TypeError("Text range target must be a mounted element");
  return value;
}

function rects(range: Range): kit.HostRect[] {
  return Array.from(range.getClientRects(), (rect) => ({
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
  }));
}

/** Offsets count UTF-16 code units in document order; excluded subtrees contribute no text. */
export function create_text_range(
  target: unknown,
  start: number,
  end: number,
  options: kit.TextRangeOptions = {},
): kit.TextRange {
  const root = element(target);
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start
  )
    throw new RangeError("Invalid text offsets");
  const nodes: Text[] = [];
  const walk = root.ownerDocument.createTreeWalker(root, 4);
  while (walk.nextNode()) {
    const node = walk.currentNode as Text;
    const excluded = options.exclude
      ? node.parentElement?.closest(options.exclude)
      : null;
    if (excluded && root.contains(excluded)) continue;
    if (node.length) nodes.push(node);
  }
  const length = nodes.reduce((sum, node) => sum + node.length, 0);
  if (end > length) throw new RangeError("Text offsets exceed target content");
  const native: Range[] = [];
  let offset = 0;
  for (const node of nodes) {
    const from = Math.max(0, start - offset),
      to = Math.min(node.length, end - offset);
    if (to > from) {
      const range = root.ownerDocument.createRange();
      range.setStart(node, from);
      range.setEnd(node, to);
      native.push(range);
    }
    offset += node.length;
  }
  const entry = { ranges: native, root, start, end, options };
  const handle: kit.TextRange = {
    text: () =>
      ranges.has(handle)
        ? entry.ranges.map((range) => range.toString()).join("")
        : "",
    rects: () => (ranges.has(handle) ? entry.ranges.flatMap(rects) : []),
    release() {
      ranges.delete(handle);
      for (const range of entry.ranges) range.detach?.();
    },
  };
  ranges.set(handle, entry);
  return handle;
}

/** Native CSS highlights preserve markup; the fallback wraps text pieces and restores them on clear. */
export function highlight_text(
  handles: kit.TextRange[],
  options: kit.TextHighlightOptions,
): kit.TextHighlight {
  if (!/^[a-zA-Z][\w-]*$/.test(options.name))
    throw new TypeError("Invalid highlight name");
  if (options.color && /[{};<>]/.test(options.color))
    throw new TypeError("Invalid highlight color");
  const entries = handles.map((handle) => {
    const entry = ranges.get(handle);
    if (!entry) throw new Error("Text range has been released");
    return entry;
  });
  const doc = entries[0]?.root.ownerDocument;
  if (entries.some((entry) => entry.root.ownerDocument !== doc))
    throw new TypeError("Highlight ranges must belong to one document");
  const win = doc?.defaultView as
    | (Window & { Highlight?: new (...ranges: Range[]) => Set<Range> })
    | null;
  const registry = (win as any)?.CSS?.highlights as
    | Map<string, Set<Range>>
    | undefined;
  const marks: HTMLElement[] = [];
  let highlight: Set<Range> | null = null,
    style: HTMLStyleElement | null = null;
  let cleared = false;
  if (doc && registry && win?.Highlight) {
    highlight = registry.get(options.name) || new win.Highlight();
    const owners =
      highlight_owners.get(highlight) ||
      new Map<Range, { count: number; preserved: boolean }>();
    highlight_owners.set(highlight, owners);
    for (const entry of entries)
      for (const range of entry.ranges) {
        const owner = owners.get(range) || {
          count: 0,
          preserved: highlight.has(range),
        };
        owner.count++;
        owners.set(range, owner);
        highlight.add(range);
      }
    registry.set(options.name, highlight);
    if (options.color) {
      style = doc.createElement("style");
      style.setAttribute("data-n", "text-highlight-style");
      style.textContent = `::highlight(${options.name}) { background-color: ${options.color}; }`;
      doc.head.appendChild(style);
    }
  } else {
    // Read all live range boundaries before splitting text nodes. Reverse order keeps offsets valid.
    const pieces: { range: Range; node: Text; start: number; end: number }[] =
      [];
    for (const entry of entries) {
      for (const range of entry.ranges) {
        pieces.push({
          range,
          node: range.startContainer as Text,
          start: range.startOffset,
          end: range.endOffset,
        });
      }
    }
    // Merge overlapping pieces per text node, so the compatibility path never splits the same offset twice.
    const by_node = new Map<
      Text,
      { range: Range; start: number; end: number }[]
    >();
    for (const piece of pieces) {
      const list = by_node.get(piece.node) || [];
      list.push(piece);
      by_node.set(piece.node, list);
    }
    for (const [node, list] of by_node) {
      list.sort((a, b) => a.start - b.start);
      const merged: { start: number; end: number }[] = [];
      for (const piece of list) {
        const previous = merged[merged.length - 1];
        if (previous && piece.start <= previous.end)
          previous.end = Math.max(previous.end, piece.end);
        else merged.push({ start: piece.start, end: piece.end });
      }
      for (const piece of merged.reverse()) {
        if (piece.end < node.length) node.splitText(piece.end);
        const selected = piece.start ? node.splitText(piece.start) : node;
        const mark = node.ownerDocument.createElement("mark");
        mark.setAttribute("data-n", "text-highlight");
        mark.setAttribute("data-highlight", options.name);
        if (options.color) mark.style.backgroundColor = options.color;
        selected.parentNode?.replaceChild(mark, selected);
        mark.appendChild(selected);
        marks.push(mark);
        // Moving a text node collapses native ranges; bind them again after inserting the mark.
        for (const original of list) {
          if (original.start >= piece.start && original.end <= piece.end) {
            original.range.setStart(selected, original.start - piece.start);
            original.range.setEnd(selected, original.end - piece.start);
          }
        }
      }
    }
  }
  return {
    rects: () =>
      cleared ? [] : entries.flatMap((entry) => entry.ranges.flatMap(rects)),
    clear() {
      if (cleared) return;
      cleared = true;
      if (highlight && registry) {
        const owners = highlight_owners.get(highlight)!;
        for (const entry of entries)
          for (const range of entry.ranges) {
            const owner = owners.get(range)!;
            if (--owner.count === 0) {
              if (!owner.preserved) highlight.delete(range);
              owners.delete(range);
            }
          }
        if (!highlight.size && registry.get(options.name) === highlight)
          registry.delete(options.name);
      }
      style?.remove();
      const parents = new Set<Node>();
      for (const mark of marks) {
        const parent = mark.parentNode;
        if (!parent) continue;
        parents.add(parent);
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        mark.remove();
      }
      for (const parent of parents) parent.normalize();
      if (marks.length) {
        // Unwrapping and normalization move text again. Restore each surviving logical range.
        for (const [index, entry] of entries.entries()) {
          if (!ranges.has(handles[index])) continue;
          const replacement = create_text_range(
            entry.root,
            entry.start,
            entry.end,
            entry.options,
          );
          entry.ranges = ranges.get(replacement)!.ranges;
          ranges.delete(replacement);
        }
      }
    },
  };
}
