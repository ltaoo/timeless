import { ui, vm } from "@timeless/timeless";
import {
  classNames,
  combine,
  computed,
  Icon,
  ref,
  refobj,
  View,
  Show,
  ViewProps,
  ViewChildren,
} from "@timeless/timeless";

/**
 * FilePicker · Animal Island
 *
 * 用 .animal-file-dropzone / .animal-file-input 命名空间表达 Animal Island 的
 * 2px 描边 + 大圆角 + 柔和阴影；拖拽区用 2px 虚线描边，拖入时转薄荷青。
 *
 * FileDropZone 负责拖拽 / 点击选择，FileInput 是紧凑的行内文件输入框。
 */

export function FileDropZone(
  props: ViewProps & {
    store: vm.FilePickerCore;
    tip?: string;
  },
  _children?: ViewChildren,
) {
  const { store, tip, ...rest } = props;
  const state_ = refobj(store.state);
  const error_msg_ = ref("");
  const error_files_ = ref("");

  const has_value_ = computed(state_, (d) => !!(d.value && d.value.length > 0));
  const is_loading_ = computed(state_, (d) => d.loading || false);
  const is_invalid_ = computed(state_, (d) => !!d.invalid_files.length);
  const file_names_ = computed(state_, (d) =>
    d.value ? d.value.map((f) => f.name).join("、") : "",
  );
  const wait_upload_ = combine(
    {
      hasValue: has_value_,
      isLoading: is_loading_,
      hasReject: is_invalid_,
    },
    (t) => !t.hasValue && !t.isLoading && !t.hasReject,
  );

  store.onStateChange((v) => {
    state_.as(v);
    if (v.value && v.value.length > 0) {
      error_msg_.as("");
      error_files_.as("");
    }
  });

  store.onReject((data) => {
    store.clear();
    const names = data.files.map((f) => f.name).join(", ");
    error_files_.as(names);
    error_msg_.as(`不支持的文件类型，仅支持 ${data.accept}`);
  });

  return ui.FilePickerPrimitive.Root(
    { store, class: classNames(["animal-file-dropzone", rest.class]) },
    [
      // 隐藏的原生 input，供点击选择使用。
      // 1) 原生 change 不会自动同步到 core，必须显式转发，否则「点击选择」
      //    这条路不更新 store（拖拽走 DropZone 的另一条路）。
      // 2) store.handleChange 会把原生 FileList 原样塞进 state.value，而
      //    FileList 没有 .map，渲染文件名时会拿到空串；这里统一转成数组，
      //    与 DropZone 的 drop 路径保持一致。
      ui.FilePickerPrimitive.Input({
        store,
        class: "animal-visually-hidden",
        attributes: {
          accept: store.accept || undefined,
          multiple: store.multiple ? "" : undefined,
        },
        onChange(e) {
          const files = (e.target as HTMLInputElement)?.files;
          store.setValue(files ? (Array.from(files) as any) : []);
        },
      }),
      ui.FilePickerPrimitive.DropZone(
        {
          store,
          class: classNames([
            "animal-file-dropzone__area",
            computed(is_loading_, (t) => (t ? "is-loading" : "")),
            computed(state_, (t) => {
              if (t.invalid) {
                return "is-invalid";
              }
              if (t.dragging) {
                return "is-dragging";
              }
              return "";
            }),
          ]),
        },
        [
          Show({
            when: wait_upload_,
            ok() {
              return [
                View({ class: "animal-file-hint" }, [
                  Icon({ name: "upload", size: 24, class: "animal-file-hint__icon" }),
                  View({ class: "animal-file-hint__text" }, [
                    Show({
                      when: !!tip,
                      ok() {
                        return tip as ViewChildren;
                      },
                      else() {
                        return "将文件拖拽到此处，或点击选择";
                      },
                    }),
                  ]),
                  Show({
                    when: !!store.accept,
                    ok() {
                      return View({ class: "animal-file-hint__accept" }, [
                        store.accept,
                      ]);
                    },
                  }),
                ]),
              ];
            },
          }),
          Show({
            when: is_invalid_,
            ok() {
              return [
                View({ class: "animal-file-error" }, [
                  Icon({ name: "circle-alert", size: 24 }),
                  View({ class: "animal-file-error__name" }, [
                    Icon({ name: "file", size: 14 }),
                    View({ class: "animal-file-error__text" }, [error_files_]),
                  ]),
                  View({ class: "animal-file-error__msg" }, [error_msg_]),
                ]),
              ];
            },
          }),
          Show({
            when: combine(
              { hasValue: has_value_, isLoading: is_loading_ },
              (t) => t.hasValue && !t.isLoading,
            ),
            ok() {
              return [
                View({ class: "animal-file-value" }, [
                  Icon({ name: "file", size: 16 }),
                  View({ class: "animal-file-value__name" }, [file_names_]),
                  ui.FilePickerPrimitive.Clear(
                    { store, class: "animal-file-clear" },
                    [Icon({ name: "circle-x", size: 16 })],
                  ),
                ]),
              ];
            },
          }),
          Show({
            when: is_loading_,
            ok() {
              return [
                View({ class: "animal-file-loading" }, [
                  View({ class: "animal-file-spinner" }, [
                    Icon({ name: "loader", size: 16 }),
                  ]),
                  View({}, ["上传中..."]),
                ]),
              ];
            },
          }),
        ],
      ),
    ],
  );
}

export function FileInput(
  props: ViewProps & {
    store: vm.FilePickerCore;
    id?: string;
  },
) {
  const { store, id, class: cls, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const has_value_ = computed(state_, (d) => !!(d.value && d.value.length > 0));
  const is_loading_ = computed(state_, (d) => d.loading || false);

  return ui.FilePickerPrimitive.Root(
    { store, class: classNames(["animal-file-input", cls]) },
    [
      ui.FilePickerPrimitive.Input({
        ...rest,
        id,
        store,
        attributes: {
          ...((rest as any).attributes || {}),
          accept: store.accept || undefined,
          multiple: store.multiple ? "" : undefined,
        },
        class: classNames([
          "animal-control",
          "animal-file-input__field",
          combine({ hasValue: has_value_, isLoading: is_loading_ }, (t) =>
            t.isLoading || t.hasValue ? "has-file" : "",
          ),
        ]),
        onChange(e) {
          const files = (e.target as HTMLInputElement)?.files;
          store.setValue(files ? (Array.from(files) as any) : []);
        },
      }),
      Show({
        when: combine(
          { hasValue: has_value_, isLoading: is_loading_ },
          (t) => t.hasValue && !t.isLoading,
        ),
        ok() {
          return [
            ui.FilePickerPrimitive.Clear({ store, class: "animal-file-clear" }, [
              Icon({ name: "circle-x", size: 16 }),
            ]),
          ];
        },
      }),
      ui.FilePickerPrimitive.Loading({ store, class: "animal-file-loading" }, [
        View({ class: "animal-file-spinner" }, [Icon({ name: "loader", size: 16 })]),
      ]),
    ],
  );
}
