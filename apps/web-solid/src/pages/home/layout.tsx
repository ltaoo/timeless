/**
 * @file 后台/首页布局
 */
import { For, JSX, createSignal } from "solid-js";
import { Users, Home, Bike, BicepsFlexed, User, Star, Boxes, Settings, List, ClipboardList } from "lucide-solid";

import { pages } from "~/store/views";
import { ViewComponent, ViewComponentProps } from "~/store/types";
import { mapPathnameWithPageKey, PageKeys, routes, routesWithPathname } from "~/store/routes";
import { useViewModel } from "~/hooks";
import { Show } from "~/packages/ui/show";
import { RouteChildren } from "~/components/route-children";
import { KeepAliveRouteView } from "~/components/ui";

import {  base, Handler  } from "@timeless/inner-kit";]: true,
        }}
        onClick={() => {
          if (!props.url) {
            return;
          }
          props.history.push(props.url);
          // props.app.showView(props.view);
        }}
      >
        {inner}
      </div>
    </Show>
  );
}
