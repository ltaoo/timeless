export type LogLevel = "info" | "debug" | "warn" | "error";

export interface LoggerProps {
  prefix?: string;
  scope?: string;
  time?: boolean;
  level?: LogLevel;
  mode?: "minimal" | "classic" | "verbose";
}

type LogStyle = {
  bg: string;
  color: string;
  borderRadius?: string;
};

const DEFAULT_STYLES: Record<LogLevel, LogStyle> = {
  info: { bg: "#5470c6", color: "white" },
  debug: { bg: "#dfa639", color: "white" },
  warn: { bg: "#e6a23c", color: "white" },
  error: { bg: "#f56c6c", color: "white" },
};

const SCOPE_STYLE: LogStyle = { bg: "#19be6b", color: "white" };

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function buildLogParts(props: LoggerProps, level: LogLevel): string[] {
  const { prefix = "CORE", scope = "", time = false, mode = "classic" } = props;
  const levelStyle = DEFAULT_STYLES[level];
  const parts: string[] = [];
  const styles: string[] = [];

  if (mode === "verbose") {
    if (time) {
      parts.push(`%c[${formatTime()}]%c`);
      styles.push("color:#909399;", "font-weight:bold;");
    }
    parts.push(`%c${level.toUpperCase()}%c`);
    styles.push(
      `color:white;background:${levelStyle.bg};border-radius:2px;`,
      `color:${levelStyle.bg};`,
    );
  } else if (mode === "classic") {
    parts.push(`%c ${prefix} %c ${scope || level.toUpperCase()} %c`);
    styles.push(
      `color:white;background:${levelStyle.bg};border-top-left-radius:2px;border-bottom-left-radius:2px;`,
      `color:white;background:${SCOPE_STYLE.bg};border-top-right-radius:2px;border-bottom-right-radius:2px;`,
      `color:${SCOPE_STYLE.color};`,
    );
  } else {
    parts.push(`%c${prefix}%c`);
    styles.push(
      `color:white;background:${levelStyle.bg};border-radius:2px;`,
      `color:${levelStyle.color};`,
    );
  }

  return [parts.join(" "), ...styles];
}

export function Logger(props: LoggerProps = {}) {
  const { scope = "" } = props;
  const logMethods: Record<LogLevel, (...args: unknown[]) => void> = {
    info(...args) {
      console.log(...buildLogParts(props, "info"), ...args);
    },
    debug(...args) {
      console.log(...buildLogParts(props, "debug"), ...args);
    },
    warn(...args) {
      console.warn(...buildLogParts(props, "warn"), ...args);
    },
    error(...args) {
      console.error(...buildLogParts(props, "error"), ...args);
    },
  };

  return {
    scope,
    ...logMethods,
    log: logMethods.info,
  };
}
