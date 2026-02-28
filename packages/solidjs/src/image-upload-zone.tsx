import { createSignal, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import { readFileAsArrayBuffer, readFileAsURL } from "@/utils/browser";
import { ui } from "@timeless/domains";

const { DragZoneCore, ImageCore, ImageUploadCore } = ui;

import { DragZone } from "./drag-zone";
import { LazyImage } from "./image";
import { AspectRatio } from "./aspect-ratio";

export function ImageUpload(props: { store: ImageUploadCore } & JSX.HTMLAttributes<HTMLDivElement>) {
  const { store } = props;

  const [state, setState] = createSignal(store.state);
  store.onStateChange((v) => setState(v));

  return (
    <div
      classList={{
        relative: true,
        [props.class ?? ""]: true,
      }}
    >
      {/* <Show when={state().url}>
        <div class="absolute inset-0 h-full">
          <LazyImage class="h-full object-cover" store={store.ui.img} />
        </div>
      </Show>
      <DragZone store={store.ui.zone}></DragZone> */}
    </div>
  );
}
