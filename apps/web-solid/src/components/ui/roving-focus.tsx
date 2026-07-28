import { createContext, createSignal, onCleanup, useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import {  RovingFocusCore  } from "@timeless/inner-kit"; && event.shiftKey) {
            store.shiftTab();
            return;
          }
        }}
      >
        {props.children}
      </span>
    </Collection.Item>
  );
};

const Root = RovingFocusGroup;
const Item = RovingFocusGroupItem;

export { Root, Item };
