import {
  Audio,
  Checkbox,
  Input,
  Textarea,
  Text,
  View,
  SVG,
  Icon,
  getIconRegistry,
  type TimelessElement,
  type ViewChildren,
  Label,
  Button as PrimitiveButton,
  Modal as PrimitiveModal,
  Img as PrimitiveImg,
  Video as PrimitiveVideo,
} from "@timeless/timeless";
import basic_schema from "./schemas/catalog.json";
import { basicFunctions, safeUrl } from "./functions";
import { displayString } from "./data-model";
import type {
  Action,
  Catalog,
  ChildList,
  ComponentContext,
  ComponentFactory,
} from "./types";
import { outlet } from "./view";

export const BASIC_CATALOG_ID =
  "https://a2ui.org/specification/v0_9_1/catalogs/basic/catalog.json";
export const LEGACY_CATALOG_ID =
  "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json";
const semantic = (context: ComponentContext, part = "content") => ({
  n: `a2ui-${context.definition.component}:${context.definition.id}:${part}`,
});
const css = (value: unknown) =>
  String(value ?? "start").replace(
    /[A-Z]/g,
    (character) => `-${character.toLowerCase()}`,
  );

function markdown(text: string, name: string): ViewChildren {
  const pieces = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return pieces.map((piece, index) => {
    const attributes = { n: `${name}:fragment:${index}` };
    if (piece.startsWith("**"))
      return View(
        { style: { display: "inline", fontWeight: 700 }, attributes },
        [piece.slice(2, -2)],
      );
    if (piece.startsWith("*"))
      return View(
        { style: { display: "inline", fontStyle: "italic" }, attributes },
        [piece.slice(1, -1)],
      );
    if (piece.startsWith("`"))
      return View(
        { style: { display: "inline", fontFamily: "monospace" }, attributes },
        [piece.slice(1, -1)],
      );
    return View({ style: { display: "inline" }, attributes }, [piece]);
  });
}

function textComponent(context: ComponentContext): TimelessElement {
  // Text's reactive value remains mounted; formatting is safe and contains no HTML.
  const value = context.bind(context.definition.text, displayString);
  const content = outlet(
    `a2ui-markdown:${context.definition.id}`,
    () => [value.value],
    (update) => value.subscribe({ onChange: update }),
    (text) =>
      View(
        {
          class: "tt-content-inline",
          attributes: semantic(context, "markdown"),
          style: { display: "inline", whiteSpace: "pre-wrap" },
        },
        markdown(
          text.replace(/^#{1,6}\s+/, ""),
          `a2ui-markdown:${context.definition.id}`,
        ),
      ),
    (left, right) => left === right,
  );
  context.onCleanup(() => content.destroy?.());
  const variant = String(context.definition.variant ?? "body");
  const level = /^h[1-5]$/.test(variant) ? Number(variant.slice(1)) : 0;
  return View(
    {
      attributes: {
        ...semantic(context),
        role: level ? "heading" : undefined,
        "aria-level": level || undefined,
      },
      style: {
        fontSize: level
          ? `${2 - (level - 1) * 0.2}em`
          : variant === "caption"
            ? "0.875em"
            : "1em",
        fontWeight: level ? 700 : 400,
      },
    },
    [content],
  );
}

function inputComponent(context: ComponentContext): TimelessElement {
  const definition = context.definition;
  const label = context.bind(definition.label, displayString);
  const invalid = context.watch(() => context.errors().length > 0);
  const errors = context.watch(() => context.errors().join("; "));
  const types: Record<string, string> = {
    shortText: "text",
    obscured: "password",
    number: "number",
  };
  const type =
    definition.component === "Slider"
      ? "range"
      : definition.component === "DateTimeInput"
        ? definition.enableDate && definition.enableTime
          ? "datetime-local"
          : definition.enableTime
            ? "time"
            : definition.enableDate
              ? "date"
              : "text"
        : (types[String(definition.variant)] ?? "text");
  const value = context.watch(() => {
    const raw = displayString(context.input());
    if (definition.component !== "DateTimeInput" || !raw) return raw;
    if (type === "date") return raw.slice(0, 10);
    if (type === "time" && /^\d{2}:\d{2}/.test(raw)) return raw;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "";
    const local = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000,
    ).toISOString();
    return type === "time" ? local.slice(11, 19) : local.slice(0, 19);
  });
  const factory =
    definition.component === "TextField" && definition.variant === "longText"
      ? Textarea
      : Input;
  const input = factory({
    attributes: {
      ...semantic(context, "input"),
      "aria-label": label,
      "aria-invalid": invalid,
      min: context.bind(definition.min, displayString),
      max: context.bind(definition.max, displayString),
      step: definition.component === "Slider" ? "any" : undefined,
    },
    type,
    value,
    onInput: (event) => {
      const next = (event.target as HTMLInputElement).value;
      context.write(
        definition.component === "Slider"
          ? Number(next)
          : type === "datetime-local" && next
            ? new Date(next).toISOString()
            : next,
      );
    },
  });
  return Label({ attributes: semantic(context, "label") }, [
    Text(label),
    input,
    View(
      {
        class: "tt-content-inline tt-content-small",
        attributes: { ...semantic(context, "errors"), role: "status" },
      },
      [Text(errors)],
    ),
  ]);
}

