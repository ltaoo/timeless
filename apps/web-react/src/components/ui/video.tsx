/**
 * @file 播放器
 */
import React, { useEffect, useRef, useState } from "react";

import { useInitialize } from "~/hooks/index";
import { VideoPlayerCore } from "@/domains/ui/video-player";
import { provide_ui_video_player } from "@timeless/provider-web";

export const VideoCore = React.memo((props: { store: VideoPlayerCore }) => {
  const { store } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState(store.state);

  useInitialize(() => {
    if (!videoRef.current) {
      return;
    }
    const unlisten = store.onStateChange((v) => {
      setState(v);
    });
    // @ts-ignore
    provide_ui_video_player(store, videoRef.current);
    return () => {
      unlisten();
    };
  });

  const { width, height, ready, poster, subtitle, prepareFullscreen } = state;

  // console.log("[COMPONENT]Video - render", width, height, poster);

  return (
    <div
      className="video transition-all"
      style={{
        width,
        // height,
        overflow: "hidden",
        // backgroundColor: "red",
      }}
      onTouchStart={(event) => {
        event.stopPropagation();
      }}
      onTouchMove={(event) => {
        event.stopPropagation();
      }}
      onTouchEnd={(event) => {
        event.stopPropagation();
      }}
    >
      <video
        ref={videoRef}
        // poster={poster}
        className="w-full relative z-10"
        controls={false}
        webkit-playsinline={prepareFullscreen ? undefined : "true"}
        playsInline={!prepareFullscreen}
        // webkit-playsinline="false"
        // playsInline={false}
        // preload="none"
        width={`${width}px`}
        height={`${height}px`}
      >
        {subtitle ? (
          <track
            src={subtitle.src}
            kind="captions"
            label={subtitle.label}
            srcLang={subtitle.lang}
          ></track>
        ) : null}
      </video>
    </div>
  );
});

function VideoTrack(
  props: { store: VideoPlayerCore } & React.TrackHTMLAttributes<HTMLTrackElement>
) {
  const { store, src, kind, label, srcLang } = props;

  const ref = useRef<HTMLTrackElement | null>(null);

  // useInitialize(() => {
  //   const $track = ref.current;
  //   if (!$track) {
  //     return;
  //   }
  // });

  return (
    <track
      ref={ref}
      src={src}
      kind={kind}
      label={label}
      srcLang={srcLang}
    ></track>
  );
}
