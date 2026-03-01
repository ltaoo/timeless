export type ThemeTypes = "dark" | "light" | "system";

export enum OrientationTypes {
  Horizontal = "horizontal",
  Vertical = "vertical",
}

export type KeyboardEvent = {
  code: string;
  shift: boolean;
  ctrl: boolean;
  cmd: boolean;
  alt: boolean;
  preventDefault: () => void;
};
