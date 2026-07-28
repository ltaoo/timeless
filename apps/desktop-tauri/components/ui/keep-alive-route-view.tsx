/**
 * @file ???
 */
import { createSignal, JSX, onCleanup, onMount } from "solid-js";

import {  RouteViewCore  } from "@timeless/inner-kit";}
      data-title={store.title}
      data-href={store.href}
    >
      {props.children}
    </div>
  );
}
