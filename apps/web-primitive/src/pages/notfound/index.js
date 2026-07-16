const { View } = Timeless;

export default function NotFoundPageView(props) {
  return View(
    {
      class: "flex flex-col items-center justify-center min-h-screen bg-background text-foreground",
    },
    [
      View({ class: "flex flex-col items-center space-y-4 text-center" }, [
        View(
          {
            class: "text-9xl font-bold opacity-10 select-none",
          },
          ["404"],
        ),
        View({ class: "text-2xl font-medium" }, ["Page Not Found"]),
        View({ class: "opacity-60" }, ["Sorry, the page you are looking for does not exist."]),
        View({ class: "mt-8" }, [
          View(
            {
              class: "px-6 py-3 rounded-lg font-medium transition-opacity bg-foreground text-background hover:opacity-90 cursor-pointer inline-block",
              onClick() {
                props.history.push("root.home_layout.index");
              },
            },
            ["Back to Home"],
          ),
        ]),
      ]),
    ],
  );
}
