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
    className: {
      type: String,
    },
    style: {
      type: String,
    },
  },
  data: {},
  lifetimes: {
    ready() {},
  },
});
