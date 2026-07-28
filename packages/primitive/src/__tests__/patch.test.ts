import { describe, it, expect } from "vitest";
import { refarr } from "@timeless/inner-reactive";

import { isElement } from "@/content/type";
import { View } from "@/content/view";
import { Button } from "@/interaction/button";
import { Row } from "@/layout/row";
import { Column } from "@/layout/column";
import { For } from "../reactive/for";
import { Show } from "../reactive/show";
import { Portal } from "../content/portal";

import { diff_element, PatchAction } from "../hmr/patch";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Minimal mock $elm that supports all patchable DOM operations. */
function mockElm() {
  return {
    setText: () => {},
    setStyle: () => {},
    setStyleSet: () => {},
    setAttribute: () => {},
    removeAttribute: () => {},
  };
}

/**
 * Simulate mounting: walk the element tree depth-first and assign a
 * fresh mock $elm to every node, exactly as the renderer would do.
 */
function mount<T extends { $elm: any; children?: (any | null)[] }>(el: T): T {
  el.$elm = mockElm();
  for (const child of el.children ?? []) {
    if (child && isElement(child)) {
      mount(child);
    }
  }
  return el;
}

/** Pull actions of a specific type out of a patch result. */
function only<K extends PatchAction["type"]>(
  actions: PatchAction[],
  kind: K,
): Extract<PatchAction, { type: K }>[] {
  return actions.filter(
    (a): a is Extract<PatchAction, { type: K }> => a.type === kind,
  );
}

// ─── View + text ─────────────────────────────────────────────────────────────

describe('View({}, ["Hello"]) → View({}, ["Hello Timeless"])', () => {
  it("produces a single SetTextAction", () => {
    const old$ = View({}, ["Hello"]);
    const new$ = View({}, ["Hello Timeless"]);

    const actions = diff_element(old$, new$);

    expect(only(actions, "set_text")).toHaveLength(1);
    expect(only(actions, "set_text")[0].value).toBe("Hello Timeless");
  });

  it("produces no actions when text is unchanged", () => {
    const old$ = View({}, ["Hello"]);
    const new$ = View({}, ["Hello"]);

    expect(diff_element(old$, new$)).toEqual([]);
  });

  it("elm in SetTextAction is null when $elm is not yet mounted", () => {
    // action IS emitted; elm is null until the component is attached to the real DOM
    const old$ = View({}, ["Hello"]);
    const new$ = View({}, ["Hello Timeless"]);

    const actions = diff_element(old$, new$);

    expect(only(actions, "set_text")).toHaveLength(1);
    expect(only(actions, "set_text")[0].elm).toBeNull();
    expect((old$.children![0] as any).state.value).toBe("Hello Timeless");
  });
});

// ─── View + style ────────────────────────────────────────────────────────────

describe("View with style changes", () => {
  it("produces SetStyleAction when a value changes", () => {
    const old$ = View({ style: { color: "red" } });
    const new$ = View({ style: { color: "blue" } });

    const sets = only(diff_element(old$, new$), "set_style");

    expect(sets).toHaveLength(1);
    expect(sets[0].style).toEqual({ color: "blue" });
  });

  it("produces SetStyleAction when a property is added", () => {
    const old$ = View({ style: { color: "red" } });
    const new$ = View({ style: { color: "red", fontWeight: "bold" } });

    const sets = only(diff_element(old$, new$), "set_style");

    expect(sets).toHaveLength(1);
    expect(sets[0].style).toMatchObject({ color: "red", fontWeight: "bold" });
  });

  it("produces SetStyleAction when a property is removed", () => {
    const old$ = View({ style: { color: "red", fontSize: "14px" } });
    const new$ = View({ style: { color: "red" } });

    const sets = only(diff_element(old$, new$), "set_style");

    expect(sets).toHaveLength(1);
    expect(sets[0].style).toEqual({ color: "red" });
  });

  it("produces no action when style is identical", () => {
    const old$ = View({ style: { color: "red" } });
    const new$ = View({ style: { color: "red" } });

    expect(only(diff_element(old$, new$), "set_style")).toHaveLength(0);
  });

  it("mutates old style state after a change", () => {
    const old$ = View({ style: { color: "red" } });
    diff_element(old$, View({ style: { color: "blue" } }));
    expect(old$.state.style).toEqual({ color: "blue" });
  });
});

