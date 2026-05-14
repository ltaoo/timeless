# Reactive API 完整参考

Timeless 响应式系统所有 API 的详细说明。这些函数均为全局变量，无需 import。

---

## `ref(value)` — 基本响应式值

```js
const v = ref(initialValue);
```

### 属性

| 属性/方法 | 签名 | 说明 |
|----------|------|------|
| `value` | `get value(): T` | 读取当前值（不触发订阅） |
| `__is_ref` | `true` | 类型标记 |

### 写入方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `set(value)` | `(v: T) => void` | 设置新值，触发 `"refresh"` 通知 |
| `as(value)` | `(v: T \| ((cur: T) => T), extra?) => void` | 同 set，支持 updater 函数 |
| `update(fn)` | `(fn: (current: T) => T) => void` | 通过函数更新 |
| `reset()` | `() => void` | 恢复初始值 |
| `toggle()` | `() => boolean` | 布尔翻转，返回新值 |
| `increment(amount?)` | `(amount?: number) => number` | +amount（默认+1） |
| `decrement(amount?)` | `(amount?: number) => number` | -amount（默认-1） |
| `append(suffix)` | `(suffix: string) => string` | 字符串末尾拼接 |
| `prepend(prefix)` | `(prefix: string) => string` | 字符串开头拼接 |
| `clear()` | `() => void` | 重置为空值（"" / 0 / false / [] / null） |

### 订阅方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `subscribe(ctx)` | `(ctx: Subscriber<T>) => () => void` | 注册订阅者，返回取消函数 |
| `destroy()` | `() => void` | 清除所有订阅者 |

```js
// Subscriber 类型
{
  onChange(v, extra?) {},  // 值变化时调用
  onPatch?(action, extra?) {}, // 增量更新时调用（数组/对象）
  ignore?: boolean,
}
```

### 比较方法

| 方法 | 说明 |
|------|------|
| `eq(v)` | `===` 比较 |
| `isSame(v)` | `Object.is()` 比较 |
| `isStrictEqual(v)` | `===` 比较 |
| `lt(v)` | 小于比较（支持 unwrap ref） |
| `gt(v)` | 大于比较（支持 unwrap ref） |
| `isNullish()` | `value === null \|\| value === undefined` |
| `clone()` | `JSON.parse(JSON.stringify(value))` 深拷贝 |

### 调试方法

| 方法 | 说明 |
|------|------|
| `getDeps()` | 返回订阅者元信息数组 |
| `dump()` | console.log 订阅者信息 |
| `diff(v)` | no-op（占位） |

---

## `reactiveArray(items)` / `refArray(items)` / `refarr(items)`

响应式数组包装器，继承 `ref()` 的所有方法，并添加数组专属 API。

```js
const list = reactiveArray([1, 2, 3]);
// 别名: refArray([1,2,3]), refarr([1,2,3])
```

### 数组专属属性

| 属性/方法 | 签名 | 通知类型 |
|----------|------|---------|
| `length` | `get length(): number` | — |
| `key` | `unknown`（可选标识） | — |

### 增量更新方法（触发 onPatch）

| 方法 | 签名 | Patch 类型 |
|------|------|-----------|
| `push(...items)` | `(...items: T[]) => number` | `"insert"` at end |
| `insert(idx, ...items)` | `(idx: number, ...items: T[]) => number` | `"insert"` |
| `unshift(...items)` | `(...items: T[]) => number` | `"insert"` at 0 |
| `prepend(...items)` | unshift 别名 | `"insert"` at 0 |
| `pop()` | `() => T \| undefined` | `"delete"` at last |
| `shift()` | `() => T \| undefined` | `"delete"` at 0 |
| `delete(idx)` | `(idx: number) => void` | `"delete"` |
| `remove(item)` | `(item: T) => void` | `"delete"`（移除首个匹配） |
| `set(idx, item)` | `(idx: number, item: T) => void` | `"update"` |
| `move(from, to)` | `(from: number, to: number) => RefArray<T>` | `"move"` |
| `swap(a, b)` | `(a: number, b: number) => RefArray<T>` | `"swap"` |
| `up(idx)` / `down(idx)` | `(idx: number) => RefArray<T>` | `"move"` |
| `moveToFirst(idx)` / `moveToLast(idx)` | `(idx: number) => RefArray<T>` | `"move"` |

