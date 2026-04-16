let _current_hot: any = null;

export function hmrScope(hot: any) {
  _current_hot = hot;
  if (hot && !hot.data.__hmr_refs) {
    hot.data.__hmr_refs = {};
  }
}

export function __hmr_get_hot(): any {
  return _current_hot;
}
