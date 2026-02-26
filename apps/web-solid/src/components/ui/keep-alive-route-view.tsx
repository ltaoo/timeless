/**
 * @file ???
 */
import { createSignal, JSX, onCleanup, onMount } from "solid-js";

import {  RouteViewCore  } from "@timeless/domains";}
      data-title={props.store.title}
      data-href={props.store.href}
    >
      {props.children}
    </div>
  );
}