### 整体替换方法（触发 onChange "refresh"）

| 方法 | 签名 |
|------|------|
| `as(items)` | `(items: T[] \| ((cur: T[]) => T[]), opt?) => void` |
| `assign(items)` | `(items: T[]) => void` |
| `splice(idx, dcount, ...items)` | `(idx: number, dcount: number, ...items: T[]) => T[]` |
| `reverse()` | `() => RefArray<T>` |
| `sort(fn?)` | `(compareFn?: (a,b) => number) => RefArray<T>` |
| `fill(value, start?, end?)` | `(value: T, start?, end?) => RefArray<T>` |
| `copyWithin(target, start, end?)` | `(target, start, end?) => RefArray<T>` |
| `shuffle()` | `() => RefArray<T>` |
| `rotate(n)` | `(n: number) => RefArray<T>` |
| `clear()` | `() => void` |
| `removeBy(predicate)` | `(predicate: (item: T) => boolean) => void` |
| `replace(oldItem, newItem)` | `(oldItem: T, newItem: T) => boolean` |
| `toggle(item)` | `(item: T) => RefArray<T>`（有则删，无则加） |
| `refresh()` | `() => void`（手动重通知） |

### 只读查询方法（标准数组方法）

| 方法 | 说明 |
|------|------|
| `get(idx)` | 返回 `T \| undefined` |
| `at(idx)` | 支持负索引 |
| `first()` / `last()` | 首/末元素 |
| `nth(n)` | 第 n 个（支持负数） |
| `filter(fn)` | 返回数组（非响应式） |
| `map(fn)` | 返回数组（非响应式） |
| `find(fn)` | 返回 T / null，自动 unwrap ref |
| `findIndex(fn)` | 返回索引 |
| `includes(v)` | 是否包含 |
| `indexOf(v)` | 返回索引（支持查找 ref 中的对象） |
| `some(fn)` / `every(fn)` | 布尔 |
| `forEach(fn)` | 遍历 |
| `reduce(fn, init?)` / `reduceRight(fn, init?)` | 聚合 |
| `slice(start?, end?)` / `concat(...)` | 副本 |
| `join(sep?)` | 字符串 |
| `flat(depth?)` / `flatMap(fn)` | 展平 |
| `entries()` / `keys()` / `values()` | 迭代器 |
| `[Symbol.iterator]()` | 可迭代 |

### 扩展查询方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `count(fn?)` | `(predicate?: (item) => boolean) => number` | 计数 |
| `distinct(fn?)` | `(keyFn?: (item) => any) => T[]` | 去重 |
| `groupBy(fn)` | `(keyFn: (item) => any) => Record<string, T[]>` | 分组 |
| `chunk(size)` | `(size: number) => T[][]` | 分块 |
| `partition(fn)` | `(fn: (item) => boolean) => [T[], T[]]` | 二分 |
| `intersect(other)` | `(other: T[]) => T[]` | 交集 |
| `union(...others)` | `(...others: T[][]) => T[]` | 并集 |
| `symmetricDiff(other)` | `(other: T[]) => T[]` | 对称差 |
| `sum(fn?)` | `(fn?: (item) => number) => number` | 求和 |
| `min(fn?)` / `max(fn?)` | `(fn?: (item) => number) => T \| undefined` | 极值 |
| `compact()` | `() => T[]` | 移除 falsy |
| `take(n)` / `skip(n)` | `(n: number) => T[]` | 取/跳前 n 个 |
| `isEmpty()` | `() => boolean` | 是否为空 |
| `toArray()` | `() => T[]` | 浅拷贝 |

---

## `reactiveObject(obj)` / `refObject(obj)` / `refobj(obj)`

响应式对象包装器。

```js
const obj = reactiveObject({ a: 1, b: 2 });
// 别名: refObject({...}), refobj({...})
```

