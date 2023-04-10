import {
  assetHandler,
  toggleAssetEditStatus,
  setAssetVisible,
  useAssetCrop,
  assetUpdater,
  startCrop,
  endCrop,
} from '@kernel/store';
import {
  buildAttribute,
  buildTransform,
  FontEffect,
} from '@kernel/store/assetHandler/utils';

import { calcSvgDashByType } from '@kernel/utils/single';
import { config, reportChange } from '@kernel/utils/config';
import { getFontFamily, getSvg } from '@/kernel/store/cacheManager/fetcher';
import {
  AssetBaseSize,
  AssetClass,
  Attribute,
  Transform,
  Position,
  ReplaceClipSvgParams,
  RGBA,
  TransformPosition,
  Asset,
  Filters,
  Shadow,
  SVGStroke,
  SvgInfo,
  GradientColor,
  EffectInfo,
  QrcodeInfo,
} from '@kernel/typing';
import {
  Image,
  useUpdateAttributeFactoryByObserver,
  useUpdateTransformFactory,
} from '@kernel/storeAPI/Asset/utils';
import {
  getAssetCoords,
  isAssetInMask,
  setReplaceStatus,
  setAssetActiveHandler,
} from '@/kernel/store';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { isMaskType } from '@/kernel';

import { defaultFilters } from '@/kernel/utils/const';

export {
  toggleAssetEditStatus,
  setAssetVisible,
  useAssetCrop,
  startCrop,
  endCrop,
  getAssetCoords,
  isAssetInMask,
  setReplaceStatus,
};

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

export function useFontWeight() {
  return useUpdateAttributeFactoryByObserver<Attribute['fontWeight']>(
    'fontWeight',
  );
}

export function useFontStyle() {
  return useUpdateAttributeFactoryByObserver<Attribute['fontStyle']>(
    'fontStyle',
  );
}

export function useFontFamily() {
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

export function useFontSize() {
  return useUpdateAttributeFactoryByObserver<Attribute['fontSize']>('fontSize');
}

export function useTextAlign() {
  return useUpdateAttributeFactoryByObserver<Attribute['textAlign']>(
    'textAlign',
  );
}

export function useLineHeight() {
  return useUpdateAttributeFactoryByObserver<Attribute['lineHeight']>(
    'lineHeight',
  );
}

export function useLetterSpacing() {
  return useUpdateAttributeFactoryByObserver<Attribute['letterSpacing']>(
    'letterSpacing',
  );
}

export function useOpacityByObserver(asset?: AssetClass) {
  return useUpdateTransformFactory<Transform['alpha']>({
    transformKey: 'alpha',
    defaultValue: 100,
    asset,
  });
}

export function useTextDecoration() {
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

export function useFontColor() {
  return useUpdateAttributeFactoryByObserver<Attribute['color']>('color');
}

export function useFontOutline() {
  return useUpdateAttributeFactoryByObserver<Attribute['outline']>('outline');
}

/**
 * @description 水平翻转
 */
export function useFlipX(asset?: AssetClass) {
  return useUpdateTransformFactory<Transform['flipX']>({
    transformKey: 'flipX',
    asset,
  });
}

/**
 * @description 垂直翻转
 */
export function useFlipY(asset?: AssetClass) {
  return useUpdateTransformFactory<Transform['flipY']>({
    transformKey: 'flipY',
    asset,
  });
}

/**
 * @description 旋转
 */
export function useRotate(asset?: AssetClass) {
  return useUpdateTransformFactory<Transform['rotate']>({
    transformKey: 'rotate',
    defaultValue: 0,
    asset,
  });
}

/**
 * @description 更新SVG颜色信息
 */
export function useSvgColorsByObserver() {
  return useUpdateAttributeFactoryByObserver<Attribute['colors']>('colors');
}

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

function getZIndexRange(assets: AssetClass[]) {
  return {
    // eslint-disable-next-line prefer-spread
    maxZIndex: Math.max.apply(
      Math,
      assets.map((item) => item.transform.zindex),
    ),
    // eslint-disable-next-line prefer-spread
    minZIndex: Math.min.apply(
      Math,
      assets.map((item) =>
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

      [...assetList].forEach((item) => {
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
 * @description 修改元素位置(快捷键)
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
 * description 更新滤镜参数
 * */
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

/**
 * @description 重置滤镜参数
 * */
export function resetFilters(asset: AssetClass) {
  updateFilters({
    params: { ...defaultFilters, resId: '' },
    target: asset,
    save: true,
  });
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
