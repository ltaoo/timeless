import type { HeadlessHost } from "@timeless/timeless";

let _host: HeadlessHost | null = null;

export function setTuiHost(host: HeadlessHost) {
  _host = host;
}

export function getTuiHost(): HeadlessHost | null {
  return _host;
}
