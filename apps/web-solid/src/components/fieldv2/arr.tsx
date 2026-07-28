import { JSX } from "solid-js/jsx-runtime";
import { createSignal, For, Show } from "solid-js";
import { ChevronDown, ChevronUp, Plus, Trash } from "lucide-solid";

import { useViewModelStore } from "~/hooks";
import { Flex } from "~/components/flex/flex";
import { IconButton } from "~/components/icon-btn/icon-btn";

import {  ArrayFieldCore, SingleFieldCore  } from "@timeless/inner-kit";: true,
                  }}
                >
                  {props.render(store.field)}
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </Show>
  );
}
