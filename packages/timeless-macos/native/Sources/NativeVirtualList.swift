import Cocoa
import JavaScriptCore

/// NSTableView supplies viewport tracking, row reuse, keyboard navigation and accessibility.
final class NativeVirtualList: NativeScrollView, NSTableViewDataSource, NSTableViewDelegate {
    let table = NSTableView()
    private weak var renderer: NativeViewRenderer?
    private var revision = -1
    private var cells: [Int: (cell: NSTableCellView, content: NSView, node: JSValue)] = [:]

    init(frame: NSRect, node: JSValue, renderer: NativeViewRenderer) {
        self.renderer = renderer
        super.init(frame: frame)
        bind(node)
        hasVerticalScroller = true
        hasHorizontalScroller = false
        autohidesScrollers = true
        drawsBackground = false
        table.style = .plain
        table.headerView = nil
        table.identifier = NSUserInterfaceItemIdentifier("virtual-list-table")
        if let label = node.forProperty("attrs")?.forProperty("aria-label"), label.isString {
            table.setAccessibilityLabel(label.toString())
        }
        table.backgroundColor = .clear
        table.intercellSpacing = .zero
        table.columnAutoresizingStyle = .uniformColumnAutoresizingStyle
        table.selectionHighlightStyle = .none
        table.addTableColumn(NSTableColumn(identifier: NSUserInterfaceItemIdentifier("virtual-list-column")))
        table.dataSource = self
        table.delegate = self
        documentView = table
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    func numberOfRows(in tableView: NSTableView) -> Int {
        max(0, Int(jsNode?.forProperty("rowCount")?.toInt32() ?? 0))
    }

    func tableView(_ tableView: NSTableView, heightOfRow row: Int) -> CGFloat {
        let height = jsNode?.forProperty("_rowHeight")?.call(withArguments: [row])?.toDouble() ?? 40
        return height.isFinite ? max(1, height) : 40
    }

    func tableView(_ tableView: NSTableView, viewFor tableColumn: NSTableColumn?, row: Int) -> NSView? {
        guard let node = jsNode?.forProperty("_renderRow")?.call(withArguments: [row]), node.isObject,
              let renderer = renderer,
              let content = renderer.buildListRow(node, width: contentSize.width, height: self.tableView(tableView, heightOfRow: row)) else { return nil }
        let identifier = NSUserInterfaceItemIdentifier("virtual-list-cell")
        let cell = tableView.makeView(withIdentifier: identifier, owner: self) as? NSTableCellView ?? NSTableCellView()
        cell.identifier = identifier
        cell.subviews.forEach { $0.removeFromSuperview() }
        cell.addSubview(content)
        cells[row] = (cell, content, node)
        return cell
    }

    func tableView(_ tableView: NSTableView, didRemove rowView: NSTableRowView, forRow row: Int) {
        guard let entry = cells[row], entry.cell.superview === rowView else { return }
        release(row)
    }

    private func release(_ row: Int) {
        cells.removeValue(forKey: row)
        jsNode?.forProperty("_releaseRow")?.call(withArguments: [row])
    }

    override func synchronizeDocument() {
        synchronizing = true
        defer { synchronizing = false; publishScrollMetrics() }
        let nextRevision = Int(jsNode?.forProperty("revision")?.toInt32() ?? 0)
        if revision != nextRevision {
            Array(cells.keys).forEach(release)
            revision = nextRevision
            table.reloadData()
        }
        if table.tableColumns.first?.width != contentSize.width { table.tableColumns.first?.width = max(0, contentSize.width) }
        let size = NSSize(width: contentSize.width, height: max(contentSize.height, CGFloat(jsNode?.forProperty("contentHeight")?.toDouble() ?? 0)))
        if table.frame.size != size { table.setFrameSize(size) }
        synchronizeScrollPosition()
        table.layoutSubtreeIfNeeded()
        for (row, entry) in cells {
            renderer?.layoutListRow(entry.node, view: entry.content, width: contentSize.width, height: self.tableView(table, heightOfRow: row))
        }
    }

    deinit { Array(cells.keys).forEach(release) }
}
