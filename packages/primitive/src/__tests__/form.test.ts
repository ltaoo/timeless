import { describe, expect, it, vi } from "vitest";
import { Form } from "@/input/form";

describe("Form shape", () => {
  it("has independent form identity, reactive attributes and native submit/reset events", () => {
    const onSubmit = vi.fn(), onReset = vi.fn();
    const form = Form({ attributes: { method: "post", autocomplete: "on" }, onSubmit, onReset });
    expect(form.t).toBe("form");
    expect(form.state).not.toHaveProperty("as");
    expect(form.events.onSubmit).toBe(onSubmit);
    expect(form.events.onReset).toBe(onReset);
    expect(form.state.attributes).toMatchObject({ method: "post", autocomplete: "on" });
    form.destroy();
  });
});
