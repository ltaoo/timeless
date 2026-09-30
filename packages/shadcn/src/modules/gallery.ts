import { ui, vm, classNames, type ViewProps } from "@timeless/timeless";

/** shadcn visual composition; selection and modal behavior live in shared layers. */
export function Gallery(props: ViewProps & { store: vm.GalleryCore }) {
  const { store, class: cls, ...rest } = props;
  return ui.GalleryPrimitive.Root(
    { ...rest, store, class: classNames(["gallery__root", cls]) },
    [
      ui.GalleryPrimitive.Grid({ store, class: "gallery__grid", thumbnailClass: "gallery__thumbnail" }),
      ui.GalleryPrimitive.Preview({
        store,
        class: "gallery__preview",
        classes: {
          toolbar: "gallery__toolbar",
          image: "gallery__image",
          counter: "gallery__counter",
          control: "gallery__control",
          status: "gallery__status",
        },
      }),
    ],
  );
}