### 属性与方法

| 属性/方法 | 签名 | 说明 |
|----------|------|------|
| `value` | `get value(): T` | 读取当前值 |
| `set(key, v)` | `(key: K, v: T[K] \| ((cur) => T[K])) => void` | 设键值 |
| `get(key)` | `(key: K) => unknown` | 读键值（嵌套对象返回 ref） |
| `delete(key)` | `(key: K) => void` | 删除键 |
| `update(key, fn)` | `(key: K, fn: (cur) => T[K]) => void` | 通过函数更新 |
| `as(obj)` | `(obj: T \| ((cur) => T), extra?) => void` | 整体替换 |
| `assign(partial)` | `(partial: Partial<T>) => void` | 浅合并 |
| `merge(source)` | `(source: Partial<T>) => void` | 深合并（递归合并嵌套对象） |
| `refresh()` | `() => void` | 手动重通知 |
| `has(key)` | `(key: string) => boolean` | 检查键 |
| `keys()` | `() => (keyof T)[]` | 键数组 |
| `values()` | `() => T[keyof T][]` | 值数组 |
| `entries()` | `() => [keyof T, T[keyof T]][]` | 键值对数组 |
| `isEmpty()` | `() => boolean` | 是否为空 |
| `size()` | `() => number` | 键数量 |
| `pick(...keys)` | `(...keys: K[]) => Pick<T, K>` | 选取 |
| `omit(...keys)` | `(...keys: K[]) => Omit<T, K>` | 排除 |
| `toggle(key)` | `(key: K) => void` | 布尔键翻转 |
| `increment(key, n?)` | `(key: K, amount?: number) => void` | 数值键增加 |
| `decrement(key, n?)` | `(key: K, amount?: number) => void` | 数值键减少 |
| `clear()` | `() => void` | 清空所有键 |
| `clone()` | `() => T` | JSON 深拷贝 |
| `mapValues(fn)` | `(fn: (v, k) => U) => Record<string, U>` | 映射值 |
| `renameKey(old, new)` | `(oldKey: string, newKey: string) => void` | 重命名 |
| `getIn(path)` | `(path: string) => unknown` | 点分隔路径访问（如 `"a.b.c"`） |
| `setIn(path, v)` | `(path: string, v: unknown) => void` | 点分隔路径设值 |
| `hasIn(path)` | `(path: string) => boolean` | 路径是否存在 |
| `diff(v)` | `(v: T) => void` | 浅比较，只更新变化的键 |
| `subscribe(ctx)` | `(ctx: Subscriber<T>) => () => void` | 订阅（同 ref） |
| `destroy()` | `() => void` | 清除所有订阅 |

### Nullable 变体

```js
const obj = reactiveObject(null);  // TimelessRefObjectNullable<T>
// 额外支持：as(null), clone() 返回 T|null, value 为 T|null
```

---

## `computed(deps, fn, options?)` — 派生值

```js
// 单 ref 依赖 — fn 接收 .value
const double = computed(count, (v) => v * 2);

// 对象依赖 — fn 接收已 unwrap 的对象
const sum = computed({ a: refA, b: refB }, (d) => d.a + d.b);

// 选项
const debounced = computed({ a, b }, (d) => d.a + d.b, { debounce: 300 });
const throttled = computed({ a, b }, (d) => d.a + d.b, { throttle: 100 });
```

### ComputedOptions

| 选项 | 类型 | 说明 |
|------|------|------|
| `debounce` | `number` | 防抖毫秒（与 throttle 同时存在时优先生效） |
| `throttle` | `number` | 节流毫秒 |

### 返回的 DerivedRef

| 属性/方法 | 说明 |
|----------|------|
| `__is_ref: true` | 类型标记 |
| `value` | 当前计算结果（只读） |
| `subscribe(ctx)` | 订阅变化，返回取消函数 |
| `destroy()` | 取消订阅源 + 清除自身订阅 + 从 registry 移除 |
| `isSame(v)` / `isStrictEqual(v)` | 比较 |

