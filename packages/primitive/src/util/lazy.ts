export function lazy(path: string) {
  const fn = () => import(path).then((m) => m.default);
  (fn as any).__hmr_path = path;
  return fn;
}
