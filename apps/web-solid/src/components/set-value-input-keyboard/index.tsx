/**
 * @file 重量输入组件
 */
import { createSignal, For } from "solid-js";

import { useViewModel, useViewModelStore } from "~/hooks";
import { Input } from "~/components/ui/input";
import * as PopoverPrimitive from "~/packages/ui/popover";
import { SetValueInputModel } from "~/biz/input_set_value";
import {  base, Handler  } from "@timeless/kit";
            onClick={() => {
              vm.methods.handleSubmit();
            }}
          >
            收起
          </button>
        </div>
      </div>
    </>
  );
}
