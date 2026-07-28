import { VideoPlayerCore } from "@timeless/inner-vm";

export function connect(
  store: VideoPlayerCore,
  // @ts-ignore
  context: WechatMiniprogram.VideoContext,
) {
  store.bindAbstractNode({
    $node: context,
    play: () => context.play(),
    pause: () => context.pause(),
    load: (url: string) => {
      // context.src = url; // weapp doesn't support setting src via context, usually data binding
    },
    canPlayType: () => true,
    setCurrentTime: (v: number) => context.seek(v),
    setVolume: (v: number) => {
      // context.volume = v; // not supported
    },
    setRate: (v: number) => context.playbackRate(v),
    enableFullscreen: () => context.requestFullScreen({ direction: 90 }),
    disableFullscreen: () => context.exitFullScreen(),
    requestFullscreen: () => context.requestFullScreen({ direction: 90 }),
    exitFullscreen: () => context.exitFullScreen(),
    showSubtitle: () => {},
    hideSubtitle: () => {},
    showAirplay: () => {},
    pictureInPicture: () => {
      // @ts-ignore
      context.requestPictureInPicture?.();
    },
  });
}
