import { BaseDomain } from "@/domains/base";
import { DialogCore } from "@/domains/ui/dialog";
import { Application } from "@/domains/app";

export class InputWithKeyboardModel extends BaseDomain<any> {
  state = {
    value: "",
    placeholder: "",
    showSubKey: false,
  };
  ui: {
    $dialog: DialogCore;
    $keyboard: {
      methods: {
        handleClickNumber: (v: string) => void;
        handleClickDelete: () => void;
        handleClickSub: () => void;
        handleClickDot: () => void;
      };
    };
  };
  app: Application<any>;

  constructor(props: { app: Application<any> }) {
    super();
    this.app = props.app;
    this.ui = {
      $dialog: new DialogCore(),
      $keyboard: {
        methods: {
          handleClickNumber: (v: string) => {},
          handleClickDelete: () => {},
          handleClickSub: () => {},
          handleClickDot: () => {},
        },
      },
    };
  }

  methods = {
    handleClickField: (rect: any) => {},
    handleSubmit: () => {},
  };

  onStateChange(handler: (v: any) => void) {
    // @ts-ignore
    return this.on("StateChange", handler);
  }
}
