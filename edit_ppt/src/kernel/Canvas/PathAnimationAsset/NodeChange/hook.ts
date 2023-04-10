import { CanvasInfo } from '@/kernel/typing';

/**
 * 计算直线及偏移角度
 * @param {*} x1
 * @param {*} y1
 * @param {*} x2
 * @param {*} y2
 * @param {*} r 原点半径
 */
const calculateLine = (list: number[], r: number, scale: number) => {
  if (!list) {
    return;
  }
  const x1 = list[0] * scale;
  const y1 = list[1] * scale;
  const x2 = list[4] * scale;
  const y2 = list[5] * scale;
  const AB = {
    x: x2 - x1,
    y: y2 - y1,
  };

  const BC = {
    x: 0,
    y: 1,
  };

  // 向量的模
  const a = Math.sqrt(Math.pow(AB.x, 2) + Math.pow(AB.y, 2));
  const b = Math.sqrt(Math.pow(BC.x, 2) + Math.pow(BC.y, 2));

  const aXb = AB.x * BC.x + AB.y * BC.y;
  const cos_ab = aXb / (a * b);

  // 求出偏转角度
  const angle_1 = Math.acos(cos_ab) * (180 / Math.PI);

  return {
    position: {
      x: list[2] + r,
      y: list[3] + r,
      width: a,
      angle:
        90 -
        (AB.x > 0
          ? Math.sqrt(Math.pow(angle_1, 2))
          : -Math.sqrt(Math.pow(angle_1, 2))),
    },
    sendPoint: {
      start: {
        x: x1,
        y: y1,
      },
      end: {
        x: x2,
        y: y2,
      },
    },
  };
};
const useNodePath = (
  points: number[][],
  canvasInfo: CanvasInfo,
  index: number,
) => {
  const { scale } = canvasInfo;
  const item = calculateLine(points[index], 0, scale);
  return {
    item: item?.position,
  };
};
export default useNodePath;
