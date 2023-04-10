import { config } from '@kernel/utils/config';
import React, { CSSProperties } from 'react';
import { RGBAToString } from '@kernel/utils/single';
import type { Refs, TextPositionObject } from './typing';

interface ForEachTextParentCbParams {
  // 父循环的值
  value: string;
  // 父循环的索引
  index: number;
  // value的length
  valueLength: number;
  // 当前遍历数组的length
  textArrayLength: number;
}

interface ForEachTextItemCbParams extends ForEachTextParentCbParams {
  // 子索引
  itemIndex: number;
  // 生成的唯一key值
  key: string;
  // 子值
  itemValue: string;
}

interface ForEachTextCallBack {
  parentCb?: (data: ForEachTextParentCbParams) => void;
  itemCb?: (data: ForEachTextItemCbParams) => void;
  endCb?: (data: ForEachTextParentCbParams) => void;
}

/**
 * @description 将stringt[]扁平化后得出的length
 * @param textArray
 */
export function getAllTextLength(textArray: string[]) {
  let length = 0;
  for (let i = 0; i < textArray.length; i++) {
    length += textArray[i].length;
  }
  return length;
}

export function createTextId(
  parentIndex: number | string,
  itemIndex: number | string,
) {
  return `${parentIndex}-${itemIndex}`;
}

/**
 * 帮助遍历字体的方法
 * @param text 文字数组
 * @param parentCb 父循环执行的回调
 * @param itemCb 子循环执行的回调，不传则不执行子循环
 * @param endCb 父循环执行到最后的回调
 */
export function forEachText(
  text: string[],
  { parentCb, itemCb, endCb }: ForEachTextCallBack,
) {
  const textArrayLength = text.length;
  for (let index = 0; index < textArrayLength; index++) {
    const value = text[index];
    const valueLength = value.length;
    const params = {
      value,
      index,
      valueLength,
      textArrayLength,
    };
    parentCb && parentCb(params);
    // 如果没有子回调，就不需要执行内循环
    if (itemCb) {
      for (let itemIndex = 0; itemIndex < valueLength; itemIndex++) {
        const key = createTextId(index, itemIndex);
        const itemValue = value[itemIndex];
        itemCb({
          key,
          itemIndex,
          itemValue,
          ...params,
        });
      }
    }
    endCb && endCb(params);
  }
}

/**
 * @description 生成当前字体的样式
 * @param item
 * @param fontSize
 */
export function buildStyle(item: any, fontSize: number) {
  const bodyStyle: CSSProperties = {
    zIndex: 1000 + item.zindex,
    top: `${fontSize * item.top}px`,
    left: `${fontSize * item.left}px`,
    transform: '',
  };

  if (item.strokeColor) {
    let tempColorStr = RGBAToString(item.strokeColor);
    if (item.strokeColor.a === 0) {
      tempColorStr = 'transparent';
    }
    Object.assign(bodyStyle, {
      WebkitTextStroke: `${fontSize * item.strokeWidth}px  ${tempColorStr}`,
    });
  }

  if (item.shadowColor) {
    const tempRgba = RGBAToString(item.shadowColor);
    Object.assign(bodyStyle, {
      textShadow: `${fontSize * item.shadowH}px ${fontSize * item.shadowV}px ${
        fontSize * item.shadowBlur
      }px ${tempRgba}`,
    });
  }
  if (item.backgroundClip) {
    Object.assign(bodyStyle, {
      WebkitBackgroundClip: item.backgroundClip,
    });
  }
  if (item.color) {
    if (item.color.a === 0) {
      Object.assign(bodyStyle, {
        WebkitTextFillColor: 'transparent',
      });
    } else {
      Object.assign(bodyStyle, {
        WebkitTextFillColor: RGBAToString(item.color),
      });
    }
  }
  if (item.linearGradient) {
    let tempStr = '';
    item.linearGradient.colors.forEach((subItem: any, subIndex: number) => {
      if (subIndex !== 0) {
        tempStr += ',';
      }
      tempStr += ` ${RGBAToString(subItem.color)} ${subItem.position * 100}%`;
    });
    Object.assign(bodyStyle, {
      backgroundImage: `linear-gradient(${item.linearGradient.angle}deg, ${tempStr})`,
    });
  }
  if (item?.skewX || item?.skewY) {
    Object.assign(bodyStyle, {
      transform: `skew(${item.skewX}deg, ${item.skewY}deg)`,
      transformOrigin: '0px 0px 0px',
    });
  }
  if (item.backgroundURL) {
    const url = item.backgroundURL.includes('https')
      ? item.backgroundURL
      : config.cdnHost + item.backgroundURL;
    Object.assign(bodyStyle, {
      backgroundImage: `url(${url})`,
      backgroundRepeat: 'repeat',
    });
  }
  if (item.backgroundSize) {
    Object.assign(bodyStyle, {
      backgroundSize: `${fontSize * item.backgroundSize.width}px ${
        fontSize * item.backgroundSize.height
      }px`,
    });
  }
  bodyStyle.transform += ' translateZ(0px)';
  return bodyStyle;
}

