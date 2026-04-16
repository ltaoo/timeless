import {
  Show,
  Grid,
  View,
  For,
  Icon,
  Input,
  Button,
  Popper,
  Portal,
  Fragment,
  Img,
  Checkbox,
  FilePicker,
  Select,
  NumberInput,
  DismissableLayer,
  ref,
  styleNames,
  combine,
  computed,
  refarr,
  refobj,
  getobj,
  classNames,
  Label,
  Row,
  Column,
} from "@timeless/timeless";
import { patch } from "@timeless/timeless";
import { render, platform } from "@timeless/timeless-dom";

import Page from "./pages/index.js";

const apps = [
  { icon: "🎬", title: "Movies", subtitle: "Movies & Shows" },
  { icon: "🎵", title: "Music", subtitle: "Your Favorites" },
  { icon: "📷", title: "Photos", subtitle: "Photo Library" },
  { icon: "📡", title: "Live TV", subtitle: "200+ Channels" },
  { icon: "🎮", title: "Games", subtitle: "Play & Compete" },
  { icon: "⚙️", title: "Settings", subtitle: "Preferences" },
  { icon: "⛅", title: "Weather", subtitle: "5-Day Forecast" },
  { icon: "🛒", title: "Store", subtitle: "Discover Apps" },
  { icon: "💪", title: "Fitness", subtitle: "Track Workouts" },
  { icon: "📰", title: "News", subtitle: "Headlines" },
  { icon: "🧸", title: "Kids", subtitle: "Family Friendly" },
  { icon: "🌐", title: "Browser", subtitle: "Surf the Web" },
];

