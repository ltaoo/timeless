/**
 * @file 首页
 */
import { For, Match, Show, Switch } from "solid-js";
import { Bird, Check, ChevronUp, Copy, Download, Earth, Eye, File, Folder, Link, Trash } from "lucide-solid";
import { Browser, Events } from "@wailsio/runtime";

import { ViewComponentProps } from "~/store/types";
import { useViewModel } from "~/hooks";
import { Button, ListView, ScrollView, Skeleton } from "~/components/ui";
import { RelativeTime } from "~/components/relative_time";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { WaterfallView } from "~/components/ui/waterfall/waterfall";
import { Flex } from "~/components/flex/flex";
import { SelectWithKeyboardModel, WithTagsInput, WithTagsInputModel } from "~/components/with-tags-input";
import { DynamicContent } from "~/components/dynamic-content";
import { DynamicContentWithClick } from "~/components/dynamic-content/with-click";
import { CodeCard } from "~/components/code-card";

import {  RequestCore, TheResponseOfRequestCore  } from "@timeless/domains"; />
          </div>
        </div>
      </Show>
    </div>
  );
};
