import * as Headless from "@timeless/headless";
import {
  ref, computed, classnames, isRef, isComponent,
  View, Match, DangerouslyInnerHTML,
  Presence, Portal, Popper,
  Show, For, Flex, Txt,
  Head2, Paragraph
} from "@timeless/headless";

import { Input } from "./ui/input.js";
import { Textarea } from "./ui/textarea.js";
import { Label } from "./ui/label.js";
import { Checkbox } from "./ui/checkbox.js";
import { Select } from "./ui/select.js";
import { Popover } from "./ui/popover.js";
import { Toast } from "./ui/toast.js";
import { Toggle } from "./ui/toggle.js";
import { Slider } from "./ui/slider.js";
import { Progress } from "./ui/progress.js";
import { Dialog } from "./ui/dialog.js";
import {
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  DropdownMenu,
} from "./ui/menu.js";
import { Tabs } from "./ui/tabs.js";
import { Steps } from "./ui/steps.js";
import { Button } from "./ui/button.js";
import { ScrollView } from "./ui/scrollview.js";
import { Badge } from "./ui/badge.js";
import { Separator } from "./ui/separator.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card.js";
import { Avatar } from "./ui/avatar.js";
import { Skeleton } from "./ui/skeleton.js";
import { Tooltip } from "./ui/tooltip.js";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert.js";
import { ScrollArea } from "./ui/scroll-area.js";
import { Sheet } from "./ui/sheet.js";
import { AspectRatio } from "./ui/aspect-ratio.js";
import { Accordion } from "./ui/accordion.js";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table.js";
import { ChevronRightOutlined } from "@timeless/icons";

// Global assignments for backward compatibility
const win = /** @type {any} */ (window);

win.ref = ref;
win.computed = computed;
win.classnames = classnames;
win.isRef = isRef;

win.Show = Show;
win.For = For;
win.Match = Match;
win.View = View;
win.Txt = Txt;
win.Flex = Flex;
win.Head2 = Head2;
win.Paragraph = Paragraph;
win.Badge = Badge;
win.Separator = Separator;
win.Card = Card;
win.CardHeader = CardHeader;
win.CardTitle = CardTitle;
win.CardDescription = CardDescription;
win.CardContent = CardContent;
win.CardFooter = CardFooter;
win.Avatar = Avatar;
win.Skeleton = Skeleton;
win.Tooltip = Tooltip;
win.Alert = Alert;
win.AlertTitle = AlertTitle;
win.AlertDescription = AlertDescription;
win.ScrollArea = ScrollArea;
win.Sheet = Sheet;

win.AspectRatio = AspectRatio;
win.Accordion = Accordion;
win.Table = Table;
win.TableHeader = TableHeader;
win.TableBody = TableBody;
win.TableRow = TableRow;
win.TableHead = TableHead;
win.TableCell = TableCell;
win.DangerouslyInnerHTML = DangerouslyInnerHTML;
win.ScrollView = ScrollView;
win.Button = Button;
win.Input = Input;
win.Textarea = Textarea;
win.Label = Label;
win.Checkbox = Checkbox;
win.Select = Select;
win.Presence = Presence;
win.Portal = Portal;
win.Popper = Popper;
win.Popover = Popover;
win.Toast = Toast;
win.Toggle = Toggle;
win.Switch = Toggle;
win.Slider = Slider;
win.Progress = Progress;
win.Dialog = Dialog;
win.Menu = Menu;
win.MenuItem = MenuItem;
win.MenuLabel = MenuLabel;
win.MenuSeparator = MenuSeparator;
win.DropdownMenu = DropdownMenu;
win.Tabs = Tabs;
win.Steps = Steps;
win.ScrollView = ScrollView;

export {
  ref, computed, classnames, isRef, isComponent,
  View, Match, DangerouslyInnerHTML,
  Input, Textarea, Label, Checkbox, Select,
  Presence, Portal, Popper, Popover, Toast,
  Toggle, Slider, Progress, Dialog,
  Menu, MenuItem, MenuLabel, MenuSeparator, DropdownMenu,
  Tabs, Steps, Show, For, Flex, Button, Txt,
  ScrollView, Head2, Paragraph, Badge, Separator,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Avatar, Skeleton, Tooltip,
  Alert, AlertTitle, AlertDescription,
  ScrollArea, Sheet, AspectRatio, Accordion,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  ChevronRightOutlined,
  Headless
};
