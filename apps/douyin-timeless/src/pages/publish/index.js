import { BottomNavigationView } from "@/components/bottom-navigation.js";
import { PublishPageModel } from "./index.model.js";

function PreviewMediaView(props) {
  const { vm$ } = props;
  return Show({
    when: computed(vm$.state.preview_url, Boolean),
    ok() {
      return Match({
        when: vm$.state.media_type,
        cases: {
          video() {
            return Video({
              class: "publish-preview-media",
              src: vm$.state.preview_url,
              autoplay: true,
              loop: true,
              muted: true,
              playsInline: true,
            });
          },
          image() {
            return Img({
              class: "publish-preview-media",
              src: vm$.state.preview_url,
              alt: "待发布作品",
            });
          },
        },
      });
    },
    else() {
      return View({ class: "camera-placeholder" }, [
        View({ class: "camera-focus-mark" }, [
          View({ class: "focus-corner top-left" }),
          View({ class: "focus-corner top-right" }),
          View({ class: "focus-corner bottom-left" }),
          View({ class: "focus-corner bottom-right" }),
        ]),
        View({ class: "camera-tip" }, ["轻触拍摄 · 长按录制"]),
      ]);
    },
  });
}

/** @param {ViewComponentProps} props */
export default function PublishPageView(props) {
  const vm$ = PublishPageModel(props);
  return View(
    {
      class: "page page-dark publish-page",
      onUnmounted() {
        vm$.destroy();
      },
    },
    [
      PreviewMediaView({ vm$ }),
      View({ class: "publish-topbar" }, [
        View({ class: "publish-close", onClick: vm$.methods.close }, ["×"]),
        Show({
          when: computed(vm$.state.preview_url, Boolean),
          ok() {
            return View(
              { class: "publish-next", onClick: vm$.methods.publish },
              ["发布"],
            );
          },
        }),
      ]),
      View({ class: "publish-tools" }, [
        View({ class: "publish-tool", onClick: vm$.methods.toggle_flash }, [
          View({ class: "publish-tool-icon" }, ["ϟ"]),
          computed(vm$.state.flash_on, (value) =>
            value ? "闪光灯开" : "闪光灯",
          ),
        ]),
        View({ class: "publish-tool" }, [
          View({ class: "publish-tool-icon" }, ["↻"]),
          "翻转",
        ]),
        View({ class: "publish-tool" }, [
          View({ class: "publish-tool-icon" }, ["◉"]),
          "滤镜",
        ]),
        View({ class: "publish-tool" }, [
          View({ class: "publish-tool-icon" }, ["✧"]),
          "美化",
        ]),
      ]),
      View({ class: "recording-time" }, [
        Show({
          when: vm$.state.recording,
          ok() {
            return View({}, ["● ", vm$.state.recorded_seconds, "s / 15s"]);
          },
        }),
      ]),
      View({ class: "publish-controls" }, [
        View({ class: "publish-upload" }, [
          View({ class: "publish-upload-thumb" }, [
            Icon({ name: "image", size: 24 }),
          ]),
          View({ class: "publish-upload-label" }, ["相册"]),
          Input({
            class: "publish-file-input",
            attributes: { type: "file", accept: "image/*,video/*" },
            onChange: vm$.methods.choose_file,
          }),
        ]),
        View(
          {
            class: computed(vm$.state.recording, (value) =>
              value ? "record-button is-recording" : "record-button",
            ),
            onClick: vm$.methods.toggle_record,
          },
          [View({ class: "record-button-inner" })],
        ),
        View({ class: "publish-drafts" }, [
          View({ class: "drafts-thumb" }, ["▦"]),
          View({ class: "publish-upload-label" }, ["草稿 2"]),
        ]),
      ]),
      View({ class: "publish-modes" }, [
        View({ class: "publish-mode" }, ["文字"]),
        View({ class: "publish-mode is-active" }, ["相机"]),
        View({ class: "publish-mode" }, ["模板"]),
        View({ class: "publish-mode" }, ["开直播"]),
      ]),
      BottomNavigationView({ app_model: props.app_model, theme: "dark" }),
    ],
  );
}
