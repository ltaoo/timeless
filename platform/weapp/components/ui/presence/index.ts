import { PresenceCore } from "@/domains/ui/index";

Component({
  externalClasses: ["class-name"],
  options: {
    virtualHost: true,
    addGlobalClass: true,
  },
  properties: {
    _store: {
      type: null,
      value: null,
      observer(store: ReturnType<typeof PresenceCore>) {
        if (this.mounted) {
          return;
        }
        const { visible, mounted, enter, exit } = store;
        // console.log("[COMPONENT]ui/presence - observer", visible, mounted, store);
        this.setData({
          visible,
          mounted,
          enter,
          exit,
        });
        store.onStateChange((nextState) => {
          // console.log("[COMPONENT]ui/presence - store.onStateChange", nextState);
          const { visible, mounted, enter, exit } = nextState;
          this.setData({
            visible,
            mounted,
            enter,
            exit,
          });
        });
        this.mounted = true;
      },
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
  mounted: false,
  methods: {
    handleAnimationEnd() {
      const store: ReturnType<typeof PresenceCore> = this.data._store;
      // console.log("[COMPONENT]ui/presence - handleAnimationEnd", store.state, store.pending);
      store.handleAnimationEnd();
      // if (store.visible) {
      //   return;
      // }
      // store.unmount();
    },
  },
});
