import { useDebounceFn } from 'ahooks';
import {
  assetHandler,
  toggleAssetEditStatus,
  setAssetVisible,
  useMaskClipByObserver,
  assetUpdater,
} from '@kernel/store';
import {
  buildAttribute,
  buildMeta,
  buildTransform,
  FontEffect,
} from '@kernel/store/assetHandler/utils';

import { deepCloneJson, calcSvgDashByType } from '@kernel/utils/single';
import {
  calcAaADuration,
  calcAeATimeToPbr,
  getAssetAea,
  getFontEffectId,
} from '@kernel/utils/StandardizedTools';
import { config, reportChange } from '@kernel/utils/config';
import { CacheImage } from '@kernel/utils/cacheImage';
import {
  getAea,
  getFontEffect,
  getFontEffectColorful,
  getFontFamily,
  getSvg,
} from '@kernel/store/cacheManager/fatcher';
import {
  AssetBaseSize,
  AssetClass,
  AssetDurationParams,
  Attribute,
  Transform,
  EffectVariant,
  AeA,
  Position,
  ReplaceClipSvgParams,
  RGBA,
  SignatureEffectWord,
  TemplateData,
  TransformPosition,
  Asset,
  Filters,
  AeAItem,
  Shadow,
  SVGStroke,
  SvgInfo,
  GradientType,
  EffectInfo,
  QrcodeInfo,
} from '@kernel/typing';
import {
  Image,
  useUpdateAttributeFactoryByObserver,
  useUpdateTransformFactoryByObserver,
} from '@kernel/storeAPI/Asset/utils';
import {
  getAssetCoords,
  isAssetInMask,
  setReplaceStatus,
  setAssetActiveHandler,
  useAniPathEffect,
} from '@/kernel/store';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { isMaskType } from '@/kernel';
import {
  TRANSITION_MAX_DURATION,
  TRANSITION_MIN_DURATION,
} from '@/config/basicVariable';
import CameraState from '@/kernel/store/assetHandler/template/camera';
import { getAssetCenterPoint } from '@/kernel/utils/mouseHandler/mouseHandlerHelper';
import { calcPathAnimationSize } from '@/kernel/utils/pathAnimation';
import { getNewAssetPosition } from '../utils';
import { formatEffectColorData } from '..';
import { templateTransferReconcile } from './TemplateHandler';

export {
  toggleAssetEditStatus,
  setAssetVisible,
  useMaskClipByObserver,
  getAssetCoords,
  isAssetInMask,
  setReplaceStatus,
  useAniPathEffect,
  calcAeATimeToPbr,
};
const { filterFontEffectColor } = FontEffect;

export function setEditAsset(asset: AssetClass) {
  if (!asset) {
    return;
  }
  const { meta } = asset;
  const { type } = meta;
  if (config.canUseTextEditor.includes(type)) {
    setAssetActiveHandler.setTextEditActive(asset);
  }
  if (config.replaceable.includes(type)) {
    setAssetActiveHandler.setEditActive(asset);
    setReplaceStatus(true);
  }
}
export function setEditCamera(camera: CameraState) {
  if (!camera) {
    return;
  }
  setAssetActiveHandler.setEditCamera(camera);
}
export function saveCamera() {
  reportChange('saveCamera', true);
}
export function useFontWeightByObserver() {
  return useUpdateAttributeFactoryByObserver<Attribute['fontWeight']>(
    'fontWeight',
  );
}

export function useFontStyleByObserver() {
  return useUpdateAttributeFactoryByObserver<Attribute['fontStyle']>(
    'fontStyle',
  );
}

export function useFontFamilyByObserver() {
  const [value] =
    useUpdateAttributeFactoryByObserver<Attribute['fontFamily']>('fontFamily');

  async function updateFontFamily(fontFamily: string) {
    const asset = assetHandler.currentAsset;
    const result = await getFontFamily(fontFamily);
    if (result) {
      asset?.update(buildAttribute({ fontFamily }));
      reportChange('updateFontFamily', true);
    }
  }

  return [value, updateFontFamily];
}

// 设置用户上传的字体
export function useUserFontFamilyByObserver() {
  const asset = assetHandler.currentAsset;
  const value = {
    fontFamily: asset?.attribute.fontFamily,
    resId: asset?.attribute.resId,
    ufsId: asset?.attribute.ufsId,
  };

  async function updateFontFamily(params: {
    fontFamily: string;
    resId?: string;
    ufsId?: string;
  }) {
    const result = await getFontFamily(params.fontFamily);
    if (result) {
      asset?.update(buildAttribute(params));
      reportChange('updateUserFontFamily', true);
    }
    return result;
  }

  return { value, update: updateFontFamily };
}

export function useFontSizeByObserver() {
  return useUpdateAttributeFactoryByObserver<Attribute['fontSize']>('fontSize');
}

export function useTextAlignByObserver() {
  return useUpdateAttributeFactoryByObserver<Attribute['textAlign']>(
    'textAlign',
  );
}

export function useLineHeightByObserver() {
  return useUpdateAttributeFactoryByObserver<Attribute['lineHeight']>(
    'lineHeight',
  );
}

export function useLetterSpacingByObserver() {
  return useUpdateAttributeFactoryByObserver<Attribute['letterSpacing']>(
    'letterSpacing',
  );
}

export function useOpacityByObserver() {
  return useUpdateTransformFactoryByObserver<Transform['alpha']>('alpha', 100);
}

export function useTextDecorationByObserver() {
  return useUpdateAttributeFactoryByObserver<Attribute['textDecoration']>(
    'textDecoration',
  );
}

export function useTextByObserver() {
  return useUpdateAttributeFactoryByObserver<Attribute['text']>('text');
}

export function useWritingModeByObserver() {
  const value =
    assetHandler.currentAsset?.attribute?.writingMode || 'horizontal-tb';

  function updateWritingMode(writingMode: 'horizontal-tb' | 'vertical-rl') {
    if (assetHandler.currentAsset) {
      const { attribute } = assetHandler.currentAsset;
      const realWritingMode = attribute.writingMode ?? 'horizontal-tb';
      if (realWritingMode !== writingMode) {
        const { height, width } = attribute;
        assetHandler.currentAsset.update(
          buildAttribute({
            width: height,
            height: width,
            writingMode,
          }),
        );
      }
      reportChange('writingMode', true);
    }
  }

  return [value, updateWritingMode];
}

export function useFontColorByObserver() {
  return useUpdateAttributeFactoryByObserver<Attribute['color']>('color');
}

/**
 * @description 水平翻转
 */
export function useHorizontalFlipByObserver() {
  return useUpdateTransformFactoryByObserver<Transform['horizontalFlip']>(
    'horizontalFlip',
  );
}

/**
 * @description 垂直翻转
 */
export function useVerticalFlipByObserver() {
  return useUpdateTransformFactoryByObserver<Transform['verticalFlip']>(
    'verticalFlip',
  );
}

/**
 * @description 旋转
 */
export function useRotateByObserver() {
  return useUpdateTransformFactoryByObserver<Transform['rotate']>('rotate', 0);
}

/**
 * @description 更新SVG颜色信息
 */