// ─── View + class ────────────────────────────────────────────────────────────

describe("View with class changes", () => {
  it('View({ class: "btn" }) → View({ class: "btn active" }) produces SetStyleSetAction', () => {
    const old$ = View({ class: "btn" });
    const new$ = View({ class: "btn active" });

    const sets = only(diff_element(old$, new$), "set_style_set");

    expect(sets).toHaveLength(1);
    expect(sets[0].styleSet).toEqual(["btn", "active"]);
  });

  it("produces SetStyleSetAction when a class is removed", () => {
    const old$ = View({ class: "btn active" });
    const new$ = View({ class: "btn" });

    const sets = only(diff_element(old$, new$), "set_style_set");

    expect(sets).toHaveLength(1);
    expect(sets[0].styleSet).toEqual(["btn"]);
  });

  it("produces no action when class is unchanged", () => {
    const old$ = View({ class: "btn active" });
    const new$ = View({ class: "btn active" });

    expect(only(diff_element(old$, new$), "set_style_set")).toHaveLength(0);
  });
});

// ─── View + attributes ───────────────────────────────────────────────────────

describe("View with attribute changes", () => {
  it("produces SetAttributeAction for a new attribute", () => {
    const old$ = View({ attributes: {} });
    const new$ = View({ attributes: { tabIndex: 0 } });

    const sets = only(diff_element(old$, new$), "set_attribute");

    expect(sets).toHaveLength(1);
    expect(sets[0]).toMatchObject({ key: "tabIndex", value: "0" });
  });

  it("produces RemoveAttributeAction for a deleted attribute", () => {
    const old$ = View({ attributes: { disabled: true } });
    const new$ = View({});

    const removes = only(diff_element(old$, new$), "remove_attribute");

    expect(removes).toHaveLength(1);
    expect(removes[0].key).toBe("disabled");
  });

  it("produces SetAttributeAction when an attribute value changes", () => {
    const old$ = View({ attributes: { tabIndex: 0 } });
    const new$ = View({ attributes: { tabIndex: 1 } });

    const sets = only(diff_element(old$, new$), "set_attribute");

    expect(sets).toHaveLength(1);
    expect(sets[0].value).toBe("1");
  });

  it("produces no actions when attributes are unchanged", () => {
    const old$ = View({ attributes: { disabled: true } });
    const new$ = View({ attributes: { disabled: true } });

    const actions = diff_element(old$, new$);

    expect(only(actions, "set_attribute")).toHaveLength(0);
    expect(only(actions, "remove_attribute")).toHaveLength(0);
  });
});

// ─── Button ──────────────────────────────────────────────────────────────────

describe("Button label change", () => {
  it('Button({}, ["Click me"]) → Button({}, ["Submit"]) produces SetTextAction', () => {
    const old$ = Button({}, ["Click me"]);
    const new$ = Button({}, ["Submit"]);

    const sets = only(diff_element(old$, new$), "set_text");

    expect(sets).toHaveLength(1);
    expect(sets[0].value).toBe("Submit");
  });

  it("produces no actions when label is unchanged", () => {
    const old$ = Button({}, ["Click me"]);
    const new$ = Button({}, ["Click me"]);

    expect(diff_element(old$, new$)).toEqual([]);
  });

  it("Button with style change produces SetStyleAction", () => {
    const old$ = Button({ style: { opacity: "0.5" } }, ["Disabled"]);
    const new$ = Button({ style: { opacity: "1" } }, ["Disabled"]);

    const sets = only(diff_element(old$, new$), "set_style");

    expect(sets).toHaveLength(1);
    expect(sets[0].style).toEqual({ opacity: "1" });
  });
});

