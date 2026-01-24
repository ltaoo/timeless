export const fakeMemoList = [
  {
    id: 1,
    content: "今天完成了项目的重要里程碑，继续加油！",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    content: "发现一个有趣的开源项目，值得学习它的架构设计。",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    content:
      "今日待办：\n1. 完成代码review\n2. 撰写技术文档\n3. 准备下周会议材料",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 4,
    content: "阅读了一篇关于性能优化的文章，学到了很多新技巧。",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 5,
    content:
      "会议记录：\n时间：上午10点\n参与人：产品、技术、设计\n讨论事项：下季度规划",
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: 6,
    content: "灵感闪现：可以考虑用新的UI框架重构界面，体验会更好。",
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 7,
    content: "这本书真不错，推荐给团队的其他成员。",
    createdAt: new Date(Date.now() - 518400000).toISOString(),
  },
  {
    id: 8,
    content:
      "周总结：\n完成事项：8项\n待改进：代码质量\n下周计划：完成核心功能",
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 9,
    content: "今天天气很好，适合外出散步放松一下。",
    createdAt: new Date(Date.now() - 691200000).toISOString(),
  },
  {
    id: 10,
    content: "学习了一门新课程，受益匪浅。",
    createdAt: new Date(Date.now() - 777600000).toISOString(),
  },
  {
    id: 11,
    content: "项目进展顺利，团队配合越来越默契了。",
    createdAt: new Date(Date.now() - 864000000).toISOString(),
  },
  {
    id: 12,
    content: "发现了代码中的一个潜在bug，已经修复。",
    createdAt: new Date(Date.now() - 950400000).toISOString(),
  },
  {
    id: 13,
    content: "和同事讨论了技术方案，达成了共识。",
    createdAt: new Date(Date.now() - 1036800000).toISOString(),
  },
  {
    id: 14,
    content: "完成了本月目标，值得庆祝一下！",
    createdAt: new Date(Date.now() - 1123200000).toISOString(),
  },
  {
    id: 15,
    content: "新功能上线，用户反馈还不错，继续优化。",
    createdAt: new Date(Date.now() - 1209600000).toISOString(),
  },
];

export const PRESET_TEMPLATES = [
  { label: "今日待办", content: "今日待办：\n1. \n2. \n3. " },
  {
    label: "会议记录",
    content: "会议记录：\n时间：\n参与人：\n讨论事项：\n\n",
  },
  { label: "灵感闪现", content: "" },
  { label: "读书笔记", content: "书名：\n作者：\n摘录：\n\n思考：\n" },
  {
    label: "周总结",
    content: "本周总结：\n完成事项：\n\n待改进：\n\n下周计划：\n",
  },
];

export function MemosViewModel(props) {
  // let _memos = props.memos || [];
  // const _memos = ref(props.memos ?? fakeMemoList);

  const editor$ = Timeless.SlateEditorModel({ defaultValue: [] });
  //   const view$ = View({ class: "" });

  let _editorElement = null;
  let _editorReady = false;

  let _scrollTop = 0;
  let _lastScrollTop = 0;
  let _isEditorExpanded = true;
  let _touchStartY = 0;

  const handleScroll = (e) => {
    const currentScrollTop = e.target.scrollTop;
    const delta = currentScrollTop - _lastScrollTop;
    const inputWrapper = document.getElementById("memo-input-wrapper");

    if (delta > 5 && _isEditorExpanded && currentScrollTop > 30) {
      _isEditorExpanded = false;
      inputWrapper?.classList.add("collapsed");
    } else if (delta < -5 && !_isEditorExpanded) {
      _isEditorExpanded = true;
      inputWrapper?.classList.remove("collapsed");
    }

    _lastScrollTop = currentScrollTop;
  };

  const handleTouchStart = (e) => {
    _touchStartY = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    const deltaY = _touchStartY - touchY;
    const container = document.getElementById("memos-list");
    const inputWrapper = document.getElementById("memo-input-wrapper");
    if (!container || !inputWrapper) return;

    if (deltaY > 20 && !_isEditorExpanded && container.scrollTop < 10) {
      _isEditorExpanded = true;
      inputWrapper.classList.remove("collapsed");
      _touchStartY = touchY;
    } else if (deltaY < -20 && _isEditorExpanded) {
      _isEditorExpanded = false;
      inputWrapper.classList.add("collapsed");
      _touchStartY = touchY;
    }
  };

  const applyTemplate = (template) => {
    //     if (editor$ && _editorReady) {
    //       editor$.methods.refresh();
    //     }
    //     if (_editorElement) {
    //       _editorElement.textContent = template.content;
    //       _editorElement.focus();
    //     }
  };

  const initEditor = () => {
    _editorReady = true;
    editor$.onAction((operations) => {
      if (!_editorElement) {
        return;
      }
      for (let i = 0; i < operations.length; i += 1) {
        const op = operations[i];
        Timeless.SlateDOM.SlateDOMOperations.exec(_editorElement, op);
      }
    });

    editor$.onSelectionChange(({ start, end }) => {
      if (!_editorElement) {
        return;
      }
      Timeless.SlateDOM.refreshSelection(_editorElement, start, end);
    });

    setTimeout(() => {
      //       if (!_editorElement || !editor$) {
      //         return;
      //       }
      //       TimelessWeb.provide_slate(editor$, _editorElement);
      //       const children = editor$.state.children;
      //       const elements = Timeless.SlateDOM.buildInnerHTML(children);
      //       _editorElement.appendChild(elements);
    }, 0);
  };

  const getEditorContent = () => {
    if (!editor$ || !_editorReady) {
      return "";
    }
    const children = editor$.state.children;
    return serializeEditorContent(children);
  };

  const handleSubmit = () => {
    const content = getEditorContent();
    const cleanContent = content.trim();
    if (!cleanContent) {
      return;
    }
    this.addMemo(cleanContent);
    if (editor$) {
      editor$.methods.refresh();
    }
  };

  return {
    
  };
}

function serializeEditorContent(children) {
  let result = "";
  for (const child of children) {
    if (child.type === "text" || child.type === "TEXT") {
      result += child.text || "";
    } else if (child.children) {
      result += serializeEditorContent(child.children);
    }
  }
  return result;
}
