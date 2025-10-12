import { DialogCore } from "@/domains/ui/index";

const defaultOverlayClassName =
  "fixed inset-0 z-50 bg-black--50 opacity-0 backdrop-blur-sm transition-all duration-100";
const defaultContentClassName =
  "fixed z-50 grid w-full max-w-lg gap-4 border p-6 shadow-lg duration-200 rounded-lg--sm w-full--md bg-w-bg-0 border-w-bg-2";

Component({
  externalClasses: ["class"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    addGlobalClass: true,
  },
  properties: {
    _store: {
      type: Object,
      observer(store: ReturnType<typeof DialogCore>) {
        if (this.mounted) {
          return;
        }
        this.mounted = true;
        const { title, footer, cancel } = store.state;
        console.log("position, size", this.data);
        // const contentClassName = sheetVariants({ position, size });
        this.setData({
          title,
          footer,
          cancel,
          // contentClassName,
        });
        store.$present.onStateChange((v) => {
          const { enter, exit } = v;
          // const overlayAnimationClassName = (() => {
          //   if (enter) {
          //     return `animate-in fade-in`;
          //   }
          //   if (exit) {
          //     return ` animate-out fade-out-0`;
          //   }
          //   return "";
          // })();
          // const contentClassName = "";
          // const contentAnimationClassName = (() => {
          //   if (enter) {
          //     return `animate-in slide-in-from-bottom`;
          //   }
          //   if (exit) {
          //     return `animate-out slide-out-to-bottom`;
          //   }
          //   return "";
          // })();
          // this.setData({
          //   overlayClassName: overlayAnimationClassName,
          //   contentClassName: contentAnimationClassName,
          // });
        });
        store.onStateChange((nextState) => {
          const { title, footer, cancel, open } = nextState;
          const overlayAnimationClassName = open ? `animate-in fade-in` : ` animate-out fade-out-0`;
          const contentAnimationClassName = open
            ? `animate-in slide-in-from-bottom`
            : `animate-out slide-out-to-bottom`;
          this.setData({
            title,
            footer,
            cancel,
            overlayClassName: overlayAnimationClassName,
            contentClassName: contentAnimationClassName,
          });
        });
      },
    },
  },
  data: {
    title: "",
    footer: true,
    cancel: true,
    overlayClassName: defaultOverlayClassName,
    contentClassName: defaultContentClassName,
  },
  lifetimes: {},
  methods: {},
});
