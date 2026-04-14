import {
  View,
  ref,
  computed,
  Img,
  Button,
  Input,
  Checkbox,
  Row,
  Column,
  Textarea,
  NumberInput,
  Radio,
  Select,
  Icon,
  AspectRatio,
} from "@timeless/timeless";
import { render, TimelessNativeVersion } from "@timeless/timeless-native";

function SectionTitle(text) {
  return View(
    {
      style: {
        "font-size": "16px",
        "font-weight": "bold",
        "margin-bottom": "8px",
      },
    },
    [text],
  );
}

function ApplicationView() {
  const count_ = ref(0);
  const input_ = ref("");
  const agreed = ref(false);
  const subscribe = ref(false);
  const textareaContent_ = ref("");
  const numberValue_ = ref("");
  const selectedFruit_ = ref("apple");
  const selectedColor_ = ref("Red");

  return View(
    {
      style: { padding: "20px" },
      onMounted() {
        console.log("[macOS Demo] onMounted");
        const timer = setInterval(() => {
          count_.as((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
      },
    },
    [
      // Title & version
      View(
        {
          style: {
            "font-size": "24px",
            "font-weight": "bold",
            "margin-bottom": "16px",
          },
        },
        ["Timeless macOS Demo"],
      ),
      View({}, [TimelessNativeVersion]),
      View({ style: { "margin-bottom": "12px", color: "#666" } }, [
        "Counter: ",
        count_,
      ]),

      // ── Image ──────────────────────────────────────────────
      SectionTitle("Image:"),
      View({ style: { width: "200px", "margin-bottom": "12px" } }, [
        AspectRatio({ ratio: 16 / 9 }, [
          Img({
            src: "https://picsum.photos/200/120",
          }),
        ]),
      ]),

      // ── Icon (SF Symbols) ──────────────────────────────────
      SectionTitle("Icon (SF Symbols):"),
      Row({ gap: 12, style: { "margin-bottom": "12px" } }, [
        Icon({ name: "star.fill", color: "#FFB800", size: 28 }),
        Icon({ name: "heart.fill", color: "#FF3B30", size: 28 }),
        Icon({ name: "house.fill", color: "#007AFF", size: 28 }),
        Icon({ name: "gear", color: "#8E8E93", size: 28 }),
        Icon({ name: "person.circle.fill", color: "#34C759", size: 28 }),
      ]),

      // ── Row ────────────────────────────────────────────────
      SectionTitle("Row (horizontal layout with gap):"),
      Row({ gap: 8, style: { "margin-bottom": "12px" } }, [
        Button({ style: { "flex-basis": "16.67%" } }, ["Alpha"]),
        Button({ style: { "flex-grow": "1" } }, ["Beta"]),
        Button({ style: { width: 120 } }, ["Gamma"]),
      ]),

      // ── Column ─────────────────────────────────────────────
      SectionTitle("Column (vertical layout with gap):"),
      View(
        {
          style: {
            gap: 6,
            height: 320,
            "margin-bottom": "12px",
          },
        },
        [
          Button({ style: { "flex-basis": "16.67%" } }, ["First"]),
          Button({ style: { "flex-grow": "1" } }, ["Second"]),
          Button({ style: { height: 120 } }, ["Third"]),
        ],
      ),

      // ── Input ──────────────────────────────────────────────
      SectionTitle("Input:"),
      View({ style: { "margin-bottom": "12px" } }, [
        Row({ gap: 6, style: { display: "flex", "margin-bottom": "8px" } }, [
          Input({
            placeholder: "Type something...",
            value: input_,
            style: { flex: 1, "font-size": "14px" },
            onInput(e) {
              input_.set(e.target.value);
            },
          }),
          Button({ style: { width: "100px" } }, ["Search"]),
        ]),
        View({ style: { color: "#888", "font-size": "13px" } }, [
          "You typed: ",
          input_,
        ]),
      ]),

      // ── Textarea ───────────────────────────────────────────
      SectionTitle("Textarea:"),
      View({ style: { "margin-bottom": "12px" } }, [
        Textarea({
          placeholder: "Enter multiple lines...",
          value: textareaContent_,
          style: { height: "80px" },
          onInput(e) {
            textareaContent_.set(e.target.value);
          },
        }),
        View(
          {
            style: { color: "#888", "font-size": "13px", "margin-top": "4px" },
          },
          ["Content: ", textareaContent_],
        ),
      ]),

      // ── NumberInput ────────────────────────────────────────
      SectionTitle("NumberInput:"),
      View({ style: { "margin-bottom": "12px" } }, [
        NumberInput({
          value: numberValue_,
          placeholder: "Enter a number...",
          onInput(e) {
            numberValue_.set(e.target.value);
          },
        }),
        View({ style: { color: "#888", "font-size": "13px" } }, [
          "Value: ",
          numberValue_,
        ]),
      ]),

      // ── Button ─────────────────────────────────────────────
      SectionTitle("Button:"),
      Button(
        {
          style: { "margin-bottom": "12px" },
          onClick() {
            count_.set(0);
          },
        },
        ["Reset Counter"],
      ),

      // ── Checkbox ───────────────────────────────────────────
      SectionTitle("Checkbox:"),
      Row({ gap: 8, style: { "margin-bottom": "8px" } }, [
        Checkbox({
          checked: agreed,
          onChange(e) {
            agreed.set(e.target.checked);
          },
        }),
        View({}, ["I agree to terms"]),
      ]),
      Row({ gap: 8, style: { "margin-bottom": "8px" } }, [
        Checkbox({
          checked: subscribe,
          onChange(e) {
            subscribe.set(e.target.checked);
          },
        }),
        View({}, ["Subscribe to newsletter"]),
      ]),
      View(
        {
          style: {
            "margin-bottom": "12px",
            color: "#888",
            "font-size": "13px",
          },
        },
        [
          "Agreed: ",
          computed(agreed, (v) => (v ? "Yes" : "No")),
          " | Subscribed: ",
          computed(subscribe, (v) => (v ? "Yes" : "No")),
        ],
      ),

      // ── Radio ──────────────────────────────────────────────
      SectionTitle("Radio:"),
      Column({ gap: 6, style: { "margin-bottom": "8px" } }, [
        Row({ gap: 8 }, [
          Radio({
            checked: computed(selectedFruit_, (v) => v === "apple"),
            onChange(e) {
              if (e.target.checked) selectedFruit_.set("apple");
            },
          }),
          View({}, ["Apple"]),
        ]),
        Row({ gap: 8 }, [
          Radio({
            checked: computed(selectedFruit_, (v) => v === "banana"),
            onChange(e) {
              if (e.target.checked) selectedFruit_.set("banana");
            },
          }),
          View({}, ["Banana"]),
        ]),
        Row({ gap: 8 }, [
          Radio({
            checked: computed(selectedFruit_, (v) => v === "cherry"),
            onChange(e) {
              if (e.target.checked) selectedFruit_.set("cherry");
            },
          }),
          View({}, ["Cherry"]),
        ]),
      ]),
      View(
        {
          style: {
            "margin-bottom": "12px",
            color: "#888",
            "font-size": "13px",
          },
        },
        ["Selected fruit: ", selectedFruit_],
      ),

      // ── Select ─────────────────────────────────────────────
      SectionTitle("Select:"),
      View({ style: { "margin-bottom": "12px" } }, [
        Select({
          options: [
            { value: "Red", label: "Red" },
            { value: "Green", label: "Green" },
            { value: "Blue", label: "Blue" },
            { value: "Yellow", label: "Yellow" },
          ],
          onChange(e) {
            selectedColor_.set(e.target.value);
          },
        }),
        View(
          {
            style: { color: "#888", "font-size": "13px", "margin-top": "4px" },
          },
          ["Selected color: ", selectedColor_],
        ),
      ]),
    ],
  );
}

render(ApplicationView({}));
