import React, { CSSProperties, useState } from 'react';
import { AssetClass, Position } from '@kernel/typing';

import { reportChange } from '@kernel/utils/config';
import {
  deleteAssetInTemplate,
  getAssetCoords,
  getAssetStatus,
  getCanvasInfo,
  getEditableAssetOnCurrentTime,
  getMoveAsset,
  isAssetInMask,
  setAssetActiveHandler,
  setAuxiliaryTargetIndex,
} from '@kernel/store';
import { buildGeneralStyleInHandler } from '@kernel/utils/assetHelper/pub';
import {
  AuxiliaryLineStyle,
  useGetAuxiliaryPoints,
} from '@kernel/Canvas/AuxiliaryLine/hooks';
import { calcAuxiliaryLine } from '@kernel/Canvas/AuxiliaryLine/utils';
import { buildAuxiliaryByAssetClass } from '@kernel/Canvas/AssetOnMove/utils';
import { useCreation } from 'ahooks';
import { newId } from '@/kernel/utils/idCreator';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { formatChildSizeByMask } from '@/kernel/utils/assetHelper/formater/dataBuilder';
import {
  checkAssetMoveOutCanvas,
  checkIsInnerMaskDragView,
  hasRotate,
} from '@/kernel/utils/assetChecker';
import { orderBy } from 'lodash-es';
import { MaskChildAssetType } from '@/kernel/utils/const';

function checkIsInnerMaskOnMove(
  position: Position,
  moveAsset: AssetClass,
  allFitAssets: Array<AssetClass>,
) {
  let maskAsset: AssetClass | undefined;
  // 移动的元素
  // @ts-ignore
  allFitAssets.forEach((item: AssetClass) => {
    // @ts-ignore
    const mask = getAssetCoords(item);
    // 判断是否碰撞
    const isHover = isAssetInMask(mask, position);
    if (isHover && !maskAsset) {
      maskAsset = item;
    } else {
      moveAsset.setTempData({ rt_hover: { isHover: false } });
      item.setTempData({ rt_asset: undefined, rt_hover: undefined });
    }
  });
  // 找到目标元素
  if (maskAsset) {
    // 判断是否在可释放区域以内
    const isMaskCenter = checkIsInnerMaskDragView(maskAsset, position);
    // 更新图层数据
    if (isMaskCenter) {
      const newAsset = moveAsset.getAssetCloned();
      const size = formatChildSizeByMask(maskAsset, {
        width: newAsset.attribute.width,
        height: newAsset.attribute.height,
      });
      newAsset.attribute.width = size.width;
      newAsset.attribute.height = size.height;
      // 缓存旧元素
      maskAsset.setTempData({ rt_asset: newAsset });
      // 标记元素要删除
      moveAsset.setTempData({ rt_deleted: true });
    } else {
      maskAsset.setTempData({ rt_asset: undefined });
      moveAsset.setTempData({ rt_deleted: false });
    }
    maskAsset.setTempData({ rt_hover: { isHover: true, isMaskCenter } });
    moveAsset.setTempData({ rt_hover: { isHover: true } });
  } else {
    // 标记元素要删除
    moveAsset.setTempData({ rt_deleted: false });
  }
}

