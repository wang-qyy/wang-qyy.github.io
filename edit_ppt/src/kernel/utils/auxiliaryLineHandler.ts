import {
  Asset,
  Auxiliary,
  AssetBaseSize,
  Coordinate,
  Position,
} from '@kernel/typing';
import { calculateRotatedPointCoordinate } from '@kernel/utils/mouseHandler/mouseHandlerHelper';
import { CSSProperties } from 'react';

function getKeyPoint(size: AssetBaseSize, position: Coordinate) {
  const { width, height } = size;
  const { x, y } = position;
  // 对称点坐标
  const symmetry = {
    x: x + width,
    y: y + height,
  };
  // 中心点坐标
  const center = {
    x: x + width / 2,
    y: y + height / 2,
  };
  return {
    symmetry,
    center,
  };
}

/**
 * @description 判断是否需要辅助线
 * @param target
 * @param origin
 */
export function needAuxiliary(target: number, origin: number) {
  return Math.abs(target - origin) <= 3;
}

function formatPoint(
  center: Coordinate,
  origin: Coordinate,
  symmetry: Coordinate,
) {
  return {
    vertical: {
      start: origin.y,
      center: center.y,
      end: symmetry.y,
    },
    horizontal: {
      start: origin.x,
      center: center.x,
      end: symmetry.x,
    },
  };
}

function getPoint(size: AssetBaseSize, position: Coordinate): Auxiliary {
  const { symmetry, center } = getKeyPoint(size, position);
  return formatPoint(center, position, symmetry);
}

function getPointWithRotate(
  rotate: number,
  size: AssetBaseSize,
  position: Coordinate,
): Auxiliary {
  const { center, symmetry } = getKeyPoint(size, position);
  const coordinate = {
    top: calculateRotatedPointCoordinate(position, center, rotate),
    bottom: calculateRotatedPointCoordinate(symmetry, center, rotate),
    left: calculateRotatedPointCoordinate(
      {
        x: position.x,
        y: symmetry.y,
      },
      center,
      rotate,
    ),
    right: calculateRotatedPointCoordinate(
      {
        x: symmetry.x,
        y: position.y,
      },
      center,
      rotate,
    ),
  };
  const newPosition = {
    y: coordinate.top.y,
    x: coordinate.left.x,
  };
  const newSymmetry = {
    y: coordinate.bottom.y,
    x: coordinate.right.x,
  };
  /**
   * 需要遍历元素坐标，保证newPosition的xy坐标是最小的，newSymmetry的坐标是最大的
   * 否则如果旋转角度不同，计算的结果也会出现差异
   */
  Object.keys(coordinate).forEach((key) => {
    const item = coordinate[key as keyof typeof coordinate];
    if (item.x < newPosition.x) {
      newPosition.x = item.x;
    }
    if (item.x > newSymmetry.x) {
      newSymmetry.x = item.x;
    }

    if (item.y < newPosition.y) {
      newPosition.y = item.y;
    }
    if (item.y > newSymmetry.y) {
      newSymmetry.y = item.y;
    }
  });

  return formatPoint(center, newPosition, newSymmetry);
}

/**
 * @description 计算元素的矩形阵点，方便计算辅助线
 * @param size
 * @param position
 * @param rotate
 */
export function calculateAssetPoint(
  size: AssetBaseSize,
  position: Coordinate,
  rotate?: number,
): Auxiliary {
  if (rotate) {
    return getPointWithRotate(rotate, size, position);
  }
  return getPoint(size, position);
}

/**
 * @description 根据方向来匹配辅助线的命中坐标，获取辅助线样式信息，和元素的矫正坐标
 * @param direction 辅助线方向
 * @param target 目前数据
 * @param origin 源数据
 */
export function auxiliaryPointsMatching(
  direction: keyof Auxiliary,
  target: Auxiliary,
  origin: Auxiliary,
) {
  // 当前移动元素的坐标信息
  const currentAuxiliary = origin[direction];
  // 对比元素的坐标信息
  const targetAuxiliary = target[direction];
  let result;
  // 根据当前元素坐标遍历目标坐标，判断是否有接近的坐标
  for (const currentKey in currentAuxiliary) {
    const currentValue =
      currentAuxiliary[currentKey as keyof typeof currentAuxiliary];

    for (const targetKey in targetAuxiliary) {
      const targetValue =
        targetAuxiliary[targetKey as keyof typeof targetAuxiliary];
      // 存在接近的坐标值，返回数据
      if (needAuxiliary(currentValue, targetValue)) {
        result = {
          // 目标的坐标位置（start,center,end）
          targetKey,
          // 坐标值
          targetValue,
          // 与之匹配的当前坐标位置（start,center,end）
          currentKey,
          // 坐标值
          currentValue,
        };
        break;
      }
    }
  }
  if (result) {
    let style: CSSProperties = {};
    let position: Position | undefined;
    // 如果vertical，则表示需要展示横向辅助线
    if (direction === 'vertical') {
      const start = Math.min(target.horizontal.start, origin.horizontal.start);
      const end = Math.max(target.horizontal.end, origin.horizontal.end);
      const top = result.targetValue;
      let positionTop = 0;

      // 根据坐标点的位置，来判断是否需要补偿坐标。例如：currentKey===center, 则需要反向一半的宽度，以保证最终得到的top坐标是元素的top
      switch (result.currentKey) {
        case 'start':
          positionTop = top;
          break;
        case 'center':
          positionTop =
            top - Math.abs(origin.vertical.center - origin.vertical.start);
          break;
        case 'end':
          positionTop =
            top - Math.abs(origin.vertical.end - origin.vertical.start);
          break;
      }

      style = {
        opacity: 1,
        width: Math.abs(start - end),
        height: 1,
        top,
        left: start,
      };
      position = {
        left: origin.horizontal.start,
        top: positionTop,
      };
    } else {
      // 如果horizontal，则表示需要展示纵向辅助线
      const start = Math.min(target.vertical.start, origin.vertical.start);
      const end = Math.max(target.vertical.end, origin.vertical.end);
      const left = result.targetValue;
      let positionLeft = 0;

      switch (result.currentKey) {
        case 'start':
          positionLeft = left;
          break;
        case 'center':
          positionLeft =
            left - Math.abs(origin.horizontal.center - origin.horizontal.start);
          break;
        case 'end':
          positionLeft =
            left - Math.abs(origin.horizontal.end - origin.horizontal.start);
          break;
      }

      style = {
        opacity: 1,
        width: 1,
        height: Math.abs(start - end),
        top: start,
        left,
      };
      position = {
        left: positionLeft,
        top: origin.vertical.start,
      };
    }
    return {
      currentKey: result.currentKey,
      position,
      style,
    };
  }
}
