/**
 * @file 多选按钮组件
 */
import { For, JSX, createSignal } from "solid-js";

import {  CheckboxCore  } from "@timeless/kit";>
      <For each={state().options}>
        {(opt) => {
          const { label, core } = opt;
          return <CheckboxOption store={core} label={label} />;
        }}
      </For>
    </div>
  );
};
