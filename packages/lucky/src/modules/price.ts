import { View, ViewProps, classNames } from "@timeless/timeless";

/** Amount is an integer number of CNY cents, preventing floating-point totals. */
export function formatPrice(amount: number): string {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new RangeError("Price amount must be non-negative safe integer cents");
  const cents = BigInt(amount);
  return `${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`;
}

export function Price(props: ViewProps & { amount: number; currency?: string }) {
  const { amount, currency = "¥", class: cls, ...rest } = props;
  return View({ ...rest, class: classNames(["lucky-price", cls]) }, [
    View({ class: "lucky-price__currency" }, [currency]),
    View({}, [formatPrice(amount)]),
  ]);
}
