/** 分类页：数据录入。 */
import { CategoryPage } from "@/components/index.js";
import {
  CascaderSection,
  CheckboxGroupSection,
  CheckboxSection,
  DatePickerSection,
  DateRangePickerSection,
  DateTimePickerSection,
  DialogFormSection,
  FileDropZoneSection,
  FileInputSection,
  InputSection,
  LabelSection,
  NumberInputSection,
  RadioGroupSection,
  SelectSection,
  SliderSection,
  SwitchSection,
  TextareaSection,
  TimePickerSection,
} from "./sections.form.js";

export default function DataEntryCategoryView() {
  return CategoryPage("数据录入", (view$) => [
    InputSection(),
    FileInputSection(),
    FileDropZoneSection(),
    NumberInputSection(),
    TextareaSection(),
    LabelSection(),
    SelectSection(view$),
    CascaderSection(),
    DatePickerSection(),
    DateRangePickerSection(),
    TimePickerSection(),
    DateTimePickerSection(),
    CheckboxSection(),
    CheckboxGroupSection(),
    RadioGroupSection(),
    SwitchSection(),
    SliderSection(),
    DialogFormSection(),
  ]);
}
