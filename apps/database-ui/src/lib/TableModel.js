// ============================================================
// TableColumnModel — pure model for table column layout.
//
//              ┌──────────────────────────────────┐
//              │        TableColumnModel           │
//              │                                  │
//              │  widths_ (refarr)  ─── gridTemplate_ (computed)
//              │       │             ─── totalWidth_ (computed)
//              │       │             ─── stickyLefts_ (computed)
//              │       │                          │
//              │       ▼                          │
//              │  resizeColumn()                  │
//              │    └─ widths_.as(arr)            │
//              │         └─ _syncGrids()  ◄────── │  post-hook on .as()
//              │              │                   │
//              │   _gridEls[] ─┘                  │
//              │   registerGrid(el)               │
//              │   unregisterGrid(el)             │
//              └──────────────────────────────────┘
//
// Views only READ reactive values. The model internally guarantees
// that all registered grid DOM elements stay in sync by intercepting
// the widths_.as() mutation point. No view-framework subscriptions needed.
// ============================================================

/**
 * @param {Array} columns — array of { name: string, type: string, ... }
 * @param {Object} [opts]
 * @param {number} [opts.rowNumberWidth=48]
 * @param {number} [opts.defaultWidth=150]
 * @param {number} [opts.minWidth=50]
 * @param {string[]} [opts.leftFixed] — column names to pin to the left
 * @param {string[]} [opts.rightFixed] — column names to pin to the right
 */
