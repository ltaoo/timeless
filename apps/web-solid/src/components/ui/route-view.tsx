/**
 * @file 会销毁页面的视图（如果希望不销毁可以使用 keep-alive-route-view
 */
import { Show, createSignal, JSX, onCleanup } from "solid-js";

import {  RouteViewCore  } from "@timeless/inner-kit";}
        // onAnimationEnd={() => {
        //   store.presence.animationEnd();
        // }}
      >
        {props.children}
      </div>
    </Show>
  );
}
