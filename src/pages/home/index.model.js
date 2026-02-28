import { MemoModel } from "./memo.model.js";

export function HomePageViewModel(props) {
  // let _memos = JSON.parse(localStorage.getItem("memos") || "[]");
  const vm = {
    memo$: MemoModel(props),
  };

  return {
    vm,
  };
}
