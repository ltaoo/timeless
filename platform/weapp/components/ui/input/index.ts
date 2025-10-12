import { InputCore } from "@/domains/ui/index";
import { connect } from "@/domains/ui/input/connect.weapp";

Component({
  externalClasses: ["class-name"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    _store: {
      type: null,
      observer(store: InputCore) {
        console.log("[DOMAIN]ui/input - observer store 1", this.mounted);
        if (this.mounted) {
          return;
        }
        connect(store, {
          focus: () => {
            this.setData({ focus: true });
          },
          blur: () => {
            this.setData({ focus: false });
          },
        });
        this.mounted = true;
        const { autoFocus, loading, value, placeholder, disabled, allowClear, type } = store;
        console.log("[DOMAIN]ui/input - observer store");
        this.setData({
          focus: autoFocus,
          loading,
          value,
          placeholder,
          disabled,
          allowClear,
          type,
        });
        store.onStateChange((nextState) => {
          const { loading, value, placeholder, disabled, allowClear, autoFocus, type } = nextState;
          this.setData({
            focus: autoFocus,
            loading,
            value,
            placeholder,
            disabled,
            allowClear,
            type,
          });
        });
        store.onFocus(() => {
          console.log("[COMPONENT]ui/input - store.onFocus");
          this.setData({ focus: true });
        });
        store.onBlur(() => {
          this.setData({ focus: false });
        });
      },
    },
    style: {
      type: String,
      value: "",
    },
    allowClear: {
      type: Boolean,
      value: true,
    },
    placeholder: {
      type: String,
      value: "",
    },
  },
  data: {
    value: "",
    focus: false,
  },
  lifetimes: {},
  methods: {
    handleChange(event) {
      const store: InputCore = this.data._store;
      const { value } = event.detail;
      store.change(value);
    },
    handleConfirm() {
      const store: InputCore = this.data._store;
      store.handleEnter();
    },
  },
});
