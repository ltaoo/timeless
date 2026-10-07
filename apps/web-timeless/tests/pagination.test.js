import assert from "node:assert/strict";
import { test } from "node:test";
import { normalize_page } from "../src/services/pagination.js";

test("normalizes legacy list and page_size with total", () => {
  assert.deepEqual(
    normalize_page(
      { list: [{ id: 1 }], page: 2, page_size: 20, total: 21 },
      2,
      20,
    ),
    {
      items: [{ id: 1 }],
      page: 2,
      exhausted: true,
    },
  );
});
test("honors explicit pagination flags", () => {
  assert.equal(
    normalize_page({ items: [1], has_more: true }, 1, 20).exhausted,
    false,
  );
  assert.equal(
    normalize_page({ dataSource: [1], no_more: true }, 1, 20).exhausted,
    true,
  );
  assert.equal(
    normalize_page({ list: [], has_more: true }, 1, 20).exhausted,
    true,
  );
});
test("array response and missing metadata use page length", () => {
  assert.equal(normalize_page([1, 2], 1, 2).exhausted, false);
  assert.equal(normalize_page([1], 2, 2).exhausted, true);
});
