import { createSignal } from "solid-js";
import { CalendarIcon } from "lucide-solid";

import * as PopoverPrimitive from "~/packages/ui/popover";
import {  DatePickerCore  } from "@timeless/inner-kit"; store={store.$calendar} />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
