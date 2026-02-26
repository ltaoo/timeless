/**
 * @file 控制内容显隐的组件
 */
import { JSX, Show, createSignal } from "solid-js";

import { useViewModelStore } from "~/hooks";

import {  PresenceCore  } from "@timeless/domains";}
        onClick={props.onClick}
      >
        {props.children}
      </div>
    </Show>
  );
};
