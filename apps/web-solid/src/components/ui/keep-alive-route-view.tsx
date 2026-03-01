/**
 * @file ???
 */
import { createSignal, JSX, onCleanup, onMount } from "solid-js";

import {  RouteViewCore  } from "@timeless/kit";}
      data-title={props.store.title}
      data-href={props.store.href}
    >
      {props.children}
    </div>
  );
}
