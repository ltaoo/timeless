/**
 * @file 用户配置
 */
import { For, Show } from "solid-js";
import { Check, File } from "lucide-solid";

import { ViewComponentProps } from "~/store/types";
import { useViewModel } from "~/hooks";
import { Button, Input, Textarea } from "~/components/ui";
import { FieldObjV2 } from "~/components/fieldv2/obj";
import { FieldV2 } from "~/components/fieldv2/field";

import {  base, Handler  } from "@timeless/domains";>
          <Button store={vm.ui.$btn_submit}>提交</Button>
        </div>
      </div>
    </div>
  );
}
