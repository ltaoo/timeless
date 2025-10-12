import { CalendarCore } from "@/biz/calendar/index";

Component({
  externalClasses: ["class-name"],
  options: {
    // pureDataPattern: /^_/,
    virtualHost: true,
    addGlobalClass: true,
  },
  properties: {
    _store: {
      type: Object,
      observer(store: CalendarCore) {
        if (!store) {
          return;
        }
        const { day, month, weeks, selectedDay } = store;
        console.log("cur month", month, weeks);
        this.setData({
          title: month.text,
          day,
          month,
          weeks,
          selectedDay,
        });
        store.onStateChange((nextState) => {
          const { day, month, weeks, selected } = nextState;
          this.setData({
            title: month.text,
            day,
            month,
            weeks,
            selectedDay: selected,
          });
        });
      },
    },
  },
  data: {
    title: "",
    day: null,
    month: null,
    weeks: [],
    selectedDay: null,
  },
  lifetimes: {
    attached() {
      const { _store } = this.data;
      const store = _store as CalendarCore;
      // console.log("[COMPONENT]ui/dialog - attached", store);
    },
  },
  methods: {},
});
