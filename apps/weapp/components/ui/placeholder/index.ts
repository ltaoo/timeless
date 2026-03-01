import { PresenceCore } from "@timeless/kit";, nextState);
          const { visible, mounted } = nextState;
          this.setData({
            visible,
            mounted,
          });
        });
        // @ts-ignore
        this.mounted = true;
      },
    },
    className: {
      type: String,
    },
    style: {
      type: String,
    },
    cover: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    visible: false,
    mounted: false,
    enter: false,
    exit: false,
  },
  lifetimes: {
    created() {
      // @ts-ignore
      this.mounted = false;
    },
  },
});
