import { computed, ref } from "@timeless/timeless";

export function TablePageModel() {
  const invoiceSamples = [
    {
      invoice: "INV001",
      status: "已支付",
      method: "信用卡",
      amount: "¥250.00",
    },
    {
      invoice: "INV002",
      status: "待支付",
      method: "支付宝",
      amount: "¥150.00",
    },
    {
      invoice: "INV003",
      status: "未支付",
      method: "银行转账",
      amount: "¥350.00",
    },
    {
      invoice: "INV004",
      status: "已支付",
      method: "信用卡",
      amount: "¥450.00",
    },
    {
      invoice: "INV005",
      status: "已支付",
      method: "微信支付",
      amount: "¥550.00",
    },
    {
      invoice: "INV006",
      status: "待支付",
      method: "银行转账",
      amount: "¥200.00",
    },
    {
      invoice: "INV007",
      status: "未支付",
      method: "信用卡",
      amount: "¥300.00",
    },
  ];
  const invoices = Array.from({ length: 200 }, (_, index) => ({
    ...invoiceSamples[index % invoiceSamples.length],
    invoice: `INV${String(index + 1).padStart(3, "0")}`,
  }));
  const page = ref(1);
  const pageSize = 20;
  const pageCount = Math.ceil(invoices.length / pageSize);
  function goToPage(value) {
    if (!Number.isInteger(value) || value < 1 || value > pageCount) return;
    page.as(value);
  }
  const rows = computed(page, (value) =>
    invoices.slice((value - 1) * pageSize, value * pageSize),
  );
  return {
    rows,
    // Keep the page's row slots mounted while their invoice data changes.
    rowSlots: Array.from({ length: pageSize }, (_, index) => ({
      number: index + 1,
      invoice: computed(rows, (value) => value[index].invoice),
      status: computed(rows, (value) => value[index].status),
      method: computed(rows, (value) => value[index].method),
      amount: computed(rows, (value) => value[index].amount),
    })),
    pages: Array.from({ length: pageCount }, (_, index) => ({
      number: index + 1,
      active: computed(page, (value) => value === index + 1),
      select: () => goToPage(index + 1),
    })),
    summary: computed(
      page,
      (value) => `第 ${value} / ${pageCount} 页 · 共 ${invoices.length} 条账单`,
    ),
    previousDisabled: computed(page, (value) => value === 1),
    nextDisabled: computed(page, (value) => value === pageCount),
    previous: () => goToPage(page.value - 1),
    next: () => goToPage(page.value + 1),
  };
}
