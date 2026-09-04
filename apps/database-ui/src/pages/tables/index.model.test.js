import assert from "node:assert/strict";
import test from "node:test";

function signal(value) {
  return {
    value: value,
    as: function (next) {
      this.value = next;
    },
  };
}

globalThis.ref = signal;
globalThis.refarr = function (value) {
  var state = signal(value);
  state.push = function (item) {
    state.value.push(item);
  };
  state.remove = function (index) {
    state.value.splice(index, 1);
  };
  return state;
};
globalThis.computed = function (source, derive) {
  return {
    get value() {
      return derive(source.value);
    },
    destroy: function () {},
  };
};

test("tables page model owns filtering and tab state", async function () {
  var filter_event;
  var sort_event;
  var module = await import("./index.model.js");
  var model = module.createTablesPageModel({
    onFilter: function (event) {
      filter_event = event;
    },
    onSort: function (event) {
      sort_event = event;
    },
  });

  model.methods.setSearchText("USER");
  assert.deepEqual(
    model.state.visibleTables.value.map(function (table) {
      return table.name;
    }),
    ["users"],
  );

  model.methods.openTable("tags");
  model.methods.openTable("tags");
  model.methods.openTable("users");
  assert.equal(model.state.panels.value.length, 2);
  assert.equal(model.state.panels.value[0].data.value.length, 5000);

  model.methods.switchTable("tags");
  model.methods.closeTable("tags");
  assert.equal(model.state.currentPanel.value, "users");

  model.methods.onQueryChange("alice");
  model.methods.onSortChange({ key: "id", direction: "desc" });
  assert.deepEqual(filter_event, { column: null, value: "alice" });
  assert.deepEqual(sort_event, { column: "id", direction: "desc" });
  model.destroy();
});
