import { VariantProps, cva } from "class-variance-authority";

import {  ButtonCore  } from "@timeless/kit"; });
      this.setData({ className: c });
      const store = this.data._store as ButtonCore;
      if (!store) {
        return;
      }
      const { disabled, loading, text } = store.state;
      this.setData({
        disabled,
        loading,
        text,
      });
      store.onStateChange((nextState) => {
        const { disabled, loading, text } = nextState;
        this.setData({
          disabled,
          loading,
          text,
        });
      });
    },
  },
  methods: {
    handleClick() {
      const store = this.data._store as ButtonCore;
      if (!store) {
        return;
      }
      store.click();
    },
  },
});
