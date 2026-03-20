export function lazy(path: string) {
  return () => import(path).then((m) => m.default);
}
