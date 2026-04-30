// const { ref, View, Show, For, computed, combine, refarr } = window.Timeless;
// const { render } = window.Timeless.DOM;

// function generateData(count) {
//   return Array.from({ length: count }, (_, i) => ({
//     id: i + 1,
//     name: `User ${i + 1}`,
//     email: `user${i + 1}@example.com`,
//     role: i % 3 === 0 ? "Admin" : i % 2 === 0 ? "Editor" : "Viewer",
//     status: i % 4 === 0 ? "Inactive" : "Active",
//     score: Math.floor(Math.random() * 100),
//   }));
// }

// function TablePage() {
//   const searchQuery = ref("");
//   const data = refarr(generateData(1000));

//   const filteredData = combine({ data, searchQuery }, (t) => {
//     if (!t.searchQuery) return t.data;
//     const q = t.searchQuery.toLowerCase();
//     return t.data.filter(
//       (row) =>
//         row.name.toLowerCase().includes(q) ||
//         row.email.toLowerCase().includes(q),
//     );
//   });

//   const totalScore = computed(filteredData, (rows) => {
//     if (!rows || rows.length === 0) return 0;
//     return rows.reduce((sum, row) => sum + row.score, 0);
//   });

//   return View({ style: { padding: "16px" } }, [
//     View({ style: { display: "flex", gap: "8px", marginBottom: "12px" } }, [
//       View({
//         onClick() {
//           searchQuery.as("");
//           data.as(generateData(1000));
//         },
//         style: { padding: "6px 12px", background: "#28a745", cursor: "pointer" },
//       }, ["Refresh Data"]),
//       View({
//         onClick() {
//           const queries = ["", "User 1", "Admin", "a", "xyz"];
//           searchQuery.as(queries[Math.floor(Math.random() * queries.length)]);
//         },
//         style: { padding: "6px 12px", background: "#ffc107", cursor: "pointer" },
//       }, ["Random Search"]),
//       View({}, [`Count: ${filteredData.length} | Score: ${totalScore.value}`]),
//     ]),
//     For({
//       key: "id",
//       each: filteredData,
//       render(row) {
//         return View({ style: { display: "flex", fontSize: "13px" } }, [
//           View({ style: { padding: "4px 8px" } }, [row.id]),
//           View({ style: { padding: "4px 8px" } }, [row.name]),
//           View({ style: { padding: "4px 8px" } }, [row.email]),
//           View({ style: { padding: "4px 8px" } }, [row.role]),
//           View({
//             style: { padding: "4px 8px", color: row.status === "Active" ? "#28a745" : "#dc3545" },
//           }, [row.status]),
//         ]);
//       },
//     }),
//   ]);
// }

// function App() {
//   const showTable = ref(true);

//   return View({ style: { padding: "16px" } }, [
//     View({ style: { display: "flex", gap: "8px", marginBottom: "12px" } }, [
//       View({
//         onClick() { showTable.as(!showTable.value); },
//         style: { padding: "8px 16px", background: "#007bff", cursor: "pointer" },
//       }, [computed(showTable, (v) => v ? "Hide Table" : "Show Table")]),
//     ]),
//     Show({
//       when: showTable,
//       ok() { return TablePage(); },
//     }),
//   ]);
// }

// render(App(), document.getElementById("root"));

var _____testArray_____ = [{ value: "hello" }];
