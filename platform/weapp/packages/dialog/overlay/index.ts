import { DialogCore } from "@/domains/ui/index";

Component({
  externalClasses: ["class"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    _store: {
      type: null,
      observer(store: ReturnType<typeof DialogCore>) {
        if (this.mounted) {
          return;
        }
        this.mounted = true;
        // const { open } = store;
        // const { mounted, enter, exit } = store.present;
        // this.setData({
        //   mounted,
        //   enter,
        //   exit,
        // });
        // store.present.onStateChange((v) => {
        //   const { mounted, enter, exit } = v;
        //   this.setData({
        //     mounted,
        //     enter,
        //     exit,
        //   });
        // });
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
  },
  mounted: false,
  data: {
    mounted: false,
    enter: false,
    exit: false,
  },
  lifetimes: {
    attached() {
      console.log("mounted to page");
    },
  },
  methods: {
    handleClick() {
      // console.log("[COMPONENT]package/dialog/overlay - handleClick");
      this.data._store.hide();
    },
    // handleAnimationEnd() {
    //   // console.log("[COMPONENT]package/dialog/overlay - handleAnimationEnd", this.data._store);
    //   this.data._store.present.unmount();
    // },
    handleTouchMove() {
      return false;
    },
  },
});
