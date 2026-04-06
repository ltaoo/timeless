export default {
  tag: "svg",
  attrs: {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    class: "lucide lucide-sun-icon lucide-sun",
  },
  children: [
    {
      tag: "circle",
      attrs: {
        cx: "12",
        cy: "12",
        r: "4",
      },
    },
    {
      tag: "path",
      attrs: {
        d: "M12 2v2",
      },
    },
    {
      tag: "path",
      attrs: {
        d: "M12 20v2",
      },
    },
    {
      tag: "path",
      attrs: {
        d: "m4.93 4.93 1.41 1.41",
      },
    },
    {
      tag: "path",
      attrs: {
        d: "m17.66 17.66 1.41 1.41",
      },
    },
    {
      tag: "path",
      attrs: {
        d: "M2 12h2",
      },
    },
    {
      tag: "path",
      attrs: {
        d: "M20 12h2",
      },
    },
    {
      tag: "path",
      attrs: {
        d: "m6.34 17.66-1.41 1.41",
      },
    },
    {
      tag: "path",
      attrs: {
        d: "m19.07 4.93-1.41 1.41",
      },
    },
  ],
} as const;
