import { JSX, Show, createSignal } from "solid-js";

import {  TabsCore  } from "@timeless/inner-kit";
        // aria-labelledby={triggerId}
        hidden={!open()}
        // id={contentId}
        tabIndex={0}
      >
        <Show when={open()}>{props.children}</Show>
      </div>
    </Presence>
  );
};

export { Root, List, Trigger, Content };
