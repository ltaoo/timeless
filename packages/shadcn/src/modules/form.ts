import { View, ViewProps, ViewChildren } from "@timeless/timeless";
import { ObjectFieldCore, ArrayFieldCore } from "@timeless/ui";

export function Form(
  props: ViewProps & { store: ObjectFieldCore<any> | ArrayFieldCore<any> },
  children?: ViewChildren,
) {
  // if (props.store.symbol === "ObjectFieldCore") {
  //   return ObjectFieldPrimitive.Fields({
  //     store: props.store as ObjectFieldCore<any>,
  //     render() {
  //       // return [Field({ store: field, autoRender: true })];
  //       return [View({}, ["Hello"])];
  //     },
  //   });
  // }

  // if (props.store.symbol === "ArrayFieldCore") {
  //   const arrayStore = props.store as ArrayFieldCore<any>;
  //   return View({ class: "space-y-4" }, [
  //     ArrayFieldPrimitive.Items({
  //       store: arrayStore,
  //       render(item) {
  //         return [
  //           View(
  //             {
  //               class:
  //                 "flex items-start gap-2 p-4 border border-zinc-200 dark:border-zinc-800 rounded-md",
  //             },
  //             [
  //               // View({ class: "flex-1" }, [
  //               //   Field({ store: item.field, autoRender: true }),
  //               // ]),
  //               ArrayFieldPrimitive.Remove(
  //                 {
  //                   store: arrayStore,
  //                   id: item.id,
  //                 },
  //                 [
  //                   Button(
  //                     {
  //                       class: "h-8 w-8",
  //                       store: new Timeless.ui.ButtonCore({
  //                         variant: "ghost",
  //                         size: "icon",
  //                       }),
  //                     },
  //                     [XOutlined({ class: "h-4 w-4" })],
  //                   ),
  //                 ],
  //               ),
  //             ],
  //           ),
  //         ];
  //       },
  //     }),
  //     ArrayFieldPrimitive.Append(
  //       {
  //         store: arrayStore,
  //         class: "w-full",
  //       },
  //       [
  //         Button(
  //           {
  //             store: new Timeless.ui.ButtonCore({
  //               variant: "outline",
  //             }),
  //             class: "w-full",
  //           },
  //           ["Add Item"],
  //         ),
  //       ],
  //     ),
  //   ]);
  // }

  return View(props, children);
}

// const ObjectFieldPrimitive = FieldPrimitive.ObjectField;
// const ArrayFieldPrimitive = FieldPrimitive.ArrayField;
