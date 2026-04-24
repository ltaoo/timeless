export const categories = [
  { id: "a", name: "JavaScript" },
  { id: "b", name: "CSS" },
  { id: "c", name: "Web 平台" },
];

export const articles = [
  {
    id: "1",
    categoryId: "a",
    name: "JavaScript 异步编程",
    title: "深入理解 JavaScript 异步编程",
    content:
      "JavaScript 是单线程语言，但通过事件循环机制实现了非阻塞的异步操作。从最早的回调函数，到 Promise，再到 async/await，异步编程的写法越来越简洁。理解事件循环、微任务与宏任务的执行顺序，是掌握异步编程的关键。",
  },
  {
    id: "2",
    categoryId: "b",
    name: "CSS Grid 布局",
    title: "CSS Grid 布局实战指南",
    content:
      "CSS Grid 是一种二维布局系统，能够同时控制行和列。相比 Flexbox 的一维布局，Grid 更适合构建复杂的页面结构。通过 grid-template-columns、grid-template-rows 和 grid-area 等属性，可以轻松实现响应式布局。",
  },
  {
    id: "3",
    categoryId: "c",
    name: "前端性能优化",
    title: "前端性能优化的常见策略",
    content:
      "前端性能优化涵盖多个方面：减少 HTTP 请求数量、启用 Gzip 压缩、使用 CDN 加速静态资源、图片懒加载、代码分割与按需加载、合理使用缓存策略等。Core Web Vitals（LCP、FID、CLS）是衡量用户体验的重要指标。",
  },
  {
    id: "4",
    categoryId: "a",
    name: "TypeScript 类型体操",
    title: "TypeScript 高级类型技巧",
    content:
      "TypeScript 的类型系统非常强大，支持条件类型、映射类型、模板字面量类型等高级特性。通过 infer 关键字可以在条件类型中进行类型推断，结合递归类型可以实现复杂的类型运算，极大提升代码的类型安全性。",
  },
  {
    id: "5",
    categoryId: "c",
    name: "Web Components",
    title: "Web Components 入门与实践",
    content:
      "Web Components 是一组浏览器原生支持的技术标准，包括 Custom Elements、Shadow DOM 和 HTML Templates。它允许开发者创建可复用的自定义组件，并且不依赖任何框架。Shadow DOM 提供了样式隔离，避免了全局 CSS 污染问题。",
  },
];
