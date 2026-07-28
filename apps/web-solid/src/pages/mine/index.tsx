import { For, Show } from "solid-js";
import { Award, Bird, ChevronDown, ChevronLeft, ChevronRight, Gem, Moon, MoreHorizontal, Pen, Sun } from "lucide-solid";
import dayjs from "dayjs";

import { ViewComponentProps } from "~/store/types";
import { useViewModel } from "~/hooks";
import { Button, DropdownMenu, Input, ScrollView } from "~/components/ui";
import { Sheet } from "~/components/ui/sheet";
import { Flex } from "~/components/flex/flex";
import { Empty } from "~/components/empty";

import {  base, Handler  } from "@timeless/inner-kit";></ScrollView>
      <DropdownMenu store={vm.ui.$menu} />
    </>
  );
}