// ─── Type mismatch → ReplaceAction ───────────────────────────────────────────

describe("type mismatch → ReplaceAction", () => {
  it("View vs Button at root produces a single ReplaceAction", () => {
    const old$ = View({}, ["Hello"]);
    const new$ = Button({}, ["Hello"]);

    const actions = diff_element(old$, new$);

    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe("replace");
  });

  it("Row vs Column at root produces a single ReplaceAction", () => {
    const old$ = Row({}, [View({}, ["A"])]);
    const new$ = Column({}, [View({}, ["A"])]);

    const actions = diff_element(old$, new$);

    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe("replace");
  });

  it("child type mismatch produces ReplaceAction for that slot", () => {
    // old: Row > [View], new: Row > [Button]
    const old$ = Row({}, [View({}, ["label"])]);
    const new$ = Row({}, [Button({}, ["label"])]);

    const replaces = only(diff_element(old$, new$), "replace");

    expect(replaces).toHaveLength(1);
    expect(replaces[0].old_element.t).toBe("view");
    expect(replaces[0].new_element.t).toBe("button");
  });
});

// ─── Row with multiple children ───────────────────────────────────────────────

describe("Row with multiple View children", () => {
  it("produces SetTextAction for each changed child", () => {
    const old$ = Row({}, [View({}, ["A"]), View({}, ["B"])]);
    const new$ = Row({}, [View({}, ["A_new"]), View({}, ["B_new"])]);

    const textActions = only(diff_element(old$, new$), "set_text");

    expect(textActions).toHaveLength(2);
    expect(textActions.map((a) => a.value)).toEqual(
      expect.arrayContaining(["A_new", "B_new"]),
    );
  });

  it("only patches the one changed sibling", () => {
    const old$ = Row({}, [View({}, ["A"]), View({}, ["B"])]);
    const new$ = Row({}, [View({}, ["A"]), View({}, ["B_new"])]);

    const textActions = only(diff_element(old$, new$), "set_text");

    expect(textActions).toHaveLength(1);
    expect(textActions[0].value).toBe("B_new");
  });
});

// ─── Column with mixed changes ────────────────────────────────────────────────

describe("Column with mixed style and text changes", () => {
  it("emits SetStyleAction and SetTextAction in a single patch", () => {
    const old$ = Column({}, [
      Button({}, ["Click me"]),
      View({ style: { color: "red" } }, ["status: ok"]),
    ]);
    const new$ = Column({}, [
      Button({}, ["Submit"]),
      View({ style: { color: "green" } }, ["status: done"]),
    ]);

    const actions = diff_element(old$, new$);

    expect(only(actions, "set_text").map((a) => a.value)).toEqual(
      expect.arrayContaining(["Submit", "status: done"]),
    );
    expect(only(actions, "set_style")).toHaveLength(1);
    expect(only(actions, "set_style")[0].style).toEqual({ color: "green" });
  });
});

// ─── Deeply nested tree ───────────────────────────────────────────────────────

describe("deeply nested tree", () => {
  it("propagates SetTextAction to a grandchild text node", () => {
    // View > Row > View > "Hello"
    const old$ = View({}, [Row({}, [View({}, ["Hello"])])]);
    const new$ = View({}, [Row({}, [View({}, ["World"])])]);

    const sets = only(diff_element(old$, new$), "set_text");

    expect(sets).toHaveLength(1);
    expect(sets[0].value).toBe("World");
  });

  it("collects actions at every level of the tree", () => {
    // outer View changes style, inner Button changes label
    const old$ = View({ style: { padding: "8px" } }, [
      Row({}, [Button({}, ["old label"])]),
    ]);
    const new$ = View({ style: { padding: "16px" } }, [
      Row({}, [Button({}, ["new label"])]),
    ]);

    const actions = diff_element(old$, new$);

    expect(only(actions, "set_style")).toHaveLength(1);
    expect(only(actions, "set_style")[0].style).toEqual({ padding: "16px" });
    expect(only(actions, "set_text")).toHaveLength(1);
    expect(only(actions, "set_text")[0].value).toBe("new label");
  });
});