function checkbox(context: ComponentContext): TimelessElement {
  const value = context.watch(() => Boolean(context.input()));
  const input = Checkbox({
    attributes: semantic(context, "input"),
    checked: value,
    onChange: (event) =>
      context.write((event.target as HTMLInputElement).checked),
  });
  // The primitive host exposes setChecked, while its shape currently only updates state.
  const unsubscribe = value.subscribe({
    onChange: (next) =>
      (
        input.$elm as unknown as {
          setChecked?: (checked: boolean) => void;
        } | null
      )?.setChecked?.(next),
  });
  context.onCleanup(unsubscribe);
  return Label({ attributes: semantic(context) }, [
    input,
    Text(context.bind(context.definition.label, displayString)),
    Text(context.watch(() => context.errors().join("; "))),
  ]);
}

function choicePicker(context: ComponentContext): TimelessElement {
  const options = context.definition.options as {
    label: unknown;
    value: string;
  }[];
  const multiple = context.definition.variant === "multipleSelection";
  const label_id = `a2ui-choice-label:${context.definition.id}`;
  return View(
    {
      attributes: {
        ...semantic(context),
        role: "group",
        "aria-labelledby": label_id,
      },
    },
    [
      View({ attributes: { ...semantic(context, "legend"), id: label_id } }, [
        Text(context.bind(context.definition.label, displayString)),
      ]),
      ...(context.definition.filterable
        ? [
            Input({
              attributes: {
                ...semantic(context, "filter"),
                "aria-label": "Filter options",
              },
              value: context.watch(() =>
                displayString(context.local("filter", "")),
              ),
              onInput: (event) =>
                context.setLocal(
                  "filter",
                  (event.target as HTMLInputElement).value,
                ),
            }),
          ]
        : []),
      ...options.map((option) => {
        const selected = context.watch(
          () =>
            Array.isArray(context.input()) &&
            (context.input() as unknown[]).includes(option.value),
        );
        const input = Checkbox({
          attributes: {
            ...semantic(context, `option:${option.value}`),
            role: multiple ? "checkbox" : "radio",
            "aria-checked": selected,
          },
          checked: selected,
          onChange: (event) => {
            const checked = (event.target as HTMLInputElement).checked;
            const previous = Array.isArray(context.input())
              ? (context.input() as string[])
              : [];
            context.write(
              multiple
                ? checked
                  ? [...new Set([...previous, option.value])]
                  : previous.filter((value) => value !== option.value)
                : checked
                  ? [option.value]
                  : [],
            );
          },
        });
        context.onCleanup(
          selected.subscribe({
            onChange: (next) =>
              (
                input.$elm as unknown as {
                  setChecked?: (checked: boolean) => void;
                } | null
              )?.setChecked?.(next),
          }),
        );
        return Label(
          {
            attributes: {
              ...semantic(context, `choice:${option.value}`),
              hidden: context.watch(
                () =>
                  !displayString(context.read(option.label))
                    .toLocaleLowerCase()
                    .includes(
                      displayString(
                        context.local("filter", ""),
                      ).toLocaleLowerCase(),
                    ),
              ),
            },
            style:
              context.definition.displayStyle === "chips"
                ? {
                    display: "inline-flex",
                    padding: "4px 8px",
                    borderRadius: "16px",
                    border: "1px solid #d4d4d4",
                  }
                : {},
          },
          [input, Text(context.bind(option.label, displayString))],
        );
      }),
    ],
  );
}

