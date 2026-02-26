import {  DialogCore  } from "@timeless/domains";,
  },
  properties: {
    _store: {
      type: Object,
    },
    className: {
      type: String,
    },
    style: {
      type: String,
    },
  },
  data: {},
  lifetimes: {
    ready() {
      const store = this.data._store as DialogCore;
      if (!store) {
        return;
      }
    },
  },
});