export function useSvgColorsByObserver() {
  return useUpdateAttributeFactoryByObserver<Attribute['colors']>('colors');
}

/**
 * @description 更新SVG颜色信息
 */
export const useSvgPathFill = () => {
  const asset = assetHandler.currentAsset;
  const values = asset?.attribute.svgInfo?.fill || {};

  const updateValues = (fill: RGBA | GradientType) => {
    if (!asset) return;
    assetUpdater(
      asset,
      buildAttribute({
        svgInfo: {
          ...asset.attribute.svgInfo,
          fill,
        },
      }),
    );
    reportChange('svgInfoFill', true);
  };

  return {
    fill: values,
    updateFill: updateValues,
  };
};

/**
 * @description 元素尺寸修改
 */
export function useAssetSizeByObserver() {
  const state = {
    width: assetHandler.currentAsset?.attribute.width ?? 0,
    height: assetHandler.currentAsset?.attribute.height ?? 0,
  };

  function update(size: AssetBaseSize) {
    if (assetHandler.currentAsset) {
      assetHandler.currentAsset.update(
        buildAttribute({
          ...size,
        }),
      );
      reportChange('useAssetSize');
    }
  }

  return [state, update];
}

/**
 * @description 元素位置修改
 */
export function useAssetPositionByObserver() {
  const state = {
    left: assetHandler.currentAsset?.transform.posX ?? 0,
    top: assetHandler.currentAsset?.transform.posY ?? 0,
  };

  function update(position: Position) {
    if (assetHandler.currentAsset) {
      assetHandler.currentAsset.update(
        buildTransform({
          posX: position.left,
          posY: position.top,
        }),
      );
      reportChange('useAssetPosition');
    }
  }

  return [state, update];
}

export function useFontEffectByObserver() {
  const asset = assetHandler.currentAsset;
  const state = {
    effect: asset?.attribute.effect,
    effectVariant: asset?.attribute.effectVariant,
    effectColorful: asset?.attribute.effectColorful,
  };

  /**
   * @description 用于更新特效字颜色，由于非纯函数，所以需要注意数据引用问题
   * @param index
   * @param color
   * @param layers
   * @param variableColorPara
   */
  function layerColorUpdater(
    index: number,
    color: RGBA,
    layers: EffectVariant['layers'],
    variableColorPara: EffectVariant['variableColorPara'],
  ) {
    const target = variableColorPara[index];
    if (target) {
      target.colors.forEach(item => {
        const { index, key } = item;
        // @ts-ignore
        if (layers?.[index]?.[key]) {
          // @ts-ignore
          layers[index][key] = color;
        }
      });
      if (target.colorBlock) {
        target.colorBlock = color;
      }
      reportChange('layerColorUpdater', true);
    }
  }

  /**
   * @description 替换特效字颜色
   * @param index
   * @param color
   */
  function updateLayerColor(index: number, color: RGBA) {
    if (asset) {
      const { effectVariant } = asset.attribute;

      if (effectVariant) {
        const layers = deepCloneJson(effectVariant?.layers);
        const variableColorPara = deepCloneJson(
          effectVariant?.variableColorPara,
        );
        layerColorUpdater(index, color, layers, variableColorPara);
        asset.update(
          buildAttribute({
            effectVariant: {
              ...effectVariant,
              variableColorPara,
              layers,
            },
          }),
        );
        reportChange('updateLayerColor', true);
      }
    }
  }

  /**
   * @description 替换特效字
   * @param effect 字体特效id
   */
  async function updateFontEffect(effect: string) {
    if (asset) {
      const tempAsset = asset;

      const id = getFontEffectId(effect);
      const effectVariant = await getFontEffect(id);

      if (effectVariant) {
        const attribute: Partial<Attribute> = {
          effect,
          effectColorful: undefined,
          effectVariant: {
            ...effectVariant,
            variableColorPara:
              FontEffect.filterFontEffectColor(effectVariant) ?? [],
          },
        };

        // if (effectVariant.rt_defaultFontColor) {
        //   attribute.color = effectVariant.rt_defaultFontColor;
        // } else {
        //   attribute.color = {
        //     r: 0,
        //     g: 0,
        //     b: 0,
        //     a: 1,
        //   };
        // }
        // 如果没有字体，并且存在特效字默认字体的话，及修改
        if (
          !tempAsset.attribute.fontFamily &&
          effectVariant.rt_defaultFontFamily
        ) {
          attribute.fontFamily = effectVariant.rt_defaultFontFamily;
          await getFontFamily(effectVariant.rt_defaultFontFamily);
        }
        tempAsset.update(buildAttribute(attribute));
      }
      reportChange('updateFontEffect', true);
    }
  }

  /**
   * @description 替换花字某一项的数据  填充 描边  阴影 图片资源
   *         fillColors: ['rgba(255,255,255,1.0)'],
   strokeColors: ['rgba(255,255,255,1.0)', 'rgba(0,0,0,1.0)'],
   * @param index
   * @param color
   * @param type : fill:填充 stroke:描边 shadow:阴影 source:图片资源
   */
  async function updateFontEffectColor(index: number, item: any, type: string) {
    if (asset) {
      const { effectColorful } = asset.attribute;
      // @ts-ignore
      const { resId, effect } = effectColorful;
      if (effect) {
        // 阴影
        const shadowList = deepCloneJson(effect?.shadowList);
        // 图片资源
        const sourceList = deepCloneJson(effect?.sourceList);
        // 填充
        const fillList = deepCloneJson(effect?.fillList);
        // 描边
        const strokeList = deepCloneJson(effect?.strokeList);
        switch (type) {
          case 'fill': {
            fillList[index] = item;
            break;
          }
          case 'stroke': {
            strokeList[index] = item;
            break;
          }
          case 'shadow': {
            shadowList[index] = item;
            break;
          }
          case 'source': {
            sourceList[index] = item;
            break;
          }
        }
        if (type === 'source') {
          const imgCache = new CacheImage('effectImage');
          const cacheDom = await imgCache.getImageDom(item);
          asset.update(
            buildAttribute({
              effectColorful: {
                resId,
                effect: {
                  ...effect,
                  sourceList,
                },
              },
            }),
          );
        } else {
          asset.update(
            buildAttribute({
              effectColorful: {
                resId,
                effect: {
                  ...effect,
                  shadowList,
                  sourceList,
                  fillList,
                  strokeList,
                },
              },
            }),
          );
        }
        reportChange('updateFontEffectColor', true);
      }
    }
  }

  /**
   * @description 批量更新替换花字的纯色数据  针对所有关联的填充 描边 阴影
   * 更新统一颜色的其他属性
   * 仅仅针对纯色的情况
   * @param oldcolor:修改之前的颜色
   * @param newColor :修改之后的颜色
   */
  function updateBatchFontEffectSolidColor(index: number, newColor: string) {
    if (asset) {
      const { effectColorful } = asset.attribute;
      // @ts-ignore
      const { resId, effect } = effectColorful;
      if (effect) {
        // 阴影
        const shadowList = deepCloneJson(effect?.shadowList);
        // 填充
        const fillList = deepCloneJson(effect?.fillList);
        // 描边
        const strokeList = deepCloneJson(effect?.strokeList);
        // 纯色 关联颜色数组
        const colorList = deepCloneJson(effect?.colorList);

        const oldcolor = colorList[index];
        const { fillIndexList, strokeIndexList, shadowIndexList } = oldcolor;
        fillIndexList.forEach((fillItem: number) => {
          fillList[fillItem] = {
            ...fillList[fillItem],
            value: newColor,
          };
        });
        strokeIndexList.forEach((fillItem: number) => {
          strokeList[fillItem] = {
            ...strokeList[fillItem],
            value: newColor,
          };
        });
        shadowIndexList.forEach((fillItem: number) => {
          shadowList[fillItem] = {
            ...shadowList[fillItem],
            color: newColor,
          };
        });
        colorList[index].value = newColor;
        asset.update(
          buildAttribute({
            effectColorful: {
              resId,
              effect: {
                ...effect,
                shadowList,
                fillList,
                strokeList,
                colorList,
              },
            },
          }),
        );
        reportChange('updateBatchFontEffectSolidColor', true);
      }
    }
  }

  /**
   * @description 批量修改特效字颜色
   * @param layerColor
   */
  function batchUpdateLayerColor(layerColor: RGBA[]) {
    if (asset) {
      const { effectVariant } = asset.attribute;
      if (effectVariant) {
        const layers = deepCloneJson(effectVariant?.layers);
        const variableColorPara = deepCloneJson(
          effectVariant?.variableColorPara,
        );

        layerColor.forEach((color, index) => {
          layerColorUpdater(index, color, layers, variableColorPara);
        });
        asset.update(
          buildAttribute({
            effectVariant: {
              ...effectVariant,
              variableColorPara,
              layers,
            },
          }),
        );
        reportChange('batchUpdateLayerColor', true);
      }
    }
  }

  /**
   * @description 替换特效字背景图片
   * @param effectColorMatch
   */
  function updateColorMatch(effectColorMatch: number) {
    if (asset) {
      const { effectVariant, effect } = asset.attribute;
      if (effectVariant && effect) {
        const newEffect = `${effect.split('@')[0]}@${effectColorMatch}`;
        const layers = deepCloneJson(
          effectVariant?.layers,
        ) as EffectVariant['layers'];
        effectVariant.rt_variantList[effectColorMatch].layers.forEach(
          (item: { [x: string]: any }, index: string | number) => {
            // eslint-disable-next-line guard-for-in
            for (const subItem in item) {
              // @ts-ignore
              layers[index][subItem] = deepCloneJson(item[subItem]);
            }
          },
        );
        const newEffectVariant = {
          ...effectVariant,
          layers,
        };
        const variableColorPara = filterFontEffectColor(newEffectVariant);
        if (variableColorPara) {
          newEffectVariant.variableColorPara = variableColorPara;
        }
        asset.update(
          buildAttribute({
            effect: newEffect,
            effectVariant: newEffectVariant,
          }),
        );
        reportChange('updateColorMatch', true);
      }
    }
  }

  function updateEffectColorful(effectColorful?: SignatureEffectWord) {
    asset?.update(
      buildAttribute({
        effect: undefined,
        effectVariant: undefined,
        effectColorful,
      }),
    );
    reportChange('updateEffectColorful', true);
  }

  /**
   * @description 清除特效字
   */
  function clearFontEffect() {
    if (asset) {
      updateEffectColorful(undefined);
      reportChange('clearFontEffect', true);
    }
  }

  /**
   *@description 替换花字
   */
  async function updateSignatureFontEffect(
    effectColorful: SignatureEffectWord,
  ) {
    if (asset) {
      if (!effectColorful.effect) {
        const effect = await getFontEffectColorful(effectColorful.resId);
        effectColorful.effect = effect;
      }
      const { effect } = effectColorful;
      const deepCloneEffect = formatEffectColorData(effect);
      updateEffectColorful({ ...effectColorful, effect: deepCloneEffect });
      // 加载缓存图片
      if (deepCloneEffect?.sourceList) {
        effect?.sourceList.forEach(async item => {
          await new CacheImage('effectColorfulImage').getImageDom(item);
        });
      }
      reportChange('updateSignatureFontEffect', true);
    }
  }

  return {
    updateColorMatch,
    clearFontEffect,
    updateFontEffect,
    updateLayerColor,
    batchUpdateLayerColor,
    updateSignatureFontEffect,
    updateFontEffectColor,
    updateBatchFontEffectSolidColor,
    value: state,
  };
}

