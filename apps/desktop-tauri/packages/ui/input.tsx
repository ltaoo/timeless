import { createSignal, JSX, onMount } from "solid-js";
import { effect } from "solid-js/web";

import {  InputCore  } from "@timeless/domains";
      onInput={(event: Event & { currentTarget: HTMLInputElement }) => {
        store.handleChange(event);
      }}
      onKeyDown={(event) => {
        store.handleKeyDown(event);
      }}
      onBlur={() => {
        store.handleBlur();
      }}
    />
  );
};

export { Input };
