import { afterEach, describe, expect, it, vi } from "vitest";

import { Img } from "@timeless/timeless";

import { DOMImg } from "@/host/img";

const cover_url =
  "https://finder.video.qq.com/251/20304/stodownload?encfilekey=2fG3V4WwQPm8KZSXoaeImLBPkiaxmLBUmmlnxBw49q4EDPwXKiblUs235J2SZhZXTINUiaicQh3de74J9jMCwcHKh49qsvaLibESM5MOwibtjyagQ&token=o3K9JoTic9IhhiaqklKGF2vkcvTLzroY4x9XrpnDhsBreEPfpdczXyDTj0JJeB0xECbeAtE3Kfyf5TkDv2bUmOsJeZJAm3ibibzMOHwKI5SBqYIvjqp6CHvvicwx947kt1LCL4I4iae30FqR30YPicicd3vjq16GMxzy1IoF9ZpMeOmsDm4y1NNHF8ianlGoNbBOKxBp6fT8icIOgZuRYS9GkicH5oulrKmkfhorlyz&hy=SZ&idx=1&m=732d454ca9833deef73b350f196ed142&uzid=1&wxampicformat=503&picformat=200";

describe("DOMImg", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forwards a failed cover load to Img.onError", () => {
    const listeners = new Map<string, (event: unknown) => void>();
    const image_element = {
      nodeType: 1,
      src: "",
      style: { cssText: "" },
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      addEventListener: vi.fn((type, handler) => {
        listeners.set(type, handler);
      }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal("document", {
      createElement: vi.fn(() => image_element),
    });
    const on_error = vi.fn();
    const image = Img({ src: cover_url, onError: on_error });
    const dom_image = DOMImg({ build: vi.fn(), elm: image });

    expect(dom_image.render()).toBe(image_element);
    expect(image_element.src).toBe(cover_url);

    listeners.get("error")?.({ target: image_element });

    expect(on_error).toHaveBeenCalledOnce();
  });
});
