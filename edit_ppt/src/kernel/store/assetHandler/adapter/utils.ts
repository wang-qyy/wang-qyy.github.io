import type {
  Asset,
  Assets,
  ReplaceClipSvgParams,
  Attribute,
  Transform,
  RGBA,
  AssetClass,
  EffectVariant,
  AssetBaseSize,
} from '@kernel/typing';
import assetHandler from '@kernel/store/assetHandler';
import global from '@kernel/store/global';
import { AssetIndex } from '@kernel/typing';

// 处理image的一些操作逻辑
export module Image {
  export function calcSizePosition(
    size: number,
    canvasSize: number,
    pos: number,
  ) {
    let skew = 0;
    let attrSize = size;
    if (size + pos <= canvasSize) {
      if (pos < 0) {
        skew = -pos;
        attrSize = size + pos;
      }
    } else if (pos >= 0) {
      attrSize = canvasSize - pos;
    } else {
      skew = -pos;
      attrSize = canvasSize;
    }
    return {
      skew,
      size: attrSize,
    };
  }

  export function replaceSvgSize(
    asset: AssetClass,
    svgSource: ReplaceClipSvgParams,
  ) {
    const { attribute } = asset;
    const sourceWidth = Number(svgSource.source_width);
    const sourceHeight = Number(svgSource.source_height);

    const { width, height, container } = attribute;
    // let svgWidth = container?.width ?? width;
    // let svgHeight = container?.height ?? height;
    let svgWidth = width;
    let svgHeight = height;
    if (sourceWidth > sourceHeight) {
      svgHeight = svgWidth / (sourceWidth / sourceHeight);
    } else {
      svgWidth = svgHeight / (sourceHeight / sourceWidth);
    }

    return {
      width: svgWidth,
      height: svgHeight,
      posX: 0,
      posY: 0,
    };
  }
}
export namespace FontEffect {
  export function filterVariableSize(layers: EffectVariant['layers']) {
    const variableSizePara: EffectVariant['variableSizePara'] = [];
    layers.forEach((item: any, index: number) => {
      for (const subItem in item) {
        if (
          [
            'top',
            'left',
            'strokeWidth',
            'shadowH',
            'shadowV',
            'shadowBlur',
          ].includes(subItem) &&
          item[subItem] != 0
        ) {
          variableSizePara.push({
            sizes: [
              {
                index,
                key: subItem,
              },
            ],
            range: {
              min: item[subItem] / 10,
              max: item[subItem] * 2,
            },
          });
        }
      }
    });
  }

  /**
   * @description 根据变化的颜色设置colorBlock
   * @param tempArr
   */
  export function resetColorBlock(tempArr: any) {
    const variableColorPara = [];
    for (const item in tempArr) {
      const tempRgba = item.split(',');
      variableColorPara.push(
        Object.assign(tempArr[item], {
          colorBlock: {
            r: tempRgba[0],
            g: tempRgba[1],
            b: tempRgba[2],
            a: tempRgba[3],
          },
        }),
      );
    }
    return variableColorPara;
  }

  /**
   * @description 提取特效字中的可变颜色
   * @param effectVariant
   */
  export function filterFontEffectColor(effectVariant: EffectVariant) {
    const tempArr = {};
    effectVariant?.layers.forEach((item, index) => {
      for (const subItem in item) {
        // @ts-ignore
        const target = item[subItem] as RGBA;
        if (
          (subItem === 'color' ||
            subItem === 'strokeColor' ||
            subItem === 'shadowColor') &&
          target.a &&
          target.a > 0
        ) {
          const tempKey = `${target.r},${target.g},${target.b},${target.a}`;
          // @ts-ignore
          if (!tempArr[tempKey]) {
            // @ts-ignore
            tempArr[tempKey] = {};
            // @ts-ignore
            tempArr[tempKey].colors = [];
          }
          // @ts-ignore
          tempArr[tempKey].colors.push({
            index,
            key: subItem,
          });
        }
      }
    });

    return resetColorBlock(tempArr);
  }
}

/**
 * @description 获取元素的索引序列， 由于引入的组的概念，所以想要删除元素，需要找到元素的索引序列，才能根据序列一步一步找到元素所在的位置，执行删除操作
 * @param assetId
 * @param templateIndex
 */
export function getAssetIndexById(assetId: number, templateIndex?: number) {
  if (typeof assetId !== 'number') {
    return undefined;
  }
  let { assets = [] } = assetHandler;
  if (typeof templateIndex === 'number' && templateIndex > -1) {
    assets = assetHandler.templates?.[templateIndex].assets ?? [];
  }
  const findAsset = (assets: AssetClass[], array?: number[]): number[] => {
    for (let i = 0; i < assets.length; i++) {
      const indexArray = array ?? [];
      const asset = assets[i];
      if (asset.meta.id === assetId) {
        indexArray.push(i);
        return indexArray;
      }
      if (asset.assets?.length) {
        return findAsset(asset.assets, indexArray);
      }
    }
    return [];
  };

  return findAsset(assets);
}

export const getTargetAsset = (index: AssetIndex, templateIndex?: number) => {
  if (typeof index === 'number') {
    if (index < 0) {
      return undefined;
    }
    if (typeof templateIndex === 'number' && templateIndex > -1) {
      return assetHandler.templates?.[templateIndex].assets?.[index];
    }
    return assetHandler.assets?.[index];
  }
  // 如果index为数组，代表为该元素为组，需要根据数组遍历找到当前元素
  let { assets = [] } = assetHandler;
  const lastIndex = index.length - 2;
  for (let i = 0; i < lastIndex; i++) {
    assets = assets?.[i].assets ?? [];
  }

  return assets?.[lastIndex];
};

export const getTargetAssetById = (assetId: number, templateIndex?: number) => {
  if (typeof assetId !== 'number') {
    return undefined;
  }
  let { assets } = assetHandler;
  if (typeof templateIndex === 'number' && templateIndex > -1) {
    assets = assetHandler.templates?.[templateIndex].assets ?? [];
  }
  const findAsset = (assets: AssetClass[]): undefined | AssetClass => {
    return assets.find((asset) => asset.meta.id === assetId);
  };

  return findAsset(assets);
};
export const getAssetParent = (asset?: AssetClass) => {
  return asset?.parent;
};

/**
 * @description 计算长宽两边的比值
 * @param assetSize
 * @param containerSize
 */
export function calcContainerSizeScale(
  assetSize: AssetBaseSize,
  containerSize: AssetBaseSize,
) {
  return {
    widthScale: assetSize.width / containerSize.width,
    heightScale: assetSize.height / containerSize.height,
  };
}

export function getAssetSizeFormContainerScale(
  scale: {
    widthScale: number;
    heightScale: number;
  },
  container: {
    width: number;
    height: number;
    posX: number;
    posY: number;
  },
) {
  const width = container.width * scale.widthScale;
  const height = container.height * scale.heightScale;
  return {
    width,
    height,
  };
}

export function getNewAssetPosition(size: AssetBaseSize) {
  const { width = 0, height = 0, scale = 0 } = global.canvasInfo;

  return {
    posX: (width / scale - size.width) / 2,
    posY: (height / scale - size.height) / 2,
  };
}
