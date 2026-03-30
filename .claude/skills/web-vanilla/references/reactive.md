# 响应式 API

## ref

```js
const count = ref(0);
count.value; // 读取
count.as(5); // 设置
```

## refobj

```js
const user = refobj({ name: "Tom", age: 18 });
user.value.name; // 读取
user.as({ name: "Jerry" }); // 整体更新
```

## refarr

```js
const list = refarr([1, 2, 3]);
list.push(4); // 添加
list.splice(0, 1); // 删除
list.value; // 读取
```

## computed

```js
const double = computed(count, (v) => v * 2);
const fullName = computed([firstName, lastName], (f, l) => f + " " + l);
```

## effect

```js
effect(() => {
  console.log("count changed:", count.value);
});
```
