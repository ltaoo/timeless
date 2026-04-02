export type KeyHandler = (key: string) => void;

export interface TuiInput {
  start(): void;
  stop(): void;
  onKey(handler: KeyHandler): void;
  offKey(handler: KeyHandler): void;
}

export function createTuiInput(inStream?: any): TuiInput {
  const raw = inStream ?? process.stdin;
  const handlers = new Set<KeyHandler>();
  let active = false;

  function onData(data: Buffer | string) {
    const key = typeof data === "string" ? data : data.toString("utf8");
    for (const h of handlers) h(key);
  }

  return {
    start() {
      if (active) return;
      active = true;
      if (typeof raw.setRawMode === "function") raw.setRawMode(true);
      raw.resume();
      raw.setEncoding("utf8");
      raw.on("data", onData);
    },

    stop() {
      if (!active) return;
      active = false;
      raw.off("data", onData);
      if (typeof raw.setRawMode === "function") raw.setRawMode(false);
    },

    onKey(handler: KeyHandler) {
      handlers.add(handler);
    },

    offKey(handler: KeyHandler) {
      handlers.delete(handler);
    },
  };
}

// ─── Parsed key events ──────────────────────────────────────────

export type KeyName =
  | "up"
  | "down"
  | "left"
  | "right"
  | "return"
  | "escape"
  | "backspace"
  | "tab"
  | "space"
  | "ctrl+c"
  | string; // single printable char or raw sequence

export function parseKey(raw: string): KeyName {
  if (raw === "\x03") return "ctrl+c";

  if (raw.length === 3 && raw[0] === "\x1b" && raw[1] === "[") {
    switch (raw[2]) {
      case "A":
        return "up";
      case "B":
        return "down";
      case "C":
        return "right";
      case "D":
        return "left";
    }
  }

  switch (raw) {
    case "\r":
    case "\n":
      return "return";
    case "\x1b":
      return "escape";
    case "\x7f":
    case "\b":
      return "backspace";
    case "\t":
      return "tab";
    case " ":
      return "space";
  }

  if (raw.length === 1 && raw >= " " && raw <= "~") return raw;
  return raw;
}

/**
 * Higher-level key listener that parses raw stdin into named events.
 */
export function listenKeys(opts: {
  onKey: (name: KeyName) => void;
  in?: any;
}): TuiInput {
  const input = createTuiInput(opts.in);
  const handler = (raw: string) => opts.onKey(parseKey(raw));
  input.onKey(handler);

  return {
    ...input,
    stop() {
      input.offKey(handler);
      input.stop();
    },
  };
}
