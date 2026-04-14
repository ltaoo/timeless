import { NodeCore } from "@timeless/ui-vm";

export function connect(store: NodeCore, $node: HTMLElement) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          store.handleShow();
          io.unobserve($node);
        }
      });
    },
    { threshold: 0.4 },
  );
  io.observe($node);
}