/**
 * @description 设置元素持续时间
 */
export function useAssetDurationByObserver() {
  const { startTime = -1, endTime = -1 } =
    assetHandler.active?.assetDuration ?? {};
  const state = {
    startTime,
    endTime,
  };

  function update(duration: AssetDurationParams) {
    // assetHandler.active?.update(
    //   buildAttribute({
    //     rt_relativeTime: getAssetTimeRelativeInTemplate(
    //       duration,
    //       assetHandler.currentTemplateVideoInfo.endTime,
    //     ),
    //   }),
    // );
    assetHandler.active?.updateAssetDuration(duration);
    // 更新蒙版子元素信息
    // todo 迁移到assetClass中处理
    // if (
    //   isMaskType(assetHandler.currentAsset) &&
    //   assetHandler.currentAsset?.assets &&
    //   assetHandler.currentAsset.assets.length > 0
    // ) {
    //   assetUpdater(
    //     assetHandler.currentAsset?.assets[0],
    //     buildAttribute({
    //       startTime: duration.startTime,
    //       endTime: duration.endTime,
    //       rt_assetTime: duration,
    //     }),
    //   );
    // }

    reportChange('updateAssetDuration', true);
  }

  return {
    update,
    value: state,
  };
}

/**
 * @description 操作元素动画
 */
