import {
  View,
  Show,
  Match,
  computed,
  refobj,
  ViewProps,
  ViewChildren,
  For,
  FieldPrimitive,
  Switch,
} from "@timeless/headless";
import { SingleFieldCore, ObjectFieldCore, ArrayFieldCore } from "@timeless/ui";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Checkbox } from "./checkbox";
import { Select } from "./select";
import { Button } from "./button";
import { XOutlined } from "@timeless/icons";

export function Field(
  props: ViewProps & { store: SingleFieldCore<any>; autoRender?: boolean },
  children?: ViewChildren,
) {
  const state_ = refobj(props.store.state);

  props.store.onStateChange((v) => {
    state_.as(v);
  });

  // 生成唯一的 field id
  const fieldId = `field-${props.store.name || Math.random().toString(36).substr(2, 9)}`;

  const label_class_ = computed(state_, (s) => {
    return [
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
      s.error ? "text-red-500 dark:text-red-400" : "",
    ]
      .filter(Boolean)
      .join(" ");
  });

  const error_class_ = "text-sm text-red-500 dark:text-red-400 mt-1";
  const help_class_ = "text-sm text-zinc-500 dark:text-zinc-400 mt-1";

  const renderInput = () => {
    if (children) {
      return View({}, children);
    }
    if (props.autoRender) {
      return Switch({ when: computed(state_, (s) => s.input.shape) }, [
        Match({ value: "input" }, [Input({ store: props.store.input, id: fieldId })]),
        Match({ value: "textarea" }, [Textarea({ store: props.store.input, id: fieldId })]),
        Match({ value: "checkbox" }, [Checkbox({ store: props.store.input, id: fieldId })]),
        Match({ value: "select" }, [Select({ store: props.store.input, id: fieldId })]),
      ]);
    }
    return null;
  };

  return View({ class: "space-y-2" }, [
    Show({ when: computed(state_, (s) => !!s.label) }, [
      View({ class: "flex items-center gap-1" }, [
        View({ as: "label", htmlFor: fieldId, class: label_class_ }, [
          computed(state_, (s) => s.label),
        ]),
        Show(
          {
            when: computed(state_, (s) => {
              return s.input.type?.required || false;
            }),
          },
          [View({ class: "text-red-500", style: "line-height:1;" }, ["*"])],
        ),
      ]),
    ]),
    renderInput(),
    Show({ when: computed(state_, (s) => !!s.error) }, [
      View({ class: error_class_ }, [
        computed(state_, (s) => s.error?.message || ""),
      ]),
    ]),
    // Show(
    //   {
    //     when: computed(state_, (s) => {
    //       return !s.error && !!props.store.help;
    //     }),
    //   },
    //   [View({ class: help_class_ }, [props.store.help])],
    // ),
  ]);
}

export function Form(
  props: ViewProps & { store: ObjectFieldCore<any> | ArrayFieldCore<any> },
  children?: ViewChildren,
) {
  if (props.store.symbol === "ObjectFieldCore") {
    return ObjectFieldPrimitive.Fields({
      store: props.store as ObjectFieldCore<any>,
      render(fieldName, field) {
        // return [Field({ store: field, autoRender: true })];
        return [View({}, ["Hello"])];
      },
    });
  }

  if (props.store.symbol === "ArrayFieldCore") {
    const arrayStore = props.store as ArrayFieldCore<any>;
    return View({ class: "space-y-4" }, [
      ArrayFieldPrimitive.Items({
        store: arrayStore,
        render(item, index) {
          return [
            View(
              {
                class:
                  "flex items-start gap-2 p-4 border border-zinc-200 dark:border-zinc-800 rounded-md",
              },
              [
                // View({ class: "flex-1" }, [
                //   Field({ store: item.field, autoRender: true }),
                // ]),
                ArrayFieldPrimitive.Remove(
                  {
                    store: arrayStore,
                    id: item.id,
                  },
                  [
                    Button(
                      {
                        store: new Timeless.ui.ButtonCore({}),
                        variant: "ghost",
                        size: "icon",
                        class: "h-8 w-8",
                      },
                      [XOutlined({ class: "h-4 w-4" })],
                    ),
                  ],
                ),
              ],
            ),
          ];
        },
      }),
      ArrayFieldPrimitive.Append(
        {
          store: arrayStore,
          class: "w-full",
        },
        [
          Button(
            {
              store: new Timeless.ui.ButtonCore({}),
              variant: "outline",
              class: "w-full",
            },
            ["Add Item"],
          ),
        ],
      ),
    ]);
  }

  return View(props, children);
}

const ObjectFieldPrimitive = FieldPrimitive.ObjectField;
const ArrayFieldPrimitive = FieldPrimitive.ArrayField;