// ─── For ─────────────────────────────────────────────────────────────────────

describe("For – text items", () => {
  it("produces SetTextAction for each changed item", () => {
    // mirrors dom-demo pattern: For({ each: items, render: item => View({}, [item]) })
    const old$ = For({
      each: refarr(["A", "B"]),
      render: (item) => View({}, [item as string]),
    });
    const new$ = For({
      each: refarr(["A_new", "B_new"]),
      render: (item) => View({}, [item as string]),
    });

    const actions = only(diff_element(old$, new$), "set_text");

    expect(actions).toHaveLength(2);
    expect(actions.map((a) => a.value)).toEqual(
      expect.arrayContaining(["A_new", "B_new"]),
    );
  });

  it("produces no actions when all items are unchanged", () => {
    const old$ = For({
      each: refarr(["A", "B"]),
      render: (item) => View({}, [item as string]),
    });
    const new$ = For({
      each: refarr(["A", "B"]),
      render: (item) => View({}, [item as string]),
    });

    expect(diff_element(old$, new$)).toEqual([]);
  });

  it("only patches the changed item, leaves unchanged sibling alone", () => {
    const old$ = For({
      each: refarr(["A", "B"]),
      render: (item) => View({}, [item as string]),
    });
    const new$ = For({
      each: refarr(["A", "B_new"]),
      render: (item) => View({}, [item as string]),
    });

    const actions = only(diff_element(old$, new$), "set_text");

    expect(actions).toHaveLength(1);
    expect(actions[0].value).toBe("B_new");
  });
});

describe("For – object items (dom-demo todo pattern)", () => {
  type Todo = { id: number; title: string; completed: boolean };

  it("produces SetTextAction when a todo title changes", () => {
    // mirrors: For({ key: "id", each: todos_, render: todo => View({}, [todo.title]) })
    const old$ = For<Todo>({
      key: "id",
      each: refarr<Todo>([
        { id: 1, title: "Buy groceries", completed: true },
        { id: 2, title: "Study for exam", completed: false },
      ]),
      render: (todo) => View({}, [todo.title]),
    });
    const new$ = For<Todo>({
      key: "id",
      each: refarr<Todo>([
        { id: 1, title: "Buy milk", completed: true },
        { id: 2, title: "Study for exam", completed: false },
      ]),
      render: (todo) => View({}, [todo.title]),
    });

    const actions = only(diff_element(old$, new$), "set_text");

    expect(actions).toHaveLength(1);
    expect(actions[0].value).toBe("Buy milk");
  });

  it("produces SetStyleAction and SetTextAction for style+title changes", () => {
    // mirrors: For render returning View with style + text child
    type Item = { id: number; title: string; done: boolean };
    const old$ = For<Item>({
      key: "id",
      each: refarr<Item>([{ id: 1, title: "Read a book", done: false }]),
      render: (item) =>
        View(
          { style: { "text-decoration": item.done ? "line-through" : "none" } },
          [item.title],
        ),
    });
    const new$ = For<Item>({
      key: "id",
      each: refarr<Item>([{ id: 1, title: "Read two books", done: true }]),
      render: (item) =>
        View(
          { style: { "text-decoration": item.done ? "line-through" : "none" } },
          [item.title],
        ),
    });

    const actions = diff_element(old$, new$);

    expect(only(actions, "set_style")[0].style).toEqual({
      "text-decoration": "line-through",
    });
    expect(only(actions, "set_text")[0].value).toBe("Read two books");
  });
});

