/* eslint-disable max-classes-per-file */
import { config, maskModelUrl } from '@kernel/utils/config';
import { CSSProperties, SyntheticEvent, useRef } from 'react';
import { throttle, toNumber } from 'lodash-es';
import {
  Asset,
  AssetTime,
  DataType,
  GradientColor,
  RGBA,
} from '@kernel/typing';
import { PlayStatus } from '@kernel/utils/const';
/**
 * canvas的角度转换成dom的角度
 * 因canvas的坐标系和dom的坐标系不同的原因
 * @param angle
 * @returns
 */
export function angleCanvasToDom(angle: number) {
  return 90 - angle;
}
export class IdCreator {
  id = 0;

  constructor(start = 0) {
    this.id = start;
  }

  newId = () => {
    this.id += 1;
    return this.id;
  };
}

export function RGBAToString(RGBA: RGBA) {
  const { r, g, b, a = 1 } = RGBA;
  if (a !== undefined) {
    return `rgba(${r},${g},${b},${a})`;
  }
  return `rgba(${r},${g},${b})`;
}

export function RGBAToStringByOpacity(RGBA: RGBA, opacity: number) {
  const { r, g, b } = RGBA;
  return `rgba(${r},${g},${b},${opacity})`;
}

/**
 * rbga字符串转rgba对象  'rgba(0,0,0,1)'
 * @param color
 */
export function StringToRGBA(color: string) {
  if (typeof color === 'string') {
    color = color.replaceAll('rgba(', '');
    color = color.replaceAll(')', '');
    const strList = color.split(',');
    return {
      r: parseInt(strList[0], 10),
      g: parseInt(strList[1], 10),
      b: parseInt(strList[2], 10),
      a: parseFloat(strList[3]),
    };
  }
  return color;
}

export function isImageType(type: string): boolean {
  return config.imageTypes.includes(type);
}

// eslint-disable-next-line no-undef
export async function fetchHelper(
  url: any,
  config: RequestInit,
  params?: object,
) {
  let query = {};
  let fetchUrl = url;
  if (params) {
    if (config.method === 'GET') {
      const query: string[] = [];
      Object.keys(params).forEach((key) => {
        // @ts-ignore
        query.push(`${key}=${params[key]}`);
      });
      fetchUrl = `${fetchUrl}?${query.join('&')}`;
    } else {
      query = { body: params };
    }
  }
  const data = await fetch(fetchUrl, { credentials: 'include', ...query });
  return data.json();
}

export type FormatData = (res: any) => { cache: boolean; data: typeof res };

export class CacheFetch {
  resources = new Map();

  url: string;

  // eslint-disable-next-line no-undef
  fetchConfig: RequestInit = { method: 'GET' };

  formatData: FormatData = (res) => {
    if (res.stat === 1) {
      return {
        data: res,
        cache: true,
      };
    }
    return {
      data: res,
      cache: false,
    };
  };

  // eslint-disable-next-line no-undef
  constructor(url: string, fetchConfig?: RequestInit, formatData?: FormatData) {
    this.url = url;
    if (fetchConfig) {
      this.fetchConfig = fetchConfig;
    }

    if (formatData) {
      this.formatData = formatData;
    }
  }

  async fetch(
    cacheKey: number | string,
    params?: object,
    url?: string,
  ): Promise<any> {
    try {
      const realUrl = url ?? this.url;
      const res = await fetchHelper(realUrl, this.fetchConfig, params);
      const { cache, data } = this.formatData(res);
      if (cache) {
        this.resources.set(cacheKey, data);
        return this.getData(cacheKey);
      }
      return data;
    } catch (error: any) {
      console.error('fetch error: ', error);
    }
  }

