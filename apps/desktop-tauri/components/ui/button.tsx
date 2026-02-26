/**
 * @file 按钮
 */
import { JSX } from "solid-js";
import { VariantProps, cva } from "class-variance-authority";
import { Loader } from "lucide-solid";

import {  ButtonCore  } from "@timeless/domains"; />
      </ButtonPrimitive.Loading>
      <Show when={props.children}>
        <ButtonPrimitive.Text store={store}>{props.children}</ButtonPrimitive.Text>
      </Show>
    </ButtonPrimitive.Root>
  );
}

export { Button };