export function useAssetAeAByObserver() {
  // module:只展示组动画的信息，子元素动画不展示
  const aeA = assetHandler.active?.attribute?.aeA;
  const kw = assetHandler.active?.attribute?.kw;
  const objectKw = typeof kw === 'string' ? JSON.parse(kw) : kw;

  const {
    assetDuration = { startTime: 0, endTime: 0 },
    attribute = { startTime: 0, endTime: 0 },
  } = assetHandler.active || {};

  const max = {
    i:
      Math.round((attribute.endTime - assetDuration.startTime - 100) / 100) *
      100,
    o:
      Math.round((assetDuration.endTime - attribute.startTime - 100) / 100) *
      100,
  };

  const { run: update } = useDebounceFn(
    async (aeAKey: keyof AeA, resId: string) => {
      const { active } = assetHandler;
      if (active) {
        const aeAData = getAssetAea(active.attribute);
        const { pbr } = aeAData[aeAKey];
        const newAeA = {
          pbr,
          resId,
          kw: undefined,
        };
        const data = await getAea(resId);
        if (data) {
          newAeA.kw = data.kw;
        }
        active.updateAeaItem([{ key: aeAKey, data: newAeA }]);
        reportChange('updateAeA', true);
      }
    },
    {
      wait: 300,
    },
  );

  function updatePbr(aeaKey: keyof AeA, pbr: number) {
    const aeAItem = aeA?.[aeaKey];
    if (aeAItem?.kw) {
      assetHandler.active?.updateAeaItem([
        {
          key: aeaKey,
          data: {
            ...aeAItem,
            pbr,
          },
        },
      ]);

      reportChange('updateAeADuration', true);
    }
  }

  function directPreview(key: keyof AeA, aeaItem: AeAItem) {
    const { active } = assetHandler;
    // aeaItem.kw.textDelay = 50;
    // aeaItem.kw.ofh = true;
    // aeaItem.pbr = 1;
    active?.update(
      buildAttribute({
        rt_previewAeA: {
          ...getAssetAea(),
          [key]: aeaItem,
        },
      }),
    );
  }

  function previewEnd() {
    assetHandler.active?.update(
      buildAttribute({
        rt_previewAeA: undefined,
      }),
    );
  }

  function clear(aeAKey: keyof AeA) {
    const { active } = assetHandler;
    if (active) {
      active.updateAeaItem([{ key: aeAKey, data: { pbr: 1 } }]);
      reportChange('clearAeA', true);
    }
  }

  const { run: preview } = useDebounceFn(
    async (aeAKey: keyof AeA, resId: string, pbr = 1) => {
      previewEnd();
      const { active } = assetHandler;
      if (active?.attribute?.stayEffect?.graph) {
        return;
      }
      const newAeA = {
        pbr,
        resId,
        kw: undefined,
      };
      // 预览时需要确认是否处于文字编辑模式，如果处于文字编辑模式则预览动画无法展示
      if (assetHandler.textEditActive) {
        assetHandler.setTextEditActive(undefined);
      }
      const data = await getAea(resId);
      if (data) {
        newAeA.kw = data.kw;
        // if (newAeA.kw.textDelay) {
        //   newAeA.kw.textDelay = 50;
        // }
      }
      active?.update(
        buildAttribute({
          rt_previewAeA: {
            ...getAssetAea(),
            [aeAKey]: newAeA,
          },
        }),
      );
    },
    {
      wait: 300,
    },
  );
  return {
    kw: {
      ...objectKw,
      pbr: aeA?.s.pbr,
    },
    value: aeA,
    assetAeaDuration: assetHandler.active?.animationItemDuration,
    update,
    inPreview: assetHandler.active?.attribute.rt_previewAeA,
    preview,
    directPreview,
    previewEnd,
    updatePbr,
    clear,
    max,
  };
}
export function useAssetKwByOberver() {
  const { active } = assetHandler;
  const { run: update } = useDebounceFn(
    async (resId: string) => {
      const { active } = assetHandler;
      if (active) {
        const data = await getAea(resId);
        const aea = config.getDefaultPlaybackRate();
        // 清空aeA动画  目前不兼容
        active.updateAeaItem([
          { key: 'i', data: aea.i },
          { key: 'o', data: aea.o },
        ]);
        active.update(
          buildAttribute({
            kw: {
              ...data.kw,
              resId,
            },
            // 清空ae 以及停留特效
            aeA: config.getDefaultPlaybackRate(),
            stayEffect: undefined,
          }),
        );
        reportChange('updateAeA', true);
      }
    },
    {
      wait: 300,
    },
  );
  const clear = () => {
    if (active) {
      active.update(
        buildAttribute({
          kw: undefined,
          aeA: config.getDefaultPlaybackRate(),
        }),
      );
    }
  };
  return { update, clear };
}

export function updateAssetDuration(
  asset: AssetClass,
  duration: AssetDurationParams,
) {
  if (asset.template) {
    asset.updateAssetDuration(duration, asset.template.videoInfo.offsetTime);
    reportChange('updateAssetDuration', true);
  }
}

/**
 * @description 设置元素持续时间（自动计算视频裁剪参数）
 * @param change[0]
 * @param change[1]
 */
export function setAssetDuration(asset: AssetClass, change: [number, number]) {
  asset.setAssetDuration(change);
  reportChange('setAssetDuration', true);
}

/**
 * @description 设置元素持续时间包含裁剪
 */
export function useAssetDurationByOffsetTime(template: TemplateData) {
  const { speed = 1 } = template.videoInfo;
  const {
    assetDurationWithOffset = { startTime: -1, endTime: -1 },
    minAssetDuration = 0,
  } = assetHandler.active || {};
  const { startTime, endTime } = assetDurationWithOffset;

  function update(duration: AssetDurationParams) {
    const { active } = assetHandler;
    if (!active) {
      return;
    }

    duration.startTime *= speed;
    duration.endTime *= speed;
    active.updateAssetDuration(duration, template.videoInfo.offsetTime);
    reportChange('updateAssetDuration', true);
  }

  return {
    update,
    min: minAssetDuration,
    value: {
      startTime: startTime * (1 / speed),
      endTime: endTime * (1 / speed),
    },
  };
}

export function useAssetAeADurationByObserver() {
  const { attribute, assetDuration, animationItemPbr } =
    assetHandler.currentAsset ?? {};
  const { startTime = 0, endTime = 0 } = assetDuration ?? {};
  const value = {
    i: animationItemPbr?.i || 0,
    o: animationItemPbr?.o || 0,
  };
  // 存在两个动画
  // @ts-ignore
  const hasBoth = Object.keys(value).every(key => value[key] > 0);

  let max = parseInt(String((endTime - startTime - 100) / 100), 10) * 100;
  max = Math.min(max, hasBoth ? 4000 : 2000);
  max = Math.max(max, 300);

  function update(aeaKey: keyof AeA, duration: number) {
    const aeAItem = attribute?.aeA?.[aeaKey];
    if (aeAItem?.kw && attribute && animationItemPbr && assetDuration) {
      assetHandler.currentAsset?.updateAeaItem([
        {
          key: aeaKey,
          data: {
            ...aeAItem,
            pbr: calcAeATimeToPbr(calcAaADuration(duration), aeAItem.kw),
          },
        },
      ]);

      reportChange('updateAeADuration', true);
    }
  }

  function updateBoth({ i, o }: { i: number; o: number }) {
    const aeAI = attribute?.aeA?.i;
    const aeAO = attribute?.aeA?.o;
    if (aeAI?.kw && aeAO?.kw && attribute && assetDuration) {
      const resultI = calcAaADuration(i);
      const resultO = calcAaADuration(o);

      assetHandler.currentAsset?.updateAeaItem([
        {
          key: 'i',
          data: {
            ...aeAI,
            pbr: calcAeATimeToPbr(resultI, aeAI.kw),
          },
        },
        {
          key: 'o',
          data: {
            ...aeAO,
            pbr: calcAeATimeToPbr(resultO, aeAO.kw),
          },
        },
      ]);
      reportChange('updateAeADuration', true);
    }
  }

  return {
    value,
    update,
    updateBoth,
    max,
    hasBoth,
  };
}

/**
 * @description 替换裁剪元素
 * @param svgSource
 */
