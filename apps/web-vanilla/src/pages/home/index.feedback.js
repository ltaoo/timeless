import { Section, Item } from "@/components/index.js";

export function FeedbackView() {
  const dialog$ = new Timeless.ui.DialogCore({
    title: "Dialog Title",
    footer: true,
  });

  return View({ class: cn(["space-y-8"]) }, [
    Section("Dialog", [
      Item("Default", [
        Button(
          {
            onClick() {
              dialog$.show();
            },
          },
          [Txt("Open Dialog")],
        ),
        Dialog({ store: dialog$ }, [
          View({ class: cn(["text-sm text-zinc-500"]) }, [
            Txt(
              "This is a dialog content area. You can put anything here.",
            ),
          ]),
        ]),
      ]),
    ]),
    Section("Presence", [
      Item("Toggle visibility", [
        (() => {
          const p$ = new Timeless.ui.PresenceCore({});
          return View({ class: cn(["space-y-2"]) }, [
            Button(
              {
                size: "sm",
                onClick() {
                  p$.show();
                },
              },
              [Txt("Show")],
            ),
            Button(
              {
                size: "sm",
                variant: "outline",
                onClick() {
                  p$.hide();
                },
              },
              [Txt("Hide")],
            ),
            Presence(
              {
                store: p$,
                class: cn([
                  "p-3 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm",
                ]).toString(),
              },
              [Txt("I am visible!")],
            ),
          ]);
        })(),
      ]),
    ]),
    Section("Toast", [
      Item("Default", [
        (() => {
          const toast$ = new Timeless.ui.ToastCore({});
          return View({ class: cn(["flex gap-2"]) }, [
            Button(
              {
                size: "sm",
                onClick() {
                  toast$.show({ texts: ["Operation successful!"] });
                },
              },
              [Txt("Success")],
            ),
            Button(
              {
                size: "sm",
                variant: "outline",
                onClick() {
                  toast$.show({
                    texts: ["Loading..."],
                    icon: "loading",
                    mask: true,
                  });
                  setTimeout(() => toast$.hide(), 2000);
                },
              },
              [Txt("Loading")],
            ),
            Toast({ store: toast$ }),
          ]);
        })(),
      ]),
    ]),
    Section("Alert", [
      Item("Default", [
        Alert({}, [
          AlertTitle({}, [Txt("Heads up!")]),
          AlertDescription({}, [
            Txt("You can add components to your app using the CLI."),
          ]),
        ]),
      ]),
      Item("Destructive", [
        Alert({ variant: "destructive" }, [
          AlertTitle({}, [Txt("Error")]),
          AlertDescription({}, [
            Txt("Something went wrong. Please try again."),
          ]),
        ]),
      ]),
    ]),
  ]);
}
