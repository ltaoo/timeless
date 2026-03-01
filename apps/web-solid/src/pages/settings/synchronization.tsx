import { For, Show } from "solid-js";
import { Check, File } from "lucide-solid";

import { ViewComponentProps } from "~/store/types";
import { useViewModel } from "~/hooks";
import { Button, Input } from "~/components/ui";
import { FieldObjV2 } from "~/components/fieldv2/obj";
import { FieldV2 } from "~/components/fieldv2/field";

import {  base, Handler  } from "@timeless/kit"; />
              </Show>
              <div>测试</div>
            </div>
          </Button>
          <Button store={vm.ui.$btn_export}>同步至 webdav</Button>
          <Button store={vm.ui.$btn_import}>从 webdav 同步</Button>
        </div>
      </div>
    </div>
  );
}
