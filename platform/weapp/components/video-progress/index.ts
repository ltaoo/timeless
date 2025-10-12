import mitt from "mitt";

import { PlayerCore } from "@/domains/player/index";
import { seconds_to_hour } from "@/utils/index";

Component({
  mounted: false,
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
  options: {
    virtualHost: true,
    addGlobalClass: true,
  },
  properties: {
    _store: {
      type: Object,
      observer(store: PlayerCore) {
        const $player = store;
        // console.log("[COMPONENT]$player - _store observer", this, store);
        if (!$player) {
          return;
        }
        if (this.mounted) {
          return;
        }
        this.mounted = true;
        $player.onProgress((v) => {
          // console.log("[COMPONENT]$player.onProgress", v, $player._duration);
          if (this.data.isMoving) {
            return;
          }
          const width = (v.progress / 100) * this.data.rect.width;
          this.setData({
            curTime: v.currentTime,
            // progress: v.progress,
            // width,
            // left: width,
            times: {
              currentTime: seconds_to_hour(v.currentTime),
              duration: seconds_to_hour(v.duration),
            },
          });
        });
        $player.onDurationChange((v) => {
          $player._duration = v;
          this.setData({
            duration: v,
            times: {
              currentTime: "00:00",
              duration: seconds_to_hour(v),
            },
          });
        });
        $player.afterAdjustCurrentTime(({ time }) => {
          this.setData({
            curTime: time,
          });
        });
      },
    },
  },
  data: {
    width: 0,
    left: -6,
    rect: {
      width: 0,
      left: 0,
    },
    duration: 0,
    curTime: 0,
    virtualCurTime: "00:00",
    progress: 0,
    times: {
      currentTime: "00:00",
      duration: "00:00",
    },
  },
  start: false,
  moving: false,
  startX: 0,
  methods: {
    handleMounted(rect) {
      this.setData({
        rect,
      });
    },
    tagIsMoving() {
      this.setData({
        isMoving: true,
      });
    },
    handleMove(data) {
      this.setData({
        isMoving: true,
        virtualCurTime: seconds_to_hour(data.percent * this.data.duration),
      });
    },
    handleMoveEnd(data) {
      this.setData({
        isMoving: false,
      });
      const $player: PlayerCore = this.data._store;
      const { percent } = data;
      let targetTime = percent * $player._duration;
      $player.adjustCurrentTime(targetTime);
      // this.emitClick("update-percent", data);
      // this.triggerEvent("percent", data);
    },
  },
});
