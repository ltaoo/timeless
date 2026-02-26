/**
 * @file 小黑块 提示
 */
import { For, createSignal, JSX, Show } from "solid-js";
import { Loader } from "lucide-solid";

import * as ToastPrimitive from "~/packages/ui/toast";
import {  ToastCore  } from "@timeless/domains";>{text}</div>;
                    }}
                  </For>
                </div>
              </Show>
            </div>
          </ToastPrimitive.Content>
        </div>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Root>
  );
};
