/**
 * 看板拖拽示例。
 *
 * 拖拽基于 View 的 onPointerDown / onPointerMove / onPointerUp（指针事件），
 * 而不是原生 HTML5 拖放 —— 原生 draggable 在桌面 webview 里不会派发 drag 事件。
 * 指针一旦按下，View 就会在 window 上挂全局监听，所以卡片移出自身后仍能收到
 * 移动事件；落点则用 document.elementFromPoint 做命中测试。
 *
 * 拖拽期间有三处位置反馈：
 * - 跟手卡片：Portal 到 body 的浮层，按指针位移实时平移，不会被看板容器的
 *   overflow 裁掉，也不会挡住 elementFromPoint 的命中测试（pointer-events: none）；
 * - 原位影子：被拖起的卡片留在原列，就地变半透明 + 虚线框，位置高度都不动
 *   —— 原列布局不会跳，拖到别的列以后也还看得到它是从哪来的；
 * - 占位空档：用指针在列内的纵向位置换算出插入下标，插一个等高虚线块把后面的
 *   卡片挤开，松手前就能看到卡片会落到第几格。落点就是原位时不插占位块
 *   （影子本身已经说明了结果），标题栏同步显示「松手放回原位」。
 */

const drag_threshold_px = 4;

/** 列表里的占位标记；始终用同一个对象，For 才能复用它的 DOM 而不是重建。 */
const placeholder_item = { placeholder: true, id: "__kanban_placeholder__" };

function boards_seed() {
  return [
    {
      id: "product",
      title: "产品看板",
      columns: [
        { id: "backlog", label: "待规划", dot: "bg-zinc-400" },
        { id: "doing", label: "进行中", dot: "bg-blue-500" },
        { id: "review", label: "评审中", dot: "bg-amber-500" },
        { id: "done", label: "已完成", dot: "bg-emerald-500" },
      ],
    },
    {
      id: "growth",
      title: "增长看板",
      columns: [
        { id: "idea", label: "想法池", dot: "bg-violet-500" },
        // 与产品看板共用「进行中」，跨看板拖拽时能保留列的含义。
        { id: "running", label: "进行中", dot: "bg-sky-500" },
        { id: "shipped", label: "已上线", dot: "bg-teal-500" },
      ],
    },
  ];
}

