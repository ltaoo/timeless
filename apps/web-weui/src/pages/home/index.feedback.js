import { CategoryPage } from "@/components/index.js";
import {
  SkeletonSection,
  DialogSection,
  SheetSection,
  ToastSection,
} from "./sections.js";

export default function FeedbackCategoryView() {
  return CategoryPage("反馈", [
    SkeletonSection(),
    DialogSection(),
    SheetSection(),
    ToastSection(),
  ]);
}
