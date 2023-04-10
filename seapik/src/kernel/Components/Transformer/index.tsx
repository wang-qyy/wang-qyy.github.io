import React, { useMemo, SyntheticEvent } from 'react';
import { observer } from 'mobx-react';
import { assetHandler, toggleAssetEditStatus } from '@kernel/store';
import { config } from '@kernel/utils/config';
import {
  composeResizeItem,
  PointNode,
  ResizePoint,
} from '@kernel/Components/TransformPoints/handler';
import TransformPoints from '@kernel/Components/TransformPoints';

import classnames from 'classnames';
import { TransformerProps } from '@kernel/Components/Transformer/typing';
import { RectLimit } from '@/kernel';
import { useSizeRotate, useResize } from './hooks';

const { RotatePoint } = TransformPoints;

function Transformer({
  className,
  style,
  rotate = 0,
  nodes,
  onChange,
  onChangeEnd,
  onChangeStart,
  onClick,
  onMouseDown,
  getRect,
  onDoubleClick,
  rotatePoint = true,
  locked = false,
  minRect,
  maxRect,
  rotateCenter,
  aspectRatio = true,
  showPoints = true,
}: TransformerProps) {
  const SizeRotate = useSizeRotate(rotate, style, onChange, onChangeEnd);

  const { onResizePointClick, resizePontType } = useResize({
    rotate,
    style,
    getRect,
    onChange,
    limit: {
      minRect,
      maxRect,
    },
    rotateCenter,
    onChangeEnd,
    aspectRatio,
  });

  const resizeItem = useMemo<PointNode[]>(() => {
    return composeResizeItem(false, nodes);
  }, [nodes]);

  const onResizeStart = (event: SyntheticEvent, pointType: ResizePoint) => {
    if (pointType !== 'lock') {
      onChangeStart?.(pointType);
      onResizePointClick(event, pointType);
    } else {
      event.stopPropagation();
      toggleAssetEditStatus();
    }
  };
  const onRotateStart = (event: SyntheticEvent) => {
    event.stopPropagation();
    onChangeStart?.('rotate');
    SizeRotate.onMouseDown(event);
  };

  return (
    <div
      className={classnames('hc-asset-edit-transform', className)}
      style={{
        ...style,
        zIndex: undefined,
        transform: `rotate(${rotate}deg)`,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      ref={SizeRotate.transformRef}
    >
      <TransformPoints
        onMouseDown={onResizeStart}
        triggerPointType={resizePontType}
        pointList={showPoints ? resizeItem : []}
        rotate={rotate}
        className={classnames({
          'element-transformer-locked': locked,
          'element-transformer-hide': assetHandler.status.hideTransformerBox,
        })}
      >
        {showPoints && rotatePoint && !locked && (
          <RotatePoint
            onMouseDown={onRotateStart}
            showRotator={SizeRotate.showRotate}
            rotate={rotate}
          />
        )}
      </TransformPoints>
    </div>
  );
}

export default observer(Transformer);
