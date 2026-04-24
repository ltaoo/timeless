export type Destroyable = {
  destroy: () => void;
};

type DestroyableRegistrar = (destroyable: Destroyable) => void;

let register_destroyable_with_owner: DestroyableRegistrar | null = null;

export function setDestroyableRegistrar(
  registrar: DestroyableRegistrar | null,
): void {
  register_destroyable_with_owner = registrar;
}

export function registerDestroyable<T extends Destroyable>(destroyable: T): T {
  register_destroyable_with_owner?.(destroyable);
  return destroyable;
}
