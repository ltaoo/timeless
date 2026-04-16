import { View, Flex, Icon } from "@timeless/timeless";
import { Card } from "@timeless/shadcn";

export default function AdminDashboardView(props) {
  return View(
    {
      style: {
        padding: "24px",
      },
    },
    [
      View(
        {
          style: {
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "24px",
          },
        },
        ["Dashboard"],
      ),
      Flex(
        {
          gap: "16px",
          wrap: "wrap",
        },
        [
          Card(
            {
              style: {
                padding: "24px",
                minWidth: "200px",
              },
            },
            [
              View(
                {
                  style: {
                    fontSize: "32px",
                    fontWeight: "bold",
                  },
                },
                ["1,234"],
              ),
              View(
                {
                  style: {
                    color: "#71717a",
                  },
                },
                ["Total Users"],
              ),
            ],
          ),
          Card(
            {
              style: {
                padding: "24px",
                minWidth: "200px",
              },
            },
            [
              View(
                {
                  style: {
                    fontSize: "32px",
                    fontWeight: "bold",
                  },
                },
                ["567"],
              ),
              View(
                {
                  style: {
                    color: "#71717a",
                  },
                },
                ["Active Sessions"],
              ),
            ],
          ),
          Card(
            {
              style: {
                padding: "24px",
                minWidth: "200px",
              },
            },
            [
              View(
                {
                  style: {
                    fontSize: "32px",
                    fontWeight: "bold",
                  },
                },
                ["89%"],
              ),
              View(
                {
                  style: {
                    color: "#71717a",
                  },
                },
                ["Uptime"],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}