export async function replaceClipSvg(svgSource: ReplaceClipSvgParams) {
  const { currentAsset } = assetHandler;
  if (currentAsset) {
    if (currentAsset.attribute?.container?.id !== svgSource.id) {
      const container = Image.replaceSvgSize(currentAsset, svgSource);
      const svgString = await getSvg(svgSource.source_key);
      const newContainer = {
        ...container,
        ...svgSource,
        rt_svgString: svgString,
      };
      currentAsset.updateContainer(newContainer);
      reportChange('replaceClip', true);
    }
  }
}

/**
 * @description 删除裁剪数据
 */
export function removeClip() {
  if (assetHandler.currentAsset) {
    assetHandler.currentAsset.update(buildAttribute({ container: undefined }));
    reportChange('removeClip', true);
  }
}

export function useImageClipByObserver() {
  const { attribute } = assetHandler.currentAsset ?? {};
  const { inClipping } = assetHandler.status;
  const clipId = attribute?.container?.id ?? '';

  /**
   * @description 开始裁剪
   */
  function startClip() {
    if (assetHandler.currentAsset) {
      assetHandler.setStatus({
        inClipping: true,
      });
      reportChange('startClip', true);
    }
  }

  function endClip() {
    assetHandler.setStatus({
      inClipping: false,
    });
    reportChange('endClip', true);
  }

  return {
    inClipping,
    clipId,
    replaceClip: replaceClipSvg,
    removeClip,
    startClip,
    endClip,
  };
}

function getZIndexRange(assets: AssetClass[]) {
  return {
    // eslint-disable-next-line prefer-spread
    maxZIndex: Math.max.apply(
      Math,
      assets.map(item => item.transform.zindex),
    ),
    // eslint-disable-next-line prefer-spread
    minZIndex: Math.min.apply(
      Math,
      assets.map(item =>
        item.meta.isBackground
          ? item.transform.zindex + 1
          : item.transform.zindex,
      ),
    ),
  };
}

declare const DirectionTypes: ['up', 'down', 'top', 'bottom'];
declare type MoveDirection = typeof DirectionTypes[number];

export function updateAssetZIndex({
  direction,
  zindex,
  asset,
}: {
  direction: MoveDirection;
  zindex?: number; // 目标层级
  asset?: AssetClass;
}) {
  const { currentTemplate, currentAsset } = assetHandler;

  const targetAsset = asset ?? currentAsset;

  let assetList = currentTemplate?.assets;

  if (targetAsset) {
    const { parent } = targetAsset;
    if (parent && currentTemplate?.assets.length) {
      assetList = parent.assets;
    }

    if (assetList?.length) {
      const { maxZIndex, minZIndex } = getZIndexRange(assetList);

      const { zindex: currentAssetZIndex = 0 } = targetAsset.transform;
      let targetIndex = 0; // 目标层级
      let variable = 0;

      if (direction === 'up') {
        targetIndex = zindex || currentAssetZIndex + 1;
        variable = -1;
      } else if (direction === 'down') {
        targetIndex = zindex || currentAssetZIndex - 1;
        variable = 1;
      } else if (direction === 'top') {
        targetIndex = maxZIndex;
        variable = -1;
      } else if (direction === 'bottom') {
        targetIndex = minZIndex;
        variable = 1;
      }

      // console.log({ targetIndex, maxZIndex, minZIndex });

      // 超出最大或最小层级不予处理
      if (targetIndex > maxZIndex || targetIndex < minZIndex) return;

      [...assetList].forEach(item => {
        const tempZIndex = item.transform.zindex;
        if (
          (['up', 'top'].includes(direction) &&
            tempZIndex > targetAsset?.transform.zindex &&
            tempZIndex <= targetIndex) ||
          (['down', 'bottom'].includes(direction) &&
            tempZIndex < targetAsset?.transform.zindex &&
            tempZIndex >= targetIndex)
        ) {
          item.update({ transform: { zindex: tempZIndex + variable } });
        }
      });

      // console.log('内核更新的图层index=======', targetIndex);
      targetAsset.update({ transform: { zindex: targetIndex } });

      reportChange('updateAssetZIndex', true);
    }
  }
}

// 调整元素层级
export function useAssetZIndexByObserver() {
  const { active } = assetHandler;
  let { maxZIndex: maxAssetZIndex = 0, minZIndex: minAssetZIndex = 0 } =
    assetHandler.currentTemplate || {};

  const zIndex = assetHandler.currentAsset?.transform.zindex ?? -1;

  if (active?.meta.type === 'module' && active.assets) {
    const { maxZIndex, minZIndex } = getZIndexRange(active.assets);
    maxAssetZIndex = maxZIndex;
    minAssetZIndex = minZIndex;
  }

  function moveTop() {
    updateAssetZIndex({ direction: 'up', zindex: maxAssetZIndex });
  }

  function moveBottom() {
    updateAssetZIndex({ direction: 'bottom' });
  }

  function moveUp() {
    updateAssetZIndex({ direction: 'up', zindex: zIndex + 1 });
  }

  function moveDown() {
    updateAssetZIndex({ direction: 'down', zindex: zIndex - 1 });
  }

  return {
    zIndex,
    maxZIndex: maxAssetZIndex,
    minZIndex: minAssetZIndex,
    moveTop,
    moveBottom,
    moveUp,
    moveDown,
  };
}

// 设置用户上传视频静音
export function useVideoEVoicedByObserver() {
  return useUpdateAttributeFactoryByObserver<Attribute['voiced']>('voiced');
}

// 设置用户上传视频音量
export function useVideoEVolumeByObserver() {
  return useUpdateAttributeFactoryByObserver<Attribute['volume']>('volume');
}

// 设置字体色块信息
export function useTextBackgroundByObserver() {
  const { currentAsset } = assetHandler;
  const { textBackground } = currentAsset?.attribute ?? {};

  // 开启/关闭色块背景
  function changeOpenStatus(sign: boolean) {
    currentAsset?.update(
      buildAttribute({
        // @ts-ignore
        textBackground: {
          ...textBackground,
          enabled: sign,
        },
      }),
    );
    reportChange('textBackgroundStatusChange', true);
  }

  // 开启色块背景
  function open() {
    if (!textBackground) {
      currentAsset?.update(
        buildAttribute({
          lineHeight: 13,
          textBackground: {
            enabled: true,
            opacity: 50,
            color: {
              r: 0,
              g: 0,
              b: 0,
              a: 1,
            },
            borderRadius: 0,
          },
        }),
      );
      reportChange('textBackgroundStatusChange', true);
    } else {
      changeOpenStatus(true);
    }
  }

  // 关闭色块背景
  function close() {
    changeOpenStatus(false);
  }

  function changeOpacity(opacity: number) {
    currentAsset?.update(
      buildAttribute({
        // @ts-ignore
        textBackground: {
          ...textBackground,
          opacity,
        },
      }),
    );
    reportChange('textBackgroundOpacityChange', true);
  }

  // 改变色块颜色
  function changeColor(color: RGBA) {
    currentAsset?.update(
      buildAttribute({
        // @ts-ignore
        textBackground: {
          ...textBackground,
          color,
        },
      }),
    );
    reportChange('textBackgroundColorChange', true);
  }

  // 改变色块圆角
  function changeBorderRadius(borderRadius: number) {
    currentAsset?.update(
      buildAttribute({
        // @ts-ignore
        textBackground: {
          ...textBackground,
          borderRadius,
        },
      }),
    );
    reportChange('textBackgroundBorderRadiusChange', true);
  }

  return {
    textBackground,
    open,
    close,
    changeColor,
    changeOpacity,
    changeBorderRadius,
  };
}

