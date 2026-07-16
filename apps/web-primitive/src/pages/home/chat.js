const { View, Text, Fragment, ref, refobj, computed, Show, For, Icon } = Timeless;
import { SidebarLayout } from "../../components/layout.js";

export default function Page(props) {
  const messages_ = ref([
    { role: "assistant", content: "Hello! I'm a demo AI assistant. How can I help you today?", time: "10:00" },
  ]);
  const input_ = ref("");

  function sendMessage() {
    const text = input_.value.trim();
    if (!text) return;
    messages_.as([...messages_.value, { role: "user", content: text, time: new Date().toLocaleTimeString() }]);
    input_.as("");

    // Simulate AI response
    setTimeout(() => {
      messages_.as([...messages_.value, { role: "assistant", content: "This is a simulated response to: \"" + text + "\"\n\nThe Timeless framework provides a reactive store-driven UI architecture with primitive components for building web applications.", time: new Date().toLocaleTimeString() }]);
    }, 1000);
  }

  return View({ class: "flex h-full" }, [
    // Conversation list
    View({ class: "w-[260px] shrink-0 border-r border-border flex flex-col" }, [
      View({ class: "p-3 border-b border-border" }, [
        View({
          class: "flex items-center justify-center rounded-lg border border-input bg-white dark:bg-zinc-900 px-3 py-2 text-sm cursor-pointer hover:bg-accent gap-2",
          onClick() { messages_.as([{ role: "assistant", content: "New conversation started. How can I help?", time: new Date().toLocaleTimeString() }]); },
        }, [Icon({ name: "plus", size: 16 }), "New Chat"]),
      ]),
      View({ class: "flex-1 overflow-auto p-2" }, [
        ...[{ title: "Getting Started", date: "Today" }, { title: "Component Usage", date: "Today" }, { title: "Form Validation", date: "Yesterday" }, { title: "API Integration", date: "Yesterday" }].map((conv) =>
          View({ class: "px-3 py-2 rounded-md cursor-pointer hover:bg-accent mb-0.5" }, [
            Text({ class: "text-sm truncate" }, [conv.title]),
            Text({ class: "text-xs text-muted-foreground" }, [conv.date]),
          ]),
        ),
      ]),
    ]),

    // Chat area
    View({ class: "flex-1 flex flex-col" }, [
      // Messages
      View({ class: "flex-1 overflow-auto p-6 space-y-4" }, [
        ...messages_.value.map((msg, i) =>
          View({ class: "flex gap-3 " + (msg.role === "user" ? "justify-end" : "") }, [
            msg.role === "assistant" ? View({ class: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0" }, [
              Text({ class: "text-xs font-bold" }, ["AI"]),
            ]) : null,
            View({ class: "max-w-[70%] space-y-1" }, [
              View({
                class: "rounded-lg px-4 py-2 text-sm " +
                  (msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"),
              }, [
                Text({ class: "whitespace-pre-wrap" }, [msg.content]),
              ]),
              Text({ class: "text-xs text-muted-foreground px-1" }, [msg.time]),
            ]),
            msg.role === "user" ? View({ class: "w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0" }, [
              Text({ class: "text-xs font-bold" }, ["U"]),
            ]) : null,
          ]),
        ),
      ]),

      // Input
      View({ class: "border-t border-border p-4" }, [
        View({ class: "flex gap-2" }, [
          View({
            class: "flex-1 rounded-lg border border-input bg-transparent px-4 py-2 text-sm outline-none",
            placeholder: "Type a message... (Enter to send)",
            value: input_.value,
          }),
          View({
            class: "inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm cursor-pointer hover:opacity-90",
            onClick: sendMessage,
          }, ["Send"]),
        ]),
      ]),
    ]),
  ]);
}
