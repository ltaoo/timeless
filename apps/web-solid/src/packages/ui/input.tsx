/**
 * @file 输入框
 */
import { createSignal, JSX, onMount } from "solid-js";
import { effect } from "solid-js/web";

import {  InputCore  } from "@timeless/inner-kit";);
      //   store.handleChange(event);
      // }}
      onKeyDown={(event) => {
        // event.stopPropagation();
        // event.preventDefault();
        store.handleKeyDown(event);
      }}
      onBlur={() => {
        store.handleBlur();
      }}
    />
  );
};

export { Input };
