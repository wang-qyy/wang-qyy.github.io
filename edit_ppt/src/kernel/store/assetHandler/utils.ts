import type {
  Asset,
  Attribute,
  ReplaceClipSvgParams,
  RGBA,
  AssetClass,
  Transform,
  Meta,
  EffectVariant,
} from '@kernel/typing';
import { useCreation } from 'ahooks';
import assetHandler from '@kernel/store/assetHandler';
import global from '@kernel/store/global';

import { AssetIndex } from '@kernel/typing';
import { getAssetRtInfo } from '@kernel/store';
import AssetItemState from '@kernel/store/assetHandler/asset';
import { formatAsset, isModuleType } from '@/kernel';

export function buildAttribute(
  data: Partial<Attribute>,
): Record<'attribute', Partial<Attribute>> {
  return {
    attribute: { ...data },
  };
}

export function buildMeta(data: Partial<Meta>): Record<'meta', Partial<Meta>> {
  return {
    meta: { ...data },
  };
}

export function buildTransform(
  data: Partial<Transform>,
): Record<'transform', Partial<Transform>> {
  return {
    transform: { ...data },
  };
}

export function hooksCreator<T>(Obj: new (asset?: Asset) => T) {
  return (asset?: Asset): T => {
    return useCreation(() => new Obj(asset), [asset]);
  };
}

export const loadAssets = async (asset: AssetClass[], parent?: AssetClass) => {
  if (asset.length) {
    const assetAction: Promise<any>[] = [];
    asset.forEach((item, index) => {
      assetAction.push(getAssetRtInfo(item.asset, true).then((res) => {}));
    });
    await Promise.all(assetAction);
  }
};

export const buildAssets = (
  assetList: Asset[],
  parent?: AssetClass,
): AssetClass[] => {
  if (assetList.length) {
    const assets: AssetClass[] = [];
    assetList.forEach((item) => {
      if (
        item.meta.type === 'group' ||
        (isModuleType(item as AssetClass) && !item.assets?.length)
      ) {
        return;
      }
      const asset = formatAsset(true, item);
      const assetClass = new AssetItemState(asset, parent);
      assets.push(assetClass);
    });
    return assets;
  }
  return [];
};

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
    asset: Asset,
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
        // @ts-ignore
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
 * @description 根据元素数据计算模块位置和宽高
 * @param assetLise
 */
export function calcModuleBaseStyle(assetLise: AssetClass[]) {
  if (assetLise.length === 0) {
    return {
      width: 0,
      height: 0,
      left: 0,
      top: 0,
      zIndex: -1,
      assetTime: {
        startTime: 0,
        endTime: 0,
      },
    };
  }
  const { scale } = global.canvasInfo;
  let rectPoint:
    | {
        x1: number;
        x2: number;
        y1: number;
        y2: number;
      }
    | undefined;
  // 模块的zIndex 需要取组中最小的zIndex，保证子元素的点击都不被阻挡
  let zIndex: number | undefined;
  const assetTime = {
    startTime: -1,
    endTime: -1,
  };
  assetLise.forEach((asset) => {
    const { transform, auxiliary, assetDuration } = asset;
    if (
      assetTime.startTime < 0 ||
      assetDuration.startTime < assetTime.startTime
    ) {
      assetTime.startTime = assetDuration.startTime;
    }
    if (assetTime.endTime < 0 || assetDuration.endTime > assetTime.endTime) {
      assetTime.endTime = assetDuration.endTime;
    }

    if (auxiliary) {
      if (!rectPoint) {
        rectPoint = {
          x1: auxiliary.horizontal.start,
          x2: auxiliary.horizontal.end,
          y1: auxiliary.vertical.start,
          y2: auxiliary.vertical.end,
        };
        zIndex = transform.zindex;
      } else {
        if (auxiliary.horizontal.start < rectPoint.x1) {
          rectPoint.x1 = auxiliary.horizontal.start;
        }
        if (auxiliary.horizontal.end > rectPoint.x2) {
          rectPoint.x2 = auxiliary.horizontal.end;
        }
        if (auxiliary.vertical.start < rectPoint.y1) {
          rectPoint.y1 = auxiliary.vertical.start;
        }
        if (auxiliary.vertical.end > rectPoint.y2) {
          rectPoint.y2 = auxiliary.vertical.end;
        }
        if ((zIndex as number) > transform.zindex) {
          zIndex = transform.zindex;
        }
      }
    }
  });

  const { x1 = 0, x2 = 0, y1 = 0, y2 = 0 } = rectPoint ?? {};
  return {
    width: Math.abs(x2 - x1) / scale,
    height: Math.abs(y2 - y1) / scale,
    left: x1 / scale,
    top: y1 / scale,
    zIndex,
    assetTime,
  };
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
  let { assets = [] } = assetHandler;
  if (typeof templateIndex === 'number' && templateIndex > -1) {
    assets = assetHandler.templates?.[templateIndex].assets ?? [];
  }
  const findAsset = (assets: AssetClass[]): undefined | AssetClass => {
    for (const asset of assets) {
      if (asset.meta.id === assetId) {
        return asset;
      }
      if (asset.assets?.length) {
        const target = findAsset(asset.assets);
        if (target) {
          return target;
        }
      }
    }
    return undefined;
  };

  return findAsset(assets);
};
export const getAssetParent = (asset?: AssetClass) => {
  return asset?.parent;
};

export function getAssetIndexByAsset(asset?: AssetClass) {
  if (asset) {
    return assetHandler.assets?.findIndex((item) => item === asset) ?? -1;
  }
  return -1;
}
/**
 * 获取图层内部可拖拽区域大小
 * @param asset
 */
export function getAssetInnerDragViewScale(asset: AssetClass) {
  if (asset) {
    const { assetPositionScale, assetSizeScale } = asset;
    let vWidth = Math.min(120, assetSizeScale.width / 3);
    let vHeight = Math.min(50, assetSizeScale.height / 4);
    vWidth = Math.max(30, vWidth);
    vHeight = Math.max(30, vHeight);
    const view = {
      width: vWidth,
      height: vHeight,
      left: assetPositionScale?.left + (assetSizeScale.width / 2 - vWidth / 2),
      top: assetPositionScale?.top + (assetSizeScale.height / 2 - vHeight / 2),
    };
    return view;
  }
}
