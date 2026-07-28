import { registerIcons } from "@timeless/timeless";
import { iconRegistry } from "@timeless/inner-icons";

import { Button } from "./modules/button";
import { Input } from "./modules/input";
import { Textarea } from "./modules/textarea";
import { Checkbox } from "./modules/checkbox";
import { Switch } from "./modules/switch";
import { Toggle } from "./modules/toggle";
import { Select } from "./modules/select";
import { Tabs } from "./modules/tabs";
import { Dialog } from "./modules/dialog";
import { Sheet } from "./modules/sheet";
import { Toast } from "./modules/toast";
import { Badge } from "./modules/badge";
import { Separator } from "./modules/separator";
import { Skeleton } from "./modules/skeleton";
import { DropdownMenu } from "./modules/dropdown-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./modules/card";

try {
  if (typeof window !== "undefined") {
    import("./index.less");
  }
} catch {}
registerIcons(iconRegistry);

export const TimelessWeUIVersion = __Version;

export * from "@timeless/ui-primitive";
export * as ui from "@timeless/inner-vm";

export {
  Button,
  Input,
  Textarea,
  Checkbox,
  Switch,
  Toggle,
  Select,
  Tabs,
  Dialog,
  Sheet,
  Toast,
  Badge,
  Separator,
  Skeleton,
  DropdownMenu,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
