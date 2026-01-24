import { CalendarView } from "../../components/calendar.js";
import { MemosView } from "../../components/memos.js";
import { TimelineView } from "../../components/timeline.js";
import { HomePageViewModel } from "./index.model.js";

export function HomePageView(props) {
  const vm$ = HomePageViewModel(props);
  const selectedDate = new Date();

  return Flex({ class: "page w-full h-full" }, [
    View({ class: "p-4 pr-0 w-[240px]" }, [
      CalendarView({
        onNavigate(view) {
          console.log("Navigate to:", view);
        },
      }),
    ]),
    View({ class: "p-4 flex-1 w-0" }, [
      MemosView({
        vm: vm$.vm.memo$,
        storage: props.storage,
        onNavigate(view) {
          console.log("Navigate to:", view);
        },
      }),
    ]),
    View({ class: "p-4 pl-0 w-[260px]" }, [
      TimelineView({
        memo$: vm$.vm.memo$,
        // memos: vm$.filterMemosByDate(selectedDate),
        onMemoClick(memo) {
          console.log("Timeline memo clicked:", memo);
        },
      }),
    ]),
  ]);
}