**注意：** `DerivedRef` 是**只读**的，没有 `set()`、`as()`、`update()` 方法。

### 变化检测

- 每次依赖变化后重新计算 `fn`，结果用 `===` 比较
- 相同则**不通知**订阅者（避免无意义重渲染）

---

## `derive(deps, fn, options?)` / `combine(deps, fn, options?)`

多源派生，`combine` 是 `derive` 的别名。

```js
// 数组 deps — 展开为位置参数
const total = derive([refA, refB, refC], (a, b, c) => a + b + c);

// 对象 deps — 作为单个对象传入
const total = combine({ a: refA, b: refB }, (d) => d.a + d.b);
```

行为与 `computed` 相同，返回 `DerivedRef`，支持 `debounce` / `throttle` 选项。

---

## `signal(value)` — 自动检测类型

```js
signal(0);            // 数字 → PrimitiveSignal (Ref)
signal("hello");      // 字符串 → PrimitiveSignal (Ref)
signal(true);         // 布尔 → PrimitiveSignal (Ref)
signal({ a: 1 });     // 对象 → ObjectSignal (RefObject)
signal([1, 2, 3]);    // 数组 → ArraySignal (RefArray)
signal(existingRef);  // 已是 ref → 原样返回
```

内部使用全局 registry 缓存：同一原始对象/数组多次调用 `signal()` 返回相同 wrapper。

---

## `release(ref)` / `release_all()` — 清理 Registry

```js
release(someRef);      // 从全局 registry 移除指定 ref
release_all();         // 清空整个全局 registry
```

**注意：** `release()` 不调用 `destroy()`，只移除 registry 条目。需要彻底清理时先调 `ref.destroy()`。

---

## `defineModel(model)` — ViewModel 模式

```js
const vm = defineModel({
  state: {
    count: ref(0),
    name: ref(""),
  },
  methods: {
    increment() {
      this.state.count.update(v => v + 1);
    },
    setName(name) {
      this.state.name.as(name);
    },
  },
  handlers: {
    // 可选：事件处理器
  },
  services: {
    // 可选：服务注入
  },
  listeners: [
    // 可选：外部取消订阅函数数组
  ],
});
```

### 返回的 TimelessViewModel

| 属性/方法 | 说明 |
|----------|------|
| `state` | 原始 state 对象（ref 值） |
| `methods` | 包装后的方法（自动 emit 事件 + 错误捕获） |
| `handlers` | 透传的 handlers |
| `services` | 透传的 services |
| `onStateChange(listener)` | 订阅状态变化（microtask 批处理），返回 unlisten |
| `onError(handler)` | 订阅方法错误 |
| `ready(handler)` | 下一个 microtask 时调用 |
| `onDestroy(handler)` / `destroy()` | 销毁生命周期 |
| `onMethodName(handler)` | 每个方法自动生成的事件（如 `onIncrement`） |

---

## 类型守卫

| 函数 | 说明 |
|------|------|
| `isRef(v)` | 是否为 ref 或 derivedRef |
| `isWriteableRef(v)` | 是否为可写 ref（有 `as` 方法） |
| `isArrayRef(v)` | 是否为响应式数组（`__is_ref_array: true`） |

---

## 订阅通知类型

| Action Type | 触发场景 | Subscriber 回调 |
|------------|---------|----------------|
| `"refresh"` | set, as, update, toggle, reset, clear, splice, assign, reverse, sort 等 | `onChange(value)` |
| `"insert"` | push, insert, unshift | `onPatch({ type, index, items })` |
| `"delete"` | pop, shift, delete, remove | `onPatch({ type, index, deleteCount })` |
| `"update"` | set (array index), set (object key) | `onPatch({ type, index, item })` |
| `"move"` | move, up, down | `onPatch({ type, from, to })` |
| `"swap"` | swap | `onPatch({ type, from, to })` |

- 如果 subscriber 有 `onPatch`：非 `"refresh"` action 调 `onPatch`，其他调 `onChange`
- 如果 subscriber 无 `onPatch`：所有 action 调 `onChange`