// ─── Show ─────────────────────────────────────────────────────────────────────

describe("Show – when: true", () => {
  it("produces SetTextAction when ok content changes", () => {
    const old$ = Show({
      when: true,
      ok: () => [View({}, ["visible content"])],
    });
    const new$ = Show({
      when: true,
      ok: () => [View({}, ["updated content"])],
    });

    const actions = only(diff_element(old$, new$), "set_text");

    expect(actions).toHaveLength(1);
    expect(actions[0].value).toBe("updated content");
  });

  it("produces no actions when ok content is unchanged", () => {
    const old$ = Show({ when: true, ok: () => [View({}, ["same"])] });
    const new$ = Show({ when: true, ok: () => [View({}, ["same"])] });

    expect(diff_element(old$, new$)).toEqual([]);
  });

  it("produces SetStyleAction on child inside Show", () => {
    const old$ = Show({
      when: true,
      ok: () => [View({ style: { color: "red" } }, ["label"])],
    });
    const new$ = Show({
      when: true,
      ok: () => [View({ style: { color: "green" } }, ["label"])],
    });

    const styleActions = only(diff_element(old$, new$), "set_style");

    expect(styleActions).toHaveLength(1);
    expect(styleActions[0].style).toEqual({ color: "green" });
  });
});

describe("Show – when: false", () => {
  it("produces no actions when Show is hidden (no children to diff)", () => {
    const old$ = Show({ when: false, ok: () => [View({}, ["hidden"])] });
    const new$ = Show({ when: false, ok: () => [View({}, ["still hidden"])] });

    // children are [] on both sides when when=false and no else
    expect(diff_element(old$, new$)).toEqual([]);
  });

  it("patches else branch content when when: false", () => {
    const old$ = Show({
      when: false,
      ok: () => [View({}, ["ok"])],
      else: () => [View({}, ["fallback"])],
    });
    const new$ = Show({
      when: false,
      ok: () => [View({}, ["ok"])],
      else: () => [View({}, ["fallback updated"])],
    });

    const actions = only(diff_element(old$, new$), "set_text");

    expect(actions).toHaveLength(1);
    expect(actions[0].value).toBe("fallback updated");
  });
});

// ─── Portal ───────────────────────────────────────────────────────────────────

describe("Portal", () => {
  it("produces SetTextAction when Portal content changes", () => {
    // mirrors dom-demo: Portal({}, [View({}, ["popup content"])])
    const old$ = Portal({}, [View({}, ["Popup Content"])]);
    const new$ = Portal({}, [View({}, ["Updated Content"])]);

    const actions = only(diff_element(old$, new$), "set_text");

    expect(actions).toHaveLength(1);
    expect(actions[0].value).toBe("Updated Content");
  });

  it("produces SetStyleAction when Portal child style changes", () => {
    // mirrors dom-demo: Portal > View with background-color
    const old$ = Portal({}, [
      View({ style: { "background-color": "#fff" } }, ["body"]),
    ]);
    const new$ = Portal({}, [
      View({ style: { "background-color": "#eee" } }, ["body"]),
    ]);

    const styleActions = only(diff_element(old$, new$), "set_style");

    expect(styleActions).toHaveLength(1);
    expect(styleActions[0].style).toEqual({ "background-color": "#eee" });
  });

  it("produces no actions when Portal content is unchanged", () => {
    const old$ = Portal({}, [View({}, ["same"])]);
    const new$ = Portal({}, [View({}, ["same"])]);

    expect(diff_element(old$, new$)).toEqual([]);
  });
});

// ─── For render returns Show ──────────────────────────────────────────────────

