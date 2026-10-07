import { CategoryPage } from "@/components/index.js";
import {
  ProgressSection,
  SkeletonSection,
  AlertSection,
  DialogSection,
  SheetSection,
  PopconfirmSection,
  ToastSection,
} from "./sections.js";

export default function FeedbackCategoryView() {
  return CategoryPage("反馈", [
    ProgressSection(),
    SkeletonSection(),
    AlertSection(),
    DialogSection(),
    SheetSection(),
    PopconfirmSection(),
    ToastSection(),
  ]);
}
