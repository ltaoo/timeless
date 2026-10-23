import { For, ScrollView, View } from "@timeless/timeless";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@timeless/shadcn";

export function TablePageView(model) {
  return View(
    {
      class: "flex min-h-0 w-full flex-1 flex-col gap-6",
      attributes: { n: "table-page" },
    },
    [
      View(
        {
          class: "shrink-0 text-2xl font-bold",
          attributes: { n: "table-page-title" },
        },
        ["Table / 账单列表"],
      ),
      View(
        {
          class: "shrink-0 text-sm tt-text-muted-foreground",
          attributes: { n: "table-description" },
        },
        [
          "最近的账单，共 200 条，每页显示 20 条，共 10 页。使用下方分页查看其余账单。",
        ],
      ),
      ScrollView(
        {
          class: "min-h-0 flex-1",
          horizontal: "hidden",
          attributes: { n: "invoices-scroll", "aria-label": "账单列表" },
        },
        [
          Table(
            {
              class: "shrink-0",
              attributes: { n: "invoices-table", "aria-label": "最近账单" },
            },
            [
              TableHeader({ attributes: { n: "invoices-header" } }, [
                TableRow(
                  { attributes: { n: "invoices-heading-row" } },
                  ["账单编号", "状态", "支付方式", "金额"].map((title, index) =>
                    TableHead(
                      {
                        class: index === 3 ? "text-right!" : "",
                        attributes: {
                          n: `invoices-heading-${index}`,
                          scope: "col",
                        },
                      },
                      [title],
                    ),
                  ),
                ),
              ]),
              TableBody({ attributes: { n: "invoices-body" } }, [
                For({
                  each: model.rowSlots,
                  render: (row) =>
                    TableRow({ attributes: { n: `invoice-row-${row.number}` } }, [
                      TableCell(
                        {
                          class: "font-medium",
                          attributes: { n: `invoice-row-${row.number}-number` },
                        },
                        [row.invoice],
                      ),
                      TableCell(
                        { attributes: { n: `invoice-row-${row.number}-status` } },
                        [row.status],
                      ),
                      TableCell(
                        { attributes: { n: `invoice-row-${row.number}-method` } },
                        [row.method],
                      ),
                      TableCell(
                        {
                          class: "text-right",
                          attributes: { n: `invoice-row-${row.number}-amount` },
                        },
                        [row.amount],
                      ),
                    ]),
                }),
              ]),
            ],
          ),
        ],
      ),
      View(
        {
          class: "flex shrink-0 flex-row items-center justify-between gap-4",
          attributes: { n: "invoices-footer" },
        },
        [
          View(
            {
              attributes: {
                n: "invoices-summary",
                role: "status",
                "aria-live": "polite",
              },
              class: "shrink-0 text-sm tt-text-muted-foreground",
            },
            [model.summary],
          ),
          Pagination(
            {
              class: "mx-0! w-auto! shrink-0",
              attributes: {
                n: "invoices-pagination",
                "aria-label": "账单分页",
              },
            },
            [
              PaginationContent(
                {
                  class: "gap-0!",
                  attributes: { n: "invoices-pagination-content" },
                },
                [
                  PaginationItem(
                    { attributes: { n: "invoices-previous-item" } },
                    [
                      PaginationPrevious(
                        {
                          size: "icon",
                          disabled: model.previousDisabled,
                          onClick: model.previous,
                          attributes: {
                            n: "invoices-previous",
                            "aria-label": "上一页",
                          },
                        },
                        [],
                      ),
                    ],
                  ),
                  ...model.pages.map((page) =>
                    PaginationItem(
                      {
                        attributes: { n: `invoices-page-item-${page.number}` },
                      },
                      [
                        PaginationLink(
                          {
                            class: "size-6!",
                            isActive: page.active,
                            onClick: page.select,
                            attributes: {
                              n: `invoices-page-${page.number}`,
                              "aria-label": `第 ${page.number} 页`,
                            },
                          },
                          [String(page.number)],
                        ),
                      ],
                    ),
                  ),
                  PaginationItem({ attributes: { n: "invoices-next-item" } }, [
                    PaginationNext(
                      {
                        size: "icon",
                        disabled: model.nextDisabled,
                        onClick: model.next,
                        attributes: {
                          n: "invoices-next",
                          "aria-label": "下一页",
                        },
                      },
                      [],
                    ),
                  ]),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}
