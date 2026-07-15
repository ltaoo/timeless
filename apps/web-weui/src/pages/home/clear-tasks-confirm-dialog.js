export function ClearTasksConfirmDialog(props) {
  const title = "清空下载记录";
  const message = "确定删除全部下载任务记录？此操作不可恢复。";
  const checkboxLabel = "同时删除已下载的文件";
  const checkboxStyle = computed(
    props.store.state.delete_delete_files,
    (checked) => {
      return {
        width: "18px",
        height: "18px",
        "box-sizing": "border-box",
        "border-radius": "4px",
        border: "1px solid " + (checked ? "#07C160" : "var(--weui-FG-3)"),
        background: checked ? "#07C160" : "transparent",
        color: "#fff",
        display: "inline-flex",
        "align-items": "center",
        "justify-content": "center",
        flex: "0 0 auto",
      };
    },
  );

  return Dialog(
    {
      store: props.store.ui.clearConfirmDialog$,
    },
    [
      View({ style: { padding: "20px 20px 16px" } }, [
        View(
          {
            style: {
              "font-size": "17px",
              "font-weight": "600",
              "line-height": "24px",
              "margin-bottom": "8px",
            },
          },
          [title],
        ),
        View(
          {
            style: {
              "font-size": "14px",
              "line-height": "20px",
              color: "var(--weui-FG-1)",
              "margin-bottom": "16px",
            },
          },
          [message],
        ),
        View(
          {
            role: "checkbox",
            tabIndex: "0",
            attributes: {
              "aria-checked": computed(
                props.store.state.delete_delete_files,
                (checked) => (checked ? "true" : "false"),
              ),
            },
            style: {
              display: "flex",
              "align-items": "center",
              gap: "10px",
              padding: "10px 0",
              cursor: "pointer",
              "user-select": "none",
              "font-size": "14px",
              "line-height": "20px",
            },
            onClick() {
              props.store.methods.handleClickCheckboxConfirmDeleteFiles();
            },
          },
          [
            View({ style: checkboxStyle }, [
              Show({
                when: props.store.state.delete_delete_files,
                ok() {
                  return Icon({ name: "check", size: 14 });
                },
              }),
            ]),
            View({}, [checkboxLabel]),
          ],
        ),
      ]),
    ],
  );
}
