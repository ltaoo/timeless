import { SelectCore } from "@timeless/ui";
import { Select } from "./select";

// 创建 Select store
const selectStore = new SelectCore({
  defaultValue: null,
  placeholder: "Select a fruit",
  options: [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "orange", label: "Orange" },
    { value: "grape", label: "Grape" },
  ],
  onChange: (value) => {
    console.log("Selected:", value);
  },
});

// 使用组件
export function SelectExample() {
  return Select({
    store: selectStore,
    placeholder: "Select a fruit",
  });
}
