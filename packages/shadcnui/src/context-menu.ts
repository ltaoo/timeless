import { ContextMenu as HContextMenu } from "@timeless/headless";
import { t } from "./menu-shared";

export function ContextMenu(p: any, c?: any) {
  return HContextMenu({ ...p, theme: t }, c);
}
