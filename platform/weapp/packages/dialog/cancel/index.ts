import { ButtonCore, DialogCore } from "@/domains/ui/index";

Component({
  externalClasses: ["class"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    _store: {
      type: Object,
      observer(store: ButtonCore) {
        console.log('[COMPONENT]dialog/cancel - store observer', store);
      },
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
  },
});
