/**
 * @file 进度条
 */
import { JSX, createSignal } from "solid-js";

import {  ProgressCore  } from "@timeless/domains";
        style={{ transform: `translateX(-${100 - (state().value || 0)}%)` }}
      />
    </div>
  );
};
// Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
