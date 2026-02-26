import { DialogCore } from "@/domains/ui/index";

Component({
  externalClasses: ["class"],
  options: {
    pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    _store: {
      type: Object,
    },
    className: {
      type: String,
    },
    enterClass: {
      type: String,
    },
    exitClass: {
      type: String,
    },
    style: {
      type: String,
    },
  },
  data: {
    open: false,
  },
  lifetimes: {
    attached() {
      const store = this.data._store as DialogCore;
      if (!store) {
        return;
      }
      // const { open } = store;
      // this.setData({
      //   open,
      // });
      // store.onStateChange((nextState) => {
      //   const { open } = nextState;
      //   this.setData({
      //     open,
      //   });
      // });
    },
  },
});
