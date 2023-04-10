import { runInAction } from 'mobx';
import assetHandler from '@kernel/store/assetHandler';
import canvasHandler from '@kernel/store/global';

import {
  isMaskType,
  isTempModuleType,
  isModuleType,
  isCrop,
} from '@kernel/utils/assetChecker';
import {
  Asset,
  AssetClass,
  Attribute,
  Container,
  AssetTempUpdateParams,
  AssetBaseSize,
  Position,
  AssetStoreUpdateParams,
  setAssetTempData,
  CanvasStatus,
  ReplaceClipSvgParams,
  setCanvasInfo,
} from '@/kernel';
import { reportChange } from '@kernel/utils/config';
import {
  getAssetScale,
  getFontEffectId,
  getTopAsset,
} from '@kernel/utils/StandardizedTools';
import {
  getFontEffectSync,
  getSvgSync,
} from '@kernel/store/cacheManager/adapter';
import { FontEffect, Image } from '@kernel/store/assetHandler/adapter/utils';
import { buildMeta, buildTransform } from '@kernel/store/assetHandler/utils';
import { getSvg } from '@/kernel/store/cacheManager/fetcher';
import { MultiSelectHandler } from '@kernel/store';

import { getScale } from '@/utils';

import { assetUpdater } from './BaseHandler';

export function inTransforming(asset: AssetClass, status: boolean) {
  const data: Partial<AssetTempUpdateParams> = {
    rt_inTransforming: status,
  };
  if (!status) {
    data.rt_itemScale = 1;
  }
  asset.setTempData(data);
}

export function inMoving(asset: AssetClass, status: boolean) {
  asset.setTempData({
    rt_inMoving: status,
  });
}

export function setAuxiliaryTargetIndex(indexList: number[]) {
  assetHandler.setAuxiliaryTargetIndex(indexList);
}

export function updateCurrentAsset(data: AssetStoreUpdateParams) {
  assetHandler.currentAsset?.update(data);
}

export function replaceWholeAssetByAssetId(asset: Asset, assetId: number) {
  if (assetHandler.assets) {
    const index = assetHandler.assets.findIndex(
      (item) => item.meta.id === assetId,
    );
    if (index > -1) {
      // 重置元素辅助线数据
      assetHandler.currentTemplate.replaceAsset(asset, index);
      reportChange('replaceWholeAssetByAssetId', true);
    }
  }
}

export function replaceAssetBySelf(asset: AssetClass, newAsset: Asset) {
  asset.replaceAssetSelf(newAsset);
}

/**
 * @description 清除元素选中状态
 * @param withoutEdit
 */
export function assetBlur(withoutEdit = false) {
  const { currentTemplate } = assetHandler;
  assetHandler.setStatus({
    inClipping: false,
    inReplacing: false,
    inMask: false,
    inMoving: false,
  });
  if (!withoutEdit) {
    assetHandler.setEditActive(undefined);
  }
  if (assetHandler.moveActive) {
    inMoving(assetHandler.moveActive, false);
  }
  assetHandler.setHoverActive(undefined);
  assetHandler.setTextEditActive(undefined);
  assetHandler.setMoveActive(undefined);
  assetHandler.setModuleItemActive(undefined);
  currentTemplate?.clearMultiSelect();
}

export function setCurrentTemplate(index: number) {
  assetHandler.setCurrentTemplate(index);
}

