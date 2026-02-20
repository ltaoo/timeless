import { ref, computed, classnames, isRef, isComponent } from "../ui/core.js";
import { View } from "../ui/view.js";
import { Match } from "../ui/match.js";
import { DangerouslyInnerHTML } from "../ui/html.js";
import { Show } from "../ui/show.js";
import { For } from "../ui/for.js";
import { Txt } from "../ui/text.js";
import { Flex } from "../ui/flex.js";
import { Head2 } from "../ui/head.js";
import { Paragraph } from "../ui/paragraph.js";
import { Presence } from "../ui/presence.js";
import { Portal } from "../ui/portal.js";
import { Popper } from "../ui/popper.js";
import { ScrollView } from "../ui/scrollview.js";
import { ScrollArea } from "../ui/scroll-area.js";
import { AspectRatio } from "../ui/aspect-ratio.js";
import { Steps } from "../ui/steps.js";

// WeUI-styled components
import { Button } from "./button.js";
import { Input } from "./input.js";
import { Textarea } from "./textarea.js";
import { Label } from "./label.js";
import { Checkbox } from "./checkbox.js";
import { Select } from "./select.js";
import { Toggle } from "./toggle.js";
import { Slider } from "./slider.js";
import { Progress } from "./progress.js";
import { Dialog } from "./dialog.js";
import { Toast } from "./toast.js";
import { Tabs } from "./tabs.js";
import { Badge } from "./badge.js";
import { Separator } from "./separator.js";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card.js";
import { Avatar } from "./avatar.js";
import { Skeleton } from "./skeleton.js";
import { Tooltip } from "./tooltip.js";
import { Alert, AlertTitle, AlertDescription } from "./alert.js";
import { Sheet } from "./sheet.js";
import { Accordion } from "./accordion.js";
import { Popover } from "./popover.js";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table.js";
import { Menu, MenuItem, MenuLabel, MenuSeparator, DropdownMenu } from "./menu.js";

// Global assignments
window.ref = ref;
window.computed = computed;
window.classnames = classnames;
window.isRef = isRef;

window.Show = Show;
window.For = For;
window.Match = Match;
window.View = View;
window.Txt = Txt;
window.Flex = Flex;
window.Head2 = Head2;
window.Paragraph = Paragraph;
window.Badge = Badge;
window.Separator = Separator;
window.Card = Card;
window.CardHeader = CardHeader;
window.CardTitle = CardTitle;
window.CardDescription = CardDescription;
window.CardContent = CardContent;
window.CardFooter = CardFooter;
window.Avatar = Avatar;
window.Skeleton = Skeleton;
window.Tooltip = Tooltip;
window.Alert = Alert;
window.AlertTitle = AlertTitle;
window.AlertDescription = AlertDescription;
window.ScrollArea = ScrollArea;
window.Sheet = Sheet;
window.AspectRatio = AspectRatio;
window.Accordion = Accordion;
window.Table = Table;
window.TableHeader = TableHeader;
window.TableBody = TableBody;
window.TableRow = TableRow;
window.TableHead = TableHead;
window.TableCell = TableCell;
window.DangerouslyInnerHTML = DangerouslyInnerHTML;
window.ScrollView = ScrollView;
window.Button = Button;
window.Input = Input;
window.Textarea = Textarea;
window.Label = Label;
window.Checkbox = Checkbox;
window.Select = Select;
window.Presence = Presence;
window.Portal = Portal;
window.Popper = Popper;
window.Popover = Popover;
window.Toast = Toast;
window.Toggle = Toggle;
window.Switch = Toggle;
window.Slider = Slider;
window.Progress = Progress;
window.Dialog = Dialog;
window.Menu = Menu;
window.MenuItem = MenuItem;
window.MenuLabel = MenuLabel;
window.MenuSeparator = MenuSeparator;
window.DropdownMenu = DropdownMenu;
window.Tabs = Tabs;
window.Steps = Steps;

export {
  ref, computed, classnames, isRef, isComponent,
  Show, For, Match, View, Txt,
  DangerouslyInnerHTML, Flex, Head2, Paragraph,
  Badge, Separator,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Avatar, Skeleton, Tooltip,
  Alert, AlertTitle, AlertDescription,
  ScrollArea, Sheet, AspectRatio, Accordion,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Button, Dialog,
  Menu, MenuItem, MenuLabel, MenuSeparator, DropdownMenu,
  Input, Textarea, Label, Checkbox, Select,
  Toggle, Toggle as Switch, Slider,
  ScrollView, Tabs, Steps,
  Presence, Portal, Popper, Popover, Toast, Progress,
};
