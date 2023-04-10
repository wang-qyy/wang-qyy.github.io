import { RGBAToString } from '@/kernel/utils/single';
import { GradientColor } from '@/kernel/typing';

export function getCoorsByAngle(angle: number) {
  angle *= 1;
  if (angle < 0) {
    angle += 360;
  }
  if (angle == 0) {
    return {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 0,
    };
  }
  if (angle == 180) {
    return {
      x1: 1,
      y1: 0,
      x2: 0,
      y2: 0,
    };
  }
  // 当渐变轴垂直于矩形垂直边上的两种结果
  if (angle == 90) {
    return {
      x1: 0,
      y1: 1,
      x2: 0,
      y2: 0,
    };
  }
  if (angle == 270) {
    return {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 1,
    };
  }
  const x = Math.abs(Math.cos((Math.PI / 180) * angle));
  const y = Math.abs(Math.sin((Math.PI / 180) * angle));

  if (angle > 0 && angle < 90) {
    return {
      x1: 0,
      y1: y,
      x2: x,
      y2: 0,
    };
  }
  if (angle > 90 && angle < 180) {
    return {
      x1: x,
      y1: y,
      x2: 0,
      y2: 0,
    };
  }
  if (angle > 180 && angle < 270) {
    return {
      x1: x,
      y1: 0,
      x2: 0,
      y2: y,
    };
  }
  if (angle > 270 && angle < 360) {
    return {
      x1: 0,
      y1: 0,
      x2: x,
      y2: y,
    };
  }
}
// 转化成背景渐变色数据
// linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(248, 202, 107) 0%, rgb(252, 174, 125) 59.2593%, rgb(252, 174, 125) 60.4938%);
export function getBackgroundByData(list: any) {
  const deepCloneData = JSON.parse(JSON.stringify(list));
  if (deepCloneData.length < 2) {
    return '';
  }
  let temp = `linear-gradient(${90}deg,`;
  deepCloneData.sort((a: any, b: any) => {
    return a.percent - b.percent;
  });
  deepCloneData.forEach((element, index) => {
    if (element.color) {
      let rgba = element.color;
      if (typeof rgba !== 'string') {
        rgba = RGBAToString(rgba);
      }
      if (index === deepCloneData.length - 1) {
        temp = `${temp + rgba} ${element.percent}%`;
      } else {
        temp = `${temp + rgba} ${element.percent}%,`;
      }
    }
  });
  temp += ')';
  return temp;
}

export function getListByEffectGradientColor(effect: GradientColor) {
  const { angle, colorStops = [] } = effect;
  const list: any[] = [];
  colorStops.forEach((element: any) => {
    let left = 205 * element.offset - 20;
    left = left > 0 ? left : 0;
    const tmpEle = {
      left,
      right: left + 20,
      top: 0,
      color: element.color,
      percent: element.offset * 100,
    };
    list.push(tmpEle);
  });
  return { angle, list };
}
export function getEffectGradientColor(
  list: any,
  angle: number,
  type = 'linear',
) {
  const coords = getCoorsByAngle(angle);
  const colorStops: any[] = [];
  list.forEach((element: any) => {
    if (element.color) {
      const rgba = element.color;
      const tmpEle = {
        color: rgba,
        offset: element.percent / 100,
      };
      colorStops.push(tmpEle);
    }
  });
  return { coords, colorStops, angle: angle * 1, type };
}
