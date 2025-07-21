/**
 * 已知弧长和圆心角求arc路径
 * 1. 求半径
 * 2. 求起始角度和终止角度
 * 3. 求起点坐标和终点坐标
 */
export function arcToSvgPath(angle: number, width: number) {
  const radius = Math.floor(calculateRadius(width, angle));

  // 余角
  const a = (180 - angle) / 2;

  const angleInRadians = Math.acos(Math.cos((Math.PI / 180) * a));
  // 对边y
  const la = Math.floor(length * Math.sin(angleInRadians));
  // 邻边x
  const lb = Math.floor(length * Math.cos(angleInRadians));

  const x1 = radius - lb;
  const y1 = la;

  const x2 = radius + lb;
  const y2 = la;

  const d = `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;

  console.log({ a, la, lb, radius });

  // console.log({ radius, d, x1, y1, x2, y2, a, angle });

  return {
    d,
    x1,
    y1,
    x2,
    y2,
    radius,
  };
}

/**
 * 已知弧长和圆心角，求半径
 */
export function calculateRadius(arcLength: number, angleInDegrees: number) {
  const pi = Math.PI;
  const radius = (arcLength * 180) / (pi * angleInDegrees);
  return radius;
}
