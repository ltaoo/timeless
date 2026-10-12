import { ProtocolError } from "./validation";
import type { JsonValue } from "./types";
export function pointer(path: string, scope = "/"): string {
  if (path === "" || path === "/") return path.startsWith("/") ? "/" : scope;
  return path.startsWith("/") ? path : `${scope === "/" ? "" : scope}/${path}`;
}
export function segments(path: string): string[] {
  if (path === "/" || path === "") return [];
  if (!path.startsWith("/") || /~(?![01])/u.test(path))
    throw new ProtocolError("Invalid JSON Pointer", "", path);
  return path
    .slice(1)
    .split("/")
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));
}
function index(key: string): number {
  if (!/^(0|[1-9][0-9]*)$/.test(key) || !Number.isSafeInteger(Number(key)))
    throw new ProtocolError("Array paths require numeric indices");
  return Number(key);
}
export function readData(data: unknown, path: string): unknown {
  let current = data;
  for (const key of segments(path)) {
    if (Array.isArray(current)) current = current[index(key)];
    else if (current !== null && typeof current === "object")
      current = Object.hasOwn(current, key)
        ? (current as Record<string, unknown>)[key]
        : undefined;
    else return undefined;
  }
  return current;
}
export function writeData(
  data: JsonValue | undefined,
  path: string,
  value: JsonValue | undefined,
): JsonValue | undefined {
  const parts = segments(path);
  const replace = (
    current: JsonValue | undefined,
    offset: number,
  ): JsonValue | undefined => {
    if (offset === parts.length) return value;
    const key = parts[offset];
    if (Array.isArray(current)) {
      const next = current.slice();
      // Protocol deletions preserve length; JSON transport serializes holes as null.
      next[index(key)] = replace(current[index(key)], offset + 1) as JsonValue;
      return next;
    }
    const next =
      current !== null && typeof current === "object" ? { ...current } : {};
    const child = replace(
      Object.hasOwn(next, key) ? next[key] : undefined,
      offset + 1,
    );
    if (child === undefined) delete next[key];
    else
      Object.defineProperty(next, key, {
        value: child,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    return next;
  };
  return replace(data, 0);
}
export function jsonSnapshot(value: unknown): JsonValue {
  return value === undefined
    ? null
    : (JSON.parse(JSON.stringify(value)) as JsonValue);
}
export function displayString(value: unknown): string {
  return value === null || value === undefined
    ? ""
    : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);
}
