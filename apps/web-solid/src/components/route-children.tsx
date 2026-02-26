import { createSignal, For } from "solid-js";

import { pages } from "~/store/views";
import { PageKeys, ViewComponentProps } from "~/store/types";

import {  RouteViewCore  } from "@timeless/domains"; app={props.app} store={subView} index={i()}>
            <PageContent
              app={props.app}
              client={props.client}
              storage={props.storage}
              pages={pages}
              history={props.history}
              view={subView}
            />
          </KeepAliveRouteView>
        );
      }}
    </For>
  );
}
