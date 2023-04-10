import { pathAnimationSpeed } from '@/config/basicVariable';

export function CubicBezierAtTime(t: number, easing = 1, duration: number) {
  const { p1x, p1y, p2x, p2y } = pathAnimationSpeed[easing];
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
  return solve(t, 1 / (200 * duration));
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
