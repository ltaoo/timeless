import { createSignal, For, JSX, Show } from "solid-js";
import { Funnel, Tags, X } from "lucide-solid";

import { ViewComponentProps } from "~/store/types";
import { useViewModelStore } from "~/hooks";
import { TopSheet } from "~/components/top-sheet";
import * as PortalPrimitive from "~/packages/ui/portal";

import {  base, Handler  } from "@timeless/domains";: !opt.selected,
                    }}
                    onClick={() => {
                      vm.methods.select(opt.value);
                    }}
                  >
                    <div>{opt.text}</div>
                  </div>
                );
              }}
            </For>
          </div>
        </TopSheet>
      </PortalPrimitive.Portal>
    </>
  );
}
