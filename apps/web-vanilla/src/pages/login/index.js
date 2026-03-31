import { user$ } from "@/store/index.js";

export default function LoginPage(props) {
  function handleLogin() {
    const username = ui.input_username.value;
    const password = ui.input_pwd.value;

    if (username === "admin" && password === "123456") {
      user$.login({
        id: "1",
        username,
        email: "admin@example.com",
        token: "token",
      });
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

  const ui = {
    input_username: new Timeless.ui.InputCore({
      defaultValue: "",
      placeholder: "Enter your username",
    }),
    input_pwd: new Timeless.ui.InputCore({
      defaultValue: "",
      placeholder: "Enter your password",
      type: "password",
    }),
    btn_login: new Timeless.ui.ButtonCore({
      onClick: handleLogin,
    }),
  };

  return View(
    {
      class: cn([
        "flex min-h-screen flex-col items-center justify-center bg-gray-100 py-12 sm:px-6 lg:px-8",
        "dark:bg-zinc-900", // Dark mode background
      ]),
    },
    [
      View({ class: cn(["sm:mx-auto sm:w-full sm:max-w-md"]) }, [
        // Logo (Text for now)
        View(
          {
            class: cn([
              "mx-auto text-center text-3xl font-bold tracking-tight text-gray-900",
              "dark:text-white", // Dark mode text
            ]),
          },
          [Txt("Timeless")],
        ),
        View(
          {
            class: cn([
              "mt-2 text-center text-sm text-gray-600",
              "dark:text-zinc-400", // Dark mode secondary text
            ]),
          },
          [Txt("Sign in to your account")],
        ),
      ]),

      View({ class: cn(["mt-8 sm:mx-auto sm:w-full sm:max-w-md"]) }, [
        View(
          {
            class: cn(["py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6"]),
          },
          [
            // Username Input
            View({ class: cn(["space-y-1"]) }, [
              Label(
                {
                  class: cn([
                    "block text-sm font-medium text-gray-700",
                    "dark:text-zinc-300", // Dark mode label text
                  ]),
                },
                [Txt("Username")],
              ),
              View({ class: "mt-1" }, [
                Input({
                  store: ui.input_username,
                  class: cn([
                    "block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm",
                    "dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500", // Dark mode input styles
                  ]),
                }),
              ]),
            ]),

            // Password Input
            View({ class: "space-y-1" }, [
              Label(
                {
                  class: cn([
                    "block text-sm font-medium text-gray-700",
                    "dark:text-zinc-300", // Dark mode label text
                  ]),
                },
                [Txt("Password")],
              ),
              View({ class: "mt-1" }, [
                Input({
                  store: ui.input_pwd,
                  class: cn([
                    "block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm",
                    "dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500", // Dark mode input styles
                  ]),
                }),
              ]),
            ]),

            // Login Button
            View({}, [
              Button(
                {
                  store: ui.btn_login,
                  class: cn([
                    "flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                    "dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400", // Dark mode button styles
                  ]),
                },
                [Txt("Sign in")],
              ),
            ]),

            // Hint
            View(
              {
                class: cn([
                  "mt-6 text-center text-xs text-gray-500",
                  "dark:text-zinc-500", // Dark mode hint text
                ]),
              },
              [
                Txt("Hint: Use username "),
                View(
                  {
                    as: "span",
                    class: cn([
                      "font-mono font-medium text-gray-700",
                      "dark:text-zinc-300", // Dark mode code text
                    ]),
                  },
                  [Txt("admin")],
                ),
                Txt(" and password "),
                View(
                  {
                    as: "span",
                    class: cn([
                      "font-mono font-medium text-gray-700",
                      "dark:text-zinc-300", // Dark mode code text
                    ]),
                  },
                  [Txt("123456")],
                ),
              ],
            ),
          ],
        ),
      ]),
    ],
  );
}
