/**
 * @file 控制内容显隐的组件
 */
import { JSX, createSignal } from "solid-js";

import {  PresenceCore  } from "@timeless/kit";}
        onAnimationEnd={() => {
          props.store.unmount();
        }}
      >
        {props.children}
      </div>
    </Show>
  );
};
