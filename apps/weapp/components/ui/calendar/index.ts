import { ui } from "@timeless/domains";

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
      observer(store: ui.CalendarCore) {
        if (!store) {
          return;
        }
        const { day, month, weeks, selectedDay } = store.state;
        console.log("cur month", month, weeks);
        this.setData({
          title: month.text,
          day,
          month,
          weeks,
          selectedDay,
        });
        store.onChange((nextState) => {
          const { day, month, weeks, selectedDay: selected } = nextState;
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
      const store = _store as ui.CalendarCore;
      // console.log("[COMPONENT]ui/dialog - attached", store);
    },
  },
  methods: {},
});
