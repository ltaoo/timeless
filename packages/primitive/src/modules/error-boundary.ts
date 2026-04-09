import { View } from "@/content/view";
import { TimelessElement } from "@/content/type";

export type ErrorFallbackFn = (
  error: Error,
  viewName: string,
) => TimelessElement;

export function defaultErrorView(
  error: Error,
  viewName: string,
): TimelessElement {
  return View(
    {
      style: {
        padding: "16px",
        margin: "8px",
        border: "1px solid #ef4444",
        "border-radius": "8px",
        background: "#fef2f2",
        color: "#991b1b",
        "font-family": "monospace",
      },
    },
    [
      View(
        {
          as: "div",
          style: {
            margin: "0 0 8px 0",
            "font-size": "14px",
            "font-weight": "bold",
          },
        },
        [`Error in "${viewName}"`],
      ),
      View(
        {
          as: "pre",
          style: {
            margin: "0",
            "font-size": "12px",
            "white-space": "pre-wrap",
            "word-break": "break-word",
          },
        },
        [error.message],
      ),
    ],
  );
}

export function withErrorBoundary(
  createView: () => TimelessElement,
  viewName: string,
  ErrorFallback?: ErrorFallbackFn,
): TimelessElement {
  const renderError = ErrorFallback || defaultErrorView;
  let element: TimelessElement;
  try {
    element = createView();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`[ErrorBoundary] Error creating "${viewName}":`, error);
    return renderError(error, viewName);
  }
  // const originalRender = element.render;
  // element.render = function () {
  //   try {
  //     return originalRender.call(element);
  //   } catch (err) {
  //     const error = err instanceof Error ? err : new Error(String(err));
  //     console.error(`[ErrorBoundary] Error rendering "${viewName}":`, error);
  //     const errorView = renderError(error, viewName);
  //     const result = errorView.render();
  //     if (element.$elm.parentNode) {
  //       element.$elm.parentNode.replaceChild(errorView.$elm, element.$elm);
  //     }
  //     element.$elm = errorView.$elm;
  //     return result;
  //   }
  // };
  return element;
}
