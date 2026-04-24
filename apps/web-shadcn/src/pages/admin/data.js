export const mockUsers = (() => {
  const items = [];
  for (let i = 1; i <= 10; i++) {
    items.push({
      id: String(i),
      username: `user${i}`,
      name: `用户 ${i}`,
      email: `user${i}@example.com`,
      role: i === 1 ? "admin" : i % 3 === 0 ? "auditor" : "member",
      status: i % 4 === 0 ? "disabled" : "active",
      createdAt: `2026-03-${String(i).padStart(2, "0")}`,
    });
  }
  return items;
})();

export function findMockUserById(id) {
  const userId = String(id || "");
  return mockUsers.find((u) => u.id === userId) || null;
}


// const mockUsers = (() => {
//   const items = [];
//   for (let i = 1; i <= 10; i++) {
//     items.push({
//       id: String(i),
//       username: `user${i}`,
//       name: `用户 ${i}`,
//       email: `user${i}@example.com`,
//       role: i === 1 ? "admin" : i % 3 === 0 ? "auditor" : "member",
//       status: i % 4 === 0 ? "disabled" : "active",
//       createdAt: `2026-03-${String(i).padStart(2, "0")}`,
//     });
//   }
//   return items;
// })();

// function findMockUserById(id) {
//   const userId = String(id || "");
//   return mockUsers.find((u) => u.id === userId) || null;
// }