describe("For render returns Show", () => {
  it("propagates SetTextAction through For → Show → View", () => {
    // Each item renders a Show that wraps a View
    const old$ = For({
      each: refarr(["hello"]),
      render: (item) =>
        Show({ when: true, ok: () => [View({}, [item as string])] }),
    });
    const new$ = For({
      each: refarr(["world"]),
      render: (item) =>
        Show({ when: true, ok: () => [View({}, [item as string])] }),
    });

    const actions = only(diff_element(old$, new$), "set_text");

    expect(actions).toHaveLength(1);
    expect(actions[0].value).toBe("world");
  });

  it("produces class and text changes across For → Show → View", () => {
    const old$ = For({
      each: refarr(["A", "B"]),
      render: (item) =>
        Show({
          when: true,
          ok: () => [View({ class: "tag" }, [item as string])],
        }),
    });
    const new$ = For({
      each: refarr(["A_new", "B_new"]),
      render: (item) =>
        Show({
          when: true,
          ok: () => [View({ class: "tag active" }, [item as string])],
        }),
    });

    const actions = diff_element(old$, new$);

    // Each of the 2 items contributes a set_style_set + set_text
    expect(only(actions, "set_style_set")).toHaveLength(2);
    expect(only(actions, "set_text")).toHaveLength(2);
    expect(only(actions, "set_text").map((a) => a.value)).toEqual(
      expect.arrayContaining(["A_new", "B_new"]),
    );
  });
});

// ─── Show ok returns For ──────────────────────────────────────────────────────

describe("Show ok returns For", () => {
  it("propagates SetTextAction through Show → For → View", () => {
    const old$ = Show({
      when: true,
      ok: () => [
        For({
          each: refarr(["A", "B"]),
          render: (item) => View({}, [item as string]),
        }),
      ],
    });
    const new$ = Show({
      when: true,
      ok: () => [
        For({
          each: refarr(["A_new", "B_new"]),
          render: (item) => View({}, [item as string]),
        }),
      ],
    });

    const actions = only(diff_element(old$, new$), "set_text");

    expect(actions).toHaveLength(2);
    expect(actions.map((a) => a.value)).toEqual(
      expect.arrayContaining(["A_new", "B_new"]),
    );
  });

  it("produces no actions when Show ok For content is unchanged", () => {
    const old$ = Show({
      when: true,
      ok: () => [
        For({
          each: refarr(["A", "B"]),
          render: (item) => View({}, [item as string]),
        }),
      ],
    });
    const new$ = Show({
      when: true,
      ok: () => [
        For({
          each: refarr(["A", "B"]),
          render: (item) => View({}, [item as string]),
        }),
      ],
    });

    expect(diff_element(old$, new$)).toEqual([]);
  });
});

// ─── Portal inside Show (dom-demo popup pattern) ──────────────────────────────

describe("Show → Portal (dom-demo popup pattern)", () => {
  it("propagates SetTextAction through Show → Portal → View", () => {
    // mirrors: Show({ when: visible_, ok() { return Portal({}, [View({}, ["content"])]) } })
    const old$ = View({}, [
      Show({
        when: true,
        ok: () => [
          Portal({}, [View({}, [View({}, ["first content in body"])])]),
        ],
      }),
    ]);
    const new$ = View({}, [
      Show({
        when: true,
        ok: () => [
          Portal({}, [View({}, [View({}, ["first content updated"])])]),
        ],
      }),
    ]);

    const actions = only(diff_element(old$, new$), "set_text");

    expect(actions).toHaveLength(1);
    expect(actions[0].value).toBe("first content updated");
  });

  it("handles style and multiple text changes inside Show → Portal", () => {
    // mirrors dom-demo's nested Popper > View with background + two text children
    const old$ = Show({
      when: true,
      ok: () => [
        Portal({}, [
          View({ style: { "background-color": "#fff" } }, [
            View({}, ["first content in body"]),
            View({}, ["second content in body"]),
          ]),
        ]),
      ],
    });
    const new$ = Show({
      when: true,
      ok: () => [
        Portal({}, [
          View({ style: { "background-color": "#eee" } }, [
            View({}, ["first content updated"]),
            View({}, ["second content updated"]),
          ]),
        ]),
      ],
    });

    const actions = diff_element(old$, new$);

    expect(only(actions, "set_style")[0].style).toEqual({
      "background-color": "#eee",
    });
    expect(only(actions, "set_text").map((a) => a.value)).toEqual(
      expect.arrayContaining([
        "first content updated",
        "second content updated",
      ]),
    );
  });
});

