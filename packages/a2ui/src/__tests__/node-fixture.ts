export class NodeFixture {
  nodeType: number;
  value = "";
  checked = false;
  type = "";
  classList = { add: (..._tokens: string[]) => {} };
  private events = new Map<
    string,
    Set<(event: { target: NodeFixture }) => void>
  >();
  parentNode: NodeFixture | null = null;
  childNodes: NodeFixture[] = [];
  attributes = new Map<string, string>();
  style: Record<string, string> = { cssText: "" };
  private text = "";
  constructor(nodeType: number, text = "") {
    this.nodeType = nodeType;
    this.text = text;
  }
  get parentElement(): NodeFixture | null {
    return this.parentNode?.nodeType === 1 ? this.parentNode : null;
  }
  get textContent(): string {
    return this.nodeType === 3
      ? this.text
      : this.childNodes.map((node) => node.textContent).join("");
  }
  set textContent(text: string) {
    this.text = text;
  }
  appendChild(node: NodeFixture): NodeFixture {
    return this.insertBefore(node, null);
  }
  insertBefore(node: NodeFixture, before: NodeFixture | null): NodeFixture {
    if (node.nodeType === 11) {
      for (const child of [...node.childNodes])
        this.insertBefore(child, before);
      return node;
    }
    node.parentNode?.removeChild(node);
    const index =
      before === null
        ? this.childNodes.length
        : this.childNodes.indexOf(before);
    if (index < 0) throw new Error("Anchor is not a child");
    this.childNodes.splice(index, 0, node);
    node.parentNode = this;
    return node;
  }
  removeChild(node: NodeFixture): NodeFixture {
    const index = this.childNodes.indexOf(node);
    if (index < 0) throw new Error("Node is not a child");
    this.childNodes.splice(index, 1);
    node.parentNode = null;
    return node;
  }
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
  addEventListener(
    name: string,
    listener: (event: { target: NodeFixture }) => void,
  ) {
    if (!this.events.has(name)) this.events.set(name, new Set());
    this.events.get(name)!.add(listener);
  }
  removeEventListener(
    name: string,
    listener: (event: { target: NodeFixture }) => void,
  ) {
    this.events.get(name)?.delete(listener);
  }
  dispatch(name: string) {
    for (const listener of this.events.get(name) ?? [])
      listener({ target: this });
  }
}
