import { displayString } from "./data-model";
import { ProtocolError } from "./validation";
import type { ClientFunction, FunctionContext } from "./types";

export function safeUrl(value: unknown): string {
  const url = displayString(value).trim();
  if (
    url &&
    !/^(https?:|mailto:|tel:|blob:)/i.test(url) &&
    /^[a-z][a-z0-9+.-]*:/i.test(url)
  )
    throw new ProtocolError("Unsupported URL scheme");
  return url;
}

/** Small data-expression parser; it never evaluates JavaScript. */
export function interpolate(
  template: string,
  context: FunctionContext,
): string {
  const matching = (
    text: string,
    start: number,
    opening: string,
    closing: string,
  ): number => {
    let depth = 1;
    let quote = "";
    for (let cursor = start + 1; cursor < text.length; cursor++) {
      const character = text[cursor];
      if (character === "\\") {
        cursor++;
        continue;
      }
      if (quote) {
        if (character === quote) quote = "";
        continue;
      }
      if (character === "'" || character === '"') {
        quote = character;
        continue;
      }
      if (character === opening) depth++;
      if (character === closing) {
        depth--;
        if (depth === 0) return cursor;
      }
    }
    throw new ProtocolError("Unclosed formatString expression");
  };
  const evaluate = (raw: string, depth: number): unknown => {
    if (depth > 32) throw new ProtocolError("Function nesting is too deep");
    const expression = raw.trim();
    if (
      expression.startsWith("${") &&
      matching(expression, 1, "{", "}") === expression.length - 1
    )
      return evaluate(expression.slice(2, -1), depth + 1);
    if (/^(['"])[\s\S]*\1$/.test(expression))
      return expression.slice(1, -1).replace(/\\(['"\\])/g, "$1");
    if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(expression))
      return Number(expression);
    if (["true", "false", "null"].includes(expression))
      return JSON.parse(expression);
    const call = /^([A-Za-z_][\w]*)\s*\(/.exec(expression);
    if (!call) return context.read(expression);
    const open = expression.indexOf("(");
    if (matching(expression, open, "(", ")") !== expression.length - 1)
      throw new ProtocolError("Invalid function expression");
    const body = expression.slice(open + 1, -1);
    const args: Record<string, unknown> = {};
    let cursor = 0;
    while (cursor < body.length) {
      const name = /^\s*([A-Za-z_][\w]*)\s*:\s*/.exec(body.slice(cursor));
      if (!name) throw new ProtocolError("Function arguments must be named");
      cursor += name[0].length;
      const start = cursor;
      while (cursor < body.length && body[cursor] !== ",") {
        if (body[cursor] === "'" || body[cursor] === '"') {
          const quote = body[cursor++];
          while (cursor < body.length && body[cursor] !== quote) {
            if (body[cursor] === "\\") cursor++;
            cursor++;
          }
          if (cursor === body.length)
            throw new ProtocolError("Unclosed string argument");
        } else if (body[cursor] === "{" || body[cursor] === "(")
          cursor = matching(
            body,
            cursor,
            body[cursor],
            body[cursor] === "{" ? "}" : ")",
          );
        cursor++;
      }
      args[name[1]] = evaluate(body.slice(start, cursor), depth + 1);
      cursor++;
    }
    return context.call(call[1], args);
  };
  let result = "";
  for (let cursor = 0; cursor < template.length; ) {
    if (template.startsWith("\\${", cursor)) {
      result += "${";
      cursor += 3;
    } else if (template.startsWith("${", cursor)) {
      const end = matching(template, cursor + 1, "{", "}");
      result += displayString(evaluate(template.slice(cursor + 2, end), 0));
      cursor = end + 1;
    } else result += template[cursor++];
  }
  return result;
}

function formatDate(value: unknown, format: string, locale?: string): string {
  // shortcut: support the guide's date tokens; add TR35 tokens when applications require them.
  if (value === undefined || value === null || value === "") return "";
  const date = new Date(typeof value === "number" ? value : String(value));
  if (Number.isNaN(date.getTime()))
    throw new ProtocolError("Invalid date value");
  const pad = (value: number) => String(value).padStart(2, "0");
  const localized = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, options).format(date);
  const tokens: Record<string, string> = {
    y: String(date.getFullYear()),
    yyyy: String(date.getFullYear()),
    YYYY: String(date.getFullYear()),
    yy: pad(date.getFullYear() % 100),
    M: String(date.getMonth() + 1),
    MM: pad(date.getMonth() + 1),
    MMM: localized({ month: "short" }),
    MMMM: localized({ month: "long" }),
    d: String(date.getDate()),
    dd: pad(date.getDate()),
    E: localized({ weekday: "short" }),
    EEE: localized({ weekday: "short" }),
    EEEE: localized({ weekday: "long" }),
    h: String(date.getHours() % 12 || 12),
    hh: pad(date.getHours() % 12 || 12),
    H: String(date.getHours()),
    HH: pad(date.getHours()),
    m: String(date.getMinutes()),
    mm: pad(date.getMinutes()),
    s: String(date.getSeconds()),
    ss: pad(date.getSeconds()),
    a: date.getHours() < 12 ? "AM" : "PM",
  };
  return format.replace(/'([^']|'')*'|([a-zA-Z])\2*/g, (token) => {
    if (token.startsWith("'")) return token.slice(1, -1).replace(/''/g, "'");
    if (!(token in tokens))
      throw new ProtocolError(`Unsupported date pattern token: ${token}`);
    return tokens[token];
  });
}

export function basicFunctions(
  openUrl?: (url: string) => void,
): Record<string, ClientFunction> {
  const number = (
    args: Record<string, unknown>,
    context: FunctionContext,
    currency = false,
  ) => {
    if (args.value === undefined || args.value === null) return "";
    const options: Intl.NumberFormatOptions = {
      useGrouping: args.grouping === undefined ? true : Boolean(args.grouping),
    };
    if (currency) {
      options.style = "currency";
      options.currency = String(args.currency);
    }
    if (args.decimals !== undefined)
      options.minimumFractionDigits = options.maximumFractionDigits = Number(
        args.decimals,
      );
    return new Intl.NumberFormat(context.locale, options).format(
      Number(args.value),
    );
  };
  return {
    required: {
      execute: (args) =>
        args.value !== null &&
        args.value !== undefined &&
        args.value !== "" &&
        (!Array.isArray(args.value) || args.value.length > 0),
    },
    regex: {
      execute: (args) =>
        new RegExp(String(args.pattern)).test(displayString(args.value)),
    },
    length: {
      execute: (args) => {
        const length = displayString(args.value).length;
        return (
          (args.min === undefined || length >= Number(args.min)) &&
          (args.max === undefined || length <= Number(args.max))
        );
      },
    },
    numeric: {
      execute: (args) => {
        const value = Number(args.value);
        return (
          args.value !== null &&
          args.value !== undefined &&
          args.value !== "" &&
          Number.isFinite(value) &&
          (args.min === undefined || value >= Number(args.min)) &&
          (args.max === undefined || value <= Number(args.max))
        );
      },
    },
    email: {
      execute: (args) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(displayString(args.value)),
    },
    formatString: {
      execute: (args, context) =>
        interpolate(displayString(args.value), context),
    },
    formatNumber: { execute: (args, context) => number(args, context) },
    formatCurrency: { execute: (args, context) => number(args, context, true) },
    formatDate: {
      execute: (args, context) =>
        formatDate(args.value, displayString(args.format), context.locale),
    },
    pluralize: {
      execute: (args, context) =>
        args[new Intl.PluralRules(context.locale).select(Number(args.value))] ??
        args.other,
    },
    openUrl: {
      actionOnly: true,
      execute: (args) => {
        const url = new URL(String(args.url));
        if (!["http:", "https:"].includes(url.protocol))
          throw new ProtocolError("openUrl requires HTTP(S)");
        if (!openUrl) throw new ProtocolError("Host must provide onOpenUrl");
        openUrl(url.href);
      },
    },
    and: { execute: (args) => (args.values as unknown[]).every(Boolean) },
    or: { execute: (args) => (args.values as unknown[]).some(Boolean) },
    not: { execute: (args) => !args.value },
  };
}