function ApplicationView() {
  const page = ref("todo");
  const count_ = ref(0);
  const visible_ = ref(false);
  const popper_ = refobj({
    x: 0,
    y: 0,
    placed: false,
  });
  const columns = 4;
  const focused = ref({ x: 0, y: 0 });
  const keyword_ = ref("");
  const todo_ = ref("");
  const todos_ = refarr([
    {
      id: 1,
      title: "Buy groceries",
      completed: true,
    },
    {
      id: 2,
      title: "Study for exam exam exam",
      completed: false,
    },
    {
      id: 3,
      title: "Read a book",
      completed: false,
    },
  ]);
  const selected_fruit_ = ref("apple");
  const text = ["Hello", "Timeless"];
  const icon_name_ = ref("info");
  const toasts = refarr([View({}, ["Initial"])]);

  const dissmissable$ = DismissableLayer();

  function handleSelectCard(idx) {
    focused.set(xyFromIdx(idx));
  }
  function xyFromIdx(idx) {
    return { x: idx % columns, y: Math.floor(idx / columns) };
  }

  function maxXAtRow(y) {
    const maxY = Math.floor((apps.length - 1) / columns);
    if (y === maxY) return (apps.length - 1) % columns;
    return columns - 1;
  }

  function moveFocus(direction) {
    focused.as((prev) => {
      const maxY = Math.floor((apps.length - 1) / columns);
      let { x, y } = prev;

      if (direction === "left") {
        if (x > 0) x -= 1;
        else if (y > 0) {
          y -= 1;
          x = maxXAtRow(y);
        }
      }

      if (direction === "right") {
        const maxX = maxXAtRow(y);
        if (x < maxX) x += 1;
        else if (y < maxY) {
          y += 1;
          x = 0;
        }
      }

      if (direction === "up") {
        if (y > 0) {
          y -= 1;
          x = Math.min(x, maxXAtRow(y));
        }
      }

      if (direction === "down") {
        if (y < maxY) {
          y += 1;
          x = Math.min(x, maxXAtRow(y));
        }
      }

      return { x, y };
    });
  }

  /**
   * @param {{ x: number, y: number }} pos
   * @param {number} idx
   * @returns
   */
  function isFocusedCell(pos, idx) {
    const { x, y } = xyFromIdx(idx);
    // console.log(`[${pos.x},${pos.y}] is ${idx}, ${x},${y}`);
    return pos.x === x && pos.y === y;
  }

  function handleClick(event) {
    const { x, y } = event;
    if (!popper_.value.placed) {
      return;
    }
    const bingo = dissmissable$.isBingo({
      x,
      y,
    });
    console.log(x, y, popper_.value.placed, bingo);
    if (!bingo) {
      return;
    }
    visible_.as(false);
    popper_.assign({
      placed: false,
    });
  }

  platform.addEventListener("keydown", handleKeydown);
  platform.addEventListener("click", handleClick);

  function handleKeydown(event) {
    const { key } = event;
    // console.log("handleKeydown", key);
    if (key === "ArrowLeft") {
      moveFocus("left");
    }
    if (key === "ArrowRight") {
      moveFocus("right");
    }
    if (key === "ArrowUp") {
      moveFocus("up");
    }
    if (key === "ArrowDown") {
      moveFocus("down");
    }
  }

  return View(
    {
      style: {
        color: "#fff",
      },
      class: classNames([
        "page",
        computed(keyword_, (t) => {
          return t.includes("_new") ? "updated" : "origin";
        }),
      ]),
      onMounted() {},
    },
    [
      Page({ title: "A" }, [View({}, ["Page A"])]),
      Page({ title: "B" }, [View({}, ["Page B"])]),
      // Input({
      //   value: "Hello Timeless",
      //   onMounted(event) {
      //     console.log("the input mounted", event.target.get$elm()?.value);
      //   },
      //   onInput(event) {
      //     console.log("onInput", event.target.value);
      //   }
      // }),
      // Column(
      //   {
      //     gap: 4,
      //     style: {
      //       padding: "16px",
      //     },
      //   },
      //   [
      //     Label({ for: "keyword" }, ["Keyword"]),
      //     Row({ gap: 4 }, [
      //       Input({
      //         id: "keyword",
      //         value: keyword_,
      //         onInput(event) {
      //           // console.log("input onChange", event.target.value);
      //           keyword_.as(event.target.value);
      //         },
      //       }),
      //       Button(
      //         {
      //           onClick() {
      //             keyword_.as((prev) => prev + "_new");
      //           },
      //         },
      //         ["Search"],
      //       ),
      //     ]),
      //   ],
      // ),
      // Column(
      //   {
      //     style: {
      //       padding: "16px",
      //     },
      //   },
      //   [View({}, ["Search Result List"])],
      // ),
      // Show({
      //   when: visible_,
      //   ok() {
      //     return [
      //       For({
      //         each: todos_,
      //         render(fruit) {
      //           return View(
      //             {
      //               class: "text-2xl font-medium",
      //               style: {
      //                 color: "#fff",
      //               },
      //               onMounted() {
      //                 console.log("[fruit] onMounted");
      //               },
      //               onUnmounted() {
      //                 console.log("[fruit] onUnmounted");
      //               },
      //             },
      //             [fruit.title],
      //           );
      //         },
      //       }),
      //     ];
      //   },
      // }),
      // View(
      //   {
      //     style: computed(visible_, (t) => {
      //       return t ? { color: "red" } : {};
      //     }),
      //     onClick() {
      //       visible_.as(!visible_.value);
      //     },
      //   },
      //   ["Hello"],
      // ),
      // Select(
      //   {
      //     options: [
      //       {
      //         label: "Apple",
      //         value: "apple",
      //       },
      //       {
      //         label: "Banana",
      //         value: "banana",
      //       },
      //       {
      //         label: "Orange",
      //         value: "orange",
      //       },
      //     ],
      //     value: selected_fruit_,
      //     placeholder: "Select an app",
      //   },
      //   [
      //     View(
      //       {
      //         class: "text-2xl font-medium",
      //         style: {
      //           color: "#fff",
      //         },
      //       },
      //       [selected_fruit_.value],
      //     ),
      //   ],
      // ),
      // FilePicker({
      //   class: "w-full",
      // }),
      // NumberInput({
      //   class: "w-full",
      // }),
      // Show({
      //   when: visible_,
      //   ok() {
      //     return Fragment(
      //       {
      //         onMounted() {
      //           console.log("[fragment] hello wrap onMounted");
      //         },
      //       },
      //       [
      //         View(
      //           {
      //             onMounted() {
      //               console.log("[hello] onMounted");
      //             },
      //           },
      //           ["Hello"],
      //         ),
      //       ],
      //     );
      //   },
      // }),
      // View(
      //   {
      //     style: styleNames([
      //       {
      //         color: "red",
      //       },
      //       computed(visible_, (t) => {
      //         return t ? { display: "block" } : { display: "none" };
      //       }),
      //     ]),
      //   },
      //   ["Hello"],
      // ),
      // Input({
      //   class: "w-full",
      //   placeholder: "Add a todo todo",
      //   value: todo_,
      //   onMounted() {
      //     console.log("[Input] onMounted");
      //   },
      //   onChange(event) {
      //     todo_.as(event.target.value);
      //   },
      // }),
      // Button(
      //   {
      //     onMounted() {
      //       console.log("[Button] onMounted");
      //     },
      //     onClick() {
      //       // visible_.as((prev) => {
      //       //   return !prev;
      //       // });
      //       const v = todo_.value;
      //       todo_.as("");
      //       if (!v) {
      //         alert("must input todo");
      //         return;
      //       }
      //       todos_.push({
      //         id: todos_.length,
      //         completed: false,
      //         title: v,
      //       });
      //     },
      //   },
      //   ["Add Todo"],
      // ),
      // Button(
      //   {
      //     onClick() {
      //       const v = todo_.value;
      //       if (!v) {
      //         return;
      //       }
      //       todo_.as("");
      //       todos_.unshift({
      //         id: todos_.length,
      //         completed: false,
      //         title: v,
      //       });
      //     },
      //   },
      //   ["Unshift Todo"],
      // ),
      // Button(
      //   {
      //     onClick() {
      //       todos_.as([
      //         {
      //           id: 2,
      //           title: "Study for exam exam exam",
      //           completed: false,
      //         },
      //         {
      //           id: 1,
      //           title: "Buy groceries_update",
      //           completed: true,
      //         },
      //         {
      //           id: 4,
      //           title: "Sleep",
      //           completed: false,
      //         },
      //       ]);
      //     },
      //   },
      //   ["Refresh"],
      // ),
      // For({
      //   key: "id",
      //   each: todos_,
      //   render(todo, idx) {
      //     return View(
      //       {
      //         style: {
      //           display: "flex",
      //         },
      //       },
      //       [
      //         Checkbox({
      //           checked: computed(todo, (t) => t.completed),
      //           onChange(event) {
      //             const todo$ = getobj(todo);
      //             if (todo$) {
      //               todo$.set("completed", event.target.checked);
      //             }
      //           },
      //         }),
      //         View(
      //           {
      //             style: {
      //               color: "#fff",
      //               "text-decoration": computed(todo, (t) =>
      //                 t.completed ? "line-through" : "none",
      //               ),
      //             },
      //           },
      //           [idx, " ", computed(todo, (t) => t.title)],
      //         ),
      //         View(
      //           {
      //             class: "icon",
      //             style: {
      //               color: "#fff",
      //               cursor: "pointer",
      //             },
      //             onClick() {
      //               todos_.remove(todo);
      //             },
      //           },
      //           [Icon({ name: "trash", color: "#fff", size: 16 })],
      //         ),
      //         View(
      //           {
      //             class: "icon",
      //             style: {
      //               color: "#fff",
      //               cursor: "pointer",
      //             },
      //             onClick() {
      //               todos_.up(idx);
      //             },
      //           },
      //           [Icon({ name: "chevron-up", color: "#fff", size: 16 })],
      //         ),
      //         View(
      //           {
      //             class: "icon",
      //             style: {
      //               color: "#fff",
      //               cursor: "pointer",
      //             },
      //             onClick() {
      //               todos_.down(idx);
      //             },
      //           },
      //           [Icon({ name: "chevron-down", color: "#fff", size: 16 })],
      //         ),
      //       ],
      //     );
      //   },
      //   onMounted() {
      //     console.log("[Todo For] onMounted");
      //   },
      // }),
      // Img({
      //   src: "/public/avatar.jpeg",
      //   style: {
      //     width: "60px",
      //     height: "60px",
      //   },
      // }),
      // View(
      //   {
      //     style: {
      //       padding: "20px",
      //     },
      //   },
      //   [
      //     Button(
      //       {
      //         onMounted(event) {
      //           // console.log(event.target);
      //           const { x, y, width, height } =
      //             event.target.getBoundingClientRect();
      //           dissmissable$.addIgnore({
      //             x,
      //             y,
      //             width,
      //             height,
      //           });
      //           popper_.as({
      //             x: x,
      //             y: y + height + 2,
      //             placed: false,
      //           });
      //         },
      //         onClick(event) {
      //           // event.stopPropagation();
      //           visible_.as((prev) => {
      //             return !prev;
      //           });
      //           popper_.assign({
      //             placed: true,
      //           });
      //         },
      //       },
      //       ["Click it"],
      //     ),
      //   ],
      // ),
      // Show({
      //   when: visible_,
      //   onMounted() {
      //     console.log("[Show] onMounted");
      //   },
      //   onUnmounted() {
      //     console.log("[Show] onUnmounted");
      //   },
      //   ok() {
      //     return Portal(
      //       {
      //         onMounted() {
      //           console.log("[Portal in Show] onMounted");
      //         },
      //         onUnmounted() {
      //           console.log("[Portal in Show] onUnmounted");
      //         },
      //       },
      //       [
      //         Popper(
      //           {
      //             placement: "top",
      //             strategy: "absolute",
      //             x: computed(popper_, (t) => t.x),
      //             y: computed(popper_, (t) => t.y),
      //             placed: computed(popper_, (t) => t.placed),
      //             onMounted(event) {
      //               const rect = event.target.getBoundingClientRect();
      //               console.log("[Popper in Portal] onMounted", rect);
      //             },
      //             onUnmounted() {
      //               console.log("[Popper in Portal] onUnmounted");
      //             },
      //           },
      //           [
      //             View(
      //               {
      //                 style: {
      //                   "background-color": "#fff",
      //                 },
      //                 onMounted(event) {
      //                   const rect = event.target.getBoundingClientRect();
      //                   console.log("[View in Popper] onMounted", rect);
      //                   dissmissable$.addIgnore({
      //                     x: rect.x,
      //                     y: rect.y,
      //                     width: rect.width,
      //                     height: rect.height,
      //                   });
      //                 },
      //                 onUnmounted() {
      //                   console.log("[View in Popper] onUnmounted");
      //                 },
      //               },
      //               [
      //                 View(
      //                   {
      //                     onMounted() {
      //                       console.log("text1 in View mounted");
      //                     },
      //                   },
      //                   ["first content in body"],
      //                 ),
      //                 View(
      //                   {
      //                     onMounted(event) {
      //                       console.log(
      //                         "text2 in View mounted",
      //                         event.target.getBoundingClientRect(),
      //                       );
      //                     },
      //                   },
      //                   ["second content in body"],
      //                 ),
      //               ],
      //             ),
      //           ],
      //         ),
      //       ],
      //     );
      //   },
      // }),
      // View(
      //   {
      //     style: {
      //       color: "#fff",
      //     },
      //   },
      //   [count_],
      // ),
      // Input({
      //   placeholder: "Search",
      //   value: keyword_,
      //   onMounted(event) {
      //     console.log("the input mounted", event.target);
      //   },
      // }),
      // Button(
      //   {
      //     onClick() {
      //       const v = keyword_.value;
      //       console.log("click button", v);
      //     },
      //   },
      //   ["Click it"],
      // ),
      // View(
      //   {
      //     class: "navigation",
      //   },
      //   [
      //     View(
      //       {
      //         class: "navigate-to",
      //         style: {
      //           color: "white",
      //         },
      //         onClick() {
      //           page.set("todo");
      //         },
      //       },
      //       ["Goto Todo List"],
      //     ),
      //     View(
      //       {
      //         class: "navigate-to",
      //         style: {
      //           color: "white",
      //         },
      //         onClick() {
      //           console.log("click app");
      //           page.set("app");
      //         },
      //       },
      //       ["Goto Application List"],
      //     ),
      //   ],
      // ),
      // Show({
      //   when: computed(page, (t) => t === "todo"),
      //   ok() {
      //     return [
      //       View(
      //         {
      //           class: "subpage-title",
      //         },
      //         ["Todo List Page"],
      //       ),
      //       For({
      //         each: todos_,
      //         render(todo) {
      //           return View({}, [todo.title]);
      //         },
      //       }),
      //     ];
      //   },
      // }),
      // Show({
      //   when: computed(page, (t) => t === "app"),
      //   ok() {
      //     return [
      //       View(
      //         {
      //           class: "subpage-title",
      //         },
      //         ["Application List Page"],
      //       ),
      //       Grid(
      //         { columns, gap: 16 },
      //         apps.map((app, idx) => {
      //           return View(
      //             {
      //               style: {
      //                 "border-style": "solid",
      //                 "border-width": "2px",
      //                 "border-color": combine({ focused, idx }, (t) => {
      //                   return isFocusedCell(t.focused, t.idx)
      //                     ? "#007bff"
      //                     : "rgba(255,255,255,0.18)";
      //                 }),
      //               },
      //               onClick() {
      //                 handleSelectCard(idx.value);
      //               },
      //             },
      //             [
      //               View(
      //                 { style: { "text-align": "center", "font-size": 22 } },
      //                 [app.icon],
      //               ),
      //               View(
      //                 {
      //                   style: {
      //                     "text-align": "center",
      //                     "font-weight": "bold",
      //                     fontSize: 14,
      //                   },
      //                 },
      //                 [app.title],
      //               ),
      //               View(
      //                 {
      //                   style: {
      //                     "text-align": "center",
      //                     "font-size": 12,
      //                     color: "gray",
      //                   },
      //                 },
      //                 [app.subtitle],
      //               ),
      //             ],
      //           );
      //         }),
      //       ),
      //     ];
      //   },
      // }),
    ],
  );
}

const elm = ApplicationView({});
console.log(elm);
render(elm, document.getElementById("root"), {
  onVNodeTreeCreated(data) {
    console.log(data);
  },
});
