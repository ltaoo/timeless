import { ViewComponentProps } from "~/store/types";
import { useViewModel } from "~/hooks";
import { PageView } from "~/components/page-view";
import { Sheet } from "~/components/ui/sheet";
import { Button, Input } from "~/components/ui";

import {  base, Handler  } from "@timeless/kit";,
        age: 30,
        gender: 1,
      });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export function FeaturePlaygroundView(props: ViewComponentProps) {
  const [state, vm] = useViewModel(FeaturePlaygroundViewModel, [props]);

  return (
    <>
      <PageView store={vm}>
        <Button store={vm.ui.$btn}>测试</Button>
        {/* <FieldObjV2 store={vm.ui.$values}>
          <FieldArrV2
            store={vm.ui.$values.fields.persons}
            render={(field) => {
              return (
                <div>
                  <FieldObjV2 store={field}>
                    <div>
                      <FieldV2 store={field.fields.name}>
                        <Input store={field.fields.name.input} />
                      </FieldV2>
                      <FieldV2 store={field.fields.age}>
                        <Input store={field.fields.age.input} />
                      </FieldV2>
                      <FieldV2 store={field.fields.gender}>
                        <Select store={field.fields.gender.input}></Select>
                      </FieldV2>
                    </div>
                  </FieldObjV2>
                </div>
              );
            }}
          ></FieldArrV2>
        </FieldObjV2> */}
        {/* <InputWithKeyboardView store={vm.ui.$input} /> */}
        <Sheet store={vm.ui.$dialog} app={props.app}>
          <div>Hello</div>
        </Sheet>
      </PageView>
    </>
  );
}
