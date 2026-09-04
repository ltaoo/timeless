import {
  computed,
  derive,
  DerivedRef,
  isRef,
  Ref,
  ref,
} from "@timeless/inner-reactive";

import { For } from "@/reactive/for";
import { Match } from "@/reactive/match";
import { Show } from "@/reactive/show";
import { Button } from "@/interaction/button";
import { Checkbox } from "@/input/checkbox";
import { Input } from "@/input/input";

import { BoxProps } from "./box";
import {
  ListViewV2,
  ListViewV2ItemHeight,
  ListViewV2ItemResizeEvent,
  ListViewV2Reactive,
  ListViewV2ScrollEvent,
} from "./list-view-v2";
import {
  resolve_children,
  TimelessElement,
  ViewChildren,
  ViewChildrenArray,
} from "./type";
import { View } from "./view";

export type TableV2Reactive<T> = T | Ref<T> | DerivedRef<T>;
export type TableV2SortDirection = "asc" | "desc";
export type TableV2Status =
  | "initial"
  | "loading"
  | "normal"
  | "empty"
  | "error";

export type TableV2Sort = {
  key: string;
  direction: TableV2SortDirection;
} | null;

export type TableV2CellContext<T extends Record<string, unknown>> = {
  column: TableV2Column<T>;
  index: number;
  indexRef: Ref<number> | DerivedRef<number>;
  itemRef?: Ref<T>;
};

export type TableV2Column<T extends Record<string, unknown>> = {
  key: string;
  title?: ViewChildren;
  dataIndex?: keyof T;
  width?: number | string;
  align?: "left" | "center" | "right";
  searchable?: boolean;
  sortable?: boolean;
  sorter?: (left: T, right: T) => number;
  render?: (item: T, context: TableV2CellContext<T>) => ViewChildren;
  headerClass?: string;
  headerStyle?: BoxProps["style"];
  cellClass?: string | ((item: T) => string | undefined);
  cellStyle?: BoxProps["style"] | ((item: T) => BoxProps["style"]);
};

export type TableV2Pagination = {
  page?: number | Ref<number>;
  pageSize?: number | Ref<number>;
  total?: TableV2Reactive<number>;
  mode?: "local" | "remote";
  onChange?: (page: number, page_size: number) => void;
};

export type TableV2ModelOptions<T extends Record<string, unknown>> = {
  rows: T[] | Ref<T[]> | DerivedRef<T[]>;
  columns: TableV2Column<T>[];
  query?: string | Ref<string>;
  sort?: TableV2Sort | Ref<TableV2Sort>;
  pagination?: false | TableV2Pagination;
  filter?: (item: T, query: string) => boolean;
  onQueryChange?: (query: string) => void;
  onSortChange?: (sort: TableV2Sort) => void;
};

export type TableV2Model<T extends Record<string, unknown>> = ReturnType<
  typeof createTableV2Model<T>
>;

