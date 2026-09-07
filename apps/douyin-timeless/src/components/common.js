export function GlyphView(props) {
  const { glyph, class: class_name = "", ...rest } = props;
  return View(
    {
      ...rest,
      as: "span",
      class: `glyph ${class_name}`.trim(),
      attributes: { "aria-hidden": "true" },
    },
    [glyph],
  );
}

export function BackButtonView(props) {
  return View(
    {
      class: `round-icon-button ${props.class || ""}`.trim(),
      attributes: { role: "button", "aria-label": "返回" },
      onClick(event) {
        event.stopPropagation();
        props.onClick();
      },
    },
    [GlyphView({ glyph: "‹", class: "back-glyph" })],
  );
}

export function PageHeaderView(props, children = []) {
  return View({ class: `page-header ${props.class || ""}`.trim() }, [
    props.onBack
      ? BackButtonView({ class: "page-header-back", onClick: props.onBack })
      : View({ class: "page-header-spacer" }),
    View({ class: "page-header-title" }, [props.title]),
    View({ class: "page-header-actions" }, children),
  ]);
}

export function AvatarView(props) {
  return Img({
    class: `avatar ${props.class || ""}`.trim(),
    src: props.src,
    alt: props.alt || "头像",
    loading: props.loading || "eager",
  });
}

export function EmptyStateView(props) {
  return View({ class: "empty-state" }, [
    View({ class: "empty-state-icon" }, [props.icon || "⌁"]),
    View({ class: "empty-state-title" }, [props.title]),
    View({ class: "empty-state-text" }, [props.text || ""]),
  ]);
}
