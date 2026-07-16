const { View, Text, Fragment, ref, refobj, computed, Show, For } = Timeless;
import { Section, Item } from "../../components/index.js";

export default function Page(props) {
  const name_ = ref("");
  const email_ = ref("");
  const amount_ = ref("");
  const errors_ = ref({});

  function validate() {
    const errs = {};
    if (!name_.value.trim()) errs.name = "Name is required";
    if (!email_.value.trim()) errs.email = "Email is required";
    else if (!email_.value.includes("@")) errs.email = "Invalid email format";
    if (!amount_.value.trim()) errs.amount = "Amount is required";
    else if (isNaN(Number(amount_.value))) errs.amount = "Must be a number";
    errors_.as(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (validate()) {
      alert("Form submitted: " + JSON.stringify({ name: name_.value, email: email_.value, amount: amount_.value }));
    }
  }

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["Form Validation"]),

    Section("Payment Form", [
      View({ class: "max-w-md space-y-4" }, [
        field("Name", name_, errors_),
        field("Email", email_, errors_),
        field("Amount", amount_, errors_),
        View({
          class: "inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary text-primary-foreground cursor-pointer hover:opacity-90",
          onClick: handleSubmit,
        }, ["Submit"]),
        Show({ when: computed(errors_, (e) => Object.keys(e).length === 0 && (name_.value || email_.value || amount_.value)), ok() { return [
          Text({ class: "text-sm text-green-600" }, ["All fields valid!"]),
        ]; } }),
      ]),
    ]),
  ]);
}

function field(label, value_, errors_) {
  return View({ class: "space-y-1" }, [
    Text({ class: "text-sm font-medium" }, [label]),
    View({
      class: "flex h-9 rounded-md border px-3 py-1 text-sm items-center " + (errors_.value[label.toLowerCase()] ? "border-red-500" : "border-input"),
    }, [value_.value || ""]),
    Show({ when: computed(errors_, (e) => !!e[label.toLowerCase()]), ok() { return [
      Text({ class: "text-xs text-red-500" }, [errors_.value[label.toLowerCase()] || ""]),
    ]; } }),
  ]);
}
