import { ref, vm } from "@timeless/timeless";

const ROUTES = {
  home: "/home",
  settings: "/settings",
  login: "/login",
  register: "/register",
  preview: "/preview",
  notfound: "/notfound",
};

function route_from_pathname(pathname) {
  const entry = Object.entries(ROUTES).find(([, path]) => path === pathname);
  if (entry) {
    return entry[0];
  }
  if (pathname === "/") {
    return "home";
  }
  return "notfound";
}

function read_profile() {
  try {
    return JSON.parse(localStorage.getItem("timeless-profile") || "null");
  } catch {
    return null;
  }
}

function read_theme() {
  const theme = localStorage.getItem("timeless-theme");
  return ["light", "dark", "system"].includes(theme) ? theme : "system";
}

export const route_ = ref(route_from_pathname(window.location.pathname));
export const route_query_ = ref(
  Object.fromEntries(new URLSearchParams(window.location.search)),
);
export const profile_ = ref(read_profile());
export const theme_ = ref(read_theme());
export const toaster$ = vm.ToasterModel({
  position: "top-center",
  duration: 4200,
  visibleToasts: 4,
});

export function navigate(name, query = {}, options = {}) {
  const pathname = ROUTES[name] || ROUTES.notfound;
  const search = new URLSearchParams(
    Object.entries(query).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  ).toString();
  const href = search ? `${pathname}?${search}` : pathname;
  window.history[options.replace ? "replaceState" : "pushState"]({}, "", href);
  route_query_.as(Object.fromEntries(new URLSearchParams(search)));
  route_.as(ROUTES[name] ? name : "notfound");
}

export function set_profile(profile) {
  profile_.as(profile);
  if (profile) {
    localStorage.setItem("timeless-profile", JSON.stringify(profile));
    return;
  }
  localStorage.removeItem("timeless-profile");
}

export function set_theme(theme) {
  const next_theme = ["light", "dark", "system"].includes(theme)
    ? theme
    : "system";
  const is_dark =
    next_theme === "dark" ||
    (next_theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  localStorage.setItem("timeless-theme", next_theme);
  document.documentElement.dataset.theme = is_dark ? "dark" : "light";
  document.documentElement.classList.toggle("dark", is_dark);
  document.documentElement.style.colorScheme = is_dark ? "dark" : "light";
  theme_.as(next_theme);
}

export function toggle_theme() {
  const rendered_dark = document.documentElement.classList.contains("dark");
  set_theme(rendered_dark ? "light" : "dark");
}

export function notify(message, type = "message") {
  const method = typeof toaster$[type] === "function" ? type : "message";
  toaster$[method](message);
}

window.addEventListener("popstate", () => {
  route_query_.as(
    Object.fromEntries(new URLSearchParams(window.location.search)),
  );
  route_.as(route_from_pathname(window.location.pathname));
});

const media_query = window.matchMedia("(prefers-color-scheme: dark)");
media_query.addEventListener("change", () => {
  if (theme_.value === "system") {
    set_theme("system");
  }
});

if (window.location.pathname === "/") {
  navigate("home", {}, { replace: true });
}
