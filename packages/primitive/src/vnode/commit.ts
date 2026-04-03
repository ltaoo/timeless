import type { HostRenderer, VNodePatch } from "./host-renderer";
import type { VNode } from "./types";

export function commitTree(root: VNode, renderer: HostRenderer) {
  renderer.createNode(root);
  if (root.kind === "element" || root.kind === "fragment") {
    for (const child of root.children) {
      commitTree(child, renderer);
      renderer.insertChild(root, child, null);
    }
  }
}

export function commitPatches(
  dirty: Set<VNode>,
  patches: Map<VNode, VNodePatch>,
  renderer: HostRenderer,
) {
  for (const vnode of dirty) {
    const patch = patches.get(vnode);
    if (patch) renderer.patchNode(vnode, patch);
  }
  dirty.clear();
  patches.clear();
}