function createTableColumnModel(columns, opts) {
  if (!opts) opts = {};

  var MIN_W = opts.minWidth || 50;
  var DEFAULT_W = opts.defaultWidth || 150;
  var ROW_NUM_W = opts.rowNumberWidth || 48;
  var LEFT_FIXED_NAMES = opts.leftFixed || [];
  var RIGHT_FIXED_NAMES = opts.rightFixed || [];

  var colCount = columns.length;

  // ============================================================
  // Width state — index 0 = row number, indices 1..N = data cols
  // ============================================================
  var widths = [ROW_NUM_W];
  for (var ci = 0; ci < colCount; ci++) widths.push(DEFAULT_W);
  var widths_ = refarr(widths);

  // ============================================================
  // Computed values
  // ============================================================
  var gridTemplate_ = computed(widths_, function (arr) {
    var parts = new Array(arr.length);
    for (var i = 0; i < arr.length; i++) parts[i] = arr[i] + "px";
    return parts.join(" ");
  });

  var totalWidth_ = computed(widths_, function (arr) {
    var sum = 0;
    for (var i = 0; i < arr.length; i++) sum += arr[i];
    return sum;
  });

  var totalWidthPx_ = computed(totalWidth_, function (w) { return w + "px"; });

  // ============================================================
  // Fixed column detection
  // ============================================================
  // Left-fixed always includes row number column (gridIdx 0)
  var leftFixedByGridIdx_ = [0];
  for (var li = 0; li < LEFT_FIXED_NAMES.length; li++) {
    for (var ci2 = 0; ci2 < colCount; ci2++) {
      if (columns[ci2].name === LEFT_FIXED_NAMES[li]) {
        leftFixedByGridIdx_.push(ci2 + 1);
        break;
      }
    }
  }

  var rightFixedSet_ = {};
  for (var ri = 0; ri < RIGHT_FIXED_NAMES.length; ri++) {
    for (var ci3 = 0; ci3 < colCount; ci3++) {
      if (columns[ci3].name === RIGHT_FIXED_NAMES[ri]) {
        rightFixedSet_[ci3 + 1] = true;
        break;
      }
    }
  }

  var lastLeftFixedIdx_ = leftFixedByGridIdx_[leftFixedByGridIdx_.length - 1];

  // Sticky left offset for each pinned column (0-indexed grid position)
  var stickyLefts_ = {};
  for (var fi = 0; fi < leftFixedByGridIdx_.length; fi++) {
    (function (targetGi) {
      stickyLefts_[targetGi] = computed(widths_, function (arr) {
        var left = 0;
        for (var fj = 0; fj < leftFixedByGridIdx_.length; fj++) {
          var gj = leftFixedByGridIdx_[fj];
          if (gj === targetGi) return left;
          left += arr[gj];
        }
        return 0;
      });
    })(leftFixedByGridIdx_[fi]);
  }

  // ============================================================
  // Grid element registry — DOM-level sync, view-framework agnostic
  // ============================================================
  var _gridEls = [];

  function _syncGrids() {
    var template = gridTemplate_.value;
    var totalPx = totalWidthPx_.value;
    for (var i = 0; i < _gridEls.length; i++) {
      var el = _gridEls[i];
      if (!el) continue;
      // Only update if the element is still in the DOM
      if (el.isConnected) {
        el.style.gridTemplateColumns = template;
        el.style.minWidth = totalPx;
      }
    }
  }

  // ============================================================
  // Intercept widths_.as() to trigger grid sync on EVERY mutation.
  // This is the single point of truth for all width changes.
  // ============================================================
  var _origAs = widths_.as;
  widths_.as = function (arr) {
    _origAs.call(widths_, arr);
    _syncGrids();
  };

  // ============================================================
  // Public API
  // ============================================================
  return {
    // ---- Reactive state (read-only by views) ----
    widths_: widths_,
    gridTemplate_: gridTemplate_,
    totalWidth_: totalWidth_,
    totalWidthPx_: totalWidthPx_,
    stickyLefts_: stickyLefts_,
    rightFixedSet_: rightFixedSet_,
    lastLeftFixedIdx_: lastLeftFixedIdx_,

    // ---- Queries ----
    /** @param {number} gridIdx */
    isLeftSticky: function (gridIdx) { return stickyLefts_[gridIdx] !== undefined; },

    /** @param {number} gridIdx */
    isRightSticky: function (gridIdx) { return rightFixedSet_[gridIdx] === true; },

    /** @param {number} gridIdx — 0-based data column index */
    gridIdx: function (colIdx) { return colIdx + 1; },

    get widthCount() { return colCount + 1; },
    get dataColumnCount() { return colCount; },

    // ---- Column resize ----
    /**
     * Resize a column by delta pixels.
     * @param {number} gridIdx — grid-column index of the column to resize
     * @param {number} delta    — pixel delta (positive = wider for regular handle)
     * @param {Object} [handleOpts]
     * @param {boolean} [handleOpts.onLeft] — handle is on left edge (right-fixed cols)
     */
    resizeColumn: function (gridIdx, delta, handleOpts) {
      if (handleOpts && handleOpts.onLeft) delta = -delta;
      var arr = widths_.value.slice();
      arr[gridIdx] = Math.max(MIN_W, arr[gridIdx] + delta);
      widths_.as(arr);
    },

    /** Set a column to an absolute width. */
    resizeColumnTo: function (gridIdx, width) {
      var arr = widths_.value.slice();
      arr[gridIdx] = Math.max(MIN_W, Math.round(width));
      widths_.as(arr);
    },

    // ---- Grid element registration ----
    /**
     * Register a DOM element whose grid-template-columns must stay
     * in sync whenever any column width changes.
     *
     * The element must be a grid container (display: grid).
     * The model will directly set style.gridTemplateColumns
     * and style.minWidth on it.
     *
     * @param {HTMLElement} el
     */
    registerGrid: function (el) {
      if (!el) return;
      for (var i = 0; i < _gridEls.length; i++) {
        if (_gridEls[i] === el) return; // already registered
      }
      _gridEls.push(el);
      // Apply immediately so the element has correct initial values
      el.style.gridTemplateColumns = gridTemplate_.value;
      el.style.minWidth = totalWidthPx_.value;
    },

    /** Unregister a previously registered grid element. */
    unregisterGrid: function (el) {
      if (!el) return;
      for (var i = 0; i < _gridEls.length; i++) {
        if (_gridEls[i] === el) {
          _gridEls.splice(i, 1);
          return;
        }
      }
    },
  };
}

export { createTableColumnModel };
