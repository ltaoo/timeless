/**
 * @file memo 数据源
 */

export function MemoModel(props) {
  const methods = {
    formatDate(dateStr) {
      const date = new Date(dateStr).valueOf();
      const now = new Date().valueOf();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) {
        return "今天";
      }
      if (days === 1) {
        return "昨天";
      }
      if (days < 7) {
        return `${days} 天前`;
      }
      return date.toLocaleString("zh-CN", {});
    },
    getMemoListByDate(date) {
      // memos: vm$.filterMemosByDate(selectedDate),
      if (!date) {
        return _memos;
      }
      const dateStr = this.formatDate(date);
      return _memos.value.filter((memo) => memo.date === dateStr);
    },
  };

  const _memos = ref(props.storage.values.memos);
  const dateStr = ref(new Date().valueOf());
  const hasMemo_ = computed({ memos: _memos }, (draft) => {
    // console.log("[Model]memo - hasMemo_", draft.memos.length > 0);
    return draft.memos.length > 0;
  });
  const memoListInDay = computed({ dateStr, memos: _memos }, (draft) => {
    return methods.getMemoListByDate(draft.dateStr);
  });

  return {
    state: {
      memos: _memos,
      hasMemo: hasMemo_,
      memoListInDay: memoListInDay,
    },
    setMemos(memos) {
      _memos.value = memos.sort(
        (a, b) =>
          new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf(),
      );
      this.render();
    },
    addMemo(content) {
      const clean_content = content.trim();
      if (!clean_content) {
        return;
      }
      console.log(clean_content);
      const now = dayjs();
      const created = {
        id: now.valueOf(),
        content: clean_content,
        date: now.format("YYYY-MM-DD"),
        createdAtText: now.format("YYYY-MM-DD HH:mm:ss"),
        createdAt: now.valueOf(),
      };
      _memos.value.push(created);
      props.storage.values.memos.unshift(created);
      // this.onMemoAdd(clean_content);
    },
    deleteMemo(id) {
      _memos.value = _memos.value.filter((m) => m.id !== id);
      this.onMemoDelete(id);
    },
    updateMemo(id, content) {
      this.onMemoUpdate(id, content);
    },
  };
}
