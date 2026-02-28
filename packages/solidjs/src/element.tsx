/**
 * @file 按钮
 */
import { JSX } from "solid-js";

import { ui } from "@timeless/domains";

const { ButtonCore } = ui;

function Element<T = unknown>(
  props: {
    store: ButtonCore<T>;
  } & JSX.HTMLAttributes<HTMLButtonElement>
) {
  const { store } = props;

  return (
    <div
      class={props.class}
      onClick={(event) => {
        store.click();
      }}
    >
      {props.children}
    </div>
  );
}

export { Element };
