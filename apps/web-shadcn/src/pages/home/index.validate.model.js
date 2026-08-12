const platform = getPlatform();

export function PaymentViewModel() {
  const field_card_name$ = new Timeless.vm.SingleFieldCore({
    label: "Name on Card",
    name: "card_name",
    input: new Timeless.vm.InputCore({
      defaultValue: "",
      placeholder: "John Doe",
    }),
    rules: [{ required: true }],
  });
  const field_card_number$ = new Timeless.vm.SingleFieldCore({
    label: "Card Number",
    name: "card_number",
    help: "Enter your 16-digit number.",
    input: new Timeless.vm.InputCore({
      defaultValue: "",
      placeholder: "1234 5678 9012 3456",
    }),
    rules: [{ required: true }],
  });
  const field_cvv$ = new Timeless.vm.SingleFieldCore({
    label: "CVV",
    name: "cvv",
    input: new Timeless.vm.InputCore({
      defaultValue: "",
      placeholder: "123",
    }),
    rules: [{ required: true }],
  });
  const month_options = Array.from({ length: 12 }, (_, i) => {
    const v = String(i + 1).padStart(2, "0");
    return new Timeless.vm.SelectItemCore({ label: v, value: v });
  });
  const field_exp_month$ = new Timeless.vm.SingleFieldCore({
    label: "Month",
    name: "exp_month",
    input: new Timeless.vm.SelectCore({
      defaultValue: "",
      placeholder: "MM",
      platform,
      options: month_options,
    }),
  });
  const year_options = [2024, 2025, 2026, 2027, 2028, 2029].map((y) => {
    return new Timeless.vm.SelectItemCore({
      label: String(y),
      value: String(y),
    });
  });
  const field_exp_year$ = new Timeless.vm.SingleFieldCore({
    label: "Year",
    name: "exp_year",
    input: new Timeless.vm.SelectCore({
      platform,
      defaultValue: null,
      placeholder: "YYYY",
      options: year_options,
    }),
  });
  const same_as_shipping$ = new Timeless.vm.CheckboxCore({});
  const field_same_as_shipping$ = new Timeless.vm.SingleFieldCore({
    label: "Same as shipping address",
    name: "same_as_shipping",
    input: same_as_shipping$,
  });
  const field_comments$ = new Timeless.vm.SingleFieldCore({
    label: "Comments",
    name: "comments",
    input: new Timeless.vm.InputCore({
      defaultValue: "",
      placeholder: "Add any additional comments",
    }),
  });
  const form$ = new Timeless.vm.ObjectFieldCore({
    fields: {
      card_name: field_card_name$,
      card_number: field_card_number$,
      exp_month: field_exp_month$,
      exp_year: field_exp_year$,
      cvv: field_cvv$,
      same_as_shipping: field_same_as_shipping$,
      comments: field_comments$,
    },
  });

  const submit_payment_btn$ = new Timeless.vm.ButtonCore({
    async onClick() {
      const r = await form$.validate();
      if (r.error) {
        const keys = Object.keys(form$.fields);
        for (let i = 0; i < keys.length; i += 1) {
          const key = keys[i];
          const field$ = form$.fields[key];
          const rr = await field$.validate();
          if (rr.error) {
            if (
              field$.input &&
              field$.input.shape === "select" &&
              typeof field$.input.show === "function"
            ) {
              field$.input.show();
            } else if (
              field$.input &&
              typeof field$.input.focus === "function"
            ) {
              field$.input.focus();
            }
            const id1 = field$.name;
            const id2 = `field-${field$.name}`;
            const $elm =
              typeof document !== "undefined"
                ? document.getElementById(id1) || document.getElementById(id2)
                : null;
            if ($elm && typeof $elm.scrollIntoView === "function") {
              $elm.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            break;
          }
        }
        return;
      }
      const values = r.data;
      console.log(values);
    },
  });
  const cancel_btn$ = new Timeless.vm.ButtonCore({
    variant: "outline",
    async onClick() {
      form$.reset();
    },
  });

  const ui = {
    field_card_name$,
    field_card_number$,
    field_cvv$,
    field_exp_month$,
    field_exp_year$,
    same_as_shipping$,
    field_comments$,
    submit_payment_btn$,
    cancel_btn$,
    form$,
  };

  return { ui };
}
