import { GalleryCore, GalleryItem } from "@timeless/inner-vm";
import { View, ViewProps, ViewChildren, Button, Img, For, ref, computed } from "../core";

export type GalleryProps = ViewProps & { store: GalleryCore };
export type GalleryClasses = Partial<Record<"grid" | "thumbnail" | "preview" | "toolbar" | "image" | "counter" | "control" | "status", string>>;

export function Root(props: GalleryProps, children?: ViewChildren) {
  const { store, ...rest } = props;
  return View({ ...rest, attributes: { n: "gallery", ...rest.attributes } }, children);
}

export function Thumbnail(props: GalleryProps & { item: GalleryItem; index: number }) {
  const { store, item, index, ...rest } = props;
  return Button({
    ...rest,
    attributes: { n: "gallery-thumbnail", type: "button", "aria-label": item.alt || item.caption || `查看第 ${index + 1} 张图片`, "aria-haspopup": "dialog", ...rest.attributes },
    onClick(event) {
      rest.onClick?.(event);
      if (!event.defaultPrevented) store.open(index);
    },
  }, [Img({
    src: item.thumbnail || item.src,
    attributes: { n: "gallery-thumbnail-image", alt: item.alt || "", loading: "lazy" },
  })]);
}

export function Grid(props: GalleryProps & { thumbnailClass?: string }) {
  const { store, thumbnailClass, ...rest } = props;
  const items = ref(store.state.items);
  return View({
    ...rest,
    attributes: { n: "gallery-grid", ...rest.attributes },
    onMounted(event) {
      items.as(store.state.items);
      const unlisten = store.onStateChange(state => {
        if (state.items !== items.value) items.as(state.items);
      });
      const cleanup = rest.onMounted?.(event);
      return () => { unlisten(); cleanup?.(); };
    },
  }, [For({
    each: items,
    render(item, index) { return Thumbnail({ store, item, index: index.value, class: thumbnailClass }); },
  })]);
}

function action(props: GalleryProps, run: () => void, label: string, children?: ViewChildren) {
  const { store, ...rest } = props;
  return Button({
    ...rest,
    attributes: { n: "gallery-control", type: "button", "aria-label": label, ...rest.attributes },
    onClick(event) { rest.onClick?.(event); if (!event.defaultPrevented) run(); },
  }, children || [label]);
}
export function Previous(props: GalleryProps, children?: ViewChildren) { return action(props, () => props.store.previous(), "上一张", children); }
export function Next(props: GalleryProps, children?: ViewChildren) { return action(props, () => props.store.next(), "下一张", children); }
export function Close(props: GalleryProps, children?: ViewChildren) { return action(props, () => props.store.close(), "关闭预览", children); }

/** Native dialog supplies modal focus trapping, Escape and focus restoration.
 * No document/window access at module or construction time (SSR-safe).
 */
export function Preview(props: GalleryProps & { classes?: GalleryClasses }) {
  const { store, classes = {}, ...rest } = props;
  const state = ref(store.state);
  const selected = computed(state, value => value.open && value.current ? [value.current] : []);
  return View({
    ...rest,
    as: "dialog",
    attributes: { n: "gallery-preview", "aria-label": "图片画廊", ...rest.attributes },
    onKeyDown(event) {
      rest.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "ArrowLeft") { event.preventDefault(); store.previous(); }
      if (event.key === "ArrowRight") { event.preventDefault(); store.next(); }
    },
    onMounted(event) {
      const element = event.target.get$elm() as HTMLDialogElement;
      const sync = () => {
        state.as(store.state);
        if (store.state.open && !element.open) element.showModal();
        else if (!store.state.open && element.open) element.close();
      };
      const cancel = (event: Event) => { event.preventDefault(); store.close(); };
      const close = () => { if (!element.open) store.close(); };
      const backdrop = (event: MouseEvent) => {
        if (event.target !== element) return;
        const rect = element.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) store.close();
      };
      element.addEventListener("cancel", cancel);
      element.addEventListener("close", close);
      element.addEventListener("click", backdrop);
      const unlisten = store.onStateChange(sync);
      sync();
      const cleanup = rest.onMounted?.(event);
      return () => {
        unlisten();
        element.removeEventListener("cancel", cancel);
        element.removeEventListener("close", close);
        element.removeEventListener("click", backdrop);
        if (element.open) element.close();
        cleanup?.();
      };
    },
  }, [
    View({ class: classes.toolbar, attributes: { n: "gallery-toolbar" } }, [
      View({ class: classes.counter, attributes: { n: "gallery-counter", role: "status", "aria-live": "polite" } }, [
        computed(state, value => `${value.index + 1} / ${value.items.length}`),
      ]),
      Close({ store, class: classes.control }, ["×"]),
    ]),
    View({ attributes: { n: "gallery-stage" } }, [
      For({
        each: selected,
        key: "src",
        render(item) {
          return Img({
            src: item.src,
            class: classes.image,
            attributes: { n: "gallery-image", alt: computed(state, value => value.current?.alt || value.current?.caption || "") },
            onLoad() { store.setStatus(item.src, "loaded"); },
            onError() { store.setStatus(item.src, "error"); },
          });
        },
      }),
      View({ class: classes.status, attributes: { n: "gallery-status", role: "status", "aria-live": "polite" } }, [
        computed(state, value => value.status === "error" ? "图片加载失败，请切换其他图片" : value.status === "loading" ? "正在加载图片…" : ""),
      ]),
    ]),
    View({ class: classes.toolbar, attributes: { n: "gallery-navigation" } }, [
      Previous({ store, class: classes.control, attributes: { n: "gallery-previous", disabled: computed(state, value => !value.can_previous) } }, ["←"]),
      View({ attributes: { n: "gallery-caption" } }, [computed(state, value => value.current?.caption || "")]),
      Next({ store, class: classes.control, attributes: { n: "gallery-next", disabled: computed(state, value => !value.can_next) } }, ["→"]),
    ]),
  ]);
}
