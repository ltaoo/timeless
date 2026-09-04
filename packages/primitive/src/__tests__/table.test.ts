import { ref } from "@timeless/inner-reactive";
import { describe, expect, it } from "vitest";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/content/table";
import { createTableV2Model, TableV2 } from "@/content/tablev2";

describe("Table", () => {
  it("creates semantic table elements", () => {
    const table = Table({}, [
      TableHeader({}, [TableRow({}, [TableHead({ scope: "col" }, ["Name"])])]),
      TableBody({}, [TableRow({}, [TableCell({ colSpan: 2 }, ["Ada"])])]),
    ]);

    expect(table.t).toBe("table");
    expect(table.state.attributes.n).toBe("table");
    expect(table.children?.[0]?.t).toBe("table-header");
    expect(
      table.children?.[1]?.children?.[0]?.children?.[0]?.state.attributes,
    ).toMatchObject({ n: "table-cell", colspan: 2 });
  });
});

describe("TableV2 model", () => {
  it("filters, sorts and paginates reactive rows", () => {
    const rows_ = ref([
      { id: 1, name: "Ada", age: 36 },
      { id: 2, name: "Bob", age: 18 },
      { id: 3, name: "Cara", age: 27 },
    ]);
    const model = createTableV2Model({
      rows: rows_,
      columns: [
        { key: "name", searchable: true },
        { key: "age", sortable: true },
      ],
      pagination: { pageSize: 2 },
    });

    model.methods.setQuery("bo");
    expect(model.state.filteredRows.value.map((row) => row.id)).toEqual([2]);

    model.methods.setQuery("");
    model.methods.toggleSort({ key: "age", sortable: true });
    expect(model.state.filteredRows.value.map((row) => row.id)).toEqual([
      2, 3, 1,
    ]);

    model.methods.setPage(2);
    expect(model.state.visibleRows.value.map((row) => row.id)).toEqual([1]);

    rows_.as([{ id: 4, name: "Dora", age: 42 }]);
    model.methods.setPage(1);
    expect(model.state.visibleRows.value.map((row) => row.id)).toEqual([4]);

    model.destroy();
  });

  it("uses ListViewV2 for virtual rows", () => {
    const table = TableV2({
      rows: [{ id: 1, name: "Ada" }],
      columns: [{ key: "name" }],
      virtual: true,
    });
    const pending = [...(table.children || [])];
    let virtual_list;
    while (pending.length) {
      const child = pending.shift();
      if (child?.t === "list-view-v2") {
        virtual_list = child;
        break;
      }
      pending.push(...(child?.children || []));
    }

    expect(virtual_list?.t).toBe("list-view-v2");
    table.destroy?.();
  });

  it("resizes a column from its header handle", () => {
    const table = TableV2({
      rows: [{ id: 1, name: "Ada" }],
      columns: [{ key: "id" }, { key: "name" }],
      resizable: true,
    });
    const pending = [...(table.children || [])];
    let header: any;
    let resize_handle: any;
    while (pending.length) {
      const child = pending.shift();
      if (child?.state?.attributes?.n === "table-v2-header") header = child;
      if (child?.state?.attributes?.n === "table-v2-id-resize") {
        resize_handle = child;
      }
      pending.push(...(child?.children || []));
    }

    const listeners = new Map<string, (event: any) => void>();
    const handle = {
      parentElement: {
        getBoundingClientRect: () => ({ width: 120 }),
      },
      addEventListener: (name: string, listener: (event: any) => void) => {
        listeners.set(name, listener);
      },
      removeEventListener: (name: string) => {
        listeners.delete(name);
      },
      setPointerCapture() {},
      releasePointerCapture() {},
    };
    resize_handle.onMounted({ target: { get$elm: () => handle } });
    listeners.get("pointerdown")?.({
      clientX: 100,
      pointerId: 1,
      preventDefault() {},
      stopPropagation() {},
    });
    listeners.get("pointermove")?.({ clientX: 180 });
    expect(header.state.style["grid-template-columns"]).toBe(
      "200px minmax(0, 1fr)",
    );

    listeners.get("pointermove")?.({ clientX: -100 });
    expect(header.state.style["grid-template-columns"]).toBe(
      "50px minmax(0, 1fr)",
    );
    listeners.get("pointerup")?.({ pointerId: 1 });
    table.destroy?.();
  });
});
