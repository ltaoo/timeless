/* @refresh reload */

import { createSignal, For, onMount, Show } from "solid-js";
import { render } from "solid-js/web";
import { Edit, LoaderCircle, Plus, Trash } from "lucide-solid";

import { Button, Input, Popover } from "~/components/ui";
import { TreeSelect } from "~/components/tree-select/tree-select";
import { TreeEdit } from "~/components/tree-select/tree-edit";

import {  base, Handler  } from "@timeless/kit"; store={vm.ui.$edit.ui.$btn_ok}>
              确定
            </Button>
          </div>
        </div>
      </Popover>
    </div>
  );
}
