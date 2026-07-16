// Mock user data
export const mockUsers = [
  { id: 1, username: "admin", name: "Admin", email: "admin@example.com", role: "admin", status: "active", createdAt: "2024-01-15" },
  { id: 2, username: "zhangsan", name: "Zhang San", email: "zhangsan@example.com", role: "auditor", status: "active", createdAt: "2024-02-20" },
  { id: 3, username: "lisi", name: "Li Si", email: "lisi@example.com", role: "member", status: "active", createdAt: "2024-03-10" },
  { id: 4, username: "wangwu", name: "Wang Wu", email: "wangwu@example.com", role: "member", status: "disabled", createdAt: "2024-04-05" },
  { id: 5, username: "zhaoliu", name: "Zhao Liu", email: "zhaoliu@example.com", role: "auditor", status: "active", createdAt: "2024-05-12" },
  { id: 6, username: "sunqi", name: "Sun Qi", email: "sunqi@example.com", role: "member", status: "active", createdAt: "2024-06-18" },
  { id: 7, username: "zhouba", name: "Zhou Ba", email: "zhouba@example.com", role: "admin", status: "active", createdAt: "2024-07-22" },
  { id: 8, username: "wujiu", name: "Wu Jiu", email: "wujiu@example.com", role: "member", status: "disabled", createdAt: "2024-08-30" },
  { id: 9, username: "zhengshi", name: "Zheng Shi", email: "zhengshi@example.com", role: "auditor", status: "active", createdAt: "2024-09-14" },
  { id: 10, username: "liuyi", name: "Liu Yi", email: "liuyi@example.com", role: "member", status: "active", createdAt: "2024-10-01" },
];

export function findMockUserById(id) {
  return mockUsers.find((u) => u.id === Number(id));
}