function tasks_seed() {
  return [
    {
      id: "t1",
      boardId: "product",
      columnId: "backlog",
      title: "统一快捷搜索的服务端索引方案",
      desc: "memo / 评论 / 待办各建独立文档，查询走 DSL。",
      tag: "架构",
      tone: "violet",
      priority: "high",
      points: 5,
      assignee: "林岚",
    },
    {
      id: "t2",
      boardId: "product",
      columnId: "backlog",
      title: "看板卡片支持跨列拖拽",
      desc: "复用 View 的指针事件，落点用 elementFromPoint 命测。",
      tag: "交互",
      tone: "blue",
      priority: "medium",
      points: 3,
      assignee: "周野",
    },
    {
      id: "t3",
      boardId: "product",
      columnId: "backlog",
      title: "补充导出 Markdown 的边界用例",
      desc: "空标题、超长文件名、含 emoji 的目录名。",
      tag: "测试",
      tone: "zinc",
      priority: "low",
      points: 2,
      assignee: "陈默",
    },
    {
      id: "t4",
      boardId: "product",
      columnId: "doing",
      title: "重构 memo 索引的增量同步",
      desc: "只重建指纹变化的文档，避免整库重扫。",
      tag: "架构",
      tone: "violet",
      priority: "high",
      points: 8,
      assignee: "周野",
    },
    {
      id: "t5",
      boardId: "product",
      columnId: "doing",
      title: "快捷搜索高亮片段渲染",
      desc: "服务端返回 <mark>，前端解析成受控片段。",
      tag: "交互",
      tone: "blue",
      priority: "medium",
      points: 3,
      assignee: "林岚",
    },
    {
      id: "t6",
      boardId: "product",
      columnId: "review",
      title: "敏感词命中提示优化",
      desc: "命中位置在列表里给出更明确的视觉反馈。",
      tag: "体验",
      tone: "amber",
      priority: "medium",
      points: 2,
      assignee: "陈默",
    },
    {
      id: "t7",
      boardId: "product",
      columnId: "review",
      title: "导入 HTML 书签的兼容处理",
      desc: "部分浏览器导出的嵌套 dl 结构需要兜底。",
      tag: "兼容",
      tone: "emerald",
      priority: "low",
      points: 3,
      assignee: "许澄",
    },
    {
      id: "t8",
      boardId: "product",
      columnId: "done",
      title: "移动端底部导航吸附修复",
      desc: "键盘弹起后导航栏遮挡输入框。",
      tag: "修复",
      tone: "rose",
      priority: "low",
      points: 1,
      assignee: "周野",
    },
    {
      id: "t9",
      boardId: "product",
      columnId: "done",
      title: "搜索框支持按标签过滤",
      desc: "输入 # 开头的词时只匹配标签。",
      tag: "交互",
      tone: "blue",
      priority: "medium",
      points: 3,
      assignee: "林岚",
    },
    {
      id: "t10",
      boardId: "growth",
      columnId: "idea",
      title: "新用户引导的 A/B 实验",
      desc: "对比直达首页与三步引导的次日留存。",
      tag: "实验",
      tone: "violet",
      priority: "high",
      points: 5,
      assignee: "许澄",
    },
    {
      id: "t11",
      boardId: "growth",
      columnId: "running",
      title: "首屏加载耗时优化",
      desc: "拆分首屏依赖，目标 LCP 低于 1.2s。",
      tag: "性能",
      tone: "amber",
      priority: "high",
      points: 8,
      assignee: "周野",
    },
    {
      id: "t12",
      boardId: "growth",
      columnId: "shipped",
      title: "导出 PDF 分享链接",
      desc: "生成带有效期的只读链接。",
      tag: "功能",
      tone: "blue",
      priority: "none",
      points: 3,
      assignee: "陈默",
    },
  ];
}

const priority_dot = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-sky-500",
  none: "",
};

const tag_tone = {
  zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300",
};

