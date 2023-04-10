import { angleCanvasToDom, StringToRGBA } from '@/kernel/utils/single';
import { RGBAToString } from '@/utils/single';

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
/**
   * 转换数据
   * // 背景渐变数据转list
// linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(248, 202, 107) 0%, rgb(252, 174, 125) 59.2593%, rgb(252, 174, 125) 60.4938%);
   * @param {Object} background 颜色
   * @param {Object} ruler 外宽度
   * @param {Object} cursor 模块宽度
   */
export function getdataByBackground(
  background: string,
  ruler = 205,
  cursor = 18,
) {
  if (!background || !ruler || !cursor) {
    throw new Error('参数错误!');
  }
  let angle = 0;
  const list: any[] = [];
  const anglePattern = /-?\d+(\.\d+)?deg/gi;
  const colorPattern =
    /(rgb(a?)\()(\d+),( *)(\d+), *(\d+)(, *(\d+(\.\d+)?))?\)/g;
  const percentPattern =
    /(rgb(a?)\()(\d+),( ?)(\d+), ?(\d+)(, ?(\d+(\.\d+)?))?\)(( ?)(\d+(\.\d+)?)%)?/gi;
  const angleMatch = background.match(anglePattern);
  angleMatch?.forEach(item => {
    angle = item.replace(/deg/g, '') * 1;
  });
  const listMatch = background.match(percentPattern);
  listMatch?.forEach(item => {
    let percent = 0;
    percent = item.match(/\d+(\.\d+)?%/g)[0].replace('%', ' ') * 1;
    let left = (ruler * percent) / 100;
    let right = left + cursor;
    if (right > ruler) {
      // 超过宽度
      left = ruler - cursor;
      right = ruler;
    }
    const setColr = StringToRGBA(item.match(colorPattern)[0]);
    list.push({
      percent,
      left,
      right,
      color: setColr,
    });
  });

  return {
    angle,
    list,
  };
}
// 花字渐变转化成背景渐变色数据
// linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(248, 202, 107) 0%, rgb(252, 174, 125) 59.2593%, rgb(252, 174, 125) 60.4938%);
export function getBackgroundByEffect(effData: any) {
  const data = JSON.parse(JSON.stringify(effData));
  data.colorStops.sort((a: any, b: any) => {
    return a.offset - b.offset;
  });
  data.angle = angleCanvasToDom(data.angle);
  let temp = `linear-gradient(${data.angle}deg,`;
  data.colorStops.forEach((element, index) => {
    let setColor = element.color;
    if (setColor) {
      if (typeof setColor !== 'string') {
        setColor = RGBAToString(setColor);
      }
      if (index === data.colorStops.length - 1) {
        temp = `${temp + setColor} ${element.offset * 100}%`;
      } else {
        temp = `${temp + setColor} ${element.offset * 100}%,`;
      }
    }
  });
  temp += ')';
  return temp;
}
/**
 * 转化成花字效果的花字
 * {
  "type": "linear",
  "offsetX": 0,
  "offsetY": 0,
  "colorStops": [
    {
      "color": "rgba(255,252,253,1)",
      "offset": 0
    },
    {
      "color": "rgba(255,41,127,1)",
      "offset": 1
    }
  ],
  "gradientTransform": [],
  "gradientUnits": "percentage",
  "coords": {
    "x1": 0,
    "y1": 0,
    "x2": 0,
    "y2": 1
  }
}
 */
export function getListByEffectGradientColor(effect: any) {
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
/**
 * 转化成花字效果的花字
 * {
  "type": "linear",
  "offsetX": 0,
  "offsetY": 0,
  "colorStops": [
    {
      "color": "rgba(255,252,253,1)",
      "offset": 0
    },
    {
      "color": "rgba(255,41,127,1)",
      "offset": 1
    }
  ],
  "gradientTransform": [],
  "gradientUnits": "percentage",
  "coords": {
    "x1": 0,
    "y1": 0,
    "x2": 0,
    "y2": 1
  }
}
 */
export function getEffectGradientColor(list: any, angle: number) {
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
  return { coords, colorStops, angle: angle * 1, type: 'linear' };
}
