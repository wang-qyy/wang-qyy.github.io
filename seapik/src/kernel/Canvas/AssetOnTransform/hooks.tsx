import React from 'react';
import { Asset, AssetBaseSize, AssetClass, Position } from '@kernel/typing';
import { BaseSize } from '@kernel/utils/mouseHandler';

import {
  useGetCanvasInfo,
  inTransforming,
  TransformUpdater,
} from '@kernel/store';
import { reportChange } from '@kernel/utils/config';
import { isModuleType } from '@/kernel';

// 处理元素旋转
export function useUpdateRotate(editAsset: AssetClass) {
  function onMoving(rotate: number) {
    TransformUpdater.updateRotate(editAsset, rotate);
  }

  function onStopMove() {
    inTransforming(editAsset, false);
    reportChange('stopRotate', true);
  }

  return {
    onMoving,
    onStopMove,
  };
}

export function useUpdateSize(editAsset: AssetClass) {
  const { scale } = useGetCanvasInfo();

  function updater(
    size: AssetBaseSize,
    position: Position,
    originAsset: Asset,
    isSizeScale?: boolean,
  ) {
    if (isSizeScale) {
      TransformUpdater.updateSizeScale(editAsset, {
        size,
        position,
        originAsset,
      });
    } else {
      TransformUpdater.updateSize(editAsset, {
        size,
        position,
        originAsset,
      });
    }
  }

  function onMoving(
    style: BaseSize,
    originAsset: Asset,
    isSizeScale?: boolean,
  ) {
    const { width, height, left, top } = style;

    updater(
      {
        height: height / scale,
        width: width / scale,
      },
      {
        top: top / scale,
        left: left / scale,
      },
      originAsset,
      isSizeScale,
    );
  }

  /**
   * 当前在处理文字形变时，有一部分宽高计算依赖于浏览器自动处理，但在某些情况下又不希望浏览器计算。所以在变更数据时需要携带某些表示，以表示是否需要浏览器介入
   * 这些标识需要在移动完成后手动销毁，否则会影响其他变更行为
   */
  function onStopMove() {
    if (isModuleType(editAsset)) {
      editAsset.autoCalcChildrenStyle();
    }

    // 该操作会将rt_itemScale重置为0
    inTransforming(editAsset, false);
    reportChange('stopMove', true);
  }

  function onStartMove() {
    inTransforming(editAsset, true);
  }

  return {
    onMoving,
    onStopMove,
    onStartMove,
  };
}
