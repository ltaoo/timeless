export function update_arr_item<T>(arr: T[], index: number, v2: T) {
  if (index === -1) {
    return [...arr];
  }
  return [...arr.slice(0, index), v2, ...arr.slice(index + 1)];
}
export function remove_arr_item<T>(arr: T[], index: number) {
  if (index === -1) {
    return [...arr];
  }
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}
