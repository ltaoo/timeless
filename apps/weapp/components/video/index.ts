import mitt from "mitt";

import { ui } from "@timeless/core";
import { provide_video_player } from "@timeless/provider-weapp";

Component({
  externalClasses: ["class-name"],
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    _store: {
      type: Object,
    },
    style: {
      type: String,
    },
  },
  data: {
    // url: this.data._store.state.url,
  },
  lifetimes: {
    created() {
      // @ts-ignore
      this.event = mitt();
      // @ts-ignore
      this.events = [] as string[];
    },
    ready() {
      // const query = this.createSelectorQuery();
      // const videoContext = query.select("#video");
      // @ts-ignore
      const context = wx.createVideoContext("video", this);
      const store: ui.VideoPlayerCore = this.data._store;
      console.log("[COMPONENT]video - ready", context, this.data);
      store.onUrlChange(({ url }) => {
        // const u =
        //   "http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400";
        this.setData({
          url,
          // url: u,
        });
      });
      provide_video_player(store, context);
      // this.triggerEvent("load", {
      //   context,
      // });
    },
  },
  methods: {
    onClick(elm: string, handler: (payload: any) => void) {
      // @ts-ignore
      if (!this.events.includes(elm)) {
        // @ts-ignore
        this.events.push(elm);
      }
      // @ts-ignore
      this.event.on(elm, handler);
    },
    emitClick<T extends Record<string, string | number | undefined>>(elm: string, payload: T) {
      // @ts-ignore
      this.event.emit(elm, payload);
    },
    clearClick() {
      // @ts-ignore
      for (let i = 0; i < this.events.length; i += 1) {
        // @ts-ignore
        const e = this.events[i];
        // @ts-ignore
        this.event.off(e);
      }
    },
    handleTimeupdate(event) {
      const { currentTime, duration } = event.detail;
      const $player: ui.VideoPlayerCore = this.data._store;
      // console.log("[COMPONENT]video / handleTimeUpdate", $player._duration);
      $player.handleTimeUpdate({ currentTime, duration });
    },
    handleLoadedmetadata(event) {
      const { duration, width, height } = event.detail;
      const $player: ui.VideoPlayerCore = this.data._store;
      // console.log("[COMPONENT]video / handleLoadedmetadata", $player, duration);
      $player._duration = duration;
      // console.log("[COMPONENT]video / handleLoadedmetadata", $player, duration);
      $player.handleCanPlay({ duration });
    },
    handleEnded() {
      // this.triggerEvent("ended", {});
      // this.emitClick("ended", {});
      const $player: ui.VideoPlayerCore = this.data._store;
      $player.handleEnded();
    },
    handleError(event: { detail: { errMsg: string } }) {
      const $player: ui.VideoPlayerCore = this.data._store;
      $player.handleError(event.detail.errMsg);
      // this.emitClick("error", {
      //   msg: event.detail.errMsg,
      // });
      // this.triggerEvent("error", { msg: event.detail.errMsg });
    },
  },
});
