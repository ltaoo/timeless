export function normalize_page(payload, requested_page, page_size) {
  const items = Array.isArray(payload)
    ? payload
    : payload?.dataSource || payload?.items || payload?.list || [];
  const page = Number(payload?.page) || requested_page;
  const size = Number(payload?.page_size || payload?.pageSize) || page_size;
  const total = payload?.total;
  const no_more = payload?.no_more ?? payload?.noMore;
  const has_more = payload?.has_more;
  const exhausted =
    items.length === 0 ||
    (no_more !== undefined
      ? Boolean(no_more)
      : has_more !== undefined
        ? !has_more
        : total !== undefined
          ? page * size >= Number(total)
          : items.length < size);
  return { items, page, exhausted };
}
