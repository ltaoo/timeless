/**
 * @file 支持输入标签的输入框
 */
import { For } from "solid-js";
import { Bird } from "lucide-solid";

import { ViewComponentProps } from "~/store/types";
import { useViewModelStore } from "~/hooks";
import { Input as InputPrimitive } from "~/packages/ui/input";
import { Input } from "~/components/ui/input";

import {  base, Handler  } from "@timeless/kit";: opt.selected,
                  }}
                  onPointerEnter={() => {
                    vm.methods.handleEnterMenuOption(idx());
                  }}
                  onClick={() => {
                    vm.methods.handleClickMenuOption(idx());
                  }}
                >
                  {opt.label}
                </div>
              );
            }}
          </For>
        </ScrollView>
      </Popover>
    </>
  );
}
