import { Container, CanvasInfo, AssetClass, isMaskType } from '@/kernel';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { buildNewSizeByOrigin } from '@/kernel/utils/assetHelper/formater/dataBuilder';
import { checkAssetType } from '@/kernel/utils/single';
import { getCanvasInfo } from '@hc/editor-core';

const textType = {
  // 标题字
  title: {
    fontSize: 90,
    fontWeight: 'bold',
    scale: 0.8,
    fontFamily: 'fnsyhtRegular',
    color: {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    },
  },
  // 正文
  text: {
    fontSize: 60,
    fontWeight: 'normal',
    scale: 0.6,
    fontFamily: 'fnsyhtRegular',
    color: {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    },
  },
  // 带底色的正文
  textBackground: {
    fontSize: 60,
    fontWeight: 'normal',
    scale: 0.6,
    fontFamily: 'fnsyhtRegular',
    color: {
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    },
    textBackground: {
      enabled: true,
      color: {
        r: 0,
        g: 0,
        b: 0,
        a: 1,
      },
      opacity: 50,
      borderRadius: 0,
    },
  },
  // 特效字
  effect: {
    fontSize: 60,
    fontWeight: 'normal',
    scale: 0.6,
    fontFamily: 'fnsyhtRegular',
    color: {
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    },
  },
  // 动效字
  animation: { fontSize: 60, fontWeight: 'normal', scale: 0.6 },
};

export type TextType =
  | 'title'
  | 'text'
  | 'textBackground'
  | 'animation'
  | 'effect';

// 添加文字
export function getInitFontAttribute(type: TextType, text = '双击编辑文字') {
  const { fontSize, scale, ...others } = textType[type];
  const width = fontSize * text.length;
  const height = fontSize * 1.5;
  return {
    width,
    height,
    fontSize,
    text: [text],
    ...others,
  };
}

export interface AssetBaseSize {
  width: number;
  height: number;
}

// 元素添加到画布的默认大小
const defaultWidth = 500;

/**
 * 初始化图片视频size
 */
export function getAssetInitSize(params: AssetBaseSize) {
  const { width, height } = params;
  let scale = defaultWidth / width;

  if (width < height) {
    scale = defaultWidth / height;
  }

  return {
    width: width * scale,
    height: height * scale,
    assetWidth: width,
    assetHeight: height,
  };
}

/**
 * @description 背景元素的大小 尽可能铺满画布
 * */
export function getBackgroundAssetSize(params: AssetBaseSize) {
  const { width, height } = params;
  const { width: canvasWidth, height: canvasHeight } = getCanvasInfo();

  let newWidth = canvasWidth;
  let newHeight = (height * canvasWidth) / width;
  if (newHeight < canvasHeight) {
    newHeight = canvasHeight;
    newWidth = (width * canvasHeight) / height;
  }

  return {
    width: newWidth,
    height: newHeight,
    assetWidth: width,
    assetHeight: height,
  };
}
// 横版模板对于图层尺寸的处理
function getAssetSizeByHorizontalTemplate(
  params: AssetBaseSize,
  canvasInfo: { width: number; height: number },
): { width: number; height: number } {
  // 标准设置尺寸为高的80%
  const defaultSize = canvasInfo.height * 0.8;
  // 元素的宽高比
  const assetProportion = params.width / params.height;
  if (defaultSize * assetProportion > canvasInfo.width) {
    // 宽度超过画布宽度 转变成固定宽
    return getAssetSizeByVerticalTemplate(params, canvasInfo);
  }
  return {
    width: defaultSize * assetProportion,
    height: defaultSize,
  };
}
// 竖版对于图层尺寸的处理
function getAssetSizeByVerticalTemplate(
  params: AssetBaseSize,
  canvasInfo: { width: number; height: number },
): { width: number; height: number } {
  // 标准设置尺寸为高的80%
  const defaultSize = canvasInfo.width * 0.8;
  // 元素的宽高比
  const assetProportion = params.height / params.width;
  if (defaultSize * assetProportion > canvasInfo.height) {
    // 高度超过画布高度 转变成固定高
    return getAssetSizeByHorizontalTemplate(params, canvasInfo);
  }
  return {
    width: defaultSize,
    height: defaultSize * assetProportion,
  };
}
/**
 * 根据模板尺寸，自动适应的元素尺寸
 * */
export function getAssetSizeAutoTemplate(params: {
  width: number;
  height: number;
  assetWidth: number;
  assetHeight: number;
}) {
  const { width, height, assetWidth, assetHeight } = params;
  const canvasInfo = getCanvasInfo();
  const { width: canvasWidth, height: canvasHeight } = canvasInfo;
  let size;
  if (canvasWidth >= canvasHeight) {
    // 对于横版和方形模板情况的处理
    size = getAssetSizeByHorizontalTemplate(params, canvasInfo);
  } else {
    // 对于竖版的情况处理
    size = getAssetSizeByVerticalTemplate(params, canvasInfo);
  }
  if (size.width > assetWidth && size.height > assetHeight) {
    size = {
      width,
      height,
    };
  }
  return {
    ...size,
    assetWidth,
    assetHeight,
  };
}
/**
 * 替换元素的大小
 * */
export function formatReplaceSize(
  originSize: AssetBaseSize,
  newSize: AssetBaseSize,
  canvasInfo: CanvasInfo,
  currentAsset: AssetClass,
) {
  let size;
  const { height, width } = originSize;
  // 以大边为准
  let minWidth = 0;
  let minHeight = 0;
  const maxWidth = canvasInfo.width;
  const maxHeight = canvasInfo.height;
  if (
    currentAsset &&
    isMaskType(currentAsset) &&
    currentAsset.assets.length > 0
  ) {
    const { attribute, transform } = currentAsset;
    const childAsset = currentAsset.assets[0];

    const cLeft =
      childAsset?.transform.posX + transform.posX + childAsset.attribute.width;
    const cTop =
      childAsset?.transform.posY + transform.posY + childAsset.attribute.height;

    // minWidth = attribute.width;
    // minHeight = attribute.height;

    minWidth = cLeft - transform.posX;
    minHeight = cTop - transform.posY;

    size = buildNewSizeByOrigin(
      newSize,
      {
        height: childAsset.attribute.height,
        width: childAsset.attribute.width,
      },
      maxWidth,
      maxHeight,
      minWidth,
      minHeight,
    );
  } else {
    size = buildNewSizeByOrigin(
      newSize,
      { height, width },
      maxWidth,
      maxHeight,
      minWidth,
      minHeight,
    );
  }
  return {
    ...size,
    assetWidth: newSize.width,
    assetHeight: newSize.height,
  };
}

export function getNewAssetPosition(size: AssetBaseSize) {
  const { width = 0, height = 0 } = getCanvasInfo();

  return {
    posX: (width - size.width) / 2,
    posY: (height - size.height) / 2,
  };
}

export const getPicUrl = (asset: AssetItemState) => {
  const newAsset = checkAssetType(asset) || asset;
  const { type } = newAsset.meta;
  const { picUrl, SVGUrl, rt_svgString, rt_preview_url } = newAsset.attribute;
  switch (type) {
    case 'image':
    case 'pic':
    case 'background':
      return picUrl;
    case 'SVG':
    case 'mask':
      return SVGUrl || rt_svgString;
    case 'lottie':
    case 'video':
    case 'videoE':
      return rt_preview_url;
    default:
      return '';
  }
};
