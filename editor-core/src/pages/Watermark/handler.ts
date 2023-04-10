import { CSSProperties } from 'react';
import {
  getTemplateWatermark,
  setCurrentTime,
  RGBA,
  addAssetInTemplate,
  getCurrentTemplate,
  addTemplateWithNewAsset,
} from '@hc/editor-core';
import { getCanvasInfo } from '@/store/adapter/useTemplateInfo';
import { getNewAssetTemplate } from '@/utils/assetHandler/init';

interface InitDataParams {
  id: number;
  width: number;
  height: number;
  url: string;
  duration: number;
}

export async function initData({
  id,
  width = 1080,
  height = 1920,
  url,
  duration = 10000,
}: InitDataParams) {
  await addTemplateWithNewAsset({
    assets: [
      {
        type: 'videoE',
        isBackground: true,
        resId: id,
        width: Number(width),
        height: Number(height),
        isLoop: false,
        isUser: true,
        rt_url: url,
        videoVolume: 100,
      },
    ],
    pageTime: Number(duration),
  });

  setCurrentTime(0, false);
}

interface NewWatermarkParams {
  meta: { type: 'text' | 'image'; addOrigin?: string };
  attribute: {
    resId?: number | string;
    height: number;
    width: number;
    fontSize?: number;
    fontFamily?: string;
    color?: RGBA;
    text?: [string];
    picUrl?: string;
    textAlign?: string;
  };
  transform?: { alpha?: number; posX?: number; posY?: Number };
}

// 添加 / 替换 水印
export function setWatermark(
  assetInfo: NewWatermarkParams,
  type: 'add' | 'replace',
) {
  const template = getCurrentTemplate();

  const asset = getNewAssetTemplate(assetInfo.meta.type);

  Object.assign(asset.meta, {
    isWatermark: true,
    locked: true,
  });

  Object.assign(asset.attribute, assetInfo.attribute, {
    startTime: 0,
    endTime: template.videoInfo.allAnimationTime,
  });

  Object.assign(asset.meta, assetInfo.meta);

  if (assetInfo.transform) {
    Object.assign(asset.transform, assetInfo.transform);
  }

  asset.transform.alpha = 50;

  const maxWidth = 200;
  const maxHeight = 200;
  if (assetInfo.meta.type === 'image') {
    const { width, height } = assetInfo.attribute;

    let tempWidth = width;
    let tempHeight = height;

    if (width > maxWidth) {
      tempWidth = maxWidth;
      tempHeight = (maxWidth / width) * height;
    }
    asset.attribute.width = tempWidth;
    asset.attribute.height = tempHeight;
    asset.attribute.assetWidth = tempWidth;
    asset.attribute.assetHeight = tempHeight;
  }

  // console.log('setWatermark', type, asset);

  if (type === 'add') {
    addAssetInTemplate(asset);
  } else if (type === 'replace') {
    const watermark = template.watermark[assetInfo.meta.type];

    watermark?.replaceAssetSelf({
      meta: watermark.meta,
      attribute: { ...watermark, ...asset.attribute },
      transform: watermark.transform,
    });
  }
}

function assetPosition(assetSize?: { width: number; height: number }) {
  const { width, height } = getCanvasInfo();
  const watermarkInfo = getTemplateWatermark();
  if (!width || !watermarkInfo) return {};

  let maxPosX;
  let maxPosY;
  if (assetSize) {
    maxPosX = Math.ceil(width - assetSize.width);
    maxPosY = Math.ceil(height - assetSize.height);
  } else {
    maxPosX = Math.ceil(width - watermarkInfo.attribute.width);
    maxPosY = Math.ceil(height - watermarkInfo.attribute.height);
  }

  const centerPosX = maxPosX / 2;
  const centerPosY = maxPosY / 2;

  return {
    minPosX: 24,
    minPosY: 24,
    maxPosX: maxPosX - 24,
    maxPosY: maxPosY - 24,
    centerPosX,
    centerPosY,
  };
}

