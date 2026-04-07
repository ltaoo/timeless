type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export function DismissableLayer() {
  const boxes: Box[] = [];
  return {
    addIgnore(box: Box) {
      boxes.push(box);
    },
    /** 坐标点是否在 boxes 中，即 是否点击了 boxes 内部 */
    isBingo(pos: { x: number; y: number }) {
      console.log(pos, boxes);
      for (const box of boxes) {
        if (
          box.x <= pos.x &&
          pos.x <= box.x + box.width &&
          box.y <= pos.y &&
          pos.y <= box.y + box.height
        ) {
          return false;
        }
      }
      return true;
    },
    clear() {
      boxes.length = 0;
    },
  };
}
