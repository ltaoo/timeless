import { JSX, Show } from "solid-js";
import { ChevronLeft, ChevronRight } from "lucide-solid";

import { useViewModelStore } from "~/hooks";
import {  PresenceCore  } from "@timeless/inner-kit"; />
        </Show>
      </div>
      <div>
        <Show when={state().visible}>{props.children}</Show>
      </div>
    </div>
  );
}
