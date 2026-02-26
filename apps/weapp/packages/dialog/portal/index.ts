import { DialogCore } from "@/domains/ui/index";

Component({
  externalClasses: ["class"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    addGlobalClass: true,
    // styleIsolation: "apply-shared",
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
    name: {
      type: String,
    },
  },
  data: {},
  lifetimes: {
    attached() {
      const store = this.data._store as DialogCore;
      // console.log("[PACKAGE]dialog/portal - attached", store, this.data.name);
      if (!store) {
        return;
      }
    },
  },
});
