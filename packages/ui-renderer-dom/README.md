# @timeless/ui-renderer-dom

DOM adapter for [@timeless/ui-renderer](../ui-renderer/README.md). Call
`createDOMRenderer()` to create a renderer backed by `Timeless.DOM.build`.
The portable registry remains independent of DOM and can use other hosts.

The adapter mounts only its own tree and preserves unrelated container content.
The renderer owns component lifecycle and subscriptions; `mount(container)`
returns an idempotent unmount function.

Load UMD builds after Timeless, Timeless.DOM, and Timeless.UiRenderer. This package
exposes `Timeless.UiRendererDOM.createDOMRenderer` and externalizes both runtime
dependencies. Its integration tests are in `packages/ui-renderer/src/__tests__`.
