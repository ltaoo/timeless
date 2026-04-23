export type FormInputInterface<T> = {
  shape:
    | "number"
    | "string"
    | "textarea"
    | "boolean"
    | "select"
    | "multiple-select"
    | "tag-input"
    | "custom"
    | "switch"
    | "checkbox"
    | "input"
    | "drag-upload"
    | "image-upload"
    | "upload"
    | "date-picker"
    | "list"
    | "form"
    | "drag-select";
  // state: any;
  id?: string;
  value: T;
  defaultValue: T;
  setValue: (v: T, extra?: Partial<{ silence: boolean }>) => void;
  setStatus: (status: "error" | "success" | "normal") => void;
  destroy?: () => void;
  onChange: (fn: (v: T) => void) => void;
  // onStateChange: (fn: (v: any) => void) => void;
};
