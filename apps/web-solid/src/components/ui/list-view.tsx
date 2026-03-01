/**
 * @file 提供 加载中、没有数据、加载更多等内容的组件
 */
import { Show, createSignal } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { AlertCircle, ArrowDown, Bird, Loader } from "lucide-solid";

import {  ListCore  } from "@timeless/kit";>{state().error?.message}</div>
                  </div>
                </div>
              </div>
            </Show>
          }
        >
          <Show when={props.skeleton}>{props.skeleton}</Show>
        </Show>
      </div>
    </div>
  );
}