export function useMoveInMask(moveAsset?: AssetClass) {
  const assets = getEditableAssetOnCurrentTime();
  // 所有符合碰撞的蒙层元素
  const allFitAssets = useCreation(() => {
    const maskList = assets.filter(
      (item: AssetClass) => item.meta.type === 'mask' && !item.meta.locked,
    );
    return orderBy(maskList, (item) => item.transform.zindex, 'desc');
  }, [moveAsset]);

  // 检查元素是否能碰撞进蒙版
  function check(mousePosition: Position) {
    // 检查是否合并数据到蒙版 对于已经裁剪过的图片不允许放入蒙版
    if (
      MaskChildAssetType.includes(moveAsset?.meta.type || '') &&
      !moveAsset?.attribute.container &&
      allFitAssets.length > 0
    ) {
      // @ts-ignore
      checkIsInnerMaskOnMove(mousePosition, moveAsset, allFitAssets);
    }
  }

  // 移动结束，对于蒙版碰撞的处理
  function moveOverHandMask() {
    // 判断是否有需要删除的元素
    const newArray = assets.filter(
      (item: AssetClass) => item.tempData?.rt_deleted === true,
    );
    const newMask = assets.filter(
      (item: AssetClass) => !item.meta.locked && item.meta.type === 'mask',
    );
    newArray.forEach((item) => {
      deleteAssetInTemplate(item.meta.id);
    });
    if (newMask.length > 0) {
      newMask.forEach((item: AssetClass) => {
        if (item.tempData.rt_asset) {
          item.update({
            attribute: {
              startTime: item.tempData?.rt_asset.attribute.startTime,
              endTime: item.tempData?.rt_asset.attribute.endTime,
            },
            meta: {
              isClip: false,
            },
          });
          item.setTempData({ rt_hover: undefined });

          const childAsset = item.tempData.rt_asset;
          childAsset.meta.id = newId();
          // 修正蒙版子图层的方案
          childAsset.transform.posX =
            (item.attribute.width - childAsset.attribute.width) / 2;

          childAsset.transform.posY =
            (item.attribute.height - childAsset.attribute.height) / 2;

          item.setChildren([new AssetItemState(childAsset)], true);
          item.setTempData({ rt_asset: undefined });
          setAssetActiveHandler.setEditActive(item);
        } else {
          item.setTempData({ rt_hover: undefined });
        }
      });
    }
    moveAsset?.setTempData({ rt_hover: undefined });
  }

  return { check, moveOverHandMask };
}

export function useUpdatePosition() {
  const moveAsset = getMoveAsset();
  const canvasInfo = getCanvasInfo();
  const [auxiliaryStyle, setAuxiliaryStyle] = useState<AuxiliaryLineStyle>({});
  const auxiliaryPoints = useGetAuxiliaryPoints();
  const { check, moveOverHandMask } = useMoveInMask(moveAsset);
  const { scale } = getCanvasInfo();

  function handleMove(position: Position, mousePosition: Position) {
    if (moveAsset) {
      if (!hasRotate(moveAsset)) {
        const currentAuxiliary = buildAuxiliaryByAssetClass(
          moveAsset,
          position,
        );
        const {
          styles,
          targetIndex,
          position: newPosition,
        } = calcAuxiliaryLine(
          auxiliaryPoints.points,
          auxiliaryPoints.pointKeys,
          currentAuxiliary,
          position,
        );
        moveAsset.update({
          transform: {
            posX: newPosition.left / scale,
            posY: newPosition.top / scale,
          },
        });
        setAuxiliaryTargetIndex(targetIndex);
        setAuxiliaryStyle(styles);
      } else {
        moveAsset.update({
          transform: {
            posX: position.left / scale,
            posY: position.top / scale,
          },
        });
      }
      // 检查元素是否碰撞进蒙版
      check(mousePosition);
    }
  }

  function moveOver() {
    // 移动结束，判断元素是否拖出画布以外，拖出画布以外，删除掉
    if (checkAssetMoveOutCanvas(moveAsset, canvasInfo) && false) {
    } else {
      setAuxiliaryTargetIndex([]);
      setAuxiliaryStyle({});
      // 移动结束，对于蒙版碰撞的处理
      moveOverHandMask();
      reportChange('assetMove', true);
    }
  }

  return {
    handleMove,
    moveOver,
    auxiliaryStyle,
  };
}

export function useGetStyle() {
  const moveAsset = getMoveAsset();
  const { inClipping } = getAssetStatus();

  function style(): CSSProperties {
    if (moveAsset && !moveAsset.meta.locked) {
      const result: CSSProperties = buildGeneralStyleInHandler(moveAsset);
      result.zIndex = Number(result.zIndex) - 1;

      /**
       * 裁剪中，由于实际的元素位置没有变化，所以需要根据裁剪框的偏移量重新定位
       */
      if (inClipping) {
        const { container = { posX: 0, posY: 0 } } = moveAsset.attribute;
        const { posX, posY } = moveAsset.transform;
        Object.assign(result, {
          left: posX + container.posX,
          top: posY + container.posY,
        });
      }
      result.border = '2px solid #00c4cc';
      return result;
    }
    return {};
  }

  return { style };
}