function tabs(context: ComponentContext): TimelessElement {
  const entries = context.definition.tabs as {
    title: unknown;
    child: string;
  }[];
  return View({ attributes: semantic(context) }, [
    View(
      { attributes: { ...semantic(context, "tab-list"), role: "tablist" } },
      entries.map((tab, index) =>
        PrimitiveButton(
          {
            attributes: {
              ...semantic(context, `tab:${index}`),
              role: "tab",
              "aria-selected": context.watch(
                () => context.local("active", 0) === index,
              ),
            },
            onClick: () => context.setLocal("active", index),
          },
          [Text(context.bind(tab.title, displayString))],
        ),
      ),
    ),
    ...entries.map((tab, index) =>
      View(
        {
          attributes: {
            ...semantic(context, `panel:${index}`),
            role: "tabpanel",
            hidden: context.watch(() => context.local("active", 0) !== index),
          },
        },
        [context.child(tab.child)],
      ),
    ),
  ]);
}

function modal(context: ComponentContext): TimelessElement {
  return View({ attributes: semantic(context) }, [
    View(
      {
        attributes: semantic(context, "trigger"),
        onClick: () => context.setLocal("open", true),
      },
      [context.child(String(context.definition.trigger))],
    ),
    PrimitiveModal(
      {
        open: context.watch(() => Boolean(context.local("open", false))),
        onClose: () => context.setLocal("open", false),
        attributes: {
          ...semantic(context, "dialog"),

          "aria-modal": "true",
        },
      },
      [
        context.child(String(context.definition.content)),
        PrimitiveButton(
          {
            attributes: semantic(context, "close"),
            onClick: () => context.setLocal("open", false),
          },
          ["Close"],
        ),
      ],
    ),
  ]);
}

