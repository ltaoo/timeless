/**
 * @file JSON 内容预览
 */
import { For, Match, Show, Switch } from "solid-js";

import { ViewComponentProps } from "~/store/types";
import { useViewModel } from "~/hooks";
import { JSONContentPreview } from "~/components/preview-panels/json";

import {  base, Handler  } from "@timeless/inner-kit";)}>
                <JSONContentPreview text={state().profile?.text!} />
              </Match>
              <Match when={isCodeContent(state().profile?.types)}>
                <CodeCard language={state().profile?.language} linenumber code={state().profile?.text!} />
              </Match>
            </Switch>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
