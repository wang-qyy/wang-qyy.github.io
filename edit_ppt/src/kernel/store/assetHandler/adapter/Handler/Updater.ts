import assetHandler from '@kernel/store/assetHandler';
import {
  isMaskType,
  isTempModuleType,
  isModuleType,
} from '@kernel/utils/assetChecker';
import {
  Asset,
  AssetClass,
  FreePathType,
  Attribute,
  Container,
  AssetTempUpdateParams,
  PageAttr,
  AssetBaseSize,
  Position,
  TemplateClass,
  TemplateData,
  VideoClip,
  AssetStoreUpdateParams,
  setAssetTempData,
  CanvasStatus,
  ReplaceClipSvgParams,
} from '@/kernel';
import { BaseSize } from '@kernel/utils/mouseHandler';
import { reportChange } from '@kernel/utils/config';
import { runInAction, toJS } from 'mobx';
import {
  calcTemplateTime,
  getAssetAea,
  getAssetScale,
  getFontEffectId,
  getTopAsset,
} from '@kernel/utils/StandardizedTools';
import {
  getAeaSync,
  getAssetRtInfo,
  getFontEffectSync,
  getSvgSync,
} from '@kernel/store/cacheManager/adapter';
import {
  FontEffect,
  calcContainerSizeScale,
  getAssetSizeFormContainerScale,
  Image,
} from '@kernel/store/assetHandler/adapter/utils';
import {
  buildAttribute,
  buildMeta,
  buildTransform,
} from '@kernel/store/assetHandler/utils';
import { getSvg } from '@kernel/store/cacheManager/fatcher';
import { MultiSelectHandler } from '@kernel/store';
import { newMask } from '@kernel/utils/assetHelper/formater/dataBuilder';
import AssetItemState from '@kernel/store/assetHandler/asset';

import { getAssetCenterPoint } from '@/kernel/utils/mouseHandler/mouseHandlerHelper';
import { calcPathAnimationSize } from '@/kernel/utils/pathAnimation';
import { deepCloneJson } from '@/kernel/utils/single';
import { assetUpdater } from './BaseHandler';
import CameraState from '../../template/camera';

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
 * @description 根据新的模板结束时间，重构模板数据
 * @param template
 * @param endTime
 * @param offsetTime
 */
export function getTemplateByNewEndTime(
  template: TemplateData,
  endTime: number,
  offsetTime?: VideoClip,
) {
  runInAction(() => {
    const cutTime = offsetTime || template.videoInfo.offsetTime || [0, 0];
    // const pageTime = endTime + cutTime[0] + cutTime[1];
    const pageTime = endTime;
    template.videoInfo = {
      ...template.videoInfo,
      startTime: 0,
      endTime: pageTime,
      pageTime,
      offsetTime: cutTime,
      allAnimationTime: calcTemplateTime(pageTime, cutTime),
    };
    template.pageAttr.pageInfo = {
      ...template.pageAttr.pageInfo,
      pageTime,
      offsetTime: cutTime,
    };
  });

  return template;
}

/**
 * @description 重新设置模板时长
 * @param template
 * @param endTime
 * @param offsetTime
 */
export function resetTemplateEndTime(
  template: TemplateClass,
  endTime: number,
  offsetTime?: VideoClip,
) {
  const data: Partial<PageAttr['pageInfo']> = {
    pageTime: endTime,
  };
  if (offsetTime?.length === 2) {
    data.offsetTime = offsetTime;
  }
  template.updatePageInfo(data);
  reportChange('resetTemplateEndTime', true);
}

// todo 函数重写
export function reconcileTemplateData() {}

/**
 * @description 设置当前模板的时长
 * @param endTime
 */
export function setCurrentTemplateEndTime(endTime: number) {
  if (assetHandler.currentTemplate) {
    resetTemplateEndTime(assetHandler.currentTemplate, endTime);
    reportChange('setCurrentTemplateEndTime', true);

    setTimeout(() => {
      reconcileTemplateData();
    }, 50);
  }
}

