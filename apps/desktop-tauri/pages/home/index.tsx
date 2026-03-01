/**
 * @file 首页
 */
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { listen } from "@tauri-apps/api/event";
import dayjs from "dayjs";

import { ViewComponent, ViewComponentProps } from "~/store/types";
import { Button } from "~/components/ui/button";
import { DropArea } from "~/components/ui/drag-zone";

import {  base, Handler  } from "@timeless/kit";>
                  <For each={msg.paths}>
                    {(path) => {
                      return <div>{path}</div>;
                    }}
                  </For>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};
