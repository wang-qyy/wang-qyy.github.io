import {
  LRTBType,
  unLRTBType,
} from '@kernel/Components/TransformPoints/handler';
import { Position, Coordinate } from '@/kernel/typing';

/**
 * @description 根据旋转角度，获取对应的裁剪位置
 * @param rotate
 * @param position
 */
export const correctOffsetByRotate: Record<
  LRTBType | unLRTBType,
  (rotate: number, position: Coordinate, mouseDis: Coordinate) => Coordinate
> = {
  top: (rotate: number, position: Coordinate, mouseDis: Coordinate) => {
    const { x, y } = position;

    if (rotate === 0) {
      return { x, y: y - mouseDis.y };
    }
    if (rotate === 90) {
      return { x: x - mouseDis.y, y };
    }

    return position;
  },
  bottom: (rotate: number, position: Coordinate, mouseDis: Coordinate) => {
    const { x, y } = position;

    if (rotate === 180) {
      return { x, y: y + mouseDis.y };
    }

    if (rotate === 270) {
      return { x: x + mouseDis.y, y };
    }
    return position;
  },

  left: (rotate: number, position: Coordinate, mouseDis: Coordinate) => {
    const { x, y } = position;
    if (rotate === 0) {
      return { x: x - mouseDis.x, y };
    }

    if (rotate === 270) {
      return { x, y: y - mouseDis.x };
    }
    return position;
  },

  right: (rotate: number, position: Coordinate, mouseDis: Coordinate) => {
    const { x, y } = position;
    if (rotate === 90) {
      return { x, y: y + mouseDis.x };
    }

    if (rotate === 180) {
      return { x: x + mouseDis.x, y };
    }
    return position;
  },

  left_top: (rotate: number, position: Coordinate, mouseDis: Coordinate) => {
    const { x, y } = position;
    if (rotate === 0) {
      return { x: x - mouseDis.x, y: y - mouseDis.y };
    }

    if (rotate === 90) {
      return { x: x - mouseDis.y, y };
    }

    if (rotate === 270) {
      return { x, y: y - mouseDis.x };
    }
    return position;
  },

  right_top: (rotate: number, position: Coordinate, mouseDis: Coordinate) => {
    const { x, y } = position;
    if (rotate === 0) {
      return { x, y: y - mouseDis.y };
    }

    if (rotate === 90) {
      return { x: x - mouseDis.y, y: y + mouseDis.x };
    }

    if (rotate === 180) {
      return { x: x + mouseDis.x, y };
    }
    return position;
  },

  left_bottom: (rotate: number, position: Coordinate, mouseDis: Coordinate) => {
    const { x, y } = position;
    if (rotate === 0) {
      return { x: x - mouseDis.x, y };
    }

    if (rotate === 180) {
      return { x, y: y + mouseDis.y };
    }

    if (rotate === 270) {
      return { x: x + mouseDis.y, y: y - mouseDis.x };
    }
    return position;
  },

  right_bottom: (
    rotate: number,
    position: Coordinate,
    mouseDis: Coordinate,
  ) => {
    const { x, y } = position;

    if (rotate === 90) {
      return { x, y: y + mouseDis.x };
    }

    if (rotate === 180) {
      return { x: x + mouseDis.x, y: y + mouseDis.y };
    }

    if (rotate === 270) {
      return { x: x + mouseDis.y, y };
    }

    return position;
  },
};

export type Rect = {
  width: number;
  height: number;
  left: number;
  top: number;
};

export const CalcResize: Record<
  LRTBType | unLRTBType,
  (
    rotate: number,
    rect: Rect,
    mouseDis: Position,
  ) => { rect: Rect; offset: Position }
> = {
  left: (rotate: number, rect: Rect, mouseDis: Position) => {
    const { left, top, width, height } = rect;

    const rectData = {
      left: left + mouseDis.left,
      top,
      width: width - mouseDis.left,
      height,
    };

    return {
      rect: rectData,
      offset: {
        left: -rectData.left,
        top: -rectData.top,
      },
    };
  },

  right: (rotate: number, rect: Rect, mouseDis: Position) => {
    const { left, top, width, height } = rect;

    const rectData = {
      left: left,
      top: top,
      width: width + mouseDis.left,
      height,
    };

    return {
      rect: rectData,
      offset: {
        left: -rectData.left,
        top: -rectData.top,
      },
    };
  },

  top: (rotate: number, rect: Rect, mouseDis: Position) => {
    const { left, top, width, height } = rect;

    const rectData = {
      left,
      top: top + mouseDis.top,
      width,
      height: height - mouseDis.top,
    };

    return {
      rect: rectData,
      offset: {
        left: -rectData.left,
        top: -rectData.top,
      },
    };
  },
  bottom: (rotate: number, rect: Rect, mouseDis: Position) => {
    const { left, top, width, height } = rect;

    const rectData = {
      left,
      top,
      width,
      height: height + mouseDis.top,
    };

    return {
      rect: rectData,
      offset: {
        left: -rectData.left,
        top: -rectData.top,
      },
    };
  },

  left_top: (rotate: number, rect: Rect, mouseDis: Position) => {
    const { left, top, width, height } = rect;
    // 点击左上角的点移动，由于左上角是定位点，所以定位变化，
    const rectData = {
      left: left + mouseDis.left,
      top: top + mouseDis.top,
      width: width - mouseDis.left,
      height: height - mouseDis.top,
    };
    return {
      rect: rectData,
      offset: {
        left: -rectData.left,
        top: -rectData.top,
      },
    };
  },
  right_top: (rotate: number, rect: Rect, mouseDis: Position) => {
    const { left, top, width, height } = rect;

    const rectData = {
      left: left,
      top: top + mouseDis.top,
      width: width + mouseDis.left,
      height: height - mouseDis.top,
    };

    return {
      rect: rectData,
      offset: {
        left: -rectData.left,
        top: -rectData.top,
      },
    };
  },
  right_bottom: (rotate: number, rect: Rect, mouseDis: Position) => {
    const { left, top, width, height } = rect;

    const rectData = {
      left: left,
      top: top,
      width: width + mouseDis.left,
      height: height + mouseDis.top,
    };
    return {
      rect: rectData,
      offset: {
        left: -rectData.left,
        top: -rectData.top,
      },
    };
  },
  left_bottom: (rotate: number, rect: Rect, mouseDis: Position) => {
    const { left, top, width, height } = rect;
    const rectData = {
      left: left + mouseDis.left,
      top: top,
      width: width - mouseDis.left,
      height: height + mouseDis.top,
    };
    return {
      rect: rectData,
      offset: {
        left: -rectData.left,
        top: -rectData.top,
      },
    };
  },
};