// 设置svg描边信息
export function useSVGStrokesByObserver() {
  const { currentAsset } = assetHandler;
  const { svgStrokes, svgInfo } = currentAsset?.attribute ?? {};
  const isSvgPath = currentAsset?.meta.type === 'svgPath';
  let svgStroke: SVGStroke | undefined | SvgInfo = svgStrokes && svgStrokes[0];

  if (isSvgPath) {
    svgStroke = svgInfo;
  }

  const updateStroke = (params: Partial<SVGStroke>) => {
    let data;
    // 自由绘制的svg
    if (isSvgPath) {
      data = buildAttribute({
        svgInfo: {
          ...(svgStroke as SvgInfo),
          ...(params as Partial<SvgInfo>),
        },
      });
    } else {
      data = buildAttribute({
        svgStrokes: [
          {
            ...(svgStroke as SVGStroke),
            ...(params as Partial<SVGStroke>),
          },
        ],
      });
    }
    currentAsset?.update(data);
    reportChange('svgStrokesChange', true);
  };

  // 改变颜色
  function changeColor(color: RGBA) {
    if (svgStroke) {
      updateStroke({
        stroke: color,
      });
    }
  }

  // 改变样式  strokeDashType,strokeDash
  function changeDashStyle(dash: number) {
    if (svgStroke) {
      const strokeDash = calcSvgDashByType(dash, svgStroke.strokeWidth);
      updateStroke({
        strokeDashType: dash,
        strokeDash,
        strokeLinecap: [1, 2].includes(dash) ? 'round' : '',
      });
    }
  }

  // 改变样式
  function changeStrokeWidth(width: number) {
    if (svgStroke) {
      const strokeDash =
        svgStroke.strokeDashType !== -1
          ? calcSvgDashByType(svgStroke.strokeDashType, width)
          : svgStroke.strokeDash;

      updateStroke({
        strokeWidth: width,
        strokeDash,
      });
    }
  }

  // 改变圆角
  const changeRadius = (radius: number) => {
    if (svgStroke) {
      currentAsset?.update({
        attribute: {
          svgInfo: {
            ...(svgStroke as SvgInfo),
            radius,
          },
        },
      });
    }
  };

  return {
    svgStroke,
    changeColor,
    changeDashStyle,
    changeStrokeWidth,
    changeRadius,
  };
}

/**
 * @description 修改元素位置
 * @param onChange
 */
export function updateCurrentAssetPositionWhenKeyPress(
  onChange: (
    position: TransformPosition,
  ) => Partial<TransformPosition> | undefined,
) {
  const { active } = assetHandler;
  if (active) {
    if (assetHandler.moduleItemActive) {
      assetHandler.setModuleItemActive(undefined);
    }
    const { transform } = active;
    const position = onChange(transform);
    if (position) {
      active.update(buildTransform(position));
    }
    reportChange('updateCurrentAssetPositionWhenKeyPress', true);
  }
}

/**
 * @description 裁剪视频数据
 * @param startTime 毫秒
 * @param endTime 毫秒
 * @param isLoop 是否循环
 */
export function setVideoClipTime(
  { startTime, endTime }: { startTime: number; endTime: number },
  isLoop?: boolean,
) {
  const currentAsset = assetHandler.active;

  if (currentAsset && isMaskType(currentAsset) && currentAsset.assets?.length) {
    currentAsset.assets[0].update(
      buildAttribute({
        cst: startTime,
        cet: endTime,
        isLoop,
      }),
    );
  } else {
    currentAsset?.update(
      buildAttribute({
        cst: startTime,
        cet: endTime,
        isLoop,
      }),
    );
  }

  reportChange('setVideoClipTime', true);
}

/**
 * @description 替换裁剪形状
 * @param svgInfo
 */
export function replaceClip(svgInfo: ReplaceClipSvgParams) {
  if (svgInfo && assetHandler.currentAsset) {
    replaceClipSvg(svgInfo);
    reportChange('replaceClip', true);
  }
}

/**
 * 将元素添加至蒙版
 * @param childAsset
 */
export function setMaskAssetChildren(maskAsset: AssetClass, childAsset: Asset) {
  const currentAsset = maskAsset ?? assetHandler.currentAsset;
  if (currentAsset) {
    if (childAsset.attribute.startTime && childAsset.attribute.endTime) {
      // 如果添加的蒙版子元素没有时间 就把蒙版的时间同步给子元素
      currentAsset.update({
        ...buildAttribute({
          startTime: childAsset.attribute.startTime,
          endTime: childAsset.attribute.endTime,
        }),
        ...buildMeta({
          isClip: false,
        }),
      });
    } else {
      childAsset.attribute.startTime = currentAsset.attribute.startTime;
      childAsset.attribute.endTime = currentAsset.attribute.endTime;
    }
    currentAsset.setTempData({
      rt_hover: undefined,
      rt_asset: undefined,
    });
    currentAsset.buildAssets([childAsset], true);
    reportChange('setMaskAssetChildren', true);
  }
}

/**
 * @description 设置片段背景
 */
export function useSetTemplateBackgroundAsset() {
  const { assets = [] } = assetHandler;

  const backgroundAsset = assets.find(item => item.meta.isBackground);

  // 替换背景
  function replace(attribute: Partial<Attribute>) {
    if (backgroundAsset) {
      backgroundAsset.update({ attribute });
    }
  }

  /**
   * 水平翻转
   * */
  function setHorizontalFlip(horizontalFlip: boolean) {
    if (backgroundAsset) {
      assetUpdater(backgroundAsset, { transform: { horizontalFlip } });
      reportChange('setBackgroundHorizontalFlip', true);
    }
  }

  /**
   * 垂直垂直翻转
   * */
  function setVerticalFlip(verticalFlip: boolean) {
    if (backgroundAsset) {
      assetUpdater(backgroundAsset, { transform: { verticalFlip } });
      reportChange('setBackgroundVerticalFlip', true);
    }
  }

  /**
   * 设置背景大小
   * */
  function setSize(size: { width: number; height: number }) {
    if (backgroundAsset) {
      const newPosition = getNewAssetPosition(size);

      assetUpdater(backgroundAsset, {
        attribute: size,
        transform: newPosition,
      });
      reportChange('setBackgroundSize', true);
    }
  }

  /**
   * 设置背景位置
   * */
  function setPosition(position: { posX: number; posY: number }) {
    assetUpdater(backgroundAsset, { transform: position });
    reportChange('setBackgroundPosition', true);
  }

  /**
   * 设置背景不透明度
   * */
  function setOpacity(alpha: number) {
    assetUpdater(backgroundAsset, { transform: { alpha } });
    reportChange('setBackgroundOpacity', true);
  }

  /**
   * 设置背景视频声音
   * */
  function setVolume(volume: number) {
    assetUpdater(backgroundAsset, {
      attribute: { volume, voiced: volume > 0 },
    });
    reportChange('setBackgroundVolume', true);
  }

  /**
   * 背景视频静音
   * */
  function setVoiced(voiced: boolean) {
    assetUpdater(backgroundAsset, { attribute: { voiced } });
    reportChange('setBackgroundVoiced', true);
  }

  return {
    setVerticalFlip,
    setHorizontalFlip,
    setSize,
    replace,
    value: backgroundAsset,
    setPosition,
    setOpacity,
    setVolume,
    setVoiced,
  };
}

