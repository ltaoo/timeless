/**
 * @file 视频文件播放
 */
import { createSignal, onMount, Show } from "solid-js";

import { FileService } from "~/biz/file_service";

import { ViewComponentProps } from "~/store/types";
import { LazyImage, Video } from "~/components/ui";
import { useViewModel } from "~/hooks";

import {  base, Handler  } from "@timeless/domains";, _url);
      ui.$player.setURL(_url);
    },
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}

export function PDFFilePreviewView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(PDFFilePreviewModel, [props]);

  return (
    <div>
      <Show when={state().error}>
        <div>{state().error?.message}</div>
      </Show>
      <LazyImage store={vm.ui.$player} />
    </div>
  );
}
