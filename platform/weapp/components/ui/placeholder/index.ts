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
        const { visible, mounted } = store;
        // console.log("[COMPONENT]ui/presence - observer", visible, mounted, store);
        this.setData({
          visible,
          mounted,
        });
        store.onStateChange((nextState) => {
          // console.log("[COMPONENT]ui/presence - store.onStateChange", nextState);
          const { visible, mounted } = nextState;
          this.setData({
            visible,
            mounted,
          });
        });
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
  mounted: false,
});
