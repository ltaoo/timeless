/**
 * 跨分类锚点定位。
 *
 * 点击左菜单的组件条目时，目标区块可能：
 *   a) 就在当前分类页 —— 元素已在 DOM 里，`request()` 立即命中；
 *   b) 在另一个分类页 —— 先 `history.push` 切分类，目标页之后才挂载 / 才可见；
 *   c) 在已访问过、被 keep-alive 收起的分类页 —— 该页的子节点已被移进 detached
 *      fragment（见 timeless-dom `setChildrenActive(false)`），`getElementById` 找不到，
 *      直到它重新可见才会被塞回 DOM。
 *
 * 因此不能只靠 Section 的 `onMounted`（keep-alive 复用页面时不会再 mount），
 * 也不能只靠 `history.onRouteChange`（lazy 页面晚一个 macrotask 才 mount）。
 * 这里用一个「待办 id」+ onMounted 通知 + rAF/轮询兜底，覆盖全部时序。
 *
 * 不用 `onExpose`：它是一次性、以 viewport 为 root 的 IntersectionObserver，用完即 release。
 *
 * 本 app 是纯 Tailwind（无 app 私有 <style>），所以高亮用 Tailwind 工具类。
 */

/** @type {string | null} */
let pending = null;
let raf = 0;
let timer = 0;
let deadline = 0;

const POLL_MS = 50;
const DEADLINE_MS = 800;
const FLASH_CLASSES = ["is-flash", "ring-2", "ring-zinc-400", "rounded-lg"];

/** 请求滚动到某个 section id（由左菜单调用）。 */
export function request(id) {
  pending = id;
  deadline = Date.now() + DEADLINE_MS;
  attempt();
  schedule();
}

/** 某个 Section 刚 mount 时回报自己的 id —— 跨分类首次进入时是确定性命中。 */
export function notifyMounted(id) {
  if (pending === id) attempt();
}

function stop() {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  if (timer) {
    clearTimeout(timer);
    timer = 0;
  }
  deadline = 0;
}

/** @returns {boolean} 是否已命中并消费掉 pending */
function attempt() {
  if (!pending) {
    stop();
    return true;
  }
  const el = document.getElementById(pending);
  // offsetParent === null → 元素虽在 DOM 但还不可见（例如父级仍 hidden）。
  if (!el || el.offsetParent === null) return false;
  const id = pending;
  pending = null;
  stop();
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  el.classList.add(...FLASH_CLASSES);
  setTimeout(() => el.classList.remove(...FLASH_CLASSES), 1200);
  return true;
}

function schedule() {
  if (!pending) return;
  // 两次 rAF 等布局 / 路由提交落地，再退回 50ms 轮询直到 deadline。
  raf = requestAnimationFrame(() => {
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (attempt()) return;
      timer = setTimeout(function tick() {
        timer = 0;
        if (attempt()) return;
        if (Date.now() > deadline) {
          pending = null;
          stop();
          return;
        }
        timer = setTimeout(tick, POLL_MS);
      }, POLL_MS);
    });
  });
}
