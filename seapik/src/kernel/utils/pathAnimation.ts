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
