export function wrapText(text, width) {
  const normalized = String(text ?? "").replace(/\t/g, "    ");
  if (width <= 0) return [""];
  if (!normalized) return [""];

  const words = normalized.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  const pushCurrent = () => {
    if (current.length > 0) lines.push(current);
    current = "";
  };

  for (const word of words) {
    if (word.length > width) {
      pushCurrent();
      for (let i = 0; i < word.length; i += width) {
        lines.push(word.slice(i, i + width));
      }
      continue;
    }

    if (!current) {
      current = word;
      continue;
    }

    if (current.length + 1 + word.length <= width) {
      current += ` ${word}`;
      continue;
    }

    pushCurrent();
    current = word;
  }

  pushCurrent();
  return lines.length ? lines : [""];
}

export function normalizeLines(input, width) {
  const rawLines = Array.isArray(input) ? input : [String(input ?? "")];
  const result = [];
  for (const line of rawLines) {
    if (line === "") {
      result.push("");
      continue;
    }
    const match = String(line).match(/^\s+/);
    const rawPrefix = match?.[0] ?? "";
    const prefix = rawPrefix.replace(/\t/g, "    ");
    const body = String(line).slice(rawPrefix.length);
    const bodyWidth = Math.max(1, width - prefix.length);
    const wrapped = wrapText(body, bodyWidth);
    for (const w of wrapped) {
      result.push(`${prefix}${w}`);
    }
  }
  return result;
}

export function padRight(text, width) {
  const s = String(text ?? "");
  if (s.length >= width) return s.slice(0, width);
  return s + " ".repeat(width - s.length);
}

export function renderTwoColumns(options) {
  const {
    leftWidth,
    rightWidth,
    leftLines,
    rightLines,
    separator = "│",
    gap = 1,
  } = options;

  if (leftWidth <= 0 || rightWidth <= 0) {
    return [...(leftLines ?? []), "", ...(rightLines ?? [])].join("\n");
  }

  const left = normalizeLines(leftLines ?? [], leftWidth);
  const right = normalizeLines(rightLines ?? [], rightWidth);
  const height = Math.max(left.length, right.length);
  const gapStr = " ".repeat(Math.max(0, gap));
  const out = [];

  for (let i = 0; i < height; i += 1) {
    const l = padRight(left[i] ?? "", leftWidth);
    const r = padRight(right[i] ?? "", rightWidth);
    out.push(`${l}${gapStr}${separator}${gapStr}${r}`);
  }

  return out.join("\n");
}
