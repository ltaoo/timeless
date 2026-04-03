import { app } from "~/store/index";

// import {  NavigatorCore  } from "@timeless/kit";, {
        height: $bar.height,
      });
    },
    select(selector: string) {
      return new Promise((resolve) => {
        this.createSelectorQuery()
          .select(selector)
          .boundingClientRect((rect) => {
            resolve(rect);
          })
          .exec();
      });
    },
  },
});
