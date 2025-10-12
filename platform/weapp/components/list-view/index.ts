import { ListCore } from "@/domains/list/index";

Component({
  externalClasses: ["class-name"],
  options: {
    // pureDataPattern: /^_/,
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
  data: {},
  lifetimes: {
    ready() {
      const $media: ListCore<any> = this.data._store;
      $media.onStateChange((v) => {
        this.setData({
          response: v,
        });
      });
      this.setData({
        response: $media.response,
      });
    },
  },
});
