import { Gallery } from "./modules/gallery";
import { Button } from "./modules/button";
import { Input } from "./modules/input";
import { Textarea } from "./modules/textarea";
import { Label } from "./modules/label";
import { Checkbox } from "./modules/checkbox";
import { CheckboxGroup, CheckboxGroupItem } from "./modules/checkbox-group";
import { Radio, RadioGroup, RadioGroupItem } from "./modules/radio";
import { Switch } from "./modules/switch";
import { Toggle } from "./modules/toggle";
import { Slider } from "./modules/slider";
import { Select } from "./modules/select";
import { NumberInput } from "./modules/number-input";
import { Progress } from "./modules/progress";
import { Avatar } from "./modules/avatar";
import { Badge } from "./modules/badge";
import { Separator } from "./modules/separator";
import { Skeleton } from "./modules/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./modules/card";
import { Alert, AlertTitle, AlertDescription } from "./modules/alert";
import { Kbd, KbdGroup } from "./modules/kbd";
import { Link } from "./modules/link";
import { AspectRatio } from "./modules/aspect-ratio";
import { ScrollArea } from "./modules/scroll-area";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldInlineLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "./modules/field";

// --- Tier 2 ---
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "./modules/dialog";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetClose,
} from "./modules/sheet";
import { Popover } from "./modules/popover";
import { Popconfirm } from "./modules/popconfirm";
import { Tooltip, TooltipProvider } from "./modules/tooltip";
import { DropdownMenu } from "./modules/dropdown-menu";
import { ContextMenu } from "./modules/context-menu";
import { Menu } from "./modules/menu";
import { Tabs } from "./modules/tabs";
import { Accordion } from "./modules/accordion";
import { Steps } from "./modules/steps";
import { Toast } from "./modules/toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./modules/table";
import { Form } from "./modules/form";
import { SearchSelect } from "./modules/search-select";
import { FileDropZone, FileInput } from "./modules/file-picker";
import {
  ResizablePanels,
  ResizablePanel,
  ResizableHandle,
} from "./modules/resizable-panels";

// --- Tier 3 ---
import { DatePicker, DateCalendarPanel } from "./modules/date-picker";
import { DateRangePicker } from "./modules/date-range-picker";
import { TimePicker, TimeColumns, TimePreview } from "./modules/time-picker";
import { DateTimePicker } from "./modules/date-time-picker";
import { Cascader } from "./modules/cascader";
import { ScrollView } from "./modules/scroll-view";
import { Affix } from "./modules/affix";
import { Waterfall } from "./modules/waterfall";
import {
  Tree,
  TreeRow,
  TreeCheckbox,
  TreeIndicator,
  TreeEmpty,
  TREE_CLASSES,
} from "./modules/tree";
import {
  FlowCanvasView,
  FlowNodeView,
  FlowHandle,
  FlowEdgeView,
  FlowBackground,
  FlowMinimap,
  FlowControls,
} from "./modules/flow";

try {
  if (typeof window !== "undefined") {
    import("./style/fluent.css");
  }
} catch {}

export const TimelessFluentVersion = __Version;

export {
  Gallery,
  Button,
  Input,
  Textarea,
  Label,
  Checkbox,
  CheckboxGroup,
  CheckboxGroupItem,
  Radio,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Toggle,
  Slider,
  Select,
  NumberInput,
  Progress,
  Avatar,
  Badge,
  Separator,
  Skeleton,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Alert,
  AlertTitle,
  AlertDescription,
  Kbd,
  KbdGroup,
  Link,
  AspectRatio,
  ScrollArea,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldInlineLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  // --- Tier 2 ---
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetClose,
  Popover,
  Popconfirm,
  Tooltip,
  TooltipProvider,
  DropdownMenu,
  ContextMenu,
  Menu,
  Tabs,
  Accordion,
  Steps,
  Toast,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Form,
  SearchSelect,
  FileDropZone,
  FileInput,
  ResizablePanels,
  ResizablePanel,
  ResizableHandle,
  // --- Tier 3 ---
  DatePicker,
  DateCalendarPanel,
  DateRangePicker,
  TimePicker,
  TimeColumns,
  TimePreview,
  DateTimePicker,
  Cascader,
  ScrollView,
  Affix,
  Waterfall,
  Tree,
  TreeRow,
  TreeCheckbox,
  TreeIndicator,
  TreeEmpty,
  TREE_CLASSES,
  FlowCanvasView,
  FlowNodeView,
  FlowHandle,
  FlowEdgeView,
  FlowBackground,
  FlowMinimap,
  FlowControls,
};
