import { cva } from "class-variance-authority";

import { DialogCore } from "@/domains/ui/index";

const defaultOverlayClassName = "fixed inset-0 z-50 bg-black--50 opacity-0 backdrop-blur transition-all duration-200";
const defaultContentClassName =
  "fixed z-50 scale-100 opacity-100 grid w-full max-w-lg gap-4 shadow-lg duration-200 rounded-tl-xl rounded-tr-xl bg-w-bg-2 text-w-fg-0 border-w-bg-2";

const sheetVariants = cva("fixed z-50 scale-100 gap-4 bg-w-bg-2 text-w-fg-0 opacity-100", {
  variants: {
    position: {
      top: "w-full duration-300",
      bottom: "w-full duration-300",
      left: "h-full duration-300",
      right: "h-full duration-300",
      // top: "animate-in slide-in-from-top w-full duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top",
      // bottom:
      //   "animate-in slide-in-from-bottom w-full duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
      // left: "animate-in slide-in-from-left h-full duration-300",
      // right: "animate-in slide-in-from-right h-full duration-300",
    },
    size: {
      content: "",
      default: "",
      sm: "",
      lg: "",
      xl: "",
      full: "",
    },
  },
  compoundVariants: [
    {
      position: ["top", "bottom"],
      size: "content",
      class: "max-h-screen",
    },
    {
      position: ["top", "bottom"],
      size: "default",
      class: "h-1/3",
    },
    {
      position: ["top", "bottom"],
      size: "sm",
      class: "h-1/4",
    },
    {
      position: ["top", "bottom"],
      size: "lg",
      class: "h-1/2",
    },
    {
      position: ["top", "bottom"],
      size: "xl",
      class: "h-5/6",
    },
    {
      position: ["top", "bottom"],
      size: "full",
      class: "h-screen",
    },
    {
      position: ["right", "left"],
      size: "content",
      class: "max-w-screen",
    },
    {
      position: ["right", "left"],
      size: "default",
      class: "w-1/3",
    },
    {
      position: ["right", "left"],
      size: "sm",
      class: "w-1/4",
    },
    {
      position: ["right", "left"],
      size: "lg",
      class: "w-1/2",
    },
    {
      position: ["right", "left"],
      size: "xl",
      class: "w-5/6",
    },
    {
      position: ["right", "left"],
      size: "full",
      class: "w-screen",
    },
  ],
  defaultVariants: {
    position: "bottom",
    size: "lg",
  },
});
const portalVariants = cva("fixed inset-0 z-50 flex", {
  variants: {
    position: {
      top: "items-start",
      bottom: "items-end",
      left: "justify-start",
      right: "justify-end",
    },
  },
  defaultVariants: { position: "right" },
});

Component({
  externalClasses: ["class"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    addGlobalClass: true,
  },
  properties: {
    _store: {
      type: null,
      observer(store: ReturnType<typeof DialogCore>) {
        if (!store) {
          return;
        }
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
    size: {
      type: String,
      // value: 'lg',
    },
    position: {
      type: String,
      // value: 'bottom',
    },
    hideTitle: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    title: "",
    // overlayClassName: defaultOverlayClassName,
    // contentClassName: defaultContentClassName,
  },
  lifetimes: {
    attached() {
      const { position, size, _store } = this.data;
      const store = _store as ReturnType<typeof DialogCore>;
      // console.log("[COMPONENT]ui/dialog - attached", store);
      if (!store) {
        return;
      }
    },
  },
  methods: {},
});
