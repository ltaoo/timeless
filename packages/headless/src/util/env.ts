import { getHost, isBrowser } from "@/host";
export { STUB_MARKER } from "@/host/stub";

export { isBrowser };

export function safeCreateElement(tag: string) {
  return getHost().createElement(tag);
}

export function safeCreateElementNS(namespace: string, tag: string) {
  const host = getHost();
  if (host.createElementNS) {
    return host.createElementNS(namespace, tag);
  }
  return host.createElement(tag);
}

export function safeCreateTextNode(text: string) {
  return getHost().createTextNode(text);
}

export function safeCreateDocumentFragment() {
  return getHost().createDocumentFragment();
}