export const setAssetActiveHandler = {
  setEditActive: (asset?: AssetClass) => {
    if (!asset) {
      return;
    }

    /**
     * 如果移动元素是__module，并且刚刚执行移动，则不触发editActive，并且默认选中__module
     */
    if (
      assetHandler.moveActive &&
      assetHandler.moveActive.tempData.rt_inMoving &&
      isTempModuleType(assetHandler.moveActive)
    ) {
      assetHandler.setEditActive(assetHandler.moveActive);
    } else {
      assetBlur();
      if (!isTempModuleType(asset)) {
        if (asset.parent) {
          const module = asset.parent;
          if (!isTempModuleType(module)) {
            assetHandler.setTextEditActive(undefined);
            assetHandler.setModuleItemActive(asset);
            assetHandler.setEditActive(module);
          } else {
            // assetSelectHandler.clear();
            if (isMaskType(module)) {
              assetHandler.setEditActive(module);
            } else {
              assetHandler.setEditActive(asset);
            }
          }
        } else {
          // 选中元素时，如果是元素自身，则清空rt_activeAssets
          if (isModuleType(asset)) {
            assetHandler.setModuleItemActive(undefined);
            assetHandler.setTextEditActive(undefined);
          }

          // assetSelectHandler.clear();
          assetHandler.setEditActive(asset);
        }
      }
    }
    if (assetHandler.moveActive) {
      inMoving(assetHandler.moveActive, false);
    }
    setAssetActiveHandler.clearMoveActive();
  },

  clearEditActive: () => {
    assetHandler.setEditActive(undefined);
    assetHandler.setModuleItemActive(undefined);
  },

  setHoverActive: (asset?: AssetClass) => {
    if (!asset || assetHandler.hoverActive === asset) {
      return;
    }
    assetHandler.setHoverActive(asset);
  },

  clearHoverActive: () => {
    assetHandler.setHoverActive(undefined);
  },

  setMoveActive: (asset?: AssetClass) => {
    if (!asset) {
      return;
    }
    const target = getTopAsset(asset);
    assetHandler.setEditActive(target);
    assetHandler.setMoveActive(target);
  },

  toggleSelect: (asset?: AssetClass) => {
    if (asset) {
      MultiSelectHandler.toggleSelect(asset);
    }
  },

  clearMoveActive: () => {
    assetHandler.setMoveActive(undefined);
  },

  setTextEditActive: (asset?: AssetClass) => {
    if (!asset || assetHandler.textEditActive === asset) {
      return;
    }
    assetHandler.setTextEditActive(asset);
  },

  clearTextEditActive: () => {
    assetHandler.setTextEditActive(undefined);
  },

  clearActive: () => {
    setAssetActiveHandler.clearTextEditActive();
    setAssetActiveHandler.clearEditActive();
    setAssetActiveHandler.clearActive();
    setAssetActiveHandler.clearHoverActive();
    setAssetActiveHandler.clearMoveActive();
  },
};

function assetsSetter(assets: AssetClass[]) {
  assets.forEach((asset) => {
    const { attribute, meta } = asset;
    const newAttribute: Partial<Attribute> = {};
    const newContainer: Partial<Container> = {};
    if (
      meta.type === 'SVG' &&
      attribute.source_key &&
      !attribute.rt_svgString
    ) {
      newAttribute.rt_svgString = getSvgSync(attribute.source_key);
    }
    if (
      meta.type === 'lottie' &&
      attribute.rt_url &&
      !attribute.rt_lottieLoaded
    ) {
      newAttribute.rt_lottieLoaded = true;
    }

    if (attribute.effect) {
      const id = getFontEffectId(attribute.effect);
      const effectVariant = getFontEffectSync(id);
      attribute.effectVariant = {
        ...effectVariant,
        variableColorPara:
          FontEffect.filterFontEffectColor(effectVariant) ?? [],
        ...attribute.effectVariant,
      };
    }
    if (meta.type === 'module') {
      assetsSetter(asset.assets ?? []);
    }
    asset.update({
      attribute: newAttribute,
    });
    asset.updateContainer(newContainer);
  });
}

export function checkAssetsResource() {
  const templates = [...assetHandler.templates];
  templates.forEach((template) => {
    assetsSetter(template.assets);
  });
}

export function setReplaceStatus(status: boolean) {
  if (assetHandler.active) {
    assetHandler.setStatus({
      inReplacing: status,
    });
  }
}

export function setClippingStatus(status: boolean) {
  if (assetHandler.active) {
    assetHandler.setStatus({
      inClipping: status,
    });
  }
}

export function setRotatingStatus(status: boolean) {
  if (assetHandler.active) {
    assetHandler.setStatus({
      inRotating: status,
    });
  }
}

export function setMovingStatus(status: boolean) {
  if (assetHandler.active) {
    assetHandler.setStatus({
      inMoving: status,
    });
  }
}

export function setInMaskStatus(status: boolean) {
  if (assetHandler.active) {
    assetHandler.setStatus({
      inMask: status,
    });
  }
}

/**
 * @description 替换裁剪元素
 * @param svgSource
 * @param asset
 */
