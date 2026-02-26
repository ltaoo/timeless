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
// Global Core Functions
declare const ref: typeof import("@timeless/base-ui").ref;
declare const computed: typeof import("@timeless/base-ui").computed;
declare const isRef: typeof import("@timeless/base-ui").isRef;
declare const classnames: typeof import("@timeless/base-ui").classnames;

declare const Show: typeof import("@timeless/base-ui").Show;
declare const For: typeof import("@timeless/base-ui").For;
declare const Match: typeof import("@timeless/base-ui").Match;
declare const Switch: typeof import("@timeless/base-ui").Toggle;
declare const Slider: typeof import("@timeless/base-ui").Slider;
declare const Slide: typeof import("@timeless/base-ui").Slider;
declare const Progress: typeof import("@timeless/base-ui").Progress;
// Global Components
declare const View: typeof import("@timeless/base-ui").View;
declare const DangerouslyInnerHTML: typeof import("@timeless/base-ui").DangerouslyInnerHTML;
declare const Txt: typeof import("@timeless/base-ui").Txt;
declare const ScrollView: typeof import("@timeless/base-ui").ScrollView;
declare const Flex: typeof import("@timeless/base-ui").Flex;
declare const Head2: typeof import("@timeless/base-ui").Head2;
declare const Paragraph: typeof import("@timeless/base-ui").Paragraph;
declare const Button: typeof import("@timeless/base-ui").Button;
declare const Input: typeof import("@timeless/base-ui").Input;
declare const Checkbox: typeof import("@timeless/base-ui").Checkbox;
declare const Select: typeof import("@timeless/base-ui").Select;
declare const Presence: typeof import("@timeless/base-ui").Presence;
declare const Portal: typeof import("@timeless/base-ui").Portal;
declare const Popper: typeof import("@timeless/base-ui").Popper;
declare const Toggle: typeof import("@timeless/base-ui").Toggle;

declare const Menu: typeof import("@timeless/base-ui").Menu;
declare const MenuItem: typeof import("@timeless/base-ui").MenuItem;
declare const MenuLabel: typeof import("@timeless/base-ui").MenuLabel;
declare const MenuSeparator: typeof import("@timeless/base-ui").MenuSeparator;
declare const DropdownMenu: typeof import("@timeless/base-ui").DropdownMenu;

declare const Tabs: typeof import("@timeless/base-ui").Tabs;
declare const Steps: typeof import("@timeless/base-ui").Steps;

declare const Popover: typeof import("@timeless/base-ui").Popover;
declare const Toast: typeof import("@timeless/base-ui").Toast;
declare const Dialog: typeof import("@timeless/base-ui").Dialog;

declare const Badge: typeof import("@timeless/base-ui").Badge;
declare const Separator: typeof import("@timeless/base-ui").Separator;
declare const Card: typeof import("@timeless/base-ui").Card;
declare const CardHeader: typeof import("@timeless/base-ui").CardHeader;
declare const CardTitle: typeof import("@timeless/base-ui").CardTitle;
declare const CardDescription: typeof import("@timeless/base-ui").CardDescription;
declare const CardContent: typeof import("@timeless/base-ui").CardContent;
declare const CardFooter: typeof import("@timeless/base-ui").CardFooter;
declare const Avatar: typeof import("@timeless/base-ui").Avatar;
declare const Skeleton: typeof import("@timeless/base-ui").Skeleton;
declare const Tooltip: typeof import("@timeless/base-ui").Tooltip;
declare const Alert: typeof import("@timeless/base-ui").Alert;
declare const AlertTitle: typeof import("@timeless/base-ui").AlertTitle;
declare const AlertDescription: typeof import("@timeless/base-ui").AlertDescription;
declare const ScrollArea: typeof import("@timeless/base-ui").ScrollArea;
declare const Sheet: typeof import("@timeless/base-ui").Sheet;
declare const AspectRatio: typeof import("@timeless/base-ui").AspectRatio;
declare const Accordion: typeof import("@timeless/base-ui").Accordion;
declare const Table: typeof import("@timeless/base-ui").Table;
declare const TableHeader: typeof import("@timeless/base-ui").TableHeader;
declare const TableBody: typeof import("@timeless/base-ui").TableBody;
declare const TableRow: typeof import("@timeless/base-ui").TableRow;
declare const TableHead: typeof import("@timeless/base-ui").TableHead;
declare const TableCell: typeof import("@timeless/base-ui").TableCell;

declare const Textarea: typeof import("@timeless/base-ui").Textarea;
declare const Label: typeof import("@timeless/base-ui").Label;

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
