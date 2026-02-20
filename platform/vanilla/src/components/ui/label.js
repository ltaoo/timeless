import { Label as H } from "../headless/label.js";
const t = { root: { class: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" } };
export function Label(p, c) { return H({ ...p, theme: t }, c); }
