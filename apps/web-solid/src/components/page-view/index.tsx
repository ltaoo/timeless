import { createSignal, Show } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import { ViewComponentProps } from "~/store/types";
import { ScrollView } from "~/components/ui";
import { BottomNavigationBar1 } from "~/components/bottom-navigation-bar1";

import {  ScrollViewCore  } from "@timeless/domains";>
            <BottomNavigationBar1
              back={props.store.methods.back}
              home={props.home || stacks().length === 1}
              history={props.store.ui.$history}
              extra={props.operations}
            />
          </div>
        </div>
      </Show>
    </div>
  );
}
