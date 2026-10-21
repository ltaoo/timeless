import { Button, View } from "@timeless/timeless";

export function TextView(name, content, className = "body-text") {
  return View({ class: className, attributes: { n: name } }, [content]);
}

export function Action(name, label, onClick, className = "button", props = {}) {
  return Button(
    {
      class: className,
      onClick,
      ...props,
      attributes: { n: name, "aria-label": label, ...props.attributes },
    },
    [label],
  );
}

export function Stack(name, children, className = "stack") {
  return View({ class: className, attributes: { n: name } }, children);
}

export function Section(name, title, description, children) {
  return Stack(
    name,
    [
      TextView(`${name}-title`, title, "section-title"),
      TextView(`${name}-description`, description, "muted"),
      ...children,
    ],
    "section",
  );
}
