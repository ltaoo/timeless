Component({
  externalClasses: ["class"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    name: {
      type: String,
    },
    className: {
      type: String,
    },
    style: {
      type: String,
    },
    color: {
      type: String,
    },
    size: {
      type: Number,
      value: 32,
    },
    cover: {
      type: Boolean,
      value: false,
    },
  },
});
