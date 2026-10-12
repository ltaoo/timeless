# Web host capabilities

Load `timeless.umd.min.js`, `timeless.dom.umd.min.js`, then
`timeless.web.umd.min.js`. Connect the application and HTTP client in the
application entry point:

```js
Timeless.web.provide_app(app);
Timeless.web.provide_http_client(client, { timeout: 30000 });
```

Views receive `app` and `history` through props. Business modules use injected
capabilities; they do not obtain a document, native Range, media element,
AbortController or cryptographic provider themselves.

```js
const id = props.app.randomUUID();
const html = props.app.parseHTML(source);
for (const image of html.body.selectAll("img")) {
  image.attr("src", resolve_image_url(image.attr("src")));
}
const result = html.body.html();

const range = props.app.createTextRange(view_node, 5, 12, {
  exclude: "[data-note-ui]",
});
const highlight = props.app.highlightText([range], {
  name: "article-note",
  color: "yellow",
});
const boxes = highlight.rects();
// Clear before releasing ranges or disposing the view.
highlight.clear();
range.release();

await props.app.download({
  filename: "notes.md",
  text: markdown,
  type: "text/markdown",
});
// URL and Uint8Array sources are also supported; pass exactly one source.

props.app.audio.load(audio_url);
await props.app.audio.play();
props.app.audio.pause();
await props.app.audio.resume();
props.app.audio.seek(30);
props.app.audio.configure({ rate: 1.25, volume: 0.5 });
props.app.audio.speak(text, { voice: voice_id, language: "zh-CN" });
const voices = props.app.audio.voices();
props.app.audio.stop();

await client.fetch({
  url: "/api/articles",
  method: "GET",
  id: "articles",
  timeout: 60000,
});
client.cancel("articles");
```

Text offsets use UTF-16 units and concatenate text nodes in document order.
Excluded subtrees are omitted. A text range is an opaque handle with `text()`,
`rects()` and `release()`. Native CSS highlights preserve markup; the compatibility
path wraps selected text in marks and restores the markup when cleared.
Use `clear()` to dispose a highlight. Clearing a highlight does not release ranges.

HTML parsing returns detached wrappers with `select`, `selectAll`, `attr`, `text`,
`html` and `remove`. **Parsing does not sanitize HTML**; sanitize content before
rendering it. The parser does not execute scripts or mount its result.

`AudioCore` owns playback state and ignores events from stopped sessions. The Web
provider owns native audio, speech synthesis and optional OS Media Session controls.
Use `onStateChange` and `onVoicesChange` to observe it, and `destroy()` to release it.

Timeout values are milliseconds. Per-request options override client defaults,
which override provider defaults. Zero disables a default timeout. The deadline
covers transport and response-body parsing. Timeout failures have name
`TimeoutError`; explicit cancellation has name `AbortError`. External signals remain
supported for compatibility, but consumers can use request IDs without creating one.
`RequestCore`, `request.*`, `request_factory` and client helpers forward `timeout`.

Other hosts can implement `Platform.parseHTML`, `Platform.createTextRange`,
`Platform.highlightText`, connect an `AudioProvider` to `app.audio`, and supply
`app.download` and `app.randomUUID`. Missing capabilities throw explicitly.

Run the related regressions from the repository root:

```sh
pnpm exec vitest run --config vitest.platform.config.ts
pnpm build
```
