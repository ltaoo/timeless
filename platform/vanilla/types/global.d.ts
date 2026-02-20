declare namespace Dayjs {
  interface Dayjs {
    format(template?: string): string;
    add(value: number, unit: string): Dayjs;
    subtract(value: number, unit: string): Dayjs;
    isValid(): boolean;
    // 添加其他你需要的方法
  }

  function dayjs(date?: string | number | Date): Dayjs;
  function extend(plugin: any): void;
}

declare const dayjs: typeof Dayjs.dayjs;

declare function invoke(
  url: string,
  options: {
    method: string;
    headers?: Record<string, unknown[]>;
    args?: Record<string, unknown>;
  },
): Promise<any>;

declare interface Window {
  dayjs: typeof dayjs;
}
// Global Core Functions
declare const ref: typeof import("../src/components/ui/core").ref;
declare const computed: typeof import("../src/components/ui/core").computed;
declare const isRef: typeof import("../src/components/ui/core").isRef;
declare const classnames: typeof import("../src/components/ui/core").classnames;

declare const Show: typeof import("../src/components/ui/show").Show;
declare const For: typeof import("../src/components/ui/for").For;
declare const Match: typeof import("../src/components/ui/match").Match;
declare const Switch: typeof import("../src/components/ui/toggle").Toggle;
declare const Slider: typeof import("../src/components/ui/slider").Slider;
declare const Slide: typeof import("../src/components/ui/slider").Slider;
declare const Progress: typeof import("../src/components/ui/progress").Progress;
// Global Components
declare const View: typeof import("../src/components/ui/view").View;
declare const DangerouslyInnerHTML: typeof import("../src/components/ui/html").DangerouslyInnerHTML;
declare const Txt: typeof import("../src/components/ui/text").Txt;
declare const ScrollView: typeof import("../src/components/ui/scrollview").ScrollView;
declare const Flex: typeof import("../src/components/ui/flex").Flex;
declare const Button: typeof import("../src/components/ui/button").Button;
declare const Input: typeof import("../src/components/ui/input").Input;
declare const Checkbox: typeof import("../src/components/ui/checkbox").Checkbox;
declare const Select: typeof import("../src/components/ui/select").Select;
declare const Presence: typeof import("../src/components/ui/presence").Presence;
declare const Portal: typeof import("../src/components/ui/portal").Portal;
declare const Popper: typeof import("../src/components/ui/popper").Popper;
declare const Toggle: typeof import("../src/components/ui/toggle").Toggle;
declare const Switch: typeof import("../src/components/ui/toggle").Toggle;

declare const Menu: typeof import("../src/components/ui/menu").Menu;
declare const MenuItem: typeof import("../src/components/ui/menu").MenuItem;
declare const MenuLabel: typeof import("../src/components/ui/menu").MenuLabel;
declare const MenuSeparator: typeof import("../src/components/ui/menu").MenuSeparator;
declare const DropdownMenu: typeof import("../src/components/ui/menu").DropdownMenu;

declare const Tabs: typeof import("../src/components/ui/tabs").Tabs;
declare const Steps: typeof import("../src/components/ui/steps").Steps;

declare const Popover: typeof import("../src/components/ui/popover").Popover;
declare const Toast: typeof import("../src/components/ui/toast").Toast;
declare const Dialog: typeof import("../src/components/ui/dialog").Dialog;

declare const Badge: typeof import("../src/components/ui/badge").Badge;
declare const Separator: typeof import("../src/components/ui/separator").Separator;
declare const Card: typeof import("../src/components/ui/card").Card;
declare const CardHeader: typeof import("../src/components/ui/card").CardHeader;
declare const CardTitle: typeof import("../src/components/ui/card").CardTitle;
declare const CardDescription: typeof import("../src/components/ui/card").CardDescription;
declare const CardContent: typeof import("../src/components/ui/card").CardContent;
declare const CardFooter: typeof import("../src/components/ui/card").CardFooter;
declare const Avatar: typeof import("../src/components/ui/avatar").Avatar;
declare const Skeleton: typeof import("../src/components/ui/skeleton").Skeleton;
declare const Tooltip: typeof import("../src/components/ui/tooltip").Tooltip;
declare const Alert: typeof import("../src/components/ui/alert").Alert;
declare const AlertTitle: typeof import("../src/components/ui/alert").AlertTitle;
declare const AlertDescription: typeof import("../src/components/ui/alert").AlertDescription;
declare const ScrollArea: typeof import("../src/components/ui/scroll-area").ScrollArea;
declare const Sheet: typeof import("../src/components/ui/sheet").Sheet;
declare const AspectRatio: typeof import("../src/components/ui/aspect-ratio").AspectRatio;
declare const Accordion: typeof import("../src/components/ui/accordion").Accordion;
declare const Table: typeof import("../src/components/ui/table").Table;
declare const TableHeader: typeof import("../src/components/ui/table").TableHeader;
declare const TableBody: typeof import("../src/components/ui/table").TableBody;
declare const TableRow: typeof import("../src/components/ui/table").TableRow;
declare const TableHead: typeof import("../src/components/ui/table").TableHead;
declare const TableCell: typeof import("../src/components/ui/table").TableCell;

declare const Textarea: typeof import("../src/components/ui/textarea").Textarea;
declare const Label: typeof import("../src/components/ui/label").Label;

declare var TimelessWeb: {
  provide_http_client: (vm: any) => void;
  provide_ui_scroll_view_scroll: (vm: any, elm: HTMLDivElement) => void;
  provide_ui_scroll_view_indicator: (vm: any, elm: HTMLDivElement) => void;
};
