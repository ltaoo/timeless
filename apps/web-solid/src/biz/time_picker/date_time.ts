import { BaseDomain } from "@/domains/base";
import { ButtonCore } from "@/domains/ui/button";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { DialogCore } from "@/domains/ui/dialog";
import { Application } from "@/domains/app";

export class DateTimePickerModel extends BaseDomain<any> {
  ui: {
    $input_date: {
      ui: {
        $dialog: DialogCore;
        $view_year: ScrollViewCore;
        $view_month: ScrollViewCore;
        $view_date: ScrollViewCore;
        $view_hour: ScrollViewCore;
        $view_minute: ScrollViewCore;
        $btn_set_today: ButtonCore;
        $btn_confirm: ButtonCore;
      };
      methods: {
        handleClickInput: () => void;
        selectYear: (v: number) => void;
        selectMonth: (v: number) => void;
        selectDate: (v: number) => void;
        selectHour: (v: number) => void;
        selectMinute: (v: number) => void;
      };
    };
    $input_time: {
      ui: {
        $dialog: DialogCore;
        $view_hour: ScrollViewCore;
        $view_minute: ScrollViewCore;
        $btn_set_today: ButtonCore;
        $btn_confirm: ButtonCore;
      };
      methods: {
        handleClickInput: () => void;
        selectHour: (v: number) => void;
        selectMinute: (v: number) => void;
      };
    };
  };
  state = {
    full_date_text: "",
    time_text: "",
    tmp_full_date_text: "",
    tmp_full_time_text: "",
    options_year: [] as any[],
    options_month: [] as any[],
    options_date: [] as any[],
    options_hour: [] as any[],
    options_minute: [] as any[],
  };
  app: Application<any>;

  constructor(props: { app: Application<any> }) {
    super();
    this.app = props.app;
    this.ui = {
      $input_date: {
        ui: {
          $dialog: new DialogCore(),
          $view_year: new ScrollViewCore(),
          $view_month: new ScrollViewCore(),
          $view_date: new ScrollViewCore(),
          $view_hour: new ScrollViewCore(),
          $view_minute: new ScrollViewCore(),
          $btn_set_today: new ButtonCore(),
          $btn_confirm: new ButtonCore(),
        },
        methods: {
          handleClickInput: () => {},
          selectYear: (v: number) => {},
          selectMonth: (v: number) => {},
          selectDate: (v: number) => {},
          selectHour: (v: number) => {},
          selectMinute: (v: number) => {},
        },
      },
      $input_time: {
        ui: {
          $dialog: new DialogCore(),
          $view_hour: new ScrollViewCore(),
          $view_minute: new ScrollViewCore(),
          $btn_set_today: new ButtonCore(),
          $btn_confirm: new ButtonCore(),
        },
        methods: {
          handleClickInput: () => {},
          selectHour: (v: number) => {},
          selectMinute: (v: number) => {},
        },
      },
    };
  }

  onStateChange(handler: (v: any) => void) {
    // @ts-ignore
    return this.on("StateChange", handler);
  }
}
