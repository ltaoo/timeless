import { VariantProps, cva } from "class-variance-authority";

import { ButtonCore } from "@/domains/ui/index";
import { cn } from "@/utils/index";

const buttonVariants = cva(
  "active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-slate-400 disabled:pointer-events-none dark:focus:ring-offset-slate-900 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800",
  {
    variants: {
      variant: {
        default: "bg-w-brand text-white",
        destructive: "bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600",
        outline: "bg-transparent border border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100",
        subtle: "bg-w-fg-5 text-w-fg-0",
        ghost:
          "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-100 dark:hover:text-slate-100 data-[state=open]:bg-transparent dark:data-[state=open]:bg-transparent",
        link: "bg-transparent dark:bg-transparent underline-offset-4 hover:underline text-slate-900 dark:text-slate-100 hover:bg-transparent dark:hover:bg-transparent",
      },
      size: {
        default: "py-2 px-4",
        sm: "px-2 rounded-md",
        lg: "px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

Component({
  externalClasses: ["class"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    _store: {
      type: Object,
    },
    variant: {
      type: String,
    },
    size: {
      type: String,
    },
    className: {
      type: String,
    },
    style: {
      type: String,
    },
  },
  data: { className: "", text: "确定" },
  lifetimes: {
    ready() {
      console.log("[COMPONENT]ui/button - ready", cn);
      const { variant, size } = this.data;
      const c = buttonVariants({ variant, size, class: "w-full space-x-2" });
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
