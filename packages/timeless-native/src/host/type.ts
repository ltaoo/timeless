import { NativeGrid } from "./grid";
import { NativeView } from "./view";
import { NativeText } from "./text";
import { NativeLabel } from "./label";
import { NativeFragment } from "./fragment";
import { NativeLazyView } from "./lazy-view";
import { NativeImg } from "./img";
import { NativeIcon } from "./icon";

import { NativeInput } from "./input";
import { NativeFilePicker } from "./file-picker";
import { NativeTextarea } from "./textarea";
import { NativeCheckbox } from "./checkbox";
import { NativeRadio } from "./radio";
import { NativeNumberInput } from "./number-input";

import { NativeButton } from "./button";
import { NativePortal } from "./portal";

import { NativeShow } from "./show";
import { NativeMatch } from "./match";
import { NativeFor } from "./for";
import { NativeSelect } from "./select";

export type NativeHostNode =
  | null
  | NativeGrid
  | NativeFragment
  | NativeLazyView
  | NativeView
  | NativeText
  | NativeLabel
  | NativeImg
  | NativeIcon
  | NativeInput
  | NativeTextarea
  | NativeFilePicker
  | NativeNumberInput
  | NativeCheckbox
  | NativeRadio
  | NativeSelect
  | NativeButton
  | NativePortal
  | NativeShow
  | NativeMatch
  | NativeFor;
