import { AvatarView, BackButtonView } from "@/components/common.js";
import { ChatPageModel } from "./chat.model.js";

/** @param {ViewComponentProps} props */
export default function ChatPageView(props) {
  const vm$ = ChatPageModel(props);
  const chat = vm$.state.chat.value;
  let chat_list_element = null;
  let unlisten_messages = null;

  function scroll_to_bottom() {
    globalThis.requestAnimationFrame(() => {
      if (chat_list_element) {
        chat_list_element.scrollTop = chat_list_element.scrollHeight;
      }
    });
  }

  return View(
    {
      class: "page page-light chat-page",
      onUnmounted() {
        unlisten_messages?.();
        vm$.destroy();
      },
    },
    [
      View({ class: "chat-header" }, [
        BackButtonView({ class: "chat-back", onClick: vm$.methods.back }),
        View({ class: "chat-header-person" }, [
          View({ class: "chat-header-name" }, [chat.name]),
          View({ class: "chat-online" }, ["在线"]),
        ]),
        View({ class: "chat-header-actions" }, [
          View({ class: "chat-header-icon", onClick: vm$.methods.call }, ["⌕"]),
          View({ class: "chat-header-icon", onClick: vm$.methods.more }, [
            "•••",
          ]),
        ]),
      ]),
      View(
        {
          class: "chat-messages",
          onMounted(event) {
            const host = event.target;
            chat_list_element = host?.get$elm?.() || host;
            unlisten_messages = vm$.state.messages.subscribe({
              onPatch: scroll_to_bottom,
              onChange: scroll_to_bottom,
            });
            scroll_to_bottom();
          },
          onUnmounted() {
            unlisten_messages?.();
            unlisten_messages = null;
            chat_list_element = null;
          },
        },
        [
          View({ class: "chat-day" }, ["昨天"]),
          For({
            each: vm$.state.messages,
            render(message) {
              return View(
                {
                  class: message.mine
                    ? "chat-bubble-row mine"
                    : "chat-bubble-row",
                },
                [
                  message.mine
                    ? null
                    : AvatarView({
                        class: "bubble-avatar",
                        src: chat.avatar,
                        alt: chat.name,
                      }),
                  View(
                    {
                      class: message.mine ? "chat-bubble mine" : "chat-bubble",
                    },
                    [message.text],
                  ),
                  message.mine
                    ? AvatarView({
                        class: "bubble-avatar",
                        src: "/media/avatars/head-image.jpeg",
                        alt: "我",
                      })
                    : null,
                ],
              );
            },
          }),
        ],
      ),
      View({ class: "chat-composer" }, [
        View({ class: "chat-composer-action" }, ["◉"]),
        Input({
          class: "chat-input",
          value: vm$.state.draft,
          placeholder: "发消息...",
          onInput(event) {
            vm$.methods.set_draft(event.target.value);
          },
        }),
        View({ class: "chat-composer-action" }, ["☺"]),
        Show({
          when: computed(vm$.state.draft, (text) => Boolean(text.trim())),
          ok() {
            return View({ class: "chat-send", onClick: vm$.methods.send }, [
              "发送",
            ]);
          },
          else() {
            return View({ class: "chat-composer-action" }, ["+"]);
          },
        }),
      ]),
    ],
  );
}
