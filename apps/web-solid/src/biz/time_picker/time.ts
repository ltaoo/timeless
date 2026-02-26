import { BaseDomain } from "@/domains/base";
import { ButtonCore } from "@/domains/ui/button";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
import { DialogCore } from "@/domains/ui/dialog";
import { Application } from "@/domains/app";

export class TimePickerModel extends BaseDomain<any> {
  ui: {
    $dialog: DialogCore;
    $view_hour: ScrollViewCore;
    $view_minute: ScrollViewCore;
    $btn_set_today: ButtonCore;
    $btn_confirm: ButtonCore;
  };
  state = {
    full_time_text: "",
    tmp_full_time_text: "",
    options_hour: [] as { value: number; label: string; selected: boolean }[],
    options_minute: [] as { value: number; label: string; selected: boolean }[],
  };
  app: Application<any>;

  constructor(props: { app: Application<any> }) {
    super();
    this.app = props.app;
    this.ui = {
      $dialog: new DialogCore(),
      $view_hour: new ScrollViewCore(),
      $view_minute: new ScrollViewCore(),
      $btn_set_today: new ButtonCore(),
      $btn_confirm: new ButtonCore(),
    };
  }

  onStateChange(handler: (v: any) => void) {
    // @ts-ignore
    return this.on("StateChange", handler);
  }
  methods = {
    handleClickInput: () => {},
    selectHour: (v: number) => {},
    selectMinute: (v: number) => {},
  };
}
