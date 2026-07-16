const { View, Text, ref } = Timeless;
import { user$ } from "../../store/index.js";

export default function LoginPage(props) {
  const username_ = ref("");
  const password_ = ref("");

  function handleLogin() {
    const result = user$.login(username_.value, password_.value);
    if (result.ok) {
      const redirect = props.view?.query?.redirect;
      const redirectQuery = (() => {
        const raw = props.view?.query?.redirect_query;
        if (!raw) return {};
        try {
          return JSON.parse(decodeURIComponent(String(raw)));
        } catch {
          return {};
        }
      })();
      if (redirect) {
        props.history.replace(redirect, redirectQuery);
        return;
      }
      props.history.replace("root.admin_layout.dashboard");
      return;
    }
    alert("Invalid username or password");
  }

  return View(
    {
      class: "flex min-h-screen flex-col items-center justify-center bg-gray-100 py-12 sm:px-6 lg:px-8 dark:bg-zinc-900",
    },
    [
      View({ class: "sm:mx-auto sm:w-full sm:max-w-md" }, [
        View(
          {
            class: "mx-auto text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white",
          },
          ["Timeless"],
        ),
        View(
          {
            class: "mt-2 text-center text-sm text-gray-600 dark:text-zinc-400",
          },
          ["Sign in to your account"],
        ),
      ]),

      View({ class: "mt-8 sm:mx-auto sm:w-full sm:max-w-md" }, [
        View(
          {
            class: "py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6 bg-white dark:bg-zinc-950",
          },
          [
            // Username Input
            View({ class: "space-y-1" }, [
              View(
                {
                  as: "label",
                  class: "block text-sm font-medium text-gray-700 dark:text-zinc-300",
                },
                ["Username"],
              ),
              View({ class: "mt-1" }, [
                View({
                  as: "input",
                  class: "block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500",
                  placeholder: "Enter your username",
                  value: username_.value,
                }),
              ]),
            ]),

            // Password Input
            View({ class: "space-y-1" }, [
              View(
                {
                  as: "label",
                  class: "block text-sm font-medium text-gray-700 dark:text-zinc-300",
                },
                ["Password"],
              ),
              View({ class: "mt-1" }, [
                View({
                  as: "input",
                  type: "password",
                  class: "block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500",
                  placeholder: "Enter your password",
                  value: password_.value,
                }),
              ]),
            ]),

            // Login Button
            View({}, [
              View(
                {
                  class: "flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer dark:bg-indigo-500 dark:hover:bg-indigo-600",
                  onClick: handleLogin,
                },
                ["Sign in"],
              ),
            ]),

            // Hint
            View(
              {
                class: "mt-6 text-center text-xs text-gray-500 dark:text-zinc-500",
              },
              [
                "Hint: Use username ",
                Text(
                  {
                    class: "font-mono font-medium text-gray-700 dark:text-zinc-300",
                  },
                  ["admin"],
                ),
                " and password ",
                Text(
                  {
                    class: "font-mono font-medium text-gray-700 dark:text-zinc-300",
                  },
                  ["123456"],
                ),
              ],
            ),
          ],
        ),
      ]),
    ],
  );
}
