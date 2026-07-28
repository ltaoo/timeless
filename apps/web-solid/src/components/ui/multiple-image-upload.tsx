import { For, Show, JSX } from "solid-js";
import { Plus, XCircle } from "lucide-solid";

import { useViewModelStore } from "~/hooks";
import { Flex } from "~/components/flex/flex";

import { MultipleImageUploadModel } from "~/biz/multiple_image_upload";
import {  ImageUploadCore  } from "@timeless/inner-kit";>
      <For each={state().fields}>
        {(v) => {
          const field = vm.getFieldWithId(v.id);
          if (field === null) {
            return null;
          }
          return (
            <AspectRatio ratio={1 / 1}>
              <ImageUploadView store={field.field.input} />
            </AspectRatio>
          );
        }}
      </For>
    </div>
  );
}
