import { Section, Item } from "@/components/index.js";

export function NavigationView() {
  return View({ class: cn(["space-y-8"]) }, [
    Section("Tabs", [
      Item("Default", [
        Tabs({
          value: ref("tab1"),
          items: [
            {
              label: "Account",
              value: "tab1",
              content: Txt("Account settings content."),
            },
            {
              label: "Password",
              value: "tab2",
              content: Txt("Password settings content."),
            },
            {
              label: "Notifications",
              value: "tab3",
              content: Txt("Notification preferences."),
            },
          ],
        }),
      ]),
    ]),
    Section("Accordion", [
      Item("Default", [
        Accordion({
          items: [
            {
              title: "Is it accessible?",
              content:
                "Yes. It adheres to the WAI-ARIA design pattern.",
            },
            {
              title: "Is it styled?",
              content:
                "Yes. It comes with default styles that match the other components.",
            },
            {
              title: "Is it animated?",
              content:
                "Yes. It uses CSS transitions for smooth open/close.",
            },
          ],
        }),
      ]),
    ]),
  ]);
}
