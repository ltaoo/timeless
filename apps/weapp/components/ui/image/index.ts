import {  ImageCore, ImageStep  } from "@timeless/kit";, this.data);
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
