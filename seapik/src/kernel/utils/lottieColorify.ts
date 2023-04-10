import { get } from 'lodash-es';
import { RGBA } from '../typing';
import { colorToRGBAObject, rbgaObjToHex, RGBAToString } from './single';

const QUERY_KEY = 'CL';

// 通过dom id修改该id下对应的类的颜色
export const setColorById = (colors: Record<string, RGBA>, id?: string) => {
  const wrapper = id ? document.querySelector(`#${id}`) : document;
  Object.entries(colors).forEach(([key, val]) => {
    key = key.replace('#', '');
    const elements = wrapper?.querySelectorAll<SVGAElement>(
      `.${QUERY_KEY}${key}`,
    );
    // console.log(
    //   '查询数据=======',
    //   wrapper?.querySelectorAll('.CL74DDFF'),
    //   elements,
    //   key,
    // );
    if (!elements) return;
    elements.forEach(ele => {
      // const mask = ele.getAttribute('mask');
      if (ele.tagName === 'g') {
        ele.childNodes.forEach(e => {
          // @ts-ignore
          e.style.fill = RGBAToString(val);
          // @ts-ignore
          e.style.stroke = RGBAToString(val);
        });
      } else {
        ele.style.fill = RGBAToString(val);
        ele.style.stroke = RGBAToString(val);
      }
    });
  });
};

// 将 lottie 色值[0-1]转为 rgb 色值[0-255]
export const fromUnitVector = (n: number) => {
  if (typeof n !== 'number') {
    throw new TypeError('Expecting a number value!');
  }
  return Math.round(n * 255);
};

// 将 rgb 色值[0-255]转为 lottie 色值[0-1]
export const toUnitVector = (n: number) => {
  if (typeof n !== 'number') {
    throw new TypeError('Expecting a number value!');
  }
  return Math.round((n / 255) * 1000) / 1000;
};

interface Shape {
  it?: Shape[];
  ty: string | number;
  nm: string;
  c?: {
    k: number[];
  };
  cl?: string;
  sc?: string;
  shapes?: Shape[];
  // 遮罩层
  td?: number;
}

// 解析纯色图层
const SolidColor = (el: Shape, colors: Record<string, RGBA>) => {
  // 有标记的颜色图层
  const newColors: Record<string, RGBA> = {};
  // 所有解析出来的颜色图层
  const allColors: Record<string, RGBA> = {};
  let autoParse = true;
  let [r, g, b, a] = [0, 0, 0, 1];
  const hex = el.sc!.toLocaleUpperCase();
  const key = el.cl || `fl-${hex.replace('#', '')}`;
  [r, g, b, a] = Object.values(colorToRGBAObject(el.sc!));

  const userColors = colors[key];
  if (userColors) {
    // TODO: 文档描述该字段为十六进制格式，但测下来用rgba也能正常渲染
    el.sc = RGBAToString(userColors);
  }
  // 文件中有标记
  if (el.cl) {
    newColors[el.cl] = userColors || { r, g, b, a };
    autoParse = false;
  }

  if (key) {
    el.cl = key;
    allColors[key] = userColors || { r, g, b, a };
  }
  return { newColors, allColors, autoParse };
};

// 通过json文件修改 lottie 颜色
export function setColorsByJSON(opts: {
  animationData: any;
  colors: Record<string, RGBA>;
  startingPath?: string;
}) {
  const { animationData, colors, startingPath = 'layers' } = opts;
  const data = JSON.parse(JSON.stringify(animationData));
  // 有标记的颜色图层
  const newColors: Record<string, RGBA> = {};
  // 所有解析出来的颜色图层
  const allColors: Record<string, RGBA> = {};
  let autoParse = true;
  const layersOrShapes: Shape[] = get(data, startingPath);

  if (!Array.isArray(layersOrShapes)) {
    throw new TypeError('Expected an array of layers or shapes');
  }

  layersOrShapes.forEach(el => {
    // 遮罩模式  数据需要排除掉
    if (el.td === 1) {
      return;
    }
    let [r, g, b, a] = [0, 0, 0, 1];
    let userColors: RGBA | undefined;
    let key: string | undefined;

    // 纯色图层
    if (el.ty === 1 && el.sc) {
      const solidColor = SolidColor(el, colors);
      Object.assign(newColors, solidColor.newColors);
      Object.assign(allColors, solidColor.allColors);
      if (!solidColor.autoParse) {
        autoParse = false;
      }
    }

    if (Array.isArray(el.shapes)) {
      // 遍历形状层
      el.shapes.forEach((outerShape: Shape) => {
        const actualShapes = outerShape.it || [outerShape];
        actualShapes.forEach((shape: Shape) => {
          // 解析填充或描边图层
          if (shape.ty === 'fl' || shape.ty === 'st') {
            if (!shape.c?.k) return;

            const color = shape.c.k;

            // 将lottie的色值转为rgb色值
            [r, g, b] = color.slice(0, 3);
            if ([r, g, b].every(v => v <= 1)) {
              [r, g, b] = [r, g, b].map(c => fromUnitVector(c));
            }
            a = color['3'];
            const hex = rbgaObjToHex({ r, g, b, a }, '').toLocaleUpperCase();
            // 如果json文件中有cl标记，就用标记作为key，没有就用当前颜色的十六进制作为key，颜色相同的会合并为同一类
            // key = shape.cl || `${shape.ty}-${hex}`;
            key = shape.cl || `#${hex}`;
            // 修改用户设置的颜色
            userColors = colors[key];
            if (userColors) {
              shape.c.k = [
                toUnitVector(userColors.r),
                toUnitVector(userColors.g),
                toUnitVector(userColors.b),
                userColors.a || 1,
              ];
            }
          }

          // 文件中有标记
          if (shape.cl) {
            newColors[shape.cl] = userColors || { r, g, b, a };
            autoParse = false;
          }

          if (key) {
            const keycode = key.replace('#', '');
            shape.cl = `${QUERY_KEY}${keycode}`;
            allColors[key] = userColors || { r, g, b, a };
          }
        });
      });
    }
  });
  return { data, colors: autoParse ? allColors : newColors };
}
