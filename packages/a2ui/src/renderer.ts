import { ObjectFieldCore, SingleFieldCore } from "@timeless/ui-vm";

import { UINode, StreamOp, ResolvedNode } from "./types";
import { resolveNode } from "./schema-resolver";

/**
 * A2UIRenderer — incremental rendering engine.
 *
 * Each container node maintains a `refArray` for its children.
 * When a new node is appended, `push()` on the parent's refArray
 * triggers the `For` component to incrementally insert DOM.
 */
export class A2UIRenderer {
  nodeMap = new Map<string, ResolvedNode>();
  private _rootElement: any = null;
  private _fields: SingleFieldCore<any>[] = [];
  private _form$: ObjectFieldCore<any> | null = null;
  private _doneCallbacks: Array<() => void> = [];

  get rootElement() {
    return this._rootElement;
  }

  get form$() {
    return this._form$;
  }

  /**
   * Create the root node from a UINode.
   */
  createRoot(node: UINode): any {
    const resolved = resolveNode(node);
    this.nodeMap.set(node.id, resolved);

    // Collect field if present
    if (resolved.field$) {
      this._fields.push(resolved.field$);
    }

    // Recursively resolve children
    if (node.children && resolved.children$) {
      for (const child of node.children) {
        this._resolveAndAppend(resolved, child);
      }
    }

    this._rootElement = resolved.element;
    return resolved.element;
  }

  /**
   * Append a node to a parent container.
   */
  append(parentId: string, node: UINode) {
    const parent = this.nodeMap.get(parentId);
    if (!parent || !parent.children$) {
      console.warn(`[a2ui] Cannot append to "${parentId}": not a container or not found.`);
      return;
    }
    this._resolveAndAppend(parent, node);
  }

  /**
   * Insert a node at a specific index in a parent container.
   */
  insert(parentId: string, index: number, node: UINode) {
    const parent = this.nodeMap.get(parentId);
    if (!parent || !parent.children$) {
      console.warn(`[a2ui] Cannot insert into "${parentId}": not a container or not found.`);
      return;
    }
    const resolved = resolveNode(node);
    resolved.parentId = parentId;
    this.nodeMap.set(node.id, resolved);

    if (resolved.field$) {
      this._fields.push(resolved.field$);
    }

    parent.children$.insert(index, resolved.element);

    // Recursively resolve children
    if (node.children && resolved.children$) {
      for (const child of node.children) {
        this._resolveAndAppend(resolved, child);
      }
    }
  }

  /**
   * Update an existing node's props/state.
   */
  update(nodeId: string, props: Record<string, any>) {
    const resolved = this.nodeMap.get(nodeId);
    if (!resolved) {
      console.warn(`[a2ui] Cannot update "${nodeId}": not found.`);
      return;
    }

    // Update field-level props
    if (resolved.field$) {
      if (props.label !== undefined) {
        // SingleFieldCore doesn't have setLabel, but we can update internal state
        (resolved.field$ as any)._label = props.label;
      }
      if (props.hidden !== undefined) {
        props.hidden ? resolved.field$.hide() : resolved.field$.show();
      }
    }

    // Update input core value
    if (resolved.core && props.value !== undefined && "setValue" in resolved.core) {
      (resolved.core as any).setValue(props.value);
    }

    // Merge new props into schema
    resolved.schema.props = { ...resolved.schema.props, ...props };
  }

  /**
   * Remove a node from its parent.
   */
  remove(nodeId: string) {
    const resolved = this.nodeMap.get(nodeId);
    if (!resolved) {
      console.warn(`[a2ui] Cannot remove "${nodeId}": not found.`);
      return;
    }

    // Remove from parent's children$
    if (resolved.parentId) {
      const parent = this.nodeMap.get(resolved.parentId);
      if (parent?.children$) {
        parent.children$.remove(resolved.element);
      }
    }

    // Remove field from collection
    if (resolved.field$) {
      const idx = this._fields.indexOf(resolved.field$);
      if (idx !== -1) {
        this._fields.splice(idx, 1);
      }
    }

    // Clean up children recursively
    this._removeChildren(nodeId);
    this.nodeMap.delete(nodeId);
  }

  /**
   * Finalize: collect all fields and assemble an ObjectFieldCore form.
   */
  finalize(): ObjectFieldCore<any> | null {
    if (this._fields.length === 0) {
      return null;
    }

    const fields: Record<string, SingleFieldCore<any>> = {};
    for (const field of this._fields) {
      const key = field.name || field.id;
      if (key) {
        fields[key] = field;
      }
    }

    this._form$ = new ObjectFieldCore({ fields });
    return this._form$;
  }

  /**
   * Apply a batch of stream operations.
   */
  applyOps(ops: StreamOp[]) {
    for (const op of ops) {
      this.applyOp(op);
    }
  }

  /**
   * Apply a single stream operation.
   */
  applyOp(op: StreamOp) {
    switch (op.op) {
      case "root":
        this.createRoot(op.node);
        break;
      case "append":
        this.append(op.parentId, op.node);
        break;
      case "insert":
        this.insert(op.parentId, op.index, op.node);
        break;
      case "update":
        this.update(op.nodeId, op.props);
        break;
      case "delete":
        this.remove(op.nodeId);
        break;
      case "done":
        this.finalize();
        this._fireDone();
        break;
    }
  }

  /**
   * Register a done callback.
   */
  onDone(cb: () => void) {
    this._doneCallbacks.push(cb);
  }

  /**
   * Destroy the renderer and clean up.
   */
  destroy() {
    this.nodeMap.clear();
    this._fields = [];
    this._form$ = null;
    this._doneCallbacks = [];
  }

  // --- Private helpers ---

  private _resolveAndAppend(parent: ResolvedNode, childNode: UINode) {
    const resolved = resolveNode(childNode);
    resolved.parentId = parent.id;
    this.nodeMap.set(childNode.id, resolved);

    if (resolved.field$) {
      this._fields.push(resolved.field$);
    }

    parent.children$.push(resolved.element);

    // Recursively resolve children
    if (childNode.children && resolved.children$) {
      for (const child of childNode.children) {
        this._resolveAndAppend(resolved, child);
      }
    }
  }

  private _removeChildren(nodeId: string) {
    for (const [id, resolved] of this.nodeMap) {
      if (resolved.parentId === nodeId) {
        if (resolved.field$) {
          const idx = this._fields.indexOf(resolved.field$);
          if (idx !== -1) {
            this._fields.splice(idx, 1);
          }
        }
        this._removeChildren(id);
        this.nodeMap.delete(id);
      }
    }
  }

  private _fireDone() {
    for (const cb of this._doneCallbacks) {
      cb();
    }
  }
}
