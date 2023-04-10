import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';

import {
  getMoveAsset,
  getEditAsset,
  getAssetStatus,
  setMovingStatus,
} from '@kernel/store';
import AuxiliaryLine from '@kernel/Canvas/AuxiliaryLine';

import { mouseMoveDistance } from '@kernel/Canvas/AssetOnMove/utils';
import { useUpdatePosition, useGetStyle } from './hooks';

function AssetOnMove() {
  const moveAsset = getMoveAsset();
  const editAsset = getEditAsset();
  const { inMask } = getAssetStatus();
  const { handleMove, moveOver, auxiliaryStyle } = useUpdatePosition();
  const removeEventListener = useRef<() => void>();
  const { style } = useGetStyle();

  useEffect(() => {
    if (moveAsset && !inMask) {
      const { left, top } = moveAsset.assetPositionScale;

      removeEventListener.current = mouseMoveDistance(
        (x, y, mousePosition) => {
          if (x || y) {
            if (!moveAsset.tempData.rt_asset) {
              moveAsset.setTempData({
                rt_inMoving: true,
              });
            }

            handleMove(
              {
                left: left + x,
                top: top + y,
              },
              mousePosition,
            );

            setMovingStatus(true);
          }
        },
        () => {
          moveOver();
          // 全局状态 mouseup 必须取消
          setMovingStatus(false);
        },
      );
    } else {
      removeEventListener.current?.();
    }
  }, [moveAsset?.meta]);
  return (
    <>
      <div className="hc-asset-edit-move" style={editAsset ? {} : style()} />
      <AuxiliaryLine styles={auxiliaryStyle} />
    </>
  );
}

export default observer(AssetOnMove);
