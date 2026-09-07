import { BottomNavigationView } from "@/components/bottom-navigation.js";
import { AvatarView, EmptyStateView } from "@/components/common.js";
import { MessagePageModel } from "./index.model.js";

function MessageShortcutView(props) {
  return View(
    {
      class: "message-shortcut",
      onClick() {
        props.vm$.methods.open_feature(props.label);
      },
    },
    [
      View({ class: `message-shortcut-icon ${props.class || ""}` }, [
        props.icon,
      ]),
      View({ class: "message-shortcut-label" }, [props.label]),
    ],
  );
}

function ChatRowView(props) {
  const { chat, vm$ } = props;
  return View(
    {
      class: "chat-row",
      onClick() {
        vm$.methods.open_chat(chat);
      },
    },
    [
      View({ class: "chat-avatar-wrap" }, [
        AvatarView({ class: "chat-avatar", src: chat.avatar, alt: chat.name }),
        chat.unread
          ? View({ class: "chat-unread", as: "span" }, [String(chat.unread)])
          : null,
      ]),
      View({ class: "chat-row-body" }, [
        View({ class: "chat-row-top" }, [
          View({ class: "chat-name" }, [chat.name]),
          View({ class: "chat-time" }, [chat.time]),
        ]),
        View({ class: "chat-preview" }, [chat.text]),
      ]),
    ],
  );
}

/** @param {ViewComponentProps} props */
export default function MessagePageView(props) {
  const vm$ = MessagePageModel(props);
  return View(
    {
      class: "page page-light message-page",
      onUnmounted() {
        vm$.destroy();
      },
    },
    [
      View({ class: "message-header" }, [
        View({ class: "message-header-action" }, [
          Icon({ name: "users", size: 24 }),
        ]),
        View({ class: "message-title" }, ["消息"]),
        View(
          { class: "message-header-action", onClick: vm$.methods.create_chat },
          [Icon({ name: "plus", size: 26 })],
        ),
      ]),
      View({ class: "message-search" }, [
        Icon({ name: "search", size: 18 }),
        Input({
          class: "message-search-input",
          value: vm$.state.query,
          placeholder: "搜索",
          onInput(event) {
            vm$.methods.set_query(event.target.value);
          },
        }),
      ]),
      View({ class: "message-scroll" }, [
        View({ class: "message-shortcuts" }, [
          MessageShortcutView({
            vm$,
            icon: "♥",
            label: "互动消息",
            class: "pink",
          }),
          MessageShortcutView({
            vm$,
            icon: "@",
            label: "新关注",
            class: "blue",
          }),
          MessageShortcutView({
            vm$,
            icon: "◉",
            label: "朋友动态",
            class: "orange",
          }),
          MessageShortcutView({
            vm$,
            icon: "⌁",
            label: "状态",
            class: "purple",
          }),
        ]),
        View({ class: "message-section-title" }, ["聊天"]),
        Show({
          when: computed(vm$.state.filtered_chats, (items) => items.length > 0),
          ok() {
            return View({ class: "chat-list" }, [
              For({
                each: vm$.state.filtered_chats,
                render(chat) {
                  return ChatRowView({ chat, vm$ });
                },
              }),
            ]);
          },
          else() {
            return EmptyStateView({
              icon: "⌕",
              title: "没有相关消息",
              text: "试试搜索其他昵称",
            });
          },
        }),
      ]),
      BottomNavigationView({ app_model: props.app_model, theme: "light" }),
    ],
  );
}
