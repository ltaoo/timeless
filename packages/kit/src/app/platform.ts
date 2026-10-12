export type {
  HostRect,
  TextRange,
  TextHighlight,
  TextRangeOptions,
  TextHighlightOptions,
  HTMLNode,
  ParsedHTML,
} from "@timeless/inner-base";

export type DownloadInput = {
  filename: string;
  /** Exactly one of url, text and bytes must be supplied. */
  url?: string;
  text?: string;
  bytes?: Uint8Array;
  type?: string;
};

export function unsupported_host_capability(name: string): never {
  throw new Error(`Host provider does not implement ${name}`);
}
