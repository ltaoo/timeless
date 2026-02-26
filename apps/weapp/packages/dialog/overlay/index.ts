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
      observer(store: DialogCore) {
        // @ts-ignore
        if (this.mounted) {
          return;
        }
        // @ts-ignore
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
  data: {
    mounted: false,
    enter: false,
    exit: false,
  },
  lifetimes: {
    created() {
      // @ts-ignore
      this.mounted = false;
    },
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
