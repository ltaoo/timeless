// Mock article data
export const categories = [
  { id: "js", name: "JavaScript" },
  { id: "css", name: "CSS" },
  { id: "web", name: "Web Platform" },
];

export const articles = [
  { id: 1, categoryId: "js", title: "Understanding Closures in JavaScript", content: "A closure is the combination of a function bundled together with references to its surrounding state..." },
  { id: 2, categoryId: "js", title: "Async/Await Best Practices", content: "Async/await makes asynchronous code look synchronous. Here are best practices for using them effectively..." },
  { id: 3, categoryId: "css", title: "CSS Grid Layout Guide", content: "CSS Grid Layout is a two-dimensional layout system for the web. It lets you organize content into rows and columns..." },
  { id: 4, categoryId: "css", title: "Modern CSS Features You Should Know", content: "Container queries, cascade layers, and other modern CSS features that change how we build layouts..." },
  { id: 5, categoryId: "web", title: "Web Components Overview", content: "Web Components is a suite of different technologies allowing you to create reusable custom elements..." },
];

export function findArticleById(id) {
  return articles.find((a) => a.id === Number(id));
}

export function findArticlesByCategory(categoryId) {
  return articles.filter((a) => a.categoryId === categoryId);
}
