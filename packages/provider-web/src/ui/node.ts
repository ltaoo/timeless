import { ui } from "@timeless/core";

const { NodeCore } = ui;

export function connect(store: InstanceType<typeof NodeCore>, $node: HTMLElement) {
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
