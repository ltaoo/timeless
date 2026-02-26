
import { ref } from "@timeless/base-ui";

export function MemoModel(props) {
  const memos = ref([]);
  
  return {
    memos,
    add: (text) => {
      memos.value.push({ text, id: Date.now() });
    },
    remove: (id) => {
      memos.value = memos.value.filter(m => m.id !== id);
    }
  };
}
