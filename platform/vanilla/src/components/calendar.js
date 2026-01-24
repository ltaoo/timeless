import {
  CalendarViewModel,
  monthNames,
  weekdayNames,
} from "./calendar.model.js";

const PrevIconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <polyline points="15 18 9 12 15 6"></polyline>
</svg>`;
const NextIconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <polyline points="9 18 15 12 9 6"></polyline>
</svg>`;

export function CalendarView(props) {
  const vm$ = CalendarViewModel(props);

  // const month = ref(monthNames[vm$.state.month.value.getMonth()]);
  // const year = ref(vm$.state.year.text);
  // const weeks = ref(vm$.state.weeks);
  const month = computed(
    {
      state: vm$.state,
    },
    (draft) => {
      console.log(draft.state);
      return monthNames[draft.state.month.value.getMonth()];
    },
  );
  const year = computed(
    {
      state: vm$.state,
    },
    (draft) => {
      return draft.state.year.text;
    },
  );
  const weeks = computed(
    {
      state: vm$.state,
    },
    (draft) => {
      return draft.state.weeks;
    },
  );

  const view$ = View({ class: "calendar-container" }, [
    View({ class: "calendar-header" }, [
      Button({ id: "prev-month", class: "calendar-nav-btn" }, [
        DangerouslyInnerHTML(PrevIconSVG),
      ]),
      View({ class: "calendar-title" }, [Txt(month), Txt(year)]),
      Button({ id: "next-month", class: "calendar-nav-btn" }, [
        DangerouslyInnerHTML(NextIconSVG),
      ]),
    ]),
    For({
      class: "calendar-weekdays",
      each: weekdayNames,
      render(day) {
        return View({ class: "weekday" }, [Txt(day)]);
      },
    }),
    For({
      class: "calendar-grid",
      each: weeks,
      render(week) {
        const dates = computed(
          {
            week: week,
          },
          (draft) => {
            return draft.week.dates;
          },
        );
        return For({
          class: "calendar-week",
          each: dates,
          render(day) {
            const day_text = ref(day.text);
            const is_selected = computed(
              {
                state: vm$.state,
              },
              (draft) => {
                // console.log(
                //   "check is today",
                //   day.value.getTime(),
                //   draft.state.selectedDay.value.getTime(),
                // );
                return (
                  draft.state.selectedDay &&
                  day.value.getTime() ===
                    draft.state.selectedDay.value.getTime()
                );
              },
            );
            // if (is_selected) {
            //   setInterval(() => {
            //     day_text.value = String(Number(day_text.value) + 1);
            //   }, 1000);
            // }
            const has_memo = ref(vm$.hasMemo(day));
            // const has_memo = computed(
            //   {
            //     day: day,
            //   },
            //   (draft) => {
            //     return vm$.hasMemo(draft.day);
            //   },
            // );
            const day_classname = computed(
              {
                is_selected: is_selected,
              },
              (draft) => {
                return [
                  "calendar-day",
                  draft.is_selected ? "selected" : "",
                ].join(" ");
              },
            );
            return View(
              {
                class: classnames(day_classname),
              },
              [
                Txt(day_text),
                Show({
                  when: has_memo,
                  children: [View({ class: "memo-dot" })],
                }),
              ],
            );
          },
        });
      },
    }),
  ]);
  const _style = document.createElement("style");
  _style.textContent = `.calendar-container {
  background: var(--BG-1);
  border-radius: 12px;
  padding: 16px;
  user-select: none;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.calendar-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--FG-0);
}
.calendar-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: var(--FG-0);
  transition: background 0.2s;
}
.calendar-nav-btn:hover {
  background: var(--BG-3);
}
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
}
.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--FG-1);
  padding: 8px 0;
}
.calendar-grid {
  display: flex;
  flex-direction: column;
}
.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.calendar-day:hover {
  background: var(--BG-3);
}
.calendar-day.other-month {
  opacity: 0.3;
}
.calendar-day.other-month:hover {
  background: transparent;
}
.day-number {
  font-size: 14px;
  color: var(--FG-0);
}
.calendar-day.selected {
  background: var(--GREEN);
}
.calendar-day.selected .day-number {
  color: white;
}
.calendar-day.today {
  background: var(--GREEN);
}
.calendar-day.today .day-number {
  color: white;
  font-weight: 600;
}
.memo-dot {
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--GREEN);
}
.calendar-day.selected .memo-dot {
  background: white;
}`;

  // 绑定事件
  // container
  //   .querySelector("#prev-month")
  //   .addEventListener("click", () => this.navigateMonth(-1));
  // container
  //   .querySelector("#next-month")
  //   .addEventListener("click", () => this.navigateMonth(1));

  // container
  //   .querySelectorAll(".calendar-day:not(.other-month)")
  //   .forEach((dayEl) => {
  //     dayEl.addEventListener("click", () => {
  //       const time = parseInt(dayEl.dataset.time);
  //       const date = new Date(time);
  //       this.core.selectDay(date);
  //       this.onDateSelect(date);
  //     });
  //   });

  return {
    t: "view",
    render() {
      document.body.appendChild(_style);
      return view$.render();
    },
  };
}
