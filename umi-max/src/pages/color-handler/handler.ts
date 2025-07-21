import { gradientColors } from "./data";
import { GradientColor } from "./types";

const AngleCoordsMap = {
  45: JSON.stringify({ x1: 0, y1: 1, x2: 1, y2: 0 }),
  90: JSON.stringify({ x1: 0, y1: 0, x2: 1, y2: 0 }),
  135: JSON.stringify({ x1: 0, y1: 0, x2: 1, y2: 1 }),
  180: JSON.stringify({ x1: 0, y1: 0, x2: 0, y2: 1 }),
  225: JSON.stringify({ x1: 1, y1: 0, x2: 0, y2: 1 }),
  270: JSON.stringify({ x1: 1, y1: 0, x2: 0, y2: 0 }),
  315: JSON.stringify({ x1: 1, y1: 1, x2: 0, y2: 0 }),
  0: JSON.stringify({ x1: 0, y1: 1, x2: 0, y2: 0 }),
};

type AngleCoordsMapKeys = keyof typeof AngleCoordsMap;
const transformAngle2Coords = (angle: number) => {
  angle = angle % 360;
  return JSON.parse(
    AngleCoordsMap[angle as AngleCoordsMapKeys] || AngleCoordsMap[90]
  );
};

const transformCoords2Angel = (coords: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) => {
  const keys = Object.keys(AngleCoordsMap);
  for (let key of keys) {
    let _coords = { ...coords };
    _coords = {
      x1: coords.x1 > 1 ? 1 : 0,
      y1: coords.y1 > 1 ? 1 : 0,
      x2: coords.x2 > 1 ? 1 : 0,
      y2: coords.y2 > 1 ? 1 : 0,
    };
    if (JSON.stringify(_coords) === AngleCoordsMap[key]) {
      return Number(key);
    }
  }
  return 90;
};

/**
   * 转换数据
   * // 背景渐变数据转list
// linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(248, 202, 107) 0%, rgb(252, 174, 125) 59.2593%, rgb(252, 174, 125) 60.4938%);
   * @param {Object} background 颜色
   * @param {Object} ruler 外宽度
   * @param {Object} cursor 模块宽度
   */
export function getDataByBackground(
  background: string,
  ruler = 205,
  cursor = 18
) {
  if (!background || !ruler || !cursor) {
    throw new Error("参数错误!");
  }
  let angle = 0;
  const list: any[] = [];
  const anglePattern = /-?\d+(\.\d+)?deg/gi;
  const colorPattern =
    /(rgb(a?)\()(\d+),( *)(\d+), *(\d+)(, *(\d+(\.\d+)?))?\)/g;
  const percentPattern =
    /(rgb(a?)\()(\d+),( ?)(\d+), ?(\d+)(, ?(\d+(\.\d+)?))?\)(( ?)(\d+(\.\d+)?)%)?/gi;
  const angleMatch = background.match(anglePattern);
  angleMatch?.forEach((item) => {
    angle = item.replace(/deg/g, "") * 1;
  });
  const listMatch = background.match(percentPattern);
  listMatch?.forEach((item) => {
    let percent = 0;
    percent = item.match(/\d+(\.\d+)?%/g)[0].replace("%", " ") * 1;
    let left = (ruler * percent) / 100;
    let right = left + cursor;
    if (right > ruler) {
      // 超过宽度
      left = ruler - cursor;
      right = ruler;
    }
    const setColr = item.match(colorPattern)[0];
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

export function getEffectGradientColor(
  list: any,
  angle: number,
  type = "linear"
) {
  const coords = transformAngle2Coords(angle);
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
  return { coords, colorStops, type };
}

export function gradientObj2Str(gradient: GradientColor) {
  const deg = transformCoords2Angel(gradient.coords); // 简化方向判断
  const stops = gradient.colorStops
    .map((stop) => `${stop.color} ${stop.offset * 100}%`)
    .join(", ");

  return `linear-gradient(${deg}deg, ${stops})`;
}

// const newColors = [];
// gradientColors.forEach((item) => {
//   const { angle, list } = getDataByBackground(item);

//   const res = getEffectGradientColor(list, angle);
//   newColors.push(res);
// });

// console.log(newColors);
