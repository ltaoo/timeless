import { ImageCore, ImageStep } from "@/domains/ui/index";

Component({
  externalClasses: ["class"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    styleIsolation: "apply-shared",
  },
  properties: {
    src: {
      type: String,
    },
    alt: {
      type: String,
    },
  },
  data: {
    ImageStep,
  },
  lifetimes: {
    ready() {
      // console.log("[COMPONENT]ui/image - ready", this.data);
      const { src, alt } = this.data;
      const image = new ImageCore({ width: 200, height: 100, src, alt });
      image.handleShow();
      this.setData({
        state: image.state,
      });
      image.onStateChange((nextState) => {
        this.setData({
          state: nextState,
        });
      });
    },
  },
});
