import * as Headless from "@timeless/headless";
import {
  ref, computed, classnames, isRef, isComponent,
  View, Match, DangerouslyInnerHTML,
  Presence, Portal, Popper,
  Show, For, Flex, Txt,
  Head2, Paragraph
} from "@timeless/headless";

import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Select } from "./ui/select";
import { Popover } from "./ui/popover";
import { Toast } from "./ui/toast";
import { Toggle } from "./ui/toggle";
import { Slider } from "./ui/slider";
import { Progress } from "./ui/progress";
import { Dialog } from "./ui/dialog";
import {
  Menu,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  DropdownMenu,
} from "./ui/menu";
import { Tabs } from "./ui/tabs";
import { Steps } from "./ui/steps";
import { Button } from "./ui/button";
import { ScrollView } from "./ui/scrollview";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { Tooltip } from "./ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import { Sheet } from "./ui/sheet";
import { AspectRatio } from "./ui/aspect-ratio";
import { Accordion } from "./ui/accordion";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";
import { ChevronRightOutlined } from "@timeless/icons";

// Global assignments for backward compatibility
const win = window as any;

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
