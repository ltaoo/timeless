import { ref, Text, TimelessElement, VNodeView } from "@timeless/timeless";
import { NativeButton } from "./button";

export function NativeFilePicker(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}) {
  const label = ref("选择文件");
  const button = NativeButton({
    ...props,
    elm: { ...props.elm, children: [Text(label)] },
  });
  let files: any[] = [];
  const click = () => {
    const node = button.get$elm();
    if (node.attrs.disabled === undefined) node._pickFiles?.();
  };
  return {
    ...button,
    t: "file-picker",
    click,
    focus: () => button.get$elm()._focus?.(),
    blur: () => button.get$elm()._blur?.(),
    setValue() {
      files = [];
      label.as("选择文件");
    },
    render() {
      const node = button.render();
      node.filePicker = {
        get accept() {
          return props.elm.state.accept ?? "";
        },
        get multiple() {
          return !!props.elm.state.multiple;
        },
      };
      Object.defineProperty(node, "files", { get: () => files });
      Object.defineProperty(node, "value", {
        get: () => files.map((file) => file.name).join(", "),
        set: (value) => {
          if (!value) {
            files = [];
            label.as("选择文件");
          }
        },
      });
      node._receiveFiles = (selected: any[]) => {
        if (node.attrs.disabled !== undefined || !selected.length) return;
        files = selected;
        label.as(files.map((file) => file.name).join("、"));
        node._dispatchNativeEvent("change", {});
      };
      node.listeners.click = click;
      return node;
    },
  };
}
export function isNativeFilePicker(
  value: any,
): value is ReturnType<typeof NativeFilePicker> {
  return value.t === "file-picker";
}
export type NativeFilePicker = ReturnType<typeof NativeFilePicker>;