/**
 * 设置违规资源数据
 * @returns
 */
export function setLllegelAssetsHandler(list) {
  assetHandler.setLllegelAssets(list);
}

// 更新滤镜参数
export function updateFilters(opts: {
  params: Partial<Filters>;
  save?: boolean;
  target?: AssetItemState;
  replace?: boolean;
}) {
  const { params, target, save, replace } = opts;
  const { currentAsset } = assetHandler;

  const asset = target || currentAsset;

  if (!asset) return;

  const filters = replace
    ? { ...params }
    : { ...asset.attribute.filters, ...params };

  // asset.update({
  //   filters,
  // });
  asset.update({
    attribute: {
      filters,
    },
  });
  save && reportChange('updateFilters', true);
}

// 更新特效层
export function updateEffect(opts: {
  params: EffectInfo;
  save?: boolean;
  target?: AssetItemState;
  replace?: boolean;
}) {
  const { params, target, save, replace } = opts;
  const { currentAsset } = assetHandler;

  const asset = target || currentAsset;

  if (!asset) return;

  const effectInfo = replace
    ? { ...params }
    : { ...asset.attribute.effectInfo, ...params };

  asset.update({
    attribute: {
      effectInfo,
    },
  });
  save && reportChange('updateEffect', true);
}

export const updateShadow = (opts: {
  params: Partial<Shadow>;
  save?: boolean;
  target?: AssetItemState;
  replace?: boolean;
}) => {
  const { params, target, save, replace } = opts;
  const { currentAsset } = assetHandler;
  const asset = target || currentAsset;
  if (!asset) return;
  const dropShadow = replace
    ? { ...params }
    : { ...asset.attribute.dropShadow, ...params };

  asset.update({
    attribute: { dropShadow },
  });
  save && reportChange('updateShadow', true);
};

/**
 * @description 设置选中元素的loading状态
 * @param asset
 * @param loading
 */
export function setActiveAssetLoading(asset: AssetClass, loading: boolean) {
  if (asset) {
    asset.setTempData?.({
      rt_loading: loading,
    });
  }
}

/**
 *
 * @description 订阅元素loading
 * @param asset
 */
export function useActiveAssetLoading(asset: AssetClass) {
  const value = !!asset?.tempData.rt_loading;

  function update(loading: boolean) {
    if (asset) {
      setActiveAssetLoading(asset, loading);
    }
  }

  return [value, update];
}

/**
 * @description 过滤图片元素
 * @param asset
 */
function filterImageAsset(asset?: AssetClass) {
  if (asset && isMaskType(asset)) {
    return asset.assets?.[0];
  }
  return asset;
}

/**
 * @description 设置抠图的图片地址
 *
 */
export function setMattingPic(
  asset: AssetClass,
  {
    output_url,
    file_id,
    source_id,
  }: {
    output_url: string;
    file_id: string;
    source_id: string;
  },
) {
  const target = filterImageAsset(asset);
  if (target) {
    const { picUrl } = target.attribute;
    target.update({
      attribute: {
        resId: file_id,
        picUrl: output_url,
        mattingInfo: {
          resId: source_id!, // 原始资源ID
          rt_url: picUrl!, // 原始资源URL
        },
      },
    });
    reportChange('setMattingPic', true);
  }
}

/**
 * @description 设置抠图的展示状态
 * @param asset
 */
export function clearMattingPic(asset: AssetClass) {
  const target = filterImageAsset(asset);
  if (target) {
    const { mattingInfo } = target.attribute;
    if (mattingInfo) {
      target.update({
        attribute: {
          resId: mattingInfo.resId,
          mattingInfo: undefined,
          picUrl: mattingInfo.rt_url,
        },
      });
    }
  }
}

/**
 * @description 更新SVG颜色信息
 */
export function useShowMattingPic() {
  const { currentAsset } = assetHandler;
  const target = filterImageAsset(currentAsset);
  const value = !!target?.attribute.mattingInfo;

  return {
    value,
    setMattingPic,
    clearMattingPic,
  };
}

/** *************************停留特效相关*********************************** */
// 停留特效
export function useStayEffectObserver() {
  const { currentAsset } = assetHandler;
  const clear = () => {
    if (currentAsset) {
      assetUpdater(
        currentAsset,
        buildAttribute({
          stayEffect: undefined,
        }),
      );
      currentAsset.setTempData({
        rt_style: undefined,
      });
    }
  };
  const setPreview = () => {
    if (currentAsset) {
      currentAsset.update({
        tempData: {
          rt_previewStayEffect: !currentAsset.tempData.rt_previewStayEffect,
        },
      });
    }
  };
  return {
    clear,
    setPreview,
  };
}
/**
 * 路径动画
 */
export function usePathAnimationObserver() {
  const { currentAsset } = assetHandler;
  // 获取最大设置时长
  const getMaxDuration = () => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      const { startTime, endTime } = attribute;
      const maxDuration = endTime - startTime;
      return maxDuration;
    }
    return 0;
  };
  /**
   * 添加预设的路径动画
   * @param points 点位信息
   * @param type 类型
   */
  const updatePoints = (data: any) => {
    if (currentAsset) {
      const { attribute, transform } = currentAsset;
      const { width, height, opacity = 100, stayEffect } = attribute;
      const { rotate } = transform;
      const maxDuration = stayEffect?.duration ?? getMaxDuration();
      const saveData = {
        width: data.width,
        height: data.height,
        x: data.x,
        y: data.y,
        points: data.points,
        freePathType: data.freePathType,
        key: data.key,
      };
      currentAsset.setTempData({
        rt_style: undefined,
        rt_previewStayEffect: false,
      });

      const aea = config.getDefaultPlaybackRate(); // 清空aeA动画 目前不兼容
      // 清空aeA动画  目前不兼容
      currentAsset.updateAeaItem([
        { key: 'i', data: aea.i },
        { key: 'o', data: aea.o },
      ]);
      // @ts-ignore
      assetUpdater(
        currentAsset,
        buildAttribute({
          stayEffect: {
            attach: undefined,
            duration: maxDuration,
            graph: {
              ...saveData,
              easing: 1,
              loop: false,
              toBounds: [
                {
                  width,
                  height,
                  rotate,
                  opacity,
                },
              ],
            },
          },
        }),
      );
      reportChange('updatePoints', true);
    }
  };
  /**
   * 更新动画时长
   * @param duration
   */
  const updateDuration = (duration: number) => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      const { stayEffect } = attribute;
      const maxDuration = getMaxDuration();
      duration = Math.min(maxDuration, duration);
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            ...stayEffect,
            duration,
          },
        }),
      );
    }
  };
  /**
   * 更新动画是否循环
   * @param loop
   */
  const updateAnimationLoop = (loop: boolean) => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      const { stayEffect } = attribute;
      if (stayEffect) {
        const { graph } = stayEffect;
        currentAsset.update(
          buildAttribute({
            stayEffect: {
              ...stayEffect,
              graph: {
                ...graph,
                loop,
              },
            },
          }),
        );
      }
    }
  };
  /**
   * 更新动画速度
   * @param loop
   */
  const updateAnimationEase = (easing: number) => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      const { stayEffect } = attribute;
      if (stayEffect) {
        const { graph } = stayEffect;
        currentAsset.update(
          buildAttribute({
            stayEffect: {
              ...stayEffect,
              graph: {
                ...graph,
                easing,
              },
            },
          }),
        );
      }
    }
  };
  /**
   * 更新动画是否循环
   * @param loop
   */
  const clearPath = () => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      const { stayEffect } = attribute;
      if (stayEffect) {
        currentAsset.update(
          buildAttribute({
            stayEffect: undefined,
          }),
        );
        currentAsset.setTempData({
          rt_style: undefined,
          rt_previewStayEffect: false,
        });
      }
    }
  };
  return {
    maxDuration: getMaxDuration(),
    updatePoints,
    updateDuration,
    updateAnimationLoop,
    updateAnimationEase,
    clearPath,
  };
}
/**
 * 旋转动画
 */
