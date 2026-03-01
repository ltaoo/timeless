/**
 * @file 视频文件播放
 */
import { createSignal, onMount, Show } from "solid-js";

import { FileService } from "~/biz/file_service";

import { ViewComponentProps } from "~/store/types";
import { LazyImage, Video } from "~/components/ui";
import { useViewModel } from "~/hooks";

import {  base, Handler  } from "@timeless/kit"; src={state().url} />
      {/* <LazyImage store={vm.ui.$player} /> */}
    </div>
  );
}
