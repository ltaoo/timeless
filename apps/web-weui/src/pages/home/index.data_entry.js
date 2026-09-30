import { CategoryPage } from "@/components/index.js";
import {
  InputSection,
  TextareaSection,
  CheckboxSection,
  SwitchSection,
  ToggleSection,
  SelectSection,
} from "./sections.js";

export default function DataEntryCategoryView() {
  return CategoryPage("数据录入", [
    InputSection(),
    TextareaSection(),
    CheckboxSection(),
    SwitchSection(),
    ToggleSection(),
    SelectSection(),
  ]);
}
