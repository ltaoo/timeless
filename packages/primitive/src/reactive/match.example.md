# Match 组件使用示例

Match 组件是一个响应式的多分支渲染容器，类似于 Show 组件，但支持多个条件分支。

## API

```typescript
type MatchProps = {
  when: Ref<any> | any;                    // 要匹配的值
  cases: Record<string | number, () => ViewChildren>;  // 分支映射
  fallback?: () => ViewChildren;           // 默认分支（当没有匹配时）
  onMounted?: ($fg: any) => void;
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};
```

## 基本用法

```typescript
import { Match, ref } from '@timeless/timeless';

const status = ref('loading');

Match({
  when: status,
  cases: {
    'loading': () => View({ text: 'Loading...' }),
    'success': () => View({ text: 'Success!' }),
    'error': () => View({ text: 'Error occurred' })
  },
  fallback: () => View({ text: 'Unknown status' })
})
```

## 与 Show 组件对比

### Show 组件（二分支）
```typescript
Show({
  when: isLoggedIn,
  ok: () => View({ text: 'Welcome!' }),
  else: () => View({ text: 'Please login' })
})
```

### Match 组件（多分支）
```typescript
Match({
  when: userRole,
  cases: {
    'admin': () => AdminPanel(),
    'user': () => UserPanel(),
    'guest': () => GuestPanel()
  },
  fallback: () => View({ text: 'Invalid role' })
})
```

## 特性

1. **响应式切换** - 当 `when` 值变化时，自动切换到对应分支
2. **生命周期管理** - 切换分支时，旧内容会调用 `beforeUnmounted` 和 `onUnmounted`，新内容会调用 `onMounted`
3. **类型安全** - cases 的 key 支持 string 和 number 类型
4. **fallback 支持** - 当没有匹配的分支时，使用 fallback

## 数字匹配示例

```typescript
const count = ref(1);

Match({
  when: count,
  cases: {
    0: () => View({ text: 'Zero' }),
    1: () => View({ text: 'One' }),
    2: () => View({ text: 'Two' })
  },
  fallback: () => View({ text: 'Many' })
})
```

## 动态切换示例

```typescript
const theme = ref('light');

// 点击按钮切换主题
Button({
  text: 'Toggle Theme',
  onClick: () => {
    theme.value = theme.value === 'light' ? 'dark' : 'system';
  }
})

Match({
  when: theme,
  cases: {
    'light': () => View({
      style: { background: 'white', color: 'black' },
      text: 'Light Theme'
    }),
    'dark': () => View({
      style: { background: 'black', color: 'white' },
      text: 'Dark Theme'
    }),
    'system': () => View({
      style: { background: 'gray', color: 'white' },
      text: 'System Theme'
    })
  }
})
```
