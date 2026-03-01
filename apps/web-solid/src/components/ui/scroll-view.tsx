/**
 * @file 可滚动容器，支持下拉刷新、滚动监听等
 */
import { JSX, createSignal } from "solid-js";
import { ArrowDown, LoaderCircle } from "lucide-solid";

import * as ScrollViewPrimitive from "~/packages/ui/scroll-view";
import {  ScrollViewCore  } from "@timeless/kit"; width={18} height={18} />
            </div>
          </ScrollViewPrimitive.Loading>
        </div>
      </ScrollViewPrimitive.Indicator>
      {props.extra}
      {props.children}
    </ScrollViewPrimitive.Root>
  );
};
