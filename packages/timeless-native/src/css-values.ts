export function splitCSS(value: string, delimiter = ","): string[] {
  const result: string[] = [];
  let depth = 0,
    start = 0,
    quote = "";
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (quote) {
      if (char === quote && value[i - 1] !== "\\") quote = "";
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (
      depth === 0 &&
      (delimiter === " " ? /\s/.test(char) : char === delimiter)
    ) {
      if (value.slice(start, i).trim())
        result.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  if (value.slice(start).trim()) result.push(value.slice(start).trim());
  return result;
}

function functions(
  value: string,
  name: string,
  replace: (body: string) => string | undefined,
): string | undefined {
  let position = value.indexOf(`${name}(`);
  while (position !== -1) {
    let end = position + name.length + 1,
      depth = 1;
    for (; end < value.length && depth; end++) {
      if (value[end] === "(") depth++;
      if (value[end] === ")") depth--;
    }
    if (depth) return undefined;
    const replacement = replace(
      value.slice(position + name.length + 1, end - 1),
    );
    if (replacement === undefined) return undefined;
    value = value.slice(0, position) + replacement + value.slice(end);
    position = value.indexOf(`${name}(`, position + replacement.length);
  }
  return value;
}

export function cssVariables(
  value: string,
  variables: Record<string, string>,
  seen = new Set<string>(),
): string | undefined {
  return functions(value, "var", (body) => {
    const comma = body.indexOf(",");
    const name = (comma < 0 ? body : body.slice(0, comma)).trim();
    const next = new Set(seen);
    next.add(name);
    const resolved =
      !seen.has(name) && variables[name] !== undefined
        ? cssVariables(variables[name], variables, next)
        : undefined;
    return (
      resolved ??
      (comma < 0
        ? undefined
        : cssVariables(body.slice(comma + 1).trim(), variables, seen))
    );
  });
}

export type CSSContext = {
  width: number;
  height: number;
  fontSize: number;
  rootFontSize: number;
};
export function cssLength(value: string, context: CSSContext): string {
  return value.replace(
    /(-?(?:\d*\.)?\d+)(rem|em|vw|vh)\b/g,
    (_, amount, unit) => {
      const scale =
        unit === "rem"
          ? context.rootFontSize
          : unit === "em"
            ? context.fontSize
            : unit === "vw"
              ? context.width / 100
              : context.height / 100;
      return `${Number(amount) * scale}px`;
    },
  );
}

function calculate(source: string): string | undefined {
  const tokens = source.match(/(?:\d*\.)?\d+(?:px|%)?|[-+*/()]/g) ?? [];
  if (tokens.join("") !== source.replace(/\s/g, "")) return undefined;
  let index = 0;
  function expression(
    minimum = 0,
  ): { number: number; unit: string } | undefined {
    let value: { number: number; unit: string } | undefined;
    const first = tokens[index++];
    if (first === "(") {
      value = expression();
      if (tokens[index++] !== ")") return;
    } else if (first === "+" || first === "-") {
      value = expression(3);
      if (value && first === "-") value.number *= -1;
    } else {
      const match = first?.match(/^(\d*\.?\d+)(px|%)?$/);
      if (match) value = { number: Number(match[1]), unit: match[2] ?? "" };
    }
    if (!value) return;
    while (index < tokens.length) {
      const operator = tokens[index];
      const precedence =
        operator === "+" || operator === "-"
          ? 1
          : operator === "*" || operator === "/"
            ? 2
            : 0;
      if (!precedence || precedence < minimum) break;
      index++;
      const right = expression(precedence + 1);
      if (!right) return;
      if (operator === "+" || operator === "-") {
        if (
          value.unit !== right.unit &&
          value.number !== 0 &&
          right.number !== 0
        )
          return;
        value = {
          number:
            value.number + (operator === "+" ? right.number : -right.number),
          unit: value.unit || right.unit,
        };
      } else if (operator === "*") {
        if (value.unit && right.unit) return;
        value = {
          number: value.number * right.number,
          unit: value.unit || right.unit,
        };
      } else {
        if (right.unit || right.number === 0) return;
        value.number /= right.number;
      }
    }
    return value;
  }
  const result = expression();
  return result && index === tokens.length && Number.isFinite(result.number)
    ? `${result.number}${result.unit}`
    : undefined;
}

export function cssMath(
  value: string,
  context: CSSContext,
): string | undefined {
  value = cssLength(value, context);
  return functions(value, "calc", (body) => {
    const nested = cssMath(body, context);
    return nested === undefined ? undefined : calculate(nested);
  });
}

type Color = [number, number, number, number];
const clamp = (value: number) => Math.max(0, Math.min(1, value));
function fromLab(l: number, a: number, b: number, alpha: number): Color {
  const x = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const y = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const z = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const srgb = (v: number) =>
    clamp(
      v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(0, v) ** (1 / 2.4) - 0.055,
    );
  return [
    srgb(4.0767416621 * x - 3.3077115913 * y + 0.2309699292 * z),
    srgb(-1.2684380046 * x + 2.6097574011 * y - 0.3413193965 * z),
    srgb(-0.0041960863 * x - 0.7034186147 * y + 1.707614701 * z),
    clamp(alpha),
  ];
}
function toLab(color: Color): number[] {
  const [r, g, b] = color.map((v) =>
    v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  );
  const x = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const y = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const z = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * x + 0.793617785 * y - 0.0040720468 * z,
    1.9779984951 * x - 2.428592205 * y + 0.4505937099 * z,
    0.0259040371 * x + 0.7827717662 * y - 0.808675766 * z,
  ];
}
const fraction = (value: string) =>
  parseFloat(value) / (value.endsWith("%") ? 100 : 1);
function parseColor(value: string): Color | undefined {
  value = value.trim().toLowerCase();
  const names: Record<string, string> = {
    transparent: "#0000",
    black: "#000",
    white: "#fff",
  };
  value = names[value] ?? value;
  if (/^#[\da-f]{3,4}$/.test(value))
    value = "#" + [...value.slice(1)].map((c) => c + c).join("");
  if (/^#[\da-f]{6}(?:[\da-f]{2})?$/.test(value)) {
    const channels = (value.slice(1) + (value.length === 7 ? "ff" : "")).match(
      /../g,
    )!;
    return channels.map((v) => parseInt(v, 16) / 255) as Color;
  }
  const match = value.match(/^(oklch|oklab|rgba?|color-mix)\((.*)\)$/);
  if (!match) return;
  if (match[1] === "color-mix") {
    const [space, first, second] = splitCSS(match[2]);
    if (!first || !second || !["in oklab", "in srgb"].includes(space)) return;
    const stop = (input: string) => {
      const stop_match = input.match(/^(.*)\s+([\d.]+)%$/);
      return {
        color: parseColor(stop_match ? stop_match[1] : input),
        weight: stop_match ? Number(stop_match[2]) / 100 : undefined,
      };
    };
    const a = stop(first),
      b = stop(second);
    if (!a.color || !b.color) return;
    const wa = a.weight ?? (b.weight === undefined ? 0.5 : 1 - b.weight),
      wb = b.weight ?? 1 - wa;
    const total = wa + wb,
      alpha = (a.color[3] * wa + b.color[3] * wb) / total;
    if (!(total > 0) || alpha === 0) return [0, 0, 0, 0];
    const factor = (a.color[3] * wa) / (total * alpha);
    const ca = space === "in oklab" ? toLab(a.color) : a.color,
      cb = space === "in oklab" ? toLab(b.color) : b.color;
    const mixed = [0, 1, 2].map((i) => ca[i] * factor + cb[i] * (1 - factor));
    return space === "in oklab"
      ? fromLab(mixed[0], mixed[1], mixed[2], alpha * Math.min(1, total))
      : ([...mixed, alpha * Math.min(1, total)] as Color);
  }
  const parts = match[2].split(/[\s,/]+/).filter(Boolean);
  if (
    parts.length < 3 ||
    parts.some((part) => !Number.isFinite(parseFloat(part)))
  )
    return;
  const alpha = parts[3] ? fraction(parts[3]) : 1;
  if (match[1].startsWith("rgb"))
    return [
      ...parts
        .slice(0, 3)
        .map((part) =>
          clamp(parseFloat(part) / (part.endsWith("%") ? 100 : 255)),
        ),
      clamp(alpha),
    ] as Color;
  const l = fraction(parts[0]),
    c = parseFloat(parts[1]);
  if (match[1] === "oklab") return fromLab(l, c, parseFloat(parts[2]), alpha);
  const angle = (parseFloat(parts[2]) * Math.PI) / 180;
  return fromLab(l, c * Math.cos(angle), c * Math.sin(angle), alpha);
}

export function cssColor(value: string): string | undefined {
  const color = parseColor(value);
  return (
    color &&
    "#" +
      color
        .map((v) =>
          Math.round(clamp(v) * 255)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
  );
}

export function cssShadow(value: string): string | undefined {
  if (value === "none") return "none";
  const result: string[] = [];
  for (const item of splitCSS(value)) {
    const parts = splitCSS(item, " ");
    const color_index = parts.findIndex((part) => cssColor(part) !== undefined);
    if (color_index === -1 || parts.includes("inset")) return undefined;
    const color = cssColor(parts.splice(color_index, 1)[0])!;
    if (
      parts.length < 2 ||
      parts.length > 4 ||
      parts.some((part) => !/^-?[\d.]+(?:px)?$/.test(part))
    )
      return undefined;
    if (parts[2] && parseFloat(parts[2]) < 0) return undefined;
    if (color.endsWith("00")) continue;
    result.push(
      `${parts[0]} ${parts[1]} ${parts[2] ?? "0"} ${parts[3] ?? "0"} ${color}`,
    );
  }
  return result.join(", ") || "none";
}
