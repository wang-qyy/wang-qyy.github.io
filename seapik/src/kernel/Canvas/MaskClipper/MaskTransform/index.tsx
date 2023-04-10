import { useMemo, useRef } from 'react';
import classNames from 'classnames';
import { ResizePointStatic } from '@kernel/Components/TransformPoints/handler';
import Transformer from '@kernel/Components/Transformer';

import { AssetClass, Position, RectLimit } from '@/kernel/typing';
import {
  ChangeType,
  TransformerChangerParams,
} from '@kernel/Components/Transformer/typing';
import { getCanvasInfo } from '@/kernel/store';
import { buildGeneralStyleInHandler } from '@/kernel/utils/assetHelper/pub';
import { reportChange } from '@kernel/utils/config';
import {
  getAssetCenterScale,
  getRectCenter,
  rotatePoint,
} from '@kernel/utils/mouseHandler/reactHelper';
import { hasRotate } from '@/kernel';
import {
  calcMaxStyle,
  calcMinStyle,
  calcRectOverBorderMax,
  calcRectOverBorderMin,
} from '@kernel/Canvas/MaskClipper/utils';

import { positionToCoordinate } from '@kernel/utils/mouseHandler/mouseHandlerHelper';

const { unLRTB, whole, TB, LR } = ResizePointStatic;

export interface MaskTransformProps {
  scaleStatus: {
    origin: boolean;
    preview: boolean;
  };
  maskAsset: AssetClass;
  childAsset: AssetClass;
  maskType: 'origin' | 'preview';
  getRect: () => DOMRect;
  childPosition: Position;
  childPositionCache: Position;
  onChangeStart: () => void;
  onChangeEnd: () => void;
  minRect?: RectLimit;
  maxRect?: RectLimit;
  aspectRatio?: boolean;
}