  /**
   *
   * @param cacheKey 一个用于缓存的key
   * @param params 参数
   * @param url 如果传入url，则优先使用此url而非实例化时传入的url
   */
  getData = async (
    cacheKey: number | string,
    params?: object,
    url?: string,
  ): Promise<any> => {
    if (this.resources.has(cacheKey)) {
      return this.resources.get(cacheKey);
    }
    this.resources.set(cacheKey, this.fetch(cacheKey, params, url));
    return this.getData(cacheKey);
  };
}

/**
 * @description 判断数据类型
 * @param value
 * @returns {boolean}
 */
export function dataType(value: any): DataType {
  const temp = Object.prototype.toString.call(value);
  const type = temp.match(/\b\w+\b/g) as string[];
  if (type.length < 2) {
    return 'Undefined';
  }
  return type[1] as DataType;
}

export function addEventListener<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | typeof window | typeof document,
  eventType: keyof HTMLElementEventMap,
  callback: (ev: any) => void,
  options?: boolean | AddEventListenerOptions,
) {
  if (target.addEventListener) {
    // @ts-ignore
    target.addEventListener(eventType, callback, options);
  }
  return function remove() {
    if (target.removeEventListener) {
      // @ts-ignore
      target.removeEventListener(eventType, callback);
    }
  };
}

export function rShow(show: boolean): CSSProperties {
  return show ? {} : { display: 'none' };
}

export function rHidden(show: boolean): CSSProperties {
  return show ? {} : { opacity: 0 };
}

/**
 * @description 仅支持json模式的深克隆
 * @param val
 */
export function deepCloneJson(val: any) {
  let k: any;
  let out: any;
  let tmp: any;

  if (Array.isArray(val)) {
    out = Array((k = val.length));
    // eslint-disable-next-line no-cond-assign
    while (k--)
      out[k] =
        (tmp = val[k]) && typeof tmp === 'object' ? deepCloneJson(tmp) : tmp;
    return out;
  }

  if (Object.prototype.toString.call(val) === '[object Object]') {
    out = {}; // null
    for (k in val) {
      if (k === '__proto__') {
        Object.defineProperty(out, k, {
          value: deepCloneJson(val[k]),
          configurable: true,
          enumerable: true,
          writable: true,
        });
      } else {
        // eslint-disable-next-line no-cond-assign
        out[k] =
          (tmp = val[k]) && typeof tmp === 'object' ? deepCloneJson(tmp) : tmp;
      }
    }
    return out;
  }

  return val;
}

export function colorToRGBA(color: string, opacity: string | number) {
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  if (color && reg.test(color)) {
    color = color.toLowerCase();
    const rbga = [];
    for (let i = 1; i < 7; i += 2) {
      rbga.push(parseInt(`0x${color.slice(i, i + 2)}`));
    }
    return `rgba(${rbga.join(',')},${opacity})`;
  }
  return color;
}

// 十进制转化为16进制
export function hex(n: number) {
  return `0${n.toString(16)}`.slice(-2);
}

/**
 * rbga对象转化为16进制颜色字符串
 * @param rgba
 * @returns
 */
export const rgbaObjToHex = (rgba: RGBA, prefix = '#') => {
  let { r, g, b } = rgba;
  const { a = 1 } = rgba;
  r = Math.floor(r * a);
  g = Math.floor(g * a);
  b = Math.floor(b * a);
  return `${prefix}${hex(r)}${hex(g)}${hex(b)}`;
};

export function colorToRGBAObject(color: string): RGBA {
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  if (color && reg.test(color)) {
    color = color.toLowerCase();
    // 如果只有三位的值，需变成六位，如：#fff => #ffffff
    if (color.length === 4) {
      let colorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
      }
      color = colorNew;
    }
    const rbga = [];
    for (let i = 1; i < 7; i += 2) {
      rbga.push(parseInt(`0x${color.slice(i, i + 2)}`));
    }
    return { r: rbga[0], g: rbga[1], b: rbga[2], a: 1 };
  }
  return { r: 255, g: 255, b: 255, a: 0 };
}

/**
 * 根据角度 反解析坐标
 * @param angle
 * @returns
 */
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

