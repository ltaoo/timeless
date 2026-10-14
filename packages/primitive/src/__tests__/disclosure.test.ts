import { describe, expect, it, vi } from "vitest";
import { Disclosure } from "@/content/disclosure";
import { View } from "@/content/view";
import { ref } from "@timeless/inner-reactive";

function click(trigger: any, prevented = false) {
  const event = {
    defaultPrevented: prevented,
    preventDefault() {
      this.defaultPrevented = true;
    },
  } as MouseEvent;
  trigger.events.onClick(event);
}
describe("Disclosure", () => {
  it("toggles only its own mounted content and exposes its state to assistive technology", () => {
    const content = View({}, ["Retained content"]);
    const first = Disclosure({ summary: ["Details"] }, [content]);
    const second = Disclosure({ summary: ["Another"] }, ["Other"]);
    const [trigger, body] = first.children as any[];
    expect(trigger.t).toBe("button");
    expect(trigger.state.attributes.type).toBe("button");
    expect(trigger.state.attributes["aria-controls"]).toBe(
      body.state.attributes.id,
    );
    expect(trigger.state.attributes["aria-expanded"]).toBe("false");
    expect(body.state.attributes.hidden).toBe(true);
    click(trigger);
    expect(body.state.attributes.hidden).toBe(false);
    expect(trigger.state.attributes["aria-expanded"]).toBe("true");
    expect((second.children[1] as any).state.attributes.hidden).toBe(true);
    click(trigger);
    expect(body.state.attributes.hidden).toBe(true);
    expect(body.children[0].children[0]).toBe(content);
    first.destroy?.();
    second.destroy?.();
  });
  it("supports externally controlled state and an opt-out trigger handler", () => {
    const open = ref(true),
      onToggle = vi.fn();
    const view = Disclosure({
      summary: ["Details"],
      open,
      onToggle,
      triggerProps: { onClick: (event) => event.preventDefault() },
    });
    const [trigger, body] = view.children as any[];
    click(trigger);
    expect(open.value).toBe(true);
    expect(onToggle).not.toHaveBeenCalled();
    open.set(false);
    expect(body.state.attributes.hidden).toBe(true);
    view.destroy?.();
  });
  it("keeps visibility separate from user-supplied flex/grid styles", () => {
    const view = Disclosure({
      summary: ["Details"],
      contentProps: {
        class: "flex",
        style: { display: "flex" },
        attributes: { id: "custom-body" },
      },
    });
    const [trigger, body] = view.children as any[];
    expect(body.state.attributes.id).toBe("custom-body");
    expect(body.state.style?.display).toBeUndefined();
    expect(body.state.attributes.hidden).toBe(true);
    expect(body.children[0].state.style.display).toBe("flex");
    expect(body.children[0].state.attributes.id).toBeUndefined();
    click(trigger);
    expect(body.state.attributes.hidden).toBe(false);
    view.destroy?.();
  });
  it("reports toggles without submitting a surrounding form", () => {
    const onToggle = vi.fn();
    const view = Disclosure({ summary: ["Details"], onToggle });
    click(view.children[0]);
    expect(onToggle).toHaveBeenCalledWith(true);
    view.destroy?.();
  });
});