export function oldBuildStyle(item: any, fontSize: number) {
  const bodyStyle: CSSProperties = {
    zIndex: 1000 + item.zindex,
    top: `${fontSize * item.top}px`,
    left: `${fontSize * item.left}px`,
  };
  if (item.strokeColor) {
    let tempColorStr = `rgba(${item.strokeColor.r},${item.strokeColor.g},${item.strokeColor.b},${item.strokeColor.a})`;
    if (item.strokeColor.a == 0) {
      tempColorStr = 'transparent';
    }
    Object.assign(bodyStyle, {
      WebkitTextStroke: `${fontSize * item.strokeWidth}px` + ` ${tempColorStr}`,
    });
  }
  if (item.shadowColor) {
    const tempRgba = `rgba(${item.shadowColor.r},${item.shadowColor.g},${item.shadowColor.b},${item.shadowColor.a})`;
    Object.assign(bodyStyle, {
      textShadow:
        `${fontSize * item.shadowH}px` +
        ` ${fontSize * item.shadowV}px` +
        ` ${fontSize * item.shadowBlur}px ${tempRgba}`,
    });
  }
  if (item.backgroundClip) {
    Object.assign(bodyStyle, {
      // webkitBackgroundClip: item.backgroundClip,
      WebkitBackgroundClip: item.backgroundClip,
      // ["background-clip"]: item.backgroundClip
    });
  }
  if (item.color) {
    if (item.color.a === 0) {
      Object.assign(bodyStyle, {
        WebkitTextFillColor: 'transparent',
      });
    } else {
      Object.assign(bodyStyle, {
        WebkitTextFillColor: `rgba(${item.color.r},${item.color.g},${item.color.b},${item.color.a})`,
      });
    }
  }
  if (item.linearGradient) {
    let tempStr = '';
    // @ts-ignore
    item.linearGradient.colors.map((subItem, subIndex) => {
      if (subIndex != 0) {
        tempStr += ',';
      }
      tempStr += ` rgba(${subItem.color.r},${subItem.color.g},${
        subItem.color.b
      },${subItem.color.a}) ${subItem.position * 100}%`;
    });
    Object.assign(bodyStyle, {
      backgroundImage:
        `linear-gradient(${item.linearGradient.angle}deg,` + ` ${tempStr})`,
    });
  }
  if (
    (item.skewX != undefined && item.skewX != '') ||
    (item.skewY != undefined && item.skewY != '')
  ) {
    Object.assign(bodyStyle, {
      transform: `skew(${item.skewX}deg, ${item.skewY}deg)`,
      transformOrigin: '0px 0px 0px',
    });
  }
  if (item.backgroundURL) {
    Object.assign(bodyStyle, {
      backgroundImage: `url(https://js.tuguaishou.com${item.backgroundURL})`,
      backgroundRepeat: 'repeat',
    });
  }
  if (item.backgroundSize) {
    Object.assign(bodyStyle, {
      backgroundSize: `${fontSize * item.backgroundSize.width}px ${
        fontSize * item.backgroundSize.height
      }px`,
    });
  }
  bodyStyle.transform += ' translateZ(0px)';
  return bodyStyle;
}

/**
 * @description 计算动画文字位置
 * @param textRefs 文字的ref
 * @param text 文字集合
 */
export function calcAniTextPosition(textRefs: Refs, text: string[]) {
  const posObj: TextPositionObject = {};
  forEachText(text, {
    itemCb: ({ key }) => {
      const node = textRefs[key];
      if (node) {
        posObj[key] = {
          left: node.offsetLeft,
          top: node.offsetTop,
          width: node.offsetWidth,
          height: node.offsetHeight,
        };
      }
    },
  });
  return posObj;
}
