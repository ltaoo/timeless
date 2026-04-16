import Cocoa

class AppDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow?

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupMainMenu()

        // Dev mode: pass --dev to load JS from dist/app.js and enable HMR
        let devScriptPath = resolveDevScriptPath()
        if devScriptPath != nil {
            print("[Dev] Running in dev mode with HMR")
        }

        let rootVC = RootViewController(devScriptPath: devScriptPath)

        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 800, height: 560),
            styleMask: [.titled, .closable, .resizable, .miniaturizable],
            backing: .buffered,
            defer: false
        )
        window?.title = devScriptPath != nil
            ? "Timeless macOS Demo [DEV]"
            : "Timeless macOS Demo"
        window?.contentViewController = rootVC
        window?.center()
        window?.makeKeyAndOrderFront(nil)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }

    /// Check for `--dev` flag. Returns path to `dist/app.js` relative to working directory.
    private func resolveDevScriptPath() -> String? {
        let args = ProcessInfo.processInfo.arguments
        guard args.contains("--dev") else { return nil }

        let cwd = FileManager.default.currentDirectoryPath
        let distPath = (cwd as NSString).appendingPathComponent("dist/app.js")

        guard FileManager.default.fileExists(atPath: distPath) else {
            print("[Dev] Warning: dist/app.js not found at \(distPath)")
            print("[Dev] Run 'pnpm run dev' first to start the Vite watcher.")
            return nil
        }

        return distPath
    }

    private func setupMainMenu() {
        let mainMenu = NSMenu()

        // App menu
        let appMenuItem = NSMenuItem()
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "Quit", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appMenuItem.submenu = appMenu
        mainMenu.addItem(appMenuItem)

        // Edit menu — required for ⌘A, ⌘C, ⌘V, ⌘X, ⌘Z in text fields
        let editMenuItem = NSMenuItem()
        let editMenu = NSMenu(title: "Edit")
        editMenu.addItem(withTitle: "Undo", action: Selector(("undo:")), keyEquivalent: "z")
        editMenu.addItem(withTitle: "Redo", action: Selector(("redo:")), keyEquivalent: "Z")
        editMenu.addItem(NSMenuItem.separator())
        editMenu.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        editMenuItem.submenu = editMenu
        mainMenu.addItem(editMenuItem)

        NSApplication.shared.mainMenu = mainMenu
    }
}