export function useWhirlAnimationObserver() {
  const { currentAsset, status } = assetHandler;
  const { inWhirl } = status;
  // 构建默认的旋转动画信息
  const initWhirlData = () => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            graph: undefined,
            duration: attribute.endTime - attribute.startTime,
            attach: {
              type: 'Whirl',
              data: {
                position: {
                  left: 0.5,
                  top: 0.5,
                },
                ccw: true,
                speed: 1.3,
              },
            },
          },
        }),
      );
      reportChange('initWhirlData', true);
    }
  };
  const start = () => {
    if (currentAsset) {
      currentAsset.setTempData({
        rt_style: undefined,
        rt_previewStayEffect: false,
      });
      // 如果没有旋转动画信息，需要初始化旋转动画
      if (currentAsset?.attribute?.stayEffect?.attach?.type !== 'Whirl') {
        initWhirlData();
      }
      assetHandler.setStatus({
        inWhirl: true,
      });
    }
  };
  const updateDirection = (ccw: boolean) => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      const { stayEffect } = attribute;
      const { attach } = stayEffect;
      const newAttach = {
        ...attach,
      };
      newAttach.data.ccw = ccw;
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            ...stayEffect,
            attach: newAttach,
          },
        }),
      );
    }
  };
  const updateSpeed = (speed: number) => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      const { stayEffect } = attribute;
      const { attach } = stayEffect;
      const newAttach = {
        ...attach,
      };
      newAttach.data.speed = speed;
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            ...stayEffect,
            attach: newAttach,
          },
        }),
      );
    }
  };
  const end = () => {
    assetHandler.setStatus({
      inWhirl: false,
    });
  };
  const clearWhirl = () => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      const { stayEffect } = attribute;
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            ...stayEffect,
            attach: undefined,
          },
        }),
      );
    }
  };
  const startSetCenter = (val: boolean) => {
    assetHandler.setStatus({ inWhirl: val });
  };
  return {
    attach: currentAsset?.attribute?.stayEffect?.attach,
    inWhirl,
    start,
    end,
    updateDirection,
    updateSpeed,
    clearWhirl,
    startSetCenter,
  };
}
/**
 * 抖动动画
 */
export function useShakeAnimationObserver() {
  const { currentAsset } = assetHandler;
  // 构建默认的抖动动画信息
  const initShakeData = () => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            graph: undefined,
            duration: attribute.endTime - attribute.startTime,
            attach: {
              type: 'shake',
              data: {
                direction: 45,
                speed: 1.1,
                amplitude: 0.3,
              },
            },
          },
        }),
      );
      reportChange('initShakeData', true);
    }
  };
  const start = () => {
    if (currentAsset) {
      currentAsset.setTempData({
        rt_style: undefined,
        rt_previewStayEffect: false,
      });
      // 如果没有抖动动画信息，需要初始化抖动动画
      if (!currentAsset?.attribute?.stayEffect?.attach?.data?.amplitude) {
        initShakeData();
      }
    }
  };
  const updateDirection = (direction: number) => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      const { stayEffect } = attribute;
      const { attach } = stayEffect;
      const newAttach = {
        ...attach,
      };
      newAttach.data.direction = direction;
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            ...stayEffect,
            attach: newAttach,
          },
        }),
      );
    }
  };
  const updateSpeed = (speed: number) => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      const { stayEffect } = attribute;
      const { attach } = stayEffect;
      const newAttach = {
        ...attach,
      };
      newAttach.data.speed = speed;
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            ...stayEffect,
            attach: newAttach,
          },
        }),
      );
    }
  };
  const updateAmplitude = (amplitude: number) => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      const { stayEffect } = attribute;
      const { attach } = stayEffect;
      const newAttach = {
        ...attach,
      };
      newAttach.data.amplitude = amplitude;
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            ...stayEffect,
            attach: newAttach,
          },
        }),
      );
    }
  };
  const clearShake = () => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      const { stayEffect } = attribute;
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            ...stayEffect,
            attach: undefined,
          },
        }),
      );
    }
  };
  return {
    attach: currentAsset?.attribute?.stayEffect?.attach,
    start,
    initShakeData,
    updateAmplitude,
    updateDirection,
    updateSpeed,
    clearShake,
  };
}

/** *************************停留特效相关*********************************** */

export const updateQrCode = (info: QrcodeInfo, asset?: AssetClass) => {
  const { currentAsset } = assetHandler;
  const target = asset || currentAsset;
  target?.update({
    attribute: {
      qrcodeInfo: info,
    },
  });
  reportChange('updateQrCode', true);
};
// 转场操作
export function useTranstionAction() {
  const { currentTemplate, currentTemplateIndex, templates } = assetHandler;
  const currentAsset = currentTemplate?.endTransfer;
  // 修改转场颜色
  const updateColor = (color: RGBA, key: string) => {
    if (currentAsset) {
      const { colors } = currentAsset.attribute;
      currentAsset.update(
        buildAttribute({
          colors: {
            ...colors,
            [key]: color,
          },
        }),
      );
      const nextTemplate = templates[currentTemplateIndex + 1];
      nextTemplate?.startTransfer?.update(
        buildAttribute({
          colors: {
            ...colors,
            [key]: color,
          },
        }),
      );
      reportChange('updateTranstionColor', true);
    }
  };
  // 修改转场时长
  const changeDuration = (val: number) => {
    if (currentAsset) {
      let duration = Math.min(val, TRANSITION_MAX_DURATION);
      duration = Math.max(val, TRANSITION_MIN_DURATION);
      currentAsset.update(buildAttribute({ totalTime: duration }));
      // 更新转场时长
      templateTransferReconcile();
      reportChange('updateTranstionDuration', true);
    }
  };
  return {
    colors: currentAsset?.attribute?.colors,
    updateColor,
    changeDuration,
  };
}
