/**
 * @file 对话框
 */
import { createSignal, JSX } from "solid-js";
import { X } from "lucide-solid";

import { ViewComponentProps } from "~/store/types";
import { useViewModelStore } from "~/hooks";
import * as DialogPrimitive from "~/packages/ui/dialog";
import { Show } from "~/packages/ui/show";

import {  DialogCore  } from "@timeless/inner-kit";>
                <DialogPrimitive.Cancel store={vm}>取消</DialogPrimitive.Cancel>
                <DialogPrimitive.Submit store={vm}>确认</DialogPrimitive.Submit>
              </div>
            </DialogPrimitive.Footer>
          </Show> */}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