// ─── For → Show → Portal (deeply composed) ───────────────────────────────────

describe("For → Show → Portal (maximally nested)", () => {
  it("collects actions from every layer", () => {
    // Each item renders: Show → Portal → View(style) > View(text)
    type Item = { label: string; active: boolean };

    const old$ = For<Item>({
      each: refarr<Item>([
        { label: "Movies", active: false },
        { label: "Music", active: true },
      ]),
      render: (item) =>
        Show({
          when: true,
          ok: () => [
            Portal({}, [
              View({ style: { opacity: item.active ? "1" : "0.5" } }, [
                item.label,
              ]),
            ]),
          ],
        }),
    });

    const new$ = For<Item>({
      each: refarr<Item>([
        { label: "Movies & Shows", active: true },
        { label: "Music", active: true },
      ]),
      render: (item) =>
        Show({
          when: true,
          ok: () => [
            Portal({}, [
              View({ style: { opacity: item.active ? "1" : "0.5" } }, [
                item.label,
              ]),
            ]),
          ],
        }),
    });

    const actions = diff_element(old$, new$);

    // First item: opacity 0.5→1 (SetStyleAction) + label changed (SetTextAction)
    expect(only(actions, "set_style")).toHaveLength(1);
    expect(only(actions, "set_style")[0].style).toEqual({ opacity: "1" });
    expect(only(actions, "set_text")).toHaveLength(1);
    expect(only(actions, "set_text")[0].value).toBe("Movies & Shows");
    // Second item unchanged → no extra actions
  });
});

// ─── Children: insert ────────────────────────────────────────────────────────

describe("children inserted", () => {
  it("produces InsertChildAction when a child is appended", () => {
    const old$ = Row({}, [View({}, ["A"])]);
    const new$ = Row({}, [View({}, ["A"]), Button({}, ["added"])]);

    const inserts = only(diff_element(old$, new$), "insert_child");

    expect(inserts).toHaveLength(1);
    expect(inserts[0].element.t).toBe("button");
    expect(inserts[0].index).toBe(1);
  });

  it("produces InsertChildAction for each appended child", () => {
    const old$ = Row({});
    const new$ = Row({}, [View({}, ["A"]), View({}, ["B"])]);

    const inserts = only(diff_element(old$, new$), "insert_child");

    expect(inserts).toHaveLength(2);
    expect(inserts[0].index).toBe(0);
    expect(inserts[1].index).toBe(1);
  });

  it("insert_child carries the correct parent reference", () => {
    const old$ = Row({});
    const new$ = Row({}, [View({}, ["X"])]);

    const inserts = only(diff_element(old$, new$), "insert_child");

    expect(inserts[0].parent).toBe(old$);
  });

  it("mutates old_element.children to include the new children", () => {
    const old$ = Row({}, [View({}, ["A"])]);
    const new$ = Row({}, [View({}, ["A"]), View({}, ["B"])]);

    diff_element(old$, new$);

    expect(old$.children).toHaveLength(2);
  });

  it("produces no remove_child actions when only inserting", () => {
    const old$ = Row({}, [View({}, ["A"])]);
    const new$ = Row({}, [View({}, ["A"]), View({}, ["B"])]);

    expect(only(diff_element(old$, new$), "remove_child")).toHaveLength(0);
  });
});

// ─── Children: remove ────────────────────────────────────────────────────────

