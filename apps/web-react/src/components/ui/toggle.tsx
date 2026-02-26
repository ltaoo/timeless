import React, { useState } from "react";

import { useInitialize } from "~/hooks";
import { ToggleCore } from "@/domains/ui/toggle";

export const ToggleView = React.memo(
  (props: { store: ToggleCore } & React.AllHTMLAttributes<HTMLDivElement>) => {
    const { store } = props;
    const [state, setState] = useState(store.state);

    useInitialize(() => {
      store.onStateChange((nextState) => {
        setState(nextState);
      });
    });

    const { boolean } = state;
    if (boolean) {
      return <div>{props.children}</div>;
    }
    return null;
  }
);
