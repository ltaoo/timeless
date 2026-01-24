const formatDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
    date.getDay()
  ];
  return `${month}-${day} ${weekDay}`;
};

const formatDateWithYear = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
    date.getDay()
  ];
  return `${year}-${month}-${day} ${weekDay}`;
};

const shouldShowYear = (date, index) => {
  if (index === 0) return false;
  const prevDate = dateList[index - 1];
  return date.getFullYear() !== prevDate.getFullYear();
};

const getDisplayDate = (date, index) => {
  return shouldShowYear(date, index)
    ? formatDateWithYear(date)
    : formatDate(date);
};

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const truncateContent = (content, maxLength = 48) => {
  if (!content) return "";
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
};

const isToday = (date) => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
};

const formatDateLabel = (date) => {
  if (isToday(date)) return "今天";
  if (isYesterday(date)) return "昨天";
  return formatDate(date);
};

const getDateMemos = (date, memos) => {
  // console.log(memos);
  const dateStr = dayjs(date).format("YYYY-MM-DD");
  return memos.filter((m) => {
    return m.date === dateStr;
  });
};

const generateDateRange = (days = 60) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date);
  }
  return dates;
};

const dateList = generateDateRange(60);

export function TimelineView(props) {
  const { onMemoClick } = props;
  const view$ = View({ class: "timeline-container" }, [
    View({ class: "timeline-list" }, [
      For({
        each: dateList,
        render(date, index) {
          const memosInDate = computed(
            { memos: props.memo$.state.memos },
            (draft) => {
              // console.log(
              //   "[]TimelineView - the memos is changed",
              //   date.toLocaleDateString(),
              //   draft.memos.length,
              // );
              return getDateMemos(date, draft.memos);
            },
          );
          const hasContent = computed(
            { memos: memosInDate },
            (draft) => draft.memos.length > 0,
          );
          const isCurrentDay = isToday(date);
          const date_item_classname = computed({ hasContent }, (draft) => {
            return [
              "timeline-date-item",
              draft.hasContent ? "has-content" : "no-content",
              isCurrentDay ? "today" : "",
            ].join(" ");
          });
          const dot_classname = computed({ hasContent }, (draft) => {
            return [
              "timeline-dot",
              draft.hasContent ? "dot-active" : "dot-inactive",
            ].join(" ");
          });
          return View(
            {
              class: classnames(date_item_classname),
            },
            [
              View({ class: "timeline-line-wrapper" }, [
                View({
                  class: classnames(dot_classname),
                }),
                View({ class: "timeline-line" }),
              ]),
              View(
                {
                  class: "timeline-date-content",
                  onClick() {
                    if (hasContent && onMemoClick) {
                      onMemoClick({ date, memos: memosInDate });
                    }
                  },
                },
                [
                  View({ class: "timeline-date-label" }, [
                    Txt(getDisplayDate(date, index)),
                  ]),
                  Show({
                    when: hasContent,
                    children: [
                      For({
                        each: computed({ memos: memosInDate }, (draft) =>
                          draft.memos.slice(0, 3),
                        ),
                        render(memo) {
                          return View({ class: "timeline-memo-item" }, [
                            View({ class: "timeline-memo-time" }, [
                              Txt(formatTime(memo.createdAt)),
                            ]),
                            View({ class: "timeline-memo-text" }, [
                              DangerouslyInnerHTML(memo.content),
                            ]),
                          ]);
                        },
                      }),
                      Show({
                        when: computed(
                          { memos: memosInDate },
                          (draft) => draft.memos.length > 3,
                        ),
                        children: [
                          View({ class: "timeline-more" }, [
                            Txt(
                              computed(
                                { memos: memosInDate },
                                (draft) => `+${draft.memos.length - 3} 条`,
                              ),
                            ),
                          ]),
                        ],
                      }),
                    ],
                  }),
                  Show({
                    when: hasContent,
                    children: [],
                    fallback: [
                      View({ class: "timeline-empty" }, [Txt("暂无记录")]),
                    ],
                  }),
                ],
              ),
            ],
          );
        },
      }),
    ]),
  ]);

  const _style = document.createElement("style");
  _style.textContent = `.timeline-container {
  padding-right: 12px;
  width: 260px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.timeline-title {
  padding: 16px;
  border-bottom: 1px solid var(--FG-4, #e5e7eb);
  font-size: 14px;
  font-weight: 600;
  color: var(--FG-0, #111827);
  flex-shrink: 0;
  background: var(--BG-0, #fff);
}
.timeline-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.timeline-date-item {
  display: flex;
  padding: 8px 16px;
  transition: background 0.2s;
}
.timeline-date-item.today {
  background: var(--BG-2, #fff);
}
.timeline-date-item.has-content {
  cursor: pointer;
}
.timeline-date-item.has-content:hover {
  background: var(--BG-3, #f3f4f6);
}
.timeline-line-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 12px;
  padding-top: 6px;
}
.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  z-index: 1;
}
.timeline-dot.dot-active {
  background: var(--GREEN, #10b981);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}
.timeline-dot.dot-inactive {
  background: var(--FG-3, #d1d5db);
}
.timeline-line {
  width: 2px;
  flex: 1;
  min-height: 8px;
  background: var(--FG-4, #e5e7eb);
  margin-top: -2px;
}
.timeline-date-item:last-child .timeline-line {
  display: none;
}
.timeline-date-content {
  flex: 1;
  min-width: 0;
  padding-bottom: 8px;
}
.timeline-date-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--FG-0, #111827);
  margin-bottom: 8px;
}
.timeline-date-item.no-content .timeline-date-label {
  color: var(--FG-2, #9ca3af);
}
.timeline-memo-item {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  align-items: flex-start;
}
.timeline-memo-time {
  font-size: 11px;
  color: var(--FG-3, #9ca3af);
  flex-shrink: 0;
  width: 48px;
}
.timeline-memo-text {
  font-size: 12px;
  line-height: 1.5;
  color: var(--FG-1, #374151);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.timeline-more {
  font-size: 11px;
  color: var(--GREEN, #10b981);
  margin-top: 4px;
}
.timeline-empty {
  font-size: 11px;
  color: var(--FG-3, #9ca3af);
  font-style: italic;
}`;

  return {
    t: "view",
    render() {
      document.head.appendChild(_style);
      return view$.render();
    },
  };
}
