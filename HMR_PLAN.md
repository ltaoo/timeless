# State-Preserving HMR for Timeless Framework

## Root Cause

The current HMR causes a **full page reload** every time. Investigation found:

1. `lazy-view.ts` source has `__TIMELESS_HMR__.register()` / `beginRecord()` / `endRecord()` calls
2. `lazy.ts` source sets `fn.__hmr_path = path`
3. **The pre-built UMD bundles at `apps/web-vanilla/public/timeless/0.17.0/` were built BEFORE these hooks were added**
4. Confirmed: `grep __TIMELESS_HMR__` and `grep __hmr_path` on the UMD files → **zero matches**
5. So `register()` is never called → HMR `accept()` finds no entries → returns `false` → `location.reload()`

The HMR client script and framework source hooks are correct. The problem is **the UMD bundles are stale**.

## Solution

### Step 1: Dev server auto-builds framework UMDs on startup

**File**: `packages/cli/src/commands/frontend.ts` — `frontend()` function

Before starting the HTTP server, run a dev build of framework packages:

```typescript
// Before server.listen():
console.log(pc.dim("  Building framework packages..."));
execSync(
  'pnpm --filter "./packages/timeless" --filter "./packages/timeless-dom" --filter "./packages/shadcn" --filter "./packages/provider-web" -r --sort --workspace-concurrency=1 run build',
  { cwd: root /* monorepo root */, stdio: "inherit", shell: true }
);
```

Add a `--skip-build` flag to skip this for faster restart when only editing app code.

### Step 2: Dev server serves UMDs from `dist/` instead of `public/`

**File**: `packages/cli/src/commands/frontend.ts` — static file serving

When a request matches `public/timeless/*/`, redirect to the package `dist/` directory:

```
Request: public/timeless/0.17.0/timeless.umd.min.js
  → Serve: packages/timeless/dist/timeless.umd.min.js (if exists)
  → Fallback: public/timeless/0.17.0/timeless.umd.min.js

Request: public/timeless/0.17.0/timeless.dom.umd.min.js
  → Serve: packages/timeless-dom/dist/timeless.dom.umd.min.js

Request: public/timeless/0.17.0/timeless.shadcn.umd.min.js
  → Serve: packages/shadcn/dist/timeless.shadcn.umd.min.js

Request: public/timeless/0.17.0/timeless.shadcn.css
  → Serve: packages/shadcn/dist/timeless.shadcn.css

Request: public/timeless/0.17.0/timeless.web.umd.min.js
  → Serve: packages/provider-web/dist/timeless.web.umd.min.js
```

Implementation: Add a `tryServeFromDist(filePath)` function that checks the mapping. Call it before the default file serving.

### Step 3: Dev server transforms page modules (HMR boundary injection)

**File**: `packages/cli/src/commands/frontend.ts` — file serving for `src/*.js`

When serving `.js` files from `src/`, detect `export default function` and append HMR boundary code:

```javascript
// Appended by dev server:
;if (globalThis.__TIMELESS_HMR__) {
  globalThis.__TIMELESS_HMR__._notifyModuleLoad(
    import.meta.url.replace(/\?.*$/, '').replace(/^.*?\/(src\/)/, '@/')
  );
}
```

This enables future HMR for non-lazy-loaded modules. For now it's a lightweight notification that the module loaded.

### Step 4: No changes needed to framework source or HMR client

Already done in previous session:
- `lazy-view.ts`: `beginRecord()` / `endRecord()` around Factory, `register()` after render
- `lazy.ts`: `fn.__hmr_path = path`
- HMR client: store registry, Proxy constructor wrapping, modified `accept()` with reuse queues

## Files to Modify

| File | Change |
|------|--------|
| `packages/cli/src/commands/frontend.ts` | Auto-build on startup, dist/ serving, module transform |

## UMD → dist/ Mapping

| Request filename | Package dist/ path |
|-----------------|-------------------|
| `timeless.umd.min.js` | `packages/timeless/dist/timeless.umd.min.js` |
| `timeless.dom.umd.min.js` | `packages/timeless-dom/dist/timeless.dom.umd.min.js` |
| `timeless.shadcn.umd.min.js` | `packages/shadcn/dist/timeless.shadcn.umd.min.js` |
| `timeless.shadcn.css` | `packages/shadcn/dist/timeless.shadcn.css` |
| `timeless.web.umd.min.js` | `packages/provider-web/dist/timeless.web.umd.min.js` |

## Verification

1. `timeless frontend --port 3000` → should print "Building framework packages..."
2. Browser loads → check Network tab: UMD files served (should contain `__TIMELESS_HMR__`)
3. Navigate to Feedback page → open Dialog → edit `index.feedback.js`
4. Console: `[HMR] Reusing store DialogCore #0` — Dialog stays open
5. Show Transition → edit file → Transition stays visible
6. Open multiple Sheets → edit file → all Sheets stay open
