import { View, Show, Txt, For } from "@timeless/timeless";

import { Button } from "@timeless/shadcn/src/modules/button";
import { Badge } from "@timeless/shadcn/src/modules/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@timeless/shadcn/src/modules/card";
import { Separator } from "@timeless/shadcn/src/modules/separator";
import { Input } from "@timeless/shadcn/src/modules/input";

import { ButtonCore, InputCore } from "@timeless/ui-vm";

const posts = [
  {
    slug: "getting-started-with-timeless",
    title: "Getting Started with Timeless",
    excerpt:
      "Learn how to build reactive web applications with the Timeless framework. We cover the core concepts, setup process, and your first component.",
    date: "2025-04-10",
    author: "Timeless Team",
    tags: ["tutorial", "beginner"],
    content: [
      {
        type: "paragraph",
        text: "Timeless is a reactive UI framework that brings a fresh approach to building web applications. Unlike traditional frameworks that rely on virtual DOM diffing, Timeless uses fine-grained reactivity to update only the parts of the DOM that actually change.",
      },
      {
        type: "heading",
        text: "Why Timeless?",
      },
      {
        type: "paragraph",
        text: "Modern web development has become increasingly complex. Timeless aims to simplify this by providing a clean, intuitive API that feels natural to use. The framework is built around the concept of reactive stores that automatically track dependencies and update the UI when data changes.",
      },
      {
        type: "heading",
        text: "Core Concepts",
      },
      {
        type: "paragraph",
        text: "At the heart of Timeless are three key primitives: View for creating DOM elements, Show for conditional rendering, and For for list rendering. These compose together naturally to build complex UIs from simple building blocks.",
      },
      {
        type: "paragraph",
        text: "The reactive system is powered by signals under the hood. When you create a store with data, each property becomes a reactive signal. Reading a signal inside a View automatically subscribes to updates, and writing to a signal triggers precise DOM updates.",
      },
      {
        type: "heading",
        text: "Getting Started",
      },
      {
        type: "paragraph",
        text: "To create a new Timeless project, install the CLI globally and run the init command. The scaffolded project includes everything you need: a dev server with hot module replacement, SSR support, and a production build pipeline.",
      },
      {
        type: "code",
        text: "npm install -g @timeless/cli\ntimeless init my-app\ncd my-app && pnpm dev",
      },
      {
        type: "paragraph",
        text: "Once the dev server is running, open your browser to localhost:3000 and start building. The framework handles hydration automatically, so your server-rendered pages become interactive without any additional configuration.",
      },
    ],
  },
  {
    slug: "understanding-ssr-in-timeless",
    title: "Understanding SSR in Timeless",
    excerpt:
      "Deep dive into server-side rendering with Timeless. Learn about the load function, hydration, and how to build SEO-friendly pages.",
    date: "2025-04-08",
    author: "Timeless Team",
    tags: ["ssr", "advanced"],
    content: [
      {
        type: "paragraph",
        text: "Server-side rendering is a first-class feature in Timeless. Every page can export a load function that runs on the server, fetching data before the page is rendered to HTML.",
      },
      {
        type: "heading",
        text: "The Load Function",
      },
      {
        type: "paragraph",
        text: "The load function receives the request context including query parameters, headers, and route params. It returns data that becomes available to both the head function and the Page component.",
      },
      {
        type: "paragraph",
        text: "Because load runs on the server, you can safely access databases, internal APIs, and environment variables without exposing them to the client. The returned data is serialized and sent alongside the HTML for hydration.",
      },
      {
        type: "heading",
        text: "Hydration",
      },
      {
        type: "paragraph",
        text: "After the server sends the rendered HTML, the client-side JavaScript takes over in a process called hydration. Timeless attaches event listeners and reactive subscriptions to the existing DOM nodes without re-rendering them.",
      },
      {
        type: "paragraph",
        text: "This means the user sees content immediately from the server, and interactivity is added progressively. The hydration process is efficient because Timeless tracks exactly which parts of the DOM are dynamic.",
      },
      {
        type: "heading",
        text: "Head Management",
      },
      {
        type: "paragraph",
        text: "Each page can export a head function that configures the document title, meta tags, and linked resources. This is essential for SEO and social sharing, as search engines and social platforms read these tags from the server-rendered HTML.",
      },
    ],
  },
  {
    slug: "building-components-with-shadcn",
    title: "Building Components with Shadcn",
    excerpt:
      "Explore the Shadcn component library for Timeless. Beautiful, accessible components that you can customize to match your design system.",
    date: "2025-04-05",
    author: "Timeless Team",
    tags: ["components", "ui", "shadcn"],
    content: [
      {
        type: "paragraph",
        text: "The Shadcn component library brings a beautiful set of accessible, customizable components to Timeless. Built on top of the Core store pattern, each component is both easy to use and fully controllable.",
      },
      {
        type: "heading",
        text: "The Core Store Pattern",
      },
      {
        type: "paragraph",
        text: "Every Shadcn component is powered by a Core store. For example, ButtonCore manages the button state, InputCore manages input values, and CheckboxCore manages checked state. You create a Core instance and pass it to the component.",
      },
      {
        type: "paragraph",
        text: "This separation of logic and presentation means you can test component behavior independently, share state between components, and even use the same Core store to drive different UI representations.",
      },
      {
        type: "heading",
        text: "Available Components",
      },
      {
        type: "paragraph",
        text: "The library includes buttons, inputs, checkboxes, switches, cards, badges, alerts, separators, progress bars, tabs, selects, dialogs, and more. Each component follows consistent patterns and supports variants for different visual styles.",
      },
      {
        type: "heading",
        text: "Customization",
      },
      {
        type: "paragraph",
        text: "All components use CSS custom properties (design tokens) for theming. You can customize colors, border radius, spacing, and typography by modifying the CSS variables in your styles.css file. The dark mode support is built in using the .dark class or data-theme attribute.",
      },
    ],
  },
  {
    slug: "reactive-patterns-and-best-practices",
    title: "Reactive Patterns and Best Practices",
    excerpt:
      "Master reactive programming patterns in Timeless. From simple state management to complex derived computations.",
    date: "2025-04-02",
    author: "Timeless Team",
    tags: ["patterns", "advanced"],
    content: [
      {
        type: "paragraph",
        text: "Reactive programming is at the core of Timeless. Understanding the reactive patterns available to you will help you write cleaner, more efficient code.",
      },
      {
        type: "heading",
        text: "Signals and Stores",
      },
      {
        type: "paragraph",
        text: "The most basic reactive primitive is a signal. When you define data in a load function, each property becomes a reactive signal. You can read the current value with .get() and update it with .as(). The framework tracks which Views depend on which signals and updates only what needs to change.",
      },
      {
        type: "heading",
        text: "Derived State",
      },
      {
        type: "paragraph",
        text: "Sometimes you need computed values that depend on other reactive values. Timeless supports derived state that automatically recalculates when its dependencies change. This is perfect for filtered lists, formatted values, or any transformation of existing data.",
      },
      {
        type: "heading",
        text: "Best Practices",
      },
      {
        type: "paragraph",
        text: "Keep your reactive data flat and normalized. Avoid deeply nested objects in your stores. Use Core stores for component-level state and page data for application-level state. Prefer fine-grained reactivity over coarse updates — update specific fields rather than replacing entire objects.",
      },
      {
        type: "paragraph",
        text: "When building lists, always use the For primitive with a proper key function. This ensures efficient updates when items are added, removed, or reordered. Avoid creating reactive subscriptions inside loops unless you use For, which manages cleanup automatically.",
      },
    ],
  },
  {
    slug: "deploying-your-timeless-app",
    title: "Deploying Your Timeless App",
    excerpt:
      "A complete guide to building and deploying Timeless applications to production. Covers static export, Node.js servers, and edge deployment.",
    date: "2025-03-28",
    author: "Timeless Team",
    tags: ["deployment", "production"],
    content: [
      {
        type: "paragraph",
        text: "Once your Timeless application is ready for production, the CLI provides everything you need to build and deploy. The build process optimizes your code, generates server and client bundles, and prepares assets for serving.",
      },
      {
        type: "heading",
        text: "Building for Production",
      },
      {
        type: "paragraph",
        text: "Run the build command to create an optimized production build. The CLI compiles your pages, bundles client-side JavaScript with tree shaking, processes CSS with PostCSS, and generates a server entry point for SSR.",
      },
      {
        type: "code",
        text: "timeless build\ntimeless start",
      },
      {
        type: "heading",
        text: "Deployment Options",
      },
      {
        type: "paragraph",
        text: "Timeless applications can be deployed anywhere that runs Node.js. The start command launches a production server that handles SSR, serves static assets, and manages hydration. For serverless platforms, the build output can be adapted to run as a function.",
      },
      {
        type: "paragraph",
        text: "The framework also supports static site generation for pages that do not need dynamic server rendering. This is ideal for blogs, documentation sites, and marketing pages where content does not change on every request.",
      },
    ],
  },
];

