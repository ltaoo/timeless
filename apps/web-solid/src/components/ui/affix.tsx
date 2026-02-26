import { Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import { useViewModelStore } from "~/hooks";

import {  AffixCore  } from "@timeless/domains";]: true,
        }}
        style={styles()}
        onAnimationEnd={(event) => {
          const $node = event.currentTarget;
          vm.setRect(() => {
            const rect = $node.getBoundingClientRect();
            return {
              top: rect.top,
              height: rect.height,
            };
          });
          const rect = $node.getBoundingClientRect();
          vm.handleMounted(rect);
        }}
      >
        {props.children}
      </div>
      <Show when={state().fixed}>
        <div style={{ height: `${state().height}px` }} />
      </Show>
    </div>
  );
}
