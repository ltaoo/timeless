/** @param {ViewComponentProps} props */
export function PublishPageModel(props) {
  const preview_url_ = ref("");
  const media_type_ = ref("");
  const caption_ = ref("");
  const recording_ = ref(false);
  const recorded_seconds_ = ref(0);
  const flash_on_ = ref(false);
  let recording_timer = null;
  let object_url = "";

  function stop_recording_timer() {
    if (!recording_timer) return;
    globalThis.clearInterval(recording_timer);
    recording_timer = null;
  }

  const methods = {
    choose_file(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      if (object_url) URL.revokeObjectURL(object_url);
      object_url = URL.createObjectURL(file);
      media_type_.as(file.type.startsWith("video/") ? "video" : "image");
      preview_url_.as(object_url);
    },
    toggle_record() {
      if (recording_.value) {
        recording_.as(false);
        stop_recording_timer();
        props.app_model.methods.notify("拍摄已保存到草稿");
        return;
      }
      recorded_seconds_.as(0);
      recording_.as(true);
      recording_timer = globalThis.setInterval(() => {
        recorded_seconds_.increment();
        if (recorded_seconds_.value >= 15) methods.toggle_record();
      }, 1000);
    },
    toggle_flash() {
      flash_on_.toggle();
    },
    set_caption(value) {
      caption_.as(value);
    },
    publish() {
      if (!preview_url_.value && recorded_seconds_.value === 0) {
        props.app_model.methods.notify("请先拍摄或上传作品");
        return;
      }
      props.app_model.methods.notify("发布成功");
      props.app_model.methods.navigate("home");
    },
    close() {
      props.app_model.methods.navigate("home");
    },
  };

  return defineModel({
    state: {
      preview_url: preview_url_,
      media_type: media_type_,
      caption: caption_,
      recording: recording_,
      recorded_seconds: recorded_seconds_,
      flash_on: flash_on_,
    },
    methods,
    listeners: [
      stop_recording_timer,
      () => {
        if (object_url) URL.revokeObjectURL(object_url);
      },
    ],
  });
}
