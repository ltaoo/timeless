# Gallery

`vm.GalleryCore` owns items, selected index, modal visibility, loading/error state and navigation. `ui.GalleryPrimitive` provides Root, Grid, Thumbnail, Preview, Previous, Next and Close. The six theme packages export `Gallery({ store, ...ViewProps })` and compose these shared parts with their own CSS.

```js
const store = new Timeless.vm.GalleryCore({
  items: [
    { src: "/photo.jpg", thumbnail: "/photo-small.jpg", alt: "山谷", caption: "周末旅行" },
  ],
  loop: false,
});
Timeless.shadcn.Gallery({ store });
store.open(0);
```

Item fields: src (required), thumbnail, alt, caption. Methods: open(index), close(), select(index), previous(), next(), setItems(items), onStateChange(handler). Default loop is true. Empty galleries cannot open; bounded navigation disables controls. Updating items preserves selection by source where possible.

Preview uses a native HTML dialog on the DOM host: focus stays inside the modal, Escape closes it, and focus returns to the trigger. Arrow keys navigate. The image keeps its aspect ratio and does not autoplay or download other media. Construction is SSR-safe; opening the preview requires a host with HTMLDialogElement support. Gallery is an image component, not a video player.

All six docs apps include a Gallery section with landscape, portrait and error examples. Tests: ui-vm/src/__tests__/gallery.test.ts and ui-primitive/src/__tests__/gallery.test.ts.
