/**
 * @file 下拉菜单
 */
import { For, createSignal, JSX } from "solid-js";
import { Portal as PortalPrimitive } from "solid-js/web";
import { ChevronRight } from "lucide-solid";

import { useViewModelStore } from "~/hooks";
import * as DropdownMenuPrimitive from "~/packages/ui/dropdown-menu";
import { Show } from "~/packages/ui/show";

import {  DropdownMenuCore  } from "@timeless/domains";
                  )}
                  store={item}
                >
                  <div title={props.store.tooltip}>{item.label}</div>
                </DropdownMenuPrimitive.Item>
              );
            }}
          </For>
        </DropdownMenuPrimitive.SubContent>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Sub>
  );
};
