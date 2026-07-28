import { JSX } from "solid-js";

import {  FormCore  } from "@timeless/inner-kit";, event.currentTarget.value);
      }}
    >
      {props.children}
    </input>
  );
}

function Submit<T extends Record<string, unknown>>(props: { store: FormCore } & JSX.HTMLAttributes<HTMLButtonElement>) {
  const { store } = props;

  return (
    <div
      onClick={() => {
        store.submit();
      }}
    >
      {props.children}
    </div>
  );
}

export { Root, Field, Control, Submit };