export async function replaceClipSvg(
  svgSource: ReplaceClipSvgParams,
  asset: AssetClass,
) {
  if (!assetHandler) {
    return;
  }
  if (asset) {
    if (asset.attribute?.container?.id !== svgSource.id) {
      const container = Image.replaceSvgSize(asset, svgSource);
      const svgString = await getSvg(svgSource.source_key);
      const newContainer = {
        ...container,
        ...svgSource,
        rt_svgString: svgString,
      };
      asset.updateContainer(newContainer);
    }
  }
}

/**
 * @description 设置全局状态
 */
export function useSetCanvasStatus() {
  function hasEditAsset() {
    return !!assetHandler?.active;
  }

  function setStatus(
    data: Partial<CanvasStatus>,
    cb?: (asset?: AssetClass) => void,
  ) {
    if (hasEditAsset()) {
      assetHandler.setStatus(data);
      cb && cb(assetHandler?.active);
    }
  }

  function startReplace() {
    setStatus({
      inReplacing: true,
    });
  }

  function endReplace() {
    setStatus({
      inReplacing: false,
    });
  }

  function startClip(svgInfo?: ReplaceClipSvgParams) {
    setStatus(
      {
        inClipping: true,
      },
      (asset?: AssetClass) => {
        if (svgInfo && asset) {
          replaceClipSvg(svgInfo, asset);
        }
      },
    );
  }

  function endClip() {
    setStatus({
      inClipping: false,
    });
    reportChange('endClip', true);
  }

  return {
    startReplace,
    endReplace,
    startClip,
    endClip,
  };
}

export const TransformUpdater = {
  updateSizeScale(
    asset: AssetClass,
    data: {
      size: AssetBaseSize;
      position: Position;
      originAsset: Asset;
    },
  ) {
    if (asset) {
      const { type } = asset.meta;
      const { size, position, originAsset } = data;
      const { width, height } = size;
      const { attribute } = originAsset;
      const baseSize: Partial<Attribute> = {
        width: Math.max(width, 12),
        height: Math.max(height, 12),
      };
      const itemScale = getAssetScale(attribute, {
        width,
        height,
      });
      if (type === 'text') {
        const newFontSize = (attribute.fontSize ?? 1) * itemScale;
        if (newFontSize <= 12) {
          return;
        }
        baseSize.fontSize = newFontSize;
      }

      /**
       * 处理模块数据时，需要先将缩放数据暂存，等到缩放操作结束以后，在根据缩放值计算出元素的实际宽高。
       * 如此可以降低计算次数，降低逻辑复杂度
       */
      setAssetTempData(asset, {
        rt_itemScale: itemScale,
      });
      const updatePayload: AssetStoreUpdateParams = {
        attribute: baseSize,
      };

      if (position) {
        updatePayload.transform = {
          posX: position.left,
          posY: position.top,
        };
      }

      // 组件缩放可以先通过rt_itemScale缩放修改css,修改完成再实际更改到元素，减少性能损耗
      asset.update(updatePayload, !isModuleType(asset) && !isCrop(asset));
    }
  },
  updateSize(
    asset: AssetClass,
    data: {
      size: AssetBaseSize;
      position: Position;
      originAsset: Asset;
    },
  ) {
    if (asset) {
      const { type } = asset.meta;
      const { writingMode, fontSize } = asset.attribute;
      const { size, position } = data;
      const { width, height } = size;
      let newSize: Partial<AssetBaseSize> = {
        width,
        height,
      };
      // 字体尺寸最小限制
      const minSize = fontSize ?? 12;
      // 由于字体的特殊性，所以在字体变化的模式下，只修改对应尺寸，另一边尺寸，由字体自适应调整

      if (type === 'text') {
        if (writingMode === 'vertical-rl') {
          if (height < 12) {
            return;
          }
          newSize = {
            height: Math.max(minSize, height),
          };
        } else {
          if (width < 12) {
            return;
          }
          newSize = {
            width: Math.max(minSize, width),
          };
        }
      }
      const updatePayload: AssetStoreUpdateParams = {
        attribute: newSize,
      };

      if (position) {
        updatePayload.transform = {
          posX: position.left,
          posY: position.top,
        };
      }

      assetUpdater(asset, updatePayload);
    }
  },
  fixContainerPosition(
    asset: AssetClass,
    data: {
      size: AssetBaseSize;
      position: Position;
      originAsset: Asset;
    },
  ) {
    if (asset) {
      const { size, position } = data;
      const { transform, attribute } = asset;
      const { rotate, posY = 0, posX = 0 } = transform;
      const originContainer = attribute.container as Container;
      const { posY: containerPosY = 0, posX: containerPosX = 0 } =
        originContainer ?? {};

      const assetPosition = {
        left: posX + containerPosX,
        top: posY + containerPosY,
      };

      const result = {
        posX: assetPosition.left - position.left,
        posY: assetPosition.top - position.top,
      };

      // @ts-ignore
      const newContainer: Container = {
        ...attribute.container,
        width: size.width,
        height: size.height,
        viewBoxWidth: size.width,
        viewBoxHeight: size.height,
        ...result,
      };
      assetUpdater(asset, {
        attribute: {
          container: newContainer,
        },
        transform: {
          posY: position.top,
          posX: position.left,
        },
      });
    }
  },
  updateRotate(editAsset: AssetClass, rotate: number) {
    if (editAsset?.transform.rotate !== rotate) {
      assetUpdater(editAsset, buildTransform({ rotate }));
    }
  },
};

