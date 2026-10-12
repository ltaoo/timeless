import { describe, expect, it, vi } from "vitest";
import {
  A2UIModel,
  A2UIRenderer,
  createBasicCatalog,
  BASIC_CATALOG_ID,
  type ClientMessage,
  type TransportMetadata,
  type ComponentDefinition,
} from "../index";
import { readData } from "../data-model";
import basic_schema from "../schemas/catalog.json";
function create(
  onClientMessage?: (
    message: ClientMessage,
    metadata: TransportMetadata,
  ) => void,
) {
  const model = new A2UIModel({
    catalogs: [createBasicCatalog()],
    onClientMessage,
    locale: "en-US",
  });
  model.apply({
    version: "v0.9.1",
    createSurface: {
      surfaceId: "main",
      catalogId: BASIC_CATALOG_ID,
      sendDataModel: true,
    },
  });
  return model;
}
describe("A2UI model", () => {
  it("validates and executes an explicitly registered custom catalog", () => {
    const id = "https://example.com/catalog.json";
    const basic = createBasicCatalog();
    const schema = {
      ...basic_schema,
      $id: id,
      catalogId: id,
      components: {
        ...basic_schema.components,
        Notice: {
          type: "object",
          properties: {
            id: { type: "string" },
            component: { const: "Notice" },
            text: { type: "string" },
          },
          required: ["id", "component", "text"],
          additionalProperties: false,
        },
      },
      functions: {
        ...basic_schema.functions,
        shout: {
          type: "object",
          properties: {
            call: { const: "shout" },
            args: {
              type: "object",
              properties: { value: { type: "string" } },
              required: ["value"],
              additionalProperties: false,
            },
          },
          required: ["call", "args"],
          additionalProperties: false,
        },
      },
      $defs: {
        ...basic_schema.$defs,
        anyComponent: {
          oneOf: [
            ...basic_schema.$defs.anyComponent.oneOf,
            { $ref: "#/components/Notice" },
          ],
        },
        anyFunction: {
          oneOf: [
            ...basic_schema.$defs.anyFunction.oneOf,
            { $ref: "#/functions/shout" },
          ],
        },
      },
    };
    const factory = vi.fn(basic.components.Text);
    const renderer = new A2UIRenderer({
      catalogs: [
        {
          ...basic,
          id,
          schema,
          components: { ...basic.components, Notice: factory },
          functions: {
            ...basic.functions,
            shout: { execute: (args) => String(args.value).toUpperCase() },
          },
        },
      ],
    });
    renderer.processMessages([
      {
        version: "v0.9.1",
        createSurface: { surfaceId: "main", catalogId: id },
      },
      {
        version: "v0.9.1",
        updateComponents: {
          surfaceId: "main",
          components: [{ id: "root", component: "Notice", text: "hello" }],
        },
      },
    ]);
    expect(factory).toHaveBeenCalledOnce();
    expect(
      renderer.model.surfaces
        .get("main")!
        .resolve({ call: "shout", args: { value: "hello" } }),
    ).toBe("HELLO");
    const separate = create();
    expect(() =>
      separate.apply({
        version: "v0.9.1",
        updateComponents: {
          surfaceId: "main",
          components: [{ id: "root", component: "Notice", text: "hello" }],
        },
      }),
    ).toThrow();
    renderer.destroy();
    separate.dispose();
  });
  it("requires surfaces, rejects old envelopes, and reports official validation errors", () => {
    const send = vi.fn();
    const model = create(send);
    expect(() => model.apply({ op: "root", node: {} })).toThrow();
    expect(() =>
      model.apply({
        version: "v0.9.1",
        updateDataModel: { surfaceId: "missing", value: 1 },
      }),
    ).toThrow();
    expect(() =>
      model.apply({
        version: "v1.0",
        updateDataModel: { surfaceId: "main", value: 1 },
      }),
    ).toThrow();
    expect(send.mock.calls[0][0]).toMatchObject({
      version: "v0.9.1",
      error: { code: "VALIDATION_FAILED", path: "/" },
    });
    expect(() =>
      model.apply({
        version: "v0.9.1",
        createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG_ID },
      }),
    ).toThrow("already exists");
    model.dispose();
  });
  it("replaces data, upserts escaped paths, removes keys, and preserves array indices", () => {
    const model = create();
    const surface = model.surfaces.get("main")!;
    surface.setData("/", { list: ["A", "B", "C"] });
    surface.setData("/a~1b/~0key", "escaped");
    expect(readData(surface.data, "/a~1b/~0key")).toBe("escaped");
    surface.setData("/list/1", undefined);
    expect((surface.data as { list: unknown[] }).list).toEqual([
      "A",
      undefined,
      "C",
    ]);
    surface.setData("/a~1b/~0key", undefined);
    expect(readData(surface.data, "/a~1b/~0key")).toBeUndefined();
    expect(() => surface.setData("/list/no", 1)).toThrow("numeric");
    surface.setData("/__proto__/polluted", true);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    surface.setData("/", { user: "new" });
    expect(surface.data).toEqual({ user: "new" });
    model.dispose();
  });
  it("resolves collection scopes, nested functions, formatString escapes, and side-effect boundaries", () => {
    const model = create();
    const surface = model.surfaces.get("main")!;
    surface.setData("/", { users: [{ name: "Alice" }], total: 1234.5 });
    expect(surface.resolve({ path: "name" }, "/users/0")).toBe("Alice");
    expect(
      surface.resolve(
        {
          call: "formatString",
          args: {
            value:
              "Hello ${name}: ${formatNumber(value:${/total}, decimals:2)}; \\${literal}",
          },
        },
        "/users/0",
      ),
    ).toBe("Hello Alice: 1,234.50; ${literal}");
    expect(
      surface.resolve({
        call: "and",
        args: { values: [true, { call: "not", args: { value: false } }] },
      }),
    ).toBe(true);
    expect(
      surface.resolve({
        call: "pluralize",
        args: { value: 2, one: "one", other: "many" },
      }),
    ).toBe("many");
    expect(() =>
      surface.resolve({
        call: "openUrl",
        args: { url: "https://example.com" },
      }),
    ).toThrow("unavailable");
    expect(() =>
      surface.resolve({
        call: "formatString",
        args: { value: "${alert(value:'x')}" },
      }),
    ).toThrow();
    model.dispose();
  });
  it("writes local input without network traffic and sends scoped action context plus metadata", () => {
    const send = vi.fn();
    const model = create(send);
    const surface = model.surfaces.get("main")!;
    const input: ComponentDefinition = {
      id: "field",
      component: "TextField",
      label: "Name",
      value: { path: "name" },
    };
    surface.setData("/", { users: [{ name: "Alice" }] });
    surface.writeInput(input, "/users/0", "Bob");
    expect(send).not.toHaveBeenCalled();
    surface.act({ id: "submit", component: "Button" }, "/users/0", {
      event: {
        name: "save",
        context: { name: { path: "name" }, staticId: "123" },
      },
    });
    expect(send.mock.calls[0][0]).toMatchObject({
      version: "v0.9.1",
      action: {
        surfaceId: "main",
        sourceComponentId: "submit",
        name: "save",
        context: { name: "Bob", staticId: "123" },
      },
    });
    expect(send.mock.calls[0][1].a2uiClientDataModel.surfaces).toEqual({
      main: { users: [{ name: "Bob" }] },
    });
    model.dispose();
  });
  it("rejects cycles atomically and buffers forward component references", () => {
    const model = create();
    const surface = model.surfaces.get("main")!;
    model.apply({
      version: "v0.9.1",
      updateComponents: {
        surfaceId: "main",
        components: [{ id: "root", component: "Column", children: ["later"] }],
      },
    });
    expect(surface.components.size).toBe(1);
    expect(() =>
      model.apply({
        version: "v0.9.1",
        updateComponents: {
          surfaceId: "main",
          components: [
            { id: "later", component: "Column", children: ["root"] },
          ],
        },
      }),
    ).toThrow("Cyclic");
    expect(surface.components.size).toBe(1);
    model.dispose();
  });
  it("isolates surfaces and cleans them when deleted", () => {
    const model = create();
    model.apply({
      version: "v0.9.1",
      createSurface: { surfaceId: "other", catalogId: BASIC_CATALOG_ID },
    });
    model.apply({
      version: "v0.9.1",
      updateDataModel: { surfaceId: "main", value: { text: "one" } },
    });
    const surface = model.surfaces.get("main")!;
    expect(model.surfaces.get("other")!.data).toEqual({});
    model.apply({ version: "v0.9.1", deleteSurface: { surfaceId: "main" } });
    expect(surface.subscriberCount).toBe(0);
    expect(model.surfaces.has("main")).toBe(false);
    model.dispose();
  });
  it("cleans view observers on renderer destruction", () => {
    const renderer = new A2UIRenderer();
    renderer.processMessages([
      {
        version: "v0.9.1",
        createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG_ID },
      },
      {
        version: "v0.9.1",
        updateComponents: {
          surfaceId: "main",
          components: [
            { id: "root", component: "Text", text: { path: "/title" } },
          ],
        },
      },
    ]);
    const surface = renderer.model.surfaces.get("main")!;
    expect(surface.subscriberCount).toBeGreaterThan(0);
    renderer.destroy();
    renderer.destroy();
    expect(surface.subscriberCount).toBe(0);
  });
  it("parses numeric input and allows only HTTP(S) action URLs", () => {
    const open = vi.fn();
    const catalog = createBasicCatalog({ onOpenUrl: open });
    const model = new A2UIModel({ catalogs: [catalog] });
    model.apply({
      version: "v0.9.1",
      createSurface: { surfaceId: "main", catalogId: BASIC_CATALOG_ID },
    });
    const surface = model.surfaces.get("main")!;
    surface.setData("/value", "12.5");
    expect(
      surface.resolve({
        call: "numeric",
        args: { value: { path: "/value" }, min: 10 },
      }),
    ).toBe(true);
    surface.setData("/value", "invalid");
    expect(
      surface.resolve({
        call: "numeric",
        args: { value: { path: "/value" }, min: 10 },
      }),
    ).toBe(false);
    const definition = { id: "link", component: "Button" };
    surface.act(definition, "/", {
      functionCall: { call: "openUrl", args: { url: "https://example.com" } },
    });
    expect(open).toHaveBeenCalledWith("https://example.com/");
    expect(() =>
      surface.act(definition, "/", {
        functionCall: {
          call: "openUrl",
          args: { url: "mailto:test@example.com" },
        },
      }),
    ).toThrow("HTTP(S)");
    model.dispose();
  });
  it("continues disposal when one observer throws", () => {
    const model = create();
    const surface = model.surfaces.get("main")!;
    surface.subscribe(() => {
      throw new Error("broken observer");
    });
    const next = vi.fn();
    surface.subscribe(next);
    expect(() => model.dispose()).toThrow("cleanup failed");
    expect(next).toHaveBeenCalledOnce();
    expect(surface.subscriberCount).toBe(0);
    expect(model.surfaces.size).toBe(0);
    model.dispose();
  });
});