// 计算svg的描边样式类型
export function analyDashTypeBSvg(type: string | [], width: number) {
  if (type) {
    const SVGDashString = ['0,0', '0,1', '0,2', '1,1', '1,2', '2,1', '2,2'];
    if (typeof type === 'string') {
      if (type.indexOf(',') > -1) {
        type = type.replaceAll(' ', '');
        type = type.split(',');
      } else {
        type = type.split(' ');
      }
    }
    if (type.length === 2) {
      const stringDasg = `${toNumber(type[0]) / width},${
        toNumber(type[1]) / width
      }`;
      return SVGDashString.findIndex((item) => item === stringDasg);
    }
    return -1;
  }
  return 0;
}

// 计算svg的描边样式
export function calcSvgDashByType(type: number, width: number) {
  const SVGDashArray = [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 1],
    [1, 2],
    [2, 1],
    [2, 2],
  ];
  const SVGDashItem = SVGDashArray[type];
  const svgDash = `${SVGDashItem[0] * width},${SVGDashItem[1] * width}`;
  return svgDash;
}

export function replaceSvgModelPic(svg: string) {
  // 替换svg的模板图片链接
  if (svg.includes('{placeholder.png}')) {
    svg = svg.replaceAll('{placeholder.png}', maskModelUrl);
  }
  return svg;
}

/**
 * 图层类型判断
 */
export function checkAssetType(asset: Asset) {
  if (asset) {
    if (asset.meta.type === 'mask') {
      if (asset.assets?.length === 1) {
        return asset.assets[0];
      }
    }
    return asset;
  }
}

/**
 * @description 获取canvas针对于页面的信息
 */
export function getCanvasClientRect() {
  return document
    .getElementById('HC-CORE-EDITOR-CANVAS')!
    .getBoundingClientRect();
}

// 阻止冒泡
export function stopPropagation(e: SyntheticEvent) {
  e.stopPropagation();
  e.nativeEvent.stopPropagation();
}

export function mouseMoveDistance(
  e: MouseEvent,
  cb: (distanceX: number, distanceY: number) => void,
  finish?: (distanceX: number, distanceY: number) => void,
) {
  const mouseDownPointX = e.clientX;
  const mouseDownPointY = e.clientY;

  const mouseMove = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;

    cb && cb(currentX - mouseDownPointX, currentY - mouseDownPointY);
  };

  const mouseUp = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;

    finish && finish(currentX - mouseDownPointX, currentY - mouseDownPointY);
    window.removeEventListener('mouseup', mouseUp);
    window.removeEventListener('mousemove', mouseMove);
  };

  window.addEventListener('mouseup', mouseUp);
  window.addEventListener('mousemove', mouseMove);
}
/**
 * 将渐变颜色数据转行成字符串
 * @param effData
 * @returns
 */
export function transferGradientToString(effData: GradientColor) {
  const data = JSON.parse(JSON.stringify(effData));

  data.colorStops.sort((a: any, b: any) => {
    return a.offset - b.offset;
  });
  data.angle = angleCanvasToDom(data.angle);
  let temp =
    data.type === 'linear'
      ? `linear-gradient(${data.angle}deg,`
      : `radial-gradient(farthest-side,`;

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
// 已知2边，求角度
export function getAngle(x: number, y: number) {
  if (Math.abs(x) === 0 && Math.abs(y) === 0) {
    // 选中了外容器
    return 90;
  }
  const radian = Math.atan(y / x); // 弧度
  let angle = Math.floor(180 / (Math.PI / radian)); // 弧度转角度
  angle = Math.abs(parseInt(angle));
  if (x < 0 && y < 0) {
    // x小于0的时候加上180°，即实际角度
    angle = 180 - angle;
  } else if (x > 0 && y < 0) {
    // 不处理
  } else if (x > 0 && y > 0) {
    angle = -angle;
  } else if (x < 0 && y > 0) {
    angle = -(180 - angle);
  }
  return angle;
}
