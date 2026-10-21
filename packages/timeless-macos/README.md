# Timeless macOS

`@timeless/timeless-macos` 是 macOS 宿主入口，复用 `@timeless/timeless-native` 的节点、响应式行为和 native CSS 协议。AppKit、JavaScriptCore、Yoga 与窗口生命周期的 Swift 实现在 `native/`，从 `apps/macos-demo` 提取，示例继续共用这份宿主。

```js
import { render } from "@timeless/timeless-macos";
```

`Icon({ name, size, color })` 使用 primitive 的图标注册表渲染 SVG，支持自定义
`registerIcons()`、响应式属性和 HMR。默认 `currentColor` 跟随父级样式及明暗主题；
SVG 的固定颜色保留。未注册的名称继续使用 SF Symbols（例如 `house.fill`）。
SVG 由系统 `NSImage` 解码；已在 macOS 15.6 验证，最低版本 macOS 13 仍需实机验证。

在 macOS 上安装 Xcode 后，先构建应用 JS，再打包应用：

```bash
timeless-macos --bundle dist/app.js --output "build/My Application.app" \
  --name "My Application" --identifier com.example.application
```

命令使用本机 Swift Release 构建、复制 JS 和许可证、生成 Info.plist，并进行本地 ad-hoc 签名与校验。编译和签名成功后才替换旧产物。产物架构与当前 Mac 一致，最低系统版本 macOS 13；发布给其他用户前仍需 Developer ID 签名和公证。

开发时可在应用目录运行 `swift run --package-path <native目录> TimelessMacOS --dev`，宿主读取当前目录的 `dist/app.js`。生产应用读取 `.app/Contents/Resources/app.js`。

在仓库中验证宿主：

```bash
pnpm --filter @timeless/macos-demo build
TIMELESS_MACOS_TEST_BUNDLE="$PWD/apps/web-shadcn/dist/macos/app.js" \
  pnpm --filter @timeless/timeless-macos test:host
```

宿主能力和 CSS 子集沿用 [macOS 示例说明](../../apps/macos-demo/README.md)。`native` 是 Swift Package，不能在 OrbStack Linux 环境中编译 AppKit。