const MaskTransformHelper = ({
  scaleStatus,
  maskAsset,
  childAsset,
  maskType,
  getRect,
  childPosition,
  childPositionCache,
  onChangeStart,
  onChangeEnd,
  minRect,
  maxRect,
}: MaskTransformProps) => {
  const { scale } = getCanvasInfo();
  const asset = maskType === 'origin' ? childAsset : maskAsset;
  const { meta } = asset;
  const { assetSize } = maskAsset;

  // TODO: 原图尺寸、位置信息
  const { assetPosition: cAssetPosition, assetSize: cAssetSize } = maskAsset;

  const { rotate } = maskAsset.transform;
  const style = buildGeneralStyleInHandler(asset);
  const maxPoint = useRef<Partial<RectLimit>>({});
  const minPoint = useRef<Partial<RectLimit>>({});

  if (maskType === 'origin') {
    style.top = childPosition.top;
    style.left = childPosition.left;
  }
  /**
   * @description 修改原图尺寸
   */
  function changeOriginSize(
    type: ChangeType,
    newPoint: { x: number; y: number },
    size: { width: number; height: number },
  ) {
    if (hasRotate(maskAsset)) {
      // 旋转后的裁剪，要将裁剪先旋转回去，再做回补
      const assetCenter = getRectCenter(style);
      const maskCenter = getAssetCenterScale(
        maskAsset.assetPositionScale,
        maskAsset.assetSizeScale,
      );

      const pointUnRotate = rotatePoint(
        {
          x: style.left,
          y: style.top,
        },
        assetCenter,
        rotate,
      );

      newPoint = rotatePoint(pointUnRotate, maskCenter, -rotate);
    }

    const childPos = {
      top: newPoint.y / scale,
      left: newPoint.x / scale,
    };
    const result = calcMinStyle(
      {
        ...maskAsset.assetSize,
        ...maskAsset.assetPosition,
      },
      {
        ...size,
        ...childPos,
      },
      type,
      minPoint.current,
    );
    maskAsset.update(
      {
        attribute: {
          crop: {
            size: { width: result.width, height: result.height },
            position: {
              x: Math.min(0, result.left - maskAsset.transform.posX),
              y: Math.min(0, result.top - maskAsset.transform.posY),
            },
          },
        },
      },
      false,
    );
  }

  function onChange(type: ChangeType, { style }: TransformerChangerParams) {
    if (style) {
      let newPoint = {
        x: style.left,
        y: style.top,
      };
      const attribute = {
        width: style.width / scale,
        height: style.height / scale,
      };

      if (maskType === 'origin') {
        changeOriginSize(type, newPoint, attribute);
      } else {
        // 调整裁剪尺寸
        let newChildPosition = positionToCoordinate(childPositionCache);

        if (hasRotate(maskAsset)) {
          // 旋转后的裁剪，要将裁剪
          const assetCenter = getRectCenter({
            ...maskAsset.assetOriginSizeScale,
            ...childPositionCache,
          });
          const maskCenter = getRectCenter(style);

          const pointUnRotate = rotatePoint(
            newChildPosition,
            assetCenter,
            rotate,
          );

          newChildPosition = rotatePoint(pointUnRotate, maskCenter, -rotate);
        }

        const childPos = {
          top: newChildPosition.y / scale,
          left: newChildPosition.x / scale,
        };

        // TODO: 旋转后缩放限制计算，会对元素整体产生规律性位移。
        const result = calcMaxStyle(
          {
            ...maskAsset.assetOriginSize,
            ...childPos,
          },
          {
            top: newPoint.y / scale,
            left: newPoint.x / scale,
            ...attribute,
          },
          type,
          maxPoint.current,
        );

        maskAsset.update(
          {
            attribute: {
              width: result.width,
              height: result.height,
              crop: {
                position: {
                  y: Math.min(0, childPos.top - result.top),
                  x: Math.min(0, childPos.left - result.left),
                },
                size: maskAsset.assetOriginSize,
              },
            },
            transform: {
              posY: result.top,
              posX: result.left,
            },
          },
          false,
        );
      }
    }
  }

  function changeEnd() {
    reportChange('stopMove', true);
    onChangeEnd();
    minPoint.current = {};
    maxPoint.current = {};
    setTimeout(() => {
      // 更新完尺寸以后，子元素需要重新更新相对位置
      childAsset.setRtRelativeByParent();
    }, 5);
  }

  function changeStart(type: ChangeType) {
    onChangeStart();
    const childPos = {
      top: childPosition.top / scale,
      left: childPosition.left / scale,
    };

    if (maskType === 'origin') {
      minPoint.current = calcRectOverBorderMin(
        {
          ...maskAsset.assetSize,
          ...maskAsset.assetPosition,
        },
        {
          ...maskAsset.assetOriginSize,
          ...childPos,
        },
        type,
      );
    } else {
      const max = calcRectOverBorderMax(
        {
          ...maskAsset.assetOriginSize,
          ...childPos,
        },
        {
          ...maskAsset.assetSize,
          ...maskAsset.assetPosition,
        },
        type,
      );

      maxPoint.current = max;
    }
  }

  const hiddenPoint = useMemo(() => {
    if (scaleStatus.preview) {
      return {
        left_top: true,
        left_bottom: true,
        right_top: true,
        right_bottom: true,
      };
    }
    if (scaleStatus && maskType === 'origin') {
      const distance = 6;
      const cLeft = Math.ceil(cAssetPosition.left);
      const cTop = Math.ceil(cAssetPosition.top);
      const yDistance = cTop + cAssetSize.height;
      const xDistance = cLeft + cAssetSize.width;
      return {
        left_top: cLeft === 0 && cAssetPosition.top === 0,
        left_bottom: cLeft === 0 && yDistance <= assetSize.height + distance,
        right_top: cTop === 0 && xDistance < assetSize.width + distance,
        right_bottom:
          xDistance < assetSize.width + distance &&
          yDistance <= assetSize.height + distance,
      };
    }
    return {
      left_top: false,
      left_bottom: false,
      right_top: false,
      right_bottom: false,
    };
  }, [cAssetPosition, cAssetSize, assetSize, scaleStatus.preview]);

  return (
    <Transformer
      className={classNames({
        'corner-point': maskType === 'preview',
        'no-left-top-resize-point': hiddenPoint?.left_top,
        'no-left-bottom-resize-point': hiddenPoint?.left_bottom,
        'no-right-top-resize-point': hiddenPoint?.right_top,
        'no-right-bottom-resize-point': hiddenPoint?.right_bottom,
      })}
      // 裁剪模式，不需要固定宽高比
      aspectRatio={!maskAsset.meta.isClip}
      nodes={maskType === 'preview' && maskAsset.meta.isClip ? whole : unLRTB}
      style={style}
      rotate={rotate}
      getRect={getRect}
      rotatePoint={false}
      locked={meta.locked}
      onChange={onChange}
      minRect={minRect}
      maxRect={maxRect}
      onChangeEnd={changeEnd}
      onChangeStart={changeStart}
    />
  );
};
export default MaskTransformHelper;
