import { DropdownMenu as HDropdownMenu } from "@timeless/headless";

import { t } from "./menu-shared";

// export function DropdownMenu(p: any, c?: ViewChildren) {
//   const { store, ...rest } = p;
//   return DropdownMenuPrimitive.Root(rest, [
//     DropdownMenuPrimitive.Trigger({ store }, c),
//     DropdownMenuPrimitive.Portal({ store }, [
//       DropdownMenuPrimitive.Content({ store, theme: t }),
//     ]),
//   ]);
// }

export function DropdownMenu(p: any, c?: any) {
  return HDropdownMenu({ ...p, theme: t }, c);
}
