import { CHAT_ITEMS } from "@/data/content.js";

/** @param {ViewComponentProps} props */
export function MessagePageModel(props) {
  const chats_ = refarr(CHAT_ITEMS.map((chat) => ({ ...chat })));
  const query_ = ref("");
  const filtered_chats_ = derive(
    { chats: chats_, query: query_ },
    ({ chats, query }) => {
      const keyword = query.trim().toLowerCase();
      if (!keyword) return chats;
      return chats.filter(
        (chat) =>
          chat.name.toLowerCase().includes(keyword) ||
          chat.text.toLowerCase().includes(keyword),
      );
    },
  );

  const methods = {
    set_query(value) {
      query_.as(value);
    },
    open_chat(chat) {
      chats_.as(
        chats_.value.map((item) =>
          item.id === chat.id ? { ...item, unread: 0 } : item,
        ),
      );
      props.app_model.methods.navigate("chat", { chat });
    },
    open_feature(name) {
      props.app_model.methods.notify(`${name}页面已打开`);
    },
    create_chat() {
      props.app_model.methods.notify("发起群聊");
    },
  };

  return defineModel({
    state: { chats: chats_, query: query_, filtered_chats: filtered_chats_ },
    methods,
    listeners: [() => filtered_chats_.destroy()],
  });
}
