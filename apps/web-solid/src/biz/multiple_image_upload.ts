import { BaseDomain } from "@/domains/base";
import { ObjectFieldCore } from "@/domains/ui/formv2";

export class MultipleImageUploadModel extends BaseDomain<any> {
  ui = {
    $form: new ObjectFieldCore({ fields: {} }) as any,
  };
  state = {};
  onStateChange(handler: (v: any) => void) {
    // @ts-ignore
    return this.on("StateChange", handler);
  }
}
