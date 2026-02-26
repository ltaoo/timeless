/**
 * @file 支持多列的瀑布流组件
 */
import { For, JSX, Show } from "solid-js";

import { useViewModelStore } from "~/hooks";

import {  WaterfallModel  } from "@timeless/domains";, state().uid, width, height);
        // @todo 为什么会是 0？
        if (height === 0) {
          return;
        }
        vm.methods.load({ width, height });
      }}
    >
      {props.render(state().payload, props.idx)}
    </div>
  );
}
