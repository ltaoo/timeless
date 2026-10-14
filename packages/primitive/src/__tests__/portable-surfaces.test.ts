import { describe, expect, it, vi } from "vitest";
import { ref } from "@timeless/inner-reactive";
import { Modal } from "@/floating/modal";
import { Canvas } from "@/content/canvas";
import { Button } from "@/interaction/button";
import { Img } from "@/content/img";
import { Video } from "@/content/video";
import { Label } from "@/content/label";

describe("portable surfaces", () => {
  it("retains the View host accessor for Canvas and Label", () => {
    for (const element of [Canvas(), Label()]) {
      const host = { setAttribute: vi.fn() };
      element.$elm = host;
      expect(element.$elm).toBe(host);
    }
  });
  it("forwards Label events and disposes mounted resources", () => {
    const cleanup = vi.fn(),
      onClick = vi.fn();
    const label = Label({ onClick, onMounted: () => cleanup });
    expect(label.events.onClick).toBe(onClick);
    label.onMounted({ target: {} });
    label.onUnmounted();
    expect(cleanup).toHaveBeenCalledOnce();
  });
  it("cleans up mounted button and media resources while retaining reactive bindings until destroy", () => {
    for (const factory of [Button, Img, Video]) {
      const title = ref("Before"),
        cleanup = vi.fn();
      const node = factory({ attributes: { title }, onMounted: () => cleanup });
      const host = { setAttribute: vi.fn(), removeAttribute: vi.fn() };
      node.$elm = host;
      node.onMounted({ target: host });
      title.set("After");
      expect(host.setAttribute).toHaveBeenCalledWith("title", "After");
      node.onUnmounted();
      expect(cleanup).toHaveBeenCalledOnce();
      node.$elm = host;
      node.onMounted({ target: host });
      title.set("Remounted");
      expect(host.setAttribute).toHaveBeenLastCalledWith("title", "Remounted");
      node.destroy();
      const calls = host.setAttribute.mock.calls.length;
      title.set("Detached");
      expect(host.setAttribute).toHaveBeenCalledTimes(calls);
    }
  });
  it("delegates modal state and dismissal to the host, cleaning up on unmount", () => {
    const open = ref(false),
      onClose = vi.fn(),
      cleanup = vi.fn();
    const host = { setOpen: vi.fn(), bindDismiss: vi.fn(() => cleanup) };
    const modal = Modal({ open, onClose });
    modal.onMounted({ target: host });
    expect(host.setOpen).toHaveBeenLastCalledWith(false, true);
    open.set(true);
    expect(host.setOpen).toHaveBeenLastCalledWith(true, true);
    expect(host.bindDismiss).toHaveBeenCalledWith(onClose);
    modal.onUnmounted();
    expect(cleanup).toHaveBeenCalledOnce();
    expect(host.setOpen).toHaveBeenLastCalledWith(false, true);
    const calls = host.setOpen.mock.calls.length;
    open.set(false);
    expect(host.setOpen).toHaveBeenCalledTimes(calls);
  });
});
