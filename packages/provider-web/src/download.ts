import type { DownloadInput } from "@timeless/inner-kit";

/** Object URLs live long enough for the browser to consume the click, then are revoked. */
export async function download(
  input: DownloadInput,
  runtime = globalThis,
): Promise<void> {
  if (
    !input.filename ||
    [input.url, input.text, input.bytes].filter((value) => value !== undefined)
      .length !== 1
  ) {
    throw new TypeError("Download requires a filename and exactly one source");
  }
  let owned_url: string | null = null;
  const url =
    input.url !== undefined
      ? input.url
      : (owned_url = runtime.URL.createObjectURL(
          new runtime.Blob(
            [input.bytes ? Uint8Array.from(input.bytes).buffer : input.text!],
            { type: input.type || "application/octet-stream" },
          ),
        ));
  let link: HTMLAnchorElement | undefined;
  try {
    link = runtime.document.createElement("a");
    const parsed = new runtime.URL(url, runtime.document.baseURI);
    if (!["http:", "https:", "blob:", "data:"].includes(parsed.protocol))
      throw new TypeError("Unsupported download URL");
    link.href = parsed.href;
    link.download = input.filename;
    link.hidden = true;
    link.setAttribute("data-n", "file-download-link");
    runtime.document.body.appendChild(link);
    link.click();
  } finally {
    link?.remove();
    if (owned_url)
      runtime.setTimeout(() => runtime.URL.revokeObjectURL(owned_url!), 60000);
  }
}
