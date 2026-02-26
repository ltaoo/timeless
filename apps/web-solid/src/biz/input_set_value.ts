import { BaseDomain } from "@/domains/base";
import { DialogCore } from "@/domains/ui/dialog";
import { ButtonCore } from "@/domains/ui/button";

export enum SetValueUnit {
  None,
}

export function getSetValueUnit(u: any) {
  return "";
}

export class SetValueInputModel extends BaseDomain<any> {
  state = {
    value: "",
    unit: "",
    text: "",
    options: [] as any[],
    showSubKey: false,
  };
  ui: {
    $keyboard: {
      methods: {
        handleClickNumber: (v: string) => void;
        handleClickDelete: () => void;
        handleClickSub: () => void;
        handleClickDot: () => void;
      };
    };
    $btn_confirm: ButtonCore;
  };

  constructor() {
    super();
    this.ui = {
      $keyboard: {
        methods: {
          handleClickNumber: (v: string) => this.methods.handleClickNumber(v),
          handleClickDelete: () => this.methods.handleClickDelete(),
          handleClickSub: () => this.methods.handleClickSub(),
          handleClickDot: () => this.methods.handleClickDot(),
        },
      },
      $btn_confirm: new ButtonCore(),
    };
  }

  setUnit(u: string) {}

  methods = {
    handleClickField: () => {},
    // setUnit: (u: string) => {},
    handleSubmit: () => {},
    handleClickNumber: (v: string) => {},
    handleClickDelete: () => {},
    handleClickSub: () => {},
    handleClickDot: () => {},
  };

  onStateChange(handler: (v: any) => void) {
    // @ts-ignore
    return this.on("StateChange", handler);
  }
}
