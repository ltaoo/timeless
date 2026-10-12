import { afterEach, expect, it, vi } from "vitest";
import { getPlatform, setPlatform } from "@timeless/timeless";
import {
  ApplicationModel,
  ClipboardModel,
  StorageCore,
} from "@timeless/inner-kit";
import { connect } from "../app";

afterEach(() => vi.unstubAllGlobals());

it("connects renderer and Web capabilities onto the application without exposing DOM objects", () => {
  const document_element = {
    setAttribute: vi.fn(),
    style: {},
    classList: { toggle: vi.fn() },
  };
  const doc = {
    documentElement: document_element,
    body: { style: {} },
    addEventListener: vi.fn(),
  };
  const browser = {
    addEventListener: vi.fn(),
    matchMedia: () => ({ matches: false }),
    screen: { availWidth: 0, availHeight: 0 },
    navigator: { userAgent: "test" },
  };
  vi.stubGlobal("window", browser);
  vi.stubGlobal("document", doc);
  vi.stubGlobal("navigator", browser.navigator);
  const previous = getPlatform(),
    parsed = { root: {}, head: {}, body: {} },
    range = { text: () => "word", rects: () => [], release: vi.fn() };
  const parseHTML = vi.fn(() => parsed),
    createTextRange = vi.fn(() => range),
    highlightText = vi.fn(() => ({ clear: vi.fn(), rects: () => [] }));
  setPlatform({
    ...previous,
    parseHTML,
    createTextRange,
    highlightText,
  } as any);
  try {
    const storage = new StorageCore({
      key: "host-test",
      defaultValues: { theme: "system" },
      values: { theme: "system" },
      client: { getItem: () => null, setItem() {} } as any,
    });
    const app = new ApplicationModel({ storage, clipboard: ClipboardModel() });
    connect(app as any);
    expect(app.parseHTML("<p>word</p>")).toBe(parsed);
    expect(app.createTextRange("opaque-node", 0, 4)).toBe(range);
    expect(app.highlightText([range], { name: "note" }).rects()).toEqual([]);
    expect(app.randomUUID()).toMatch(/^[a-f\d-]{36}$/);
    expect(typeof app.download).toBe("function");
    expect(typeof app.audio.speak).toBe("function");
    const stop = vi.spyOn(app.audio, "stop");
    app.destroy();
    expect(stop).toHaveBeenCalled();
  } finally {
    setPlatform(previous);
  }
});
