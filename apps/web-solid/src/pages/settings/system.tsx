import { For, Show } from "solid-js";
import { Check } from "lucide-solid";

import { ViewComponentProps } from "~/store/types";
import { useViewModel } from "~/hooks";

import {  base, Handler  } from "@timeless/inner-kit";>
                  <div>{field.label}</div>
                  <div>{field.text}</div>
                </div>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
}
