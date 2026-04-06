export function Icon(props: { name: string; size: number }) {
  const state = {
    props,
  };

  let $elm: any = null;

  return {
    t: "icon",
    get $elm() {
      return $elm;
    },
    set $elm(v: any) {
      $elm = v;
    },
    value: props.name,
    props: state.props,
  };
}

export function isIcon(v: any) {
  return v.t === "icon";
}
