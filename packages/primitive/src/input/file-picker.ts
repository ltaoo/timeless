import { Ref, isRef } from "@timeless/inner-reactive";

import { Box, BoxProps } from "@/content/box";
import { MountedEvent } from "@/event";

export type FilePickerProps = BoxProps & {
  accept?: string | Ref<string>;
  multiple?: boolean | Ref<boolean>;
  capture?: string | Ref<string>;
  files?: Ref<FileList | null>;
  onChange?: (event: Event) => void;
  onFileDrop?: (files: FileList, event: DragEvent) => void;
};
type FilePickerState = {
  accept: string;
  multiple: boolean;
};

export function FilePicker(props: FilePickerProps = {}) {
  const { accept, multiple, capture, files, onChange, onFileDrop, ...rest } = props;

  let $elm: any = null;
  const box$ = Box<FilePickerState>(rest, {
    accept: "",
    multiple: false,
  });

  const state = box$.state;
  const events = box$.events;

  const methods = {
    subscribe_value() {
      box$.methods.subscribe_props();
      const accept = props.accept;
      if (accept !== undefined) {
        if (isRef(accept)) {
          state.accept = accept.value;
          const unsubscribe = accept.subscribe({
            onChange(v) {
              state.accept = v;
            },
          });
          box$.methods.unsubscribe(unsubscribe);
        } else {
          state.accept = accept;
        }
      }
      const multiple = props.multiple;
      if (multiple !== undefined) {
        if (isRef(multiple)) {
          state.multiple = multiple.value;
          const unsubscribe = multiple.subscribe({
            onChange(v) {
              state.multiple = v;
            },
          });
          box$.methods.unsubscribe(unsubscribe);
        } else {
          state.multiple = multiple;
        }
      }
    },
    updateFiles(fileList: FileList) {
      if (files && isRef(files)) {
        files.value = fileList;
      }
    },
    filterFiles(dataTransfer: DataTransfer): FileList {
      const acceptValue = state.accept;
      if (!acceptValue) {
        return dataTransfer.files;
      }
      const acceptTypes = acceptValue
        .split(",")
        .map((t) => t.trim().toLowerCase());
      const dt = new DataTransfer();
      for (let i = 0; i < dataTransfer.files.length; i++) {
        const file = dataTransfer.files[i];
        const matched = acceptTypes.some((type) => {
          if (type.startsWith(".")) {
            return file.name.toLowerCase().endsWith(type);
          }
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.slice(0, -1));
          }
          return file.type === type;
        });
        if (matched) {
          dt.items.add(file);
        }
      }
      return dt.files;
    },
  };

  methods.subscribe_value();
  box$.methods.add_event();

  if (onChange) {
    const originalOnChange = events.onChange;
    events.onChange = function (event: Event) {
      if (originalOnChange) {
        originalOnChange(event);
      }
      onChange(event);
      const target = event.target as HTMLInputElement;
      if (target.files) {
        methods.updateFiles(target.files);
      }
    };
  } else {
    const originalOnChange = events.onChange;
    events.onChange = function (event: Event) {
      if (originalOnChange) {
        originalOnChange(event);
      }
      const target = event.target as HTMLInputElement;
      if (target.files) {
        methods.updateFiles(target.files);
      }
    };
  }

  events.onDragOver = function (e: DragEvent) {
    e.preventDefault();
  };

  events.onDrop = function (e: DragEvent) {
    e.preventDefault();
    if (!e.dataTransfer) {
      return;
    }
    const filteredFiles = methods.filterFiles(e.dataTransfer);
    if (filteredFiles.length === 0) {
      return;
    }
    methods.updateFiles(filteredFiles);
    if (onFileDrop) {
      onFileDrop(filteredFiles, e);
    }
  };

  return {
    t: "file-picker",
    get $elm() {
      return $elm;
    },
    set $elm(v: any) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: [],
    events,
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        const unsubscribe = props.onMounted(event);
        box$.methods.unsubscribe(unsubscribe);
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      box$.methods.destroy();
    },
  };
}
