import { BaseDomain } from "@/domains/base";

export class PasteEventProfileModel extends BaseDomain<any> {
  state = {
    profile: null as {
      type: string;
      types?: string;
      text?: string;
      image_url?: string;
      files?: any[];
      language?: string;
    } | null,
    error: null as any,
  };
  methods = {
    load: async (id: string) => {},
  };
  onStateChange(handler: (v: any) => void) {
    // @ts-ignore
    return this.on("StateChange", handler);
  }
}
