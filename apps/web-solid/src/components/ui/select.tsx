/**
 * @file 单选
 */
import { For, Show, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { JSX } from "solid-js/jsx-runtime";
import { Check, ChevronDown } from "lucide-solid";

import { useViewModelStore } from "~/hooks";
import * as SelectPrimitive from "~/packages/ui/select";
import * as PopperPrimitive from "~/packages/ui/popper";
import {  SelectCore  } from "@timeless/kit";: state().value === null,
//         }}
//         onChange={(event) => {
//           const selected = event.currentTarget.value;
//           store.select(selected);
//         }}
//       >
//         <For each={state().options}>
//           {(opt) => {
//             const { label } = opt;
//             return <option value={opt.value}>{label}</option>;
//           }}
//         </For>
//       </select>
//     </div>
//   );
// };
