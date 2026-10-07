import { CategoryPage } from "@/components/index.js";
import {
  InputSection,
  TextareaSection,
  CheckboxSection,
  CheckboxGroupSection,
  RadioSection,
  SwitchToggleSection,
  SliderSection,
  SelectSection,
  NumberInputSection,
  FieldSection,
  SearchSelectSection,
  FilePickerSection,
  FormSection,
  DatePickerSection,
  DateRangePickerSection,
  TimePickerSection,
  DateTimePickerSection,
  CascaderSection,
} from "./sections.js";

export default function DataEntryCategoryView() {
  return CategoryPage("数据录入", [
    InputSection(),
    TextareaSection(),
    CheckboxSection(),
    CheckboxGroupSection(),
    RadioSection(),
    SwitchToggleSection(),
    SliderSection(),
    SelectSection(),
    NumberInputSection(),
    FieldSection(),
    SearchSelectSection(),
    FilePickerSection(),
    FormSection(),
    DatePickerSection(),
    DateRangePickerSection(),
    TimePickerSection(),
    DateTimePickerSection(),
    CascaderSection(),
  ]);
}
