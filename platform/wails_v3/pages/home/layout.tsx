/**
 * @file 后台/首页布局
 */
import { For, JSX, createSignal } from "solid-js";

import { pages } from "~/store/views";
import { ViewComponent, ViewComponentProps } from "~/store/types";
import {
  mapPathnameWithPageKey,
  PageKeys,
  routes,
  routesWithPathname,
} from "~/store/routes";
import { useViewModel } from "~/hooks";
import { RouteChildren } from "~/components/route-children";

import { base, Handler } from "@/domains/base";

function HomeLayoutViewModel(props: ViewComponentProps) {
  const request = {};
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {};

  let _state = {};
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    state: _state,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export const HomeLayout: ViewComponent = (props) => {
  const [state, vm] = useViewModel(HomeLayoutViewModel, [props]);

  return (
    <div class="flex w-full h-full">
      <div class="relative z-10 p-2 space-y-2 border-r border-w-fg-3 bg-w-bg-1"></div>
      <div class="z-0 flex-1 relative w-0 h-full">
        <RouteChildren
          app={props.app}
          client={props.client}
          storage={props.storage}
          pages={pages}
          history={props.history}
          view={props.view}
        />
      </div>
    </div>
  );
};
