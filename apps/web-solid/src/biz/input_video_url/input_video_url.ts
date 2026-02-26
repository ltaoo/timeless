import { BaseDomain } from "@/domains/base";
import { DialogCore } from "@/domains/ui/dialog";
import { InputCore } from "@/domains/ui/form/input";
import { ButtonCore } from "@/domains/ui/button";
import { VideoPlayerCore } from "@/domains/ui/video-player";
import { Application } from "@/domains/app";

export class VideoURLInputModel extends BaseDomain<any> {
  state = {
    preview: false,
  };
  ui: {
    $dialog: DialogCore;
    $input: InputCore<any>;
    $btn_preview: ButtonCore;
    $video: VideoPlayerCore;
  };
  app: Application<any>;

  constructor(props: { app: Application<any> }) {
    super();
    this.app = props.app;
    this.ui = {
      $dialog: new DialogCore(),
      $input: new InputCore({ defaultValue: "" }),
      $btn_preview: new ButtonCore({}),
      $video: new VideoPlayerCore({ app: this.app }),
    };
  }
  
  methods: { preview: () => void } = {
    preview: () => this.preview(),
  };

  preview() {}

  onStateChange(handler: (v: any) => void) {
    // @ts-ignore
    return this.on("StateChange", handler);
  }
}
