import { View, For, refarr as refArray } from "@timeless/timeless";
import {
  InputCore,
  SelectCore,
  CheckboxCore,
  ButtonCore,
  SingleFieldCore,
} from "@timeless/inner-vm";

import { UINode, FieldProps, ResolvedNode } from "./types";

/**
 * Component registry — allows external injection of styled components (e.g. shadcn).
 * Falls back to ui-primitive unstyled components.
 */
let _components: Record<string, (...args: any[]) => any> = {};

export function setComponents(components: Record<string, (...args: any[]) => any>) {
  _components = components;
}

export function getComponent(name: string) {
  return _components[name] ?? null;
}

/**
 * Create the input core for a field node based on field.input.type.
 */
function createInputCore(fieldProps: FieldProps) {
  const inputDef = fieldProps.input;
  switch (inputDef.type) {
    case "select":
      return new SelectCore<string>({
        defaultValue: inputDef.defaultValue ?? null,
        placeholder: inputDef.placeholder ?? "请选择",
        options: (inputDef.options ?? []).map((o) => ({
          label: o.label,
          value: o.value,
        })),
      });
    case "checkbox":
      return new CheckboxCore({
        checked: inputDef.defaultValue ?? false,
      });
    case "textarea":
      return new InputCore<string>({
        defaultValue: inputDef.defaultValue ?? "",
        placeholder: inputDef.placeholder ?? "请输入",
        type: "textarea",
      });
    case "input":
    default:
      return new InputCore<string>({
        defaultValue: inputDef.defaultValue ?? "",
        placeholder: inputDef.placeholder ?? "请输入",
      });
  }
}

/**
 * Resolve a "field" UINode → SingleFieldCore + element.
 */
export function resolveField(node: UINode): ResolvedNode {
  const fieldProps = node.props as FieldProps;
  const inputCore = createInputCore(fieldProps);

  const field$ = new SingleFieldCore({
    label: fieldProps.label,
    name: fieldProps.name,
    help: fieldProps.help,
    hidden: false,
    rules: (fieldProps.rules ?? []).map((r) => ({
      required: r.required,
    })),
    input: inputCore,
  });

  // Try to use registered Field component, otherwise build a basic one
  const FieldComponent = getComponent("Field");
  const InputComponent = getComponent("Input");
  const SelectComponent = getComponent("Select");
  const CheckboxComponent = getComponent("Checkbox");
  const TextareaComponent = getComponent("Textarea");

  let inputElement: any;

  switch (fieldProps.input.type) {
    case "select":
      inputElement = SelectComponent
        ? SelectComponent({ store: inputCore })
        : View({ class: "a2ui-select" });
      break;
    case "checkbox":
      inputElement = CheckboxComponent
        ? CheckboxComponent({ store: inputCore })
        : View({ class: "a2ui-checkbox" });
      break;
    case "textarea":
      inputElement = TextareaComponent
        ? TextareaComponent({ store: inputCore })
        : View({ class: "a2ui-textarea" });
      break;
    case "input":
    default:
      inputElement = InputComponent
        ? InputComponent({ store: inputCore })
        : View({ class: "a2ui-input" });
      break;
  }

  const element = FieldComponent
    ? FieldComponent({ store: field$ }, [inputElement])
    : View({ class: "a2ui-field" }, [inputElement]);

  return {
    id: node.id,
    parentId: null,
    element,
    field$,
    core: inputCore,
    schema: node,
  };
}

/**
 * Resolve a container node (view / row / col) → View + refArray children.
 */
export function resolveContainer(
  node: UINode,
  className: string,
): ResolvedNode {
  const children$ = refArray<any>([]);
  const element = View(
    {
      class: [className, node.props?.class].filter(Boolean).join(" ") || undefined,
    },
    [
      For({
        each: children$,
        render(item: any) {
          return item;
        },
      }),
    ],
  );

  return {
    id: node.id,
    parentId: null,
    element,
    children$,
    schema: node,
  };
}