export default function KanbanView() {
  const boards = boards_seed();
  const tasks_ = refarr(tasks_seed());
  const activeBoardId_ = ref(boards[0].id);
  const status_ = ref(
    "按住卡片拖动，虚线空档就是松手后的位置；拖到顶部另一个看板的标签上可跨看板移动。",
  );

  // 拖拽会话：dragging_task_ 是本次被拖起的任务对象，拖拽期间不变。
  const dragging_task_ = ref(null);
  const drag_active_ = computed(dragging_task_, (task) => Boolean(task));
  // 跟手卡片：x / y 为视口坐标，offset 是按下点相对卡片左上角的偏移，
  // width / height 是按下时量到的尺寸（占位块用 height 与卡片对齐）。
  const ghost_box_ = refobj({
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
    width: 0,
    height: 0,
  });
  // 落点：列内插入下标，或跨看板时命中的看板标签。
  const drop_column_key_ = ref("");
  const drop_index_ = ref(-1);
  const drop_board_id_ = ref("");

  const columnKey = (boardId, columnId) => boardId + ":" + columnId;

  const boardById = (id) => boards.find((board) => board.id === id);

  const columnLabel = (boardId, columnId) =>
    boardById(boardId)?.columns.find((column) => column.id === columnId)
      ?.label || "";

  // 跨看板落点：目标看板有同名列就沿用含义，否则落到第一列。
  // 目标看板的列当前不可见，所以只能追加到该列末尾。
  const tab_placement = (boardId, task) => {
    const board = boardById(boardId);
    if (!board?.columns.length) return null;
    const label = columnLabel(task.boardId, task.columnId);
    const column =
      board.columns.find((item) => item.label === label) || board.columns[0];
    return { boardId: board.id, columnId: column.id };
  };

  // 计数只数真实卡片：占位标记是落点预告，不算进数量。
  const count_of = (list) => list.filter((item) => !item.placeholder).length;

  // 落点正好是被拖起卡片自己占的槽位（松手等于没动）。
  // 列内下标和卡片在当前列的下标相等就是这种情况：占位块插到那儿，
  // 相当于「排在自己现在的位置之后」，结果和现在完全一样。
  const drop_is_noop = (list, dragging, boardId, columnId, index) => {
    if (dragging.boardId !== boardId || dragging.columnId !== columnId) {
      return false;
    }
    const own = list.filter(
      (task) => task.boardId === boardId && task.columnId === columnId,
    );
    return index === own.findIndex((task) => task.id === dragging.id);
  };

  // 每列一个稳定的列表：被拖起的卡片留在原列（就地弱化成影子，见 CardView），
  // 落点列则按指针位置插入一个占位标记。所有卡片保持同一个对象引用，
  // For 只做插入 / 移除占位标记这一处改动，不会重建卡片的 DOM
  // —— 卡片一旦被移除，浏览器就可能取消这次指针会话。
  const column_items = new Map();
  for (const board of boards) {
    for (const column of board.columns) {
      const key = columnKey(board.id, column.id);
      column_items.set(
        key,
        derive(
          [tasks_, dragging_task_, drop_column_key_, drop_index_],
          (list, dragging, dropKey, dropIndex) => {
            const own = list.filter(
              (task) => task.boardId === board.id && task.columnId === column.id,
            );
            if (!dragging || dropKey !== key) return own;
            // 下标是按可见卡片数的，先找到锚点卡片再换算回原列的位置。
            const rest = own.filter((task) => task.id !== dragging.id);
            const at = Math.max(
              0,
              Math.min(dropIndex < 0 ? rest.length : dropIndex, rest.length),
            );
            // 落回自己的槽位：原地那半透明的影子已经说明结果，
            // 再插一个虚线框会看起来像多出来一个槽位。
            if (drop_is_noop(list, dragging, board.id, column.id, at)) return own;
            const anchor = rest[at];
            const raw = anchor ? own.indexOf(anchor) : own.length;
            return own
              .slice(0, raw)
              .concat(placeholder_item, own.slice(raw));
          },
        ),
      );
    }
  }

  const column_count = new Map();
  for (const key of column_items.keys()) {
    column_count.set(
      key,
      computed(column_items.get(key), (list) => String(count_of(list))),
    );
  }

  // 把卡片移动 / 插到目标列的第 at 位。全局数组的顺序决定列内顺序，
  // 所以先定位「目标列第 at 个」在全局数组里的锚点。
  const move_task = (taskId, placement) => {
    const list = tasks_.value;
    const moved = list.find((task) => task.id === taskId);
    if (!moved) return;
    const rest = list.filter((task) => task.id !== taskId);
    const destIds = rest
      .filter(
        (task) =>
          task.boardId === placement.boardId &&
          task.columnId === placement.columnId,
      )
      .map((task) => task.id);
    const at = Math.max(
      0,
      Math.min(
        Number.isFinite(placement.index) ? placement.index : destIds.length,
        destIds.length,
      ),
    );
    const updated = {
      ...moved,
      boardId: placement.boardId,
      columnId: placement.columnId,
    };
    // at 处的卡片之前就是落点；at 到头则跟在目标列最后一个卡片之后。
    const beforeId = destIds[at] || "";
    const afterId = beforeId ? "" : destIds[destIds.length - 1] || "";

    const next = [];
    let inserted = false;
    for (const task of rest) {
      if (beforeId && task.id === beforeId) {
        next.push(updated);
        inserted = true;
      }
      next.push(task);
      if (afterId && task.id === afterId) {
        next.push(updated);
        inserted = true;
      }
    }
    if (!inserted) next.push(updated);

    // 落回自己的槽位等于没动：数据不动，也不报「已移动」。
    const unchanged =
      next.length === list.length &&
      next.every((task, i) => task.id === list[i].id);
    if (unchanged) {
      status_.as("《" + moved.title + "》放回原位。");
      return;
    }

    tasks_.as(next);
    status_.as(
      "已移动《" +
        moved.title +
        "》→ " +
        boardById(placement.boardId).title +
        " · " +
        columnLabel(placement.boardId, placement.columnId) +
        " · 第 " +
        (at + 1) +
        " 位",
    );
  };

  // 指针在列内的插入下标：只数其它卡片，指针越过哪张卡片的中线就排在它后面。
  const insertion_index_at = (body, y, draggingId) => {
    const cards = body.querySelectorAll("[data-kanban-task-id]");
    let index = 0;
    for (let i = 0; i < cards.length; i += 1) {
      const el = cards[i];
      // 被拖起的那张不参与定位：它留在原位当影子，不该把自己算进落点。
      if (el.dataset.kanbanTaskId === draggingId) continue;
      const rect = el.getBoundingClientRect();
      // 未展示的看板（高度为 0）不参与定位。
      if (rect.height === 0) continue;
      if (y > rect.top + rect.height / 2) index += 1;
    }
    return index;
  };

  // 落点可能是某列的卡片区，也可能是另一个看板的标签
  // （板上一次只展示一个看板的列，换板靠拖到标签上完成）。
  const drop_target_at = (x, y, draggingId) => {
    if (typeof document?.elementFromPoint !== "function") return null;
    const node = document
      .elementFromPoint(x, y)
      ?.closest?.("[data-kanban-drop], [data-kanban-tab]");
    if (!node) return null;
    if (node.dataset.kanbanDrop) {
      return {
        columnKey: node.dataset.kanbanDrop,
        index: insertion_index_at(node, y, draggingId),
      };
    }
    if (node.dataset.kanbanTab) return { boardId: node.dataset.kanbanTab };
    return null;
  };

  const resolve_placement = (target, task) => {
    if (target.columnKey) {
      const [boardId, columnId] = target.columnKey.split(":");
      return { boardId, columnId, index: target.index };
    }
    const drop = tab_placement(target.boardId, task);
    if (!drop) return null;
    return { ...drop, index: Number.MAX_SAFE_INTEGER };
  };

  let drag_session = null;

  const reset_drag_state = () => {
    drag_session = null;
    dragging_task_.as(null);
    drop_column_key_.as("");
    drop_index_.as(-1);
    drop_board_id_.as("");
  };

  // 指针会话挂在页面根节点上，而不是卡片自己身上：挂在自己身上时，
  // 卡片一旦离开 DOM（换看板、列表增删都会）浏览器就会中断这次指针会话。
  const on_pointer_down = (event, info) => {
    if (event?.button !== 0 || event?.isPrimary === false) return;
    // 「重置」这类控件保留自己的按下行为。
    if (event?.target?.closest?.("button, a, input, textarea, select")) return;
    const el = event?.target?.closest?.("[data-kanban-task-id]");
    if (!el) return;
    const task = tasks_.value.find(
      (item) => item.id === el.dataset.kanbanTaskId,
    );
    if (!task) return;
    // 先量出卡片的位置与尺寸，跟手浮层和占位块都用这份数据。
    const rect = el.getBoundingClientRect();
    drag_session = {
      task,
      dragging: false,
      x: info.x,
      y: info.y,
      rect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
    };
  };

  const on_pointer_move = (event, info) => {
    if (!drag_session) return;
    if (!drag_session.dragging) {
      const distance = Math.hypot(
        info.x - drag_session.x,
        info.y - drag_session.y,
      );
      // 位移超过阈值才算拖拽，否则只是点击。
      if (distance < drag_threshold_px) return;
      drag_session.dragging = true;
      const rect = drag_session.rect;
      ghost_box_.assign({
        x: rect.left,
        y: rect.top,
        offsetX: info.x - rect.left,
        offsetY: info.y - rect.top,
        width: rect.width,
        height: rect.height,
      });
      dragging_task_.as(drag_session.task);
    }
    // 跟手浮层按住下的抓取点平移，卡片就贴在指针下方。
    const box = ghost_box_.value;
    ghost_box_.assign({
      x: info.x - box.offsetX,
      y: info.y - box.offsetY,
    });
    const target = drop_target_at(info.x, info.y, drag_session.task.id);
    drop_column_key_.as(target?.columnKey || "");
    drop_index_.as(typeof target?.index === "number" ? target.index : -1);
    drop_board_id_.as(target?.boardId || "");
  };

  const on_pointer_up = (event, info) => {
    const session = drag_session;
    const target = {
      columnKey: drop_column_key_.value,
      boardId: drop_board_id_.value,
      index: drop_index_.value,
    };
    reset_drag_state();
    // 取消的指针（触摸滚动、组件重挂载）不算落点。
    if (!session?.dragging || event?.type === "pointercancel") return;
    if (!target.columnKey && !target.boardId) return;
    const placement = resolve_placement(target, session.task);
    if (!placement) return;
    move_task(session.task.id, placement);
  };

  const reset_button = new Timeless.vm.ButtonCore({
    variant: "outline",
    size: "sm",
    onClick() {
      tasks_.as(tasks_seed());
      status_.as("已重置为初始数据。");
    },
  });

  // 松手前的落点预告，直接回答「放开会落在哪」。
  const preview_ = derive(
    [tasks_, dragging_task_, drop_column_key_, drop_index_, drop_board_id_],
    (list, task, columnKey, index, boardId) => {
      if (!task) return "";
      if (columnKey) {
        const [targetBoard, targetColumn] = columnKey.split(":");
        if (drop_is_noop(list, task, targetBoard, targetColumn, index)) {
          return "松手放回原位";
        }
        return (
          "松手放到 " +
          boardById(targetBoard).title +
          " · " +
          columnLabel(targetBoard, targetColumn) +
          " · 第 " +
          (index < 0 ? 1 : index + 1) +
          " 位"
        );
      }
      if (boardId) {
        const drop = tab_placement(boardId, task);
        if (!drop) return "";
        return (
          "松手放到 " +
          boardById(drop.boardId).title +
          " · " +
          columnLabel(drop.boardId, drop.columnId) +
          " · 末尾"
        );
      }
      return "拖动中：" + task.title;
    },
  );

  const cursor_class = computed(drag_active_, (active) =>
    active ? "cursor-grabbing" : "",
  );

  // 卡片正文抽出来，跟手浮层复用同一份结构。
  function card_body(task) {
    return [
      View({ class: "flex items-start gap-2" }, [
        View(
          {
            class: classNames([
              "mt-[5px] w-2 h-2 rounded-full shrink-0",
              priority_dot[task.priority] || "hidden",
            ]),
          },
          [],
        ),
        View(
          {
            class:
              "flex-1 text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100",
          },
          [task.title],
        ),
        View(
          { class: "text-zinc-300 dark:text-zinc-600 shrink-0" },
          [Icon({ name: "ellipsis-vertical", size: 14 })],
        ),
      ]),
      View(
        {
          class:
            "mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2",
        },
        [task.desc],
      ),
      View({ class: "mt-2.5 flex items-center gap-2" }, [
        View(
          {
            class: classNames([
              "px-1.5 py-0.5 rounded text-[11px] font-medium",
              tag_tone[task.tone] || tag_tone.zinc,
            ]),
          },
          [task.tag],
        ),
        View({ class: "flex-1" }, []),
        View({ class: "text-[11px] text-zinc-400 dark:text-zinc-500" }, [
          task.points + " 点",
        ]),
        View(
          {
            class:
              "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-medium bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
            attributes: { title: task.assignee },
          },
          [task.assignee.slice(0, 1)],
        ),
      ]),
    ];
  }

  function CardView(task) {
    // 被拖起的卡片留在原列，就地弱化成「影子」：半透明 + 虚线框，位置和高度都不动。
    // 一是保住原列的布局（后面的卡片不会往上跳），二是拖到别的列之后，
    // 用户还能一眼看到它是从哪来的。注意不能把它从列表里摘掉——卡片一旦卸载，
    // 挂在 window 上的指针监听会被一起撤掉，这次拖拽就断了。
    const lifted = computed(dragging_task_, (item) =>
      Boolean(item) && item.id === task.id,
    );
    return Card(
      {
        class: classNames([
          "p-3 select-none transition-all",
          // 拖拽中指针会扫过其它卡片，统一显示抓取手势。
          derive([cursor_class], (cursor) => cursor || "cursor-grab"),
          "hover:border-zinc-300 dark:hover:border-zinc-700",
        ]),
        style: styleNames([
          computed(lifted, (value) =>
            value
              ? {
                  opacity: "0.4",
                  "border-style": "dashed",
                  "background-color": "transparent",
                  "box-shadow": "none",
                }
              : undefined,
          ),
        ]),
        attributes: {
          "data-kanban-task-id": task.id,
          // 原位的影子，和跟手浮层（n="kanban-ghost"）区分开。
          "data-kanban-origin": lifted,
          n: "kanban-card",
        },
      },
      card_body(task),
    );
  }

  function BoardTabView(board) {
    const is_active = computed(activeBoardId_, (id) => id === board.id);
    const is_hovered = computed(drop_board_id_, (id) => id === board.id);
    // 拖拽过程中其它看板标签也是落点，给它一个提示。
    const is_droppable = derive(
      [drag_active_, activeBoardId_],
      (dragging, activeId) => dragging && board.id !== activeId,
    );
    // 状态互斥，集中算成一个类串，避免 Tailwind 工具类相互覆盖。
    const tab_class = derive(
      [is_active, is_hovered, is_droppable, cursor_class],
      (active, hovered, droppable, cursor) => {
        const list = [
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
          cursor || "cursor-pointer",
        ];
        if (hovered) {
          list.push(
            "ring-2 ring-blue-600 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950",
          );
        } else if (droppable) {
          list.push("ring-2 ring-blue-300/70");
        }
        list.push(
          active
            ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-50 dark:hover:bg-zinc-800",
        );
        return list.join(" ");
      },
    );
    return View(
      {
        class: tab_class,
        attributes: { "data-kanban-tab": board.id, n: "kanban-board-tab" },
        onClick() {
          activeBoardId_.as(board.id);
        },
      },
      [
        View({}, [board.title]),
        View(
          {
            class: classNames([
              "px-1.5 rounded text-[11px]",
              computed(is_active, (active) =>
                active
                  ? "bg-zinc-700 text-zinc-100 dark:bg-zinc-300 dark:text-zinc-800"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
              ),
            ]),
          },
          [
            computed(tasks_, (list) =>
              String(list.filter((task) => task.boardId === board.id).length),
            ),
          ],
        ),
      ],
    );
  }

  function PlaceholderView() {
    return View(
      {
        class: classNames([
          "min-h-[72px] rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/70 dark:border-blue-500/70 dark:bg-blue-950/30",
          cursor_class,
        ]),
        // 高度对齐被拖起的卡片，其它卡片才会被准确挤开。
        style: styleNames([
          computed(ghost_box_, (box) => ({
            height: box.height ? Math.round(box.height) + "px" : undefined,
          })),
        ]),
        attributes: { "data-kanban-placeholder": "1", n: "kanban-placeholder" },
      },
      [
        View(
          {
            class:
              "flex items-center justify-center h-full text-[11px] text-blue-500 dark:text-blue-300",
          },
          ["放到这里"],
        ),
      ],
    );
  }

  function ColumnView(board, column) {
    const key = columnKey(board.id, column.id);
    const is_hovered = computed(drop_column_key_, (value) => value === key);
    const items = column_items.get(key);
    return View(
      {
        class: "flex flex-col w-[272px] shrink-0 rounded-lg",
        attributes: { "data-kanban-column": key, n: "kanban-column" },
      },
      [
        View({ class: "flex items-center gap-2 px-1 pb-2" }, [
          View(
            { class: classNames(["w-2 h-2 rounded-full", column.dot]) },
            [],
          ),
          View(
            {
              class: "text-sm font-medium text-zinc-700 dark:text-zinc-200",
            },
            [column.label],
          ),
          View({ class: "flex-1" }, []),
          View(
            {
              class: classNames([
                "text-xs text-zinc-400 dark:text-zinc-500 tabular-nums",
                cursor_class,
              ]),
            },
            [column_count.get(key)],
          ),
        ]),
        View(
          {
            class: classNames([
              "flex-1 min-h-[140px] overflow-y-auto rounded-lg border border-dashed p-2 space-y-2 transition-colors",
              cursor_class,
              computed(is_hovered, (hovered) =>
                hovered
                  ? "border-blue-400 ring-2 ring-blue-400/40 bg-blue-50/60 dark:bg-blue-950/30"
                  : "border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/40",
              ),
            ]),
            attributes: { "data-kanban-drop": key, n: "kanban-column-body" },
          },
          [
            For({
              each: items,
              render(item) {
                return item.placeholder ? PlaceholderView() : CardView(item);
              },
            }),
            Show({
              // 有占位块时就不再显示空态文案，避免和落点预告叠在一起。
              when: computed(items, (list) => list.length === 0),
              ok() {
                return View(
                  {
                    class:
                      "flex items-center justify-center h-[100px] text-xs text-zinc-400 dark:text-zinc-600",
                  },
                  ["拖拽卡片到这里"],
                );
              },
            }),
          ],
        ),
      ],
    );
  }

  function BoardView(board) {
    const visible = computed(activeBoardId_, (id) => id === board.id);
    return View(
      {
        class: classNames([
          "flex gap-4 overflow-x-auto pb-2 h-full",
          computed(visible, (show) => (show ? "" : "hidden")),
        ]),
        attributes: { "data-kanban-board": board.id, n: "kanban-board" },
      },
      board.columns.map((column) => ColumnView(board, column)),
    );
  }

  // 跟手浮层：Portal 到 body，脱离看板容器的 overflow 与层叠上下文。
  function DragGhostView() {
    const task = dragging_task_.value;
    if (!task) return [];
    return Portal({}, [
      View(
        {
          class: classNames([
            "rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900",
            "shadow-2xl ring-2 ring-blue-400/60 opacity-95",
            cursor_class,
          ]),
          style: styleNames([
            computed(ghost_box_, (box) => ({
              position: "fixed",
              left: "0px",
              top: "0px",
              width: box.width ? Math.round(box.width) + "px" : undefined,
              "z-index": 60,
              "pointer-events": "none",
              "will-change": "transform",
              transform:
                "translate3d(" +
                Math.round(box.x) +
                "px, " +
                Math.round(box.y) +
                "px, 0) rotate(1.5deg) scale(1.02)",
            })),
          ]),
          attributes: { n: "kanban-ghost" },
        },
        card_body(task),
      ),
    ]);
  }

  return View(
    {
      class: classNames(["flex flex-col h-full min-h-0 p-6 gap-4", cursor_class]),
      attributes: { n: "kanban-page" },
      // 一次拖拽只在根节点上开一个指针会话，卡片自己的生命周期与它无关。
      onPointerDown(event, info) {
        on_pointer_down(event, info);
      },
      onPointerMove(event, info) {
        on_pointer_move(event, info);
      },
      onPointerUp(event, info) {
        on_pointer_up(event, info);
      },
    },
    [
      View({ class: "flex items-center gap-3" }, [
        View({ class: "text-lg font-semibold" }, ["看板"]),
        View(
          {
            class: "text-xs text-zinc-400 dark:text-zinc-500",
          },
          [derive([preview_, status_], (preview, status) => preview || status)],
        ),
        View({ class: "flex-1" }, []),
        Button({ store: reset_button }, ["重置"]),
      ]),
      View({ class: "flex items-center gap-1" }, [
        For({
          each: boards,
          render(board) {
            return BoardTabView(board);
          },
        }),
      ]),
      View({ class: "flex-1 min-h-0" }, [
        For({
          each: boards,
          render(board) {
            return BoardView(board);
          },
        }),
      ]),
      Show({
        when: dragging_task_,
        ok() {
          return DragGhostView();
        },
      }),
    ],
  );
}
