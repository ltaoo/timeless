# Web Timeless

这是 `apps/web-solid` 的 Timeless 重写版本。应用直接使用：

- `@timeless/timeless`：响应式状态、视图节点和图标；
- `@timeless/timeless-dom`：DOM 渲染器；
- `@timeless/shadcn`：按钮、输入框、卡片、徽标、提示和表单视觉层。

旧 SolidJS 目录保留为历史业务参考，不参与本应用构建。

```bash
pnpm --filter @timeless/web-timeless build
pnpm --filter @timeless/web-timeless dev
pnpm --filter @timeless/web-timeless test
```

## 回归状态

非浏览器测试覆盖请求鉴权、JSON 序列化、HTTP/业务错误、业务接口路径，以及分页响应解析。测试通过不代表实际后端或浏览器交互已经验证。

手动验收：登录/注册（含回车提交）、搜索、刷新/加载更多、复制/删除及提示、文本/图片/文件预览、主题切换、WebDAV 连接与双向同步、前进/后退和移动端导航。

本应用目前仍是迁移中的独立入口，不替换旧入口。功能一致性尚未完成验收：旧版 Wails 实时剪贴板事件、键盘选择、文件下载/本地文件操作及完整设置编辑仍需继续迁移；预览接口在真实后端中的返回语义也需核对。不要仅凭 mock 测试将本入口标为完整替代版本。
