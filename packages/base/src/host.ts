/** Host capabilities. Native DOM nodes, ranges and media elements stay in providers. */
export type HostRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export interface TextRange {
  text(): string;
  rects(): HostRect[];
  release(): void;
}

export interface TextHighlight {
  rects(): HostRect[];
  clear(): void;
}

export type TextRangeOptions = { exclude?: string };
export type TextHighlightOptions = { name: string; color?: string };

/** A detached parsed document; selectors and serialization are provider operations. */
export interface HTMLNode {
  readonly tag: string;
  text(): string;
  html(): string;
  attr(name: string): string | null;
  attr(name: string, value: string | null): void;
  select(selector: string): HTMLNode | null;
  selectAll(selector: string): HTMLNode[];
  remove(): void;
}

export type ParsedHTML = { root: HTMLNode; head: HTMLNode; body: HTMLNode };
