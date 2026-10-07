import { vm, ViewProps, ViewChildren, Ref, computed, classNames } from "@timeless/timeless";
import { Button } from "./button";

/** Controlled selection; click/loading/disabled behavior is supplied by ButtonCore. */
export function OptionChip(props: ViewProps & { store: vm.ButtonCore; selected?: boolean | Ref<boolean> }, children: ViewChildren = []) {
  const { selected = false, class: cls, attributes, ...rest } = props;
  const selectedClass = typeof selected === "boolean" ? (selected ? "is-selected" : "") : computed(selected, v => v ? "is-selected" : "");
  const pressed = typeof selected === "boolean" ? String(selected) : computed(selected, v => String(v));
  return Button({ ...rest, attributes: { ...attributes, "aria-pressed": pressed }, class: classNames(["lucky-option", selectedClass, cls]) }, children);
}
