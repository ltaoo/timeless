import { CHAT_ITEMS } from "@/data/content.js";

/** @param {ViewComponentProps} props */
export function ChatPageModel(props) {
  const chat_ = ref(props.app_model.state.selected_chat.value || CHAT_ITEMS[0]);
  const draft_ = ref("");
  const messages_ = refarr([
    {
      id: "message-1",
      mine: false,
      text: "嗨，看到你点赞了我的视频，谢谢喜欢！",
      time: "昨天 18:34",
    },
    {
      id: "message-2",
      mine: true,
      text: "画面真的很有氛围感，已经关注啦～",
      time: "昨天 18:36",
    },
    {
      id: "message-3",
      mine: false,
      text: chat_.value.text,
      time: "今天 14:28",
    },
  ]);

  const methods = {
    set_draft(value) {
      draft_.as(value);
    },
    send() {
      const text = draft_.value.trim();
      if (!text) return;
      messages_.push({
        id: `message-${Date.now()}`,
        mine: true,
        text,
        time: "刚刚",
      });
      draft_.as("");
    },
    back() {
      props.app_model.methods.back("message");
    },
    call() {
      props.app_model.methods.notify("正在呼叫对方…");
    },
    more() {
      props.app_model.methods.notify("聊天设置");
    },
  };

  return defineModel({
    state: { chat: chat_, draft: draft_, messages: messages_ },
    methods,
  });
}
