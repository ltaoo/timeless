/**
 * @file 首页
 */
import { ViewComponentProps } from "~/store/types";
import { useViewModel } from "~/hooks";
import { RequestCore, TheResponseOfRequestCore } from "@/domains/request";
import { base, Handler } from "@/domains/base";
import { ButtonCore, DialogCore, ScrollViewCore } from "@/domains/ui";
import { WaterfallModel } from "@/domains/ui/waterfall/waterfall";
import { WaterfallCellModel } from "@/domains/ui/waterfall/cell";
import { ListCore } from "@/domains/list";
import { TheItemTypeFromListCore } from "@/domains/list/typing";
import { BackToTopModel } from "@/domains/ui/back-to-top";

function HomeIndexViewModel(props: ViewComponentProps) {
  const request = {};
  const methods = {
    refresh() {
      bus.emit(EventNames.StateChange, { ..._state });
    },
  };
  const $view = new ScrollViewCore({
    async onReachBottom() {
      $view.finishLoadingMore();
    },
    onScroll(pos) {},
  });
  const ui = {
    $view,
  };

  const _state = {};
  enum EventNames {
    StateChange,
  }
  type TheTypesOfEvents = {
    [EventNames.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    request,
    methods,
    ui,
    state: _state,
    async ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[EventNames.StateChange]>) {
      return bus.on(EventNames.StateChange, handler);
    },
  };
}

export const HomeIndexView = (props: ViewComponentProps) => {
  const [state, vm] = useViewModel(HomeIndexViewModel, [props]);

  return <div class="relative w-full h-full"></div>;
};
