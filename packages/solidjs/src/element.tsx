/**
 * @file 按钮
 */
import { JSX } from "solid-js";

import * as ui from '@timeless/inner-vm';

function Element<T = unknown>(
  props: {
    store: ui.ButtonCore<T>;
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
