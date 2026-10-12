import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { build } from "@timeless/timeless-dom";
import { A2UIRenderer, BASIC_CATALOG_ID } from "../index";
import { NodeFixture } from "./node-fixture";
function find(node: NodeFixture, name: string): NodeFixture | undefined {
  if (node.attributes.get("n") === name) return node;
  for (const child of node.childNodes) {
    const match = find(child, name);
    if (match) return match;
  }
  return undefined;
}
function mount(renderer: A2UIRenderer): NodeFixture {
  const node = build(renderer.element).render() as unknown as NodeFixture;
  renderer.element.onMounted({ target: renderer.element.$elm });
  return node;
}
const create = {
  version: "v0.9.1",
  createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG_ID },
};
describe("Timeless DOM protocol rendering", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("document", {
      createElement: () => new NodeFixture(1),
      createElementNS: () => new NodeFixture(1),
      createTextNode: (text: string) => new NodeFixture(3, text),
      createDocumentFragment: () => new NodeFixture(11),
    });
  });
  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });
  it("buffers a missing root and updates text without replacing the input node", () => {
    const renderer = new A2UIRenderer();
    renderer.processMessage(create);
    const node = mount(renderer);
    renderer.processMessage({
      version: "v0.9.1",
      updateComponents: {
        surfaceId: "main",
        components: [
          { id: "title", component: "Text", text: { path: "/name" } },
        ],
      },
    });
    expect(node.textContent).toBe("");
    renderer.processMessage({
      version: "v0.9.1",
      updateComponents: {
        surfaceId: "main",
        components: [
          { id: "root", component: "Column", children: ["title", "input"] },
          {
            id: "input",
            component: "TextField",
            label: "Name",
            value: { path: "/name" },
          },
        ],
      },
    });
    renderer.processMessage({
      version: "v0.9.1",
      updateDataModel: { surfaceId: "main", value: { name: "Alice" } },
    });
    const input = find(node, "a2ui-TextField:input:input")!;
    expect(input.value).toBe("Alice");
    expect(node.textContent).toContain("Alice");
    renderer.processMessage({
      version: "v0.9.1",
      updateDataModel: { surfaceId: "main", path: "/name", value: "Bob" },
    });
    expect(find(node, "a2ui-TextField:input:input")).toBe(input);
    expect(input.value).toBe("Bob");
    input.value = "Carol";
    input.dispatch("input");
    expect(node.textContent).toContain("Carol");
    expect(input.value).toBe("Carol");
    renderer.processMessage({
      version: "v0.9.1",
      deleteSurface: { surfaceId: "main" },
    });
    expect(node.textContent).toBe("");
    renderer.destroy();
  });
  it("converts date-time input to ISO and dispatches action context at click time", () => {
    const send = vi.fn();
    const renderer = new A2UIRenderer({ onClientMessage: send });
    renderer.processMessage(create);
    renderer.processMessages([
      {
        version: "v0.9.1",
        updateComponents: {
          surfaceId: "main",
          components: [
            { id: "root", component: "Column", children: ["date", "save"] },
            {
              id: "date",
              component: "DateTimeInput",
              value: { path: "/date" },
              enableDate: true,
              enableTime: true,
            },
            {
              id: "save",
              component: "Button",
              child: "title",
              action: {
                event: { name: "save", context: { date: { path: "/date" } } },
              },
            },
            { id: "title", component: "Text", text: "Save" },
          ],
        },
      },
      {
        version: "v0.9.1",
        updateDataModel: {
          surfaceId: "main",
          value: { date: "2026-05-02T12:00:00Z" },
        },
      },
    ]);
    const node = mount(renderer);
    const input = find(node, "a2ui-DateTimeInput:date:input")!;
    expect(input.value).toMatch(/^2026-05-02T/);
    input.value = "2026-05-03T10:30";
    input.dispatch("input");
    expect(send).not.toHaveBeenCalled();
    find(node, "a2ui-Button:save:content")!.dispatch("click");
    expect(send.mock.calls[0][0].action.context.date).toBe(
      new Date("2026-05-03T10:30").toISOString(),
    );
    renderer.destroy();
  });
  it("renders templates with relative bindings and keeps other surfaces independent", () => {
    const renderer = new A2UIRenderer();
    renderer.processMessage(create);
    renderer.processMessage({
      version: "v0.9.1",
      updateComponents: {
        surfaceId: "main",
        components: [
          {
            id: "root",
            component: "List",
            children: { componentId: "name", path: "/users" },
          },
          { id: "name", component: "Text", text: { path: "name" } },
        ],
      },
    });
    const node = mount(renderer);
    renderer.processMessage({
      version: "v0.9.1",
      updateDataModel: {
        surfaceId: "main",
        value: { users: [{ name: "Alice" }, { name: "Bob" }] },
      },
    });
    expect(node.textContent).toBe("AliceBob");
    renderer.processMessage({
      version: "v0.9.1",
      updateDataModel: {
        surfaceId: "main",
        path: "/users/0/name",
        value: "Carol",
      },
    });
    expect(node.textContent).toBe("CarolBob");
    renderer.processMessage({
      version: "v0.9.1",
      updateDataModel: {
        surfaceId: "main",
        path: "/users",
        value: [{ name: "Dave" }],
      },
    });
    expect(node.textContent).toBe("Dave");
    renderer.destroy();
  });
  it("renders the unchanged official contact-form stream, including textarea and reactive checks", () => {
    const renderer = new A2UIRenderer();
    const messages = readFileSync(
      new URL("./fixtures/contact_form_example.jsonl", import.meta.url),
      "utf8",
    )
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    renderer.processMessages(messages.slice(0, -1));
    const node = mount(renderer);
    expect(node.textContent).toContain("First Name");
    expect(node.textContent).toContain("Send Message");
    renderer.processMessage(messages.at(-1));
    expect(node.textContent).toBe("");
    renderer.destroy();
  });
});
