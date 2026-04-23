import { createContext, use } from "@/context";
import { TimelessElement } from "@/content/type";

export type ErrorBoundaryHandler = {
  handle(error: unknown): (TimelessElement | null)[];
  reset(): void;
};

const ErrorBoundaryContext = createContext<ErrorBoundaryHandler | null>(
  "error_boundary",
  null,
);

export function useErrorBoundary() {
  return use(ErrorBoundaryContext);
}

export { ErrorBoundaryContext };
