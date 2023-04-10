import {
  Asset,
  AssetBaseSize,
  AssetClass,
  EffectVariant,
  Attribute,
  Transform,
  ReplaceClipSvgParams,
  RGBA,
  AeA,
} from '@kernel/typing';
import assetHandler from '@kernel/store/assetHandler';
import global from '@kernel/store/global';
import { isMaskType } from '@kernel/utils/assetChecker';
import {
  buildAttribute,
  buildTransform,
} from '@kernel/store/assetHandler/utils';
import { assetUpdater } from '@kernel/store/assetHandler/adapter/Handler/BaseHandler';
import { reportChange } from '@kernel/utils/config';
import { deepCloneJson } from '@kernel/utils/single';
import {
  calcAeATimeToPbr,
  calcAssetTime,
  CalcAssetTimeType,
  getAssetAea,
} from '@kernel/utils/StandardizedTools';
import { toNumber } from 'lodash-es';

class HighlightAssetsHandler {
  timer?: number;

  delay = 0;

  set = (assets: AssetClass[], delay = 2000) => {
    this.delay = delay;
    clearTimeout(this.timer);
    assetHandler.setHighlightAssets(assets);
    // @ts-ignore
    this.timer = setTimeout(() => {
      this.clear();
    }, delay);
  };

  clear = () => {
    assetHandler.setHighlightAssets([]);
  };
}

export const highlightAssetsHandler = new HighlightAssetsHandler();

export function useUpdateAttributeFactoryByObserver<T>(
  attributeKey: keyof Attribute,
  defaultValue?: T,
) {
  // 针对裁剪之后的视频处理
  let asset = assetHandler.currentAsset;
  if (isMaskType(asset) && asset?.assets && asset?.assets.length > 0) {
    asset = asset?.assets[0];
  }
  const value = asset?.attribute?.[attributeKey] ?? defaultValue;

  function update(value: T) {
    assetUpdater(
      asset,
      buildAttribute({
        [attributeKey]: value,
      }),
    );
    reportChange(attributeKey, true);
  }

  return [value, update];
}

export function useUpdateTransformFactoryByObserver<T>(
  transformKey: keyof Transform,
  defaultValue?: T,
) {
  const { currentAsset } = assetHandler;
  const value = currentAsset?.transform?.[transformKey] ?? defaultValue;

  function update(value: T) {
    if (
      currentAsset &&
      isMaskType(currentAsset) &&
      currentAsset?.assets?.length > 0
    ) {
      currentAsset?.assets[0]?.update(
        buildTransform({
          [transformKey]: value,
        }),
      );
    }
    currentAsset?.update(
      buildTransform({
        [transformKey]: value,
      }),
    );
    reportChange(transformKey, true);
  }

  return [value, update];
}

export function useUpdateWatermarkAttributeFactory<T>(
  attributeKey: keyof Attribute,
  defaultValue?: T,
) {
  const value =
    assetHandler.watermark?.attribute?.[attributeKey] ?? defaultValue;

  function update(value: T) {
    if (assetHandler.watermark?.meta.id) {
      assetUpdater(
        assetHandler.watermark,
        buildAttribute({ [attributeKey]: value }),
      );
      reportChange('watermark', true);
    }
  }

  return [value, update];
}

export function useUpdateWatermarkTransformFactory<T>(
  transformKey: keyof Transform,
  defaultValue?: T,
) {
  const value =
    assetHandler.watermark?.transform?.[transformKey] ?? defaultValue;

  function update(value: T) {
    if (assetHandler.watermark?.meta.id) {
      assetUpdater(
        assetHandler.watermark,
        buildTransform({
          [transformKey]: value,
        }),
      );
      reportChange('watermark', true);
    }
  }

  return [value, update];
}

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

export function getNewAssetPosition(
  size: AssetBaseSize,
  canvasSize?: { width: number; height: number },
) {
  const { width = 0, height = 0 } = canvasSize ?? global.canvasInfo;

  return {
    posX: (width - size.width) / 2,
    posY: (height - size.height) / 2,
  };
}

export function updateAssetDurationByRatio({
  aeA,
  ratio,
}: {
  aeA: AeA;
  ratio: number;
}) {
  const {
    i: { duration: iDuration = 0, kw: IKw },
    o: { duration: oDuration = 0, kw: Okw },
  } = aeA;
  const cAeA = deepCloneJson(aeA);
  if (IKw) {
    const newIDuration = Math.round(iDuration * ratio);

    cAeA.i.duration = newIDuration;
    cAeA.i.pbr = calcAeATimeToPbr(newIDuration, IKw);
  }
  if (Okw) {
    const newODuration = Math.round(oDuration * ratio);

    cAeA.o.duration = newODuration;
    cAeA.o.pbr = calcAeATimeToPbr(newODuration, Okw);
  }

  return cAeA;
}

/**
 * @description 根据动画和rt_assetTime,计算出元素实际出现的时间
 * @param attribute
 * @param needAuto 是否需要自动计算元素剩余时间
 */
export function calcAssetAndAeaDuration(
  attribute: CalcAssetTimeType,
  needAuto = true,
) {
  const { startTime, endTime } = attribute;
  const aeA = getAssetAea(attribute);

  const assetTime = {
    startTime,
    endTime,
    rt_assetTime: {
      startTime,
      endTime,
    },
  };
  if (aeA.i.duration) {
    assetTime.startTime = Math.round(startTime + aeA.i.duration);
  }
  if (aeA.o.duration) {
    assetTime.endTime = Math.round(endTime - aeA.o.duration);
  }
  // 元素持续时长，最小100ms
  if (needAuto && assetTime.endTime - assetTime.startTime < 100) {
    assetTime.endTime = assetTime.startTime + 100;
    assetTime.rt_assetTime = calcAssetTime({
      ...assetTime,
      aeA,
    });
  }
  return assetTime;
}

/**
 * @description 获取元素的最先出现时间，与元素的最晚结束时间
 * @param assets
 * @param pageTime
 */
export function getAssetLimitTime(
  assets: AssetClass[],
  pageTime: number,
): {
  startTime: number;
  endTime: number;
} {
  const timer = {
    startTime: 0,
    endTime: 0,
  };
  assets.forEach(asset => {
    // const { startTime, endTime } = asset.attribute.rt_assetTime;
    const { startTime, endTime } = asset.assetDuration;

    if (startTime < timer.startTime) {
      timer.startTime = startTime;
    }
    if (endTime > timer.endTime) {
      timer.endTime = endTime;
    }
  });

  timer.startTime = Math.max(timer.startTime, 0);
  timer.endTime = Math.min(timer.endTime, pageTime);
  return timer;
}
