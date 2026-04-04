import { h, View, Txt } from "@timeless/timeless";
import { render } from "@timeless/timeless-dom";

function ApplicationView() {
  return View(
    {
      style: {
        width: 400,
        height: 300,
        backgroundColor: "rgba(30, 30, 30, 1)",
        borderColor: "rgba(100, 150, 255, 1)",
        borderWidth: 3,
      },
    },
    [
      View(
        {
          style: {
            fontSize: 24,
            fontWeight: "bold",
            color: "rgba(255, 255, 255, 1)",
            paddingTop: 20,
            paddingLeft: 20,
          },
        },
        ["Hello Canvas!"],
      ),
      View(
        {
          style: {
            width: 360,
            height: 80,
            backgroundColor: "rgba(50, 50, 80, 1)",
            borderColor: "rgba(150, 150, 200, 1)",
            borderWidth: 2,
          },
        },
        [
          View(
            {
              style: {
                fontSize: 16,
                color: "rgba(200, 200, 255, 1)",
                paddingTop: 10,
                paddingLeft: 10,
              },
            },
            ["This is a test of the canvas renderer"],
          ),
          View(
            {
              style: {
                fontSize: 14,
                color: "rgba(150, 255, 150, 1)",
                paddingTop: 10,
                paddingLeft: 10,
              },
            },
            ["Box model + text rendering"],
          ),
        ],
      ),
      View(
        {
          style: {
            width: 360,
            height: 60,
            backgroundColor: "rgba(80, 50, 50, 1)",
            borderColor: "rgba(255, 100, 100, 1)",
            borderWidth: 2,
          },
        },
        [
          View(
            {
              style: {
                fontSize: 18,
                color: "rgba(255, 200, 200, 1)",
                paddingTop: 15,
                paddingLeft: 10,
              },
            },
            ["Another box with text"],
          ),
        ],
      ),
    ],
  );
}

render(ApplicationView(), document.getElementById("root"));
