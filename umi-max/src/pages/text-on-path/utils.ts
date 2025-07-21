//  ( 2 * Math.PI * radius ) * (angle/ 360) = width

// function calculateSides(angleA: number, length: number) {
//   const angleInRadians = Math.acos(Math.cos((Math.PI / 180) * angleA));
//   const oppositeSide = length * Math.sin(angleInRadians);
//   const adjacentSide = length * Math.cos(angleInRadians);
//   return { oppositeSide, adjacentSide };
// }

// // const angleA = 30; // 角度A为30度
// // const c = 245; // 斜边c的长度为245米
// // const result = calculateSides(angleA, c);
// // console.log(`对边a的长度: ${result.oppositeSide}`);
// // console.log(`邻边b的长度: ${result.adjacentSide}`);

function createArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  angleLength: number
): string {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = ((startAngle + angleLength) * Math.PI) / 180;

  const startX = centerX + radius * Math.cos(startRad);
  const startY = centerY + radius * Math.sin(startRad);
  const endX = centerX + radius * Math.cos(endRad);
  const endY = centerY + radius * Math.sin(endRad);

  const largeArcFlag = angleLength > 180 ? 1 : 0;

  return `M ${startX.toFixed(2)} ${startY.toFixed(2)} 
          A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;
}

// 调用示例
const pathData = createArcPath(200, 200, 100, 30, 90);
console.log(pathData);

/**
 * 根据圆弧弧长和圆心角计算半径
 * @param {number} length - 圆弧弧长
 * @param {number} angle - 圆心角度数（0 < angle ≤ 360）
 * @returns {number} 计算结果半径
 * @throws {Error} 参数类型错误或角度范围无效
 */
export function calcRadius(length: number, angle: number) {
  if ([0, 180].includes(Math.abs(angle))) {
    return length;
  }

  console.log({ angle, length });

  // 参数类型校验
  if (typeof length !== "number" || typeof angle !== "number") {
    throw new Error("Both parameters must be numbers");
  }

  // 角度范围校验
  if (angle < 0 || angle > 360) {
    throw new Error(
      `the angle is ${angle} ` + "Angle must be between 0 and 360 degrees"
    );
  }

  // 弧长公式转换：r = L * 180 / (π * θ)
  return Math.floor((length * 180) / (Math.PI * angle));
}

//计算弧长
export function calculateArcLength(
  start: [number, number],
  end: [number, number],
  radius: number
) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const chordLength = Math.sqrt(dx * dx + dy * dy);
  const theta = 2 * Math.asin(chordLength / (2 * radius)); // 圆心角（弧度）
  return radius * theta;
}

/**
 * 生成 SVG path 的 d 属性
 *
 */
export function arcToSvgPath(radius: number, angle: number) {
  // 补角
  const e = (180 - angle) / 2;

  const angleInRadians = Math.acos(Math.cos((Math.PI / 180) * e));
  const a = radius * Math.sin(angleInRadians);
  const b = radius * Math.cos(angleInRadians);

  // 计算起点和终点的坐标
  const startX = radius - b;
  const startY = a;

  const endX = radius + b;
  const endY = a;

  // 判断是否为大弧
  const largeArcFlag = Math.abs(angle) > 180 ? 1 : 0;

  const sweepFlag = angle < 0 ? 0 : 1;
  /**
   * M x y A rx ry x-axis-rotation large-arc-flag sweep-flag x y
   * x-axis-rotation 圆弧的旋转角度
   * large-arc-flag = 0 表示小弧，1
   * 表示大弧
   * sweep-flag = 0 表示逆时针，1 表示顺时针
   * */
  return {
    d: [0, 180].includes(Math.abs(angle))
      ? `M 0 ${radius} L  ${2 * radius} ${radius}`
      : `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`,
    x1: startX,
    y1: startY,
    x2: endX,
    y2: endY,
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

// 示例：弧长为100，角度为60度
const radius = calculateRadius(100, 60);
console.log(radius); // 输出计算结果
