import { X } from "lucide-solid";
import { JSX } from "solid-js/jsx-runtime";

import { ViewComponentProps } from "~/store/types";
import { useViewModelStore } from "~/hooks";
import * as DialogPrimitive from "~/packages/ui/dialog";
import { Show } from "~/packages/ui/show";

import {  DialogCore  } from "@timeless/domains";: state().exit,
            }}
          >
            {props.children}
          </div>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  );
}
