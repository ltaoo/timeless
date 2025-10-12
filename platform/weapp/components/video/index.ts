import mitt from "mitt";

import { PlayerCore } from "@/domains/player/index";
import { connect } from "@/domains/player/connect.weapp";

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
  event: mitt(),
  events: [] as string[],
  onClick(elm: string, handler: (payload: any) => void) {
    if (!this.events.includes(elm)) {
      this.events.push(elm);
    }
    this.event.on(elm, handler);
  },
  emitClick<T extends Record<string, string | number | undefined>>(elm: string, payload: T) {
    this.event.emit(elm, payload);
  },
  clearClick() {
    for (let i = 0; i < this.events.length; i += 1) {
      const e = this.events[i];
      this.event.off(e);
    }
  },
  lifetimes: {
    ready() {
      // const query = this.createSelectorQuery();
      // const videoContext = query.select("#video");
      const context = wx.createVideoContext("video", this);
      const store: PlayerCore = this.data._store;
      console.log("[COMPONENT]video - ready", context, this.data);
      store.onUrlChange(({ url }) => {
        // const u =
        //   "http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400";
        this.setData({
          url,
          // url: u,
        });
      });
      connect(store, context);
      // this.triggerEvent("load", {
      //   context,
      // });
    },
  },
  methods: {
    handleTimeupdate(event) {
      const { currentTime, duration } = event.detail;
      const $player: PlayerCore = this.data._store;
      // console.log("[COMPONENT]video / handleTimeUpdate", $player._duration);
      $player.handleTimeUpdate({ currentTime, duration });
    },
    handleLoadedmetadata(event) {
      const { duration, width, height } = event.detail;
      const $player: PlayerCore = this.data._store;
      // console.log("[COMPONENT]video / handleLoadedmetadata", $player, duration);
      $player._duration = duration;
      // console.log("[COMPONENT]video / handleLoadedmetadata", $player, duration);
      $player.handleCanPlay({ duration });
    },
    handleEnded() {
      // this.triggerEvent("ended", {});
      // this.emitClick("ended", {});
      const $player: PlayerCore = this.data._store;
      $player.handleEnded();
    },
    handleError(event: { detail: { errMsg: string } }) {
      const $player: PlayerCore = this.data._store;
      $player.handleError(event.detail.errMsg);
      // this.emitClick("error", {
      //   msg: event.detail.errMsg,
      // });
      // this.triggerEvent("error", { msg: event.detail.errMsg });
    },
  },
});
