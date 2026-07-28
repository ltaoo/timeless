/**
 * @file 后台/首页布局
 */
import { For, JSX, createSignal, onMount } from "solid-js";

import { ViewComponent } from "~/store/types";
import { PageKeys } from "~/store/routes";
import { KeepAliveRouteView } from "~/components/ui/keep-alive-route-view";

import { __VERSION__ } from "@/constants/index";
import {  cn  } from "@timeless/inner-utils";
                    )}
                    store={subView}
                    index={i()}
                  >
                    <PageContent
                      app={app}
                      client={client}
                      storage={storage}
                      pages={pages}
                      history={history}
                      view={subView}
                    />
                  </KeepAliveRouteView>
                );
              }}
            </For>
          </div>
        </div>
      </div>
    </>
  );
};
