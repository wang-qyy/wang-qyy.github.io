import fabric, { Canvas, Rect, util } from "fabric";

// 父元素旋转角度为30，左上角坐标为（px,py） ，子元素旋转角度为40，左上角坐标为（x,y）,求父元素及子元素旋转前的坐标

/**
 * 根据旋转后的左上角坐标和角度，计算旋转前的左上角坐标
 * @param x 当前左上角 x
 * @param y 当前左上角 y
 * @param cx 旋转中心 x
 * @param cy 旋转中心 y
 * @param angle 旋转角度（单位：度）
 * @returns 旋转前的左上角坐标
 */
function getOriginalPosition(
  x: number,
  y: number,
  cx: number,
  cy: number,
  angle: number
) {
  const rad = util.degreesToRadians(angle);
  const cos = Math.cos(-rad);
  const sin = Math.sin(-rad);

  const dx = x - cx;
  const dy = y - cy;

  const x1 = dx * cos - dy * sin + cx;
  const y1 = dx * sin + dy * cos + cy;

  return { x: x1, y: y1 };
}

export function renderFn(dom: HTMLCanvasElement) {
  console.log("renderFn", dom);

  // 创建画布
  const canvas = new Canvas(dom, {});

  // 父元素
  const parent = new Rect({
    left: 100,
    top: 100,
    width: 100,
    height: 100,
    fill: "red",
    angle: 30,
    // originX: "center",
    // originY: "center",
  });
  canvas.add(parent);
  canvas.renderAll();

  return;

  // 子元素
  const child = new Rect({
    left: 200,
    top: 200,
    width: 50,
    height: 50,
    fill: "blue",
    angle: 40,
    // originX: "center",
    // originY: "center",
  });
  canvas.add(child);

  canvas.renderAll();

  // 获取当前左上角坐标
  const parentRect = parent.getBoundingRect();
  const childRect = child.getBoundingRect();

  // 计算旋转前的左上角坐标
  const parentOriginal = getOriginalPosition(
    parentRect.left,
    parentRect.top,
    parent.left,
    parent.top,
    parent.angle
  );

  const childOriginal = getOriginalPosition(
    childRect.left,
    childRect.top,
    child.left,
    child.top,
    child.angle
  );

  console.log("父元素旋转前坐标:", parentOriginal);
  console.log("子元素旋转前坐标:", childOriginal);
}