declare const WatermarkPositionTypes: [
  'top', // 0
  'left', // 1
  'right', // 2
  'bottom', // 3
  'center', // 4
  'topLeft', // 5
  'topRight', // 6
  'bottomRight', // 7
  'leftBottom', // 8
];

export declare type WatermarkPosition = typeof WatermarkPositionTypes[number];

// 计算水印在内核的渲染位置
export function calcWatermarkPositionForEditor(
  position: WatermarkPosition,
  assetSize?: { width: number; height: number },
) {
  // console.log('position', position, 'assetSize', assetSize);
  // const { width, height } = getCanvasInfo();
  const { minPosX, minPosY, maxPosX, maxPosY, centerPosX, centerPosY } =
    assetPosition(assetSize);

  let posX = minPosX;
  let posY = minPosY;

  let textAlign: CSSProperties['textAlign'] = 'left';

  switch (position) {
    case 'top':
      posX = centerPosX;
      textAlign = 'center';
      break;
    case 'topRight':
      posX = maxPosX;
      textAlign = 'right';
      break;
    case 'left':
      posY = centerPosY;
      break;
    case 'leftBottom':
      posY = maxPosY;
      break;

    case 'bottom':
      posY = maxPosY;
      posX = centerPosX;
      textAlign = 'center';

      break;
    case 'bottomRight':
      posX = maxPosX;
      posY = maxPosY;
      textAlign = 'right';

      break;
    case 'right':
      posX = maxPosX;
      posY = centerPosY;
      textAlign = 'right';

      break;
    case 'center':
      posX = centerPosX;
      posY = centerPosY;
      textAlign = 'center';

      break;
    default:
      break;
  }

  return {
    posX,
    posY,
    textAlign,
  };
}

// 水印位置转换成页面数据
export function editorPositionForView(position: {
  posX: number;
  posY: number;
  textAlign?: string;
}) {
  if (position?.posX === undefined || position?.posX === null) return 'topLeft';

  const { posX, posY, textAlign } = position;
  const { minPosX, minPosY, maxPosX, maxPosY, centerPosX, centerPosY } =
    assetPosition();

  let str: WatermarkPosition;

  switch (posY) {
    case maxPosY:
      if (textAlign ? textAlign === 'center' : posX === centerPosX) {
        str = 'bottom';
      } else if (textAlign ? textAlign === 'right' : posX === maxPosX) {
        str = 'bottomRight';
      } else {
        str = 'leftBottom';
      }
      break;
    case centerPosY:
      if (textAlign ? textAlign === 'center' : posX === centerPosX) {
        str = 'center';
      } else if (textAlign ? textAlign === 'right' : posX === maxPosX) {
        str = 'right';
      } else {
        str = 'left';
      }

      break;

    default:
      if (textAlign ? textAlign === 'center' : posX === centerPosX) {
        str = 'top';
      } else if (textAlign ? textAlign === 'right' : posX === maxPosX) {
        str = 'topRight';
      } else {
        str = 'topLeft';
      }
  }

  return str;
}

// 设置图片水印大小
export function calcImgWatermarkSizeForEditor(percent: number) {
  let width = 0;
  let height = 0;
  const watermarkInfo = getTemplateWatermark();
  if (!watermarkInfo) return { width, height };

  const {
    attribute: { assetHeight, assetWidth },
  } = watermarkInfo;
  width = Number((assetWidth * (percent / 100)).toFixed(2));
  height = Number((assetHeight * (percent / 100)).toFixed(2));

  return { width, height };
}

// 水印大小转换成百分比
export function convertImageSizeToPercent(size: {
  width: number;
  height: number;
}) {
  let percent = 0;
  const watermarkInfo = getTemplateWatermark();
  // console.log('assetWidth', watermarkInfo.attribute.assetWidth);

  if (watermarkInfo && size) {
    percent = Number(
      ((size.width / watermarkInfo.attribute.assetWidth) * 100).toFixed(2),
    );
  }

  return percent;
}
