import { fetchIssueList } from "./task.service.js";

export function TaskPageViewModel(props) {
  const request = {
    taskList: new Timeless.ListCore(
      new Timeless.RequestCore(fetchIssueList, {
        client: props.client,
      })
    ),
  };
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ...state });
    },
  };
  const handlers = {};
  const ui = {};
  const state = {
    get task() {
      return request.taskList.response;
    },
  };
  const Events = {
    StateChange: "StateChange",
  };
  const bus = Timeless.base();

  request.taskList.onStateChange((v) => methods.refresh());

  return {
    methods,
    state: state,
    ready() {
      request.taskList.init({});
    },
    onStateChange(handler) {
      bus.on(Events.StateChange, handler);
    },
  };
}
