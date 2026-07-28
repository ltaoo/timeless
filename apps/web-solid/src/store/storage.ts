import dayjs from "dayjs";

import { SetValueUnit } from "~/biz/input_set_value";
import {  StorageCore  } from "@timeless/inner-kit";
    const existing = globalThis.localStorage.getItem(key);
    return {
      key,
      defaultValues: QINIU_DEFAULT_CACHE_VALUES,
      values: existing ? JSON.parse(existing) : QINIU_DEFAULT_CACHE_VALUES,
      client: globalThis.localStorage,
    };
  })()
);