/**
 * Resolve a "button" UINode → ButtonCore + element.
 */
export function resolveButton(node: UINode): ResolvedNode {
  const props = node.props ?? {};
  const core = new ButtonCore({
    variant: props.variant ?? "default",
    size: props.size ?? "default",
    onClick: props.onClick,
  });

  const ButtonComponent = getComponent("Button");
  const element = ButtonComponent
    ? ButtonComponent({ store: core }, [props.text ?? "Button"])
    : View({ class: "a2ui-button" }, [props.text ?? "Button"]);

  return {
    id: node.id,
    parentId: null,
    element,
    core,
    schema: node,
  };
}

/**
 * Resolve a "separator" UINode.
 */
export function resolveSeparator(node: UINode): ResolvedNode {
  const SeparatorComponent = getComponent("Separator");
  const element = SeparatorComponent
    ? SeparatorComponent(node.props ?? {})
    : View({ class: "a2ui-separator" });

  return {
    id: node.id,
    parentId: null,
    element,
    schema: node,
  };
}

/**
 * Resolve a "text" UINode.
 */
export function resolveText(node: UINode): ResolvedNode {
  const props = node.props ?? {};
  const element = View(
    { class: props.class },
    [props.content ?? ""],
  );

  return {
    id: node.id,
    parentId: null,
    element,
    schema: node,
  };
}

/**
 * Main resolve function: dispatches to the correct resolver by type.
 */
export function resolveNode(node: UINode): ResolvedNode {
  switch (node.type) {
    case "view":
      return resolveContainer(node, "a2ui-view");
    case "row": {
      const cols = node.props?.cols ?? 2;
      return resolveContainer(node, `grid grid-cols-${cols} gap-4`);
    }
    case "col": {
      const span = node.props?.span ?? 1;
      return resolveContainer(node, `col-span-${span}`);
    }
    case "field":
      return resolveField(node);
    case "button":
      return resolveButton(node);
    case "separator":
      return resolveSeparator(node);
    case "text":
      return resolveText(node);
    case "input":
    case "select":
    case "checkbox":
    case "textarea":
      // Standalone inputs without field wrapper
      return resolveStandaloneInput(node);
    default:
      return resolveContainer(node, "a2ui-unknown");
  }
}

/**
 * Resolve standalone input/select/checkbox/textarea outside a field.
 */
function resolveStandaloneInput(node: UINode): ResolvedNode {
  const props = node.props ?? {};
  let core: any;
  let element: any;

  switch (node.type) {
    case "select":
      core = new SelectCore<string>({
        defaultValue: props.defaultValue ?? null,
        placeholder: props.placeholder ?? "请选择",
        options: (props.options ?? []).map((o: any) => ({
          label: o.label,
          value: o.value,
        })),
      });
      element = getComponent("Select")
        ? getComponent("Select")({ store: core })
        : View({ class: "a2ui-select" });
      break;
    case "checkbox":
      core = new CheckboxCore({
        checked: props.defaultValue ?? false,
      });
      element = getComponent("Checkbox")
        ? getComponent("Checkbox")({ store: core })
        : View({ class: "a2ui-checkbox" });
      break;
    case "textarea":
      core = new InputCore<string>({
        defaultValue: props.defaultValue ?? "",
        placeholder: props.placeholder ?? "请输入",
        type: "textarea",
      });
      element = getComponent("Textarea")
        ? getComponent("Textarea")({ store: core })
        : View({ class: "a2ui-textarea" });
      break;
    case "input":
    default:
      core = new InputCore<string>({
        defaultValue: props.defaultValue ?? "",
        placeholder: props.placeholder ?? "请输入",
      });
      element = getComponent("Input")
        ? getComponent("Input")({ store: core })
        : View({ class: "a2ui-input" });
      break;
  }

  return {
    id: node.id,
    parentId: null,
    element,
    core,
    schema: node,
  };
}
