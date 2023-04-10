import React, { MouseEvent, CSSProperties } from 'react';
import { observer } from 'mobx-react';
import './index.less';
import { config } from '@/kernel/utils/config';
import { stopPropagation, mouseMoveDistance } from '@/kernel/utils/single';
import { useCreation } from 'ahooks';
import {
  getAssetStatus,
  getCanvasInfo,
  getEditAsset,
  useUpdateAssetStayEffect,
} from '@/kernel/store';
import { buildAttribute } from '@/kernel/store/assetHandler/utils';

const WhirlAnimation = observer(() => {
  const editAsset = getEditAsset();
  const canvasInfo = getCanvasInfo();
  const { attribute, transform } = editAsset;
  const { width, height, stayEffect } = attribute;
  const { posX, posY } = transform;
  const style: CSSProperties = {
    zIndex: config.editZIndex + 110,
  };
  const { updateWhirlPosition } = useUpdateAssetStayEffect();
  // 移动触发
  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (editAsset) {
      editAsset.setTempData({
        rt_style: undefined,
        rt_previewStayEffect: false,
      });
      const originAsset = editAsset.getAssetCloned();
      mouseMoveDistance(
        e,
        (distanceX: number, distanceY: number) => {
          const oldPosition =
            originAsset?.attribute?.stayEffect?.attach?.data?.position;
          const newLeft =
            oldPosition?.left * width + distanceX / canvasInfo.scale;
          const newTop =
            oldPosition?.top * height + distanceY / canvasInfo.scale;
          const position = {
            left: newLeft / width,
            top: newTop / height,
          };
          updateWhirlPosition(position);
        },
        () => {},
      );
    }
  };
  // 旋转中心点位位置
  const pointStyle: CSSProperties = useCreation(() => {
    const { attach } = stayEffect;
    if (attach) {
      const { data } = attach;
      const { position } = data;
      return {
        left: (posX + width * position.left) * canvasInfo.scale - 13,
        top: (posY + height * position.top) * canvasInfo.scale - 13,
      };
    }
    return {};
  }, [canvasInfo.scale, stayEffect?.attach?.data?.position]);
  return (
    <div
      className="hc-asset-whirl-mask"
      style={style}
      onMouseDown={stopPropagation}
      onClick={stopPropagation}
      onDoubleClick={stopPropagation}
    >
      <div
        onMouseDown={handleMove}
        className="whirl-point"
        style={pointStyle}
      />
    </div>
  );
});
const WhirlAnimationWrap = () => {
  const editAsset = getEditAsset();
  const { inWhirl } = getAssetStatus();
  if (
    editAsset?.attribute?.stayEffect?.attach?.type !== 'Whirl' ||
    !inWhirl ||
    editAsset?.tempData.rt_previewStayEffect
  ) {
    return null;
  }
  return <WhirlAnimation />;
};
export default observer(WhirlAnimationWrap);
