Component({
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    when: {
      type: Boolean,
      value: false,
    },
  },
});
