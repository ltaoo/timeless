import { expect, it, vi } from "vitest";
import { ref } from "@/ref";
import { derive } from "@/derive";

it("repeated unsubscribe does not remove a different subscriber", () => {
  const source = ref(0);
  const value = derive({ source }, ({ source }) => source);
  const removed = vi.fn();
  const active = vi.fn();
  const detach = value.subscribe({ onChange: removed });
  const detach_active = value.subscribe({ onChange: active });
  detach();
  detach();
  source.as(1);
  expect(removed).not.toHaveBeenCalled();
  expect(active).toHaveBeenCalledTimes(1);
  detach_active();
  value.destroy();
  value.destroy();
  expect(source.getDeps()).toHaveLength(0);
});
