import {  ListCore  } from "@timeless/domains";,
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
