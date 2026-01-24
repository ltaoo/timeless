export const monthNames = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];
export const weekdayNames = ["一", "二", "三", "四", "五", "六", "日"];

export function CalendarViewModel(props) {
  let _memos = props.memos || [];
  // this.onDateSelect = options.onDateSelect || (() => {});

  const calendar$ = Timeless.ui.CalendarCore({ today: new Date() });

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

  let calendar = ref(calendar$.state);

  return {
    state: calendar,
    setMemos(memos) {
      _memos = memos;
      this.render();
    },
    mount() {
      calendar$.selectDay(new Date());
      this.bindEvents();
      this.render();
    },

    bindEvents() {
      calendar$.onSelectDay((date) => {
        // this.onDateSelect(date);
      });
      calendar$.onChange(() => {
        // this.render();
      });
    },

    hasMemo(date) {
      const dateStr = this.formatDate(date.value);
      return _memos.some((memo) => memo.date === dateStr);
    },

    formatDate(date) {
      // console.log("[]formatDate", date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },

    navigateMonth(direction) {
      if (direction > 0) {
        calendar$.nextMonth();
        return;
      }
      calendar$.prevMonth();
    },
  };
}
