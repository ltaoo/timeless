import { VideoPlayerCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren, TimelessElement } from "@/content/type";

type Provider = Partial<{
  provide_ui_video_player: (
    $video: HTMLVideoElement,
    store: VideoPlayerCore,
  ) => void;
}>;

let global_provider: Provider | undefined;

export function setVideoPlayerProvider(provider?: Provider) {
  global_provider = provider;
}

export function Root(
  props: ViewProps,
  children?: ViewChildren,
): TimelessElement {
  return View(props, children);
}

export function Video(
  props: ViewProps & { store: VideoPlayerCore },
  children?: ViewChildren,
): TimelessElement {
  const { store, ...rest } = props;
  return View(
    {
      ...rest,
      as: "video",
      onMounted(event) {
        const $elm = (event as any).target;
        const $video = $elm as HTMLVideoElement;
        store.setMounted();
        const provide = global_provider?.provide_ui_video_player;
        if (typeof provide === "function") provide($video, store);
        if (props.onMounted) props.onMounted(event);
      },
    },
    children,
  );
}
