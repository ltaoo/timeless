declare var dayjs_locale_zh_cn: any;

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

declare const ref: typeof import("@timeless/reactive").ref;
declare const refarr: typeof import("@timeless/reactive").refarr;
declare const refobj: typeof import("@timeless/reactive").refobj;
declare const computed: typeof import("@timeless/reactive").computed;
declare const isRef: typeof import("@timeless/reactive").isRef;
declare const cn: typeof import("@timeless/reactive").cn;

declare const Show: typeof import("@timeless/headless").Show;
declare const For: typeof import("@timeless/headless").For;
declare const Match: typeof import("@timeless/headless").Match;
declare const Switch: typeof import("@timeless/headless").Toggle;
declare const View: typeof import("@timeless/headless").View;
declare const Txt: typeof import("@timeless/headless").Txt;
declare const DangerouslyInnerHTML: typeof import("@timeless/headless").DangerouslyInnerHTML;
declare const RouteSubViews: typeof import("@timeless/headless").RouteSubViews;
declare const KeepAliveSubViews: typeof import("@timeless/headless").KeepAliveSubViews;

declare const Slider: typeof import("@timeless/shadcnui").Slider;
declare const Slide: typeof import("@timeless/shadcnui").Slider;
declare const Progress: typeof import("@timeless/shadcnui").Progress;
declare const ScrollView: typeof import("@timeless/shadcnui").ScrollView;
declare const Flex: typeof import("@timeless/shadcnui").Flex;
declare const Head2: typeof import("@timeless/shadcnui").Head2;
declare const Paragraph: typeof import("@timeless/shadcnui").Paragraph;
declare const Button: typeof import("@timeless/shadcnui").Button;
declare const Input: typeof import("@timeless/shadcnui").Input;
declare const Checkbox: typeof import("@timeless/shadcnui").Checkbox;
declare const Select: typeof import("@timeless/shadcnui").Select;
declare const Presence: typeof import("@timeless/shadcnui").Presence;
declare const Portal: typeof import("@timeless/shadcnui").Portal;
declare const Popper: typeof import("@timeless/shadcnui").Popper;
declare const Toggle: typeof import("@timeless/shadcnui").Toggle;

declare const Menu: typeof import("@timeless/shadcnui").Menu;
declare const MenuItem: typeof import("@timeless/shadcnui").MenuItem;
declare const MenuLabel: typeof import("@timeless/shadcnui").MenuLabel;
declare const MenuSeparator: typeof import("@timeless/shadcnui").MenuSeparator;
declare const DropdownMenu: typeof import("@timeless/shadcnui").DropdownMenu;
declare const ContextMenu: typeof import("@timeless/shadcnui").ContextMenu;

declare const Tabs: typeof import("@timeless/shadcnui").Tabs;
declare const Steps: typeof import("@timeless/shadcnui").Steps;

declare const Popover: typeof import("@timeless/shadcnui").Popover;
declare const Toast: typeof import("@timeless/shadcnui").Toast;
declare const Dialog: typeof import("@timeless/shadcnui").Dialog;

declare const Badge: typeof import("@timeless/shadcnui").Badge;
declare const Separator: typeof import("@timeless/shadcnui").Separator;
declare const Card: typeof import("@timeless/shadcnui").Card;
declare const CardHeader: typeof import("@timeless/shadcnui").CardHeader;
declare const CardTitle: typeof import("@timeless/shadcnui").CardTitle;
declare const CardDescription: typeof import("@timeless/shadcnui").CardDescription;
declare const CardContent: typeof import("@timeless/shadcnui").CardContent;
declare const CardFooter: typeof import("@timeless/shadcnui").CardFooter;
declare const Avatar: typeof import("@timeless/shadcnui").Avatar;
declare const Skeleton: typeof import("@timeless/shadcnui").Skeleton;
declare const Tooltip: typeof import("@timeless/shadcnui").Tooltip;
declare const Alert: typeof import("@timeless/shadcnui").Alert;
declare const AlertTitle: typeof import("@timeless/shadcnui").AlertTitle;
declare const AlertDescription: typeof import("@timeless/shadcnui").AlertDescription;
declare const ScrollArea: typeof import("@timeless/shadcnui").ScrollArea;
declare const Sheet: typeof import("@timeless/shadcnui").Sheet;
declare const AspectRatio: typeof import("@timeless/shadcnui").AspectRatio;
declare const Accordion: typeof import("@timeless/shadcnui").Accordion;
declare const Table: typeof import("@timeless/shadcnui").Table;
declare const TableHeader: typeof import("@timeless/shadcnui").TableHeader;
declare const TableBody: typeof import("@timeless/shadcnui").TableBody;
declare const TableRow: typeof import("@timeless/shadcnui").TableRow;
declare const TableHead: typeof import("@timeless/shadcnui").TableHead;
declare const TableCell: typeof import("@timeless/shadcnui").TableCell;

declare const Textarea: typeof import("@timeless/shadcnui").Textarea;
declare const Label: typeof import("@timeless/shadcnui").Label;

declare const BoltOutlined: typeof import("@timeless/icons").BoltOutlined;



declare var TimelessWeb: {
  provide_app: (vm: any) => void;
  provide_http_client: (vm: any) => void;
  provide_history: (vm: any) => void;
  provide_slate: (vm: any, elm: Element) => void;
  provide_ui_image: (elm: HTMLDivElement, vm: any) => void;
  provide_ui_node: (elm: HTMLImageElement, vm: any) => void;
  provide_ui_scroll_view_scroll: (vm: any, elm: HTMLDivElement) => void;
  provide_ui_scroll_view_indicator: (vm: any, elm: HTMLDivElement) => void;
  provide_ui_video_player: (elm: HTMLVideoElement, vm: any) => void;
};