/**
 * SSR data loader
 */
export async function load() {
  return {
    posts,
    searchQuery: "",
  };
}

/**
 * Page head configuration
 */
export function head() {
  return {
    title: "Timeless Blog — Insights on Modern Web Development",
    meta: [
      {
        name: "description",
        content:
          "Explore articles about building reactive web applications with the Timeless framework.",
      },
    ],
    links: [{ rel: "stylesheet", href: "/styles.css" }],
  };
}

/**
 * Blog Home Page
 */
export default function Page({ data }) {
  const searchInput = new InputCore({
    defaultValue: "",
    placeholder: "Search articles...",
    onChange(v) {
      data.searchQuery.as(v.value);
    },
  });

  return View({ class: "min-h-screen bg-background" }, [
    // Header
    View({ as: "header", class: "border-b border-border" }, [
      View({ class: "max-w-3xl mx-auto px-6 py-12" }, [
        View({ as: "h1", class: "text-4xl font-bold tracking-tight text-foreground" }, [
          "Timeless Blog",
        ]),
        View({ as: "p", class: "mt-2 text-lg text-muted-foreground" }, [
          "Insights and tutorials on building modern web applications",
        ]),
      ]),
    ]),

    // Main content
    View({ as: "main", class: "max-w-3xl mx-auto px-6 py-8" }, [
      // Search
      View({ class: "mb-8" }, [
        Input({ store: searchInput, class: "max-w-sm" }),
      ]),

      // Post list
      For({
        list: () => {
          const query = data.searchQuery.get().toLowerCase();
          if (!query) return data.posts.get();
          return data.posts.get().filter((post) => {
            return (
              post.title.toLowerCase().includes(query) ||
              post.excerpt.toLowerCase().includes(query) ||
              post.tags.some((tag) => tag.toLowerCase().includes(query))
            );
          });
        },
        key: (post) => post.slug,
        body(post) {
          const readBtn = new ButtonCore({
            variant: "ghost",
            size: "sm",
          });

          return View({ as: "article", class: "group" }, [
            View(
              {
                as: "a",
                href: `/post?slug=${post.slug}`,
                class: "block py-6 -mx-4 px-4 rounded-lg transition-colors hover:bg-muted/50",
              },
              [
                // Date and tags
                View({ class: "flex items-center gap-2 mb-2" }, [
                  View(
                    { as: "time", class: "text-sm text-muted-foreground" },
                    [post.date],
                  ),
                  Separator({ orientation: "vertical", class: "h-4" }),
                  ...post.tags.map((tag) =>
                    Badge({ variant: "secondary", class: "text-xs" }, [tag]),
                  ),
                ]),

                // Title
                View(
                  {
                    as: "h2",
                    class:
                      "text-xl font-semibold text-foreground group-hover:text-primary transition-colors",
                  },
                  [post.title],
                ),

                // Excerpt
                View({ as: "p", class: "mt-2 text-muted-foreground leading-relaxed" }, [
                  post.excerpt,
                ]),

                // Author
                View({ class: "mt-3 text-sm text-muted-foreground" }, [
                  Txt("By "),
                  View({ as: "span", class: "font-medium text-foreground" }, [
                    post.author,
                  ]),
                ]),
              ],
            ),

            Separator({}),
          ]);
        },
      }),

      // Empty state
      Show({
        when: () => {
          const query = data.searchQuery.get().toLowerCase();
          if (!query) return false;
          return !data.posts.get().some(
            (post) =>
              post.title.toLowerCase().includes(query) ||
              post.excerpt.toLowerCase().includes(query) ||
              post.tags.some((tag) => tag.toLowerCase().includes(query)),
          );
        },
        ok() {
          return [
            View({ class: "text-center py-12" }, [
              View({ as: "p", class: "text-muted-foreground text-lg" }, [
                "No articles found matching your search.",
              ]),
            ]),
          ];
        },
      }),
    ]),

    // Footer
    View({ as: "footer", class: "border-t border-border mt-12" }, [
      View({ class: "max-w-3xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground" }, [
        "Powered by Timeless Framework",
      ]),
    ]),
  ]);
}