describe("children removed", () => {
  it("produces RemoveChildAction when the last child is removed", () => {
    const old$ = Row({}, [View({}, ["A"]), View({}, ["B"])]);
    const new$ = Row({}, [View({}, ["A"])]);

    const removes = only(diff_element(old$, new$), "remove_child");

    expect(removes).toHaveLength(1);
    expect(removes[0].element.t).toBe("view");
    expect(removes[0].index).toBe(1);
  });

  it("produces RemoveChildAction for each removed child", () => {
    const old$ = Row({}, [View({}, ["A"]), View({}, ["B"]), View({}, ["C"])]);
    const new$ = Row({}, [View({}, ["A"])]);

    const removes = only(diff_element(old$, new$), "remove_child");

    expect(removes).toHaveLength(2);
  });

  it("emits remove_child actions in reverse index order (high → low)", () => {
    const old$ = Row({}, [View({}, ["A"]), View({}, ["B"]), View({}, ["C"])]);
    const new$ = Row({}, [View({}, ["A"])]);

    const removes = only(diff_element(old$, new$), "remove_child");

    expect(removes[0].index).toBe(2);
    expect(removes[1].index).toBe(1);
  });

  it("removes all children when new has none", () => {
    const old$ = Row({}, [View({}, ["A"]), View({}, ["B"])]);
    const new$ = Row({});

    const removes = only(diff_element(old$, new$), "remove_child");

    expect(removes).toHaveLength(2);
  });

  it("remove_child carries the correct parent reference", () => {
    const old$ = Row({}, [View({}, ["A"]), View({}, ["B"])]);
    const new$ = Row({}, [View({}, ["A"])]);

    const removes = only(diff_element(old$, new$), "remove_child");

    expect(removes[0].parent).toBe(old$);
  });

  it("mutates old_element.children to reflect the removed children", () => {
    const old$ = Row({}, [View({}, ["A"]), View({}, ["B"])]);
    const new$ = Row({}, [View({}, ["A"])]);

    diff_element(old$, new$);

    expect(old$.children).toHaveLength(1);
  });

  it("produces no insert_child actions when only removing", () => {
    const old$ = Row({}, [View({}, ["A"]), View({}, ["B"])]);
    const new$ = Row({}, [View({}, ["A"])]);

    expect(only(diff_element(old$, new$), "insert_child")).toHaveLength(0);
  });
});

// ─── Children: mixed change + structural ─────────────────────────────────────

describe("children: patch existing + insert new", () => {
  it("emits set_text for changed slot and insert_child for new slot", () => {
    const old$ = Row({}, [View({}, ["old"])]);
    const new$ = Row({}, [View({}, ["new"]), Button({}, ["added"])]);

    const actions = diff_element(old$, new$);

    expect(only(actions, "set_text")[0].value).toBe("new");
    expect(only(actions, "insert_child")).toHaveLength(1);
    expect(only(actions, "insert_child")[0].element.t).toBe("button");
  });

  it("old_element.children grows to reflect the inserted child", () => {
    const old$ = Row({}, [View({}, ["A"])]);
    const new$ = Row({}, [View({}, ["A"]), View({}, ["B"])]);

    diff_element(old$, new$);

    expect(old$.children).toHaveLength(2);
  });
});

describe("children: patch existing + remove trailing", () => {
  it("emits set_text for changed slot and remove_child for dropped slot", () => {
    const old$ = Column({}, [View({}, ["keep"]), Button({}, ["drop"])]);
    const new$ = Column({}, [View({}, ["keep updated"])]);

    const actions = diff_element(old$, new$);

    expect(only(actions, "set_text")[0].value).toBe("keep updated");
    expect(only(actions, "remove_child")).toHaveLength(1);
    expect(only(actions, "remove_child")[0].element.t).toBe("button");
  });

  it("old_element.children shrinks to reflect the removed child", () => {
    const old$ = Column({}, [View({}, ["A"]), View({}, ["B"])]);
    const new$ = Column({}, [View({}, ["A"])]);

    diff_element(old$, new$);

    expect(old$.children).toHaveLength(1);
  });
});