//  锁定元素
export function toggleAssetEditStatus(asset?: AssetClass) {
  const currentAsset = asset ?? assetHandler.active;
  if (currentAsset) {
    const { locked } = currentAsset.meta;
    currentAsset.update(
      buildMeta({
        locked: !locked,
      }),
    );
    // 如果是组元素进行解锁/锁定 其子元素都要进行解锁/锁定
    if (isModuleType(asset)) {
      asset?.assets.map((item) => {
        item.update(
          buildMeta({
            locked: !locked,
          }),
        );
      });
    }
    reportChange('toggleAssetEditStatus', true);
  }
}

// 设置元素不可见
export function setAssetVisible(asset?: AssetClass) {
  if (asset) {
    runInAction(() => {
      const { hidden } = asset.meta;
      asset.update(buildMeta({ hidden: !hidden }));
    });
    reportChange('setAssetVisible', true);
  }
}

export function updateMask(asset: AssetClass | undefined) {
  if (asset) {
    const { transform, assets, attribute } = asset;
    asset.setTempData({
      rt_attribute: {
        source_key: attribute.source_key,
        rt_svgString: attribute.rt_svgString,
        width: attribute.width,
        height: attribute.height,
        posX: transform.posX,
        posY: transform.posY,
      },
      rt_asset: undefined,
    });

    if (assets && assets.length > 0) {
      assets[0].setTempData({
        rt_attribute: {
          width: assets[0].attribute.width,
          height: assets[0].attribute.height,
          posX: assets[0].transform.posX,
          posY: assets[0].transform.posY,
        },
        rt_asset: undefined,
      });
    }
  }
}

export function startCrop(target?: AssetClass) {
  const asset = target ?? assetHandler.active;

  if (asset) {
    assetHandler.setEditActive(asset);
    assetUpdater(asset, {
      attribute: {
        crop: asset.attribute.crop || {
          position: { x: 0, y: 0 },
          size: { ...asset.assetSize },
        },
      },
    });
  }
  assetHandler.setStatus({
    inMask: true,
  });
}

/**
 * @description  蒙版元素结束调整
 */
export function endCrop() {
  const { currentTemplate, currentAsset } = assetHandler;

  if (currentTemplate && currentTemplate.backgroundAsset) {
    const { assets, backgroundAsset } = currentTemplate;

    const {
      transform: { rotate },
      assetSize,
    } = backgroundAsset;
    let newSize = { ...assetSize };

    assets.map((asset) => {
      if (asset.meta.isBackground) {
        asset.update({
          transform: {
            posX: 0,
            posY: 0,
          },
        });
      }
    });

    setCanvasInfo({
      ...newSize,
      scale: getScale(newSize),
    });
  }

  assetHandler.setStatus({
    inMask: false,
  });
  reportChange('endCrop', true);
}

/**
 * 蒙版相关
 * @returns
 */
export function useAssetCrop() {
  const { status } = assetHandler;
  const { meta } = assetHandler.currentAsset ?? {};
  const { inMask } = status;
  const clipId = meta?.id ?? '';

  return {
    inMask,
    clipId,
    startCrop,
    endCrop,
  };
}
