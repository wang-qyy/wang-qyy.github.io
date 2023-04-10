import { pathAnimationSpeed } from '@/config/basicVariable';
import { Coordinate } from '../typing';
import { deepCloneJson } from './single';

/**
 *将二维的点位转换成直线path
 * @param points
 * @returns
 */
export function polyline2path(list: number[][], scale = 1) {
  const points = deepCloneJson(list);
  if (points.length === 0) {
    return '';
  }
  let path = '';
  points.forEach((element: number[], index: number) => {
    if (scale !== 1) {
      element.forEach((e, i) => {
        element[i] = e * scale;
      });
    }
    if (element.length == 6) {
      if (index === 0) {
        path += `M${element.slice(2, 4).join(' ')}`;
      } else {
        path += `L${element.slice(2, 4).join(' ')}`;
      }
    } else {
      return '';
    }
  });
  return path;
}
/**
 *将二维的点位转换成直线2次贝塞尔path
 * @param points
 * @returns
 */
export function polyline2Curve(list: number[][], scale = 1) {
  const points = deepCloneJson(list);
  if (points.length === 0) {
    return '';
  }
  let path = '';
  if (points.length > 1) {
    points.forEach((element: number[], index: number) => {
      if (scale !== 1) {
        element.forEach((e, i) => {
          element[i] = e * scale;
        });
      }

      if (index === 0) {
        path += `M${element.slice(2, 4).join(' ')} C${element
          .slice(0, 2)
          .join(' ')} `;
      } else if (index === points.length - 1) {
        path += `${element.slice(0, 2).join(' ')} ${element
          .slice(2, 4)
          .join(' ')}`;
      } else {
        path += `${element.slice(0, 2).join(' ')} ${element
          .slice(2, 4)
          .join(' ')} C${element.slice(4, 6).join(' ')} `;
      }
    });
  }
  return path;
}
/**
 *构建移动节点的path数据
 * @param points
 * @returns
 */
export function polyline2pathNode(list: number[], scale = 1) {
  const points = deepCloneJson(list);
  if (points.length === 0) {
    return '';
  }
  if (scale !== 1) {
    points.forEach((e, i) => {
      points[i] = e * scale;
    });
  }

  const path = `M${points.slice(0, 2).join(' ')}L${points
    .slice(4, 6)
    .join(' ')}`;
  return path;
}
/**
 * 计算路径动画的实际大小
 * @param points
 * @returns
 */
export function calcPathAnimationSize(
  list: number[][],
  center: Coordinate,
  svgSize: { width: number; height: number; left: number; top: number },
) {
  const points = deepCloneJson(list);
  if (points.length < 2) {
    return;
  }
  points.forEach((element: number[], index: number) => {
    element.forEach((e, i) => {
      if (i % 2 === 1) {
        element[i] = e - center.y;
      } else {
        element[i] = e - center.x;
      }
    });
  });
  console.log('预设信息=======', {
    width: svgSize.width,
    height: svgSize.height,
    x: svgSize.left,
    y: svgSize.top,
    points,
  });
  return {
    width: svgSize.width,
    height: svgSize.height,
    x: svgSize.left,
    y: svgSize.top,
    points,
  };
}
/**
 * 还原相对于画布原点的点位数据
 */
export function restorePointsRelativeCanvas(
  list: number[][],
  x: number,
  y: number,
) {
  const points = deepCloneJson(list);
  points.forEach((element: number[], index: number) => {
    element.forEach((e, i) => {
      if (i % 2 === 1) {
        element[i] = e + y;
      } else {
        element[i] = e + x;
      }
    });
  });
  return points;
}
export function CubicBezierAtTime(
  time: number,
  easing = 1,
  duration: number,
  speed = pathAnimationSpeed,
) {
  const { p1x, p1y, p2x, p2y } = speed[easing];
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  function sampleCurveX(t: number) {
    return ((ax * t + bx) * t + cx) * t;
  }

  function solveCurveX(x: number, epsilon: number) {
    let t0;
    let t1;
    let t2;
    let x2;
    let d2;
    let i;
    for (t2 = x, i = 0; i < 8; i++) {
      x2 = sampleCurveX(t2) - x;
      if (Math.abs(x2) < epsilon) {
        return t2;
      }
      d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
      if (Math.abs(d2) < 1e-6) {
        break;
      }
      t2 -= x2 / d2;
    }
    t0 = 0;
    t1 = 1;
    t2 = x;
    if (t2 < t0) {
      return t0;
    }
    if (t2 > t1) {
      return t1;
    }
    while (t0 < t1) {
      x2 = sampleCurveX(t2);
      if (Math.abs(x2 - x) < epsilon) {
        return t2;
      }
      if (x > x2) {
        t0 = t2;
      } else {
        t1 = t2;
      }
      t2 = (t1 - t0) / 2 + t0;
    }
    return t2;
  }
  function solve(x: number, epsilon: number) {
    const t = solveCurveX(x, epsilon);
    return ((ay * t + by) * t + cy) * t;
  }
  return solve(time, 1 / (200 * duration));
}
/**
 * 根据运动的角度计算position（抖动动画使用）
 * @param position
 * @param M 离原点的距离
 */
export function CalcPositionBydirection(
  left: number,
  top: number,
  M: number,
  direction: number,
) {
  const result = { left, top };
  if (direction === 0) {
    result.left = left + M;
    result.top = top;
  } else if (direction === 90) {
    result.left = left;
    result.top = top + M;
  } else if (direction === 180) {
    result.left = left - M;
    result.top = top;
  } else if (direction === 270) {
    result.left = left;
    result.top = top - M;
  } else if (direction > 0 && direction < 90) {
    result.left = left + M * Math.cos((direction * Math.PI) / 180);
    result.top = top + M * Math.sin((direction * Math.PI) / 180);
  } else if (direction > 90 && direction < 180) {
    direction = 180 - direction;
    result.left = left - M * Math.cos((direction * Math.PI) / 180);
    result.top = top + M * Math.sin((direction * Math.PI) / 180);
  } else if (direction > 180 && direction < 270) {
    direction -= 180;
    result.left = left - M * Math.cos((direction * Math.PI) / 180);
    result.top = top - M * Math.sin((direction * Math.PI) / 180);
  } else if (direction > 270 && direction < 360) {
    direction = 360 - direction;
    result.left = left + M * Math.cos((direction * Math.PI) / 180);
    result.top = top - M * Math.sin((direction * Math.PI) / 180);
  }
  return result;
}