export function createBasicCatalog(
  options: {
    components?: Record<string, ComponentFactory>;
    onOpenUrl?: (url: string) => void;
  } = {},
): Catalog {
  const layout: ComponentFactory = (context) =>
    View(
      {
        attributes: semantic(context),
        style: {
          display: "flex",
          flexDirection:
            context.definition.component === "Row" ||
            context.definition.direction === "horizontal"
              ? "row"
              : "column",
          justifyContent: css(context.definition.justify),
          alignItems: css(context.definition.align ?? "stretch"),
          overflow:
            context.definition.component === "List" ? "auto" : "visible",
        },
      },
      [context.children(context.definition.children as ChildList)],
    );
  const components: Record<string, ComponentFactory> = {
    Text: textComponent,
    Row: layout,
    Column: layout,
    List: layout,
    Card: (context) =>
      View(
        {
          attributes: semantic(context),
          style: {
            padding: "16px",
            border: "1px solid #d4d4d4",
            borderRadius: "8px",
          },
        },
        [context.child(String(context.definition.child))],
      ),
    Image: (context) => {
      const variants: Record<string, Record<string, string>> = {
        icon: { width: "24px", height: "24px" },
        avatar: { width: "40px", height: "40px", borderRadius: "50%" },
        smallFeature: { width: "100px", height: "100px" },
        mediumFeature: { width: "100%", maxWidth: "300px" },
        largeFeature: { width: "100%", maxHeight: "400px" },
        header: { width: "100%", height: "200px" },
      };
      return PrimitiveImg({
        attributes: {
          ...semantic(context),
          src: context.bind(context.definition.url, safeUrl),
          alt: context.bind(context.definition.description, displayString),
        },
        style: {
          ...variants[String(context.definition.variant ?? "mediumFeature")],
          objectFit:
            context.definition.fit === "scaleDown"
              ? "scale-down"
              : String(
                  context.definition.fit ??
                    (context.definition.variant === "header"
                      ? "cover"
                      : "fill"),
                ),
        },
      });
    },
    Video: (context) =>
      PrimitiveVideo({
        attributes: {
          ...semantic(context),
          controls: true,
          src: context.bind(context.definition.url, safeUrl),
        },
      }),
    AudioPlayer: (context) =>
      Audio({
        attributes: {
          ...semantic(context),
          "aria-label": context.bind(
            context.definition.description,
            displayString,
          ),
        },
        src: context.bind(context.definition.url, safeUrl),
        controls: true,
      }),
    Icon: (context) => {
      const value = context.watch(() => context.read(context.definition.name));
      const aliases: Record<string, string> = {
        accountCircle: "user",
        person: "user",
        add: "plus",
        arrowBack: "arrow-left",
        arrowForward: "arrow-right",
        attachFile: "paperclip",
        calendarToday: "calendar",
        call: "phone",
        close: "x",
        delete: "trash",
        edit: "pen-line",
        event: "calendar",
        error: "circle-alert",
        fastForward: "chevron-right",
        favorite: "star",
        favoriteOff: "star",
        help: "circle-alert",
        home: "house",
        info: "circle-alert",
        locationOn: "globe",
        lock: "file-lock",
        lockOpen: "file-lock",
        mail: "message-square-more",
        moreVert: "ellipsis-vertical",
        moreHoriz: "ellipsis",
        notifications: "bell",
        notificationsOff: "bell",
        photo: "image",
        print: "file-text",
        refresh: "refresh-cw",
        rewind: "chevron-left",
        send: "corner-down-right",
        share: "external-link",
        starHalf: "star",
        starOff: "star",
        stop: "square",
        visibility: "eye",
        visibilityOff: "eye",
        volumeDown: "file-volume",
        volumeMute: "file-volume",
        volumeOff: "file-volume",
        volumeUp: "file-volume",
        warning: "circle-alert",
      };
      const view = outlet(
        `a2ui-icon:${context.definition.id}`,
        () => [value.value],
        (update) => value.subscribe({ onChange: update }),
        (name) => {
          if (name && typeof name === "object" && "svgPath" in name)
            return SVG.SVG(
              {
                attributes: semantic(context),
                viewBox: "0 0 24 24",
                width: 24,
                height: 24,
              },
              [
                SVG.Path({
                  attributes: semantic(context, "path"),
                  d: String(name.svgPath),
                }),
              ],
            );
          const mapped = aliases[String(name)] ?? String(name);
          return Icon({
            attributes: {
              ...semantic(context),
              role: "img",
              "aria-label": displayString(name),
            },
            name: getIconRegistry()[mapped] ? mapped : "circle-alert",
            size: 24,
          });
        },
        Object.is,
      );
      context.onCleanup(() => view.destroy?.());
      return view;
    },
    Divider: (context) =>
      View({
        attributes: {
          ...semantic(context),
          role: "separator",
          "aria-orientation": context.definition.axis ?? "horizontal",
        },
        style:
          context.definition.axis === "vertical"
            ? { borderLeft: "1px solid #d4d4d4", alignSelf: "stretch" }
            : { borderTop: "1px solid #d4d4d4" },
      }),
    Button: (context) =>
      PrimitiveButton(
        {
          attributes: {
            ...semantic(context),
            disabled: context.watch(() => context.errors().length > 0),
          },
          style: {
            backgroundColor:
              context.definition.variant === "primary"
                ? "var(--a2ui-primary)"
                : "transparent",
          },
          onClick: () => context.act(context.definition.action as Action),
        },
        [context.child(String(context.definition.child))],
      ),
    TextField: inputComponent,
    DateTimeInput: inputComponent,
    Slider: inputComponent,
    CheckBox: checkbox,
    ChoicePicker: choicePicker,
    Tabs: tabs,
    Modal: modal,
    ...options.components,
  };
  return {
    id: BASIC_CATALOG_ID,
    schema: basic_schema,
    components,
    functions: basicFunctions(options.onOpenUrl),
  };
}