function table_v2_positive_integer(value: unknown, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function table_v2_column_value<T extends Record<string, unknown>>(
  item: T,
  column: TableV2Column<T>,
) {
  return item[column.dataIndex || (column.key as keyof T)];
}

function table_v2_compare(left: unknown, right: unknown): number {
  if (Object.is(left, right)) return 0;
  if (left === null || left === undefined) return -1;
  if (right === null || right === undefined) return 1;
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function table_v2_matches<T extends Record<string, unknown>>(
  item: T,
  query: string,
  columns: TableV2Column<T>[],
): boolean {
  const searchable_columns = columns.filter(
    (column) => column.searchable !== false,
  );
  const values = searchable_columns.length
    ? searchable_columns.map((column) => table_v2_column_value(item, column))
    : Object.values(item);
  return values.some((value) =>
    String(value ?? "")
      .toLocaleLowerCase()
      .includes(query),
  );
}

export function createTableV2Model<T extends Record<string, unknown>>(
  options: TableV2ModelOptions<T>,
) {
  const pagination = options.pagination || null;
  const owns_query = !isRef(options.query);
  const owns_sort = !isRef(options.sort);
  const owns_page = !pagination || !isRef(pagination.page);
  const owns_page_size = !pagination || !isRef(pagination.pageSize);
  const query_ = isRef(options.query)
    ? options.query
    : ref(String(options.query || ""));
  const sort_ = isRef(options.sort) ? options.sort : ref(options.sort || null);
  const page_ =
    pagination && isRef(pagination.page)
      ? pagination.page
      : ref(table_v2_positive_integer(pagination?.page, 1));
  const page_size_ =
    pagination && isRef(pagination.pageSize)
      ? pagination.pageSize
      : ref(table_v2_positive_integer(pagination?.pageSize, 20));

  const filtered_rows_ = derive(
    { rows: options.rows, query: query_, sort: sort_ },
    (state) => {
      const query = String(state.query || "")
        .trim()
        .toLocaleLowerCase();
      let rows = Array.isArray(state.rows) ? [...state.rows] : [];
      if (query) {
        rows = rows.filter((item) =>
          options.filter
            ? options.filter(item, query)
            : table_v2_matches(item, query, options.columns),
        );
      }
      if (!state.sort) return rows;
      const column = options.columns.find(
        (candidate) => candidate.key === state.sort?.key,
      );
      if (!column) return rows;
      const direction = state.sort.direction === "desc" ? -1 : 1;
      return [...rows].sort(
        (left, right) =>
          direction *
          (column.sorter
            ? column.sorter(left, right)
            : table_v2_compare(
                table_v2_column_value(left, column),
                table_v2_column_value(right, column),
              )),
      );
    },
  );
  const total_ = derive(
    { rows: filtered_rows_, configured: pagination?.total ?? null },
    (state) => {
      const configured = state.configured;
      return configured === null || configured === undefined
        ? state.rows.length
        : Math.max(0, Number(configured) || 0);
    },
  );
  const total_pages_ = derive(
    { total: total_, page_size: page_size_ },
    (state) =>
      Math.max(
        1,
        Math.ceil(state.total / table_v2_positive_integer(state.page_size, 20)),
      ),
  );
  const visible_rows_ = derive(
    { rows: filtered_rows_, page: page_, page_size: page_size_ },
    (state) => {
      if (!pagination || pagination.mode === "remote") return state.rows;
      const page_size = table_v2_positive_integer(state.page_size, 20);
      const page = Math.max(1, Math.floor(Number(state.page) || 1));
      const start = (page - 1) * page_size;
      return state.rows.slice(start, start + page_size);
    },
  );

  function set_query(value: string) {
    query_.as(value);
    page_.as(1);
    options.onQueryChange?.(value);
  }

  function set_page(value: number) {
    const page = Math.max(
      1,
      Math.min(total_pages_.value, Math.floor(Number(value) || 1)),
    );
    page_.as(page);
    pagination?.onChange?.(page, page_size_.value);
  }

  function toggle_sort(column: TableV2Column<T>) {
    if (!column.sortable && !column.sorter) return;
    const current = sort_.value;
    const next: TableV2Sort =
      current?.key === column.key
        ? {
            key: column.key,
            direction: current.direction === "asc" ? "desc" : "asc",
          }
        : { key: column.key, direction: "asc" };
    sort_.as(next);
    page_.as(1);
    options.onSortChange?.(next);
  }

  function destroy() {
    visible_rows_.destroy();
    total_pages_.destroy();
    total_.destroy();
    filtered_rows_.destroy();
    if (owns_query) query_.destroy();
    if (owns_sort) sort_.destroy();
    if (owns_page) page_.destroy();
    if (owns_page_size) page_size_.destroy();
  }

  return {
    state: {
      query: query_,
      sort: sort_,
      page: page_,
      pageSize: page_size_,
      filteredRows: filtered_rows_,
      visibleRows: visible_rows_,
      total: total_,
      totalPages: total_pages_,
    },
    methods: {
      setQuery: set_query,
      setPage: set_page,
      toggleSort: toggle_sort,
    },
    destroy,
  };
}

export type TableV2VirtualOptions<T extends Record<string, unknown>> = {
  size?: number;
  buffer?: number;
  itemHeight?: ListViewV2ItemHeight<T>;
  gutter?: ListViewV2Reactive<number>;
  paddingBottom?: ListViewV2Reactive<number | string>;
  class?: string;
  style?: BoxProps["style"];
  onScroll?: (event: ListViewV2ScrollEvent) => void;
  onReachBottom?: (event: ListViewV2ScrollEvent) => void;
  onItemResize?: (event: ListViewV2ItemResizeEvent<T>) => void;
};

export type TableV2RowSelection<T extends Record<string, unknown>> = {
  width?: number | string;
  selected: (item: T) => TableV2Reactive<boolean>;
  allSelected?: TableV2Reactive<boolean>;
  indeterminate?: TableV2Reactive<boolean>;
  disabled?: (item: T) => boolean;
  onSelect: (item: T, selected: boolean, event: Event) => void;
  onSelectAll?: (selected: boolean, event: Event) => void;
};

export type TableV2Props<T extends Record<string, unknown>> =
  TableV2ModelOptions<T> &
    BoxProps & {
      name?: string;
      status?: TableV2Reactive<TableV2Status>;
      error?: unknown;
      searchable?: boolean;
      searchPlaceholder?: string;
      rowKey?: keyof T & string;
      rowSelection?: TableV2RowSelection<T>;
      virtual?: boolean | TableV2VirtualOptions<T>;
      resizable?: boolean;
      panelClass?: string;
      panelStyle?: BoxProps["style"];
      headerClass?: string;
      bodyClass?: string;
      rowClass?: string | ((item: T) => string | undefined);
      rowStyle?: BoxProps["style"] | ((item: T) => BoxProps["style"]);
      onRow?: (item: T) => Partial<BoxProps> | undefined;
      emptyContent?: ViewChildren;
      loadingContent?: ViewChildren;
      errorContent?: ViewChildren;
    };

function table_v2_children(value: ViewChildren | undefined): ViewChildren {
  return value === undefined || value === null ? [] : value;
}

function table_v2_child_array(
  value: ViewChildren | undefined,
): ViewChildrenArray {
  return resolve_children(table_v2_children(value)) || [];
}

function table_v2_column_width<T extends Record<string, unknown>>(
  column: TableV2Column<T>,
): string {
  if (column.width === undefined || column.width === null) {
    return "minmax(0, 1fr)";
  }
  return typeof column.width === "number"
    ? `${column.width}px`
    : String(column.width);
}

function table_v2_alignment(value: TableV2Column<any>["align"]) {
  const align = value === "center" || value === "right" ? value : "left";
  return {
    "text-align": align,
    "justify-content":
      align === "right"
        ? "flex-end"
        : align === "center"
          ? "center"
          : "flex-start",
  };
}

function TableV2ResizeHandle(props: {
  name: string;
  columnKey: string;
  columnIndex: number;
  onResize: (column_index: number, width: number) => void;
}) {
  return View({
    class:
      "absolute right-0 top-0 bottom-0 z-10 w-2 cursor-col-resize touch-none select-none",
    attributes: {
      n: `${props.name}-${props.columnKey}-resize`,
      role: "separator",
      tabindex: "0",
      "aria-orientation": "vertical",
      "aria-label": `调整 ${props.columnKey} 列宽`,
    },
    onMounted(event) {
      const handle = event.target.get$elm?.() || event.target;
      if (!handle?.addEventListener) return;

      let start_x = 0;
      let start_width = 0;
      let active_pointer_id: number | null = null;

      function finish_drag() {
        active_pointer_id = null;
        handle.removeEventListener("pointermove", on_pointer_move);
        handle.removeEventListener("pointerup", on_pointer_up);
        handle.removeEventListener("pointercancel", on_pointer_up);
      }

      function on_pointer_move(pointer_event: PointerEvent) {
        if (active_pointer_id === null) return;
        props.onResize(
          props.columnIndex,
          start_width + pointer_event.clientX - start_x,
        );
      }

      function on_pointer_up(pointer_event: PointerEvent) {
        handle.releasePointerCapture?.(pointer_event.pointerId);
        finish_drag();
      }

      function on_pointer_down(pointer_event: PointerEvent) {
        const width =
          handle.parentElement?.getBoundingClientRect?.().width || 0;
        if (!width) return;
        pointer_event.preventDefault();
        pointer_event.stopPropagation();
        finish_drag();
        start_x = pointer_event.clientX;
        start_width = width;
        active_pointer_id = pointer_event.pointerId;
        handle.setPointerCapture?.(pointer_event.pointerId);
        handle.addEventListener("pointermove", on_pointer_move);
        handle.addEventListener("pointerup", on_pointer_up);
        handle.addEventListener("pointercancel", on_pointer_up);
      }

      handle.addEventListener("pointerdown", on_pointer_down);
      return () => {
        finish_drag();
        handle.removeEventListener("pointerdown", on_pointer_down);
      };
    },
    onKeyDown(event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const handle = event.currentTarget as HTMLElement;
      const width = handle.parentElement?.getBoundingClientRect().width || 0;
      event.preventDefault();
      event.stopPropagation();
      props.onResize(
        props.columnIndex,
        width + (event.key === "ArrowRight" ? 10 : -10),
      );
    },
  });
}

function TableV2Header<T extends Record<string, unknown>>(props: {
  name: string;
  columns: TableV2Column<T>[];
  columnsTemplate: TableV2Reactive<string>;
  model: TableV2Model<T>;
  rowSelection?: TableV2RowSelection<T>;
  resizable: boolean;
  onResize: (column_index: number, width: number) => void;
  class?: string;
}) {
  const cells = props.columns.map((column, column_index) => {
    if (!column.sortable && !column.sorter) {
      return View(
        {
          class: column.headerClass,
          style: {
            display: "flex",
            "align-items": "center",
            ...table_v2_alignment(column.align),
            ...(column.headerStyle || {}),
            position: props.resizable ? "relative" : undefined,
          },
          attributes: {
            n: `${props.name}-${column.key}-header`,
            role: "columnheader",
          },
        },
        [
          ...table_v2_child_array(column.title ?? column.key),
          props.resizable
            ? TableV2ResizeHandle({
                name: props.name,
                columnKey: column.key,
                columnIndex: column_index,
                onResize: props.onResize,
              })
            : null,
        ],
      );
    }

    const aria_sort_ = computed(props.model.state.sort, (sort) =>
      sort?.key !== column.key
        ? "none"
        : sort.direction === "desc"
          ? "descending"
          : "ascending",
    );
    const indicator_ = computed(props.model.state.sort, (sort) =>
      sort?.key !== column.key ? "" : sort.direction === "desc" ? " ↓" : " ↑",
    );
    return View(
      {
        class: column.headerClass,
        style: {
          display: "flex",
          "align-items": "center",
          ...table_v2_alignment(column.align),
          ...(column.headerStyle || {}),
          position: props.resizable ? "relative" : undefined,
        },
        attributes: {
          n: `${props.name}-${column.key}-header`,
          role: "columnheader",
          "aria-sort": aria_sort_,
        },
        onUnmounted() {
          aria_sort_.destroy();
          indicator_.destroy();
        },
      },
      [
        Button(
          {
            attributes: {
              n: `${props.name}-${column.key}-sort`,
              type: "button",
              "aria-label": `按 ${String(column.key)} 排序`,
            },
            onClick() {
              props.model.methods.toggleSort(column);
            },
          },
          [...table_v2_child_array(column.title ?? column.key), indicator_],
        ),
        props.resizable
          ? TableV2ResizeHandle({
              name: props.name,
              columnKey: column.key,
              columnIndex: column_index,
              onResize: props.onResize,
            })
          : null,
      ],
    );
  });

  if (props.rowSelection) {
    cells.unshift(
      View(
        {
          attributes: {
            n: `${props.name}-selection-header`,
            role: "columnheader",
          },
        },
        [
          Checkbox({
            checked: props.rowSelection.allSelected,
            indeterminate: props.rowSelection.indeterminate,
            disabled: !props.rowSelection.onSelectAll,
            attributes: {
              n: `${props.name}-select-all`,
              "aria-label": "全选表格数据",
            },
            onChange(event) {
              const target = event.target as HTMLInputElement;
              props.rowSelection?.onSelectAll?.(target.checked, event);
            },
          }),
        ],
      ),
    );
  }

  return View(
    {
      class: props.class,
      style: {
        display: "grid",
        "grid-template-columns": props.columnsTemplate,
      },
      attributes: { n: `${props.name}-header`, role: "row" },
    },
    cells,
  );
}

function TableV2DataRow<T extends Record<string, unknown>>(props: {
  table: TableV2Props<T>;
  name: string;
  item: T;
  itemRef?: Ref<T>;
  indexRef: Ref<number> | DerivedRef<number>;
  columnsTemplate: TableV2Reactive<string>;
}) {
  const row_props = props.table.onRow?.(props.item) || {};
  const cells = props.table.columns.map((column) => {
    const style =
      typeof column.cellStyle === "function"
        ? column.cellStyle(props.item)
        : column.cellStyle;
    const cell_class =
      typeof column.cellClass === "function"
        ? column.cellClass(props.item)
        : column.cellClass;
    const context = {
      column,
      index: props.indexRef.value,
      indexRef: props.indexRef,
      itemRef: props.itemRef,
    };
    const cell_value_ = column.render
      ? null
      : computed(props.itemRef || (props.item as unknown as Ref<T>), (item) =>
          table_v2_column_value(item, column),
        );
    const content = column.render
      ? column.render(props.item, context)
      : cell_value_;
    return View(
      {
        class: cell_class,
        style: {
          display: "flex",
          "align-items": "center",
          "min-width": 0,
          ...table_v2_alignment(column.align),
          ...(style || {}),
        },
        attributes: {
          n: `${props.name}-${column.key}-cell`,
          role: "cell",
        },
        onUnmounted() {
          cell_value_?.destroy();
        },
      },
      table_v2_children(content as ViewChildren),
    );
  });

  if (props.table.rowSelection) {
    const selection = props.table.rowSelection;
    cells.unshift(
      View(
        {
          attributes: { n: `${props.name}-selection-cell`, role: "cell" },
        },
        [
          Checkbox({
            checked: selection.selected(props.item),
            disabled: selection.disabled?.(props.item) || false,
            attributes: {
              n: `${props.name}-row-checkbox`,
              "aria-label": "选择表格数据",
            },
            onChange(event) {
              const target = event.target as HTMLInputElement;
              selection.onSelect(props.item, target.checked, event);
            },
          }),
        ],
      ),
    );
  }

  const {
    attributes,
    class: row_class,
    style: row_style,
    ...events
  } = row_props;
  const configured_class =
    typeof props.table.rowClass === "function"
      ? props.table.rowClass(props.item)
      : props.table.rowClass;
  const configured_style =
    typeof props.table.rowStyle === "function"
      ? props.table.rowStyle(props.item)
      : props.table.rowStyle;

  return View(
    {
      ...events,
      class: [configured_class, row_class].filter(Boolean).join(" "),
      style: {
        display: "grid",
        "grid-template-columns": props.columnsTemplate,
        ...(configured_style || {}),
        ...(row_style || {}),
      },
      attributes: {
        n: `${props.name}-row`,
        role: "row",
        ...(attributes || {}),
      },
    },
    cells,
  );
}

function TableV2State(props: {
  name: string;
  state: string;
  content: ViewChildren;
}) {
  return View(
    {
      style: { padding: "16px" },
      attributes: {
        n: `${props.name}-${props.state}`,
        role: props.state === "error" ? "alert" : "status",
      },
    },
    props.content,
  );
}

function TableV2PaginationView<T extends Record<string, unknown>>(props: {
  name: string;
  model: TableV2Model<T>;
}) {
  const previous_disabled_ = computed(
    props.model.state.page,
    (page) => page <= 1,
  );
  const next_disabled_ = derive(
    {
      page: props.model.state.page,
      total_pages: props.model.state.totalPages,
    },
    (state) => state.page >= state.total_pages,
  );
  const label_ = derive(
    {
      page: props.model.state.page,
      total_pages: props.model.state.totalPages,
      total: props.model.state.total,
    },
    (state) => `${state.page} / ${state.total_pages}，共 ${state.total} 条`,
  );
  const target_page_ = ref("");

  return View(
    {
      style: {
        display: "flex",
        "align-items": "center",
        gap: "8px",
      },
      attributes: {
        n: `${props.name}-pagination`,
        role: "navigation",
        "aria-label": "表格分页",
      },
      onUnmounted() {
        previous_disabled_.destroy();
        next_disabled_.destroy();
        label_.destroy();
        target_page_.destroy();
      },
    },
    [
      Button(
        {
          disabled: previous_disabled_,
          attributes: { n: `${props.name}-previous`, type: "button" },
          onClick() {
            props.model.methods.setPage(props.model.state.page.value - 1);
          },
        },
        ["上一页"],
      ),
      View(
        {
          attributes: {
            n: `${props.name}-page-summary`,
            "aria-live": "polite",
          },
        },
        [label_],
      ),
      Input({
        value: target_page_,
        placeholder: "页码",
        attributes: {
          n: `${props.name}-page-input`,
          "aria-label": "跳转页码",
          inputmode: "numeric",
        },
        onKeyDown(event) {
          if (event.key !== "Enter") return;
          props.model.methods.setPage(Number(target_page_.value));
          target_page_.as("");
        },
      }),
      Button(
        {
          disabled: next_disabled_,
          attributes: { n: `${props.name}-next`, type: "button" },
          onClick() {
            props.model.methods.setPage(props.model.state.page.value + 1);
          },
        },
        ["下一页"],
      ),
    ],
  );
}

export function TableV2<T extends Record<string, unknown>>(
  props: TableV2Props<T>,
) {
  const {
    rows,
    columns,
    query,
    sort,
    pagination,
    filter,
    onQueryChange,
    onSortChange,
    name = "table-v2",
    status = "normal",
    error,
    searchable = false,
    searchPlaceholder = "搜索",
    rowKey = "id" as keyof T & string,
    rowSelection,
    virtual = false,
    resizable = false,
    panelClass,
    panelStyle,
    headerClass,
    bodyClass,
    rowClass,
    rowStyle,
    onRow,
    emptyContent = "暂无数据",
    loadingContent = "加载中…",
    errorContent,
    attributes,
    onUnmounted,
    ...root_props
  } = props;
  const model = createTableV2Model({
    rows,
    columns,
    query,
    sort,
    pagination,
    filter,
    onQueryChange,
    onSortChange,
  });
  const table_props = {
    ...props,
    rowKey,
    rowSelection,
    rowClass,
    rowStyle,
    onRow,
  };
  const column_widths_ = ref(columns.map(table_v2_column_width));
  const columns_template_ = computed(column_widths_, (widths) => {
    const tracks = [...widths];
    if (rowSelection) {
      const width = rowSelection.width ?? 40;
      tracks.unshift(typeof width === "number" ? `${width}px` : String(width));
    }
    return tracks.join(" ");
  });
  const has_rows_ = computed(
    model.state.visibleRows,
    (current_rows) => current_rows.length > 0,
  );

  function resize_column(column_index: number, next_width: number) {
    if (!Number.isFinite(next_width)) return;
    const widths = [...column_widths_.value];
    widths[column_index] = `${Math.max(50, Math.round(next_width))}px`;
    column_widths_.as(widths);
  }

  function render_rows() {
    const render_row = (item: T, index_ref: DerivedRef<number>) =>
      TableV2DataRow({
        table: table_props,
        name,
        item,
        indexRef: index_ref,
        columnsTemplate: columns_template_,
      });
    if (virtual) {
      const options = virtual === true ? {} : virtual;
      return ListViewV2({
        each: model.state.visibleRows,
        key: rowKey,
        size: options.size ?? 20,
        buffer: options.buffer ?? 6,
        itemHeight: options.itemHeight ?? 40,
        gutter: options.gutter ?? 0,
        paddingBottom: options.paddingBottom ?? 0,
        class: options.class || bodyClass,
        style: { overflow: "auto", ...(options.style || {}) },
        attributes: { n: `${name}-virtual-body`, role: "rowgroup" },
        onScroll: options.onScroll,
        onReachBottom: options.onReachBottom,
        onItemResize: options.onItemResize,
        render(item_ref, index_ref) {
          return TableV2DataRow({
            table: table_props,
            name,
            item: item_ref.value,
            itemRef: item_ref,
            indexRef: index_ref,
            columnsTemplate: columns_template_,
          });
        },
      });
    }
    return View(
      {
        class: bodyClass,
        attributes: { n: `${name}-body`, role: "rowgroup" },
      },
      [
        For({
          each: model.state.visibleRows,
          key: rowKey,
          render: render_row,
        }),
      ],
    );
  }

  const normal_body = () =>
    Show({
      when: has_rows_,
      ok: render_rows,
      else() {
        return TableV2State({ name, state: "empty", content: emptyContent });
      },
    });
  const panel = View(
    {
      class: panelClass,
      style: {
        display: "flex",
        "flex-direction": "column",
        "min-height": 0,
        ...(panelStyle || {}),
      },
      attributes: { n: `${name}-panel`, role: "table" },
    },
    [
      TableV2Header({
        name,
        columns,
        columnsTemplate: columns_template_,
        model,
        rowSelection,
        resizable,
        onResize: resize_column,
        class: headerClass,
      }),
      Match({
        when: status,
        cases: {
          initial() {
            return TableV2State({
              name,
              state: "loading",
              content: loadingContent,
            });
          },
          loading() {
            return TableV2State({
              name,
              state: "loading",
              content: loadingContent,
            });
          },
          empty() {
            return TableV2State({
              name,
              state: "empty",
              content: emptyContent,
            });
          },
          error() {
            return TableV2State({
              name,
              state: "error",
              content: errorContent ?? String(error ?? "数据加载失败"),
            });
          },
          normal: normal_body,
          else: normal_body,
        },
      }),
    ],
  );
  const children: (TimelessElement | null)[] = [];
  if (searchable) {
    children.push(
      View(
        {
          attributes: { n: `${name}-search`, role: "search" },
        },
        [
          Input({
            value: model.state.query,
            placeholder: searchPlaceholder,
            attributes: {
              n: `${name}-search-input`,
              "aria-label": searchPlaceholder,
            },
            onInput(event) {
              model.methods.setQuery(
                String((event.target as HTMLInputElement)?.value || ""),
              );
            },
          }),
        ],
      ),
    );
  }
  children.push(panel);
  if (pagination) {
    children.push(TableV2PaginationView({ name, model }));
  }

  return View(
    {
      ...root_props,
      attributes: { n: `${name}-container`, ...(attributes || {}) },
      onUnmounted() {
        has_rows_.destroy();
        columns_template_.destroy();
        column_widths_.destroy();
        model.destroy();
        onUnmounted?.();
      },
    },
    children,
  );
}
