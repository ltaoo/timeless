/**
 * Admin Layout
 */
import {
  View,
  Show,
  For,
  Icon,
  Button,
  Flex,
  Img,
  ref,
  refobj,
  computed,
  classNames,
  styleNames,
  ui,
} from "@timeless/timeless";
import { render, platform } from "@timeless/timeless-dom";

export default function AdminLayoutView(props) {
  return View(
    {
      style: {
        display: "flex",
        height: "100%",
      },
    },
    [
      View(
        {
          style: {
            width: "240px",
            borderRight: "1px solid #e4e4e7",
            display: "flex",
            flexDirection: "column",
          },
        },
        [
          View(
            {
              style: {
                padding: "24px 16px",
                fontWeight: "bold",
                fontSize: "18px",
              },
            },
            ["Admin"],
          ),
          View(
            {
              style: {
                flex: 1,
                padding: "8px",
              },
            },
            [
              For({
                each: [
                  {
                    title: "Dashboard",
                    name: "admin.dashboard",
                    icon: "grid-3x3",
                  },
                  { title: "Users", name: "admin.users", icon: "users" },
                  { title: "Roles", name: "admin.roles", icon: "shield" },
                  { title: "Logs", name: "admin.logs", icon: "file-text" },
                  { title: "System", name: "admin.system", icon: "settings" },
                ],
                render(menu) {
                  return View(
                    {
                      style: {
                        padding: "8px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      },
                      class: "hover:bg-zinc-100",
                      onClick() {
                        props.history.push(menu.name);
                      },
                    },
                    [
                      Icon({ name: menu.icon, size: 18 }),
                      View({}, [menu.title]),
                    ],
                  );
                },
              }),
            ],
          ),
        ],
      ),
      View(
        {
          style: {
            flex: 1,
            overflow: "auto",
          },
        },
        [KeepAliveSubViews(props)],
      ),
    ],
  );
}

function KeepAliveSubViews(props) {
  const view = props.view;
  const components = view?.views || [];

  return View({}, [
    For({
      each: components,
      render(child) {
        const ViewComponent = props.views[child.name];
        return Show({
          when: !!ViewComponent,
          ok() {
            return ViewComponent({
              view: child,
              history: props.history,
              views: props.views,
              app: props.app,
              storage: props.storage,
              client: props.client,
              NotFound: props.NotFound,
              ErrorFallback: props.ErrorFallback,
            });
          },
        });
      },
    }),
  ]);
}
