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

declare interface Window {
  dayjs: typeof dayjs;
}

// type StateGetter = () => any;
// type StateSetter = (v: any) => void;

type Ref<T = any> = {
  value: T;
  __isRef: true;
  _subscribe: (ctx: {
    onChange?: (v: any) => void;
    onPatch?: (c: any) => void;
    ignore?: boolean;
  }) => void;
};

// interface ViewClassname {
//   del(v: string): void;
//   add(v: string): void;
//   append(c: string): void;
//   toString(): string;
// }
// interface ViewOptions {
//   class?: string;
//   type?: string;
//   style?: Object;
// }

// interface ViewReturn {
//   t: string;
//   $elm: HTMLElement;
//   append(node: ViewReturn): void;
//   setContent(html: string): void;
//   render(): HTMLElement;
// }
// interface TextReturn {
//   t: string;
//   render(): HTMLElement;
// }
// type ViewChild = ViewReturn | TextReturn;
// type ViewChildren = (ViewChild | ViewChildren)[];
// interface ViewFunction {
//   (
//     props?: { type?: string } & HTMLAttributes,
//     children?: ViewChildren,
//   ): ViewReturn;
// }
// type ReactiveInput = ReactiveState | Ref<any>;
// interface TextFunction {
//   (content: string | Ref<any>): TextReturn;
// }
// interface ForFunction {
//   (
//     props: HTMLAttributes & {
//       each: StateGetter | Ref<any>;
//       render(item: any, index: number): ViewChild;
//     },
//   ): ViewChildren;
// }
// interface ShowFunction {
//   (props: {
//     when: StateGetter;
//     children: ViewChildren;
//     fallback?: ViewChildren;
//   }): ViewChild;
// }

// declare var ViewClassname: (
//   fixedName: string,
//   conditions?: Record<string, StateGetter>,
// ) => ViewClassname;
// declare var ViewClassname: (
//   dynamicName: ReactiveInput,
//   conditions?: Record<string, StateGetter>,
// ) => ViewClassname;
// declare var View: ViewFunction;
// declare var Flex: ViewFunction;
// declare var Head2: ViewFunction;
// declare var Paragraph: ViewFunction;
// declare var Txt: TextFunction;
// declare var For: ForFunction;
// declare var Show: ShowFunction;
// declare var Button: ViewFunction;
// declare var DangerouslyInnerHTML: (html: string) => TextReturn;

// type ReactiveState = string | number | Function | ReactiveState[];
// declare var reactive: (v: ReactiveState) => Ref<T>;
// declare var computed: (v: ReactiveState) => Ref<T>;
// declare var ref: <T = any>(v: T) => Ref<T>;
// declare var classnames: (v: Ref<any>) => ViewClassname;

declare var TimelessWeb: {
  provide_slate: (vm: any, elm: HTMLDivElement) => void;
  provide_http_client: (vm: any) => void;
};

interface Dayjs {
  format(template?: string): string;
  toString(): string;
  toDate(): Date;
  unix(): number;
  valueOf(): number;
  clone(): Dayjs;
  isValid(): boolean;
  isLeapYear(): boolean;
  isSame(other: Dayjs | string | number, unit?: string): boolean;
  isAfter(other: Dayjs | string | number, unit?: string): boolean;
  isBefore(other: Dayjs | string | number, unit?: string): boolean;
  diff(
    other: Dayjs | string | number,
    unit?: string,
    floating?: boolean,
  ): number;
  startOf(unit: string): Dayjs;
  endOf(unit: string): Dayjs;
  add(value: number, unit: string): Dayjs;
  subtract(value: number, unit: string): Dayjs;
  get(unit: string): number;
  set(unit: string, value: number): Dayjs;
  date(): number;
  month(): number;
  year(): number;
  day(): number;
  hour(): number;
  minute(): number;
  second(): number;
  millisecond(): number;
  weekday(): number;
  isoWeekday(): number;
  weekYear(): number;
  week(): number;
  quarter(): number;
  daysInMonth(): number;
  daysInYear(): number;
  from(other: Dayjs | string | number): string;
  fromNow(): string;
  to(other: Dayjs | string | number): string;
  toNow(): string;
}

type DayjsPlugin = (
  option: any,
  d: typeof dayjs,
  dayjsFactory: DayjsFactory,
) => void;

interface DayjsFactory {
  (date?: string | number | Date | Dayjs): Dayjs;
  extend(plugin: DayjsPlugin, option?: any): DayjsFactory;
  locale(name: string, object?: any, isLocal?: boolean): string | void;
  unix(timestamp: number): Dayjs;
  UTC(...args: number[]): Dayjs;
  invalid(reason?: any): Dayjs;
  max(dayjs: Dayjs[]): Dayjs | null;
  min(dayjs: Dayjs[]): Dayjs | null;
}

declare var dayjs: DayjsFactory & Dayjs;