/**
 * @description 清除元素选中状态
 * @param withoutEdit
 */
export function assetBlur(withoutEdit = false) {
  const { currentAsset, currentTemplate } = assetHandler;
  assetHandler.setStatus({
    inClipping: false,
    inReplacing: false,
    inMask: false,
    inMoving: false,
    inWhirl: false,
    inAniPath: -1,
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
  assetHandler.seteditCamera(undefined);
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
  // 设置正在编辑的镜头
  setEditCamera: (camera: CameraState) => {
    assetHandler.seteditCamera(camera);
  },
  // 清空正在编辑的镜头
  clearEditCamera: () => {
    assetHandler.seteditCamera(undefined);
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

    if (attribute.aeA) {
      Object.keys(attribute.aeA).forEach((key) => {
        // @ts-ignore
        const current = attribute.aeA[key];
        if (current.resId && !current.kw) {
          const data = getAeaSync(current.resId);
          current.kw = data.kw;
        }
      });
    }

    if (attribute.container && !attribute.container.rt_svgString) {
      newContainer.rt_svgString = getSvgSync(attribute.container.source_key);
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
  /**
   * @description 更新旧版裁剪元素
   * @param asset
   * @param data
   */
  updateAssetContainerSize(
    asset: AssetClass,
    data: {
      size: AssetBaseSize;
      position: Position;
      originAsset: Asset;
    },
  ) {
    const { container } = asset.attribute;
    const { size, position, originAsset } = data;
    const { container: originContainer } = originAsset.attribute;

    if (!container || !originContainer) {
      return;
    }

    const newContainer: typeof container = {
      ...container,
      width: size.width,
      height: size.height,
      viewBoxWidth: size.width,
      viewBoxHeight: size.height,
      posX: originContainer.posX * (size.width / originContainer.width),
      posY: originContainer.posY * (size.height / originContainer.height),
    };

    const sizeScale = calcContainerSizeScale(
      originAsset.attribute,
      originContainer,
    );

    const { width, height } = getAssetSizeFormContainerScale(sizeScale, {
      ...container,
      ...size,
    });
    assetUpdater(asset, {
      attribute: {
        container: newContainer,
      },
    });
    assetUpdater(asset, {
      attribute: {
        width,
        height,
      },
      transform: {
        posX: position.left,
        posY: position.top,
      },
    });
  },
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
      asset.update(updatePayload, !isModuleType(asset));
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
        if (position) {
          updatePayload.transform = {
            posX: position.left,
            posY: position.top,
          };
        }
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
      // const { container, asset, rectInfo } = originAsset;
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

      if (rotate) {
        // const containerInfo = {
        //   // left: position.left,
        //   // top: position.top,
        //   left: posX * scale,
        //   top: posY * scale,
        //   width: size.width * scale,
        //   height: size.width * scale,
        // };
        //
        // const difference = {
        //   left: (asset.left + container.left) * scale - position.left,
        //   top: (asset.top + container.top) * scale - position.top,
        // };
        // const assetSize = {
        //   width: asset.width * scale,
        //   height: asset.width * scale,
        // };
        // const assetPosition = {
        //   // x: (posX + containerPosX) * scale - difference.left,
        //   // y: (posY + containerPosY) * scale - difference.top,
        //   x: (posX + containerPosX) * scale,
        //   y: (posY + containerPosY) * scale,
        // };
        // // console.log("difference", difference);
        // // console.log("container", container);
        // /**
        //  * 1 计算出原始裁剪容器的中心坐标
        //  * 2 计算出新裁剪容器的中心坐标
        //  * 3 将新位置与新中心坐标旋转，得到实际位置坐标
        //  * 4 将新位置与旧中心坐标反向旋转，得到正确的坐标
        //  */
        //
        // const containerCenter = getCenterPointFromSize(containerInfo, containerInfo);
        // const assetCenter = getCenterPointFromSize(assetPosition, assetSize);
        // const assetCenterRotated = calculateRotatedPointCoordinate(
        //   assetCenter,
        //   containerCenter,
        //   rotate,
        // );
        //
        // const rotatedContainerPosition = calculateRotatedPointCoordinate(
        //   positionToCoordinate(position),
        //   containerCenter,
        //   rotate,
        // );
        //
        // const rotatedAssetPosition = calculateRotatedPointCoordinate(
        //   assetPosition,
        //   containerCenter,
        //   rotate,
        // );
        //
        // const originAssetPosition = calculateRotatedPointCoordinate(
        //   rotatedAssetPosition,
        //   assetCenterRotated,
        //   -rotate,
        // );
        //
        // const originContainerPosition = calculateRotatedPointCoordinate(
        //   rotatedContainerPosition,
        //   assetCenter,
        //   -rotate,
        // );
        // const assetp = {
        //   x: rotatedContainerPosition.x + containerPosX * scale,
        //   y: rotatedContainerPosition.y + containerPosY * scale,
        // };
        // const assetR = calculateRotatedPointCoordinate(
        //   assetp,
        //   assetCenter,
        //   -rotate,
        // );
        // console.log("assetp", assetp);
        // // console.log("assetPosition", assetPosition);
        // // console.log("containerInfo", containerInfo);
        // // console.log("originContainerPosition", originContainerPosition);
        // // console.log("position", position);
        // changeStyle("clippeOriginStyle1", {
        //   width: asset.width * scale,
        //   height: asset.width * scale,
        //   // left: position.left,
        //   // top: position.top,
        //   left: assetR.x,
        //   top: assetR.y,
        // });
        // changeStyle("clippeOriginStyle2", {
        //   width: asset.width * scale,
        //   height: asset.width * scale,
        //   left: assetp.x,
        //   top: assetp.y,
        // });
        // console.log("result", { ...result });
        // result = {
        //   posX: (assetR.x - position.left) / scale,
        //   posY: (assetR.y - position.top) / scale,
        // };
        // console.log("new", { ...result });
        //
        // console.log("--------------------------------------------");
      } else {
        /**
         * 1：根据原始位置和当前位置计算出实际移动的距离
         * 2：实际移动的距离+原始的偏移量获得当前实际的偏移量
         */
      }
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

/**
 * 蒙版相关
 * @returns
 */
export function useMaskClipByObserver() {
  const { status } = assetHandler;
  const { meta } = assetHandler.currentAsset ?? {};
  const { inMask } = status;
  const clipId = meta?.id ?? '';

  function updateMask(asset: AssetClass | undefined) {
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

  /**
   * @description  蒙版元素开始调整
   */
  async function startMask() {
    const asset = assetHandler.active;
    if (asset?.meta.type === 'mask') {
      updateMask(asset);
    } else if (
      asset?.meta.type &&
      ['pic', 'image', 'video', 'videoE'].includes(asset?.meta.type)
    ) {
      const mask = newMask(asset.getAssetCloned());
      const maskClass = new AssetItemState({
        ...mask,
        assets: [],
      });

      assetHandler.currentTemplate.removeAsset(asset.meta.id);
      const rt_asset = asset.getAssetCloned();
      asset.update({
        attribute: {
          aeA: undefined,
          animation: undefined,
          container: undefined,
          stayEffect: undefined,
        },
        transform: {
          posX: 0,
          posY: 0,
          rotate: 0,
        },
        meta: {
          isAlwaysVisible: true,
        },
      });
      asset.setTempData({
        rt_asset,
      });
      maskClass.update({
        meta: {
          isClip: true,
        },
      });
      maskClass.setChildren([asset]);
      asset.setRtRelativeByParent();
      assetHandler.currentTemplate.addAssets([maskClass]);
      assetHandler.setEditActive(maskClass);
    }
    assetHandler.setStatus({
      inMask: true,
      inAniPath: -1,
    });
  }

  /**
   * @description  蒙版元素结束调整
   */
  function endMask() {
    assetHandler.setStatus({
      inMask: false,
    });
    reportChange('endMask', true);
  }

  async function cancelMask() {
    const asset = assetHandler.currentAsset;
    if (asset) {
      const { assets, tempData, attribute } = asset;
      const { rt_attribute } = tempData;
      // @ts-ignore
      if (assets && rt_attribute) {
        const { rt_attribute: rt_attribute2 } = assets[0].tempData;
        asset.update({
          ...buildAttribute({
            width: rt_attribute?.width,
            height: rt_attribute?.height,
            source_key: rt_attribute?.source_key,
            rt_svgString: rt_attribute?.rt_svgString,
          }),
          ...buildTransform({
            posX: rt_attribute?.posX,
            posY: rt_attribute?.posY,
          }),
        });
        assets[0].update({
          ...buildAttribute({
            width: rt_attribute2?.width,
            height: rt_attribute2?.height,
          }),
          ...buildTransform({
            posX: rt_attribute2?.posX,
            posY: rt_attribute2?.posY,
          }),
        });
      }
      if (assets.length > 0 && assets[0].tempData.rt_asset) {
        replaceWholeAssetByAssetId(assets[0].tempData.rt_asset, asset.meta.id);
      }
    }
    assetHandler.setStatus({
      inMask: false,
    });
  }

  // 重置蒙版
  function resetMask() {
    const asset = assetHandler.currentAsset;
    // 是否裁剪得到的数据 asset?.meta.isClip &&
    if (asset && asset.assets && asset.assets.length > 0) {
      const newAsset = asset.assets[0].getAssetCloned();
      newAsset.meta.isQuickEditor = asset.meta.isQuickEditor;
      newAsset.transform = asset.transform;
      // 恢复子图层动画数据以及时间
      newAsset.attribute.aeA = asset.attribute.aeA;
      newAsset.attribute.animation = asset.attribute.animation;
      newAsset.attribute.kw = asset.attribute.kw;
      newAsset.attribute.startTime = asset.attribute.startTime;
      newAsset.attribute.endTime = asset.attribute.endTime;

      newAsset.attribute.stayEffect = asset.attribute.stayEffect;
      newAsset.attribute.dropShadow = asset.attribute.dropShadow;
      newAsset.meta.isAlwaysVisible = false;
      // todo 逻辑可迁移至assetHandler
      asset.replaceAssetSelf(newAsset);
      reportChange('resetMask', true);
    }
  }

  return {
    inMask,
    clipId,
    startMask,
    endMask,
    resetMask,
    cancelMask,
  };
}
/** **************************路径动画相关******************************************* */
// 路径动画相关操作
export function useAniPathEffect() {
  const { status, currentAsset } = assetHandler;
  const { inAniPath } = status;
  const start = () => {
    assetHandler.setStatus({
      inAniPath: 0,
    });
  };
  const changStatue = (val: number) => {
    if (currentAsset) {
      // 清空当前元素的rt_style
      currentAsset.setTempData({ rt_style: undefined });
    }
    assetHandler.setStatus({
      inAniPath: val,
    });
  };
  return { inAniPath, start, changStatue };
}

/**
 * 更新停留特效信息
 */
export function useUpdateAssetStayEffect() {
  const { currentAsset } = assetHandler;
  // 构建路径动画基本信息
  const buildPathAnimationInit = () => {
    if (currentAsset) {
      const { attribute, transform } = currentAsset;
      const {
        width,
        height,
        startTime,
        endTime,
        stayEffect,
        opacity = 100,
      } = attribute;
      const { rotate } = transform;

      if (!stayEffect?.graph) {
        const duration1 = endTime - startTime;
        currentAsset.update(
          buildAttribute({
            stayEffect: {
              ...currentAsset.attribute?.stayEffect,
              duration: duration1,
              attach: undefined,
              graph: {
                easing: 1,
                loop: false,
                freePathType: 'line',
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
      }
    }
  };
  const updatePoints = (
    points: number[][],
    type: FreePathType,
    svgSize: { width: number; height: number; left: number; top: number },
  ) => {
    if (currentAsset) {
      const { attribute, transform } = currentAsset;
      buildPathAnimationInit();
      // 获取图层的中心点坐标
      const center = getAssetCenterPoint(currentAsset);
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            ...attribute?.stayEffect,
            attach: undefined,
            graph: {
              ...attribute?.stayEffect?.graph,
              ...calcPathAnimationSize(points, center, svgSize),
              freePathType: type,
            },
          },
        }),
      );
    }
    reportChange('updatePoints', true);
  };
  const updatePathType = (type: FreePathType) => {
    if (currentAsset) {
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            ...currentAsset.attribute?.stayEffect,
            graph: {
              ...currentAsset.attribute?.stayEffect?.graph,
              freePathType: type,
            },
          },
        }),
      );
      reportChange('updatePathType', true);
    }
  };
  const changeStayEffectWholePosition = (
    distanceX: number,
    distanceY: number,
    originAsset: Asset,
  ) => {
    if (currentAsset && originAsset) {
      const { posX, posY } = originAsset?.transform;
      const { attribute } = currentAsset;
      const { stayEffect } = attribute;
      currentAsset.update({
        ...buildTransform({
          posX: posX + distanceX,
          posY: posY + distanceY,
        }),
      });
    }
  };
  // 更新路径动画 元素位置
  const updateAnimationPosition = (
    distanceX: number,
    distanceY: number,
    originAsset: Asset,
  ) => {
    if (currentAsset && originAsset) {
      changeStayEffectWholePosition(distanceX, distanceY, originAsset);
      reportChange('updateAnimationPosition', true);
    }
  };

  // 更新旋转动画-旋转中心点位
  const updateWhirlPosition = (position: Position) => {
    if (currentAsset) {
      const { attribute } = currentAsset;
      const { stayEffect } = attribute;
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            ...stayEffect,
            attach: {
              ...stayEffect?.attach,
              data: {
                ...stayEffect?.attach?.data,
                position,
              },
            },
          },
        }),
      );
      reportChange('updateWhirlPosition', true);
    }
  };
  const updatePointByIndex = (
    distanceX: number,
    distanceY: number,
    originAsset: Asset,
    index: number,
    svgSize: { width: number; height: number; x: number; y: number },
  ) => {
    if (currentAsset && originAsset) {
      const { attribute } = originAsset;
      const { stayEffect } = attribute;
      const { graph } = stayEffect;
      const { points } = graph;
      const list = deepCloneJson(points);
      if (index === 0) {
        // 更新图层信息
        changeStayEffectWholePosition(distanceX, distanceY, originAsset);
        const center = getAssetCenterPoint(currentAsset);
        svgSize.x -= center.x;
        svgSize.y -= center.y;
        // 更新其他节点信息
        list.forEach((element: number[], i: number) => {
          if (i !== 0) {
            element.forEach((item, j) => {
              if (j % 2 === 0) {
                // x
                item -= distanceX;
              } else {
                // y
                item -= distanceY;
              }
              element[j] = item;
            });
            list[i] = element;
          }
        });
      } else {
        const target = [...list[index]];

        const diff1 = target[2] - target[0];
        const diff2 = target[3] - target[1];
        target[0] = target[2] - diff1 + distanceX;
        target[1] = target[3] - diff2 + distanceY;

        const diff3 = target[2] - target[4];
        const diff4 = target[3] - target[5];
        target[4] = target[2] - diff3 + distanceX;
        target[5] = target[3] - diff4 + distanceY;

        // 改变的是位置节点
        target[2] += distanceX;
        target[3] += distanceY;
        list[index] = target;
      }
      currentAsset.update(
        buildAttribute({
          stayEffect: {
            ...currentAsset?.attribute?.stayEffect,
            graph: {
              ...currentAsset?.attribute?.stayEffect?.graph,
              points: list,
              ...svgSize,
            },
          },
        }),
      );
      reportChange('updatePointByIndex', true);
    }
  };
  return {
    updatePoints,
    updatePathType,
    buildPathAnimationInit,
    updateAnimationPosition,
    updateWhirlPosition,
    updatePointByIndex,
  };
}
/** **************************路径动画相关******************************************* */
